import React from 'react';
import { Calculator, ArrowUpRight, DollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProfitCard = ({ result }) => {
  if (!result) return null;

  const { grossRevenue, expenses, netReturn, profitPerKg, profitPerQuintal, roiPercent } = result;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-100 text-lg">Net Profit Analysis</h4>
            <span className="text-xs text-slate-400">Complete economic yield breakdown</span>
          </div>
        </div>

        <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1 rounded-full">
          ROI: {roiPercent.toFixed(0)}%
        </div>
      </div>

      {/* Primary Highlight */}
      <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-xl p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-400 font-semibold block">
            ESTIMATED NET RETURN
          </span>
          <span className="text-3xl font-black text-emerald-300">
            {formatCurrency(netReturn)}
          </span>
        </div>
        <div className="text-right sm:text-left">
          <span className="text-xs text-slate-400 block font-medium">Profit per Quintal</span>
          <span className="text-xl font-bold text-slate-100">
            {formatCurrency(profitPerQuintal)}
            <span className="text-xs text-slate-400 font-normal"> /q</span>
          </span>
        </div>
      </div>

      {/* Expense Items Breakdown */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between py-2 border-b border-slate-800 text-slate-300">
          <span>Gross Market Revenue</span>
          <span className="font-semibold text-slate-100">{formatCurrency(grossRevenue)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-400">
          <span>(-) Transportation Charges</span>
          <span>{formatCurrency(expenses.transportCost)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-400">
          <span>(-) Handling & Loading</span>
          <span>{formatCurrency(expenses.handlingCost)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-400">
          <span>(-) Storage / Warehousing</span>
          <span>{formatCurrency(expenses.storageCost)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-400">
          <span>(-) APMC Mandi Commission</span>
          <span>{formatCurrency(expenses.commissionCost)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-400">
          <span>(-) Miscellaneous Expenses</span>
          <span>{formatCurrency(expenses.miscCost)}</span>
        </div>
        <div className="flex justify-between py-2 border-t border-slate-800 text-slate-200 font-bold text-sm pt-3">
          <span>Total Operational Costs</span>
          <span className="text-red-400">-{formatCurrency(expenses.totalExpenses)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
