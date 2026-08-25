export interface AgriKnowledgeEntry {
  id: string;
  titleBn: string;
  titleEn: string;
  module: string;
  summaryBn: string;
  summaryEn: string;
  keywords: string[];
  sources: string[];
}

export const AGRO_DATASET_KNOWLEDGE: AgriKnowledgeEntry[] = [
  {
    id: 'crop-recommendation',
    titleBn: 'ফসল সাজেশন ও মাটির তথ্য',
    titleEn: 'Crop recommendation and soil intelligence',
    module: '4.1 Crop Recommendation',
    summaryBn: 'ফসল সাজেশনে মাটির pH, NPK, আবহাওয়া ও AEZ তথ্য ব্যবহার করলে ফলন ও লাভদায়কতা বাড়ে। বাংলাদেশের SRDI ও AEZ তথ্যকে পছন্দের ফসল সাজাতে ব্যবহার করা যায়।',
    summaryEn: 'Crop recommendation improves when soil pH, NPK, weather, and AEZ data are combined. SRDI and Bangladesh AEZ data are strong anchors for practical guidance.',
    keywords: ['ফসল', 'সার', 'মাটি', 'AEZ', 'SRDI', 'crop', 'soil', 'fertilizer'],
    sources: ['Kaggle crop recommendation datasets', 'SRDI soil data', 'Bangladesh AEZ references'],
  },
  {
    id: 'disease-detection',
    titleBn: 'রোগ শনাক্তকরণ',
    titleEn: 'Plant and animal disease detection',
    module: '4.3 Disease Detection',
    summaryBn: 'PlantVillage, PlantDoc, Cassava Leaf Disease, Lumpy Skin Imaging-এর মতো ডেটাসেট ব্যবহার করে পাতার রোগ, গরুর লাম্পি স্কিন ও অন্যান্য রোগের প্রাথমিক শনাক্তকরণ করা যায়।',
    summaryEn: 'Disease recognition can rely on PlantVillage, PlantDoc, cassava disease images, and lumpy skin imaging datasets to detect common problems earlier.',
    keywords: ['রোগ', 'disease', 'পাতা', 'leaf', 'লাম্পি', 'lumpy', 'চিকিৎসা'],
    sources: ['PlantVillage', 'PlantDoc', 'Cassava Leaf Disease', 'Lumpy Skin datasets'],
  },
  {
    id: 'irrigation-advisory',
    titleBn: 'সেচ ও IoT পরামর্শ',
    titleEn: 'Irrigation and IoT advisory',
    module: '4.4 Irrigation Advisory',
    summaryBn: 'সেচের সময়, পানির স্তর ও মাটির আর্দ্রতা IoT সেন্সর দিয়ে নিরীক্ষণ করলে সেচের অপচয় কমে এবং ফসলের স্বাস্থ্য ভালো থাকে।',
    summaryEn: 'IoT sensors for soil moisture, pond level, and irrigation timing reduce water waste and improve crop health.',
    keywords: ['সেচ', 'irrigation', 'IoT', 'পানি', 'water', 'আর্দ্রতা'],
    sources: ['IoT irrigation review datasets', 'precision irrigation studies'],
  },
  {
    id: 'market-pricing',
    titleBn: 'বাজার মূল্য ও লাভ বিশ্লেষণ',
    titleEn: 'Market prices and profitability',
    module: '4.5 Market Price',
    summaryBn: 'বাজারদর ভবিষ্যদ্বাণী এবং লাভ-ভিত্তিক পরামর্শের জন্য AgriPriceBD, World Bank, FAO, USDA/FAS-এর তথ্য ব্যবহার করা যায়।',
    summaryEn: 'AgriPriceBD, World Bank, FAO, and USDA/FAS references provide useful anchors for price forecasting and profit-aware advice.',
    keywords: ['বাজার', 'market', 'মূল্য', 'price', 'লাভ', 'profit'],
    sources: ['AgriPriceBD', 'World Bank Pink Sheet', 'FAO', 'USDA/FAS'],
  },
  {
    id: 'livestock-advisory',
    titleBn: 'পশুপালন ও পশু-স্বাস্থ্য',
    titleEn: 'Livestock health advisory',
    module: '4.7 Livestock Advisory',
    summaryBn: 'গরুর লাম্পি স্কিন, পশুর জ্বর, পুষ্টি ও টিকা-সংক্রান্ত তথ্যের জন্য কৃত্রিম বুদ্ধিমত্তা-ভিত্তিক প্রতিক্রিয়া ব্যবহার করা যায়।',
    summaryEn: 'Livestock health guidance can be strengthened with AI-assisted screening for lumpy skin, fever, nutrition, and vaccination timing.',
    keywords: ['গরু', 'ছাগল', 'পশু', 'livestock', 'টিকা', 'vaccination'],
    sources: ['Lumpy skin image datasets', 'livestock disease references'],
  },
  {
    id: 'fisheries-advisory',
    titleBn: 'মৎস্য চাষ ও পুকুর ব্যবস্থাপনা',
    titleEn: 'Fisheries and pond management',
    module: 'F2 & F6 Fisheries',
    summaryBn: 'রোহু, কাতলা, মৃগেল, তেলাপিয়া, পাঙ্গাস ও গলদা চিংড়ির খামার ব্যবস্থাপনায় পুকুরের পানি, খাবার, রোগ ও উৎপাদন পরামর্শ দরকার।',
    summaryEn: 'Pond management for rohu, catla, mrigal, tilapia, pangas, and shrimp benefits from water quality, feed, disease, and growth monitoring.',
    keywords: ['মাছ', 'পুকুর', 'pond', 'fish', 'তেলাপিয়া', 'pangas', 'bagda'],
    sources: ['Bangladesh fishery papers', 'GIFT and carp datasets'],
  },
  {
    id: 'financial-inclusion',
    titleBn: 'ঋণ, বীমা ও ডিজিটাল অর্থায়ন',
    titleEn: 'Credit, insurance, and digital finance',
    module: '4.10 Financial Inclusion',
    summaryBn: 'খরা, বন্যা ও আবহাওয়া-ভিত্তিক ঝুঁকির জন্য WIBCI, bKash, কৃষি ঋণ নথি এবং ডিজিটাল আর্থিক পরিষেবার সমন্বয় দরকার।',
    summaryEn: 'Weather-index insurance and digital finance can support farmer resilience, especially when linked to practical credit and risk products.',
    keywords: ['ঋণ', 'loan', 'বীমা', 'insurance', 'bKash', 'financial'],
    sources: ['WIBCI pilot studies', 'bKash digital finance references'],
  },
  {
    id: 'traceability',
    titleBn: 'পণ্য ট্রেসেবিলিটি ও সাপ্লাই চেইন',
    titleEn: 'Traceability and supply chain',
    module: '4.8 Traceability',
    summaryBn: 'ফল, সবজি, দুধ, মাংস ও মাছের উৎপাদন-পরিবহণ-ব্যবসা ট্রেসে FAOSTAT, ব্লকচেইন এবং RFID তথ্য ব্যবহার করা যায়।',
    summaryEn: 'Traceability for produce and livestock products can improve transparency and market trust when paired with FAOSTAT and blockchain or RFID systems.',
    keywords: ['ট্রেসেবিলিটি', 'traceability', 'সাপ্লাই', 'supply', 'FAOSTAT', 'RFID'],
    sources: ['FAOSTAT', 'blockchain traceability references'],
  },
];

