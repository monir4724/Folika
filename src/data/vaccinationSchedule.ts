import { VaccinationScheduleItem } from '../types';

export const MASTER_VACCINATION_SCHEDULE: VaccinationScheduleItem[] = [
  { species: 'Cattle/Buffalo', vaccine: 'FMD (Foot and Mouth Disease vaccine)', firstDoseAge: '4 months+', boosterSchedule: 'Every 6 months', diseasePrevented: 'Foot and Mouth Disease (FMD - A1)' },
  { species: 'Cattle/Buffalo', vaccine: 'HS (Hemorrhagic Septicemia vaccine)', firstDoseAge: '6 months+', boosterSchedule: 'Once a year (before monsoon)', diseasePrevented: 'Hemorrhagic Septicemia (HS - A2)' },
  { species: 'Cattle/Buffalo', vaccine: 'BQ (Black Quarter vaccine)', firstDoseAge: '6 months+', boosterSchedule: 'Once a year', diseasePrevented: 'Black Quarter (BQ - A3)' },
  { species: 'Cattle/Buffalo', vaccine: 'LSD (Lumpy Skin Disease vaccine)', firstDoseAge: '4 months+', boosterSchedule: 'Once a year (or outbreak dependent)', diseasePrevented: 'Lumpy Skin Disease (LSD - A11)' },
  { species: 'Cattle/Buffalo', vaccine: 'Anthrax vaccine', firstDoseAge: '6 months+', boosterSchedule: 'Once a year (high risk areas)', diseasePrevented: 'Anthrax (A12)' },
  { species: 'Goat/Sheep', vaccine: 'PPR (Peste des Petits Ruminants vaccine)', firstDoseAge: '4 months+', boosterSchedule: 'Once a year', diseasePrevented: 'PPR (B1)' },
  { species: 'Goat/Sheep', vaccine: 'Goat Pox vaccine', firstDoseAge: '3 months+', boosterSchedule: 'Once a year', diseasePrevented: 'Goat Pox (B5)' },
  { species: 'Goat/Sheep', vaccine: 'CDT (Enterotoxemia vaccine)', firstDoseAge: '6–8 weeks (initial 2 doses)', boosterSchedule: 'Once a year', diseasePrevented: 'Enterotoxemia (B7)' },
  { species: 'Poultry', vaccine: 'Marek\'s vaccine', firstDoseAge: 'Day 1 (hatchery)', boosterSchedule: 'One-time during hatch', diseasePrevented: 'Marek\'s Disease (C12)' },
  { species: 'Poultry', vaccine: 'BCRDV / RDV (Newcastle vaccine)', firstDoseAge: '3-7 days old (eye drop)', boosterSchedule: 'Every 2–3 months (layer/breeder)', diseasePrevented: 'Newcastle Disease (ND - C1)' },
  { species: 'Poultry', vaccine: 'Gumboro (IBD vaccine)', firstDoseAge: '10-14 days old', boosterSchedule: '2nd dose at 21-24 days old', diseasePrevented: 'Gumboro / IBD (C2)' },
  { species: 'Poultry', vaccine: 'Fowl Pox vaccine', firstDoseAge: '6–8 weeks (wing injection)', boosterSchedule: 'Once a year', diseasePrevented: 'Fowl Pox (C5)' },
  { species: 'Poultry (Layer)', vaccine: 'Infectious Bronchitis (IB)', firstDoseAge: 'From day 1', boosterSchedule: 'Per layer vaccine calendar', diseasePrevented: 'Infectious Bronchitis (C8)' },
  { species: 'Duck', vaccine: 'Duck Plague vaccine', firstDoseAge: '18-21 days old+', boosterSchedule: 'Once a year', diseasePrevented: 'Duck Plague (C9)' },
  { species: 'Duck', vaccine: 'Duck Cholera vaccine', firstDoseAge: '4 weeks old+', boosterSchedule: 'Once a year before outbreak', diseasePrevented: 'Duck Cholera (C10)' },
];
