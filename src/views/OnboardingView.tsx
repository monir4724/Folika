import React, { useMemo, useState } from 'react';
import { UserProfile } from '../types';
import { BANGLADESH_AEZ_ZONES } from '../data/aezZones';
import { Sprout, MapPin, CheckCircle, ArrowRight, Phone, ShieldCheck, Sparkles } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (profile: UserProfile) => void;
  lang: 'bn' | 'en';
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete, lang }) => {
  const [step, setStep] = useState<number>(1);
  const [farmerName, setFarmerName] = useState('Rahim Mia');
  const [phone, setPhone] = useState('01712345678');
  const [selectedDistrict, setSelectedDistrict] = useState('Pabna');
  const [selectedUpazila, setSelectedUpazila] = useState('Pabna Sadar');
  const [landArea, setLandArea] = useState(1.5);
  const [primaryInterest, setPrimaryInterest] = useState<'crops' | 'livestock' | 'fisheries' | 'mixed'>('mixed');

  const isNameValid = farmerName.trim().length >= 2;
  const isPhoneValid = /^01[3-9][0-9]{8}$/.test(phone.replace(/\D/g, ''));

  const guideNote = useMemo(() => {
    if (primaryInterest === 'crops') {
      return 'Prioritize crop advice so the top tips are ready for your fields first.';
    }
    if (primaryInterest === 'livestock') {
      return 'Choose this option to see livestock health and vaccination schedules first.';
    }
    if (primaryInterest === 'fisheries') {
      return 'Pond water quality and stocking advice will be most helpful for you.';
    }
    return 'A combined farm setup shows crops, animals, and fish together for better planning.';
  }, [primaryInterest]);

  const handleFinish = () => {
    const matchedAez = BANGLADESH_AEZ_ZONES.find((z) => z.applicableDistrictsBn.some((d) => d.includes(selectedDistrict))) || BANGLADESH_AEZ_ZONES[0];

    // Map legacy single primaryInterest to new farmerTypes array
    const mapInterest = (i: string) => {
      if (i === 'crops') return 'crop';
      if (i === 'livestock') return 'livestock';
      if (i === 'fisheries') return 'fisheries';
      return 'mixed';
    };

    const newProfile: UserProfile = {
      name: farmerName.trim(),
      fullName: farmerName.trim(),
      phone,
      phoneNormalized: phone.replace(/\D/g, '').length === 11 ? `+88${phone.replace(/\D/g, '')}` : undefined,
      language: lang,
      district: selectedDistrict,
      upazila: selectedUpazila,
      aezCode: matchedAez.aezCode,
      aezNameBn: matchedAez.aezNameBn,
      aezNameEn: matchedAez.aezNameEn,
      soilType: matchedAez.soilTypesBn[0] || 'Alluvial loam soil',
      landSizeDecimal: landArea,
      farmerTypes: [mapInterest(primaryInterest) as any],
      notifications: { weatherAlerts: true, marketPrice: true, diseaseOutbreaks: true },
      accessibility: { tts: false, voiceInput: false },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onComplete(newProfile);
  };

  const progressPercent = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="min-h-screen bg-emerald-950 text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-emerald-900 border border-emerald-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-emerald-800/40 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-4 border-b border-emerald-800/80 pb-4">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-black">
              <Sprout className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Folika</h2>
              <p className="text-[11px] text-emerald-300">Bangladesh Smart Agriculture Hub</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-800 text-amber-300 border border-emerald-700">
            Step {step} / 3
          </span>
        </div>

        <div className="mb-5 h-2 rounded-full bg-emerald-800/70 overflow-hidden">
          <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${progressPercent}%` }} />
        </div>

        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-amber-300">Welcome! Your farm digital companion</h3>
              <p className="text-xs text-emerald-200 leading-relaxed">
                Weather, crop advice, livestock health and credit support — all in one place.
              </p>
            </div>

            <div className="space-y-3 bg-emerald-850/60 p-4 rounded-2xl border border-emerald-800">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">Your name</label>
                <input
                  type="text"
                  value={farmerName}
                  onChange={(e) => setFarmerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {!isNameValid && <p className="mt-1 text-[11px] text-amber-300">Enter at least 2 characters.</p>}
              </div>

              <div>
                <label className="text-xs font-semibold text-emerald-200 mb-1 inline-flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1 text-amber-300" />
                  Mobile number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017XXXXXXXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
                {!isPhoneValid && <p className="mt-1 text-[11px] text-amber-300">Enter a valid Bangladeshi number.</p>}
              </div>
            </div>

            <div className="p-3 bg-amber-400/10 border border-amber-400/20 rounded-xl text-xs text-amber-200 flex items-start space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>This information is used to personalize your advice.</span>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!isNameValid || !isPhoneValid}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed text-emerald-950 font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition-all"
            >
              <span>Go to next step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-300 flex items-center">
                <MapPin className="w-5 h-5 mr-1.5 text-amber-300" />
                Select your region and soil profile
              </h3>
              <p className="text-xs text-emerald-200">
                We will tailor guidance and weather insights based on your district and upazila.
              </p>
            </div>

            <div className="space-y-3 bg-emerald-850/60 p-4 rounded-2xl border border-emerald-800">
              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">District</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                >
                  {['Pabna', 'Bogura', 'Cumilla', 'Mymensingh', 'Sylhet', 'Jessore', 'Dinajpur', 'Barishal', 'Rangpur'].map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">Upazila</label>
                <input
                  type="text"
                  value={selectedUpazila}
                  onChange={(e) => setSelectedUpazila(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-emerald-200 mb-1">Land area (bigha/decimal)</label>
                <input
                  type="number"
                  step="0.5"
                  value={landArea}
                  onChange={(e) => setLandArea(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-emerald-950 border border-emerald-700 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-700/70 bg-emerald-950/60 p-3 text-xs text-emerald-200">
              <div className="flex items-center text-amber-300 font-semibold mb-1">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Suggestion for your area</span>
              </div>
              <p>{selectedDistrict} advice is more precise for your weather and soil.</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="w-1/3 py-3 px-3 rounded-xl border border-emerald-700 text-emerald-200 font-semibold text-xs hover:bg-emerald-800"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-2/3 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5 animate-fade-in">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-amber-300">Your primary farm focus</h3>
              <p className="text-xs text-emerald-200">This choice will surface the tools you need most on the home screen.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'crops', label: '🌾 Crops & Vegetables', desc: 'Rice, wheat, potato and vegetables' },
                { id: 'livestock', label: '🐄 Livestock Farming', desc: 'Cattle, goats and poultry' },
                { id: 'fisheries', label: '🐟 Fisheries', desc: 'Carp, tilapia and shrimp' },
                { id: 'mixed', label: '🔄 Integrated Farm', desc: 'Crops, livestock and fish together' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setPrimaryInterest(cat.id as 'crops' | 'livestock' | 'fisheries' | 'mixed')}
                  className={`p-3.5 rounded-2xl border text-left transition-all ${
                    primaryInterest === cat.id
                      ? 'bg-amber-400/20 border-amber-400 text-white ring-2 ring-amber-400'
                      : 'bg-emerald-950/80 border-emerald-800 text-emerald-200 hover:border-emerald-700'
                  }`}
                >
                  <span className="block font-bold text-sm text-amber-300 mb-1">{cat.label}</span>
                  <span className="block text-[11px] text-emerald-300 leading-tight">{cat.desc}</span>
                </button>
              ))}
            </div>

            <div className="p-3.5 bg-emerald-850 rounded-2xl border border-emerald-800 text-xs text-emerald-200 space-y-2">
              <div className="flex items-center text-amber-300 font-semibold">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                <span>Your setup summary</span>
              </div>
              <p>Farmer: {farmerName} | Area: {selectedDistrict}, {selectedUpazila}</p>
              <p className="text-emerald-100">{guideNote}</p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setStep(2)}
                className="w-1/3 py-3 px-3 rounded-xl border border-emerald-700 text-emerald-200 font-semibold text-xs hover:bg-emerald-800"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="w-2/3 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-sm shadow-lg flex items-center justify-center space-x-2"
              >
                <span>Enter app</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
