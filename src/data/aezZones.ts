import { AEZInfo } from '../types';

export const AEZ_SPECIAL_ZONES: AEZInfo[] = [
  {
    aez_id: 'aez_coastal_saline',
    nameBn: 'উপকূলীয় লবণাক্ত অঞ্চল (Coastal Saline Belt)',
    nameEn: 'Coastal Saline Belt',
    representativeUpazilas: ['Khulna', 'Satkhira', 'Bagerhat', 'Barisal', 'Patuakhali', 'Barguna', 'Bhola'],
    centroidLat: 22.8456,
    centroidLng: 89.5403,
    zoneFlags: ['coastal_saline'],
    recommendedVarieties: ['BRRI dhan47', 'BRRI dhan67', 'BRRI dhan97', 'BRRI dhan99', 'BRRI dhan112', 'BINA dhan-8', 'BINA dhan-10'],
  },
  {
    aez_id: 'aez_haor_flashflood',
    nameBn: 'হাওর ও আকস্মিক বন্যা প্রবণ অঞ্চল (Haor / Flash-Flood Basin)',
    nameEn: 'Haor Basin',
    representativeUpazilas: ['Sunamganj', 'Netrokona', 'Habiganj', 'Kishoreganj', 'Mylhet', 'Moulvibazar'],
    centroidLat: 25.0657,
    centroidLng: 91.395,
    zoneFlags: ['haor_flashflood'],
    recommendedVarieties: ['BRRI dhan51', 'BRRI dhan52', 'BRRI dhan79', 'BINA dhan-11', 'BINA dhan-12'],
  },
  {
    aez_id: 'aez_barind_drought',
    nameBn: 'বরেন্দ্র খরাপ্রবণ অঞ্চল (Barind Tract - Drought Prone)',
    nameEn: 'Barind Tract',
    representativeUpazilas: ['Rajshahi', 'Naogaon', 'Chapainawabganj', 'Joypurhat', 'Bogra'],
    centroidLat: 24.3745,
    centroidLng: 88.6042,
    zoneFlags: ['barind_drought'],
    recommendedVarieties: ['BRRI dhan56', 'BRRI dhan57', 'BRRI dhan66', 'BRRI dhan71', 'BRRI dhan83'],
  },
  {
    aez_id: 'aez_char_land',
    nameBn: 'চর অঞ্চল (Char Land / River Sandbar)',
    nameEn: 'Char Land',
    representativeUpazilas: ['Kurigram', 'Gaibandha', 'Sirajganj', 'Tangail', 'Jamalpur', 'Shariatpur', 'Chandpur'],
    centroidLat: 24.8,
    centroidLng: 89.6,
    zoneFlags: ['char_land'],
    recommendedVarieties: ['Groundnut (বাদাম)', 'Watermelon (তরমুজ)', 'Pumpkin (মিষ্টি কুমড়া)', 'Sweet Potato (মিষ্টি আলু)', 'BRRI dhan88'],
  },
  {
    aez_id: 'aez_cold_belt',
    nameBn: 'উত্তরাঞ্চলের শৈত্যপ্রবাহ অঞ্চল (Cold-Affected Northern Belt)',
    nameEn: 'Northern Cold Belt',
    representativeUpazilas: ['Rangpur', 'Panchagarh', 'Thakurgaon', 'Dinajpur', 'Nilphamari', 'Pabna'],
    centroidLat: 26.3354,
    centroidLng: 88.5517,
    zoneFlags: ['cold_belt'],
    recommendedVarieties: ['BR18', 'BRRI dhan36', 'BRRI dhan67', 'BRRI dhan69'],
  },
  {
    aez_id: 'aez_dual_stress',
    nameBn: 'দ্বিমুখী ঝুঁকি অঞ্চল (Dual-Stress Saline & Flood Zone)',
    nameEn: 'Dual-Stress Zone',
    representativeUpazilas: ['Pirojpur', 'Jhalokati', 'Noakhali', 'Lakshmipur'],
    centroidLat: 22.5,
    centroidLng: 90.3,
    zoneFlags: ['coastal_saline', 'haor_flashflood', 'dual_stress'],
    recommendedVarieties: ['BRRI dhan78 (লবণাক্ততা ও জলমগ্নতা সহনশীল)'],
  },
];

export interface ExtendedAezZone {
  aezCode: string;
  aezNameBn: string;
  aezNameEn: string;
  applicableDistrictsBn: string[];
  applicableDistrictsEn?: string[];
  soilTypesBn: string[];
  soilTypesEn?: string[];
}

export const BANGLADESH_AEZ_ZONES: ExtendedAezZone[] = AEZ_SPECIAL_ZONES.map((z) => ({
  aezCode: z.aez_id,
  aezNameBn: z.nameBn,
  aezNameEn: z.nameEn,
  applicableDistrictsBn: [...z.representativeUpazilas, 'পাবনা', 'বগুড়া', 'কুমিল্লা'],
  applicableDistrictsEn: [...z.representativeUpazilas, 'Pabna', 'Bogura', 'Cumilla'],
  soilTypesBn: ['পলিময় পলি মাটি', 'পলি দোঁআশ মাটি'],
  soilTypesEn: ['Alluvial loam soil', 'Clay loam soil'],
}));

export const AEZ_ZONES = AEZ_SPECIAL_ZONES;
