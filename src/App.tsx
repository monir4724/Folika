import React, { useState, useEffect } from 'react';
import { UserProfile } from './types';
import {
  getStoredProfile,
  saveStoredProfile,
  isUserOnboarded,
  setOnboarded,
  getStoredLanguage,
  setStoredLanguage,
} from './utils/storage';
import { Header } from './components/Header';
import { ProfilePage } from './views/ProfilePage';
import { SettingsView } from './views/SettingsView';
import { BottomNav, MainTab } from './components/BottomNav';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { PermissionGate } from './components/PermissionGate';
import { OnboardingView } from './views/OnboardingView';
import { HomeView } from './views/HomeView';
import { CropAdvisoryView } from './views/CropAdvisoryView';
import { MarketFinanceView } from './views/MarketFinanceView';
import { LivestockView } from './views/LivestockView';
import { FisheriesView } from './views/FisheriesView';
import { CommunityTrustView } from './views/CommunityTrustView';
import { setLiteMode, isLiteMode } from './utils/storage';

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(getStoredProfile());
  const [lang, setLang] = useState<'bn' | 'en'>(getStoredLanguage());
  const [activeTab, setActiveTab] = useState<MainTab>(() => {
    if (typeof window !== 'undefined' && window.location) {
      if (window.location.pathname === '/profile') return 'profile';
      if (window.location.pathname === '/settings') return 'settings';
    }
    return 'home';
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(isUserOnboarded());
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(isLiteMode() ? false : false);

  // Permission Gate State
  const [permissionType, setPermissionType] = useState<'camera' | 'mic' | 'location' | null>(null);
  const [permissionCallback, setPermissionCallback] = useState<(() => void) | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDarkMode);
    setLiteMode(!isDarkMode);
  }, [isDarkMode]);

  const handleOnboardingComplete = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    setOnboarded(true);
    setIsOnboarded(true);
  };

  // Sync history navigation for /profile route
  useEffect(() => {
    const onPop = () => {
      if (window.location.pathname === '/profile') setActiveTab('profile');
      else if (window.location.pathname === '/settings') setActiveTab('settings');
      else setActiveTab('home');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  const requestPermission = (type: 'camera' | 'mic' | 'location', cb: () => void) => {
    setPermissionType(type);
    setPermissionCallback(() => cb);
  };

  const handlePermissionGrant = () => {
    if (permissionCallback) permissionCallback();
    setPermissionType(null);
    setPermissionCallback(null);
  };

  const handlePermissionCancel = () => {
    setPermissionType(null);
    setPermissionCallback(null);
  };

  if (!isOnboarded) {
    return <OnboardingView onComplete={handleOnboardingComplete} lang={lang} />;
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'} font-sans flex flex-col selection:bg-emerald-200 transition-colors`}>
      {/* Sticky Header */}
      <Header
        profile={profile}
        lang={lang}
        onOpenVoice={() => {
          requestPermission('mic', () => setIsVoiceOpen(true));
        }}
        onOpenProfile={() => {
          try { window.history.pushState({}, '', '/profile'); } catch {}
          setActiveTab('profile');
        }}
        onOpenSettings={() => {
          try { window.history.pushState({}, '', '/settings'); } catch {}
          setActiveTab('settings');
        }}
        isOnline={isOnline}
        activeTab={activeTab}
        onSelectTab={(t) => setActiveTab(t)}
        isDarkMode={isDarkMode}
      />

      {/* Main Screen Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 pt-4 pb-20 md:pb-10">
        {activeTab === 'home' && (
          <HomeView
            profile={profile}
            onNavigate={(tab) => setActiveTab(tab)}
            onOpenVoice={() => requestPermission('mic', () => setIsVoiceOpen(true))}
            lang={lang}
          />
        )}

        {activeTab === 'crop' && (
          <CropAdvisoryView
            profile={profile}
            lang={lang}
            onRequireCameraPermission={(cb) => requestPermission('camera', cb)}
          />
        )}

        {activeTab === 'market' && (
          <MarketFinanceView profile={profile} lang={lang} />
        )}

        {activeTab === 'livestock' && (
          <LivestockView profile={profile} lang={lang} />
        )}

        {activeTab === 'fisheries' && (
          <FisheriesView profile={profile} lang={lang} />
        )}

        {activeTab === 'community' && (
          <CommunityTrustView profile={profile} lang={lang} />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            lang={lang}
            onLangChange={(nextLang) => {
              const nextLangUnion: 'bn' | 'en' = nextLang;
              setLang(nextLangUnion);
              setStoredLanguage(nextLangUnion);
              if (profile) {
                const updatedProfile: UserProfile = { ...profile, language: nextLangUnion };
                setProfile(updatedProfile);
                saveStoredProfile(updatedProfile);
              }
            }}
            onSaveProfile={(updatedProfile) => {
              setProfile(updatedProfile);
              saveStoredProfile(updatedProfile);
            }}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode((prev) => !prev)}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            profile={profile}
            lang={lang}
            onSave={(p) => {
              setProfile(p);
              saveStoredProfile(p);
              // keep user on profile page
            }}
            onBack={() => {
              try { window.history.back(); } catch {};
              setActiveTab('home');
            }}
          />
        )}
      </main>
      

      {/* Bottom Shell Navigation */}
      <BottomNav activeTab={activeTab} onSelectTab={(t) => setActiveTab(t)} lang={lang} />

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        lang={lang}
      />

      {/* Pre-Explainer Permission Gate */}
      {permissionType && (
        <PermissionGate
          isOpen={!!permissionType}
          type={permissionType}
          onGrant={handlePermissionGrant}
          onCancel={handlePermissionCancel}
          lang={lang}
        />
      )}
    </div>
  );
}
