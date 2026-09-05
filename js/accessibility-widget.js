/**
 * FOLIKA — Floating accessibility widget (govt-style, all pages)
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'folika_a11y';
  const POS_KEY = 'folika_a11y_fab_pos';
  const FONT_LEVELS = ['default', 'large', 'xlarge'];
  const FONT_LABELS = { default: 'সাধারণ', large: 'বড়', xlarge: 'অতি বড়' };

  const DEFAULTS = {
    monochrome: false,
    invert: false,
    largeCursor: false,
    highlightLinks: false,
    highlightHeaders: false,
    readingGuide: false,
    fontLevel: 0,
  };

  const A11Y_ICON_SVG = `<svg viewBox="0 0 24 24" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="11" stroke="#fff" stroke-width="1.5" fill="none"/>
    <circle cx="12" cy="6.2" r="1.8" fill="#fff"/>
    <path d="M8.2 9.2h7.6M12 8v5.2M9.4 18.2l2.6-4.8h0l2.6 4.8" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

  function loadState() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      const state = { ...DEFAULTS, ...raw };
      state.fontLevel = Math.min(FONT_LEVELS.length - 1, Math.max(0, Number(state.fontLevel) || 0));
      return state;
    } catch (e) {
      return { ...DEFAULTS };
    }
  }

  function saveState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function setHtmlFlag(name, on) {
    const root = document.documentElement;
    if (on) root.setAttribute(name, '1');
    else root.removeAttribute(name);
  }

  function cssPath() {
    const inPages = /\/pages\//.test(location.pathname)
      || document.querySelector('link[href*="../css/"]') !== null;
    return inPages ? '../css/accessibility.css?v=20260830g' : 'css/accessibility.css?v=20260830g';
  }

  function ensureCss() {
    let link = document.querySelector('link[data-folika-a11y-css]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'stylesheet';
      link.setAttribute('data-folika-a11y-css', '1');
      document.head.appendChild(link);
    }
    link.href = cssPath();
  }

  function applyFontLevel(level) {
    const root = document.documentElement;
    const name = FONT_LEVELS[level] || 'default';
    if (name === 'default') {
      root.removeAttribute('data-font-scale');
      localStorage.removeItem('folika-font-scale');
    } else {
      root.setAttribute('data-font-scale', name);
      localStorage.setItem('folika-font-scale', name);
    }
    const fs = document.getElementById('fontScaleSelect');
    if (fs) fs.value = name;
  }

  function applyState(state) {
    setHtmlFlag('data-a11y-monochrome', !!state.monochrome);
    setHtmlFlag('data-a11y-invert', !!state.invert);
    setHtmlFlag('data-a11y-large-cursor', !!state.largeCursor);
    setHtmlFlag('data-a11y-highlight-links', !!state.highlightLinks);
    setHtmlFlag('data-a11y-highlight-headers', !!state.highlightHeaders);
    setHtmlFlag('data-a11y-reading-guide', !!state.readingGuide);
    applyFontLevel(state.fontLevel || 0);

    const guide = document.getElementById('folikaA11yReadingGuide');
    if (guide) guide.style.display = state.readingGuide ? 'block' : 'none';

    const cursor = document.getElementById('folikaA11yCursor');
    if (cursor) cursor.style.display = state.largeCursor ? 'block' : 'none';

    syncPanelControls(state);
  }

  function syncPanelControls(state) {
    const panel = document.getElementById('folikaA11yPanel');
    if (!panel) return;
    panel.querySelectorAll('[data-a11y-key]').forEach((input) => {
      const key = input.dataset.a11yKey;
      if (input.type === 'checkbox') input.checked = !!state[key];
    });
    const levelEl = document.getElementById('folikaA11yFontLevel');
    if (levelEl) {
      const name = FONT_LEVELS[state.fontLevel || 0] || 'default';
      levelEl.textContent = `ফন্ট: ${FONT_LABELS[name] || name}`;
    }
  }

  function positionPanel(fab) {
    const panel = document.getElementById('folikaA11yPanel');
    if (!panel || !fab) return;
    const rect = fab.getBoundingClientRect();
    const panelW = Math.min(320, window.innerWidth - 24);
    panel.style.width = `${panelW}px`;
    const panelH = panel.offsetHeight || 420;
    let left = rect.left;
    let top = rect.top - panelH - 12;
    if (top < 12) top = rect.bottom + 12;
    if (left + panelW > window.innerWidth - 12) left = window.innerWidth - panelW - 12;
    if (left < 12) left = 12;
    if (top + panelH > window.innerHeight - 12) top = Math.max(12, window.innerHeight - panelH - 12);
    panel.style.left = `${left}px`;
    panel.style.top = `${top}px`;
  }

  function loadFabPosition(fab) {
    try {
      const pos = JSON.parse(localStorage.getItem(POS_KEY) || 'null');
      if (pos && typeof pos.x === 'number' && typeof pos.y === 'number') {
        fab.style.left = `${pos.x}px`;
        fab.style.top = `${pos.y}px`;
        fab.style.right = 'auto';
        fab.style.bottom = 'auto';
        return;
      }
    } catch (e) { /* ignore */ }
    fab.style.right = '16px';
    fab.style.bottom = '88px';
  }

  function saveFabPosition(fab) {
    const rect = fab.getBoundingClientRect();
    localStorage.setItem(POS_KEY, JSON.stringify({ x: rect.left, y: rect.top }));
  }

  function clampFab(fab) {
    const rect = fab.getBoundingClientRect();
    const maxX = window.innerWidth - rect.width - 8;
    const maxY = window.innerHeight - rect.height - 8;
    const x = Math.min(Math.max(8, rect.left), maxX);
    const y = Math.min(Math.max(8, rect.top), maxY);
    fab.style.left = `${x}px`;
    fab.style.top = `${y}px`;
    fab.style.right = 'auto';
    fab.style.bottom = 'auto';
    saveFabPosition(fab);
  }

  function bindDrag(fab) {
    let dragging = false;
    let startX = 0;
    let startY = 0;
    let originX = 0;
    let originY = 0;
    let moved = false;

    function onPointerDown(e) {
      dragging = true;
      moved = false;
      fab.classList.add('is-dragging');
      startX = e.clientX;
      startY = e.clientY;
      const rect = fab.getBoundingClientRect();
      originX = rect.left;
      originY = rect.top;
      fab.setPointerCapture(e.pointerId);
    }

    function onPointerMove(e) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) moved = true;
      fab.style.left = `${originX + dx}px`;
      fab.style.top = `${originY + dy}px`;
      fab.style.right = 'auto';
      fab.style.bottom = 'auto';
    }

    function onPointerUp(e) {
      if (!dragging) return;
      dragging = false;
      fab.classList.remove('is-dragging');
      try { fab.releasePointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      clampFab(fab);
      fab.dataset.moved = moved ? '1' : '0';
    }

    fab.addEventListener('pointerdown', onPointerDown);
    fab.addEventListener('pointermove', onPointerMove);
    fab.addEventListener('pointerup', onPointerUp);
    fab.addEventListener('pointercancel', onPointerUp);
  }

  function moveReadingGuide(y) {
    const guide = document.getElementById('folikaA11yReadingGuide');
    if (!guide || !document.documentElement.hasAttribute('data-a11y-reading-guide')) return;
    guide.style.top = `${Math.max(0, y - 24)}px`;
  }

  function moveCursor(x, y) {
    const cursor = document.getElementById('folikaA11yCursor');
    if (!cursor || !document.documentElement.hasAttribute('data-a11y-large-cursor')) return;
    cursor.style.left = `${x}px`;
    cursor.style.top = `${y}px`;
  }

  function bindPointerHelpers() {
    let guide = document.getElementById('folikaA11yReadingGuide');
    if (!guide) {
      guide = document.createElement('div');
      guide.id = 'folikaA11yReadingGuide';
      guide.className = 'folika-a11y-reading-guide';
      guide.setAttribute('aria-hidden', 'true');
      document.documentElement.appendChild(guide);
    }
    let cursor = document.getElementById('folikaA11yCursor');
    if (!cursor) {
      cursor = document.createElement('div');
      cursor.id = 'folikaA11yCursor';
      cursor.className = 'folika-a11y-cursor';
      cursor.setAttribute('aria-hidden', 'true');
      document.documentElement.appendChild(cursor);
    }

    document.addEventListener('mousemove', (e) => {
      moveReadingGuide(e.clientY);
      moveCursor(e.clientX, e.clientY);
    });
    document.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      moveReadingGuide(e.touches[0].clientY);
      moveCursor(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }

  function mountShell(node) {
    document.documentElement.appendChild(node);
  }

  function buildPanel() {
    const backdrop = document.createElement('div');
    backdrop.className = 'folika-a11y-backdrop';
    backdrop.id = 'folikaA11yBackdrop';
    backdrop.hidden = true;

    const panel = document.createElement('div');
    panel.id = 'folikaA11yPanel';
    panel.className = 'folika-a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-label', 'এ্যাক্সেসিবিলিটি');
    panel.hidden = true;
    panel.innerHTML = `
      <div class="folika-a11y-panel-header">
        <h2 class="folika-a11y-panel-title">এ্যাক্সেসিবিলিটি</h2>
        <button type="button" class="folika-a11y-close" id="folikaA11yClose" aria-label="বন্ধ">×</button>
      </div>
      <div class="folika-a11y-row">
        <button type="button" class="btn btn-secondary btn-sm" id="folikaA11yFontInc">ফন্ট বৃদ্ধি</button>
        <button type="button" class="btn btn-secondary btn-sm" id="folikaA11yFontDec">ফন্ট হ্রাস</button>
      </div>
      <p class="folika-a11y-font-level" id="folikaA11yFontLevel">ফন্ট: সাধারণ</p>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="monochrome"> <span>মনোক্রোম</span></label>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="invert"> <span>ইনভার্ট</span></label>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="largeCursor"> <span>বড় কার্সর</span></label>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="highlightLinks"> <span>লিঙ্ক হাইলাইট</span></label>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="highlightHeaders"> <span>শিরোনাম হাইলাইট</span></label>
      <label class="folika-a11y-option"><input type="checkbox" data-a11y-key="readingGuide"> <span>পড়ার গাইড</span></label>
      <button type="button" class="btn btn-secondary folika-a11y-reset" id="folikaA11yReset">রিসেট</button>
      <a href="https://www.nvda.org/download" class="folika-a11y-sr-link" target="_blank" rel="noopener noreferrer">স্ক্রিন রিডার ডাউনলোড করুন</a>
    `;

    mountShell(backdrop);
    mountShell(panel);

    function updateFromInput(input) {
      const s = loadState();
      s[input.dataset.a11yKey] = !!input.checked;
      saveState(s);
      applyState(s);
      window.dispatchEvent(new CustomEvent('folika:a11ychange', { detail: { ...s } }));
    }

    panel.querySelectorAll('[data-a11y-key]').forEach((input) => {
      input.addEventListener('change', () => updateFromInput(input));
      input.addEventListener('click', (e) => e.stopPropagation());
    });

    panel.querySelectorAll('.folika-a11y-option').forEach((label) => {
      label.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        e.preventDefault();
        const input = label.querySelector('input[type="checkbox"]');
        if (!input) return;
        input.checked = !input.checked;
        updateFromInput(input);
      });
    });

    document.getElementById('folikaA11yFontInc')?.addEventListener('click', () => {
      const s = loadState();
      s.fontLevel = Math.min(FONT_LEVELS.length - 1, (s.fontLevel || 0) + 1);
      saveState(s);
      applyState(s);
      window.dispatchEvent(new CustomEvent('folika:a11ychange', { detail: { ...s } }));
    });
    document.getElementById('folikaA11yFontDec')?.addEventListener('click', () => {
      const s = loadState();
      s.fontLevel = Math.max(0, (s.fontLevel || 0) - 1);
      saveState(s);
      applyState(s);
      window.dispatchEvent(new CustomEvent('folika:a11ychange', { detail: { ...s } }));
    });
    document.getElementById('folikaA11yReset')?.addEventListener('click', () => {
      const reset = { ...DEFAULTS };
      saveState(reset);
      applyState(reset);
      localStorage.removeItem('folika-font-scale');
      document.documentElement.removeAttribute('data-font-scale');
      document.documentElement.removeAttribute('data-contrast');
      localStorage.removeItem('folika-contrast');
      const contrast = document.getElementById('contrastToggle');
      if (contrast) contrast.checked = false;
      window.dispatchEvent(new CustomEvent('folika:a11ychange', { detail: { ...reset } }));
    });

    function closePanel() {
      backdrop.hidden = true;
      panel.hidden = true;
    }
    function openPanel(fab) {
      syncPanelControls(loadState());
      backdrop.hidden = false;
      panel.hidden = false;
      positionPanel(fab);
      document.getElementById('folikaA11yClose')?.focus();
    }

    backdrop.addEventListener('click', closePanel);
    document.getElementById('folikaA11yClose')?.addEventListener('click', closePanel);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !panel.hidden) closePanel();
    });

    return { openPanel, closePanel };
  }

  function selfTest() {
    const results = [];
    const root = document.documentElement;
    const checks = [
      ['monochrome', 'data-a11y-monochrome'],
      ['invert', 'data-a11y-invert'],
      ['largeCursor', 'data-a11y-large-cursor'],
      ['highlightLinks', 'data-a11y-highlight-links'],
      ['highlightHeaders', 'data-a11y-highlight-headers'],
      ['readingGuide', 'data-a11y-reading-guide'],
    ];
    const original = loadState();
    checks.forEach(([key, attr]) => {
      const on = { ...DEFAULTS, [key]: true };
      applyState(on);
      const ok = root.getAttribute(attr) === '1';
      results.push({ option: key, ok });
    });
    [1, 2].forEach((lvl) => {
      applyState({ ...DEFAULTS, fontLevel: lvl });
      const ok = root.getAttribute('data-font-scale') === FONT_LEVELS[lvl];
      results.push({ option: `font-${FONT_LEVELS[lvl]}`, ok });
    });
    applyState(original);
    const failed = results.filter((r) => !r.ok);
    if (failed.length) {
      console.warn('[Folika A11y] self-test failures:', failed);
    } else {
      console.info('[Folika A11y] self-test passed:', results.length, 'checks');
    }
    return results;
  }

  function init() {
    if (document.body && document.body.dataset.noA11yFab === 'true') return;
    ensureCss();
    bindPointerHelpers();

    const state = loadState();
    const savedScale = localStorage.getItem('folika-font-scale');
    if (savedScale && FONT_LEVELS.includes(savedScale)) {
      state.fontLevel = FONT_LEVELS.indexOf(savedScale);
    }
    applyState(state);

    if (document.getElementById('folikaA11yFab')) {
      setTimeout(selfTest, 50);
      return;
    }

    const fab = document.createElement('button');
    fab.type = 'button';
    fab.id = 'folikaA11yFab';
    fab.className = 'folika-a11y-fab';
    fab.setAttribute('aria-label', 'এ্যাক্সেসিবিলিটি মেনু খুলুন');
    fab.title = 'এ্যাক্সেসিবিলিটি';
    fab.innerHTML = A11Y_ICON_SVG;
    mountShell(fab);
    loadFabPosition(fab);
    bindDrag(fab);

    const panelApi = buildPanel();
    fab.addEventListener('click', () => {
      if (fab.dataset.moved === '1') {
        fab.dataset.moved = '0';
        return;
      }
      const panel = document.getElementById('folikaA11yPanel');
      if (panel && panel.hidden) panelApi.openPanel(fab);
      else panelApi.closePanel();
    });

    window.addEventListener('resize', () => {
      clampFab(fab);
      const panel = document.getElementById('folikaA11yPanel');
      if (panel && !panel.hidden) positionPanel(fab);
    });

    setTimeout(selfTest, 80);
  }

  global.FolikaAccessibility = {
    init,
    loadState,
    saveState,
    applyState,
    selfTest,
    DEFAULTS,
    FONT_LEVELS,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
