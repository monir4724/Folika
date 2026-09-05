/**
 * FOLIKA (ফলিকা) - Main JavaScript
 * v2026.08.29 — cache bust: hard-refresh if you see syntax errors
 */

(function applyEarlyPrefs() {
  try {
    const t = localStorage.getItem('folika-theme');
    if (t) document.documentElement.setAttribute('data-theme', t);
    if (localStorage.getItem('folika-contrast') === 'high') {
      document.documentElement.setAttribute('data-contrast', 'high');
    }
    const fs = localStorage.getItem('folika-font-scale');
    if (fs) document.documentElement.setAttribute('data-font-scale', fs);
    const a11y = JSON.parse(localStorage.getItem('folika_a11y') || '{}');
    const root = document.documentElement;
    if (a11y.monochrome) root.setAttribute('data-a11y-monochrome', '1');
    if (a11y.invert) root.setAttribute('data-a11y-invert', '1');
    if (a11y.largeCursor) root.setAttribute('data-a11y-large-cursor', '1');
    if (a11y.highlightLinks) root.setAttribute('data-a11y-highlight-links', '1');
    if (a11y.highlightHeaders) root.setAttribute('data-a11y-highlight-headers', '1');
    if (a11y.readingGuide) root.setAttribute('data-a11y-reading-guide', '1');
  } catch (e) { /* ignore */ }
})();

function loadAccessibilityWidget() {
  if (window.FolikaAccessibility || document.querySelector('script[data-folika-a11y]')) return;
  const inPages = /\/pages\//.test(location.pathname)
    || document.querySelector('link[href*="../css/"]') !== null;
  const s = document.createElement('script');
  s.src = inPages ? '../js/accessibility-widget.js?v=20260830g' : 'js/accessibility-widget.js?v=20260830g';
  s.setAttribute('data-folika-a11y', '1');
  document.head.appendChild(s);
}
loadAccessibilityWidget();

document.addEventListener('DOMContentLoaded', () => {
  if (window.FolikaI18n) window.FolikaI18n.apply();
  initThemeAndAccessibility();
  initSettingsLanguage();
  if (window.FolikaNav) window.FolikaNav.init();
  initBottomNavLabels();
  initLiveClockAndGreeting();
  if (window.FolikaLocation) window.FolikaLocation.initAll();
  initMobileNavigation();
  initCropCalculators();
  initFishCalculators();
  initLivestockCalculators();
  initCommunityOffices();
  initCommunityDealerFilters();
  initCommunityForum();
  initCommunityTrainingShowMore();
  loadNearbyDiseaseCenters();
  initModals();
  initDiseaseAI();
  if (window.FolikaCropPlan) window.FolikaCropPlan.init();
  if (window.FolikaFishPlan) window.FolikaFishPlan.init();
  if (window.FolikaLivestockPlan) window.FolikaLivestockPlan.init();
  initBackendBridge();
  renderProfileRemindersFromStorage();
  window.addEventListener('folika:langchange', () => {
    if (window.FolikaI18n) window.FolikaI18n.apply();
    if (window.FolikaPageCopy) window.FolikaPageCopy.apply();
    initLiveClockAndGreeting();
    initBottomNavLabels();
    if (window.FolikaNav) window.FolikaNav.init();
  });
});

window.reinitFolikaMobileNav = function reinitFolikaMobileNav() {
  const toggle = document.getElementById('mobileMenuToggle');
  if (toggle) toggle.dataset.navBound = '';
  initMobileNavigation();
};

/* --------------------------------------------------------------------------
   1. Theme & Accessibility (Dark/Light Mode & Font Scaler)
   -------------------------------------------------------------------------- */
function initThemeAndAccessibility() {
  const savedTheme = localStorage.getItem('folika-theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.checked = savedTheme === 'dark';
    themeToggle.addEventListener('change', () => {
      const newTheme = themeToggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('folika-theme', newTheme);
    });
  }

  // Contrast toggle
  const contrastToggle = document.getElementById('contrastToggle');
  if (contrastToggle) {
    contrastToggle.checked = localStorage.getItem('folika-contrast') === 'high';
    if (contrastToggle.checked) document.documentElement.setAttribute('data-contrast', 'high');
    contrastToggle.addEventListener('change', () => {
      if (contrastToggle.checked) {
        document.documentElement.setAttribute('data-contrast', 'high');
        localStorage.setItem('folika-contrast', 'high');
      } else {
        document.documentElement.removeAttribute('data-contrast');
        localStorage.removeItem('folika-contrast');
      }
    });
  }

  const fontScaleSelect = document.getElementById('fontScaleSelect');
  if (fontScaleSelect) {
    fontScaleSelect.value = localStorage.getItem('folika-font-scale') || 'default';
    fontScaleSelect.addEventListener('change', () => {
      const v = fontScaleSelect.value;
      if (v === 'default') {
        document.documentElement.removeAttribute('data-font-scale');
        localStorage.removeItem('folika-font-scale');
      } else {
        document.documentElement.setAttribute('data-font-scale', v);
        localStorage.setItem('folika-font-scale', v);
      }
      if (window.FolikaAccessibility) {
        const s = window.FolikaAccessibility.loadState();
        const idx = window.FolikaAccessibility.FONT_LEVELS.indexOf(v);
        s.fontLevel = idx >= 0 ? idx : 0;
        window.FolikaAccessibility.saveState(s);
      }
    });
  }
}

function initSettingsLanguage() {
  const langSelect = document.getElementById('appLanguageSelect');
  if (!langSelect || !window.FolikaI18n) return;
  langSelect.value = window.FolikaI18n.getLang();
  langSelect.addEventListener('change', () => {
    window.FolikaI18n.setLang(langSelect.value);
  });
}

