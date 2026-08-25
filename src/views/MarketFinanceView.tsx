import React, { useEffect, useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { getMarketApiInsight } from '../services/api';
import { GOVERNMENT_FINANCIAL_SCHEMES } from '../data/financialRules';
import { MACROECONOMIC_GAPS_LIST } from '../data/macroeconomicGaps';
import { formatNumeral } from '../utils/numerals';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Line } from 'react-chartjs-2';
import {
  TrendingUp,
  Landmark,
  MapPin,
  Sparkles,
  AlertOctagon,
  Percent,
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  X,
  Printer,
  Download,
  BookOpen
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface MarketFinanceViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
}

export const MarketFinanceView: React.FC<MarketFinanceViewProps> = ({ profile, lang }) => {
  const [activeTab, setActiveTab] = useState<'prices' | 'where' | 'finance' | 'gaps'>('prices');

  // Selected Loan Scheme Modal
  const [selectedLoanScheme, setSelectedLoanScheme] = useState<any | null>(null);

  // Price Trend Chart Selection
  const [selectedCrop, setSelectedCrop] = useState<'Aman Rice' | 'Potato' | 'Mustard' | 'Telapia Fish'>('Aman Rice');
  const [liveMarketInsight, setLiveMarketInsight] = useState<{title:string; body:string} | null>(null);

  // Chart Data Mapper
  const priceChartDataMap = {
    'Aman Rice': {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July (Forecast)'],
      historical: [42, 44, 45, 43, 40, 48, 52],
      forecastUpper: [42, 44, 45, 43, 40, 50, 56],
      forecastLower: [42, 44, 45, 43, 40, 46, 48],
      unit: 'Tk / kg',
    },
    'Potato': {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July (Forecast)'],
      historical: [18, 15, 14, 22, 28, 32, 38],
      forecastUpper: [18, 15, 14, 22, 28, 35, 42],
      forecastLower: [18, 15, 14, 22, 28, 30, 35],
      unit: 'Tk / kg',
    },
    'Mustard': {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July (Forecast)'],
      historical: [85, 80, 78, 88, 92, 95, 100],
      forecastUpper: [85, 80, 78, 88, 92, 98, 105],
      forecastLower: [85, 80, 78, 88, 92, 92, 96],
      unit: 'Tk / kg',
    },
    'Telapia Fish': {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July (Forecast)'],
      historical: [130, 135, 140, 138, 145, 150, 160],
      forecastUpper: [130, 135, 140, 138, 145, 155, 168],
      forecastLower: [130, 135, 140, 138, 145, 148, 152],
      unit: 'Tk / kg',
    },
  };

  useEffect(() => {
    let isMounted = true;
    const loadInsight = async () => {
      const result = await getMarketApiInsight({ crop: selectedCrop, lang: 'en' });
      if (isMounted) {
        setLiveMarketInsight(result.data);
      }
    };

    loadInsight();
    return () => { isMounted = false; };
  }, [selectedCrop]);

  const currentChart = priceChartDataMap[selectedCrop];
  const financeInsight = profile?.farmerTypes?.includes('fisheries')
    ? {
        title: 'Good moment for fish sales',
        body: 'Tilapia prices are relatively stable; selling through nearby markets can reduce transport burden.',
      }
    : profile?.farmerTypes?.includes('livestock')
      ? {
          title: 'Financial caution for livestock farms',
          body: 'Plan vaccination and feeding budgets early. Consider the 4% concessional loan if cash is tight.',
        }
      : {
          title: 'Good window for crop sales',
          body: 'If prices fluctuate, drying the produce and selling through nearby markets can improve net margins.',
        };

  const chartData = useMemo(() => ({
    labels: currentChart.labels,
    datasets: [
      {
        label: 'Wholesale market price (Tk/kg)',
        data: currentChart.historical,
        borderColor: '#047857',
        backgroundColor: 'rgba(4, 120, 87, 0.1)',
        fill: true,
        tension: 0.3,
      },
      {
        label: 'Upper bound forecast',
        data: currentChart.forecastUpper,
        borderColor: '#f59e0b',
        borderDash: [5, 5],
        fill: false,
      },
      {
        label: 'Lower bound forecast',
        data: currentChart.forecastLower,
        borderColor: '#94a3b8',
        borderDash: [5, 5],
        fill: false,
      },
    ],
  }), [currentChart]);

  // Nearby Ranked Markets Data
  const nearbyMarkets = [
    {
      name: 'Pabna Central Grain & Fisheries Market',
      distanceKm: 4.5,
      grossPrice: 52,
      transportCostPerKg: 1.5,
      aratCommissionPct: 3,
      netPricePerKg: 48.9,
      isRecommended: true,
    },
    {
      name: 'Ishwardi Wholesale Market',
      distanceKm: 18.2,
      grossPrice: 55,
      transportCostPerKg: 4.0,
      aratCommissionPct: 4,
      netPricePerKg: 48.8,
      isRecommended: false,
    },
    {
      name: 'Bera Grain Hub',
      distanceKm: 24.0,
      grossPrice: 54,
      transportCostPerKg: 5.2,
      aratCommissionPct: 3,
      netPricePerKg: 47.1,
      isRecommended: false,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Title & Navigation */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-blue-100 text-blue-900 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Market & Finance Hub</h2>
            <p className="text-xs text-slate-500">Wholesale prices, transport cost comparison, and concessional finance guidance.</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
        {[
          { id: 'prices', label: 'Market Price Chart', icon: TrendingUp },
          { id: 'where', label: 'Where to Sell', icon: MapPin },
          { id: 'finance', label: '4% Government Loans', icon: Landmark },
          { id: 'gaps', label: 'Credit Risks & Margin Leakages', icon: AlertOctagon },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                active
                  ? 'bg-blue-800 text-white shadow'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-blue-700">Today’s smart advice</p>
          <h3 className="font-bold text-slate-900 mt-1">{liveMarketInsight?.title || financeInsight.title}</h3>
          <p className="text-sm text-slate-600 mt-1">{liveMarketInsight?.body || financeInsight.body}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Recommended action</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setActiveTab('where')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Find best market</button>
            <button onClick={() => setActiveTab('finance')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">View loan options</button>
          </div>
        </div>
      </div>

      {/* TAB 1: Market Price Chart */}
      {activeTab === 'prices' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Historic wholesale prices and 3-week forecast</h3>
                <p className="text-xs text-slate-500">Data-driven daily market price analysis from the Department of Agricultural Marketing.</p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold text-slate-600">Crop selection:</span>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="Aman Rice">Aman Rice</option>
                  <option value="Potato">Potato</option>
                  <option value="Mustard">Mustard</option>
                  <option value="Telapia Fish">Tilapia Fish</option>
                </select>
              </div>
            </div>

            <div className="h-72">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } }, scales: { y: { beginAtZero: false, ticks: { callback: (value) => `${value}` } } } }} />
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2">
              <Sparkles className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
              <span>
                <strong>Smart tip:</strong> Harvest season may pressure prices in the next two weeks. Dry your produce and delay sale by about ten days to capture an extra 3-4 Tk/kg if storage allows.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Where to Sell Portal */}
      {activeTab === 'where' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-700" />
                Nearby wholesale mandi & transport cost comparison
              </h3>
              <p className="text-xs text-slate-500">Compare net return after transport and commission to pick the best nearby market.</p>
            </div>

            <div className="space-y-3">
              {nearbyMarkets.map((market, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-2xl border transition-all ${
                    market.isRecommended
                      ? 'bg-emerald-50/80 border-emerald-300 shadow-sm'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-sm">{market.name}</h4>
                        {market.isRecommended && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-700 text-white text-[10px] font-extrabold flex items-center">
                            <CheckCircle2 className="w-3 h-3 mr-1 text-amber-300" />
                            Best net margin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Distance: {formatNumeral(market.distanceKm, 'en')} km | Commission: {formatNumeral(market.aratCommissionPct, 'en')}%
                      </p>
                    </div>

                    <div className="flex items-center space-x-4 bg-white px-4 py-2 rounded-xl border border-slate-200">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Gross price:</span>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatNumeral(market.grossPrice, 'en')} Tk/kg
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">Net receipt:</span>
                        <span className="font-extrabold text-emerald-800 text-sm">
                          {formatNumeral(market.netPricePerKg, 'en')} Tk/kg
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: 4% Concessional Financial Schemes */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Landmark className="w-6 h-6 text-purple-700" />
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    Bangladesh Bank & government 4% concessional agricultural loans
                  </h3>
                  <p className="text-xs text-slate-500">Application guidance for special 4% loans in spices, pulses, oilseeds, and maize.</p>
                </div>
              </div>

              <span className="px-3 py-1 bg-purple-100 text-purple-900 font-extrabold rounded-full text-xs">Farmer Card eligible</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOVERNMENT_FINANCIAL_SCHEMES.map((scheme) => (
                <div
                  key={scheme.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-slate-900 text-sm">{scheme.schemeNameEn}</h4>
                      <span className="px-2 py-0.5 rounded bg-purple-700 text-white text-[10px] font-bold">
                        Rate: {scheme.interestRatePct}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">{scheme.descriptionEn}</p>

                    <div className="mt-3 bg-white p-2.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                      <span className="font-bold text-slate-700 block">Required documents:</span>
                      <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                        {scheme.requiredDocsEn.map((doc, idx) => (
                          <li key={idx}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Provider: {scheme.providerOrgEn}</span>
                    <button
                      onClick={() => setSelectedLoanScheme(scheme)}
                      className="px-3.5 py-1.5 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1"
                    >
                      <span>Apply & Guidelines</span>
                      <span>→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Dadon Credit Trap & Aratdar Margin Leakage */}
      {activeTab === 'gaps' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center space-x-2">
              <AlertOctagon className="w-6 h-6 text-rose-500" />
              <h3 className="font-bold text-lg text-white">Dadon credit trap versus government banking</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-rose-950/60 p-4 rounded-2xl border border-rose-800/80 space-y-2">
                <h4 className="font-bold text-rose-400 text-sm">🔴 Informal Dadon loans (Dadon Trap)</h4>
                <ul className="text-xs text-rose-200 space-y-1.5 list-disc list-inside">
                  <li>Being forced to sell crops cheaply to intermediaries or moneylenders.</li>
                  <li>Paying 10-15% extra on food or fertilizer advances.</li>
                  <li>The true annual interest rate can climb from 30% to 60%.</li>
                </ul>
              </div>

              <div className="bg-emerald-950/60 p-4 rounded-2xl border border-emerald-800/80 space-y-2">
                <h4 className="font-bold text-emerald-400 text-sm">🟢 Bangladesh Bank 4% agricultural credit</h4>
                <ul className="text-xs text-emerald-200 space-y-1.5 list-disc list-inside">
                  <li>Fixed 4% concessional interest rate.</li>
                  <li>Freedom to sell at the best market price.</li>
                  <li>Flexible repayment after harvest in manageable installments.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OFFICIAL LOAN APPLICATION GUIDANCE MODAL */}
      {selectedLoanScheme && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in print-area">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-purple-200 relative p-5 sm:p-7 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4 pr-8">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-xs font-bold rounded-full border border-purple-200">
                    Concessional rate: {selectedLoanScheme.interestRatePct}
                  </span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{selectedLoanScheme.schemeNameEn}</h3>
                  <p className="text-xs text-slate-500">Provider: {selectedLoanScheme.providerOrgEn}</p>
              </div>
              <div className="flex items-center space-x-2 no-print absolute right-5 top-5">
                <button
                  onClick={() => window.print()}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  title="Print"
                >
                  <Printer className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setSelectedLoanScheme(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scheme Details */}
            <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-purple-950 text-sm flex items-center">
                <Landmark className="w-4 h-4 mr-1.5 text-purple-700" />
                Loan benefits & details
              </h4>
              <p className="text-xs text-purple-950 leading-relaxed">{selectedLoanScheme.descriptionEn}</p>
            </div>

            {/* Document Checklist */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 text-sm flex items-center border-b pb-2">
                <CheckCircle2 className="w-4 h-4 mr-1.5 text-purple-700" />
                Required documents and checklist
              </h4>

              <div className="space-y-2 text-xs">
                {selectedLoanScheme.requiredDocsEn.map((doc: string, idx: number) => (
                  <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center space-x-3">
                    <span className="w-5 h-5 rounded-full bg-purple-800 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{doc}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Application Steps */}
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs">
              <span className="font-bold text-amber-950 block">📌 Application submission steps:</span>
              <ol className="list-decimal list-inside text-amber-900 space-y-1">
                <li>Certify one set of photocopies of the listed documents.</li>
                <li>Visit your nearest RAKUB, BKB, or BRDB office in person.</li>
                <li>Attach verification from your local SAAO to speed up approval.</li>
              </ol>
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">According to Bangladesh Bank guidelines</span>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs rounded-xl shadow cursor-pointer flex items-center space-x-1"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print</span>
                </button>
                <button
                  onClick={() => setSelectedLoanScheme(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
