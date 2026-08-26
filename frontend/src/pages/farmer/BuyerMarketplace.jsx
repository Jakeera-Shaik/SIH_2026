import React, { useState, useEffect } from 'react';
import buyerService from '../../services/buyerService';
import BuyerCard from '../../components/dashboard/BuyerCard';
import SendOfferModal from '../../components/modals/SendOfferModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import FilterBar from '../../components/common/FilterBar';
import { Users, ShieldCheck, Zap } from 'lucide-react';

export const BuyerMarketplace = () => {
  const [loading, setLoading] = useState(true);
  const [buyers, setBuyers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);

  const fetchBuyers = async () => {
    setLoading(true);
    try {
      const res = await buyerService.getMatchingBuyers({
        crop: selectedCrop,
        search: searchQuery
      });
      setBuyers(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyers();
  }, [selectedCrop, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Direct Buyer Marketplace</h1>
        <p className="text-xs text-slate-400 mt-1">
          Connect directly with verified corporate food processors, wholesalers, and exporters to lock in prices before harvesting.
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        selectedState="All"
        onStateChange={() => {}}
      />

      {loading ? (
        <LoadingSpinner message="Searching verified corporate buyers..." />
      ) : buyers.length === 0 ? (
        <EmptyState
          title="No buyer requirements matching filters"
          description="Try broadening your crop filter."
          onRetry={() => {
            setSearchQuery('');
            setSelectedCrop('All');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {buyers.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              onSendOffer={(b) => setSelectedBuyerForOffer(b)}
            />
          ))}
        </div>
      )}

      <SendOfferModal
        isOpen={!!selectedBuyerForOffer}
        onClose={() => setSelectedBuyerForOffer(null)}
        buyer={selectedBuyerForOffer}
        onOfferSent={() => fetchBuyers()}
      />
    </div>
  );
};

export default BuyerMarketplace;
