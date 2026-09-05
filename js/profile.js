/**
 * FOLIKA — Profile dashboard (§4.1–4.4, 4.7–4.10)
 */
(function (global) {
  'use strict';

  const U = () => global.FolikaProfileUtils;
  const api = () => global.FolikaApiClient;
  const folika = () => global.FolikaAPI;
  const sync = () => global.FolikaOfflineSync;

  const Profile = {
    user: null,
    summary: null,
    cropPlans: [],
    fishPlans: [],
    livestockPlans: [],
    diagnoses: [],
    offline: false,

    init() {
      if (!document.getElementById('profileMain')) return;
      if (sync()) sync().init();
      this.bind();
      this.boot();
    },

    bind() {
      document.getElementById('btnEditIdentity')?.addEventListener('click', () => this.togglePanel('identityEditPanel', true));
      document.getElementById('btnCancelIdentity')?.addEventListener('click', () => this.togglePanel('identityEditPanel', false));
      document.getElementById('btnSaveIdentity')?.addEventListener('click', () => this.saveIdentity());
      document.getElementById('btnNudgeAction')?.addEventListener('click', () => this.togglePanel('identityEditPanel', true));
      document.getElementById('btnLogout')?.addEventListener('click', () => this.logout(false));
      document.getElementById('btnLogoutAll')?.addEventListener('click', () => this.logout(true));
      document.getElementById('btnDeleteAccount')?.addEventListener('click', () => this.deleteAccount());
      document.getElementById('notifyPushToggle')?.addEventListener('change', (e) => this.saveNotifyPref(e.target.checked));

      window.addEventListener('online', () => { this.offline = false; this.renderSyncLine(); });
      window.addEventListener('offline', () => { this.offline = true; this.renderSyncLine(); });
    },

    async boot() {
      if (!folika() || !folika().Session.isLoggedIn()) {
        api().redirectToLogin();
        return;
      }
      this.offline = !api().isOnline();
      this.renderSyncLine(true);
      try {
        await this.loadAll();
      } catch (e) {
        api().handleAuthError(e);
        this.toast(e.banglaMessage || 'তথ্য লোড করা যায়নি', true);
      }
    },

    async loadAll() {
      const [prof, summ, crops, fish, ls, diag, syncSt] = await Promise.all([
        api().cachedGet('/user/profile').catch(() => null),
        api().cachedGet('/user/summary').catch(() => null),
        api().cachedGet('/crops/plans').catch(() => ({ data: [] })),
        api().cachedGet('/fish/plans').catch(() => ({ data: [] })),
        api().cachedGet('/livestock/plans').catch(() => ({ data: [] })),
        api().cachedGet('/disease/history', { query: { per_page: 3 } }).catch(() => ({ data: [] })),
        folika().sync.status().catch(() => null),
      ]);

      this.user = U().unwrap(prof);
      if (this.user && folika().Session) folika().Session.setUser(this.user);
      this.summary = U().unwrap(summ);
      this.cropPlans = U().unwrapList(crops);
      this.fishPlans = U().unwrapList(fish);
      this.livestockPlans = U().unwrapList(ls);
      this.diagnoses = U().unwrapList(diag);

      this.renderAll();
      this.renderSyncLine(false, syncSt);
      this.setupNotifyToggle();
    },

    renderAll() {
      this.renderIdentity();
      this.renderNudge();
      this.renderPlanPreviews();
      this.renderLedger();
      this.renderDiagnoses();
    },

    renderIdentity() {
      const u = this.user;
      if (!u) return;
      const name = u.name || (U().en() ? 'Rohim mia' : 'Rohim mia');
      const el = (id, text) => { const n = document.getElementById(id); if (n) n.textContent = text; };
      el('profileName', name);
      el('profileLocation', U().locationLine(u) || '—');
      el('profileMobile', (U().en() ? 'Mobile: ' : 'মোবাইল: ') + U().maskMobile(u.mobile));
      const av = document.getElementById('profileAvatar');
      if (av) {
        if (u.avatar_url) av.innerHTML = `<img src="${U().esc(u.avatar_url)}" alt="" loading="lazy">`;
        else av.textContent = name.trim().charAt(0) || 'ফ';
      }
      const vb = document.getElementById('profileVerifiedBadge');
      if (vb) vb.style.display = u.is_verified || u.mobile ? '' : 'none';
      const nameIn = document.getElementById('editName');
      if (nameIn) nameIn.value = u.name || '';
    },

    renderNudge() {
      const pct = U().profileCompletion(this.user);
      const box = document.getElementById('profileNudge');
      if (!box) return;
      if (pct >= 100) { box.style.display = 'none'; return; }
      box.style.display = '';
      const fill = document.getElementById('profileNudgeFill');
      const title = document.getElementById('profileNudgeTitle');
      if (fill) fill.style.width = pct + '%';
      if (title) title.textContent = U().en()
        ? `Your profile is ${pct}% complete`
        : `আপনার প্রোফাইল ${U().toBn(pct)}% সম্পূর্ণ`;
    },

    renderPlanPreviews() {
      this.renderPlanBlock('crop', this.cropPlans, 'cropPlanPreview', 'cropPlanCount', (p) => {
        const crop = p.crop && (U().en() ? p.crop.name_en : p.crop.name_bn);
        const area = p.land_area_bigha ? ` — ${U().toBn(p.land_area_bigha)} ${U().en() ? 'bigha' : 'বিঘা'}` : '';
        return (crop || p.name || '—') + area;
      });
      this.renderPlanBlock('fish', this.fishPlans, 'fishPlanPreview', 'fishPlanCount', (p) => {
        const sp = (p.species_selections && p.species_selections[0]);
        const nm = sp && (U().en() ? sp.species_name_en : sp.species_name_bn);
        return nm || p.name || '—';
      });
      this.renderPlanBlock('livestock', this.livestockPlans, 'livestockPlanPreview', 'livestockPlanCount', (p) => {
        const br = p.breed && (U().en() ? p.breed.name_en : p.breed.name_bn);
        return (br || p.name || '—') + (p.animal_count ? ` — ${U().toBn(p.animal_count)}` : '');
      });
    },

    renderPlanBlock(type, plans, containerId, countId, labelFn) {
      const cnt = document.getElementById(countId);
      if (cnt) cnt.textContent = U().toBn(plans.length);
      const box = document.getElementById(containerId);
      if (!box) return;
      if (!plans.length) {
        const links = { crop: 'crop.html', fish: 'fish.html', livestock: 'livestock.html' };
        box.innerHTML = `<div class="profile-empty">${U().en() ? 'No plans yet.' : 'এখনও কোনো প্ল্যান নেই।'}
          <a href="${links[type]}" class="btn btn-sm btn-primary" style="margin-top:8px;">${U().en() ? 'Create plan' : 'প্ল্যান তৈরি'}</a></div>`;
        return;
      }
      const recent = plans.slice(0, 3);
      box.innerHTML = recent.map((p) =>
        `<a href="profile-${type}-detail.html?id=${encodeURIComponent(p.id)}" class="profile-plan-row">
          <span>${U().esc(labelFn(p))}</span>
          <span class="badge badge-${type === 'livestock' ? 'livestock' : type}">${U().esc(U().statusLabel(p.status))}</span>
        </a>`
      ).join('');
    },

    renderLedger() {
      const fin = this.summary && this.summary.overall_financials;
      if (!fin) return;
      const set = (id, v) => { const n = document.getElementById(id); if (n) n.textContent = U().formatMoney(v); };
      set('ledgerCost', fin.total_cost);
      set('ledgerRevenue', fin.total_revenue);
      set('ledgerProfit', fin.net_profit);
    },

    renderDiagnoses() {
      const box = document.getElementById('diagnosisPreview');
      if (!box) return;
      if (!this.diagnoses.length) {
        box.innerHTML = `<div class="profile-empty">${U().en() ? 'No diagnoses yet.' : 'এখনও কোনো রোগ নির্ণয় নেই।'}
          <a href="disease.html" class="btn btn-sm btn-primary" style="margin-top:8px;">${U().en() ? 'Analyze disease' : 'রোগ নির্ণয় করুন'}</a></div>`;
        return;
      }
      box.innerHTML = this.diagnoses.slice(0, 3).map((d) => {
        const thumb = d.image_url
          ? `<img class="profile-diagnosis-thumb" src="${U().esc(U().mediaUrl(d.image_url))}" alt="" loading="lazy">`
          : '<div class="profile-diagnosis-thumb"></div>';
        return `<a href="profile-diagnosis-detail.html?id=${d.id}" class="profile-plan-row">
          ${thumb}
          <span style="flex:1;">
            <strong>${U().esc(d.disease_name || '—')}</strong><br>
            <span class="text-caption">${U().esc(U().categoryLabel(d.category))} · ${U().esc(U().severityLabel(d.severity))}</span>
          </span>
        </a>`;
      }).join('');
    },

    renderSyncLine(loading, syncSt) {
      const el = document.getElementById('profileSyncLine');
      if (!el) return;
      el.classList.toggle('is-offline', this.offline);
      if (loading) {
        el.innerHTML = '<span class="profile-skeleton" style="width:50%;display:inline-block;">&nbsp;</span>';
        return;
      }
      const pending = sync() ? sync().pendingCount() : 0;
      const serverPending = syncSt && syncSt.data && syncSt.data.pending;
      if (this.offline) {
        el.textContent = U().en()
          ? 'Offline — showing saved data. Updates when connected.'
          : 'অফলাইন — আগের তথ্য দেখানো হচ্ছে। ইন্টারনেট এলে নিজে থেকে আপডেট হবে।';
      } else if (pending > 0 || (serverPending && serverPending > 0)) {
        el.textContent = U().en()
          ? 'Some changes are waiting to upload.'
          : 'কিছু পরিবর্তন এখনও পাঠানো হয়নি — সংযোগ পেলে নিজে থেকে পাঠাবে।';
      } else {
        el.textContent = U().en() ? 'All information is up to date.' : 'সব তথ্য আপডেট আছে।';
      }
    },

    setupNotifyToggle() {
      const t = document.getElementById('notifyPushToggle');
      if (t && this.user) t.checked = !!this.user.notify_push;
    },

    togglePanel(id, open) {
      const p = document.getElementById(id);
      if (p) {
        p.classList.toggle('is-open', open);
        if (open) {
          p.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          const first = p.querySelector('input, select, button');
          if (first) setTimeout(() => first.focus(), 300);
        }
      }
    },

    async saveIdentity() {
      const name = (document.getElementById('editName')?.value || '').trim();
      const err = document.getElementById('editNameErr');
      if (!name) {
        if (err) err.textContent = U().en() ? 'Name is required.' : 'নাম দিন।';
        return;
      }
      if (err) err.textContent = '';
      try {
        if (!api().isOnline()) {
          sync().enqueue({ type: 'update_profile', payload: { name } });
          this.user.name = name;
          this.renderIdentity();
          this.togglePanel('identityEditPanel', false);
          this.renderNudge();
          this.toast(U().en() ? 'Saved offline — will sync later.' : 'অফলাইনে সংরক্ষিত — পরে sync হবে।');
          return;
        }
        const res = await api().patch('/user/profile', { name });
        this.user = U().unwrap(res);
        if (folika().Session) folika().Session.setUser(this.user);
        api().invalidateCache('/user');
        this.renderIdentity();
        this.togglePanel('identityEditPanel', false);
        this.renderNudge();
        this.toast(U().en() ? 'Profile saved.' : 'প্রোফাইল সংরক্ষিত।');
      } catch (e) {
        api().handleAuthError(e);
        this.toast(e.banglaMessage, true);
      }
    },

    async saveNotifyPref(on) {
      const toggle = document.getElementById('notifyPushToggle');
      if (!api().isOnline()) {
        if (toggle) toggle.checked = !on;
        this.toast(U().en() ? 'No internet — try later.' : 'ইন্টারনেট নেই — পরে চেষ্টা করুন।', true);
        return;
      }
      try {
        await folika().user.preferences({ notify_push: on });
        if (this.user) this.user.notify_push = on;
        this.toast(U().en() ? 'Preference saved.' : 'পছন্দ সংরক্ষিত।');
      } catch (e) {
        if (toggle) toggle.checked = !on;
        this.toast(e.banglaMessage || (U().en() ? 'Failed.' : 'ব্যর্থ।'), true);
      }
    },

    async logout(all) {
      try {
        if (all && folika().auth.logoutAll) await folika().auth.logoutAll();
        else await folika().auth.logout();
      } catch (e) { folika().Session.clear(); }
      window.location.href = 'login.html';
    },

    async deleteAccount() {
      if (!api().isOnline()) {
        this.toast(U().en() ? 'Offline — cannot delete.' : 'অফলাইন — মুছা যাবে না।', true);
        return;
      }
      const ok = window.confirm(U().en()
        ? 'Delete your account permanently? This cannot be undone.'
        : 'আপনার অ্যাকাউন্ট স্থায়ীভাবে মুছে ফেলবেন? এটি আর ফেরানো যাবে না।');
      if (!ok) return;
      const ok2 = window.confirm(U().en() ? 'Type OK to confirm.' : 'নিশ্চিত করতে আবার চাপুন।');
      if (!ok2) return;
      try {
        await folika().user.deleteAccount();
        folika().Session.clear();
        window.location.href = 'login.html';
      } catch (e) {
        this.toast(e.banglaMessage || (U().en() ? 'Failed.' : 'ব্যর্থ।'), true);
      }
    },

    toast(msg, isError) {
      const t = document.createElement('div');
      t.className = 'profile-toast' + (isError ? ' is-error' : '');
      t.textContent = msg;
      t.setAttribute('role', 'alert');
      document.body.appendChild(t);
      setTimeout(() => t.remove(), 3500);
    },
  };

  document.addEventListener('DOMContentLoaded', () => Profile.init());
  global.FolikaProfile = Profile;
})(window);
