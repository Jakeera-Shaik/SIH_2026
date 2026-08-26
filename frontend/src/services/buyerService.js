import apiClient, { USE_MOCK } from './api';
import { MOCK_BUYERS, MOCK_BUYER_REQUIREMENTS, MOCK_MATCHING_FARMERS } from './mockData';

export const buyerService = {
  getMatchingBuyers: async (filters = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      let buyers = [...MOCK_BUYERS];
      if (filters.crop && filters.crop !== 'All') {
        buyers = buyers.filter((b) => b.cropRequired.toLowerCase().includes(filters.crop.toLowerCase()));
      }
      if (filters.minPrice) {
        buyers = buyers.filter((b) => b.offerPrice >= Number(filters.minPrice));
      }
      return buyers;
    }
    return apiClient.get('/buyers/matching', { params: filters });
  },

  getBuyerById: async (buyerId) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const buyer = MOCK_BUYERS.find((b) => b.id === buyerId) || MOCK_BUYERS[0];
      return buyer;
    }
    return apiClient.get(`/buyers/${buyerId}`);
  },

  getRequirements: async () => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_BUYER_REQUIREMENTS;
    }
    return apiClient.get('/buyer/requirements');
  },

  createRequirement: async (requirementData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 400));
      const newReq = {
        id: 'req-' + Date.now(),
        ...requirementData,
        status: 'Active',
        matchingFarmersCount: 5
      };
      MOCK_BUYER_REQUIREMENTS.unshift(newReq);
      return newReq;
    }
    return apiClient.post('/buyer/requirements', requirementData);
  },

  getFarmerMatches: async () => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      return MOCK_MATCHING_FARMERS;
    }
    return apiClient.get('/buyer/matches');
  }
};

export default buyerService;
