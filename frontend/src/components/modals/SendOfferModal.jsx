import React, { useState } from 'react';
import Modal from '../common/Modal';
import offerService from '../../services/offerService';
import { Handshake, DollarSign, Send, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const SendOfferModal = ({ isOpen, onClose, buyer, onOfferSent }) => {
  const [pricePerQuintal, setPricePerQuintal] = useState(buyer?.offerPrice || 3400);
  const [quantityKg, setQuantityKg] = useState(1000);
  const [notes, setNotes] = useState('Available for pickup within 2 days.');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!buyer) return null;

  const totalValue = (quantityKg / 100) * pricePerQuintal;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await offerService.createOffer({
        buyerId: buyer.id,
        buyerName: buyer.companyName,
        crop: buyer.cropRequired || 'Onion',
        quantity: `${quantityKg} kg (${quantityKg / 100} Quintals)`,
        offeredPricePerQuintal: Number(pricePerQuintal),
        totalValue,
        notes
      });
      setSuccess(true);
      if (onOfferSent) onOfferSent();
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1200);
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Send Offer to ${buyer.companyName}`}>
      {success ? (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-3 animate-bounce" />
          <h4 className="text-lg font-bold text-slate-100 mb-1">Offer Submitted!</h4>
          <p className="text-xs text-slate-400">
            {buyer.companyName} has been notified. Check status in My Offers tab.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-slate-800/60 rounded-xl p-3 border border-slate-700/50 text-xs">
            <div className="flex justify-between text-slate-300 mb-1">
              <span>Required Crop:</span>
              <strong className="text-emerald-400">{buyer.cropRequired}</strong>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Buyer Baseline Offer:</span>
              <strong className="text-slate-100">{formatCurrency(buyer.offerPrice)}/q</strong>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Asking Price (₹ / quintal)
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
              <input
                type="number"
                value={pricePerQuintal}
                onChange={(e) => setPricePerQuintal(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Offered Quantity (in Kg)
            </label>
            <input
              type="number"
              value={quantityKg}
              onChange={(e) => setQuantityKg(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-3 flex justify-between items-center text-xs">
            <span className="text-slate-300">Calculated Deal Total:</span>
            <span className="text-base font-extrabold text-emerald-400">
              {formatCurrency(totalValue)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Terms & Delivery Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
            ></textarea>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={sending}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Submit Official Offer'}</span>
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default SendOfferModal;
