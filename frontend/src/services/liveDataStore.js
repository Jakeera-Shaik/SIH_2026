import centralDatabase from './centralDatabase';

const STORAGE_KEYS = {
  REQUIREMENTS: 'agri_buyer_requirements',
  FARMER_CROPS: 'agri_farmer_crops',
  OFFERS: 'agri_offers',
  VERSION: 'agri_store_version_v2'
};

export function getCropBenchmarkPrice(cropName) {
  const norm = (cropName || '').toLowerCase();
  if (norm.includes('cotton')) return 6900;
  if (norm.includes('chilli')) return 16350;
  if (norm.includes('paddy') || norm.includes('rice')) return 4150;
  if (norm.includes('onion')) return 3380;
  if (norm.includes('tomato')) return 2850;
  if (norm.includes('wheat')) return 2550;
  if (norm.includes('potato')) return 2280;
  if (norm.includes('maize') || norm.includes('corn')) return 2250;
  return 3000;
}

const listeners = new Set();

const notifyListeners = () => {
  listeners.forEach((cb) => {
    try {
      cb();
    } catch (e) {
      console.error('Error notifying live store listener:', e);
    }
  });
};

// Listen to storage and central database events
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => notifyListeners());
  window.addEventListener('central_database_updated', () => notifyListeners());
}

