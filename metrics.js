// SVARNA live metrics band — pulls citation stats from OpenAlex, caches 24h.
(function () {
  var CACHE = 'svarna-openalex-v1';
  var TTL = 24 * 60 * 60 * 1000;

  function set(id, val) {
    var el = document.getElementById(id);
    if (el && val != null) el.textContent = typeof val === 'number' ? val.toLocaleString() : val;
  }

  function fill(stats) {
    set('m-citations', stats.citations);
    set('m-hindex', stats.hIndex);
    set('m-works', stats.works);
  }

  function readCache() {
    try {
      var c = JSON.parse(localStorage.getItem(CACHE));
      if (c && Date.now() - c.at < TTL) return c.data;
    } catch (e) {}
    return null;
  }

  function run() {
    var cached = readCache();
    if (cached) { fill(cached); return; }
    fetch('https://api.openalex.org/authors?search=Stergios%20Chatzikyriakidis&per-page=5')
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (j) {
        var res = (j && j.results) || [];
        if (!res.length) return;
        var best = res.reduce(function (a, b) {
          return (b.cited_by_count || 0) > (a.cited_by_count || 0) ? b : a;
        });
        var stats = {
          citations: best.cited_by_count || 0,
          hIndex: (best.summary_stats && best.summary_stats.h_index) || 0,
          works: best.works_count || 0
        };
        fill(stats);
        try { localStorage.setItem(CACHE, JSON.stringify({ at: Date.now(), data: stats })); } catch (e) {}
      })
      .catch(function () { /* keep static fallback numbers already in HTML */ });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  else run();
})();
