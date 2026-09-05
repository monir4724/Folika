/**
 * FOLIKA — Fish plans + depth → layer boxes (backend, local fallback)
 */
(function (global) {
  'use strict';

  const i18n = () => global.FolikaI18n;
  const Data = () => global.FolikaFishData;

  function en() {
    return i18n() && i18n().getLang() === 'en';
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function parseFtValue(raw) {
    const bn = '০১২৩৪৫৬৭৮৯';
    const s = String(raw == null ? '' : raw).trim().replace(/[০-৯]/g, (ch) => String(bn.indexOf(ch)));
    if (!s) return null;
    const n = Number(s);
    if (!Number.isFinite(n) || n <= 0) return null;
    return n;
  }

  function depthFt() {
    const el = document.getElementById('fishPondDepth');
    return parseFtValue(el && el.value);
  }

  function pondSqft() {
    const L = parseFtValue((document.getElementById('fishPondLength') || {}).value) || 0;
    const W = parseFtValue((document.getElementById('fishPondWidth') || {}).value) || 0;
    return L * W;
  }

  function shotokFromSqft(sqft) {
    return sqft / 435.6;
  }

  const FishPlan = {
    plans: [],
    activePlanId: null,
    _layerTimer: null,
    _apiSeq: 0,
    lastAdvice: null,
    lastDepthFt: null,

    init() {
      if (!document.getElementById('fishPlanRoot')) return;
      this.ensureClientKey();
      this.load();
      this.loadReminders();
      if (this.plans.length === 0) this.createPlan(true);
      this.bind();
      this.renderTabs();
      this.applyActiveToForm();
      this.renderReminders();
      this._locKey = this.locationKey();
      this.paintAreaOnly();
      this.applyFishStepVisibility();
      this.pullServerThenSync();
      window.addEventListener('folika:langchange', () => {
        this.renderTabs();
        this.measureLayersFromBackend();
        this.renderReminders();
      });
      window.addEventListener('folika:locationchange', () => {
        const next = this.locationKey();
        if (next === this._locKey) return;
        this._locKey = next;
        const p = this.getActive();
        if (p) p.picks = {};
        if (this.lastAdvice) {
          const parsed = depthFt();
          const d = parsed != null ? Math.round(parsed) : this.lastDepthFt;
          if (d) this.paintLayerCards(this.lastAdvice, d);
        } else {
          this.measureLayersFromBackend();
        }
      });
    },

    bind() {
      const root = document.getElementById('fishPlanRoot');
      if (!root || root.dataset.fpBound === '1') return;
      root.dataset.fpBound = '1';
      const self = this;
      root.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-fish-plan]');
        if (tab) {
          self.saveFormToActive();
          self.activePlanId = tab.dataset.fishPlan;
          self.renderTabs();
          self.applyActiveToForm();
          self.refreshLayers();
          return;
        }
        if (e.target.closest('#btnAddFishPlan, #btnAddFishPlanBottom')) self.createPlan();
        if (e.target.closest('#btnDeleteFishPlan')) self.deletePlan();
        if (e.target.closest('#btnEditFishPlan')) {
          self.saveFormToActive();
          self.openEditModal();
        }
      });
      root.addEventListener('change', (e) => {
        if (e.target.matches('[data-fish-layer-select]')) {
          self.onFishPick(e.target);
          self.saveFormToActive();
        }
        if (e.target.id === 'fishCultureDuration') {
          self.saveFormToActive();
          self.applyFishStepVisibility();
        }
      });
      ['fishPondLength', 'fishPondWidth'].forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', () => {
          self.saveFormToActive();
          self.paintAreaOnly();
          self.applyFishStepVisibility();
        });
        el.addEventListener('change', () => {
          self.saveFormToActive();
          self.paintAreaOnly();
          self.applyFishStepVisibility();
        });
      });
      const depthEl = document.getElementById('fishPondDepth');
      const calcBtn = document.getElementById('btnFishCalcLayers');
      if (calcBtn) {
        calcBtn.addEventListener('click', () => {
          self.saveFormToActive();
          self.measureLayersFromBackend();
        });
      }
      if (depthEl) {
        depthEl.addEventListener('keydown', (e) => {
          if (e.key !== 'Enter') return;
          e.preventDefault();
          self.saveFormToActive();
          self.measureLayersFromBackend();
        });
        depthEl.addEventListener('change', () => {
          const p = self.getActive();
          if (p) { p.layersReady = false; p.picks = {}; }
          self.saveFormToActive();
          self.measureLayersFromBackend();
        });
        depthEl.addEventListener('blur', () => {
          self.saveFormToActive();
        });
      }
      const editForm = document.getElementById('fishEditPlanForm');
      if (editForm) {
        editForm.addEventListener('submit', (e) => {
          e.preventDefault();
          self.applyEditModal();
        });
      }
      const remForm = document.getElementById('fishReminderForm');
      if (remForm) {
        remForm.addEventListener('submit', (e) => {
          e.preventDefault();
          self.addReminder();
        });
      }
      const remList = document.getElementById('fishReminderList');
      if (remList) {
        remList.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-del-reminder]');
          if (!btn) return;
          self.deleteReminder(btn.getAttribute('data-del-reminder'));
        });
      }
    },

    scheduleLayers() {
      clearTimeout(this._layerTimer);
      this._layerTimer = setTimeout(() => this.measureLayersFromBackend(), 0);
    },

    load() {
      try {
        this.plans = JSON.parse(localStorage.getItem('folika_fish_plans') || '[]');
      } catch (e) {
        this.plans = [];
      }
      this.plans.forEach((p) => this.normalizePlan(p));
      if (this.plans.length && !this.activePlanId) this.activePlanId = this.plans[0].id;
    },

    normalizePlan(p) {
      if (!p.picks) p.picks = {};
      /* legacy fields ignored — user must pick fish manually per layer */
    },

    save() {
      localStorage.setItem('folika_fish_plans', JSON.stringify(this.plans));
      this.scheduleServerSync();
    },

    getActive() {
      return this.plans.find((p) => p.id === this.activePlanId);
    },

    createPlan(silent) {
      const n = this.plans.length + 1;
      const plan = {
        id: 'fish_' + Date.now(),
        name: (en() ? 'Fish plan ' : 'মৎস্য পরিকল্পনা ') + n,
        length: '',
        width: '',
        depth: '',
        duration: '',
        picks: {},
        layersReady: false,
      };
      this.plans.push(plan);
      this.activePlanId = plan.id;
      this.save();
      if (!silent) {
        this.renderTabs();
        this.applyActiveToForm();
        this.applyFishStepVisibility();
      }
    },

    hasPondSize() {
      const L = parseFtValue((document.getElementById('fishPondLength') || {}).value) || 0;
      const W = parseFtValue((document.getElementById('fishPondWidth') || {}).value) || 0;
      return L > 0 && W > 0;
    },

    allLayersPicked() {
      const p = this.getActive();
      if (!p || !p.layersReady || !this.lastAdvice) return false;
      const layers = (this.lastAdvice.layers || []);
      if (!layers.length) return false;
      return layers.every((layer) => p.picks && p.picks[layer.key]);
    },

    applyFishStepVisibility() {
      const p = this.getActive();
      const hasSize = this.hasPondSize();
      const depth = depthFt();
      const hasDepth = depth != null && depth > 0;
      const layersReady = !!(p && p.layersReady && this.lastAdvice);
      const allPicked = this.allLayersPicked();
      const hasDuration = !!(p && p.duration);
      const toggle = (step, show) => {
        document.querySelectorAll(`[data-fish-step="${step}"]`).forEach((el) => {
          el.classList.toggle('wf-hidden', !show);
        });
      };
      toggle('duration', layersReady && allPicked);
      toggle('layers-summary', layersReady);
      toggle('layer-cards', layersReady);
      toggle('prep', layersReady && allPicked && hasDuration);
      const hint = document.getElementById('fishStepHint');
      if (hint) {
        if (!hasSize) {
          hint.textContent = en() ? 'Enter pond length and width first.' : 'প্রথমে পুকুরের দৈর্ঘ্য ও প্রস্থ লিখুন।';
        } else if (!hasDepth) {
          hint.textContent = en() ? 'Enter depth in feet, then press Calculate layers.' : 'গভীরতা (ফুট) লিখে «স্তর হিসাব» চাপুন।';
        } else if (!layersReady) {
          hint.textContent = en() ? 'Press Calculate layers to see fish options.' : '«স্তর হিসাব» চাপলে মাছের স্তর দেখাবে।';
        } else if (!allPicked) {
          hint.textContent = en() ? 'Select a fish for each layer.' : 'প্রতিটি স্তরে মাছ নির্বাচন করুন।';
        } else if (!hasDuration) {
          hint.textContent = en() ? 'Select culture duration.' : 'চাষের মেয়াদ নির্বাচন করুন।';
        } else {
          hint.textContent = en() ? 'All steps complete — review pond prep below.' : 'সব ধাপ সম্পন্ন — নিচে পুকুর প্রস্তুতি দেখুন।';
        }
      }
    },

    deletePlan() {
      if (this.plans.length <= 1) {
        window.alert(en() ? 'Keep at least one fish plan, or edit this one.' : 'কমপক্ষে একটি মৎস্য পরিকল্পনা রাখুন।');
        return;
      }
      if (!window.confirm(en() ? 'Delete this fish plan?' : 'এই মৎস্য পরিকল্পনাটি মুছতে চান?')) return;
      const gone = this.plans.find((p) => p.id === this.activePlanId);
      this.plans = this.plans.filter((p) => p.id !== this.activePlanId);
      this.activePlanId = this.plans[0].id;
      this.save();
      this.renderTabs();
      this.applyActiveToForm();
      this.refreshLayers();
      const api = global.FolikaAPI && global.FolikaAPI.fish;
      if (gone && gone.serverId && api && api.deletePlan) {
        api.deletePlan(gone.serverId).catch(() => {});
      }
    },

    renderTabs() {
      const bar = document.getElementById('fishPlanTabs');
      if (!bar) return;
      bar.innerHTML = this.plans.map((p) =>
        `<button type="button" class="plan-tab-btn ${p.id === this.activePlanId ? 'active active-fish' : ''}" data-fish-plan="${p.id}">${esc(p.name)}</button>`
      ).join('') + `<button type="button" class="btn btn-sm btn-secondary" id="btnAddFishPlan">+</button>`;
    },

    applyActiveToForm() {
      const p = this.getActive();
      if (!p) return;
      const depthEl = document.getElementById('fishPondDepth');
      const editingDepth = depthEl && document.activeElement === depthEl;
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      set('fishPondLength', p.length);
      set('fishPondWidth', p.width);
      if (!editingDepth) set('fishPondDepth', p.depth);
      set('fishCultureDuration', p.duration);
    },

    saveFormToActive() {
      const p = this.getActive();
      if (!p) return;
      const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
      p.length = val('fishPondLength');
      p.width = val('fishPondWidth');
      p.depth = val('fishPondDepth');
      p.duration = val('fishCultureDuration');
      this.normalizePlan(p);
      const box = document.getElementById('fishLayerBoxesContainer');
      if (box) {
        box.querySelectorAll('[data-fish-layer-select]').forEach((sel) => {
          p.picks[sel.dataset.layerKey] = sel.value;
        });
      }
      this.save();
    },

    persistForm() {
      this.saveFormToActive();
    },

    localAdvice(d) {
      const D = Data();
      if (!D) {
        return {
          layer_count: d >= 6 ? 3 : d >= 4 ? 2 : 1,
          reason_bn: '',
          layers: [],
        };
      }
      const L = D.layersForDepthFt(d);
      return {
        layer_count: L.count,
        reason_bn: L.reason_bn,
        reason_en: L.reason_en,
        layers: L.keys.map((key) => ({
          key,
          title_bn: D.layerMeta[key].bn,
          species_ids: D.speciesForLayer(key, d).map((s) => s.id),
        })),
      };
    },

    async refreshLayers() {
      return this.measureLayersFromBackend();
    },

    paintAreaOnly() {
      const sqft = pondSqft();
      const shotok = shotokFromSqft(sqft);
      const areaEl = document.getElementById('fishPondAreaDisplay');
      if (areaEl) {
        const sh = shotok.toFixed(2);
        const sf = Math.round(sqft).toLocaleString(en() ? 'en-US' : 'bn-BD');
        areaEl.textContent = en()
          ? `${sh} shotok (${sf} sq ft)`
          : `${sh} শতাংশ (${sf} বর্গফুট)`;
      }
      this.paintPrep(shotok);
    },

    async measureLayersFromBackend() {
      const parsed = depthFt();
      const d = parsed != null ? parsed : this.lastDepthFt;
      const display = document.getElementById('fishLayerCountDisplay');
      if (parsed == null) {
        if (display && this.lastDepthFt == null) {
          display.innerHTML = en()
            ? '<strong>Enter pond depth</strong> — type a number in feet, then press Enter.'
            : '<strong>গভীরতা লিখুন</strong> — ফুটে পূর্ণ সংখ্যা দিয়ে Enter চাপুন, তারপর স্তর মাপা হবে।';
        }
        this.paintAreaOnly();
        this.applyFishStepVisibility();
        return;
      }

      this.lastDepthFt = d;
      const depthInt = Math.max(1, Math.round(d));
      const sqft = pondSqft();
      const shotok = shotokFromSqft(sqft);
      const seq = ++this._apiSeq;
      if (display) {
        display.innerHTML = en()
          ? `<strong>Measuring…</strong> ${depthInt} ft — asking the server how many layers to use.`
          : `<strong>মাপ করা হচ্ছে…</strong> ${depthInt} ফুট — ব্যাকএন্ড থেকে স্তর সংখ্যা নেওয়া হচ্ছে।`;
      }

      let advice = this.localAdvice(depthInt);
      const api = global.FolikaAPI && global.FolikaAPI.fish;
      if (api && typeof api.calculateLayers === 'function') {
        try {
          const res = await api.calculateLayers({
            pond_depth_ft: depthInt,
            pond_length_ft: parseFtValue((document.getElementById('fishPondLength') || {}).value) || 0,
            pond_width_ft: parseFtValue((document.getElementById('fishPondWidth') || {}).value) || 0,
          });
          const data = res && (res.data || res);
          const count = data && Number(data.layer_count);
          if (count > 0 && Array.isArray(data.layers) && seq === this._apiSeq) {
            advice = data;
          }
        } catch (e) {
          /* localAdvice already set */
        }
      }
      if (seq !== this._apiSeq) return;
      const p = this.getActive();
      this.lastAdvice = advice;
      if (p) {
        p.layersReady = true;
        p.picks = {};
      }
      this.save();
      this.paintSummary(advice, sqft, shotok, depthInt);
      this.paintPrep(shotok);
      this.paintLayerCards(advice, depthInt);
      this.applyFishStepVisibility();
    },

    paintSummary(advice, sqft, shotok, d) {
      const n = advice.layer_count || 0;
      const bnN = n === 1 ? '১' : n === 2 ? '২' : '৩';
      const display = document.getElementById('fishLayerCountDisplay');
      const reason = en() ? (advice.reason_en || advice.reason_bn || '') : (advice.reason_bn || '');
      if (display) {
        display.innerHTML = en()
          ? `<strong>${n} layer${n === 1 ? '' : 's'}</strong> — ${esc(reason)}`
          : `<strong>${bnN} টি স্তর</strong> — ${esc(reason)}`;
      }
      const areaEl = document.getElementById('fishPondAreaDisplay');
      if (areaEl) {
        const sh = shotok.toFixed(2);
        const sf = Math.round(sqft).toLocaleString(en() ? 'en-US' : 'bn-BD');
        areaEl.textContent = en()
          ? `${sh} shotok (${sf} sq ft)`
          : `${sh} শতাংশ (${sf} বর্গফুট)`;
      }
    },

    paintPrep(shotok) {
      const s = Math.max(shotok, 0);
      const badge = document.getElementById('fishPrepBadge');
      if (badge) {
        badge.textContent = en()
          ? `Calculated for ${s.toFixed(1)} shotok`
          : `${s.toFixed(1)} শতাংশ পুকুরের জন্য হিসাব`;
      }
      const lime = document.getElementById('fishLimeDose');
      if (lime) lime.textContent = en()
        ? `1 kg per shotok (total ${(s * 1).toFixed(1)} kg)`
        : `প্রতি শতকে ১ কেজি (মোট ${(s * 1).toFixed(1)} কেজি)`;
      const dung = document.getElementById('fishDungDose');
      if (dung) dung.textContent = en()
        ? `5–6 kg per shotok (about ${(s * 5.5).toFixed(0)} kg)`
        : `প্রতি শতকে ৫–৬ কেজি (প্রায় ${(s * 5.5).toFixed(0)} কেজি)`;
      const urea = document.getElementById('fishUreaDose');
      if (urea) urea.textContent = en()
        ? `Urea 150 g + TSP 75 g / shotok`
        : `ইউরিয়া ১৫০ গ্রাম + টিএসপি ৭৫ গ্রাম / শতক`;
      const zeo = document.getElementById('fishZeoliteDose');
      if (zeo) zeo.textContent = en()
        ? `About 500 g / shotok as needed`
        : `প্রয়োজন অনুযায়ী ৫০০ গ্রাম / শতক`;
    },

    locState() {
      return (global.FolikaLocation && global.FolikaLocation.state) || {};
    },

    locationKey() {
      const s = this.locState();
      return [s.divisionId || '', s.districtId || '', s.upazilaId || ''].join('|');
    },

    placeLabel() {
      const s = this.locState();
      return s.upazilaNameBn || s.districtNameBn || s.divisionNameBn || s.label || '';
    },

    paintLayerCards(advice, d) {
      const box = document.getElementById('fishLayerBoxesContainer');
      const D = Data();
      if (!box || !D) return;
      const layers = advice.layers || [];
      const n = layers.length || advice.layer_count || 1;
      box.className = n === 1
        ? 'grid grid-cols-1 gap-16'
        : n === 2
          ? 'grid grid-cols-1 grid-cols-md-2 gap-16'
          : 'grid grid-cols-1 grid-cols-md-3 gap-16';
      box.style.marginBottom = '24px';
      const p = this.getActive();
      const picks = (p && p.picks) || {};
      const loc = this.locState();
      const place = this.placeLabel();

      box.innerHTML = layers.map((layer, i) => {
        const key = layer.key;
        const meta = D.layerMeta[key] || { bn: key, en: key, badge: '' };
        let list = D.speciesForLayer(key, d);
        if (layer.species_ids && layer.species_ids.length) {
          const allow = {};
          layer.species_ids.forEach((id) => { allow[id] = true; });
          const filtered = list.filter((s) => allow[s.id] && s.min_ft <= d + 0.25);
          if (filtered.length) list = filtered;
        }
        if (typeof D.rankForLayer === 'function' && loc && (loc.upazilaId || loc.districtId)) {
          const ranked = D.rankForLayer(key, d, loc);
          const order = {};
          ranked.forEach((s, idx) => { order[s.id] = idx; });
          list = list.slice().sort((a, b) => (order[a.id] ?? 999) - (order[b.id] ?? 999));
        }
        const selected = picks[key] || '';
        const title = en() ? `${i + 1}. ${meta.en}` : `${i + 1}. ${meta.bn}`;
        const badge = en() ? (key === 'shallow' ? 'Shallow pond' : meta.en) : meta.badge;
        const opts = `<option value="">${en() ? '— Select fish —' : '— মাছ নির্বাচন করুন —'}</option>` + list.map((s) => {
          const label = en() ? `${s.name_en} (${s.name_bn})` : s.name_bn;
          return `<option value="${esc(s.id)}" ${s.id === selected ? 'selected' : ''}>${esc(label)}</option>`;
        }).join('');
        const fish = selected ? D.find(selected) : null;
        const locHint = place
          ? (en() ? `All suitable fish for ${place} — ranked for this layer` : `${place} — এই স্তরের উপযুক্ত সব মাছের তালিকা`)
          : (en() ? 'Set location to rank fish for your area' : 'লোকেশন দিলে এলাকা অনুযায়ী মাছ সাজানো হবে');
        return `<div class="card card-domain-fish" data-layer-card="${esc(key)}" data-fish-layer-step="${i}">
          <div class="card-header" style="margin-bottom: 10px;">
            <h3 class="card-title text-fish">${esc(title)}</h3>
            <span class="badge badge-fish">${esc(badge)}</span>
          </div>
          <div class="form-group">
            <label class="form-label" for="fishSel_${esc(key)}">${en() ? 'Choose fish for this layer' : 'এই স্তরের মাছ নির্বাচন করুন'}:</label>
            <p class="text-caption text-secondary" style="margin: 0 0 6px;">${esc(locHint)}</p>
            <select id="fishSel_${esc(key)}" class="form-control" data-fish-layer-select data-layer-key="${esc(key)}" size="1">${opts}</select>
          </div>
          ${this.feedHtml(fish)}
        </div>`;
      }).join('');
      this.save();
      this.applyFishStepVisibility();
    },

    feedHtml(fish) {
      if (!fish) {
        return `<div class="card fish-feed-panel" style="background: var(--color-bg-secondary); padding: 12px; margin: 0;">
          <p class="text-body-sm text-secondary">${en() ? 'Select a fish to see feed.' : 'মাছ নির্বাচন করলে খাদ্য তালিকা দেখাবে।'}</p>
        </div>`;
      }
      const head = en()
        ? `Feed for ${fish.name_en}`
        : `${fish.name_bn} মাছের খাবার (বিস্তারিত)`;
      const items = (fish.feed || []).map((line) => `<li>${esc(line)}</li>`).join('');
      return `<div class="card fish-feed-panel" style="background: var(--color-bg-secondary); padding: 12px; margin: 0;">
        <div class="text-caption font-bold text-fish">${esc(head)}</div>
        <ul class="text-body-sm text-secondary" style="margin: 8px 0 0; padding-left: 1.15rem; line-height: 1.55;">${items}</ul>
      </div>`;
    },

    onFishPick(sel) {
      const D = Data();
      const p = this.getActive();
      const key = sel.dataset.layerKey;
      if (p) {
        if (!p.picks) p.picks = {};
        if (sel.value) p.picks[key] = sel.value;
        else delete p.picks[key];
      }
      const card = sel.closest('[data-layer-card]');
      const fish = D && D.find(sel.value);
      if (!card) return;
      const panel = card.querySelector('.fish-feed-panel');
      const tmp = document.createElement('div');
      tmp.innerHTML = this.feedHtml(fish);
      const next = tmp.firstElementChild;
      if (panel && next) panel.replaceWith(next);
      this.applyFishStepVisibility();
    },

    ensureClientKey() {
      let k = localStorage.getItem('folika_client_key');
      if (!k) {
        k = 'guest_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
        localStorage.setItem('folika_client_key', k);
      }
      return k;
    },

    taskLabel(code) {
      const map = {
        lime: en() ? 'Lime & zeolite' : 'পুকুরে চুন ও জিওলাইট প্রয়োগ',
        feed: en() ? 'Net check / growth sample' : 'খাদ্যের নমুনা ও মাছের বৃদ্ধি পরীক্ষা (জাল টানা)',
        water: en() ? 'Change 30% pond water' : 'পুকুরের ৩০% পানি বদলানো',
      };
      return map[code] || code;
    },

    loadReminders() {
      try {
        this.reminders = JSON.parse(localStorage.getItem('folika_reminders') || '[]');
      } catch (e) {
        this.reminders = [];
      }
      if (!Array.isArray(this.reminders)) this.reminders = [];
    },

    saveReminders() {
      localStorage.setItem('folika_reminders', JSON.stringify(this.reminders));
      this.renderReminders();
      this.renderProfileReminders();
      this.scheduleServerSync();
    },

    renderReminders() {
      const ul = document.getElementById('fishReminderList');
      if (!ul) return;
      const mine = this.reminders.filter((r) => r.domain === 'fish');
      if (!mine.length) {
        ul.innerHTML = `<li class="text-secondary">${en() ? 'No saved fish reminders yet.' : 'এখনও কোনো মৎস্য রিমাইন্ডার নেই।'}</li>`;
        return;
      }
      ul.innerHTML = mine.map((r) =>
        `<li>${esc(this.taskLabel(r.task))} — ${esc(r.date)}
          <button type="button" class="btn btn-sm btn-secondary" data-del-reminder="${esc(r.id)}" style="margin-left:8px;">${en() ? 'Remove' : 'মুছুন'}</button>
        </li>`
      ).join('');
    },

    renderProfileReminders() {
      const ul = document.getElementById('profileRemindersList');
      const badge = document.getElementById('profileRemindersBadge');
      if (!ul) return;
      this.loadReminders();
      const list = this.reminders.slice().sort((a, b) => String(a.date).localeCompare(String(b.date)));
      if (badge) badge.textContent = en() ? `${list.length} tasks` : `${list.length}টি কাজ`;
      if (!list.length) {
        ul.innerHTML = `<li>${en() ? 'No reminders saved yet.' : 'এখনও কোনো রিমাইন্ডার সংরক্ষিত নেই।'}</li>`;
        return;
      }
      ul.innerHTML = list.map((r) =>
        `<li>${esc(r.domain === 'fish' ? this.taskLabel(r.task) : (r.label || r.task))} — ${esc(r.date)}</li>`
      ).join('');
    },

    addReminder() {
      const taskEl = document.getElementById('fishRemindTask');
      const dateEl = document.getElementById('fishRemindDate');
      const status = document.getElementById('fishReminderStatus');
      if (!taskEl || !dateEl || !dateEl.value) {
        if (status) status.textContent = en() ? 'Pick a date.' : 'তারিখ দিন।';
        return;
      }
      this.reminders.push({
        id: 'rm_' + Date.now(),
        domain: 'fish',
        task: taskEl.value,
        date: dateEl.value,
        plan_id: this.activePlanId || '',
      });
      this.saveReminders();
      if (status) {
        status.textContent = en()
          ? 'Saved on this device and sent to the server.'
          : 'এই ডিভাইসে ও সার্ভারে সংরক্ষণ করা হয়েছে।';
      }
    },

    deleteReminder(id) {
      this.reminders = this.reminders.filter((r) => r.id !== id);
      this.saveReminders();
    },

    openEditModal() {
      const p = this.getActive();
      if (!p) return;
      this.saveFormToActive();
      const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
      set('fishEditName', p.name || '');
      set('fishEditLength', p.length);
      set('fishEditWidth', p.width);
      set('fishEditDepth', p.depth);
      set('fishEditDuration', p.duration || '1year');
      if (typeof global.openModalById === 'function') global.openModalById('fishEditPlanModal');
    },

    applyEditModal() {
      const p = this.getActive();
      if (!p) return;
      const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
      p.name = val('fishEditName').trim() || p.name;
      p.length = val('fishEditLength');
      p.width = val('fishEditWidth');
      p.depth = val('fishEditDepth');
      p.duration = val('fishEditDuration');
      this.save();
      this.renderTabs();
      this.applyActiveToForm();
      this.refreshLayers();
      if (typeof global.closeModalById === 'function') global.closeModalById('fishEditPlanModal');
    },

    scheduleServerSync() {
      clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(() => this.syncToServer(), 400);
    },

    setSyncStatus(msg) {
      const el = document.getElementById('fishSyncStatus');
      if (el) el.textContent = msg;
    },

    async pullServerThenSync() {
      const api = global.FolikaAPI && global.FolikaAPI.fish;
      if (!api) return;
      const key = this.ensureClientKey();
      try {
        const res = await api.loadClientPlans(key);
        const data = res && (res.data || res);
        if (data && Array.isArray(data.plans) && data.plans.length && this.plans.length <= 1) {
          const incoming = data.plans;
          const localStamp = this.plans.reduce((m, p) => Math.max(m, parseInt(String(p.id).replace(/\D/g, ''), 10) || 0), 0);
          const remoteStamp = incoming.reduce((m, p) => Math.max(m, parseInt(String(p.id).replace(/\D/g, ''), 10) || 0), 0);
          if (remoteStamp >= localStamp) {
            this.plans = incoming;
            if (data.active_plan_id) this.activePlanId = data.active_plan_id;
            localStorage.setItem('folika_fish_plans', JSON.stringify(this.plans));
            this.renderTabs();
            this.applyActiveToForm();
            this.refreshLayers();
          }
        }
        const rem = await api.loadClientReminders(key);
        const rd = rem && (rem.data || rem);
        if (rd && Array.isArray(rd.reminders) && rd.reminders.length && !this.reminders.length) {
          this.reminders = rd.reminders;
          localStorage.setItem('folika_reminders', JSON.stringify(this.reminders));
          this.renderReminders();
        }
      } catch (e) {
        /* keep local */
      }
      this.syncToServer();
    },

    async syncToServer() {
      const api = global.FolikaAPI && global.FolikaAPI.fish;
      if (!api || typeof api.saveClientPlans !== 'function') return;
      const key = this.ensureClientKey();
      try {
        await api.saveClientPlans({
          client_key: key,
          active_plan_id: this.activePlanId,
          plans: this.plans,
        });
        await api.saveClientReminders({
          client_key: key,
          reminders: this.reminders || [],
        });
        const loggedIn = global.FolikaAPI.Session && global.FolikaAPI.Session.isLoggedIn();
        if (loggedIn && typeof api.createPlan === 'function') {
          for (const p of this.plans) {
            if (!p.serverId) {
              const ftToM = (ft) => (parseFloat(ft) || 0) * 0.3048;
              const months = p.duration === '6months' ? 6 : p.duration === 'multi' ? 24 : 12;
              try {
                const created = await api.createPlan({
                  name: p.name,
                  pond_length_m: ftToM(p.length),
                  pond_width_m: ftToM(p.width),
                  pond_depth_m: ftToM(p.depth),
                  culture_duration_months: months,
                });
                const id = created && created.data && created.data.id;
                if (id) p.serverId = id;
              } catch (e2) { /* keep local */ }
            }
          }
          localStorage.setItem('folika_fish_plans', JSON.stringify(this.plans));
        }
        this.setSyncStatus(en()
          ? 'Plan saved on server (no login required).'
          : 'পরিকল্পনা সার্ভারে সংরক্ষিত (লগইন ছাড়াই)।');
      } catch (e) {
        this.setSyncStatus(en()
          ? 'Saved on this device. Server unreachable right now.'
          : 'এই ডিভাইসে সংরক্ষিত। সার্ভার এখন পাওয়া যায়নি।');
      }
    },
  };

  global.FolikaFishPlan = FishPlan;
  global.FolikaFishRecalc = () => FishPlan.refreshLayers();
})(window);
