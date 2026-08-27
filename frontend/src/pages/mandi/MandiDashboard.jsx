import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import liveDataStore from '../../services/liveDataStore';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { calculateCropProfit } from '../../utils/profitEngine';
import { ShieldCheck, MapPin, CheckCircle2, XCircle, MessageSquare, Send, DollarSign, Clock, Truck, Sprout, UserCheck, Phone, Scale, DollarSign as CashIcon, AlertCircle, Inbox } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const MandiDashboard = () => {
  const { user } = useAuth() || {};

  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [matchingFarmers, setMatchingFarmers] = useState([]);
  const [openChatOfferId, setOpenChatOfferId] = useState(null);
  const [chatInput, setChatInput] = useState('');
  const [paymentModalOffer, setPaymentModalOffer] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState(21673);

  // Send Offer to Farmer Modal
  const [selectedFarmerForOffer, setSelectedFarmerForOffer] = useState(null);
  const [offeredRatePerQuintal, setOfferedRatePerQuintal] = useState(6900);
  const [offerMessage, setOfferMessage] = useState('');
  const [sendingBuyerOffer, setSendingBuyerOffer] = useState(false);

  // Rejection Modal with Reason
  const [rejectModalOffer, setRejectModalOffer] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const mandiName = user?.companyName || user?.name || 'Nashik APMC (Dindori Road)';

  const fetchMandiData = () => {
    setLoading(true);
    try {
      const allOffers = liveDataStore.getOffers();
      const farmerCrops = liveDataStore.getMatchingFarmersForBuyer();

      const currentEmail = (user?.email || '').toLowerCase();
      const currentName = (user?.companyName || user?.name || '').toLowerCase();
      const emailPrefix = currentEmail.split('@')[0];

      // Filter offers visible to this Mandi Official
      const mandiOffers = allOffers.filter((o) => {
        const oName = (o.buyerName || '').toLowerCase();
        const oEmail = (o.loginEmail || '').toLowerCase();

        // 1. Direct match by email or company name
        if (emailPrefix && (oEmail.includes(emailPrefix) || oName.includes(emailPrefix))) {
          return true;
        }
        if (currentName && (oName.includes(currentName) || currentName.includes(oName))) {
          return true;
        }
        // 2. Open consignment requests submitted by farmers in Maharashtra
        if (!oEmail || oEmail === 'all' || o.buyerId === 'mandi-all' || o.buyerId === 'b-1' || oName.includes('mandi') || oName.includes('official') || oName.includes('nashik') || oName.includes('amravati')) {
          return true;
        }
        // 3. Any active farmer trade offer
        if (o.farmerName || o.farmerId) {
          return true;
        }
        return false;
      });

      setOffers(mandiOffers);
      setMatchingFarmers(farmerCrops);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandiData();
    const unsubscribe = liveDataStore.subscribe(() => {
      fetchMandiData();
    });
    return () => unsubscribe();
  }, [user?.email, user?.companyName]);

  const handleAcceptByMandi = (offerId) => {
    liveDataStore.acceptOfferByBuyer(offerId);
    fetchMandiData();
  };

  const handleOpenRejectModal = (offer) => {
    setRejectModalOffer(offer);
    setRejectionReason(`Requested price of ₹${offer.offeredPricePerQuintal}/q exceeds APMC procurement budget for Grade A ${offer.crop}.`);
  };

  const handleConfirmRejectionWithReason = () => {
    if (!rejectModalOffer) return;
    liveDataStore.rejectOfferWithReason(rejectModalOffer.id, rejectionReason);
    setRejectModalOffer(null);
    fetchMandiData();
  };

  const handleCompleteAndPay = () => {
    if (!paymentModalOffer) return;
    liveDataStore.completeOfferAndPay(paymentModalOffer.id, Number(payoutAmount));
    setPaymentModalOffer(null);
    fetchMandiData();
  };

  const handleSendMessage = (offerId) => {
    if (!chatInput.trim()) return;
    liveDataStore.addOfferMessage(offerId, `${mandiName} Official`, 'mandi', chatInput.trim());
    setChatInput('');
    fetchMandiData();
  };

  const handleSendOfferToFarmer = (e) => {
    e.preventDefault();
    if (!selectedFarmerForOffer) return;
    setSendingBuyerOffer(true);
    try {
      const rawKg = selectedFarmerForOffer.quantityKg || 1500;
      const fin = calculateCropProfit({
        quantityKg: rawKg,
        modalPrice: Number(offeredRatePerQuintal),
        distanceKm: selectedFarmerForOffer.distanceKm || 15
      });

      liveDataStore.createOfferFromBuyer({
        buyerName: mandiName,
        loginEmail: user?.email || 'nashik@gmail.com',
        farmerId: selectedFarmerForOffer.id,
        farmerName: selectedFarmerForOffer.name,
        crop: selectedFarmerForOffer.crop,
        quantity: `${rawKg} kg (${(rawKg / 100).toFixed(1)} Quintals)`,
        offeredPricePerQuintal: Number(offeredRatePerQuintal),
        totalValue: fin.grossRevenue,
        netReturn: fin.netReturn,
        notes: offerMessage || `${mandiName} Official issued purchase offer for your ${selectedFarmerForOffer.crop} lot at ₹${offeredRatePerQuintal}/q.`
      });

      setSelectedFarmerForOffer(null);
      fetchMandiData();
    } finally {
      setSendingBuyerOffer(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading APMC Mandi consignment management..." />;
  }

  const activeCount = offers.filter((o) => o.status !== 'Completed' && o.status !== 'Declined' && !o.status?.includes('Declined')).length;
  const completedCount = offers.filter((o) => o.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-emerald-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 mb-2 border border-white/20">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Government APMC Regulated Yard Official Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{mandiName}</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-emerald-100 mt-2 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              Logged-in Official: <strong>{user?.email || 'nashik@gmail.com'}</strong>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-300" />
              Gate Hours: <strong>05:00 AM - 06:00 PM</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-white/15 backdrop-blur-md p-4 rounded-2xl border border-white/20 shrink-0">
          <div>
            <div className="text-[10px] text-emerald-100 uppercase font-bold">Active Consignments</div>
            <div className="text-2xl font-black text-white">{activeCount} Lots</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/40 border border-emerald-300 flex items-center justify-center font-bold text-white text-sm">
            Live
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Active Consignments</span>
          <span className="text-2xl font-black text-slate-900">{activeCount}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Live procurement bids</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Daily Yard Arrival</span>
          <span className="text-2xl font-black text-emerald-700">18,500 q</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">APMC Daily Volume</span>
        </div>

        <div className="bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm">
          <span className="text-xs text-slate-500 font-bold uppercase block">Completed Trades</span>
          <span className="text-2xl font-black text-slate-900">{completedCount}</span>
          <span className="text-[11px] text-slate-400 block mt-0.5">Paid & Released</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-xs text-emerald-800 font-bold uppercase block">Escrow Payout Fund</span>
          <span className="text-2xl font-black text-emerald-700">₹4.8 Lakhs</span>
          <span className="text-[11px] text-slate-600 block mt-0.5">Guaranteed settlement</span>
        </div>
      </div>

      {/* Available Farmers Nearby Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Available Farmers Nearby (Registered Active Crops)</span>
            </h2>
            <p className="text-xs text-slate-500 font-medium">Discover active farmers in your region selling crop lots at custom farmer expected rates and issue direct purchase offers.</p>
          </div>
        </div>

        {matchingFarmers.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center space-y-1 shadow-2xs">
            <p className="text-xs font-bold text-slate-800">No active farmers registered nearby yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {matchingFarmers.map((farmer) => {
              const fin = calculateCropProfit({
                quantityKg: farmer.quantityKg || 1500,
                modalPrice: farmer.expectedPrice || 6900,
                distanceKm: farmer.distanceKm || 15
              });

              // Check if this Mandi has an active offer or request for this farmer
              const existingBuyerOffer = offers.find((o) =>
                (o.farmerName === farmer.name || o.farmerId === farmer.id) &&
                o.crop?.toLowerCase().includes(farmer.crop.toLowerCase()) &&
                o.status !== 'Completed' &&
                !o.status?.includes('Declined') &&
                !o.status?.includes('Cancelled')
              );

              const isAcceptedStatus = existingBuyerOffer?.status?.includes('Accepted') || existingBuyerOffer?.status?.includes('Transit') || existingBuyerOffer?.status?.includes('Dispatched');

              // Distinguish who initiated the offer/request:
              const isMandiAcceptedFarmerRequest = isAcceptedStatus && (existingBuyerOffer?.type === 'sent' || existingBuyerOffer?.farmerId);
              const isFarmerAcceptedMandiOffer = isAcceptedStatus && (existingBuyerOffer?.type === 'received');
              const isFarmerInitiatedPending = !isAcceptedStatus && (existingBuyerOffer?.type === 'sent' || existingBuyerOffer?.status === 'Sent');

              return (
                <div key={farmer.id} className={`bg-white border rounded-2xl p-4 shadow-2xs flex flex-col justify-between space-y-3 transition-all ${
                  isAcceptedStatus ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10' : isFarmerInitiatedPending ? 'border-indigo-400 ring-2 ring-indigo-400/20 bg-indigo-50/10' : 'border-slate-200/80'
                }`}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-black text-slate-900">{farmer.name}</span>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full">
                          Verified Farmer
                        </span>
                        {isMandiAcceptedFarmerRequest ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>✓ Request Accepted by You (Awaiting Delivery)</span>
                          </span>
                        ) : isFarmerAcceptedMandiOffer ? (
                          <span className="text-[10px] bg-emerald-100 text-emerald-950 font-black px-2.5 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>✓ Offer Accepted by Farmer (In Transit)</span>
                          </span>
                        ) : isFarmerInitiatedPending ? (
                          <span className="text-[10px] bg-indigo-100 text-indigo-950 font-black px-2.5 py-0.5 rounded-full border border-indigo-300 flex items-center gap-1 shadow-2xs">
                            <Inbox className="w-3 h-3 text-indigo-600" />
                            <span>📌 Farmer Requested Your Mandi ({formatCurrency(existingBuyerOffer.offeredPricePerQuintal)}/q)</span>
                          </span>
                        ) : existingBuyerOffer ? (
                          <span className="text-[10px] bg-amber-100 text-amber-900 font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                            ✓ Offer Issued ({formatCurrency(existingBuyerOffer.offeredPricePerQuintal)}/q)
                          </span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{farmer.location} • {farmer.distanceKm} km away</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">Farmer Expected Rate</span>
                      <span className="text-base font-black text-emerald-700">{formatCurrency(farmer.expectedPrice)}/q</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 font-medium block">Crop Lot:</span>
                      <strong className="text-slate-900 font-bold">{farmer.crop} ({farmer.variety})</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 font-medium block">Available Quantity:</span>
                      <strong className="text-slate-900 font-bold">{farmer.availableQty}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-emerald-800 font-bold">
                      Est. Payout: {formatCurrency(existingBuyerOffer ? (existingBuyerOffer.netReturn || fin.netReturn) : fin.netReturn)}
                    </span>

                    {isAcceptedStatus ? (
                      <button
                        onClick={() => {
                          setPaymentModalOffer(existingBuyerOffer);
                          setPayoutAmount(existingBuyerOffer.netReturn || fin.netReturn);
                        }}
                        className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 animate-pulse cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4 text-white" />
                        <span>✓ Trade Accepted! Confirm Delivery & Pay</span>
                      </button>
                    ) : isFarmerInitiatedPending ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAcceptByMandi(existingBuyerOffer.id)}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-3 py-1.5 rounded-xl transition-all shadow-md flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          <span>Accept Request</span>
                        </button>
                        <button
                          onClick={() => handleOpenRejectModal(existingBuyerOffer)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3 py-1.5 rounded-xl border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : existingBuyerOffer ? (
                      <button
                        disabled
                        className="bg-amber-50 text-amber-900 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-amber-200 cursor-default flex items-center gap-1.5 shadow-2xs"
                      >
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>✓ Offer Issued (Awaiting Farmer Approval)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedFarmerForOffer(farmer);
                          setOfferedRatePerQuintal(farmer.expectedPrice || 6900);
                          setOfferMessage(`Hello ${farmer.name}, ${mandiName} wants to purchase your ${farmer.crop} lot (${farmer.availableQty}) at ₹${farmer.expectedPrice || 6900}/q. Escrow payment guaranteed upon gate entry.`);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Purchase Offer to Farmer</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Consignment Negotiations & Requests Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Trade Consignments & Negotiations for {mandiName}</h2>
            <p className="text-xs text-slate-500 font-medium">Review farmer requested rates, accept if agreed, or reject by providing an explicit reason.</p>
          </div>
        </div>

        {offers.length === 0 ? (
          <EmptyState
            title={`No active trade offers for ${mandiName}`}
            description="Issued purchase offers and incoming farmer requests will display here in real time."
          />
        ) : (
          <div className="space-y-4">
            {offers.map((offer) => {
              const isChatOpen = openChatOfferId === offer.id;
              const isAccepted = offer.status?.includes('Accepted') || offer.status?.includes('Logistics') || offer.status?.includes('Transit');
              const isCompleted = offer.status === 'Completed';
              const isDeclined = offer.status?.includes('Declined');

              const rawKg = parseInt(String(offer.quantity || '1000')) || 1000;
              const fin = calculateCropProfit({
                quantityKg: rawKg,
                modalPrice: offer.offeredPricePerQuintal || 6900,
                distanceKm: 25
              });

              return (
                <div key={offer.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4 transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-slate-900 text-base flex items-center gap-1.5">
                          <Sprout className="w-4 h-4 text-emerald-600" />
                          <span>Farmer: {offer.farmerName}</span>
                        </h3>
                        <StatusBadge status={offer.status} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                        <span>Crop Lot: <strong className="text-slate-900">{offer.crop}</strong></span>
                        <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong> ({fin.quintals} Quintals)</span>
                        <span>Offered Rate: <strong className="text-emerald-700 text-sm font-black">{formatCurrency(offer.offeredPricePerQuintal)}/q</strong></span>
                      </div>
                      {offer.notes && (
                        <p className="text-xs text-slate-600 font-medium mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {offer.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCompleted ? (
                        <span className="bg-emerald-100 text-emerald-950 font-black text-xs px-3.5 py-2 rounded-xl border border-emerald-300 flex items-center gap-1.5 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>✓ Paid & Settled</span>
                        </span>
                      ) : isDeclined ? (
                        <span className="bg-rose-100 text-rose-900 font-bold text-xs px-3.5 py-2 rounded-xl border border-rose-200 flex items-center gap-1.5">
                          <XCircle className="w-4 h-4 text-rose-600" />
                          <span>Declined</span>
                        </span>
                      ) : isAccepted ? (
                        <button
                          onClick={() => {
                            setPaymentModalOffer(offer);
                            setPayoutAmount(offer.netReturn || fin.netReturn);
                          }}
                          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 animate-pulse cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          <span>✓ Trade Accepted! Confirm Delivery & Pay</span>
                        </button>
                      ) : offer.type === 'sent' || offer.farmerId ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleAcceptByMandi(offer.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4 text-white" />
                            <span>Accept Request</span>
                          </button>
                          <button
                            onClick={() => handleOpenRejectModal(offer)}
                            className="bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-rose-200 transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4 text-rose-600" />
                            <span>Reject with Reason</span>
                          </button>
                        </div>
                      ) : (
                        <span className="bg-amber-50 text-amber-900 font-extrabold text-xs px-3.5 py-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>Offer Issued (Awaiting Farmer)</span>
                        </span>
                      )}

                      <button
                        onClick={() => setOpenChatOfferId(isChatOpen ? null : offer.id)}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-slate-600" />
                        <span>Chat ({offer.discussion?.length || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Negotiation Chat Box */}
                  {isChatOpen && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-3">
                      <h4 className="font-extrabold text-xs text-slate-800 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Live Counter-Offer & Negotiation Chat Thread</span>
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto p-2 bg-white rounded-xl border border-slate-200/80 text-xs">
                        {offer.discussion?.map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2.5 rounded-xl text-xs max-w-md ${
                              msg.senderRole === 'mandi' || msg.senderRole === 'buyer'
                                ? 'bg-emerald-50 border border-emerald-200 ml-auto text-emerald-950 font-medium'
                                : 'bg-slate-100 border border-slate-200 text-slate-900 font-medium'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold mb-1">
                              <span>{msg.senderName}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      {!isCompleted && !isDeclined && (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Type counter offer or payment note..."
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-emerald-600"
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(offer.id)}
                          />
                          <button
                            onClick={() => handleSendMessage(offer.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Send</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Rejection Reason */}
      {rejectModalOffer && (
        <Modal
          isOpen={!!rejectModalOffer}
          onClose={() => setRejectModalOffer(null)}
          title={`Reject Farmer Consignment Request — ${rejectModalOffer.farmerName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-2xl flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Mandatory Rejection Explanation</strong>
                <p className="text-[11px] text-rose-800">
                  Please provide a specific reason so farmer <strong>{rejectModalOffer.farmerName}</strong> understands why their requested rate of <strong>{formatCurrency(rejectModalOffer.offeredPricePerQuintal)}/q</strong> for {rejectModalOffer.crop} cannot be matched.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason (Sent to Farmer Portal)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-bold focus:outline-none focus:border-rose-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOffer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRejectionWithReason}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <XCircle className="w-4 h-4" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal: Send Purchase Offer to Farmer */}
      {selectedFarmerForOffer && (
        <Modal
          isOpen={!!selectedFarmerForOffer}
          onClose={() => setSelectedFarmerForOffer(null)}
          title={`Send Purchase Offer to ${selectedFarmerForOffer.name}`}
        >
          <form onSubmit={handleSendOfferToFarmer} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-medium space-y-1">
              <div className="flex justify-between">
                <span>Selected Farmer:</span>
                <strong className="text-slate-900 font-bold">{selectedFarmerForOffer.name}</strong>
              </div>
              <div className="flex justify-between">
                <span>Crop Lot:</span>
                <strong className="text-emerald-800 font-bold">{selectedFarmerForOffer.crop} ({selectedFarmerForOffer.availableQty})</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Offered Purchase Rate per Quintal (₹ / q)
              </label>
              <input
                type="number"
                value={offeredRatePerQuintal}
                onChange={(e) => setOfferedRatePerQuintal(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-black focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Official Message / Instructions for Farmer
              </label>
              <textarea
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedFarmerForOffer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={sendingBuyerOffer}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingBuyerOffer ? 'Sending...' : 'Send Official Mandi Offer'}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal: Gate Entry & Payment Confirmation */}
      {paymentModalOffer && (
        <Modal
          isOpen={!!paymentModalOffer}
          onClose={() => setPaymentModalOffer(null)}
          title="Confirm Gate Delivery & Release Escrow Payment"
        >
          <div className="space-y-4 text-xs">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
              <h4 className="font-extrabold text-emerald-950 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Government Mandi Gate Entry & Inspection Verified</span>
              </h4>
              <div className="space-y-1 text-emerald-900">
                <div className="flex justify-between">
                  <span>Farmer Name:</span>
                  <strong className="font-bold">{paymentModalOffer.farmerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Crop Lot:</span>
                  <strong className="font-bold">{paymentModalOffer.crop} ({paymentModalOffer.quantity})</strong>
                </div>
                <div className="flex justify-between">
                  <span>Agreed Price per Quintal:</span>
                  <strong className="font-bold">{formatCurrency(paymentModalOffer.offeredPricePerQuintal)}/q</strong>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Final Net Payout Amount to Release to Farmer Bank Account (₹)
              </label>
              <input
                type="number"
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-base text-slate-900 font-black focus:outline-none focus:border-emerald-600"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Includes deduction for freight distance fare & APMC handling fee.
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPaymentModalOffer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteAndPay}
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
              >
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Confirm Delivery & Release Payment</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MandiDashboard;
