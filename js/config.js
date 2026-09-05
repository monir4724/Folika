/**
 * FOLIKA (ফলিকা) - Frontend Runtime Configuration
 * -------------------------------------------------------------
 * Primary language: Bangla (bn) | Secondary language: English (en)
 *
 * This file centralises every value the frontend needs to talk to the
 * Laravel backend. Change API_BASE_URL here (or via window.FOLIKA_ENV)
 * and the whole app follows.
 */
(function (global) {
  'use strict';

  // Allow an override injected before this script (e.g. in a <script> tag)
  const injected = global.FOLIKA_ENV || {};

  const CONFIG = {
    // Base URL of the Laravel REST API. XAMPP / `php artisan serve` default.
    API_BASE_URL: injected.API_BASE_URL || 'http://127.0.0.1:8000/api',

    // Google Maps browser key (also fetched live from /config at runtime).
    GOOGLE_MAPS_API_KEY: injected.GOOGLE_MAPS_API_KEY || 'AIzaSyDbTUxftyBN-nIYeYxfnrGUGW-R4Wd4feA',

    // Language settings — Bangla primary, English secondary.
    PRIMARY_LANGUAGE: 'bn',
    SECONDARY_LANGUAGE: 'en',

    // localStorage keys.
    TOKEN_KEY: 'folika_token',
    USER_KEY: 'folika_user',
    LANG_KEY: 'folika_lang',

    // When true, pages fall back to built-in demo data if the API is offline
    // so the static site keeps working without a running backend.
    GRACEFUL_OFFLINE: true,

    // Demo credentials seeded for end-to-end testing.
    DEMO_MOBILE: '01711111111',
    DEMO_OTP: '123456',
  };

  global.FOLIKA_CONFIG = CONFIG;
})(window);
