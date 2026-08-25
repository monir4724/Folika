import { QuickSymptomPattern } from '../types';

export const QUICK_SYMPTOM_INDEX: QuickSymptomPattern[] = [
  {
    symptomText: 'Mouth and tongue blisters + excessive salivation + hoof lesions with lameness',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Foot and Mouth Disease (FMD)',
    diseaseId: 'A1',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 1
  },
  {
    symptomText: 'Sudden high fever + swelling under throat and chest + abnormal breathing sounds',
    species: 'Cattle, Buffalo',
    likelyDiseasesBn: 'Hemorrhagic Septicemia (HS)',
    diseaseId: 'A2',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 2
  },
  {
    symptomText: 'Sudden lameness + crackling pain in the thigh or shoulder when pressed',
    species: 'Cattle, Buffalo',
    likelyDiseasesBn: 'Black Quarter (BQ)',
    diseaseId: 'A3',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Firm, swollen udder + blood or pus in the milk',
    species: 'Cattle, Buffalo, Goat',
    likelyDiseasesBn: 'Mastitis',
    diseaseId: 'A4',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Soft swelling under the lower jaw (bottle jaw) + weight loss',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Fascioliasis',
    diseaseId: 'A5',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Shaking legs, inability to stand, and neck bending within 3 days after calving',
    species: 'Cattle, Buffalo',
    likelyDiseasesBn: 'Milk Fever',
    diseaseId: 'A6',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 3
  },
  {
    symptomText: 'Sweet or acetone smell from breath or urine + loss of appetite for concentrate feed',
    species: 'Cattle',
    likelyDiseasesBn: 'Ketosis',
    diseaseId: 'A7',
    isCriticalPattern: false,
  },
  {
    symptomText: 'High fever + coffee-colored or dark urine + ticks on the body',
    species: 'Cattle, Buffalo',
    likelyDiseasesBn: 'Babesiosis',
    diseaseId: 'A8',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Raised round lumps or blisters under the skin',
    species: 'Cattle, Buffalo',
    likelyDiseasesBn: 'Lumpy Skin Disease (LSD)',
    diseaseId: 'A11',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Sudden death without signs + dark, unclotted blood from nose, mouth, or rectum',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Anthrax (Zoonotic)',
    diseaseId: 'A12',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 4 (Zoonotic)
  },
  {
    symptomText: 'Repeated abortions during the last 3 months of pregnancy',
    species: 'Cattle, Buffalo, Goat',
    likelyDiseasesBn: 'Brucellosis (Zoonotic)',
    diseaseId: 'A13',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Distended left abdomen + difficulty breathing and restlessness',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Bloat / Tympany',
    diseaseId: 'A15',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 5
  },
  {
    symptomText: 'High fever in goat + eye/nose discharge + painful lesions and foul diarrhea',
    species: 'Goat, Sheep',
    likelyDiseasesBn: 'PPR (Peste des Petits Ruminants)',
    diseaseId: 'B1',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 6
  },
  {
    symptomText: 'Coughing, sneezing, nasal discharge, and rapid labored breathing',
    species: 'Goat, Sheep',
    likelyDiseasesBn: 'Pneumonia',
    diseaseId: 'B2',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Red pustules or scabs on goat skin or ears',
    species: 'Goat',
    likelyDiseasesBn: 'Goat Pox',
    diseaseId: 'B5',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Sudden convulsions and death shortly after abrupt feed change',
    species: 'Goat, Sheep',
    likelyDiseasesBn: 'Enterotoxemia',
    diseaseId: 'B7',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 7
  },
  {
    symptomText: 'Red eyes, light sensitivity, and green watery droppings in poultry',
    species: 'Poultry (Chicken)',
    likelyDiseasesBn: 'Newcastle Disease (ND)',
    diseaseId: 'C1',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 8
  },
  {
    symptomText: 'Weakness, trembling, and white pasty droppings in young chicks',
    species: 'Poultry (Chicken)',
    likelyDiseasesBn: 'Gumboro / IBD',
    diseaseId: 'C2',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Fresh blood or chocolate-colored droppings in poultry enclosures',
    species: 'Poultry (Chicken)',
    likelyDiseasesBn: 'Coccidiosis',
    diseaseId: 'C4',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Duck eyes red, sensitive to light, and green watery droppings',
    species: 'Poultry (Duck)',
    likelyDiseasesBn: 'Duck Plague',
    diseaseId: 'C9',
    isCriticalPattern: false,
  },
  {
    symptomText: 'Sudden mass death + twisted neck, purple legs, and bloody nasal discharge',
    species: 'Poultry (Chicken & Duck)',
    likelyDiseasesBn: 'Bird Flu / Avian Influenza (Zoonotic)',
    diseaseId: 'C11',
    isCriticalPattern: true, // 🚨 Critical Emergency Pattern 9 (Zoonotic)
  },
  {
    symptomText: 'History of dog or fox bite + excessive foaming at the mouth',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Rabies (Zoonotic)',
    diseaseId: 'E1',
    isCriticalPattern: true, // 🚨 Emergency
  },
  {
    symptomText: 'Foaming mouth and weakness after eating pesticides or unknown plants',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Poisoning',
    diseaseId: 'E2',
    isCriticalPattern: true, // 🚨 Emergency
  },
  {
    symptomText: 'Snake bite puncture wound + rapid swelling and foaming',
    species: 'Cattle, Buffalo, Goat, Sheep',
    likelyDiseasesBn: 'Snake Bite',
    diseaseId: 'E3',
    isCriticalPattern: true, // 🚨 Emergency
  },
];
