from pathlib import Path
import re

BASE = Path(__file__).resolve().parent.parent

# 1) Update src/data/fisheriesSpecies.ts derived values and category translations

species_path = BASE / 'src' / 'data' / 'fisheriesSpecies.ts'
text = species_path.read_text(encoding='utf-8')

# Keep commonNameBn values but map them to English where possible.
text = re.sub(
    r"commonNameBn:\s*'([^']*)',\s*\n(\s*commonNameEn:\s*'([^']*)')",
    lambda m: f"commonNameBn: '{m.group(3)}',\n{m.group(2)}",
    text,
)

# Replace any Bangla digits in stockingDensityHint to Latin digits
text = re.sub(
    r"stockingDensityHint:\s*'([^']*)'",
    lambda m: "stockingDensityHint: '" + m.group(1).translate(str.maketrans('০১২৩৪৫৬৭৮৯', '0123456789')) + "'",
    text,
)

# Manual Bangla strings replacement mapping for species data
replacements = {
    'পুকুরের মধ্যস্তরের প্রধান মাছ': 'primary column layer stock',
    'পুকুরের উপরিভাগ': 'surface layer',
    'পুকুরের তলদেশ': 'bottom layer',
    'পুকুরের উপরিভাগে দ্রুত বাড়ে। প্রাণিপ্ল্যাংকটন খায়।': 'Grows rapidly in the surface layer and feeds on zooplankton.',
    'মেজর কার্পের মধ্যে অত্যন্ত জনপ্রিয়। পানির মধ্যস্তরের খাবার খায়।': 'A very popular major carp species that feeds in the pond mid-water layer.',
    'পুকুরের একদম নিচের স্তরের জৈব বর্জ্য ও পচা খাবার খেয়ে পুকুর পরিষ্কার রাখে।': 'Consumes bottom-layer organic waste and helps keep the pond clean.',
    'পুকুরের ক্ষতিকর শেওলা ও সাইনোপ্ল্যাংকটন খেয়ে পানির ভাসমান সবুজ ভাব নিয়ন্ত্রণে রাখে।': 'Eats harmful algae and cyanobacteria to help control green water.',
    'পুকুরের জলজ আগাছা ও ঘাস খায়। ঘাস খাইয়ে দ্রুত ওজন বাড়ানো যায়।': 'Feeds on aquatic weeds and grasses, helping rapid growth.',
    'তলার মাটি নাড়াচাড়া করে জমে থাকা ক্ষতিকর গ্যাস বের করে দেয়।': 'Stirs bottom soil and releases trapped harmful gases.',
    'কাতলার সাথে প্রতিযোগিতা করতে পারে, তাই নিয়ন্ত্রিত সংখ্যায় মজুদ করতে হয়।': 'Can compete with Catla, so stock in controlled numbers.',
    'নিবিড় উচ্চ ঘনত্বের বাণিজ্যিকভাবে লাভজনক চাষযোগ্য মাছ।': 'A commercially profitable species for intensive high-density culture.',
    'প্রতিকূল আবহাওয়া ও কম অক্সিজেনেও টিকে থাকতে পারে।': 'Tolerant of adverse weather and low oxygen.',
    'অতিরিক্ত শ্বাসযন্ত্র আছে, অগভীর পুকুরেও চাষ সম্ভব।': 'Has accessory breathing organs and can be cultured in shallow ponds.',
    'উচ্চ পুষ্টিগুণ ও বাজারমূল্যের দেশীয় শিং মাছ।': 'A nutritious, high-value native Shing catfish.',
    'রোগীর পথ্য হিসেবে বিখ্যাত দেশীয় সুস্বাদু মাগুর মাছ।': 'A flavorful native Magur catfish often recommended for patients.',
    'অত্যন্ত চড়া বাজারমূল্যের সুস্বাদু ক্যাটফিশ।': 'A premium-market gourmet catfish.',
    'শিকারি মাছ। সাধারণ মিশ্র চাষের পুকুরে অন্য পোনা খেয়ে ফেলে।': 'A predator fish that may eat other stocked fry in a mixed pond.',
    'নদীর তলার সুস্বাদু শিকারি ক্যাটফিশ।': 'A prized river-bottom predator catfish.',
    'গভীর পানির নিশাচর শিকারি মাছ।': 'A nocturnal predator fish of deep water.',
    '⚠️ বাংলাদেশে থাই/আফ্রিকান মাগুর চাষ ও বিক্রি আইনত সম্পূর্ণ নিষিদ্ধ। পরিবেশ ও জীববৈচিত্র্যের জন্য অত্যন্ত ক্ষতিকর।': '⚠️ Thai/African Magur farming and sale are legally banned in Bangladesh. Extremely harmful to the environment and biodiversity.',
    'দ্রুত বাড়ে এবং পুকুরের নরম আগাছা খায়।': 'Grows fast and consumes soft pond weeds.',
    'প্রচুর ক্যালসিয়াম ও ভিটামিন সমৃদ্ধ দেশীয় ছোট মাছ।': 'A native small fish rich in calcium and vitamins.',
    'উচ্চ বাজারমূল্যের ছোট ক্যাটফিশ।': 'A high-value small catfish.',
    'বায়ুশ্বাসী শিকারি মাছ। শক্ত ও সহনশীল।': 'An air-breathing predator fish; hardy and resilient.',
    'খুলনা, সাতক্ষীরা ও বাগেরহাটের প্রধান রপ্তানযোগ্য লোনা পানি চিংড়ি।': 'A major saltwater export shrimp from Khulna, Satkhira, and Bagerhat.',
    'মিঠা পানির সবচেয়ে মূল্যবান চিংড়ি। কার্পের সাথে সমন্বিত চাষ উপযোগী।': 'The most valuable freshwater prawn, suitable for integrated culture with carp.',
    'উপকূলীয় মোটাতাজাকরণ ও রপ্তানি সম্ভাবনা।': 'Suitable for coastal fattening and export.',
    'লোনা ও ইষৎ লোনা পানির দামি শিকারি মাছ।': 'A premium predator fish of saline and slightly brackish water.',
    'নোট: সামুদ্রিক আসল রূপচাঁদার সাথে বিভ্রান্ত হবেন না (সমুদ্রের আসল রূপচাঁদা আলাদা)।': 'Note: Do not confuse with true marine pomfret. This is farmed pacu.',
    'মেজর কার্পের চেয়ে অধিক রোগপ্রতিরোধ ক্ষমতাসম্পন্ন দেশীয় মাছ।': 'A native fish with higher disease resistance than major carp.',
    'দেশীয় মাইনর কার্প।': 'A native minor carp.',
    'দেশীয় নদী-বিলের মাইনর কার্প।': 'A native river/beel minor carp.',
    'প্রচুর ভিটামিন-এ সমৃদ্ধ। অন্ধত্ব প্রতিরোধে বাচ্চাদের জন্য অত্যন্ত উপকারী।': 'Rich in vitamin A and highly beneficial for preventing blindness in children.',
    'মুক্ত জলাশ্যের রূপালী ছোট মাছ।': 'A small silver fish from open water.',
    'অত্যন্ত সুস্বাদু ও পুষ্টিকর বিলুপ্তপ্রায় দেশীয় ছোট মাছ।': 'A very tasty native small fish that is nearly endangered.',
    'অগভীর জলাশয় ও ডোবার উপযোগী দেশীয় মাছ।': 'A native fish suited for shallow wetlands and ditches.',
    'বিলে প্রাকৃতিকভাবে বেড়ে ওঠা দেশীয় মাছ।': 'A native fish naturally grown in beels.',
    'পুকুরের তলার কাদায় গর্ত করে থাকে।': 'Burrows into pond mud.',
    'রক্তস্বল্পতা দূরীকরণে ও আন্তর্জাতিক বাজারে রপ্তানি সম্ভাবনা সম্পন্ন।': 'Used for anemia treatment and has international export potential.',
    'স্বাদু ও লোনা উভয় পানির মিষ্টি স্বাদের তলার মাছ।': 'A tasty bottom fish for both freshwater and slightly saline waters.',
    'কক্সবাজার ও উপকূলের বিখ্যাত সামুদ্রিক মাছ।': 'A famous marine fish from Cox’s Bazar and the coast.',
    'শুঁটকির জন্য অত্যন্ত জনপ্রিয় সামুদ্রিক মাছ।': 'A very popular marine fish for drying.',
    'উপকূলীয় নোনা ও মিষ্টি পানির মোহনার মাছ।': 'A mouth-watering fish of coastal brackish and fresh water.',
    'বাংলাদেশের জাতীয় মাছ। দ্বিমুখী নিষেধাজ্ঞা (মা ইলিশ সংরক্ষণ ও জাটকা নিধন নিষেধাজ্ঞা) প্রযোজ্য।': 'Bangladesh national fish. Protected by both mother hilsa and jatka bans.',
    'নদীর সুস্বাদু কাঁটাময় চর্বিযুক্ত মাছ।': 'A delicious river fish with fine bones and oily flesh.',
    'উচ্চ বাজারমূল্যের বিশেষ সুস্বাদু মাছ।': 'A premium, high-market value fish.',
    'কাচের মতো স্বচ্ছ ছোট দেশীয় মাছ।': 'A glass-like small native fish.',
    'সুন্দর ডোরাকাটা আকর্ষনীয় দেশীয় রূপালী মাছ।': 'An attractive native silver fish with vertical stripes.',
    'সমুদ্রের আসল রূপচাঁদা। (ফার্মের রূপচাঁদা বা পাকু মাছের থেকে আলাদা)।': 'True marine pomfret. Different from farmed pomfret or Pacu.',
    'গভীর সমুদ্রের বাণিজ্যিক মাছ।': 'A commercially important deep-sea fish.',
    'ছোট দেশীয় গুড়া চিংড়ি। রান্নায় স্বাদ বাড়ায়।': 'A small native freshwater shrimp that adds flavor to dishes.',
}

