/* Theme-aware SVG figures that replace the static OYXOY and linguistic-distance PNGs.
 * Each figure renders into <div class="svf" data-fig="..."></div>.
 * OYXOY numbers and examples: Kogkalidis, Chatzikyriakidis et al. (2024), Findings of EACL, Sect. 2 and Fig. 1.
 * Distance dimensions, data sources and branches: taken from the lab's previous figure. */
(function () {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in (a || {})) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function txt(p, x, y, s, cls, extra) { var a = { x: x, y: y, 'class': cls }; for (var k in (extra || {})) a[k] = extra[k]; var t = el('text', a, p); t.textContent = s; return t; }

  /* ---------------- OYXOY ---------------- */
  var OY_EXAMPLES = [
    {
      tab: 'Example 761 · φιλώ', tag: 'Lexical Entailment › Symmetry/Collectivity',
      premise: 'Ο Κυριάκος φίλησε την Αντιγόνη.', pgloss: 'Kyriakos kissed Antigone.',
      hyp: 'Ο Κυριάκος και η Αντιγόνη φιλήθηκαν.', hgloss: 'Kyriakos and Antigone kissed [each other].',
      readings: [
        { name: 'Reading A', text: 'one-way: he gave her a kiss', label: 'Unknown' },
        { name: 'Reading B', text: 'reciprocal: they exchanged kisses', label: 'Entailment' }
      ]
    },
    {
      tab: 'Example 879 · pro-drop', tag: 'Factivity › Factive · Anaphora/Coreference',
      premise: 'Ο Γιώργος είπε στη Μαρία ότι ξέρει να παίζει κιθάρα.', pgloss: 'Giorgos told Maria that [he/she] knows how to play the guitar.',
      hyp: 'Η Μαρία ξέρει να παίζει κιθάρα.', hgloss: 'Maria knows how to play the guitar.',
      readings: [
        { name: 'Reading A', text: 'dropped subject = Giorgos', label: 'Unknown' },
        { name: 'Reading B', text: 'dropped subject = Maria', label: 'Entailment' }
      ]
    }
  ];

  function oyxoy(root) {
    var W = 560, H = 580, cur = 0;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'OYXOY: multi-label natural language inference for Modern Greek' }, root);
    function draw() {
      svg.innerHTML = '';
      txt(svg, W / 2, 40, 'OYXOY', 'svf-title', { 'text-anchor': 'middle' });
      txt(svg, W / 2, 62, 'multi-label natural language inference for Modern Greek', 'svf-sub', { 'text-anchor': 'middle' });
      var tiles = [['1,762', 'NLI pairs', '1,049 new + 713 re-annotated FraCaS'], ['6,896', 'word senses', 'from 14,416 usage examples'], ['140', 'multi-label pairs', '110 new + 30 FraCaS']];
      tiles.forEach(function (t, i) {
        var x = 20 + i * 177, g = el('g', {}, svg);
        el('rect', { x: x, y: 80, width: 166, height: 82, rx: 12, 'class': 'svf-tile' }, g);
        txt(g, x + 83, 114, t[0], 'svf-num', { 'text-anchor': 'middle' });
        txt(g, x + 83, 134, t[1], 'svf-tlab', { 'text-anchor': 'middle' });
        txt(g, x + 83, 151, t[2], 'svf-tsub', { 'text-anchor': 'middle' });
      });
      // example tabs
      OY_EXAMPLES.forEach(function (ex, i) {
        var x = 20 + i * 262, g = el('g', { 'class': 'svf-pill' + (i === cur ? ' on' : ''), tabindex: 0, role: 'button' }, svg);
        el('rect', { x: x, y: 180, width: 254, height: 30, rx: 15 }, g);
        txt(g, x + 127, 200, ex.tab, '', { 'text-anchor': 'middle' });
        g.addEventListener('click', function () { cur = i; draw(); });
        g.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cur = i; draw(); } });
      });
      var ex = OY_EXAMPLES[cur];
      // premise / hypothesis
      [['PREMISE', ex.premise, ex.pgloss, 226, 'prem'], ['HYPOTHESIS', ex.hyp, ex.hgloss, 306, 'hyp']].forEach(function (b) {
        el('rect', { x: 20, y: b[3], width: 520, height: 66, rx: 12, 'class': 'svf-box ' + b[4] }, svg);
        txt(svg, 36, b[3] + 18, b[0], 'svf-cap');
        txt(svg, 36, b[3] + 40, b[1], 'svf-greek');
        txt(svg, 36, b[3] + 57, b[2], 'svf-gloss');
      });
      // readings
      ex.readings.forEach(function (r, i) {
        var x = 20 + i * 268, cx = x + 126;
        el('path', { d: 'M' + cx + ',372 L' + cx + ',398', 'class': 'svf-arrow' }, svg);
        el('rect', { x: x, y: 398, width: 252, height: 74, rx: 12, 'class': 'svf-read' }, svg);
        txt(svg, x + 14, 419, r.name, 'svf-cap');
        txt(svg, x + 14, 439, r.text, 'svf-rtext');
        var lab = r.label, cw = lab.length * 7.4 + 22;
        el('rect', { x: x + 14, y: 448, width: cw, height: 18, rx: 9, 'class': 'svf-chip ' + lab.toLowerCase() }, svg);
        txt(svg, x + 14 + cw / 2, 461, lab, 'svf-chiptxt', { 'text-anchor': 'middle' });
        el('path', { d: 'M' + cx + ',472 L' + cx + ',490 L' + W / 2 + ',490 L' + W / 2 + ',502', 'class': 'svf-arrow' }, svg);
      });
      // union
      el('rect', { x: 110, y: 502, width: 340, height: 44, rx: 22, 'class': 'svf-union' }, svg);
      var labs = [];
      ex.readings.forEach(function (r) { if (labs.indexOf(r.label) < 0) labs.push(r.label); });
      labs.sort();
      txt(svg, W / 2, 529, 'gold label set = { ' + labs.join(', ') + ' }', 'svf-uniontxt', { 'text-anchor': 'middle' });
      txt(svg, W / 2, 568, 'tags: ' + ex.tag, 'svf-tsub', { 'text-anchor': 'middle' });
    }
    draw();
  }

  /* ---------------- linguistic distance ---------------- */
  var DIMS = [
    { name: 'Lexical', src: 'Swadesh lists', what: 'core vocabulary (100 words)', c: '#1B3B6F' },
    { name: 'Phonological', src: 'ASJP data', what: 'phonetic transcriptions', c: '#2F80ED' },
    { name: 'Syntactic', src: 'UD treebanks', what: 'syntactic structures', c: '#5B4BB5' },
    { name: 'Morphological', src: '', what: 'inflectional and derivational patterns', c: '#8E44AD' },
    { name: 'WALS', src: 'WALS features', what: 'typological attributes', c: '#C0392B' },
    { name: 'Grambank', src: 'Grambank', what: '195 grammatical features', c: '#C4961A' },
    { name: 'Cognate', src: 'CLDF cognates', what: 'historical relationships', c: '#27AE60' }
  ];
  var BRANCHES = [
    { name: 'Hellenic', pair: 'Ancient Greek → Modern Greek', yrs: 2500, c: '#1B3B6F' },
    { name: 'Germanic', pair: 'Gothic → German', yrs: 1600, c: '#C4961A' },
    { name: 'Romance', pair: 'Latin → Italian / Spanish / French', yrs: 1500, c: '#2F80ED' },
    { name: 'Indo-Aryan', pair: 'Sanskrit → Hindi', yrs: 1500, c: '#8E44AD' },
    { name: 'Slavic', pair: 'OCS → Bulgarian / Russian / Serbian', yrs: 1000, c: '#C0392B' }
  ];

  function distance(root) {
    var W = 560, H = 696, cx = 280, cy = 238, R = 138, cur = 0;
    var svg = el('svg', { viewBox: '0 0 ' + W + ' ' + H, role: 'img', 'aria-label': 'Seven dimensions of linguistic distance and the time depth of the language pairs studied' }, root);
    txt(svg, W / 2, 38, 'Seven-dimensional linguistic distance', 'svf-title sm', { 'text-anchor': 'middle' });
    txt(svg, W / 2, 60, 'd(L₁, L₂) combines seven views of how two languages differ', 'svf-sub', { 'text-anchor': 'middle' });
    el('circle', { cx: cx, cy: cy, r: R, 'class': 'svf-orbit' }, svg);
    var spokes = el('g', {}, svg), dots = el('g', {}, svg);
    var spokeEls = [], dotEls = [];
    DIMS.forEach(function (d, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / DIMS.length, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a);
      spokeEls.push(el('line', { x1: cx, y1: cy, x2: x, y2: y, stroke: d.c, 'class': 'svf-spoke' }, spokes));
      var g = el('g', { 'class': 'svf-dim', tabindex: 0, role: 'button' }, dots);
      el('circle', { cx: x, cy: y, r: 21, fill: d.c, 'class': 'svf-dimc' }, g);
      txt(g, x, y + 5, String(i + 1), 'svf-dimn', { 'text-anchor': 'middle' });
      var lx = cx + (R + 40) * Math.cos(a), ly = cy + (R + 36) * Math.sin(a) + 4;
      var anchor = Math.abs(Math.cos(a)) < 0.3 ? 'middle' : (Math.cos(a) > 0 ? 'start' : 'end');
      txt(g, anchor === 'middle' ? lx : lx + (anchor === 'start' ? -8 : 8), ly, d.name, 'svf-diml', { 'text-anchor': anchor, fill: d.c });
      g.addEventListener('mouseenter', function () { cur = i; upd(); });
      g.addEventListener('click', function () { cur = i; upd(); });
      g.addEventListener('focus', function () { cur = i; upd(); });
      dotEls.push(g);
    });
    el('circle', { cx: cx, cy: cy, r: 50, 'class': 'svf-core' }, svg);
    txt(svg, cx, cy - 2, 'd(L₁, L₂)', 'svf-coret', { 'text-anchor': 'middle' });
    txt(svg, cx, cy + 17, '7 views', 'svf-tsub', { 'text-anchor': 'middle' });
    // info line
    var info = el('g', {}, svg);
    function upd() {
      var d = DIMS[cur];
      spokeEls.forEach(function (s, i) { s.setAttribute('stroke-opacity', i === cur ? 0.95 : 0.25); s.setAttribute('stroke-width', i === cur ? 3 : 1.5); });
      dotEls.forEach(function (g, i) { g.classList.toggle('on', i === cur); });
      info.innerHTML = '';
      el('rect', { x: 40, y: 432, width: 480, height: 46, rx: 12, 'class': 'svf-box' }, info);
      el('circle', { cx: 62, cy: 455, r: 7, fill: d.c }, info);
      txt(info, 78, 452, d.name + (d.src ? '  ·  ' + d.src : ''), 'svf-infot');
      txt(info, 78, 469, d.what, 'svf-tsub', {});
    }
    upd();
    // time-depth bars
    var top = 516, row = 34, x0 = 20, x1 = 470, max = 2500;
    txt(svg, 20, top - 10, 'TIME DEPTH OF THE ANCESTOR → DESCENDANT PAIRS', 'svf-cap');
    BRANCHES.forEach(function (b, i) {
      var y = top + i * row, w = (x1 - x0) * b.yrs / max;
      var t = txt(svg, x0, y + 10, b.name, 'svf-blab');
      el('tspan', { 'class': 'svf-bpair', dx: 8 }, t).textContent = b.pair;
      el('rect', { x: x0, y: y + 16, width: x1 - x0, height: 9, rx: 4.5, 'class': 'svf-track' }, svg);
      el('rect', { x: x0, y: y + 16, width: w, height: 9, rx: 4.5, fill: b.c }, svg);
      txt(svg, x1 + 10, y + 25, b.yrs.toLocaleString('en') + ' yrs', 'svf-byrs');
    });
  }

  var RENDER = { oyxoy: oyxoy, distance: distance };
  document.querySelectorAll('.svf[data-fig]').forEach(function (n) {
    var f = RENDER[n.getAttribute('data-fig')];
    if (f) { n.innerHTML = ''; f(n); }
  });
  window.SvarnaFigures = { OY_EXAMPLES: OY_EXAMPLES, DIMS: DIMS, BRANCHES: BRANCHES };
})();
