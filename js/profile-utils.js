/**
 * FOLIKA — Profile shared utilities (escaping, formatting, cache)
 */
(function (global) {
  'use strict';

  const BN_DIGITS = { 0:'০',1:'১',2:'২',3:'৩',4:'৪',5:'৫',6:'৬',7:'৭',8:'৮',9:'৯' };

  function getLang() {
    return (global.FolikaI18n && global.FolikaI18n.getLang()) || 'bn';
  }

  function en() { return getLang() === 'en'; }

  function toBn(str) {
    if (en()) return String(str);
    return String(str).replace(/\d/g, (d) => BN_DIGITS[d] || d);
  }

  function esc(s) {
    if (s == null) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /** Resolve API/static asset paths for pages/ vs site root */
  function mediaUrl(url) {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    const inPages = /\/pages\//.test(location.pathname)
      || document.querySelector('link[href*="../css/"]') !== null;
    if (url.startsWith('assets/')) return inPages ? '../' + url : url;
    if (url.startsWith('storage/')) {
      const base = (global.FOLIKA_CONFIG && global.FOLIKA_CONFIG.API_BASE_URL) || 'http://127.0.0.1:8000';
      return base.replace(/\/api\/?$/, '') + '/' + url;
    }
    return url;
  }

  function unwrap(res) {
    if (!res) return null;
    if (res.data !== undefined) return res.data;
    return res;
  }

  function unwrapList(res) {
    const d = unwrap(res);
    if (Array.isArray(d)) return d;
    if (d && Array.isArray(d.data)) return d.data;
    return [];
  }

  function formatMoney(n) {
    const num = Number(n) || 0;
    const formatted = Math.round(num).toLocaleString('en-IN');
    return toBn(formatted) + ' ৳';
  }

  function formatDate(iso) {
    if (!iso) return '—';
    try {
      const d = new Date(iso);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return toBn(`${day}/${m}/${y}`);
    } catch (e) {
      return esc(iso);
    }
  }

  function maskMobile(m) {
    if (!m || m.length < 6) return '***';
    return toBn(m.slice(0, 3) + 'XXXX' + m.slice(-3));
  }

  function locationLine(user) {
    if (!user) return '';
    const upa = user.upazila && (en() ? user.upazila.name_en : user.upazila.name_bn);
    const dist = user.district && (en() ? user.district.name_en : user.district.name_bn);
    if (upa && dist) return `${upa}, ${dist}`;
    if (upa) return upa;
    return user.location_name || '';
  }

  function farmTypeLabel(type) {
    const map = {
      crop: en() ? 'Crop' : 'ফসল',
      fish: en() ? 'Fish' : 'মাছ',
      livestock: en() ? 'Livestock' : 'প্রাণিসম্পদ',
      mixed: en() ? 'Mixed farm' : 'মিশ্র খামার',
    };
    return map[type] || type || '';
  }

  function severityLabel(sev) {
    const map = {
      mild: en() ? 'Mild' : 'হালকা',
      moderate: en() ? 'Moderate' : 'মাঝারি',
      severe: en() ? 'Severe' : 'গুরুতর',
    };
    return map[sev] || sev || '';
  }

  function categoryLabel(cat) {
    const map = {
      crop: en() ? 'Crop' : 'ফসল',
      fish: en() ? 'Fish' : 'মাছ',
      livestock: en() ? 'Livestock' : 'প্রাণিসম্পদ',
    };
    return map[cat] || cat || '';
  }

  function profileCompletion(user) {
    if (!user) return 0;
    return user.name ? 100 : 0;
  }

  function sumMoney(items, key) {
    if (!Array.isArray(items)) return 0;
    return items.reduce((acc, it) => acc + Math.round(Number(it[key] || 0) * 100), 0) / 100;
  }

  const sessionCache = new Map();
  const CACHE_TTL = 60000;

  function cacheGet(key) {
    const e = sessionCache.get(key);
    if (!e) return null;
    if (Date.now() - e.ts > CACHE_TTL) { sessionCache.delete(key); return null; }
    return e.val;
  }

  function cacheSet(key, val) {
    sessionCache.set(key, { val, ts: Date.now() });
  }

  function cacheInvalidate(prefix) {
    sessionCache.forEach((_, k) => { if (k.startsWith(prefix)) sessionCache.delete(k); });
  }

  function statusLabel(status) {
    const map = {
      active: en() ? 'Active' : 'চলমান',
      completed: en() ? 'Completed' : 'সম্পন্ন',
      draft: en() ? 'Draft' : 'খসড়া',
      archived: en() ? 'Archived' : 'সংরক্ষিত',
      harvested: en() ? 'Harvested' : 'ফসল তোলা হয়েছে',
    };
    return map[status] || status || (en() ? 'Active' : 'চলমান');
  }

  global.FolikaProfileUtils = {
    getLang, en, toBn, esc, mediaUrl, unwrap, unwrapList, formatMoney, formatDate,
    maskMobile, locationLine, farmTypeLabel, severityLabel, categoryLabel,
    profileCompletion, sumMoney, cacheGet, cacheSet, cacheInvalidate, statusLabel,
  };
})(window);
