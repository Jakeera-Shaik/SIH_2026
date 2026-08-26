import React, { useState, useEffect } from 'react';
import offerService from '../../services/offerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';

import { Handshake, Check, X, RefreshCw, DollarSign, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const FarmerOffers = () => {
  const [activeTab, setActiveTab] = useState('received');
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);

  // Counter offer modal
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState(3450);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const data = await offerService.getOffers(activeTab);
      setOffers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, [activeTab]);

  const handleAction = async (offerId, status, newPrice = null) => {
    await offerService.updateOfferStatus(offerId, status, newPrice);
    fetchOffers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Trade Offers & Negotiations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage incoming buyer purchase bids, active counter-offers, and completed sale agreements.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 max-w-md">
        {['received', 'sent', 'accepted', 'completed'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              activeTab === tab
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching offer records..." />
      ) : offers.length === 0 ? (
        <EmptyState title={`No ${activeTab} offers found.`} description="No active trade offers in this queue." />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div
              key={offer.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-slate-100 text-base">{offer.buyerName}</h4>
                  <StatusBadge status={offer.status} />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>Crop: <strong className="text-slate-200">{offer.crop}</strong></span>
                  <span>Quantity: <strong className="text-slate-200">{offer.quantity}</strong></span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {offer.createdDate}
                  </span>
                </div>
                {offer.notes && <p className="text-xs text-slate-400 mt-2 italic bg-slate-800/40 p-2 rounded-lg">{offer.notes}</p>}
              </div>

              <div className="flex flex-col sm:items-end gap-3 shrink-0">
                <div>
                  <span className="text-[11px] text-slate-400 block font-medium">Offered Rate</span>
                  <span className="text-xl font-black text-emerald-400">
                    {formatCurrency(offer.offeredPricePerQuintal)}
                    <span className="text-xs font-normal text-slate-400">/q</span>
                  </span>
                  <span className="text-xs text-slate-400 block font-medium">
                    Total: {formatCurrency(offer.totalValue)}
                  </span>
                </div>

                {offer.status === 'Received' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAction(offer.id, 'Accepted')}
                      className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept</span>
                    </button>
                    <button
                      onClick={() => setCounterModalOffer(offer)}
                      className="inline-flex items-center gap-1 bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/30 text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Counter</span>
                    </button>
                    <button
                      onClick={() => handleAction(offer.id, 'Rejected')}
                      className="inline-flex items-center gap-1 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-800/40 text-xs font-bold px-3 py-1.5 rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Counter offer modal */}
      {counterModalOffer && (
        <Modal
          isOpen={!!counterModalOffer}
          onClose={() => setCounterModalOffer(null)}
          title={`Counter Offer to ${counterModalOffer.buyerName}`}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Your Counter Price (₹ / quintal)</label>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setCounterModalOffer(null)}
                className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  handleAction(counterModalOffer.id, 'Countered', Number(counterPrice));
                  setCounterModalOffer(null);
                }}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl"
              >
                Submit Counter Offer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default FarmerOffers;