function initBottomNavLabels() {
  const lang = (window.FolikaI18n && window.FolikaI18n.getLang()) || 'bn';
  const map = {
    'index.html': { bn: 'হোম', en: 'Home' },
    '../index.html': { bn: 'হোম', en: 'Home' },
    'pages/crop.html': { bn: 'ফসল', en: 'Crop' },
    'crop.html': { bn: 'ফসল', en: 'Crop' },
    'pages/fish.html': { bn: 'মৎস্য', en: 'Fish' },
    'fish.html': { bn: 'মৎস্য', en: 'Fish' },
    'pages/livestock.html': { bn: 'প্রাণিসম্পদ', en: 'Livestock' },
    'livestock.html': { bn: 'প্রাণিসম্পদ', en: 'Livestock' },
    'pages/disease.html': { bn: 'রোগ', en: 'Disease' },
    'disease.html': { bn: 'রোগ', en: 'Disease' },
    'pages/community.html': { bn: 'কমিউনিটি', en: 'Community' },
    'community.html': { bn: 'কমিউনিটি', en: 'Community' },
    'pages/profile.html': { bn: 'প্রোফাইল', en: 'Profile' },
    'profile.html': { bn: 'প্রোফাইল', en: 'Profile' },
  };
  document.querySelectorAll('.bottom-nav .tab-link').forEach((link) => {
    const href = link.getAttribute('href') || '';
    const key = href.replace(/^\.\.\//, '').split('?')[0];
    const labels = map[href] || map[key];
    const span = link.querySelector('span');
    if (span && labels) span.textContent = lang === 'en' ? labels.en : labels.bn;
  });
}

/* --------------------------------------------------------------------------
   2. Live Digital Clock & Bengali Greeting (Farmer-friendly format)
   -------------------------------------------------------------------------- */
function initLiveClockAndGreeting() {
  const greetingEl = document.getElementById('liveGreetingText');
  const clockTimerEl = document.getElementById('liveClockTimer');
  const clockDateEl = document.getElementById('liveClockDate');
  const clockSeasonEl = document.getElementById('liveClockSeason');
  const greetingSubEl = document.querySelector('.greeting-subtext');

  const i18n = () => window.FolikaI18n;
  const lang = i18n() ? i18n().getLang() : 'bn';

  if (greetingSubEl && i18n()) greetingSubEl.textContent = i18n().t('greeting_sub');

  const banglaDigits = {'0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯'};
  function toNum(n) {
    const s = String(n);
    if (lang === 'en') return s;
    return s.replace(/\d/g, (d) => banglaDigits[d]);
  }

  const bnMonths = ['জানুয়ারি','ফেব্রুয়ারি','মার্চ','এপ্রিল','মে','জুন','জুলাই','আগস্ট','সেপ্টেম্বর','অক্টোবর','নভেম্বর','ডিসেম্বর'];
  const enMonths = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const bnDays = ['রবিবার','সোমবার','মঙ্গলবার','বুধবার','বৃহস্পতিবার','শুক্রবার','শনিবার'];
  const enDays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const bnSeasons = ['শীতকাল','বসন্তকাল','গ্রীষ্মকাল','বর্ষাকাল'];
  const enSeasons = ['Winter','Spring','Summer','Monsoon'];

  function getSeason(m) {
    if (m >= 11 || m <= 1) return 0;
    if (m >= 2 && m <= 3) return 1;
    if (m >= 4 && m <= 5) return 2;
    return 3;
  }

  function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const month = now.getMonth();

    let greetingKey = 'greeting_day';
    if (hours >= 5 && hours < 12) greetingKey = 'greeting_morning';
    else if (hours >= 12 && hours < 15) greetingKey = 'greeting_noon';
    else if (hours >= 15 && hours < 18) greetingKey = 'greeting_afternoon';
    else if (hours >= 18 && hours < 22) greetingKey = 'greeting_evening';
    else greetingKey = 'greeting_night';

    if (greetingEl) {
      const userName = window.FOLIKA_USER_NAME || (lang === 'en' ? 'Rohim mia' : 'Rohim mia');
      const greeting = i18n() ? i18n().t(greetingKey) : greetingKey;
      greetingEl.textContent = `${greeting}, ${userName}`;
    }

    if (clockTimerEl) {
      const h12 = hours % 12 || 12;
      if (lang === 'en') {
        let period = 'night';
        if (hours >= 4 && hours < 12) period = 'morning';
        else if (hours >= 12 && hours < 16) period = 'afternoon';
        else if (hours >= 16 && hours < 19) period = 'evening';
        clockTimerEl.textContent = `${period} ${h12}:${String(minutes).padStart(2, '0')}`;
      } else {
        let period = 'রাত';
        if (hours >= 4 && hours < 12) period = 'সকাল';
        else if (hours >= 12 && hours < 16) period = 'দুপুর';
        else if (hours >= 16 && hours < 19) period = 'বিকাল';
        const minPart = minutes > 0 ? ` ${toNum(minutes)} মিনিট` : '';
        clockTimerEl.textContent = `${period} ${toNum(h12)}টা${minPart}`;
      }
    }

    if (clockDateEl) {
      const dayName = lang === 'en' ? enDays[now.getDay()] : bnDays[now.getDay()];
      const monthName = lang === 'en' ? enMonths[month] : bnMonths[month];
      const dateLabel = lang === 'en' ? 'Today' : 'আজ';
      clockDateEl.textContent = `${dateLabel} ${dayName}, ${toNum(now.getDate())} ${monthName} ${toNum(now.getFullYear())}`;
    }

    if (clockSeasonEl) {
      const seasons = lang === 'en' ? enSeasons : bnSeasons;
      const seasonLabel = lang === 'en' ? 'Season' : 'মৌসুম';
      clockSeasonEl.textContent = `${seasonLabel}: ${seasons[getSeason(month)]}`;
    }
  }

  updateClock();
  if (!window._folikaClockInterval) {
    window._folikaClockInterval = setInterval(updateClock, 30000);
  }
}

/* GPS + weather handled by FolikaLocation (js/location.js) */

/* --------------------------------------------------------------------------
   4. Crop Plan Calculators & Workflow (Wireframe 2)
   -------------------------------------------------------------------------- */
function initCropCalculators() {
  const lengthInput = document.getElementById('cropLandLength');
  const widthInput = document.getElementById('cropLandWidth');
  const areaDisplay = document.getElementById('cropAreaDisplay');

  function calculateCropArea() {
    if (!lengthInput || !widthInput || !areaDisplay) return;
    const len = parseFloat(lengthInput.value) || 0;
    const wid = parseFloat(widthInput.value) || 0;
    const sqFt = len * wid;
    // 1 shotok = 435.6 sq ft
    const shotok = (sqFt / 435.6).toFixed(2);
    const bigha = (shotok / 33).toFixed(2);

    areaDisplay.innerHTML = `<strong>${shotok} শতাংশ</strong> (${bigha} বিঘা / ${sqFt.toLocaleString('bn-BD')} বর্গফুট)`;
    updateCropCosts(shotok);
  }

  function updateCropCosts(shotok) {
    const costSeed = document.getElementById('cropCostSeed');
    const costFert = document.getElementById('cropCostFert');
    const costLabor = document.getElementById('cropCostLabor');
    const totalCost = document.getElementById('cropTotalCost');
    const totalRevenue = document.getElementById('cropTotalRevenue');
    const totalProfit = document.getElementById('cropTotalProfit');

    if (!costSeed) return;

    const s = parseFloat(shotok) || 33;
    const seed = Math.round(s * 25);
    const fert = Math.round(s * 110);
    const labor = Math.round(s * 130);
    const total = seed + fert + labor;
    const revenue = Math.round(s * 750);
    const profit = revenue - total;

    costSeed.textContent = `${seed.toLocaleString('bn-BD')} ৳`;
    costFert.textContent = `${fert.toLocaleString('bn-BD')} ৳`;
    costLabor.textContent = `${labor.toLocaleString('bn-BD')} ৳`;
    totalCost.textContent = `${total.toLocaleString('bn-BD')} ৳`;
    totalRevenue.textContent = `${revenue.toLocaleString('bn-BD')} ৳`;
    totalProfit.textContent = `+ ${profit.toLocaleString('bn-BD')} ৳`;
  }

  if (lengthInput && widthInput) {
    lengthInput.addEventListener('input', calculateCropArea);
    widthInput.addEventListener('input', calculateCropArea);
    calculateCropArea();
  }

  // Dynamic Crop Variety Selection
  const cropTypeSelect = document.getElementById('cropTypeSelect');
  const varietyList = document.getElementById('cropVarietyList');
  const plantingGuide = document.getElementById('cropPlantingGuide');
  const soilPrep = document.getElementById('cropSoilPrep');

  if (cropTypeSelect && varietyList) {
    cropTypeSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'rice') {
        varietyList.innerHTML = `
          <option value="brri49">১. ব্রি ধান-৪৯ (উচ্চফলনশীল আমন)</option>
          <option value="brri87">২. ব্রি ধান-৮৭ (চিকন প্রিমিয়াম)</option>
          <option value="brri89">৩. ব্রি ধান-৮৯ (বোরো মেগা ফলন)</option>
          <option value="bina7">৪. বিনা ধান-৭ (আগাম জাত)</option>
        `;
        if (plantingGuide) plantingGuide.textContent = '২৫-৩০ দিনের চারা প্রতি গুছিতে ২-৩টি করে ২০×১৫ সেমি দূরত্বে রোপণ করুন।';
        if (soilPrep) soilPrep.textContent = 'জমি ৩-৪ বার চাষ ও মই দিয়ে থকথকে কাদা করুন। শেষ চাষে টিএসপি, পটাশ ও জিপসাম সার মিশিয়ে দিন।';
      } else if (val === 'potato') {
        varietyList.innerHTML = `
          <option value="diamond">১. ডায়মন্ড (সাদা গোল আলু)</option>
          <option value="cardinal">২. কার্ডিনাল (লাল খোসা)</option>
          <option value="granola">৩. গ্র্যানোলা (আগাম জাত)</option>
        `;
        if (plantingGuide) plantingGuide.textContent = 'সারি থেকে সারির দূরত্ব ৬০ সেমি এবং আলু থেকে আলুর দূরত্ব ২৫ সেমি রাখুন।';
        if (soilPrep) soilPrep.textContent = 'জমি ঝুরঝুরে করে চাষ দিন। প্রতি শতাংশে গোবর ৪০ কেজি, ইউরিয়া ১ কেজি ও পটাশ ১.২ কেজি দিন।';
      } else if (val === 'mustard') {
        varietyList.innerHTML = `
          <option value="bari14">১. বারি সরিষা-১৪ (স্বল্পমেয়াদী ৭৫-৮০ দিন)</option>
          <option value="bari17">২. বারি সরিষা-১৭ (উচ্চ ফলনশীল)</option>
        `;
        if (plantingGuide) plantingGuide.textContent = 'আমন ধান কাটার পর জমিতে "জো" থাকা অবস্থায় প্রতি শতাংশে ৩৫-৪০ গ্রাম বীজ ছিটিয়ে দিন।';
        if (soilPrep) soilPrep.textContent = 'ধানের নাড়ার মাঝে বিনা চাষে রিলে ফসল হিসেবে অথবা ২-৩টি চাষ দিয়ে মাটি নরম করুন।';
      }
    });
  }
}

