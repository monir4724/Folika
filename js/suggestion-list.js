/**
 * FOLIKA — Format suggestions as bullet lists across the app
 */
(function (global) {
  'use strict';

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function toList(items) {
    const list = (items || []).map((item) => String(item).trim()).filter(Boolean);
    if (!list.length) return '';
    return `<ul class="folika-suggest-list">${list.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }

  function paragraphToList(text) {
    const raw = String(text || '').trim();
    if (!raw) return '';
    const parts = raw
      .split(/(?:\.\s+|।\s+)/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length <= 1) return `<p class="folika-suggest-text">${escapeHtml(raw)}</p>`;
    const items = parts.map((p) => {
      if (/[।.!?]$/.test(p)) return p;
      return /[\u0980-\u09FF]/.test(p) ? `${p}।` : `${p}.`;
    });
    return toList(items);
  }

  function joinList(items, sep) {
    return (items || []).filter(Boolean).join(sep || ', ');
  }

  global.FolikaSuggestList = {
    escapeHtml,
    toList,
    paragraphToList,
    joinList,
  };
})(window);
