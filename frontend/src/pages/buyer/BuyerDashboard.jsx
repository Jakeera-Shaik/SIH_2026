import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import buyerService from '../../services/buyerService';
import DashboardCard from '../../components/dashboard/DashboardCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { Store, Users, Handshake, ShoppingBag, PlusCircle, Target, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [reqRes, matchRes] = await Promise.all([
          buyerService.getRequirements(),
          buyerService.getFarmerMatches()
        ]);
        setRequirements(reqRes);
        setMatches(matchRes);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Loading procurement portal dashboard..." />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
            Welcome back, {user?.companyName || user?.name || 'Buyer'} 👋
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Corporate Procurement & Mandi Sourcing Hub
          </p>
        </div>

        <Link
          to="/buyer/requirements/create"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-teal-900/30 transition-all hover:scale-105"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Publish Requirement</span>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Active Requirements"
          value={requirements.length}
          subtitle="Open Sourcing Requests"
          icon={Store}
        />
        <DashboardCard
          title="Farmer Matches"
          value={matches.length}
          subtitle="Verified Grade A Lots"
          icon={Target}
          trend="up"
          trendText="High Intent"
        />
        <DashboardCard
          title="Pending Offers"
          value="3"
          subtitle="Awaiting Farmer Payout"
          icon={Handshake}
        />
        <DashboardCard
          title="Completed Purchases"
          value="128"
          subtitle="Total Tonnes Procured"
          icon={ShoppingBag}
        />
      </div>

      {/* Active Requirements List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Active Crop Requirements</h3>
            <p className="text-xs text-slate-400">Published RFQs visible to regional farmers</p>
          </div>

          <Link
            to="/buyer/requirements"
            className="inline-flex items-center gap-1 text-xs font-bold text-teal-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requirements.map((req) => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-teal-400 font-bold uppercase tracking-wider">{req.crop} ({req.variety})</span>
                  <h4 className="text-lg font-bold text-slate-100 mt-0.5">{req.quantityRequired}</h4>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/20">
                  {req.status}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Offer Price:</span>
                  <strong className="text-emerald-400 text-sm">{formatCurrency(req.offerPrice)}/q</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Required By:</span>
                  <strong className="text-slate-200">{req.requiredDate}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-slate-400">{req.matchingFarmersCount} Matching Farmers</span>
                <Link
                  to="/buyer/matches"
                  className="text-teal-400 hover:underline font-semibold"
                >
                  View Matches →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
