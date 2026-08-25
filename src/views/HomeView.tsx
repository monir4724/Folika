import React from 'react';
import { UserProfile } from '../types';
import { MainTab } from '../components/BottomNav';
import { MACROECONOMIC_GAPS_LIST } from '../data/macroeconomicGaps';
import { WeatherForecastCard } from '../components/WeatherForecast';
import {
  Sprout,
  Camera,
  TrendingUp,
  HeartPulse,
  Waves,
  ArrowRight,
  Sparkles,
  MapPin,
  Layers,
  RefreshCw,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface HomeViewProps {
  profile: UserProfile | null;
  onNavigate: (tab: MainTab) => void;
  onOpenVoice: () => void;
  lang: 'bn' | 'en';
}

export const HomeView: React.FC<HomeViewProps> = ({ profile, onNavigate, onOpenVoice, lang }) => {
  const isBn = lang === 'bn';

  const focusCards = {
    crops: {
      titleBn: 'Today’s focus: crop health',
      titleEn: 'Today’s focus: crop health',
      bodyBn: 'Review soil, weather, and pest conditions before choosing your next step.',
      bodyEn: 'Review soil, weather, and pest conditions before choosing your next step.',
      actionBn: 'Crop advice',
      actionEn: 'Crop advice',
      tab: 'crop' as MainTab,
    },
    livestock: {
      titleBn: 'Today’s focus: livestock care',
      titleEn: 'Today’s focus: livestock care',
      bodyBn: 'Check vaccine reminders and symptom-based care advice for your animals.',
      bodyEn: 'Check vaccine reminders and symptom-based care advice for your animals.',
      actionBn: 'Livestock advice',
      actionEn: 'Livestock advice',
      tab: 'livestock' as MainTab,
    },
    fisheries: {
      titleBn: 'Today’s focus: pond management',
      titleEn: 'Today’s focus: pond management',
      bodyBn: 'Improve pond health by reviewing water quality, stocking, and feed plans.',
      bodyEn: 'Improve pond health by reviewing water quality, stocking, and feed plans.',
      actionBn: 'Fisheries advice',
      actionEn: 'Fisheries advice',
      tab: 'fisheries' as MainTab,
    },
    mixed: {
      titleBn: 'Today’s focus: integrated farm',
      titleEn: 'Today’s focus: integrated farm',
      bodyBn: 'Review crops, livestock, and fish together for the best farm decisions.',
      bodyEn: 'Review crops, livestock, and fish together for the best farm decisions.',
      actionBn: 'Integrated advice',
      actionEn: 'Integrated advice',
      tab: 'home' as MainTab,
    },
  };

  const resolvePrimaryKey = () => {
    const first = profile?.farmerTypes?.[0];
    if (!first) return 'mixed';
    if (first === 'crop') return 'crops';
    return first as 'livestock' | 'fisheries' | 'mixed';
  };

  const focusCard = focusCards[resolvePrimaryKey()];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-linear-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/60 relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-700/80 text-amber-300 text-xs font-semibold border border-emerald-600">
              <MapPin className="w-3.5 h-3.5" />
              <span>
                {profile ? `${profile.district}, ${profile.upazila}` : 'Pabna Sadar, Pabna'} ({profile?.aezCode || 'AEZ-11'})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {`Welcome, ${profile?.name || 'Farmer'}!`}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-xl">
              {'Weather is favorable today. Smart, practical guidance for your farm is ready.'}
            </p>
          </div>

          <button
            onClick={onOpenVoice}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs sm:text-sm shadow-lg flex items-center justify-center space-x-2 transition-all active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-emerald-950 animate-bounce" />
            <span>{'Ask AI Voice Assistant'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1.35fr_0.85fr]">
        <div className="rounded-3xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-bold text-slate-900">{focusCard.titleEn}</h3>
              <p className="text-xs text-slate-500 mt-1">{focusCard.bodyEn}</p>
            </div>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <button
            onClick={() => onNavigate(focusCard.tab)}
            className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <span>{isBn ? focusCard.actionBn : focusCard.actionEn}</span>
            <ArrowRight className="ml-1.5 w-3.5 h-3.5" />
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            {'Fast and reliable'}
          </div>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex items-start gap-2"><span className="mt-1 text-emerald-600">•</span>{'Advice tailored to your region'}</li>
            <li className="flex items-start gap-2"><span className="mt-1 text-emerald-600">•</span>{'Simple, plain-language guidance'}</li>
            <li className="flex items-start gap-2"><span className="mt-1 text-emerald-600">•</span>{'One-click access to key services'}</li>
          </ul>
        </div>
      </div>

      <WeatherForecastCard
        profile={profile}
        lang={lang}
        onNavigateToCrop={() => onNavigate('crop')}
        onNavigateToLivestock={() => onNavigate('livestock')}
        onNavigateToFisheries={() => onNavigate('fisheries')}
      />

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center">
            <Layers className="w-4 h-4 mr-1.5 text-emerald-700" />
            {'Core Services'}
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {'All services 100% free'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            {
              id: 'crop',
              tab: 'crop' as MainTab,
              titleBn: 'Crop & Soil',
              titleEn: 'Crop & Soil',
              descBn: 'Crop advisory & Soil Health Card by AEZ',
              descEn: 'Crop advisory & Soil Health Card by AEZ',
              icon: Sprout,
              color: 'bg-emerald-600 text-white',
            },
            {
              id: 'crop_cycle',
              tab: 'crop' as MainTab,
              titleBn: 'Crop Cycle Engine',
              titleEn: 'Crop Cycle Engine',
              descBn: '3-Season crop rotation & soil simulation',
              descEn: '3-Season crop rotation & soil simulation',
              icon: RefreshCw,
              color: 'bg-teal-700 text-white',
            },
            {
              id: 'disease_scan',
              tab: 'crop' as MainTab,
              titleBn: 'Disease Scanner',
              titleEn: 'Disease Scanner',
              descBn: 'AI diagnosis from leaf photo uploads',
              descEn: 'AI diagnosis from leaf photo uploads',
              icon: Camera,
              color: 'bg-amber-500 text-emerald-950',
            },
            {
              id: 'market',
              tab: 'market' as MainTab,
              titleBn: 'Market Prices',
              titleEn: 'Market Prices',
              descBn: 'Price forecast & best market finder',
              descEn: 'Price forecast & best market finder',
              icon: TrendingUp,
              color: 'bg-blue-600 text-white',
            },
            {
              id: 'finance',
              tab: 'market' as MainTab,
              titleBn: '4% Agri Loan',
              titleEn: '4% Agri Loan',
              descBn: '4% loan eligibility',
              descEn: '4% loan eligibility',
              icon: Sparkles,
              color: 'bg-purple-600 text-white',
            },
            {
              id: 'livestock',
              tab: 'livestock' as MainTab,
              titleBn: 'Livestock Vet',
              titleEn: 'Livestock Vet',
              descBn: 'Symptom diagnosis & vaccine calendar',
              descEn: 'Symptom diagnosis & vaccine calendar',
              icon: HeartPulse,
              color: 'bg-rose-600 text-white',
            },
            {
              id: 'fisheries',
              tab: 'fisheries' as MainTab,
              titleBn: 'Fisheries Hub',
              titleEn: 'Fisheries Hub',
              descBn: 'Pond stocking & water quality',
              descEn: 'Pond stocking & water quality',
              icon: Waves,
              color: 'bg-cyan-600 text-white',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.tab)}
                className="group bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all text-left flex flex-col justify-between cursor-pointer"
              >
                <div>
                  <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center font-bold mb-3 shadow`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-800 transition-colors">
                    {item.titleEn}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-tight line-clamp-2">
                    {item.descEn}
                  </p>
                </div>
                <div className="mt-3 flex items-center text-[11px] text-emerald-700 font-bold group-hover:translate-x-1 transition-transform">
                  <span>{'Open'}</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
              {'Macro Insight'}
            </span>
            <h3 className="font-bold text-sm sm:text-base text-white">
              {'Market Security & Credit Safety'}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {MACROECONOMIC_GAPS_LIST.slice(0, 2).map((gap) => (
            <div key={gap.id} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-2">
              <h4 className="font-bold text-amber-300 text-sm">{gap.titleEn}</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{gap.fullDetailEn || gap.fullDetailBn}</p>
              <div className="p-2.5 bg-emerald-950/70 border border-emerald-800 rounded-xl text-xs text-emerald-200">
                <span className="font-bold text-emerald-400">💡 Advice: </span>
                {gap.actionableInsightEn || gap.actionableInsightBn}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
