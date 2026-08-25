import React, { useState, useMemo } from 'react';
import { UserProfile } from '../types';
import { ArrowLeft, Camera, Check, CheckCircle, Globe } from 'lucide-react';
import bdAdmin from '../data/bd_admin.json';

interface ProfilePageProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onSave: (p: UserProfile) => void;
  onBack: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ profile, lang, onSave, onBack }) => {
  const isBn = lang === 'bn';
  const [draft, setDraft] = useState<UserProfile>(
    profile || ({
      name: '',
      fullName: '',
      phone: '',
      language: lang,
      farmerTypes: ['crop'],
      notifications: { weatherAlerts: true, marketPrice: true, diseaseOutbreaks: true },
      accessibility: { tts: false, voiceInput: false },
    } as UserProfile)
  );

  const admin = bdAdmin as any;

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setDraft({ ...draft, profilePhoto: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  const isPhoneValid = (p?: string) => {
    if (!p) return false;
    const digits = p.replace(/\D/g, '');
    return /^01[3-9][0-9]{8}$/.test(digits) || /^8801[3-9][0-9]{8}$/.test(digits) || /^\+8801[3-9][0-9]{8}$/.test(p);
  };

  // Location helpers
  const divisions = useMemo(() => admin.divisions || [], [admin]);
  const selectedDivision = divisions.find((d: any) => d.nameEn === draft.division || d.nameBn === draft.division);
  const districts = selectedDivision ? selectedDivision.districts : [];
  const selectedDistrict = districts.find((di: any) => di.nameEn === draft.district || di.nameBn === draft.district);
  const upazilas = selectedDistrict ? (selectedDistrict.upazilasBn || selectedDistrict.upazilas) : [];

  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const requestGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by this browser.');
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setDraft({ ...draft, locationCoords: { lat: pos.coords.latitude, lng: pos.coords.longitude } });
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Permission denied — location access was denied.');
        } else {
          setGpsError('Unable to retrieve location.');
        }
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // Farmer type helpers
  const farmerOptions: { key: UserProfile['farmerTypes'][0]; labelBn: string; labelEn: string }[] = [
    { key: 'crop', labelBn: 'Crop farming', labelEn: 'Crop farming' },
    { key: 'fisheries', labelBn: 'Fisheries', labelEn: 'Fisheries' },
    { key: 'livestock', labelBn: 'Livestock', labelEn: 'Livestock' },
    { key: 'mixed', labelBn: 'Mixed', labelEn: 'Mixed' },
  ];

  const toggleFarmerType = (t: any) => {
    const exists = draft.farmerTypes?.includes(t);
    const next = exists ? draft.farmerTypes!.filter((x) => x !== t) : [...(draft.farmerTypes || []), t];
    setDraft({ ...draft, farmerTypes: next });
  };

  const saveHandler = () => {
    onSave({ ...draft, updatedAt: new Date().toISOString() });
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <div className="max-w-3xl mx-auto p-4">
        <div className="flex items-center space-x-3 mb-4">
          <button onClick={onBack} className="p-2 rounded-md bg-emerald-100 text-emerald-800">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-xl font-bold">Profile</h1>
        </div>

        <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
          {/* Farmer type multi-select */}
          <div className="mb-4">
            <label className="block text-sm font-semibold mb-2">Farmer type (multi-select)</label>
            <div className="flex flex-wrap gap-2">
              {farmerOptions.map((opt) => {
                const selected = draft.farmerTypes?.includes(opt.key as any);
                return (
                  <button
                    key={opt.key}
                    onClick={() => toggleFarmerType(opt.key)}
                    className={`px-3 py-2 rounded-lg border transition-flex text-sm flex items-center space-x-2 ${
                      selected ? 'bg-amber-400 text-white border-amber-500' : 'bg-white text-slate-700 border-slate-300'
                    }`}
                  >
                    {selected ? <CheckCircle className="w-4 h-4 text-white" /> : <span className="w-4 h-4" />}
                    <span>{isBn ? opt.labelBn : opt.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div>
              {draft.profilePhoto ? (
                <img src={draft.profilePhoto} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-amber-300" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-emerald-200 flex items-center justify-center text-emerald-800">P</div>
              )}
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold mb-1">Full name</label>
              <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full p-2 rounded border" />
              <label className="block text-xs font-semibold mt-3 mb-1">Mobile number</label>
              <input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} className="w-full p-2 rounded border" />
              {!isPhoneValid(draft.phone) && <p className="text-xs text-amber-600 mt-1">Enter a valid Bangladeshi number (01X.. or +8801X..)</p>}
            </div>
          </div>

          {/* Location section */}
          <div className="mt-4">
            <label className="text-sm font-semibold">Location</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2">
              <select value={draft.division || ''} onChange={(e) => { setDraft({ ...draft, division: e.target.value, district: undefined, upazila: undefined }); }} className="p-2 rounded border">
                <option value="">Select division</option>
                {divisions.map((d: any) => (<option key={d.nameEn} value={d.nameEn}>{d.nameEn}</option>))}
              </select>

              <select value={draft.district || ''} onChange={(e) => { setDraft({ ...draft, district: e.target.value, upazila: undefined }); }} className="p-2 rounded border">
                <option value="">Select district</option>
                {districts.map((di: any) => (<option key={di.nameEn} value={di.nameEn}>{di.nameEn}</option>))}
              </select>

              <select value={draft.upazila || ''} onChange={(e) => setDraft({ ...draft, upazila: e.target.value })} className="p-2 rounded border">
                <option value="">Select upazila</option>
                {upazilas.map((u: any, idx: number) => (<option key={idx} value={u}>{u}</option>))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              <input value={draft.union || ''} onChange={(e) => setDraft({ ...draft, union: e.target.value })} placeholder="Union" className="p-2 rounded border" />
              <input value={draft.village || ''} onChange={(e) => setDraft({ ...draft, village: e.target.value })} placeholder="Village / Town" className="p-2 rounded border" />
            </div>

            <div className="mt-3 flex items-center space-x-3">
              <button onClick={requestGPS} className="px-3 py-2 rounded bg-emerald-800 text-white flex items-center space-x-2">
                <Globe className="w-4 h-4" />
                <span>{gpsLoading ? 'Locating...' : 'Use GPS'}</span>
              </button>
              <div>
                {draft.locationCoords ? (
                  <div className="text-sm text-slate-700">Coordinates: {draft.locationCoords.lat.toFixed(5)}, {draft.locationCoords.lng.toFixed(5)}</div>
                ) : <div className="text-sm text-slate-500">No GPS coordinates</div>}
                {gpsError && <div className="text-xs text-rose-600 mt-1">{gpsError}</div>}
              </div>
            </div>
          </div>

          {/* Profile photo */}
          <div className="mt-3">
              <label className="text-xs font-semibold">Profile photo</label>
              <div className="flex items-center space-x-3 mt-2">
                <label className="px-3 py-2 bg-emerald-700 text-white rounded flex items-center space-x-2 cursor-pointer">
                  <Camera className="w-4 h-4" />
                  <span className="text-sm">Upload</span>
                  <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
                </label>
                <span className="text-sm text-slate-600">Image is stored locally (preview only).</span>
              </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">Preferred language</label>
              <select value={draft.language} onChange={(e) => setDraft({ ...draft, language: e.target.value as 'bn' | 'en' })} className="w-full p-2 rounded border">
                <option value="bn">Bangla / Bengali</option>
                <option value="en">English</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold">Last saved/updated</label>
              <div className="p-2 rounded border text-sm text-slate-600">{draft.updatedAt ? new Date(draft.updatedAt).toLocaleString() : 'Not saved yet'}</div>
            </div>
          </div>

          {/* Dynamic domain sections */}
          {draft.farmerTypes?.includes('crop') && (
            <div className="mt-4 p-3 rounded-lg border bg-white">
              <h3 className="font-semibold mb-2">Crop farming details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="number" value={draft.landSizeDecimal || ''} onChange={(e) => setDraft({ ...draft, landSizeDecimal: Number(e.target.value) || undefined })} placeholder="Land size (decimal)" className="p-2 rounded border" />
                <select value={draft.landUnit || 'decimal'} onChange={(e) => setDraft({ ...draft, landUnit: e.target.value as any })} className="p-2 rounded border">
                  <option value="decimal">Decimal</option>
                  <option value="bigha">Bigha</option>
                  <option value="acre">Acre</option>
                  <option value="hectare">Hectare</option>
                </select>
                <select value={draft.ownershipType || ''} onChange={(e) => setDraft({ ...draft, ownershipType: e.target.value as any })} className="p-2 rounded border">
                  <option value="">Ownership</option>
                  <option value="own">Own</option>
                  <option value="leased">Leased</option>
                  <option value="sharecropped">Sharecropped</option>
                </select>
              </div>

              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input value={draft.soilType || ''} onChange={(e) => setDraft({ ...draft, soilType: e.target.value })} placeholder="Soil type (optional)" className="p-2 rounded border" />
                <input value={(draft.currentCrops || []).join(', ')} onChange={(e) => setDraft({ ...draft, currentCrops: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="Current crops/varieties (comma separated)" className="p-2 rounded border" />
              </div>

              <div className="mt-2">
                <label className="text-sm">Irrigation source</label>
                <select value={draft.irrigationSource || ''} onChange={(e) => setDraft({ ...draft, irrigationSource: e.target.value })} className="w-full p-2 rounded border mt-1">
                  <option value="">Choose</option>
                  <option value="tube_well">Tube well</option>
                  <option value="canal">Canal</option>
                  <option value="rain_fed">Rain-fed</option>
                </select>
              </div>
            </div>
          )}

          {draft.farmerTypes?.includes('fisheries') && (
            <div className="mt-4 p-3 rounded-lg border bg-white">
              <h3 className="font-semibold mb-2">Fisheries details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input type="number" value={draft.fisheries?.ponds || ''} onChange={(e) => setDraft({ ...draft, fisheries: { ...(draft.fisheries || {}), ponds: Number(e.target.value) || undefined } })} placeholder="Number of ponds" className="p-2 rounded border" />
                <input type="number" value={draft.fisheries?.totalAreaDecimal || ''} onChange={(e) => setDraft({ ...draft, fisheries: { ...(draft.fisheries || {}), totalAreaDecimal: Number(e.target.value) || undefined } })} placeholder="Total area (decimal)" className="p-2 rounded border" />
                <input type="number" value={draft.fisheries?.averageDepthMeter || ''} onChange={(e) => setDraft({ ...draft, fisheries: { ...(draft.fisheries || {}), averageDepthMeter: Number(e.target.value) || undefined } })} placeholder="Average depth (m)" className="p-2 rounded border" />
              </div>
              <div className="mt-2">
                <input value={(draft.fisheries?.species || []).join(', ')} onChange={(e) => setDraft({ ...draft, fisheries: { ...(draft.fisheries || {}), species: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } })} placeholder="Species (comma separated)" className="p-2 rounded border w-full" />
              </div>
            </div>
          )}

          {draft.farmerTypes?.includes('livestock') && (
            <div className="mt-4 p-3 rounded-lg border bg-white">
              <h3 className="font-semibold mb-2">Livestock details</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <input type="number" value={draft.livestock?.counts?.cattle || ''} onChange={(e) => setDraft({ ...draft, livestock: { ...(draft.livestock || {}), counts: { ...(draft.livestock?.counts || {}), cattle: Number(e.target.value) || undefined } } })} placeholder="Cattle" className="p-2 rounded border" />
                <input type="number" value={draft.livestock?.counts?.buffalo || ''} onChange={(e) => setDraft({ ...draft, livestock: { ...(draft.livestock || {}), counts: { ...(draft.livestock?.counts || {}), buffalo: Number(e.target.value) || undefined } } })} placeholder="Buffalo" className="p-2 rounded border" />
                <input type="number" value={draft.livestock?.counts?.goat || ''} onChange={(e) => setDraft({ ...draft, livestock: { ...(draft.livestock || {}), counts: { ...(draft.livestock?.counts || {}), goat: Number(e.target.value) || undefined } } })} placeholder="Goat" className="p-2 rounded border" />
                <input type="number" value={draft.livestock?.counts?.poultry || ''} onChange={(e) => setDraft({ ...draft, livestock: { ...(draft.livestock || {}), counts: { ...(draft.livestock?.counts || {}), poultry: Number(e.target.value) || undefined } } })} placeholder="Poultry" className="p-2 rounded border" />
              </div>
            </div>
          )}

          {/* Financial / Support Info */}
          <div className="mt-4 p-3 rounded-lg border bg-white">
<h3 className="font-semibold mb-2">Financial / Support</h3>
              <div className="flex items-center space-x-3">
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={!!draft.hasBankAccount} onChange={(e) => setDraft({ ...draft, hasBankAccount: e.target.checked })} className="mr-2" />
                  <span>Has bank account</span>
              </label>
            </div>

            <div className="mt-2">
              <label className="block text-sm">Mobile banking providers</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['bKash', 'Nagad', 'Rocket', 'Upay'].map((p) => (
                  <label key={p} className="inline-flex items-center px-2 py-1 border rounded">
                    <input type="checkbox" checked={(draft.mobileBankingProviders || []).includes(p)} onChange={(e) => {
                      const cur = new Set(draft.mobileBankingProviders || []);
                      if (e.target.checked) cur.add(p); else cur.delete(p);
                      setDraft({ ...draft, mobileBankingProviders: Array.from(cur) });
                    }} className="mr-2" />
                    <span>{p}</span>
                  </label>
                ))}
              </div>

              <div className="mt-3">
                <label className="inline-flex items-center">
                  <input type="checkbox" checked={!!draft.cooperativeMember?.member} onChange={(e) => setDraft({ ...draft, cooperativeMember: { member: e.target.checked, name: draft.cooperativeMember?.name } })} className="mr-2" />
                  <span>Member of cooperative / samity</span>
                </label>
                {draft.cooperativeMember?.member && (
                  <input value={draft.cooperativeMember?.name || ''} onChange={(e) => setDraft({ ...draft, cooperativeMember: { member: draft.cooperativeMember?.member ?? true, name: e.target.value } })} placeholder="Coop name (optional)" className="w-full p-2 mt-2 rounded border" />
                )}
              </div>
            </div>
          </div>

          {/* App Settings */}
          <div className="mt-4 p-3 rounded-lg border bg-white">
              <h3 className="font-semibold mb-2">App settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!draft.notifications?.weatherAlerts} onChange={(e) => setDraft({ ...draft, notifications: { weatherAlerts: e.target.checked, marketPrice: draft.notifications?.marketPrice ?? false, diseaseOutbreaks: draft.notifications?.diseaseOutbreaks ?? false } })} />
                  <span>Weather alerts</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!draft.notifications?.marketPrice} onChange={(e) => setDraft({ ...draft, notifications: { weatherAlerts: draft.notifications?.weatherAlerts ?? false, marketPrice: e.target.checked, diseaseOutbreaks: draft.notifications?.diseaseOutbreaks ?? false } })} />
                  <span>Market price updates</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!draft.notifications?.diseaseOutbreaks} onChange={(e) => setDraft({ ...draft, notifications: { weatherAlerts: draft.notifications?.weatherAlerts ?? false, marketPrice: draft.notifications?.marketPrice ?? false, diseaseOutbreaks: e.target.checked } })} />
                  <span>Disease outbreak alerts</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!draft.accessibility?.tts} onChange={(e) => setDraft({ ...draft, accessibility: { tts: e.target.checked, voiceInput: draft.accessibility?.voiceInput ?? false } })} />
                  <span>Text-to-speech (read aloud)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input type="checkbox" checked={!!draft.accessibility?.voiceInput} onChange={(e) => setDraft({ ...draft, accessibility: { tts: draft.accessibility?.tts ?? false, voiceInput: e.target.checked } })} />
                  <span>Voice input for form fields</span>
                </label>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => onSave({ ...draft, updatedAt: new Date().toISOString() })}
              className="px-4 py-2 rounded bg-emerald-800 text-white flex items-center space-x-2"
            >
              <Check className="w-4 h-4" />
              <span>Save</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
