/**
 * FOLIKA — Bangladesh fish culture dataset (DoF / BFRI-aligned ranges)
 * Layer decision: depth in feet from the pond form.
 */
(function (global) {
  'use strict';

  const species = [
    {
      id: 'rui', layer: 'middle', min_ft: 4,
      name_bn: 'রুই', name_en: 'Rohu', sci: 'Labeo rohita',
      feed: [
        'ভাসমান বা ডুবন্ত পিলেট + প্রাকৃতিক প্ল্যাংকটন',
        'পোনায় প্রোটিন ৩০–৩৫%; grow-out এ ২৪–২৮%',
        'দেহভরের ৩–৫% খাদ্য; পোনায় ৫–৮%, বড় মাছে ২–৩%',
        'দিনে ২ বার — সকাল ও বিকাল',
        'ডিসেম্বর–ফেব্রুয়ারিতে খাদ্য প্রায় অর্ধেক কমান (বিপাক ধীর)',
        'মার্চ–অক্টোবর পূর্ণ মাত্রায় খাওয়ান — এ সময় বৃদ্ধি সবচেয়ে ভালো',
      ],
    },
    {
      id: 'katla', layer: 'surface', min_ft: 4,
      name_bn: 'কাতলা', name_en: 'Catla', sci: 'Catla catla / Gibelion catla',
      feed: [
        'প্রধান খাদ্য zooplankton / প্ল্যাংকটন — সার দিয়ে প্রাকৃতিক খাদ্য বাড়ান',
        'সম্পূরক পিলেট: পোনায় ৩০–৩৫% প্রোটিন, পরে ২৪–২৮%',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'উপরিস্তরের মাছ — ভোরে অক্সিজেন সংকটে আগে ক্ষতিগ্রস্ত হয়, তখন খাদ্য কমান',
        'শীতকালে খাদ্য উল্লেখযোগ্যভাবে কমান',
      ],
    },
    {
      id: 'mrigel', layer: 'bottom', min_ft: 4,
      name_bn: 'মৃগেল', name_en: 'Mrigal', sci: 'Cirrhinus cirrhosus',
      feed: [
        'তলদেশের detritus ও বেন্থিক জীব প্রধান খাদ্য',
        'ডুবন্ত সম্পূরক পিলেট দিন (ভাসমান খাবার অপচয় হয়)',
        'পোনায় ৩০–৩৫% প্রোটিন, পরে ২৪–২৮%',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'অতিরিক্ত উপরিস্তরের খাবার দেবেন না — তলদেশ নোংরা ও রোগ বাড়ে',
        'তলদেশের জৈব বর্জ্য নিয়ন্ত্রণে খাদ্যের অবশিষ্টাংশ কমান',
      ],
    },
    {
      id: 'tilapia', layer: 'shallow', min_ft: 3,
      name_bn: 'তেলাপিয়া', name_en: 'Tilapia', sci: 'Oreochromis niloticus',
      feed: [
        'সর্বভুক — প্ল্যাংকটন, শৈবাল ও পিলেট সব খায়',
        'পোনায় ৩০–৩৫% প্রোটিন, grow-out এ ২৫–৩০%',
        'দেহভরের ৩–৫%; দিনে ২–৩ বার',
        'পোনায় ৫–১০%, বড় মাছে ২–৩%',
        'নভেম্বর–ফেব্রুয়ারিতে খাদ্য কমান বা বন্ধ — ১৮°C-এর নিচে খাদ্যগ্রহণ কমে',
        'monosex পোনা ব্যবহার করলে অনিয়ন্ত্রিত প্রজনন কম হয়',
      ],
    },
    {
      id: 'pangas', layer: 'middle', min_ft: 6,
      name_bn: 'পাঙ্গাস', name_en: 'Pangas', sci: 'Pangasianodon hypophthalmus',
      feed: [
        'নিবিড় চাষে সম্পূর্ণ পিলেট-নির্ভর (ভাসমান পিলেট)',
        'পোনায় ৩০–৩৫% প্রোটিন, পরে ২৫–৩০%',
        'দেহভরের ৩–৬%; দিনে ২–৩ বার ভাগ করে দিন',
        'পোনায় ৬–১০%, মাঝারিতে ৪–৬%, বড় মাছে ২–৩%',
        'জুলাইয়ে পূর্ণ মাত্রায় (৪–৬%) — দ্রুত বৃদ্ধির মাস',
        'অতিরিক্ত খাদ্য পানি নষ্ট করে; অবশিষ্টাংশ তুলে ফেলুন',
        'শীতকালে খাদ্য উল্লেখযোগ্যভাবে কমান',
      ],
    },
    {
      id: 'koi', layer: 'shallow', min_ft: 2.5,
      name_bn: 'কৈ', name_en: 'Climbing perch', sci: 'Anabas testudineus',
      feed: [
        'প্রাণিজ ও উদ্ভিজ্জ মিশ্র পিলেট',
        'পোনায় ৩৫–৪০% প্রোটিন, পরে ৩০–৩৫% (কার্পের চেয়ে বেশি)',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'পোনায় ৫–৮%, বড় মাছে ২–৩%',
        'কম প্রোটিনের খাবার দিলে বৃদ্ধি কমে',
        'বর্ষায় পালানো রোধে বেড়া রাখুন — খাদ্য ব্যবস্থাপনার পাশাপাশি নিরাপত্তা জরুরি',
      ],
    },
    {
      id: 'magur', layer: 'shallow', min_ft: 2.5,
      name_bn: 'মাগুর', name_en: 'Walking catfish', sci: 'Clarias batrachus',
      feed: [
        'উচ্চ প্রাণিজ প্রোটিন পিলেট আবশ্যক',
        'পোনায় ৪০–৪৫% প্রোটিন, grow-out এ ৩৫–৪০%',
        'দেহভরের ৪–৬%; দিনে ২ বার',
        'পোনায় ৬–১০%, বড় মাছে ৩–৪%',
        'কম প্রোটিনে নরখাদক (cannibalism) বাড়ে',
        'দেশীয় মাগুর সংরক্ষণ করুন; খোলা জলাশয়ে আফ্রিকান মাগুর ছাড়বেন না',
      ],
    },
    {
      id: 'shing', layer: 'shallow', min_ft: 2.5,
      name_bn: 'শিং', name_en: 'Stinging catfish', sci: 'Heteropneustes fossilis',
      feed: [
        'মাংসাশী প্রবণতা — উচ্চ প্রাণিজ প্রোটিন',
        'পোনায় ৪০–৪৫%, পরে ৩৫–৪০% প্রোটিন',
        'দেহভরের ৪–৬%; দিনে ২ বার',
        'পোনায় ৬–১০%, বড় মাছে ৩–৪%',
        'ধীর বৃদ্ধি (৬–৮ মাসে ৫০–১০০ গ্রাম) — ধৈর্য রাখুন',
        'হ্যান্ডলিং-এ বিষাক্ত কাঁটা থেকে সাবধান',
      ],
    },
    {
      id: 'pabda', layer: 'middle', min_ft: 4,
      name_bn: 'পাবদা', name_en: 'Pabda', sci: 'Ompok pabda',
      feed: [
        'প্রাণিজ প্রোটিনযুক্ত পিলেট',
        'পোনায় ৩৫–৪০%, পরে ৩০–৩৫% প্রোটিন',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'ঘোলা পানি পছন্দ করে না — পরিষ্কার পুকুরে খাওয়ান',
        'শিং/মাগুরের মতো কম অক্সিজেন সহনশীল নয়; DO কমলে খাদ্য কমান',
        'শীতকালে খাদ্য উল্লেখযোগ্যভাবে কমান',
      ],
    },
    {
      id: 'gulsha', layer: 'bottom', min_ft: 4,
      name_bn: 'গুলশা', name_en: 'Gulsha', sci: 'Mystus cavasius',
      feed: [
        'তলদেশ ও কলামের ছোট মাংসাশী খাদ্য / উচ্চ প্রোটিন পিলেট',
        'পোনায় প্রায় ৩৫–৪০% প্রোটিন',
        'দেহভরের ৩–৫%; দিনে ২ বার ছোট দানা',
        'অতিরিক্ত খাদ্য তলদেশ নষ্ট করে — অল্প করে বারবার দিন',
        'পাবদার সাথে মিশ্র চাষে অনুপাত কম রাখুন',
      ],
    },
    {
      id: 'tengra', layer: 'bottom', min_ft: 4,
      name_bn: 'টেংরা', name_en: 'Tengra', sci: 'Mystus tengara',
      feed: [
        'ছোট কণা / উচ্চ প্রোটিন ডুবন্ত ফিড',
        'পোনায় ৩৫%+ প্রোটিন',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'বড় কার্পের অবশিষ্ট খাবারের ওপর নির্ভর করবেন না — আলাদা ছোট দানা দিন',
      ],
    },
    {
      id: 'silver', layer: 'surface', min_ft: 4,
      name_bn: 'সিলভার কার্প', name_en: 'Silver carp', sci: 'Hypophthalmichthys molitrix',
      feed: [
        'ফাইটোপ্লাঙ্কটন প্রধান খাদ্য — সার দিয়ে সবুজ পানি তৈরি করুন',
        'সম্পূরক ভাসমান ফিড কম লাগে যদি প্ল্যাংকটন ভালো থাকে',
        'প্রোটিন grow-out এ প্রায় ২৪–২৮%',
        'দিনে ২ বার; প্ল্যাংকটন কম থাকলে পিলেট বাড়ান',
        'কাতলার সাথে মিশ্র চাষে অনুপাত ঠিক রাখুন (প্রতিযোগিতা কমাতে)',
      ],
    },
    {
      id: 'grass', layer: 'middle', min_ft: 4,
      name_bn: 'গ্রাস কার্প', name_en: 'Grass carp', sci: 'Ctenopharyngodon idella',
      feed: [
        'জলজ ঘাস, কলাপাতা, কচি ঘাস — প্রধান খাদ্য',
        'সম্পূরক ডুবন্ত/দানাদার ফিড (২৪–২৮% প্রোটিন)',
        'দেহভরের ৩–৫% সম্পূরক + তাজা ঘাস দিনে ১–২ বার',
        'অতিরিক্ত ঘাস পচে পানি নষ্ট করে — যতটা খায় ততটা দিন',
        'শীতকালে ঘাস ও ফিড দুটোই কমান',
      ],
    },
    {
      id: 'carpio', layer: 'bottom', min_ft: 4,
      name_bn: 'কমন কার্প / কার্পিও', name_en: 'Common carp', sci: 'Cyprinus carpio',
      feed: [
        'তলদেশ খুঁড়ে খায় — ডুবন্ত পিলেট ও দানাদার খাদ্য',
        'প্রোটিন ২৪–২৮% grow-out এ',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'অতিরিক্ত ঘনত্বে তলদেশ ঘোলা হয় — খাদ্য কমিয়ে পানি রক্ষা করুন',
      ],
    },
    {
      id: 'bighead', layer: 'surface', min_ft: 4,
      name_bn: 'বিগহেড কার্প', name_en: 'Bighead carp', sci: 'Hypophthalmichthys nobilis',
      feed: [
        'জুপ্লাংকটন প্রধান — কাতলার মতো উপরিস্তর',
        'সম্পূরক পিলেট ২৪–২৮% প্রোটিন',
        'দেহভরের ৩–৫%; দিনে ২ বার',
        'সার প্রয়োগে প্রাকৃতিক খাদ্য বাড়ান',
      ],
    },
    {
      id: 'golda', layer: 'bottom', min_ft: 4,
      name_bn: 'গলদা চিংড়ি', name_en: 'Giant freshwater prawn', sci: 'Macrobrachium rosenbergii',
      feed: [
        'তলদেশে ছোট পিলেট / চিংড়ি ফিড (৩০%+ প্রোটিন)',
        'দিনে ২ বার সন্ধ্যায় বেশি খায়',
        'কার্পের সাথে মিশ্র চাষে ঘনত্ব কম রাখুন',
        'অতিরিক্ত খাদ্য অ্যামোনিয়া বাড়ায়',
      ],
    },
    {
      id: 'bagda', layer: 'bottom', min_ft: 3,
      name_bn: 'বাগদা চিংড়ি', name_en: 'Black tiger shrimp', sci: 'Penaeus monodon',
      feed: [
        'শুধু উপকূলীয় লোনা/ঘের — মিঠাপুকুরে সাধারণত উপযোগী নয়',
        'বাণিজ্যিক চিংড়ি ফিড, প্রোটিন উচ্চ',
        'দিনে কয়েকবার অল্প করে',
        'মিঠাপানির কার্প পুকুরে বাগদা মজুদ করবেন না',
      ],
    },
  ];

  const GEO = {
    rui: { nationwide: true, divisions: ['mymensingh', 'dhaka', 'rajshahi', 'khulna', 'barishal', 'rangpur', 'sylhet', 'chattogram'], districts: ['mymensingh', 'cumilla', 'bogura', 'jashore', 'barishal'], upazilas: ['muktagacha', 'trishal'] },
    katla: { nationwide: true, divisions: ['mymensingh', 'dhaka', 'rajshahi', 'khulna', 'barishal', 'rangpur'], districts: ['mymensingh', 'cumilla', 'bogura', 'naogaon', 'jashore'], upazilas: [] },
    mrigel: { nationwide: true, divisions: ['mymensingh', 'rajshahi', 'khulna', 'barishal'], districts: ['mymensingh', 'cumilla', 'bogura', 'jashore'], upazilas: [] },
    tilapia: { nationwide: true, divisions: ['dhaka', 'mymensingh', 'khulna', 'barishal', 'rajshahi', 'rangpur', 'chattogram'], districts: ['mymensingh', 'cumilla', 'khulna', 'bagerhat', 'satkhira'], upazilas: [], coastal: true },
    pangas: { nationwide: false, divisions: ['mymensingh', 'dhaka', 'khulna'], districts: ['mymensingh', 'cumilla', 'bogura', 'gazipur'], upazilas: ['muktagacha', 'trishal', 'bhaluka'] },
    koi: { nationwide: true, divisions: ['mymensingh', 'khulna', 'rajshahi'], districts: ['mymensingh', 'jashore', 'kushtia', 'bogura'], upazilas: [] },
    magur: { nationwide: true, divisions: ['dhaka', 'mymensingh', 'khulna'], districts: ['mymensingh', 'gazipur', 'jashore'], upazilas: [] },
    shing: { nationwide: true, divisions: ['mymensingh', 'rajshahi', 'khulna'], districts: ['mymensingh', 'jashore', 'bogura'], upazilas: [] },
    pabda: { nationwide: false, divisions: ['mymensingh', 'rajshahi', 'khulna', 'dhaka'], districts: ['mymensingh', 'jashore', 'naogaon'], upazilas: [] },
    gulsha: { nationwide: true, divisions: ['mymensingh', 'sylhet', 'barishal', 'dhaka'], districts: ['netrokona', 'kishoreganj', 'sunamganj', 'mymensingh'], upazilas: [] },
    tengra: { nationwide: true, divisions: ['mymensingh', 'sylhet', 'barishal'], districts: ['netrokona', 'sunamganj', 'kishoreganj'], upazilas: [] },
    silver: { nationwide: true, divisions: ['mymensingh', 'dhaka', 'rajshahi', 'khulna'], districts: ['mymensingh', 'cumilla', 'bogura'], upazilas: [] },
    grass: { nationwide: true, divisions: ['mymensingh', 'dhaka', 'rajshahi'], districts: ['mymensingh', 'tangail', 'jamalpur'], upazilas: [] },
    carpio: { nationwide: true, divisions: ['mymensingh', 'rajshahi', 'khulna'], districts: ['mymensingh', 'bogura', 'jashore'], upazilas: [] },
    bighead: { nationwide: true, divisions: ['mymensingh', 'dhaka', 'rajshahi'], districts: ['mymensingh', 'cumilla'], upazilas: [] },
    golda: { nationwide: false, divisions: ['khulna', 'barishal', 'dhaka'], districts: ['bagerhat', 'khulna', 'gopalganj', 'satkhira', 'barishal'], upazilas: [] },
    bagda: { nationwide: false, coastal: true, divisions: ['khulna', 'barishal', 'chattogram'], districts: ['satkhira', 'bagerhat', 'khulna', 'coxsbazar', 'barguna', 'patuakhali', 'bhola'], upazilas: [] },
  };

  const COASTAL = ['satkhira', 'bagerhat', 'khulna', 'barguna', 'patuakhali', 'bhola', 'pirojpur', 'jhalokati', 'coxsbazar', 'chattogram'];
  const HAOR = ['sunamganj', 'habiganj', 'netrokona', 'kishoreganj'];

  function fold(s) {
    return String(s || '')
      .toLowerCase()
      .replace(/chittagong/g, 'chattogram')
      .replace(/comilla/g, 'cumilla')
      .replace(/jessore/g, 'jashore')
      .replace(/bogra/g, 'bogura')
      .replace(/barisal/g, 'barishal')
      .replace(/cox'?s?\s*bazar/g, 'coxsbazar')
      .replace(/[\s\-_.']/g, '');
  }

  function locKeys(loc) {
    if (!loc) return { d: '', v: '', u: '' };
    return {
      d: fold(loc.districtNameEn || loc.districtNameBn || ''),
      v: fold(loc.divisionNameEn || loc.divisionNameBn || ''),
      u: fold(loc.upazilaNameEn || loc.upazilaNameBn || ''),
    };
  }

  function inList(key, arr) {
    if (!key) return false;
    return (arr || []).some((x) => key.includes(x) || x.includes(key));
  }

  function scoreFish(s, loc) {
    const g = GEO[s.id] || { nationwide: true, divisions: [], districts: [], upazilas: [] };
    const { d, v, u } = locKeys(loc);
    let n = g.nationwide ? 4 : 0;
    if (d && inList(d, g.districts)) n += 50;
    if (v && inList(v, g.divisions)) n += 12;
    if (u && inList(u, g.upazilas)) n += 70;
    if (g.coastal && inList(d, COASTAL)) n += 40;
    if (s.id === 'bagda' && !inList(d, COASTAL)) n -= 80;
    if (s.id === 'golda' && inList(d, COASTAL) && d !== 'coxsbazar') n += 10;
    if ((s.id === 'gulsha' || s.id === 'tengra') && inList(d, HAOR)) n += 25;
    if (s.id === 'pangas' && inList(d, ['mymensingh', 'gazipur'])) n += 15;
    if (s.id === 'tilapia' && inList(d, COASTAL)) n += 8;
    return n;
  }

  function rankForLayer(key, depthFt, loc) {
    return speciesForLayer(key, depthFt).slice().sort((a, b) => {
      const ds = scoreFish(b, loc) - scoreFish(a, loc);
      return ds !== 0 ? ds : a.name_bn.localeCompare(b.name_bn, 'bn');
    });
  }

  function layersForDepthFt(depthFt) {
    const d = parseFloat(depthFt) || 0;
    if (d < 4) {
      return {
        count: 1,
        keys: ['shallow'],
        reason_bn: 'গভীরতা ৪ ফুটের কম — বায়ু-শ্বাসী/সহনশীল মাছের এক স্তর চাষই নিরাপদ (কৈ, মাগুর, শিং, তেলাপিয়া)। কার্প মিশ্র চাষের জন্য পানি বাড়ান।',
        reason_en: 'Under 4 ft: one layer of air-breathing / hardy fish only.',
      };
    }
    if (d < 6) {
      return {
        count: 2,
        keys: ['surface', 'middle'],
        reason_bn: '৪–৬ ফুট — দুই স্তর সবচেয়ে ভালো: উপরিভাগ (কাতলা/সিলভার) ও মধ্যস্তর (রুই/গ্রাস)। তলদেশের জন্য আরও গভীরতা দরকার।',
        reason_en: '4–6 ft: two layers (surface + mid) is best.',
      };
    }
    return {
      count: 3,
      keys: ['surface', 'middle', 'bottom'],
      reason_bn: '৬ ফুট বা বেশি — তিন স্তর মিশ্র চাষ আদর্শ (উপরিভাগ, মধ্যস্তর, তলদেশ)। পাঙ্গাসের জন্য ৬–৮ ফুট উপযোগী।',
      reason_en: '6 ft or more: three-layer polyculture is best.',
    };
  }

  const layerMeta = {
    surface: { bn: 'উপরিভাগ', en: 'Upper layer', badge: 'পানির উপরিভাগ' },
    middle: { bn: 'মধ্যস্তর', en: 'Mid layer', badge: 'কলাম / মধ্যভাগ' },
    bottom: { bn: 'তলদেশ', en: 'Bottom layer', badge: 'পুকুরের তলদেশ' },
    shallow: { bn: 'এক স্তর (অগভীর)', en: 'Single layer (shallow)', badge: 'কম গভীর পুকুর' },
  };

  function speciesForLayer(key, depthFt) {
    const d = parseFloat(depthFt) || 0;
    return species.filter((s) => {
      if (s.min_ft > d + 0.2) return false;
      if (s.id === 'bagda') return key === 'shallow' || key === 'middle' || key === 'bottom';
      if (key === 'shallow') return s.layer === 'shallow' || s.id === 'tilapia';
      return s.layer === key;
    });
  }

  function find(id) {
    return species.find((s) => s.id === id) || null;
  }

  global.FolikaFishData = {
    all: () => species.slice(),
    find,
    layersForDepthFt,
    layerMeta,
    speciesForLayer,
    rankForLayer,
    scoreFish,
    locKeys,
  };
})(window);
