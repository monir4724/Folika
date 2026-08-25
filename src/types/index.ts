// New consolidated user profile for Folika
export type FarmerType = 'crop' | 'livestock' | 'fisheries' | 'mixed';
export type OwnershipType = 'own' | 'leased' | 'sharecropped';
export type LandUnit = 'bigha' | 'acre' | 'hectare' | 'decimal';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface FisheriesSubProfile {
  ponds?: number;
  totalAreaDecimal?: number; // decimal representation like other land sizes
  averageDepthMeter?: number;
  species?: string[];
}

export interface LivestockSubProfile {
  counts?: { cattle?: number; buffalo?: number; goat?: number; sheep?: number; poultry?: number };
}

export interface NotificationPreferences {
  weatherAlerts: boolean;
  marketPrice: boolean;
  diseaseOutbreaks: boolean;
}

export interface AccessibilitySettings {
  tts: boolean; // text-to-speech
  voiceInput: boolean; // voice input for form fields
}

export interface UserProfile {
  // Basic identity (kept short for quick onboarding)
  id?: string;
  name: string; // legacy components read `name` so keep this
  fullName?: string; // preferred explicit name field
  profilePhoto?: string; // base64 data URL or remote URL
  // Primary identifier
  phone: string; // raw phone input (local display)
  phoneNormalized?: string; // +880... normalized form

  // Language / UI
  language: 'bn' | 'en';

  // Location (cascading)
  division?: string;
  district?: string;
  upazila?: string;
  union?: string;
  village?: string;
  aezCode?: string;
  aezNameBn?: string;
  aezNameEn?: string;
  locationCoords?: GeoPoint;

  // Farming profile
  farmerTypes: FarmerType[]; // multi-select
  landSizeDecimal?: number; // numeric
  landUnit?: LandUnit;
  ownershipType?: OwnershipType;
  soilType?: string;
  currentCrops?: string[];
  irrigationSource?: 'tube_well' | 'canal' | 'rain_fed' | string;

  // Domain-specific
  fisheries?: FisheriesSubProfile;
  livestock?: LivestockSubProfile;

  // Financial / support
  hasBankAccount?: boolean;
  mobileBankingProviders?: string[]; // e.g., ['bKash', 'Nagad']
  cooperativeMember?: { member: boolean; name?: string };

  // App settings
  notifications?: NotificationPreferences;
  accessibility?: AccessibilitySettings;

  // Internal flags
  createdAt?: string;
  updatedAt?: string;
}

export interface CropRotationLog {
  id: string;
  shallowCrop: string;
  mediumCrop: string;
  deepCrop: string;
  safetyScore: number;
  notesBn: string;
  notesEn?: string;
  dateCreated: string;
}

export interface SavedAnimal {
  id: string;
  tagOrName: string;
  species: string;
  ageMonths: number;
  vaccinationHistory: { vaccineName: string; dateGiven: string; nextDueDate: string }[];
}

export type NumeralType = 'bn' | 'en'; // 'bn': ১,২,৩; 'en': 1,2,3

export interface FarmerProfile {
  id: string;
  name: string;
  phone: string;
  division: string;
  district: string;
  upazila: string;
  aezId?: string;
  zoneFlags: ZoneFlag[];
  landSize: number; // numerical value
  landUnit: 'bigha' | 'acre' | 'hectare' | 'decimal';
  interests: ('crop' | 'livestock' | 'poultry' | 'fisheries')[];
  primaryCrops: string[];
  primaryAnimals: string[];
  subscriptionTier: 'free' | 'pro';
  organizationId?: string | null;
  consentGivenAt: string;
}

export type ZoneFlag = 'coastal_saline' | 'haor_flashflood' | 'barind_drought' | 'char_land' | 'cold_belt' | 'dual_stress';

export interface CropItem {
  id: string;
  nameBn: string;
  nameEn: string;
  rootDepthClass: 'Shallow (0-20cm)' | 'Medium (20-50cm)' | 'Deep (50-100cm+)';
  depthLayerIndex: 1 | 2 | 3;
  dominantNutrientDemand: string;
  family: string;
  typicalSeasonBn: string;
  typicalSeasonEn: string;
  waterNeed: 'Low' | 'Medium' | 'High' | 'Low–Medium' | 'Medium–High';
  isImportSubstituteConcessional: boolean;
  expectedYieldPerBigha: string;
  profitTrend: 'up' | 'stable' | 'down';
  suitableZones: ZoneFlag[];
  plantingWindow: string;
}

export interface ExtendedCropItem extends CropItem {
  seasonBn: string;
  seasonEn: string;
  concessionalLoan4Pct: boolean;
  aezSuitabilityNoteBn: string;
  aezSuitabilityNoteEn: string;
  durationDaysBn: string;
  durationDaysEn: string;
  yieldPotentialBn: string;
  yieldPotentialEn: string;
  waterReqBn: string;
  waterReqEn: string;
  plantingWindowEn: string;
  expectedYieldPerBighaEn: string;
}

export interface AEZInfo {
  aez_id: string;
  nameBn: string;
  nameEn: string;
  representativeUpazilas: string[];
  centroidLat: number;
  centroidLng: number;
  zoneFlags: ZoneFlag[];
  recommendedVarieties: string[];
}

