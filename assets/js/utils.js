// Shared utilities for LL pages (no build step required)
(function(){
  const base = (window.__BASEURL__ || '').replace(/\/$/, '');

  const U = {
    rel(path) { return base + path; },
    byId(id) { return document.getElementById(id); },
    setText(id, text) { const el = U.byId(id); if (el) el.textContent = text; },
    setHTML(id, html) { const el = U.byId(id); if (el) el.innerHTML = html; },
    onReady(fn) {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once: true });
      else fn();
    },
    fetchJSON(path) { return fetch(U.rel(path)).then(r => { if (!r.ok) throw new Error('HTTP '+r.status); return r.json(); }); },
  };

  window.__LL__ = U;
})();

