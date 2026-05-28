import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Itinerary, destinationSchema } from './models/Data.js'; 
import { shards } from './db.js'; 
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// ==========================================
// SHARD ROUTER HELPERS
// ==========================================

// 1. Get the correct database model based on Region
const getDestinationModel = (region) => {
  if (!region) throw new Error("Region is required to route to a shard.");
  const dbConnection = shards[region];
  
  if (!dbConnection || dbConnection.readyState !== 1) {
    throw new Error(`CRITICAL: Database Shard for [${region}] is offline.`);
  }
  return dbConnection.model('Destination', destinationSchema);
};

// 2. Find which shard a specific destination belongs to (for edits/deletes)
const findModelForDestinationId = async (id) => {
  const regions = ['Luzon', 'Visayas', 'Mindanao'];
  for (const region of regions) {
    try {
      const model = getDestinationModel(region);
      const exists = await model.findById(id);
      if (exists) return model;
    } catch (err) {
      // Ignore offline shards while searching
    }
  }
  return null; // Not found anywhere
};

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================================
// AUTH ROUTES (Connects to Global Auth DB)
// ==========================================
router.post('/auth/signup', async (req, res) => {
  const { name, email, password, role, region, contactNumber } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    const finalRole = email.toLowerCase() === adminEmail?.toLowerCase() ? 'admin' : role;

    const user = new User({ name, email, password, role: finalRole, region, contactNumber });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role: finalRole, region, contactNumber } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, region: user.region, contactNumber: user.contactNumber } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

// ==========================================
// GEMINI ROUTE (LIVE STREAMING)
// ==========================================
router.post('/generate-itinerary', authenticate, async (req, res) => {
  const { destination, days, budget, interests } = req.body;
  if (!GEMINI_API_KEY) {
    return res.status(400).write("Error: Please add your GEMINI_API_KEY to your .env file.");
  }

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Transfer-Encoding', 'chunked');

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const responseStream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: `You are an expert travel planner. Create a detailed day-by-day itinerary for ${destination} for ${days} days. Budget level: ${budget}. Interests: ${interests.join(", ")}. Use standard Markdown format for structure.`,
    });

    for await (const chunk of responseStream) {
      if (chunk.text) res.write(chunk.text);
    }
    res.end();
  } catch (err) {
    res.write("\n\nFailed to complete the itinerary generation.");
    res.end();
  }
});

// ==========================================
// SHARDED DATA ROUTES (DESTINATIONS)
// ==========================================
router.get('/destinations', async (req, res) => {
  try {
    const targetRegion = req.query.region;
    
    if (targetRegion) {
      const RegionalDestination = getDestinationModel(targetRegion);
      const destinations = await RegionalDestination.find({ status: 'approved' }).sort({ createdAt: -1 });
      return res.json(destinations);
    }

    // If a shard is down, it skips it and returns what it can
    let allDestinations = [];
    for (const region of ['Luzon', 'Visayas', 'Mindanao']) {
      try {
        const RegionalDestination = getDestinationModel(region);
        const dests = await RegionalDestination.find({ status: 'approved' });
        allDestinations.push(...dests);
      } catch (err) {
        console.warn(`[Failover] Skipping ${region} data: ${err.message}`);
      }
    }
    
    allDestinations.sort((a, b) => b.createdAt - a.createdAt);
    res.json(allDestinations);
  } catch (err) {
    res.status(503).json({ message: err.message });
  }
});

