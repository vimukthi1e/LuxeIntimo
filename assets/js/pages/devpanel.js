/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/devpanel.js
   Developer tools · #/dev  (blueprint §15)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  function renderDev() {
    var usage = LX.DB.usageReport();
    var api = LX.Api.describe();
    var users = LX.Store.get('users') || [];
    var orders = LX.Store.get('orders') || [];
    var payments = LX.Store.get('payments') || [];
    var dev = LX.Store.get('dev') || {};

    return '' +
      '<section class="container page-head">' +
      '<p class="label label-gold">Developer</p>' +
      '<h1 class="h-serif">Dev Tools</h1>' +
      '<p class="muted">Local diagnostics, test data and validation playground.</p>' +
      '</section>' +

      '<section class="container dev-layout">' +

      /* ── RUNTIME ── */
      '<div class="panel">' +
      '<h4 class="dev-sec">▸ Runtime</h4>' +
      '<div class="kv"><span class="k">Version</span><span class="v">v' + LX.VERSION + '</span></div>' +
      '<div class="kv"><span class="k">Protocol</span><span class="v">' + LX.PROTOCOL + '</span></div>' +
      '<div class="kv"><span class="k">API mode</span><span class="v">' + LX.esc(api.mode) + '</span></div>' +
      '<div class="kv"><span class="k">Base URL</span><span class="v tiny">' + LX.esc(api.baseUrl) + '</span></div>' +
      '<div class="kv"><span class="k">Gateway</span><span class="v">' + LX.esc(api.gateway) + '</span></div>' +
      '<div class="kv"><span class="k">Storage</span><span class="v">' + LX.esc(api.storage) + '</span></div>' +
      '<div class="kv"><span class="k">Crypto</span><span class="v">' +
      (LX.CRYPTO.mode === 'fallback'
        ? '<span class="badge badge-warn">iterated SHA-256</span>'
        : '<span class="badge badge-ok">PBKDF2-SHA256</span>') + '</span></div>' +
      '<div class="kv"><span class="k">Storage used</span><span class="v">' + usage.human + ' (' + usage.pct + '%)</span></div>' +
      '<div class="meter" style="margin-top:.55rem"><i style="width:' + usage.pct + '%;background:' +
      (usage.pct > 80 ? 'var(--err)' : 'var(--gold)') + '"></i></div>' +
      (LX.CRYPTO.mode === 'fallback'
        ? '<div class="inline-note note-warn" style="margin-top:.9rem">WebCrypto unavailable — you are likely on file://. Run from localhost for full PBKDF2 strength.</div>'
        : '') +
      '</div>' +

      /* ── DATA ── */
      '<div class="panel">' +
      '<h4 class="dev-sec">▸ Data</h4>' +
      '<div class="row wrap" style="gap:.75rem">' +
      '<div class="dev-stat"><b>' + users.length + '</b><span>Users</span></div>' +
      '<div class="dev-stat"><b>' + orders.length + '</b><span>Orders</span></div>' +
      '<div class="dev-stat"><b>' + payments.length + '</b><span>Payments</span></div>' +
      '<div class="dev-stat"><b>' + LX.Catalog.all().length + '</b><span>Products</span></div>' +
      '<div class="dev-stat"><b>' + LX.SL.allDivisionCount() + '</b><span>Divisions</span></div>' +
      '<div class="dev-stat"><b>' + LX.SL.allAreaCount() + '</b><span>Sub-areas</span></div>' +
      '</div>' +
      '<div class="row wrap" style="gap:.65rem;margin-top:1.15rem">' +
      '<button class="btn btn-ghost btn-sm" id="devExport">Export JSON</button>' +
      '<button class="btn btn-ghost btn-sm" id="devImport">Import JSON</button>' +
      '<button class="btn btn-ghost btn-sm" id="devReseed">Reseed products</button>' +
      '<button class="btn btn-danger btn-sm" id="devReset">Reset all</button>' +
      '</div>' +
      '<input type="file" id="devImportFile" accept="application/json" hidden>' +
      '<div class="field-msg" id="devDataMsg" style="margin-top:.75rem"></div>' +
      '</div>' +

      /* ── TEST CARDS ── */
      '<div class="panel">' +
      '<h4 class="dev-sec">▸ Test cards</h4>' +
      '<p class="muted tiny" style="margin-bottom:.85rem">Click a card to copy · all pass the Luhn check</p>' +
      '<div class="test-cards">' +
      LX.Card.TEST_CARDS.map(function (c, i) {
        return '<button class="test-card" data-card="' + i + '">' +
          '<span class="tc-brand">' + LX.esc(c.label) + '</span>' +
          '<span class="tc-num">' + LX.esc(c.number) + '</span>' +
          '<span class="tc-meta">CVC ' + LX.esc(c.cvc) + ' · Exp ' + LX.esc(c.exp) + '</span>' +
          '<span class="tc-copy">📋</span>' +
          '</button>';
      }).join('') +
      '</div>' +
      '<button class="btn btn-ghost btn-sm" id="devAutofill" style="margin-top:.95rem">Autofill payment form</button>' +
      '<div class="field-msg" id="devCardMsg" style="margin-top:.65rem"></div>' +
      '</div>' +

      /* ── TOGGLES ── */
      '<div class="panel">' +
      '<h4 class="dev-sec">▸ Toggles</h4>' +
      devToggle('instantPayment', 'Instant payment (skip delays)', dev.instantPayment) +
      devToggle('skipCaptcha', 'Skip captcha', dev.skipCaptcha) +
      devToggle('showValidationDebug', 'Show validation debug', dev.showValidationDebug) +
      devToggle('slowNetwork', 'Simulate slow network (×4)', dev.slowNetwork) +
      '</div>' +

      /* ── VALIDATOR PLAYGROUND ── */
      '<div class="panel dev-wide">' +
      '<h4 class="dev-sec">▸ Validator playground</h4>' +

      '<div class="dev-play">' +
      '<div class="field"><label class="field-label" for="dpCard">Card number</label>' +
      '<input class="input" id="dpCard" type="text" inputmode="numeric" placeholder="4242 4242 4242 4242">' +
      '<div class="dev-out" id="dpCardOut"></div></div>' +

      '<div class="field"><label class="field-label" for="dpEmail">Email</label>' +
      '<input class="input" id="dpEmail" type="text" placeholder="vimukthi@gmail.com">' +
      '<div class="dev-out" id="dpEmailOut"></div></div>' +

      '<div class="field"><label class="field-label" for="dpPw">Password</label>' +
      '<input class="input" id="dpPw" type="text" placeholder="Try something weak">' +
      '<div class="dev-out" id="dpPwOut"></div></div>' +

      '<div class="field"><label class="field-label" for="dpLookup">Address lookup</label>' +
      '<input class="input" id="dpLookup" type="text" placeholder="Minuwangoda">' +
      '<div class="dev-out" id="dpLookupOut"></div></div>' +

      '<div class="field"><label class="field-label">Delivery quote</label>' +
      '<div class="cf-row">' +
      '<select class="select" id="dpZoneDistrict">' +
      LX.SL.districts.map(function (d) {
        return '<option value="' + d.id + '">' + LX.esc(d.name) + '</option>';
      }).join('') + '</select>' +
      '<select class="select" id="dpZoneMethod">' +
      '<option value="standard">Standard</option><option value="express">Express</option></select>' +
      '<select class="select" id="dpZoneCod">' +
      '<option value="card">Card</option><option value="cod">Cash on delivery</option></select>' +
      '</div>' +
      '<div class="dev-out" id="dpZoneOut"></div></div>' +
      '</div>' +
      '</div>' +

      /* ── INSPECTOR ── */
      '<div class="panel dev-wide">' +
      '<h4 class="dev-sec">▸ Inspector</h4>' +
      '<div class="row wrap" style="gap:.55rem;margin-bottom:1rem">' +
      ['users', 'orders', 'cart', 'session', 'payments', 'checkout', 'prefs'].map(function (k) {
        return '<button class="chip" data-inspect="' + k + '">' + LX.titleCase(k) + '</button>';
      }).join('') +
      '</div>' +
      '<pre class="json-view" id="jsonView">Select a key above to inspect its stored value.</pre>' +
      '</div>' +

      '</section>';
  }

  function devToggle(key, label, checked) {
    return '<label class="check" style="margin:.55rem 0">' +
      '<input type="checkbox" data-dev-toggle="' + key + '"' + (checked ? ' checked' : '') + '>' +
      '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>' + LX.esc(label) + '</span></label>';
  }

  function out(rows) {
    return rows.map(function (r) {
      return '<div class="dev-line"><span>' + r[0] + '</span><b>' + r[1] + '</b></div>';
    }).join('');
  }

  function mountDev(root) {
    /* ── Data actions ─────────────────────────────────── */
    var msg = $('#devDataMsg', root);

    $('#devExport', root).addEventListener('click', function () {
      var json = LX.DB.exportJSON();
      LX.copyText(json).then(function () {
        msg.textContent = 'Full JSON backup copied to clipboard.';
        msg.className = 'field-msg success';
      });
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'luxe-intimo-dev-export.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    });

    $('#devImport', root).addEventListener('click', function () {
      $('#devImportFile', root).click();
    });

    $('#devImportFile', root).addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var res = LX.DB.importJSON(String(reader.result));
        msg.textContent = res.ok ? 'Imported ' + res.count + ' keys.' : res.error;
        msg.className = 'field-msg ' + (res.ok ? 'success' : 'error');
        if (res.ok) setTimeout(function () { LX.Router.render(); }, 600);
      };
      reader.readAsText(file);
    });

    $('#devReseed', root).addEventListener('click', function () {
      LX.UI.confirm({
        title: 'Reseed products?',
        message: 'This resets the product catalogue and reviews to their defaults. Your account and orders are kept.',
        confirmLabel: 'Reseed',
        onConfirm: function () {
          LX.DB.remove('reviews');
          LX.DB.remove('products');
          msg.textContent = 'Catalogue reseeded.';
          msg.className = 'field-msg success';
          LX.UI.toast({ type: 'success', message: 'Products reseeded.' });
        }
      });
    });

    $('#devReset', root).addEventListener('click', function () {
      LX.UI.confirm({
        title: 'Reset everything?',
        message: 'All local data — accounts, orders, bag, wishlist and settings — will be deleted.',
        confirmLabel: 'Reset all data', danger: true,
        onConfirm: function () { LX.DB.clearAll(); global.location.reload(); }
      });
    });

    /* ── Test cards ───────────────────────────────────── */
    var cardMsg = $('#devCardMsg', root);
    $$('[data-card]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var c = LX.Card.TEST_CARDS[parseInt(btn.getAttribute('data-card'), 10)];
        LX.copyText(c.number).then(function () {
          cardMsg.textContent = c.label + ' — ' + c.number + ' copied to clipboard.';
          cardMsg.className = 'field-msg success';
        });
      });
    });

    $('#devAutofill', root).addEventListener('click', function () {
      LX.DB.set('dev_autofill', { at: Date.now(), card: LX.Card.TEST_CARDS[0] });
      cardMsg.textContent = 'Opening the payment form…';
      cardMsg.className = 'field-msg hint';

      var pending = LX.DB.get('pending_order');
      if (pending) {
        LX.Router.go('#/pay');
      } else if (!LX.Cart.isEmpty()) {
        LX.Router.go('#/checkout');
      } else {
        cardMsg.textContent = 'Add something to your bag first, then place an order to reach the payment page.';
        cardMsg.className = 'field-msg warn';
      }
    });

    /* ── Toggles ──────────────────────────────────────── */
    $$('[data-dev-toggle]', root).forEach(function (input) {
      input.addEventListener('change', function () {
        var dev = LX.Store.get('dev') || {};
        dev[input.getAttribute('data-dev-toggle')] = input.checked;
        LX.Store.set('dev', dev, undefined, { immediate: true });
        LX.UI.toast({
          type: 'info', message: input.getAttribute('data-dev-toggle') + ' → ' + (input.checked ? 'on' : 'off')
        });
      });
    });

    /* ── Validator playground ─────────────────────────── */
    var dpCard = $('#dpCard', root), dpCardOut = $('#dpCardOut', root);
    var dpEmail = $('#dpEmail', root), dpEmailOut = $('#dpEmailOut', root);
    var dpPw = $('#dpPw', root), dpPwOut = $('#dpPwOut', root);
    var dpLookup = $('#dpLookup', root), dpLookupOut = $('#dpLookupOut', root);

    if (dpCard) {
      dpCard.addEventListener('input', function () {
        var digits = dpCard.value.replace(/\D/g, '');
        dpCard.value = LX.Card.group(digits, LX.Card.detect(digits).brand);
        var r = LX.Card.validateNumber(digits);
        var spec = LX.Card.cvcSpec(r.brand);
        dpCardOut.innerHTML = out([
          ['Brand', r.brand ? LX.esc(r.label) : '<span class="muted">unknown</span>'],
          ['Length', (r.digits ? r.digits.length : 0) + ' / ' + (r.config ? r.config.primary : '—') + (r.lengthOk ? ' <span class="ok-t">✓</span>' : '')],
          ['Luhn', r.luhnOk ? '<span class="ok-t">✓ pass</span>' : (digits.length >= 12 ? '<span class="err-t">✗ fail</span>' : '<span class="muted">—</span>')],
          ['CVC required', String(spec.len) + ' (' + spec.label + ')'],
          ['Grouping', spec.groups.join('-')]
        ]);
      });
    }

    if (dpEmail) {
      dpEmail.addEventListener('input', function () {
        var r = LX.Email.validate(dpEmail.value);
        dpEmailOut.innerHTML = out([
          ['Syntax', r.code !== 'syntax' && r.code !== 'no_at' && r.code !== 'many_at' && r.code !== 'local_chars' && r.code !== 'domain_chars' ? '<span class="ok-t">✓</span>' : '<span class="err-t">✗</span>'],
          ['Disposable', r.code === 'disposable' ? '<span class="err-t">✗ blocked</span>' : '<span class="ok-t">✓ clean</span>'],
          ['Provider', r.ok ? '<span class="ok-t">✓ ' + LX.esc(r.providerLabel) + '</span>' : '<span class="muted">' + LX.esc(r.message) + '</span>'],
          ['Canonical', r.canonical ? '<b>' + LX.esc(r.canonical) + '</b>' : '<span class="muted">—</span>'],
          ['Display', r.display ? LX.esc(r.display) : '<span class="muted">—</span>']
        ]);
      });
    }

    if (dpPw) {
      dpPw.addEventListener('input', function () {
        var r = LX.V.password(dpPw.value, {});
        dpPwOut.innerHTML = out([
          ['Score', r.score.score + ' · <b style="color:' + r.score.color + '">' + r.score.label + '</b>'],
          ['Length', (r.checks.length.ok ? '<span class="ok-t">✓</span>' : '<span class="err-t">✗</span>') + ' ' + dpPw.value.length],
          ['Upper / Lower / Digit', ['uppercase', 'lowercase', 'digit'].map(function (k) {
            return r.checks[k].ok ? '<span class="ok-t">✓</span>' : '<span class="err-t">✗</span>';
          }).join(' ')],
          ['Symbol (bonus)', r.checks.symbol.ok ? '<span class="ok-t">✓</span>' : '<span class="muted">—</span>'],
          ['Blocked list', r.checks.notcommon.ok ? '<span class="ok-t">✓ clean</span>' : '<span class="err-t">✗ common</span>']
        ]);
      });
    }

    if (dpLookup) {
      dpLookup.addEventListener('input', function () {
        var res = LX.SL.search(dpLookup.value);
        dpLookupOut.innerHTML = res.length
          ? res.map(function (r) {
            return '<div class="dev-line"><span>' + LX.esc(r.area || r.division) + '</span>' +
              '<b>' + LX.esc(r.zip) + ' · ' + LX.esc(r.district) + ' · Zone ' + r.zone + (r.note ? ' (' + LX.esc(r.note) + ')' : '') + '</b></div>';
          }).join('')
          : '<div class="muted tiny">No matches.</div>';
      });
    }

    /* ── Delivery quote ───────────────────────────────── */
    function refreshQuote() {
      var d = $('#dpZoneDistrict', root).value;
      var m = $('#dpZoneMethod', root).value;
      var p = $('#dpZoneCod', root).value;
      var q = LX.SL.quote({ districtId: d, afterDiscounts: 300000, deliveryMethod: m, paymentMethod: p });
      var eta = LX.SL.eta(m);
      $('#dpZoneOut', root).innerHTML = out([
        ['Zone', q.zone + ' — ' + LX.esc(q.zoneName)],
        ['Delivery fee', q.deliveryFee === 0 ? 'FREE' : LX.money(q.deliveryFee)],
        ['COD fee', q.codFee ? LX.money(q.codFee) : '—'],
        ['Total', LX.money(q.total)],
        ['ETA', LX.fmtDateShort(eta.from) + ' – ' + LX.fmtDateShort(eta.to)]
      ]);
    }
    ['dpZoneDistrict', 'dpZoneMethod', 'dpZoneCod'].forEach(function (id) {
      var el = $('#' + id, root);
      if (el) el.addEventListener('change', refreshQuote);
    });
    refreshQuote();

    /* ── Inspector ────────────────────────────────────── */
    var view = $('#jsonView', root);
    $$('[data-inspect]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-inspect');
        var value = LX.DB.get(key);
        $$('[data-inspect]', root).forEach(function (b) { b.classList.toggle('active-gold', b === btn); });
        try {
          view.textContent = JSON.stringify(value, null, 2);
        } catch (e) {
          view.textContent = String(value);
        }
      });
    });
  }

  LX.Pages.dev = { title: 'Dev Tools', render: renderDev, mount: mountDev };
})(window);