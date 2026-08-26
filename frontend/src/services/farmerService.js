import apiClient, { USE_MOCK } from './api';
import { MOCK_FARMER_PROFILE } from './mockData';

export const farmerService = {
  getProfile: async () => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_FARMER_PROFILE;
    }
    return apiClient.get('/farmer/profile');
  },

  updateProfile: async (profileData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const updated = { ...MOCK_FARMER_PROFILE, ...profileData };
      localStorage.setItem('agri_user', JSON.stringify(updated));
      return updated;
    }
    return apiClient.put('/farmer/profile', profileData);
  },

  updateCurrentCrop: async (cropData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      MOCK_FARMER_PROFILE.currentCrop = { ...MOCK_FARMER_PROFILE.currentCrop, ...cropData };
      return MOCK_FARMER_PROFILE.currentCrop;
    }
    return apiClient.post('/farmer/crop', cropData);
  }
};

export default farmerService;