/* --------------------------------------------------------------------------
   5. Fish Plan Calculators & Dynamic Layers (Wireframe 3)
   -------------------------------------------------------------------------- */
function initFishCalculators() {
  if (window.FolikaFishPlan && typeof window.FolikaFishPlan.refreshLayers === 'function') {
    window.FolikaFishRecalc = () => window.FolikaFishPlan.refreshLayers();
  }
}

/* --------------------------------------------------------------------------
   6. Livestock Plan Interactive Manager (Wireframe 4)
   -------------------------------------------------------------------------- */
function initLivestockCalculators() {
  const animalType = document.getElementById('livestockAnimalType');
  const animalCount = document.getElementById('livestockAnimalCount');
  const feedGrass = document.getElementById('livestockFeedGrass');
  const feedDry = document.getElementById('livestockFeedDry');
  const feedGrain = document.getElementById('livestockFeedGrain');

  function updateFeedRequirements() {
    if (!animalType || !animalCount || !feedGrass) return;
    const type = animalType.value;
    const count = parseInt(animalCount.value, 10) || 1;

    let grassPerHead = 25; // kg
    let dryPerHead = 5; // kg
    let grainPerHead = 3.5; // kg

    if (type === 'cow_fattening') {
      grassPerHead = 20;
      dryPerHead = 4;
      grainPerHead = 4.5;
    } else if (type === 'goat') {
      grassPerHead = 4;
      dryPerHead = 1;
      grainPerHead = 0.5;
    } else if (type === 'poultry') {
      grassPerHead = 0;
      dryPerHead = 0;
      grainPerHead = 0.12; // 120 grams per chicken
    }

    const totalGrass = Math.round(grassPerHead * count);
    const totalDry = Math.round(dryPerHead * count);
    const totalGrain = (grainPerHead * count).toFixed(1);

    feedGrass.textContent = `${totalGrass} কেজি`;
    feedDry.textContent = `${totalDry} কেজি`;
    feedGrain.textContent = `${totalGrain} কেজি`;
  }

  if (animalType && animalCount) {
    animalType.addEventListener('change', updateFeedRequirements);
    animalCount.addEventListener('input', updateFeedRequirements);
    updateFeedRequirements();
  }
}

/* --------------------------------------------------------------------------
   7. Community Offices & Hotlines (from office talika doc)
   -------------------------------------------------------------------------- */
const ZILA_TO_DISTRICT_EN = {
  gazipur: 'Gazipur',
  bogra: 'Bogura',
  dhaka: 'Dhaka',
  rajshahi: 'Rajshahi',
};

const UPAZILA_SELECT_TO_SLUG = {
  kaliakair: 'kaliakair',
  gazipur_sadar: 'gazipursadar',
  kapasia: 'kapasia',
  sreepur: 'sreepur',
  kaliganj: 'kaliganj',
  sherpur: 'sherpur',
  sodor: 'bogurasadar',
  shibganj: 'shibganj',
};

const DISTRICT_WEBSITE_SLUG = {
  bogura: 'bogra',
};

