import { PondDepthZone } from '../types';

export const POND_DEPTH_ZONES: PondDepthZone[] = [
  {
    depthZoneBn: 'Surface Layer',
    depthZoneEn: 'Surface Layer',
    rangeMeter: '0.0 – 0.5 m',
    solarPenetration: 'Maximum (100%)',
    dissolvedOxygen: 'Highest (photosynthesis + air exchange)',
    primaryFood: 'Phytoplankton, floating insects, zooplankton',
    recommendedRatio: 30, // 30%
    exampleSpecies: ['Catla', 'Silver Carp', 'Silver Barb', 'Mola', 'Gourami'],
  },
  {
    depthZoneBn: 'Column Layer',
    depthZoneEn: 'Column Layer',
    rangeMeter: '0.5 – 1.2 m',
    solarPenetration: 'Moderate (40–70%)',
    dissolvedOxygen: 'Moderate to high',
    primaryFood: 'Large zooplankton, aquatic vegetation, floating feed',
    recommendedRatio: 40, // 40% (Primary IMC Column Layer)
    exampleSpecies: ['Rohu', 'Grass Carp', 'Bighead Carp', 'Pabda', 'Barramundi'],
  },
  {
    depthZoneBn: 'Bottom Layer',
    depthZoneEn: 'Bottom Layer',
    rangeMeter: '1.2 – 2.0+ m',
    solarPenetration: 'Lowest (<30%)',
    dissolvedOxygen: 'Lowest (decomposition)',
    primaryFood: 'Detritus, bottom sludge, benthic invertebrates',
    recommendedRatio: 20, // 20%
    exampleSpecies: ['Mrigal', 'Common Carp', 'Kalibaus', 'Prawn', 'Shing / Magur'],
  },
  {
    depthZoneBn: 'Boundary / Air-Breathing Zone',
    depthZoneEn: 'Boundary Layer',
    rangeMeter: 'Pond edge and muddy shallows',
    solarPenetration: 'Variable',
    dissolvedOxygen: 'Air-breathing tolerant (survives low O2)',
    primaryFood: 'Small fish, snails, benthic insects, commercial pellets',
    recommendedRatio: 10, // 10%
    exampleSpecies: ['Tilapia', 'Thai Koi', 'Snakehead', 'Tengra / Gulsha', 'Mud Eel'],
  },
];
