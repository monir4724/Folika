/**
 * FOLIKA — Settings page actions (sync, notification prefs)
 */
(function (global) {
  'use strict';

  function api() {
    return global.FolikaAPI;
  }

  async function flushOfflineSync() {
    const sync = global.FolikaOfflineSync;
    if (!sync) return { ok: false, msg: 'অফলাইন সিঙ্ক মডিউল পাওয়া যায়নি।' };
    if (!navigator.onLine) return { ok: false, msg: 'ইন্টারনেট নেই — পরে চেষ্টা করুন।' };
    try {
      await sync.flush();
      return { ok: true, msg: 'অফলাইন ডাটা সার্ভারে পাঠানো হয়েছে।' };
    } catch (e) {
      return { ok: false, msg: e.banglaMessage || 'সিঙ্ক ব্যর্থ হয়েছে।' };
    }
  }

  async function savePref(key, value) {
    if (!api() || !api().Session.isLoggedIn()) return false;
    try {
      await api().user.preferences({ [key]: value });
      return true;
    } catch (e) {
      return false;
    }
  }

  function init() {
    const root = document.getElementById('settingsMain') || document.getElementById('moreMain');
    if (!root) return;

    const syncBtn = document.getElementById('btnSettingsSync');
    const syncMsg = document.getElementById('settingsSyncMsg');
    if (syncBtn) {
      syncBtn.addEventListener('click', async () => {
        syncBtn.disabled = true;
        const res = await flushOfflineSync();
        if (syncMsg) syncMsg.textContent = res.msg;
        syncBtn.disabled = false;
      });
    }

    const weatherToggle = document.getElementById('settingsWeatherNotify');
    const reminderToggle = document.getElementById('settingsReminderNotify');

    async function loadUserPrefs() {
      if (!api() || !api().Session.isLoggedIn()) return;
      try {
        const res = await api().user.profile();
        const user = (res && res.data) ? res.data : res;
        if (user && api().Session.setUser) api().Session.setUser(user);
        if (weatherToggle) weatherToggle.checked = user.notify_push !== false;
        if (reminderToggle) reminderToggle.checked = user.notify_sms !== false;
      } catch (e) {
        const user = api().Session.getUser();
        if (weatherToggle && user) weatherToggle.checked = user.notify_push !== false;
        if (reminderToggle && user) reminderToggle.checked = user.notify_sms !== false;
      }
    }
    loadUserPrefs();

    if (weatherToggle) {
      weatherToggle.addEventListener('change', async (e) => {
        const ok = await savePref('notify_push', e.target.checked);
        if (!ok) e.target.checked = !e.target.checked;
      });
    }
    if (reminderToggle) {
      reminderToggle.addEventListener('change', async (e) => {
        const ok = await savePref('notify_sms', e.target.checked);
        if (!ok) e.target.checked = !e.target.checked;
      });
    }

    const clearBtn = document.getElementById('btnClearCache');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (!window.confirm('আপনি কি নিশ্চিত যে সকল ক্যাশ ডাটা পরিষ্কার করতে চান?')) return;
        const keep = ['folika_lang', 'folika_location', 'folika-theme', 'folika-contrast', 'folika-font-scale', 'folika_a11y', 'folika_a11y_fab_pos', 'folika_app_prefs', 'folika_token', 'folika_user'];
        const saved = {};
        keep.forEach((k) => {
          const v = localStorage.getItem(k);
          if (v) saved[k] = v;
        });
        localStorage.clear();
        Object.keys(saved).forEach((k) => localStorage.setItem(k, saved[k]));
        if (syncMsg) syncMsg.textContent = 'ক্যাশ মেমোরি পরিষ্কার করা হয়েছে।';
      });
    }
  }

  global.FolikaSettingsPage = { init };
  document.addEventListener('DOMContentLoaded', init);
})(window);
