import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  Sparkles,
  TrendingUp,
  Store,
  Users,
  Calculator,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export const LandingPage = () => {
  return (
    <div className="bg-slate-950 text-slate-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>SIH 2026 Agri Fintech Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 mb-6 max-w-4xl mx-auto leading-tight">
          Sell Smarter. <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Earn Better.</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
          AI-powered market intelligence that helps farmers find the best market and buyer for their crops by calculating true Net Profit.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            to="/farmer/recommendations"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold px-7 py-3.5 rounded-xl shadow-xl shadow-emerald-900/40 transition-all text-base hover:scale-105"
          >
            <Sparkles className="w-5 h-5 text-emerald-200" />
            Find Best Market
          </Link>
          <Link
            to="/register?role=farmer"
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold px-6 py-3.5 rounded-xl border border-slate-700 transition-all text-base"
          >
            <Sprout className="w-5 h-5 text-emerald-400" />
            Join as Farmer
          </Link>
          <Link
            to="/register?role=buyer"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3.5 rounded-xl border border-slate-800 transition-all text-base"
          >
            <Users className="w-5 h-5 text-teal-400" />
            Join as Buyer
          </Link>
        </div>

        {/* Dashboard Live Preview Card */}
        <div className="relative max-w-5xl mx-auto rounded-3xl p-1 bg-gradient-to-b from-slate-700/50 to-slate-900/90 shadow-2xl border border-slate-800">
          <div className="bg-slate-900 rounded-[22px] p-6 sm:p-8 text-left">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <span className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Live AI Forecast</span>
                <h3 className="text-2xl font-bold text-slate-100">Nasik Red Onion — 1,000 kg (10 Quintals)</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold">
                  Highest Net Return: Nashik APMC
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Nashik Mandi Price</span>
                <span className="text-2xl font-extrabold text-slate-100">₹3,200/q</span>
                <span className="text-xs text-slate-400 block mt-1">Transport: ₹900 (25 km)</span>
                <span className="text-lg font-bold text-emerald-400 block mt-2">Net Return: ₹30,800</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400 block font-medium">Mumbai Vashi APMC</span>
                <span className="text-2xl font-extrabold text-slate-100">₹3,500/q</span>
                <span className="text-xs text-slate-400 block mt-1">Transport: ₹3,500 (170 km)</span>
                <span className="text-lg font-bold text-amber-400 block mt-2">Net Return: ₹28,700</span>
              </div>

              <div className="bg-slate-950/60 p-4 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-purple-400 block font-medium">ABC Foods Offer</span>
                <span className="text-2xl font-extrabold text-slate-100">₹3,400/q</span>
                <span className="text-xs text-slate-400 block mt-1">Farmgate Pickup</span>
                <span className="text-lg font-bold text-purple-300 block mt-2">Match Score: 94%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-100 mb-4">
              Everything Farmers Need for Maximum Profit
            </h2>
            <p className="text-slate-400 text-sm">
              Combining real-time prices, transport logistics, machine learning forecasts, and direct buyer linkage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <Store className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Live Mandi Prices</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time price feeds across hundreds of APMC mandis in India for all major agricultural commodities.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">AI Price Prediction</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Machine learning model forecasting 3-day and 7-day price trends so you sell at peak market rates.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100 mb-2">Net Profit Calculation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automatically subtract transport, handling, storage, and mandi commissions to reveal actual cash in hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Diagram */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h2 className="text-3xl font-extrabold text-slate-100 mb-4">How KrishiSetu Works</h2>
        <p className="text-slate-400 text-sm max-w-xl mx-auto mb-14">
          A seamless 5-step workflow engineered to eliminate middlemen loss and maximize returns.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          {[
            { step: '1', label: 'Farmer Input', desc: 'Select crop & harvest volume' },
            { step: '2', label: 'Market Intelligence', desc: 'Fetch mandi prices & trends' },
            { step: '3', label: 'AI Recommendation', desc: 'Net profit ranking algorithm' },
            { step: '4', label: 'Buyer Connection', desc: 'Direct verified buyer offers' },
            { step: '5', label: 'Better Return', desc: 'Maximised income & instant payout' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
              <div className="w-8 h-8 rounded-full bg-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-bold text-slate-200 text-sm mb-1">{item.label}</h4>
              <p className="text-xs text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
