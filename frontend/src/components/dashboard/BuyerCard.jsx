import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, ArrowRight, Zap } from 'lucide-react';
import VerifiedBadge from '../common/VerifiedBadge';
import Rating from '../common/Rating';
import { formatCurrency } from '../../utils/formatters';

export const BuyerCard = ({ buyer, onSendOffer }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-emerald-500/40 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-slate-100 text-lg">{buyer.companyName}</h4>
              {buyer.verified && <VerifiedBadge />}
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span>{buyer.location} • {buyer.distanceKm} km</span>
              <span className="text-slate-600">•</span>
              <Rating score={buyer.rating} />
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-2.5 py-1 rounded-full">
              <Zap className="w-3 h-3 fill-emerald-400" />
              <span>{buyer.matchPercentage}% Match</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/50 mb-4">
          <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
            <span>Crop Required: <strong className="text-slate-200">{buyer.cropRequired}</strong></span>
            <span>Quantity: <strong className="text-slate-200">{buyer.quantityRequired}</strong></span>
          </div>
          <div className="flex justify-between items-center text-sm pt-2 border-t border-slate-700/40">
            <span className="text-xs text-slate-400">Offer Price:</span>
            <span className="text-lg font-extrabold text-emerald-400">
              {formatCurrency(buyer.offerPrice)}
              <span className="text-xs font-normal text-slate-400">/q</span>
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link
          to={`/farmer/buyers/${buyer.id}`}
          className="w-full flex items-center justify-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold py-2.5 rounded-xl transition-all"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={() => onSendOffer && onSendOffer(buyer)}
          className="w-full flex items-center justify-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2.5 rounded-xl transition-all shadow-md shadow-emerald-900/20"
        >
          <span>Send Offer</span>
        </button>
      </div>
    </div>
  );
};

export default BuyerCard;