for old, new in replacements.items():
    text = text.replace(old, new)

# Replace translation map to English-only labels
text = re.sub(
    r"const CATEGORY_TRANSLATIONS: Record<string, string> = \{.*?\};\n\nexport const FISHERIES_SPECIES_48",
    "const CATEGORY_TRANSLATIONS: Record<string, string> = {\n  'Major Carp': 'Major Carp',\n  'Exotic Carp': 'Exotic Carp',\n  Catfish: 'Catfish',\n  'Air-Breathing Catfish': 'Air-Breathing Catfish',\n  'All-Depth': 'All-Depth',\n  'Small Indigenous Species (SIS)': 'Small Indigenous Species (SIS)',\n  'Brackish/Marine Farmed': 'Brackish/Marine Farmed',\n  Crustacean: 'Crustacean',\n  'Marine Capture': 'Marine Capture',\n  'Banned-Species Warning': 'Banned-Species Warning',\n  'Catfish/Riverine': 'Catfish/Riverine',\n  Riverine: 'Riverine',\n  Snakehead: 'Snakehead',\n  Eel: 'Eel',\n  Goby: 'Goby',\n};\n\nexport const FISHERIES_SPECIES_48",
    text,
    flags=re.S,
)

# Replace derived species mapping block to use English labels
text = re.sub(
    r"export const FISHERIES_SPECIES_48: ExtendedFisheriesSpecies\[\] = FISHERIES_SPECIES_LIST\.map\(\(fish\) => \(\{.*?\}\)\);",
    "export const FISHERIES_SPECIES_48: ExtendedFisheriesSpecies[] = FISHERIES_SPECIES_LIST.map((fish) => ({\n  ...fish,\n  nameBn: fish.commonNameEn,\n  nameEn: fish.commonNameEn,\n  categoryBn: CATEGORY_TRANSLATIONS[fish.category] || fish.category,\n  shortDescBn: fish.notes,\n  pondZoneBn: fish.depthLayer === 'surface' ? 'Surface' : fish.depthLayer === 'column' ? 'Column' : fish.depthLayer === 'bottom' ? 'Bottom' : 'Boundary (Air-breathing)',\n  feedingHabitBn: fish.feedType,\n  cultureTypeBn: fish.isBannedSpecies ? 'Banned species' : fish.isCaptureOnly ? 'Capture only' : 'Suitable for mixed pond farming',\n}));",
    text,
    flags=re.S,
)

species_path.write_text(text, encoding='utf-8')
print('Updated', species_path)

# 2) Replace the pond depth matrix entirely
pond_path = BASE / 'src' / 'data' / 'pondDepthMatrix.ts'
pond_path.write_text(
    """import { PondDepthZone } from '../types';

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
""",
    encoding='utf-8'
)
print('Updated', pond_path)

# 3) Update FisheriesView search and potential labels if needed
view_path = BASE / 'src' / 'views' / 'FisheriesView.tsx'
view_text = view_path.read_text(encoding='utf-8')
view_text = view_text.replace(
    "return item.nameBn.toLowerCase().includes(q) || item.nameEn.toLowerCase().includes(q);",
    "return item.nameEn.toLowerCase().includes(q);",
)
view_path.write_text(view_text, encoding='utf-8')
print('Updated', view_path)
