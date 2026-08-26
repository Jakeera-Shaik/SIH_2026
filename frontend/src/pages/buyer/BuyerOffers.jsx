import React, { useState, useEffect } from 'react';
import offerService from '../../services/offerService';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { Handshake, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerOffers = () => {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    const fetchOffers = async () => {
      setLoading(true);
      try {
        const res = await offerService.getOffers('all');
        setOffers(res);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Buyer Procurement Bids</h1>
        <p className="text-xs text-slate-400 mt-1">Track outgoing purchase offers and active farmer negotiations.</p>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching purchase offers..." />
      ) : offers.length === 0 ? (
        <EmptyState title="No active buyer offers" description="You have not submitted any purchase bids yet." />
      ) : (
        <div className="space-y-4">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h4 className="font-bold text-slate-100 text-base">Farmer: {offer.farmerName}</h4>
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
              </div>

              <div className="text-right">
                <span className="text-[11px] text-slate-400 block font-medium">Offered Rate</span>
                <span className="text-xl font-black text-teal-400">
                  {formatCurrency(offer.offeredPricePerQuintal)}
                  <span className="text-xs font-normal text-slate-400">/q</span>
                </span>
                <span className="text-xs text-slate-400 block font-medium">Total: {formatCurrency(offer.totalValue)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOffers;
