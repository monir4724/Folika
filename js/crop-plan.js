/**
 * FOLIKA — Crop Plan Wizard (ফসল পরিকল্পনা)
 */
(function (global) {
  'use strict';

  const api = () => global.FolikaAPI;
  const i18n = () => global.FolikaI18n;
  const loc = () => global.FolikaLocation;
  const reco = () => global.FolikaCropReco;

  const bnDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  function toBn(n) {
    if (i18n() && i18n().getLang() === 'en') return String(n);
    return String(n).replace(/\d/g, (d) => bnDigits[d]);
  }

  const CROP_PLANS_PURGE_KEY = 'folika_crop_plans_purged_20260830';

  const CropPlan = {
    plans: [],
    activePlanId: null,

    init() {
      const root = document.getElementById('cropPlanRoot');
      if (!root) return;
      if (!localStorage.getItem(CROP_PLANS_PURGE_KEY)) {
        localStorage.removeItem('folika_crop_plans');
        localStorage.setItem(CROP_PLANS_PURGE_KEY, '1');
      }
      this.loadPlans();
      this.bindRoot(root);
      this.bootstrapFromServer();
      this.render();
      if (!this._winBound) {
        this._winBound = true;
        window.addEventListener('folika:locationchange', () => this.onLocationChanged());
        window.addEventListener('folika:weatherchange', () => this.refreshIrrigation());
        window.addEventListener('folika:langchange', () => this.render());
      }
    },

    bindRoot(root) {
      if (root.dataset.cpBound === '1') return;
      root.dataset.cpBound = '1';
      const self = this;
      root.addEventListener('change', (e) => {
        if (self._suppressChange) return;
        const id = e.target && e.target.id;
        if (id === 'cpSeason') self.updateSeason();
        else if (id === 'cpCrop') self.updateCrop();
        else if (id === 'cpVariety') self.updateVariety();
        else if (id === 'cpShape') self.updateDimensions();
      });
      root.addEventListener('input', (e) => {
        const id = e.target && e.target.id;
        if (id === 'cpLength' || id === 'cpWidth') self.updateDimensions();
      });
      root.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-plan-id]');
        if (tab && root.contains(tab)) {
          self.activePlanId = tab.dataset.planId;
          self.render();
          return;
        }
        const id = e.target && e.target.id;
        if (id === 'btnCreateFirstPlan' || id === 'btnAddCropPlan') self.createPlan();
        if (id === 'btnDeleteCropPlan') self.deletePlan();
        if (id === 'btnHarvestYes') self.setHarvested(true);
        if (id === 'btnHarvestNo') self.setHarvested(false);
      });
    },

    onLocationChanged() {
      const zone = this.zone();
      const zid = zone && zone.id;
      if (zid && zid !== this._lastZoneId) {
        this._lastZoneId = zid;
        this.populateCropSelect();
      }
      this.updateZoneBanner(zone);
      this.syncAdvice();
    },

    loadPlans() {
      try {
        this.plans = JSON.parse(localStorage.getItem('folika_crop_plans') || '[]');
      } catch (e) {
        this.plans = [];
      }
      if (this.plans.length === 0) this.activePlanId = null;
      else if (!this.activePlanId) this.activePlanId = this.plans[0].id;
    },

    savePlans() {
      localStorage.setItem('folika_crop_plans', JSON.stringify(this.plans));
      this.scheduleServerSync();
    },

    scheduleServerSync() {
      clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(() => this.syncToServer(), 500);
    },

    async bootstrapFromServer() {
      const sync = global.FolikaPlanSync;
      if (!sync || !sync.loggedIn()) return;
      const mapped = await sync.pullCropsIfEmpty(this.plans, (list) => {
        this.plans = list;
        this.activePlanId = list[0] ? list[0].id : null;
        localStorage.setItem('folika_crop_plans', JSON.stringify(this.plans));
        this.render();
      });
      if (mapped && mapped.length) {
        this.plans = mapped;
        this.activePlanId = mapped[0].id;
      }
      await this.syncToServer();
    },

    async syncToServer() {
      const sync = global.FolikaPlanSync;
      if (!sync || !sync.loggedIn()) return;
      await sync.syncAllCrops(this.plans, () => {
        localStorage.setItem('folika_crop_plans', JSON.stringify(this.plans));
      });
    },

    createPlan() {
      const plan = {
        id: 'plan_' + Date.now(),
        name: (i18n() ? i18n().t('crop_new_plan') : 'নতুন ফসল পরিকল্পনা') + ' ' + (this.plans.length + 1),
        length: 0, width: 0, shape: 'rectangular',
        season: '', cropKey: '', varietyName: '',
        harvested: false, costs: {}, revenue: 0,
      };
      this.plans.push(plan);
      this.activePlanId = plan.id;
      this.savePlans();
      this.render();
    },

    deletePlan() {
      const plan = this.getActive();
      if (!plan) return;
      const ok = window.confirm(i18n() && i18n().getLang() === 'en'
        ? 'Delete this crop plan?'
        : 'এই ফসল পরিকল্পনাটি মুছে ফেলতে চান?');
      if (!ok) return;
      const serverId = plan.serverId;
      this.plans = this.plans.filter((p) => p.id !== plan.id);
      this.activePlanId = this.plans[0] ? this.plans[0].id : null;
      this.savePlans();
      this.render();
      if (serverId && api() && api().crops && api().crops.deletePlan) {
        api().crops.deletePlan(serverId).catch(() => {});
      }
    },

    getActive() {
      return this.plans.find((p) => p.id === this.activePlanId);
    },

    zone() {
      return reco() ? reco().resolveZone(loc() ? loc().state : {}) : null;
    },

    calcArea(length, width, shape) {
      const l = parseFloat(length) || 0;
      const w = parseFloat(width) || 0;
      let sqm = l * w;
      if (shape === 'triangular') sqm = (l * w) / 2;
      const shotok = sqm / 40.4686;
      const bigha = shotok / 33;
      return { sqm, bigha, shotok };
    },

    render() {
      const root = document.getElementById('cropPlanRoot');
      if (!root) return;
      const t = (k) => (i18n() ? i18n().t(k) : k);

      if (this.plans.length === 0) {
        root.innerHTML = `
          <section class="crop-empty-state card" aria-label="${t('crop_new_plan')}">
            <h2 class="text-h2 text-primary">${t('crop_new_plan')}</h2>
            <p class="text-body text-secondary" style="margin: 12px 0 20px;">${i18n().getLang() === 'en' ? 'Start your first crop plan to get location-based recommendations, rotation, irrigation and profit calculation.' : 'প্রথম ফসল পরিকল্পনা তৈরি করুন। আপনার বিভাগ, জেলা, উপজেলা, মাটি ও আবহাওয়া অনুযায়ী সুপারিশ, ফসল চক্র, সেচ ও লাভ-ক্ষতি হিসাব পাবেন।'}</p>
            <button type="button" class="btn btn-primary btn-lg" id="btnCreateFirstPlan">${t('crop_new_plan')}</button>
          </section>`;
        return;
      }

      const plan = this.getActive();
      const area = this.calcArea(plan.length, plan.width, plan.shape);
      const lang = i18n().getLang();
      const zone = this.zone();

      root.innerHTML = `
        <div class="plan-tabs-bar" style="margin-bottom:16px;">
          ${this.plans.map((p) => `<button type="button" class="plan-tab-btn ${p.id === this.activePlanId ? 'active' : ''}" data-plan-id="${p.id}">${p.name}</button>`).join('')}
          <button type="button" class="btn btn-sm btn-secondary" id="btnAddCropPlan">+ ${t('crop_new_plan')}</button>
        </div>

        <div id="cropLocationMount" class="folika-location-mount" style="margin-bottom:16px;"></div>
        <p id="cpZoneBanner" class="text-body-sm text-secondary" style="margin:-8px 0 16px;"></p>

        <section class="crop-plan-box card" aria-label="${plan.name}">
          <h2 class="text-h3 text-primary" style="margin-bottom:16px;">${plan.name}</h2>

          <div class="plan-inputs-bar">
            <div>
              <label class="form-label" for="cpLength">${t('crop_land_length')}</label>
              <input type="number" id="cpLength" class="form-control" value="${plan.length || ''}" min="0" step="0.1">
            </div>
            <div>
              <label class="form-label" for="cpWidth">${t('crop_land_width')}</label>
              <input type="number" id="cpWidth" class="form-control" value="${plan.width || ''}" min="0" step="0.1">
            </div>
            <div>
              <label class="form-label" for="cpShape">${t('crop_land_shape')}</label>
              <select id="cpShape" class="form-control">
                <option value="rectangular" ${plan.shape === 'rectangular' ? 'selected' : ''}>${t('shape_rectangular')}</option>
                <option value="triangular" ${plan.shape === 'triangular' ? 'selected' : ''}>${t('shape_triangular')}</option>
                <option value="irregular" ${plan.shape === 'irregular' ? 'selected' : ''}>${t('shape_irregular')}</option>
              </select>
            </div>
            <div class="calc-result-box">
              <span class="text-caption font-semibold text-primary">${t('crop_area_auto')}:</span>
              <span id="cpAreaDisplay" class="text-body-sm font-bold text-primary">
                ${toBn(area.shotok.toFixed(2))} ${lang === 'en' ? 'shotok' : 'শতাংশ'} (${toBn(area.bigha.toFixed(2))} ${lang === 'en' ? 'bigha' : 'বিঘা'} / ${toBn(Math.round(area.sqm))} ${lang === 'en' ? 'sqm' : 'বর্গমি'})
              </span>
            </div>
          </div>

          <div class="plan-workflow-grid">
            <div class="workflow-card">
              <h3 class="workflow-card-title">${t('crop_recommendation')}</h3>
              <p class="text-caption text-secondary" id="cpStepHint" style="margin-bottom:8px;"></p>
              <div class="form-group" data-cp-step="season"><label class="form-label" for="cpSeason">${t('crop_season')}</label>
                <select id="cpSeason" class="form-control">
                  <option value="">${lang === 'en' ? 'Select season…' : 'মৌসুম নির্বাচন করুন…'}</option>
                  <option value="rabi" ${plan.season === 'rabi' ? 'selected' : ''}>${reco() ? reco().seasonLabel('rabi') : (lang === 'en' ? 'Rabi' : 'রবি')}</option>
                  <option value="kharif_1" ${plan.season === 'kharif_1' ? 'selected' : ''}>${reco() ? reco().seasonLabel('kharif_1') : (lang === 'en' ? 'Kharif-1' : 'খরিপ-১')}</option>
                  <option value="kharif_2" ${plan.season === 'kharif_2' ? 'selected' : ''}>${reco() ? reco().seasonLabel('kharif_2') : (lang === 'en' ? 'Kharif-2' : 'খরিপ-২')}</option>
                </select>
              </div>
              <div class="form-group wf-hidden" data-cp-step="crop"><label class="form-label" for="cpCrop">${t('crop_select_crop')}</label>
                <select id="cpCrop" class="form-control"><option value="">${t('crop_select_crop')}</option></select>
              </div>
              <div class="form-group wf-hidden" data-cp-step="variety"><label class="form-label" for="cpVariety">${t('crop_select_variety')}</label>
                <select id="cpVariety" class="form-control"><option value="">${t('crop_select_variety')}</option></select>
              </div>
              <div id="cpVarietyMeta" class="text-caption text-secondary wf-hidden" data-cp-step="variety-meta" style="margin-bottom:8px;"></div>
              <div class="wf-hidden" data-cp-step="details">
                <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:0;">
                  <div class="text-caption font-bold text-primary">${t('crop_planting_method')}:</div>
                  <div id="cpPlanting" class="text-body-sm text-secondary" style="margin-top:4px;">—</div>
                </div>
                <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:8px 0 0;">
                  <div class="text-caption font-bold text-primary">${t('crop_soil_prep')}:</div>
                  <div id="cpSoilPrep" class="text-body-sm text-secondary" style="margin-top:4px;">—</div>
                </div>
                <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:8px 0 0;">
                  <div class="text-caption font-bold text-primary">${t('crop_fertilizer')}:</div>
                  <div id="cpFertilizer" class="text-body-sm text-secondary" style="margin-top:4px;">—</div>
                </div>
              </div>
            </div>

            <div class="workflow-card wf-hidden" data-cp-step="rotation-card">
              <h3 class="workflow-card-title">${t('crop_rotation')}</h3>
              <div id="cpRotationBox" class="text-body-sm text-secondary"></div>
            </div>

            <div class="workflow-card wf-hidden" data-cp-step="irrigation-card">
              <h3 class="workflow-card-title">${t('crop_irrigation')}</h3>
              <div id="cpIrrigationBox" class="text-body-sm"></div>
            </div>

            <div class="workflow-card wf-hidden" data-cp-step="calculator-card">
              <h3 class="workflow-card-title">${t('crop_calculator')}</h3>
              <div class="grid grid-cols-2 gap-8" id="cpCostInputs"></div>
              <div class="card" style="background:var(--color-error-tint);border:1px solid var(--color-error);padding:10px;margin:8px 0;">
                <div class="text-caption">${t('crop_total_cost')}:</div>
                <div id="cpTotalCost" class="text-h3 font-bold text-error">০ ৳</div>
              </div>
              <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:0;">
                <div class="text-caption">${t('crop_total_revenue')}:</div>
                <div id="cpTotalRevenue" class="text-h3 font-bold">০ ৳</div>
              </div>
              <div class="card" style="background:var(--color-primary-tint);border:2px solid var(--color-primary);padding:10px;margin:8px 0 0;">
                <div class="text-caption text-primary">${t('crop_net_profit')}:</div>
                <div id="cpNetProfit" class="text-h2 font-bold text-primary">০ ৳</div>
              </div>
            </div>
          </div>

          <section class="card" style="margin-top:16px;border:1px solid var(--color-accent);">
            <h3 class="text-h4">${t('crop_harvest_status')}</h3>
            <div class="flex gap-12 flex-wrap" style="margin-top:8px;">
              <button type="button" class="btn btn-sm ${plan.harvested ? 'btn-primary' : 'btn-secondary'}" id="btnHarvestYes">${t('crop_harvest_yes')}</button>
              <button type="button" class="btn btn-sm ${!plan.harvested ? 'btn-primary' : 'btn-secondary'}" id="btnHarvestNo">${t('crop_harvest_no')}</button>
            </div>
            <div id="cpHarvestCycleBox" class="text-body-sm text-secondary" style="margin-top:12px;"></div>
          </section>

          <section class="plan-actions-bar">
            <button type="button" class="btn btn-danger btn-plan-action" id="btnDeleteCropPlan">${t('crop_delete_plan')}</button>
          </section>
        </section>`;

      if (loc()) loc().renderBar(document.getElementById('cropLocationMount'));
      this._lastZoneId = (zone && zone.id) || this._lastZoneId;
      this.updateZoneBanner(zone);
      this.populateCropSelect();
      this.renderCostInputs();
      this.syncAdvice();
      this.applyCropStepVisibility();
    },

    hasLandDimensions(plan) {
      const l = parseFloat(plan && plan.length) || 0;
      const w = parseFloat(plan && plan.width) || 0;
      return l > 0 && w > 0;
    },

    applyCropStepVisibility() {
      const plan = this.getActive();
      if (!plan) return;
      const lang = i18n().getLang();
      const hasLand = this.hasLandDimensions(plan);
      const hasSeason = !!plan.season;
      const hasCrop = !!plan.cropKey;
      const hasVariety = !!plan.varietyName;
      const toggle = (step, show) => {
        document.querySelectorAll(`[data-cp-step="${step}"]`).forEach((el) => {
          el.classList.toggle('wf-hidden', !show);
        });
      };
      toggle('season', hasLand);
      toggle('crop', hasLand && hasSeason);
      toggle('variety', hasLand && hasSeason && hasCrop);
      toggle('variety-meta', hasLand && hasSeason && hasCrop && hasVariety);
      toggle('details', hasLand && hasSeason && hasCrop && hasVariety);
      toggle('rotation-card', hasLand && hasSeason && hasCrop);
      toggle('irrigation-card', hasLand && hasSeason && hasCrop && hasVariety);
      toggle('calculator-card', hasLand && hasSeason && hasCrop && hasVariety);
      const hint = document.getElementById('cpStepHint');
      if (hint) {
        if (!hasLand) {
          hint.textContent = lang === 'en'
            ? 'Enter land length and width first.'
            : 'প্রথমে জমির দৈর্ঘ্য ও প্রস্থ লিখুন।';
        } else if (!hasSeason) {
          hint.textContent = lang === 'en' ? 'Select a season to continue.' : 'মৌসুম নির্বাচন করুন।';
        } else if (!hasCrop) {
          hint.textContent = lang === 'en' ? 'Select a crop for recommendations.' : 'ফসল নির্বাচন করুন।';
        } else if (!hasVariety) {
          hint.textContent = lang === 'en' ? 'Select a variety to see planting advice.' : 'জাত নির্বাচন করুন।';
        } else {
          hint.textContent = lang === 'en' ? 'All steps complete — review rotation, irrigation and profit below.' : 'সব ধাপ সম্পন্ন — নিচে চক্র, সেচ ও লাভ দেখুন।';
        }
      }
    },

    updateZoneBanner(zone) {
      const el = document.getElementById('cpZoneBanner');
      if (!el || !zone) return;
      const en = i18n().getLang() === 'en';
      const locState = loc() ? loc().state : {};
      const place = locState.label || locState.districtNameBn || '';
      el.textContent = en
        ? `Advice for ${place || 'your land'}: ${zone.en}. ${zone.soil_en}`
        : `${place ? place + ' — ' : ''}${zone.bn}। ${zone.soil_bn}`;
    },

    updateDimensions() {
      const plan = this.getActive();
      if (!plan) return;
      plan.length = parseFloat(document.getElementById('cpLength').value) || 0;
      plan.width = parseFloat(document.getElementById('cpWidth').value) || 0;
      plan.shape = document.getElementById('cpShape').value;
      const area = this.calcArea(plan.length, plan.width, plan.shape);
      const lang = i18n().getLang();
      document.getElementById('cpAreaDisplay').textContent =
        `${toBn(area.shotok.toFixed(2))} ${lang === 'en' ? 'shotok' : 'শতাংশ'} (${toBn(area.bigha.toFixed(2))} ${lang === 'en' ? 'bigha' : 'বিঘা'} / ${toBn(Math.round(area.sqm))} ${lang === 'en' ? 'sqm' : 'বর্গমি'})`;
      this.savePlans();
      this.recalcProfit();
      this.applyCropStepVisibility();
    },

    updateSeason() {
      const plan = this.getActive();
      if (!plan) return;
      const el = document.getElementById('cpSeason');
      plan.season = el ? el.value : plan.season;
      plan.cropKey = '';
      plan.varietyName = '';
      this.savePlans();
      this.populateCropSelect();
      this.syncAdvice();
      this.applyCropStepVisibility();
    },

    updateCrop() {
      const plan = this.getActive();
      if (!plan) return;
      const el = document.getElementById('cpCrop');
      plan.cropKey = el ? el.value : '';
      plan.varietyName = '';
      this.savePlans();
      this.populateVarietySelect();
      this.syncAdvice();
      this.applyCropStepVisibility();
    },

    updateVariety() {
      const plan = this.getActive();
      if (!plan) return;
      const el = document.getElementById('cpVariety');
      plan.varietyName = el ? (el.value || '') : '';
      this.savePlans();
      this.syncAdvice();
      this.applyCropStepVisibility();
    },

    syncAdvice() {
      this.updatePlantingInfo();
      this.updateVarietyMeta();
      this.refreshRecommendations();
      this.refreshIrrigation();
      this.recalcProfit();
      this.updateHarvestCycle();
    },

    populateCropSelect() {
      const plan = this.getActive();
      const sel = document.getElementById('cpCrop');
      if (!sel || !plan) return;
      this._suppressChange = true;
      const zone = this.zone();
      const crops = reco() ? reco().cropsFor(zone, plan.season) : [];
      const lang = i18n().getLang();
      sel.innerHTML = `<option value="">${i18n().t('crop_select_crop')}</option>`;
      crops.forEach((c) => {
        const opt = document.createElement('option');
        opt.value = c.crop;
        opt.textContent = lang === 'en' ? `${c.crop_en} (${c.variety})` : `${c.crop} — ${c.variety}`;
        if (plan.cropKey === c.crop) opt.selected = true;
        sel.appendChild(opt);
      });
      if (plan.cropKey && !crops.some((c) => c.crop === plan.cropKey)) {
        plan.cropKey = '';
        plan.varietyName = '';
      }
      this.populateVarietySelect();
      this._suppressChange = false;
    },

    populateVarietySelect() {
      const plan = this.getActive();
      const sel = document.getElementById('cpVariety');
      if (!sel || !plan) return;
      const wasSuppress = this._suppressChange;
      this._suppressChange = true;
      const zone = this.zone();
      const vars = reco() ? reco().varietiesFor(zone, plan.cropKey) : [];
      const lang = i18n().getLang();
      sel.innerHTML = `<option value="">${i18n().t('crop_select_variety')}</option>`;
      vars.forEach((v) => {
        const opt = document.createElement('option');
        opt.value = v.name;
        const tag = v.recommended ? (lang === 'en' ? 'recommended' : 'সুপারিশকৃত') : '';
        opt.textContent = tag ? `${v.name} (${tag})` : v.name;
        if (plan.varietyName === v.name) opt.selected = true;
        sel.appendChild(opt);
      });
      if (!plan.varietyName && vars[0] && plan.cropKey) {
        /* do not auto-select — user picks variety explicitly */
      }
      this._suppressChange = wasSuppress;
      this.applyCropStepVisibility();
    },

    updateVarietyMeta() {
      const el = document.getElementById('cpVarietyMeta');
      const plan = this.getActive();
      if (!el || !plan || !reco()) return;
      const zone = this.zone();
      const vars = reco().varietiesFor(zone, plan.cropKey);
      const v = vars.find((x) => x.name === plan.varietyName) || vars[0];
      const rec = reco().findCrop(zone, plan.cropKey);
      if (!v && !rec) { el.textContent = ''; return; }
      const lang = i18n().getLang();
      const dur = (v && v.duration) || (rec && rec.duration) || '';
      const yld = (v && v.yield_t_ha) || (rec && rec.yield_t_ha);
      const year = (v && v.year) || (rec && rec.year);
      const reason = (v && v.reason) || (v && v.situation) || (rec && rec.reason) || '';
      el.textContent = lang === 'en'
        ? `${reason} · Duration ${dur || '—'} days · Yield ${yld || '—'} t/ha · Released ${year || '—'}`
        : `${reason} · জীবনকাল ${dur || '—'} দিন · ফলন ${yld || '—'} টন/হেক্টর · অবমুক্তি ${year || '—'}`;
    },

    updatePlantingInfo() {
      const plan = this.getActive();
      if (!plan) return;
      const info = reco() ? reco().planting(plan.cropKey) : { method: '—', soil: '—', fertilizer: '—' };
      const SL = global.FolikaSuggestList;
      const plantEl = document.getElementById('cpPlanting');
      const soilEl = document.getElementById('cpSoilPrep');
      const fertEl = document.getElementById('cpFertilizer');
      const fmt = (text) => (SL && text && text !== '—' ? SL.paragraphToList(text) : (text || '—'));
      if (plantEl) plantEl.innerHTML = plan.cropKey && plan.varietyName ? fmt(info.method) : '—';
      if (soilEl) soilEl.innerHTML = plan.cropKey && plan.varietyName ? fmt(info.soil) : '—';
      if (fertEl) fertEl.innerHTML = plan.cropKey && plan.varietyName ? fmt(info.fertilizer) : '—';
    },

    refreshRecommendations() {
      const plan = this.getActive();
      const box = document.getElementById('cpRotationBox');
      if (!box || !plan) return;
      if (!plan.cropKey) {
        box.innerHTML = '';
        return;
      }
      const zone = this.zone();
      if (reco()) {
        box.innerHTML = reco().rotationHtml(zone, plan.cropKey, plan.season, plan.harvested, plan.varietyName);
      }
      if (api() && api().Session && api().Session.isLoggedIn() && api().crops.rotationAdvice && plan.cropKey) {
        api().crops.rotationAdvice({
          target_crop: plan.cropKey,
          previous_crop: plan.harvested ? plan.cropKey : '',
        }).then((res) => {
          const d = (res && res.data) ? res.data : res;
          const note = d && (d.advice_bn || d.advice_en || d.message);
          if (!note || !box) return;
          const extra = document.createElement('div');
          extra.className = 'text-caption text-secondary';
          extra.style.marginTop = '8px';
          extra.textContent = note;
          box.appendChild(extra);
        }).catch(() => {});
      }
    },

    refreshIrrigation() {
      const plan = this.getActive();
      const box = document.getElementById('cpIrrigationBox');
      if (!box || !plan) return;
      if (!plan.cropKey || !plan.varietyName) {
        box.innerHTML = '';
        return;
      }
      const zone = this.zone();
      const weather = loc() && loc().lastWeather;
      const forecast = loc() && loc().lastForecast;
      const token = (this._irrToken = (this._irrToken || 0) + 1);

      if (reco()) {
        box.innerHTML = reco().irrigationHtml(plan.cropKey, zone, weather, forecast, plan.varietyName);
      }

      if (api() && !forecast) {
        const query = {};
        if (loc() && loc().state.lat) { query.lat = loc().state.lat; query.lon = loc().state.lon; }
        if (loc() && loc().state.backendUpazilaId) query.upazila_id = loc().state.backendUpazilaId;
        api().weather.forecast(query).then((res) => {
          if (token !== this._irrToken) return;
          const data = (res && res.data) ? res.data : res;
          if (loc()) loc().lastForecast = data;
          const p = this.getActive();
          if (p && reco() && p.cropKey && p.varietyName) {
            box.innerHTML = reco().irrigationHtml(p.cropKey, this.zone(), loc().lastWeather, data, p.varietyName);
          }
        }).catch(() => { /* keep immediate advice */ });
      }
      this.applyCropStepVisibility();
    },

    renderCostInputs() {
      const lang = i18n().getLang();
      const labels = lang === 'en'
        ? ['Seed', 'Fertilizer', 'Labor', 'Irrigation', 'Pesticide', 'Tillage']
        : ['বীজ', 'সার', 'শ্রমিক', 'সেচ', 'কীটনাশক', 'চাষ/লাঙল'];
      const keys = ['seed', 'fert', 'labor', 'irrigation', 'pesticide', 'tillage'];
      const plan = this.getActive();
      const box = document.getElementById('cpCostInputs');
      if (!box) return;
      box.innerHTML = keys.map((k, i) => `
        <div class="form-group" style="margin:0;">
          <label class="form-label" for="cost_${k}">${labels[i]} (৳)</label>
          <input type="number" id="cost_${k}" class="form-control cp-cost-input" data-cost-key="${k}" value="${(plan.costs && plan.costs[k]) || ''}" min="0">
        </div>`).join('');

      box.querySelectorAll('.cp-cost-input').forEach((inp) => {
        inp.addEventListener('input', () => {
          if (!plan.costs) plan.costs = {};
          plan.costs[inp.dataset.costKey] = parseFloat(inp.value) || 0;
          this.savePlans();
          this.recalcProfit();
        });
      });
    },

    recalcProfit() {
      const plan = this.getActive();
      if (!plan) return;
      const area = this.calcArea(plan.length, plan.width, plan.shape);
      let totalCost = 0;
      if (plan.costs) Object.values(plan.costs).forEach((v) => { totalCost += parseFloat(v) || 0; });

      const zone = this.zone();
      const cropRec = reco() ? reco().findCrop(zone, plan.cropKey) : null;
      const revenue = reco() && cropRec
        ? reco().revenue(cropRec, area.shotok)
        : 0;
      const profit = revenue - totalCost;

      const fmt = (n) => toBn(Math.round(n).toLocaleString(i18n().getLang() === 'en' ? 'en-BD' : 'bn-BD'));
      const costEl = document.getElementById('cpTotalCost');
      const revEl = document.getElementById('cpTotalRevenue');
      const profEl = document.getElementById('cpNetProfit');
      if (costEl) costEl.textContent = fmt(totalCost) + ' ৳';
      if (revEl) revEl.textContent = fmt(revenue) + ' ৳';
      if (profEl) profEl.textContent = (profit >= 0 ? '+' : '') + fmt(profit) + ' ৳';
      plan.revenue = revenue;
      this.savePlans();
    },

    setHarvested(val) {
      const plan = this.getActive();
      if (!plan) return;
      if (val) {
        const ok = window.confirm(i18n() && i18n().getLang() === 'en'
          ? 'Mark this crop as harvested? The next season cycle will start.'
          : 'ফসল কাটা হয়েছে চিহ্নিত করবেন? পরবর্তী মৌসুমের চক্র শুরু হবে।');
        if (!ok) return;
      }
      plan.harvested = val;
      if (val && reco()) {
        const zone = this.zone();
        plan.season = reco().nextSeason(plan.season);
        const nextCrops = reco().cropsFor(zone, plan.season);
        const legumes = nextCrops.filter((c) => /মসুর|সয়াবিন|সরিষা/.test(c.crop));
        const pick = legumes[0] || nextCrops[0];
        plan.cropKey = pick ? pick.crop : '';
        plan.varietyName = pick ? pick.variety : '';
      }
      this.savePlans();
      this.render();
    },

    updateHarvestCycle() {
      const plan = this.getActive();
      const box = document.getElementById('cpHarvestCycleBox');
      if (!box) return;
      const lang = i18n().getLang();
      if (plan.harvested) {
        const msg = lang === 'en'
          ? 'Harvest marked. Crop list, rotation, irrigation and calculator now follow the next season for this location.'
          : 'ফসল কাটা চিহ্নিত হয়েছে। সুপারিশ, ফসল চক্র, সেচ ও হিসাব এখন এই এলাকার পরবর্তী মৌসুম অনুযায়ী চলবে।';
        box.innerHTML = global.FolikaSuggestList ? global.FolikaSuggestList.paragraphToList(msg) : msg;
      } else {
        const msg = lang === 'en'
          ? 'Mark harvest when done to start the next crop cycle for this plan.'
          : 'ফসল কাটার পর "হ্যাঁ" চাপুন — পরবর্তী ফসল চক্র শুরু হবে।';
        box.innerHTML = global.FolikaSuggestList ? global.FolikaSuggestList.paragraphToList(msg) : msg;
      }
    },
  };

  global.FolikaCropPlan = CropPlan;
})(window);
