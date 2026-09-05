/**
 * FOLIKA — Restore Bengali/English page copy when HTML encoding was corrupted.
 */
(function (global) {
  'use strict';

  function lang() {
    return (global.FolikaI18n && global.FolikaI18n.getLang()) || 'bn';
  }

  function L(bn, en) {
    return lang() === 'en' ? en : bn;
  }

  function $(sel) {
    return document.querySelector(sel);
  }

  function setText(sel, bn, en) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (el) el.textContent = L(bn, en);
  }

  function setHtml(sel, bn, en) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (el) el.innerHTML = L(bn, en);
  }

  function setAttr(sel, attr, bn, en) {
    const el = typeof sel === 'string' ? $(sel) : sel;
    if (el) el.setAttribute(attr, L(bn, en));
  }

  function setLabel(forId, bn, en) {
    setText(`label[for="${forId}"]`, bn, en);
  }

  function fixCommonShell() {
    document.querySelectorAll('.skip-link').forEach((el) => {
      if (!el.hasAttribute('data-i18n')) {
        setText(el, 'মূল বিষয়বস্তুতে যান', 'Skip to main content');
      }
    });
    setAttr('#mobileMenuToggle', 'aria-label', 'মেনু খুলুন', 'Open menu');
    setAttr('#mobileDrawerClose', 'aria-label', 'মেনু বন্ধ করুন', 'Close menu');
    setText('#mobileDrawerClose', 'বন্ধ', 'Close');
    const drawerTitle = document.querySelector('.mobile-drawer-header .font-bold');
    if (drawerTitle && /FOLIKA|\?/.test(drawerTitle.textContent)) {
      setText(drawerTitle, 'ফলিকা মেনু', 'Folika menu');
    }
    setAttr('.sub-nav-bar', 'aria-label', 'প্রধান মেনু', 'Main menu');
    setAttr('.bottom-nav', 'aria-label', 'মোবাইল দ্রুত নেভিগেশন', 'Mobile quick navigation');
    document.querySelectorAll('.site-footer .footer-bottom p').forEach((el) => {
      if (/\?|/.test(el.textContent)) {
        setHtml(el, '© ২০২৬ ফলিকা • <span data-i18n="footer_rights">সর্বস্বত্ব সংরক্ষিত</span>', '© 2026 Folika • All rights reserved');
      }
    });
  }

  function fixLogin() {
    if (!document.getElementById('loginMain')) return;
    document.title = L('লগইন — ফলিকা', 'Login — Folika');
    setText('h1.text-h2', 'কৃষক পরিচয় যাচাই', 'Farmer identity verification');
    setLabel('mobileInput', 'মোবাইল নম্বর', 'Mobile number');
    setAttr('#mobileInput', 'placeholder', '01XXXXXXXXX', '01XXXXXXXXX');
    setText('#mobileHelp', '১১ সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন। ডেমো: ০১৭১১১১১১১১১', 'Enter 11-digit Bangladesh mobile. Demo: 01711111111');
    setText('#sendOtpBtn', 'কোড পাঠান', 'Send code');
    setLabel('otpInput', 'এসএমএসে আসা ৬ অঙ্কের কোড', '6-digit SMS code');
    setAttr('#otpInput', 'placeholder', '৬ অঙ্কের কোড', '6-digit code');
    setText('#verifyOtpBtn', 'যাচাই করে প্রবেশ করুন', 'Verify and sign in');
    setText('#resendOtpBtn', 'আবার কোড পাঠান', 'Resend code');
    setText('#changeMobileBtn', 'নম্বর বদলান', 'Change number');
    setText('a[href="../index.html"].btn-secondary', 'হোমে ফিরে যান', 'Back to home');
  }

  function fixDisease() {
    if (!document.getElementById('diseaseMain')) return;
    document.title = L('রোগ নির্ণয় — ফলিকা', 'Disease detection — Folika');
    setText('.page-hero .badge, .section .badge-disease', 'এআই রোগ নির্ণয়', 'AI disease detection');
    setText('#diseaseMain .text-h1', 'ছবি তুলে ফসলের রোগ শনাক্ত করুন', 'Detect crop disease from a photo');
    setText('#diseaseMain .text-body-lg', 'মোবাইল ক্যামেরা বা গ্যালারি থেকে পাতার ছবি আপলোড করুন', 'Upload a leaf photo from camera or gallery');
    setAttr('#diseaseDropzone', 'aria-label', 'ছবি আপলোড করতে এখানে ট্যাপ করুন বা ফাইল বাছাই করুন', 'Tap to upload or choose a photo');
    setText('#diseaseDropzone .text-h3', 'এখানে ছবি টেনে আনুন বা ক্যামেরা খুলুন', 'Drag a photo here or open camera');
    setText('#diseaseDropzone .text-body-sm', 'স্পষ্ট, আলোযুক্ত ছবি দিন — JPG/PNG (সর্বোচ্চ ১০ MB)', 'Use a clear, well-lit JPG/PNG (max 10 MB)');
    setText('#diseaseDropzone .btn', 'গ্যালারি / ক্যামেরা খুলুন', 'Open gallery / camera');
    setText('#analyzeButton', 'এআই দিয়ে রোগ বিশ্লেষণ করুন', 'Analyze with AI');
    setText('#diagnosisLoading p', 'ছবি যাচাই হচ্ছে ও রোগ শনাক্ত করা হচ্ছে...', 'Checking image and detecting disease...');
    setHtml('#diseaseDemoBanner .alert-content',
      '<strong>ডেমো ফলাফল:</strong> লগইন ছাড়াই নমুনা রোগের তথ্য দেখানো হয়েছে।',
      '<strong>Demo result:</strong> Sample disease info shown without login.');
    setText('#diagnosisResult .section-title', 'রোগ শনাক্তকরণ ফলাফল', 'Detection result');
    const diseaseTitle = document.querySelector('#diagnosisResult .card-domain-disease .card-title');
    const confBadge = document.querySelector('#diagnosisResult .badge-expert');
    if (diseaseTitle) diseaseTitle.classList.add('diagnosis-name');
    if (confBadge) confBadge.classList.add('diagnosis-confidence');
    setText('#diagnosisResult .card-domain-govt .card-title, #diagnosisResult .card .card-title.text-info',
      'কাছের কৃষি অফিস থেকে পরামর্শ নিন', 'Consult your nearest ag office');
    setText('a[href="tel:16123"]', 'কল করুন — ১৬১২৩', 'Call — 16123');
    setText('a[href="community.html"].btn-secondary', 'কমিউনিটিতে ডিলার খুঁজুন', 'Find dealers in community');
  }

  function fixFish() {
    if (!document.getElementById('fishPlanRoot')) return;
    document.title = L('মৎস্য পরিকল্পনা — ফলিকা', 'Fish plan — Folika');
    setLabel('fishPondLength', 'পুকুরের দৈর্ঘ্য (ফুট):', 'Pond length (ft):');
    setAttr('#fishPondLength', 'placeholder', 'ফুট', 'ft');
    setLabel('fishPondWidth', 'পুকুরের প্রস্থ (ফুট):', 'Pond width (ft):');
    setAttr('#fishPondWidth', 'placeholder', 'ফুট', 'ft');
    setLabel('fishPondDepth', 'গড় গভীরতা (ফুট):', 'Average depth (ft):');
    setAttr('#fishPondDepth', 'placeholder', 'যেমন ৬', 'e.g. 6');
    setText('#btnFishCalcLayers', 'স্তর হিসাব', 'Calculate layers');
    setText('#fishDepthHint', 'গভীরতা দিয়ে «স্তর হিসাব» চাপলে উপযুক্ত মাছের স্তর সাজানো হবে', 'Enter depth and tap calculate to rank fish layers');
    setLabel('fishCultureDuration', 'চাষের মেয়াদ:', 'Culture duration:');
    const dur = document.getElementById('fishCultureDuration');
    if (dur && dur.options.length >= 3) {
      dur.options[0].text = L('১ বছর (পূর্ণ চক্র)', '1 year (full cycle)');
      dur.options[1].text = L('৬ মাস (এক্সটেন্সিভ)', '6 months (extensive)');
      dur.options[2].text = L('মাল্টি-স্পিশিজ পলিকালচার', 'Multi-species polyculture');
    }
    setText('#fishPrepBadge', 'পুকুর প্রস্তুতি সুপারিশ', 'Pond prep recommendations');
  }

  function fixProfile() {
    if (!document.getElementById('profileMain')) return;
    document.title = L('আমার প্রোফাইল — ফলিকা', 'My profile — Folika');
    setText('#btnEditIdentity', 'সম্পাদনা', 'Edit');
    setLabel('editName', 'আপনার নাম', 'Your name');
    setText('#btnSaveIdentity', 'সংরক্ষণ', 'Save');
    setText('#btnCancelIdentity', 'বাতিল', 'Cancel');
    setText('#profileVerifiedBadge', 'যাচাইকৃত', 'Verified');
    setText('#profileNudgeText', 'নাম যোগ করলে প্রোফাইল সম্পূর্ণ হবে', 'Add your name to complete profile');
    setText('#btnNudgeAction', 'এখনই করুন', 'Do it now');
    setText('.card-domain-crop .card-title', 'ফসল পরিকল্পনা', 'Crop plans');
    setText('.card-domain-fish .card-title', 'মৎস্য পরিকল্পনা', 'Fish plans');
    setText('.card-domain-livestock .card-title', 'প্রাণিসম্পদ পরিকল্পনা', 'Livestock plans');
    document.querySelectorAll('a[href="profile-crops.html"], a[href="profile-fish.html"], a[href="profile-livestock.html"]').forEach((a) => {
      setText(a, 'সব দেখুন', 'View all');
    });
    setText('#profileLedger > .text-h3', 'আর্থিক সারাংশ', 'Financial summary');
    document.querySelectorAll('#profileLedger .grid > .card .text-caption').forEach((el, i) => {
      const labels = [
        ['মোট খরচ', 'Total cost'],
        ['মোট আয়', 'Total revenue'],
        ['নিট লাভ', 'Net profit'],
      ];
      if (labels[i]) setText(el, labels[i][0], labels[i][1]);
    });
    const diagH2 = document.querySelector('#profileMain section[aria-label] h2');
    if (diagH2 && /diagnosis|নির্ণয়|\?/.test(diagH2.textContent + (diagH2.parentElement && diagH2.parentElement.getAttribute('aria-label') || ''))) {
      setText(diagH2, 'সাম্প্রতিক রোগ নির্ণয়', 'Recent diagnoses');
    }
    document.querySelectorAll('a[href="profile-diagnoses.html"]').forEach((a) => setText(a, 'সব দেখুন', 'View all'));
    const notifySection = document.getElementById('notifyPushToggle')?.closest('section');
    if (notifySection) {
      const h2 = notifySection.querySelector('h2');
      if (h2) setText(h2, 'নোটিফিকেশন', 'Notifications');
    }
    const notifyLabel = document.querySelector('#notifyPushToggle')?.parentElement?.querySelector('span');
    if (notifyLabel) setText(notifyLabel, 'পুশ নোটিফিকেশন', 'Push notifications');
    setAttr('#notifyPushToggle', 'aria-label', 'পুশ নোটিফিকেশন চালু বা বন্ধ', 'Toggle push notifications');
    document.querySelectorAll('a[href="profile-notifications.html"]').forEach((a) => setText(a, 'সব নোটিফিকেশন', 'All notifications'));
    setText('.profile-security .text-h3', 'অ্যাকাউন্ট', 'Account');
    setText('a[href="settings.html"]', 'সেটিংস ও ভাষা', 'Settings & language');
    setText('#btnLogout', 'এই ডিভাইস থেকে লগআউট', 'Log out on this device');
    setText('#btnLogoutAll', 'সব ডিভাইস থেকে লগআউট', 'Log out everywhere');
    setText('#btnDeleteAccount', 'অ্যাকাউন্ট মুছুন', 'Delete account');
  }

  function fixProfileSubPages() {
    const page = (location.pathname.split('/').pop() || '').split('?')[0];
    const map = {
      'profile-crops.html': ['ফসল পরিকল্পনা', 'Crop plans'],
      'profile-crop-detail.html': ['ফসল বিস্তারিত', 'Crop detail'],
      'profile-fish.html': ['মৎস্য পরিকল্পনা', 'Fish plans'],
      'profile-fish-detail.html': ['মৎস্য বিস্তারিত', 'Fish detail'],
      'profile-livestock.html': ['প্রাণিসম্পদ পরিকল্পনা', 'Livestock plans'],
      'profile-livestock-detail.html': ['প্রাণিসম্পদ বিস্তারিত', 'Livestock detail'],
      'profile-diagnoses.html': ['রোগ নির্ণয় ইতিহাস', 'Diagnosis history'],
      'profile-diagnosis-detail.html': ['রোগ নির্ণয় বিস্তারিত', 'Diagnosis detail'],
      'profile-notifications.html': ['নোটিফিকেশন', 'Notifications'],
    };
    const labels = map[page];
    if (!labels) return;
    document.title = labels[0] + ' — FOLIKA';
    setText('h1.text-h2', labels[0], labels[1]);
    document.querySelectorAll('.profile-detail-back a, a[href="profile.html"]').forEach((a) => {
      if (a.classList.contains('btn')) setText(a, '← প্রোফাইল', '← Profile');
    });
  }

  function fixSettings() {
    if (!document.getElementById('settingsMain')) return;
    document.title = L('সেটিংস — ফলিকা', 'Settings — Folika');
    setText('#settingsMain .text-body.text-secondary', 'ভাষা, থিম, নোটিফিকেশন, অফলাইন সিঙ্ক ও অ্যাক্সেসিবিলিটি', 'Language, theme, notifications, offline sync & accessibility');
    setText('section[aria-label*="ভাষা"] h2, section[aria-label*="????"] h2', 'ভাষা ও থিম', 'Language & theme');
    setText('#appLanguageSelect option[value="bn"]', 'বাংলা', 'Bangla');
    setText('#appLanguageSelect option[value="en"]', 'ইংরেজি', 'English');
    setText('#btnSettingsSync', 'এখন সিঙ্ক করুন', 'Sync now');
    setText('#btnClearCache', 'ক্যাশ ও অফলাইন ডাটা মুছুন', 'Clear cache & offline data');
  }

  function fixGovt() {
    if (!document.querySelector('.page-hero-govt')) return;
    document.title = L('সরকারি সেবা — ফলিকা', 'Government services — Folika');
    setText('.page-hero-govt .badge', 'সরকারি সহায়তা', 'Government support');
    setText('.page-hero-govt .text-h1', 'কৃষি ভর্তুকি ও জরুরি সেবা তথ্য', 'Ag subsidies & emergency services');
    setText('.page-hero-govt .text-body-lg', 'হটলাইন, ভর্তুকি স্কিম ও স্থানীয় কৃষি অফিসের তথ্য', 'Hotlines, subsidy schemes & local ag office info');
    setText('section .section-title.text-govt', 'জরুরি হটলাইন নম্বর', 'Emergency hotlines');
    const cards = document.querySelectorAll('.page-hero-govt ~ .section .card-domain-govt, main .card-domain-govt');
    const titles = [
      ['কৃষি তথ্য সেবা (১৬১২৩)', 'Agriculture info (16123)'],
      ['প্রাণিসম্পদ সেবা (১০৬৫৫)', 'Livestock service (10655)'],
      ['জাতীয় জরুরি সেবা (৯৯৯)', 'National emergency (999)'],
    ];
    cards.forEach((card, i) => {
      const h = card.querySelector('.card-title');
      if (h && titles[i]) setText(h, titles[i][0], titles[i][1]);
      const link = card.querySelector('a[href^="tel:"]');
      if (link) setText(link, L('কল করুন', 'Call now'), L('কল করুন', 'Call now'));
    });
  }

  function fixCommunity() {
    if (!document.getElementById('communityMain')) return;
    document.title = L('কমিউনিটি — ফলিকা', 'Community — Folika');
    setText('#communityMain .text-h1', 'কমিউনিটি', 'Community');
    setText('#communityMain > .container > .section-header .text-body', 'কৃষি বিশেষজ্ঞ, ফোরাম ও স্থানীয় সেবা', 'Ag experts, forum & local services');
  }

  function fixCropLivestockTitles() {
    if (document.getElementById('cropPlanRoot')) {
      document.title = L('ফসল পরিকল্পনা — ফলিকা', 'Crop plan — Folika');
    }
    if (document.getElementById('livestockPlanRoot')) {
      document.title = L('প্রাণিসম্পদ পরিকল্পনা — ফলিকা', 'Livestock plan — Folika');
    }
  }

  function fixHome() {
    if (!document.getElementById('mainContent')) return;
    document.title = L('ফলিকা - কৃষকের ডিজিটাল সঙ্গী', 'Folika - Digital companion for farmers');
  }

  function apply() {
    fixCommonShell();
    fixHome();
    fixLogin();
    fixDisease();
    fixFish();
    fixProfile();
    fixProfileSubPages();
    fixSettings();
    fixGovt();
    fixCommunity();
    fixCropLivestockTitles();
    if (global.FolikaI18n) global.FolikaI18n.apply();
  }

  global.FolikaPageCopy = { apply };
  document.addEventListener('DOMContentLoaded', apply);
  window.addEventListener('folika:langchange', apply);
})(window);