const OFFICE_DEPT_META = {
  DAE: { badge: 'badge-govt', card: 'card-domain-govt', btn: 'btn-domain-govt', label: 'কৃষি (DAE)' },
  DLS: { badge: 'badge-livestock', card: 'card-domain-livestock', btn: 'btn-domain-livestock', label: 'প্রাণিসম্পদ (DLS)' },
  DoF: { badge: 'badge-fish', card: 'card-domain-fish', btn: 'btn-domain-fish', label: 'মৎস্য (DoF)' },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function officeWebsiteUrl(site) {
  if (!site) return '#';
  return site.startsWith('http') ? site : `https://${site}`;
}

function findDistrictOfficeData(districtEn) {
  const data = window.FOLIKA_COMMUNITY_OFFICES;
  if (!data || !districtEn) return null;
  const key = districtEn.toLowerCase().replace(/\s/g, '');
  for (const division of data.divisions) {
    const district = division.districts.find((d) => (
      d.name_en.toLowerCase() === districtEn.toLowerCase()
      || d.slug === key
    ));
    if (district) return { division, district };
  }
  return null;
}

function getCommunityOfficeSelection() {
  const loc = window.FolikaLocation && window.FolikaLocation.state;
  if (loc && loc.districtNameEn && loc.upazilaNameEn) {
    return {
      districtEn: loc.districtNameEn,
      upazilaNameEn: loc.upazilaNameEn,
    };
  }
  const zilaSelect = document.getElementById('dealerZilaSelect');
  const upazilaSelect = document.getElementById('dealerUpazilaSelect');
  const zilaKey = zilaSelect ? zilaSelect.value : '';
  const upazilaKey = upazilaSelect ? upazilaSelect.value : '';
  const districtEn = ZILA_TO_DISTRICT_EN[zilaKey] || '';
  const upazilaSlug = UPAZILA_SELECT_TO_SLUG[upazilaKey] || upazilaKey;
  return { districtEn, upazilaSlug, zilaKey, upazilaKey };
}

function isCommunityOfficeLocationReady() {
  const loc = window.FolikaLocation && window.FolikaLocation.state;
  return !!(loc && loc.divisionId && loc.districtId);
}

function resolveUpazilaSlug(district, upazilaNameEn) {
  if (!district || !upazilaNameEn) return null;
  const key = upazilaNameEn.toLowerCase().replace(/\s/g, '');
  const upa = (district.upazilas || []).find((u) => (
    (u.name_en && u.name_en.toLowerCase().replace(/\s/g, '') === key)
    || (u.slug && u.slug.toLowerCase() === key)
    || (u.name_bn && u.name_bn === upazilaNameEn)
  ));
  return upa ? upa.slug : null;
}

function communitySearchPlaceholder(message) {
  return `<div class="card community-search-placeholder">
    <p class="text-body-sm text-secondary" style="margin: 0;">${escapeHtml(message)}</p>
  </div>`;
}

function applyCommunityShowMore(mount, options) {
  if (!mount) return;
  const previewCount = (options && options.previewCount) || 2;
  const moreLabel = (options && options.moreLabel) || 'আরও দেখুন';
  const lessLabel = (options && options.lessLabel) || 'কম দেখুন';
  const selector = (options && options.itemSelector) || '.community-result-item';

  mount.querySelectorAll('.community-show-more-btn, .community-results-more').forEach((el) => el.remove());

  const items = Array.from(mount.querySelectorAll(selector));
  if (items.length <= previewCount) return;

  const hidden = items.slice(previewCount);
  hidden.forEach((el) => el.classList.add('community-more-item'));

  const moreWrap = document.createElement('div');
  moreWrap.className = 'community-results-more';
  const scroll = document.createElement('div');
  scroll.className = 'community-results-scroll';
  hidden.forEach((el) => scroll.appendChild(el));
  moreWrap.appendChild(scroll);
  mount.appendChild(moreWrap);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn-secondary btn-sm community-show-more-btn';
  btn.textContent = `${moreLabel} (${toBnDigits(hidden.length)})`;
  btn.addEventListener('click', () => {
    const open = moreWrap.classList.toggle('is-open');
    btn.classList.toggle('is-expanded', open);
    btn.textContent = open
      ? lessLabel
      : `${moreLabel} (${toBnDigits(hidden.length)})`;
    if (open) scroll.scrollTop = 0;
  });
  mount.appendChild(btn);
}

function initCommunityTrainingShowMore() {
  const mount = document.getElementById('communityTrainingMount');
  if (!mount) return;
  applyCommunityShowMore(mount, {
    previewCount: 1,
    itemSelector: '.card',
    moreLabel: 'আরও প্রশিক্ষণ দেখুন',
    lessLabel: 'কম দেখুন',
  });
}

function renderOfficeCard(office, titleSuffix, websiteOverride) {
  const meta = OFFICE_DEPT_META[office.dept] || OFFICE_DEPT_META.DAE;
  const website = websiteOverride || office.website;
  const contact = office.contact || (office.dept === 'DAE' ? '১৬১২৩' : office.dept === 'DLS' ? '৩৩৩' : '');
  const tel = contact.replace(/[^\d]/g, '');
  const contactHtml = tel
    ? `<a href="tel:${tel}" class="btn btn-sm ${meta.btn}">কল: ${contact}</a>`
    : '';
  const siteHtml = website
    ? `<a href="${officeWebsiteUrl(website)}" class="btn btn-sm btn-secondary" target="_blank" rel="noopener noreferrer">ওয়েবসাইট</a>`
    : '';
  return `<div class="card ${meta.card}" style="padding: 12px; margin: 0;">
      <span class="badge ${meta.badge}">${meta.label}</span>
      <h3 class="font-bold text-body">${escapeHtml(office.name)}${titleSuffix ? ` — ${escapeHtml(titleSuffix)}` : ''}</h3>
      <p class="text-body-sm text-secondary" style="margin: 4px 0 8px;">ঠিকানা: ${escapeHtml(office.address)}</p>
      <div class="flex gap-8" style="flex-wrap: wrap;">${contactHtml}${siteHtml}</div>
    </div>`;
}

function renderUpazilaOfficeCards(district, upazila) {
  const distSlug = DISTRICT_WEBSITE_SLUG[district.slug] || district.slug;
  const upaSlug = upazila.slug;
  const upaBn = upazila.name_bn || upazila.name_en;
  const templates = [
    {
      dept: 'DAE',
      name: `উপজেলা কৃষি অফিস, ${upaBn}`,
      address: `${upaBn}, ${district.name_bn || district.name_en}`,
      contact: '১৬১২৩',
      website: `dae.${upaSlug}.${distSlug}.gov.bd`,
    },
    {
      dept: 'DLS',
      name: `উপজেলা প্রাণিসম্পদ অফিস, ${upaBn}`,
      address: `${upaBn}, ${district.name_bn || district.name_en}`,
      contact: '৩৩৩',
      website: `dls.${upaSlug}.${distSlug}.gov.bd`,
    },
    {
      dept: 'DoF',
      name: `উপজেলা মৎস্য অফিস, ${upaBn}`,
      address: `${upaBn}, ${district.name_bn || district.name_en}`,
      contact: '',
      website: `fisheries.${upaSlug}.${distSlug}.gov.bd`,
    },
  ];
  return templates.map((office) => renderOfficeCard(office, upaBn)).join('');
}

function renderCommunityOffices() {
  const mount = document.getElementById('communityOfficesMount');
  const data = window.FOLIKA_COMMUNITY_OFFICES;
  if (!mount || !data) return;

  if (!isCommunityOfficeLocationReady()) {
    mount.innerHTML = communitySearchPlaceholder('বিভাগ, জেলা ও উপজেলা নির্বাচন করে «অনুসন্ধান» চাপুন।');
    return;
  }

  const selection = getCommunityOfficeSelection();
  const districtEn = selection.districtEn;
  const match = findDistrictOfficeData(districtEn);
  const upazilaSlug = selection.upazilaSlug
    || (match && selection.upazilaNameEn
      ? resolveUpazilaSlug(match.district, selection.upazilaNameEn)
      : null);
  const hotlines = (data.hotlines || []).map((h) => `
    <div class="flex justify-between text-body-sm font-semibold" style="margin-bottom: 4px;">
      <span>${escapeHtml(h.label_bn)}:</span>
      <a href="tel:${h.phone}" class="text-error font-bold">${toBnDigits(h.phone)}</a>
    </div>`).join('');

  let html = `<div class="card community-result-item" style="background: var(--color-accent-tint); border: 1px solid var(--color-accent); padding: 12px; margin: 0;">
    <h3 class="text-caption font-bold text-dealer">জাতীয় হটলাইন</h3>
    ${hotlines}
  </div>
  <p class="text-caption text-secondary community-result-item" style="margin: 0;">${escapeHtml(data.note_bn || '')}</p>`;

  if (match) {
    const { division, district } = match;
    html += `<p class="text-body-sm font-semibold community-result-item" style="margin: 0;">${escapeHtml(division.name_bn)} → ${escapeHtml(district.name_bn || district.name_en)} জেলা</p>`;
    html += district.offices.map((office) => renderOfficeCard(office, 'জেলা অফিস').replace('class="card ', 'class="card community-result-item ')).join('');

    const slug = upazilaSlug || resolveUpazilaSlug(district, selection.upazilaNameEn);
    const upazila = slug
      ? (district.upazilas || []).find((u) => u.slug === slug)
      : null;
    if (upazila) {
      html += `<p class="text-body-sm font-semibold community-result-item" style="margin: 8px 0 0;">${escapeHtml(upazila.name_bn)} উপজেলা অফিস</p>`;
      html += renderUpazilaOfficeCards(district, upazila).replace(/class="card /g, 'class="card community-result-item ');
    }
  } else {
    html += `<div class="card community-result-item" style="padding: 12px; margin: 0;">
      <p class="text-body-sm text-secondary">এই জেলার অফিস তালিকা পাওয়া যায়নি। জাতীয় হটলাইন ব্যবহার করুন।</p>
    </div>`;
  }

  html += `<details class="card community-result-item" style="padding: 12px; margin: 0;">
    <summary class="font-bold text-body-sm" style="cursor: pointer;">কেন্দ্রীয় দপ্তরসমূহ</summary>
    <div class="flex flex-col gap-12" style="margin-top: 12px;">
      ${(data.central || []).map((c) => `
        <div>
          <p class="font-semibold text-body-sm">${escapeHtml(c.name_bn)}</p>
          <p class="text-caption text-secondary">${escapeHtml(c.address)}</p>
          <a href="${officeWebsiteUrl(c.website)}" target="_blank" rel="noopener noreferrer" class="text-primary text-caption">${escapeHtml(c.website)}</a>
        </div>`).join('')}
    </div>
  </details>`;

  mount.innerHTML = html;
  applyCommunityShowMore(mount, {
    previewCount: 3,
    itemSelector: '.community-result-item',
    moreLabel: 'আরও অফিস দেখুন',
    lessLabel: 'কম দেখুন',
  });
}

function initCommunityOffices() {
  const mount = document.getElementById('communityOfficesMount');
  if (!mount) return;

  mount.innerHTML = communitySearchPlaceholder('লোকেশন নির্বাচন করুন — অফিস তালিকা আপনাআপনি দেখাবে।');

  const searchBtn = document.getElementById('communityOfficeSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      if (!isCommunityOfficeLocationReady()) {
        mount.innerHTML = communitySearchPlaceholder('অনুসন্ধানের জন্য অন্তত বিভাগ ও জেলা নির্বাচন করুন।');
        return;
      }
      renderCommunityOffices();
    });
  }

  window.addEventListener('folika:locationchange', () => {
    if (isCommunityOfficeLocationReady()) renderCommunityOffices();
  });
  if (isCommunityOfficeLocationReady()) renderCommunityOffices();
}

