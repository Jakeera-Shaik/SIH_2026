import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useFarmer } from '../../context/FarmerContext';
import { useAuth } from '../../context/AuthContext';
import marketService from '../../services/marketService';
import priceService from '../../services/priceService';
import recommendationService from '../../services/recommendationService';
import predictionService from '../../services/predictionService';
import buyerService from '../../services/buyerService';

import DashboardCard from '../../components/dashboard/DashboardCard';
import MarketCard from '../../components/dashboard/MarketCard';
import BuyerCard from '../../components/dashboard/BuyerCard';
import RecommendationCard from '../../components/dashboard/RecommendationCard';
import PriceChart from '../../components/dashboard/PriceChart';
import PredictionCard from '../../components/dashboard/PredictionCard';
import AnalyzeCropModal from '../../components/modals/AnalyzeCropModal';
import SendOfferModal from '../../components/modals/SendOfferModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';

import { Sprout, MapPin, Sparkles, Scale, Calendar, ArrowRight, Layers } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const { selectedCrop, farmerLocation } = useFarmer();

  const [loading, setLoading] = useState(true);
  const [topMarkets, setTopMarkets] = useState([]);
  const [historicalData, setHistoricalData] = useState([]);
  const [recommendation, setRecommendation] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [buyers, setBuyers] = useState([]);
  const [chartRange, setChartRange] = useState('7d');

  // Modals
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [selectedBuyerForOffer, setSelectedBuyerForOffer] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [marketsRes, priceRes, recoRes, predRes, buyerRes] = await Promise.all([
        marketService.getTopMarkets(3),
        priceService.getHistoricalPrices({ crop: selectedCrop.name, period: chartRange }),
        recommendationService.getBestMarkets({ quantityKg: selectedCrop.quantityKg }),
        predictionService.getPricePrediction(selectedCrop.name),
        buyerService.getMatchingBuyers({ crop: selectedCrop.name })
      ]);

      setTopMarkets(marketsRes);
      setHistoricalData(priceRes.chartData);
      setRecommendation(recoRes.topRecommendation);
      setPrediction(predRes);
      setBuyers(buyerRes);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedCrop, chartRange]);

  if (loading) {
    return <LoadingSpinner message="Calculating optimal market intelligence..." />;
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 flex items-center gap-2">
            <span>Good morning, {user?.name || 'Farmer'}</span>
            <span className="text-2xl">👋</span>
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{farmerLocation.name}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400 font-semibold">Active Intelligence Engine</span>
          </div>
        </div>

        <button
          onClick={() => setIsAnalyzeOpen(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-900/30 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Analyze My Crop</span>
        </button>
      </div>

      {/* Summary Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <DashboardCard
          title="Current Crop"
          value={`${selectedCrop.name} (${selectedCrop.quantityKg} kg)`}
          subtitle={`Variety: ${selectedCrop.variety}`}
          icon={Sprout}
        />
        <DashboardCard
          title="Avg Market Price"
          value="₹3,200/q"
          subtitle="Regional Mandi Index"
          icon={Layers}
          trend="up"
          trendText="+4.2%"
        />
        <DashboardCard
          title="Best Recommended Market"
          value={recommendation?.marketName || 'Nashik APMC'}
          subtitle="Optimal Logistics Route"
          icon={MapPin}
        />
        <DashboardCard
          title="Expected Net Return"
          value={formatCurrency(recommendation?.estimatedNetReturn || 30800)}
          subtitle="After transport & commission"
          icon={Sparkles}
          trend="up"
          trendText="Peak Net"
        />
      </div>

      {/* Section A: Current Crop Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            <Sprout className="w-8 h-8" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-emerald-400 font-bold">Active Crop Lot</div>
            <h3 className="text-xl font-bold text-slate-100 mt-0.5">
              {selectedCrop.name} — <span className="text-emerald-400">{selectedCrop.variety}</span>
            </h3>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-1">
              <span className="flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-slate-500" />
                Quantity: <strong>{selectedCrop.quantityKg} kg ({selectedCrop.quantityKg / 100} Quintals)</strong>
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                Harvest Date: <strong>{selectedCrop.harvestDate}</strong>
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsAnalyzeOpen(true)}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-700 transition-colors"
        >
          Change Crop Parameters
        </button>
      </div>

      {/* Section E: Best Market Recommendation (Highlighted Card) */}
      <RecommendationCard recommendation={recommendation} />

      {/* Grid: Section C Price Chart & Section D AI Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <PriceChart
            data={historicalData}
            title={`${selectedCrop.name} 7-Day / 30-Day Price Trend`}
            currentRange={chartRange}
            onRangeChange={(r) => setChartRange(r)}
          />
        </div>

        <div>
          <PredictionCard prediction={prediction} />
        </div>
      </div>

      {/* Section B: Market Snapshot */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Top Nearby Mandis</h3>
            <p className="text-xs text-slate-400">Comparing headline price vs. net transport profit</p>
          </div>

          <Link
            to="/farmer/markets"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <span>Compare All Markets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {topMarkets.map((market) => (
            <MarketCard key={market.id} market={market} />
          ))}
        </div>
      </div>

      {/* Section F: Buyer Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-slate-100">Direct Buyer Matches</h3>
            <p className="text-xs text-slate-400">High-intent corporate buyers matching your crop grade</p>
          </div>

          <Link
            to="/farmer/buyers"
            className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 hover:underline"
          >
            <span>View Marketplace</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {buyers.map((buyer) => (
            <BuyerCard
              key={buyer.id}
              buyer={buyer}
              onSendOffer={(b) => setSelectedBuyerForOffer(b)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      <AnalyzeCropModal
        isOpen={isAnalyzeOpen}
        onClose={() => setIsAnalyzeOpen(false)}
        onAnalyze={() => fetchDashboardData()}
      />

      <SendOfferModal
        isOpen={!!selectedBuyerForOffer}
        onClose={() => setSelectedBuyerForOffer(null)}
        buyer={selectedBuyerForOffer}
        onOfferSent={() => fetchDashboardData()}
      />
    </div>
  );
};

export default FarmerDashboard;
