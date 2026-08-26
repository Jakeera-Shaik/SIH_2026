import apiClient, { USE_MOCK } from './api';
import { MOCK_MARKETS } from './mockData';

export const marketService = {
  getCurrentPrices: async (filters = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      let markets = [...MOCK_MARKETS];

      if (filters.crop && filters.crop !== 'All') {
        markets = markets.filter((m) => m.commodity.toLowerCase() === filters.crop.toLowerCase());
      }
      if (filters.search) {
        const query = filters.search.toLowerCase();
        markets = markets.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.district.toLowerCase().includes(query) ||
            m.state.toLowerCase().includes(query)
        );
      }
      if (filters.state && filters.state !== 'All') {
        markets = markets.filter((m) => m.state.toLowerCase() === filters.state.toLowerCase());
      }

      return {
        data: markets,
        totalCount: markets.length,
        page: filters.page || 1,
        pageSize: filters.pageSize || 10,
      };
    }
    return apiClient.get('/markets/prices', { params: filters });
  },

  getTopMarkets: async (limit = 3) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      return MOCK_MARKETS.slice(0, limit);
    }
    return apiClient.get('/markets/top', { params: { limit } });
  },

  getMarketById: async (marketId) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 200));
      const market = MOCK_MARKETS.find((m) => m.id === marketId) || MOCK_MARKETS[0];
      return market;
    }
    return apiClient.get(`/markets/${marketId}`);
  }
};

export default marketService;
