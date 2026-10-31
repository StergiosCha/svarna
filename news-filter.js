/* News page: year chips + text search over the existing cards. No markup changes to the cards. */
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.publication-card'));
  var years = Array.prototype.slice.call(document.querySelectorAll('h2')).filter(function (h) { return /^\s*20\d\d\s*$/.test(h.textContent); });
  var yearsBox = document.getElementById('newsYears'), search = document.getElementById('newsSearch'), count = document.getElementById('newsCount');
  if (!yearsBox || !cards.length) return;
  function yearOf(card) { var m = (card.textContent || '').match(/\b(20\d\d)\b/); return m ? m[1] : ''; }
  cards.forEach(function (c) { c.setAttribute('data-year', yearOf(c)); });
  var ys = []; cards.forEach(function (c) { var y = c.getAttribute('data-year'); if (y && ys.indexOf(y) < 0) ys.push(y); }); ys.sort().reverse();
  var state = { year: '', q: '' };
  function chip(label, val) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'news-chip' + (val === state.year ? ' on' : ''); b.textContent = label;
    b.addEventListener('click', function () { state.year = (state.year === val) ? '' : val; render(); });
    return b;
  }
  function render() {
    yearsBox.innerHTML = ''; yearsBox.appendChild(chip('All', ''));
    ys.forEach(function (y) { yearsBox.appendChild(chip(y, y)); });
    var q = state.q.trim().toLowerCase(), shown = 0;
    cards.forEach(function (c) {
      var ok = (!state.year || c.getAttribute('data-year') === state.year) && (!q || (c.textContent || '').toLowerCase().indexOf(q) >= 0);
      c.style.display = ok ? '' : 'none'; if (ok) shown++;
    });
    years.forEach(function (h) {
      var y = h.textContent.trim(), any = cards.some(function (c) { return c.style.display !== 'none' && c.getAttribute('data-year') === y; });
      h.style.display = any ? '' : 'none';
    });
    count.textContent = shown + ' of ' + cards.length + ' items';
  }
  search.addEventListener('input', function () { state.q = search.value; render(); });
  render();
})();
