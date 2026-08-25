import React, { useState } from 'react';
import { UserProfile, CropItem, CropRotationLog } from '../types';
import { CROP_DATABASE, ExtendedCropItem } from '../data/cropReference';
import { BANGLADESH_AEZ_ZONES } from '../data/aezZones';
import { formatNumeral } from '../utils/numerals';
import { saveRotationLog, getStoredRotationLogs } from '../utils/storage';
import {
  RefreshCw,
  Sprout,
  CheckCircle,
  AlertTriangle,
  Layers,
  Sparkles,
  BookmarkPlus,
  Printer,
  Volume2,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Info,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface CropCycleEngineProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
}

// Pre-set AEZ Rotation Templates
interface RotationTemplate {
  id: string;
  nameBn: string;
  nameEn: string;
  aezTargetBn: string;
  aezTargetEn?: string;
  rabiCropId: string;
  kharif1CropId: string;
  kharif2CropId: string;
  descriptionBn: string;
  descriptionEn?: string;
}

const AEZ_ROTATION_TEMPLATES: RotationTemplate[] = [
  {
    id: 'tmpl_barind',
    nameBn: 'বরেন্দ্র শুষ্ক অঞ্চল আবর্তন (Drought-Resilient)',
    nameEn: 'Barind Drought-Resilient Cycle',
    aezTargetBn: 'বরেন্দ্র অঞ্চল (AEZ 25-27: রাজশাহী, চাঁপাই, নওগাঁ)',
    aezTargetEn: 'Barind region (AEZ 25-27: Rajshahi, Chapai, Naogaon)',
    rabiCropId: 'crop_mustard', // সরিষা
    kharif1CropId: 'crop_mungbean', // মুগ ডাল
    kharif2CropId: 'crop_rice_aman', // আমন ধান
    descriptionBn: 'সরিষা ও মুগ ডাল মাটিতে নাইট্রোজেন ও সালফার সরবরাহ করে, যা পরবর্তী রোপা আমন ধানের রাসায়নিক সারের ব্যবহার ২৫% কমায়।',
    descriptionEn: 'Mustard and mung bean enrich soil N and S, reducing chemical fertilizer need for following Aman rice by ~25%.',
  },
  {
    id: 'tmpl_haor',
    nameBn: 'হাওড় ও প্লাবনভূমি শস্য আবর্তন (Haor Basin)',
    nameEn: 'Haor Basin Adaptive Cycle',
    aezTargetBn: 'হাওড় অঞ্চল (AEZ 19-20: সুনামগঞ্জ, নেত্রকোণা, কিশোরগঞ্জ)',
    aezTargetEn: 'Haor basin (AEZ 19-20: Sunamganj, Netrokona, Kishoreganj)',
    rabiCropId: 'crop_rice_boro', // বোরো ধান
    kharif1CropId: 'crop_jute', // পাট
    kharif2CropId: 'crop_blackgram', // মাষকলাই
    descriptionBn: 'বোরো ধানের পর পাট ও মাষকলাই লাগালে মাটির স্বাস্থ্য রক্ষা পায় এবং মাষকলাই আগাম বন্যা আসার আগেই তোলা যায়।',
    descriptionEn: 'Following Boro rice with jute and blackgram preserves soil health and allows early harvest before floods.',
  },
  {
    id: 'tmpl_coastal',
    nameBn: 'উপকূলীয় লবণাক্ত অঞ্চল আবর্তন (Coastal Saline)',
    nameEn: 'Coastal Saline Cycle',
    aezTargetBn: 'উপকূলীয় এলাকা (AEZ 13, 23: খুলনা, সাতক্ষীরা, বরিশাল)',
    aezTargetEn: 'Coastal areas (AEZ 13, 23: Khulna, Satkhira, Barishal)',
    rabiCropId: 'crop_grasspea', // খেসারী
    kharif1CropId: 'crop_sesame', // তিল
    kharif2CropId: 'crop_rice_aman', // লবণা সহনশীল আমন
    descriptionBn: 'শীতের লবণাক্ততায় খেসারী ও তিল ভালো জন্মে। পরবর্তী বর্ষার মিষ্টি পানিতে আমন ধান চমৎকার ফলন দেয়।',
    descriptionEn: 'Grasspea and sesame perform well in saline soils; subsequent Aman rice yields well in fresher monsoon waters.',
  },
  {
    id: 'tmpl_char',
    nameBn: 'চর ও নদী অববাহিকা আবর্তন (Char Land)',
    nameEn: 'Char Land Fertile Cycle',
    aezTargetBn: 'চর এলাকা (AEZ 7, 8, 11: যমুনা, পদ্মা ও মেঘনা অববাহিকা)',
    aezTargetEn: 'Char land (AEZ 7,8,11: Jamuna, Padma, Meghna basins)',
    rabiCropId: 'crop_potato', // আলু
    kharif1CropId: 'crop_mungbean', // মুগ ডাল
    kharif2CropId: 'crop_rice_aman', // আমন ধান
    descriptionBn: 'বেলে-দোআঁশ চরে আলু ও মুগ ডালের আবর্তন মাটির জৈব পদার্থ বাড়ায় এবং ক্ষতিকারক পোকার জীবনচক্র ভেঙে দেয়।',
    descriptionEn: 'Potato and mung bean rotations on sandy char soils increase organic matter and disrupt pest cycles.',
  },
  {
    id: 'tmpl_highland',
    nameBn: 'উচ্চ গঙ্গা সমভূমি আদর্শ আবর্তন (Optimal High Plain)',
    nameEn: 'High Ganges Plain Ideal Cycle',
    aezTargetBn: 'পাবনা, কুষ্টিয়া, যশোর, বগুড়া অঞ্চল (AEZ 11, 12)',
    aezTargetEn: 'Pabna, Kushtia, Jessore, Bogura region (AEZ 11,12)',
    rabiCropId: 'crop_lentil', // মসুর ডাল
    kharif1CropId: 'crop_maize', // ভুট্টা / তিল
    kharif2CropId: 'crop_rice_aman', // আমন ধান
    descriptionBn: 'গভীর মূলের মসুর ডাল বায়ুমণ্ডলের নাইট্রোজেন আবদ্ধ করে যা পরবর্তী ভুট্টা ও আমন ধানের সারের খরচ উল্লেখযোগ্য কমায়।',
    descriptionEn: 'Deep-rooted lentil fixes atmospheric nitrogen reducing fertilizer needs for following maize and Aman rice.',
  },
];

