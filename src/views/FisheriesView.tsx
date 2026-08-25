import React, { useState } from 'react';
import { UserProfile } from '../types';
import { FISHERIES_SPECIES_48 } from '../data/fisheriesSpecies';
import { POND_DEPTH_ZONES } from '../data/pondDepthMatrix';
import { WATER_QUALITY_THRESHOLDS, POND_PREP_CHECKLIST, FINGERLING_QUALITY_CHECKLIST } from '../data/fisheriesCrosscutting';
import { formatNumeral } from '../utils/numerals';
import {
  Waves,
  Search,
  Filter,
  AlertOctagon,
  Sparkles,
  Layers,
  Sliders,
  DollarSign,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Info,
  X,
  Printer,
  BookOpen
} from 'lucide-react';

interface FisheriesViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
}

export const FisheriesView: React.FC<FisheriesViewProps> = ({ profile, lang }) => {
  const [activeTab, setActiveTab] = useState<'species' | 'water' | 'stocking' | 'finance' | 'hilsa'>('species');

  // Species Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [selectedFishSpecies, setSelectedFishSpecies] = useState<any | null>(null);
  const [fishPondDecimal, setFishPondDecimal] = useState<number>(33); // 1 bigha

  const categoryLabels: Record<string, { bn: string; en: string }> = {
    All: { bn: 'All Fish', en: 'All Fish' },
    'Major Carp': { bn: 'Major Carp', en: 'Major Carp' },
    'Exotic Carp': { bn: 'Exotic Carp', en: 'Exotic Carp' },
    Catfish: { bn: 'Catfish', en: 'Catfish' },
    'Air-Breathing Catfish': { bn: 'Air-Breathing Catfish', en: 'Air-Breathing Catfish' },
    'Small Indigenous Species (SIS)': { bn: 'Small Indigenous Species', en: 'Small Indigenous Species' },
    'Brackish/Marine Farmed': { bn: 'Brackish/Marine Farmed', en: 'Brackish/Marine Farmed' },
    Crustacean: { bn: 'Crustacean', en: 'Crustacean' },
    'Marine Capture': { bn: 'Marine Capture', en: 'Marine Capture' },
    'All-Depth': { bn: 'All-Depth', en: 'All-Depth' },
  };

  const categoryOptions = Object.keys(categoryLabels);

  // Water Quality Interactive Sliders
  const [doVal, setDoVal] = useState<number>(4.5); // mg/L
  const [phVal, setPhVal] = useState<number>(7.2);
  const [ammoniaVal, setAmmoniaVal] = useState<number>(0.05); // mg/L
  const [transparencyCm, setTransparencyCm] = useState<number>(30); // cm

  // Stocking Planner Inputs
  const [pondDecimal, setPondDecimal] = useState<number>(33); // 33 decimal (1 bigha)
  const [targetProductionKg, setTargetProductionKg] = useState<number>(1200);

  // Financial Calculator Inputs
  const [feedPricePerKg, setFeedPricePerKg] = useState<number>(65); // BDT
  const [fcrValue, setFcrValue] = useState<number>(1.5);
  const [sellingPricePerKg, setSellingPricePerKg] = useState<number>(160);

  // Species Filtering
  const filteredSpecies = FISHERIES_SPECIES_48.filter((item) => {
    if (categoryFilter !== 'All' && item.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.nameEn.toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate Fingerling Count based on pond decimal
  const totalFingerlings = Math.round(pondDecimal * 100); // 100 fingerlings per decimal
  const surfaceCount = Math.round(totalFingerlings * 0.3);
  const columnCount = Math.round(totalFingerlings * 0.4);
  const bottomCount = Math.round(totalFingerlings * 0.2);
  const boundaryCount = Math.round(totalFingerlings * 0.1);

  // Calculate Fisheries Economics
  const totalFeedKg = targetProductionKg * fcrValue;
  const totalFeedCost = totalFeedKg * feedPricePerKg;
  const fingerlingCost = totalFingerlings * 5; // 5 BDT per fingerling
  const otherCosts = pondDecimal * 500; // Lime, fertilizer
  const totalOperatingCost = totalFeedCost + fingerlingCost + otherCosts;
  const totalGrossRevenue = targetProductionKg * sellingPricePerKg;
  const netOperatingProfit = totalGrossRevenue - totalOperatingCost;
  const breakEvenPrice = (totalOperatingCost / targetProductionKg).toFixed(1);
  const bcrRatio = (totalGrossRevenue / (totalOperatingCost || 1)).toFixed(2);

  return (
    <div className="space-y-6 pb-12">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-cyan-100 text-cyan-800 rounded-xl">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Fisheries & Aquaculture Hub</h2>
            <p className="text-xs text-slate-500">48 species directory, 4-layer stocking planner and water quality guide</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'species', label: '48 Species', icon: Waves },
            { id: 'water', label: 'Water Quality', icon: Sliders },
            { id: 'stocking', label: 'Pond Layer Planner', icon: Layers },
            { id: 'finance', label: 'FCR & Profit Calculator', icon: DollarSign },
            { id: 'hilsa', label: 'Hilsa & Jatka Calendar', icon: Calendar },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-800 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: 48 Species Directory */}
      {activeTab === 'species' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fish by name (e.g. Catla, Pabda...)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
              <span className="text-xs font-semibold text-slate-600">Category:</span>
              {categoryOptions.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${
                    categoryFilter === cat
                      ? 'bg-cyan-800 text-white border-cyan-800'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {categoryLabels[cat]?.en || cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSpecies.map((species) => (
              <div
                key={species.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                        {species.categoryBn}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1">{species.nameEn}</h3>
                      <p className="text-xs text-slate-500 italic">{species.scientificName}</p>
                    </div>

                    {species.isBannedSpecies && (
                      <span className="px-2 py-0.5 rounded bg-rose-600 text-white text-[10px] font-bold flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Banned
                      </span>
                    )}
                    {species.isCaptureOnly && (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold">
                        Capture Only
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{species.shortDescBn}</p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Pond Zone:</span>
                      <span className="font-bold text-slate-800">{species.pondZoneBn}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Feeding Habit:</span>
                      <span className="font-bold text-slate-800">{species.feedingHabitBn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Cultivation Type: {species.cultureTypeBn}</span>
                  <button
                    onClick={() => setSelectedFishSpecies(species)}
                    className="px-3 py-1.5 bg-cyan-800 hover:bg-cyan-900 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span>Full guidance</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: Water Quality Sliders */}
      {activeTab === 'water' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Pond Water Quality Interactive Simulator</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Dissolved Oxygen (DO): {doVal} mg/L</span>
                    <span className={doVal < 3.0 ? 'text-rose-600 font-extrabold animate-pulse' : 'text-emerald-600'}>
                      {doVal < 3.0 ? '🚨 Danger level (< 3.0)' : 'Good (5-8 mg/L)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={doVal}
                    onChange={(e) => setDoVal(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Water pH: {phVal}</span>
                    <span className={phVal < 6.5 || phVal > 8.5 ? 'text-amber-600' : 'text-emerald-600'}>
                      {phVal < 6.5 ? 'Acidic' : phVal > 8.5 ? 'Alkaline' : 'Ideal (6.5-8.5)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5.0"
                    max="10.0"
                    step="0.1"
                    value={phVal}
                    onChange={(e) => setPhVal(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span>Ammonia: {ammoniaVal} mg/L</span>
                    <span className={ammoniaVal > 0.2 ? 'text-rose-600 font-bold' : 'text-emerald-600'}>
                      {ammoniaVal > 0.2 ? 'Toxic level (> 0.2)' : 'Safe (< 0.1)'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.0"
                    max="1.0"
                    step="0.01"
                    value={ammoniaVal}
                    onChange={(e) => setAmmoniaVal(Number(e.target.value))}
                    className="w-full accent-cyan-600"
                  />
                </div>
              </div>

              {/* Remediation Action Card */}
              <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-2xl space-y-3">
                <span className="text-xs font-bold text-cyan-900 flex items-center">
                  <Sparkles className="w-4 h-4 mr-1 text-cyan-700" />
                  Emergency protocol:
                </span>

                {doVal < 3.0 ? (
                  <div className="p-3 bg-rose-100 border border-rose-300 text-rose-950 rounded-xl text-xs space-y-1 font-bold">
                    <p>🚨 Oxygen is critically low! Fish may surface at dawn.</p>
                    <p>Action: turn on an aerator or water pump immediately. Stir water with bamboo to increase oxygen. Stop feeding for 2 days.</p>
                  </div>
                ) : ammoniaVal > 0.2 ? (
                  <div className="p-3 bg-rose-100 border border-rose-300 text-rose-950 rounded-xl text-xs space-y-1 font-bold">
                    <p>⚠️ Toxic gases or ammonia are rising in the water!</p>
                    <p>Action: do not stir bottom sludge. Drain 30% water and add fresh water. Apply 1 kg zeolite per decimal.</p>
                  </div>
                ) : (
                  <p className="text-xs text-cyan-900 leading-relaxed">
                    Pond water is currently healthy. Continue daily morning observations.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Stocking Planner & 4-Layer Depth Matrix */}
      {activeTab === 'stocking' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-900 text-lg flex items-center">
                <Layers className="w-5 h-5 mr-2 text-cyan-700" />
                4-Layer Pond Stocking Plan (Polyculture Depth Matrix)
              </h3>
              <p className="text-xs text-slate-500">
                Estimate fry allocation across surface, column, bottom, and boundary zones for efficient feed use.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-xs font-bold text-slate-700">Pond area (decimal):</label>
              <input
                type="number"
                value={pondDecimal}
                onChange={(e) => setPondDecimal(Number(e.target.value) || 1)}
                className="w-full sm:w-48 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {POND_DEPTH_ZONES.map((zone, idx) => (
                <div key={idx} className="p-4 bg-cyan-50/60 border border-cyan-200 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{zone.depthZoneBn}</span>
                    <span className="px-2 py-0.5 rounded bg-cyan-700 text-white text-[10px] font-extrabold">
                      Depth: {zone.rangeMeter}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">Food: {zone.primaryFood}</p>
                  <div className="p-2 bg-white rounded-xl border border-cyan-100 text-xs font-bold text-cyan-900">
                    Recommended fry count: {
                      idx === 0 ? surfaceCount : idx === 1 ? columnCount : idx === 2 ? bottomCount : boundaryCount
                    } units ({zone.recommendedRatio}%)
                  </div>
                  <p className="text-[11px] text-slate-500">Example species: {zone.exampleSpecies.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FCR & Profitability Calculator */}
      {activeTab === 'finance' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">FCR & Pond Profitability Calculator</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feed price (BDT/kg): {feedPricePerKg} ৳</label>
                  <input
                    type="range"
                    min="40"
                    max="100"
                    value={feedPricePerKg}
                    onChange={(e) => setFeedPricePerKg(Number(e.target.value))}
                    className="w-full accent-cyan-700"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Feed FCR value: {fcrValue}
                  </label>
                  <input
                    type="range"
                    min="1.1"
                    max="2.2"
                    step="0.1"
                    value={fcrValue}
                    onChange={(e) => setFcrValue(Number(e.target.value))}
                    className="w-full accent-cyan-700"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    (kg feed needed per kg fish; lower FCR means higher profit)
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
                <div className="flex justify-between text-xs">
                  <span>Total feed cost:</span>
                  <span className="font-bold text-amber-300">{formatNumeral(totalFeedCost, 'en')} ৳</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Break-even price:</span>
                  <span className="font-bold text-amber-300">{formatNumeral(breakEvenPrice, 'en')} ৳/kg</span>
                </div>
                <div className="flex justify-between text-xs border-t border-slate-800 pt-2">
                  <span>Attractive BCR:</span>
                  <span className="font-extrabold text-emerald-400">{formatNumeral(bcrRatio, 'en')}</span>
                </div>
                <div className="p-2.5 bg-emerald-950 border border-emerald-800 rounded-xl text-xs font-bold text-emerald-300">
                  Estimated net profit: {formatNumeral(netOperatingProfit, 'en')} BDT
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Hilsa & Jatka Calendar */}
      {activeTab === 'hilsa' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b pb-3">
              <Calendar className="w-6 h-6 text-cyan-800" />
              <h3 className="font-bold text-slate-900 text-base">Hilsa preservation and Jatka ban calendar</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                <span className="px-2 py-0.5 rounded bg-rose-700 text-white text-[10px] font-extrabold">
                  Mother Hilsa preservation season
                </span>
                <h4 className="font-bold text-slate-900 text-sm">22 days of Ashwin-Kartik (October season)</h4>
                <p className="text-xs text-slate-600">
                  Fishing, transport, and storage of Hilsa are strictly prohibited during the main breeding season.
                </p>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl space-y-2">
                <span className="px-2 py-0.5 rounded bg-amber-700 text-white text-[10px] font-extrabold">
                  Jatka preservation (Jatka Ban)
                </span>
                <h4 className="font-bold text-slate-900 text-sm">1 November to 30 June (8 months)</h4>
                <p className="text-xs text-slate-600">
                  Catching Hilsa under 10 inches (25 cm) is strictly punishable by law.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL FISH CULTIVATION GUIDANCE MODAL */}
      {selectedFishSpecies && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in print-area">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-cyan-200 relative p-5 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 pr-8">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-cyan-100 text-cyan-800 text-xs font-bold rounded-full border border-cyan-200">
                    {selectedFishSpecies.categoryBn}
                  </span>
                  <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-full border border-slate-200">
                    Pond zone: {selectedFishSpecies.pondZoneBn}
                  </span>
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedFishSpecies.nameEn}</h3>
                <p className="text-xs text-slate-500 italic">{selectedFishSpecies.nameEn}</p>
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
                  onClick={() => setSelectedFishSpecies(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Description Summary */}
            <div className="bg-cyan-50 border border-cyan-200 p-4 rounded-2xl space-y-2">
              <h4 className="font-bold text-cyan-950 text-sm flex items-center">
                <Waves className="w-4 h-4 mr-1.5 text-cyan-700" />
                Fisheries cultivation guidance & feeding habits
              </h4>
              <p className="text-xs text-cyan-950 leading-relaxed">
                {selectedFishSpecies.shortDescBn}
              </p>
            </div>

            {/* Dynamic Stocking Calculator */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5 text-cyan-700" />
                    Stocking & supplemental feed preparation by pond area
                  </h4>
                  <p className="text-[11px] text-slate-500">Fry count and daily feed estimates by pond decimal:</p>
                </div>

                <div className="flex items-center space-x-2 no-print">
                  <span className="text-xs font-bold text-slate-700">Pond area:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={fishPondDecimal}
                    onChange={(e) => setFishPondDecimal(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600 font-semibold">decimal</span>
                </div>
              </div>

              {/* Stocking & Feed Calculator Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Fry stocking count</span>
                  <span className="text-sm font-black text-cyan-800 block mt-0.5">
                    {formatNumeral(Math.round(fishPondDecimal * 80), 'en')} units
                  </span>
                  <span className="text-[9px] text-slate-400">3-4 inch size</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Daily feed (grains/pellets)</span>
                  <span className="text-sm font-black text-cyan-800 block mt-0.5">
                    {formatNumeral((fishPondDecimal * 0.25).toFixed(1), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">3-5% of body weight</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Required lime</span>
                  <span className="text-sm font-black text-cyan-800 block mt-0.5">
                    {formatNumeral(Math.round(fishPondDecimal * 1), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">During pond preparation</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Potash / parasite spray</span>
                  <span className="text-sm font-black text-cyan-800 block mt-0.5">
                    {formatNumeral(Math.round(fishPondDecimal * 1.5), 'en')} g
                  </span>
                  <span className="text-[9px] text-slate-400">Once monthly in water</span>
                </div>
              </div>
            </div>

            {/* Step-by-Step SOP */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-slate-900 text-base flex items-center border-b pb-2">
                <CheckCircle2 className="w-5 h-5 mr-1.5 text-cyan-700" />
                Pond preparation and scientific fish farming practices
              </h4>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <h5 className="font-bold text-slate-900 text-xs">1. Drain and repair pond banks:</h5>
                  <p className="text-slate-600 leading-relaxed">
                    Remove excess bottom sludge deeper than 6 inches. Dry the pond and remove undesirable fish using rotenone if needed.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <h5 className="font-bold text-slate-900 text-xs">2. Apply lime and organic fertilizer for natural food production:</h5>
                  <p className="text-slate-600 leading-relaxed">
                    After 5 days of 1 kg lime per decimal, apply 5 kg cow dung, 100 g urea, and 50 g TSP per decimal. When the water turns light green (phytoplankton), it is ready for stocking.
                  </p>
                </div>

                <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <h5 className="font-bold text-slate-900 text-xs">3. Boost oxygen and prevent disease:</h5>
                  <p className="text-slate-600 leading-relaxed">
                    If fish surface in the morning, agitate the water with bamboo to increase dissolved oxygen. Reduce feeding by half on cloudy days.
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Bottom Action Footer */}
            <div className="pt-3 border-t border-slate-200 flex items-center justify-between no-print">
              <span className="text-xs text-slate-500">
                Source: Bangladesh Fisheries Research Institute (BFRI)
              </span>

              <button
                onClick={() => setSelectedFishSpecies(null)}
                className="px-5 py-2 bg-cyan-800 hover:bg-cyan-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
