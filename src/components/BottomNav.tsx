import React from 'react';
import { Home, Sprout, TrendingUp, HeartPulse, Waves, Users, Settings2 } from 'lucide-react';

export type MainTab = 'home' | 'crop' | 'market' | 'livestock' | 'fisheries' | 'community' | 'settings' | 'profile';

interface BottomNavProps {
  activeTab: MainTab;
  onSelectTab: (tab: MainTab) => void;
  lang: 'bn' | 'en';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onSelectTab, lang }) => {
  const tabs = [
    {
      id: 'home' as MainTab,
      labelBn: 'Home',
      labelEn: 'Home',
      icon: Home,
    },
    {
      id: 'crop' as MainTab,
      labelBn: 'Crop & Soil',
      labelEn: 'Crop & Soil',
      icon: Sprout,
    },
    {
      id: 'market' as MainTab,
      labelBn: 'Market & Finance',
      labelEn: 'Market & Finance',
      icon: TrendingUp,
    },
    {
      id: 'livestock' as MainTab,
      labelBn: 'Livestock',
      labelEn: 'Livestock',
      icon: HeartPulse,
    },
    {
      id: 'fisheries' as MainTab,
      labelBn: 'Fisheries',
      labelEn: 'Fisheries',
      icon: Waves,
    },
    {
      id: 'community' as MainTab,
      labelBn: 'Community',
      labelEn: 'Community',
      icon: Users,
    },
    {
      id: 'settings' as MainTab,
      labelBn: 'Settings',
      labelEn: 'Settings',
      icon: Settings2,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-emerald-900 border-t border-emerald-800/80 shadow-lg text-white no-print">
      <div className="max-w-7xl mx-auto px-1 sm:px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1.5 px-1 transition-all rounded-lg ${
                  isActive
                    ? 'text-amber-300 font-bold bg-emerald-800/80 scale-105'
                    : 'text-emerald-200/80 hover:text-white hover:bg-emerald-800/40'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-300' : 'text-emerald-300'}`} />
                <span className="text-[11px] leading-tight text-center truncate max-w-[64px]">
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