/* --------------------------------------------------------------------------
   8. Community Filterable Dealer Directory
   -------------------------------------------------------------------------- */
function normalizeSearchText(str) {
  const bn = '০১২৩৪৫৬৭৮৯';
  return String(str)
    .toLowerCase()
    .replace(/[০-৯]/g, (ch) => String(bn.indexOf(ch)))
    .replace(/\s+/g, ' ')
    .trim();
}

function dealerSearchBlob(d) {
  return normalizeSearchText([
    d.shop,
    d.name,
    d.product,
    d.location,
    d.phone,
    d.category,
    d.sector,
  ].join(' '));
}
function toBnDigits(str) {
  const map = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(str).replace(/\d/g, (d) => map[d]);
}

function formatPhoneBn(phone) {
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 11) {
    return `${toBnDigits(digits.slice(0, 4))}-${toBnDigits(digits.slice(4))}`;
  }
  return toBnDigits(digits);
}

function dealerSectorBadge(sector) {
  if (sector === 'fish') return { cls: 'badge-fish', text: 'মাছ' };
  if (sector === 'livestock') return { cls: 'badge-verified', text: 'জীবন্ত পশু' };
  return { cls: 'badge-verified', text: 'ফসল' };
}

function dealerSectorBtnClass(sector) {
  if (sector === 'fish') return 'btn-domain-fish';
  if (sector === 'livestock') return 'btn-domain-livestock';
  return 'btn-domain-crop';
}

function mapApiDealer(d) {
  const sector = d.sector || 'crop';
  return {
    id: d.id,
    name: d.owner_name || '',
    shop: d.shop_name || d.shop || '',
    product: d.product_name || d.shop_type || '',
    phone: d.phone || '',
    location: d.address || '',
    sector,
  };
}

