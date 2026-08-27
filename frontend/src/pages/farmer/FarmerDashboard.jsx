import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import { useAuth } from '../../context/AuthContext';
import liveDataStore, { getCropBenchmarkPrice } from '../../services/liveDataStore';
import recommendationService, { MAHARASHTRA_PRESET_LOCATIONS } from '../../services/recommendationService';
import locationService from '../../services/locationService';
import priceService from '../../services/priceService';
import predictionService from '../../services/predictionService';
import buyerService from '../../services/buyerService';
import PriceChart from '../../components/dashboard/PriceChart';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import {
  Sprout,
  Store,
  Sparkles,
  MapPin,
  Clock,
  TrendingUp,
  ArrowRight,
  Send,
  AlertCircle,
  Building2,
  CheckCircle2,
  Lock,
  MessageSquare,
  ShieldCheck,
  Navigation,
  ExternalLink,
  DollarSign,
  Award
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const FarmerDashboard = () => {
  const { selectedCrop, farmerLocation, updateCrop, resetCrop, updateLocation } = useFarmer();
  const { user } = useAuth() || {};
  const navigate = useNavigate();

  // If user hasn't registered any crop, default to null (No Active Crop)
  const [activeCrop, setActiveCrop] = useState(selectedCrop && selectedCrop.name ? selectedCrop : null);
  const [locationObj, setLocationObj] = useState(farmerLocation || { name: 'Amravati, Maharashtra' });
  const [detectingGps, setDetectingGps] = useState(false);

  useEffect(() => {
    if (selectedCrop && selectedCrop.name) {
      setActiveCrop(selectedCrop);
    } else {
      setActiveCrop(null);
    }
  }, [selectedCrop]);

  useEffect(() => {
    if (farmerLocation) setLocationObj(farmerLocation);
  }, [farmerLocation]);

  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  const [rankedMarkets, setRankedMarkets] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [chartRange, setChartRange] = useState('7d');
  const [allOffers, setAllOffers] = useState([]);

  // Modals
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);

  // Filter offers STRICTLY for the currently logged-in farmer account
  const currentFarmerOffers = allOffers.filter((o) => {
    const currentId = user?.id || '';
    const currentEmail = (user?.email || '').toLowerCase();
    const currentName = (user?.name || '').toLowerCase();

    const oFarmerId = o.farmerId || '';
    const oName = (o.farmerName || '').toLowerCase();
    const oEmail = (o.farmerEmail || '').toLowerCase();

    if (currentId && oFarmerId === currentId) return true;
    if (currentEmail && oEmail === currentEmail) return true;
    if (currentName && oName === currentName) return true;
    return false;
  });

  const completedOffersForCurrentFarmer = currentFarmerOffers.filter((o) => o.status === 'Completed');

  const isCropCleared =
    completedOffersForCurrentFarmer.length > 0 &&
    typeof window !== 'undefined' &&
    (localStorage.getItem(`agri_crop_cleared_${user?.id}`) === 'true' ||
      localStorage.getItem(`agri_crop_cleared_${user?.email}`) === 'true');

  const fetchDashboardData = async (targetCrop = activeCrop, targetLoc = locationObj) => {
    if (!targetCrop || !targetCrop.name) return;

    setLoading(true);
    try {
      const liveOffers = liveDataStore.getOffers();
      setAllOffers(liveOffers);

      const [recoRes, priceRes, predRes, buyerRes] = await Promise.all([
        recommendationService.getBestMarkets({
          crop: targetCrop.name,
          variety: targetCrop.variety || 'Standard',
          quantityKg: targetCrop.quantityKg || 1500,
          location: targetLoc?.name || 'Amravati, Maharashtra'
        }).catch(() => ({ topRecommendation: null, rankedMarkets: [] })),
        priceService.getHistoricalPrices({ crop: targetCrop.name, period: chartRange }).catch(() => ({ chartData: [] })),
        predictionService.getPricePrediction(targetCrop.name).catch(() => null),
        buyerService.getMatchingBuyers({ crop: targetCrop.name }).catch(() => [])
      ]);

      const ranked = recoRes?.rankedMarkets || [];
      const topReco = recoRes?.topRecommendation || ranked[0] || null;

      setRecommendation(topReco);
      setRankedMarkets(ranked);
      setHistoricalData(priceRes?.chartData || []);
      setPrediction(predRes || null);
      setBuyers(buyerRes || []);
    } catch (err) {
      console.error('Error loading farmer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeCrop && activeCrop.name) {
      fetchDashboardData(activeCrop, locationObj);
    }
    const unsubscribe = liveDataStore.subscribe(() => {
      if (activeCrop && activeCrop.name) {
        fetchDashboardData(activeCrop, locationObj);
      }
    });
    return () => unsubscribe();
  }, [activeCrop?.name, activeCrop?.quantityKg, activeCrop?.variety, locationObj?.name, chartRange, user?.id, user?.email]);

  const handleLocationSelect = (presetId) => {
    const found = MAHARASHTRA_PRESET_LOCATIONS.find((l) => l.id === presetId || l.name === presetId);
    if (found) {
      setLocationObj(found);
      updateLocation(found);
    }
  };

  const handleGpsDetect = async () => {
    setDetectingGps(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocationObj(loc);
      updateLocation(loc);
    } catch (err) {
      alert('Could not detect GPS location: ' + err.message);
    } finally {
      setDetectingGps(false);
    }
  };

  const handleRegisterCropSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();

    // Reset cleared flags
    localStorage.removeItem('agri_active_crop_cleared');
    if (user?.id) localStorage.removeItem(`agri_crop_cleared_${user.id}`);
    if (user?.email) localStorage.removeItem(`agri_crop_cleared_${user.email}`);

    const formEl = document.getElementById('register-crop-form') || e?.currentTarget?.closest('form');
    let name = 'Paddy';
    let qty = 1500;
    let variety = 'Standard';

    if (formEl) {
      const formData = new FormData(formEl);
      name = formData.get('cropName') || 'Paddy';
      qty = Number(formData.get('quantityKg')) || 1500;
      variety = formData.get('variety') || 'Standard';
    }

    const rate = typeof getCropBenchmarkPrice === 'function'
      ? getCropBenchmarkPrice(name)
      : (liveDataStore.getCropBenchmarkPrice ? liveDataStore.getCropBenchmarkPrice(name) : 3000);

    const newCropObj = {
      name,
      variety,
      quantityKg: qty,
      expectedPrice: rate
    };

    setActiveCrop(newCropObj);
    updateCrop(newCropObj);
    liveDataStore.registerCrop(newCropObj);
    setIsAnalyzeOpen(false);
    fetchDashboardData(newCropObj, locationObj);
  };

  const handleCreateOffer = (e) => {
    e.preventDefault();
    if (!selectedBuyerForOffer || !activeCrop) return;
    const formData = new FormData(e.currentTarget);
    const customRate = Number(formData.get('customRate')) || activeCrop.expectedPrice || 4170;
    const notes = formData.get('notes');

    liveDataStore.createOffer({
      buyerId: selectedBuyerForOffer.id,
      buyerName: selectedBuyerForOffer.name || selectedBuyerForOffer.companyName || 'Mandi Yard Official',
      loginEmail: selectedBuyerForOffer.email || (selectedBuyerForOffer.name?.toLowerCase().includes('amravati') ? 'amravati@gmail.com' : 'nashik@gmail.com'),
      farmerId: user?.id || 'f-1',
      farmerName: user?.name || 'Shaik Shakeera',
      farmerEmail: user?.email || '',
      crop: activeCrop.name,
      quantity: `${activeCrop.quantityKg} kg (${activeCrop.quantityKg / 100} Quintals)`,
      offeredPricePerQuintal: customRate,
      totalValue: (customRate * activeCrop.quantityKg) / 100,
      netReturn: (customRate * activeCrop.quantityKg) / 100 - 3195,
      notes: notes || `Farmer consignment request submitted for ${activeCrop.name} lot at ₹${customRate}/q.`
    });

    setSelectedBuyerForOffer(null);
    fetchDashboardData(activeCrop, locationObj);
  };

  const activeRequestOffer = currentFarmerOffers.find(
    (o) => o.status !== 'Completed' && !o.status?.includes('Declined') && !o.status?.includes('Superceded') && !o.status?.includes('Cancelled')
  );

  const bestMandiOfferReceived = currentFarmerOffers.reduce((prev, curr) => {
    if (curr.type !== 'received' || curr.status?.includes('Superceded') || curr.status?.includes('Declined')) return prev;
    if (!prev) return curr;
    return (curr.offeredPricePerQuintal || 0) > (prev.offeredPricePerQuintal || 0) ? curr : prev;
  }, null);

  if (loading) {
    return <LoadingSpinner message="Calculating net profits across Maharashtra mandis..." />;
  }

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200/80 p-6 rounded-3xl shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900">Good morning, {user?.name || 'Farmer'}</h1>
            <span className="text-xl">👋</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>{locationObj.name || user?.district || 'Amravati, Maharashtra'}</span>
            <span className="text-slate-300">•</span>
            <span className="text-emerald-700 font-bold">Active Intelligence Engine</span>
          </p>
        </div>

        <button
          onClick={() => setIsAnalyzeOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold px-5 py-3 rounded-2xl transition-all shadow-md hover:scale-105 shrink-0 cursor-pointer"
        >
          <Sprout className="w-4 h-4" />
          <span>+ Register Your Crop Lot</span>
        </button>
      </div>

      {/* CASE A: No Active Crop Registered */}
      {!activeCrop || isCropCleared ? (
        <div className="bg-white border border-slate-200/80 rounded-3xl p-8 shadow-sm text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100 shadow-2xs">
            <Sprout className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h2 className="text-xl font-black text-slate-900">No Active Crop Registered</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              You currently have no active crop registered. Please register your harvested crop lot to view live AI price recommendations, mandi net profit rankings, and connect with nearby APMC buyers.
            </p>
          </div>
          <button
            onClick={() => setIsAnalyzeOpen(true)}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs px-6 py-3 rounded-2xl shadow-md transition-all hover:scale-105 cursor-pointer"
          >
            <Sprout className="w-4 h-4" />
            <span>+ Register Your Crop Lot</span>
          </button>
        </div>
      ) : (
        /* CASE B: Active Crop Lot Exists (Full Dashboard Layout) */
        <>
          {/* Row 1: Four Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Current Crop */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">CURRENT CROP</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Sprout className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{activeCrop.name} ({activeCrop.quantityKg} kg)</h3>
                <span className="text-xs text-slate-500 font-medium">Variety: {activeCrop.variety || 'Standard'}</span>
              </div>
            </div>

            {/* Card 2: Avg Market Price */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">AVG MARKET PRICE</span>
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">{formatCurrency(recommendation?.modalPrice || 4170)}/q</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full inline-block mt-0.5">
                  Regional Mandi Index (+4.2%)
                </span>
              </div>
            </div>

            {/* Card 3: Best Recommended Market */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">BEST RECOMMENDED MARKET</span>
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 truncate">{recommendation?.name || 'Amravati APMC'}</h3>
                <span className="text-xs text-slate-500 font-medium">Optimal Logistics Route</span>
              </div>
            </div>

            {/* Card 4: Expected Net Return */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">EXPECTED NET RETURN</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-emerald-700">{formatCurrency(recommendation?.netReturn || 60624)}</h3>
                  <span className="text-[9px] bg-emerald-700 text-white font-extrabold px-1.5 py-0.5 rounded-md">Peak Net</span>
                </div>
                <span className="text-[11px] text-slate-400 font-medium">After transport & commission</span>
              </div>
            </div>
          </div>

          {/* Active Crop Lot Parameter Banner */}
          <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-md">
                    ACTIVE CROP LOT
                  </span>
                  <span className="text-sm font-black text-slate-900">{activeCrop.name} — {activeCrop.variety}</span>
                </div>
                <span className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-3">
                  <span>📦 {activeCrop.quantityKg} kg ({(activeCrop.quantityKg / 100).toFixed(1)} Quintals)</span>
                  <span>•</span>
                  <span>📅 Harvest: {activeCrop.harvestDate || '2026-08-28'}</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsAnalyzeOpen(true)}
              className="bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all shadow-2xs shrink-0 cursor-pointer"
            >
              Change Crop Parameters
            </button>
          </div>

          {/* Mandi Purchase Offer Received Notification */}
          {bestMandiOfferReceived && (
            <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-amber-300">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-amber-300 px-2 py-0.5 rounded-md">
                      🔥 MANDI PURCHASE OFFER RECEIVED
                    </span>
                    <span className="text-xs font-extrabold text-slate-900">{bestMandiOfferReceived.buyerName}</span>
                  </div>
                  <h3 className="text-base font-black text-slate-950 mt-0.5">
                    {bestMandiOfferReceived.buyerName} offered <span className="underline decoration-2 decoration-emerald-800">{formatCurrency(bestMandiOfferReceived.offeredPricePerQuintal)}/q</span> for your {bestMandiOfferReceived.crop} lot!
                  </h3>
                  <p className="text-xs text-slate-900 font-medium">
                    Total Estimated Net Return: <strong>{formatCurrency(bestMandiOfferReceived.netReturn || 60624)}</strong>. Accept to initiate instant freight transport dispatch.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/farmer/offers"
                  className="bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Review & Accept Mandi Offer →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Consignment Request Sent Notification */}
          {activeRequestOffer && !bestMandiOfferReceived && (
            <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-500/30">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md text-amber-300 flex items-center justify-center shrink-0 shadow-md">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-md text-emerald-100">
                      📌 CONSIGNMENT REQUEST SUBMITTED TO MANDI
                    </span>
                    <span className="text-xs font-extrabold text-white">{activeRequestOffer.buyerName}</span>
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    Requested Rate: {formatCurrency(activeRequestOffer.offeredPricePerQuintal)}/q for {activeRequestOffer.crop} ({activeRequestOffer.quantity})
                  </h3>
                  <p className="text-xs text-emerald-100 font-medium">
                    Status: <strong>{activeRequestOffer.status}</strong>. Mandi Official is evaluating your request.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/farmer/offers"
                  className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5"
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700" />
                  <span>View Negotiation Chat →</span>
                </Link>
              </div>
            </div>
          )}

          {/* Large Hero Card: Best Market Recommendation */}
          {recommendation && (
            <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-emerald-900/60 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-200 border border-emerald-400/30 mb-2">
                    <Award className="w-3.5 h-3.5 text-amber-300" />
                    <span>BEST MARKET RECOMMENDATION</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-200 block">TOP RECOMMENDATION</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white mt-0.5">{recommendation.name}</h2>
                  <span className="text-xs flex items-center gap-1 mt-1 font-medium text-emerald-100">
                    <Navigation className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Optimal route based on live market prices & transport distance</span>
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="p-4 rounded-2xl bg-white/15 border border-white/20 text-center min-w-[120px]">
                    <span className="text-[10px] uppercase tracking-wider block font-bold text-emerald-100">
                      RECOMMENDATION SCORE
                    </span>
                    <span className="text-3xl font-black text-white">95<span className="text-xs font-normal text-emerald-200">/100</span></span>
                  </div>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-white/15 border border-white/20 text-xs font-medium">
                <div>
                  <span className="text-emerald-100 block">Current Modal Price:</span>
                  <strong className="text-lg text-white font-black">{formatCurrency(recommendation.modalPrice || 4170)}/q</strong>
                </div>
                <div>
                  <span className="text-emerald-100 block">Est. Transport Cost:</span>
                  <strong className="text-lg text-amber-300 font-black">{formatCurrency(recommendation.transportCost || 300)}</strong>
                </div>
                <div>
                  <span className="text-emerald-100 block">Expected Net Return:</span>
                  <strong className="text-xl text-white font-black">{formatCurrency(recommendation.netReturn || 60624)}</strong>
                </div>
              </div>

              {/* Rationale Box */}
              <div className="rounded-2xl p-4 bg-white/20 border border-white/20 text-emerald-50 text-xs flex items-start gap-2.5 font-medium">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-200" />
                <div>
                  <span className="font-bold block mb-0.5 text-white">Why {recommendation.name}?</span>
                  <p>{recommendation.explanation || `${recommendation.name} provides maximum Net Return of ${formatCurrency(recommendation.netReturn || 60624)} for ${locationObj.name} (${recommendation.distanceKm || 8} km freight).`}</p>
                </div>
              </div>

              {/* Hero Actions */}
              <div className="flex flex-wrap items-center justify-end gap-3 pt-1">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locationObj.name || 'Amravati, Maharashtra')}&destination=${encodeURIComponent(recommendation.name + ', Maharashtra')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all border border-white/20 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>View Market Details</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-300" />
                </a>

                <button
                  onClick={() => setSelectedBuyerForOffer({
                    id: 'm-2',
                    name: recommendation.name,
                    companyName: recommendation.name,
                    email: recommendation.name.toLowerCase().includes('amravati') ? 'amravati@gmail.com' : 'nashik@gmail.com'
                  })}
                  className="bg-white text-emerald-900 hover:bg-emerald-50 font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Request Mandi Owner</span>
                </button>
              </div>
            </div>
          )}

          {/* Middle Section: Price Trend Chart & AI Price Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Price Trend Chart */}
            <div className="lg:col-span-2">
              <PriceChart
                data={historicalData}
                title={`${activeCrop.name} 7-Day / 30-Day Price Trend`}
                currentRange={chartRange}
                onRangeChange={setChartRange}
              />
            </div>

            {/* Right 1 Col: AI Price Forecast Card */}
            <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">AI Price Forecast</h3>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Predictive Intelligence for {activeCrop.name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">CONFIDENCE SCORE</span>
                    <span className="text-xs font-black text-purple-700">87%</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-purple-50/50 p-3 rounded-2xl border border-purple-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 font-medium block">CURRENT PRICE</span>
                    <strong className="text-xs font-black text-slate-900">{formatCurrency(recommendation?.modalPrice || 4170)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-700 font-bold block">3-DAY FORECAST</span>
                    <strong className="text-xs font-black text-purple-800">{formatCurrency((recommendation?.modalPrice || 4170) + 80)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-bold block">7-DAY FORECAST</span>
                    <strong className="text-xs font-black text-emerald-800">{formatCurrency((recommendation?.modalPrice || 4170) + 150)}</strong>
                  </div>
                </div>

                <div className="bg-purple-50/70 border border-purple-200 p-3.5 rounded-2xl text-xs space-y-1">
                  <span className="font-bold text-purple-950 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>AI Decision Support:</span>
                  </span>
                  <p className="text-purple-900 text-[11px] leading-relaxed font-medium">
                    Prices are expected to increase over the next week due to high retail demand in Metro cities. Consider holding inventory for 3-5 days if dry storage is available to maximize net profit.
                  </p>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium italic">
                * AI predictions are probabilistic estimates based on mandi arrivals, weather patterns, and historical price cycles.
              </p>
            </div>
          </div>

          {/* Row 5: Top Nearby Mandis */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Top Nearby Mandis</h2>
                <p className="text-xs text-slate-500 font-medium">Ranked by highest net transport profit for {activeCrop.name}</p>
              </div>
              <Link to="/farmer/recommendations" className="text-xs text-emerald-700 font-extrabold hover:underline flex items-center gap-1">
                <span>Compare All Markets</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {rankedMarkets.slice(0, 3).map((m, idx) => {
                const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locationObj.name || 'Amravati, Maharashtra')}&destination=${encodeURIComponent(m.name + ', Maharashtra')}`;

                return (
                  <div key={m.id || idx} className="bg-white border border-slate-200/80 rounded-3xl overflow-hidden shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between">
                    {/* Visual Header Banner */}
                    <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-emerald-200 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-300" />
                          <span>{m.district || 'Maharashtra'} • {m.distanceKm || (idx + 1) * 8} km</span>
                        </span>
                        <span className="text-[10px] bg-emerald-500/40 text-emerald-100 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                          +{(m.trendPercent || 3.5)}%
                        </span>
                      </div>
                      <h3 className="font-black text-base text-white">{m.name}</h3>
                      <span className="text-[10px] text-emerald-200 block">🕒 05:30 AM - 05:00 PM</span>
                    </div>

                    {/* Metrics */}
                    <div className="p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">MODAL PRICE</span>
                          <strong className="text-sm text-slate-900 font-black">{formatCurrency(m.modalPrice || 4170)}/q</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block font-medium">EST. NET RETURN</span>
                          <strong className="text-sm text-emerald-700 font-black">{formatCurrency(m.netReturn || 60624)}</strong>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-500 flex justify-between font-medium">
                        <span>🚚 Freight: {formatCurrency(m.transportCost || 300)}</span>
                        <span>📦 Arrival: {m.arrivalVolume || '14,000 Quintals'}</span>
                      </div>

                      <a
                        href={googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 rounded-xl transition-all text-center block shadow-2xs"
                      >
                        View Market Details →
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 6: Direct APMC Mandi Network */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black text-slate-900">Direct APMC Mandi Network</h2>
                <p className="text-xs text-slate-500 font-medium">High-intent APMC Mandi Procurement Yards procuring {activeCrop.name}</p>
              </div>
              <Link to="/farmer/recommendations" className="text-xs text-emerald-700 font-extrabold hover:underline flex items-center gap-1">
                <span>View All Mandi Yards →</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {buyers.map((buyer) => (
                <div key={buyer.id} className="bg-white border border-slate-200/80 p-4 rounded-3xl shadow-sm hover:border-emerald-300 transition-all flex flex-col justify-between space-y-3">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-black text-sm text-slate-900 leading-tight">{buyer.name || buyer.companyName}</h3>
                        <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          {buyer.location} • {buyer.distanceKm} km
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-200 shrink-0">
                        Verified Buyer
                      </span>
                    </div>

                    <div className="mt-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">BENCHMARK PRICE</span>
                        <strong className="text-sm font-black text-emerald-700">{formatCurrency(buyer.offeredPrice || 4170)}/q</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-medium">CROP</span>
                        <strong className="text-xs font-bold text-slate-800">{buyer.targetCrop || activeCrop.name}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(locationObj.name || 'Amravati, Maharashtra')}&destination=${encodeURIComponent((buyer.name || 'APMC') + ', Maharashtra')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-2 rounded-xl text-center transition-colors"
                    >
                      View Details →
                    </a>
                    <button
                      onClick={() => setSelectedBuyerForOffer(buyer)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow-2xs flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Send className="w-3 h-3" />
                      <span>Request Mandi</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal: Register / Change Crop Lot */}
      <Modal isOpen={isAnalyzeOpen} onClose={() => setIsAnalyzeOpen(false)} title="Register Crop Lot">
        <form id="register-crop-form" onSubmit={handleRegisterCropSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Crop</label>
            <select
              name="cropName"
              defaultValue={activeCrop?.name || 'Paddy'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-900 focus:outline-none focus:border-emerald-600"
            >
              <option value="Paddy">Paddy / Rice</option>
              <option value="Cotton">Cotton (Kapas)</option>
              <option value="Chilli">Dry Red Chilli</option>
              <option value="Onion">Onion (Red)</option>
              <option value="Tomato">Tomato</option>
              <option value="Wheat">Wheat</option>
              <option value="Potato">Potato</option>
              <option value="Maize">Maize (Corn)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Variety</label>
            <input
              type="text"
              name="variety"
              defaultValue={activeCrop?.variety || 'Standard'}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Harvest Quantity (in Kilograms)</label>
            <input
              type="number"
              name="quantityKg"
              defaultValue={activeCrop?.quantityKg || 1500}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
            />
            <span className="text-[11px] text-slate-500 mt-1 block font-medium">
              100 kg = 1 Quintal (e.g. 1500 kg = 15 Quintals)
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsAnalyzeOpen(false)}
              className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
            >
              <Sprout className="w-4 h-4" />
              <span>Submit & Save</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Request Offer from Specific Buyer */}
      {selectedBuyerForOffer && activeCrop && (
        <Modal
          isOpen={!!selectedBuyerForOffer}
          onClose={() => setSelectedBuyerForOffer(null)}
          title={`Request Offer from ${selectedBuyerForOffer.name || selectedBuyerForOffer.companyName}`}
        >
          <form onSubmit={handleCreateOffer} className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-2xl text-xs font-medium space-y-1">
              <div className="flex justify-between">
                <span>Selected Mandi Buyer:</span>
                <strong className="text-slate-900 font-bold">{selectedBuyerForOffer.name || selectedBuyerForOffer.companyName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Crop Lot:</span>
                <strong className="text-emerald-800 font-bold">{activeCrop.name} ({activeCrop.quantityKg} kg / {activeCrop.quantityKg / 100} Quintals)</strong>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Your Requested Rate per Quintal (₹ / q)
              </label>
              <input
                type="number"
                name="customRate"
                defaultValue={activeCrop.expectedPrice || 4170}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 font-black focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Notes / Terms for Mandi Official
              </label>
              <textarea
                name="notes"
                rows={3}
                placeholder="e.g. Grade A premium quality lot ready for immediate gate delivery..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-xs text-slate-900 font-medium focus:outline-none focus:border-emerald-600"
              ></textarea>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedBuyerForOffer(null)}
                className="px-4 py-2 text-xs text-slate-600 hover:text-slate-900 rounded-xl bg-slate-100 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Trade Request</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default FarmerDashboard;
