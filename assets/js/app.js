/* 999921.com — core app (no dependencies) */
(function () {
  'use strict';
  var S = window.SITE || {};
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var store = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    sget: function (k) { try { return JSON.parse(sessionStorage.getItem(k)); } catch (e) { return null; } },
    sset: function (k, v) { try { sessionStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  function inbox() { try { return atob(S._k.join('')).split('').reverse().join(''); } catch (e) { return ''; } }

  /* ---------- constants ---------- */
  var OZ = 31.1034768;
  var KARATS = [
    { id: '9999', name: '24K · 999.9 “Four Nines”', cn: '足金9999', p: 0.9999 },
    { id: '999', name: '24K · 999', cn: '足金999', p: 0.999 },
    { id: '995', name: '24K · 995', cn: '995', p: 0.995 },
    { id: '22K', name: '22K · 916', cn: '22K', p: 0.9167 },
    { id: '21K', name: '21K · 875', cn: '21K', p: 0.875 },
    { id: '20K', name: '20K · 833', cn: '20K', p: 0.8333 },
    { id: '18K', name: '18K · 750', cn: 'K金750', p: 0.75 },
    { id: '14K', name: '14K · 585', cn: '14K', p: 0.585 },
    { id: '10K', name: '10K · 417', cn: '10K', p: 0.417 },
    { id: '9K', name: '9K · 375', cn: '9K', p: 0.375 }
  ];
  var UNITS = [
    { id: 'g', name: 'Gram (g)', g: 1 },
    { id: '10g', name: '10 grams', g: 10 },
    { id: 'oz', name: 'Troy ounce (oz t)', g: OZ },
    { id: 'kg', name: 'Kilogram', g: 1000 },
    { id: 'tael_hk', name: 'Tael HK 両 (37.429 g)', g: 37.429 },
    { id: 'tael_cn', name: 'Liang 市两 (50 g)', g: 50 },
    { id: 'tola', name: 'Tola (11.664 g)', g: 11.6638 },
    { id: 'baht', name: 'Thai baht (15.244 g)', g: 15.244 },
    { id: 'mithqal', name: 'Mithqal (4.25 g)', g: 4.25 },
    { id: 'dwt', name: 'Pennyweight (dwt)', g: 1.55517 }
  ];
  var CUR = {
    USD: ['$', 'US Dollar', '🇺🇸'], CNY: ['¥', 'Chinese Yuan', '🇨🇳'], HKD: ['HK$', 'Hong Kong Dollar', '🇭🇰'], TWD: ['NT$', 'Taiwan Dollar', '🇹🇼'],
    SGD: ['S$', 'Singapore Dollar', '🇸🇬'], MYR: ['RM', 'Malaysian Ringgit', '🇲🇾'], INR: ['₹', 'Indian Rupee', '🇮🇳'], AED: ['AED ', 'UAE Dirham', '🇦🇪'],
    SAR: ['SAR ', 'Saudi Riyal', '🇸🇦'], KWD: ['KWD ', 'Kuwaiti Dinar', '🇰🇼'], QAR: ['QAR ', 'Qatari Riyal', '🇶🇦'], EGP: ['EGP ', 'Egyptian Pound', '🇪🇬'],
    EUR: ['€', 'Euro', '🇪🇺'], GBP: ['£', 'British Pound', '🇬🇧'], CAD: ['C$', 'Canadian Dollar', '🇨🇦'], AUD: ['A$', 'Australian Dollar', '🇦🇺'],
    JPY: ['¥', 'Japanese Yen', '🇯🇵'], THB: ['฿', 'Thai Baht', '🇹🇭'], TRY: ['₺', 'Turkish Lira', '🇹🇷'], PKR: ['Rs ', 'Pakistani Rupee', '🇵🇰']
  };
  window.G21 = { KARATS: KARATS, UNITS: UNITS, CUR: CUR, OZ: OZ };

  var M = { xau: S.fallback.xau, xag: S.fallback.xag, rates: S.fallback.rates, updated: S.fallback.updated, live: false, prev: null };
  var cur = store.get('g21_cur') || 'USD';

  function fmt(n, c) {
    c = c || cur;
    var d = n >= 1000 ? 0 : 2; if (c === 'KWD') d = n >= 1000 ? 1 : 3; if (c === 'JPY') d = 0;
    return (CUR[c] ? CUR[c][0] : '') + Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function perGram(purity, c) { return M.xau / OZ * (M.rates[c || cur] || 1) * (purity == null ? 1 : purity); }
  window.G21.price = perGram; window.G21.fmt = fmt; window.G21.M = M;

  /* ---------- market data ---------- */
  function fetchJSON(u) { return fetch(u, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw 0; return r.json(); }); }
  function loadMarket() {
    var cached = store.sget('g21_mkt');
    if (cached && Date.now() - cached.t < 60000) { Object.assign(M, cached.m); render(); return; }
    render();
    Promise.allSettled([fetchJSON(S.api.gold), fetchJSON(S.api.fx), fetchJSON(S.api.silver)]).then(function (r) {
      var last = store.get('g21_last');
      if (r[0].status === 'fulfilled' && r[0].value && r[0].value.price) { M.xau = +r[0].value.price; M.updated = r[0].value.updatedAt || new Date().toISOString(); M.live = true; }
      if (r[1].status === 'fulfilled' && r[1].value && r[1].value.rates) { M.rates = Object.assign({}, M.rates, r[1].value.rates); }
      if (r[2].status === 'fulfilled' && r[2].value && r[2].value.price) { M.xag = +r[2].value.price; }
      if (last && last.xau && last.day !== new Date().toDateString()) M.prev = last.xau; else if (last && last.prev) M.prev = last.prev;
      store.set('g21_last', { xau: M.xau, day: new Date().toDateString(), prev: M.prev });
      store.sset('g21_mkt', { t: Date.now(), m: { xau: M.xau, xag: M.xag, rates: M.rates, updated: M.updated, live: M.live, prev: M.prev } });
      render();
    });
  }
  setInterval(function () { store.sset('g21_mkt', null); loadMarket(); }, 120000);

  function changeHTML() {
    if (!M.prev) return '';
    var d = M.xau - M.prev, pct = d / M.prev * 100, cls = d >= 0 ? 'up' : 'down';
    return ' <span class="' + cls + '">' + (d >= 0 ? '▲' : '▼') + ' ' + Math.abs(pct).toFixed(2) + '%</span>';
  }

  function render() {
    var t = new Date(M.updated);
    var stamp = (M.live ? 'Live' : 'Last known') + ' · ' + (isNaN(t) ? '' : t.toLocaleString());
    // ticker
    var tk = $('#ticker');
    if (tk) {
      tk.innerHTML = '<span><i class="live-dot"></i><b>GOLD</b> ' + fmt(M.xau * (M.rates[cur] || 1)) + '/oz' + changeHTML() + '</span>' +
        '<span><b>9999</b> ' + fmt(perGram(0.9999)) + '/g</span>' +
        '<span><b>22K</b> ' + fmt(perGram(0.9167)) + '/g</span>' +
        '<span><b>21K</b> ' + fmt(perGram(0.875)) + '/g</span>' +
        '<span><b>18K</b> ' + fmt(perGram(0.75)) + '/g</span>' +
        '<span><b>Tael 両</b> ' + fmt(perGram(0.9999) * 37.429) + '</span>' +
        '<span><b>SILVER</b> ' + fmt(M.xag * (M.rates[cur] || 1)) + '/oz</span>' +
        '<span><b>Au/Ag</b> ' + (M.xau / M.xag).toFixed(1) + '</span>' +
        '<span><b>¥/g 9999</b> ' + fmt(perGram(0.9999, 'CNY'), 'CNY') + '</span>' +
        '<span class="small" style="color:#a99c78">' + stamp + '</span>';
    }
    $$('[data-gold]').forEach(function (el) {
      var a = el.getAttribute('data-gold').split(','); // purity,unitGrams,currency?
      var p = a[0] === 'x' ? 1 : parseFloat(a[0]), g = parseFloat(a[1] || 1), c = a[2] || cur;
      el.textContent = fmt(perGram(p, c) * g, c);
    });
    $$('[data-stamp]').forEach(function (el) { el.textContent = stamp; });
    $$('[data-change]').forEach(function (el) { el.innerHTML = changeHTML() || '<span class="muted">—</span>'; });
    $$('select[data-cur]').forEach(function (s) { s.value = cur; });
    buildKaratTable(); buildFxGrid(); runCalc(); runWedding(); runScrap(); runJewel();
  }

  function setCur(c) { cur = c; store.set('g21_cur', c); render(); }
  function curOptions(sel) { return Object.keys(CUR).map(function (c) { return '<option value="' + c + '"' + (c === sel ? ' selected' : '') + '>' + CUR[c][2] + ' ' + c + '</option>'; }).join(''); }
  window.G21.curOptions = curOptions;

  function buildKaratTable() {
    var box = $('#karat-table'); if (!box) return;
    var units = (box.getAttribute('data-units') || 'g,10g,oz,tael_hk,tola').split(',');
    var U = units.map(function (u) { return UNITS.filter(function (x) { return x.id === u; })[0]; });
    var h = '<div class="table-wrap"><table><thead><tr><th>Purity</th><th>Fineness</th>' + U.map(function (u) { return '<th>' + u.name.replace(/ \(.*\)/, '') + '</th>'; }).join('') + '</tr></thead><tbody>';
    KARATS.forEach(function (k) {
      h += '<tr><td>' + k.name + ' <span class="small muted">' + k.cn + '</span></td><td>' + (k.p * 100).toFixed(2) + '%</td>' + U.map(function (u) { return '<td>' + fmt(perGram(k.p) * u.g) + '</td>'; }).join('') + '</tr>';
    });
    box.innerHTML = h + '</tbody></table></div>';
  }
  function buildFxGrid() {
    var box = $('#fx-grid'); if (!box) return;
    var list = (box.getAttribute('data-list') || 'CNY,HKD,TWD,SGD,MYR,INR,AED,SAR,EGP,USD,CAD,EUR,GBP,AUD,JPY,THB').split(',');
    box.innerHTML = list.map(function (c) {
      return '<div class="card"><div class="small muted">' + CUR[c][2] + ' ' + CUR[c][1] + '</div><div style="font-family:var(--serif);font-size:1.35rem;margin:4px 0">' + fmt(perGram(0.9999, c), c) + '<span class="small muted">/g 9999</span></div><div class="small">21K: <b>' + fmt(perGram(0.875, c), c) + '</b>/g · oz: ' + fmt(M.xau * (M.rates[c] || 1), c) + '</div></div>';
    }).join('');
  }

  /* ---------- calculators ---------- */
  function num(id) { var e = document.getElementById(id); return e ? parseFloat(e.value) || 0 : 0; }
  function val(id) { var e = document.getElementById(id); return e ? e.value : ''; }
  function fillSelects() {
    $$('select[data-karats]').forEach(function (s) { if (s.options.length) return; s.innerHTML = KARATS.map(function (k) { return '<option value="' + k.p + '"' + (k.id === (s.getAttribute('data-default') || '9999') ? ' selected' : '') + '>' + k.name + '</option>'; }).join(''); });
    $$('select[data-units]').forEach(function (s) { if (s.options.length) return; s.innerHTML = UNITS.map(function (u) { return '<option value="' + u.g + '"' + (u.id === (s.getAttribute('data-default') || 'g') ? ' selected' : '') + '>' + u.name + '</option>'; }).join(''); });
    $$('select[data-cur]').forEach(function (s) { s.innerHTML = curOptions(cur); s.addEventListener('change', function () { setCur(s.value); }); });
  }
  function runCalc() {
    var out = $('#calc-out'); if (!out) return;
    var w = num('c-weight'), u = num('c-unit') || 1, p = num('c-karat') || 0.9999, mk = num('c-making'), sp = num('c-spread'), tx = num('c-tax');
    var mode = val('c-mode') || 'melt';
    var grams = w * u, melt = grams * perGram(p);
    var adj = mode === 'sell' ? melt * (1 - sp / 100) : mode === 'buy' ? melt * (1 + sp / 100) : melt;
    var making = mode === 'buy' ? adj * mk / 100 : 0, tax = mode === 'buy' ? (adj + making) * tx / 100 : 0, total = adj + making + tax;
    out.innerHTML = '<div class="small" style="color:#cdbf97">' + (mode === 'sell' ? 'Estimated cash offer' : mode === 'buy' ? 'Estimated retail price' : 'Melt (intrinsic) value') + '</div><div class="big">' + fmt(total) + '</div>' +
      '<div class="row2"><span>Pure gold content</span><span>' + (grams * p).toFixed(3) + ' g (' + (grams * p / OZ).toFixed(4) + ' oz t)</span></div>' +
      '<div class="row2"><span>Melt value</span><span>' + fmt(melt) + '</span></div>' +
      (mode !== 'melt' ? '<div class="row2"><span>Dealer spread (' + sp + '%)</span><span>' + (mode === 'sell' ? '−' : '+') + fmt(Math.abs(adj - melt)) + '</span></div>' : '') +
      (mode === 'buy' ? '<div class="row2"><span>Making charge (' + mk + '%)</span><span>+' + fmt(making) + '</span></div><div class="row2"><span>Tax (' + tx + '%)</span><span>+' + fmt(tax) + '</span></div>' : '') +
      '<div class="row2"><span>Per gram of this item</span><span>' + fmt(grams ? total / grams : 0) + '</span></div>';
  }
  function runScrap() {
    var out = $('#scrap-out'); if (!out) return;
    var total = 0, rows = '';
    $$('.scrap-line').forEach(function (r) {
      var w = parseFloat($('input', r).value) || 0, p = parseFloat($('select', r).value);
      var v = w * perGram(p); total += v; if (w) rows += '<div class="row2"><span>' + w + ' g @ ' + (p * 100).toFixed(1) + '%</span><span>' + fmt(v) + '</span></div>';
    });
    var pay = num('s-payout') || 80;
    out.innerHTML = '<div class="small" style="color:#cdbf97">Total melt value</div><div class="big">' + fmt(total) + '</div>' + rows +
      '<div class="row2"><span>Typical offer at ' + pay + '% payout</span><span>' + fmt(total * pay / 100) + '</span></div>';
  }
  function runJewel() {
    var out = $('#jewel-out'); if (!out) return;
    var w = num('j-weight'), p = num('j-karat') || 0.9167, mk = num('j-making'), mkType = val('j-mtype'), wst = num('j-wastage'), tx = num('j-tax'), stone = num('j-stone');
    var metal = w * (1 + wst / 100) * perGram(p);
    var making = mkType === 'pg' ? w * mk : metal * mk / 100;
    var sub = metal + making + stone, tax = sub * tx / 100;
    out.innerHTML = '<div class="small" style="color:#cdbf97">Fair price estimate</div><div class="big">' + fmt(sub + tax) + '</div>' +
      '<div class="row2"><span>Gold value (incl. ' + wst + '% wastage)</span><span>' + fmt(metal) + '</span></div><div class="row2"><span>Making charges</span><span>' + fmt(making) + '</span></div>' +
      '<div class="row2"><span>Stones / other</span><span>' + fmt(stone) + '</span></div><div class="row2"><span>Tax ' + tx + '%</span><span>' + fmt(tax) + '</span></div>';
  }
  function runWedding() {
    var out = $('#wed-out'); if (!out) return;
    var total = 0, rows = '';
    $$('.wed-line').forEach(function (r) {
      var on = $('input[type=checkbox]', r).checked, w = parseFloat($('input[type=number]', r).value) || 0, p = parseFloat($('select', r).value), n = r.getAttribute('data-name');
      if (!on) return; var v = w * perGram(p) * 1.12; total += v; rows += '<div class="row2"><span>' + n + ' · ' + w + ' g</span><span>' + fmt(v) + '</span></div>';
    });
    out.innerHTML = '<div class="small" style="color:#cdbf97">Estimated wedding gold budget (incl. ~12% making)</div><div class="big">' + fmt(total) + '</div>' + rows;
  }
  function bindCalcs() {
    $$('#gold-calc input, #gold-calc select, #scrap input, #scrap select, #jewel input, #jewel select, #wedding-planner input, #wedding-planner select').forEach(function (e) {
      e.addEventListener('input', function () { runCalc(); runScrap(); runJewel(); runWedding(); });
      e.addEventListener('change', function () { runCalc(); runScrap(); runJewel(); runWedding(); });
    });
    $$('[data-preset]').forEach(function (b) { b.addEventListener('click', function () { var w = document.getElementById('c-weight'); if (w) { w.value = b.getAttribute('data-preset'); runCalc(); } }); });
    // karat converter
    var kc = $('#kconv'); if (kc) {
      var f = function () {
        var k = parseFloat($('#kc-k').value) || 0; $('#kc-out').innerHTML = '<b>' + k + 'K</b> = <b>' + (k / 24 * 100).toFixed(2) + '%</b> pure = hallmark <b>' + Math.round(k / 24 * 1000) + '</b> · ' + fmt(perGram(k / 24)) + '/g';
      }; $('#kc-k').addEventListener('input', f); f();
    }
  }
  function tabs() {
    $$('.tabs').forEach(function (t) {
      var btns = $$('button', t);
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          btns.forEach(function (x) { x.setAttribute('aria-selected', 'false'); var p = document.getElementById(x.getAttribute('aria-controls')); if (p) p.classList.remove('active'); });
          b.setAttribute('aria-selected', 'true'); var p = document.getElementById(b.getAttribute('aria-controls')); if (p) p.classList.add('active');
        });
        var h = location.hash && document.getElementById(location.hash.slice(1)), pn = document.getElementById(b.getAttribute('aria-controls'));
        if (h && pn && pn.contains(h) && pn !== h.closest('.calc')) b.click();
      });
    });
  }

  /* ---------- number decoder ---------- */
  var DIG = {
    '0': ['零', 'líng', 'you (你) / zero, a circle of completeness', 0],
    '1': ['一', 'yī', 'you (你) / want (要) / unity, one-and-only', 1],
    '2': ['二', 'èr', 'love (爱) / pairs & harmony (好事成双)', 2],
    '3': ['三', 'sān', 'life / birth (生) — also 散 “scatter”', 1],
    '4': ['四', 'sì', 'sounds like 死 (death) — or 世 (lifetime) in love codes', -2],
    '5': ['五', 'wǔ', 'me / I (我) — also 无 “without”', 1],
    '6': ['六', 'liù', 'smooth & flowing (流/溜) — “666” = awesome', 2],
    '7': ['七', 'qī', 'wife / together (妻/齐) — also 气 “angry”', 1],
    '8': ['八', 'bā', 'prosperity (发 fā) — the luckiest digit', 3],
    '9': ['九', 'jiǔ', 'forever / long-lasting (久) — imperial number', 3]
  };
  var CODES = {
    '999921': '久久久久爱你 — “Love you forever and ever”; also reads as the two golds: 9999 fine and 21K.',
    '999920': '久久久久爱你 — forever love (sister code).', '9999': '久久久久 — forever and ever; also 99.99% “four nines” fine gold (足金9999).',
    '999': '久久久 — eternal; 99.9% gold (千足金 / 足金999).', '99': '久久 — long-lasting love; 99 roses = eternal love.',
    '520': '我爱你 — I love you (May 20 = China’s “Cyber Valentine’s Day”).', '521': '我愿意 / 我爱你 — I’m willing / I do.',
    '1314': '一生一世 — for a whole lifetime.', '5201314': '我爱你一生一世 — I love you for a lifetime.', '1314520': '一生一世我爱你 — a lifetime of love.',
    '9421': '就是爱你 — it’s you I love.', '59421': '我就是爱你 — I just love you.', '8': '发 — wealth & prosperity.', '88': '发发 / 拜拜 — double fortune (or “bye-bye”).',
    '888': '发发发 — wealth, wealth, wealth.', '8888': '发发发发 — ultimate prosperity; 88888888 phone number sold for ¥2.33m in 2003.',
    '168': '一路发 — prosperity all the way.', '518': '我要发 — I will prosper.', '666': '溜溜溜 — smooth / awesome (internet slang).',
    '6666': 'super smooth — “you’re amazing”.', '4': '死 — avoided; many buildings skip floor 4.', '14': '要死 / 一世 — context-dependent.',
    '250': '二百五 — a fool (avoid in gifts!).', '748': '去死吧 — rude; avoid.', '886': '拜拜了 — bye-bye.', '530': '我想你 — I miss you.',
    '1711': '一心一意 — wholeheartedly.', '3344': '生生世世 — life after life.', '1920': '依旧爱你 — still love you.', '2012': '爱你一辈子 (older code) — love you all my life.',
    '21': '爱你 — love you; also 21K (87.5%) gold, the Gulf & Egypt’s favourite karat.', '24': '24K — pure gold; 爱死 in slang.', '99999': '久久久久久 — endless.'
  };
  function decode(n) {
    var out = $('#decode-out'); if (!out) return;
    n = (n || '').replace(/\D/g, '').slice(0, 16);
    if (!n) { out.innerHTML = ''; return; }
    var chips = n.split('').map(function (d) { var m = DIG[d]; return '<div class="digit-chip"><b>' + d + '</b>' + m[0] + ' <small>' + m[1] + '</small></div>'; }).join('');
    var score = n.split('').reduce(function (a, d) { return a + DIG[d][3]; }, 0), max = n.length * 3, pct = Math.max(4, Math.min(100, Math.round((score + n.length * 2) / (max + n.length * 2) * 100)));
    var known = CODES[n];
    var story = n.split('').map(function (d) { return DIG[d][2].split(' / ')[0].split(' (')[0]; });
    out.innerHTML = '<div class="digit-chips">' + chips + '</div>' +
      (known ? '<div class="callout"><b>Known code:</b> ' + known + '</div>' : '<div class="callout">Reading digit-by-digit: <b>' + story.join(' · ') + '</b></div>') +
      '<div><div class="small" style="display:flex;justify-content:space-between"><span>Luck score</span><b>' + pct + '/100</b></div><div class="meter"><i style="width:' + pct + '%"></i></div></div>' +
      '<div class="small muted">' + (n.indexOf('4') > -1 ? 'Contains 4 — many buyers avoid it for plates, phones & gifts. ' : '') + (n.indexOf('8') > -1 ? 'Contains 8 — prized for business & prices. ' : '') + (n.indexOf('9') > -1 ? 'Contains 9 — longevity & lasting love; perfect for weddings and anniversaries.' : '') + '</div>' +
      '<div style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn btn-sm btn-dark" data-share="My number ' + n + ' decoded on 999921.com">Share result</button><a class="btn btn-sm btn-gold" href="get-quotes.html?intent=engrave&number=' + n + '">Engrave this number in gold →</a></div>';
    bindShare(out);
  }
  function bindDecoder() {
    var i = $('#decoder-input'); if (!i) return;
    var q = new URLSearchParams(location.search).get('n');
    if (q) i.value = q;
    i.addEventListener('input', function () { decode(i.value); });
    $$('[data-decode]').forEach(function (b) { b.addEventListener('click', function () { i.value = b.getAttribute('data-decode'); decode(i.value); i.focus(); }); });
    decode(i.value || '999921');
    if (!i.value) i.value = '999921';
  }

  /* ---------- forms (FormSubmit AJAX; inbox never in HTML) ---------- */
  function endpoint() { return 'https://formsubmit.co/ajax/' + (S.formAlias || inbox()); }
  function bindForms() {
    $$('form[data-form]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('.form-msg', f); if (!f.checkValidity()) { f.reportValidity(); return; }
        var hp = $('.hp input', f); if (hp && hp.value) return;
        var data = {}; new FormData(f).forEach(function (v, k) { if (k !== '_hp') data[k] = data[k] ? data[k] + ', ' + v : v; });
        data._subject = '[999921.com] ' + (f.getAttribute('data-form') || 'Form') + (data.intent ? ' — ' + data.intent : '');
        data._template = 'table'; data._captcha = 'false'; data.page = location.href; data.submitted = new Date().toISOString();
        var btn = $('button[type=submit]', f); if (btn) { btn.disabled = true; btn.dataset.t = btn.textContent; btn.textContent = 'Sending…'; }
        fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
          .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok || j.success === 'false') throw 0; }); })
          .then(function () { done(true); }).catch(function () { done(false); });
        function done(ok) {
          if (btn) { btn.disabled = false; btn.textContent = btn.dataset.t; }
          if (msg) { msg.className = 'form-msg ' + (ok ? 'ok' : 'err'); msg.textContent = ok ? (f.getAttribute('data-ok') || 'Thank you! We received your message and will reply within 1–2 business days.') : 'Could not send right now. Please try again in a minute.'; }
          if (ok) {
            track('lead', f.getAttribute('data-form'));
            var unlock = f.getAttribute('data-unlock'); if (unlock) { var u = document.getElementById(unlock); if (u) { u.hidden = false; u.scrollIntoView({ behavior: 'smooth' }); } store.set('g21_unlock_' + unlock, 1); }
            f.reset(); toast('Sent ✓');
            var rd = f.getAttribute('data-redirect'); if (rd) setTimeout(function () { location.href = rd; }, 1200);
            if (f.closest('.modal')) setTimeout(function () { f.closest('.modal').classList.remove('show'); }, 1600);
          }
        }
      });
    });
    $$('[data-unlocked]').forEach(function (el) { if (store.get('g21_unlock_' + el.id)) el.hidden = false; });
    // prefill from query
    var qs = new URLSearchParams(location.search);
    qs.forEach(function (v, k) { $$('form [name="' + k + '"]').forEach(function (el) { if (el.type === 'radio') { if (el.value === v) el.checked = true; } else el.value = v; }); });
  }
  function wizard() {
    $$('.wizard').forEach(function (w) {
      var steps = $$('.step', w), bars = $$('.steps span', w), i = 0;
      function go(n) {
        if (n > i) { var inv = $$('input,select,textarea', steps[i]).filter(function (x) { return !x.checkValidity(); }); if (inv.length) { inv[0].reportValidity(); return; } }
        i = Math.max(0, Math.min(steps.length - 1, n));
        steps.forEach(function (s, k) { s.classList.toggle('active', k === i); }); bars.forEach(function (b, k) { b.classList.toggle('on', k <= i); });
      }
      $$('[data-next]', w).forEach(function (b) { b.addEventListener('click', function () { go(i + 1); }); });
      $$('[data-prev]', w).forEach(function (b) { b.addEventListener('click', function () { go(i - 1); }); });
      $$('.choice input', w).forEach(function (r) { r.addEventListener('change', function () { if (steps[i].contains(r) && r.type === 'radio') setTimeout(function () { go(i + 1); }, 180); }); });
      var intent = new URLSearchParams(location.search).get('intent'); if (intent) { var r = $('input[name=intent][value="' + intent + '"]', w); if (r) { r.checked = true; go(1); } }
      go(0);
    });
  }

  /* ---------- ads / consent ---------- */
  function loadAds() {
    if (!S.adsense.enabled || window._adsLoaded) return; window._adsLoaded = 1;
    var s = document.createElement('script'); s.async = true; s.crossOrigin = 'anonymous';
    s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + S.adsense.client; document.head.appendChild(s);
    $$('.ad-slot').forEach(function (a) {
      var slot = S.adsense.slots[a.getAttribute('data-slot')] || '';
      a.classList.add('filled');
      a.innerHTML = '<ins class="adsbygoogle" style="display:block" data-ad-client="' + S.adsense.client + '"' + (slot ? ' data-ad-slot="' + slot + '"' : '') + ' data-ad-format="auto" data-full-width-responsive="true"></ins>';
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }
  function consent() {
    var c = $('#cookie'); var v = store.get('g21_consent');
    if (v === 'all') loadAds();
    if (!c || v) return; c.classList.add('show');
    $$('[data-consent]', c).forEach(function (b) { b.addEventListener('click', function () { var x = b.getAttribute('data-consent'); store.set('g21_consent', x); c.classList.remove('show'); if (x === 'all') loadAds(); }); });
  }

  /* ---------- donations ---------- */
  function donate() {
    $$('[data-donate]').forEach(function (a) {
      var u = S.donate[a.getAttribute('data-donate')];
      if (u) { a.href = u; a.target = '_blank'; a.rel = 'noopener'; } else { a.href = 'support.html#pledge'; }
    });
    $$('[data-amount]').forEach(function (b) { b.addEventListener('click', function () { var i = $('#pledge-amount'); if (i) { i.value = b.getAttribute('data-amount'); i.focus(); } }); });
  }

  /* ---------- videos ---------- */
  var TOPICS = [
    ['How to test gold purity at home', 'how to test gold purity at home'], ['9999 vs 999 gold explained', '9999 vs 999 gold difference'],
    ['Shanghai Gold Exchange explained', 'shanghai gold exchange explained'], ['21K gold buying in Dubai', 'buying 21k gold dubai gold souk'],
    ['Chinese wedding gold (四点金)', 'chinese wedding gold jewelry si dian jin'], ['Gold price outlook', 'gold price forecast this week'],
    ['How gold bars are made', 'how gold bars are made refinery'], ['Selling gold: get the best price', 'how to sell gold for the best price'],
    ['Dragon & phoenix bangle', 'dragon phoenix bangle chinese wedding']
  ];
  function videos() {
    var g = $('#video-grid'); if (!g) return;
    var lim = parseInt(g.getAttribute('data-limit') || '99', 10);
    var f = (S.youtube.featured || []).slice(0, lim);
    if (f.length) {
      g.innerHTML = f.map(function (id) { return '<div class="video" data-yt="' + id + '" style="background-image:url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)"><div class="play"><i>▶</i></div></div>'; }).join('');
    } else {
      g.innerHTML = TOPICS.slice(0, lim).map(function (t) { return '<a class="vid-card" target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=' + encodeURIComponent(t[1]) + '"><div class="thumb">▶</div><div class="meta"><b>' + t[0] + '</b><div class="small muted">Watch on YouTube →</div></div></a>'; }).join('');
    }
    $$('.video[data-yt]', g).forEach(function (v) { v.addEventListener('click', function () { v.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + v.getAttribute('data-yt') + '?autoplay=1" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen title="Video"></iframe>'; }); });
    $$('[data-channel]').forEach(function (a) { if (S.youtube.channelUrl) a.href = S.youtube.channelUrl; });
  }

  /* ---------- misc UI ---------- */
  function toast(t) { var el = $('#toast'); if (!el) return; el.textContent = t; el.classList.add('show'); setTimeout(function () { el.classList.remove('show'); }, 2600); }
  function track(ev, label) { try { if (window.gtag) gtag('event', ev, { event_label: label }); } catch (e) {} }
  function bindShare(ctx) {
    $$('[data-share]', ctx).forEach(function (b) {
      if (b._s) return; b._s = 1;
      b.addEventListener('click', function () {
        var d = { title: document.title, text: b.getAttribute('data-share') || document.title, url: location.href };
        if (navigator.share) navigator.share(d).catch(function () {}); else { try { navigator.clipboard.writeText(d.text + ' ' + d.url); toast('Link copied'); } catch (e) {} }
      });
    });
  }
  function countdown() {
    $$('[data-countdown]').forEach(function (el) {
      var end = new Date(el.getAttribute('data-countdown')).getTime();
      function tick() {
        var d = Math.max(0, end - Date.now()), D = Math.floor(d / 864e5), H = Math.floor(d / 36e5) % 24, Mi = Math.floor(d / 6e4) % 60, Se = Math.floor(d / 1e3) % 60;
        el.innerHTML = [[D, 'Days'], [H, 'Hours'], [Mi, 'Min'], [Se, 'Sec']].map(function (x) { return '<div><b>' + x[0] + '</b><small>' + x[1] + '</small></div>'; }).join('');
      } tick(); setInterval(tick, 1000);
    });
  }
  function poll() {
    var p = $('#poll'); if (!p) return;
    var v = store.get('g21_poll'), base = { up: 58, flat: 17, down: 25 };
    function show() {
      var t = base.up + base.flat + base.down;
      $('.poll-res', p).innerHTML = ['up', 'flat', 'down'].map(function (k) { var pc = Math.round(base[k] / t * 100); return '<div class="small" style="display:flex;justify-content:space-between"><span>' + { up: '📈 Rise', flat: '➖ Flat', down: '📉 Fall' }[k] + (v === k ? ' (your vote)' : '') + '</span><b>' + pc + '%</b></div><div class="meter" style="margin-bottom:8px"><i style="width:' + pc + '%"></i></div>'; }).join('');
    }
    if (v) { base[v]++; show(); }
    $$('[data-vote]', p).forEach(function (b) { b.addEventListener('click', function () { if (v) return; v = b.getAttribute('data-vote'); base[v]++; store.set('g21_poll', v); show(); toast('Vote counted'); }); });
  }
  function exitIntent() {
    var m = $('#lead-modal'); if (!m) return;
    var shown = store.sget('g21_exit') || store.get('g21_unlock_guide');
    function open() { if (shown) return; shown = 1; store.sset('g21_exit', 1); m.classList.add('show'); }
    document.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY < 10) open(); });
    setTimeout(function () { if (window.innerWidth < 760 && window.scrollY > 1200) open(); }, 45000);
    $$('[data-open-modal]').forEach(function (b) { b.addEventListener('click', function (e) { e.preventDefault(); shown = 0; open(); }); });
    $$('.modal-close, .modal', document).forEach(function (x) { x.addEventListener('click', function (e) { if (e.target === x) m.classList.remove('show'); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') m.classList.remove('show'); });
  }
  function ui() {
    var t = $('.nav-toggle'), mnu = $('.menu');
    if (t) t.addEventListener('click', function () { var o = mnu.classList.toggle('open'); t.setAttribute('aria-expanded', o); });
    var here = location.pathname.split('/').pop() || 'index.html';
    $$('.menu a').forEach(function (a) { if (a.getAttribute('href') === here) a.setAttribute('aria-current', 'page'); });
    var tt = $('.to-top'); window.addEventListener('scroll', function () { if (tt) tt.classList.toggle('show', window.scrollY > 700); }, { passive: true });
    if (tt) tt.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }); }, { threshold: 0.08 });
      $$('.reveal').forEach(function (r) { io.observe(r); });
    } else $$('.reveal').forEach(function (r) { r.classList.add('in'); });
    $$('[data-year]').forEach(function (y) { y.textContent = new Date().getFullYear(); });
    $$('a[data-interest]').forEach(function (a) { a.href = S.interestUrl; });
    bindShare(document);
  }

  document.addEventListener('DOMContentLoaded', function () {
    fillSelects(); ui(); tabs(); bindCalcs(); bindDecoder(); bindForms(); wizard(); consent(); donate(); videos(); countdown(); poll(); exitIntent();
    loadMarket();
  });
})();