function renderKaliakoirDealers(extraDealers) {
  const list = document.getElementById('dealerResultsList');
  const local = Array.isArray(window.FOLIKA_DEALERS_KALIAKOIR) ? window.FOLIKA_DEALERS_KALIAKOIR : [];
  const remote = Array.isArray(extraDealers) ? extraDealers.map(mapApiDealer) : [];
  const seen = {};
  const dealers = local.concat(remote).filter((d) => {
    const key = String(d.phone || d.shop || '').replace(/\D/g, '') || d.shop;
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
  if (!list || !dealers.length) return false;

  list.innerHTML = dealers.map((d) => {
    const badge = dealerSectorBadge(d.sector);
    const btnCls = dealerSectorBtnClass(d.sector);
    const shop = escapeHtml(d.shop || '');
    const product = escapeHtml(d.product || '');
    const location = escapeHtml(d.location || '');
    const owner = escapeHtml(d.name || '');
    const phone = d.phone || '';
    const search = dealerSearchBlob(d);
    return `<div class="card dealer-result-card community-result-item" data-sector="${d.sector}" data-item="all" data-zila="gazipur" data-upazila="kaliakair" data-search="${escapeHtml(search)}">
        <span class="badge ${badge.cls}">${badge.text}</span>
        <h3 class="font-bold text-body">${shop}</h3>
        <p class="text-body-sm text-secondary">${product} — ${location}</p>
        <p class="text-caption text-secondary">${owner}</p>
        <a href="tel:${phone}" class="btn btn-sm ${btnCls}">কল: ${formatPhoneBn(phone)}</a>
      </div>`;
  }).join('');
  return true;
}

function isDealerSearchReady() {
  const zilaSelect = document.getElementById('dealerZilaSelect');
  const upazilaSelect = document.getElementById('dealerUpazilaSelect');
  return !!(zilaSelect && zilaSelect.value && upazilaSelect && upazilaSelect.value);
}

function syncDealerSelectsFromLocation() {
  const loc = window.FolikaLocation && window.FolikaLocation.state;
  const zilaSelect = document.getElementById('dealerZilaSelect');
  const upazilaSelect = document.getElementById('dealerUpazilaSelect');
  if (!loc || !zilaSelect || !upazilaSelect) return;

  const dist = String(loc.districtNameEn || loc.districtNameBn || '').toLowerCase();
  const upa = String(loc.upazilaNameEn || loc.upazilaNameBn || '').toLowerCase();
  if (dist.includes('gazipur') || dist.includes('গাজীপুর')) zilaSelect.value = 'gazipur';
  else if (dist.includes('dhaka') || dist.includes('ঢাকা')) zilaSelect.value = 'dhaka';
  else if (dist.includes('bogura') || dist.includes('bogra') || dist.includes('বগুড়া')) zilaSelect.value = 'bogra';
  else if (dist.includes('rajshahi') || dist.includes('রাজশাহী')) zilaSelect.value = 'rajshahi';

  if ((upa.includes('kaliakair') || upa.includes('kaliakoir') || upa.includes('কালিয়াকৈর')) && zilaSelect.value === 'gazipur') {
    upazilaSelect.value = 'kaliakair';
  }
}

async function fetchBackendDealers() {
  const api = window.FolikaAPI;
  if (!api || !api.market || !api.market.dealers) return [];
  try {
    const res = await api.market.dealers({ upazila_id: 28 });
    const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    return [];
  }
}

async function runDealerSearch() {
  const list = document.getElementById('dealerResultsList');
  const countEl = document.getElementById('dealerResultCount');
  if (!list) return;

  syncDealerSelectsFromLocation();

  if (!isDealerSearchReady()) {
    list.innerHTML = communitySearchPlaceholder('জেলা ও উপজেলা নির্বাচন করুন — তালিকা আপনাআপনি দেখাবে।');
    if (countEl) countEl.textContent = '';
    return;
  }

  const zilaSelect = document.getElementById('dealerZilaSelect');
  const upazilaSelect = document.getElementById('dealerUpazilaSelect');
  const sectorSelect = document.getElementById('dealerSectorSelect');
  const itemSelect = document.getElementById('dealerItemSelect');
  const dealerSearch = document.getElementById('dealerSearchInput');
  const zila = zilaSelect ? zilaSelect.value : '';
  const upazila = upazilaSelect ? upazilaSelect.value : '';

  if (zila !== 'gazipur' || upazila !== 'kaliakair') {
    list.innerHTML = communitySearchPlaceholder('এই উপজেলার ডিলার তালিকা এখনও যোগ হয়নি। বর্তমানে কালিয়াকৈর, গাজীপুরের তথ্য উপলব্ধ।');
    if (countEl) countEl.textContent = '';
    return;
  }

  const remote = await fetchBackendDealers();
  if (!renderKaliakoirDealers(remote)) {
    list.innerHTML = communitySearchPlaceholder('ডিলার তালিকা লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।');
    if (countEl) countEl.textContent = '';
    return;
  }

  const sector = sectorSelect ? sectorSelect.value : 'all';
  const item = itemSelect ? itemSelect.value : 'all';
  const query = dealerSearch ? normalizeSearchText(dealerSearch.value) : '';
  const searching = query.length > 0;
  const dealerCards = list.querySelectorAll('.dealer-result-card');
  let visible = 0;

  dealerCards.forEach((card) => {
    const cardSector = card.getAttribute('data-sector') || '';
    const cardItem = card.getAttribute('data-item') || 'all';
    const cardZila = card.getAttribute('data-zila') || 'all';
    const cardUpazila = card.getAttribute('data-upazila') || 'all';
    const cardSearch = card.getAttribute('data-search') || normalizeSearchText(card.textContent);
    const zilaOk = zila === 'all' || cardZila === zila || cardZila === 'all';
    const upazilaOk = upazila === 'all' || cardUpazila === upazila || cardUpazila === 'all';
    const searchOk = !query || cardSearch.includes(query);

    let show;
    if (searching) {
      show = zilaOk && upazilaOk && searchOk;
    } else {
      const sectorOk = sector === 'all' || cardSector === sector;
      const itemOk = item === 'all' || cardItem === item || cardItem === 'all';
      show = sectorOk && itemOk && zilaOk && upazilaOk;
    }

    card.classList.toggle('wf-hidden', !show);
    if (show) visible += 1;
  });

  if (!visible) {
    list.innerHTML = communitySearchPlaceholder('আপনার নির্বাচিত ফিল্টারে কোনো ডিলার পাওয়া যায়নি।');
    if (countEl) countEl.textContent = '';
    return;
  }

  updateDealerResultCount(visible, dealerCards.length);
  applyCommunityShowMore(list, {
    previewCount: 3,
    itemSelector: '.dealer-result-card:not(.wf-hidden)',
    moreLabel: 'আরও ডিলার দেখুন',
    lessLabel: 'কম দেখুন',
  });
}

function updateDealerResultCount(visible, total) {
  const el = document.getElementById('dealerResultCount');
  if (!el) return;
  el.textContent = visible === total
    ? `মোট ${toBnDigits(total)} জন ডিলার`
    : `${toBnDigits(visible)} জন ডিলার দেখানো হচ্ছে (মোট ${toBnDigits(total)})`;
}

function initCommunityDealerFilters() {
  const list = document.getElementById('dealerResultsList');
  if (list) {
    list.innerHTML = communitySearchPlaceholder('লোকেশন নির্বাচন করুন — ডিলার তালিকা আপনাআপনি দেখাবে।');
  }

  const searchBtn = document.getElementById('dealerSearchBtn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => { runDealerSearch(); });
  }

  const dealerSearch = document.getElementById('dealerSearchInput');
  if (dealerSearch) {
    dealerSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runDealerSearch();
      }
    });
  }

  window.addEventListener('folika:locationchange', () => {
    syncDealerSelectsFromLocation();
    runDealerSearch();
  });
  syncDealerSelectsFromLocation();
  runDealerSearch();
}

function unwrapForumPosts(res) {
  if (!res) return [];
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  if (Array.isArray(res)) return res;
  return [];
}

function renderForumPosts(list) {
  const mount = document.getElementById('forumPostsMount');
  if (!mount) return;
  if (!list.length) {
    mount.innerHTML = communitySearchPlaceholder('এখনো কোনো পোস্ট নেই। প্রথম প্রশ্নটি লিখুন।');
    return;
  }
  mount.innerHTML = list.map((p) => {
    const author = (p.author && p.author.name) || 'কৃষক';
    const cat = p.category || 'general';
    return `<div class="card community-result-item" style="margin:0;">
      <span class="badge badge-govt">${escapeHtml(cat)}</span>
      <h3 class="font-bold text-body">${escapeHtml(p.title || '')}</h3>
      <p class="text-body-sm text-secondary">${escapeHtml(p.body || '')}</p>
      <p class="text-caption text-secondary">${escapeHtml(author)} · ▲ ${toBnDigits(p.upvotes || 0)}</p>
      <button type="button" class="btn btn-sm btn-secondary forum-vote-btn" data-post-id="${p.id}">উপকারী</button>
    </div>`;
  }).join('');
  mount.querySelectorAll('.forum-vote-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const api = window.FolikaAPI;
      if (!api || !api.Session.isLoggedIn()) {
        window.location.href = 'login.html';
        return;
      }
      try {
        await api.community.vote(btn.getAttribute('data-post-id'), 'up');
        loadCommunityForum();
      } catch (e) {
        window.alert(e.banglaMessage || 'ভোট দেওয়া যায়নি।');
      }
    });
  });
}

async function loadCommunityForum() {
  const mount = document.getElementById('forumPostsMount');
  const api = window.FolikaAPI;
  if (!mount || !api || !api.community) return;
  try {
    const res = await api.community.posts();
    renderForumPosts(unwrapForumPosts(res));
  } catch (e) {
    mount.innerHTML = communitySearchPlaceholder('ফোরাম এখন লোড হয়নি। পরে চেষ্টা করুন।');
  }
}

function initCommunityForum() {
  const mount = document.getElementById('forumPostsMount');
  if (!mount) return;
  loadCommunityForum();
  const btn = document.getElementById('forumSubmitBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    const api = window.FolikaAPI;
    const status = document.getElementById('forumStatus');
    if (!api || !api.Session.isLoggedIn()) {
      if (status) status.textContent = 'পোস্ট করতে লগইন করুন।';
      window.location.href = 'login.html';
      return;
    }
    const title = (document.getElementById('forumTitle') || {}).value || '';
    const body = (document.getElementById('forumBody') || {}).value || '';
    const category = (document.getElementById('forumCategory') || {}).value || 'general';
    if (!title.trim() || !body.trim()) {
      if (status) status.textContent = 'শিরোনাম ও বিস্তারিত লিখুন।';
      return;
    }
    btn.disabled = true;
    try {
      await api.community.createPost({ category, title: title.trim(), body: body.trim() });
      document.getElementById('forumTitle').value = '';
      document.getElementById('forumBody').value = '';
      if (status) status.textContent = 'পোস্ট প্রকাশিত হয়েছে।';
      loadCommunityForum();
    } catch (e) {
      if (status) status.textContent = e.banglaMessage || 'পোস্ট করা যায়নি।';
    } finally {
      btn.disabled = false;
    }
  });
}

