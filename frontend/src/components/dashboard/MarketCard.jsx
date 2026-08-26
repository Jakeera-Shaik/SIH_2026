import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, TrendingUp, TrendingDown, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MarketCard = ({ market }) => {
  const isUp = market.trend === 'up';

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <h4 className="font-bold text-slate-100 text-lg">{market.name}</h4>
            <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{market.district}, {market.state} • {market.distanceKm} km away</span>
            </div>
          </div>
          <span
            className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${
              isUp
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-red-500/10 text-red-400 border-red-500/30'
            }`}
          >
            {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isUp ? `+${market.trendPercent}%` : `${market.trendPercent}%`}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 py-3 border-y border-slate-800/80 my-3">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Modal Price
            </span>
            <span className="text-xl font-extrabold text-slate-100">
              {formatCurrency(market.modalPrice)}
              <span className="text-xs font-normal text-slate-400">/q</span>
            </span>
          </div>

          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Est. Net Return
            </span>
            <span className="text-xl font-extrabold text-emerald-400">
              {formatCurrency(market.expectedNetReturn)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between mb-4">
          <span>Transport: {formatCurrency(market.transportCost)}</span>
          <span>Arrival: {market.arrivalQty}</span>
        </div>
      </div>

      <Link
        to={`/farmer/markets/${market.id}`}
        className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-sm font-semibold py-2.5 rounded-xl transition-all"
      >
        <span>View Market Details</span>
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
};

export default MarketCard;
