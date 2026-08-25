export const LIVESTOCK_VITAL_SIGNS = [
  { species: 'Cattle (Adult)', temp: '101.5–103.5°F (38.6–39.7°C)', pulse: '60–80 beats/min', respiration: '15–30 breaths/min' },
  { species: 'Buffalo (Adult)', temp: '101–102.5°F (38.3–39.2°C)', pulse: '40–60 beats/min', respiration: '15–25 breaths/min' },
  { species: 'Goat (Adult)', temp: '101.5–104.0°F (38.6–40.0°C)', pulse: '70–90 beats/min', respiration: '15–30 breaths/min' },
  { species: 'Sheep (Adult)', temp: '100.9–103.8°F (38.3–39.9°C)', pulse: '70–90 beats/min', respiration: '12–20 breaths/min' },
  { species: 'Chicken (Adult)', temp: '105–107.0°F (40.6–41.7°C)', pulse: '250–300 beats/min', respiration: '15–30 breaths/min' },
];

export const HEALTHY_VS_SICK_CHECK = [
  { feature: 'Eyes', healthy: 'Bright, alert, clear', sick: 'Dull, sleepy, cloudy discharge' },
  { feature: 'Nose/Mouth', healthy: 'Moist, cool, clear', sick: 'Dry, hot, thick mucus or foam' },
  { feature: 'Coat', healthy: 'Smooth, shiny, clean', sick: 'Rough, raised hair, wounds' },
  { feature: 'Appetite / Cud chewing', healthy: 'Normal eating, chewing cud', sick: 'Loss of appetite, stops chewing cud ⚠️' },
  { feature: 'Stool', healthy: 'Normal firm droppings', sick: 'Loose, watery, foul, or bloody droppings' },
];

export const NUTRITION_WATER_REFERENCE = [
  { species: 'Dairy Cattle', feed: 'Fresh grass + straw + balanced concentrate for milk production', water: '40–80 liters/day (higher in heat)' },
  { species: 'Buffalo', feed: 'Fresh grass and straw (can digest lower quality hay)', water: '30–70 liters/day' },
  { species: 'Goat/Sheep', feed: 'Browse, grazing grass, and mixed concentrate', water: '3–5 liters/day' },
  { species: 'Chicken (Layer)', feed: 'Balanced layer feed + calcium supplement', water: '200–300 ml/bird/day' },
  { species: 'Duck', feed: 'Duck feed, snails, and aquatic plants', water: '500 ml–1 liter/bird/day' },
];

export const BREEDING_GROWTH_REFERENCE = [
  { species: 'Cattle', firstBreeding: '15–24 months', gestation: '275–285 days (≈9.5 months)', offspring: '1 calf' },
  { species: 'Buffalo', firstBreeding: '24–36 months', gestation: '310 days (≈10.3 months)', offspring: '1 calf' },
  { species: 'Black Bengal Goat', firstBreeding: '8–12 months', gestation: '145–150 days (≈5 months)', offspring: 'Often 2-3 kids' },
  { species: 'Sheep', firstBreeding: '8–12 months', gestation: '145–150 days (≈5 months)', offspring: '1-2 lambs' },
  { species: 'Poultry', firstBreeding: '5–6 months (laying age)', gestation: '21 days (chicken egg) / 28 days (duck egg)', offspring: 'Hatched chicks' },
];

export const TOXIC_PLANTS_LIST = [
  'Moldy stored straw and silage (aflatoxin poisoning - most common)',
  'Grazing in fields recently sprayed with pesticides',
  'Unknown poisonous wild weeds or toxic shrubs',
  'Excessive urea or improperly mixed urea-treated feed (urea toxicity)',
];
