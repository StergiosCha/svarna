// SVARNA theme toggle (dark / light) with persistence
(function () {
  var KEY = 'svarna-theme';
  function current() {
    return document.documentElement.getAttribute('data-theme') || 'light';
  }
  function apply(t) {
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.textContent = t === 'dark' ? '☀' : '☾'; // sun in dark, moon in light
      b.setAttribute('aria-label', t === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function init() {
    apply(current());
    document.querySelectorAll('.theme-toggle').forEach(function (b) {
      b.addEventListener('click', function () {
        apply(current() === 'dark' ? 'light' : 'dark');
      });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
