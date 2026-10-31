/* SVARNA homepage: animated hero + "one Greek sentence, four views".
 * All geometry is computed in the browser:
 *  - four analyses of «Κάθε φοιτητής διαβάζει ένα βιβλίο» (UD, MTT, Dynamic Syntax, NLI proof)
 *  - an exact Euclidean embedding with ||h_i - h_j||^2 = d_tree(i, j) (classical MDS, Jacobi eigensolver)
 *  - a small random-weight tanh encoder (illustrative only)
 */
(function () {
  'use strict';
  var SVGNS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, parent) {
    var e = document.createElementNS(SVGNS, tag);
    for (var k in (attrs || {})) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function randn(r) { var u = 0, v = 0; while (!u) u = r(); while (!v) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
  function dot(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= hero canvas ================= */
  function hero() {
    var c = document.querySelector('.hero-canvas');
    var ctx = c && c.getContext && c.getContext('2d');
    if (!ctx) return;
    var GLYPHS = ['α', 'β', 'γ', 'δ', 'λ', 'Σ', 'Π', 'Ω', '∀', '∃', '⊢', '→', '∧', '¬', 'ε', 'τ', 'φ', 'ψ'];
    var rng = mulberry32(11), W, H, pts, dpr;
    function init() {
      dpr = window.devicePixelRatio || 1;
      W = c.width = c.offsetWidth * dpr; H = c.height = c.offsetHeight * dpr;
      var n = Math.round(Math.min(70, c.offsetWidth / 18));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: rng() * W, y: rng() * H, vx: (rng() - .5) * .22 * dpr, vy: (rng() - .5) * .22 * dpr, g: GLYPHS[Math.floor(rng() * GLYPHS.length)], s: (10 + rng() * 10) * dpr, gold: rng() < .45 });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var R = 150 * dpr;
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        if (!reduceMotion) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > W) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1; }
        for (var j = i + 1; j < pts.length; j++) {
          var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
          if (d < R) {
            ctx.strokeStyle = (p.gold || q.gold) ? 'rgba(227,178,60,' + (0.28 * (1 - d / R)) + ')' : 'rgba(255,255,255,' + (0.16 * (1 - d / R)) + ')';
            ctx.lineWidth = dpr; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
          }
        }
        ctx.font = p.s + 'px "Crimson Pro", Georgia, serif';
        ctx.fillStyle = p.gold ? 'rgba(227,178,60,.55)' : 'rgba(255,255,255,.35)';
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(p.g, p.x, p.y);
      }
      if (!reduceMotion) requestAnimationFrame(frame);
    }
    window.addEventListener('resize', function () { init(); if (reduceMotion) frame(); });
    init(); frame();
  }

  /* ================= four analyses ================= */
  var VIEWS = {
    ud: {
      short: 'Dependencies (UD)', title: 'Universal Dependencies', layout: 'dependency',
      blurb: 'Labelled head-to-dependent arcs over the words themselves. Horizontal position follows word order.',
      nodes: [
        { id: 'v', label: 'διαβάζει', sub: 'VERB', rel: 'root', pos: 2, parent: null, word: true, detail: 'root(διαβάζει)' },
        { id: 's', label: 'φοιτητής', sub: 'NOUN', rel: 'nsubj', pos: 1, parent: 'v', word: true, detail: 'nsubj(διαβάζει, φοιτητής)' },
        { id: 'd1', label: 'Κάθε', sub: 'DET', rel: 'det', pos: 0, parent: 's', word: true, detail: 'det(φοιτητής, Κάθε)' },
        { id: 'o', label: 'βιβλίο', sub: 'NOUN', rel: 'obj', pos: 4, parent: 'v', word: true, detail: 'obj(διαβάζει, βιβλίο)' },
        { id: 'd2', label: 'ένα', sub: 'DET', rel: 'det', pos: 3, parent: 'o', word: true, detail: 'det(βιβλίο, ένα)' }
      ]
    },
    mtt: {
      short: 'Type theory (MTT)', title: 'Modern Type Theories', layout: 'constituency',
      blurb: 'Common nouns are types, quantifiers are Π-typed, and coercive subtyping lets a Student be read as a Human.',
      nodes: [
        { id: 'S', label: 'Prop', sub: '∀x:Student. ∃y:Book…', parent: null, detail: '∀x:Student. ∃y:Book. read(x, y)' },
        { id: 'NP1', label: '(Student→Prop)→Prop', sub: '', parent: 'S', detail: 'every(Student)' },
        { id: 'e', label: 'Κάθε', sub: 'ΠA:CN. …', parent: 'NP1', word: true, detail: 'every : ΠA:CN. (A → Prop) → Prop' },
        { id: 'st', label: 'φοιτητής', sub: 'Student : CN', parent: 'NP1', word: true, detail: 'Common nouns as types: Student : CN, with Student ≤ Human' },
        { id: 'VP', label: 'Human→Prop', sub: '', parent: 'S', detail: 'λx:Human. ∃y:Book. read(x, y). It applies to students through the coercion Student ≤ Human' },
        { id: 'r', label: 'διαβάζει', sub: 'Human→Phy•Info→Prop', parent: 'VP', word: true, detail: 'read : Human → Phy•Info → Prop' },
        { id: 'NP2', label: '(Book→Prop)→Prop', sub: '', parent: 'VP', detail: 'a(Book)' },
        { id: 'a', label: 'ένα', sub: 'ΠA:CN. …', parent: 'NP2', word: true, detail: 'a : ΠA:CN. (A → Prop) → Prop' },
        { id: 'b', label: 'βιβλίο', sub: 'Book : CN', parent: 'NP2', word: true, detail: 'Book ≤ Phy•Info: a dot-type, so a book can be read (informational) and carried (physical)' }
      ]
    },
    ds: {
      short: 'Dynamic Syntax', title: 'Dynamic Syntax', layout: 'constituency',
      blurb: 'The tree grows word by word. Each node has a type requirement and a tree-node address (↓0 argument, ↓1 functor).',
      nodes: [
        { id: 'R', label: 'Ty(t)', sub: '◇', parent: null, detail: 'Fo(Read(ε, y, Book(y))(τ, x, Student(x))). Every requirement ?Ty(X) is satisfied, so the tree is complete' },
        { id: 'SU', label: 'Ty(e)', sub: 'τ-term', rel: '↓0', parent: 'R', detail: 'Fo(τ, x, Student(x)): the universal quantifier as a τ-term (epsilon calculus)' },
        { id: 'k', label: 'Κάθε', sub: 'Ty(cn→e)', rel: '↓1', parent: 'SU', word: true, detail: 'The determiner is the functor daughter of the subject node' },
        { id: 'f', label: 'φοιτητής', sub: 'Ty(cn)', rel: '↓0', parent: 'SU', word: true, detail: 'Fo(x, Student(x))' },
        { id: 'P', label: 'Ty(e→t)', sub: '', rel: '↓1', parent: 'R', detail: 'Predicate node, built once the verb is parsed' },
        { id: 'v', label: 'διαβάζει', sub: 'Ty(e→(e→t))', rel: '↓1', parent: 'P', word: true, detail: 'The verb annotates the functor node and projects a ?Ty(e) requirement for its object' },
        { id: 'O', label: 'Ty(e)', sub: 'ε-term', rel: '↓0', parent: 'P', detail: 'Fo(ε, y, Book(y)): the indefinite as an ε-term' },
        { id: 'a', label: 'ένα', sub: 'Ty(cn→e)', rel: '↓1', parent: 'O', word: true, detail: 'Indefinite determiner' },
        { id: 'b', label: 'βιβλίο', sub: 'Ty(cn)', rel: '↓0', parent: 'O', word: true, detail: 'Fo(y, Book(y))' }
      ]
    },
    nli: {
      short: 'Inference (proof)', title: 'NLI as proof (Coq-style)', layout: 'constituency',
      blurb: 'Premise: «Κάθε φοιτητής διαβάζει ένα βιβλίο». Hypothesis: «Κάθε φοιτητής διαβάζει κάτι». Label: Entailment, by the proof tree below.',
      nodes: [
        { id: 'g', label: '∀-intro', sub: '⊢ Hyp', parent: null, detail: 'Goal: ∀x:Student. ∃z:Phy•Info. read(x, z).   Coq: intro x.' },
        { id: 'e1', label: '∃-elim', sub: 'x ⊢ ∃z. read(x,z)', parent: 'g', detail: 'Coq: destruct (P x) as [y h].' },
        { id: 'ae', label: '∀-elim', sub: 'P x', parent: 'e1', detail: 'P x : ∃y:Book. read(x, y)' },
        { id: 'p', label: 'P', sub: 'premise', parent: 'ae', word: true, detail: 'P : ∀x:Student. ∃y:Book. read(x, y)' },
        { id: 'x', label: 'x : Student', sub: 'hypothesis', parent: 'ae', word: true, detail: 'Introduced by ∀-intro' },
        { id: 'ei', label: '∃-intro', sub: 'y, h ⊢ ∃z…', parent: 'e1', detail: 'Coq: exists y; exact h.' },
        { id: 'h', label: 'h', sub: 'read(x, y)', parent: 'ei', word: true, detail: 'h : read(x, y), obtained by ∃-elim' },
        { id: 'c', label: 'Book ≤ Phy•Info', sub: 'coercion', parent: 'ei', word: true, detail: 'Coercive subtyping lets the witness y : Book stand in for z : Phy•Info' }
      ]
    }
  };
  var ORDER = ['ud', 'mtt', 'ds', 'nli'];

  function buildTree(th) {
    var nodes = th.nodes.map(function (n, i) { var o = {}; for (var k in n) o[k] = n[k]; o.idx = i; o.children = []; return o; });
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    nodes.forEach(function (n) { if (n.parent) byId[n.parent].children.push(n); });
    var root = nodes.filter(function (n) { return !n.parent; })[0];
    (function depth(n, k) { n.depth = k; n.children.forEach(function (c) { depth(c, k + 1); }); })(root, 0);
    var maxD = Math.max.apply(null, nodes.map(function (n) { return n.depth; }));
    var leaves = [];
    if (th.layout === 'dependency') {
      var mp = Math.max.apply(null, nodes.map(function (n) { return n.pos; }));
      nodes.forEach(function (n) { n.xi = n.pos / mp; });
    } else {
      (function dfs(n) { if (!n.children.length) leaves.push(n); n.children.forEach(dfs); })(root);
      leaves.forEach(function (l, i) { l.xi = leaves.length > 1 ? i / (leaves.length - 1) : .5; l.leafIdx = i; });
      (function post(n) { if (n.children.length) { n.children.forEach(post); n.xi = n.children.reduce(function (s, c) { return s + c.xi; }, 0) / n.children.length; } })(root);
    }
    nodes.forEach(function (n) {
      var yd = (th.layout === 'constituency' && !n.children.length) ? maxD : n.depth;
      n.yi = maxD ? yd / maxD : 0;
    });
    var useRel = th.nodes.some(function (x) { return x.rel; });
    nodes.forEach(function (n) {
      var path = [], cur = n;
      while (cur.parent) { var p = byId[cur.parent]; path.unshift(useRel ? cur.rel : (p.children.indexOf(cur) === 0 ? 'L' : 'R')); cur = p; }
      n.role = path.length ? path.join('·') : 'root';
    });
    var N = nodes.length, adj = nodes.map(function () { return []; });
    nodes.forEach(function (n) { if (n.parent) { var p = byId[n.parent]; adj[n.idx].push(p.idx); adj[p.idx].push(n.idx); } });
    var dist = nodes.map(function (_, s) {
      var d = []; for (var i = 0; i < N; i++) d.push(-1); d[s] = 0; var q = [s];
      while (q.length) { var u = q.shift(); adj[u].forEach(function (v) { if (d[v] < 0) { d[v] = d[u] + 1; q.push(v); } }); }
      return d;
    });
    return { nodes: nodes, byId: byId, root: root, dist: dist, nLeaves: leaves.length };
  }

  function jacobiEigen(A) {
    var n = A.length, a = A.map(function (r) { return r.slice(); }), V = [], i, j, k;
    for (i = 0; i < n; i++) { V.push([]); for (j = 0; j < n; j++) V[i].push(i === j ? 1 : 0); }
    for (var sweep = 0; sweep < 100; sweep++) {
      var off = 0; for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) off += a[i][j] * a[i][j];
      if (off < 1e-20) break;
      for (var p = 0; p < n; p++) for (var q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-15) continue;
        var th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
        var t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1));
        var c = 1 / Math.sqrt(t * t + 1), s = t * c, x1, x2;
        for (k = 0; k < n; k++) { x1 = a[k][p]; x2 = a[k][q]; a[k][p] = c * x1 - s * x2; a[k][q] = s * x1 + c * x2; }
        for (k = 0; k < n; k++) { x1 = a[p][k]; x2 = a[q][k]; a[p][k] = c * x1 - s * x2; a[q][k] = s * x1 + c * x2; }
        for (k = 0; k < n; k++) { x1 = V[k][p]; x2 = V[k][q]; V[k][p] = c * x1 - s * x2; V[k][q] = s * x1 + c * x2; }
      }
    }
    return { vals: a.map(function (r, i) { return r[i]; }), V: V };
  }

  function treeEmbedding(dist) {
    var n = dist.length;
    var rm = dist.map(function (r) { return r.reduce(function (s, x) { return s + x; }, 0) / n; });
    var all = rm.reduce(function (s, x) { return s + x; }, 0) / n;
    var B = dist.map(function (r, i) { return r.map(function (d, j) { return -0.5 * (d - rm[i] - rm[j] + all); }); });
    var E = jacobiEigen(B);
    var order = E.vals.map(function (v, i) { return [v, i]; }).sort(function (x, y) { return y[0] - x[0]; }).filter(function (o) { return o[0] > 1e-9; });
    var X = dist.map(function (_, i) { return order.map(function (o) { return E.V[i][o[1]] * Math.sqrt(o[0]); }); });
    var total = order.reduce(function (s, o) { return s + o[0]; }, 0);
    var maxErr = 0;
    for (var i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var d2 = 0; for (var k = 0; k < X[i].length; k++) d2 += (X[i][k] - X[j][k]) * (X[i][k] - X[j][k]);
      maxErr = Math.max(maxErr, Math.abs(d2 - dist[i][j]));
    }
    return { X: X, dims: order.length, explained2: (order[0][0] + (order[1] ? order[1][0] : 0)) / total, maxErr: maxErr };
  }

  var LAYERS = [8, 8, 8, 4];
  function makeEncoder(seed) {
    var r = mulberry32(seed), W = [];
    for (var l = 1; l < LAYERS.length; l++) {
      var M = [];
      for (var j = 0; j < LAYERS[l]; j++) { var row = []; for (var i = 0; i < LAYERS[l - 1]; i++) row.push(randn(r) * 1.3 / Math.sqrt(LAYERS[l - 1])); M.push(row); }
      W.push(M);
    }
    return W;
  }
  function forward(W, x) {
    var inp = x.slice(0, LAYERS[0]); while (inp.length < LAYERS[0]) inp.push(0);
    var acts = [inp];
    W.forEach(function (M) { var prev = acts[acts.length - 1]; acts.push(M.map(function (row) { return Math.tanh(dot(row, prev)); })); });
    return acts;
  }
  function divColor(v) {
    var a = Math.min(1, Math.abs(v));
    return v >= 0 ? 'rgba(47,128,237,' + (0.12 + 0.88 * a) + ')' : 'rgba(214,69,69,' + (0.12 + 0.88 * a) + ')';
  }

  /* ================= pipeline rendering ================= */
  function demo() {
    var svg = document.getElementById('nzSvg');
    if (!svg) return;
    var P = { tree: { x: 16, y: 70, w: 478, h: 390 }, emb: { x: 510, y: 70, w: 325, h: 390 }, neu: { x: 851, y: 70, w: 333, h: 390 } };
    var state = { view: 'ud', active: 0, paused: false }, M = null;

    function render() {
      var th = VIEWS[state.view], T = buildTree(th), E = treeEmbedding(T.dist);
      var W = makeEncoder(hashStr('svarna:' + state.view)), acts = E.X.map(function (x) { return forward(W, x); });
      M = { th: th, T: T, E: E, W: W, acts: acts };
      svg.innerHTML = '';
      var defs = el('defs', {}, svg);
      var g1 = el('linearGradient', { id: 'nzG1', x1: 0, x2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#C4961A' }, g1); el('stop', { offset: 1, 'stop-color': '#5B4BB5' }, g1);
      var g2 = el('linearGradient', { id: 'nzG2', x1: 0, x2: 1 }, defs);
      el('stop', { offset: 0, 'stop-color': '#5B4BB5' }, g2); el('stop', { offset: 1, 'stop-color': '#2F80ED' }, g2);
      [[P.tree, 'symbolic', 'sym', th.title], [P.emb, 'embedding', 'emb', '‖hᵢ − hⱼ‖² = d_tree(i, j)'], [P.neu, 'neural', 'neu', 'tanh encoder · 8 → 8 → 8 → 4']].forEach(function (h) {
        el('rect', { x: h[0].x, y: h[0].y - 52, width: h[0].w, height: h[0].h + 62, rx: 14, 'class': 'nz-panel' }, svg);
        el('text', { x: h[0].x + 16, y: h[0].y - 28, 'class': 'nz-title ' + h[2] }, svg).textContent = h[1];
        el('text', { x: h[0].x + 16, y: h[0].y - 11, 'class': 'nz-sub' }, svg).textContent = h[3];
      });
      M.linkLayer = el('g', {}, svg);

      // tree
      var tp = { x: P.tree.x + 52, y: P.tree.y + 34, w: P.tree.w - 104, h: P.tree.h - 104 };
      T.nodes.forEach(function (n) { n.px = tp.x + n.xi * tp.w; n.py = tp.y + n.yi * tp.h; });
      var gt = el('g', {}, svg);
      T.nodes.forEach(function (n) {
        if (!n.parent) return;
        var p = T.byId[n.parent];
        if (th.layout === 'dependency') el('path', { d: 'M' + p.px + ',' + p.py + ' C' + p.px + ',' + (p.py + n.py) / 2 + ' ' + n.px + ',' + (p.py + n.py) / 2 + ' ' + n.px + ',' + n.py, 'class': 'nz-tedge' }, gt);
        else el('line', { x1: p.px, y1: p.py, x2: n.px, y2: n.py, 'class': 'nz-tedge' }, gt);
        if (n.rel && n.rel !== 'root') el('text', { x: (p.px + n.px) / 2 + (n.px < p.px ? -14 : 14), y: (p.py + n.py) / 2 - 3, 'class': 'nz-rel' }, gt).textContent = n.rel;
      });
      T.nodes.forEach(function (n) {
        var g = el('g', { 'class': 'nz-node' + (n.word ? ' word' : ''), 'data-i': n.idx, transform: 'translate(' + n.px + ',' + n.py + ')' }, gt);
        el('circle', { r: 8 }, g);
        var below = !n.children.length || th.layout !== 'constituency';
        var stag = (below && n.leafIdx !== undefined && T.nLeaves > 3 && n.leafIdx % 2 === 1) ? 26 : 0;
        el('text', { 'class': 'lab', y: below ? 24 + stag : -14 }, g).textContent = n.label;
        if (n.sub) el('text', { 'class': 'sub', y: below ? 38 + stag : -28 }, g).textContent = n.sub;
        g.addEventListener('mouseenter', function () { setActive(n.idx, true); });
        g.addEventListener('click', function () { setActive(n.idx, true); });
      });

      // embedding
      var ep = { x: P.emb.x + 46, y: P.emb.y + 26, w: P.emb.w - 92, h: P.emb.h - 80 };
      var xs = E.X.map(function (v) { return v[0] || 0; }), ys = E.X.map(function (v) { return v[1] || 0; });
      var mnx = Math.min.apply(null, xs), mxx = Math.max.apply(null, xs), mny = Math.min.apply(null, ys), mxy = Math.max.apply(null, ys);
      var span = Math.max(mxx - mnx, mxy - mny) || 1, sc = Math.min(ep.w, ep.h) / span, cx = (mxx + mnx) / 2, cy = (mxy + mny) / 2;
      T.nodes.forEach(function (n, i) { n.ex = ep.x + ep.w / 2 + (xs[i] - cx) * sc; n.ey = ep.y + ep.h / 2 + (ys[i] - cy) * sc; });
      var ge = el('g', {}, svg);
      el('circle', { cx: ep.x + ep.w / 2, cy: ep.y + ep.h / 2, r: Math.min(ep.w, ep.h) / 2 + 14, 'class': 'nz-ring' }, ge);
      T.nodes.forEach(function (n) { if (n.parent) { var p = T.byId[n.parent]; el('line', { x1: p.ex, y1: p.ey, x2: n.ex, y2: n.ey, 'class': 'nz-eedge' }, ge); } });
      T.nodes.forEach(function (n) {
        var c = el('circle', { cx: n.ex, cy: n.ey, r: n.word ? 7 : 5.5, 'class': 'nz-pt', 'data-i': n.idx }, ge);
        c.addEventListener('mouseenter', function () { setActive(n.idx, true); });
        el('text', { x: n.ex + 10, y: n.ey - 8, 'class': 'nz-plab' }, ge).textContent = n.label;
      });
      el('text', { x: P.emb.x + 16, y: P.emb.y + P.emb.h - 4, 'class': 'nz-sub' }, svg).textContent = 'exact in ' + E.dims + 'D · top-2 components shown (' + (E.explained2 * 100).toFixed(0) + '% var.)';

      // neural
      var np = { x: P.neu.x + 40, y: P.neu.y + 22, w: P.neu.w - 80, h: P.neu.h - 76 };
      var cols = LAYERS.map(function (m, l) { return np.x + (l / (LAYERS.length - 1)) * np.w; });
      var pos = LAYERS.map(function (m, l) { var a = []; for (var j = 0; j < m; j++) a.push([cols[l], np.y + ((j + .5) / m) * np.h]); return a; });
      M.npos = pos;
      var gn = el('g', {}, svg);
      M.edges = W.map(function (Mx, l) {
        var out = [];
        Mx.forEach(function (row, j) { row.forEach(function (w, i) { out.push({ e: el('line', { x1: pos[l][i][0], y1: pos[l][i][1], x2: pos[l + 1][j][0], y2: pos[l + 1][j][1], 'class': 'nz-nedge', 'stroke-opacity': .05 }, gn), i: i, w: w }); }); });
        return out;
      });
      M.neurons = pos.map(function (layer) { return layer.map(function (p) { return el('circle', { cx: p[0], cy: p[1], r: 9, 'class': 'nz-neuron', fill: 'rgba(127,127,127,.08)' }, gn); }); });
      ['h ∈ ℝ⁸', 'layer 1', 'layer 2', 'out'].forEach(function (t, l) { el('text', { x: cols[l], y: np.y + np.h + 28, 'class': 'nz-nlab' }, gn).textContent = t; });

      var info = document.getElementById('nzTheory');
      if (info) info.innerHTML = '<h5>view</h5><div class="big">' + esc(th.title) + '</div><p class="nz-note" style="color:var(--color-text-light)">' + esc(th.blurb) + '</p>';
      var geo = document.getElementById('nzGeom');
      if (geo) geo.innerHTML = '<h5>geometry check</h5>' +
        '<div class="nz-kv"><span>nodes</span><span>' + T.nodes.length + '</span></div>' +
        '<div class="nz-kv"><span>embedding dims (exact)</span><span>' + E.dims + '</span></div>' +
        '<div class="nz-kv"><span>max |‖Δh‖² − d_tree|</span><span>' + E.maxErr.toExponential(1) + '</span></div>' +
        '<div class="nz-kv"><span>variance in 2-D view</span><span>' + (E.explained2 * 100).toFixed(1) + '%</span></div>' +
        '<p class="nz-note">A structural probe looks for a linear map of a model\'s hidden states with exactly this property. The encoder weights here are random and only illustrative.</p>';
      setActive(Math.min(state.active, T.nodes.length - 1), false);
    }

    function setActive(i, fromUser) {
      if (fromUser) state.paused = true;
      state.active = i;
      var T = M.T, a = M.acts[i], n = T.nodes[i];
      svg.querySelectorAll('.nz-node').forEach(function (g) { g.classList.toggle('active', +g.getAttribute('data-i') === i); });
      svg.querySelectorAll('.nz-pt').forEach(function (c) { c.classList.toggle('active', +c.getAttribute('data-i') === i); });
      M.neurons.forEach(function (layer, l) { layer.forEach(function (c, j) { c.setAttribute('fill', divColor(l === 0 ? a[0][j] / 1.2 : a[l][j])); }); });
      M.edges.forEach(function (layer, l) { layer.forEach(function (o) { o.e.setAttribute('stroke-opacity', Math.min(.85, .04 + Math.abs(o.w * a[l][o.i]) * .9).toFixed(3)); }); });
      M.linkLayer.innerHTML = '';
      el('path', { d: 'M' + n.px + ',' + n.py + ' C' + ((n.px + n.ex) / 2 + 40) + ',' + n.py + ' ' + ((n.px + n.ex) / 2 - 40) + ',' + n.ey + ' ' + n.ex + ',' + n.ey, 'class': 'nz-link', stroke: 'url(#nzG1)' }, M.linkLayer);
      var ix = M.npos[0][0][0], iy = M.npos[0][4][1];
      el('path', { d: 'M' + n.ex + ',' + n.ey + ' C' + ((n.ex + ix) / 2 + 40) + ',' + n.ey + ' ' + ((n.ex + ix) / 2 - 40) + ',' + iy + ' ' + (ix - 12) + ',' + iy, 'class': 'nz-link', stroke: 'url(#nzG2)' }, M.linkLayer);
      var nodeCard = document.getElementById('nzNode');
      if (nodeCard) {
        var others = T.nodes.filter(function (m) { return m.idx !== i; }).slice(0, 8).map(function (m) { return esc(m.label) + ':' + T.dist[i][m.idx]; }).join('  ');
        nodeCard.innerHTML = '<h5>selected node</h5><div class="big">' + esc(n.label) + (n.sub ? ' <span class="nz-note" style="font-family:var(--font-mono)">' + esc(n.sub) + '</span>' : '') + '</div>' +
          '<code>' + esc(n.detail) + '</code>' +
          '<div class="nz-kv" style="margin-top:.5rem"><span>tree address</span><span>' + esc(n.role) + '</span></div>' +
          '<div class="nz-kv"><span>d_tree to others</span><span style="font-size:.72rem">' + others + '</span></div>';
      }
    }

    var tabs = document.getElementById('nzTabs');
    ORDER.forEach(function (k) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'nz-tab' + (k === state.view ? ' active' : ''); b.textContent = VIEWS[k].short;
      b.addEventListener('click', function () {
        state.view = k; state.active = 0;
        tabs.querySelectorAll('.nz-tab').forEach(function (x) { x.classList.toggle('active', x === b); });
        render();
      });
      tabs.appendChild(b);
    });
    svg.addEventListener('mouseleave', function () { state.paused = false; });
    setInterval(function () { if (!state.paused && M && !document.hidden) setActive((state.active + 1) % M.T.nodes.length, false); }, 2400);
    render();
  }

  window.SvarnaViz = { VIEWS: VIEWS, buildTree: buildTree, treeEmbedding: treeEmbedding };
  try { hero(); } catch (e) { /* decorative */ }
  demo();
})();