export interface SoilHealthStatus {
  nitrogenScore: number; // 0-100
  phosphorusScore: number; // 0-100
  potassiumScore: number; // 0-100
  phValue: number;
  phSuitable: boolean;
  organicMatterTrend: 'up' | 'stable' | 'down';
  confidenceLevel: 'Low' | 'Medium' | 'High';
  recommendationBn: string;
}

export interface RotationPlanResult {
  candidateCrop: CropItem;
  score: number; // 0-100
  badge: '🟢' | '🟡' | '🔴';
  badgeColor: 'green' | 'amber' | 'red';
  reasons: string[];
  depthLayerMismatchNote: string;
}

export interface DiseaseScanResult {
  topDiagnosis: string;
  diseaseNameBn?: string;
  diseaseNameEn?: string;
  confidence: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  diagnoses: {
    name: string;
    confidence: number;
    details: string;
    firstAid: string[];
  }[];
  chemicalTreatmentBn?: string;
  organicTreatmentBn?: string;
  preventiveStepsBn?: string;
  isFallback?: boolean;
}

export interface WeatherData {
  temp: number;
  conditionBn: string;
  conditionEn: string;
  icon: string;
  actionSentence: string;
  rainfallNext24h: number; // mm
  fiveDayForecast: { day: string; icon: string; minTemp: number; maxTemp: number }[];
  activeRisks: { title: string; severity: 'warning' | 'danger'; description: string }[];
}

export interface MarketPriceItem {
  id: string;
  cropNameBn: string;
  cropNameEn: string;
  currentPricePerKg: number;
  unit: string;
  history: { date: string; price: number }[];
  forecast: { date: string; price: number; lowerBound: number; upperBound: number }[];
  yieldCurve: { date: string; expectedHarvestBiomass: number }[];
  bestTime: string;
  markets: { name: string; distanceKm: number; rawPrice: number; transportCostPerKg: number; netPricePerKg: number }[];
}

export interface FinancialInstitution {
  id: string;
  institutionBn: string;
  institutionEn: string;
  roleBn: string;
  roleEn?: string;
  keyFiguresBn: string;
  keyFiguresEn?: string;
  interestRateBn: string;
  interestRateEn?: string;
  policyYear: string;
  isConcessional: boolean;
  eligibilityCriteria: string[];
  eligibilityCriteriaEn?: string[];
  matchedPercent?: number;
}

export interface LivestockBreed {
  breed_id: string;
  breed_name: string;
  species: 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep' | 'Poultry';
  origin_region: string;
  physical_traits: string;
  common_disease_ids: string[];
}

export interface LivestockDisease {
  disease_id: string;
  disease_name_en: string;
  disease_name_bn: string;
  species_affected: string[];
  symptoms_early: string[];
  symptoms_severe: string[];
  is_zoonotic: boolean;
  severity_level: 'Low' | 'Medium' | 'High' | 'Critical';
  contagious: boolean;
  first_aid_immediate: string[];
  treatment_approach: string;
  medicine_class: string;
  prevention: string[];
}

export interface QuickSymptomPattern {
  symptomText: string;
  species: string;
  likelyDiseasesBn: string;
  diseaseId: string;
  isCriticalPattern: boolean;
}

export interface VaccinationScheduleItem {
  species: string;
  vaccine: string;
  firstDoseAge: string;
  boosterSchedule: string;
  diseasePrevented: string;
}

export interface AnimalProfile {
  id: string;
  species: 'Cattle' | 'Buffalo' | 'Goat' | 'Sheep' | 'Poultry';
  breedName: string;
  tagOrName: string;
  ageMonths: number;
  sex: 'Male' | 'Female';
  estimatedWeightKg?: number;
  vaccinationStatus: 'green' | 'amber' | 'red';
  lastVaccineDate?: string;
}

export interface FisheriesSpecies {
  id: string;
  commonNameBn: string;
  commonNameEn: string;
  scientificName: string;
  category: string;
  isCaptureOnly: boolean;
  isBannedSpecies: boolean;
  depthLayer: 'surface' | 'column' | 'bottom' | 'boundary';
  waterQualityOptimum: string;
  stockingDensityHint: string;
  feedType: string;
  notes: string;
}

export interface PondDepthZone {
  depthZoneBn: string;
  depthZoneEn: string;
  rangeMeter: string;
  solarPenetration: string;
  dissolvedOxygen: string;
  primaryFood: string;
  recommendedRatio: number; // percentage
  exampleSpecies: string[];
}

export interface TraceabilityBatch {
  batchId: string;
  farmerName: string;
  cropOrProduct: string;
  harvestDate: string;
  quantity: string;
  location: string;
  previousHash: string;
  hash: string;
  qrCodeUrl?: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  location: string;
  category: 'crop' | 'livestock' | 'fisheries' | 'finance';
  questionBn: string;
  timestamp: string;
  replyCount: number;
  isExpertAnswered: boolean;
  replies?: { author: string; text: string; isExpert: boolean; timestamp: string }[];
}
