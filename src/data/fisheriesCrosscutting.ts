export const WATER_QUALITY_THRESHOLDS = [
  { parameter: 'Dissolved Oxygen (DO)', healthyRange: '5 – 8 mg/L', redFlagLevel: '< 3.0 mg/L (fish may surface in the morning)', emergencyAction: '🚨 Run aerator or pump immediately, stir water with bamboo for oxygen, and stop feeding.' },
  { parameter: 'Water Acidity (pH)', healthyRange: '6.5 – 8.5', redFlagLevel: '< 6.0 (acidic) or > 9.0 (alkaline)', emergencyAction: 'Add 1-2 kg agricultural lime per 100 decimals for low pH. For high pH, stop lime and replace some water.' },
  { parameter: 'Water Temperature (Temp)', healthyRange: '25 – 32°C', redFlagLevel: '< 20°C or > 35°C', emergencyAction: 'If temperature is high, reduce feed by half and provide shade or more water.' },
  { parameter: 'Ammonia', healthyRange: '< 0.1 mg/L', redFlagLevel: '> 0.5 mg/L (gill damage and rotten smell)', emergencyAction: 'Stop feeding for 2 days, avoid stirring bottom sludge, and change 30% of the water.' },
  { parameter: 'Water Clarity (Secchi Depth)', healthyRange: '25 – 40 cm', redFlagLevel: '< 15 cm (dense green) or > 50 cm (very clear)', emergencyAction: 'If water is too clear, add fertilizer or feed. If too green, add lime and zeolite.' },
];

export const POND_PREP_CHECKLIST = [
  '1. Dry the pond: expose bottom mud to sunlight for 7–15 days until it cracks.',
  '2. Remove predators: apply sevin or rotenone to remove predator fish (Shol, Boal).',
  '3. Apply lime: spread 1–1.5 kg agricultural lime per 100 decimals across the pond bottom.',
  '4. Organic manure: add 5–7 kg of cow dung or compost per 100 decimals 5–7 days after liming.',
  '5. Water entry and stabilization: after 5–7 days, green plankton suitable for fry release will develop.',
];

export const FINGERLING_QUALITY_CHECKLIST = [
  '✓ Uniform-size fry (unequal fry may result in larger fish eating smaller ones).',
  '✓ Swims actively against the current.',
  '✓ No red spots, wounds, fungal patches, or torn fins on the body.',
  '✓ Clear eyes and a normal belly (not swollen or shrunken).',
  '✓ Source fry from a DoF-registered hatchery.',
];

export const FISHERIES_ESCALATION = {
  nationalHelpline: '16123 (Agriculture Call Center)',
  upazilaOfficerLabel: 'Upazila Fisheries Officer (UFO Office)',
  emergencyNotice: 'If more than 1% of fish begin floating or dying each day, contact the nearest fisheries office or call 16123 immediately.',
};
