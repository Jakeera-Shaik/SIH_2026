import apiClient, { USE_MOCK } from './api';
import { MOCK_FARMER_PROFILE } from './mockData';
import liveDataStore from './liveDataStore';

export const farmerService = {
  getProfile: async () => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const savedUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
      return {
        ...MOCK_FARMER_PROFILE,
        ...savedUser,
        name: savedUser.name || MOCK_FARMER_PROFILE.name
      };
    }
    return apiClient.get('/farmer/profile');
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
      const updated = { ...MOCK_FARMER_PROFILE, ...currentUser, ...profileData };
      localStorage.setItem('agri_user', JSON.stringify(updated));
      return updated;
    }
    return apiClient.put('/farmer/profile', profileData);
  },

  updateCurrentCrop: async (cropData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const published = liveDataStore.publishFarmerCrop(cropData);
      return published;
    }
    return apiClient.post('/farmer/crop', cropData);
  }
};

export default farmerService;
