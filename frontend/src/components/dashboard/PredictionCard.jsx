import React from 'react';
import { Cpu, TrendingUp, AlertCircle, ShieldCheck, Sparkles } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PredictionCard = ({ prediction }) => {
  if (!prediction) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Cpu className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              <span>AI Price Forecast</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-300 font-bold px-2 py-0.5 rounded-full uppercase">
                ML Model v2.4
              </span>
            </h4>
            <span className="text-xs text-slate-400">
              Predictive intelligence for {prediction.crop}
            </span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Confidence Score</span>
          <span className="text-lg font-black text-emerald-400">{prediction.confidence}%</span>
        </div>
      </div>

      {/* Forecast Matrix */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-slate-950/60 rounded-xl border border-slate-800 mb-4 text-center">
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-medium">Current Price</span>
          <span className="text-lg font-extrabold text-slate-200">
            {formatCurrency(prediction.currentPrice)}
          </span>
        </div>
        <div className="border-x border-slate-800">
          <span className="text-[11px] text-slate-400 block uppercase font-medium">3-Day Forecast</span>
          <span className="text-lg font-extrabold text-emerald-400">
            {formatCurrency(prediction.predicted3Days)}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-slate-400 block uppercase font-medium">7-Day Forecast</span>
          <span className="text-lg font-extrabold text-emerald-400">
            {formatCurrency(prediction.predicted7Days)}
          </span>
        </div>
      </div>

      {/* Recommendation Message */}
      <div className="bg-purple-950/20 border border-purple-900/30 rounded-xl p-4 mb-4">
        <div className="flex items-center gap-1.5 text-xs font-bold text-purple-300 mb-1">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>AI Decision Support:</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">{prediction.recommendation}</p>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 border-t border-slate-800/80 pt-3">
        <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>{prediction.disclaimer}</p>
      </div>
    </div>
  );
};

export default PredictionCard;
