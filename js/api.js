/**
 * FOLIKA (ফলিকা) - API Client
 * -------------------------------------------------------------
 * A single, dependency-free bridge between the static frontend and the
 * Laravel REST backend. Handles:
 *   - Sanctum bearer token storage/refresh
 *   - JSON + multipart requests
 *   - Standardised error handling (maps backend `error_code` -> Bangla text)
 *   - Graceful offline detection
 *
 * Usage:  const weather = await FolikaAPI.weather.current();
 */
(function (global) {
  'use strict';

  const CFG = global.FOLIKA_CONFIG || {};
  const BASE = CFG.API_BASE_URL || 'http://127.0.0.1:8000/api';

  /* ---------------------------------------------------------------
     error_code -> Bangla message table (primary language: Bangla)
     The backend returns a stable English `message` for logs and an
     `error_code`; the UI shows the Bangla mapping below.
     --------------------------------------------------------------- */
  const ERROR_MESSAGES_BN = {
    validation_failed: 'দেওয়া তথ্য সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
    otp_expired: 'ওটিপি-র মেয়াদ শেষ হয়ে গেছে। নতুন করে ওটিপি নিন।',
    otp_invalid: 'ভুল ওটিপি দিয়েছেন। আবার চেষ্টা করুন।',
    otp_locked: 'অনেকবার ভুল হয়েছে। ৩০ মিনিট পর আবার চেষ্টা করুন।',
    otp_not_found: 'কোনো ওটিপি পাওয়া যায়নি। নতুন করে অনুরোধ করুন।',
    too_many_requests: 'অনেক বেশি অনুরোধ করা হয়েছে। কিছুক্ষণ পর চেষ্টা করুন।',
    sms_failed: 'এসএমএস পাঠানো যায়নি। একটু পর আবার চেষ্টা করুন।',
    unauthenticated: 'আপনার লগইন সেশন শেষ হয়েছে। আবার লগইন করুন।',
    unauthorized: 'এই কাজটি করার অনুমতি আপনার নেই।',
    forbidden: 'এই কাজটি করার অনুমতি আপনার নেই।',
    admin_unauthorized: 'অ্যাডমিন প্যানেলে প্রবেশের অনুমতি নেই।',
    not_found: 'তথ্যটি খুঁজে পাওয়া যায়নি।',
    ai_failed: 'এআই বিশ্লেষণ করা যায়নি। একটু পর আবার ছবি দিন।',
    weather_unavailable: 'আবহাওয়ার তথ্য এখন পাওয়া যাচ্ছে না।',
    server_error: 'সার্ভারে সমস্যা হয়েছে। একটু পর আবার চেষ্টা করুন।',
    network_error: 'ইন্টারনেট সংযোগে সমস্যা। সংযোগ যাচাই করে আবার চেষ্টা করুন।',
  };

  function banglaError(code, fallback) {
    return ERROR_MESSAGES_BN[code] || fallback || ERROR_MESSAGES_BN.server_error;
  }

  /* ---------------------------------------------------------------
     Token & user session helpers
     --------------------------------------------------------------- */
  const Session = {
    getToken() {
      return localStorage.getItem(CFG.TOKEN_KEY || 'folika_token');
    },
    setToken(token) {
      if (token) localStorage.setItem(CFG.TOKEN_KEY || 'folika_token', token);
    },
    clearToken() {
      localStorage.removeItem(CFG.TOKEN_KEY || 'folika_token');
    },
    getUser() {
      try {
        return JSON.parse(localStorage.getItem(CFG.USER_KEY || 'folika_user'));
      } catch (e) {
        return null;
      }
    },
    setUser(user) {
      if (user) localStorage.setItem(CFG.USER_KEY || 'folika_user', JSON.stringify(user));
    },
    clear() {
      this.clearToken();
      localStorage.removeItem(CFG.USER_KEY || 'folika_user');
    },
    isLoggedIn() {
      return !!this.getToken();
    },
  };

  /* ---------------------------------------------------------------
     Custom error the whole app can catch
     --------------------------------------------------------------- */
  class ApiError extends Error {
    constructor(code, messageEn, status, errors) {
      super(messageEn || code);
      this.name = 'ApiError';
      this.code = code;
      this.status = status;
      this.errors = errors || null;
      this.banglaMessage = banglaError(code, messageEn);
    }
  }

  /* ---------------------------------------------------------------
     Core request function
     --------------------------------------------------------------- */
  async function request(method, path, { body, query, auth = true, isForm = false } = {}) {
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
    const token = Session.getToken();
    if (token && (auth || path.indexOf('/weather/') === 0 || path.indexOf('/disease/nearby') === 0 || path.indexOf('/market/dealers') === 0)) {
      headers.Authorization = 'Bearer ' + token;
    }

    const options = { method, headers };

    if (body !== undefined) {
      if (isForm) {
        options.body = body; // FormData; browser sets content-type + boundary
      } else {
        headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
    }

    let response;
    try {
      response = await fetch(url, options);
    } catch (networkErr) {
      throw new ApiError('network_error', networkErr.message, 0, null);
    }

    // 204 No Content
    if (response.status === 204) return { success: true };

    let payload = null;
    const text = await response.text();
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch (e) {
        payload = { message: text };
      }
    }

    if (!response.ok) {
      const code =
        (payload && payload.error_code) ||
        (response.status === 401 ? 'unauthenticated' : response.status === 403 ? 'forbidden' : response.status === 404 ? 'not_found' : response.status === 429 ? 'too_many_requests' : 'server_error');

      // Auto-clear dead session
      if (response.status === 401) Session.clear();

      throw new ApiError(code, payload && payload.message, response.status, payload && payload.errors);
    }

    return payload;
  }

  const http = {
    get: (path, opts) => request('GET', path, opts),
    post: (path, body, opts) => request('POST', path, { ...opts, body }),
    patch: (path, body, opts) => request('PATCH', path, { ...opts, body }),
    del: (path, opts) => request('DELETE', path, opts),
    postForm: (path, formData, opts) => request('POST', path, { ...opts, body: formData, isForm: true }),
  };

  /* ---------------------------------------------------------------
     Public API surface — grouped by domain
     --------------------------------------------------------------- */
  const FolikaAPI = {
    ApiError,
    Session,
    banglaError,
    config: () => http.get('/config', { auth: false }),
    health: () => http.get('/health', { auth: false }),

    auth: {
      sendOtp: (mobile, purpose = 'login') =>
        http.post('/auth/otp/send', { mobile, purpose }, { auth: false }),
      verifyOtp: async (mobile, otp) => {
        const res = await http.post('/auth/otp/verify', { mobile, otp }, { auth: false });
        if (res && res.token) {
          Session.setToken(res.token);
          if (res.user) Session.setUser(res.user);
        }
        return res;
      },
      me: () => http.get('/auth/me'),
      onboarding: (data) => http.post('/auth/onboarding', data),
      logout: async () => {
        try { await http.post('/auth/logout', {}); } finally { Session.clear(); }
      },
      logoutAll: async () => {
        try { await http.post('/auth/logout-all', {}); } finally { Session.clear(); }
      },
    },

    user: {
      profile: () => http.get('/user/profile'),
      updateProfile: (data) => http.patch('/user/profile', data),
      preferences: (data) => http.patch('/user/preferences', data),
      fcmToken: (token) => http.post('/user/fcm-token', { fcm_token: token }),
      summary: () => http.get('/user/summary'),
      deleteAccount: () => http.del('/user/account'),
    },

    location: {
      divisions: () => http.get('/location/divisions', { auth: false }),
      districts: (divisionId) => http.get('/location/districts/' + divisionId, { auth: false }),
      upazilas: (districtId) => http.get('/location/upazilas/' + districtId, { auth: false }),
      aez: (upazilaId) => http.get('/location/aez/' + upazilaId, { auth: false }),
      reverse: (query) => http.get('/location/reverse', { query, auth: false }),
      resolve: (query) => http.get('/location/resolve', { query, auth: false }),
    },

    weather: {
      current: (query) => http.get('/weather/current', { query, auth: false }),
      forecast: (query) => http.get('/weather/forecast', { query, auth: false }),
      alerts: (query) => http.get('/weather/alerts', { query, auth: false }),
    },

    crops: {
      master: () => http.get('/crops/master'),
      recommendations: (query) => http.get('/crops/recommendations', { query }),
      rotationAdvice: (data) => http.post('/crops/rotation-advice', data),
      weatherIrrigation: (query) => http.get('/crops/weather-irrigation', { query }),
      plans: () => http.get('/crops/plans'),
      getPlan: (id) => http.get('/crops/plans/' + id),
      createPlan: (data) => http.post('/crops/plans', data),
      updatePlan: (id, data) => http.patch('/crops/plans/' + id, data),
      deletePlan: (id) => http.del('/crops/plans/' + id),
      addCost: (id, data) => http.post('/crops/plans/' + id + '/costs', data),
      addRevenue: (id, data) => http.post('/crops/plans/' + id + '/revenues', data),
    },

    fish: {
      species: () => http.get('/fish/species'),
      recommend: (query) => http.get('/fish/species-recommend', { query }),
      calculateLayers: (body) => http.post('/fish/calculate-layers', body, { auth: false }),
      saveClientPlans: (body) => http.post('/fish/client-plans', body, { auth: false }),
      loadClientPlans: (clientKey) => http.get('/fish/client-plans', { auth: false, query: { client_key: clientKey } }),
      saveClientReminders: (body) => http.post('/fish/client-reminders', body, { auth: false }),
      loadClientReminders: (clientKey) => http.get('/fish/client-reminders', { auth: false, query: { client_key: clientKey } }),
      plans: () => http.get('/fish/plans'),
      getPlan: (id) => http.get('/fish/plans/' + id),
      createPlan: (data) => http.post('/fish/plans', data),
      deletePlan: (id) => http.del('/fish/plans/' + id),
      addSpecies: (id, data) => http.post('/fish/plans/' + id + '/species', data),
    },

    livestock: {
      breeds: (query) => http.get('/livestock/breeds', { query }),
      capacityCheck: (data) => http.post('/livestock/capacity-check', data),
      plans: () => http.get('/livestock/plans'),
      getPlan: (id) => http.get('/livestock/plans/' + id),
      createPlan: (data) => http.post('/livestock/plans', data),
      deletePlan: (id) => http.del('/livestock/plans/' + id),
      generateVaccines: (id) => http.post('/livestock/plans/' + id + '/generate-vaccines', {}),
      vaccines: (id) => http.get('/livestock/plans/' + id + '/vaccines'),
      completeVaccine: (planId, vaccineId) =>
        http.patch('/livestock/plans/' + planId + '/vaccines/' + vaccineId + '/complete', {}),
    },

    disease: {
      analyze: (formData) => http.postForm('/disease/analyze', formData),
      history: (query) => http.get('/disease/history', { query }),
      get: (id) => http.get('/disease/' + id),
      nearbyCenters: (query) => http.get('/disease/nearby-centers', { query, auth: false }),
    },

    community: {
      posts: (query) => http.get('/community/posts', { query, auth: false }),
      getPost: (id) => http.get('/community/posts/' + id),
      createPost: (data) => http.post('/community/posts', data),
      reply: (id, data) => http.post('/community/posts/' + id + '/reply', data),
      vote: (id, voteType) => http.post('/community/posts/' + id + '/vote', { vote_type: voteType }),
      report: (data) => http.post('/community/report', data),
    },

    market: {
      prices: (query) => http.get('/market/prices', { query }),
      dealers: (query) => http.get('/market/dealers', { query, auth: false }),
    },

    notifications: {
      list: () => http.get('/notifications'),
      read: (id) => http.patch('/notifications/' + id + '/read', {}),
      readAll: () => http.post('/notifications/read-all', {}),
    },

    sync: {
      push: (queue) => http.post('/sync', { queue }),
      status: () => http.get('/sync/status'),
    },

    get: http.get,
    patch: http.patch,
    post: http.post,
    del: http.del,
    isOnline() {
      return typeof navigator === 'undefined' ? true : navigator.onLine !== false;
    },
    redirectToLogin() {
      const inPages = /\/pages\//.test(window.location.pathname);
      window.location.href = inPages ? 'login.html' : 'pages/login.html';
    },
    handleAuthError(err) {
      if (err && err.status === 401) this.redirectToLogin();
    },
    invalidateCache() { /* no-op unless FolikaApiClient is present */ },
    cachedGet(path, opts) {
      if (global.FolikaApiClient && global.FolikaApiClient.cachedGet) {
        return global.FolikaApiClient.cachedGet(path, opts);
      }
      return http.get(path, opts);
    },
  };

  if (!global.FolikaApiClient) {
    global.FolikaApiClient = {
      isOnline: FolikaAPI.isOnline,
      get: http.get,
      patch: http.patch,
      post: http.post,
      del: http.del,
      cachedGet: FolikaAPI.cachedGet,
      invalidateCache: FolikaAPI.invalidateCache,
      redirectToLogin: () => FolikaAPI.redirectToLogin(),
      handleAuthError: (err) => FolikaAPI.handleAuthError(err),
    };
  }

  global.FolikaAPI = FolikaAPI;
})(window);
