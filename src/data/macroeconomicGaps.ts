export interface MacroGapCard {
  id: string;
  titleBn: string;
  titleEn: string;
  summaryBn: string;
  summaryEn?: string;
  fullDetailBn: string;
  fullDetailEn?: string;
  actionableInsightBn: string;
  actionableInsightEn?: string;
  iconName: string;
}

export const MACROECONOMIC_GAPS_LIST: MacroGapCard[] = [
  {
    id: 'gap_1_price_volatility',
    titleBn: 'ঋতুভিত্তিক বাজারদরের তীব্র ওঠানামা (Dynamic Price Volatility)',
    titleEn: 'Seasonal Price Volatility',
    summaryBn: 'মৌসুমের ভরা কাটতির সময় দাম ৩০–৩০০% পর্যন্ত কমে যায়।',
    summaryEn: 'Prices can drop sharply during peak harvest, sometimes 30–300%.',
    fullDetailBn: 'ইলিশ মাছের ভরা মৌসুমে (আগস্ট–অক্টোবর) আড়তে দাম কেজিপ্রতি ৫০০-৭০০ টাকা হলেও নিষিদ্ধ বা শুকনো মৌসুমে তা ১,৫০০-২,২০০ টাকায় ওঠে। ডিসেম্বরে পুকুরের মাছ একযোগে সেচে বিক্রির ফলে কার্প ও পাঙ্গাসের দাম ২০-৩৫% কমে যায়। বৈশাখ ও ঈদে দাম ২৫-৪০% বাড়ে।',
    fullDetailEn: 'For example, hilsa prices can be 500-700 BDT/kg in peak season and rise to 1,500-2,200 BDT/kg in off-season. Carp and pangas prices fall 20–35% after mass pond harvest; prices rise 25–40% during festivals.',
    actionableInsightBn: 'বাজারদর পূর্বাভাস চার্ট দেখে ভরা কাটতির দিনগুলোতে বিক্রি না করে অন্তত ২-৩ সপ্তাহ আগে বা পরে বিক্রি পরিকল্পনা করুন।',
    actionableInsightEn: 'Use price forecast charts and avoid selling during peak harvest; plan sales 2–3 weeks before or after the glut.',
    iconName: 'TrendingUp',
  },
  {
    id: 'gap_2_aratdar_margin',
    titleBn: 'মধ্যস্বত্বভোগী ও আড়তদারের কাটছাঁট (Supply Chain Margin Leakage)',
    titleEn: 'Aratdar Margin Leakage',
    summaryBn: 'শহরের খুচরা মূল্যের মাত্র ৪৫–৬২% কৃষক পান। বাকিটা হাতবদলে নষ্ট হয়।',
    summaryEn: 'Farmers receive only 45–62% of retail price; the rest is lost along the chain.',
    fullDetailBn: 'আড়তদার কমিশন কাটে ৩-৫%। পাইকাররা "ঢালতা" বা ভিজা ওজন অজুহাতে ৫% ওজন কেটে নেয়। পরিবহনে ৮-১২% মাছ নষ্ট বা ফ্রেশনেস হারায়।',
    fullDetailEn: 'Middlemen take commissions (3–5%), wholesalers underreport weight (~5%), and transport losses account for 8–12% degradation.',
    actionableInsightBn: 'দলগত বা সমবায় ভিত্তিতে (Cooperative Selling) সরাসরি বেপারী বা সুপারশপে একসাথে সরবরাহ করলে ১০-১৫% বেশি দাম পাওয়া যায়।',
    actionableInsightEn: 'Cooperative or direct sales to traders/shops can increase farmer prices by 10–15%.',
    iconName: 'Percent',
  },
  {
    id: 'gap_3_feed_fcr',
    titleBn: 'খাদ্যের দাম ও FCR সংবেদনশীলতা (Feed Price Sensitivity)',
    titleEn: 'Feed Price & FCR Sensitivity',
    summaryBn: 'পুকুরের মোট খরচের ৬০-৭৫% খাবারের খরচ। FCR সামান্য বাড়লেই লোকসান।',
    summaryEn: 'Feed represents 60–75% of pond costs; small FCR increases can turn profit into loss.',
    fullDetailBn: 'পাঙ্গাস বা তেলাপিয়া চাষে FCR ১.৪ থাকলে কেজিপ্রতি খাবার খরচ ৯১ টাকা (লাভজনক); কিন্তু FCR ১.৮ এ উঠলে খাবার খরচ হয় ১১৭ টাকা (লোকসান)।',
    fullDetailEn: 'For pangas/tilapia, an FCR of 1.4 yields ~91 BDT/kg feed cost (profitable); at FCR 1.8 feed cost rises to ~117 BDT/kg (loss).',
    actionableInsightBn: 'পুকুর স্টকিং প্ল্যানার ও FCR ক্যালকুলেটর ব্যবহার করে ভাসমান ফিডের সঠিক অপচয়হীন মাত্রা হিসাব করুন।',
    actionableInsightEn: 'Use stocking planners and FCR calculators to optimize feed usage and reduce waste.',
    iconName: 'Scale',
  },
  {
    id: 'gap_4_dadon_trap',
    titleBn: 'দাদন ঋণের ফাঁদ ও মূলধনের অভাব (The Informal Dadon Credit Trap)',
    titleEn: 'Dadon Credit Trap',
    summaryBn: 'স্থানীয় মহাজন বা আড়তদারের দাদন নিলে ১০-১৫% চড়া দামে খাবার কিনতে হয় ও কম দামে বিক্রি করতে হয়।',
    summaryEn: 'Informal "dadon" loans force farmers to buy inputs at 10–15% higher prices and sell at lower rates.',
    fullDetailBn: 'ব্যাংক ঋণের অভাবে প্রায় ৮৮% ক্ষুদ্র মৎস্য ও ধান চাষী দাদন নেন। এর ফলে মহাজনের কাছ থেকে ১০-১৫% বেশি দামে খাবার কিনতে হয় এবং ফসল আড়তদারের কাছে বাজারদরের চেয়ে কম দামে বিক্রি করতে বাধ্য হতে হয়, যা বার্ষিক লাভের ২০-৩৫% কমিয়ে দেয়।',
    fullDetailEn: 'Due to lack of bank credit, ~88% of small fish/rice growers take dadon, buying feed at 10–15% higher cost and selling below market, reducing annual profits by 20–35%.',
    actionableInsightBn: 'আমাদের "আর্থিক সহায়তা খুঁজুন" টুলে বাংলাদেশ ব্যাংকের ৪% রেয়াতি সুদের ঋণ বা পিকেএসএফ/কৃষক কার্ডের সুবিধা অনুসন্ধান করুন।',
    actionableInsightEn: 'Use the finance finder tool to locate concessional 4% loans from Bangladesh Bank or PKSF/farmer card schemes.',
    iconName: 'AlertOctagon',
  },
  {
    id: 'gap_5_disaster_risk',
    titleBn: 'জলবায়ু ঝুঁকি ও শস্য বীমার অনুপস্থিতি (Disaster Risk & Insurance Gap)',
    titleEn: 'Disaster & Insurance Gap',
    summaryBn: 'আকস্মিক বন্যা বা তাপদাহে শতভাগ ক্ষয়ক্ষতির ঝুঁকি থাকলেও বীমা কভারেজ ১%-এর কম।',
    summaryEn: 'Despite 100% loss risks from floods or heatwaves, insurance coverage is below 1%.',
    fullDetailBn: 'হাওর বা দক্ষিণাঞ্চলে আকস্মিক বন্যায় ঘের ও পুকুর ডুবে ৩-৪ ঘণ্টায় সব মাছ ভেসে যায়। গ্রীষ্মে ৩৪°সে-এর বেশি তাপমাত্রায় অক্সিজেন শূন্য হয়ে পচা প্রাদুর্ভাব ঘটে।',
    fullDetailEn: 'Sudden floods can wash away pond stock in hours; heatwaves above 34°C cause oxygen depletion and mass mortality.',
    actionableInsightBn: 'আবহাওয়া এলার্ট দেখে পুকুরের পাড় জাল দিয়ে ঘিরে রাখুন এবং WIBCI শস্য ও মৎস্য বীমায় ডিজিটাল রেজিস্ট্রেশন নিশ্চিত করুন।',
    actionableInsightEn: 'Follow weather alerts, protect ponds with netting, and register for WIBCI crop/fish insurance digitally.',
    iconName: 'CloudRain',
  },
  {
    id: 'gap_6_regional_disparity',
    titleBn: 'আঞ্চলিক বাজারদরের বৈষম্য (Regional Price Disparity)',
    titleEn: 'Regional Price Disparity',
    summaryBn: 'ময়মনসিংহে যে মাছের কেজি ১৪০ টাকা, সিলেটে বা চট্টগ্রামে তা ১৯০-২২০ টাকা।',
    summaryEn: 'Regional price differences can be 30–60% between surplus and deficit zones.',
    fullDetailBn: 'ময়মনসিংহ/ভালুকায় উদ্বৃত্ত চাষের কারণে পাঙ্গাস/তেলাপিয়ার পাইকারি দর কম থাকে। অন্যদিকে সিলেট ও চট্টগ্রাম ঘাটতি এলাকা হওয়ায় সেখানে কার্প ও পাবদার দাম ২৫-৪০% বেশি থাকে।',
    fullDetailEn: 'Surplus areas (e.g., Mymensingh) have lower wholesale prices, while deficit areas (e.g., Sylhet/Chattogram) pay 25–40% more.',
    actionableInsightBn: 'আমাদের "কোথায় বিক্রি করবেন" তুলনা ফিচার ব্যবহার করে পাশের পাইকারি আড়ত ও আঞ্চলিক দর পার্থক্য জেনে সিদ্ধান্ত নিন।',
    actionableInsightEn: 'Use the "where to sell" comparison tool to find nearby wholesale markets and regional price differences.',
    iconName: 'MapPin',
  },
  {
    id: 'gap_7_export_compliance',
    titleBn: 'রপ্তানি মানদণ্ড ও ট্রেসেবিলিটি খরচ (Export & Traceability Compliance)',
    titleEn: 'Export Compliance',
    summaryBn: 'ইউরোপীয় ইউনিয়নে অ্যান্টিবায়োটিক ও কেমিক্যালমুক্ত ট্রেসেবিলিটি সার্টিফিকেট ছাড়া রপ্তানি সম্ভব নয়।',
    summaryEn: 'Exports require antibiotic-free and traceable certificates; otherwise shipments are rejected.',
    fullDetailBn: 'চিংড়ি ও কুচিয়া রপ্তানিতে নাইট্রোফিউরান বা কেমিক্যাল ধরা পড়লে পুরো কনটেইনার বাতিল হয়। খামার থেকে বাজার পর্যন্ত ডিজিটালি উৎস প্রমাণের বারকোট প্রয়োজন।',
    fullDetailEn: 'If residues are found, entire export containers are rejected; digital batch traceability from farm to market is required.',
    actionableInsightBn: 'আমাদের "ট্রেসেবিলিটি QR জেনারেটর" ব্যবহার করে আপনার ফসল/মাছের ব্যাচ ডিজিটাল প্রমানপত্র তৈরি করুন।',
    actionableInsightEn: 'Use the traceability QR generator to produce digital certificates for your batches before export.',
    iconName: 'QrCode',
  },
];