/* --------------------------------------------------------------------------
   8. Mobile Navigation Drawer
   -------------------------------------------------------------------------- */
function initMobileNavigation() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const drawerBackdrop = document.getElementById('mobileDrawerBackdrop');
  const drawerClose = document.getElementById('mobileDrawerClose');

  if (!menuToggle || !drawerBackdrop) return;
  if (menuToggle.dataset.navBound === '1') return;
  menuToggle.dataset.navBound = '1';

  function openDrawer() {
    drawerBackdrop.classList.add('is-open');
    menuToggle.setAttribute('aria-expanded', 'true');
    drawerBackdrop.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (drawerClose) drawerClose.focus();
  }

  function closeDrawer() {
    drawerBackdrop.classList.remove('is-open');
    menuToggle.setAttribute('aria-expanded', 'false');
    drawerBackdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    menuToggle.focus();
  }

  menuToggle.addEventListener('click', () => {
    const isOpen = drawerBackdrop.classList.contains('is-open');
    if (isOpen) closeDrawer();
    else openDrawer();
  });

  if (drawerClose) {
    drawerClose.addEventListener('click', closeDrawer);
  }

  drawerBackdrop.addEventListener('click', (e) => {
    if (e.target === drawerBackdrop) {
      closeDrawer();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawerBackdrop.classList.contains('is-open')) {
      closeDrawer();
    }
  });

  drawerBackdrop.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', () => closeDrawer());
  });
}

/* --------------------------------------------------------------------------
   9. Modals (Accessibility Focus Trap & Dialogs)
   -------------------------------------------------------------------------- */
function initModals() {
  const modalTriggers = document.querySelectorAll('[data-modal-target]');
  const modalCloseButtons = document.querySelectorAll('[data-modal-close]');
  let lastActiveElement = null;

  modalTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = trigger.getAttribute('data-modal-target');
      const modal = document.querySelector(targetId);
      if (modal) {
        lastActiveElement = document.activeElement;
        openModal(modal);
      }
    });
  });

  modalCloseButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const modal = btn.closest('.modal-backdrop');
      if (modal) closeModal(modal);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModalEl = document.querySelector('.modal-backdrop.is-open');
      if (openModalEl) closeModal(openModalEl);
    }
  });

  function openModal(modal) {
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const focusable = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusable.length > 0) {
      setTimeout(() => focusable[0].focus(), 50);
    }
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lastActiveElement) {
      lastActiveElement.focus();
    }
  }

  window.openModalById = function (id) {
    const modal = document.getElementById(id);
    if (modal) openModal(modal);
  };
  window.closeModalById = function (id) {
    const modal = document.getElementById(id);
    if (modal) closeModal(modal);
  };
}

function renderProfileRemindersFromStorage() {
  const ul = document.getElementById('profileRemindersList');
  if (!ul) return;
  if (window.FolikaFishPlan && typeof window.FolikaFishPlan.renderProfileReminders === 'function') {
    window.FolikaFishPlan.loadReminders();
    window.FolikaFishPlan.renderProfileReminders();
    return;
  }
  let list = [];
  try {
    list = JSON.parse(localStorage.getItem('folika_reminders') || '[]');
  } catch (e) {
    list = [];
  }
  const badge = document.getElementById('profileRemindersBadge');
  const labels = {
    lime: 'পুকুরে চুন ও জিওলাইট প্রয়োগ',
    feed: 'খাদ্যের নমুনা ও মাছের বৃদ্ধি পরীক্ষা (জাল টানা)',
    water: 'পুকুরের ৩০% পানি বদলানো',
  };
  if (badge) badge.textContent = list.length ? `${list.length}টি কাজ` : 'খালি';
  if (!list.length) {
    ul.innerHTML = '<li>এখনও কোনো রিমাইন্ডার সংরক্ষিত নেই। মাছ পেজ থেকে যোগ করুন।</li>';
    return;
  }
  ul.innerHTML = list.map((r) => {
    const name = r.domain === 'fish' ? (labels[r.task] || r.task) : (r.label || r.task);
    return `<li>${name} — ${r.date || ''}</li>`;
  }).join('');
}

/* --------------------------------------------------------------------------
   11. Backend Bridge — connects the static UI to the Laravel API.
   Progressive enhancement: if the API/token is unavailable, the page keeps
   showing its built-in demo data (no broken UI for offline farmers).
   -------------------------------------------------------------------------- */
function initBackendBridge() {
  if (typeof window.FolikaAPI === 'undefined') return; // api.js not loaded
  const api = window.FolikaAPI;
  const cfg = window.FOLIKA_CONFIG || {};

  // Reflect login state on the page (e.g. show/hide auth-only controls).
  const loggedIn = api.Session.isLoggedIn();
  document.documentElement.setAttribute('data-auth', loggedIn ? 'in' : 'out');

  // Resolve correct relative path to the login page from any page depth.
  const inPagesDir = /\/pages\//.test(window.location.pathname);
  const loginHref = inPagesDir ? 'login.html' : 'pages/login.html';

  // Logged-out: turn the header user widget into a "Login" entry point.
  if (!loggedIn) {
    document.querySelectorAll('.header-user-widget').forEach((widget) => {
      widget.setAttribute('href', loginHref);
      widget.setAttribute('aria-label', 'লগইন করুন');
      const nameEl = widget.querySelector('.header-user-name');
      if (nameEl) nameEl.textContent = 'লগইন করুন';
      widget.querySelectorAll('.header-user-loc').forEach((el) => el.remove());
    });
  }

  // Wire any logout triggers ([data-folika-logout]).
  document.querySelectorAll('[data-folika-logout]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      await api.auth.logout();
      window.location.href = inPagesDir ? '../index.html' : 'index.html';
    });
  });

  const banglaDigits = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
  const toBn = (n) => String(n).replace(/\d/g, (d) => banglaDigits[d]);

  // 1. If we have a session, personalise the greeting + header from profile.
  if (api.Session.isLoggedIn()) {
    const cachedUser = api.Session.getUser();
    if (cachedUser) {
      if (cachedUser.mobile === '01711111111') cachedUser.name = 'Rohim mia';
      if (cachedUser.name) {
        api.Session.setUser(cachedUser);
        applyUserIdentity(cachedUser);
      }
    }

    api.user.profile()
      .then((res) => {
        const u = (res && res.data) ? res.data : res;
        if (u) {
          if (u.mobile === '01711111111' && u.name !== 'Rohim mia') u.name = 'Rohim mia';
          api.Session.setUser(u);
          applyUserIdentity(u);
        }
      })
      .catch(() => { /* keep demo identity */ });

    // 2. Weather is handled by FolikaLocation (js/location.js)
  }

  function applyUserIdentity(u) {
    const name = u.name || 'Rohim mia';
    document.querySelectorAll('.header-user-name').forEach((el) => (el.textContent = name));
    document.querySelectorAll('.greeting-avatar, .header-user-avatar').forEach((el) => {
      el.textContent = name.trim().charAt(0) || 'ফ';
    });
    window.FOLIKA_USER_NAME = name;
  }

  function applyLiveWeather(w, toBnFn) {
    const tempVal = document.getElementById('weatherTempVal');
    const tempDesc = document.getElementById('weatherDescVal');
    const advice = document.getElementById('weatherAdviceText');
    if (tempVal && typeof w.temperature !== 'undefined') {
      tempVal.textContent = toBnFn(Math.round(w.temperature)) + '° সে.';
    }
    if (tempDesc) {
      const cond = w.condition_bn || 'আবহাওয়া';
      const hum = typeof w.humidity !== 'undefined' ? ' • আর্দ্রতা ' + toBnFn(w.humidity) + '%' : '';
      tempDesc.textContent = cond + hum;
    }
    if (advice && w.stale && w.stale_text) {
      advice.innerHTML = '<strong>দ্রষ্টব্য:</strong> ' + w.stale_text;
    }
  }
}

