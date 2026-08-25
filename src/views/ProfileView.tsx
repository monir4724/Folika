import React, { useState } from 'react';
import { UserProfile } from '../types';
import { X, MapPin, Camera, Check } from 'lucide-react';

interface ProfileViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onClose: () => void;
  onSave: (p: UserProfile) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ profile, lang, onClose, onSave }) => {
  const [draft, setDraft] = useState<UserProfile>(
    profile || {
      name: '',
      fullName: '',
      phone: '',
      language: lang,
      farmerTypes: ['crop'],
      notifications: { weatherAlerts: true, marketPrice: true, diseaseOutbreaks: true },
      accessibility: { tts: false, voiceInput: false },
    } as UserProfile
  );

  const isBn = lang === 'bn';

  const handleGeo = async () => {
    if (!navigator.geolocation) return;
    try {
      navigator.geolocation.getCurrentPosition((pos) => {
        setDraft({ ...draft, locationCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      });
    } catch (e) {
      // ignore
    }
  };

  const updateNotifications = (partial: Partial<NonNullable<UserProfile['notifications']>>) => {
    const base = {
      weatherAlerts: draft.notifications?.weatherAlerts ?? true,
      marketPrice: draft.notifications?.marketPrice ?? true,
      diseaseOutbreaks: draft.notifications?.diseaseOutbreaks ?? true,
    };
    setDraft({ ...draft, notifications: { ...base, ...partial } });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl overflow-auto max-h-[90vh] p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">Profile</h3>
          <div className="flex items-center space-x-2">
            <button onClick={handleGeo} className="px-3 py-1 rounded bg-emerald-50 text-emerald-800 text-sm flex items-center space-x-2">
              <MapPin className="w-4 h-4" /> <span>GPS</span>
            </button>
            <button onClick={onClose} className="p-2 rounded bg-emerald-800 text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-xs font-semibold">Full name</label>
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full p-2 rounded border" />

          <label className="text-xs font-semibold">Mobile number</label>
          <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="w-full p-2 rounded border" />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold">District</label>
              <input value={draft.district || ''} onChange={(e) => setDraft({ ...draft, district: e.target.value })} className="w-full p-2 rounded border" />
            </div>
            <div>
              <label className="text-xs font-semibold">Upazila</label>
              <input value={draft.upazila || ''} onChange={(e) => setDraft({ ...draft, upazila: e.target.value })} className="w-full p-2 rounded border" />
            </div>
          </div>

          <label className="text-xs font-semibold">Farmer type</label>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'crop', label: 'Crop' },
              { id: 'livestock', label: 'Livestock' },
              { id: 'fisheries', label: 'Fisheries' },
              { id: 'mixed', label: 'Mixed' },
            ].map((opt) => {
              const active = (draft.farmerTypes || []).includes(opt.id as any);
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    const set = new Set(draft.farmerTypes || []);
                    if (set.has(opt.id as any)) set.delete(opt.id as any);
                    else set.add(opt.id as any);
                    setDraft({ ...draft, farmerTypes: Array.from(set) });
                  }}
                  className={`px-3 py-1 rounded ${active ? 'bg-amber-400 text-emerald-900' : 'border'}`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <label className="text-xs font-semibold">Notifications</label>
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={draft.notifications?.weatherAlerts} onChange={(e) => updateNotifications({ weatherAlerts: e.target.checked })} />
              <span className="text-sm">Weather</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={draft.notifications?.marketPrice} onChange={(e) => updateNotifications({ marketPrice: e.target.checked })} />
              <span className="text-sm">Market</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" checked={draft.notifications?.diseaseOutbreaks} onChange={(e) => updateNotifications({ diseaseOutbreaks: e.target.checked })} />
              <span className="text-sm">Disease</span>
            </label>
          </div>

          <div className="flex items-center justify-end space-x-2 mt-4">
            <button onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString() })} className="px-4 py-2 rounded bg-emerald-800 text-white flex items-center space-x-2">
              <Check className="w-4 h-4" /> <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
