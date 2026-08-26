import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import marketService from '../../services/marketService';
import priceService from '../../services/priceService';
import PriceChart from '../../components/dashboard/PriceChart';
import ProfitCard from '../../components/dashboard/ProfitCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { calculateNetReturn } from '../../utils/math';

import { MapPin, Navigation, Clock, ShieldCheck, CheckCircle2, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MarketDetails = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [market, setMarket] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [range, setRange] = useState('7d');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const m = await marketService.getMarketById(marketId);
        const p = await priceService.getHistoricalPrices({ market: m.name, period: range });
        setMarket(m);
        setPriceHistory(p.chartData);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [marketId, range]);

  if (loading || !market) {
    return <LoadingSpinner message="Fetching market logistics and price history..." />;
  }

  const profitCalc = calculateNetReturn({
    quantityKg: 1000,
    pricePerQuintal: market.modalPrice,
    transportCost: market.transportCost,
    handlingCost: market.handlingCost,
    commissionPercent: market.commissionPercent
  });

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        to="/farmer/markets"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Mandi Prices</span>
      </Link>

      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Government APMC Regulated Yard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-100">{market.name}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {market.district}, {market.state}
            </span>
            <span className="flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              Distance: <strong className="text-slate-200">{market.distanceKm} km</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Hours: {market.operatingHours}
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/farmer/profit-calculator')}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-6 py-3 rounded-2xl shadow-lg shadow-emerald-900/30 transition-all"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Use This Market</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium uppercase">Modal Price</span>
          <span className="text-2xl font-black text-slate-100">{formatCurrency(market.modalPrice)}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Updated: {market.lastUpdated}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium uppercase">Min - Max Band</span>
          <span className="text-lg font-bold text-slate-300">
            {formatCurrency(market.minPrice)} - {formatCurrency(market.maxPrice)}
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">Per Quintal (100 kg)</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
          <span className="text-xs text-slate-400 block font-medium uppercase">Est. Freight Transport</span>
          <span className="text-2xl font-black text-amber-400">{formatCurrency(market.transportCost)}</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">For 1 Tonne crop lot</span>
        </div>

        <div className="bg-slate-900 border border-emerald-500/40 p-4 rounded-2xl bg-emerald-950/20">
          <span className="text-xs text-emerald-400 block font-medium uppercase">Estimated Net Return</span>
          <span className="text-2xl font-black text-emerald-400">{formatCurrency(profitCalc.netReturn)}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">ROI: {profitCalc.roiPercent.toFixed(0)}%</span>
        </div>
      </div>

      {/* Grid: Historical Price Chart + Profit Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart
            data={priceHistory}
            title={`${market.name} Historical Price Movement`}
            currentRange={range}
            onRangeChange={(r) => setRange(r)}
          />
        </div>

        <div>
          <ProfitCard result={profitCalc} />
        </div>
      </div>
    </div>
  );
};

export default MarketDetails;
