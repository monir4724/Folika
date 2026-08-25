import { UserProfile, CropRotationLog, SavedAnimal, FarmerType } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'agri_profile',
  LANGUAGE: 'agri_lang',
  ROTATION_LOGS: 'agri_rotation_logs',
  SAVED_ANIMALS: 'agri_saved_animals',
  OFFLINE_QUEUE: 'agri_offline_queue',
  LITE_MODE: 'agri_lite_mode',
  ONBOARDED: 'agri_onboarded',
};

export const getStoredProfile = (): UserProfile | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!data) return null;
    const parsed = JSON.parse(data);

    // Detect legacy shape and migrate
    if (parsed && typeof parsed === 'object') {
      // legacy had `primaryCategory` and `landAreaDecimal`
      if (parsed.primaryCategory && !parsed.farmerTypes) {
        const migrated: UserProfile = {
          id: parsed.id || undefined,
          name: parsed.name || parsed.fullName || '' ,
          fullName: parsed.fullName || parsed.name || '',
          phone: parsed.phone || '',
          phoneNormalized: parsed.phone ? normalizePhone(parsed.phone) : undefined,
          language: parsed.language || 'bn',
          division: parsed.division,
          district: parsed.district,
          upazila: parsed.upazila,
          aezCode: parsed.aezCode,
          aezNameBn: parsed.aezNameBn,
          aezNameEn: parsed.aezNameEn,
          locationCoords: parsed.locationCoords,
          farmerTypes: [parsed.primaryCategory as FarmerType],
          landSizeDecimal: parsed.landAreaDecimal,
          landUnit: parsed.landUnit || 'decimal',
          ownershipType: parsed.ownershipType,
          soilType: parsed.soilType,
          currentCrops: parsed.primaryCrops || [],
          irrigationSource: parsed.irrigationSource,
          fisheries: parsed.fisheries,
          livestock: parsed.livestock,
          hasBankAccount: parsed.hasBankAccount,
          mobileBankingProviders: parsed.mobileBankingProviders,
          cooperativeMember: parsed.cooperativeMember,
          notifications: parsed.notifications || { weatherAlerts: true, marketPrice: true, diseaseOutbreaks: true },
          accessibility: parsed.accessibility || { tts: false, voiceInput: false },
          createdAt: parsed.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        // persist migrated shape
        localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(migrated));
        return migrated;
      }

      // If already looks like new shape, return as-is
      return parsed as UserProfile;
    }

    return null;
  } catch {
    return null;
  }
};

export const saveStoredProfile = (profile: UserProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile', e);
  }
};

function normalizePhone(phone: string): string | undefined {
  const digits = phone.replace(/\D/g, '');
  if (!digits) return undefined;
  // If number starts with 01 and length 11, convert to +880
  if (/^01[3-9][0-9]{8}$/.test(digits)) {
    return `+88${digits}`;
  }
  // If already starts with 880
  if (/^880[1-9][0-9]{9}$/.test(digits)) {
    return `+${digits}`;
  }
  // fallback
  return digits;
}

export const getStoredLanguage = (): 'bn' | 'en' => {
  return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'bn' | 'en') || 'bn';
};

export const setStoredLanguage = (lang: 'bn' | 'en'): void => {
  localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
};

export const getStoredRotationLogs = (): CropRotationLog[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ROTATION_LOGS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveRotationLog = (log: CropRotationLog): CropRotationLog[] => {
  const existing = getStoredRotationLogs();
  const updated = [log, ...existing];
  try {
    localStorage.setItem(STORAGE_KEYS.ROTATION_LOGS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save rotation log', e);
  }
  return updated;
};

export const getStoredAnimals = (): SavedAnimal[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.SAVED_ANIMALS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveAnimal = (animal: SavedAnimal): SavedAnimal[] => {
  const existing = getStoredAnimals();
  const filtered = existing.filter((a) => a.id !== animal.id);
  const updated = [animal, ...filtered];
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ANIMALS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save animal', e);
  }
  return updated;
};

export const deleteAnimal = (id: string): SavedAnimal[] => {
  const existing = getStoredAnimals();
  const updated = existing.filter((a) => a.id !== id);
  try {
    localStorage.setItem(STORAGE_KEYS.SAVED_ANIMALS, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete animal', e);
  }
  return updated;
};

export const isUserOnboarded = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.ONBOARDED) === 'true';
};

export const setOnboarded = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.ONBOARDED, String(value));
};

export const isLiteMode = (): boolean => {
  return localStorage.getItem(STORAGE_KEYS.LITE_MODE) === 'true';
};

export const setLiteMode = (value: boolean): void => {
  localStorage.setItem(STORAGE_KEYS.LITE_MODE, String(value));
};
