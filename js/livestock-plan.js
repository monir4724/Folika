/**
 * FOLIKA — Livestock plans (location-based breed advice, shed, feed, vaccines)
 */
(function (global) {
  'use strict';

  const api = () => global.FolikaAPI;
  const i18n = () => global.FolikaI18n;
  const loc = () => global.FolikaLocation;
  const data = () => global.FolikaLivestockData;

  const bnDigits = { '0': '০', '1': '১', '2': '২', '3': '৩', '4': '৪', '5': '৫', '6': '৬', '7': '৭', '8': '৮', '9': '৯' };
  function toBn(n) {
    if (i18n() && i18n().getLang() === 'en') return String(n);
    return String(n).replace(/\d/g, (d) => bnDigits[d]);
  }
  function en() {
    return i18n() && i18n().getLang() === 'en';
  }

  const LivestockPlan = {
    plans: [],
    activePlanId: null,

    init() {
      const root = document.getElementById('livestockPlanRoot');
      if (!root || !data()) return;
      this.load();
      this.bind(root);
      this.bindReminders();
      this.bootstrapFromServer();
      this.render();
      if (!this._winBound) {
        this._winBound = true;
        window.addEventListener('folika:locationchange', () => this.onLocation());
        window.addEventListener('folika:langchange', () => this.render());
      }
    },

    bind(root) {
      if (root.dataset.lsBound === '1') return;
      root.dataset.lsBound = '1';
      const self = this;
      root.addEventListener('click', (e) => {
        const tab = e.target.closest('[data-ls-plan]');
        if (tab) {
          self.activePlanId = tab.dataset.lsPlan;
          self.render();
          return;
        }
        const id = e.target && e.target.id;
        if (id === 'btnAddLivestockPlan' || id === 'btnAddLivestockPlanBottom' || id === 'btnCreateFirstLsPlan') self.createPlan();
        if (id === 'btnDeleteLivestockPlan') self.deletePlan();
        if (id === 'lsFillSuggestCosts') self.fillSuggestedCosts();
      });
      root.addEventListener('change', (e) => {
        if (e.target.closest('#lsSpecies')) self.onSpecies();
        else if (e.target.closest('#lsBreed')) self.onBreed();
      });
      root.addEventListener('input', (e) => {
        if (e.target && e.target.id === 'lsCount') self.onCount();
        if (e.target && e.target.classList && e.target.classList.contains('ls-cost-input')) self.onCostInput(e.target);
      });
    },

    load() {
      try {
        this.plans = JSON.parse(localStorage.getItem('folika_livestock_plans') || '[]');
      } catch (e) {
        this.plans = [];
      }
      if (this.plans.length && !this.activePlanId) this.activePlanId = this.plans[0].id;
    },

    save() {
      localStorage.setItem('folika_livestock_plans', JSON.stringify(this.plans));
      this.scheduleServerSync();
    },

    scheduleServerSync() {
      clearTimeout(this._syncTimer);
      this._syncTimer = setTimeout(() => this.syncToServer(), 500);
    },

    async bootstrapFromServer() {
      const sync = global.FolikaPlanSync;
      if (!sync || !sync.loggedIn()) return;
      const mapped = await sync.pullLivestockIfEmpty(this.plans, (list) => {
        this.plans = list;
        this.activePlanId = list[0] ? list[0].id : null;
        localStorage.setItem('folika_livestock_plans', JSON.stringify(this.plans));
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
      await sync.syncAllLivestock(this.plans, () => {
        localStorage.setItem('folika_livestock_plans', JSON.stringify(this.plans));
      });
    },

    bindReminders() {
      const form = document.querySelector('#livestockReminderModal form');
      if (!form || form.dataset.lsRemBound === '1') return;
      form.dataset.lsRemBound = '1';
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.addReminder();
      });
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
    },

    addReminder() {
      const taskEl = document.getElementById('lsRemindTask');
      const dateEl = document.getElementById('lsRemindDate');
      if (!dateEl || !dateEl.value) return;
      this.loadReminders();
      this.reminders.push({
        id: 'rm_ls_' + Date.now(),
        domain: 'livestock',
        task: taskEl ? taskEl.options[taskEl.selectedIndex].text : 'রিমাইন্ডার',
        date: dateEl.value,
        plan_id: this.activePlanId || '',
      });
      this.saveReminders();
      if (typeof global.closeModalById === 'function') global.closeModalById('livestockReminderModal');
      dateEl.value = '';
    },

    locState() {
      return loc() ? loc().state : {};
    },

    createPlan() {
      const n = this.plans.length + 1;
      const plan = {
        id: 'ls_' + Date.now(),
        name: (en() ? 'Livestock plan ' : 'প্রাণিসম্পদ পরিকল্পনা ') + n,
        species: '',
        animalType: '',
        breedId: '',
        count: '',
        costs: {},
      };
      this.plans.push(plan);
      this.activePlanId = plan.id;
      this.save();
      this.render();
    },

    deletePlan() {
      const plan = this.getActive();
      if (!plan) return;
      if (!window.confirm(en() ? 'Delete this livestock plan?' : 'এই প্রাণিসম্পদ পরিকল্পনাটি মুছতে চান?')) return;
      const serverId = plan.serverId;
      this.plans = this.plans.filter((p) => p.id !== plan.id);
      this.activePlanId = this.plans[0] ? this.plans[0].id : null;
      this.save();
      this.render();
      const api = global.FolikaAPI;
      if (serverId && api && api.livestock && api.livestock.deletePlan) {
        api.livestock.deletePlan(serverId).catch(() => {});
      }
    },

    getActive() {
      return this.plans.find((p) => p.id === this.activePlanId);
    },

    onLocation() {
      this.render();
    },

    onSpecies() {
      if (this._syncing) return;
      const sel = document.getElementById('lsSpecies');
      if (!sel || !data()) return;
      this.applyAnimal(sel.value, null);
    },

    onBreed() {
      if (this._syncing) return;
      const sel = document.getElementById('lsBreed');
      if (!sel || !data()) return;
      this.applyAnimal(null, sel.value);
    },

    applyAnimal(animalTypeId, breedId) {
      const plan = this.getActive();
      if (!plan || !data()) return;
      let type = null;
      let breed = null;
      if (animalTypeId) {
        type = data().findAnimalType(animalTypeId);
        breed = type ? data().findBreed(type.breedId) : null;
      } else if (breedId) {
        breed = data().findBreed(breedId);
        type = data().typeForPlan({ breedId: breedId, species: breed && breed.species });
      }
      if (!type && !breed) return;
      plan.animalType = type ? type.id : '';
      plan.breedId = breed ? breed.id : '';
      plan.species = (breed && breed.species) || (type && type.species) || '';
      if (!animalTypeId) {
        plan.count = '';
        plan.costs = {};
      }
      this.save();
      this.fillSpecies();
      this.fillBreeds();
      this.syncPanels();
      this.applyLivestockStepVisibility();
    },

    onCount() {
      const plan = this.getActive();
      const inp = document.getElementById('lsCount');
      if (!plan || !inp) return;
      plan.count = parseInt(inp.value, 10) || '';
      this.save();
      this.syncPanels();
      this.applyLivestockStepVisibility();
    },

    render() {
      const root = document.getElementById('livestockPlanRoot');
      if (!root) return;

      if (this.plans.length === 0) {
        root.innerHTML = `
          <div class="folika-location-mount" id="livestockLocationMount" style="margin-bottom:16px;"></div>
          <section class="card crop-empty-state">
            <h2 class="text-h2 text-primary">${en() ? 'New livestock plan' : 'নতুন প্রাণিসম্পদ পরিকল্পনা'}</h2>
            <p class="text-body text-secondary" style="margin:12px 0 20px;">${en()
              ? 'Create a plan. GPS / district location will recommend the best breed, then feed and vaccination update automatically.'
              : 'পরিকল্পনা তৈরি করুন। GPS বা জেলা অনুযায়ী সেরা জাত সুপারিশ হবে; খাদ্য ও টিকা আপনাআপনি আপডেট হবে।'}</p>
            <button type="button" class="btn btn-primary btn-lg" id="btnCreateFirstLsPlan">+ ${en() ? 'Add livestock plan' : 'নতুন প্রাণিসম্পদ পরিকল্পনা'}</button>
          </section>`;
        if (loc()) loc().renderBar(document.getElementById('livestockLocationMount'));
        return;
      }

      const plan = this.getActive();
      root.innerHTML = `
        <div class="plan-page-stack">
          <div class="folika-location-mount" id="livestockLocationMount"></div>
          <div class="plan-tabs-bar">
            ${this.plans.map((p) => `<button type="button" class="plan-tab-btn ${p.id === plan.id ? 'active active-livestock' : ''}" data-ls-plan="${p.id}">${p.name}</button>`).join('')}
            <button type="button" class="btn btn-sm btn-secondary" id="btnAddLivestockPlan">+</button>
          </div>
        </div>
        <section class="plan-inputs-bar ls-inputs-bar" aria-label="${en() ? 'Animal and shed' : 'পশু ও শেড'}">
          <p class="text-caption text-secondary" id="lsStepHint" style="grid-column:1/-1;margin:0 0 8px;">${en() ? 'Select animal type first.' : 'প্রথমে পশুর ধরণ নির্বাচন করুন।'}</p>
          <div data-ls-step="species">
            <label class="form-label" for="lsSpecies">${en() ? 'Animal type' : 'পশুর ধরণ'}</label>
            <select id="lsSpecies" class="form-control">
              <option value="">${en() ? 'Select animal type…' : 'পশুর ধরণ নির্বাচন করুন…'}</option>
            </select>
          </div>
          <div class="wf-hidden" data-ls-step="count">
            <label class="form-label" for="lsCount">${en() ? 'Number of animals' : 'পশুর সংখ্যা (টি)'}</label>
            <input type="number" id="lsCount" class="form-control" min="1" value="${plan.count || ''}" placeholder="${en() ? 'e.g. 4' : 'যেমন ৪'}">
          </div>
          <div class="wf-hidden" data-ls-step="shed">
            <label class="form-label" for="lsShedSize">${en() ? 'Shed size (L × W × H ft)' : 'শেডের আকার (দৈর্ঘ্য × প্রস্থ × উচ্চতা ফুট)'}</label>
            <input type="text" id="lsShedSize" class="form-control" readonly tabindex="0" aria-live="polite">
          </div>
        </section>
        <section class="plan-workflow-grid">
          <div class="workflow-card wf-hidden" data-ls-step="breed-card">
            <h2 class="workflow-card-title">${en() ? '1. Recommendation' : '১. সুপারিশ (জাত)'}</h2>
            <p class="text-caption text-secondary" id="lsRecoWhy" style="margin-bottom:8px;"></p>
            <div class="form-group">
              <label class="form-label" for="lsBreed">${en() ? 'Best livestock for this upazila' : 'এই উপজেলার জন্য সেরা প্রাণিসম্পদ'}</label>
              <select id="lsBreed" class="form-control"><option value="">${en() ? 'Select breed…' : 'জাত নির্বাচন করুন…'}</option></select>
            </div>
            <div class="wf-hidden" data-ls-step="breed-details">
              <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:0;">
                <div class="text-caption font-bold text-livestock">${en() ? 'Breed traits' : 'জাতের বৈশিষ্ট্য'}</div>
                <div id="lsTraits" class="text-body-sm text-secondary" style="margin-top:4px;"></div>
              </div>
              <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:8px 0 0;">
                <div class="text-caption font-bold text-livestock">${en() ? 'How to raise and care' : 'লালন-পালন ও যত্ন'}</div>
                <div id="lsCare" class="text-body-sm text-secondary" style="margin-top:4px;"></div>
              </div>
              <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:8px 0 0;">
                <div class="text-caption font-bold text-livestock">${en() ? 'Weight / yield' : 'ওজন ও উৎপাদন'}</div>
                <div id="lsYield" class="text-body-sm text-secondary" style="margin-top:4px;"></div>
              </div>
            </div>
          </div>
          <div class="workflow-card wf-hidden" data-ls-step="feed-card">
            <h2 class="workflow-card-title">${en() ? '2. Feed' : '২. খাদ্য'}</h2>
            <div id="lsFeedBox"></div>
          </div>
          <div class="workflow-card wf-hidden" data-ls-step="vax-card">
            <h2 class="workflow-card-title">${en() ? '3. Vaccination' : '৩. টিকা ও স্বাস্থ্য'}</h2>
            <div id="lsVaxBox"></div>
          </div>
          <div class="workflow-card wf-hidden" data-ls-step="cost-card">
            <h2 class="workflow-card-title">${en() ? '4. Monthly accounts' : '৪. মাসিক হিসাব'}</h2>
            <div id="lsCostBox">${this.costFieldsHtml(plan)}</div>
          </div>
        </section>
        <section class="plan-actions-bar">
          <button type="button" class="btn btn-secondary btn-plan-action" data-modal-target="#livestockReminderModal">${en() ? 'Health reminder' : 'স্বাস্থ্য রিমাইন্ডার'}</button>
          <button type="button" class="btn btn-danger btn-plan-action" id="btnDeleteLivestockPlan">${en() ? 'Delete this plan' : 'পরিকল্পনা মুছুন'}</button>
        </section>
        <div style="margin-top:16px;">
          <button type="button" class="btn btn-primary btn-lg" id="btnAddLivestockPlanBottom">${en() ? '+ Add new livestock plan' : '+ নতুন প্রাণিসম্পদ পরিকল্পনা যোগ করুন'}</button>
        </div>`;

      if (loc()) loc().renderBar(document.getElementById('livestockLocationMount'));
      this.fillSpecies();
      this.fillBreeds();
      this.syncPanels();
      this.applyLivestockStepVisibility();
    },

    applyLivestockStepVisibility() {
      const plan = this.getActive();
      if (!plan) return;
      const hasSpecies = !!plan.animalType;
      const hasCount = parseInt(plan.count, 10) > 0;
      const hasBreed = !!plan.breedId;
      const toggle = (step, show) => {
        document.querySelectorAll(`[data-ls-step="${step}"]`).forEach((el) => {
          el.classList.toggle('wf-hidden', !show);
        });
      };
      toggle('species', true);
      toggle('count', hasSpecies);
      toggle('shed', hasSpecies && hasCount);
      toggle('breed-card', hasSpecies && hasCount);
      toggle('breed-details', hasSpecies && hasCount && hasBreed);
      toggle('feed-card', hasSpecies && hasCount && hasBreed);
      toggle('vax-card', hasSpecies && hasCount && hasBreed);
      toggle('cost-card', hasSpecies && hasCount && hasBreed);
      const hint = document.getElementById('lsStepHint');
      if (hint) {
        if (!hasSpecies) {
          hint.textContent = en() ? 'Select animal type first.' : 'প্রথমে পশুর ধরণ নির্বাচন করুন।';
        } else if (!hasCount) {
          hint.textContent = en() ? 'Enter number of animals.' : 'পশুর সংখ্যা লিখুন।';
        } else if (!hasBreed) {
          hint.textContent = en() ? 'Select the best breed for your area.' : 'এলাকার জন্য সেরা জাত নির্বাচন করুন।';
        } else {
          hint.textContent = en() ? 'All steps complete — review feed, vaccines and costs below.' : 'সব ধাপ সম্পন্ন — নিচে খাদ্য, টিকা ও হিসাব দেখুন।';
        }
      }
    },

    fillSpecies() {
      const sel = document.getElementById('lsSpecies');
      const plan = this.getActive();
      if (!sel || !plan) return;
      this._syncing = true;
      const types = data().typesForLocation(this.locState());
      const placeholder = en() ? 'Select animal type…' : 'পশুর ধরণ নির্বাচন করুন…';
      sel.innerHTML = `<option value="">${placeholder}</option>` + types.map((t, i) => {
        const tag = i === 0 ? (en() ? ' (fits this area)' : ' (এলাকায় উপযোগী)') : '';
        return `<option value="${t.id}" ${t.id === plan.animalType ? 'selected' : ''}>${en() ? t.en : t.bn}${tag}</option>`;
      }).join('');
      this._syncing = false;
    },

    fillBreeds() {
      const sel = document.getElementById('lsBreed');
      const plan = this.getActive();
      if (!sel || !plan || !plan.animalType) {
        if (sel) sel.innerHTML = `<option value="">${en() ? 'Select breed…' : 'জাত নির্বাচন করুন…'}</option>`;
        return;
      }
      this._syncing = true;
      const rec = data().recommendForLocation(this.locState());
      const ids = rec.ordered.map((b) => b.id);
      if (plan.breedId && ids.indexOf(plan.breedId) < 0) plan.breedId = '';
      sel.innerHTML = `<option value="">${en() ? 'Select breed…' : 'জাত নির্বাচন করুন…'}</option>` + rec.ordered.map((b, i) => {
        const label = en() ? b.name_en : b.name_bn;
        const kind = data().speciesLabel(b.species, en());
        const tag = i === 0 ? (en() ? ' (best here)' : ' (এই এলাকায় সেরা)') : '';
        return `<option value="${b.id}" ${b.id === plan.breedId ? 'selected' : ''}>${label} — ${kind}${tag}</option>`;
      }).join('');
      this._syncing = false;
    },

    syncPanels() {
      const plan = this.getActive();
      if (!plan || !data()) return;
      if (!plan.animalType) {
        this.applyLivestockStepVisibility();
        return;
      }
      const breed = plan.breedId ? data().findBreed(plan.breedId) : null;
      if (breed) plan.species = breed.species;
      const shed = data().shedFor(plan.species || 'cattle', plan.count || 1);
      const feed = data().feedFor(plan.species, plan.breedId, plan.animalType);
      const vax = data().vaccinesForBreed ? data().vaccinesForBreed(plan.species, plan.breedId) : data().vaccinesFor(plan.species);
      const n = plan.count || 1;
      const breedName = breed ? (en() ? breed.name_en : breed.name_bn) : '';

      const shedInp = document.getElementById('lsShedSize');
      if (shedInp) {
        shedInp.value = en()
          ? `${shed.length} × ${shed.width} × ${shed.height} ft`
          : `${shed.length} × ${shed.width} × ${shed.height} ফুট`;
      }

      const why = document.getElementById('lsRecoWhy');
      if (why) {
        why.innerHTML = breed
          ? (global.FolikaSuggestList ? global.FolikaSuggestList.paragraphToList(data().reasonText(breed, this.locState(), en())) : data().reasonText(breed, this.locState(), en()))
          : '';
      }

      if (!breed) {
        this.applyLivestockStepVisibility();
        return;
      }

      const SL = global.FolikaSuggestList;
      const traits = document.getElementById('lsTraits');
      if (traits && breed) {
        traits.innerHTML = SL ? SL.paragraphToList(en() ? breed.traits_en : breed.traits_bn) : (en() ? breed.traits_en : breed.traits_bn);
      }
      const yieldEl = document.getElementById('lsYield');
      if (yieldEl && breed) {
        const yText = en() ? `Weight: ${breed.weight}. Yield: ${breed.yield}` : `ওজন: ${breed.weight}। উৎপাদন: ${breed.yield}`;
        yieldEl.innerHTML = SL ? SL.toList(yText.split(/।\s*/).filter(Boolean)) : yText;
      }
      const careEl = document.getElementById('lsCare');
      if (careEl) {
        const care = data().careText(plan.animalType, plan.breedId, en());
        careEl.innerHTML = SL ? SL.paragraphToList(care) : care;
      }

      const feedBox = document.getElementById('lsFeedBox');
      if (feedBox) {
        const g = Math.round(feed.kg.grass * n);
        const s = Math.round(feed.kg.straw * n);
        const gr = (feed.kg.grain * n).toFixed(1);
        feedBox.innerHTML = `
          <div class="card" style="background:var(--color-livestock-tint);border:1px solid var(--color-livestock);padding:10px;margin:0;">
            <div class="text-caption font-bold text-livestock">${en() ? `Daily feed for ${toBn(n)} × ${breedName}` : `${toBn(n)}টি ${breedName} — দৈনিক খাদ্য`}</div>
            <div class="grid grid-cols-3 gap-6" style="margin-top:6px;text-align:center;">
              <div style="background:#FFF;padding:6px;border-radius:4px;"><span class="text-caption">${en() ? 'Green fodder' : 'কাঁচা ঘাস'}</span><div class="font-bold text-body-sm">${toBn(g)} ${en() ? 'kg' : 'কেজি'}</div></div>
              <div style="background:#FFF;padding:6px;border-radius:4px;"><span class="text-caption">${en() ? 'Straw' : 'শুকনো খড়'}</span><div class="font-bold text-body-sm">${toBn(s)} ${en() ? 'kg' : 'কেজি'}</div></div>
              <div style="background:#FFF;padding:6px;border-radius:4px;"><span class="text-caption">${en() ? 'Concentrate' : 'দানাদার'}</span><div class="font-bold text-body-sm">${toBn(gr)} ${en() ? 'kg' : 'কেজি'}</div></div>
            </div>
          </div>
          <div class="card" style="background:var(--color-bg-secondary);padding:10px;margin:8px 0 0;">
            ${(() => {
              const SL = global.FolikaSuggestList;
              const notes = [feed.roughage_bn, feed.concentrate_bn, feed.mix_bn, feed.note_bn].filter(Boolean);
              return SL ? SL.toList(notes) : `<p class="text-body-sm text-secondary">${notes.join('<br>')}</p>`;
            })()}
          </div>`;
      }

      const vaxBox = document.getElementById('lsVaxBox');
      if (vaxBox) {
        vaxBox.innerHTML = `
          <p class="text-caption font-bold text-livestock" style="margin-bottom:8px;">${en()
            ? `Schedule for: ${breedName}`
            : `নির্বাচিত জাত: ${breedName}`}</p>
          <div class="table-wrapper" style="margin:0;">
            <table class="table" style="font-size:13px;">
              <thead><tr><th>${en() ? 'Vaccine / care' : 'টিকা / যত্ন'}</th><th>${en() ? 'Schedule' : 'সময়সূচি'}</th></tr></thead>
              <tbody>${vax.map((v) => `<tr><td>${en() ? v.name_en : v.name_bn}</td><td>${v.when_bn}</td></tr>`).join('')}</tbody>
            </table>
          </div>
          <p class="text-caption text-secondary" style="margin-top:8px;">${en()
            ? 'This list changes with the livestock selected in the recommendation box. Confirm with the Upazila Livestock Office.'
            : 'এই তালিকা সুপারিশ বক্সে নির্বাচিত প্রাণিসম্পদ অনুযায়ী বদলায়। চূড়ান্ত সময়সূচি উপজেলা প্রাণিসম্পদ অফিস থেকে নিশ্চিত করুন।'}</p>`;
      }

      this.refreshCostHints();
      this.updateCostTotals();
      this.applyLivestockStepVisibility();
    },

    costFieldDefs() {
      return [
        { key: 'feed', bn: 'খাদ্য খরচ (৳)', en: 'Feed cost (৳)' },
        { key: 'vaccine', bn: 'টিকা ও ওষুধ (৳)', en: 'Vaccine & medicine (৳)' },
        { key: 'electricity', bn: 'বিদ্যুৎ ও পানি (৳)', en: 'Electricity & water (৳)' },
        { key: 'labor', bn: 'শ্রমিক / নিজের সময় (৳)', en: 'Labor (৳)' },
        { key: 'housing', bn: 'শেড মেরামত / বিছানা (৳)', en: 'Shed repair / bedding (৳)' },
        { key: 'transport', bn: 'পরিবহন ও বাজার (৳)', en: 'Transport & market (৳)' },
        { key: 'other', bn: 'অন্যান্য খরচ (৳)', en: 'Other costs (৳)' },
        { key: 'income', bn: 'মাসিক আয় — দুধ/ডিম/মাংস বিক্রি (৳)', en: 'Monthly income — milk/egg/meat (৳)' },
      ];
    },

    suggestedCosts(plan) {
      const n = Math.max(1, parseInt(plan.count, 10) || 1);
      const feed = data().feedFor(plan.species, plan.breedId, plan.animalType);
      const feedCost = Math.round(n * 30 * (feed.kg.grass * 2.2 + feed.kg.straw * 6 + feed.kg.grain * 38));
      const vaccine = Math.round(n * (plan.species === 'chicken' || plan.species === 'duck' ? 40 : plan.species === 'goat' || plan.species === 'sheep' ? 90 : 180));
      return {
        feed: feedCost,
        vaccine,
        electricity: Math.round(n * (plan.species === 'chicken' || plan.species === 'duck' ? 25 : 80)),
        labor: Math.round(n * (plan.species === 'chicken' || plan.species === 'duck' ? 20 : 100)),
        housing: Math.round(n * 40),
        transport: Math.round(n * 25),
        other: Math.round(n * 30),
        income: 0,
      };
    },

    costFieldsHtml(plan) {
      if (!plan.costs) plan.costs = {};
      const sug = this.suggestedCosts(plan);
      return this.costFieldDefs().map((f) => {
        const val = plan.costs[f.key];
        const shown = val === 0 || val ? val : '';
        return `<div class="form-group" style="margin-bottom:8px;">
          <label class="form-label" for="lsCost_${f.key}">${en() ? f.en : f.bn}</label>
          <input type="number" min="0" step="1" class="form-control ls-cost-input" id="lsCost_${f.key}" data-cost-key="${f.key}" value="${shown}" placeholder="${sug[f.key]}">
          <span class="text-caption text-secondary ls-cost-hint" data-hint-for="${f.key}">${en() ? 'Suggested' : 'প্রস্তাবিত'}: ${toBn(sug[f.key])} ৳</span>
        </div>`;
      }).join('') + `
        <button type="button" class="btn btn-sm btn-secondary" id="lsFillSuggestCosts" style="margin:4px 0 8px;">${en() ? 'Fill suggested amounts' : 'প্রস্তাবিত টাকা বসান'}</button>
        <div class="card" style="background:var(--color-error-tint);border:1px solid var(--color-error);padding:10px;margin:8px 0 0;">
          <div class="text-caption">${en() ? 'Total monthly cost' : 'মাসিক মোট খরচ'}</div>
          <div id="lsCostTotal" class="text-h3 font-bold" style="color:var(--color-error);">০ ৳</div>
        </div>
        <div class="card" style="background:var(--color-primary-tint);border:2px solid var(--color-primary);padding:10px;margin:8px 0 0;">
          <div class="text-caption text-primary">${en() ? 'Net (income − cost)' : 'নিট (আয় − খরচ)'}</div>
          <div id="lsCostNet" class="text-h2 font-bold text-primary">০ ৳</div>
        </div>
        <p class="text-caption text-secondary" style="margin-top:8px;">${en()
          ? 'Type your own taka amounts. Suggestions follow the selected livestock and head count.'
          : 'টাকার পরিমাণ নিজে লিখুন। প্রস্তাবিত মান নির্বাচিত জাত ও সংখ্যা অনুযায়ী বদলায়।'}</p>`;
    },

    onCostInput(inp) {
      const plan = this.getActive();
      if (!plan) return;
      if (!plan.costs) plan.costs = {};
      const key = inp.getAttribute('data-cost-key');
      plan.costs[key] = inp.value === '' ? '' : (parseFloat(inp.value) || 0);
      this.save();
      this.updateCostTotals();
    },

    fillSuggestedCosts() {
      const plan = this.getActive();
      if (!plan) return;
      const sug = this.suggestedCosts(plan);
      if (!plan.costs) plan.costs = {};
      this.costFieldDefs().forEach((f) => {
        if (f.key === 'income') return;
        plan.costs[f.key] = sug[f.key];
        const inp = document.getElementById('lsCost_' + f.key);
        if (inp) inp.value = sug[f.key];
      });
      this.save();
      this.updateCostTotals();
    },

    refreshCostHints() {
      const plan = this.getActive();
      if (!plan) return;
      const sug = this.suggestedCosts(plan);
      document.querySelectorAll('.ls-cost-hint').forEach((el) => {
        const key = el.getAttribute('data-hint-for');
        if (key && sug[key] !== undefined) {
          el.textContent = (en() ? 'Suggested' : 'প্রস্তাবিত') + ': ' + toBn(sug[key]) + ' ৳';
        }
      });
      this.costFieldDefs().forEach((f) => {
        const inp = document.getElementById('lsCost_' + f.key);
        if (inp) inp.placeholder = String(sug[f.key]);
      });
    },

    updateCostTotals() {
      const plan = this.getActive();
      if (!plan) return;
      if (!plan.costs) plan.costs = {};
      const keys = ['feed', 'vaccine', 'electricity', 'labor', 'housing', 'transport', 'other'];
      let total = 0;
      keys.forEach((k) => {
        const inp = document.getElementById('lsCost_' + k);
        const v = inp && inp.value !== '' ? parseFloat(inp.value) : (parseFloat(plan.costs[k]) || 0);
        total += v || 0;
      });
      const incInp = document.getElementById('lsCost_income');
      const income = incInp && incInp.value !== '' ? parseFloat(incInp.value) : (parseFloat(plan.costs.income) || 0);
      const net = (income || 0) - total;
      const totEl = document.getElementById('lsCostTotal');
      const netEl = document.getElementById('lsCostNet');
      if (totEl) totEl.textContent = toBn(Math.round(total)) + ' ৳';
      if (netEl) netEl.textContent = (net >= 0 ? '+' : '') + toBn(Math.round(net)) + ' ৳';
    },
  };

  global.FolikaLivestockPlan = LivestockPlan;
})(window);
