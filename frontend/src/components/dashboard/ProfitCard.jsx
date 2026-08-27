import React from 'react';
import { Calculator } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const ProfitCard = ({ result }) => {
  if (!result) return null;

  const grossRevenue = Number(result.grossRevenue) || 0;
  const netReturn = Number(result.netReturn) || 0;
  const quintals = Number(result.quintals) || 10;
  const profitPerQuintal = result.profitPerQuintal ?? (quintals > 0 ? Math.round(netReturn / quintals) : 0);
  const roiPercent = Number(result.roiPercent) || 0;

  const transportCost = result.expenses?.transportCost ?? result.transportCost ?? 0;
  const handlingCost = result.expenses?.handlingCost ?? result.handlingCost ?? 0;
  const storageCost = result.expenses?.storageCost ?? result.storageCost ?? 0;
  const commissionCost = result.expenses?.commissionCost ?? result.commission ?? 0;
  const miscCost = result.expenses?.miscCost ?? result.miscCost ?? 0;
  const totalExpenses = result.expenses?.totalExpenses ?? result.totalDeductions ?? (transportCost + handlingCost + storageCost + commissionCost + miscCost);

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-lg">Net Profit Analysis</h4>
            <span className="text-xs text-slate-500 font-medium">Complete economic yield breakdown</span>
          </div>
        </div>

        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-black px-3 py-1 rounded-full shadow-2xs">
          ROI: {roiPercent.toFixed(0)}%
        </div>
      </div>

      {/* Primary Green Hero Highlight */}
      <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white rounded-2xl p-5 mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-md">
        <div>
          <span className="text-xs uppercase tracking-wider text-emerald-100 font-bold block">
            ESTIMATED NET RETURN
          </span>
          <span className="text-3xl font-black text-white">
            {formatCurrency(netReturn)}
          </span>
        </div>
        <div className="text-right sm:text-left">
          <span className="text-xs text-emerald-100 block font-semibold">Profit per Quintal</span>
          <span className="text-xl font-black text-amber-300">
            {formatCurrency(profitPerQuintal)}
            <span className="text-xs text-emerald-200 font-normal"> /q</span>
          </span>
        </div>
      </div>

      {/* Expense Items Breakdown */}
      <div className="space-y-2 text-xs font-medium">
        <div className="flex justify-between py-2 border-b border-slate-200 text-slate-700">
          <span>Gross Market Revenue</span>
          <span className="font-extrabold text-slate-900">{formatCurrency(grossRevenue)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-600">
          <span>(-) Transportation Charges</span>
          <span>{formatCurrency(transportCost)}</span>
        </div>
        <div className="flex justify-between py-1.5 text-slate-600">
          <span>(-) Handling & Loading</span>
          <span>{formatCurrency(handlingCost)}</span>
        </div>
        {storageCost > 0 && (
          <div className="flex justify-between py-1.5 text-slate-600">
            <span>(-) Storage / Warehousing</span>
            <span>{formatCurrency(storageCost)}</span>
          </div>
        )}
        <div className="flex justify-between py-1.5 text-slate-600">
          <span>(-) APMC Mandi Commission</span>
          <span>{formatCurrency(commissionCost)}</span>
        </div>
        {miscCost > 0 && (
          <div className="flex justify-between py-1.5 text-slate-600">
            <span>(-) Miscellaneous Expenses</span>
            <span>{formatCurrency(miscCost)}</span>
          </div>
        )}
        <div className="flex justify-between py-2 border-t border-slate-200 text-slate-900 font-bold text-sm pt-3">
          <span>Total Operational Costs</span>
          <span className="text-red-600">-{formatCurrency(totalExpenses)}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfitCard;
