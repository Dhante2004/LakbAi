import Dexie from 'dexie';

// Create a new Dexie database instance
export const db = new Dexie('LakbAiLocalDB');

// Define the local tables. The first item '_id' acts as the primary key 
// (matching MongoDB's ID so we don't get duplicates).
db.version(1).stores({
  destinations: '_id, name, region, description, image, rating',
  itineraries: '_id, userId, destination, days, budget, content, createdAt'
});