router.get('/destinations/pending', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    let pending = [];
    for (const region of ['Luzon', 'Visayas', 'Mindanao']) {
      try {
        const RegionalDestination = getDestinationModel(region);
        const dests = await RegionalDestination.find({ status: 'pending' });
        pending.push(...dests);
      } catch (err) {} // Ignore offline shards
    }
    pending.sort((a, b) => b.createdAt - a.createdAt);
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/destinations', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'tourism_office') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    const RegionalDestination = getDestinationModel(req.body.region);
    
    const destination = new RegionalDestination({ 
      ...req.body, 
      status,
      submittedBy: { 
        name: req.user.name, 
        email: req.user.email,
        phone: req.user.contactNumber
      }
    });
    
    await destination.save();
    res.status(201).json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// SHARDED DATA ACTIONS (RATES/APPROVES)
// ==========================================
router.post('/destinations/:id/rate', authenticate, async (req, res) => {
  try {
    const { rating } = req.body;
    const RegionalDestination = await findModelForDestinationId(req.params.id);
    if (!RegionalDestination) return res.status(404).json({ message: 'Destination not found or shard offline' });

    const dest = await RegionalDestination.findById(req.params.id);
    if (!dest.ratings) dest.ratings = [];

    const existingRatingIndex = dest.ratings.findIndex(r => r.userId === req.user._id.toString());
    if (existingRatingIndex >= 0) dest.ratings[existingRatingIndex].value = rating; 
    else dest.ratings.push({ userId: req.user._id.toString(), value: rating });
    
    await dest.save();
    res.json(dest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/destinations/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const RegionalDestination = await findModelForDestinationId(req.params.id);
    if (!RegionalDestination) return res.status(404).json({ message: 'Not found' });

    const updated = await RegionalDestination.findByIdAndUpdate(req.params.id, { status: 'approved' }, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/destinations/:id/reject', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const RegionalDestination = await findModelForDestinationId(req.params.id);
    if (!RegionalDestination) return res.status(404).json({ message: 'Not found' });

    await RegionalDestination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/destinations/:id', authenticate, async (req, res) => {
  try {
    const RegionalDestination = await findModelForDestinationId(req.params.id);
    if (!RegionalDestination) return res.status(404).json({ message: 'Not found' });

    await RegionalDestination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/destinations/:id', authenticate, async (req, res) => {
  try {
    const RegionalDestination = await findModelForDestinationId(req.params.id);
    if (!RegionalDestination) return res.status(404).json({ message: 'Not found' });

    const updated = await RegionalDestination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ITINERARY ROUTES (Stays on Global DB)
// ==========================================
router.get('/itineraries', authenticate, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(itineraries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/itineraries', authenticate, async (req, res) => {
  try {
    const itinerary = new Itinerary({ ...req.body, userId: req.user._id });
    await itinerary.save();
    res.status(201).json(itinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/itineraries/:id', authenticate, async (req, res) => {
  const { destination, days, budget, interests, content } = req.body; 
  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(
      req.params.id, { destination, days, budget, interests, content }, { new: true }
    );
    if (!updatedItinerary) return res.status(404).json({ message: 'Itinerary not found' });
    res.json(updatedItinerary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/itineraries/:id', authenticate, async (req, res) => {
  try {
    await Itinerary.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// SHARDED ANALYTICS
// ==========================================
router.get('/analytics', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'tourism_office') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const isAdmin = req.user.role === 'admin';
    const targetRegion = isAdmin ? null : req.user.region;

    let activeDestinationsCount = 0;
    let pendingDestinationsCount = 0;
    let destinationsByRegion = [];
    let categoriesMap = {};
    let destNames = [];

    const regionsToCheck = targetRegion ? [targetRegion] : ['Luzon', 'Visayas', 'Mindanao'];

    // Collect data across all online shards
    for (const region of regionsToCheck) {
      try {
        const model = getDestinationModel(region);
        
        const activeCount = await model.countDocuments({ status: 'approved' });
        const pendingCount = await model.countDocuments({ status: 'pending' });
        
        activeDestinationsCount += activeCount;
        pendingDestinationsCount += pendingCount;
        if (isAdmin) destinationsByRegion.push({ region, count: activeCount });

        const dests = await model.find({ status: 'approved' }).select('name category');
        destNames.push(...dests.map(d => d.name));

        if (isAdmin) {
          dests.forEach(d => {
            const cat = d.category || "Uncategorized";
            categoriesMap[cat] = (categoriesMap[cat] || 0) + 1;
          });
        }
      } catch (err) {} // Ignore offline shards
    }

    const destinationsByCategory = Object.keys(categoriesMap).map(k => ({ category: k, count: categoriesMap[k] }));
    const totalUsersCount = await User.countDocuments();
    let itineraryMatch = targetRegion ? { destination: { $in: destNames } } : {};
    
    const totalItinerariesCount = await Itinerary.countDocuments(itineraryMatch);
    const topDestinationsAgg = await Itinerary.aggregate([
      { $match: itineraryMatch },
      { $group: { _id: "$destination", visitors: { $sum: 1 } } },
      { $sort: { visitors: -1 } },
      { $limit: 5 },
      { $project: { name: "$_id", visitors: 1, _id: 0 } }
    ]);

    const currentYear = new Date().getFullYear();
    const monthlyMatch = { ...itineraryMatch, createdAt: { $gte: new Date(`${currentYear}-01-01`), $lte: new Date(`${currentYear}-12-31`) }};
    const monthlyVisitsAgg = await Itinerary.aggregate([{ $match: monthlyMatch }, { $group: { _id: { $month: "$createdAt" }, visits: { $sum: 1 } } }, { $sort: { "_id": 1 } }]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthlyVisits = monthNames.map((month) => ({ month, visits: 0 }));
    let peakMonthValue = 0, peakSeason = 'N/A';

    monthlyVisitsAgg.forEach(item => {
      const monthIndex = item._id - 1;
      monthlyVisits[monthIndex].visits = item.visits;
      if (item.visits > peakMonthValue) {
        peakMonthValue = item.visits;
        peakSeason = monthNames[monthIndex];
      }
    });

    res.json({
      stats: {
        totalVisitors: totalItinerariesCount.toString(),
        avgDaily: (Math.ceil(totalItinerariesCount / 30) || 0).toString(),
        activeDestinations: activeDestinationsCount.toString(),
        peakSeason,
        pendingRequests: pendingDestinationsCount.toString(),
        totalUsers: totalUsersCount.toString()
      },
      monthlyVisits, topDestinations: topDestinationsAgg, destinationsByRegion, destinationsByCategory
    });

  } catch (err) {
    res.status(500).json({ message: 'Failed to load analytics data' });
  }
});

export default router;