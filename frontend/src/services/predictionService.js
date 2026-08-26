import apiClient, { USE_MOCK } from './api';
import { MOCK_AI_PREDICTION } from './mockData';

export const predictionService = {
  getPricePrediction: async (crop = 'Onion', district = 'Nashik') => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 350));
      return {
        ...MOCK_AI_PREDICTION,
        crop,
        district
      };
    }
    return apiClient.get('/predictions/price', { params: { crop, district } });
  }
};

export default predictionService;
