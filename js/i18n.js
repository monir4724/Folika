/**
 * FOLIKA — Internationalization (বাংলা primary, English secondary)
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'folika_lang';

  const STRINGS = {
  bn: {
    brand_title: 'ফলিকা',
    brand_title_en_display: 'Folika',
    brand_tagline: 'কৃষকের ডিজিটাল সঙ্গী',
    skip_content: 'মূল বিষয়বস্তুতে যান',
    menu_open: 'মেনু খুলুন',
    menu_close: 'মেনু বন্ধ করুন',
    menu_title: 'ফলিকা মেনু',
    login: 'লগইন করুন',
    nav_home: 'হোম',
    nav_crop: 'ফসল',
    nav_fish: 'মৎস্য',
    nav_livestock: 'প্রাণিসম্পদ',
    nav_disease: 'রোগ নির্ণয়',
    nav_community: 'কমিউনিটি',
    nav_profile: 'প্রোফাইল',
    nav_settings: 'সেটিংস',
    hero_badge: 'আধুনিক কৃষকের ডিজিটাল প্ল্যাটফর্ম',
    hero_title: 'ফলিকা ডিজিটাল কৃষি সেবা',
    hero_desc: 'ফসলের রোগ নির্ণয়, আধুনিক চাষাবাদ পদ্ধতি, স্তরভিত্তিক মৎস্যচাষ, প্রাণিসম্পদ স্বাস্থ্য এবং আবহাওয়া ভিত্তিক সেচ পরামর্শ।',
    hero_btn_crop: 'নতুন ফসল পরিকল্পনা করুন',
    hero_btn_disease: 'ছবি তুলে রোগ নির্ণয়',
    greeting_sub: 'আপনার আজকের খামার ড্যাশবোর্ড ও পরিকল্পনা',
    clock_label: 'এখন সময়',
    date_label: 'আজকের তারিখ',
    weather_title: 'আবহাওয়ার লাইভ পূর্বাভাস',
    weather_rain: 'বৃষ্টির সম্ভাবনা',
    weather_wind: 'বাতাসের গতি',
    weather_advice: 'পরামর্শ',
    location_division: 'বিভাগ',
    location_district: 'জেলা',
    location_upazila: 'উপজেলা',
    location_select_division: 'বিভাগ নির্বাচন করুন',
    location_select_district: 'জেলা নির্বাচন করুন',
    location_select_upazila: 'উপজেলা নির্বাচন করুন',
    gps_btn: 'GPS',
    gps_searching: 'GPS খোঁজা হচ্ছে...',
    gps_connected: 'GPS সংযুক্ত',
    gps_approx: 'GPS আনুমানিক',
    gps_failed: 'GPS পাওয়া যায়নি',
    dashboard_modules: 'প্রধান ড্যাশবোর্ড মডিউল',
    dashboard_subtitle: 'আপনার প্রয়োজন অনুযায়ী মডিউলে প্রবেশ করুন',
    weather_advice_default: 'আগামী সপ্তাহে বৃষ্টির সম্ভাবনা কম। জমিতে সেচ ও সার প্রয়োগের উপযুক্ত সময়।',
    mod_crop_badge: 'ফসল মডিউল',
    mod_crop_title: 'ফসল চাষাবাদ',
    mod_crop_desc: 'জমির দৈর্ঘ্য ও প্রস্থ দিয়ে স্বয়ংক্রিয় ক্ষেত্রফল, ফসল পর্যায়ক্রম, সেচ ও সার হিসাব।',
    mod_crop_btn: 'ফসল প্ল্যানে যান',
    mod_fish_badge: 'মৎস্য মডিউল',
    mod_fish_title: 'মৎস্যচাষ',
    mod_fish_desc: 'পুকুরের মাপ দিয়ে স্তরভিত্তিক মাছ ও খাদ্য তালিকা তৈরি করুন।',
    mod_fish_btn: 'মৎস্য প্ল্যানে যান',
    mod_livestock_badge: 'প্রাণিসম্পদ',
    mod_livestock_title: 'গবাদিপশু',
    mod_livestock_desc: 'খাদ্য তালিকা, টিকাদান ক্যালেন্ডার ও স্বাস্থ্য পর্যবেক্ষণ।',
    mod_livestock_btn: 'প্রাণিসম্পদ প্ল্যানে যান',
    mod_disease_badge: 'এআই প্রযুক্তি',
    mod_disease_title: 'রোগ নির্ণয়',
    mod_disease_desc: 'ছবি তুলে এআই দিয়ে রোগ শনাক্ত ও চিকিৎসা পরামর্শ পান।',
    mod_disease_btn: 'ছবি আপলোড করুন',
    mod_community_badge: 'কমিউনিটি',
    mod_community_title: 'কমিউনিটি ও ডিলার',
    mod_community_desc: 'কৃষি অফিস হটলাইন, প্রশিক্ষণ বিজ্ঞপ্তি এবং ডিলার ডিরেক্টরি।',
    mod_community_btn: 'কমিউনিটি দেখুন',
    mod_govt_badge: 'সরকারি সেবা',
    mod_govt_title: 'সরকারি প্রণোদনা',
    mod_govt_desc: 'কৃষি ভর্তুকি, ঋণ সুবিধা ও জরুরি হটলাইন নম্বর।',
    mod_govt_btn: 'সরকারি সেবা দেখুন',
    mod_finance_badge: 'আর্থিক হিসাব',
    mod_finance_title: 'আমার আয়-ব্যয়',
    mod_finance_desc: 'সকল প্ল্যানের সম্মিলিত খরচ ও সম্ভাব্য লাভ দেখুন।',
    mod_finance_btn: 'প্রোফাইলে যান',
    nav_more: 'আরও অপশন',
    settings_title: 'সেটিংস',
    settings_lang: 'ভাষা',
    settings_lang_bn: 'বাংলা',
    settings_lang_en: 'ইংরেজি',
    crop_new_plan: 'নতুন ফসল পরিকল্পনা তৈরি করুন',
    crop_land_length: 'জমির দৈর্ঘ্য (মিটার)',
    crop_land_width: 'জমির প্রস্থ (মিটার)',
    crop_land_shape: 'জমির আকৃতি',
    crop_area_auto: 'স্বয়ংক্রিয় ক্ষেত্রফল',
    crop_recommendation: 'সুপারিশ',
    crop_rotation: 'ফসল চক্র',
    crop_irrigation: 'সেচ পরামর্শ',
    crop_calculator: 'খরচ-লাভ হিসাব',
    crop_season: 'মৌসুম নির্বাচন করুন',
    crop_select_crop: 'ফসল নির্বাচন করুন',
    crop_select_variety: 'জাত নির্বাচন করুন',
    crop_planting_method: 'চাষ পদ্ধতি',
    crop_soil_prep: 'মাটি প্রস্তুতি',
    crop_fertilizer: 'সার প্রয়োগ',
    crop_harvest_status: 'ফসল কাটা হয়েছে কি না',
    crop_harvest_yes: 'হ্যাঁ, ফসল কেটে তুলেছি',
    crop_harvest_no: 'না, এখনো মাঠে আছে',
    crop_total_cost: 'মোট খরচ',
    crop_total_revenue: 'সম্ভাব্য আয়',
    crop_net_profit: 'নিট লাভ',
    shape_rectangular: 'আয়তাকার',
    shape_triangular: 'ত্রিভুজাকার',
    shape_irregular: 'অনিয়মিত',
    greeting_morning: 'শুভ সকাল',
    greeting_noon: 'শুভ দুপুর',
    greeting_afternoon: 'শুভ অপরাহ্ন',
    greeting_evening: 'শুভ সন্ধ্যা',
    greeting_night: 'শুভ রাত্রি',
    greeting_day: 'শুভ দিন',
    am: 'সকাল',
    pm: 'বিকাল',
    crop_delete_plan: 'পরিকল্পনা মুছুন',
    footer_rights: 'সর্বস্বত্ব সংরক্ষিত',
    footer_made: 'বাংলাদেশি কৃষকদের জন্য তৈরি',
  },
  en: {
    brand_title: 'Folika',
    brand_title_en_display: 'Folika',
    brand_tagline: 'Digital Companion for Farmers',
    skip_content: 'Skip to main content',
    menu_open: 'Open menu',
    menu_close: 'Close menu',
    menu_title: 'FOLIKA Menu',
    login: 'Login',
    nav_home: 'Home',
    nav_crop: 'Crops',
    nav_fish: 'Fish',
    nav_livestock: 'Livestock',
    nav_disease: 'Disease Detection',
    nav_community: 'Community',
    nav_profile: 'Profile',
    nav_settings: 'Settings',
    hero_badge: 'Modern Digital Platform for Farmers',
    hero_title: 'FOLIKA Digital Agricultural Service',
    hero_desc: 'Disease detection, modern farming methods, layered fish culture, livestock health, and weather-based irrigation advice.',
    hero_btn_crop: 'Create New Crop Plan',
    hero_btn_disease: 'Detect Disease from Photo',
    greeting_sub: 'Your farm dashboard and plans for today',
    clock_label: 'Current time',
    date_label: 'Today\'s date',
    weather_title: 'Live Weather Forecast',
    weather_rain: 'Rain probability',
    weather_wind: 'Wind speed',
    weather_advice: 'Advice',
    location_division: 'Division',
    location_district: 'District',
    location_upazila: 'Upazila',
    location_select_division: 'Select division',
    location_select_district: 'Select district',
    location_select_upazila: 'Select upazila',
    gps_btn: 'GPS',
    gps_searching: 'Finding GPS location...',
    gps_connected: 'GPS connected',
    gps_approx: 'GPS approximate',
    gps_failed: 'Could not detect GPS',
    dashboard_modules: 'Main Dashboard Modules',
    dashboard_subtitle: 'Open modules based on your needs',
    weather_advice_default: 'Low chance of rain next week. Good time for irrigation and fertilizer on your field.',
    mod_crop_badge: 'Crop module',
    mod_crop_title: 'Crop farming',
    mod_crop_desc: 'Auto area from land length and width, crop rotation, irrigation and fertilizer planning.',
    mod_crop_btn: 'Go to crop plan',
    mod_fish_badge: 'Fisheries module',
    mod_fish_title: 'Fish farming',
    mod_fish_desc: 'Layer-based fish and feed lists from pond dimensions.',
    mod_fish_btn: 'Go to fish plan',
    mod_livestock_badge: 'Livestock',
    mod_livestock_title: 'Cattle & livestock',
    mod_livestock_desc: 'Feed lists, vaccination calendar and health monitoring.',
    mod_livestock_btn: 'Go to livestock plan',
    mod_disease_badge: 'AI technology',
    mod_disease_title: 'Disease detection',
    mod_disease_desc: 'Upload a photo for AI disease detection and treatment advice.',
    mod_disease_btn: 'Upload photo',
    mod_community_badge: 'Community',
    mod_community_title: 'Community & dealers',
    mod_community_desc: 'Ag office hotlines, training notices and dealer directory.',
    mod_community_btn: 'View community',
    mod_govt_badge: 'Government services',
    mod_govt_title: 'Government incentives',
    mod_govt_desc: 'Ag subsidies, loan schemes and emergency hotline numbers.',
    mod_govt_btn: 'View govt services',
    mod_finance_badge: 'Finance',
    mod_finance_title: 'My income & expenses',
    mod_finance_desc: 'Combined costs and expected profit across all plans.',
    mod_finance_btn: 'Go to profile',
    nav_more: 'More options',
    settings_title: 'Settings',
    settings_lang: 'Language',
    settings_lang_bn: 'Bangla',
    settings_lang_en: 'English',
    crop_new_plan: 'Create New Crop Plan',
    crop_land_length: 'Land length (meters)',
    crop_land_width: 'Land width (meters)',
    crop_land_shape: 'Land shape',
    crop_area_auto: 'Auto-calculated area',
    crop_recommendation: 'Recommendation',
    crop_rotation: 'Crop rotation',
    crop_irrigation: 'Irrigation advice',
    crop_calculator: 'Cost & profit calculator',
    crop_season: 'Select season',
    crop_select_crop: 'Select crop',
    crop_select_variety: 'Select variety',
    crop_planting_method: 'Planting method',
    crop_soil_prep: 'Soil preparation',
    crop_fertilizer: 'Fertilizer',
    crop_harvest_status: 'Has the crop been harvested?',
    crop_harvest_yes: 'Yes, harvested',
    crop_harvest_no: 'No, still in field',
    crop_total_cost: 'Total cost',
    crop_total_revenue: 'Expected revenue',
    crop_net_profit: 'Net profit',
    shape_rectangular: 'Rectangular',
    shape_triangular: 'Triangular',
    shape_irregular: 'Irregular',
    greeting_morning: 'Good morning',
    greeting_noon: 'Good afternoon',
    greeting_afternoon: 'Good afternoon',
    greeting_evening: 'Good evening',
    greeting_night: 'Good night',
    greeting_day: 'Good day',
    am: 'AM',
    pm: 'PM',
    crop_delete_plan: 'Delete this plan',
    footer_rights: 'All rights reserved',
    footer_made: 'Made for Bangladeshi farmers',
  },
  };

  const I18n = {
    getLang() {
      return localStorage.getItem(STORAGE_KEY) || (global.FOLIKA_CONFIG && global.FOLIKA_CONFIG.PRIMARY_LANGUAGE) || 'bn';
    },
    setLang(lang) {
      const l = lang === 'en' ? 'en' : 'bn';
      localStorage.setItem(STORAGE_KEY, l);
      document.documentElement.lang = l;
      document.documentElement.setAttribute('data-lang', l);
      this.apply();
      window.dispatchEvent(new CustomEvent('folika:langchange', { detail: { lang: l } }));
    },
    t(key) {
      const lang = this.getLang();
      return (STRINGS[lang] && STRINGS[lang][key]) || STRINGS.bn[key] || key;
    },
    apply(root) {
      const scope = root || document;
      scope.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        const val = this.t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = val;
        } else {
          el.textContent = val;
        }
      });
      scope.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
        el.placeholder = this.t(el.getAttribute('data-i18n-placeholder'));
      });
      scope.querySelectorAll('[data-i18n-aria]').forEach((el) => {
        el.setAttribute('aria-label', this.t(el.getAttribute('data-i18n-aria')));
      });
      // Nav pills by href pattern
      const navMap = {
        'index.html': 'nav_home', '../index.html': 'nav_home',
        'crop.html': 'nav_crop', 'fish.html': 'nav_fish',
        'livestock.html': 'nav_livestock', 'disease.html': 'nav_disease',
        'community.html': 'nav_community', 'profile.html': 'nav_profile',
        'settings.html': 'nav_settings', 'more.html': 'nav_more',
      };
      scope.querySelectorAll('.nav-pill-btn, .mobile-nav-link, .tab-link span').forEach((el) => {
        const link = el.closest('a');
        if (!link) return;
        const href = link.getAttribute('href') || '';
        const file = href.split('/').pop();
        if (navMap[file]) el.textContent = this.t(navMap[file]);
      });
      scope.querySelectorAll('.brand-title').forEach((el) => {
        el.textContent = this.t('brand_title');
      });
      scope.querySelectorAll('.brand-tagline').forEach((el) => {
        el.textContent = this.t('brand_tagline');
      });
    },
  };

  document.documentElement.lang = I18n.getLang();
  document.documentElement.setAttribute('data-lang', I18n.getLang());

  global.FolikaI18n = I18n;
})(window);
