import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import buyerService from '../../services/buyerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import StatusBadge from '../../components/common/StatusBadge';
import { Store, PlusCircle, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerRequirements = () => {
  const [loading, setLoading] = useState(true);
  const [requirements, setRequirements] = useState([]);

  useEffect(() => {
    const fetchReqs = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getRequirements();
        setRequirements(res);
      } finally {
        setLoading(false);
      }
    };
    fetchReqs();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Sourcing Requirements (RFQs)</h1>
          <p className="text-xs text-slate-400 mt-1">Manage active crop requests visible to regional farmers.</p>
        </div>

        <Link
          to="/buyer/requirements/create"
          className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post Requirement</span>
        </Link>
      </div>

      {loading ? (
        <LoadingSpinner message="Fetching RFQ list..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {requirements.map((req) => (
            <div key={req.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs text-teal-400 font-bold uppercase">{req.crop} • {req.variety}</span>
                  <h3 className="text-xl font-extrabold text-slate-100 mt-0.5">{req.quantityRequired}</h3>
                </div>
                <StatusBadge status={req.status} />
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block">Offer Price:</span>
                  <strong className="text-emerald-400 text-base">{formatCurrency(req.offerPrice)}/q</strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Location:</span>
                  <strong className="text-slate-200">{req.location}</strong>
                </div>
              </div>

              <p className="text-xs text-slate-400 italic">Requirements: {req.additionalRequirements}</p>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <span className="text-slate-400">{req.matchingFarmersCount} Matching Farmers</span>
                <Link to="/buyer/matches" className="text-teal-400 font-semibold hover:underline flex items-center gap-1">
                  <span>View Matching Farmers</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerRequirements;
