import React, { useState, useEffect } from 'react';
import recommendationService from '../../services/recommendationService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Sparkles, MapPin, TrendingUp, Navigation, ArrowRight, Award, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const Recommendations = () => {
  const [crop, setCrop] = useState('Onion');
  const [variety, setVariety] = useState('Nasik Red');
  const [quantityKg, setQuantityKg] = useState(1000);
  const [location, setLocation] = useState('Nashik, Maharashtra');
  const [loading, setLoading] = useState(true);
  const [rankedMarkets, setRankedMarkets] = useState([]);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await recommendationService.getBestMarkets({
        crop,
        variety,
        quantityKg: Number(quantityKg),
        location
      });
      setRankedMarkets(res.rankedMarkets);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [crop, quantityKg]);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase mb-2">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>AI Net Profit Decision Engine</span>
        </div>
        <h1 className="text-2xl font-black text-slate-100">Best Market Recommendations</h1>
        <p className="text-xs text-slate-400 mt-1">
          Ranked by true Net Profit after deducting freight distance, handling, and APMC commission fees.
        </p>
      </div>

      {/* Input Parameters Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
        <h3 className="text-sm font-bold text-slate-200 mb-3">Your Crop & Location Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Crop</label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="Onion">Onion</option>
              <option value="Tomato">Tomato</option>
              <option value="Potato">Potato</option>
              <option value="Paddy">Paddy</option>
              <option value="Cotton">Cotton</option>
              <option value="Chilli">Chilli</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Variety</label>
            <input
              type="text"
              value={variety}
              onChange={(e) => setVariety(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Harvest Quantity (kg)</label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Current Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating optimal net profit routes..." />
      ) : (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-100">Recommended Markets</h3>

          {rankedMarkets.map((market, idx) => (
            <div
              key={market.id}
              className={`bg-slate-900 border rounded-2xl p-6 shadow-xl transition-all ${
                idx === 0
                  ? 'border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900'
                  : 'border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{market.badge.split(' ')[0]}</div>
                  <div>
                    <span className="text-xs font-bold uppercase text-emerald-400 tracking-wider">
                      {market.badge}
                    </span>
                    <h4 className="text-xl font-extrabold text-slate-100">{market.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {market.district}, {market.state} • {market.distanceKm} km away
                    </span>
                  </div>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-right">
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
                    Expected Net Return
                  </span>
                  <span className="text-2xl font-black text-emerald-400">
                    {formatCurrency(market.netReturn)}
                  </span>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-xs">
                <div>
                  <span className="text-slate-400 block">Headline Modal Price:</span>
                  <strong className="text-slate-100 text-sm">{formatCurrency(market.modalPrice)}/q</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Freight Transport Cost:</span>
                  <strong className="text-amber-400 text-sm">{formatCurrency(market.transportCost)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Gross Market Value:</span>
                  <strong className="text-slate-200 text-sm">{formatCurrency(market.grossRevenue)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Mandi Trend:</span>
                  <strong className="text-emerald-400 text-sm">↑ +{market.trendPercent}%</strong>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-slate-800/50 rounded-xl p-3.5 border border-slate-700/50 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 block mb-0.5">Why this market?</span>
                  <p>{market.explanation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
