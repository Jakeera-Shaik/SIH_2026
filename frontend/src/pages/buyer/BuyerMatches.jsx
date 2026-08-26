import React, { useState, useEffect } from 'react';
import buyerService from '../../services/buyerService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Rating from '../../components/common/Rating';
import Modal from '../../components/common/Modal';

import { Target, MapPin, Scale, Zap, Send, Phone, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const BuyerMatches = () => {
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState([]);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [contactModal, setContactModal] = useState(null);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      try {
        const res = await buyerService.getFarmerMatches();
        setMatches(res);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase mb-2">
          <Zap className="w-4 h-4 text-teal-400 fill-teal-400" />
          <span>AI Matching Algorithm</span>
        </div>
        <h1 className="text-2xl font-black text-slate-100">Farmer Sourcing Matches</h1>
        <p className="text-xs text-slate-400 mt-1">
          Farmers near your procurement hub whose crop type and harvested volume meet your specification.
        </p>
      </div>

      {loading ? (
        <LoadingSpinner message="Calculating matching farmer lots..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {matches.map((farmer) => (
            <div key={farmer.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-100 text-lg">{farmer.name}</h4>
                    <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {farmer.location} ({farmer.distanceKm} km away)
                    </span>
                  </div>

                  <span className="bg-teal-500/10 text-teal-400 text-xs font-bold px-2.5 py-1 rounded-full border border-teal-500/30">
                    {farmer.matchPercentage}% Match
                  </span>
                </div>

                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Lot:</span>
                    <strong className="text-slate-100">{farmer.crop} ({farmer.availableQty})</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Quality Grade:</span>
                    <strong className="text-emerald-400">{farmer.qualityGrade}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Asking Price:</span>
                    <strong className="text-slate-100">{formatCurrency(farmer.expectedPrice)} / q</strong>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSelectedFarmer(farmer)}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
                >
                  View Details
                </button>
                <button
                  onClick={() => setContactModal(farmer)}
                  className="w-full py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold flex items-center justify-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Bid</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Details modal */}
      {selectedFarmer && (
        <Modal isOpen={!!selectedFarmer} onClose={() => setSelectedFarmer(null)} title={`Farmer Lot: ${selectedFarmer.name}`}>
          <div className="space-y-4 text-xs">
            <div className="bg-slate-800 p-4 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Farmer Name:</span>
                <strong className="text-slate-100">{selectedFarmer.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Location:</span>
                <strong className="text-slate-100">{selectedFarmer.location} ({selectedFarmer.distanceKm} km)</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Crop & Grade:</span>
                <strong className="text-emerald-400">{selectedFarmer.crop} ({selectedFarmer.qualityGrade})</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Available Harvest:</span>
                <strong className="text-slate-100">{selectedFarmer.availableQty}</strong>
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => setSelectedFarmer(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Contact modal */}
      {contactModal && (
        <Modal isOpen={!!contactModal} onClose={() => setContactModal(null)} title={`Submit Direct Bid to ${contactModal.name}`}>
          <div className="space-y-4 text-xs">
            <p className="text-slate-300">
              Submit your direct purchasing proposal to {contactModal.name} for {contactModal.availableQty} of {contactModal.crop}.
            </p>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Proposed Purchase Price (₹ / q)</label>
              <input
                type="number"
                defaultValue={contactModal.expectedPrice}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-slate-100 focus:outline-none focus:border-teal-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setContactModal(null)} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl">
                Cancel
              </button>
              <button
                onClick={() => {
                  alert(`Direct purchasing bid sent to ${contactModal.name}!`);
                  setContactModal(null);
                }}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl"
              >
                Send Official Bid
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BuyerMatches;
