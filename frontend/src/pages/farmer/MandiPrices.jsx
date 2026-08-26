import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import marketService from '../../services/marketService';
import FilterBar from '../../components/common/FilterBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { TrendingUp, TrendingDown, MapPin, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MandiPrices = () => {
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);

  const loadPrices = async () => {
    setLoading(true);
    try {
      const res = await marketService.getCurrentPrices({
        search: searchQuery,
        crop: selectedCrop,
        state: selectedState,
        page: currentPage
      });
      setMarkets(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPrices();
  }, [searchQuery, selectedCrop, selectedState, currentPage]);

  const handleUseLocation = () => {
    setSelectedState('Maharashtra');
    setSearchQuery('Nashik');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Live Mandi Prices</h1>
        <p className="text-xs text-slate-400 mt-1">
          Explore real-time APMC arrivals, modal prices, min/max limits, and trend movements across India.
        </p>
      </div>

      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCrop={selectedCrop}
        onCropChange={setSelectedCrop}
        selectedState={selectedState}
        onStateChange={setSelectedState}
        onLocationClick={handleUseLocation}
      />

      {loading ? (
        <LoadingSpinner message="Fetching live mandi prices..." />
      ) : markets.length === 0 ? (
        <EmptyState
          title="No mandi prices found"
          description="Try adjusting your crop or location filters."
          onRetry={() => {
            setSearchQuery('');
            setSelectedCrop('All');
            setSelectedState('All');
          }}
        />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/80 text-slate-300 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-700">
                <tr>
                  <th className="py-3.5 px-4">Market / Mandi</th>
                  <th className="py-3.5 px-4">Commodity</th>
                  <th className="py-3.5 px-4">Variety</th>
                  <th className="py-3.5 px-4">Min Price</th>
                  <th className="py-3.5 px-4">Max Price</th>
                  <th className="py-3.5 px-4">Modal Price</th>
                  <th className="py-3.5 px-4">Arrival Volume</th>
                  <th className="py-3.5 px-4">Trend</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {markets.map((market) => {
                  const isUp = market.trend === 'up';
                  return (
                    <tr key={market.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-4 px-4 font-bold text-slate-100">
                        <div>{market.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{market.district}, {market.state} ({market.distanceKm} km)</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-emerald-400">{market.commodity}</td>
                      <td className="py-4 px-4 text-slate-300">{market.variety}</td>
                      <td className="py-4 px-4 text-slate-400">{formatCurrency(market.minPrice)}</td>
                      <td className="py-4 px-4 text-slate-400">{formatCurrency(market.maxPrice)}</td>
                      <td className="py-4 px-4 font-extrabold text-slate-100 text-sm">
                        {formatCurrency(market.modalPrice)}
                        <span className="text-[10px] font-normal text-slate-500"> /q</span>
                      </td>
                      <td className="py-4 px-4 text-slate-300">{market.arrivalQty}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            isUp
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                          <span>{isUp ? `+${market.trendPercent}%` : `${market.trendPercent}%`}</span>
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/farmer/markets/${market.id}`}
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-semibold text-xs"
                        >
                          <span>Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={3}
            onPageChange={(p) => setCurrentPage(p)}
          />
        </div>
      )}
    </div>
  );
};

export default MandiPrices;
