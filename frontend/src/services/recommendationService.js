import apiClient, { USE_MOCK } from './api';
import { MOCK_MARKETS, MOCK_BEST_MARKET_RECOMMENDATION } from './mockData';

export const recommendationService = {
  getBestMarkets: async (params = {}) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 400));
      
      const quantityKg = params.quantityKg || 1000;
      const quintals = quantityKg / 100;

      const ranked = MOCK_MARKETS.map((market, idx) => {
        const gross = quintals * market.modalPrice;
        const commission = (gross * market.commissionPercent) / 100;
        const netReturn = gross - market.transportCost - market.handlingCost - commission;

        return {
          ...market,
          grossRevenue: gross,
          netReturn,
          rank: idx + 1,
          badge: idx === 0 ? '🥇 Best Value' : idx === 1 ? '🥈 2nd Choice' : '🥉 3rd Choice',
          explanation: idx === 0
            ? `Nashik provides the optimal balance of proximity (${market.distanceKm} km) and high modal price (₹${market.modalPrice}/q), leading to maximum Net Return of ₹${netReturn.toLocaleString('en-IN')}.`
            : `Offers competitive price of ₹${market.modalPrice}/q, but higher transport distance (${market.distanceKm} km) reduces net return by ₹${(MOCK_MARKETS[0].modalPrice * quintals - netReturn).toFixed(0)}.`
        };
      }).sort((a, b) => b.netReturn - a.netReturn);

      return {
        topRecommendation: MOCK_BEST_MARKET_RECOMMENDATION,
        rankedMarkets: ranked
      };
    }
    return apiClient.post('/recommendations/markets', params);
  }
};

export default recommendationService;
