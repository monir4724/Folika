/**
 * FOLIKA — Sync local plans with authenticated API (crop, livestock)
 */
(function (global) {
  'use strict';

  let cropMasterCache = null;

  const BREED_SLUG_TO_ID = {
    cross_dairy: 1,
    deshi_cattle: 2,
    gangatiri: 2,
    munshiganj: 2,
    madaripur: 2,
    pmc: 2,
    nbg: 2,
    local_buffalo: 2,
    murrah: 2,
    buff_cross: 2,
    rcc: 3,
    fattening_bull: 4,
    black_bengal: 5,
    garole: 5,
    sonali: 6,
    deshi_chicken: 6,
    naked_neck: 6,
    hilly_chicken: 6,
    fayoumi: 6,
    rir: 6,
    khaki: 7,
    deshi_duck: 7,
    duck_cross: 7,
  };

  const SPECIES_TO_ANIMAL = {
    cattle: 'cow',
    buffalo: 'buffalo',
    goat: 'goat',
    sheep: 'goat',
    chicken: 'chicken',
    duck: 'duck',
  };

  function api() {
    return global.FolikaAPI;
  }

  function loggedIn() {
    return api() && api().Session && api().Session.isLoggedIn();
  }

  async function loadCropMaster() {
    if (cropMasterCache) return cropMasterCache;
    if (!loggedIn()) return [];
    try {
      const res = await api().crops.master();
      const list = (res && res.data) ? res.data : (Array.isArray(res) ? res : []);
      cropMasterCache = list;
      return list;
    } catch (e) {
      return [];
    }
  }

  function resolveCropId(cropKey, varietyName, master) {
    const text = [cropKey, varietyName].filter(Boolean).join(' ');
    if (!text) return 1;
    for (const c of master) {
      const bn = c.name_bn || '';
      if (cropKey && bn.includes(cropKey)) return c.id;
      if (varietyName && bn.includes(varietyName)) return c.id;
    }
    if (/ধান|ব্রি|আমন|বোরো|dhan/i.test(text)) return master.find((c) => (c.suitable_seasons || []).includes('kharif_2'))?.id || 1;
    if (/গম|wheat/i.test(text)) return master.find((c) => /গম/i.test(c.name_bn || ''))?.id || 2;
    if (/ভূট্টা|maize/i.test(text)) return master.find((c) => /ভূট্টা/i.test(c.name_bn || ''))?.id || 4;
    if (/আলু|potato/i.test(text)) return master.find((c) => /আলু/i.test(c.name_bn || ''))?.id || 5;
    return master[0]?.id || 1;
  }

  function resolveBreedId(breedId) {
    return BREED_SLUG_TO_ID[breedId] || 2;
  }

  function unwrapList(res) {
    if (!res) return [];
    if (Array.isArray(res.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  }

  async function syncCropPlan(plan) {
    if (!loggedIn() || !plan) return null;
    const master = await loadCropMaster();
    const crop_id = plan.cropId || resolveCropId(plan.cropKey, plan.varietyName, master);
    let totalCost = 0;
    if (plan.costs) Object.values(plan.costs).forEach((v) => { totalCost += parseFloat(v) || 0; });
    const payload = {
      name: plan.name || 'ফসল পরিকল্পনা',
      land_shape: plan.shape || 'rectangular',
      land_length_m: parseFloat(plan.length) || 0,
      land_width_m: parseFloat(plan.width) || 0,
      crop_id,
      season: plan.season || 'kharif_2',
      status: plan.harvested ? 'harvested' : 'active',
      total_cost: totalCost,
      total_revenue: parseFloat(plan.revenue) || 0,
    };
    try {
      if (plan.serverId) {
        await api().crops.updatePlan(plan.serverId, payload);
        return plan.serverId;
      }
      const res = await api().crops.createPlan(payload);
      const id = res && res.data && res.data.id;
      if (id) {
        plan.serverId = id;
        plan.cropId = crop_id;
      }
      return id;
    } catch (e) {
      console.warn('[FolikaPlanSync] crop', e);
      return null;
    }
  }

  async function syncLivestockPlan(plan) {
    if (!loggedIn() || !plan) return null;
    const animal_type = SPECIES_TO_ANIMAL[plan.species] || 'cow';
    const payload = {
      name: plan.name || 'প্রাণিসম্পদ পরিকল্পনা',
      animal_type,
      breed_id: resolveBreedId(plan.breedId),
      animal_count: Math.max(1, parseInt(plan.count, 10) || 1),
      purpose: plan.species === 'chicken' || plan.species === 'duck' ? 'meat' : 'dual',
      status: 'active',
    };
    try {
      if (plan.serverId) return plan.serverId;
      const res = await api().livestock.createPlan(payload);
      const id = res && res.data && res.data.id;
      if (id) {
        plan.serverId = id;
        try { await api().livestock.generateVaccines(id); } catch (e2) { /* optional */ }
      }
      return id;
    } catch (e) {
      console.warn('[FolikaPlanSync] livestock', e);
      return null;
    }
  }

  async function syncAllCrops(plans, saveFn) {
    if (!loggedIn() || !plans || !plans.length) return;
    for (const p of plans) {
      await syncCropPlan(p);
    }
    if (typeof saveFn === 'function') saveFn();
  }

  async function syncAllLivestock(plans, saveFn) {
    if (!loggedIn() || !plans || !plans.length) return;
    for (const p of plans) {
      if (!p.serverId) await syncLivestockPlan(p);
    }
    if (typeof saveFn === 'function') saveFn();
  }

  async function pullCropsIfEmpty(plans, saveFn) {
    if (!loggedIn() || (plans && plans.length)) return plans;
    try {
      const res = await api().crops.plans();
      const list = unwrapList(res);
      if (!list.length) return plans;
      const mapped = list.map((s) => ({
        id: 'srv_crop_' + s.id,
        serverId: s.id,
        name: s.name || 'ফসল পরিকল্পনা',
        length: s.land_length_m || 0,
        width: s.land_width_m || 0,
        shape: s.land_shape || 'rectangular',
        season: s.season || 'kharif_2',
        cropKey: (s.crop && s.crop.name_bn) || '',
        varietyName: (s.crop && s.crop.name_bn) || '',
        cropId: s.crop_id,
        harvested: s.status === 'harvested',
        costs: {},
        revenue: s.total_revenue || 0,
      }));
      if (typeof saveFn === 'function') saveFn(mapped);
      return mapped;
    } catch (e) {
      return plans;
    }
  }

  async function pullLivestockIfEmpty(plans, saveFn) {
    if (!loggedIn() || (plans && plans.length)) return plans;
    try {
      const res = await api().livestock.plans();
      const list = unwrapList(res);
      if (!list.length) return plans;
      const mapped = list.map((s) => ({
        id: 'srv_ls_' + s.id,
        serverId: s.id,
        name: s.name || 'প্রাণিসম্পদ পরিকল্পনা',
        species: s.animal_type === 'cow' ? 'cattle' : (s.animal_type || 'cattle'),
        animalType: s.animal_type || 'cattle',
        breedId: 'deshi_cattle',
        count: s.animal_count || 1,
        costs: {},
      }));
      if (typeof saveFn === 'function') saveFn(mapped);
      return mapped;
    } catch (e) {
      return plans;
    }
  }

  global.FolikaPlanSync = {
    syncCropPlan,
    syncLivestockPlan,
    syncAllCrops,
    syncAllLivestock,
    pullCropsIfEmpty,
    pullLivestockIfEmpty,
    loggedIn,
  };
})(window);
