/* Research map as a network.
 * Data: the RMAP object defined inline in research-map.html (areas, connections, software).
 * Layout: deterministic force simulation, with clusters anchored left (computational),
 * centre (bridge) and right (formal). Clicking a node opens the existing detail panel. */
(function () {
  'use strict';
  if (typeof RMAP === 'undefined') return;
  var svg = document.getElementById('rmapGraph');
  if (!svg) return;
  var NS = 'http://www.w3.org/2000/svg';
  function el(t, a, p) { var e = document.createElementNS(NS, t); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function rng(seed) { return function () { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }; }

  var SHORT = {
    'dl-nlu': ['Deep learning,', 'NLU & XAI'], 'greek-nlp': ['Greek &', 'dialect NLP'], 'arabic': ['Arabic dialects', '& distance'],
    'rag': ['RAG &', 'knowledge LLMs'], 'type-theory': ['Type theory &', 'proof assistants'], 'bayesian': ['Bayesian', 'semantics'],
    'digital-humanities': ['AI for digital', 'humanities'], 'dialogue': ['Dialogue &', 'incremental'], 'formal-syntax': ['Formal syntax', '& diachrony'],
    'music': ['Music &', 'language']
  };
  var ANCHOR = { computational: 0.2, bridge: 0.5, formal: 0.8 };
  var W = 820, H = 540;
  var ids = Object.keys(RMAP), byLabel = {};
  ids.forEach(function (id) { byLabel[RMAP[id].label] = id; });

  var nodes = [], index = {}, edges = [], seen = {};
  ids.forEach(function (id) { index[id] = nodes.length; nodes.push({ id: id, kind: 'area', meth: RMAP[id].meth }); });
  ids.forEach(function (id) {
    (RMAP[id].conn || []).forEach(function (lab) {
      var o = byLabel[lab]; if (!o) return;
      var k = [id, o].sort().join('|'); if (seen[k]) return; seen[k] = 1;
      edges.push({ a: index[id], b: index[o], sw: false });
    });
  });
  ids.forEach(function (id) {
    (RMAP[id].software || []).forEach(function (sw) {
      var key = 'sw:' + sw;
      if (index[key] === undefined) { index[key] = nodes.length; nodes.push({ id: key, kind: 'software', label: sw, meth: 'software' }); }
      edges.push({ a: index[id], b: index[key], sw: true });
    });
  });
  var deg = nodes.map(function () { return 0; });
  edges.forEach(function (e) { if (!e.sw) { deg[e.a]++; deg[e.b]++; } });

  // deterministic force layout
  var r = rng(42);
  nodes.forEach(function (n) {
    var ax = n.kind === 'area' ? ANCHOR[n.meth] : 0.5;
    n.x = W * (ax + (r() - .5) * .2); n.y = H * (.25 + r() * .5); n.vx = 0; n.vy = 0;
  });
  for (var it = 0; it < 600; it++) {
    var cool = 1 - it / 600;
    for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
      var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2);
      var f = (a.kind === 'area' && b.kind === 'area' ? 9000 : 3200) / d2;
      a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
    }
    edges.forEach(function (e) {
      var a = nodes[e.a], b = nodes[e.b], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
      var rest = e.sw ? 78 : 165, k = e.sw ? 0.03 : 0.012, f = (d - rest) * k;
      a.vx += dx / d * f; a.vy += dy / d * f; b.vx -= dx / d * f; b.vy -= dy / d * f;
    });
    nodes.forEach(function (n) {
      if (n.kind === 'area') n.vx += (W * ANCHOR[n.meth] - n.x) * 0.012;
      n.vy += (H / 2 - n.y) * 0.004;
      n.x += Math.max(-12, Math.min(12, n.vx)) * cool; n.y += Math.max(-12, Math.min(12, n.vy)) * cool;
      n.vx *= 0.6; n.vy *= 0.6;
      n.x = Math.max(70, Math.min(W - 70, n.x)); n.y = Math.max(40, Math.min(H - 40, n.y));
    });
  }

  // draw
  var gE = el('g', {}, svg), gN = el('g', {}, svg);
  var edgeEls = edges.map(function (e) {
    return el('line', { x1: nodes[e.a].x, y1: nodes[e.a].y, x2: nodes[e.b].x, y2: nodes[e.b].y, 'class': 'rg-edge' + (e.sw ? ' sw' : '') }, gE);
  });
  var nodeEls = nodes.map(function (n, i) {
    var g = el('g', { 'class': 'rg-node ' + n.meth, transform: 'translate(' + n.x.toFixed(1) + ',' + n.y.toFixed(1) + ')', tabindex: 0, role: 'button' }, gN);
    if (n.kind === 'area') {
      var rad = 13 + deg[i] * 2.2;
      el('circle', { r: rad }, g);
      var lines = SHORT[n.id] || [RMAP[n.id].label];
      lines.forEach(function (ln, k) { el('text', { y: rad + 15 + k * 13 }, g).textContent = ln; });
      el('title', {}, g).textContent = RMAP[n.id].label;
    } else {
      el('rect', { x: -6, y: -6, width: 12, height: 12, transform: 'rotate(45)' }, g);
      el('text', { y: -12 }, g).textContent = n.label;
    }
    return g;
  });

  var wrap = svg.closest('.rmap-graph-wrap');
  function neighbours(i) {
    var s = {}; s[i] = 1;
    edges.forEach(function (e) { if (e.a === i) s[e.b] = 1; if (e.b === i) s[e.a] = 1; });
    return s;
  }
  function focus(i) {
    if (i === null) { wrap.classList.remove('focus'); nodeEls.forEach(function (g) { g.classList.remove('hl'); }); edgeEls.forEach(function (e) { e.classList.remove('hl'); }); return; }
    var nb = neighbours(i);
    wrap.classList.add('focus');
    nodeEls.forEach(function (g, k) { g.classList.toggle('hl', !!nb[k]); });
    edgeEls.forEach(function (e, k) { e.classList.toggle('hl', edges[k].a === i || edges[k].b === i); });
  }
  var selected = null;
  function select(i) {
    var n = nodes[i];
    var areaId = n.kind === 'area' ? n.id : null;
    if (!areaId) { // software: open the first area that uses it
      var e = edges.filter(function (x) { return x.sw && x.b === i; })[0];
      if (e) areaId = nodes[e.a].id;
    }
    if (!areaId) return;
    var btn = document.querySelector('.rmap-area[data-id="' + areaId + '"]');
    if (btn) btn.click();
  }
  nodeEls.forEach(function (g, i) {
    g.addEventListener('mouseenter', function () { focus(i); });
    g.addEventListener('mouseleave', function () { focus(selected); });
    g.addEventListener('click', function () { select(i); });
    g.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(i); } });
  });
  // keep graph and buttons in sync
  document.querySelectorAll('.rmap-area').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = index[btn.getAttribute('data-id')];
      nodeEls.forEach(function (g) { g.classList.remove('active'); });
      if (i !== undefined) { nodeEls[i].classList.add('active'); selected = i; focus(i); }
    });
  });

  var toggle = document.getElementById('rmapShowSw');
  function applySw() {
    var on = !toggle || toggle.checked;
    nodes.forEach(function (n, i) { if (n.kind === 'software') nodeEls[i].style.display = on ? '' : 'none'; });
    edges.forEach(function (e, k) { if (e.sw) edgeEls[k].style.display = on ? '' : 'none'; });
  }
  if (toggle) toggle.addEventListener('change', applySw);
  applySw();

  var stats = document.getElementById('rmapStats');
  if (stats) {
    var nSw = nodes.filter(function (n) { return n.kind === 'software'; }).length;
    var nAreaEdges = edges.filter(function (e) { return !e.sw; }).length;
    stats.textContent = ids.length + ' areas · ' + nAreaEdges + ' connections · ' + nSw + ' software tools';
  }
  window.RmapGraph = { nodes: nodes, edges: edges };
})();
