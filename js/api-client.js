/**
 * FOLIKA — Central API client with timeout, retry, cache, Bengali errors
 */
(function (global) {
  'use strict';

  const CFG = global.FOLIKA_CONFIG || {};
  const BASE = CFG.API_BASE_URL || 'http://127.0.0.1:8000/api';
  const TIMEOUT_MS = 12000;
  const MAX_GET_RETRIES = 2;
  const RETRY_DELAY_MS = 800;

  const STATUS_MSG_BN = {
    401: 'আপনার লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।',
    403: 'এই কাজটি করার অনুমতি আপনার নেই।',
    404: 'তথ্যটি খুঁজে পাওয়া যায়নি।',
    422: 'দেওয়া তথ্য সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
    429: 'অনেক বেশি অনুরোধ। কিছুক্ষণ পর আবার চেষ্টা করুন।',
    500: 'সার্ভারে সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।',
    503: 'সার্ভার সাময়িকভাবে ব্যস্ত। পরে চেষ্টা করুন।',
    slow: 'নেটওয়ার্ক ধীর — অনুগ্রহ করে অপেক্ষা করুন।',
    offline: 'ইন্টারনেট সংযোগ নেই। সংরক্ষিত তথ্য দেখানো হচ্ছে।',
  };

  function log(event, detail) {
    const safe = { ...detail };
    if (safe.mobile) safe.mobile = '***' + String(safe.mobile).slice(-3);
    if (safe.phone) safe.phone = '***';
    console.info('[FolikaApiClient]', event, safe);
  }

  function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

  function isOnline() {
    return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
  }

  function getToken() {
    return global.FolikaAPI && global.FolikaAPI.Session
      ? global.FolikaAPI.Session.getToken()
      : localStorage.getItem(CFG.TOKEN_KEY || 'folika_token');
  }

  function clearToken() {
    if (global.FolikaAPI && global.FolikaAPI.Session) global.FolikaAPI.Session.clearToken();
    else localStorage.removeItem(CFG.TOKEN_KEY || 'folika_token');
  }

  class ClientError extends Error {
    constructor(code, status, messageBn, errors) {
      super(messageBn);
      this.name = 'ClientError';
      this.code = code;
      this.status = status;
      this.banglaMessage = messageBn;
      this.errors = errors || null;
    }
  }

  async function fetchOnce(method, path, { body, query, auth = true, isForm = false } = {}) {
    let url = BASE + path;
    if (query && typeof query === 'object') {
      const qs = new URLSearchParams();
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') qs.append(k, v);
      });
      const str = qs.toString();
      if (str) url += (url.includes('?') ? '&' : '?') + str;
    }

    const headers = { Accept: 'application/json' };
    const token = getToken();
    if (auth && token) headers.Authorization = 'Bearer ' + token;

    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

    const options = { method, headers, signal: ctrl.signal };
    if (body !== undefined) {
      if (isForm) options.body = body;
      else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url, options);
      clearTimeout(timer);

      if (response.status === 204) return { success: true };

      let payload = null;
      const text = await response.text();
      if (text) {
        try { payload = JSON.parse(text); } catch (e) { payload = { message: text }; }
      }

      if (!response.ok) {
        const code = (payload && payload.error_code) || 'server_error';
        const msg = STATUS_MSG_BN[response.status] || (global.FolikaAPI && global.FolikaAPI.banglaError
          ? global.FolikaAPI.banglaError(code, payload && payload.message)
          : STATUS_MSG_BN[500]);
        if (response.status === 401) {
          if (global.FolikaAPI && global.FolikaAPI.Session) global.FolikaAPI.Session.clear();
          else clearToken();
        }
        throw new ClientError(code, response.status, msg, payload && payload.errors);
      }
      return payload;
    } catch (err) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        throw new ClientError('timeout', 0, STATUS_MSG_BN.slow, null);
      }
      if (!isOnline()) {
        throw new ClientError('offline', 0, STATUS_MSG_BN.offline, null);
      }
      if (err instanceof ClientError) throw err;
      throw new ClientError('network_error', 0, 'ইন্টারনেট সংযোগে সমস্যা। সংযোগ যাচাই করে আবার চেষ্টা করুন।', null);
    }
  }

  async function request(method, path, opts = {}) {
    const retries = method === 'GET' ? MAX_GET_RETRIES : 0;
    let lastErr;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fetchOnce(method, path, opts);
      } catch (e) {
        lastErr = e;
        if (e.status === 401 || e.status === 403 || e.status === 404 || e.status === 422) throw e;
        if (i < retries) await sleep(RETRY_DELAY_MS * (i + 1));
      }
    }
    log('request_failed', { method, path, status: lastErr && lastErr.status });
    throw lastErr;
  }

  const memoryCache = new Map();
  const CACHE_TTL = 45000;

  async function cachedGet(path, opts = {}) {
    const key = path + JSON.stringify(opts.query || {});
    const hit = memoryCache.get(key);
    if (hit && Date.now() - hit.ts < CACHE_TTL) {
      request('GET', path, opts).then((fresh) => memoryCache.set(key, { data: fresh, ts: Date.now() })).catch(() => {});
      return hit.data;
    }
    const data = await request('GET', path, opts);
    memoryCache.set(key, { data, ts: Date.now() });
    return data;
  }

  function invalidateCache(prefix) {
    memoryCache.forEach((_, k) => { if (k.startsWith(prefix)) memoryCache.delete(k); });
  }

  const ApiClient = {
    ClientError,
    STATUS_MSG_BN,
    isOnline,
    log,
    get: (path, opts) => request('GET', path, opts),
    cachedGet,
    post: (path, body, opts) => request('POST', path, { ...opts, body }),
    patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
    del: (path, opts) => request('DELETE', path, opts),
    invalidateCache,
    redirectToLogin() {
      const inPages = /\/pages\//.test(window.location.pathname);
      window.location.href = inPages ? 'login.html' : 'pages/login.html';
    },
    handleAuthError(err) {
      if (err && err.status === 401) this.redirectToLogin();
    },
  };

  global.FolikaApiClient = ApiClient;
})(window);
