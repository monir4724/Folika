/**
 * Lightweight unit tests for FolikaApiClient retry logic and offline queue.
 * Run: node tests/js/profile-client.test.mjs
 */

import { strict as assert } from 'assert';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import vm from 'vm';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '../..');

function loadScript(relPath, globals = {}) {
  const code = readFileSync(join(root, relPath), 'utf8');
  const ctx = {
    window: {},
    localStorage: {
      store: {},
      getItem(k) { return this.store[k] || null; },
      setItem(k, v) { this.store[k] = v; },
      removeItem(k) { delete this.store[k]; },
    },
    navigator: { onLine: true },
    fetch: globals.fetch || (async () => ({ ok: true, status: 200, text: async () => '{"success":true}' })),
    console,
    setTimeout,
    clearTimeout,
    CustomEvent: class { constructor(t, d) { this.type = t; this.detail = d; } },
    AbortController: globalThis.AbortController,
    dispatchEvent() {},
    addEventListener() {},
    ...globals,
  };
  ctx.window = ctx;
  ctx.window.dispatchEvent = () => {};
  ctx.window.addEventListener = () => {};
  ctx.global = ctx;
  vm.runInNewContext(code, ctx, { filename: relPath });
  return ctx;
}

// --- Offline sync tests ---
{
  const ctx = loadScript('js/offline-sync.js');
  const sync = ctx.FolikaOfflineSync;
  sync.enqueue({ type: 'update_profile', payload: { name: 'Test' } });
  assert.equal(sync.pendingCount(), 1);
  const q = sync.loadQueue();
  assert.equal(q[0].status, 'pending');
  sync.resolveConflict(q[0].id);
  assert.equal(sync.pendingCount(), 0);
  console.log('offline-sync: enqueue + resolve OK');
}

// --- ApiClient GET retry test ---
{
  let attempts = 0;
  const ctx = loadScript('js/api-client.js', {
    fetch: async () => {
      attempts++;
      if (attempts < 2) throw new Error('network');
      return { ok: true, status: 200, text: async () => '{"success":true,"data":{"ok":1}}' };
    },
    FolikaAPI: { Session: { getToken: () => 'tok', clearToken: () => {} }, banglaError: (c) => c },
    FOLIKA_CONFIG: { API_BASE_URL: 'http://test/api', TOKEN_KEY: 't' },
  });
  const client = ctx.FolikaApiClient;
  const res = await client.get('/user/profile');
  assert.equal(attempts, 2);
  assert.equal(res.success, true);
  console.log('api-client: GET retry OK');
}

// --- ApiClient 401 handling ---
{
  const cleared = { v: false };
  const ctx = loadScript('js/api-client.js', {
    fetch: async () => ({
      ok: false, status: 401,
      text: async () => '{"error_code":"unauthenticated","message":"Unauth"}',
    }),
    FolikaAPI: { Session: { getToken: () => 'tok', clearToken: () => { cleared.v = true; }, clear: () => { cleared.v = true; } }, banglaError: (c) => c },
    FOLIKA_CONFIG: { API_BASE_URL: 'http://test/api' },
  });
  try {
    await ctx.FolikaApiClient.get('/user/profile');
    assert.fail('should throw');
  } catch (e) {
    assert.equal(e.status, 401);
    assert.equal(cleared.v, true);
  }
  console.log('api-client: 401 clears token OK');
}

console.log('\nAll profile unit tests passed.');
