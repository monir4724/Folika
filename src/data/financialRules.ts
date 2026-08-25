import { FinancialInstitution } from '../types';

export const FINANCIAL_INSTITUTIONS_LIST: FinancialInstitution[] = [
  {
    id: 'bb_agri_policy',
    institutionBn: 'বাংলাদেশ ব্যাংক - কৃষি ও পল্লী ঋণ নীতি (FY2025-26)',
    institutionEn: 'Bangladesh Bank Agri Credit Policy',
    roleBn: 'বাধ্যতামূলক বার্ষিক কৃষি ঋণ লক্ষ্যমাত্রা নির্ধারণ ও ৪% রেয়াতি সুদ সহায়তা।',
    roleEn: 'Mandated annual agricultural credit target with 4% concessional rate support.',
    keyFiguresBn: '৩৯,০০০ কোটি টাকা বিতরণ লক্ষ্যমাত্রা। গম, ভুট্টা, সরিষা, ডাল ও তেলবীজে মাত্র ৪% রেয়াতি সুদ।',
    keyFiguresEn: 'Distribution target of BDT 390 billion and 4% concessional rate for wheat, maize, mustard, pulses, and oilseeds.',
    interestRateBn: '৪% (রেয়াতি) / ৫-৮% (সাধারণ)',
    interestRateEn: '4% concessional / 5-8% standard',
    policyYear: 'FY2025-26',
    isConcessional: true,
    eligibilityCriteria: [
      'কৃষিকাজে সরাসরি নিয়োজিত প্রান্তিক বা ক্ষুদ্র কৃষক',
      'প্রয়োজনীয় ফসল (গম, ভুট্টা, সরিষা, ডাল, পেঁয়াজ, রসুন) চাষের অঙ্গীকার',
      'জমির মালিকানা বা বৈধ বর্গা চাষের প্রমাণ',
    ],
    eligibilityCriteriaEn: [
      'Small or marginal farmers directly engaged in agriculture',
      'Commitment to cultivate eligible crops such as wheat, maize, mustard, pulses, onion, or garlic',
      'Proof of land ownership or valid lease agreement',
    ],
    matchedPercent: 95,
  },
  {
    id: 'farmer_card_dae',
    institutionBn: 'কৃষক কার্ড (Farmer Card) - কৃষি সম্প্রসারণ অধিদপ্তর (DAE)',
    institutionEn: 'DAE Digital Farmer Card',
    roleBn: 'ডিজিটাল কৃষক রেজিস্ট্রি, ভর্তুকি প্রদান, আধুনিক যন্ত্রপাতি ও ঋণ সুবিধা ইন্টিগ্রেশন।',
    roleEn: 'Digital farmer registry with subsidy, modern equipment, and loan integration.',
    keyFiguresBn: 'গড়ে ২,৫০০ টাকা সরাসরি ইনপুট ভর্তুকি সুবিধা এবং অগ্রাধিকারভিত্তিতে প্রণোদনা ও সার বিতরণ।',
    keyFiguresEn: 'Average BDT 2,500 direct input subsidy plus prioritized fertilizer and incentive distribution.',
    interestRateBn: 'ভর্তুকি ও অনুদান ভিত্তিক',
    interestRateEn: 'Subsidy and grant-based support',
    policyYear: 'FY2025-26 (Pre-Pilot)',
    isConcessional: true,
    eligibilityCriteria: [
      'ডিজিটাল কৃষক কার্ডে নিবন্ধিত কৃষক',
      'স্মার্টফোন বা ফিচার ফোনে ডিজিটাল পরিচয় যাচাইকরণ',
    ],
    eligibilityCriteriaEn: [
      'Farmers registered with the digital farmer card',
      'Verified digital identity via smartphone or feature phone',
    ],
    matchedPercent: 90,
  },
  {
    id: 'bkb_rakub_direct',
    institutionBn: 'বাংলাদেশ কৃষি ব্যাংক (BKB) ও রাকাব (RAKUB) ৪% রেয়াতি ঋণ',
    institutionEn: 'BKB & RAKUB Concessional Loan',
    roleBn: 'ডাল, তেলবীজ, মসলা ও ভুট্টা চাষের জন্য বিশেষ ৪% রেয়াতি সুদের সরাসরি শস্য ঋণ।',
    roleEn: 'Direct crop loans at 4% concessional rate for pulses, oilseeds, spices, and maize.',
    keyFiguresBn: 'সর্বোচ্চ ৫,০০,০০৩ টাকা পর্যন্ত জামানতহীন সহজ শর্তে শস্য ঋণ।',
    keyFiguresEn: 'Up to BDT 500,003 in collateral-free crop loans under easy terms.',
    interestRateBn: '৪% (রেয়াতি)',
    interestRateEn: '4% concessional',
    policyYear: '2025-2026',
    isConcessional: true,
    eligibilityCriteria: [
      'বিকেবি বা রাকাব স্থানীয় শাখায় সাধারণ কৃষি হিসাবধারী',
      'ইউনিয়ন উপ-সহকারী কৃষি কর্মকর্তা (SAAO) সুপারিশপত্র',
    ],
    eligibilityCriteriaEn: [
      'General agricultural account holder at local BKB or RAKUB branch',
      'Recommendation letter from union SAAO',
    ],
    matchedPercent: 92,
  },
  {
    id: 'pksf_microfinance',
    institutionBn: 'পল্লী কর্ম-সহায়ক ফাউন্ডেশন (PKSF) ও সহযোগী এনজিও সুবিধা',
    institutionEn: 'PKSF Micro-Agri Financing',
    roleBn: 'ক্ষুদ্র ও প্রান্তিক কৃষকদের সমন্বিত কৃষি ও গবাদিপশু উন্নয়ন ঋণ এবং কারিগরি সহায়তা।',
    roleEn: 'Integrated agriculture and livestock development loans for small and marginal farmers with technical support.',
    keyFiguresBn: 'মোট ঋণের ৪০% কৃষি ও গবাদিপশু খাতে বরাদ্দ। সহজ জামানতহীন ঋণ সুবিধা।',
    keyFiguresEn: '40% of total financing allocated to agriculture and livestock, with easy collateral-free loan options.',
    interestRateBn: '৮-১২% (সার্ভিস চার্জসহ)',
    interestRateEn: '8-12% including service charge',
    policyYear: '2025-2026',
    isConcessional: false,
    eligibilityCriteria: [
      'পিকেএসএফ নিবন্ধিত স্থানীয় এনজিওর সদস্য',
      'গবাদিপশু পালন, মৎস্য চাষ বা সবজি চাষে সরাসরি সম্পৃক্ততা',
    ],
    eligibilityCriteriaEn: [
      'Member of a local NGO registered with PKSF',
      'Directly engaged in livestock, fisheries, or vegetable production',
    ],
    matchedPercent: 85,
  },
  {
    id: 'brac_agri_credit',
    institutionBn: 'ব্র্যাক (BRAC) কৃষি ও ক্ষুদ্রঋণ এবং শস্য বীমা',
    institutionEn: 'BRAC Agriculture & Microinsurance',
    roleBn: 'ফসল কাটা ও বিক্রির সময়ের সাথে মিল রেখে মৌসুমী ঋণ পরিশোধ এবং শস্য বীমা কভারেজ।',
    roleEn: 'Seasonal loan repayment aligned with harvest cycles plus crop insurance coverage.',
    keyFiguresBn: '১ কোটি ঋণগ্রহীতা ও ১০ লাখ কৃষকের শস্য ও গবাদিপশু বীমা নিরাপত্তা কভারেজ।',
    keyFiguresEn: 'Coverage for 1 million borrowers and 1 million farmers with crop and livestock insurance.',
    interestRateBn: 'মৌসুমী হার',
    interestRateEn: 'Seasonal rate',
    policyYear: '2025-2026',
    isConcessional: false,
    eligibilityCriteria: [
      'ব্র্যাক কৃষি দলের সদস্য বা চুক্তিবদ্ধ বীজ উৎপাদনকারী',
      'বাণিজ্যিক পোল্ট্রি, ডেইরি বা শস্য চাষী',
    ],
    eligibilityCriteriaEn: [
      'Member of BRAC agricultural program or contracted seed producer',
      'Commercial poultry, dairy, or crop farmer',
    ],
    matchedPercent: 80,
  },
  {
    id: 'wibci_crop_insurance',
    institutionBn: 'আবহাওয়া সূচকভিত্তিক শস্য বীমা (WIBCI - SBC & bKash)',
    institutionEn: 'Weather Index-Based Crop Insurance',
    roleBn: 'বন্যা, খরা ও আকস্মিক অতিবৃষ্টিতে ফসলের ক্ষয়ক্ষতিতে বিকাশ (bKash) মাধ্যমে দ্রুত ক্ষতিপূরণ।',
    roleEn: 'Rapid payout crop insurance for flood, drought, and extreme rainfall losses via bKash.',
    keyFiguresBn: '৫০:২৫:২৫ প্রিমিয়াম সহায়তা (কৃষক, সরকার ও প্রজেক্ট)। সরাসরি মোবাইল ওয়ালেটে দাবি পরিশোধ।',
    keyFiguresEn: '50:25:25 premium support split among farmer, government, and project, with direct mobile wallet claims.',
    interestRateBn: 'বীমা প্রিমিয়াম ভিত্তিক',
    interestRateEn: 'Premium-based insurance rate',
    policyYear: '2025-2026 (Expanding Pilot)',
    isConcessional: true,
    eligibilityCriteria: [
      'হাওর বা খরা/বন্যাপ্রবণ এলাকার নিবন্ধিত কৃষক',
      'বিকাশ (bKash) বা নগদ একাউন্টধারী',
    ],
    eligibilityCriteriaEn: [
      'Registered farmers in haor, drought, or flood-prone areas',
      'bKash or cash account holder',
    ],
    matchedPercent: 88,
  },
];

export interface ExtendedFinancialScheme {
  id: string;
  schemeNameBn: string;
  schemeNameEn: string;
  interestRatePct: string;
  descriptionBn: string;
  descriptionEn: string;
  requiredDocsBn: string[];
  requiredDocsEn: string[];
  providerOrgBn: string;
  providerOrgEn: string;
}

export const GOVERNMENT_FINANCIAL_SCHEMES: ExtendedFinancialScheme[] = FINANCIAL_INSTITUTIONS_LIST.map((inst) => ({
  id: inst.id,
  schemeNameBn: inst.institutionBn,
  schemeNameEn: inst.institutionEn,
  interestRatePct: inst.interestRateBn,
  descriptionBn: inst.keyFiguresBn,
  descriptionEn: inst.keyFiguresEn || inst.keyFiguresBn,
  requiredDocsBn: inst.eligibilityCriteria,
  requiredDocsEn: inst.eligibilityCriteriaEn || inst.eligibilityCriteria,
  providerOrgBn: inst.institutionBn,
  providerOrgEn: inst.institutionEn,
}));

export const FINANCIAL_INSTITUTIONS = FINANCIAL_INSTITUTIONS_LIST;
