export interface DrugClassItem {
  id: string;
  classNameBn: string;
  classNameEn: string;
  usedForBn: string;
  referencedDiseases: string[];
}

export const DRUG_CLASS_GLOSSARY: DrugClassItem[] = [
  { id: 'dc_01', classNameBn: 'Oxytetracycline-class antibiotics', classNameEn: 'Oxytetracycline-class antibiotics', usedForBn: 'Broad-spectrum bacterial infections, hemorrhagic septicemia, black quarter, and secondary infection control.', referencedDiseases: ['A2', 'A3', 'A8', 'C3', 'C10'] },
  { id: 'dc_02', classNameBn: 'Penicillin-class antibiotics', classNameEn: 'Penicillin-class antibiotics', usedForBn: 'Black quarter (BQ), primary anthrax, and wound infections.', referencedDiseases: ['A3', 'A12'] },
  { id: 'dc_03', classNameBn: 'Sulfonamide-class antibiotics', classNameEn: 'Sulfonamide-class antibiotics', usedForBn: 'Fowl cholera, typhoid, and bacterial diarrhea in poultry.', referencedDiseases: ['A2', 'C3', 'C10', 'C13'] },
  { id: 'dc_04', classNameBn: 'Anthelmintics (Albendazole/Levamisole)', classNameEn: 'Anthelmintics', usedForBn: 'Removal of stomach and intestinal roundworms and tapeworms.', referencedDiseases: ['A5', 'B4'] },
  { id: 'dc_05', classNameBn: 'Flukicides (Triclabendazole)', classNameEn: 'Flukicides', usedForBn: 'Specifically destroys liver flukes or flatworms; regular dewormers may not kill liver flukes.', referencedDiseases: ['A5'] },
  { id: 'dc_06', classNameBn: 'Anti-protozoals', classNameEn: 'Anti-protozoals', usedForBn: 'Destroys protozoa that cause babesiosis and blood infections.', referencedDiseases: ['A8'] },
  { id: 'dc_07', classNameBn: 'Anti-trypanosomals', classNameEn: 'Anti-trypanosomals', usedForBn: 'Removes trypanosome parasites that cause sura disease.', referencedDiseases: ['A16'] },
  { id: 'dc_08', classNameBn: 'Anticoccidials (Amprolium)', classNameEn: 'Anticoccidials', usedForBn: 'Treats coccidiosis and bloody diarrhea in poultry.', referencedDiseases: ['C4'] },
  { id: 'dc_09', classNameBn: 'Intramammary Infusions', classNameEn: 'Intramammary Infusions', usedForBn: 'Direct antibiotic infusion into the udder for mastitis treatment.', referencedDiseases: ['A4'] },
  { id: 'dc_10', classNameBn: 'Calcium Borogluconate', classNameEn: 'Calcium Borogluconate', usedForBn: 'Intravenous injection for rapid calcium replacement in milk fever.', referencedDiseases: ['A6'] },
  { id: 'dc_11', classNameBn: 'NSAIDs & Antihistamines', classNameEn: 'NSAIDs & Antihistamines', usedForBn: 'Reduces fever, pain, allergy, and lung inflammation.', referencedDiseases: ['A11', 'B2', 'B5'] },
  { id: 'dc_12', classNameBn: 'Antitoxins', classNameEn: 'Antitoxins', usedForBn: 'Neutralizes harmful toxins in enterotoxemia.', referencedDiseases: ['B7'] },
  { id: 'dc_13', classNameBn: 'Anti-venom', classNameEn: 'Anti-venom', usedForBn: 'Neutralizes snake venom.', referencedDiseases: ['E3'] },
];
