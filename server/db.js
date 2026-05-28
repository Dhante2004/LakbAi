import mongoose from 'mongoose';

// Object to hold our 3 active database shard connections
export const shards = {
  Luzon: null,
  Visayas: null,
  Mindanao: null
};

export const connectDB = async () => {
  try {
    // 1. Connect to the Primary Database (Handles Users and Auth)
    const uri = process.env.MONGODB_URI;
    if (uri) {
      await mongoose.connect(uri);
      console.log("✅ Global Auth Database connected");
    } else {
      console.warn("MONGODB_URI not found. Global database features limited.");
    }

    // 2. Connect to the 3 Regional Shards (Handles Destinations)
    console.log("Booting up Regional Database Shards...");

    if (process.env.MONGODB_URI_LUZON) {
      shards.Luzon = await mongoose.createConnection(process.env.MONGODB_URI_LUZON).asPromise();
      console.log("Shard 1 (Luzon) ONLINE");
    }

    if (process.env.MONGODB_URI_VISAYAS) {
      shards.Visayas = await mongoose.createConnection(process.env.MONGODB_URI_VISAYAS).asPromise();
      console.log("Shard 2 (Visayas) ONLINE");
    }

    if (process.env.MONGODB_URI_MINDANAO) {
      shards.Mindanao = await mongoose.createConnection(process.env.MONGODB_URI_MINDANAO).asPromise();
      console.log("Shard 3 (Mindanao) ONLINE");
    }

  } catch (err) {
    console.error("Database/Shard connection error:", err);
  }
};