/* --------------------------------------------------------------------------
   10. Disease AI Image Upload Simulation
   -------------------------------------------------------------------------- */
function initDiseaseAI() {
  const dropzone = document.getElementById('diseaseDropzone');
  const fileInput = document.getElementById('diseaseFileInput');
  const previewBox = document.getElementById('dropzonePreview');
  const analyzeBtn = document.getElementById('analyzeButton');
  const loadingBox = document.getElementById('diagnosisLoading');
  const resultBox = document.getElementById('diagnosisResult');

  if (!dropzone || !fileInput) return;

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files.length > 0) {
      fileInput.files = e.dataTransfer.files;
      handleFile(fileInput.files[0]);
    }
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length > 0) {
      handleFile(fileInput.files[0]);
    }
  });

  function handleFile(file) {
    const maxMb = 10;
    const okTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!okTypes.includes(file.type)) {
      if (previewBox) {
        previewBox.style.display = 'block';
        previewBox.innerHTML = '<div class="alert alert-error" style="margin-top:16px;">শুধু JPG বা PNG ছবি দিন।</div>';
      }
      if (analyzeBtn) analyzeBtn.disabled = true;
      return;
    }
    if (file.size > maxMb * 1024 * 1024) {
      if (previewBox) {
        previewBox.style.display = 'block';
        previewBox.innerHTML = '<div class="alert alert-error" style="margin-top:16px;">ছবি ' + maxMb + ' MB এর বেশি হতে পারবে না।</div>';
      }
      if (analyzeBtn) analyzeBtn.disabled = true;
      return;
    }
    const url = URL.createObjectURL(file);
    if (previewBox) {
      previewBox.style.display = 'block';
      previewBox.innerHTML = `
        <div style="margin-top:16px;text-align:center;">
          <img src="${url}" alt="নির্বাচিত ছবির প্রিভিউ" style="max-width:100%;max-height:200px;border-radius:8px;" loading="lazy">
          <p class="text-caption" style="margin-top:8px;">${file.name} (${Math.round(file.size / 1024)} KB)</p>
        </div>`;
    }
    if (analyzeBtn) analyzeBtn.disabled = false;
  }

  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', async () => {
      const file = fileInput.files && fileInput.files[0];
      if (!file) return;

      const api = window.FolikaAPI;
      if (!api || !api.Session.isLoggedIn()) {
        if (previewBox) {
          previewBox.innerHTML += '<div class="alert alert-warning" style="margin-top:12px;">রোগ নির্ণয়ের জন্য <a href="login.html">লগইন</a> করুন।</div>';
        }
        return;
      }

      if (loadingBox) loadingBox.style.display = 'block';
      if (resultBox) resultBox.style.display = 'none';
      const demoBanner = document.getElementById('diseaseDemoBanner');
      if (demoBanner) demoBanner.style.display = 'none';
      analyzeBtn.disabled = true;

      const categoryEl = document.getElementById('diseaseCategory');
      const category = (categoryEl && categoryEl.value) || 'crop';

      try {
        const fd = new FormData();
        fd.append('image', file);
        fd.append('category', category);
        const res = await api.disease.analyze(fd);
        const d = (res && res.data) ? res.data : res;
        const ai = (d && d.ai_result) ? d.ai_result : d;

        if (loadingBox) loadingBox.style.display = 'none';
        if (resultBox && d) {
          renderDiseaseResult(d, ai);
          resultBox.style.display = 'block';
          resultBox.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (e) {
        if (loadingBox) loadingBox.style.display = 'none';
        if (previewBox) {
          previewBox.innerHTML += '<div class="alert alert-error" style="margin-top:8px;">' + (e.banglaMessage || 'বিশ্লেষণ করা যায়নি। আবার চেষ্টা করুন।') + '</div>';
        }
      } finally {
        analyzeBtn.disabled = false;
      }
    });
  }

  function renderDiseaseResult(d, ai) {
    if (!resultBox) return;
    const nameEl = resultBox.querySelector('.diagnosis-name');
    const confEl = resultBox.querySelector('.diagnosis-confidence');
    const sevEl = document.getElementById('diagnosisSeverity');
    const cropEl = document.getElementById('diagnosisCropName');
    const descEl = document.getElementById('diagnosisDescription');
    const listEl = document.getElementById('diagnosisTreatmentList');

    const severityMap = { low: 'কম', medium: 'মাঝারি', high: 'উচ্চ', critical: 'অতি গুরুতর' };
    const sev = (d.severity || (ai && ai.severity) || 'medium');

    if (nameEl) nameEl.textContent = d.disease_name || (ai && ai.disease_name) || '—';
    if (confEl && d.confidence_pct != null) {
      confEl.textContent = 'নির্ভরযোগ্যতা: ' + Math.round(d.confidence_pct) + '%';
    }
    if (sevEl) sevEl.textContent = 'তীব্রতা: ' + (severityMap[sev] || sev);

    const cropName = (ai && ai.crop_name) || '';
    if (cropEl) {
      cropEl.textContent = cropName ? ('শনাক্ত: ' + cropName) : '';
      cropEl.style.display = cropName ? '' : 'none';
    }

    const desc = (ai && ai.description_bn) || d.treatment_notes || '';
    if (descEl) descEl.innerHTML = '<strong>বর্ণনা:</strong> ' + desc;

    const items = [];
    if (d.treatment_notes || (ai && ai.treatment_notes)) {
      items.push('<li><strong>তাৎক্ষণিক পদক্ষেপ:</strong> ' + (d.treatment_notes || ai.treatment_notes) + '</li>');
    }
    if (ai && ai.organic_treatment) {
      items.push('<li><strong>জৈব চিকিৎসা:</strong> ' + ai.organic_treatment + '</li>');
    }
    if (ai && ai.chemical_treatment) {
      items.push('<li><strong>ঔষধ/রাসায়নিক:</strong> ' + ai.chemical_treatment + '</li>');
    }
    if (listEl) listEl.innerHTML = items.length ? items.join('') : '<li>পরামর্শ পাওয়া যায়নি।</li>';
    loadNearbyDiseaseCenters();
  }
}

function loadNearbyDiseaseCenters() {
  const mount = document.getElementById('diseaseNearbyMount');
  const api = window.FolikaAPI;
  if (!mount || !api || !api.disease || !api.disease.nearbyCenters) return;
  const loc = window.FolikaLocation && window.FolikaLocation.state;
  const query = {};
  if (loc && loc.upazilaNameBn) query.upazila = loc.upazilaNameBn;
  if (loc && loc.districtNameBn) query.district = loc.districtNameBn;
  api.disease.nearbyCenters(query).then((res) => {
    const list = (res && Array.isArray(res.data)) ? res.data : [];
    if (!list.length) return;
    mount.innerHTML = list.map((c) => `
      <p style="margin: 6px 0 0;">
        <strong>${escapeHtml(c.name || '')}</strong> — ${escapeHtml(c.address || '')}
        ${c.hotline ? ` · <a href="tel:${escapeHtml(c.hotline)}">${escapeHtml(c.hotline)}</a>` : ''}
      </p>`).join('');
  }).catch(() => {});
}
