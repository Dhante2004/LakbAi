import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from './models/User.js';
import { Destination, Itinerary } from './models/Data.js';
import { GoogleGenAI } from "@google/genai";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Middleware to verify JWT
const authenticate = async (req, res, next) => {
  console.log('Authenticate middleware triggered for:', req.path);
  
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    req.user = user;
    next();
  } catch (err) {
    console.error('Auth error in authenticate:', err);
    res.status(401).json({ message: 'Invalid token' });
  }
};

// ==========================================
// AUTH ROUTES
// ==========================================

router.post('/auth/signup', async (req, res) => {
  const { name, email, password, role, region } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });

    const adminEmail = process.env.VITE_ADMIN_EMAIL;
    const finalRole = email.toLowerCase() === adminEmail?.toLowerCase() ? 'admin' : role;

    const user = new User({ name, email, password, role: finalRole, region });
    await user.save();

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name, email, role: finalRole, region } });
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
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role, region: user.region } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/auth/me', authenticate, (req, res) => {
  res.json(req.user);
});

// ==========================================
// GEMINI ROUTE
// ==========================================

router.post('/generate-itinerary', authenticate, async (req, res) => {
  const { destination, days, budget, interests } = req.body;
  
  if (!GEMINI_API_KEY) {
    return res.json({ 
      plan: `Mock Itinerary for ${destination} (${days} days):\nDay 1: Arrival and local food tour.\nDay 2: Exploring ${interests.join(", ")} spots.\nDay 3: Relaxation and departure.` 
    });
  }

  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a detailed day-by-day tourism itinerary for ${destination} for ${days} days. 
      Budget level: ${budget}. 
      Interests: ${interests.join(", ")}.
      Include tourist spots, local restaurants, and transportation tips.
      Format as Markdown.`,
    });

    res.json({ plan: response.text || "Failed to generate itinerary." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// DATA ROUTES (DESTINATIONS)
// ==========================================

// 1. Get ALL APPROVED destinations (For tourists & home page)
router.get('/destinations', async (req, res) => {
  try {
    const destinations = await Destination.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(destinations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get PENDING destinations (For Admin Requests page)
router.get('/destinations/pending', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const pending = await Destination.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pending);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Create a new destination (With submitter info)
router.post('/destinations', authenticate, async (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'tourism_office') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    const status = req.user.role === 'admin' ? 'approved' : 'pending';
    
    const destination = new Destination({ 
      ...req.body, 
      status,
      submittedBy: {
        name: req.user.name,
        email: req.user.email
      }
    });
    
    await destination.save();
    res.status(201).json(destination);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. Admin route to APPROVE a destination
router.patch('/destinations/:id/approve', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    const updated = await Destination.findByIdAndUpdate(
      req.params.id, 
      { status: 'approved' }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Admin route to REJECT a destination
router.delete('/destinations/:id/reject', authenticate, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
  try {
    await Destination.findByIdAndDelete(req.params.id);
    res.json({ message: 'Rejected and deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================================
// ITINERARY ROUTES
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

// ==========================================
// ANALYTICS ROUTES
// ==========================================

router.get('/analytics', authenticate, async (req, res) => {
  // Protect route: only allow admin or tourism_office
  if (req.user.role !== 'admin' && req.user.role !== 'tourism_office') {
    return res.status(403).json({ message: 'Forbidden' });
  }

  try {
    // You can use this region to filter DB queries later
    const region = req.query.region;
    
    // Mock data payload for the frontend charts
    const analyticsData = {
      monthlyVisits: [
        { month: 'Jan', visits: 2400 },
        { month: 'Feb', visits: 1398 },
        { month: 'Mar', visits: 5800 },
        { month: 'Apr', visits: 3908 },
        { month: 'May', visits: 4800 },
        { month: 'Jun', visits: 3800 },
        { month: 'Jul', visits: 4300 },
      ],
      topDestinations: [
        { name: 'Hidden Lagoon', visitors: 4500 },
        { name: 'Twin Beaches', visitors: 3200 },
        { name: 'Mt. Emerald', visitors: 2800 },
        { name: 'Historic Ruins', visitors: 1900 },
        { name: 'City Museum', visitors: 1500 },
      ],
      stats: {
        totalVisitors: '26,306',
        avgDaily: '842',
        activeDestinations: '12',
        peakSeason: 'March'
      }
    };

    res.json(analyticsData);
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ message: 'Failed to load analytics data' });
  }
});

export default router;