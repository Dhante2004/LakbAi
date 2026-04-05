import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  region: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  rating: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  submittedBy: {
    name: String,
    email: String
  },
  createdAt: { type: Date, default: Date.now }
});

export const Destination = mongoose.model('Destination', destinationSchema);

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: String, required: true },
  interests: [{ type: String }],
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const Itinerary = mongoose.model('Itinerary', itinerarySchema);