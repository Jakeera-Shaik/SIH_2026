import React from 'react';

export const DashboardCard = ({ title, value, subtitle, icon: Icon, trend, trendText, color = 'emerald' }) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg backdrop-blur-md relative overflow-hidden group hover:border-slate-700 transition-all">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs uppercase tracking-wider font-medium text-slate-400">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-xl bg-slate-800 text-emerald-400 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-2xl sm:text-3xl font-extrabold text-slate-100 mb-1">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{subtitle}</span>
        {trend && (
          <span
            className={`font-semibold px-2 py-0.5 rounded-full ${
              trend === 'up'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}
          >
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;
