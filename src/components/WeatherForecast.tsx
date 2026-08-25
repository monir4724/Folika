import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { formatNumeral } from '../utils/numerals';
import { getWeatherApiInsight } from '../services/api';
import { AEZ_SPECIAL_ZONES } from '../data/aezZones';
import {
  CloudSun,
  CloudRain,
  Sun,
  Wind,
  Droplets,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Volume2,
  Calendar,
  ShieldAlert,
  Sprout,
  Waves,
  HeartPulse,
  CheckCircle2,
  XCircle,
  Thermometer,
  Eye,
  Umbrella,
  Compass,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles
} from 'lucide-react';

interface WeatherForecastProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
  onNavigateToCrop?: () => void;
  onNavigateToLivestock?: () => void;
  onNavigateToFisheries?: () => void;
}

interface DistrictCoord {
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
  aezCode: string;
  aezNameBn: string;
  zoneFlags: string[];
}

// Key Bangladesh District Coordinates & Centroids for Geolocation Reverse Match
const BD_DISTRICTS: DistrictCoord[] = [
  { nameBn: 'পাবনা', nameEn: 'Pabna', lat: 24.0063, lng: 89.2497, aezCode: 'aez_cold_belt', aezNameBn: 'পাবনা পলি অঞ্চল (AEZ-11)', zoneFlags: ['cold_belt'] },
  { nameBn: 'রাজশাহী', nameEn: 'Rajshahi', lat: 24.3745, lng: 88.6042, aezCode: 'aez_barind_drought', aezNameBn: 'বরেন্দ্র খরাপ্রবণ অঞ্চল (AEZ-26)', zoneFlags: ['barind_drought'] },
  { nameBn: 'রংপুর', nameEn: 'Rangpur', lat: 25.7439, lng: 89.2752, aezCode: 'aez_cold_belt', aezNameBn: 'উত্তর অঞ্চল শৈত্যপ্রবাহ বেল্ট (AEZ-3)', zoneFlags: ['cold_belt'] },
  { nameBn: 'সুনামগঞ্জ', nameEn: 'Sunamganj', lat: 25.0657, lng: 91.395, aezCode: 'aez_haor_flashflood', aezNameBn: 'হাওর ও বন্যা অববাহিকা (AEZ-21)', zoneFlags: ['haor_flashflood'] },
  { nameBn: 'সিলেট', nameEn: 'Sylhet', lat: 24.8949, lng: 91.8687, aezCode: 'aez_haor_flashflood', aezNameBn: 'সুরমা-কুশিয়ারা প্লাবনভূমি (AEZ-20)', zoneFlags: ['haor_flashflood'] },
  { nameBn: 'খুলনা', nameEn: 'Khulna', lat: 22.8456, lng: 89.5403, aezCode: 'aez_coastal_saline', aezNameBn: 'উপকূলীয় লবণাক্ত অঞ্চল (AEZ-13)', zoneFlags: ['coastal_saline'] },
  { nameBn: 'সাতক্ষীরা', nameEn: 'Satkhira', lat: 22.7185, lng: 89.0705, aezCode: 'aez_coastal_saline', aezNameBn: 'উপকূলীয় লোনা ঘের বেল্ট (AEZ-13)', zoneFlags: ['coastal_saline'] },
  { nameBn: 'বগুড়া', nameEn: 'Bogura', lat: 24.8481, lng: 89.373, aezCode: 'aez_barind_drought', aezNameBn: 'করতোয়া-আত্রাই পলি অববাহিকা (AEZ-25)', zoneFlags: ['barind_drought'] },
  { nameBn: 'কুড়িগ্রাম', nameEn: 'Kurigram', lat: 25.8054, lng: 89.6361, aezCode: 'aez_char_land', aezNameBn: 'ব্রহ্মপুত্র নদীর চর অঞ্চল (AEZ-2)', zoneFlags: ['char_land'] },
  { nameBn: 'ঢাকা', nameEn: 'Dhaka', lat: 23.8103, lng: 90.4125, aezCode: 'aez_general', aezNameBn: 'মধুপুড় গড় পলি সমভূমি (AEZ-28)', zoneFlags: [] },
  { nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', lat: 24.7471, lng: 90.4203, aezCode: 'aez_general', aezNameBn: 'পুরাতন ব্রহ্মপুত্র প্লাবনভূমি (AEZ-9)', zoneFlags: [] },
  { nameBn: 'কুমিল্লা', nameEn: 'Cumilla', lat: 23.4607, lng: 91.1809, aezCode: 'aez_general', aezNameBn: 'মেঘনা নদীর পলি অববাহিকা (AEZ-19)', zoneFlags: [] },
  { nameBn: 'বরিশাল', nameEn: 'Barishal', lat: 22.701, lng: 90.3535, aezCode: 'aez_coastal_saline', aezNameBn: 'গঙ্গা জোয়ার-ভাটা প্লাবনভূমি (AEZ-12)', zoneFlags: ['coastal_saline'] },
  { nameBn: 'কক্সবাজার', nameEn: 'Cox\'s Bazar', lat: 21.4272, lng: 92.0058, aezCode: 'aez_dual_stress', aezNameBn: 'চট্টগ্রাম উপকূলীয় সামুদ্রিক অঞ্চল (AEZ-23)', zoneFlags: ['coastal_saline', 'dual_stress'] },
];

// Haversine formula to compute distance between coordinates in km
function computeHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const WeatherForecastCard: React.FC<WeatherForecastProps> = ({
  profile,
  lang,
  onNavigateToCrop,
  onNavigateToLivestock,
  onNavigateToFisheries,
}) => {
  const isBn = lang === 'bn';

  // Selected or Detected Region State
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictCoord>(() => {
    if (profile?.district) {
      const match = BD_DISTRICTS.find(
        (d) => d.nameBn.includes(profile.district) || d.nameEn.toLowerCase() === profile.district.toLowerCase()
      );
      if (match) return match;
    }
    return BD_DISTRICTS[0]; // Default: Pabna
  });

  // Geolocation & GPS State
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied' | 'error'>('idle');
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoErrorMessage, setGeoErrorMessage] = useState<string | null>(null);

  // View state
  const [showFiveDayForecast, setShowFiveDayForecast] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Simulated dynamic weather calculation based on district coordinates and current time seed
  const [weatherData, setWeatherData] = useState(() => getDistrictWeatherData(selectedDistrict));
  const [liveWeatherInsight, setLiveWeatherInsight] = useState<{summary:string; risk:string} | null>(null);

  useEffect(() => {
    setWeatherData(getDistrictWeatherData(selectedDistrict));
  }, [selectedDistrict]);

  useEffect(() => {
    let isMounted = true;
    const loadInsight = async () => {
      const result = await getWeatherApiInsight({ district: selectedDistrict.nameEn, lang: 'en' });
      if (isMounted) {
        setLiveWeatherInsight(result.data);
      }
    };

    loadInsight();
    return () => { isMounted = false; };
  }, [selectedDistrict.nameEn, isBn]);

  // Handle HTML5 Geolocation detection
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('error');
      setGeoErrorMessage('Geolocation is not supported by your browser.');
      return;
    }

    setGeoStatus('loading');
    setGeoErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGeoCoords({ lat, lng });

        // Find closest Bangladesh District via Haversine distance
        let closest = BD_DISTRICTS[0];
        let minDistance = Infinity;

        BD_DISTRICTS.forEach((d) => {
          const dist = computeHaversineDistance(lat, lng, d.lat, d.lng);
          if (dist < minDistance) {
            minDistance = dist;
            closest = d;
          }
        });

        setSelectedDistrict(closest);
        setGeoStatus('success');
      },
      (error) => {
        setGeoStatus('denied');
        if (error.code === error.PERMISSION_DENIED) {
          setGeoErrorMessage('GPS permission denied. Select district manually.');
        } else {
          setGeoErrorMessage('Failed to fetch location.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // TTS Read Aloud Weather Advisory
  const handleSpeakWeather = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `Current temperature in ${selectedDistrict.nameEn} is ${weatherData.temp} degrees Celsius. Weather condition: ${weatherData.conditionEn}. Rain probability: ${weatherData.rainProb} percent. Advisory: ${weatherData.primaryAgriAlertEn}`;

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'en-US';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="bg-linear-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-700/60 relative overflow-hidden space-y-5">
      {/* Background Decorative Blur Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header: Title + Location Selector + GPS Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10 border-b border-emerald-800/80 pb-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600/30 text-amber-300 rounded-xl border border-emerald-500/40">
              <CloudSun className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>{'Agri Weather & Advisory'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-semibold">
                  {'LIVE'}
                </span>
              </h3>
              <p className="text-xs text-emerald-200/80">{'GPS-based smart weather alerts for farmers'}</p>
            </div>
          </div>
        </div>

        {/* Location Picker + Geolocation Button */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          {/* Manual District Dropdown */}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={selectedDistrict.nameEn}
              onChange={(e) => {
                const match = BD_DISTRICTS.find((d) => d.nameEn === e.target.value);
                if (match) setSelectedDistrict(match);
              }}
              className="w-full bg-emerald-900/90 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl px-3 py-2 pr-7 border border-emerald-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer appearance-none"
            >
              {BD_DISTRICTS.map((d) => (
                <option key={d.nameEn} value={d.nameEn} className="bg-slate-900 text-white">
                  📍 {d.nameEn} ({d.aezCode})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-300 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleDetectLocation}
            disabled={geoStatus === 'loading'}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer shrink-0 ${
              geoStatus === 'success'
                ? 'bg-emerald-600 text-white border border-emerald-400'
                : 'bg-amber-400 hover:bg-amber-300 text-emerald-950 border border-amber-300'
            }`}
            title={'Detect my GPS location'}
          >
            {geoStatus === 'loading' ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-950" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">{geoStatus === 'loading' ? 'Locating...' : 'GPS'}</span>
          </button>

          {/* Voice Speaker Button */}
          <button
            onClick={handleSpeakWeather}
            className={`p-2 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer border ${
              isSpeaking
                ? 'bg-rose-500 text-white border-rose-400 animate-bounce'
                : 'bg-emerald-800/80 hover:bg-emerald-700 text-amber-300 border border-emerald-600'
            }`}
            title={'Listen Weather Report'}
          >
            <Volume2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Location GPS Status Alert Message (If Error or GPS Success) */}
      {geoStatus === 'success' && geoCoords && (
        <div className="bg-emerald-900/60 border border-emerald-500/40 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-200">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{`GPS matched your region: ${selectedDistrict.nameEn} (${selectedDistrict.aezCode})`}</span>
          </span>
          <span className="text-[10px] text-emerald-300 font-mono hidden md:inline">
            [{geoCoords.lat.toFixed(2)}°, {geoCoords.lng.toFixed(2)}°]
          </span>
        </div>
      )}

      {geoErrorMessage && (
        <div className="bg-amber-950/60 border border-amber-500/40 rounded-xl p-2.5 flex items-center space-x-2 text-xs text-amber-200">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{geoErrorMessage}</span>
        </div>
      )}

      {liveWeatherInsight && (
        <div className="bg-slate-950/40 border border-emerald-700/50 rounded-2xl p-3 text-sm text-emerald-50 space-y-1 relative z-10">
          <div className="flex items-center space-x-2 text-emerald-200">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span className="font-semibold">{'Live weather insight'}</span>
          </div>
          <p className="text-sm leading-relaxed">{liveWeatherInsight.summary}</p>
          <p className="text-xs text-amber-300">{liveWeatherInsight.risk}</p>
        </div>
      )}

      {/* Main Weather Hero Card Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch relative z-10">
        {/* Left Column: Big Current Weather Display (5 Cols) */}
        <div className="md:col-span-5 bg-emerald-900/40 rounded-2xl p-4 sm:p-5 border border-emerald-700/50 flex flex-col justify-between space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-1.5 text-xs text-emerald-200 font-medium mb-1">
                <MapPin className="w-3.5 h-3.5 text-amber-300" />
                <span>{selectedDistrict.nameEn}</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-emerald-800 rounded text-emerald-300">
                  {selectedDistrict.aezCode}
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-baseline space-x-1">
                <span>{formatNumeral(weatherData.temp, lang)}</span>
                <span className="text-lg text-amber-300">°C</span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5">{`Feels like ${weatherData.feelsLike}°C`}</p>
            </div>

            {/* Weather Condition Big Icon */}
            <div className="text-right flex flex-col items-end">
              <div className="p-3 bg-amber-400/20 text-amber-300 rounded-2xl border border-amber-400/30 mb-1">
                {weatherData.conditionType === 'rain' && <CloudRain className="w-10 h-10 text-cyan-300 animate-bounce" />}
                {weatherData.conditionType === 'cloudy' && <CloudSun className="w-10 h-10 text-amber-300" />}
                {weatherData.conditionType === 'sunny' && <Sun className="w-10 h-10 text-amber-400 animate-spin-slow" />}
                {weatherData.conditionType === 'cold' && <Thermometer className="w-10 h-10 text-blue-300" />}
              </div>
              <span className="text-xs font-bold text-amber-300">{weatherData.conditionEn}</span>
            </div>
          </div>

          {/* Quick Metrics Grid (4 items) */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-emerald-800/80">
            <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/60 flex items-center space-x-2">
              <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{'Humidity'}</span>
                <span className="font-bold text-white">{formatNumeral(weatherData.humidity, lang)}%</span>
              </div>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/60 flex items-center space-x-2">
              <Umbrella className="w-4 h-4 text-blue-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{'Rain Prob'}</span>
                <span className="font-bold text-amber-300">{formatNumeral(weatherData.rainProb, lang)}%</span>
              </div>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/60 flex items-center space-x-2">
              <Wind className="w-4 h-4 text-emerald-300 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{'Wind Speed'}</span>
                <span className="font-bold text-white">{formatNumeral(weatherData.windSpeed, lang)} km/h</span>
              </div>
            </div>

            <div className="bg-emerald-950/50 p-2 rounded-xl border border-emerald-800/60 flex items-center space-x-2">
              <Compass className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 block">{'Wind Dir'}</span>
                <span className="font-bold text-white">{weatherData.windDirEn}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Agricultural Action Advisories & Smart Spray Windows (7 Cols) */}
        <div className="md:col-span-7 space-y-3 flex flex-col justify-between">
          {/* Smart Agricultural Alert Banner */}
          <div className={`p-4 rounded-2xl border shadow-sm ${weatherData.alertSeverityBg}`}>
            <div className="flex items-start space-x-2.5">
              <div className="p-2 rounded-xl bg-white/10 shrink-0 mt-0.5">
                <ShieldAlert className="w-5 h-5 text-amber-300 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">{'Urgent Agri Weather Advisory'}</span>
                  {selectedDistrict.zoneFlags.length > 0 && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                      {selectedDistrict.zoneFlags[0]}
                    </span>
                  )}
                </div>
                <p className="text-sm font-extrabold text-white mt-0.5 leading-snug">{weatherData.primaryAgriAlertEn}</p>
                <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">{weatherData.secondaryAgriAdviceEn}</p>
              </div>
            </div>
          </div>

          {/* Spraying & Irrigation Feasibility Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            {/* Spraying Window Status Card */}
            <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/60 flex items-start space-x-2.5">
              <div className={`p-2 rounded-lg shrink-0 ${weatherData.canSpray ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                {weatherData.canSpray ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">{'Pesticide Spray Window'}</span>
                <span className={`text-xs font-extrabold block mt-0.5 ${weatherData.canSpray ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {weatherData.canSpray ? '🟢 Safe to Spray Today' : '🔴 Avoid Spraying Today'}
                </span>
                <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-tight">{weatherData.sprayReasonEn}</p>
              </div>
            </div>

            {/* Irrigation Requirement Card */}
            <div className="bg-emerald-900/50 p-3 rounded-xl border border-emerald-700/60 flex items-start space-x-2.5">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300 shrink-0">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-300 block">{'Irrigation Directive'}</span>
                <span className="text-xs font-extrabold text-blue-300 block mt-0.5">{weatherData.irrigationStatusEn}</span>
                <p className="text-[11px] text-emerald-200/80 mt-0.5 leading-tight">{weatherData.irrigationNoteEn}</p>
              </div>
            </div>
          </div>

          {/* Domain Category Fast Links */}
          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-emerald-300/80 font-medium">{'Explore detailed module advisory:'}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={onNavigateToCrop}
                className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 border border-emerald-600 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Sprout className="w-3 h-3 text-amber-300" />
                <span>{'Crop'}</span>
              </button>
              <button
                onClick={onNavigateToFisheries}
                className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-cyan-200 border border-emerald-600 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <Waves className="w-3 h-3 text-cyan-300" />
                <span>{'Fish'}</span>
              </button>
              <button
                onClick={onNavigateToLivestock}
                className="px-2.5 py-1 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-rose-200 border border-emerald-600 transition-colors cursor-pointer flex items-center space-x-1"
              >
                <HeartPulse className="w-3 h-3 text-rose-300" />
                <span>{'Livestock'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Toggle 5-Day Forecast View */}
      <div className="pt-2 border-t border-emerald-800/80 relative z-10">
        <button
          onClick={() => setShowFiveDayForecast(!showFiveDayForecast)}
          className="w-full py-2 px-4 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 text-amber-300 text-xs font-bold border border-emerald-700/60 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-amber-300" />
          <span>
            {showFiveDayForecast
              ? isBn
                ? '৫ দিনের পূর্বাভাস লুকান'
                : 'Hide 5-Day Forecast'
              : isBn
              ? '৫ দিনের আগাম কৃষি আবহাওয়া পূর্বাভাস দেখুন'
              : 'View 5-Day Agricultural Weather Forecast'}
          </span>
          {showFiveDayForecast ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showFiveDayForecast && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2.5 animate-fadeIn">
            {weatherData.fiveDayForecast.map((day, idx) => (
              <div
                key={idx}
                className="bg-emerald-950/80 p-3 rounded-2xl border border-emerald-700/60 text-center space-y-1.5 flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs font-bold text-amber-300 block">{day.dayEn}</span>
                  <span className="text-[10px] text-slate-400 block">{day.dateEn}</span>
                </div>

                <div className="my-1 flex justify-center">
                  {day.conditionType === 'rain' && <CloudRain className="w-7 h-7 text-cyan-300" />}
                  {day.conditionType === 'cloudy' && <CloudSun className="w-7 h-7 text-amber-300" />}
                  {day.conditionType === 'sunny' && <Sun className="w-7 h-7 text-amber-400" />}
                </div>

                <div>
                  <div className="text-xs font-extrabold text-white">
                    {formatNumeral(day.tempHigh, lang)}° / {formatNumeral(day.tempLow, lang)}°C
                  </div>
                  <div className="text-[10px] text-cyan-300 font-semibold mt-0.5">
                    🌧️ {formatNumeral(day.rainProb, lang)}%
                  </div>
                  <p className="text-[10px] text-emerald-200/90 leading-tight mt-1 pt-1 border-t border-emerald-800">
                    {day.agriTaskEn}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Helper generator to return dynamic weather data & smart agri advice based on district features
function getDistrictWeatherData(district: DistrictCoord) {
  const flags = district.zoneFlags;

  let temp = 31;
  let feelsLike = 34;
  let humidity = 72;
  let rainProb = 35;
  let windSpeed = 14;
  let windDirBn = 'উত্তর-পূর্ব (NE)';
  let windDirEn = 'North-East (NE)';
  let conditionType: 'sunny' | 'cloudy' | 'rain' | 'cold' = 'cloudy';
  let conditionBn = 'আংশিক মেঘলা';
  let conditionEn = 'Partly Cloudy';

  // Customize parameters based on regional AEZ flags
  if (flags.includes('haor_flashflood')) {
    temp = 29;
    feelsLike = 32;
    humidity = 86;
    rainProb = 75;
    windSpeed = 22;
    conditionType = 'rain';
    conditionBn = 'বজ্রবৃষ্টিসহ মাঝারি থেকে ভারী বর্ষণ';
    conditionEn = 'Moderate to Heavy Rain with Thunder';
  } else if (flags.includes('barind_drought')) {
    temp = 36;
    feelsLike = 39;
    humidity = 54;
    rainProb = 10;
    windSpeed = 12;
    conditionType = 'sunny';
    conditionBn = 'তীব্র রোদ ও খরা আবহাওয়া';
    conditionEn = 'Hot Sunny & Dry Drought Weather';
  } else if (flags.includes('coastal_saline')) {
    temp = 32;
    feelsLike = 36;
    humidity = 82;
    rainProb = 45;
    windSpeed = 24;
    conditionType = 'rain';
    conditionBn = 'উপকূলীয় বাতাস ও হালকা বর্ষণ';
    conditionEn = 'Coastal Gusty Wind & Light Rain';
  } else if (flags.includes('cold_belt')) {
    temp = 28;
    feelsLike = 29;
    humidity = 68;
    rainProb = 20;
    windSpeed = 10;
    conditionType = 'cold';
    conditionBn = 'শীতল আবহাওয়া ও হালকা বাতাস';
    conditionEn = 'Cool Weather with Gentle Breeze';
  }

  // Derive Smart Agri Alert
  let alertSeverityBg = 'bg-amber-950/80 border-amber-500/50';
  let primaryAgriAlertBn = 'জমিতে সেচ দেওয়ার উপযুক্ত সময়। বিকেল ৫টার পর সার স্প্রে করুন।';
  let primaryAgriAlertEn = 'Favorable weather for irrigation. Spray fertilizer after 5 PM.';
  let secondaryAgriAdviceBn = 'আমন বা বোরো ধানক্ষেতে ২-৩ ইঞ্চি পানি ধরে রাখুন। গবাদিপশুকে স্যালাইন মিশ্রিত পানি পান করান।';
  let secondaryAgriAdviceEn = 'Maintain 2-3 inches of standing water in rice fields. Provide saline water to livestock.';

  if (rainProb > 60) {
    alertSeverityBg = 'bg-cyan-950/90 border-cyan-500/60';
    primaryAgriAlertBn = 'আগামী ২৪ ঘণ্টায় ভারী বৃষ্টির সম্ভাবনা! জমিতে ও পুকুরের পাড়ে ড্রেনেজ নিষ্কাশন ব্যবস্থা সচল রাখুন।';
    primaryAgriAlertEn = 'High chance of heavy rain in 24h! Ensure field drainage and pond embankment safety.';
    secondaryAgriAdviceBn = 'কীটনাশক স্প্রে ও রাসায়নিক সার প্রয়োগ সম্পূর্ণ স্থগিত রাখুন। পুকুরের চারপাশে প্রতিরক্ষামূলক জাল দিন।';
    secondaryAgriAdviceEn = 'Suspend all pesticide/fertilizer applications. Erect protective netting around fish ponds.';
  } else if (temp >= 34) {
    alertSeverityBg = 'bg-rose-950/90 border-rose-500/60';
    primaryAgriAlertBn = 'তীব্র তাপপ্রবাহের ঝুঁকি! পুকুরের পানির গভীরতা বাড়ান এবং তরমুজ/সবজিতে সকালে সেচ দিন।';
    primaryAgriAlertEn = 'Heatwave Risk! Increase pond water depth and irrigate vegetables in early morning.';
    secondaryAgriAdviceBn = 'দুপুরের কড়া রোদে গবাদিপশুকে মাঠে রাখবেন না। খামারে পর্যাপ্ত ছায়া ও ঠাণ্ডা পানির ব্যবস্থা করুন।';
    secondaryAgriAdviceEn = 'Keep livestock shaded during peak heat. Ensure cool drinking water in farms.';
  } else if (flags.includes('coastal_saline')) {
    alertSeverityBg = 'bg-blue-950/90 border-blue-500/60';
    primaryAgriAlertBn = 'উপকূলীয় লোনা ঘেরের পানি নিয়ন্ত্রণ করুন। লোনা সহনশীল ধান (BRRI 97/99) পরিচর্যা করুন।';
    primaryAgriAlertEn = 'Manage salinity levels in coastal ghers. Maintain saline-tolerant rice varieties.';
    secondaryAgriAdviceBn = 'চিংড়ি ঘেরে অতিরিক্ত জোয়ারের পানি প্রবেশ ঠেকাতে বেরিবাঁধ মেরামত নিশ্চিত করুন।';
    secondaryAgriAdviceEn = 'Repair gher embankments to prevent uncontrolled high tide entry.';
  }

  // Spray Feasibility
  const canSpray = rainProb < 40 && windSpeed < 20;
  const sprayReasonBn = canSpray
    ? 'বাতাসের গতি কম এবং বৃষ্টির ঝুঁকি ৪০% এর নিচে - বিকেলে স্প্রে করা আদর্শ।'
    : 'বৃষ্টির ঝুঁকি বেশি বা বাতাসে ওষুধ উড়ে যাওয়ার সম্ভাবনা - আজ স্প্রে স্থগিত রাখুন।';
  const sprayReasonEn = canSpray
    ? 'Low wind & rain risk under 40% - Safe for evening spray.'
    : 'High rain risk or strong wind - Avoid spraying today.';

  // Irrigation status
  const irrigationStatusBn = rainProb > 50 ? 'আজ সেচ দেওয়ার প্রয়োজন নেই' : 'আজ হালকা সেচ দিন';
  const irrigationStatusEn = rainProb > 50 ? 'No Irrigation Needed Today' : 'Light Evening Irrigation Recommended';
  const irrigationNoteBn = rainProb > 50
    ? 'বৃষ্টিপাতের পূর্বাভাস থাকায় কৃত্রিম সেচ না দিয়ে প্রাকৃতিক বৃষ্টির পানি সংরক্ষণ করুন।'
    : 'বিকালের দিকে উদ্ভিদের গোড়ায় হালকা সেচ দিন যাতে মাটির আর্দ্রতা বজায় থাকে।';
  const irrigationNoteEn = rainProb > 50
    ? 'Rain is expected; conserve rainwater instead of artificial irrigation.'
    : 'Apply light evening irrigation to maintain soil moisture.';

  // 5-Day Forecast Generation
  const fiveDayForecast = [
    {
      dayBn: 'আজ (বৃহস্পতিবার)',
      dayEn: 'Today (Thu)',
      dateBn: '৭ আগস্ট',
      dateEn: 'Aug 7',
      tempHigh: temp,
      tempLow: temp - 6,
      conditionType,
      rainProb,
      agriTaskBn: rainProb > 50 ? 'ড্রেনেজ নালা পরিষ্কার রাখুন' : 'হালকা সেচ ও সার দিন',
      agriTaskEn: rainProb > 50 ? 'Clear field drainage' : 'Light irrigation & fertilizer',
    },
    {
      dayBn: 'আগামীকাল (শুক্রবার)',
      dayEn: 'Tomorrow (Fri)',
      dateBn: '৮ আগস্ট',
      dateEn: 'Aug 8',
      tempHigh: temp + 1,
      tempLow: temp - 5,
      conditionType: (rainProb > 40 ? 'rain' : 'cloudy') as 'rain' | 'cloudy' | 'sunny',
      rainProb: Math.min(85, rainProb + 15),
      agriTaskBn: 'পুকুরে জাল দিন ও খাদ্য নিয়ন্ত্রণ করুন',
      agriTaskEn: 'Net pond and manage feed',
    },
    {
      dayBn: 'শনিবার',
      dayEn: 'Saturday',
      dateBn: '৯ আগস্ট',
      dateEn: 'Aug 9',
      tempHigh: temp - 1,
      tempLow: temp - 7,
      conditionType: 'cloudy' as 'rain' | 'cloudy' | 'sunny',
      rainProb: 30,
      agriTaskBn: 'ধানক্ষেতে আগাছা দমন করুন',
      agriTaskEn: 'Weed rice fields',
    },
    {
      dayBn: 'রবিবার',
      dayEn: 'Sunday',
      dateBn: '১০ আগস্ট',
      dateEn: 'Aug 10',
      tempHigh: temp + 2,
      tempLow: temp - 5,
      conditionType: 'sunny' as 'rain' | 'cloudy' | 'sunny',
      rainProb: 15,
      agriTaskBn: 'কীটনাশক ও ছত্রাকনাশক স্প্রে করুন',
      agriTaskEn: 'Ideal for fungicide spray',
    },
    {
      dayBn: 'সোমবার',
      dayEn: 'Monday',
      dateBn: '১১ আগস্ট',
      dateEn: 'Aug 11',
      tempHigh: temp,
      tempLow: temp - 6,
      conditionType: 'cloudy' as 'rain' | 'cloudy' | 'sunny',
      rainProb: 25,
      agriTaskBn: 'গবাদিপশুর স্বাস্থ্য পরীক্ষা ও চুন দিন',
      agriTaskEn: 'Livestock check & liming',
    },
  ];

  return {
    temp,
    feelsLike,
    humidity,
    rainProb,
    windSpeed,
    windDirBn,
    windDirEn,
    conditionType,
    conditionBn,
    conditionEn,
    alertSeverityBg,
    primaryAgriAlertBn,
    primaryAgriAlertEn,
    secondaryAgriAdviceBn,
    secondaryAgriAdviceEn,
    canSpray,
    sprayReasonBn,
    sprayReasonEn,
    irrigationStatusBn,
    irrigationStatusEn,
    irrigationNoteBn,
    irrigationNoteEn,
    fiveDayForecast,
  };
}
