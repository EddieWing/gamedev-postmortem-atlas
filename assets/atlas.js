/* Gamedev Postmortem Atlas: renders the case list into the .pca block.
   Needs assets/cases.js loaded first (it sets window.PCA_DATA).
   Optional settings, set before this script loads:
     window.PCA_CONFIG = { coversPath: '/atlas/covers/', pageSize: 30, reportEmail: 'you@example.com', reportUrl: '' }
   coversPath: folder with the cover images; by default the "covers" folder next to the "assets" folder.
   pageSize: games shown before the "Show more games" button.
   reportEmail: address the "Report it" form sends to (it opens the reader's mail app with the report filled in).
   reportUrl: optional form page (for example a Google Form) opened instead of email; the report text is copied first. */
(function () {
  'use strict';
  var script = document.currentScript;
  var base = script && script.src ? new URL('..', script.src).href : '';
  var CFG = Object.assign({ coversPath: base + 'covers/', pageSize: 30, reportEmail: '', reportUrl: '' }, window.PCA_CONFIG || {});
  var DATA = window.PCA_DATA;
  var root = document.querySelector('.pca[data-pca]');
  if (!DATA || !root) return;

  var S = { out: '', q: '', cat: '', scale: '', year: '', sort: 'score', limit: CFG.pageSize, open: {} };
  var $ = function (s) { return root.querySelector(s); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var OC = { 'Backfired': 'b', 'Paid off': 'p', 'Tradeoff': 't' };
  var ICON = {
    b: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M4 4L12 12M12 4L4 12"/></svg>',
    p: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5L6.5 12L13 4.5"/></svg>',
    t: '<svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M3 5.5H10M6 10.5H13"/></svg>'
  };
  var PLUS = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M10 4V16M4 10H16"/></svg>';
  var MINUS = '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 10H16"/></svg>';
  var BOX = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" style="color:var(--accent)"><rect x="2" y="2" width="12" height="12" rx="3"/></svg>';
  var OUT = '<svg width="9" height="9" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 2H10V8M10 2L3 9"/></svg>';
  var byKey = {};
  DATA.games.forEach(function (g) { byKey[g.k] = g; });
  var current = [];

  function initials(n) {
    var w = n.replace(/\(.*?\)/g, '').replace(/[:'’.,!&]/g, ' ').split(/\s+/).filter(function (x) { return x && !/^(the|of|a|an|and|in|to)$/i.test(x); });
    return (w.slice(0, 2).map(function (x) { return x[0]; }).join('') || n[0] || '?').toUpperCase();
  }
  function pill(o) { var c = OC[o] || 'n'; return '<span class="pill ' + c + '">' + (ICON[c] || '') + '<span class="pl">' + esc(o) + '</span></span>'; }
  function cover(g) {
    var img = g.cv ? '<img src="' + esc(CFG.coversPath + g.cv) + '" alt="" width="460" height="215" loading="lazy" decoding="async">' : '';
    var cls = 'cover' + (g.cv ? ' img' : '');
    var badge = g.lk ? '<span class="badge">' + esc(g.ls) + OUT + '</span>' : '';
    var inner = img + '<span class="ini" aria-hidden="true">' + esc(initials(g.n)) + '</span>' + badge;
    if (g.lk) return '<a class="' + cls + '" href="' + esc(g.lk) + '" target="_blank" rel="noopener" aria-label="' + esc(g.n) + ': open the ' + esc(g.ls === 'Website' ? 'official website' : g.ls + ' page') + '">' + inner + '</a>';
    return '<div class="' + cls + '" role="img" aria-label="' + esc(g.n) + '">' + inner + '</div>';
  }
  function detail(c) {
    var cost = (c.co || c.nf) ? '<div><div class="lbl">Cost</div>' + (c.co ? '<div class="v">' + esc(c.co) + '</div>' : '') + (c.nf ? '<div class="nf">No figures reported</div>' : '') + '</div>' : '';
    var boxes = [c.r ? '<div><div class="lbl">Result</div><div class="v">' + esc(c.r) + '</div></div>' : '', c.re ? '<div><div class="lbl">Response</div><div class="v">' + esc(c.re) + '</div></div>' : '', cost].filter(Boolean).join('');
    var read = (c.l || c.i || c.a) ? '<section class="read"><div class="h">Our read</div>' +
      (c.l ? '<p class="lesson">' + esc(c.l) + '</p>' : '') +
      (c.i ? '<p class="interp">' + esc(c.i) + '</p>' : '') +
      (c.a ? '<div class="ask"><div class="q">' + BOX + '<span>' + esc(c.a) + '</span></div></div>' : '') + '</section>' : '';
    var srcMeta = [c.sd, c.sy].filter(Boolean).join(' · ');
    var href = c.sh || c.su;
    var author = c.qa ? (c.qu ? '<a class="sm" href="' + esc(c.qu) + '" target="_blank" rel="noopener">' + esc(c.qa) + '</a>' : '<div class="sm">' + esc(c.qa) + '</div>') : '';
    var src = (c.st || c.su) ? '<section class="src' + (c.q ? '' : ' solo') + '"><div><div class="k">Source</div>' +
      (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(c.st || c.su) + '</a>' : '<span>' + esc(c.st) + '</span>') +
      (srcMeta ? '<div class="sm">' + esc(srcMeta) + '</div>' : '') + '</div>' +
      (c.q ? '<div><div class="k">Quote</div><blockquote>' + esc(c.q) + '</blockquote>' + author + '</div>' : '') + '</section>' : '';
    return (c.w ? '<div class="wh"><div class="lbl">What happened</div><p>' + esc(c.w) + '</p></div>' : '') + (boxes ? '<div class="three">' + boxes + '</div>' : '') + read + src;
  }
  function reportBtn(g, i) { return '<div class="report"><button type="button" class="linkbtn" data-report="' + esc(g.k) + '" data-i="' + i + '">See a mistake? Report it</button></div>'; }
  function caseOpen(k, i) { var v = S.open[k + '#' + i]; return v == null ? i === 0 : v; }
  function caseHTML(g, c, i) {
    var co = caseOpen(g.k, i);
    return '<div class="crow" data-row="' + i + '"><div class="cbody"><div class="cat">' + esc(c.c) + '</div><p class="dt">' + esc(c.t) + '</p><p class="sd">' + esc(c.s) + '</p></div>' +
      '<div class="ctr">' + pill(c.o) + '<button type="button" class="xp" data-c="' + esc(g.k) + '" data-i="' + i + '" aria-expanded="' + co + '" aria-label="' + (co ? 'Collapse' : 'Expand') + ' case: ' + esc(c.t) + '">' + (co ? MINUS : PLUS) + '</button></div></div>' +
      (co ? detail(c) + reportBtn(g, i) : '');
  }
  function gameCard(g) {
    var open = !!S.open[g.k];
    var par = [g.dv, g.y].filter(Boolean).join(', ');
    var yr = par ? ' <span class="yr">(' + esc(par) + ')</span>' : '';
    var list = open ? '' : '<ul class="dlist">' + g.cs.map(function (c, i) { return '<li data-i="' + i + '">' + pill(c.o) + '<span class="dtl">' + esc(c.t) + '</span></li>'; }).join('') + '</ul>';
    var label = (open ? 'Collapse ' : 'Expand ') + (g.cs.length === 1 ? 'the decision' : g.cs.length + ' decisions') + ' for ' + g.n;
    var cases = '';
    if (open) cases = g.cs.map(function (c, i) { return (i ? '<div class="hr"></div>' : '') + '<div class="case" id="pca-' + esc(g.k) + '-' + i + '">' + caseHTML(g, c, i) + '</div>'; }).join('');
    return '<article class="game' + (open ? ' open' : '') + '" id="pca-' + esc(g.k) + '" data-k="' + esc(g.k) + '">' +
      '<div class="head"><div class="cvw">' + cover(g) + (g.sc ? '<span class="scale">' + esc(g.sc) + '</span>' : '') + '</div><div class="htitle"><h2>' + esc(g.n) + yr + '</h2></div>' + list + '</div>' +
      '<div class="tr"><button type="button" class="xp" data-g="' + esc(g.k) + '" aria-expanded="' + open + '" aria-label="' + esc(label) + '">' + (open ? MINUS : PLUS) + '</button></div>' +
      (open ? '<div class="hr"></div>' + cases : '') + '</article>';
  }
  function yearOk(g) {
    if (!S.year) return true;
    var y = parseInt(g.y, 10); if (!y) return false;
    return S.year.charAt(0) === 'd' ? Math.floor(y / 10) * 10 === +S.year.slice(1) : y === +S.year.slice(1);
  }
  function filtered() {
    var q = S.q.trim().toLowerCase();
    var gs = DATA.games.map(function (g) {
      var cs = g.cs.filter(function (c) {
        return (!S.out || c.o === S.out) && (!S.cat || c.c === S.cat) && (!q || [g.n, g.dv, c.t, c.s, c.l, c.w, c.qa, c.st].join(' ').toLowerCase().indexOf(q) >= 0);
      });
      return cs.length ? Object.assign({}, g, { cs: cs }) : null;
    }).filter(function (g) { return g && (!S.scale || g.sc === S.scale) && yearOk(g); });
    var best = function (g) { return Math.max.apply(null, g.cs.map(function (c) { return c.w8 || 0; })); };
    if (S.sort === 'title') gs.sort(function (a, b) { return a.n.localeCompare(b.n); });
    else if (S.sort === 'year') gs.sort(function (a, b) { return ((parseInt(a.y, 10) || 9999) - (parseInt(b.y, 10) || 9999)) || a.n.localeCompare(b.n); });
    else gs.sort(function (a, b) { return (best(b) - best(a)) || (b.cs.length - a.cs.length) || a.n.localeCompare(b.n); });
    return gs;
  }
  function find(k) { for (var i = 0; i < current.length; i++) if (current[i].k === k) return current[i]; return null; }
  function render() {
    current = filtered();
    var n = current.reduce(function (a, g) { return a + g.cs.length; }, 0);
    var cnt = n + ' ' + (n === 1 ? 'decision' : 'decisions') + ' in ' + current.length + ' ' + (current.length === 1 ? 'game' : 'games');
    $('#pca-count').textContent = cnt; var cm = $('#pca-count-m'); if (cm) cm.textContent = cnt;
    var shown = current.slice(0, S.limit);
    $('#pca-list').innerHTML = shown.length ? shown.map(gameCard).join('') : '<div class="empty">No cases match these filters. Clear a filter to see more.</div>';
    moreButton();
  }
  function moreButton() {
    var b = $('#pca-more'); b.hidden = current.length <= S.limit;
    b.textContent = 'Show more games (' + Math.max(0, current.length - S.limit) + ' left)';
  }
  function appendMore() {
    var from = S.limit; S.limit += CFG.pageSize;
    var list = $('#pca-list'); var tmp = document.createElement('div');
    tmp.innerHTML = current.slice(from, S.limit).map(gameCard).join('');
    var first = tmp.firstElementChild;
    while (tmp.firstChild) list.appendChild(tmp.firstChild);
    moreButton();
    if (first) { var b = first.querySelector('[data-g]'); if (b) b.focus(); }
  }
  function toggleGame(k, focus) {
    S.open[k] = !S.open[k]; setHash(S.open[k] ? k : '');
    var g = find(k), el = document.getElementById('pca-' + k);
    if (!g || !el) return;
    var tmp = document.createElement('div'); tmp.innerHTML = gameCard(g);
    var fresh = tmp.firstElementChild; el.replaceWith(fresh);
    if (focus) { var b = fresh.querySelector('[data-g]'); if (b) b.focus({ preventScroll: true }); }
    if (!S.open[k] && fresh.getBoundingClientRect().top < 0) fresh.scrollIntoView({ block: 'start' });
  }
  function toggleCase(k, i, focus) {
    var g = find(k), box = document.getElementById('pca-' + k + '-' + i);
    if (!g || !box) return;
    S.open[k + '#' + i] = !caseOpen(k, i);
    box.innerHTML = caseHTML(g, g.cs[i], i);
    if (focus) { var b = box.querySelector('[data-c]'); if (b) b.focus({ preventScroll: true }); }
  }
  function scrollToEl(el) { if (el) el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
  function openCase(k, i) {
    var g = find(k) || byKey[k]; if (!g) return;
    g.cs.forEach(function (c, j) { S.open[k + '#' + j] = j === i; });
    if (!S.open[k]) toggleGame(k, false); else { var box = document.getElementById('pca-' + k + '-' + i); if (box) box.innerHTML = caseHTML(g, g.cs[i], i); }
    scrollToEl(document.getElementById(i ? 'pca-' + k + '-' + i : 'pca-' + k));
  }
  function lucky() {
    var pool = current.length ? current : DATA.games;
    var g = pool[Math.floor(Math.random() * pool.length)], i = Math.floor(Math.random() * g.cs.length);
    var idx = current.indexOf(g);
    if (idx < 0) { resetFilters(); render(); idx = current.findIndex(function (x) { return x.k === g.k; }); g = current[idx]; }
    if (idx >= S.limit) { S.limit = idx + 1; render(); }
    g.cs.forEach(function (c, j) { S.open[g.k + '#' + j] = j === i; });
    S.open[g.k] = false; toggleGame(g.k, false);
    scrollToEl(document.getElementById('pca-' + g.k + (i ? '-' + i : '')));
  }
  var dlg;
  function report(k, i) {
    var g = find(k) || byKey[k]; if (!g) return; var c = g.cs[i];
    var link = location.href.split('#')[0] + '#pca-' + k;
    if (!dlg) {
      dlg = document.createElement('dialog'); dlg.className = 'dlg'; dlg.setAttribute('aria-labelledby', 'pca-dlg-h');
      dlg.innerHTML = '<form method="dialog"><h3 id="pca-dlg-h">Report a mistake</h3>' +
        '<p>Each card is our reading of public sources: postmortems, interviews, talks and press reports. The interpretation can be wrong, and a source can miss what happened inside the team. If you know how it actually went, tell us. A link to a source helps most, and first-hand accounts are welcome.</p>' +
        '<div class="about" id="pca-dlg-about"></div>' +
        '<label>What is wrong, and how was it actually?<textarea id="pca-dlg-text" required></textarea></label>' +
        '<label>Source link (optional)<input type="url" id="pca-dlg-src" placeholder="https://"></label>' +
        '<label>Your name and role (optional)<input type="text" id="pca-dlg-who" autocomplete="name"></label>' +
        '<p class="note" id="pca-dlg-note"></p>' +
        '<div class="acts"><button type="button" class="btn" value="cancel" id="pca-dlg-cancel">Cancel</button><button type="submit" class="btn primary" id="pca-dlg-send">Send</button></div></form>';
      root.appendChild(dlg);
      dlg.querySelector('#pca-dlg-cancel').addEventListener('click', function () { dlg.close(); });
      dlg.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        var d = dlg._ctx, txt = dlg.querySelector('#pca-dlg-text').value.trim();
        if (!txt) { dlg.querySelector('#pca-dlg-text').focus(); return; }
        var body = 'Case: ' + d.game + ': ' + d.title + '\nLink: ' + d.link + '\n\nWhat is wrong, and how it actually was:\n' + txt +
          '\n\nSource: ' + (dlg.querySelector('#pca-dlg-src').value.trim() || 'none') + '\nFrom: ' + (dlg.querySelector('#pca-dlg-who').value.trim() || 'not given');
        var subject = 'Gamedev Postmortem Atlas correction: ' + d.game;
        var note = dlg.querySelector('#pca-dlg-note');
        if (CFG.reportUrl) {
          var go = function () { window.open(CFG.reportUrl, '_blank', 'noopener'); dlg.close(); };
          if (navigator.clipboard) navigator.clipboard.writeText(subject + '\n\n' + body).then(go, go); else go();
        } else if (CFG.reportEmail) {
          location.href = 'mailto:' + encodeURIComponent(CFG.reportEmail) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
          note.textContent = 'Your mail app should open with the report filled in. If it does not, write to ' + CFG.reportEmail + '.';
        } else {
          var done = function () { note.textContent = 'The report is copied. Paste it into a message to the author of this page.'; };
          if (navigator.clipboard) navigator.clipboard.writeText(subject + '\n\n' + body).then(done, function () { note.textContent = 'Copy the text above and send it to the author of this page.'; }); else done();
        }
      });
    }
    dlg._ctx = { game: g.n, title: c.t, link: link };
    dlg.querySelector('#pca-dlg-about').textContent = g.n + ': ' + c.t;
    dlg.querySelector('#pca-dlg-text').value = ''; dlg.querySelector('#pca-dlg-src').value = ''; dlg.querySelector('#pca-dlg-note').textContent = '';
    dlg.querySelector('#pca-dlg-send').textContent = CFG.reportUrl ? 'Copy and open the form' : (CFG.reportEmail ? 'Send by email' : 'Copy report');
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', '');
    dlg.querySelector('#pca-dlg-text').focus();
  }
  function setHash(k) { try { history.replaceState(null, '', k ? '#pca-' + k : location.pathname + location.search); } catch (e) {} }
  function resetFilters() {
    S.out = ''; S.q = ''; S.cat = ''; S.scale = ''; S.year = ''; S.limit = CFG.pageSize;
    $('#pca-q').value = ''; $('#pca-cat').value = ''; $('#pca-scale').value = ''; $('#pca-year').value = '';
    pressed();
  }
  function pressed() { root.querySelectorAll('[data-out]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-out') === S.out)); }); }
  function openGame(k) {
    if (!byKey[k]) return;
    var idx = filtered().findIndex(function (g) { return g.k === k; });
    if (idx < 0) { resetFilters(); idx = filtered().findIndex(function (g) { return g.k === k; }); }
    S.open[k] = true; S.limit = Math.max(S.limit, idx + 1); render();
    var el = document.getElementById('pca-' + k);
    if (el) el.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  root.addEventListener('click', function (e) {
    var t = e.target.closest('button');
    if (t && root.contains(t)) {
      if (t.hasAttribute('data-out')) { S.out = t.getAttribute('data-out'); S.limit = CFG.pageSize; pressed(); render(); return; }
      if (t.hasAttribute('data-g')) { toggleGame(t.getAttribute('data-g'), true); return; }
      if (t.hasAttribute('data-c')) { toggleCase(t.getAttribute('data-c'), +t.getAttribute('data-i'), true); return; }
      if (t.id === 'pca-more') { appendMore(); return; }
      if (t.classList.contains('reset')) { resetFilters(); render(); return; }
      if (t.id === 'pca-lucky') { lucky(); return; }
      if (t.hasAttribute('data-report')) { report(t.getAttribute('data-report'), +t.getAttribute('data-i')); return; }
      return;
    }
    // a click on the card itself opens it; links and selected text are left alone
    if (e.target.closest('a, input, select, label, blockquote')) return;
    var sel = window.getSelection && String(window.getSelection());
    if (sel) return;
    var card = e.target.closest('article.game'); if (!card || !root.contains(card)) return;
    var k = card.getAttribute('data-k');
    if (!S.open[k]) {
      var li = e.target.closest('ul.dlist li[data-i]');
      if (li) { openCase(k, +li.getAttribute('data-i')); return; }
      toggleGame(k, false); return;
    }
    if (e.target.closest('.head')) { toggleGame(k, false); return; }
    var row = e.target.closest('.crow');
    if (row) toggleCase(k, +row.getAttribute('data-row'), false);
  });
  var qt;
  $('#pca-q').addEventListener('input', function (e) { clearTimeout(qt); qt = setTimeout(function () { S.q = e.target.value; S.limit = CFG.pageSize; render(); }, 120); });
  $('#pca-cat').addEventListener('change', function (e) { S.cat = e.target.value; S.limit = CFG.pageSize; render(); });
  $('#pca-scale').addEventListener('change', function (e) { S.scale = e.target.value; S.limit = CFG.pageSize; render(); });
  $('#pca-year').addEventListener('change', function (e) { S.year = e.target.value; S.limit = CFG.pageSize; render(); });
  $('#pca-sort').addEventListener('change', function (e) { S.sort = e.target.value; render(); });

  var cats = {}, scales = {}, years = {};
  DATA.games.forEach(function (g) { scales[g.sc] = 1; var y = parseInt(g.y, 10); if (y) years[y] = 1; g.cs.forEach(function (c) { cats[c.c] = (cats[c.c] || 0) + 1; }); });
  var opts = function (vals) { return vals.map(function (v) { return '<option value="' + esc(v[0]) + '">' + esc(v[1]) + '</option>'; }).join(''); };
  $('#pca-cat').innerHTML = '<option value="">All categories</option>' + opts(Object.keys(cats).filter(Boolean).sort(function (a, b) { return (cats[b] - cats[a]) || a.localeCompare(b); }).map(function (c) { return [c, c]; }));
  $('#pca-scale').innerHTML = '<option value="">All scales</option>' + opts(['AAA', 'AA', 'Indie', 'Solo'].filter(function (s) { return scales[s]; }).map(function (s) { return [s, s]; }));
  var ys = Object.keys(years).map(Number).sort(function (a, b) { return b - a; });
  var decs = []; ys.forEach(function (y) { var d = Math.floor(y / 10) * 10; if (decs.indexOf(d) < 0) decs.push(d); });
  $('#pca-year').innerHTML = '<option value="">All years</option><optgroup label="Decade">' + opts(decs.map(function (d) { return ['d' + d, d + 's']; })) + '</optgroup><optgroup label="Year">' + opts(ys.map(function (y) { return ['y' + y, String(y)]; })) + '</optgroup>';
  var total = DATA.games.reduce(function (a, g) { return a + g.cs.length; }, 0);
  var st = $('#pca-stats'); if (st) st.textContent = total + ' decisions from ' + DATA.games.length + ' games, each tied to a public source.';
  // sticky filter bar: its height feeds scroll offsets, and it gets a shadow once it sticks
  var bar = $('.controls');
  var setBar = function () { root.style.setProperty('--pca-bar-h', bar.offsetHeight + 'px'); };
  setBar(); window.addEventListener('resize', setBar);
  if ('IntersectionObserver' in window) {
    var sentinel = document.createElement('div'); sentinel.style.height = '1px'; bar.parentNode.insertBefore(sentinel, bar);
    new IntersectionObserver(function (es) { bar.classList.toggle('stuck', !es[0].isIntersecting); }).observe(sentinel);
  }
  // back-to-top button: appears once the reader is well past the start of the list
  var top = $('#pca-top'), app = $('#pca-app');
  if (top && app) {
    var onScroll = function () { top.hidden = app.getBoundingClientRect().top > -window.innerHeight * 1.5; };
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    top.addEventListener('click', function () { scrollToEl(app); });
  }
  pressed(); render();
  var h = (location.hash || '').replace(/^#(pca-)?/, '');
  if (h && /^[a-z0-9]+$/.test(h)) openGame(h);
})();
