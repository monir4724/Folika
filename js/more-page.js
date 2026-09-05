/**
 * FOLIKA — More options page (preferences, not profile)
 */
(function (global) {
  'use strict';

  const PREFS_KEY = 'folika_app_prefs';

  function loadPrefs() {
    try { return JSON.parse(localStorage.getItem(PREFS_KEY) || '{}'); } catch (e) { return {}; }
  }

  function savePrefs(patch) {
    const next = { ...loadPrefs(), ...patch };
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    return next;
  }

  function init() {
    if (!document.getElementById('moreMain')) return;

    const prefs = loadPrefs();
    const tz = document.getElementById('prefTimezone');
    const cur = document.getElementById('prefCurrency');
    if (tz) tz.value = prefs.timezone || 'Asia/Dhaka';
    if (cur) cur.value = prefs.currency || 'BDT';

    tz?.addEventListener('change', () => savePrefs({ timezone: tz.value }));
    cur?.addEventListener('change', () => savePrefs({ currency: cur.value }));

    document.getElementById('btnOpenA11yPanel')?.addEventListener('click', () => {
      document.getElementById('folikaA11yFab')?.click();
    });

    window.addEventListener('folika:a11ychange', () => {
      const fs = document.getElementById('fontScaleSelect');
      if (!fs || !global.FolikaAccessibility) return;
      const level = global.FolikaAccessibility.loadState().fontLevel || 0;
      fs.value = global.FolikaAccessibility.FONT_LEVELS[level] || 'default';
    });

    if (global.FolikaSettingsPage) {
      global.FolikaSettingsPage.init();
    }
  }

  global.FolikaMorePage = { init, loadPrefs, savePrefs };
  document.addEventListener('DOMContentLoaded', init);
})(window);
