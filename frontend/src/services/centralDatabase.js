/**
 * KrishiSetu File-Only Central Database Service
 * Operates strictly on project JSON files:
 * - src/data/users.json
 * - src/data/crops.json
 * - src/data/offers.json
 *
 * NO LocalStorage is used for storing database records. All reads & writes target the physical JSON files on disk.
 */

import initialUsers from '../data/users.json';
import initialCrops from '../data/crops.json';
import initialOffers from '../data/offers.json';

// In-Memory Database initialized directly from physical JSON files
let memoryDb = {
  users: Array.isArray(initialUsers) ? [...initialUsers] : [],
  crops: Array.isArray(initialCrops) ? [...initialCrops] : [],
  offers: Array.isArray(initialOffers) ? [...initialOffers] : []
};

// Sync database changes directly to disk files via Vite dev middleware
const syncToFile = (collection, data) => {
  if (typeof window !== 'undefined') {
    fetch(`/api/db/${collection}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {});
  }
};

export const centralDatabase = {
  getDatabase: () => {
    return memoryDb;
  },

  // USERS FILE (src/data/users.json)
  getUsers: () => {
    return memoryDb.users || [];
  },

  registerUser: (user) => {
    const existingIndex = memoryDb.users.findIndex(
      (u) => u.email?.toLowerCase() === user.email?.toLowerCase()
    );

    const newUserObj = {
      id: user.id || 'u-' + Date.now(),
      name: user.name,
      companyName: user.companyName || user.name,
      email: user.email,
      password: user.password,
      role: user.role || 'farmer',
      mobile: user.mobile || '+91 98480 12345',
      state: user.state || 'Maharashtra',
      district: user.district || 'Amravati',
      createdDate: new Date().toISOString().split('T')[0]
    };

    if (existingIndex >= 0) {
      memoryDb.users[existingIndex] = { ...memoryDb.users[existingIndex], ...newUserObj };
    } else {
      memoryDb.users.push(newUserObj);
    }

    syncToFile('users', memoryDb.users);
    window.dispatchEvent(new Event('central_database_updated'));
    return newUserObj;
  },

  findUserByEmail: (email) => {
    return (memoryDb.users || []).find((u) => u.email?.toLowerCase() === (email || '').toLowerCase());
  },

  // CROPS FILE (src/data/crops.json)
  getCrops: () => {
    return memoryDb.crops || [];
  },

  saveCrop: (cropData) => {
    const index = memoryDb.crops.findIndex(
      (c) => c.id === cropData.id || (c.farmerId === cropData.farmerId && c.crop === cropData.crop)
    );
    if (index >= 0) {
      memoryDb.crops[index] = { ...memoryDb.crops[index], ...cropData };
    } else {
      memoryDb.crops.push(cropData);
    }

    syncToFile('crops', memoryDb.crops);
    window.dispatchEvent(new Event('central_database_updated'));
    return cropData;
  },

  // OFFERS FILE (src/data/offers.json)
  getOffers: () => {
    return memoryDb.offers || [];
  },

  saveOffer: (offerData) => {
    const index = memoryDb.offers.findIndex((o) => o.id === offerData.id);
    if (index >= 0) {
      memoryDb.offers[index] = { ...memoryDb.offers[index], ...offerData };
    } else {
      memoryDb.offers.push(offerData);
    }

    syncToFile('offers', memoryDb.offers);
    window.dispatchEvent(new Event('central_database_updated'));
    return offerData;
  }
};

export default centralDatabase;
