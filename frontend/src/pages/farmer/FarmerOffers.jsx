import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import liveDataStore from '../../services/liveDataStore';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import {
  Building2,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Send,
  Sparkles,
  TrendingUp,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const FarmerOffers = () => {
  const { user } = useAuth() || {};
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState('received'); // 'received' | 'sent' | 'accepted' | 'completed'
  const [openChatOfferId, setOpenChatOfferId] = useState(null);
  const [chatInput, setChatInput] = useState('');

  // Counter offer modal
  const [counterModalOffer, setCounterModalOffer] = useState(null);
  const [counterPrice, setCounterPrice] = useState(6900);

  const fetchOffers = () => {
    setLoading(true);
    try {
      const data = liveDataStore.getOffers();
      const currentId = user?.id || '';
      const currentEmail = (user?.email || '').toLowerCase();
      const currentName = (user?.name || '').toLowerCase();

      // Filter offers strictly belonging to this logged-in farmer account
      const myOffers = data.filter((o) => {
        const oFarmerId = o.farmerId || '';
        const oName = (o.farmerName || '').toLowerCase();
        const oEmail = (o.farmerEmail || '').toLowerCase();

        if (currentId && oFarmerId === currentId) return true;
        if (currentEmail && oEmail === currentEmail) return true;
        if (currentName && oName === currentName) return true;
        return false;
      });

      setOffers(myOffers);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
    const unsubscribe = liveDataStore.subscribe(() => {
      fetchOffers();
    });
    return () => unsubscribe();
  }, [user?.id, user?.email, user?.name]);

  const handleAcceptOffer = (offerId) => {
    liveDataStore.acceptOfferAndCancelOthers(offerId);
    fetchOffers();
  };

  const handleCancelRequest = (offerId) => {
    liveDataStore.cancelOfferByFarmer(offerId);
    fetchOffers();
  };

  const handleSendMessage = (offerId) => {
    if (!chatInput.trim()) return;
    liveDataStore.addOfferMessage(offerId, user?.name || 'Farmer', 'farmer', chatInput.trim());
    setChatInput('');
    fetchOffers();
  };

  const handleSubmitCounterOffer = (e) => {
    e.preventDefault();
    if (!counterModalOffer) return;
    liveDataStore.addOfferMessage(
      counterModalOffer.id,
      user?.name || 'Farmer',
      'farmer',
      `Farmer Counter Offer: Requesting ₹${counterPrice}/q for ${counterModalOffer.crop} lot.`
    );
    setCounterModalOffer(null);
    fetchOffers();
  };

  if (loading) {
    return <LoadingSpinner message="Loading your trade offers and mandi bids..." />;
  }

  // Find if there is an outbidding higher offer from another Mandi
  const bestReceivedOffer = offers.reduce((prev, curr) => {
    if (curr.type !== 'received' || curr.status?.includes('Superceded') || curr.status?.includes('Declined')) return prev;
    if (!prev) return curr;
    return (curr.offeredPricePerQuintal || 0) > (prev.offeredPricePerQuintal || 0) ? curr : prev;
  }, null);

  const receivedOffers = offers.filter((o) => o.type === 'received' && o.status !== 'Completed' && !o.status?.includes('Accepted'));

  const sentOffers = offers.filter(
    (o) => (o.type === 'sent' || o.status === 'Sent' || o.status?.includes('Declined')) && o.status !== 'Completed' && !o.status?.includes('Accepted') && !o.status?.includes('Superceded') && !o.status?.includes('Cancelled')
  );

  const acceptedOffers = offers.filter(
    (o) => o.status?.includes('Accepted') || o.status?.includes('Transit') || o.status?.includes('Dispatched')
  );

  const completedOffers = offers.filter((o) => o.status === 'Completed');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30">
        <div>
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-emerald-100 mb-2 border border-white/20">
            <Building2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Direct Mandi Trade Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Trade Offers & Negotiations</h1>
          <p className="text-xs text-emerald-100 mt-1 font-medium">Manage your requested rates, incoming Mandi purchase bids, Mandi responses, and transit dispatches.</p>
        </div>

        {bestReceivedOffer && (
          <div className="bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950 p-4 rounded-2xl shadow-lg border border-amber-300 shrink-0 max-w-xs">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-900 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-slate-900 animate-bounce" />
              <span>🔥 Highest Mandi Offer Received</span>
            </div>
            <div className="text-base font-black text-slate-950">{bestReceivedOffer.buyerName}</div>
            <div className="text-lg font-black text-emerald-950 flex items-baseline gap-1 mt-0.5">
              <span>{formatCurrency(bestReceivedOffer.offeredPricePerQuintal)}</span>
              <span className="text-xs font-bold text-slate-800">/q</span>
            </div>
            <button
              onClick={() => handleAcceptOffer(bestReceivedOffer.id)}
              className="mt-2 w-full py-1.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs font-black transition-all shadow-md flex items-center justify-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Accept Higher Offer & Cancel Previous</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 max-w-xl">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'received'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>Received Mandi Offers</span>
          <span className="bg-emerald-800 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
            {receivedOffers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('sent')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'sent'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>Sent Requests & Responses</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">
            {sentOffers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('accepted')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'accepted'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>Accepted</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-black">
            {acceptedOffers.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
          }`}
        >
          <span>Completed</span>
          <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-black">
            {completedOffers.length}
          </span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'received' && (
        <div className="space-y-4">
          {receivedOffers.length === 0 ? (
            <EmptyState
              title="No incoming Mandi purchase offers yet"
              description="When a nearby APMC Mandi Official issues a purchase offer for your registered crop lot, it will appear here instantly."
            />
          ) : (
            receivedOffers.map((offer) => {
              const isChatOpen = openChatOfferId === offer.id;

              return (
                <div key={offer.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Mandi Yard: {offer.buyerName}</span>
                        </span>
                        <StatusBadge status={offer.status || 'Offer Received'} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                        <span>Crop Lot: <strong className="text-slate-900">{offer.crop}</strong></span>
                        <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong></span>
                        <span>Offered Rate: <strong className="text-emerald-700 text-sm font-black">{formatCurrency(offer.offeredPricePerQuintal)}/q</strong></span>
                      </div>
                      {offer.notes && (
                        <p className="text-xs text-slate-600 font-medium mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          {offer.notes}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:items-end gap-3 shrink-0">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Expected Net Payout</span>
                        <span className="text-2xl font-black text-emerald-700">{formatCurrency(offer.netReturn || offer.totalValue || 48922)}</span>
                        <span className="text-[10px] text-slate-400 block">Gross: {formatCurrency(offer.totalValue || 51400)} ({formatCurrency(offer.offeredPricePerQuintal)}/q)</span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => setOpenChatOfferId(isChatOpen ? null : offer.id)}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Chat ({offer.discussion?.length || 0})</span>
                        </button>

                        <button
                          onClick={() => {
                            setCounterModalOffer(offer);
                            setCounterPrice(offer.offeredPricePerQuintal || 6900);
                          }}
                          className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                        >
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Counter Price</span>
                        </button>

                        <button
                          onClick={() => handleAcceptOffer(offer.id)}
                          className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Accept Offer & Proceed</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation Chat Drawer */}
                  {isChatOpen && (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 pt-3">
                      <div className="text-xs font-bold text-slate-700 flex items-center justify-between border-b border-slate-200 pb-2">
                        <span>Online Consignment Negotiation with {offer.buyerName}</span>
                        <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">Real-time Connected</span>
                      </div>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {(offer.discussion || []).map((msg) => (
                          <div
                            key={msg.id}
                            className={`p-2.5 rounded-xl text-xs max-w-md ${
                              msg.senderRole === 'farmer'
                                ? 'bg-emerald-600 text-white ml-auto text-right'
                                : 'bg-white border border-slate-200 text-slate-800 mr-auto'
                            }`}
                          >
                            <div className="text-[10px] font-bold opacity-80 mb-0.5">{msg.senderName} ({msg.timestamp})</div>
                            <p>{msg.text}</p>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(offer.id)}
                          placeholder="Type counter price or negotiation query..."
                          className="flex-1 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600 font-medium"
                        />
                        <button
                          onClick={() => handleSendMessage(offer.id)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1 transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'sent' && (
        <div className="space-y-4">
          {sentOffers.length === 0 ? (
            <EmptyState
              title="No pending requests submitted"
              description="Consignment requests you submit to APMC Mandis will display here."
            />
          ) : (
            sentOffers.map((offer) => {
              const isDeclined = offer.status?.includes('Declined');
              return (
                <div key={offer.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 text-emerald-600" />
                          <span>Mandi Yard: {offer.buyerName}</span>
                        </span>
                        <StatusBadge status={offer.status || 'Pending Mandi Approval'} />
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                        <span>Crop Lot: <strong className="text-slate-900">{offer.crop}</strong></span>
                        <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong></span>
                        <span>Your Requested Rate: <strong className="text-emerald-700 text-sm font-black">{formatCurrency(offer.offeredPricePerQuintal)}/q</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block font-bold uppercase">Estimated Net Return</span>
                        <span className="text-xl font-black text-emerald-700">{formatCurrency(offer.netReturn || offer.totalValue || 100605)}</span>
                      </div>

                      {!isDeclined && (
                        <button
                          onClick={() => handleCancelRequest(offer.id)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl transition-colors"
                        >
                          Cancel Request
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Explicit Mandi Rejection Explanation Notice Banner */}
                  {isDeclined && (
                    <div className="bg-red-50 border border-red-200 p-3.5 rounded-2xl flex items-start gap-2 text-xs text-red-900 font-medium mt-2">
                      <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <div>
                        <strong className="block font-bold text-red-950 text-sm">Request Declined by {offer.buyerName} Official:</strong>
                        <p className="mt-1 leading-relaxed text-red-900">{offer.rejectionReason || offer.notes || 'Requested price exceeds APMC baseline budget for this commodity.'}</p>
                        <span className="text-[11px] text-red-700 block mt-1 font-semibold">Tip: You can submit a new request or accept an alternative Mandi purchase offer.</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'accepted' && (
        <div className="space-y-4">
          {acceptedOffers.length === 0 ? (
            <EmptyState
              title="No active accepted consignments"
              description="Accepted deals awaiting freight dispatch and gate entry will display here."
            />
          ) : (
            acceptedOffers.map((offer) => (
              <div key={offer.id} className="bg-white border-2 border-emerald-500 rounded-3xl p-5 shadow-md space-y-3 bg-emerald-50/10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Mandi Yard: {offer.buyerName}</span>
                      </span>
                      <StatusBadge status={offer.status || 'Accepted'} />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                      <span>Crop Lot: <strong className="text-slate-900">{offer.crop}</strong></span>
                      <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong></span>
                      <span>Agreed Rate: <strong className="text-emerald-700 text-sm font-black">{formatCurrency(offer.offeredPricePerQuintal)}/q</strong></span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block font-bold uppercase">Confirmed Escrow Net Payout</span>
                    <span className="text-2xl font-black text-emerald-700">{formatCurrency(offer.netReturn || offer.totalValue || 48922)}</span>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-between gap-2 text-xs text-emerald-900 font-medium">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>2-Day Commitment Window:</strong> Trade deal accepted for <strong>{offer.buyerName}</strong>! Please dispatch freight transport to complete yard gate weighment and release payout within 2 days.</span>
                  </div>
                  <button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold px-4 py-2 rounded-xl text-xs shrink-0 shadow-xs flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-white" />
                    <span>Dispatch Freight Transport</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'completed' && (
        <div className="space-y-4">
          {completedOffers.length === 0 ? (
            <EmptyState
              title="No completed deals yet"
              description="Deals that have undergone gate weighment and payment settlement will appear here."
            />
          ) : (
            completedOffers.map((offer) => (
              <div key={offer.id} className="bg-white border border-slate-200/80 rounded-3xl p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-black text-slate-900 flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        <span>Mandi Yard: {offer.buyerName}</span>
                      </span>
                      <StatusBadge status="Completed" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium mt-1">
                      <span>Crop Lot: <strong className="text-slate-900">{offer.crop}</strong></span>
                      <span>Quantity: <strong className="text-slate-900">{offer.quantity}</strong></span>
                      <span>Your Requested Rate: <strong className="text-emerald-700 font-bold">{formatCurrency(offer.offeredPricePerQuintal)}/q</strong></span>
                    </div>
                    {offer.notes && (
                      <p className="text-xs text-slate-600 font-medium mt-2 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        {offer.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 block font-bold uppercase">Expected Net Payout</span>
                      <span className="text-2xl font-black text-emerald-700">{formatCurrency(offer.netReturn || offer.totalValue || 48922)}</span>
                      <span className="text-[10px] text-slate-400 block">Gross: {formatCurrency(offer.totalValue || 51400)} ({formatCurrency(offer.offeredPricePerQuintal)}/q)</span>
                    </div>

                    <button
                      onClick={() => setOpenChatOfferId(openChatOfferId === offer.id ? null : offer.id)}
                      className="inline-flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Chat ({offer.discussion?.length || 0})</span>
                    </button>
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center gap-2 text-xs text-emerald-800 font-bold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Deal Completed! {formatCurrency(offer.paidAmount || offer.netReturn || offer.totalValue || 48922)} released to your bank account for {offer.quantity} of {offer.crop}.</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal: Counter Price */}
      {counterModalOffer && (
        <Modal
          isOpen={!!counterModalOffer}
          onClose={() => setCounterModalOffer(null)}
          title={`Submit Counter Offer to ${counterModalOffer.buyerName}`}
        >
          <form onSubmit={handleSubmitCounterOffer} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-medium space-y-1">
              <div className="flex justify-between">
                <span>Mandi Offered Rate:</span>
                <strong className="font-bold text-slate-900">{formatCurrency(counterModalOffer.offeredPricePerQuintal)}/q</strong>
              </div>
              <div className="flex justify-between">
                <span>Crop Lot:</span>
                <strong className="font-bold text-slate-900">{counterModalOffer.crop} ({counterModalOffer.quantity})</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Counter Rate per Quintal (₹ / q)
              </label>
              <input
                type="number"
                value={counterPrice}
                onChange={(e) => setCounterPrice(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-black focus:outline-none focus:border-emerald-600 focus:bg-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCounterModalOffer(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Counter Offer</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FarmerOffers;
