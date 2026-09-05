/**
 * FOLIKA — Central navigation (sub-nav, drawer, bottom-nav)
 */
(function (global) {
  'use strict';

  const SUB_NAV = [
    { key: 'home', file: 'index.html', bn: 'হোম', en: 'Home' },
    { key: 'crop', file: 'crop.html', bn: 'ফসল', en: 'Crop' },
    { key: 'fish', file: 'fish.html', bn: 'মৎস্য', en: 'Fish' },
    { key: 'livestock', file: 'livestock.html', bn: 'প্রাণিসম্পদ', en: 'Livestock' },
    { key: 'disease', file: 'disease.html', bn: 'রোগ নির্ণয়', en: 'Disease' },
    { key: 'community', file: 'community.html', bn: 'কমিউনিটি', en: 'Community' },
    { key: 'govt', file: 'govt.html', bn: 'সরকারি সেবা', en: 'Govt' },
  ];

  const DRAWER_LINKS = [
    { key: 'home', file: 'index.html', bn: 'হোম', en: 'Home' },
    { key: 'crop', file: 'crop.html', bn: 'ফসল পরিকল্পনা', en: 'Crop planning' },
    { key: 'fish', file: 'fish.html', bn: 'মৎস্যচাষ', en: 'Fish farming' },
    { key: 'livestock', file: 'livestock.html', bn: 'প্রাণিসম্পদ', en: 'Livestock' },
    { key: 'disease', file: 'disease.html', bn: 'রোগ নির্ণয়', en: 'Disease detection' },
    { key: 'community', file: 'community.html', bn: 'কমিউনিটি', en: 'Community' },
    { key: 'govt', file: 'govt.html', bn: 'সরকারি সেবা', en: 'Govt services' },
    { key: 'profile', file: 'profile.html', bn: 'প্রোফাইল', en: 'Profile' },
    { key: 'more', file: 'more.html', bn: 'আরও অপশন', en: 'More options' },
  ];

  const BOTTOM_NAV = [
    { key: 'home', file: 'index.html', bn: 'হোম', en: 'Home', icon: 'home' },
    { key: 'crop', file: 'crop.html', bn: 'ফসল', en: 'Crop', icon: 'crop' },
    { key: 'fish', file: 'fish.html', bn: 'মৎস্য', en: 'Fish', icon: 'fish' },
    { key: 'livestock', file: 'livestock.html', bn: 'প্রাণিসম্পদ', en: 'Livestock', icon: 'livestock' },
    { key: 'community', file: 'community.html', bn: 'কমিউনিটি', en: 'Community', icon: 'community' },
  ];

  const ICONS = {
    home: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>',
    crop: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>',
    fish: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-2 1m2-1l-2-1m2 1v2.5M14 4l-2-1-2 1M4 7l2-1M4 7l2 1M4 7v2.5M12 21l-2-1m2 1l2-1m-2 1v-2.5M6 18l-2-1v-2.5M18 18l2-1v-2.5"/>',
    livestock: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/>',
    community: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>',
    profile: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>',
  };

  function inPagesDir() {
    return /\/pages\//.test(location.pathname)
      || document.querySelector('link[href*="../css/"]') !== null
      || document.querySelector('script[src*="../js/"]') !== null;
  }

  function pageHref(file) {
    if (file === 'index.html') return inPagesDir() ? '../index.html' : 'index.html';
    return inPagesDir() ? file : 'pages/' + file;
  }

  function lang() {
    return (global.FolikaI18n && global.FolikaI18n.getLang()) || 'bn';
  }

  function label(item) {
    return lang() === 'en' ? item.en : item.bn;
  }

  function currentKey() {
    const file = (location.pathname.split('/').pop() || 'index.html').split('?')[0];
    if (file === 'index.html' || file === '') return 'home';
    if (file === 'login.html') return 'login';
    if (file.startsWith('profile')) return 'profile';
    if (file === 'more.html' || file === 'settings.html') return 'more';
    return file.replace('.html', '');
  }

  function renderSubNav(activeKey) {
    const wrap = document.querySelector('.sub-nav-bar .nav-pills-wrap');
    if (!wrap) return;
    wrap.innerHTML = SUB_NAV.map((item) => {
      const active = item.key === activeKey;
      const cls = 'nav-pill-btn' + (active ? ' active' : '');
      const aria = active ? ' aria-current="page"' : '';
      return `<a href="${pageHref(item.file)}" class="${cls}"${aria}>${label(item)}</a>`;
    }).join('');
  }

  function renderDrawer(activeKey) {
    const wrap = document.querySelector('.mobile-drawer-links');
    if (!wrap) return;
    wrap.innerHTML = DRAWER_LINKS.map((item) => {
      const active = item.key === activeKey;
      const cls = 'mobile-nav-link' + (active ? ' active' : '');
      return `<a href="${pageHref(item.file)}" class="${cls}">${label(item)}</a>`;
    }).join('');
  }

  function renderBottomNav(activeKey, variant) {
    let nav = document.querySelector('.bottom-nav');
    const items = variant === 'profile'
      ? BOTTOM_NAV.slice(0, 4).concat([{ key: 'profile', file: 'profile.html', bn: 'প্রোফাইল', en: 'Profile', icon: 'profile' }])
      : BOTTOM_NAV;

    if (!nav) {
      if (document.body.getAttribute('data-profile-page') && !document.querySelector('.bottom-nav')) {
        nav = document.createElement('nav');
        nav.className = 'bottom-nav';
        nav.setAttribute('aria-label', 'মোবাইল দ্রুত নেভিগেশন');
        document.body.appendChild(nav);
      } else {
        return;
      }
    }

    nav.innerHTML = items.map((item) => {
      const active = item.key === activeKey;
      const cls = 'tab-link' + (active ? ' active' : '');
      const aria = active ? ' aria-current="page"' : '';
      const icon = ICONS[item.icon] || ICONS.home;
      return `<a href="${pageHref(item.file)}" class="${cls}"${aria}><svg fill="none" viewBox="0 0 24 24" aria-hidden="true">${icon}</svg><span>${label(item)}</span></a>`;
    }).join('');
  }

  function ensureDrawerMarkup() {
    if (document.getElementById('mobileDrawerBackdrop') || document.body.getAttribute('data-no-drawer') === 'true') return;
    const prefix = inPagesDir() ? '' : 'pages/';
    const logo = inPagesDir() ? '../assets/images/folika-logo.jpg' : 'assets/images/folika-logo.jpg';
    const html = `
<div id="mobileDrawerBackdrop" class="mobile-drawer-backdrop" aria-hidden="true">
  <div class="mobile-drawer" role="dialog" aria-modal="true" aria-label="মোবাইল নেভিগেশন">
    <div class="mobile-drawer-header">
      <div class="flex items-center gap-8">
        <img src="${logo}" alt="" style="height: 48px;">
        <span class="font-bold text-white">ফলিকা মেনু</span>
      </div>
      <button id="mobileDrawerClose" class="btn-icon-only text-white" aria-label="মেনু বন্ধ করুন">বন্ধ</button>
    </div>
    <div class="mobile-drawer-links"></div>
  </div>
</div>`;
    const header = document.querySelector('.site-header');
    if (header) header.insertAdjacentHTML('afterend', html);
  }

  function ensureProfileSiteHeader() {
    if (!document.body.getAttribute('data-profile-page')) return;
    const logo = '../assets/images/folika-logo.jpg';
    if (!document.querySelector('.site-header')) {
      document.body.insertAdjacentHTML('afterbegin', `
<header class="site-header" role="banner">
  <div class="nav-container">
    <button id="mobileMenuToggle" class="menu-toggle-btn" aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="mobileDrawerBackdrop">
      <span class="menu-bar" aria-hidden="true"></span>
      <span class="menu-bar" aria-hidden="true"></span>
      <span class="menu-bar" aria-hidden="true"></span>
    </button>
    <a href="../index.html" class="brand-link" aria-label="ফলিকা হোম">
      <img src="${logo}" alt="" class="brand-logo">
      <div class="brand-text-wrap">
        <span class="brand-title" data-i18n="brand_title">ফলিকা</span>
        <span class="brand-tagline" data-i18n="brand_tagline">কৃষকের ডিজিটাল সঙ্গী</span>
      </div>
    </a>
    <div class="header-actions">
      <a href="profile.html" class="header-user-widget" aria-label="ইউজার প্রোফাইল">
        <div class="header-user-info">
          <span class="header-user-name">Rohim mia</span>
        </div>
        <div class="header-user-avatar" aria-hidden="true">ফ</div>
      </a>
    </div>
  </div>
</header>
<nav class="sub-nav-bar" aria-label="প্রধান মেনু"><div class="container"><div class="nav-pills-wrap"></div></div></nav>`);
    }
    ensureProfileSubHeader();
    ensureProfileSubNav();
    ensureDrawerMarkup();
  }

  function ensureProfileSubHeader() {
    if (!document.body.getAttribute('data-profile-page')) return;
    const header = document.querySelector('.site-header .nav-container');
    if (!header || header.querySelector('#mobileMenuToggle')) return;
    const logo = '../assets/images/folika-logo.jpg';
    header.innerHTML = `
      <button id="mobileMenuToggle" class="menu-toggle-btn" aria-label="মেনু খুলুন" aria-expanded="false" aria-controls="mobileDrawerBackdrop">
        <span class="menu-bar" aria-hidden="true"></span>
        <span class="menu-bar" aria-hidden="true"></span>
        <span class="menu-bar" aria-hidden="true"></span>
      </button>
      <a href="../index.html" class="brand-link" aria-label="ফলিকা হোম">
        <img src="${logo}" alt="" class="brand-logo">
        <div class="brand-text-wrap">
          <span class="brand-title">ফলিকা</span>
          <span class="brand-tagline">কৃষকের ডিজিটাল সঙ্গী</span>
        </div>
      </a>
      <div class="header-actions">
        <a href="profile.html" class="header-user-widget" aria-label="ইউজার প্রোফাইল">
          <div class="header-user-info">
            <span class="header-user-name">Rohim mia</span>
          </div>
          <div class="header-user-avatar" aria-hidden="true">ফ</div>
        </a>
      </div>`;
  }

  function ensureProfileSubNav() {
    if (!document.body.getAttribute('data-profile-page')) return;
    if (document.querySelector('.sub-nav-bar')) return;
    const header = document.querySelector('.site-header');
    if (!header) return;
    header.insertAdjacentHTML('afterend', '<nav class="sub-nav-bar" aria-label="প্রধান মেনু"><div class="container"><div class="nav-pills-wrap"></div></div></nav>');
  }

  function init() {
    const key = currentKey();
    ensureProfileSiteHeader();
    ensureProfileSubHeader();
    ensureProfileSubNav();
    ensureDrawerMarkup();
    renderSubNav(key);
    renderDrawer(key);
    const bottomVariant = (key === 'profile' || document.body.getAttribute('data-profile-page')) ? 'profile' : 'default';
    renderBottomNav(key, bottomVariant);
  }

  global.FolikaNav = { init, pageHref, currentKey };
})(window);
