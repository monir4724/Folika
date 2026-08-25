import React from 'react';
import { UserProfile } from '../types';
import { MainTab } from './BottomNav';
import { Sprout, Mic, Wifi, WifiOff, Globe, MapPin, Home, TrendingUp, HeartPulse, Waves, Users, Printer, MoonStar, SunMedium, User, Settings2 } from 'lucide-react';

interface HeaderProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onLangToggle?: () => void;
  onOpenVoice: () => void;
  onOpenProfile?: () => void;
  onOpenSettings?: () => void;
  isOnline: boolean;
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  isDarkMode: boolean;
  onToggleDarkMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  lang,
  onLangToggle, // Optional
  onOpenVoice,
  onOpenProfile,
  onOpenSettings,
  isOnline,
  activeTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode, // Optional
}) => {
  const desktopTabs: { id: MainTab; labelBn: string; labelEn: string; icon: React.ElementType }[] = [
    { id: 'home', labelBn: 'Home', labelEn: 'Home', icon: Home },
    { id: 'crop', labelBn: 'Crop & Soil', labelEn: 'Crop & Soil', icon: Sprout },
    { id: 'market', labelBn: 'Market & Finance', labelEn: 'Market & Finance', icon: TrendingUp },
    { id: 'livestock', labelBn: 'Livestock', labelEn: 'Livestock', icon: HeartPulse },
    { id: 'fisheries', labelBn: 'Fisheries', labelEn: 'Fisheries', icon: Waves },
    { id: 'community', labelBn: 'Community', labelEn: 'Community', icon: Users },
    { id: 'settings', labelBn: 'Settings', labelEn: 'Settings', icon: Settings2 },
  ];

  return (
    <header className="sticky top-0 z-30 bg-emerald-800 text-white shadow-md border-b border-emerald-700/50 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
        {/* Brand & AEZ Badge */}
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-amber-300 font-extrabold shadow-inner border border-emerald-500 cursor-pointer" onClick={() => onSelectTab('home')}>
            <Sprout className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 
                onClick={() => onSelectTab('home')}
                className="text-lg sm:text-xl font-bold tracking-tight text-white leading-none cursor-pointer hover:text-amber-200 transition-colors"
              >
                Folika <span className="text-xs font-normal text-emerald-200 hidden sm:inline">| Folika Web</span>
              </h1>
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${isOnline ? 'bg-emerald-900 text-emerald-200 border border-emerald-700' : 'bg-amber-900 text-amber-200 border border-amber-700'}`}>
                {isOnline ? <Wifi className="w-2.5 h-2.5 mr-1" /> : <WifiOff className="w-2.5 h-2.5 mr-1" />}
                {isOnline ? 'Online' : 'Offline Lite'}
              </span>
            </div>
            <div className="flex items-center text-xs text-emerald-100/90 mt-0.5 space-x-2">
              <span className="flex items-center">
                <MapPin className="w-3 h-3 mr-0.5 text-amber-300 shrink-0" />
                {profile?.upazila ? `${profile.upazila}, ${profile.district}` : 'Pabna Sadar, Pabna (AEZ-11)'}
              </span>
            </div>
            {/* left-side brand info only; profile moved to action controls */}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          {/* Print Report Helper for Web */}
          <button
            onClick={() => window.print()}
            className="hidden sm:flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs text-emerald-100 font-medium transition-colors border border-emerald-600"
            title="Print Web Report"
          >
            <Printer className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden lg:inline">Print</span>
          </button>

          {/* Settings is available in the top nav; do not duplicate in header actions */}

          {/* Voice Assistant Launcher */}
          <button
            onClick={onOpenVoice}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            title="Ask by voice"
          >
            <Mic className="w-4 h-4 text-emerald-950 animate-bounce" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* Profile avatar moved to right-side actions */}
          <button
            onClick={() => onOpenProfile && onOpenProfile()}
            title="Profile"
            className="flex items-center space-x-2 px-2 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-xs text-emerald-100 font-medium transition-colors border border-emerald-600"
          >
            {profile?.profilePhoto ? (
              <img src={profile.profilePhoto} alt={profile.name || 'avatar'} className="w-8 h-8 rounded-full object-cover border-2 border-amber-300" />
            ) : (
              <User className="w-5 h-5 text-amber-300" />
            )}
            <span className="hidden lg:inline">{profile?.name || 'Profile'}</span>
          </button>

          {/* language and dark-mode controls moved to Settings */}
        </div>
      </div>

      {/* Desktop Top Navigation Bar (Shown on md screens and up) */}
      <nav className="hidden md:block bg-emerald-900 border-t border-emerald-700/60 shadow-inner">
        <div className="max-w-7xl mx-auto px-4 flex space-x-1">
          {desktopTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-emerald-800/80 shadow-sm'
                    : 'border-transparent text-emerald-200/90 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span>{lang === 'bn' ? tab.labelBn : tab.labelEn}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
};
