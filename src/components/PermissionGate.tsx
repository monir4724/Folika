import React from 'react';
import { Camera, Mic, MapPin, ShieldCheck, X } from 'lucide-react';

interface PermissionGateProps {
  isOpen: boolean;
  type: 'camera' | 'mic' | 'location';
  onGrant: () => void;
  onCancel: () => void;
  lang: 'bn' | 'en';
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  isOpen,
  type,
  onGrant,
  onCancel,
  lang,
}) => {
  if (!isOpen) return null;

  const content = {
    camera: {
      icon: Camera,
      titleBn: 'Camera Permission Required',
      titleEn: 'Camera Permission Required',
      descBn: 'Grant camera access to scan crop diseases and fish health issues.',
      descEn: 'Grant camera access to scan crop diseases and fish health issues.',
    },
    mic: {
      icon: Mic,
      titleBn: 'Microphone Permission Required',
      titleEn: 'Microphone Permission Required',
      descBn: 'Grant microphone access to ask questions using voice.',
      descEn: 'Grant microphone access to ask questions using voice.',
    },
    location: {
      icon: MapPin,
      titleBn: 'Location Permission Required',
      titleEn: 'Location Permission Required',
      descBn: 'Grant location access to pinpoint your AEZ zone and nearby market prices.',
      descEn: 'Grant location access to pinpoint your AEZ zone and nearby market prices.',
    },
  }[type];

  const Icon = content.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 text-center relative">
        <button
          onClick={onCancel}
          className="absolute top-3 right-3 text-slate-400 hover:text-slate-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
          <Icon className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          {lang === 'bn' ? content.titleBn : content.titleEn}
        </h3>

        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          {lang === 'bn' ? content.descBn : content.descEn}
        </p>

        <div className="flex items-center justify-center space-x-1.5 text-[11px] text-emerald-700 font-medium mb-6 bg-emerald-50 py-1.5 rounded-lg">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'Your privacy is 100% protected' : 'Your privacy is 100% protected'}</span>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition-colors"
          >
            {lang === 'bn' ? 'Cancel' : 'Cancel'}
          </button>
          <button
            onClick={onGrant}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs shadow transition-all active:scale-95"
          >
            {lang === 'bn' ? 'Grant Access' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
};
