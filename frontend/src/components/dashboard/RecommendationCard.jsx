import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ArrowRight, CheckCircle, Navigation, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const RecommendationCard = ({ recommendation }) => {
  if (!recommendation) return null;

  return (
    <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-900 border-2 border-emerald-500/50 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-[11px] uppercase tracking-wider px-4 py-1.5 rounded-bl-xl shadow-md flex items-center gap-1">
        <Award className="w-4 h-4" />
        <span>BEST MARKET RECOMMENDATION</span>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 pt-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-400">
            Top Recommendation
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
            {recommendation.marketName}
          </h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimal route based on price & transportation economics</span>
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
          <div>
            <div className="text-[11px] text-slate-400 uppercase font-medium">Recommendation Score</div>
            <div className="text-2xl font-black text-emerald-400">
              {recommendation.recommendationScore}<span className="text-sm font-normal text-slate-400">/100</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500 flex items-center justify-center bg-emerald-500/10 font-bold text-xs text-emerald-300">
            92%
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-900/90 rounded-xl border border-slate-800 mb-5">
        <div>
          <span className="text-xs text-slate-400 block font-medium">Current Modal Price</span>
          <span className="text-xl font-black text-slate-100">
            {formatCurrency(recommendation.modalPrice)}
            <span className="text-xs font-normal text-slate-400">/q</span>
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400 block font-medium">Est. Transport Cost</span>
          <span className="text-xl font-black text-amber-400">
            {formatCurrency(recommendation.transportCost)}
          </span>
        </div>

        <div>
          <span className="text-xs text-slate-400 block font-medium">Expected Net Return</span>
          <span className="text-2xl font-black text-emerald-400">
            {formatCurrency(recommendation.estimatedNetReturn)}
          </span>
        </div>
      </div>

      {/* Rationale */}
      <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-4 mb-5 text-xs text-slate-300 flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-emerald-300 block mb-0.5">Why Nashik APMC?</span>
          <p className="leading-relaxed text-slate-300">{recommendation.reason}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <Link
          to={`/farmer/markets/${recommendation.marketId}`}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-900/40 transition-all"
        >
          <span>View Market Details</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default RecommendationCard;
