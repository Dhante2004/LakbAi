import Dexie from 'dexie';

export class EcoTravelDB extends Dexie {
  constructor() {
    super('EcoTravelDB');
    this.version(1).stores({
      destinations: 'id, name, region',
      itineraries: 'id, userId, destination, createdAt'
    });
  }
}

export const db = new EcoTravelDB();
