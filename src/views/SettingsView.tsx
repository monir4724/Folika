import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { setStoredLanguage, setLiteMode, getStoredLanguage, isLiteMode, saveStoredProfile } from '../utils/storage';
import { ArrowLeft, Globe, Bell, Speaker, Cpu, ShieldCheck, Trash2 } from 'lucide-react';

interface SettingsViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onLangChange: (lang: 'bn' | 'en') => void;
  onSaveProfile: (profile: UserProfile) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ profile, lang, onLangChange, onSaveProfile, isDarkMode, onToggleDarkMode }) => {
  const [language, setLanguage] = useState<'bn' | 'en'>(lang);
  const [notifications, setNotifications] = useState(profile?.notifications || { weatherAlerts: true, marketPrice: true, diseaseOutbreaks: true });
  const [accessibility, setAccessibility] = useState(profile?.accessibility || { tts: false, voiceInput: false });
  const [liteMode, setLiteModeState] = useState<boolean>(isLiteMode());
  const [cacheLabel, setCacheLabel] = useState('Local cache is healthy');

  useEffect(() => {
    setLanguage(lang);
  }, [lang]);

  const applyLanguage = (nextLang: 'bn' | 'en') => {
    setLanguage(nextLang);
    setStoredLanguage(nextLang);
    onLangChange(nextLang);
  };

  const updateNotifications = (field: keyof typeof notifications, value: boolean) => {
    setNotifications((prev) => ({ ...prev, [field]: value }));
  };

  const updateAccessibility = (field: keyof typeof accessibility, value: boolean) => {
    setAccessibility((prev) => ({ ...prev, [field]: value }));
  };

  const handleLiteModeToggle = () => {
    const next = !liteMode;
    setLiteModeState(next);
    setLiteMode(next);
  };

  const handleClearCache = () => {
    try {
      localStorage.removeItem('agri_offline_queue');
      localStorage.removeItem('agri_rotation_logs');
      localStorage.removeItem('agri_saved_animals');
      setCacheLabel('Local cache cleared. Data will resync when online.');
    } catch (e) {
      console.error(e);
      setCacheLabel('Unable to clear local cache.');
    }
  };

  const handleSaveSettings = () => {
    if (!profile) return;
    const nextProfile: UserProfile = {
      ...profile,
      language,
      notifications,
      accessibility,
      updatedAt: new Date().toISOString(),
    };
    saveStoredProfile(nextProfile);
    onSaveProfile(nextProfile);
  };

  const isBn = language === 'bn';

  return (
    <div className="space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
          <p className="text-sm text-slate-500">Manage language, notifications, accessibility, and app mode.</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-slate-900">
              <Globe className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-semibold">Language</h2>
                <p className="text-xs text-slate-500">Choose your preferred interface language.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => applyLanguage('en')}
              className={`rounded-2xl border p-4 text-left transition ${language === 'en' ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
            >
              <p className="text-sm font-semibold">English</p>
              <p className="text-xs text-slate-500">App interface in English.</p>
            </button>
            <button
              onClick={() => applyLanguage('bn')}
              className={`rounded-2xl border p-4 text-left transition ${language === 'bn' ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-200 bg-white hover:border-emerald-300'}`}
            >
              <p className="text-sm font-semibold">বাংলা</p>
              <p className="text-xs text-slate-500">বাংলা ভাষায় ইন্টারফেস।</p>
            </button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">Dark / Light Mode</h3>
                <p className="text-xs text-slate-500">Toggle display theme for comfortable use.</p>
              </div>
              <button
                onClick={onToggleDarkMode}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${isDarkMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {isDarkMode ? 'Dark' : 'Light'}
              </button>
            </div>

            <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="font-semibold text-slate-900">Lite mode</h3>
                <p className="text-xs text-slate-500">Reduce data usage and speed up offline performance.</p>
              </div>
              <button
                onClick={handleLiteModeToggle}
                className={`rounded-full px-4 py-2 text-xs font-semibold transition ${liteMode ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
              >
                {liteMode ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-200 bg-emerald-50 p-4">
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-emerald-700" />
              <div>
                <h3 className="font-semibold text-slate-900">Data & cache</h3>
                <p className="text-xs text-slate-500">Clear local temporary storage if you need a fresh start.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-900">{cacheLabel}</p>
                <p className="text-xs text-slate-500">Crop history, saved animals, and queued sync data remain local.</p>
              </div>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-50 transition"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Local Cache
              </button>
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900 mb-3">
              <Bell className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-lg font-semibold">Notifications</h2>
                <p className="text-xs text-slate-500">Select the alerts you want to keep receiving.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Weather alerts</p>
                  <p className="text-xs text-slate-500">Rain, temperature, and storm warnings.</p>
                </div>
                <input type="checkbox" checked={notifications.weatherAlerts} onChange={(e) => updateNotifications('weatherAlerts', e.target.checked)} />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Market price alerts</p>
                  <p className="text-xs text-slate-500">Fresh price updates for your crops and livestock.</p>
                </div>
                <input type="checkbox" checked={notifications.marketPrice} onChange={(e) => updateNotifications('marketPrice', e.target.checked)} />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Disease outbreak alerts</p>
                  <p className="text-xs text-slate-500">Updates on crop or animal health risks.</p>
                </div>
                <input type="checkbox" checked={notifications.diseaseOutbreaks} onChange={(e) => updateNotifications('diseaseOutbreaks', e.target.checked)} />
              </label>
            </div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900 mb-3">
              <Speaker className="w-5 h-5 text-emerald-600" />
              <div>
                <h2 className="text-lg font-semibold">Accessibility</h2>
                <p className="text-xs text-slate-500">Enable reading and voice-assisted interaction.</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Text-to-speech</p>
                  <p className="text-xs text-slate-500">Read interface items aloud.</p>
                </div>
                <input type="checkbox" checked={accessibility.tts} onChange={(e) => updateAccessibility('tts', e.target.checked)} />
              </label>

              <label className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <div>
                  <p className="font-semibold text-slate-900">Voice input</p>
                  <p className="text-xs text-slate-500">Use microphone input for form fields.</p>
                </div>
                <input type="checkbox" checked={accessibility.voiceInput} onChange={(e) => updateAccessibility('voiceInput', e.target.checked)} />
              </label>
            </div>
          </section>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="font-semibold text-slate-900">Privacy note</span>
            </div>
            <p>Settings are stored locally on this device and do not change your account profile details unless explicitly saved.</p>
          </div>
        </aside>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div>
          <h3 className="font-semibold text-slate-900">Keep preferences updated</h3>
          <p className="text-xs text-slate-500">Saving here preserves language, notification, and accessibility settings for this browser session and device.</p>
        </div>
        <button
          onClick={handleSaveSettings}
          className="inline-flex items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-800 transition"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};
