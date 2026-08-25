import React, { useState } from 'react';
import { UserProfile, CropItem, CropRotationLog, ExtendedCropItem } from '../types';
import { CROP_DATABASE } from '../data/cropReference';
import { BANGLADESH_AEZ_ZONES } from '../data/aezZones';
import { formatNumeral } from '../utils/numerals';
import { saveRotationLog, getStoredRotationLogs } from '../utils/storage';
import { CropCycleEngine } from '../components/CropCycleEngine';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Line, Radar } from 'react-chartjs-2';
import {
  Sprout,
  Camera,
  Layers,
  Sparkles,
  Search,
  CheckCircle,
  AlertTriangle,
  Droplets,
  BookmarkPlus,
  RefreshCw,
  Clock,
  Zap,
  Info,
  X,
  Printer,
  BookOpen,
  ShieldCheck,
  DollarSign,
  Calendar
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale);

interface CropAdvisoryViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onRequireCameraPermission: (cb: () => void) => void;
}

export const CropAdvisoryView: React.FC<CropAdvisoryViewProps> = ({
  profile,
  lang,
  onRequireCameraPermission,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'recommend' | 'soil' | 'rotation' | 'scanner' | 'irrigation'>('recommend');

  const seasonFilterToEn: Record<'All' | 'Rabi' | 'Kharif-1' | 'Kharif-2', string[]> = {
    All: ['Rabi', 'Kharif-I', 'Kharif-II'],
    Rabi: ['Rabi'],
    'Kharif-1': ['Kharif-I'],
    'Kharif-2': ['Kharif-II'],
  };

  const matchesSeasonFilter = (crop: CropItem) => {
    if (seasonFilter === 'All') return true;
    return seasonFilterToEn[seasonFilter].some((value) => crop.typicalSeasonEn.includes(value));
  };

  // Recommendation Engine State
  const [seasonFilter, setSeasonFilter] = useState<'Rabi' | 'Kharif-1' | 'Kharif-2' | 'All'>('All');
  const [loanOnlyFilter, setLoanOnlyFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Rotation Planner State
  const [shallowCrop, setShallowCrop] = useState('Leafy greens / spinach');
  const [mediumCrop, setMediumCrop] = useState('Aman rice');
  const [deepCrop, setDeepCrop] = useState('Mung bean');
  const [rotationLogs, setRotationLogs] = useState<CropRotationLog[]>(getStoredRotationLogs());

  // Scanner State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanError, setScanError] = useState('');

  // Selected Crop Modal for Full Guidance
  const [selectedCropGuidance, setSelectedCropGuidance] = useState<ExtendedCropItem | null>(null);
  const [guidanceLandArea, setGuidanceLandArea] = useState<number>(33); // 33 decimal (1 bigha) default

  // Soil Test Inputs
  const [nitrogenVal, setNitrogenVal] = useState(120); // kg/ha
  const [phosVal, setPhosVal] = useState(25); // kg/ha
  const [potassVal, setPotassVal] = useState(45); // kg/ha
  const [phVal, setPhVal] = useState(6.5);

  // AEZ matched info
  const matchedAez = BANGLADESH_AEZ_ZONES.find((z) => z.aezCode === (profile?.aezCode || 'AEZ-11')) || BANGLADESH_AEZ_ZONES[0];

  const recommendationSummary = profile?.farmerTypes?.includes('livestock')
    ? {
        title: 'Start with animal care',
        body: 'Prioritize livestock health and vaccination reminders for your farm plan.',
      }
    : profile?.farmerTypes?.includes('fisheries')
      ? {
          title: 'Start with pond management',
          body: 'Review water quality, stocking, and feeding plan first.',
        }
      : {
          title: 'Start with crop decisions',
          body: 'Match your soil, season, and loan options to choose the best crop today.',
        };

  const integratedFarmAdvice = {
    title: 'Integrated Farm Focus',
    points: [
      'See crops, livestock, and fish together — balance soil, irrigation, disease, and market signals for the best farm decision.',
      'Season filters now match crop season labels correctly so Kharif-I, Kharif-II, and Rabi categories work as expected.',
      'The AI disease scanner now enriches results with the Groq API to deliver more realistic responses.',
    ],
  };

  // Filter Crops
  const filteredCrops = CROP_DATABASE.filter((crop) => {
    if (!matchesSeasonFilter(crop)) return false;
    if (loanOnlyFilter && !crop.concessionalLoan4Pct) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return crop.nameEn.toLowerCase().includes(q);
    }
    return true;
  });

  // Camera Capture Handler
  const handleImageCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setScanResult(null);
        setScanError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRunAiScanner = async () => {
    if (!selectedImage) return;

    setIsScanning(true);
    setScanError('');
    setScanResult(null);

    try {
      // Send base64 image to server proxy
      const base64Data = selectedImage.split(',')[1];
      const res = await fetch('/api/disease-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, mimeType: 'image/jpeg', lang: 'en' }),
      });

      const data = await res.json();
      const resultObj = data.diagnosis || data;
      if (res.ok && resultObj && (resultObj.diseaseNameEn || resultObj.topDiagnosis)) {
        setScanResult({
          diseaseNameEn: resultObj.diseaseNameEn || resultObj.topDiagnosis || 'Crop Disease',
          severity: resultObj.severity || 'Medium',
          chemicalTreatmentEn: resultObj.chemicalTreatmentEn || 'Follow local agricultural advisor recommendations for chemical treatment.',
          organicTreatmentEn: resultObj.organicTreatmentEn || 'Use neem leaf extract or ash for organic disease control.',
          preventiveStepsEn: resultObj.preventiveStepsEn || 'Keep the field clean and inspect crops regularly for early symptoms.',
        });
      } else {
        setScanError(data.error || 'Disease scan failed. Please try again.');
      }
    } catch (e) {
      console.error(e);
      setScanError('Unable to reach the server. Check your network connection.');
    } finally {
      setIsScanning(false);
    }
  };

  // Rotation Safety Score Calculation
  const calculateRotationSafety = () => {
    let score = 85;
    let warning = 'Excellent rotation! Legume crops like mung bean will enrich soil nitrogen.';
    let status: 'safe' | 'moderate' | 'depleting' = 'safe';

    if (shallowCrop.toLowerCase().includes('rice') && mediumCrop.toLowerCase().includes('rice')) {
      score = 40;
      status = 'depleting';
      warning = '⚠️ Consecutive rice crops can deplete zinc and sulfur and raise pest pressure.';
    } else if (!deepCrop.toLowerCase().includes('bean') && !deepCrop.toLowerCase().includes('pulse') && !deepCrop.toLowerCase().includes('lentil')) {
      score = 65;
      status = 'moderate';
      warning = 'Moderate rotation. Add a deep-rooted legume crop to restore nitrogen in deeper soil layers.';
    }

    return { score, warning, status };
  };

  const rotationEval = calculateRotationSafety();

  const handleSaveRotation = () => {
    const newLog: CropRotationLog = {
      id: 'rot_' + Date.now(),
      shallowCrop,
      mediumCrop,
      deepCrop,
      safetyScore: rotationEval.score,
      notesBn: rotationEval.warning,
      notesEn: rotationEval.warning,
      dateCreated: new Date().toLocaleDateString('en-US'),
    };
    const updated = saveRotationLog(newLog);
    setRotationLogs(updated);
  };

  // Radar Chart for Soil Health
  const soilRadarData = {
    labels: ['Nitrogen (N)', 'Phosphorus (P)', 'Potassium (K)', 'Organic Matter (OM)', 'Water Retention', 'Soil pH'],
    datasets: [
      {
        label: 'Your soil levels',
        data: [nitrogenVal / 2, phosVal * 1.5, potassVal, 75, 80, phVal * 12],
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        borderWidth: 2,
        pointBackgroundColor: '#047857',
      },
      {
        label: 'Ideal target',
        data: [80, 80, 80, 80, 80, 80],
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        borderColor: '#f59e0b',
        borderWidth: 1.5,
        borderDash: [4, 4],
      },
    ],
  };

  // Soil Nutrient Trend Line Chart
  const nutrientTrendData = {
    labels: ['Year 1', 'Year 2', 'Year 3', 'Year 4 (Proposed rotation)'],
    datasets: [
      {
        label: 'Single rice crop (N depletion %)',
        data: [100, 75, 52, 38],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        fill: true,
      },
      {
        label: 'Proposed rotation (N stability %)',
        data: [100, 92, 98, 105],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
      },
    ],
  };

  return (
    <div className="space-y-6 pb-12">
      {/* View Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Crop & Soil Advisory Hub</h2>
            <p className="text-xs text-slate-500">Assigned AEZ: {matchedAez.aezNameEn}</p>
          </div>
        </div>

        {/* Sub-tab Navigation Pills */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'recommend', label: 'Crop selection', icon: Sprout },
            { id: 'soil', label: 'Soil card', icon: Layers },
            { id: 'rotation', label: 'Rotation planner', icon: RefreshCw },
            { id: 'scanner', label: 'Disease scanner', icon: Camera },
            { id: 'irrigation', label: 'Irrigation advice', icon: Droplets },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeSubTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-emerald-800 text-white shadow'
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

      <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Smart guidance</p>
              <h3 className="font-bold text-slate-900 mt-1">{recommendationSummary.title}</h3>
              <p className="text-sm text-slate-600 mt-1">{recommendationSummary.body}</p>
            </div>
            <div className="rounded-full bg-white p-2 text-emerald-700 shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Integrated Farm</p>
          <h3 className="font-bold text-slate-900 mt-2 text-base">{integratedFarmAdvice.title}</h3>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            {integratedFarmAdvice.points.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-700 shrink-0" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Quick next steps</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button onClick={() => setActiveSubTab('soil')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Soil card</button>
            <button onClick={() => setActiveSubTab('rotation')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Rotation plan</button>
            <button onClick={() => setActiveSubTab('scanner')} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">Scan disease</button>
          </div>
        </div>
      </div>

      {/* SUB-TAB 1: Crop Recommendation Engine */}
      {activeSubTab === 'recommend' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search crops (e.g. rice, potato...)"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto">
<span className="text-xs font-semibold text-slate-600">Season:</span>
                  {(['All', 'Rabi', 'Kharif-1', 'Kharif-2'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setSeasonFilter(s)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        seasonFilter === s
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {s === 'All' ? 'All seasons' : s === 'Rabi' ? 'Rabi (Winter)' : s === 'Kharif-1' ? 'Kharif-1 (Summer)' : 'Kharif-2 (Monsoon)'}
                </button>
              ))}

              <button
                onClick={() => setLoanOnlyFilter(!loanOnlyFilter)}
                className={`ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border flex items-center space-x-1 transition-all ${
                  loanOnlyFilter
                    ? 'bg-purple-700 text-white border-purple-700 shadow'
                    : 'bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>4% loan support</span>
              </button>
            </div>
          </div>

          {/* Crops Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCrops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        {crop.typicalSeasonEn}
                      </span>
                      <h3 className="font-bold text-base text-slate-900 mt-1">{crop.nameEn}</h3>
                      <p className="text-xs text-slate-500 italic">{crop.nameEn}</p>
                    </div>
                    {crop.concessionalLoan4Pct && (
                      <span className="px-2 py-1 rounded-lg bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200 flex items-center">
                        <Sparkles className="w-3 h-3 mr-1 text-purple-700" />
                        4% loan benefit
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    Suitable for local AEZ conditions. Expected yield {crop.expectedYieldPerBighaEn}.
                  </p>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 block">Planting window:</span>
                      <span className="font-bold text-slate-800">{crop.plantingWindowEn}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Expected yield:</span>
                      <span className="font-bold text-emerald-800">{crop.expectedYieldPerBighaEn}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Water need: {crop.waterNeed}</span>
                  <button 
                    onClick={() => setSelectedCropGuidance(crop)}
                    className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg shadow-sm transition-all cursor-pointer flex items-center space-x-1"
                  >
                    <span>View full guidance</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Soil Health Card & Nutrient Balance */}
      {activeSubTab === 'soil' && (
        <div className="space-y-6 animate-fade-in">
          {/* Soil Input & Radar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b pb-3">
                  <h3 className="font-bold text-slate-900 text-base flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-emerald-700" />
                    Digital Soil Health Card
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                  Pabna Center (AEZ-11)
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Nitrogen (N): {nitrogenVal} kg/ha</span>
                    <span className={nitrogenVal < 100 ? 'text-amber-600' : 'text-emerald-600'}>
                      {nitrogenVal < 100 ? 'Deficient' : 'Adequate'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    value={nitrogenVal}
                    onChange={(e) => setNitrogenVal(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Phosphorus (P): {phosVal} kg/ha</span>
                    <span className="text-emerald-600">Normal</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={phosVal}
                    onChange={(e) => setPhosVal(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Potassium (K): {potassVal} kg/ha</span>
                    <span className="text-emerald-600">Normal</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="120"
                    value={potassVal}
                    onChange={(e) => setPotassVal(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                    <span>Soil pH: {phVal}</span>
                    <span className="text-emerald-600">Optimal (6.0 - 7.5)</span>
                  </div>
                  <input
                    type="range"
                    min="4.5"
                    max="8.5"
                    step="0.1"
                    value={phVal}
                    onChange={(e) => setPhVal(Number(e.target.value))}
                    className="w-full accent-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                <span className="font-bold block">💡 Lime and organic fertilizer recommendation:</span>
                <p>Apply 500g of organic compost and 15g of zinc sulfate per decimal to boost yield by up to 15%.</p>
              </div>
            </div>

            {/* Radar Chart Display */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-slate-900 text-sm mb-2">Nutrient Balance Radar</h3>
              <div className="w-full max-w-xs mx-auto h-64 flex items-center justify-center">
                <Radar data={soilRadarData} options={{ responsive: true, maintainAspectRatio: false }} />
              </div>
              <p className="text-[11px] text-slate-500 text-center mt-2">
                Green line: current soil status | Yellow dash: ideal target
              </p>
            </div>
          </div>

          {/* Nutrient Depletion Trend Line Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">
              Long-term soil nutrient depletion vs. rotation stability
            </h3>
            <div className="h-64">
              <Line data={nutrientTrendData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: 3-Season Crop Cycle & Rotation Engine */}
      {activeSubTab === 'rotation' && (
        <div className="animate-fade-in">
          <CropCycleEngine profile={profile} lang={lang} />
        </div>
      )}

      {/* SUB-TAB 4: AI Crop Disease Scanner */}
      {activeSubTab === 'scanner' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-xl">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">AI Crop Disease Scanner</h3>
                <p className="text-xs text-slate-500">Upload an affected leaf image and our system will identify the disease and recommend treatment.</p>
              </div>
            </div>

            {/* Upload Area */}
            <div className="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/40 hover:bg-emerald-50 transition-colors relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageCapture}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              {selectedImage ? (
                <div className="space-y-3">
                  <img
                    src={selectedImage}
                    alt="Captured crop leaf"
                    className="max-h-56 mx-auto rounded-xl shadow border border-emerald-200 object-cover"
                  />
                  <p className="text-xs font-semibold text-emerald-900">Image captured. Tap the button below to begin diagnosis.</p>
                </div>
              ) : (
                <div className="space-y-2 pointer-events-none">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-slate-800 text-sm">Tap here to upload an image</h4>
                  <p className="text-xs text-slate-500">The camera will open or you can choose a photo from your device.</p>
                </div>
              )}
            </div>

            {/* Run Analysis Button */}
            {selectedImage && (
              <button
                onClick={handleRunAiScanner}
                disabled={isScanning}
                className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
              >
                    {isScanning ? (
                      <>
                        <Zap className="w-4 h-4 animate-spin text-amber-300" />
                        <span>AI image analysis in progress...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-amber-300" />
                        <span>Diagnose disease</span>
                      </>
                    )}
              </button>
            )}

            {/* Error Message */}
            {scanError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl text-xs flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Diagnosis Result Output Card */}
            {scanResult && (
              <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-4 animate-fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-200 px-2 py-0.5 rounded">
                      Diagnosis Result
                    </span>
                    <h4 className="font-extrabold text-slate-900 text-lg mt-1">{scanResult.diseaseNameEn}</h4>
                    <p className="text-xs text-slate-500 italic">{scanResult.diseaseNameEn}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    scanResult.severity === 'High' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    Risk: {scanResult.severity || 'Medium'}
                  </span>
                </div>
                <div className="space-y-3 text-xs text-slate-800">
                  <div>
                    <span className="font-bold text-emerald-900 block mb-1">🧪 Chemical control:</span>
                    <p className="bg-white p-2.5 rounded-xl border border-emerald-200">{scanResult.chemicalTreatmentEn}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-900 block mb-1">🌱 Organic control:</span>
                    <p className="bg-white p-2.5 rounded-xl border border-emerald-200">{scanResult.organicTreatmentEn}</p>
                  </div>

                  <div>
                    <span className="font-bold text-emerald-900 block mb-1">🛡️ Preventive steps:</span>
                    <p className="bg-white p-2.5 rounded-xl border border-emerald-200">{scanResult.preventiveStepsEn}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: Weather & Irrigation Advisor */}
      {activeSubTab === 'irrigation' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-100 text-cyan-800 rounded-xl">
                <Droplets className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Irrigation & Rainfall Guidance</h3>
                <p className="text-xs text-slate-500">Use soil moisture meters and weather forecasts to avoid irrigation water waste.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Aman rice: irrigation depth</span>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 text-white font-extrabold rounded-2xl flex items-center justify-center text-sm shadow">
                    5 cm
                  </div>
                  <div>
                    <p className="text-xs text-slate-800 font-bold">Ideal water depth</p>
                    <p className="text-[11px] text-slate-500">A water deficit during flowering can reduce yield by up to 40%.</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                <span className="text-xs font-bold text-slate-600 block">Mustard & wheat: irrigation depth</span>
                <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-amber-500 text-slate-950 font-extrabold rounded-2xl flex items-center justify-center text-sm shadow">
                    2 cm
                  </div>
                  <div>
                    <p className="text-xs text-slate-800 font-bold">Light irrigation</p>
                    <p className="text-[11px] text-slate-500">Avoid waterlogging — excess water causes root rot.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FULL CROP CULTIVATION GUIDANCE MODAL */}
      {selectedCropGuidance && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in print-area">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-200 relative p-5 sm:p-7 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b pb-4 pr-8">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    {selectedCropGuidance.seasonEn}
                  </span>
                  {selectedCropGuidance.concessionalLoan4Pct && (
                    <span className="px-2.5 py-0.5 bg-purple-100 text-purple-900 text-xs font-bold rounded-full border border-purple-200 flex items-center">
                      <Sparkles className="w-3 h-3 mr-1 text-purple-700" />
                      4% government loan benefit
                    </span>
                  )}
                </div>
                <h3 className="text-2xl font-black text-slate-900">{selectedCropGuidance.nameEn}</h3>
                <p className="text-xs text-slate-500 italic">{selectedCropGuidance.nameEn}</p>
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
                  onClick={() => setSelectedCropGuidance(null)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* AEZ & Basic Summary */}
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-emerald-950 text-sm flex items-center">
                    <Sprout className="w-4 h-4 mr-1.5 text-emerald-700" />
                    Soil & climate suitability note ({matchedAez.aezNameEn})
                  </h4>
              <p className="text-xs text-emerald-900 leading-relaxed">
                {selectedCropGuidance.aezSuitabilityNoteEn}
              </p>
            </div>

            {/* Dynamic Land Size & Fertilizer Dosage Calculator */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm flex items-center">
                    <BookOpen className="w-4 h-4 mr-1.5 text-emerald-700" />
                    Fertilizer dosage calculator (per bigha/decimal)
                  </h4>
                  <p className="text-[11px] text-slate-500">Calculate the right fertilizer amount based on your land area.</p>
                </div>

                <div className="flex items-center space-x-2 no-print">
                  <span className="text-xs font-bold text-slate-700">Land area:</span>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={guidanceLandArea}
                    onChange={(e) => setGuidanceLandArea(Math.max(1, Number(e.target.value)))}
                    className="w-20 px-2.5 py-1 text-xs font-bold bg-white border border-slate-300 rounded-lg text-center focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="text-xs text-slate-600 font-semibold">decimal</span>
                </div>
              </div>

              {/* Fertilizer Dosage Table */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Urea</span>
                  <span className="text-sm font-black text-emerald-800 block mt-0.5">
                    {formatNumeral(Math.round(guidanceLandArea * 0.8), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">in 3 installments</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">TSP</span>
                  <span className="text-sm font-black text-emerald-800 block mt-0.5">
                    {formatNumeral(Math.round(guidanceLandArea * 0.4), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">in final soil preparation</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">MOP (Potash)</span>
                  <span className="text-sm font-black text-emerald-800 block mt-0.5">
                    {formatNumeral(Math.round(guidanceLandArea * 0.35), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">in 2 installments</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <span className="text-[10px] text-slate-500 block">Gypsum</span>
                  <span className="text-sm font-black text-emerald-800 block mt-0.5">
                    {formatNumeral(Math.round(guidanceLandArea * 0.25), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">with base fertilizer</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-500 block">Organic compost</span>
                  <span className="text-sm font-black text-amber-800 block mt-0.5">
                    {formatNumeral(Math.round(guidanceLandArea * 10), 'en')} kg
                  </span>
                  <span className="text-[9px] text-slate-400">first application with manure/compost</span>
                </div>
              </div>
            </div>

            {/* 5-Step Cultivation Guide */}
            <div className="space-y-3">
                <h4 className="font-extrabold text-slate-900 text-base flex items-center border-b pb-2">
                <CheckCircle className="w-5 h-5 mr-1.5 text-emerald-700" />
                Step-by-step cultivation guide (Standard Operating Procedure)
              </h4>

              <div className="space-y-2 text-xs">
                {/* Step 1 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      1
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Land preparation and soil conditioning:</h5>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Do 3-4 deep tillage passes with a plow or hoe. Apply 250g of lime per decimal and let it sit for 3 days to reduce soil acidity and pathogens.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      2
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Seed treatment and planting guidelines:</h5>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Treat seeds before planting with a seed disinfectant such as Thiram or Carbendazim at 2g/kg. Treated seedlings resist disease up to 70% better.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      3
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Fertilizer application schedule (Top dressing):</h5>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Do not apply all urea at once. Apply first dose 15 days after transplanting, second dose after 30 days, and third dose before panicle initiation. Keep the soil moist during applications.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      4
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Pest and disease integrated management (IPM):</h5>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Use bird-perching to attract birds for pest control and apply neem oil solution early. If needed, use approved organic pesticides.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-1 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-full bg-emerald-800 text-white font-black text-[10px] flex items-center justify-center shrink-0">
                      5
                    </span>
                    <h5 className="font-bold text-slate-900 text-xs">Harvesting, drying and storage in government warehouses:</h5>
                  </div>
                  <p className="text-slate-600 pl-7 leading-relaxed">
                    Harvest when 80% of panicles mature. Dry the grain in sunlight and store it in silos or airtight bags below 12% moisture.
                  </p>
                </div>
              </div>
            </div>

            {/* Government Loan & Incentive Section */}
                  {selectedCropGuidance.concessionalLoan4Pct && (
              <div className="bg-purple-50 border border-purple-200 p-4 rounded-2xl space-y-2">
                <h4 className="font-bold text-purple-950 text-sm flex items-center">
                  <DollarSign className="w-4 h-4 mr-1 text-purple-700" />
                  How to access 4% government agricultural loan
                </h4>
                <p className="text-xs text-purple-900 leading-relaxed">
                  The government provides concessional 4% loans for spices, pulses and oilseed crops through agriculture banks or BRDB. Contact your local extension office with national ID and land ownership proof.
                </p>
              </div>
            )}

            {/* Modal Bottom Action Footer */}
            <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
                <span className="text-xs text-slate-500">
                Source: Department of Agricultural Extension (DAE) and Bangladesh Agricultural Research Institute (BARI)
              </span>

              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    setSelectedCropGuidance(null);
                    setActiveSubTab('scanner');
                  }}
                  className="flex-1 sm:flex-initial px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center space-x-1"
                >
                  <Camera className="w-4 h-4" />
                  <span>Go to disease scanner</span>
                </button>
                <button
                  onClick={() => setSelectedCropGuidance(null)}
                  className="flex-1 sm:flex-initial px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
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
