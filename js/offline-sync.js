/**
 * FOLIKA — Offline sync queue for profile edits & vaccination completion
 */
(function (global) {
  'use strict';

  const QUEUE_KEY = 'folika_offline_queue';
  const api = () => global.FolikaApiClient;
  const folikaApi = () => global.FolikaAPI;

  function loadQueue() {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
      return Array.isArray(q) ? q : [];
    } catch (e) {
      return [];
    }
  }

  function saveQueue(q) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    window.dispatchEvent(new CustomEvent('folika:syncqueuechange', { detail: { count: q.length } }));
  }

  function enqueue(item) {
    const q = loadQueue();
    q.push({
      id: 'q_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      created_at: new Date().toISOString(),
      status: 'pending',
      conflict: false,
      ...item,
    });
    saveQueue(q);
    return q[q.length - 1];
  }

  function pendingCount() {
    return loadQueue().filter((i) => i.status === 'pending' && !i.conflict).length;
  }

  async function flush() {
    if (!api() || !folikaApi() || !api().isOnline()) return { synced: 0, failed: 0 };
    const token = folikaApi().Session && folikaApi().Session.getToken();
    if (!token) return { synced: 0, failed: 0 };

    const q = loadQueue();
    let synced = 0;
    let failed = 0;

    for (const item of q) {
      if (item.status !== 'pending' || item.conflict) continue;
      try {
        if (item.type === 'update_profile') {
          await api().patch('/user/profile', item.payload);
        } else if (item.type === 'complete_vaccine') {
          const { planId, vaccineId } = item.payload;
          await api().patch(`/livestock/plans/${planId}/vaccines/${vaccineId}/complete`, {});
        } else if (item.type === 'sync_batch') {
          await folikaApi().sync.push(item.payload.queue);
        }
        item.status = 'synced';
        synced++;
      } catch (e) {
        if (e && e.status === 409) {
          item.conflict = true;
          item.status = 'conflict';
        } else {
          item.status = 'failed';
          failed++;
        }
      }
    }

    saveQueue(q.filter((i) => i.status === 'pending' || i.status === 'conflict' || i.status === 'failed'));
    if (synced > 0 && api().invalidateCache) api().invalidateCache('/user');
    return { synced, failed };
  }

  function markConflict(id) {
    const q = loadQueue();
    const item = q.find((i) => i.id === id);
    if (item) { item.conflict = true; item.status = 'conflict'; saveQueue(q); }
  }

  function resolveConflict(id) {
    const q = loadQueue().filter((i) => i.id !== id);
    saveQueue(q);
  }

  function init() {
    window.addEventListener('online', () => {
      flush().then(() => {
        if (folikaApi() && folikaApi().sync) {
          folikaApi().sync.status().catch(() => {});
        }
      });
    });
    if (api() && api().isOnline()) flush();
  }

  global.FolikaOfflineSync = {
    loadQueue, enqueue, pendingCount, flush, markConflict, resolveConflict, init,
  };
})(window);