export const CropCycleEngine: React.FC<CropCycleEngineProps> = ({ profile, lang }) => {
  const isBn = lang === 'bn';

  // Matched AEZ
  const matchedAez = BANGLADESH_AEZ_ZONES.find((z) => z.aezCode === (profile?.aezCode || 'AEZ-11')) || BANGLADESH_AEZ_ZONES[0];

  // Selected Crops for 3 Seasons
  // Season 1: Rabi (রবি: শীতকাল)
  const [rabiCropId, setRabiCropId] = useState<string>('crop_mustard');
  // Season 2: Kharif-1 (খরিফ-১: গ্রীষ্মকাল)
  const [kharif1CropId, setKharif1CropId] = useState<string>('crop_mungbean');
  // Season 3: Kharif-2 (খরিফ-২: বর্ষাকাল)
  const [kharif2CropId, setKharif2CropId] = useState<string>('crop_rice_aman');

  // Active Loaded Template Feedback
  const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>('tmpl_barind');
  const [showNotification, setShowNotification] = useState<string | null>('Barind template loaded');
  const [selectedCropModal, setSelectedCropModal] = useState<ExtendedCropItem | null>(null);

  // Saved Logs State
  const [rotationLogs, setRotationLogs] = useState<CropRotationLog[]>(getStoredRotationLogs());

  // Filter crops by season
  const rabiCrops = CROP_DATABASE.filter((c) => c.typicalSeasonEn.toLowerCase().includes('rabi') || c.typicalSeasonEn.toLowerCase().includes('all'));
  const kharif1Crops = CROP_DATABASE.filter((c) => c.typicalSeasonEn.toLowerCase().includes('kharif-1') || c.typicalSeasonEn.toLowerCase().includes('kharif') || c.typicalSeasonEn.toLowerCase().includes('all'));
  const kharif2Crops = CROP_DATABASE.filter((c) => c.typicalSeasonEn.toLowerCase().includes('kharif-2') || c.typicalSeasonEn.toLowerCase().includes('kharif') || c.typicalSeasonEn.toLowerCase().includes('all'));

  // Get selected crop objects
  const rabiCrop = CROP_DATABASE.find((c) => c.id === rabiCropId) || CROP_DATABASE[0];
  const kharif1Crop = CROP_DATABASE.find((c) => c.id === kharif1CropId) || CROP_DATABASE[1];
  const kharif2Crop = CROP_DATABASE.find((c) => c.id === kharif2CropId) || CROP_DATABASE[2];

  // Check if current combination matches any template
  const matchedTemplate = AEZ_ROTATION_TEMPLATES.find(
    (t) => t.rabiCropId === rabiCropId && t.kharif1CropId === kharif1CropId && t.kharif2CropId === kharif2CropId
  );

  // --- RIGOROUS 5-FACTOR ROTATION EVALUATION ALGORITHM ---
  const evaluateRotationCycle = () => {
    let score = 0;
    const reasons: string[] = [];
    const warnings: string[] = [];

    // Factor 1: Root Depth Stratification (25% Weight)
    const depths = [rabiCrop.depthLayerIndex, kharif1Crop.depthLayerIndex, kharif2Crop.depthLayerIndex];
    const uniqueDepths = new Set(depths).size;
    if (uniqueDepths === 3) {
      score += 25;
      reasons.push('Shallow, medium and deep root systems extract nutrients from different layers, promoting balance.');
    } else if (uniqueDepths === 2) {
      score += 18;
      reasons.push('Two distinct root depth layers used, providing moderate balance.');
    } else {
      score += 5;
      warnings.push('All three crops draw from the same root layer; that layer may deplete quickly.');
    }

    // Factor 2: Nutrient Complementarity & Legume N-Fixation (30% Weight)
    const hasLegume = [rabiCrop, kharif1Crop, kharif2Crop].some((c) => c.family.includes('Fabaceae') || c.dominantNutrientDemand.includes('Nitrogen-fixing'));
    const heavyNFeeders = [rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.dominantNutrientDemand.includes('High N')).length;

    if (hasLegume) {
      score += 30;
      reasons.push('Legume crops (Fabaceae) fix atmospheric nitrogen, enriching soil natural N (+18 kg/ha).');
    } else if (heavyNFeeders <= 1) {
      score += 20;
      reasons.push('No excess of nitrogen-hungry crops; nutrient demand remains relatively balanced.');
    } else {
      score += 8;
      warnings.push('Multiple high-N feeders in sequence (e.g., rice/maize) may deplete soil N quickly. Add a legume.');
    }

    // Factor 3: Botanical Family & Pest/Disease Break (20% Weight)
    const families = [rabiCrop.family, kharif1Crop.family, kharif2Crop.family];
    const sameFamilyConsecutive = (families[0] === families[1]) || (families[1] === families[2]) || (families[0] === families[2]);

    if (!sameFamilyConsecutive) {
      score += 20;
      reasons.push('Different botanical families break pest and disease cycles naturally.');
    } else {
      score += 5;
      warnings.push('Consecutive crops from the same family can increase pest and disease pressure.');
    }

    // Factor 4: Water-Requirement Transition & Seasonal Fit (15% Weight)
    const highWaterCrops = [rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.waterNeed === 'High').length;
    if (highWaterCrops <= 2 && (rabiCrop.waterNeed !== 'High')) {
      score += 15;
      reasons.push('Using lower-water crops in Rabi reduces irrigation cost and groundwater pressure.');
    } else {
      score += 8;
      warnings.push('High-water crops in Rabi increase irrigation costs significantly.');
    }

    // Factor 5: Crop Diversity & Repeat Avoidance (10% Weight)
    const uniqueCropIds = new Set([rabiCrop.id, kharif1Crop.id, kharif2Crop.id]).size;
    if (uniqueCropIds === 3) {
      score += 10;
      reasons.push('Three distinct crops provide excellent diversity.');
    } else {
      score += 2;
      warnings.push('The same crop repeats; increase diversity.');
    }

    // Cap score 0-100
    score = Math.min(100, Math.max(0, score));

    let badge: '🟢' | '🟡' | '🔴' = '🟢';
    let badgeLabelEn = 'Recommended fertile rotation';
    let badgeColor = 'emerald';

    if (score < 50) {
      badge = '🔴';
      badgeLabelEn = 'High soil-depleting risk';
      badgeColor = 'rose';
    } else if (score < 75) {
      badge = '🟡';
      badgeLabelEn = 'Cautionary / Moderate risk';
      badgeColor = 'amber';
    }

    // Check Concessional Loan eligibility in cycle
    const loanEligibleCrops = [rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.concessionalLoan4Pct);

    // Delta Nutrient Ledger Calculation
    const deltaN = hasLegume ? '+18 kg/ha' : '-35 kg/ha';
    const deltaP = '-8 kg/ha';
    const deltaK = '-15 kg/ha';
    const soilHealthTrend = hasLegume ? 'Soil fertility improving 📈' : 'Nutrient depletion trend 📉';

    return {
      score,
      badge,
      badgeLabelEn,
      badgeColor,
      reasons,
      warnings,
      loanEligibleCrops,
      deltaN,
      deltaP,
      deltaK,
      soilHealthTrend,
    };
  };

  const evalResult = evaluateRotationCycle();

  // Apply Template
  const handleApplyTemplate = (tmpl: RotationTemplate) => {
    setRabiCropId(tmpl.rabiCropId);
    setKharif1CropId(tmpl.kharif1CropId);
    setKharif2CropId(tmpl.kharif2CropId);
    setAppliedTemplateId(tmpl.id);
    const rCrop = CROP_DATABASE.find((c) => c.id === tmpl.rabiCropId)?.nameEn || '';
    const k1Crop = CROP_DATABASE.find((c) => c.id === tmpl.kharif1CropId)?.nameEn || '';
    const k2Crop = CROP_DATABASE.find((c) => c.id === tmpl.kharif2CropId)?.nameEn || '';

    setShowNotification(`✓ "${tmpl.nameEn}" loaded! (Rabi: ${rCrop} → Kharif-1: ${k1Crop} → Kharif-2: ${k2Crop})`);
    setTimeout(() => {
      setShowNotification(null);
    }, 6000);
  };

  // Reset Selection
  const handleResetToDefault = () => {
    setRabiCropId('crop_mustard');
    setKharif1CropId('crop_mungbean');
    setKharif2CropId('crop_rice_aman');
    setAppliedTemplateId('tmpl_barind');
    setShowNotification('Default rotation reset.');
    setTimeout(() => setShowNotification(null), 3000);
  };

  // Save Rotation Log
  const handleSaveToLog = () => {
    const newLog: CropRotationLog = {
      id: 'cycle_' + Date.now(),
      shallowCrop: `${rabiCrop.nameEn} (Rabi)`,
      mediumCrop: `${kharif1Crop.nameEn} (Kharif-1)`,
      deepCrop: `${kharif2Crop.nameEn} (Kharif-2)`,
      safetyScore: evalResult.score,
      notesBn: `${evalResult.badgeLabelEn || ''}: ${evalResult.reasons[0] || ''}`,
      notesEn: `${evalResult.badgeLabelEn || ''}: ${evalResult.reasons[0] || ''}`,
      dateCreated: new Date().toLocaleDateString(),
    };
    const updated = saveRotationLog(newLog);
    setRotationLogs(updated);
  };

  // Voice Narration
  const handleVoiceNarrate = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = `Your selected crop rotation evaluation score is ${evalResult.score}. This is a ${evalResult.badgeLabelEn || ''}. ${
        evalResult.reasons[0] || ''
      } ${evalResult.warnings[0] || ''}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-emerald-900 text-white p-5 rounded-2xl shadow-md space-y-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-white/10 backdrop-blur rounded-xl">
              <RefreshCw className="w-7 h-7 text-emerald-300 animate-spin-slow" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-emerald-200">
                Smart rotation & soil nutrition simulator
              </span>
              <h2 className="text-xl font-black">3-Season Crop Rotation & Soil Nutrition Engine</h2>
            </div>
          </div>

            <div className="flex items-center space-x-2">
            <button
              onClick={handleVoiceNarrate}
              className="px-3 py-1.5 bg-white/15 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 border border-white/20 backdrop-blur transition-all"
              title="Listen aloud"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Listen</span>
            </button>
          </div>
        </div>
        <p className="text-xs text-emerald-100 max-w-3xl leading-relaxed">
          Choose crops across shallow (0–20 cm), medium (20–50 cm) and deep (50+ cm) layers to break pest cycles, cut fertilizer costs by up to 25–30%, and sustain soil fertility.
        </p>
      </div>

      {/* Notification Toast */}
      {showNotification && (
        <div className="p-3 bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-200 shrink-0" />
            <span>{showNotification}</span>
          </div>
          <button
            onClick={() => setShowNotification(null)}
            className="text-emerald-200 hover:text-white font-black text-sm px-2"
          >
            ✕
          </button>
        </div>
      )}

      {/* AEZ Regional Templates Quick Picker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center">
            <Sparkles className="w-4 h-4 text-amber-500 mr-2 shrink-0" />
            Regional rotation templates (one-click load):
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
              Your AEZ: {matchedAez.aezNameEn}
            </span>
            <button
              onClick={handleResetToDefault}
              className="text-[11px] text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-2.5 py-0.5 rounded-full font-medium flex items-center space-x-1 transition-all"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {AEZ_ROTATION_TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === appliedTemplateId || matchedTemplate?.id === tmpl.id;
            return (
              <button
                key={tmpl.id}
                onClick={() => handleApplyTemplate(tmpl)}
                className={`p-3.5 rounded-xl text-left transition-all text-xs space-y-1.5 relative group ${
                  isSelected
                    ? 'bg-emerald-50/90 border-2 border-emerald-500 shadow-sm ring-1 ring-emerald-400'
                    : 'bg-slate-50 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-900">
                  <span className={isSelected ? 'text-emerald-950 font-black' : 'group-hover:text-emerald-800'}>
                    {tmpl.nameEn}
                  </span>
                  {isSelected ? (
                    <span className="bg-emerald-600 text-white text-[10px] px-2 py-0.5 rounded-full font-black flex items-center space-x-0.5">
                      <CheckCircle className="w-3 h-3 mr-0.5" />
                      Active
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500 line-clamp-1">{tmpl.aezTargetEn || tmpl.aezTargetBn}</p>
                <p className="text-[11px] text-emerald-800 font-medium leading-relaxed">{tmpl.descriptionEn || tmpl.descriptionBn}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3-Season Interactive Crop Selector Grid */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-3 gap-2">
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-emerald-700 shrink-0" />
            Build your 3-season crop rotation:
          </h3>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">
              (Rabi → Kharif-1 → Kharif-2)
            </span>
            <button
              onClick={() => window.print()}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg flex items-center space-x-1 transition-all"
              title="Print rotation plan"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Season 1: Rabi */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-full uppercase">
                Season 1: Rabi (Winter)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">November–March</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select crop:</label>
              <select
                value={rabiCropId}
                onChange={(e) => {
                  setRabiCropId(e.target.value);
                  setAppliedTemplateId(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {rabiCrops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} — [{c.rootDepthClass}]
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-lg border border-amber-100">
              <p><span className="text-slate-500">Botanical family:</span> <strong className="text-slate-800">{rabiCrop.family}</strong></p>
              <p><span className="text-slate-500">Root depth:</span> <strong className="text-amber-800">{rabiCrop.rootDepthClass}</strong></p>
              <p><span className="text-slate-500">Main nutrient demand:</span> <strong className="text-slate-800">{rabiCrop.dominantNutrientDemand}</strong></p>
              <button
                onClick={() => setSelectedCropModal(rabiCrop)}
                className="mt-2 w-full text-center py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center space-x-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View crop details</span>
              </button>
            </div>
          </div>

          {/* Season 2: Kharif-1 */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full uppercase">
                Season 2: Kharif-1 (Wet/Pre-monsoon)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">March–July</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select crop:</label>
              <select
                value={kharif1CropId}
                onChange={(e) => {
                  setKharif1CropId(e.target.value);
                  setAppliedTemplateId(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                {kharif1Crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} — [{c.rootDepthClass}]
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-lg border border-emerald-100">
              <p><span className="text-slate-500">Botanical family:</span> <strong className="text-slate-800">{kharif1Crop.family}</strong></p>
              <p><span className="text-slate-500">Root depth:</span> <strong className="text-emerald-800">{kharif1Crop.rootDepthClass}</strong></p>
              <p><span className="text-slate-500">Main nutrient demand:</span> <strong className="text-slate-800">{kharif1Crop.dominantNutrientDemand}</strong></p>
              <button
                onClick={() => setSelectedCropModal(kharif1Crop)}
                className="mt-2 w-full text-center py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center space-x-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View crop details</span>
              </button>
            </div>
          </div>

          {/* Season 3: Kharif-2 */}
          <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold bg-blue-200 text-blue-900 px-2.5 py-0.5 rounded-full uppercase">
                Season 3: Kharif-2 (Monsoon)
              </span>
              <span className="text-[11px] text-slate-500 font-medium">July–November</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Select crop:</label>
              <select
                value={kharif2CropId}
                onChange={(e) => {
                  setKharif2CropId(e.target.value);
                  setAppliedTemplateId(null);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {kharif2Crops.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} — [{c.rootDepthClass}]
                  </option>
                ))}
              </select>
            </div>

            <div className="text-[11px] space-y-1 bg-white p-2.5 rounded-lg border border-blue-100">
              <p><span className="text-slate-500">Botanical family:</span> <strong className="text-slate-800">{kharif2Crop.family}</strong></p>
              <p><span className="text-slate-500">Root depth:</span> <strong className="text-blue-800">{kharif2Crop.rootDepthClass}</strong></p>
              <p><span className="text-slate-500">Main nutrient demand:</span> <strong className="text-slate-800">{kharif2Crop.dominantNutrientDemand}</strong></p>
              <button
                onClick={() => setSelectedCropModal(kharif2Crop)}
                className="mt-2 w-full text-center py-1 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold text-[11px] rounded-lg transition-all flex items-center justify-center space-x-1"
              >
                <Info className="w-3.5 h-3.5" />
                <span>View crop details</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic 5-Factor Score & Evaluation Dashboard */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="flex items-center space-x-4">
            <div className={`p-4 rounded-2xl text-center border font-black text-3xl shadow-sm ${
              evalResult.score >= 75
                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                : evalResult.score >= 50
                ? 'bg-amber-100 text-amber-900 border-amber-300'
                : 'bg-rose-100 text-rose-900 border-rose-300'
            }`}>
              <span>{formatNumeral(evalResult.score, 'en')}</span>
              <span className="text-xs font-bold block text-slate-600">/100</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">{evalResult.badge}</span>
                <h3 className="font-bold text-base text-slate-900">{evalResult.badgeLabelEn}</h3>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {evalResult.reasons[0] || evalResult.warnings[0] || 'Rotation evaluated.'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
            <button
              onClick={handleSaveToLog}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center space-x-1.5"
            >
              <BookmarkPlus className="w-4 h-4" />
              <span>Save to plot plan</span>
            </button>
          </div>
        </div>

        {/* 5-Factor Score Breakdown */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            5-Factor Science-Based Evaluation
          </h4>

          {/* Reasons List */}
          {evalResult.reasons.length > 0 && (
            <div className="space-y-1.5">
              {evalResult.reasons.map((r, i) => (
                <div key={i} className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-950 flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))}
            </div>
          )}

          {/* Warnings List */}
          {evalResult.warnings.length > 0 && (
            <div className="space-y-1.5">
              {evalResult.warnings.map((w, i) => (
                <div key={i} className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Concessional 4% Loan Eligibility Notification */}
        {evalResult.loanEligibleCrops.length > 0 && (
          <div className="p-3.5 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-950 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-purple-700 shrink-0" />
              <div>
                  <span className="font-bold text-purple-900 block">
                    💰 4% concessional government loan eligibility
                  </span>
                  <p className="text-[11px] text-purple-800">
                    Your rotation includes {evalResult.loanEligibleCrops.map((c) => c.nameEn).join(', ')} which are listed for 4% concessional loans by Bangladesh Bank.
                  </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Visual Soil Depth Layer Cross-Section Diagram */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center">
              <Layers className="w-5 h-5 mr-2 text-emerald-700" />
              Soil stratification and root depth visualizer
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualize which soil layer each selected crop reaches with its root system
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-200 overflow-hidden bg-gradient-to-b from-amber-100 via-amber-200/60 to-amber-900/40 p-4 space-y-3">
          {/* Layer 1: Shallow (0-20 cm) */}
          <div className="bg-amber-50/90 backdrop-blur p-3.5 rounded-xl border border-amber-300 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-xs">
                0-20 cm
              </div>
              <div>
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  Layer 1: Shallow Layer
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {[rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.depthLayerIndex === 1).map((c) => c.nameEn).join(', ') || 'No shallow-rooted crops'}
                </h4>
              </div>
            </div>
            <span className="text-xs text-slate-600 italic">Uses topsoil nitrogen and phosphorus</span>
          </div>

          {/* Layer 2: Medium (20-50 cm) */}
          <div className="bg-emerald-50/90 backdrop-blur p-3.5 rounded-xl border border-emerald-300 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-xs">
                20-50 cm
              </div>
              <div>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                  Layer 2: Medium Layer
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {[rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.depthLayerIndex === 2).map((c) => c.nameEn).join(', ') || 'No medium-rooted crops'}
                </h4>
              </div>
            </div>
            <span className="text-xs text-slate-600 italic">Absorbs medium-layer potassium and stored moisture</span>
          </div>

          {/* Layer 3: Deep (50-100+ cm) */}
          <div className="bg-blue-50/90 backdrop-blur p-3.5 rounded-xl border border-blue-300 shadow-sm flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-200 text-blue-900 flex items-center justify-center font-bold text-xs">
                50+ cm
              </div>
              <div>
                  <span className="text-[10px] font-extrabold uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  Layer 3: Deep Layer
                </span>
                <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                  {[rabiCrop, kharif1Crop, kharif2Crop].filter((c) => c.depthLayerIndex === 3).map((c) => c.nameEn).join(', ') || 'No deep-rooted crops'}
                </h4>
              </div>
            </div>
            <span className="text-xs text-slate-600 italic">Accesses deep mineral pull and can fix atmospheric N</span>
          </div>
        </div>
      </div>

      {/* ΔNutrient Soil Impact Ledger Simulation */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-base flex items-center">
          <TrendingUp className="w-5 h-5 mr-2 text-emerald-700" />
          Approximate soil nutrient balance change ledger (ΔNutrient Ledger Simulation)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <span className="text-xs text-slate-500 block">ΔN (Nitrogen change)</span>
            <span className={`font-black text-lg ${evalResult.deltaN.includes('+') ? 'text-emerald-700' : 'text-rose-600'}`}>
              {evalResult.deltaN}
            </span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <span className="text-xs text-slate-500 block">ΔP (Phosphorus change)</span>
            <span className="font-black text-lg text-slate-700">{evalResult.deltaP}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <span className="text-xs text-slate-500 block">ΔK (Potassium change)</span>
            <span className="font-black text-lg text-slate-700">{evalResult.deltaK}</span>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
            <span className="text-xs text-slate-500 block">Soil organic matter & fertility trend</span>
            <span className="font-bold text-xs text-emerald-800 block mt-1">{evalResult.soilHealthTrend}</span>
          </div>
        </div>
      </div>

      {/* Saved Rotation History List */}
      {rotationLogs.length > 0 && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-900 text-base flex items-center">
            <Clock className="w-4 h-4 mr-2 text-emerald-700" />
            Saved Rotation History
          </h3>
          <div className="space-y-2">
            {rotationLogs.map((log) => (
              <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block">{log.shallowCrop} → {log.mediumCrop} → {log.deepCrop}</span>
                  <p className="text-[11px] text-slate-500">{log.notesEn || log.notesBn}</p>
                </div>
                <div className="flex items-center space-x-2 shrink-0">
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-xs">
                    Score: {formatNumeral(log.safetyScore, 'en')}
                  </span>
                  <span className="text-[11px] text-slate-400">{log.dateCreated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Crop Detail Modal */}
      {selectedCropModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedCropModal(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black flex items-center justify-center text-sm"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3">
              <div className="p-3 bg-emerald-100 rounded-2xl text-emerald-800">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                    <span className="text-[11px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      {selectedCropModal.typicalSeasonEn}
                    </span>
                    <h3 className="font-black text-slate-900 text-lg mt-0.5">{selectedCropModal.nameEn}</h3>
                    <p className="text-xs text-slate-500">{selectedCropModal.nameEn} • {selectedCropModal.family}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[11px] text-slate-500 block">Suitable planting window</span>
                <span className="font-bold text-slate-900 block">{selectedCropModal.plantingWindowEn}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[11px] text-slate-500 block">Expected yield per bigha</span>
                <span className="font-bold text-slate-900 block">{selectedCropModal.expectedYieldPerBighaEn}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[11px] text-slate-500 block">Root depth layer</span>
                <span className="font-bold text-amber-800 block">{selectedCropModal.rootDepthClass}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
                <span className="text-[11px] text-slate-500 block">Irrigation water need</span>
                <span className="font-bold text-blue-800 block">{selectedCropModal.waterNeed}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
              <span className="font-bold text-emerald-900 block">AEZ suitability:</span>
              <p>{selectedCropModal.aezSuitabilityNoteEn}</p>
            </div>

            {selectedCropModal.isImportSubstituteConcessional && (
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-950 flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-700 shrink-0" />
                <span>Listed for 4% concessional import-substitute loans by Bangladesh Bank!</span>
              </div>
            )}

            <button
              onClick={() => setSelectedCropModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
