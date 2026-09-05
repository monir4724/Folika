/**
 * FOLIKA — Profile settings (personal info, security, activity history)
 */
(function (global) {
  'use strict';

  const EXTRA_KEY = 'folika_profile_extra';
  const SESSIONS_KEY = 'folika_login_sessions';
  const U = () => global.FolikaProfileUtils;
  const api = () => global.FolikaApiClient;
  const folika = () => global.FolikaAPI;

  function loadExtra() {
    try { return JSON.parse(localStorage.getItem(EXTRA_KEY) || '{}'); } catch (e) { return {}; }
  }

  function saveExtra(patch) {
    const next = { ...loadExtra(), ...patch };
    localStorage.setItem(EXTRA_KEY, JSON.stringify(next));
    return next;
  }

  function msg(text, isError) {
    const el = document.getElementById('profileSettingsMsg');
    if (!el) return;
    el.textContent = text;
    el.style.color = isError ? 'var(--color-error)' : 'var(--color-primary)';
  }

  function planIdLabel(type, id) {
    const prefix = { crop: 'CRP', fish: 'FSH', livestock: 'LVS' }[type] || 'PLN';
    return `${prefix}-${String(id).padStart(4, '0')}`;
  }

  function loadLocalPlans(key) {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch (e) { return []; }
  }

  function mergePlans(apiPlans, localKey, type) {
    const local = loadLocalPlans(localKey);
    const map = new Map();
    (apiPlans || []).forEach((p) => { if (p && p.id != null) map.set(String(p.id), p); });
    local.forEach((p) => { if (p && p.id != null && !map.has(String(p.id))) map.set(String(p.id), p); });
    return Array.from(map.values()).map((p) => ({ ...p, _type: type }));
  }

  async function loadActivityHistory() {
    let crops = [];
    let fish = [];
    let livestock = [];
    try {
      if (api() && folika()?.Session?.isLoggedIn()) {
        const [c, f, l] = await Promise.all([
          api().cachedGet('/crops/plans').catch(() => ({ data: [] })),
          api().cachedGet('/fish/plans').catch(() => ({ data: [] })),
          api().cachedGet('/livestock/plans').catch(() => ({ data: [] })),
        ]);
        crops = U().unwrapList(c);
        fish = U().unwrapList(f);
        livestock = U().unwrapList(l);
      }
    } catch (e) { /* fallback local */ }

    const all = [
      ...mergePlans(crops, 'folika_crop_plans', 'crop'),
      ...mergePlans(fish, 'folika_fish_plans', 'fish'),
      ...mergePlans(livestock, 'folika_livestock_plans', 'livestock'),
    ].sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0));

    return all;
  }

  function planTitle(p) {
    if (p._type === 'crop') {
      const c = p.crop && (U().en() ? p.crop.name_en : p.crop.name_bn);
      return c || p.name || 'ফসল পরিকল্পনা';
    }
    if (p._type === 'fish') return p.name || 'মৎস্য পরিকল্পনা';
    if (p._type === 'livestock') {
      const b = p.breed && (U().en() ? p.breed.name_en : p.breed.name_bn);
      return b || p.name || 'প্রাণিসম্পদ পরিকল্পনা';
    }
    return p.name || '—';
  }

  function detailHref(p) {
    const map = { crop: 'profile-crop-detail.html', fish: 'profile-fish-detail.html', livestock: 'profile-livestock-detail.html' };
    return `${map[p._type] || 'profile.html'}?id=${encodeURIComponent(p.id)}`;
  }

  function renderActivityList(items) {
    const box = document.getElementById('fullActivityList');
    if (!box) return;
    if (!items.length) {
      box.innerHTML = `<p class="text-body-sm text-secondary">এখনও কোনো পরিকল্পনা নেই।</p>`;
      return;
    }
    box.innerHTML = items.map((p) => `
      <a href="${detailHref(p)}" class="profile-activity-row">
        <span class="profile-activity-id">${U().esc(planIdLabel(p._type, p.id))}</span>
        <span style="flex:1;">
          <strong>${U().esc(planTitle(p))}</strong><br>
          <span class="text-caption">${U().esc(U().categoryLabel(p._type))} · ${U().esc(U().formatDate(p.created_at || p.updated_at))}</span>
        </span>
        <span class="badge badge-${p._type === 'livestock' ? 'livestock' : p._type}">${U().esc(U().statusLabel(p.status))}</span>
      </a>`).join('');
  }

  function renderSessions() {
    const sessions = (() => {
      try { return JSON.parse(localStorage.getItem(SESSIONS_KEY) || '[]'); } catch (e) { return []; }
    })();
    const current = {
      device: navigator.userAgent.includes('Mobile') ? 'মোবাইল ব্রাউজার' : 'ডেস্কটপ ব্রাউজার',
      time: new Date().toISOString(),
      current: true,
    };
    const list = sessions.length ? sessions : [current];
    const loginBox = document.getElementById('loginActivityList');
    const devBox = document.getElementById('connectedDevicesList');
    const html = list.map((s) => `
      <div class="profile-activity-row">
        <span style="flex:1;"><strong>${U().esc(s.device || 'ডিভাইস')}</strong>${s.current ? ' <span class="badge badge-verified">বর্তমান</span>' : ''}<br>
        <span class="text-caption">${U().esc(U().formatDate(s.time))}</span></span>
      </div>`).join('');
    if (loginBox) loginBox.innerHTML = html;
    if (devBox) devBox.innerHTML = html;
  }

  let avatarImage = null;
  let avatarZoom = 1;

  function bindAvatarCrop() {
    const input = document.getElementById('avatarInput');
    const wrap = document.getElementById('avatarCropWrap');
    const canvas = document.getElementById('avatarCropCanvas');
    const zoom = document.getElementById('avatarZoom');
    if (!input || !canvas) return;

    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          avatarImage = img;
          avatarZoom = 1;
          if (zoom) zoom.value = '1';
          if (wrap) wrap.hidden = false;
          drawAvatarCrop();
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });

    zoom?.addEventListener('input', () => {
      avatarZoom = Number(zoom.value) || 1;
      drawAvatarCrop();
    });

    document.getElementById('btnSaveAvatar')?.addEventListener('click', () => {
      if (!canvas) return;
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      saveExtra({ avatarDataUrl: dataUrl });
      const av = document.getElementById('settingsAvatar');
      if (av) av.innerHTML = `<img src="${dataUrl}" alt="">`;
      msg('প্রোফাইল ছবি সংরক্ষিত।');
    });
  }

  function drawAvatarCrop() {
    const canvas = document.getElementById('avatarCropCanvas');
    if (!canvas || !avatarImage) return;
    const ctx = canvas.getContext('2d');
    const size = canvas.width;
    ctx.clearRect(0, 0, size, size);
    const scale = avatarZoom;
    const iw = avatarImage.width * scale;
    const ih = avatarImage.height * scale;
    const x = (size - iw) / 2;
    const y = (size - ih) / 2;
    ctx.drawImage(avatarImage, x, y, iw, ih);
  }

  async function loadUser() {
    if (!folika()?.Session?.isLoggedIn()) {
      api()?.redirectToLogin?.();
      return null;
    }
    try {
      const res = await api().cachedGet('/user/profile');
      return U().unwrap(res);
    } catch (e) {
      return folika().Session.getUser();
    }
  }

  function fillForm(user) {
    const extra = loadExtra();
    const name = document.getElementById('psName');
    const dob = document.getElementById('psDob');
    const gender = document.getElementById('psGender');
    const address = document.getElementById('psAddress');
    const email = document.getElementById('psEmail');
    const phone = document.getElementById('psPhone');
    if (name) name.value = user?.name || extra.displayName || '';
    if (dob) dob.value = extra.dob || '';
    if (gender) gender.value = extra.gender || '';
    if (address) address.value = extra.address || U().locationLine(user) || '';
    if (email) email.value = extra.email || user?.email || '';
    if (phone) phone.value = user?.mobile || '';
    const av = document.getElementById('settingsAvatar');
    const avSrc = extra.avatarDataUrl || user?.avatar_url;
    if (av) {
      if (avSrc) av.innerHTML = `<img src="${U().esc(U().mediaUrl(avSrc))}" alt="">`;
      else av.textContent = (user?.name || 'ফ').trim().charAt(0);
    }
    document.getElementById('psNotifyPush').checked = user?.notify_push !== false;
    document.getElementById('psNotifySms').checked = user?.notify_sms !== false;
    document.getElementById('ps2fa').checked = !!extra.twoFactor;
  }

  async function saveBasic(user) {
    const name = (document.getElementById('psName')?.value || '').trim();
    const dob = document.getElementById('psDob')?.value || '';
    const gender = document.getElementById('psGender')?.value || '';
    const address = (document.getElementById('psAddress')?.value || '').trim();
    if (!name) { msg('নাম দিন।', true); return; }
    saveExtra({ displayName: name, dob, gender, address });
    try {
      if (api()?.isOnline()) {
        const res = await api().patch('/user/profile', { name });
        const u = U().unwrap(res);
        if (folika().Session) folika().Session.setUser(u);
      }
      msg('মূল তথ্য সংরক্ষিত।');
    } catch (e) {
      msg(e.banglaMessage || 'সংরক্ষণ ব্যর্থ।', true);
    }
  }

  async function saveContact() {
    const email = (document.getElementById('psEmail')?.value || '').trim();
    saveExtra({ email });
    try {
      if (api()?.isOnline()) await api().patch('/user/profile', { email });
      msg('যোগাযোগের তথ্য সংরক্ষিত।');
    } catch (e) {
      msg('স্থানীয়ভাবে সংরক্ষিত। সার্ভারে পাঠাতে ব্যর্থ।');
    }
  }

  async function saveNotify() {
    const push = document.getElementById('psNotifyPush')?.checked;
    const sms = document.getElementById('psNotifySms')?.checked;
    try {
      if (folika()?.user?.preferences) {
        await folika().user.preferences({ notify_push: push, notify_sms: sms });
      }
      msg('নোটিফিকেশন পছন্দ সংরক্ষিত।');
    } catch (e) {
      msg(e.banglaMessage || 'ব্যর্থ।', true);
    }
  }

  function init() {
    if (!document.getElementById('profileSettingsMain')) return;
    bindAvatarCrop();
    renderSessions();

    let user = null;
    loadUser().then(async (u) => {
      user = u;
      fillForm(user);
      const history = await loadActivityHistory();
      renderActivityList(history);
    });

    document.getElementById('btnSaveBasic')?.addEventListener('click', () => saveBasic(user));
    document.getElementById('btnSaveContact')?.addEventListener('click', saveContact);
    document.getElementById('psNotifyPush')?.addEventListener('change', saveNotify);
    document.getElementById('psNotifySms')?.addEventListener('change', saveNotify);
    document.getElementById('ps2fa')?.addEventListener('change', (e) => {
      saveExtra({ twoFactor: e.target.checked });
      msg(e.target.checked ? '2FA চালু করা হয়েছে (ডেমো)।' : '2FA বন্ধ।');
    });

    document.getElementById('btnChangePass')?.addEventListener('click', () => {
      const p1 = document.getElementById('psNewPass')?.value || '';
      const p2 = document.getElementById('psConfirmPass')?.value || '';
      if (p1.length < 6) { msg('পাসওয়ার্ড কমপক্ষে ৬ অক্ষর হতে হবে।', true); return; }
      if (p1 !== p2) { msg('পাসওয়ার্ড মিলছে না।', true); return; }
      saveExtra({ passwordSet: true });
      msg('পাসওয়ার্ড সংরক্ষিত (ডেমো — সার্ভার API শীঘ্রই)।');
    });

    document.getElementById('btnDeactivate')?.addEventListener('click', () => {
      if (!window.confirm('অ্যাকাউন্ট সাময়িক নিষ্ক্রিয় করবেন?')) return;
      saveExtra({ deactivated: true });
      msg('অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে (ডেমো)।');
    });

    document.getElementById('btnDownloadData')?.addEventListener('click', async () => {
      const history = await loadActivityHistory();
      const blob = new Blob([JSON.stringify({ profile: loadExtra(), plans: history }, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'folika-my-data.json';
      a.click();
      URL.revokeObjectURL(a.href);
      msg('ডাটা ডাউনলোড শুরু হয়েছে।');
    });

    document.getElementById('btnLogout')?.addEventListener('click', async () => {
      try { await folika().auth.logout(); } catch (e) { folika().Session.clear(); }
      window.location.href = 'login.html';
    });
    document.getElementById('btnLogoutAll')?.addEventListener('click', async () => {
      try { await folika().auth.logoutAll(); } catch (e) { folika().Session.clear(); }
      window.location.href = 'login.html';
    });
    document.getElementById('btnDeleteAccount')?.addEventListener('click', async () => {
      if (!window.confirm('অ্যাকাউন্ট স্থায়ীভাবে মুছবেন?')) return;
      try {
        await folika().user.deleteAccount();
        folika().Session.clear();
        window.location.href = 'login.html';
      } catch (e) {
        msg(e.banglaMessage || 'মুছতে ব্যর্থ।', true);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', init);
  global.FolikaProfileSettings = { init, loadActivityHistory };
})(window);
