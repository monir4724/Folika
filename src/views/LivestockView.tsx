import React, { useState } from 'react';
import { UserProfile, SavedAnimal } from '../types';
import { QUICK_SYMPTOM_INDEX } from '../data/symptomIndex';
import { MASTER_VACCINATION_SCHEDULE } from '../data/vaccinationSchedule';
import { DRUG_CLASS_GLOSSARY } from '../data/drugGlossary';
import { LIVESTOCK_VITAL_SIGNS, HEALTHY_VS_SICK_CHECK, TOXIC_PLANTS_LIST } from '../data/livestockReference';
import { getStoredAnimals, saveAnimal, deleteAnimal } from '../utils/storage';
import {
  HeartPulse,
  AlertTriangle,
  Syringe,
  Calculator,
  BookOpen,
  Search,
  PlusCircle,
  Trash2,
  PhoneCall,
  ShieldAlert,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface LivestockViewProps {
  profile: UserProfile | null;
  lang: 'bn' | 'en';
}

export const LivestockView: React.FC<LivestockViewProps> = ({ profile, lang }) => {
  const isBn = lang === 'bn';
  const [activeTab, setActiveTab] = useState<'symptoms' | 'vaccine' | 'animals' | 'dosage' | 'library'>('symptoms');

  // Symptom Search & Matcher State
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Saved Animals State
  const [myAnimals, setMyAnimals] = useState<SavedAnimal[]>(getStoredAnimals());
  const [newAnimalTag, setNewAnimalTag] = useState('');
  const [newAnimalSpecies, setNewAnimalSpecies] = useState('Cattle');
  const [newAnimalAgeMonths, setNewAnimalAgeMonths] = useState(12);

  // Weight Dosage Calculator State
  const [selectedDrugClass, setSelectedDrugClass] = useState('dc_01'); // Oxytetracycline
  const [animalWeightKg, setAnimalWeightKg] = useState(150); // kg

  // Filter Symptoms
  const matchedSymptoms = QUICK_SYMPTOM_INDEX.filter((item) => {
    if (!searchTerm.trim()) return true;
    return item.symptomText.includes(searchTerm) || item.likelyDiseasesBn.includes(searchTerm);
  });

  const criticalMatched = matchedSymptoms.filter((s) => s.isCriticalPattern && selectedSymptoms.includes(s.diseaseId));

  const toggleSymptom = (id: string) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleAddAnimal = () => {
    if (!newAnimalTag.trim()) return;
    const animal: SavedAnimal = {
      id: 'anim_' + Date.now(),
      tagOrName: newAnimalTag,
      species: newAnimalSpecies,
      ageMonths: newAnimalAgeMonths,
      vaccinationHistory: [
        { vaccineName: 'FMD (Foot and Mouth Disease vaccine)', dateGiven: '2026-02-10', nextDueDate: '2026-08-10' },
      ],
    };
    const updated = saveAnimal(animal);
    setMyAnimals(updated);
    setNewAnimalTag('');
  };

  const handleDeleteAnimal = (id: string) => {
    const updated = deleteAnimal(id);
    setMyAnimals(updated);
  };

  // Selected Drug Info
  const activeDrug = DRUG_CLASS_GLOSSARY.find((d) => d.id === selectedDrugClass) || DRUG_CLASS_GLOSSARY[0];
  const calculatedDosageMl = (animalWeightKg / 10).toFixed(1); // Sample approx logic 1ml per 10kg

  return (
    <div className="space-y-6 pb-12">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-rose-100 text-rose-800 rounded-xl">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Livestock Vet Service</h2>
            <p className="text-xs text-slate-500">Symptom checker, vaccines & dosage</p>
          </div>
        </div>

        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'symptoms', label: 'Symptom Scan', icon: HeartPulse },
            { id: 'vaccine', label: 'Vaccination Calendar', icon: Syringe },
            { id: 'animals', label: 'My Animals', icon: CheckCircle2 },
            { id: 'dosage', label: 'Dosage Calculator', icon: Calculator },
            { id: 'library', label: 'Reference Library', icon: BookOpen },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-rose-800 text-white shadow'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: Symptom Checker & Emergency Alert */}
      {activeTab === 'symptoms' && (
        <div className="space-y-6 animate-fade-in">
          {/* Critical Emergency Red Banner if matched */}
          {criticalMatched.length > 0 && (
            <div className="bg-rose-900 text-white p-5 rounded-3xl shadow-xl border-2 border-rose-500 space-y-3 animate-pulse">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-6 h-6 text-amber-300 shrink-0" />
                <h3 className="font-extrabold text-lg text-amber-300">🚨 Critical livestock / zoonotic disease alert!</h3>
              </div>
              <p className="text-xs text-rose-100 leading-relaxed">
                The selected symptom suggests a serious infectious or zoonotic disease. Separate affected animals immediately from healthy stock.
              </p>
              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-amber-200">Sub-district Livestock Officer (ULO Hotline): 16123</span>
                <a
                  href="tel:16123"
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl shadow flex items-center space-x-1"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>Call now (16123)</span>
                </a>
              </div>
            </div>
          )}

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quick Symptom Matcher</h3>
                <p className="text-xs text-slate-500">Tick the symptoms you observe:</p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search symptoms or diseases..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {matchedSymptoms.map((pattern) => {
                const isSelected = selectedSymptoms.includes(pattern.diseaseId);
                return (
                  <div
                    key={pattern.diseaseId}
                    onClick={() => toggleSymptom(pattern.diseaseId)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between space-x-3 ${
                      isSelected
                        ? pattern.isCriticalPattern
                          ? 'bg-rose-50 border-rose-400 ring-2 ring-rose-400'
                          : 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-400'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {pattern.isCriticalPattern && (
                          <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-extrabold text-[10px]">
                            🚨 Urgent
                          </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{pattern.species}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-900">{pattern.symptomText}</p>
                      {isSelected && (
                        <p className="text-xs font-extrabold text-rose-900 mt-1">
                          Possible disease: {pattern.likelyDiseasesBn}
                        </p>
                      )}
                    </div>

                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 mt-1 accent-rose-700"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Vaccination Calendar */}
      {activeTab === 'vaccine' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b pb-3">
              <Syringe className="w-6 h-6 text-rose-700" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">National Livestock & Poultry Vaccination Calendar</h3>
                <p className="text-xs text-slate-500">Approved vaccine schedule from the Ministry of Fisheries and Livestock.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {MASTER_VACCINATION_SCHEDULE.map((item, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                      {item.species}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{item.vaccine}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-white p-2 rounded-lg border">
                    <div>
                      <span className="text-slate-500 block">First dose age:</span>
                      <span className="font-semibold text-slate-800">{item.firstDoseAge}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Booster schedule:</span>
                      <span className="font-semibold text-slate-800">{item.boosterSchedule}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-600">Prevents: {item.diseasePrevented}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: My Animals Tracker */}
      {activeTab === 'animals' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
<h3 className="font-bold text-slate-900 text-base">My Farm Animals</h3>

            {/* Add Animal Form */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold text-slate-700 block">Add a new animal:</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Animal name or tag (e.g. Lalu)"
                  value={newAnimalTag}
                  onChange={(e) => setNewAnimalTag(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
                <select
                  value={newAnimalSpecies}
                  onChange={(e) => setNewAnimalSpecies(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                >
                  <option value="Cattle">Cattle</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Goat">Goat</option>
                  <option value="Sheep">Sheep</option>
                </select>
                <input
                  type="number"
                  placeholder="Age (months)"
                  value={newAnimalAgeMonths}
                  onChange={(e) => setNewAnimalAgeMonths(Number(e.target.value))}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>
              <button
                onClick={handleAddAnimal}
                className="w-full py-2 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs rounded-xl shadow flex items-center justify-center space-x-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Animal</span>
              </button>
            </div>

            {/* List */}
            <div className="space-y-2">
              {myAnimals.map((animal) => (
                <div key={animal.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{animal.tagOrName} ({animal.species})</h4>
                    <p className="text-xs text-slate-500">Age: {animal.ageMonths} months</p>
                  </div>
                  <button
                    onClick={() => handleDeleteAnimal(animal.id)}
                    className="p-2 text-rose-600 hover:bg-rose-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Dosage Calculator */}
      {activeTab === 'dosage' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-3 border-b pb-3">
              <Calculator className="w-6 h-6 text-rose-800" />
              <div>
                <h3 className="font-bold text-slate-900 text-base">Weight-based antibiotic and drug dosage calculator</h3>
                <p className="text-xs text-slate-500">Enter the animal weight in kilograms.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Select drug group:</label>
                  <select
                    value={selectedDrugClass}
                    onChange={(e) => setSelectedDrugClass(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none"
                  >
                    {DRUG_CLASS_GLOSSARY.map((drug) => (
                      <option key={drug.id} value={drug.id}>{drug.classNameEn}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Animal weight (kg): {animalWeightKg} kg</label>
                  <input
                    type="range"
                    min="10"
                    max="500"
                    step="5"
                    value={animalWeightKg}
                    onChange={(e) => setAnimalWeightKg(Number(e.target.value))}
                    className="w-full accent-rose-700"
                  />
                </div>
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-bold text-rose-900 block">Suggested dosage (Approx):</span>
                  <p className="text-2xl font-black text-rose-950 mt-1">{calculatedDosageMl} ml</p>
                  <p className="text-xs text-rose-800 mt-2">{activeDrug.usedForBn}</p>
                </div>
                <div className="text-[10px] text-slate-500 border-t border-rose-200 pt-2">
                  ⚠️ Note: Always get written advice from a registered veterinary surgeon before administering injections.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Reference Library */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900 text-base">Livestock Vital Signs Reference</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-800 border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 border-b">
                    <th className="p-2.5">Species</th>
                    <th className="p-2.5">Body temperature</th>
                    <th className="p-2.5">Pulse</th>
                    <th className="p-2.5">Respiration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {LIVESTOCK_VITAL_SIGNS.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2.5 font-bold">{item.species}</td>
                      <td className="p-2.5">{item.temp}</td>
                      <td className="p-2.5">{item.pulse}</td>
                      <td className="p-2.5">{item.respiration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <h4 className="font-bold text-rose-900 text-sm mb-2">⚠️ Toxic plant & spoiled feed warning:</h4>
              <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                {TOXIC_PLANTS_LIST.map((plant, idx) => (
                  <li key={idx}>{plant}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
