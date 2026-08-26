import React, { useState, useEffect } from 'react';
import priceService from '../../services/priceService';
import PriceChart from '../../components/dashboard/PriceChart';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { TrendingUp, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const HistoricalPrices = () => {
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState('Onion');
  const [selectedMarket, setSelectedMarket] = useState('Nashik APMC');
  const [period, setPeriod] = useState('30d');
  const [priceData, setPriceData] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await priceService.getHistoricalPrices({
        crop: selectedCrop,
        market: selectedMarket,
        period
      });
      setPriceData(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedCrop, selectedMarket, period]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-100">Historical Price Intelligence</h1>
        <p className="text-xs text-slate-400 mt-1">
          Analyze seasonal trends, historical volatility, and key market thresholds.
        </p>
      </div>

      {/* Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
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
            <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              <option value="Nashik APMC">Nashik APMC</option>
              <option value="Pune APMC">Pune APMC</option>
              <option value="Mumbai Vashi APMC">Mumbai Vashi APMC</option>
              <option value="Azadpur Mandi">Azadpur Mandi</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs font-semibold">
          {['7d', '30d', '90d'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg uppercase transition-all ${
                period === p ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {loading || !priceData ? (
        <LoadingSpinner message="Fetching price history..." />
      ) : (
        <>
          <PriceChart
            data={priceData.chartData}
            title={`${selectedCrop} Price History (${selectedMarket})`}
            currentRange={period}
            onRangeChange={(p) => setPeriod(p)}
          />

          {/* Stats Summary Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Highest Price</span>
              <span className="text-xl font-extrabold text-emerald-400">
                {formatCurrency(priceData.stats.highest)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Lowest Price</span>
              <span className="text-xl font-extrabold text-red-400">
                {formatCurrency(priceData.stats.lowest)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Average Price</span>
              <span className="text-xl font-extrabold text-slate-200">
                {formatCurrency(priceData.stats.average)}
              </span>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <span className="text-[11px] text-slate-400 block font-medium uppercase">Current Modal</span>
              <span className="text-xl font-extrabold text-slate-100">
                {formatCurrency(priceData.stats.current)}
              </span>
            </div>
          </div>

          {/* Insight Banner */}
          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-200">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0" />
            <p className="font-semibold">{priceData.stats.insight}</p>
          </div>
        </>
      )}
    </div>
  );
};

export default HistoricalPrices;
