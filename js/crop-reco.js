/**
 * FOLIKA — Location/weather-aware crop recommendation engine
 */
(function (global) {
  'use strict';

  const NEXT_SEASON = { rabi: 'kharif_1', kharif_1: 'kharif_2', kharif_2: 'rabi' };

  const SITUATION_FOR_ZONE = {
    fertile: ['অনুকূল', 'উফশী', 'হাইব্রিড'],
    barind: ['খরা'],
    coastal: ['লবণ'],
    haor: ['জলাবদ্ধ', 'হাওর', 'হাওড়'],
    hill: ['পাহাড়', 'পাহাড়', 'খরা', 'অনুকূল'],
    char: ['বন্যা', 'জলাবদ্ধ', 'খরা', 'অনুকূল'],
  };

  const PLANTING = {
    'বোরো ধান': {
      method_bn: 'বোরোতে ৩০-৪০ দিনের সুস্থ চারা ২০×১৫ সেমি দূরত্বে রোপণ করুন। জমিতে ২-৩ সেমি পানি রাখুন।',
      method_en: 'Transplant 30-40 day Boro seedlings at 20×15 cm. Keep 2-3 cm standing water.',
      soil_bn: '৪-৫ বার চাষ ও মই দিয়ে কাদা করুন। শতাংশে গোবর ৪০ কেজি, ইউরিয়া-টিএসপি-এমওপি-জিপসাম মাটির পরীক্ষা অনুযায়ী মেশান।',
      soil_en: 'Puddle with 4-5 ploughings. Mix cow dung and NPK-gypsum based on soil test.',
    },
    'আমন ধান (রোপা)': {
      method_bn: 'বর্ষার শুরুতে ২৫-৩০ দিনের চারা রোপণ করুন। সারি ২০ সেমি, চারা ১৫ সেমি।',
      method_en: 'Transplant 25-30 day Aman seedlings at 20×15 cm at monsoon onset.',
      soil_bn: '৩-৪ বার চাষ, জৈব সার ও ফসফেট সার শেষ চাষে মেশান। নিচু জমিতে নালা কেটে নিষ্কাশন রাখুন।',
      soil_en: '3-4 ploughings; mix organic and phosphate fertilizer at last ploughing. Drain low pockets.',
    },
    'আউশ ধান (উফশী)': {
      method_bn: 'চৈত্র-বৈশাখে ভিজানো বীজ বপন বা অল্প বয়সী চারা রোপণ করুন। স্বল্পমেয়াদী জাত খরায় ভালো।',
      method_en: 'Sow pre-soaked seed or transplant young seedlings in Chaitra-Baishakh.',
      soil_bn: '২-৩ চাষে ঝুরঝুরে মাটি। জৈব সার দিন, পানি ধরে রাখার জন্য আইল মজবুত করুন।',
      soil_en: '2-3 ploughings to a fine tilth. Strengthen bunds to hold rainwater.',
    },
    'আউশ ধান (বোনা)': {
      method_bn: 'ঢালু পাহাড়ি জমিতে সমোন্নতি রেখায় বোনা আউশ বপন করুন। আগাছা নিয়ন্ত্রণ জরুরি।',
      method_en: 'Broadcast Aus along contour lines on slopes. Weed early.',
      soil_bn: 'জৈব সার ও ঢালু জমিতে মালচ দিন যাতে মাটি ক্ষয় না হয়।',
      soil_en: 'Add organic matter and mulch on slopes to reduce erosion.',
    },
    'গম': {
      method_bn: 'অগ্রহায়ণে সারি ২০ সেমি দূরে বীজ বপন করুন। বীজ শোধন করে নিন।',
      method_en: 'Sow wheat in Agrahayan in 20 cm rows after seed treatment.',
      soil_bn: '২-৩ চাষে সমতল বীজতলা। ইউরিয়া ভাগ করে দিন, সেচ কুশি ও কাঁইশ পর্যায়ে।',
      soil_en: 'Level seedbed after 2-3 ploughings. Split urea; irrigate at tillering and heading.',
    },
    'ভূট্টা': {
      method_bn: 'সারি ৬০-৭৫ সেমি, গাছ ২০-২৫ সেমি। প্রতি গর্তে ১-২ বীজ।',
      method_en: 'Plant maize at 60-75 cm rows and 20-25 cm between plants.',
      soil_bn: 'গভীর চাষ, গোবর ও পটাশ সমৃদ্ধ সার। নালা কেটে অতিরিক্ত পানি সরান।',
      soil_en: 'Deep tillage with manure and potash. Drain excess water with furrows.',
    },
    'সরিষা': {
      method_bn: 'আমন কাটার পর জো অবস্থায় বীজ ছিটিয়ে হালকা মই দিন। ঘন বপন এড়িয়ে চলুন।',
      method_en: 'Broadcast mustard after Aman harvest at field capacity; avoid dense sowing.',
      soil_bn: '২ চাষে নরম মাটি। সালফার/জিপসাম দিলে ফলন বাড়ে। জলাবদ্ধতা সহ্য করে না।',
      soil_en: 'Light tilth. Gypsum/sulphur improves yield. Avoid waterlogging.',
    },
    'আলু': {
      method_bn: 'কার্তিক-অগ্রহায়ণে সারি ৬০ সেমি, কন্দ ২৫ সেমি দূরত্বে রোপণ। মাটি তুলে আইল দিন।',
      method_en: 'Plant tubers in Kartik-Agrahayan at 60×25 cm and ridge the rows.',
      soil_bn: 'ঝুরঝুরে বেলে-দোআঁশ। গোবর ৪০ কেজি/শতাংশ, বোরন-জিপসাম প্রয়োগ করুন।',
      soil_en: 'Fine sandy loam. Apply manure and boron-gypsum.',
    },
    'টমেটো': {
      method_bn: 'চারা ২৫-৩০ দিনে ৬০×৪০ সেমি দূরত্বে রোপণ। খুঁটি দিয়ে গাছ বাঁধুন।',
      method_en: 'Transplant 25-30 day seedlings at 60×40 cm and stake plants.',
      soil_bn: 'উঁচু বেড, জৈব সার ও চুন (অম্ল মাটিতে)। নালা দিয়ে পানি নামান।',
      soil_en: 'Raised beds with compost; lime acidic soils. Provide drainage.',
    },
    'পাট': {
      method_bn: 'চৈত্র-বৈশাখে সারি সেচে বীজ বপন। ঘন চারা পাতলা করুন।',
      method_en: 'Sow jute in Chaitra-Baishakh in lines and thin dense stands.',
      soil_bn: 'পলি দোআঁশ, জৈব সার। পানি নামানোর নালা রাখুন।',
      soil_en: 'Silt loam with organic manure and drainage furrows.',
    },
    'মসুর': {
      method_bn: 'অগ্রহায়ণে বীজ ছিটান বা সারি বপন। রাইজোবিয়াম টিকা দিলে ভালো।',
      method_en: 'Sow lentil in Agrahayan; rhizobium inoculation helps nodulation.',
      soil_bn: 'হালকা চাষ। নাইট্রোজেন কম, ফসফেট বেশি দিন — মাটির নাইট্রোজেন বাড়ে।',
      soil_en: 'Light tillage. Low N, higher P — builds soil nitrogen.',
    },
    'আখ': {
      method_bn: 'সারি ৯০ সেমি, সেট ৪৫ সেমি। সেট শোধন করে রোপণ করুন।',
      method_en: 'Plant treated setts in 90 cm rows at 45 cm spacing.',
      soil_bn: 'গভীর চাষ, প্রচুর জৈব সার। লবণাক্ত এলাকায় সেচ ও ধুয়ে লবণ কমান।',
      soil_en: 'Deep tillage and heavy organic manure. Leach salts in coastal soils.',
    },
    'সয়াবিন': {
      method_bn: 'আষাঢ়ে সারি ৩০ সেমি, বীজ ৭-১০ সেমি। বীজ টিকা দিন।',
      method_en: 'Sow inoculated soybean in Asharh at 30 cm rows.',
      soil_bn: 'দোআঁশ মাটি, নালা নিষ্কাশন। লবণাক্ত জমিতে উঁচু বেড ব্যবহার করুন।',
      soil_en: 'Loam with drainage. Use raised beds on saline land.',
    },
    'চীনাবাদাম': {
      method_bn: 'সারি ৩০-৪০ সেমি, বীজ ১৫ সেমি। মাটি হালকা রাখুন যাতে শুঁটি গাড়ে।',
      method_en: 'Sow groundnut at 30-40×15 cm in loose soil for pegging.',
      soil_bn: 'বেলে-দোআঁশ, জিপসাম অপরিহার্য। জলাবদ্ধতা এড়িয়ে চলুন।',
      soil_en: 'Sandy loam with gypsum. Avoid waterlogging.',
    },
    'নারিকেল': {
      method_bn: 'গর্ভ ১ মিটার, চারা ৭-৮ মিটার দূরত্বে রোপণ। উপকূলে লবণ সহনশীল জাত নিন।',
      method_en: 'Plant coconut seedlings 7-8 m apart in 1 m pits.',
      soil_bn: 'গর্তে গোবর-ছাই-লবণমুক্ত মাটি। বৃষ্টির পানি ধরে রাখার বাঁধ দিন।',
      soil_en: 'Fill pits with manure and salt-free soil. Catch rainwater with basins.',
    },
    'কেনাফ': {
      method_bn: 'বর্ষার আগে সারি বপন। জলাবদ্ধ নিচু জমিতে কেনাফ পাটের চেয়ে নিরাপদ।',
      method_en: 'Sow kenaf before monsoon; safer than jute on waterlogged land.',
      soil_bn: 'জৈব সার ও নালা। পানি নামলে আগাছা পরিষ্কার করুন।',
      soil_en: 'Organic manure and drains. Weed after water recedes.',
    },
    'কাউন': {
      method_bn: 'হাওরে পানি নামার পর স্বল্পমেয়াদী কাউন বপন করুন।',
      method_en: 'Sow short-duration foxtail millet after haor water recedes.',
      soil_bn: 'হালকা চাষ, কম সার। অতিরিক্ত পানি সরান।',
      soil_en: 'Light tillage, modest fertilizer, good drainage.',
    },
    'মিষ্টি আলু': {
      method_bn: 'লতা কাটিং ২৫-৩০ সেমি সারিতে রোপণ। চরে পানি নামার পর উপযোগী।',
      method_en: 'Plant vine cuttings after floodwater recedes on char land.',
      soil_bn: 'বেলে পলি, জৈব সার। আইল তুলে কন্দ বড় হতে দিন।',
      soil_en: 'Sandy silt with manure. Ridge to let tubers swell.',
    },
    'আদা': {
      method_bn: 'বৈশাখে কন্দ রোপণ, ছায়া ও মালচ দিন। পাহাড়ি ঢালে সমোন্নতি বেড।',
      method_en: 'Plant ginger rhizomes in Baishakh with shade and mulch.',
      soil_bn: 'অম্ল মাটিতে চুন ও প্রচুর জৈব সার। ক্ষয় রোধে মালচ।',
      soil_en: 'Lime acidic soils, heavy organic matter, mulch against erosion.',
    },
    'হলুদ': {
      method_bn: 'আদা-সদৃশ রোপণ, আংশিক ছায়া। পানি জমতে দেবেন না।',
      method_en: 'Plant turmeric like ginger under partial shade; avoid standing water.',
      soil_bn: 'ঝুরঝুরে দোআঁশ, জৈব সার। ঢালু জমিতে নালা।',
      soil_en: 'Loose loam with compost and hillside drains.',
    },
    'আম': {
      method_bn: 'বর্ষায় কলম চারা রোপণ, ৮-১০ মিটার দূরত্ব। গোড়ায় পানি জমবে না।',
      method_en: 'Plant grafted mango in monsoon at 8-10 m spacing with drainage.',
      soil_bn: 'গর্ভে গোবর-টিএসপি। আগাছা ও মালচ।',
      soil_en: 'Pit with manure and TSP; keep mulch and weed-free basin.',
    },
    'কাঁঠাল': {
      method_bn: 'বর্ষায় চারা রোপণ। পাহাড়ি ঢালে মাটি বাঁধিয়ে গর্ত করুন।',
      method_en: 'Plant jackfruit in monsoon on terraced hill slopes.',
      soil_bn: 'গভীর গর্ত, জৈব সার। ক্ষয় রোধে ঘাসের আবরণ।',
      soil_en: 'Deep pits with manure and grass cover against erosion.',
    },
    'লিচু': {
      method_bn: 'আর্দ্র ছায়াযুক্ত স্থানে চারা রোপণ। ফুল আসার আগে সেচ দিন।',
      method_en: 'Plant litchi in moist partial shade; irrigate before flowering.',
      soil_bn: 'অম্ল দোআঁশ, জৈব সার। গোড়ায় পানি না রাখুন।',
      soil_en: 'Acid loam with compost; no standing water at the collar.',
    },
    'কলা': {
      method_bn: 'ছোষক ২×২ মিটার দূরত্বে রোপণ। বায়ুপ্রবাহ ও সেচ নিয়মিত রাখুন।',
      method_en: 'Plant banana suckers at 2×2 m with regular irrigation and airflow.',
      soil_bn: 'উর্বর দোআঁশ, প্রচুর গোবর। নালা কেটে অতিরিক্ত পানি সরান।',
      soil_en: 'Fertile loam with heavy manure and drainage.',
    },
    'চিনা': {
      method_bn: 'খরাপ্রবণ জমিতে স্বল্পমেয়াদী চিনা বপন — কম পানিতেও ফলন দেয়।',
      method_en: 'Sow short-duration proso millet on drought-prone land.',
      soil_bn: 'হালকা চাষ, কম সার। আগাছা পরিষ্কার রাখুন।',
      soil_en: 'Light tillage and modest fertilizer; keep weed-free.',
    },
    'মেস্তা': {
      method_bn: 'আঁশ ফসল হিসেবে সারি বপন। খরা ও ঢালু জমিতে উপযোগী।',
      method_en: 'Sow mesta in rows; suited to drought and slopes.',
      soil_bn: 'জৈব সার, নালা নিষ্কাশন।',
      soil_en: 'Organic manure and drainage furrows.',
    },
  };

  const FERTILIZER = {
    _default: {
      bn: 'মাটি পরীক্ষা করে ইউরিয়া, টিএসপি ও এমওপি দিন। শতাংশে গোবর ৩০-৪০ কেজি মেশান।',
      en: 'Apply urea, TSP and MoP after a soil test. Mix 30-40 kg cow dung per shotok.',
    },
    'বোরো ধান': {
      bn: 'শতাংশে গোবর ৪০ কেজি। ইউরিয়া ৩ কিস্তি, টিএসপি-এমওপি-জিপসাম শেষ চাষে। জিংক সালফেট ১০০ গ্রাম/শতাংশ।',
      en: '40 kg cow dung/shotok. Split urea in 3 doses; TSP-MoP-gypsum at last ploughing.',
    },
    'আমন ধান (রোপা)': {
      bn: 'গোবর ৩০ কেজি/শতাংশ। ইউরিয়া দুই কিস্তি, টিএসপি ও পটাশ শেষ চাষে।',
      en: '30 kg dung/shotok. Split urea; TSP and potash at last ploughing.',
    },
    'আউশ ধান (উফশী)': {
      bn: 'গোবর ২৫ কেজি/শতাংশ, ইউরিয়া ভাগ করে, টিএসপি-এমওপি বপনের সময়।',
      en: '25 kg dung/shotok; basal TSP-MoP; split urea.',
    },
    'আউশ ধান (বোনা)': {
      bn: 'জৈব সার মূল ভরসা। রাসায়নিক সার কম দিন যাতে ঢালে ধুয়ে না যায়।',
      en: 'Rely on organic manure; keep chemical fertilizer low on slopes.',
    },
    'গম': {
      bn: 'শতাংশে ইউরিয়া ১ কেজি (২ কিস্তি), টিএসপি ৬০০ গ্রাম, এমওপি ৪০০ গ্রাম, বোরন সামান্য।',
      en: 'Urea 1 kg/shotok in 2 splits, TSP 600 g, MoP 400 g, plus boron.',
    },
    'ভূট্টা': {
      bn: 'গোবর ৪০ কেজি/শতাংশ। ইউরিয়া ৩ কিস্তি, পটাশ ও টিএসপি বেশি দিন।',
      en: '40 kg dung/shotok. Split urea 3 times; high P and K.',
    },
    'সরিষা': {
      bn: 'ইউরিয়া কম, সালফার/জিপসাম জরুরি। শতাংশে টিএসপি ৫০০ গ্রাম, এমওপি ৩০০ গ্রাম।',
      en: 'Low urea; gypsum/sulphur is essential. TSP 500 g, MoP 300 g per shotok.',
    },
    'আলু': {
      bn: 'গোবর ৪০ কেজি/শতাংশ, ইউরিয়া ১ কেজি, টিএসপি ১ কেজি, এমওপি ১.২ কেজি, বোরন-জিপসাম।',
      en: 'Dung 40 kg/shotok, urea 1 kg, TSP 1 kg, MoP 1.2 kg, plus boron-gypsum.',
    },
    'টমেটো': {
      bn: 'বেডে কম্পোস্ট বেশি। ইউরিয়া কিস্তিতে, ফুল-ফল ধরার সময় ক্যালসিয়াম/বোরন।',
      en: 'Heavy compost on beds. Split urea; Ca/B at flowering.',
    },
    'পাট': {
      bn: 'জৈব সার মূল। ইউরিয়া হালকা কিস্তি, টিএসপি বপনের সময়।',
      en: 'Organic manure first. Light split urea; basal TSP.',
    },
    'মসুর': {
      bn: 'রাইজোবিয়াম টিকা। নাইট্রোজেন খুব কম, ফসফেট ও পটাশ দিন।',
      en: 'Rhizobium inoculant. Very low N, adequate P and K.',
    },
    'আখ': { bn: 'প্রচুর গোবর, ইউরিয়া কয়েক কিস্তি, পটাশ বেশি।', en: 'Heavy manure, split urea, high potash.' },
    'সয়াবিন': { bn: 'রাইজোবিয়াম টিকা, ফসফেট সার, ইউরিয়া সামান্য স্টার্টার।', en: 'Rhizobium plus phosphate; little starter urea.' },
    'চীনাবাদাম': { bn: 'জিপসাম অপরিহার্য (শুঁটি গাড়ার সময়)। ফসফেট দিন, নাইট্রোজেন কম।', en: 'Gypsum at pegging. Phosphate yes, nitrogen low.' },
    'নারিকেল': { bn: 'গর্তে গোবর-ছাই। বছরে কিস্তি এনপিকে গোড়ায়।', en: 'Manure in the pit; split NPK at the basin yearly.' },
    'কেনাফ': { bn: 'জৈব সার ও হালকা ইউরিয়া।', en: 'Organic manure and light urea.' },
    'কাউন': { bn: 'কম সার। হালকা ইউরিয়া এক কিস্তিই যথেষ্ট।', en: 'Low fertilizer; one light urea dose.' },
    'মিষ্টি আলু': { bn: 'জৈব সার বেশি, পটাশ দিন, নাইট্রোজেন কম।', en: 'High organic matter and potash; keep N low.' },
    'আদা': { bn: 'প্রচুর কম্পোস্ট, পটাশ, অম্ল মাটিতে চুন।', en: 'Heavy compost, potash, lime on acid soils.' },
    'হলুদ': { bn: 'জৈব সার ও পটাশ। অতিরিক্ত ইউরিয়া এড়িয়ে চলুন।', en: 'Organics and potash; avoid excess urea.' },
    'আম': { bn: 'গর্তে গোবর-টিএসপি। ফুলের আগে পটাশ।', en: 'Manure and TSP in the pit; potash before bloom.' },
    'কাঁঠাল': { bn: 'গভীর গর্তে গোবর। বছরে ২-৩ কিস্তি এনপিকে।', en: 'Manure in a deep pit; 2-3 NPK splits a year.' },
    'লিচু': { bn: 'জৈব সার। ফুলের আগে সেচ ও পটাশ।', en: 'Organic manure; potash and water before flowering.' },
    'কলা': { bn: 'প্রচুর গোবর, ইউরিয়া-পটাশ নিয়মিত।', en: 'Heavy manure; regular urea-potash.' },
    'চিনা': { bn: 'কম সার, খরায় জৈব মালচ।', en: 'Low fertilizer; organic mulch in drought.' },
    'মেস্তা': { bn: 'জৈব সার ও হালকা ইউরিয়া।', en: 'Organic manure and light urea.' },
  };

  function fold(s) {
    return String(s || '')
      .replace(/[\u200c\u200d]/g, '')
      .replace(/য়/g, 'য়')
      .replace(/ড়/g, 'ড়')
      .replace(/ঢ়/g, 'ঢ়')
      .replace(/ী/g, 'ি')
      .replace(/\s+/g, '')
      .toLowerCase();
  }

  function dataset() {
    return global.FOLIKA_CROP_DATASET || { zones: {}, districts: {}, varieties: {} };
  }

  function lang() {
    return (global.FolikaI18n && global.FolikaI18n.getLang()) || 'bn';
  }

  const Reco = {
    fold,

    resolveZone(locationState) {
      const ds = dataset();
      const names = [
        locationState && locationState.districtNameBn,
        locationState && locationState.districtNameEn,
        locationState && locationState.label,
      ].filter(Boolean);

      for (const raw of names) {
        const parts = String(raw).split(/[,|]/);
        for (const p of parts) {
          const f = fold(p);
          for (const [dist, zid] of Object.entries(ds.districts || {})) {
            if (fold(dist) === f || f.indexOf(fold(dist)) !== -1 || fold(dist).indexOf(f) !== -1) {
              return ds.zones[zid] || ds.zones.fertile;
            }
          }
        }
      }
      return ds.zones.fertile;
    },

    cropsFor(zone, season) {
      const list = (zone && zone.crops) || [];
      return list.filter((c) => !season || c.season === season || c.season === 'all');
    },

    findCrop(zone, cropName) {
      if (!zone || !cropName) return null;
      return ((zone.crops) || []).find((c) => c.crop === cropName) || null;
    },

    varietiesFor(zone, cropName) {
      const ds = dataset();
      const rec = this.findCrop(zone, cropName);
      const catalog = (ds.varieties && ds.varieties[cropName]) || [];
      const tags = SITUATION_FOR_ZONE[(zone && zone.id) || 'fertile'] || [];
      const matched = catalog.filter((v) => tags.some((t) => (v.situation || '').indexOf(t) !== -1));
      const extra = (matched.length ? matched : catalog).slice(0, 12);
      const out = [];
      const seen = {};
      if (rec && rec.variety) {
        out.push({
          name: rec.variety,
          recommended: true,
          reason: rec.reason,
          duration: rec.duration,
          yield_t_ha: rec.yield_t_ha,
          year: rec.year,
        });
        seen[rec.variety] = true;
      }
      extra.forEach((v) => {
        if (seen[v.name]) return;
        seen[v.name] = true;
        out.push({ ...v, recommended: false });
      });
      return out;
    },

    lookupPlanting(cropName) {
      if (!cropName) return null;
      if (PLANTING[cropName]) return PLANTING[cropName];
      const key = Object.keys(PLANTING).find((k) => cropName.indexOf(k) !== -1 || k.indexOf(cropName) !== -1);
      return key ? PLANTING[key] : null;
    },

    planting(cropName) {
      const info = this.lookupPlanting(cropName) || {
        method_bn: 'স্থানীয় কৃষি অফিসের পরামর্শ অনুযায়ী রোপণ করুন।',
        method_en: 'Follow local DAE planting guidance for this crop.',
        soil_bn: '২-৩ বার চাষ, জৈব সার মেশান, মাটির পরীক্ষা করে সার নির্ধারণ করুন।',
        soil_en: 'Plough 2-3 times, add organic manure, and fertilize after a soil test.',
      };
      const en = lang() === 'en';
      const fert = FERTILIZER[cropName] || this.lookupFertilizer(cropName) || FERTILIZER._default;
      return {
        method: en ? info.method_en : info.method_bn,
        soil: en ? info.soil_en : info.soil_bn,
        fertilizer: en ? fert.en : fert.bn,
      };
    },

    lookupFertilizer(cropName) {
      if (!cropName) return FERTILIZER._default;
      if (FERTILIZER[cropName]) return FERTILIZER[cropName];
      const key = Object.keys(FERTILIZER).find((k) => k !== '_default' && (cropName.indexOf(k) !== -1 || k.indexOf(cropName) !== -1));
      return key ? FERTILIZER[key] : FERTILIZER._default;
    },

    rotationText(zone, currentCrop, currentSeason, harvested, varietyName) {
      return this.rotationItems(zone, currentCrop, currentSeason, harvested, varietyName).join(' ');
    },

    rotationItems(zone, currentCrop, currentSeason, harvested, varietyName) {
      const en = lang() === 'en';
      const nextSeason = NEXT_SEASON[currentSeason] || 'rabi';
      const nextCrops = this.cropsFor(zone, nextSeason);
      const names = nextCrops.map((c) => (en ? (c.crop_en + ' — ' + c.variety) : (c.crop + ' — ' + c.variety)));
      const zoneLabel = zone ? (en ? zone.en : zone.bn) : '';
      const soil = zone ? (en ? zone.soil_en : zone.soil_bn) : '';
      const legumes = nextCrops.filter((c) => /মসুর|সয়াবিন|সরিষা/.test(c.crop));
      const rec = this.findCrop(zone, currentCrop);
      const cropLabel = currentCrop
        ? (en ? ((rec && rec.crop_en) || currentCrop) : currentCrop)
        : '';
      const items = [];

      if (cropLabel) {
        items.push(en
          ? `Current crop: ${cropLabel}${varietyName ? ' (' + varietyName + ')' : ''}`
          : `এখন চাষে আছেন: ${cropLabel}${varietyName ? ' (' + varietyName + ')' : ''}`);
      } else {
        items.push(en ? 'Select a crop to see rotation for this land.' : 'ফসল নির্বাচন করলে এই জমির ফসল চক্র দেখাবে।');
      }

      if (zoneLabel) {
        items.push(en ? `Land type: ${zoneLabel}` : `জমির ধরন: ${zoneLabel}`);
      }
      if (soil) items.push(soil);

      let extra = '';
      if (/ধান/.test(currentCrop || '')) {
        extra = en
          ? 'After rice, a pulse or mustard crop helps restore soil nitrogen and organic matter.'
          : 'ধানের পর ডাল বা সরিষা লাগালে মাটির নাইট্রোজেন ও জৈবগুণ ফিরে আসে।';
      } else if (/মসুর|সয়াবিন/.test(currentCrop || '')) {
        extra = en
          ? 'After a pulse, a cereal uses leftover nitrogen efficiently.'
          : 'ডাল ফসলের পর দানা ফসল অবশিষ্ট নাইট্রোজেন ভালোভাবে কাজে লাগায়।';
      } else if (/আলু|টমেটো/.test(currentCrop || '')) {
        extra = en
          ? 'After potato/tomato, avoid another solanaceous crop; use a cereal or pulse.'
          : 'আলু/টমেটোর পর আবার একই পরিবারের ফসল এড়িয়ে দানা বা ডাল লাগান।';
      } else if (/সরিষা/.test(currentCrop || '')) {
        extra = en
          ? 'After mustard, rice or jute fits the next season and uses residual fertility.'
          : 'সরিষার পর ধান বা পাট পরের মৌসুমে ভালো যায়।';
      }

      if (!harvested) {
        if (names.length) {
          items.push(en
            ? `After harvest, next season (${this.seasonLabel(nextSeason)}):`
            : `কাটার পর পরবর্তী মৌসুম (${this.seasonLabel(nextSeason)}):`);
          names.forEach((n) => items.push(n));
        }
        if (extra) items.push(extra);
        return items;
      }

      const pick = legumes[0] || nextCrops[0];
      const pickName = pick ? (en ? pick.crop_en : pick.crop) : '';
      const pickVar = pick ? pick.variety : '';
      items.push(en
        ? `Harvest recorded. For the next cycle in ${zoneLabel}, plant ${pickName}${pickVar ? ' (' + pickVar + ')' : ''}.`
        : `ফসল কাটা হয়েছে। ${zoneLabel}-এ পরবর্তী চক্রে ${pickName}${pickVar ? ' (' + pickVar + ')' : ''} লাগান।`);
      if (names.length) {
        items.push(en ? 'Other options:' : 'অন্য বিকল্প:');
        names.forEach((n) => items.push(n));
      }
      return items;
    },

    rotationHtml(zone, currentCrop, currentSeason, harvested, varietyName) {
      const SL = global.FolikaSuggestList;
      if (!SL) {
        return `<p>${this.rotationText(zone, currentCrop, currentSeason, harvested, varietyName)}</p>`;
      }
      const items = this.rotationItems(zone, currentCrop, currentSeason, harvested, varietyName);
      const intro = items[0] || '';
      const rest = items.slice(1);
      return `<p class="folika-suggest-intro">${SL.escapeHtml(intro)}</p>${SL.toList(rest)}`;
    },

    seasonLabel(season) {
      const en = lang() === 'en';
      if (season === 'rabi') return en ? 'Rabi (Nov-Mar)' : 'রবি (অগ্রহায়ণ-চৈত্র)';
      if (season === 'kharif_1') return en ? 'Kharif-1 / Aus (Mar-Jun)' : 'খরিপ-১ / আউশ (চৈত্র-আষাঢ়)';
      if (season === 'kharif_2') return en ? 'Kharif-2 / Aman (Jul-Nov)' : 'খরিপ-২ / আমন (আষাঢ়-অগ্রহায়ণ)';
      return season;
    },

    irrigationHtml(cropName, zone, weather, forecast, varietyName) {
      const text = this.irrigationText(cropName, zone, weather, forecast, varietyName);
      const SL = global.FolikaSuggestList;
      return SL ? SL.paragraphToList(text) : `<p>${text}</p>`;
    },

    irrigationText(cropName, zone, weather, forecast, varietyName) {
      const en = lang() === 'en';
      const who = cropName ? (cropName + (varietyName ? ' (' + varietyName + ')' : '')) : (en ? 'the crop' : 'ফসল');
      const rainNow = Number((weather && (weather.rain_prob_pct || weather.rain_probability)) || 0);
      const days = (forecast && forecast.forecast) || (forecast && forecast.days) || [];
      const weekRain = days.length
        ? days.slice(0, 7).some((d) => Number(d.rain_prob_pct || 0) >= 50)
        : rainNow >= 50;
      const heavy = days.length
        ? days.slice(0, 7).some((d) => Number(d.rain_prob_pct || 0) >= 70)
        : rainNow >= 70;
      const temp = Number((weather && weather.temperature) || 29);
      const zid = (zone && zone.id) || 'fertile';
      const rice = /ধান/.test(cropName || '');
      const veg = /টমেটো|আলু|কলা/.test(cropName || '');

      const locNote = zone ? (en ? zone.en : zone.bn) : '';

      if (heavy) {
        return en
          ? `Heavy rain is likely this week in your ${locNote} area. Do not irrigate. Drain standing water, especially for ${cropName || 'the crop'}. Recheck bunds and canals.`
          : `আগামী সপ্তাহে আপনার ${locNote} এলাকায় ভারী বৃষ্টির সম্ভাবনা। ${who}-এর জমিতে সেচ দেবেন না। অতিরিক্ত পানি নামিয়ে দিন, আইল-নালা খোলা রাখুন।`;
      }
      if (weekRain) {
        if (rice) {
          return en
            ? `Light to moderate rain is expected. Keep a shallow water layer in the rice field; skip extra irrigation this week unless soil cracks.`
            : `হালকা থেকে মাঝারি বৃষ্টির সম্ভাবনা। ${who} ধান হওয়ায় জমিতে অগভীর পানি রাখুন; মাটি ফেটে না গেলে এই সপ্তাহে অতিরিক্ত সেচ দেবেন না।`;
        }
        return en
          ? `Rain is likely within 7 days. Skip irrigation now. After rain, check soil moisture before watering ${cropName || 'the crop'}.`
          : `৭ দিনের মধ্যে বৃষ্টির সম্ভাবনা। ${who}-এ এখন সেচ দেবেন না। বৃষ্টির পর মাটির জো দেখে পানি দিন।`;
      }
      if (zid === 'barind' || temp >= 34) {
        return en
          ? `Little rain expected and conditions are dry (${Math.round(temp)}°C). Irrigate ${cropName || 'the crop'} this week — prefer morning/evening, and mulch to save water.`
          : `বৃষ্টির সম্ভাবনা কম, আবহাওয়া শুষ্ক (${Math.round(temp)}° সে.)। এই সপ্তাহে ${who}-এ সেচ দিন — সকাল/বিকালে পানি দিন, মালচ দিলে পানি বাঁচবে।`;
      }
      if (zid === 'coastal') {
        return en
          ? `Low rain forecast. Irrigate with the least-saline water available. Avoid midday watering which raises salt at the root zone.`
          : `বৃষ্টি কম। যতটা সম্ভব কম লবণাক্ত পানি দিয়ে সেচ দিন। দুপুরে সেচ এড়িয়ে চলুন — লবণ শিকড়ে জমে।`;
      }
      if (veg) {
        return en
          ? `No meaningful rain this week. Give light, frequent irrigation to ${cropName}; keep soil moist but never waterlogged.`
          : `এই সপ্তাহে কার্যকর বৃষ্টি নেই। ${who}-এ হালকা কিন্তু নিয়মিত সেচ দিন; মাটি ভেজা রাখুন, জলাবদ্ধতা নয়।`;
      }
      return en
        ? `Rain chance is low this week. Apply a need-based irrigation to ${cropName || 'the field'} when the top soil is dry.`
        : `এই সপ্তাহে বৃষ্টির সম্ভাবনা কম। উপরের মাটি শুকিয়ে গেলে ${who}-এ প্রয়োজনমতো সেচ দিন।`;
    },

    revenue(cropRec, shotok) {
      let tHa = Number((cropRec && cropRec.yield_t_ha) || 4);
      if (/ধান/.test((cropRec && cropRec.crop) || '') && tHa > 15) tHa = 6;
      const price = Number((cropRec && cropRec.price_per_kg) || 40);
      const kgPerShotok = (tHa * 1000) / 247.1;
      const kg = kgPerShotok * (Number(shotok) || 0);
      return Math.round(kg * price);
    },

    nextSeason(season) {
      return NEXT_SEASON[season] || 'rabi';
    },
  };

  global.FolikaCropReco = Reco;
})(window);
