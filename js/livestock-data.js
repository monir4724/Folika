/**
 * FOLIKA — Bangladesh livestock & poultry breed dataset (BLRI / DLS / peer-reviewed ranges)
 */
(function (global) {
  'use strict';

  function fold(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/chittagong/g, 'chattogram')
      .replace(/comilla/g, 'cumilla')
      .replace(/jessore/g, 'jashore')
      .replace(/bogra/g, 'bogura')
      .replace(/barisal/g, 'barishal')
      .replace(/[\s\-_.']/g, '');
  }

  const SPACE_SQFT = { cattle: 45, buffalo: 55, goat: 12, sheep: 12, chicken: 2, duck: 2.5 };
  const HEIGHT_FT = { cattle: 10, buffalo: 11, goat: 8, sheep: 8, chicken: 8, duck: 7 };

  const HAOR = ['sunamganj', 'habiganj', 'netrokona', 'kishoreganj'];
  const COASTAL = ['satkhira', 'bagerhat', 'khulna', 'barguna', 'patuakhali', 'bhola', 'pirojpur', 'jhalokati'];
  const CHAR = ['sirajganj', 'bogura', 'faridpur', 'kurigram', 'gaibandha', 'jamalpur'];
  const HILL = ['rangamati', 'bandarban', 'khagrachhari'];

  const breeds = [
    {
      id: 'rcc', species: 'cattle',
      name_bn: 'রেড চিটাগাং (লাল বিরিশ)', name_en: 'Red Chittagong',
      districts: ['chattogram'], divisions: ['chattogram'],
      type: 'triple', weight: 'ষাঁড় ~৩৪২ কেজি; গাভী ~১৮০ কেজি',
      yield: '~৬১৮ লিটার / ২২৮ দিনের ল্যাকটেশন',
      traits_bn: 'লালচে গায়ের রং; তাপসহনশীল ও রোগপ্রতিরোধী; দুধ, মাংস ও হালকা কাজ—তিন কাজে উপযোগী।',
      traits_en: 'Reddish coat; heat-tolerant and disease-resistant; milk, draught and beef.',
    },
    {
      id: 'pmc', species: 'cattle',
      name_bn: 'পাবনা দুধেল গাভী (PMC)', name_en: 'Pabna Milking Cow',
      districts: ['pabna'], divisions: ['rajshahi'],
      type: 'dairy', weight: 'দেশি গরুর চেয়ে বড় দেহ',
      yield: 'দেশি গরুর চেয়ে বেশি দুধ; ছোট ক্যালভিং ইন্টারভাল',
      traits_bn: 'নদীতীরবর্তী বাথান চারণভূমিতে চরে; দুগ্ধ-উৎপাদনমুখী স্থানীয় উন্নত জাত।',
      traits_en: 'Grazes riverside bathan land; dairy-oriented vs draught Deshi.',
    },
    {
      id: 'nbg', species: 'cattle',
      name_bn: 'নর্থ বেঙ্গল গ্রে (NBG)', name_en: 'North Bengal Grey',
      districts: ['bogura', 'rajshahi', 'natore', 'naogaon', 'joypurhat'],
      divisions: ['rajshahi', 'rangpur'],
      type: 'dairy_draft', weight: 'পরিপক্ব গাভী ~২৪১ কেজি',
      yield: 'পিক ~৩.৫ কেজি/দিন; ল্যাকটেশন ~২১৯ দিন',
      traits_bn: 'গভীর ধূসর থেকে ছাই রং; compact দেহ; বগুড়া অঞ্চলের আদি জাত।',
      traits_en: 'Deep grey to ashy coat; compact body; native to northern Bangladesh.',
    },
    {
      id: 'munshiganj', species: 'cattle',
      name_bn: 'মুন্সিগঞ্জ (মিরকাদিম / হাশা)', name_en: 'Munshiganj (Mirkadim / Hasha)',
      districts: ['munshiganj'], divisions: ['dhaka'],
      type: 'premium_native', weight: 'সাহিত্যে আলাদা পরিমাপ সীমিত',
      yield: 'প্রিমিয়াম স্থানীয় জাত হিসেবে স্বীকৃত',
      traits_bn: 'সাদা রঙে গোলাপি আভা; উন্নত native genotype।',
      traits_en: 'White with pink hue; prized improved native genotype.',
    },
    {
      id: 'madaripur', species: 'cattle',
      name_bn: 'মাদারীপুর গরু', name_en: 'Madaripur cattle',
      districts: ['madaripur'], divisions: ['dhaka'],
      type: 'improved_native', weight: 'মাঝারি দেহ',
      yield: 'মধ্য বাংলাদেশের উন্নত native জাত',
      traits_bn: 'পাবনা ও NBG-এর সাথে গুরুত্বপূর্ণ native improved genotype।',
      traits_en: 'Key native improved genotype of central Bangladesh.',
    },
    {
      id: 'deshi_cattle', species: 'cattle',
      name_bn: 'দেশি (স্থানীয়) গরু', name_en: 'Deshi (non-descript local)',
      districts: [], divisions: [], nationwide: true,
      type: 'draught', weight: 'PMC/উন্নত জাতের চেয়ে ছোট',
      yield: 'দুধ কম; ক্যালভিং ইন্টারভাল লম্বা',
      traits_bn: 'সারা দেশে সবচেয়ে সাধারণ; বেশিরভাগ গাভী হালকা কাজেও ব্যবহৃত হয়।',
      traits_en: 'Most common type nationwide; often used for draught.',
    },
    {
      id: 'gangatiri', species: 'cattle',
      name_bn: 'গঙ্গাতিরি (আঞ্চলিক)', name_en: 'Gangatiri',
      districts: ['rajshahi', 'chapainawabganj', 'kushtia'],
      divisions: ['rajshahi', 'khulna'],
      type: 'dairy_draft', weight: 'মাঝারি দেহ',
      yield: 'স্থানীয় দুধ/হালকা কাজ',
      traits_bn: 'সোজা লোম, ধূসর ছায়া, স্পষ্ট পোল; সীমান্ত/নদীতীরবর্তী এলাকা।',
      traits_en: 'Straight-haired, grey shading, prominent poll.',
    },
    {
      id: 'cross_dairy', species: 'cattle',
      name_bn: 'ক্রসব্রেড (হোলস্টেইন / শাহিওয়াল / জার্সি)', name_en: 'Crossbred (HF / Sahiwal / Jersey)',
      districts: [], divisions: [], nationwide: true,
      type: 'dairy', weight: 'ক্রস অনুযায়ী ভিন্ন',
      yield: 'ভালো ব্যবস্থাপনায় দেশি জাতের চেয়ে বেশি দুধ',
      traits_bn: 'গরম-আর্দ্র জলবায়ুতে তাপস্ট্রেস বেশি; ভালো ঘর ও খাদ্য দরকার।',
      traits_en: 'Higher milk under good management; more heat-stress prone.',
    },
    {
      id: 'local_buffalo', species: 'buffalo',
      name_bn: 'দেশি মহিষ (নদীয়া / সোয়াম্প)', name_en: 'Indigenous buffalo',
      districts: [], divisions: [], nationwide: true,
      type: 'riverine_swamp', weight: '২৫০–৪৫০ কেজি',
      yield: '~৫৫০ কেজি দুধ / ~৩৭৪ দিন (~২.৫–৪ লি/দিন)',
      traits_bn: 'বেশিরভাগ এলাকায় নদীয়া টাইপ; উত্তর-পূর্ব হাওরে সোয়াম্প টাইপ (৪৮ ক্রোমোজোম)।',
      traits_en: 'Riverine in most areas; swamp type in the north-east haor.',
    },
    {
      id: 'murrah', species: 'buffalo',
      name_bn: 'মুররাহ (আমদানিকৃত / ক্রস)', name_en: 'Murrah',
      districts: [], divisions: [], nationwide: true,
      type: 'dairy', weight: 'পুং ~৫৫০–৭০০; স্ত্রী ~৪৫০–৫৫৬ কেজি',
      yield: '~১,৫০০–২,৬০০+ কেজি / ল্যাকটেশন',
      traits_bn: 'কুণ্ডলী শিং, চওড়া গভীর দেহ; সরকারি নিউক্লিয়াস/ক্রস প্রজননে ব্যবহৃত।',
      traits_en: 'Curled horns, heavy frame; used in nucleus/crossbreeding herds.',
    },
    {
      id: 'nili_ravi', species: 'buffalo',
      name_bn: 'নিলি-রবি', name_en: 'Nili-Ravi',
      districts: [], divisions: [], nationwide: true,
      type: 'dairy', weight: 'পুং ~৬০০–৭০০; স্ত্রী ~৪৫০–৬০০ কেজি',
      yield: '~১,৮০০–২,০০০ কেজি / ল্যাকটেশন, ~৭% ফ্যাট',
      traits_bn: 'কালো/বাদামি গায়ে মাথা ও পায়ে সাদা দাগ; সরকারি ক্রস প্রজনন।',
      traits_en: 'Black/brown with white markings; govt crossbreeding programs.',
    },
    {
      id: 'buff_cross', species: 'buffalo',
      name_bn: '৫০% ক্রসব্রেড মহিষ', name_en: '50% crossbred buffalo',
      districts: [], divisions: [], nationwide: true,
      type: 'semi', weight: 'দেশি ও বিদেশি জাতের মাঝামাঝি',
      yield: 'খাঁটি দেশির চেয়ে বেশি, খাঁটি বিদেশির চেয়ে কম',
      traits_bn: '২০১৯ থেকে DLS ও বেসরকারি AI ক্রস প্রজনন।',
      traits_en: 'AI-based crossbreeding since 2019.',
    },
    {
      id: 'black_bengal', species: 'goat',
      name_bn: 'ব্ল্যাক বেঙ্গল ছাগল', name_en: 'Black Bengal',
      districts: [], divisions: [], nationwide: true,
      type: 'meat_skin', weight: 'প্রাপ্তবয়স্ক মাদি ~২০–২২ কেজি',
      yield: 'গড় বাচ্চা ~১.৫–২.০৩ / বাচ্চাপ্রসব; দুধ ~১৬২–২১৪ মিলি/দিন',
      traits_bn: 'ছোট কালো গায়ের রং; অত্যন্ত prolific ও রোগপ্রতিরোধী; স্বল্প জমিতে পালনযোগ্য।',
      traits_en: 'Small black-coated, highly prolific; suited to land-poor households.',
    },
    {
      id: 'garole', species: 'sheep',
      name_bn: 'গরোল (বেঙ্গল শিপ)', name_en: 'Garole (Bengal sheep)',
      districts: ['satkhira', 'bagerhat', 'khulna'],
      divisions: ['khulna', 'barishal'],
      type: 'mutton_wool', weight: 'ক্ষুদ্র দেহ (মাইক্রো-শিপ)',
      yield: 'মাংস ও মোটা পশম',
      traits_bn: 'গরম-আর্দ্র উপকূলীয় জলাভূমিতে অভিযোজিত; জলের ধারে চরে।',
      traits_en: 'Adapted to hot-humid coastal wetlands; grazes near water.',
    },
    {
      id: 'deshi_chicken', species: 'chicken',
      name_bn: 'দেশি মুরগি (নন-ডেসক্রিপ্ট)', name_en: 'Non-descript Deshi chicken',
      districts: [], divisions: [], nationwide: true,
      type: 'backyard', weight: 'পরিপক্ব ~১.৩ কেজি',
      yield: '~৪৫–৫০ ডিম/বছর',
      traits_bn: 'ব্যাকইয়ার্ড scavenging; দেশীয় ডিম ও মাংসের বড় অংশ।',
      traits_en: '~90% of indigenous flock; backyard scavenging.',
    },
    {
      id: 'naked_neck', species: 'chicken',
      name_bn: 'নেকড নেক (BLRI উন্নত দেশি)', name_en: 'Naked Neck (BLRI)',
      districts: [], divisions: ['mymensingh'], nationwide: true,
      type: 'improved_native', weight: 'ফাউন্ডেশন স্টকের চেয়ে উন্নত বৃদ্ধি',
      yield: 'উন্নত ডিম উৎপাদন',
      traits_bn: 'পালকহীন গলা তাপসহনশীলতা বাড়ায়; BLRI সংরক্ষণ কর্মসূচি।',
      traits_en: 'Featherless neck aids heat tolerance; BLRI conservation.',
    },
    {
      id: 'hilly_chicken', species: 'chicken',
      name_bn: 'হিলি মুরগি (BLRI)', name_en: 'Hilly chicken (BLRI)',
      districts: ['rangamati', 'bandarban', 'khagrachhari'],
      divisions: ['chattogram'],
      type: 'hill_native', weight: 'উন্নত বৃদ্ধি',
      yield: 'উন্নত ডিম',
      traits_bn: 'পার্বত্য জেলায় অভিযোজিত BLRI-সংরক্ষিত দেশি জাত।',
      traits_en: 'Adapted to hill districts; BLRI-conserved native variety.',
    },
    {
      id: 'sonali', species: 'chicken',
      name_bn: 'সোনালী (RIR × Fayoumi)', name_en: 'Sonali',
      districts: [], divisions: [], nationwide: true,
      type: 'dual', weight: 'দেশির চেয়ে দ্রুত বৃদ্ধি',
      yield: 'দেশির চেয়ে বেশি ডিম; অতিরিক্ত মোরগ মাংস',
      traits_bn: 'ছোটখাটো খামারির জনপ্রিয় দ্বৈত-উদ্দেশ্য ক্রস।',
      traits_en: 'Popular dual-purpose commercial cross for smallholders.',
    },
    {
      id: 'fayoumi', species: 'chicken',
      name_bn: 'ফায়ুমি', name_en: 'Fayoumi',
      districts: [], divisions: [], nationwide: true,
      type: 'layer_parent', weight: 'কম দিনবয়সী ওজন',
      yield: 'তুলনামূলক ট্রায়ালে ~৩৬% hen-day ডিম',
      traits_bn: 'সহনশীল, রোগপ্রতিরোধী; সোনালী তৈরির প্যারেন্ট।',
      traits_en: 'Hardy; used in Sonali crossing.',
    },
    {
      id: 'rir', species: 'chicken',
      name_bn: 'রোড আইল্যান্ড রেড (RIR)', name_en: 'Rhode Island Red',
      districts: [], divisions: [], nationwide: true,
      type: 'layer_parent', weight: 'তুলনায় বেশি দিনবয়সী ওজন',
      yield: 'ট্রায়ালে ~৪১% ডিম উৎপাদন',
      traits_bn: 'হ্যাচারিতে প্যারেন্ট স্টক; ফায়ুমির সাথে সোনালী।',
      traits_en: 'Hatchery parent stock; crossed with Fayoumi for Sonali.',
    },
    {
      id: 'deshi_duck', species: 'duck',
      name_bn: 'দেশি হাঁস', name_en: 'Deshi duck',
      districts: [], divisions: ['sylhet', 'mymensingh', 'barishal', 'khulna'],
      nationwide: true,
      type: 'scavenging', weight: 'খাকি ক্যাম্পবেলের চেয়ে কম',
      yield: 'কম ডিম কিন্তু বেশি সহনশীল',
      traits_bn: 'হাওর/জলাভূমি scavenging-এ অভিযোজিত।',
      traits_en: 'Adapted to wetland scavenging.',
    },
    {
      id: 'khaki', species: 'duck',
      name_bn: 'খাকি ক্যাম্পবেল', name_en: 'Khaki Campbell',
      districts: [], divisions: ['sylhet', 'mymensingh'], nationwide: true,
      type: 'layer', weight: 'পুং ~২.৩–২.৫; স্ত্রী ~২.০–২.৩ কেজি',
      yield: '~২৫০–৩০০ ডিম/বছর',
      traits_bn: 'সরকারি হাঁস খামারের প্রধান রিস্টক জাত; সব জলবায়ুতে সহনশীল।',
      traits_en: 'Most common restocking breed via govt duck farms.',
    },
    {
      id: 'duck_cross', species: 'duck',
      name_bn: 'দেশি × খাকি ক্যাম্পবেল ক্রস', name_en: 'Deshi × Khaki Campbell',
      districts: [], divisions: [], nationwide: true,
      type: 'rural_cross', weight: 'মাঝামাঝি',
      yield: 'পিতামাতার মাঝামাঝি ডিম',
      traits_bn: 'স্থানীয় সহনশীলতা ও উচ্চ ডিম উৎপাদন একসাথে।',
      traits_en: 'Combines local hardiness with Campbell egg yield.',
    },
  ];

  const feed = {
    cattle: {
      title_bn: 'গরু — সুষম খাদ্য', title_en: 'Cattle feed',
      roughage_bn: 'খড় (গবেষণায় খাদ্যের ~২৭–৪৯%), কাঁচা ঘাস/নেপিয়ার, সীমিত প্রাকৃতিক চারণ।',
      concentrate_bn: 'চালের কুঁড়া, গমের ভুসি, তেলবীজ খৈল, ভুট্টা, চিটাগুড়।',
      note_bn: 'পর্যাপ্ত নেপিয়ার ঘাস দিলে দুধ বাড়ে ও রোগ কমে।',
      mix_bn: 'গমের ভুসি, ভুট্টা ভাঙা, সরিষার খৈল, ডিসিপি, খনিজ ও লবণ মিশিয়ে দানাদার দিন।',
      kg: { grass: 25, straw: 5, grain: 3.2 },
    },
    buffalo: {
      title_bn: 'মহিষ — চারণ ও সম্পূরক', title_en: 'Buffalo feed',
      roughage_bn: 'নদী/হাওর তীরের ঘাস, খড়, কাঁচা ঘাস।',
      concentrate_bn: 'দুগ্ধবতী মহিষে অতিরিক্ত কনসেনট্রেট।',
      note_bn: 'চারণভূমি বেশি এমন চর ও হাওরে ফলন ভালো।',
      mix_bn: 'খড় + কাঁচা ঘাস মূল; দুধাল মহিষে খৈল ও কুঁড়া বাড়ান।',
      kg: { grass: 30, straw: 6, grain: 3.5 },
    },
    goat: {
      title_bn: 'ব্ল্যাক বেঙ্গল — ব্রাউজিং', title_en: 'Goat feed',
      roughage_bn: 'গাছের পাতা/ডালপালা browsing, scavenging, রান্নাঘরের বর্জ্য।',
      concentrate_bn: 'সয়াবিন মিল, গমের ভুসি, জোয়ার/ঘাস (সেমি-ইনটেনসিভ)।',
      note_bn: 'সেমি-ইনটেনসিভে জন্ম ওজন ও দুধ scavenging-এর চেয়ে বেশি।',
      mix_bn: 'পাতা-ডাল প্রধান; দিনে সামান্য ভুসি ও খৈল সম্পূরক দিন।',
      kg: { grass: 4, straw: 1, grain: 0.4 },
    },
    sheep: {
      title_bn: 'গরোল ভেড়া — চারণ', title_en: 'Sheep feed',
      roughage_bn: 'জলাবদ্ধ চারণভূমির ঘাস, উপকূলীয় প্রাকৃতিক গাছপালা।',
      concentrate_bn: 'ন্যূনতম বা কোনো কনসেনট্রেট নেই।',
      note_bn: 'সেমি-ইনটেনসিভ চারণ-নির্ভর; উপকূলে সবচেয়ে উপযোগী।',
      mix_bn: 'প্রধানত চারণ; বর্ষায় শুকনো খড় রাখুন।',
      kg: { grass: 3.5, straw: 0.8, grain: 0.2 },
    },
    chicken: {
      title_bn: 'মুরগি — scavenging / কনসেনট্রেট', title_en: 'Chicken feed',
      roughage_bn: 'দেশি: পোকামাকড়, শস্যদানা, রান্নাঘরের উচ্ছিষ্ট।',
      concentrate_bn: 'সোনালী/RIR/ফায়ুমি/BLRI জাতে বাণিজ্যিক প্রোটিন ফিড।',
      note_bn: 'দেশি মূলত ব্যাকইয়ার্ড; ক্রস জাতে কনফাইনমেন্ট ফিড দিন।',
      mix_bn: 'দেশিতে scavenging + সামান্য ভাঙা চাল; সোনালীতে স্তর অনুযায়ী লেয়ার/ব্রয়লার ফিড।',
      kg: { grass: 0, straw: 0, grain: 0.12 },
    },
    duck: {
      title_bn: 'হাঁস — জলাশয় scavenging', title_en: 'Duck feed',
      roughage_bn: 'শামুক, জলজ পোকা, জলাশয়ের খাদ্য।',
      concentrate_bn: 'চালের কুঁড়া / ভাঙা চাল সম্পূরক।',
      note_bn: 'হাওর/জলাভূমিতে scavenging সবচেয়ে উপযোগী।',
      mix_bn: 'সকাল-বিকাল কুঁড়া/ভাঙা চাল; দিনে জলাশয়ে ছেড়ে দিন।',
      kg: { grass: 0, straw: 0, grain: 0.15 },
    },
  };

  const vaccines = {
    cattle: [
      { name_bn: 'ক্ষুরারোগ (FMD)', name_en: 'FMD', when_bn: 'প্রাথমিক + ৪ সপ্তাহে বুস্টার, পরে প্রতি ৬ মাস' },
      { name_bn: 'গলাফুলা (HS)', name_en: 'HS', when_bn: 'বর্ষার আগে বছরে একবার' },
      { name_bn: 'তড়কা (Anthrax)', name_en: 'Anthrax', when_bn: 'বছরে একবার; এনডেমিক এলাকায় ৬ মাস অন্তর' },
      { name_bn: 'জলাতঙ্ক (কামড়ের পর)', name_en: 'Rabies (PEP)', when_bn: 'কামড়ের পরপরই' },
      { name_bn: 'ব্রুসেলোসিস সতর্কতা', name_en: 'Brucellosis', when_bn: 'সেরোপজিটিভ পশু আলাদা; নিয়মিত টেস্ট' },
    ],
    buffalo: [
      { name_bn: 'ক্ষুরারোগ (FMD)', name_en: 'FMD', when_bn: 'প্রাথমিক + বুস্টার, পরে প্রতি ৬ মাস' },
      { name_bn: 'গলাফুলা (HS)', name_en: 'HS', when_bn: 'বর্ষার আগে বছরে একবার' },
      { name_bn: 'তড়কা (Anthrax)', name_en: 'Anthrax', when_bn: 'বছরে একবার / এনডেমিক এলাকায় ৬ মাস' },
    ],
    goat: [
      { name_bn: 'PPR (প্লেগ)', name_en: 'PPR', when_bn: 'বছরে একবার' },
      { name_bn: 'তড়কা (Anthrax)', name_en: 'Anthrax', when_bn: 'ঝুঁকি অনুযায়ী বছরে ১ বার' },
      { name_bn: 'কৃমিনাশক', name_en: 'Deworming', when_bn: 'নিয়মিত deworming + পরিষ্কার আশ্রয়' },
    ],
    sheep: [
      { name_bn: 'PPR', name_en: 'PPR', when_bn: 'বছরে একবার' },
      { name_bn: 'তড়কা (Anthrax)', name_en: 'Anthrax', when_bn: 'এলাকাভিত্তিক ঝুঁকি অনুযায়ী' },
      { name_bn: 'কৃমিনাশক', name_en: 'Deworming', when_bn: 'নিয়মিত deworming' },
    ],
    chicken: [
      { name_bn: 'রানীক্ষেত (Newcastle / BCRDV)', name_en: 'Newcastle', when_bn: 'ব্রয়লার: ১ম ও ৩য় সপ্তাহ; লেয়ার: ১৪ ও ২৮ দিন, ১৬ সপ্তাহে বুস্টার' },
      { name_bn: 'গামবোরো (IBD)', name_en: 'Gumboro', when_bn: 'ব্রয়লার: ২য় ও ৪র্থ সপ্তাহ; লেয়ার: ৭–২৮ দিন' },
      { name_bn: 'ফাউল পক্স', name_en: 'Fowl pox', when_bn: '৬ সপ্তাহ, উইং-ওয়েব' },
      { name_bn: 'ফাউল কলেরা', name_en: 'Fowl cholera', when_bn: '৮ সপ্তাহ, চামড়ার নিচে' },
      { name_bn: 'মারেক', name_en: "Marek's", when_bn: 'হ্যাচারিতে দিন-১' },
      { name_bn: 'বার্ড ফ্লু (ঝুঁকি এলাকা)', name_en: 'Avian influenza', when_bn: 'উচ্চ-ঝুঁকি/মৌসুমে' },
    ],
    duck: [
      { name_bn: 'ডাক প্লেগ', name_en: 'Duck plague', when_bn: 'এনডেমিক এলাকায় বার্ষিক টিকা — কভারেজ খুব কম, অগ্রাধিকার দিন' },
      { name_bn: 'রানীক্ষেত (প্রয়োজনে)', name_en: 'Newcastle', when_bn: 'স্থানীয় প্রাণিসম্পদ অফিসের পরামর্শ অনুযায়ী' },
      { name_bn: 'কৃমি ও পরজীবী', name_en: 'Parasite control', when_bn: 'জলাশয় scavenging-এ নিয়মিত পর্যবেক্ষণ' },
    ],
  };

  const feedKgByType = {
    dairy_cow: { grass: 28, straw: 5, grain: 4.5 },
    fattening_bull: { grass: 20, straw: 4, grain: 4.5 },
    deshi_cattle: { grass: 18, straw: 5, grain: 2 },
    rcc: { grass: 22, straw: 4.5, grain: 2.8 },
    nbg: { grass: 22, straw: 4.5, grain: 3 },
    pmc: { grass: 26, straw: 5, grain: 3.8 },
    munshiganj: { grass: 20, straw: 5, grain: 2.5 },
    madaripur: { grass: 20, straw: 5, grain: 2.5 },
    local_buffalo: { grass: 30, straw: 6, grain: 3 },
    murrah: { grass: 32, straw: 6, grain: 5 },
    nili_ravi: { grass: 32, straw: 6, grain: 5.2 },
    black_bengal: { grass: 4, straw: 1, grain: 0.4 },
    garole: { grass: 3.5, straw: 0.8, grain: 0.2 },
    deshi_chicken: { grass: 0, straw: 0, grain: 0.08 },
    sonali: { grass: 0, straw: 0, grain: 0.12 },
    naked_neck: { grass: 0, straw: 0, grain: 0.1 },
    hilly_chicken: { grass: 0, straw: 0, grain: 0.1 },
    fayoumi: { grass: 0, straw: 0, grain: 0.11 },
    deshi_duck: { grass: 0, straw: 0, grain: 0.12 },
    khaki: { grass: 0, straw: 0, grain: 0.16 },
  };

  const careByType = {
    dairy_cow: {
      bn: 'শুকনো উঁচু শেড, নিয়মিত দোহন (সকাল-বিকাল), ওলান পরিষ্কার রাখুন। পর্যাপ্ত পানি ও নেপিয়ার ঘাস দিন। তাপস্ট্রেস এড়াতে ছায়া ও বাতাস রাখুন।',
      en: 'Dry raised shed, milk twice daily, keep udder clean. Give water and Napier grass. Shade and airflow against heat stress.',
    },
    fattening_bull: {
      bn: 'বাঁধা পশুকে দিনে ২–৩ ঘণ্টা হাঁটান। দানাদার ধীরে বাড়ান। কৃমি ও টিকা নিয়মিত। বিক্রির আগে ওজন ও স্বাস্থ্য পরীক্ষা করুন।',
      en: 'Walk tied animals 2–3 hours a day. Raise concentrate gradually. Regular deworming and vaccines. Check weight before sale.',
    },
    deshi_cattle: {
      bn: 'হালকা কাজ ও চারণ মিলিয়ে পালন করুন। খড়+ঘাস মূল খাদ্য। বর্ষার আগে HS/FMD টিকা দিন। বাছুরকে কোলস্ট্রাম নিশ্চিত করুন।',
      en: 'Combine light draught and grazing. Straw and grass as base feed. Vaccinate before monsoon. Ensure calf colostrum.',
    },
    rcc: {
      bn: 'গরম-আর্দ্র এলাকায় খোলা বাতাসযুক্ত শেড রাখুন। অতিরিক্ত কনসেনট্রেট চাপ দেবেন না। পরজীবী নিয়ন্ত্রণ ও লবণ চাটনি দিন।',
      en: 'Airy shed in hot-humid areas. Do not over-concentrate. Control parasites and provide salt lick.',
    },
    nbg: {
      bn: 'উত্তরাঞ্চলের compact জাত — অতিরিক্ত ঠান্ডা/স্যাঁতসেঁতে মেঝে এড়ান। বাথান/চারণ থাকলে কাজে লাগান। দুধাল গাভীতে অতিরিক্ত ভুসি দিন।',
      en: 'Keep floor dry. Use grazing if available. Extra bran for milking cows.',
    },
    pmc: {
      bn: 'নদীতীরবর্তী চারণ ও বাথান পদ্ধতি অনুসরণ করুন। বর্ষায় জলাবদ্ধতা থেকে রক্ষা। নিয়মিত দোহন ও বাছুর ব্যবস্থাপনা।',
      en: 'Follow riverside bathan grazing. Protect from monsoon flooding. Regular milking and calf care.',
    },
    munshiganj: {
      bn: 'উন্নত দেশি জাত হিসেবে পরিষ্কার শেড ও সুষম খাদ্য দিন। প্রজনন রেকর্ড রাখুন। স্থানীয় প্রাণিসম্পদ অফিসের পরামর্শ নিন।',
      en: 'Treat as improved native: clean shed, balanced feed, keep breeding records.',
    },
    madaripur: {
      bn: 'মধ্য অঞ্চলের জাত — খড় ও ঘাসের সাথে সামান্য খৈল দিন। নিয়মিত টিকা ও কৃমিনাশক। বাছুর আলাদা শুকনো জায়গায় রাখুন।',
      en: 'Straw and grass with a little oil cake. Regular vaccine and deworming. Keep calves on dry bedding.',
    },
    local_buffalo: {
      bn: 'দিনে জলাশয়/কাদায় গা-মাখা সুযোগ দিন। চারণভূমি কাছে রাখুন। দুধাল মহিষে অতিরিক্ত দানাদার। গরমে ছায়া ও পানি নিশ্চিত করুন।',
      en: 'Allow wallowing. Keep near pasture. Extra concentrate for milking buffalo. Shade and water in heat.',
    },
    murrah: {
      bn: 'ভালো ঘর, নিয়মিত দোহন ও উচ্চ মানের খাদ্য দরকার। তাপস্ট্রেস এড়ান। প্রজনন ও দুধ রেকর্ড রাখুন।',
      en: 'Good housing, regular milking and quality feed. Avoid heat stress. Keep milk and breeding records.',
    },
    nili_ravi: {
      bn: 'মুররাহের মতো নিবিড় যত্ন। পরিষ্কার পানি, খনিজ মিশ্রণ ও সময়মতো টিকা। অতিরিক্ত রোদ থেকে বাঁচান।',
      en: 'Intensive care like Murrah. Clean water, minerals, timely vaccines. Protect from harsh sun.',
    },
    black_bengal: {
      bn: 'উঁচু শুকনো মাচার ঘর। পাতা-ডাল browsing দিন। বাচ্চা ও মা আলাদা শুকনো রাখুন। নিয়মিত PPR টিকা ও কৃমিনাশক। ভিড় কম রাখুন।',
      en: 'Raised dry slatted house. Provide browse. Keep kids dry. PPR vaccine and deworming. Avoid overcrowding.',
    },
    garole: {
      bn: 'উপকূলীয় জলাভূমিতে চারণ দিন। রাতে শুকনো উঁচু আশ্রয়। পশম ভেজা থাকলে ছত্রাক দেখুন। অতিরিক্ত কনসেনট্রেট লাগে না।',
      en: 'Graze coastal wetlands. Dry raised night shelter. Watch wet fleece. Little concentrate needed.',
    },
    deshi_chicken: {
      bn: 'ব্যাকইয়ার্ড scavenging + রাতে নিরাপদ খোপ। রানীক্ষেত টিকা দিন। শিয়াল/বেজি থেকে রক্ষা। সামান্য ভাঙা চাল সম্পূরক।',
      en: 'Backyard scavenging plus a safe night coop. Newcastle vaccine. Protect from predators. A little broken rice.',
    },
    sonali: {
      bn: 'সেমি-কনফাইনমেন্ট: সুষম ফিড, পরিষ্কার পানি, নিয়মিত লিটার শুকনো রাখুন। হ্যাচারি টিকা শিডিউল মানুন। ভিড় ২–২.৫ বর্গফুট/পাখি।',
      en: 'Semi-confinement with balanced feed, clean water, dry litter. Follow hatchery vaccine schedule.',
    },
    naked_neck: {
      bn: 'তাপসহনশীল — খোলা বাতাসযুক্ত খোপ। BLRI পরামর্শ অনুযায়ী ফিড। নিয়মিত রানীক্ষেত ও গামবোরো টিকা।',
      en: 'Airy coop. Feed per BLRI guidance. Regular Newcastle and Gumboro vaccines.',
    },
    hilly_chicken: {
      bn: 'পাহাড়ি ঢালে শুকনো খোপ, বন্য প্রাণী থেকে রক্ষা। স্থানীয় শস্যদানা ও scavenging। টিকা ক্যাম্পেইন মিস করবেন না।',
      en: 'Dry hillside coop, predator-proof. Local grain plus scavenging. Do not miss vaccine campaigns.',
    },
    fayoumi: {
      bn: 'সহনশীল লেয়ার — পরিষ্কার নেস্ট বক্স, ক্যালসিয়াম সমৃদ্ধ ফিড, নিয়মিত ডিম সংগ্রহ। রোগ দেখা দিলে আলাদা করুন।',
      en: 'Hardy layer: clean nest boxes, calcium-rich feed, collect eggs daily. Isolate sick birds.',
    },
    deshi_duck: {
      bn: 'দিনে জলাশয়ে ছেড়ে দিন, রাতে নিরাপদ ঘর। ডাক প্লেগ টিকা দিন। শামুক/পোকা প্রাকৃতিক খাদ্য; সকালে কুঁড়া দিন।',
      en: 'Daytime pond access, safe night house. Duck plague vaccine. Snails/insects plus morning bran.',
    },
    khaki: {
      bn: 'ডিম উৎপাদনের জন্য নিয়মিত ফিড ও পরিষ্কার পানি। জলাশয় + শুকনো বিশ্রাম। বছরে ডাক প্লেগ টিকা। নেস্ট বক্স পরিষ্কার রাখুন।',
      en: 'Regular feed and water for egg yield. Pond plus dry rest. Annual duck plague vaccine. Clean nests.',
    },
  };

  const speciesMeta = {
    cattle: { bn: 'গরু', en: 'Cattle' },
    buffalo: { bn: 'মহিষ', en: 'Buffalo' },
    goat: { bn: 'ছাগল', en: 'Goat' },
    sheep: { bn: 'ভেড়া', en: 'Sheep' },
    chicken: { bn: 'মুরগি', en: 'Chicken' },
    duck: { bn: 'হাঁস', en: 'Duck' },
  };

  const animalTypes = [
    { id: 'dairy_cow', species: 'cattle', breedId: 'cross_dairy', bn: 'ডেইরি গাভী (দুধ উৎপাদন)', en: 'Dairy cow' },
    { id: 'fattening_bull', species: 'cattle', breedId: 'deshi_cattle', bn: 'ষাঁড় মোটাতাজাকরণ (মাংস)', en: 'Fattening bull' },
    { id: 'deshi_cattle', species: 'cattle', breedId: 'deshi_cattle', bn: 'দেশি গরু', en: 'Deshi cattle' },
    { id: 'rcc', species: 'cattle', breedId: 'rcc', bn: 'রেড চিটাগাং গরু', en: 'Red Chittagong cattle' },
    { id: 'nbg', species: 'cattle', breedId: 'nbg', bn: 'নর্থ বেঙ্গল গ্রে গরু', en: 'North Bengal Grey' },
    { id: 'pmc', species: 'cattle', breedId: 'pmc', bn: 'পাবনা দুধেল গাভী', en: 'Pabna milking cow' },
    { id: 'munshiganj', species: 'cattle', breedId: 'munshiganj', bn: 'মুন্সিগঞ্জ (মিরকাদিম) গরু', en: 'Munshiganj cattle' },
    { id: 'madaripur', species: 'cattle', breedId: 'madaripur', bn: 'মাদারীপুর গরু', en: 'Madaripur cattle' },
    { id: 'local_buffalo', species: 'buffalo', breedId: 'local_buffalo', bn: 'দেশি মহিষ', en: 'Indigenous buffalo' },
    { id: 'murrah', species: 'buffalo', breedId: 'murrah', bn: 'মুররাহ মহিষ', en: 'Murrah buffalo' },
    { id: 'nili_ravi', species: 'buffalo', breedId: 'nili_ravi', bn: 'নিলি-রবি মহিষ', en: 'Nili-Ravi buffalo' },
    { id: 'black_bengal', species: 'goat', breedId: 'black_bengal', bn: 'ব্ল্যাক বেঙ্গল ছাগল', en: 'Black Bengal goat' },
    { id: 'garole', species: 'sheep', breedId: 'garole', bn: 'গরোল ভেড়া', en: 'Garole sheep' },
    { id: 'deshi_chicken', species: 'chicken', breedId: 'deshi_chicken', bn: 'দেশি মুরগি', en: 'Deshi chicken' },
    { id: 'sonali', species: 'chicken', breedId: 'sonali', bn: 'সোনালী মুরগি', en: 'Sonali chicken' },
    { id: 'naked_neck', species: 'chicken', breedId: 'naked_neck', bn: 'নেকড নেক মুরগি (BLRI)', en: 'Naked Neck chicken' },
    { id: 'hilly_chicken', species: 'chicken', breedId: 'hilly_chicken', bn: 'হিলি মুরগি (BLRI)', en: 'Hilly chicken' },
    { id: 'fayoumi', species: 'chicken', breedId: 'fayoumi', bn: 'ফায়ুমি মুরগি', en: 'Fayoumi chicken' },
    { id: 'deshi_duck', species: 'duck', breedId: 'deshi_duck', bn: 'দেশি হাঁস', en: 'Deshi duck' },
    { id: 'khaki', species: 'duck', breedId: 'khaki', bn: 'খাকি ক্যাম্পবেল হাঁস', en: 'Khaki Campbell duck' },
  ];

    function distKey(loc) {
      return fold((loc && (loc.districtNameEn || loc.districtNameBn)) || '');
    }
    function divKey(loc) {
      return fold((loc && (loc.divisionNameEn || loc.divisionNameBn)) || '');
    }

  function inList(key, arr) {
    return arr.some((x) => key.includes(x) || x.includes(key));
  }

  function agroTags(loc) {
    const d = distKey(loc);
    const tags = [];
    if (inList(d, HAOR)) tags.push('haor');
    if (inList(d, COASTAL)) tags.push('coastal');
    if (inList(d, CHAR)) tags.push('char');
    if (inList(d, HILL)) tags.push('hill');
    return tags;
  }

  function scoreBreed(b, loc) {
    const d = distKey(loc);
    const v = divKey(loc);
    let s = b.nationwide ? 2 : 0;
    if (d && (b.districts || []).some((x) => d.includes(x) || x.includes(d))) s += 50;
    if (v && (b.divisions || []).some((x) => v.includes(x) || x.includes(v))) s += 8;
    const tags = agroTags(loc);
    if (b.id === 'local_buffalo' && (tags.includes('haor') || tags.includes('char') || tags.includes('coastal'))) s += 20;
    if (b.id === 'khaki' && tags.includes('haor')) s += 18;
    if (b.id === 'deshi_duck' && tags.includes('haor')) s += 16;
    if (b.id === 'garole' && tags.includes('coastal')) s += 25;
    if (b.id === 'hilly_chicken' && tags.includes('hill')) s += 30;
    if (b.id === 'sonali' && (v.includes('mymensingh') || v.includes('ময়মনসিংহ'))) s += 6;
    return s;
  }

  const Engine = {
    speciesList: () => Object.keys(speciesMeta),
    animalTypes: () => animalTypes.slice(),
    findAnimalType(id) {
      return animalTypes.find((t) => t.id === id) || null;
    },
    typeForPlan(plan) {
      if (plan && plan.animalType) {
        const t = this.findAnimalType(plan.animalType);
        if (t) return t;
      }
      if (plan && plan.breedId) {
        const byBreed = animalTypes.find((t) => t.breedId === plan.breedId || t.id === plan.breedId);
        if (byBreed) return byBreed;
      }
      return animalTypes.find((t) => t.species === (plan && plan.species)) || animalTypes[0];
    },
    speciesLabel(id, en) {
      const m = speciesMeta[id];
      return m ? (en ? m.en : m.bn) : id;
    },
    breedsFor(species) {
      return breeds.filter((b) => b.species === species);
    },
    findBreed(id) {
      return breeds.find((b) => b.id === id) || null;
    },
    recommend(species, loc) {
      const list = this.breedsFor(species).slice().sort((a, b) => scoreBreed(b, loc) - scoreBreed(a, loc));
      return { ordered: list, best: list[0] || null, tags: agroTags(loc) };
    },
    recommendForLocation(loc) {
      const ordered = breeds.slice().sort((a, b) => scoreBreed(b, loc) - scoreBreed(a, loc));
      return { ordered, best: ordered[0] || null, tags: agroTags(loc) };
    },
    typesForLocation(loc) {
      return animalTypes.slice().sort((a, b) => {
        const ba = this.findBreed(a.breedId);
        const bb = this.findBreed(b.breedId);
        return scoreBreed(bb || { nationwide: true }, loc) - scoreBreed(ba || { nationwide: true }, loc);
      });
    },
    feedFor(species, breedId, animalTypeId) {
      const base = Object.assign({}, feed[species] || feed.cattle);
      const kg = feedKgByType[animalTypeId] || feedKgByType[breedId] || (feed[species] && feed[species].kg) || base.kg;
      base.kg = { grass: kg.grass, straw: kg.straw, grain: kg.grain };
      return base;
    },
    careText(animalTypeId, breedId, langEn) {
      const c = careByType[animalTypeId] || careByType[breedId];
      if (c) return langEn ? c.en : c.bn;
      return langEn
        ? 'Clean dry housing, fresh water, timely vaccine and deworming. Ask the Upazila Livestock Office for local advice.'
        : 'পরিষ্কার শুকনো ঘর, তাজা পানি, সময়মতো টিকা ও কৃমিনাশক দিন। স্থানীয় উপজেলা প্রাণিসম্পদ অফিসের পরামর্শ নিন।';
    },
    bestOverall(loc) {
      const ranked = breeds.slice().sort((a, b) => scoreBreed(b, loc) - scoreBreed(a, loc));
      return ranked[0] || breeds[0];
    },
    vaccinesFor(species) {
      return vaccines[species] || vaccines.cattle;
    },
    vaccinesForBreed(species, breedId) {
      const rows = (vaccines[species] || vaccines.cattle).slice();
      const extra = {
        cross_dairy: [
          { name_bn: 'মাস্টাইটিস পরীক্ষা', name_en: 'Mastitis check', when_bn: 'প্রতি দোহনের আগে ওলান পরখ; সন্দেহ হলে দুধ আলাদা' },
          { name_bn: 'ক্যালসিয়াম / দুধজ্বর সতর্কতা', name_en: 'Milk fever watch', when_bn: 'প্রসবের আগে-পরে খনিজ ও ক্যালসিয়াম' },
        ],
        pmc: [
          { name_bn: 'বাথান পরজীবী নিয়ন্ত্রণ', name_en: 'Pasture parasites', when_bn: 'চারণ মৌসুমে কৃমিনাশক বাড়ান' },
        ],
        rcc: [
          { name_bn: 'পরজীবী / উকুন', name_en: 'External parasites', when_bn: 'গরম-আর্দ্র মৌসুমে চামড়া পরীক্ষা' },
        ],
        black_bengal: [
          { name_bn: 'বাচ্চা মৃত্যুহার কমানো', name_en: 'Kid survival', when_bn: 'শুকনো মাচা, কোলস্ট্রাম, ভিড় কমানো' },
        ],
        deshi_chicken: [
          { name_bn: 'ব্যাকইয়ার্ড রানীক্ষেত', name_en: 'Backyard ND', when_bn: 'ছোট ফ্লকেও BCRDV/Lasota নিয়মিত' },
        ],
        sonali: [
          { name_bn: 'ডিম ছাড়ার সিন্ড্রোম (EDS)', name_en: 'Egg drop syndrome', when_bn: 'লেয়ার হলে ~১৮ সপ্তাহে EDS টিকা' },
        ],
        khaki: [
          { name_bn: 'ডাক প্লেগ (অগ্রাধিকার)', name_en: 'Duck plague priority', when_bn: 'এনডেমিক এলাকায় বার্ষিক টিকা অবশ্যই দিন' },
        ],
        deshi_duck: [
          { name_bn: 'জলাশয় পরজীবী', name_en: 'Pond parasites', when_bn: 'scavenging হাঁসে কৃমি ও জুক নিয়ন্ত্রণ' },
        ],
        hilly_chicken: [
          { name_bn: 'বন্য পাখি থেকে রোগ', name_en: 'Wild-bird contact', when_bn: 'পাহাড়ি এলাকায় AI সতর্কতা ও খোপ আলাদা' },
        ],
      };
      return rows.concat(extra[breedId] || []);
    },
    shedFor(species, count) {
      const n = Math.max(1, parseInt(count, 10) || 1);
      const area = SPACE_SQFT[species] * n;
      const width = Math.max(8, Math.round(Math.sqrt(area / 1.5) * 10) / 10);
      const length = Math.max(10, Math.round((area / width) * 10) / 10);
      const height = HEIGHT_FT[species];
      return {
        length, width, height, area: Math.round(area * 10) / 10,
        sqftEach: SPACE_SQFT[species],
      };
    },
    reasonText(breed, loc, en) {
      if (!breed) return '';
      const place = (loc && (loc.label || loc.districtNameBn || loc.districtNameEn)) || (en ? 'your area' : 'আপনার এলাকা');
      if (en) {
        return `For ${place}, ${breed.name_en} is among the best-fit types (${breed.type}). ${breed.traits_en}`;
      }
      return `${place}-এ ${breed.name_bn} সবচেয়ে উপযোগী জাতগুলোর মধ্যে (${breed.type})। ${breed.traits_bn}`;
    },
  };

  global.FolikaLivestockData = Engine;
})(window);
