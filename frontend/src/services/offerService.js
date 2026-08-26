import apiClient, { USE_MOCK } from './api';
import { MOCK_OFFERS } from './mockData';

export const offerService = {
  getOffers: async (type = 'all') => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      if (type === 'all') return MOCK_OFFERS;
      return MOCK_OFFERS.filter((off) => off.type === type || off.status.toLowerCase() === type.toLowerCase());
    }
    return apiClient.get('/offers', { params: { type } });
  },

  createOffer: async (offerData) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 400));
      const newOffer = {
        id: 'off-' + Date.now(),
        status: 'Sent',
        type: 'sent',
        createdDate: new Date().toISOString().split('T')[0],
        ...offerData
      };
      MOCK_OFFERS.unshift(newOffer);
      return newOffer;
    }
    return apiClient.post('/offers', offerData);
  },

  updateOfferStatus: async (offerId, status, counterPrice = null) => {
    if (USE_MOCK) {
      await new Promise((res) => setTimeout(res, 300));
      const offer = MOCK_OFFERS.find((o) => o.id === offerId);
      if (offer) {
        offer.status = status;
        if (counterPrice) {
          offer.offeredPricePerQuintal = counterPrice;
          offer.notes = `Counter offer submitted at ₹${counterPrice}/q`;
        }
      }
      return offer;
    }
    return apiClient.patch(`/offers/${offerId}`, { status, counterPrice });
  }
};

export default offerService;