export const liveDataStore = {
  getCropBenchmarkPrice,

  subscribe: (callback) => {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },

  /**
   * BUYERS & REQUIREMENTS
   */
  getBuyerRequirements: () => {
    const raw = localStorage.getItem(STORAGE_KEYS.REQUIREMENTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  /**
   * FARMER ACTIVE CROPS
   */
  getFarmerCrops: () => {
    const crops = centralDatabase.getCrops();
    const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
    if (currentUser.role === 'farmer' && currentUser.id) {
      return crops.filter(c => c.farmerId === currentUser.id || c.farmerName === currentUser.name);
    }
    return crops;
  },

  getMatchingFarmersForBuyer: () => {
    const crops = centralDatabase.getCrops();
    const activeCrops = crops.filter((c) => c.status !== 'Sold' && c.active !== false);

    if (activeCrops.length > 0) {
      return activeCrops;
    }

    // Default registered crop fallback if farmer has an active session
    const currentFarmerCropRaw = localStorage.getItem('agri_farmer_crop');
    const isCleared = localStorage.getItem('agri_active_crop_cleared') === 'true';

    if (currentFarmerCropRaw && !isCleared) {
      try {
        const crop = JSON.parse(currentFarmerCropRaw);
        return [
          {
            id: crop.id || 'f-1',
            name: crop.farmerName || 'Shaik Jakeera',
            location: crop.location || 'Nashik, Maharashtra',
            distanceKm: crop.distanceKm || 15,
            crop: crop.crop || 'Cotton',
            variety: crop.variety || 'Medium Staple',
            quantityKg: crop.quantityKg || 1500,
            availableQty: `${crop.quantityKg || 1500} kg (${(crop.quantityKg || 1500) / 100} Quintals)`,
            expectedPrice: crop.expectedPrice || 6900
          }
        ];
      } catch {
        return [];
      }
    }
    return [];
  },

  registerCrop: (cropData) => {
    const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
    const cropName = cropData.name || 'Cotton';
    const benchmarkPrice = getCropBenchmarkPrice(cropName);

    const expectedPrice = cropData.expectedPrice && Number(cropData.expectedPrice) > 2400
      ? Number(cropData.expectedPrice)
      : benchmarkPrice;

    const newCropLot = {
      id: 'crop-lot-' + Date.now(),
      farmerId: currentUser.id || 'f-1',
      farmerName: currentUser.name || 'Shaik Jakeera',
      mobile: currentUser.mobile || '+91 98480 12345',
      crop: cropName,
      variety: cropData.variety || 'Medium Staple',
      quantityKg: Number(cropData.quantityKg) || 1500,
      availableQty: `${cropData.quantityKg || 1500} kg (${(cropData.quantityKg || 1500) / 100} Quintals)`,
      location: cropData.location || currentUser.district || 'Nashik, Maharashtra',
      distanceKm: cropData.distanceKm || 15,
      expectedPrice: expectedPrice,
      harvestDate: cropData.harvestDate || new Date().toISOString().split('T')[0],
      rating: 5.0,
      qualityGrade: 'Grade A Premium',
      status: 'Active',
      active: true
    };

    localStorage.setItem('agri_farmer_crop', JSON.stringify(newCropLot));
    centralDatabase.saveCrop(newCropLot);
    notifyListeners();
    return newCropLot;
  },

  /**
   * OFFERS (Inter-user negotiation & live chat)
   */
  getOffers: () => {
    return centralDatabase.getOffers();
  },

  createOffer: (offerData) => {
    const currentUser = JSON.parse(localStorage.getItem('agri_user') || '{}');
    const cropName = offerData.crop || 'Cotton';
    const price = Number(offerData.offeredPricePerQuintal) && Number(offerData.offeredPricePerQuintal) > 2400
      ? Number(offerData.offeredPricePerQuintal)
      : getCropBenchmarkPrice(cropName);

    const newOffer = {
      id: 'off-' + Date.now(),
      buyerId: offerData.buyerId || 'b-1',
      buyerName: offerData.buyerName || 'Corporate Buyer',
      loginEmail: offerData.loginEmail || 'nashik@gmail.com',
      farmerId: currentUser.role === 'farmer' ? (currentUser.id || 'f-1') : (offerData.farmerId || 'f-1'),
      farmerName: currentUser.role === 'farmer' ? (currentUser.name || 'Shaik Jakeera') : (offerData.farmerName || 'Shaik Jakeera'),
      farmerEmail: currentUser.email || '',
      crop: cropName,
      quantity: offerData.quantity || '15 Quintals',
      offeredPricePerQuintal: price,
      totalValue: Number(offerData.totalValue) || 103500,
      netReturn: Number(offerData.netReturn) || 100305,
      status: 'Sent',
      type: currentUser.role === 'farmer' ? 'sent' : 'received',
      createdDate: new Date().toISOString().split('T')[0],
      notes: offerData.notes || `Offer submitted at ₹${price}/q`,
      discussion: [
        {
          id: 'msg-' + Date.now(),
          senderName: currentUser.name || 'User',
          senderRole: currentUser.role || 'farmer',
          text: `Offer initiated for ${cropName} lot at ₹${price}/q.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    centralDatabase.saveOffer(newOffer);
    notifyListeners();
    return newOffer;
  },

  createOfferFromBuyer: (buyerOfferData) => {
    const price = Number(buyerOfferData.offeredPricePerQuintal) && Number(buyerOfferData.offeredPricePerQuintal) > 2400
      ? Number(buyerOfferData.offeredPricePerQuintal)
      : getCropBenchmarkPrice(buyerOfferData.crop);

    const newOffer = {
      id: 'off-' + Date.now(),
      buyerId: 'b-' + Date.now(),
      buyerName: buyerOfferData.buyerName || 'APMC Mandi Official',
      loginEmail: buyerOfferData.loginEmail || 'nashik@gmail.com',
      farmerId: buyerOfferData.farmerId || 'f-1',
      farmerName: buyerOfferData.farmerName || 'Shaik Jakeera',
      crop: buyerOfferData.crop || 'Cotton',
      quantity: buyerOfferData.quantity || '15 Quintals',
      offeredPricePerQuintal: price,
      totalValue: Number(buyerOfferData.totalValue) || 103500,
      netReturn: Number(buyerOfferData.netReturn) || 100305,
      status: 'Received',
      type: 'received',
      createdDate: new Date().toISOString().split('T')[0],
      notes: buyerOfferData.notes || `${buyerOfferData.buyerName} Official issued purchase offer at ₹${price}/q`,
      discussion: [
        {
          id: 'msg-' + Date.now(),
          senderName: buyerOfferData.buyerName || 'Mandi Official',
          senderRole: 'mandi',
          text: `Official purchase offer issued at ₹${price}/q for ${buyerOfferData.crop} lot.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    centralDatabase.saveOffer(newOffer);
    notifyListeners();
    return newOffer;
  },

  rejectOfferWithReason: (offerId, reason) => {
    const offers = liveDataStore.getOffers();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          status: 'Declined by Mandi',
          rejectionReason: reason,
          notes: `Declined by Mandi Official. Reason: ${reason}`,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: off.buyerName || 'Mandi Official',
              senderRole: 'mandi',
              text: `Request declined. Reason: ${reason}`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return off;
    });

    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  acceptOfferByBuyer: (offerId) => {
    const offers = liveDataStore.getOffers();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          status: 'Accepted (Pending Logistics)',
          notes: 'Buyer accepted request! Farmer has 2 days to complete transportation formalities.',
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: off.buyerName || 'Buyer',
              senderRole: 'buyer',
              text: 'Request accepted! Please proceed with transportation dispatch within 2 days.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return off;
    });
    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  acceptOfferAndCancelOthers: (acceptedOfferId) => {
    const offers = liveDataStore.getOffers();
    const target = offers.find((o) => o.id === acceptedOfferId);
    if (!target) return;

    const targetCrop = target.crop;

    const updated = offers.map((off) => {
      if (off.id === acceptedOfferId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          status: 'Accepted (Pending Logistics)',
          notes: `Farmer accepted ${off.buyerName} offer at ₹${off.offeredPricePerQuintal}/q! Proceed within 2 days with transportation dispatch.`,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: off.farmerName || 'Farmer',
              senderRole: 'farmer',
              text: `Offer accepted! Proceeding with crop harvest and transport dispatch to ${off.buyerName}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      if (
        off.id !== acceptedOfferId &&
        off.crop === targetCrop &&
        (off.status === 'Sent' || off.status === 'Received' || off.status?.includes('Pending'))
      ) {
        return {
          ...off,
          status: 'Superceded (Accepted Better Mandi Offer)',
          notes: `Farmer accepted a higher rate offer of ₹${target.offeredPricePerQuintal}/q from ${target.buyerName}.`
        };
      }
      return off;
    });

    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  cancelOfferByFarmer: (offerId) => {
    const offers = liveDataStore.getOffers();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        return { ...off, status: 'Cancelled' };
      }
      return off;
    });
    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  completeOfferAndPay: (offerId, paidAmount) => {
    const offers = liveDataStore.getOffers();
    let completedOffer = null;

    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        const total = Number(paidAmount) || off.totalValue || 100305;
        completedOffer = {
          ...off,
          status: 'Completed',
          paidAmount: total,
          completedAt: new Date().toISOString(),
          notes: `Deal completed successfully. ₹${total.toLocaleString('en-IN')} released to farmer account.`,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName: off.buyerName || 'Buyer',
              senderRole: 'buyer',
              text: `Payment of ₹${total.toLocaleString('en-IN')} released to farmer account. Order marked completed.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
        return completedOffer;
      }
      return off;
    });

    if (completedOffer) {
      if (completedOffer.farmerId) localStorage.setItem(`agri_crop_cleared_${completedOffer.farmerId}`, 'true');
      if (completedOffer.farmerEmail) localStorage.setItem(`agri_crop_cleared_${completedOffer.farmerEmail}`, 'true');
    }
    localStorage.setItem('agri_active_crop_cleared', 'true');

    centralDatabase.setOffers(updated);
    notifyListeners();
  },

  addOfferMessage: (offerId, senderName, senderRole, text) => {
    const offers = liveDataStore.getOffers();
    const updated = offers.map((off) => {
      if (off.id === offerId) {
        const discussion = off.discussion || [];
        return {
          ...off,
          discussion: [
            ...discussion,
            {
              id: 'msg-' + Date.now(),
              senderName,
              senderRole,
              text,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]
        };
      }
      return off;
    });
    centralDatabase.setOffers(updated);
    notifyListeners();
  }
};

export default liveDataStore;
