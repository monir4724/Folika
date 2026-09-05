/**
 * FOLIKA — Location (GPS + বিভাগ/জেলা/উপজেলা) & Weather integration
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'folika_location';
  const api = () => global.FolikaAPI;
  const i18n = () => global.FolikaI18n;

  const bnDigits = { '0':'০','1':'১','2':'২','3':'৩','4':'৪','5':'৫','6':'৬','7':'৭','8':'৮','9':'৯' };
  function toBn(n) {
    if (i18n() && i18n().getLang() === 'en') return String(n);
    return String(n).replace(/\d/g, (d) => bnDigits[d]);
  }

  const LocationService = {
    state: { divisionId: null, districtId: null, upazilaId: null, lat: null, lon: null, label: '', divisionNameBn: '', divisionNameEn: '', districtNameBn: '', upazilaNameBn: '', upazilaNameEn: '', districtNameEn: '' },
    lastWeather: null,
    lastForecast: null,

    load() {
      try {
        const s = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
        if (s) this.state = { ...this.state, ...s };
      } catch (e) { /* ignore */ }
      return this.state;
    },

    save() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new CustomEvent('folika:locationchange', { detail: { ...this.state } }));
    },

    getLabel() {
      return this.state.label || '';
    },

    /** Build and mount location bar into every `.folika-location-mount` */
    initAll() {
      this.load();
      document.querySelectorAll('.folika-location-mount').forEach((mount) => this.renderBar(mount));
      window.addEventListener('folika:langchange', () => {
        document.querySelectorAll('.folika-location-mount').forEach((m) => this.renderBar(m));
        if (this.lastWeather) this.paintWeather(this.lastWeather);
      });
      if (this.state.upazilaId || (this.state.lat && this.state.lon)) {
        this.refreshWeather();
      } else {
        this.refreshWeather();
      }
    },

    renderBar(mount) {
      const t = (k) => (i18n() ? i18n().t(k) : k);
      mount.innerHTML = `
        <div class="location-bar" role="group" aria-label="${t('location_division')}">
          <div class="location-bar-manual">
            <div class="location-field">
              <label class="form-label" for="${mount.id || 'loc'}_div">${t('location_division')}</label>
              <select class="form-control loc-division" id="${mount.id || 'loc'}_div">
                <option value="">${t('location_select_division')}</option>
              </select>
            </div>
            <div class="location-field">
              <label class="form-label" for="${mount.id || 'loc'}_dist">${t('location_district')}</label>
              <select class="form-control loc-district" id="${mount.id || 'loc'}_dist" disabled>
                <option value="">${t('location_select_district')}</option>
              </select>
            </div>
            <div class="location-field">
              <label class="form-label" for="${mount.id || 'loc'}_upa">${t('location_upazila')}</label>
              <select class="form-control loc-upazila" id="${mount.id || 'loc'}_upa" disabled>
                <option value="">${t('location_select_upazila')}</option>
              </select>
            </div>
          </div>
          <div class="location-bar-gps">
            <button type="button" class="btn btn-gps btn-gps-trigger" aria-label="${t('gps_btn')}">${t('gps_btn')}</button>
          </div>
        </div>`;

      const divSel = mount.querySelector('.loc-division');
      const distSel = mount.querySelector('.loc-district');
      const upaSel = mount.querySelector('.loc-upazila');
      const gpsBtn = mount.querySelector('.btn-gps-trigger');

      gpsBtn.addEventListener('click', () => this.requestGps(gpsBtn));

      this.populateDivisions(divSel).then(() => {
        if (this.state.divisionId) {
          divSel.value = this.state.divisionId;
          this.populateDistricts(distSel, this.state.divisionId).then(() => {
            if (this.state.districtId) {
              distSel.value = this.state.districtId;
              this.populateUpazilas(upaSel, this.state.districtId).then(() => {
                if (this.state.upazilaId) upaSel.value = this.state.upazilaId;
              });
            }
          });
        }
      });

      divSel.addEventListener('change', async () => {
        const id = divSel.value;
        distSel.innerHTML = `<option value="">${t('location_select_district')}</option>`;
        upaSel.innerHTML = `<option value="">${t('location_select_upazila')}</option>`;
        distSel.disabled = !id;
        upaSel.disabled = true;
        if (id) await this.populateDistricts(distSel, id);
        this.state.divisionId = id || null;
        this.state.districtId = null;
        this.state.upazilaId = null;
        this.state.divisionNameBn = divSel.options[divSel.selectedIndex]?.dataset.bn || '';
        this.state.divisionNameEn = divSel.options[divSel.selectedIndex]?.dataset.en || '';
        this.state.districtNameBn = '';
        this.state.districtNameEn = '';
        this.state.upazilaNameBn = '';
        this.state.upazilaNameEn = '';
        this.state.label = '';
        this.state.lat = null;
        this.state.lon = null;
        this.state.backendUpazilaId = null;
        this.state.locationSource = 'manual';
        this.save();
      });

      distSel.addEventListener('change', async () => {
        const id = distSel.value;
        upaSel.innerHTML = `<option value="">${t('location_select_upazila')}</option>`;
        upaSel.disabled = !id;
        if (id) await this.populateUpazilas(upaSel, id);
        this.state.districtId = id || null;
        this.state.upazilaId = null;
        this.state.districtNameBn = distSel.options[distSel.selectedIndex]?.dataset.bn || '';
        this.state.districtNameEn = distSel.options[distSel.selectedIndex]?.dataset.en || '';
        this.state.upazilaNameBn = '';
        this.state.upazilaNameEn = '';
        this.state.label = this.state.districtNameBn || '';
        this.state.backendUpazilaId = null;
        this.applyManualCoords();
        this.save();
        this.updateHeaderLocation();
        await this.refreshFromManualLocation();
      });

      upaSel.addEventListener('change', async () => {
        this.state.upazilaId = upaSel.value || null;
        this.state.upazilaNameBn = upaSel.options[upaSel.selectedIndex]?.dataset.bn || '';
        this.state.upazilaNameEn = upaSel.options[upaSel.selectedIndex]?.dataset.en || '';
        const upaText = this.state.upazilaNameBn || upaSel.options[upaSel.selectedIndex]?.text || '';
        const distText = this.state.districtNameBn || distSel.options[distSel.selectedIndex]?.text || '';
        this.state.label = upaText && distText ? `${upaText}, ${distText}` : (distText || '');
        this.applyManualCoords();
        this.save();
        this.updateHeaderLocation();
        await this.refreshFromManualLocation();
      });
    },

    async populateDivisions(sel) {
      const data = await this.fetchDivisions();
      data.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = String(d.id);
        opt.textContent = i18n().getLang() === 'en' ? (d.name_en || d.name_bn) : (d.name_bn || d.name_en);
        opt.dataset.bn = d.name_bn || '';
        opt.dataset.en = d.name_en || '';
        sel.appendChild(opt);
      });
    },

    async populateDistricts(sel, divisionId) {
      const data = await this.fetchDistricts(divisionId);
      data.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = String(d.id);
        opt.textContent = i18n().getLang() === 'en' ? (d.name_en || d.name_bn) : (d.name_bn || d.name_en);
        opt.dataset.bn = d.name_bn || '';
        opt.dataset.en = d.name_en || '';
        sel.appendChild(opt);
      });
      sel.disabled = false;
    },

    async populateUpazilas(sel, districtId) {
      const data = await this.fetchUpazilas(districtId);
      data.forEach((d) => {
        const opt = document.createElement('option');
        opt.value = String(d.id);
        opt.textContent = i18n().getLang() === 'en' ? (d.name_en || d.name_bn) : (d.name_bn || d.name_en);
        opt.dataset.bn = d.name_bn || '';
        opt.dataset.en = d.name_en || '';
        sel.appendChild(opt);
      });
      sel.disabled = false;
    },

    async fetchDivisions() {
      const geo = global.FolikaGeo;
      if (geo) return geo.divisions();
      try {
        if (api()) {
          const res = await api().location.divisions();
          const data = (res && res.data) ? res.data : [];
          if (data.length) return data;
        }
      } catch (e) { /* fallback */ }
      return [
        { id: 1, name_bn: 'ঢাকা', name_en: 'Dhaka' },
        { id: 2, name_bn: 'রাজশাহী', name_en: 'Rajshahi' },
      ];
    },

    async fetchDistricts(divisionId) {
      const geo = global.FolikaGeo;
      if (geo) {
        const list = geo.districts(divisionId);
        if (list.length) return list;
      }
      try {
        if (api()) {
          const res = await api().location.districts(divisionId);
          const data = (res && res.data) ? res.data : [];
          if (data.length) return data;
        }
      } catch (e) { /* fallback */ }
      return [];
    },

    async fetchUpazilas(districtId) {
      const geo = global.FolikaGeo;
      if (geo) {
        const list = geo.upazilas(districtId);
        if (list.length) return list;
      }
      try {
        if (api()) {
          const res = await api().location.upazilas(districtId);
          const data = (res && res.data) ? res.data : [];
          if (data.length) return data;
        }
      } catch (e) { /* fallback */ }
      return [];
    },

    applyResolved(resolved) {
      if (!resolved || !resolved.district) return;
      this.state.divisionId = resolved.division ? String(resolved.division.id) : String(resolved.district.division_id);
      this.state.districtId = String(resolved.district.id);
      this.state.upazilaId = resolved.upazila ? String(resolved.upazila.id) : null;
      this.state.divisionNameBn = resolved.division ? resolved.division.name_bn : '';
      this.state.divisionNameEn = resolved.division ? resolved.division.name_en : '';
      this.state.districtNameBn = resolved.district.name_bn || '';
      this.state.districtNameEn = resolved.district.name_en || '';
      this.state.upazilaNameBn = resolved.upazila ? resolved.upazila.name_bn : '';
      this.state.upazilaNameEn = resolved.upazila ? resolved.upazila.name_en : '';
      this.state.label = this.state.upazilaNameBn
        ? `${this.state.upazilaNameBn}, ${this.state.districtNameBn}`
        : this.state.districtNameBn;
    },

    syncAllBars() {
      document.querySelectorAll('.folika-location-mount').forEach((m) => this.renderBar(m));
    },

    async applyStateToBar(mount) {
      const t = (k) => (i18n() ? i18n().t(k) : k);
      let divSel = mount.querySelector('.loc-division');
      let distSel = mount.querySelector('.loc-district');
      let upaSel = mount.querySelector('.loc-upazila');
      if (!divSel) {
        this.renderBar(mount);
        divSel = mount.querySelector('.loc-division');
        distSel = mount.querySelector('.loc-district');
        upaSel = mount.querySelector('.loc-upazila');
      }
      if (!divSel || !distSel || !upaSel) return;

      if (divSel.options.length <= 1) await this.populateDivisions(divSel);
      if (!this.state.divisionId) return;

      divSel.value = this.state.divisionId;
      distSel.innerHTML = `<option value="">${t('location_select_district')}</option>`;
      distSel.disabled = false;
      await this.populateDistricts(distSel, this.state.divisionId);

      if (this.state.districtId) {
        distSel.value = this.state.districtId;
        upaSel.innerHTML = `<option value="">${t('location_select_upazila')}</option>`;
        upaSel.disabled = false;
        await this.populateUpazilas(upaSel, this.state.districtId);
        if (this.state.upazilaId) upaSel.value = this.state.upazilaId;
      } else {
        upaSel.innerHTML = `<option value="">${t('location_select_upazila')}</option>`;
        upaSel.disabled = true;
      }
    },

    async applyStateToAllBars() {
      const mounts = document.querySelectorAll('.folika-location-mount');
      for (let i = 0; i < mounts.length; i++) {
        await this.applyStateToBar(mounts[i]);
      }
    },

    acquireGpsPosition() {
      const opts = { enableHighAccuracy: true, timeout: 25000, maximumAge: 0 };
      return new Promise((resolve, reject) => {
        if (!('geolocation' in navigator)) {
          reject(Object.assign(new Error('unsupported'), { code: 0 }));
          return;
        }
        let best = null;
        let watchId = null;
        let settled = false;

        const finish = (pos) => {
          if (settled) return;
          settled = true;
          if (watchId != null) navigator.geolocation.clearWatch(watchId);
          resolve(pos);
        };
        const fail = (err) => {
          if (settled) return;
          if (best) { finish(best); return; }
          settled = true;
          if (watchId != null) navigator.geolocation.clearWatch(watchId);
          reject(err);
        };

        watchId = navigator.geolocation.watchPosition(
          (pos) => {
            if (!best || pos.coords.accuracy < best.coords.accuracy) best = pos;
            if (pos.coords.accuracy <= 80) finish(pos);
          },
          () => { /* wait for timeout or getCurrentPosition */ },
          opts
        );

        setTimeout(() => {
          if (settled) return;
          if (best) finish(best);
          else navigator.geolocation.getCurrentPosition(finish, fail, opts);
        }, 12000);
      });
    },

    requestGps(btn) {
      const t = (k) => (i18n() ? i18n().t(k) : k);
      const lang = i18n() ? i18n().getLang() : 'bn';
      if (!('geolocation' in navigator)) {
        alert(t('gps_failed'));
        return;
      }
      btn.disabled = true;
      btn.textContent = t('gps_searching');

      this.acquireGpsPosition().then(async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          this.state.lat = lat;
          this.state.lon = lon;
          this.state.divisionId = null;
          this.state.districtId = null;
          this.state.upazilaId = null;

          let names = null;
          try {
            if (api() && api().location.reverse) {
              const res = await api().location.reverse({ lat, lon });
              const d = (res && res.data) ? res.data : res;
              if (d && (d.district || d.division || d.upazila || (d.candidates && d.candidates.length))) {
                names = {
                  division: d.division,
                  district: d.district,
                  upazila: d.upazila,
                  display: d.display,
                  candidates: d.candidates || [],
                };
              }
            }
          } catch (e) { /* nearest-district fallback */ }

          const geo = global.FolikaGeo;
          if (geo) {
            this.applyResolved(geo.resolveFromCoords(lat, lon, names));
          } else {
            this.state.label = t('gps_connected');
          }

          this.state.gpsAccuracyM = pos.coords.accuracy || null;
          this.state.locationSource = 'gps';
          await this.resolveBackendIds();
          this.save();
          await this.applyStateToAllBars();
          this.updateHeaderLocation();
          this.saveLocationToProfile();
          const acc = pos.coords.accuracy;
          const freshBtn = document.querySelector('.btn-gps-trigger') || btn;
          if (acc && acc > 800) {
            const warn = lang === 'en'
              ? 'GPS is approximate (desktop/network). Use a phone outdoors for a closer match.'
              : 'GPS আনুমানিক (কম্পিউটার/নেটওয়ার্ক)। আরও সঠিক লোকেশনের জন্য ফোনে বাইরে থেকে চেষ্টা করুন।';
            alert(warn);
            freshBtn.textContent = t('gps_approx');
          } else {
            freshBtn.textContent = t('gps_connected');
          }
          freshBtn.disabled = false;
          setTimeout(() => {
            document.querySelectorAll('.btn-gps-trigger').forEach((b) => { b.textContent = t('gps_btn'); });
          }, 3500);
          await this.refreshWeather();
        }).catch((err) => {
          let msg = t('gps_failed');
          const code = err && err.code;
          if (code === 1) {
            msg = lang === 'en'
              ? 'GPS permission denied. Please allow location access in your browser.'
              : 'GPS অনুমতি দেওয়া হয়নি। ব্রাউজার সেটিংস থেকে লোকেশন চালু করুন।';
          } else if (code === 2) {
            msg = lang === 'en'
              ? 'GPS signal unavailable. Try again outdoors or enable device location.'
              : 'GPS সিগন্যাল পাওয়া যায়নি। খোলা জায়গায় চেষ্টা করুন বা ডিভাইস লোকেশন চালু করুন।';
          } else if (code === 3 || (err && err.message === 'timeout')) {
            msg = lang === 'en'
              ? 'GPS took too long. Please try again.'
              : 'GPS খুঁজতে সময় বেশি লাগল। আবার চেষ্টা করুন।';
          }
          alert(msg);
          btn.textContent = t('gps_btn');
          btn.disabled = false;
        });
    },

    updateHeaderLocation() {
      /* Location under header name removed — keep profile/location widgets only */
    },

    paintWeather(weather) {
      if (!weather) return;
      const tempEl = document.getElementById('weatherTempVal');
      const descEl = document.getElementById('weatherDescVal');
      const rainEl = document.getElementById('weatherRainVal');
      const windEl = document.getElementById('weatherWindVal');
      const adviceEl = document.getElementById('weatherAdviceText');
      const lang = i18n() ? i18n().getLang() : 'bn';

      if (tempEl) tempEl.textContent = toBn(Math.round(weather.temperature)) + (lang === 'en' ? '°C' : '° সে.');
      if (descEl) {
        const cond = lang === 'en' ? (weather.condition_en || weather.condition_bn) : (weather.condition_bn || weather.condition_en);
        const humLabel = lang === 'en' ? 'Humidity' : 'আর্দ্রতা';
        descEl.textContent = `${cond} • ${humLabel} ${toBn(weather.humidity || 0)}%`;
      }
      if (rainEl) rainEl.textContent = toBn(weather.rain_prob_pct || 0) + '%';
      if (windEl) {
        const unit = lang === 'en' ? 'km/h' : 'কিমি/ঘণ্টা';
        windEl.textContent = `${toBn(weather.wind_speed_kmh || 0)} ${unit}`;
      }
      if (adviceEl) {
        if (weather.stale_text) {
          adviceEl.innerHTML = `<strong>${i18n().t('weather_advice')}:</strong> ${weather.stale_text}`;
        } else if (i18n()) {
          adviceEl.innerHTML = `<strong data-i18n="weather_advice">${i18n().t('weather_advice')}</strong>: <span data-i18n="weather_advice_default">${i18n().t('weather_advice_default')}</span>`;
        }
      }
    },

    applyManualCoords() {
      this.state.locationSource = 'manual';
      const geo = global.FolikaGeo;
      const district = geo && this.state.districtId ? geo.findDistrict(this.state.districtId) : null;
      if (district && district.lat != null && district.lon != null) {
        this.state.lat = district.lat;
        this.state.lon = district.lon;
        return;
      }
      this.state.lat = null;
      this.state.lon = null;
    },

    async refreshFromManualLocation() {
      await this.resolveBackendIds();
      this.saveLocationToProfile();
      await this.refreshWeather();
    },

    async resolveBackendIds() {
      if (!api() || !api().location || !api().location.resolve) return;
      try {
        const res = await api().location.resolve({
          division: this.state.divisionNameEn || this.state.divisionNameBn,
          district: this.state.districtNameEn || this.state.districtNameBn,
          upazila: this.state.upazilaNameEn || this.state.upazilaNameBn,
        });
        const d = (res && res.data) ? res.data : res;
        this.state.backendDivisionId = d.division ? d.division.id : null;
        this.state.backendDistrictId = d.district ? d.district.id : null;
        this.state.backendUpazilaId = d.upazila ? d.upazila.id : null;
      } catch (e) { /* keep frontend ids local only */ }
    },

    async saveLocationToProfile() {
      if (!api() || !api().Session || !api().Session.isLoggedIn()) return;
      if (!api().user || !api().user.updateProfile) return;
      const payload = {};
      if (this.state.lat != null) payload.latitude = this.state.lat;
      if (this.state.lon != null) payload.longitude = this.state.lon;
      if (this.state.backendDivisionId) payload.division_id = this.state.backendDivisionId;
      if (this.state.backendDistrictId) payload.district_id = this.state.backendDistrictId;
      if (this.state.backendUpazilaId) payload.upazila_id = this.state.backendUpazilaId;
      if (!Object.keys(payload).length) return;
      try { await api().user.updateProfile(payload); } catch (e) { /* keep local */ }
    },

    async refreshWeather() {
      const query = {};
      if (this.state.lat != null && this.state.lon != null) {
        query.lat = this.state.lat;
        query.lon = this.state.lon;
      }
      if (this.state.backendUpazilaId) {
        query.upazila_id = this.state.backendUpazilaId;
      }

      let weather = null;
      try {
        if (api()) {
          const res = await api().weather.current(query);
          weather = (res && res.data) ? res.data : res;
        }
      } catch (e) { /* demo fallback */ }

      if (!weather) {
        weather = {
          temperature: 29, humidity: 78, wind_speed_kmh: 12, rain_prob_pct: 20,
          condition_bn: 'আংশিক মেঘলা', condition_en: 'Partly cloudy',
        };
      }

      this.lastWeather = weather;
      if (weather.location_name && !this.state.districtNameBn) {
        this.state.label = this.state.label || weather.location_name;
      }
      window.dispatchEvent(new CustomEvent('folika:weatherchange', { detail: weather }));

      try {
        if (api()) {
          const fres = await api().weather.forecast(query);
          this.lastForecast = (fres && fres.data) ? fres.data : fres;
        }
      } catch (e) { /* optional */ }

      this.paintWeather(weather);
    },
  };

  global.FolikaLocation = LocationService;
})(window);
