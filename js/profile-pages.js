/**
 * FOLIKA — Profile list & detail pages (§4.5, §4.6, §4.7)
 */
(function (global) {
  'use strict';

  const U = () => global.FolikaProfileUtils;
  const api = () => global.FolikaApiClient;
  const folika = () => global.FolikaAPI;
  const sync = () => global.FolikaOfflineSync;

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function requireAuth() {
    if (!folika() || !folika().Session.isLoggedIn()) {
      api().redirectToLogin();
      return false;
    }
    return true;
  }

  function pageShell(title, backHref, mainId) {
    return `<!DOCTYPE html>
<html lang="bn"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${U().esc(title)} - FOLIKA</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../css/tokens.css"><link rel="stylesheet" href="../css/base.css">
<link rel="stylesheet" href="../css/components.css"><link rel="stylesheet" href="../css/layout.css">
<link rel="stylesheet" href="../css/profile.css">
</head><body>
<a href="#${mainId}" class="skip-link">মূল বিষয়বস্তুতে যান</a>
<header class="site-header"><div class="nav-container">
<a href="../index.html" class="brand-link"><img src="../assets/images/folika-logo.jpg" alt="" class="brand-logo" style="height:40px;"></a>
<a href="profile.html" class="btn btn-sm btn-secondary">প্রোফাইল</a>
</div></header>
<main id="${mainId}" class="main-content"><div class="container">
<div class="profile-detail-back"><a href="${backHref}" class="btn btn-secondary">← ফিরে যান</a></div>
<h1 class="text-h2" id="pageTitle">${U().esc(title)}</h1>
<div id="pageContent"><div class="profile-skeleton" style="height:120px;"></div></div>
<div id="pagePager" class="flex justify-center gap-8" style="margin-top:16px;"></div>
</div></main>
<script src="../js/config.js"></script><script src="../js/api.js"></script>
<script src="../js/api-client.js"></script><script src="../js/offline-sync.js"></script>
<script src="../js/profile-utils.js"></script><script src="../js/main.js"></script>
<script src="../js/profile-pages.js"></script>
</body></html>`;
  }

  const Pages = {
    init() {
      const mode = document.body.getAttribute('data-profile-page');
      if (!mode) return;
      if (!requireAuth()) return;
      if (sync()) sync().init();
      if (global.FolikaNav) global.FolikaNav.init();
      if (global.reinitFolikaMobileNav) global.reinitFolikaMobileNav();
      const handlers = {
        'list-crops': () => this.listPlans('crop', '/crops/plans', 'profile-crops.html'),
        'list-fish': () => this.listPlans('fish', '/fish/plans', 'profile-fish.html'),
        'list-livestock': () => this.listPlans('livestock', '/livestock/plans', 'profile-livestock.html'),
        'list-diagnoses': () => this.listDiagnoses(),
        'list-notifications': () => this.listNotifications(),
        'detail-crop': () => this.detailCrop(),
        'detail-fish': () => this.detailFish(),
        'detail-livestock': () => this.detailLivestock(),
        'detail-diagnosis': () => this.detailDiagnosis(),
      };
      if (handlers[mode]) handlers[mode]();
    },

    async listPlans(type, path, selfPage) {
      const box = document.getElementById('pageContent');
      const page = parseInt(qs('page') || '1', 10);
      try {
        const res = await api().cachedGet(path);
        const all = U().unwrapList(res);
        const perPage = 10;
        const total = all.length;
        const slice = all.slice((page - 1) * perPage, page * perPage);
        if (!slice.length) {
          box.innerHTML = `<div class="profile-empty">${U().en() ? 'No plans.' : 'কোনো প্ল্যান নেই।'}</div>`;
          return;
        }
        box.innerHTML = slice.map((p) => {
          const label = type === 'crop'
            ? ((p.crop && (U().en() ? p.crop.name_en : p.crop.name_bn)) || p.name)
            : type === 'fish'
              ? (p.name || '—')
              : ((p.breed && (U().en() ? p.breed.name_en : p.breed.name_bn)) || p.name);
          return `<a href="profile-${type}-detail.html?id=${p.id}" class="profile-plan-row">
            <span>${U().esc(label)}</span>
            <span class="badge badge-${type === 'livestock' ? 'livestock' : type}">${U().esc(U().statusLabel(p.status))}</span>
          </a>`;
        }).join('');
        this.renderPager(selfPage, page, Math.ceil(total / perPage));
      } catch (e) {
        api().handleAuthError(e);
        box.innerHTML = `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    renderPager(base, current, totalPages) {
      const pg = document.getElementById('pagePager');
      if (!pg || totalPages <= 1) return;
      let html = '';
      for (let i = 1; i <= totalPages; i++) {
        html += i === current
          ? `<span class="badge badge-expert">${U().toBn(i)}</span>`
          : `<a href="${base}?page=${i}" class="btn btn-sm btn-secondary">${U().toBn(i)}</a>`;
      }
      pg.innerHTML = html;
    },

    async listDiagnoses() {
      const box = document.getElementById('pageContent');
      const page = parseInt(qs('page') || '1', 10);
      try {
        const res = await api().get('/disease/history', { query: { page } });
        const list = U().unwrapList(res);
        if (!list.length) {
          box.innerHTML = `<div class="profile-empty">${U().en() ? 'No history.' : 'ইতিহাস নেই।'} <a href="disease.html" class="btn btn-sm btn-primary">${U().en() ? 'Analyze' : 'নির্ণয়'}</a></div>`;
          return;
        }
        box.innerHTML = list.map((d) =>
          `<a href="profile-diagnosis-detail.html?id=${d.id}" class="profile-plan-row">
            <span><strong>${U().esc(d.disease_name || '—')}</strong><br>
            <span class="text-caption">${U().esc(U().categoryLabel(d.category))} · ${U().formatDate(d.analyzed_at || d.created_at)}</span></span>
          </a>`
        ).join('');
      } catch (e) {
        api().handleAuthError(e);
        box.innerHTML = `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    async listNotifications() {
      const box = document.getElementById('pageContent');
      try {
        const res = await api().get('/notifications');
        const list = U().unwrapList(res);
        const bar = document.createElement('div');
        bar.innerHTML = `<button type="button" id="btnReadAll" class="btn btn-sm btn-primary" style="margin-bottom:12px;">${U().en() ? 'Mark all read' : 'সব পড়া হয়েছে'}</button>`;
        box.innerHTML = '';
        box.appendChild(bar);
        const listEl = document.createElement('div');
        box.appendChild(listEl);
        if (!list.length) {
          listEl.innerHTML = `<div class="profile-empty">${U().en() ? 'No notifications.' : 'কোনো নোটিফিকেশন নেই।'}</div>`;
          return;
        }
        listEl.innerHTML = list.map((n) =>
          `<div class="profile-plan-row" style="cursor:default;">
            <span style="flex:1;"><strong>${U().esc(n.title)}</strong><br>${U().esc(n.body || '')}</span>
            ${n.is_read ? '' : `<button type="button" class="btn btn-sm btn-secondary" data-read="${n.id}">${U().en() ? 'Read' : 'পড়া'}</button>`}
          </div>`
        ).join('');
        listEl.querySelectorAll('[data-read]').forEach((btn) => {
          btn.addEventListener('click', async () => {
            await folika().notifications.read(btn.getAttribute('data-read'));
            this.listNotifications();
          });
        });
        document.getElementById('btnReadAll')?.addEventListener('click', async () => {
          await folika().notifications.readAll();
          this.listNotifications();
        });
      } catch (e) {
        api().handleAuthError(e);
        box.innerHTML = `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    async detailCrop() {
      const id = qs('id');
      const box = document.getElementById('pageContent');
      if (!id) { box.innerHTML = this.notFound(); return; }
      try {
        const res = await api().cachedGet('/crops/plans/' + id);
        const p = U().unwrap(res);
        if (!p) { box.innerHTML = this.notFound(); return; }
        const costs = U().sumMoney(p.cost_items, 'amount');
        const revs = U().sumMoney(p.revenue_items, 'amount');
        box.innerHTML = `
          <section class="card" style="margin-bottom:16px;">
            <h2 class="text-h3">${U().esc(p.name)}</h2>
            <p class="text-body-sm">${U().en() ? 'Land' : 'জমি'}: ${U().toBn(p.land_area_bigha || 0)} ${U().en() ? 'bigha' : 'বিঘা'} · ${U().esc(p.land_shape || '')}</p>
            <p class="text-body-sm">${U().en() ? 'Sowing' : 'বপন'}: ${U().esc(p.sowing_method || '—')} · ${U().esc(p.sowing_date || '—')}</p>
            <p class="text-body-sm">${U().en() ? 'Spacing' : 'ফাঁক'}: ${U().toBn(p.row_spacing_cm || 0)} × ${U().toBn(p.plant_spacing_cm || 0)} cm</p>
          </section>
          <section class="card" style="margin-bottom:16px;">
            <h3 class="text-h3">${U().en() ? 'Costs' : 'খরচ'}</h3>
            <p class="font-bold">${U().formatMoney(costs || p.total_cost)}</p>
            <ul>${(p.cost_items || []).map((c) => `<li>${U().esc(c.label || c.category)} — ${U().formatMoney(c.amount)}</li>`).join('') || '<li>—</li>'}</ul>
          </section>
          <section class="card" style="margin-bottom:16px;">
            <h3 class="text-h3">${U().en() ? 'Revenue' : 'আয়'}</h3>
            <p class="font-bold">${U().formatMoney(revs || p.total_revenue)}</p>
            <ul>${(p.revenue_items || []).map((r) => `<li>${U().esc(r.label || '')} — ${U().formatMoney(r.amount)}</li>`).join('') || '<li>—</li>'}</ul>
          </section>
          <p class="text-primary font-bold">${U().en() ? 'Net profit' : 'নিট লাভ'}: ${U().formatMoney(p.net_profit)}</p>
          <a href="crop.html" class="btn btn-primary btn-block" style="margin-top:12px;">${U().en() ? 'Edit in crop planner' : 'ফসল প্ল্যানারে সম্পাদনা'}</a>
        `;
      } catch (e) {
        box.innerHTML = e.status === 404 ? this.notFound() : `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    async detailFish() {
      const id = qs('id');
      const box = document.getElementById('pageContent');
      if (!id) { box.innerHTML = this.notFound(); return; }
      try {
        const res = await api().cachedGet('/fish/plans/' + id);
        const p = U().unwrap(res);
        if (!p) { box.innerHTML = this.notFound(); return; }
        const species = (p.species_selections || []).map((s) =>
          `<li>${U().esc(U().en() ? s.species_name_en : s.species_name_bn)} (${U().esc(s.water_layer)}) — ${U().toBn(s.quantity || 0)}</li>`
        ).join('');
        box.innerHTML = `
          <section class="card" style="margin-bottom:16px;">
            <h2 class="text-h3">${U().esc(p.name)}</h2>
            <p class="text-body-sm">${U().en() ? 'Pond' : 'পুকুর'}: ${U().toBn(p.pond_length_m)}×${U().toBn(p.pond_width_m)}m, ${U().en() ? 'depth' : 'গভীর'} ${U().toBn(p.pond_depth_m)}m</p>
            <p class="text-body-sm">${U().en() ? 'Area' : 'আয়তন'}: ${U().toBn(p.pond_area_sqm)} m² · ${U().toBn(p.culture_duration_months || 0)} ${U().en() ? 'months' : 'মাস'}</p>
          </section>
          <section class="card" style="margin-bottom:16px;">
            <h3 class="text-h3">${U().en() ? 'Species & layers' : 'প্রজাতি ও স্তর'}</h3>
            <ul>${species || '<li>—</li>'}</ul>
          </section>
          <p class="text-primary font-bold">${U().en() ? 'Net profit' : 'নিট লাভ'}: ${U().formatMoney(p.net_profit)}</p>
          <a href="fish.html" class="btn btn-primary btn-block" style="margin-top:12px;">${U().en() ? 'Edit in fish planner' : 'মাছ প্ল্যানারে সম্পাদনা'}</a>
        `;
      } catch (e) {
        box.innerHTML = e.status === 404 ? this.notFound() : `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    async detailLivestock() {
      const id = qs('id');
      const box = document.getElementById('pageContent');
      if (!id) { box.innerHTML = this.notFound(); return; }
      try {
        const res = await api().cachedGet('/livestock/plans/' + id);
        const p = U().unwrap(res);
        if (!p) { box.innerHTML = this.notFound(); return; }
        const vaccines = (p.vaccine_schedules || []).map((v) =>
          `<li class="${v.is_completed ? 'profile-vaccine-done' : ''}" data-vid="${v.id}">
            ${U().esc(U().en() ? v.vaccine_name : (v.vaccine_name_bn || v.vaccine_name))} — ${U().formatDate(v.due_date)}
            ${v.is_completed ? '' : `<button type="button" class="btn btn-sm btn-secondary" data-complete="${v.id}" style="margin-left:8px;">${U().en() ? 'Done' : 'সম্পন্ন'}</button>`}
          </li>`
        ).join('');
        box.innerHTML = `
          <section class="card" style="margin-bottom:16px;">
            <h2 class="text-h3">${U().esc(p.name)}</h2>
            <p class="text-body-sm">${U().esc((p.breed && (U().en() ? p.breed.name_en : p.breed.name_bn)) || '')} · ${U().toBn(p.animal_count)} ${U().en() ? 'animals' : 'পশু'}</p>
            <p class="text-body-sm">${U().en() ? 'Shed capacity' : 'শেড ধারণক্ষমতা'}: ${U().toBn(p.max_capacity || 0)}</p>
          </section>
          <section class="card" style="margin-bottom:16px;">
            <h3 class="text-h3">${U().en() ? 'Vaccination schedule' : 'টিকা সময়সূচি'}</h3>
            <ul id="vaccineList">${vaccines || '<li>—</li>'}</ul>
          </section>
          <a href="livestock.html" class="btn btn-primary btn-block">${U().en() ? 'Edit in livestock planner' : 'প্রাণিসম্পদ প্ল্যানারে সম্পাদনা'}</a>
        `;
        box.querySelectorAll('[data-complete]').forEach((btn) => {
          btn.addEventListener('click', () => this.completeVaccine(id, btn.getAttribute('data-complete'), btn));
        });
      } catch (e) {
        box.innerHTML = e.status === 404 ? this.notFound() : `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    async completeVaccine(planId, vaccineId, btn) {
      const li = btn.closest('li');
      li.classList.add('profile-vaccine-done');
      btn.remove();
      try {
        if (!api().isOnline()) {
          sync().enqueue({ type: 'complete_vaccine', payload: { planId, vaccineId } });
          return;
        }
        await folika().livestock.completeVaccine(planId, vaccineId);
      } catch (e) {
        li.classList.remove('profile-vaccine-done');
        li.appendChild(btn);
        alert(e.banglaMessage || (U().en() ? 'Failed' : 'ব্যর্থ'));
      }
    },

    async detailDiagnosis() {
      const id = qs('id');
      const box = document.getElementById('pageContent');
      if (!id) { box.innerHTML = this.notFound(); return; }
      try {
        const res = await api().cachedGet('/disease/' + id);
        const d = U().unwrap(res);
        if (!d) { box.innerHTML = this.notFound(); return; }
        box.innerHTML = `
          <section class="card">
            ${d.image_url ? `<img src="${U().esc(U().mediaUrl(d.image_url))}" alt="" style="max-width:100%;border-radius:8px;margin-bottom:12px;" loading="lazy">` : ''}
            <h2 class="text-h3">${U().esc(d.disease_name || '—')}</h2>
            <p class="text-body-sm">${U().esc(U().categoryLabel(d.category))} · ${U().esc(U().severityLabel(d.severity))} · ${U().toBn(Math.round(d.confidence_pct || 0))}%</p>
            <p class="text-body-sm" style="margin-top:12px;"><strong>${U().en() ? 'Treatment' : 'চিকিৎসা'}:</strong> ${U().esc(d.treatment_notes || '—')}</p>
            <p class="text-caption">${U().formatDate(d.analyzed_at || d.created_at)}</p>
          </section>`;
      } catch (e) {
        box.innerHTML = e.status === 404 ? this.notFound() : `<div class="profile-empty">${U().esc(e.banglaMessage)}</div>`;
      }
    },

    notFound() {
      return `<div class="profile-empty">${U().en() ? 'This record no longer exists.' : 'এই রেকর্ডটি আর নেই।'}
        <a href="profile.html" class="btn btn-primary" style="margin-top:12px;">${U().en() ? 'Back to profile' : 'প্রোফাইলে ফিরুন'}</a></div>`;
    },
  };

  document.addEventListener('DOMContentLoaded', () => Pages.init());
  global.FolikaProfilePages = Pages;
})(window);