const normalizeText = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .join(' ');

export function getRelevantKnowledge(query: string, lang: 'bn' | 'en' = 'bn') {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return null;
  }

  const scored = AGRO_DATASET_KNOWLEDGE.map((entry) => {
    const haystack = normalizeText(`${entry.titleBn} ${entry.titleEn} ${entry.summaryBn} ${entry.summaryEn} ${entry.module} ${entry.keywords.join(' ')}`);
    let score = 0;

    normalizedQuery.split(/\s+/).forEach((token) => {
      if (token.length < 2) return;
      if (haystack.includes(token)) {
        score += 2;
      }
    });

    entry.keywords.forEach((keyword) => {
      if (normalizedQuery.includes(normalizeText(keyword))) {
        score += 3;
      }
    });

    return { entry, score };
  })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  if (!scored.length) {
    return null;
  }

  const selected = scored.slice(0, 3);
  const summary = selected
    .map((item) => (lang === 'bn' ? `${item.entry.titleBn}: ${item.entry.summaryBn}` : `${item.entry.titleEn}: ${item.entry.summaryEn}`))
    .join('\n');

  return {
    summary,
    sources: selected.flatMap((item) => item.entry.sources),
    topTitle: lang === 'bn' ? selected[0].entry.titleBn : selected[0].entry.titleEn,
  };
}

export function buildDatasetAwareReply(query: string, lang: 'bn' | 'en' = 'bn') {
  const knowledge = getRelevantKnowledge(query, lang);
  if (!knowledge) {
    return lang === 'bn'
      ? 'এই প্রশ্নের জন্য ডেটাসেট-ভিত্তিক প্রাথমিক সাজেশন তৈরি করা হয়েছে। আরও নির্দিষ্টভাবে ফসল, রোগ, মৎস্য, গবাদিপশু বা বাজারের নাম বললে আরও নির্ভুল পরামর্শ দিতে পারি.'
      : 'I prepared a dataset-based starting point for this question. Tell me the crop, disease, livestock, fish, or market topic more specifically for a sharper answer.';
  }

  return lang === 'bn'
    ? `ডেটাসেট-ভিত্তিক নির্দেশনা অনুযায়ী: ${knowledge.summary}`
    : `Based on the dataset-backed guidance: ${knowledge.summary}`;
}
