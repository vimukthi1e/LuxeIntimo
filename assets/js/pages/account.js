/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/account.js
   Overview · Orders · Addresses · Settings · Wishlist
   (blueprint §10.6 routes)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  function accountNav(active) {
    var links = [
      ['#/account', 'account', 'Overview'],
      ['#/orders', 'orders', 'Orders'],
      ['#/addresses', 'addresses', 'Addresses'],
      ['#/settings', 'settings', 'Settings'],
      ['#/wishlist', 'wishlist', 'Wishlist']
    ];
    return '<nav class="acct-nav">' + links.map(function (l) {
      return '<a href="' + l[0] + '" class="' + (active === l[1] ? 'active' : '') + '">' + l[2] + '</a>';
    }).join('') + '</nav>';
  }

  function statusBadge(status) {
    var meta = LX.Order.STATUS_META[status] || { label: status, tone: 'dim' };
    return '<span class="badge badge-' + meta.tone + '">' + LX.esc(meta.label) + '</span>';
  }

  function orderCard(o) {
    return '<a class="order-card" href="#/order/' + LX.esc(o.orderNumber) + '">' +
      '<div class="row-between">' +
      '<div>' +
      '<p class="label">' + LX.esc(o.orderNumber) + '</p>' +
      '<p class="small muted">' + LX.fmtDate(o.createdAt) + ' · ' + o.items.length + ' item' + (o.items.length === 1 ? '' : 's') + '</p>' +
      '</div>' +
      statusBadge(o.status) +
      '</div>' +
      '<div class="order-thumbs">' +
      o.items.slice(0, 5).map(function (l) {
        return '<img src="' + LX.esc(l.image) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'LX\')">';
      }).join('') +
      '</div>' +
      '<div class="row-between">' +
      '<span class="muted small">' + (o.paymentStatus === 'paid' ? 'Paid' : (o.paymentMethod === 'cod' ? 'Cash on delivery' : 'Awaiting payment')) + '</span>' +
      '<b>' + LX.money(o.total) + '</b>' +
      '</div>' +
      '</a>';
  }

  /* ═══ OVERVIEW ═════════════════════════════════════════ */
  function renderAccount() {
    var u = LX.Auth.currentUser();
    if (!u) return '';
    var orders = LX.Order.forUser(u.id);
    var defaultAddr = (u.addresses || []).filter(function (a) { return a.isDefault; })[0] || (u.addresses || [])[0];
    var spent = LX.sum(orders, 'total');

    return '<section class="container page-head">' +
      '<p class="label label-gold">Welcome back</p>' +
      '<h1 class="h-serif">' + LX.esc(u.name) + '</h1>' +
      '<p class="muted">' + LX.esc(u.email) + '</p>' +
      '</section>' +

      '<section class="container acct-layout">' +
      '<aside class="acct-side">' + accountNav('account') +
      '<button class="btn btn-ghost btn-block btn-sm" id="acctLogout">Sign out</button>' +
      '</aside>' +

      '<div class="acct-main">' +
      '<div class="stat-grid">' +
      '<div class="panel stat"><p class="label">Orders</p><p class="price-lg">' + orders.length + '</p></div>' +
      '<div class="panel stat"><p class="label">Total spent</p><p class="price-lg">' + LX.money(spent) + '</p></div>' +
      '<div class="panel stat"><p class="label">Saved items</p><p class="price-lg">' + (LX.Store.get('wishlist') || []).length + '</p></div>' +
      '<div class="panel stat"><p class="label">Member since</p><p class="small" style="margin-top:.35rem">' + LX.fmtDate(u.createdAt) + '</p></div>' +
      '</div>' +

      '<div class="panel" style="margin-top:1.35rem">' +
      '<div class="row-between"><h3 class="h-serif">Default address</h3>' +
      '<a class="btn-link" href="#/addresses">Manage</a></div>' +
      (defaultAddr
        ? '<div class="addr-card" style="margin-top:.85rem">' +
        '<p><b>' + LX.esc(defaultAddr.name) + '</b> <span class="badge badge-dim">' + LX.esc(defaultAddr.label) + '</span></p>' +
        '<p class="muted small">' + LX.esc(defaultAddr.line1) + (defaultAddr.line2 ? ', ' + LX.esc(defaultAddr.line2) : '') + '</p>' +
        '<p class="muted small">' + LX.esc(defaultAddr.divisionName) + ', ' + LX.esc(defaultAddr.districtName) + ' ' + LX.esc(defaultAddr.postal) + '</p>' +
        '<p class="muted small">Sri Lanka</p>' +
        '</div>'
        : '<div class="empty" style="padding:2rem 1rem"><p class="muted">No addresses saved yet.</p>' +
        '<a class="btn btn-ghost btn-sm" href="#/addresses">Add an address</a></div>') +
      '</div>' +

      '<div class="panel" style="margin-top:1.35rem">' +
      '<div class="row-between"><h3 class="h-serif">Recent orders</h3>' +
      '<a class="btn-link" href="#/orders">View all</a></div>' +
      (orders.length
        ? '<div class="order-list" style="margin-top:.85rem">' + orders.slice(0, 3).map(orderCard).join('') + '</div>'
        : '<div class="empty" style="padding:2rem 1rem"><p class="muted">You haven’t placed any orders yet.</p>' +
        '<a class="btn btn-gold btn-sm" href="#/shop">Start shopping</a></div>') +
      '</div>' +
      '</div>' +
      '</section>';
  }

  function mountAccount(root) {
    var out = $('#acctLogout', root);
    if (out) out.addEventListener('click', function () {
      LX.UI.confirm({
        title: 'Sign out?',
        message: 'You’ll need to sign in again to see your orders.',
        confirmLabel: 'Sign out',
        onConfirm: function () {
          LX.Auth.logout();
          LX.UI.toast({ type: 'info', message: 'You’ve been signed out.' });
          LX.Router.go('#/');
        }
      });
    });
  }

  /* ═══ ORDERS ═══════════════════════════════════════════ */
  function renderOrders() {
    var u = LX.Auth.currentUser();
    var orders = LX.Order.forUser(u.id);

    return '<section class="container page-head">' +
      '<p class="label label-gold">Your account</p>' +
      '<h1 class="h-serif">Order History</h1>' +
      '<p class="muted">' + orders.length + ' order' + (orders.length === 1 ? '' : 's') + '</p>' +
      '</section>' +

      '<section class="container acct-layout">' +
      '<aside class="acct-side">' + accountNav('orders') + '</aside>' +
      '<div class="acct-main">' +
      (orders.length
        ? '<div class="order-list">' + orders.map(orderCard).join('') + '</div>'
        : '<div class="empty">' +
        '<div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><rect x="4" y="6" width="16" height="13" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
        '</div>' +
        '<h3>No orders yet</h3><p>When you place an order it will appear here.</p>' +
        '<a class="btn btn-gold" href="#/shop">Browse the collection</a></div>') +
      '</div></section>';
  }

  /* ═══ ADDRESSES ════════════════════════════════════════ */
  function renderAddresses() {
    var u = LX.Auth.currentUser();
    var list = u.addresses || [];

    return '<section class="container page-head">' +
      '<p class="label label-gold">Your account</p>' +
      '<h1 class="h-serif">Addresses</h1>' +
      '<p class="muted">Saved delivery addresses for faster checkout.</p>' +
      '</section>' +

      '<section class="container acct-layout">' +
      '<aside class="acct-side">' + accountNav('addresses') + '</aside>' +
      '<div class="acct-main">' +
      '<div class="row-between" style="margin-bottom:1.15rem">' +
      '<h3 class="h-serif" style="margin:0">' + list.length + ' saved</h3>' +
      '<button class="btn btn-gold btn-sm" id="addAddress">+ Add address</button>' +
      '</div>' +
      (list.length
        ? '<div class="addr-grid">' + list.map(function (a) {
          return '<div class="panel addr-card">' +
            '<div class="row-between"><b>' + LX.esc(a.name) + '</b>' +
            '<span class="badge ' + (a.isDefault ? 'badge-gold' : 'badge-dim') + '">' + (a.isDefault ? 'Default' : LX.esc(a.label)) + '</span></div>' +
            '<p class="muted small" style="margin-top:.55rem">' + LX.esc(a.line1) + (a.line2 ? ', ' + LX.esc(a.line2) : '') + '</p>' +
            (a.area ? '<p class="muted small">' + LX.esc(a.area) + '</p>' : '') +
            '<p class="muted small">' + LX.esc(a.divisionName) + ', ' + LX.esc(a.districtName) + ' ' + LX.esc(a.postal) + '</p>' +
            '<p class="muted small">🇱🇰 Sri Lanka' + (a.phone ? ' · ' + LX.esc(a.phone) : '') + '</p>' +
            '<div class="row wrap" style="gap:.5rem;margin-top:.95rem">' +
            '<button class="btn btn-ghost btn-sm" data-edit="' + LX.esc(a.id) + '">Edit</button>' +
            (!a.isDefault ? '<button class="btn btn-quiet btn-sm" data-default="' + LX.esc(a.id) + '">Set default</button>' : '') +
            '<button class="btn btn-danger btn-sm" data-delete="' + LX.esc(a.id) + '">Delete</button>' +
            '</div>' +
            '</div>';
        }).join('') + '</div>'
        : '<div class="empty"><div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="10" r="2.6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
        '</div><h3>No addresses yet</h3><p>Save an address to check out faster.</p>' +
        '<button class="btn btn-gold" id="addAddressEmpty">Add address</button></div>') +
      '</div></section>';
  }

  /* Address modal (district cascade) */
  function addressModal(existing, onSave) {
    var a = existing || {
      label: 'Home', name: (LX.Auth.currentUser() || {}).name || '',
      line1: '', line2: '', districtId: 'colombo', divisionCode: '',
      area: '', postal: '', phone: (LX.Auth.currentUser() || {}).phone || ''
    };

    function divisionOptions(districtId, selected) {
      return '<option value="">Select city / area…</option>' +
        LX.SL.divisions(districtId).map(function (v) {
          return '<option value="' + LX.esc(v.code) + '"' + (selected === v.code ? ' selected' : '') + '>' +
            LX.esc(v.name) + (v.nameSi ? ' (' + v.nameSi + ')' : '') + '</option>';
        }).join('');
    }

    function areaOptions(districtId, code, selected) {
      var d = LX.SL.division(districtId, code);
      if (!d) return '<option value="">Select sub-area…</option>';
      return '<option value="">Select sub-area (optional)…</option>' +
        d.areas.map(function (x) {
          return '<option value="' + LX.esc(x.name) + '"' + (selected === x.name ? ' selected' : '') + '>' +
            LX.esc(x.name) + ' · ' + LX.esc(x.zip) + '</option>';
        }).join('');
    }

    var bodyHTML =
      '<div class="addr-form">' +
      '<div class="field"><label class="field-label" for="adLabel">Label</label>' +
      '<select class="select" id="adLabel">' +
      ['Home', 'Office', 'Other'].map(function (l) {
        return '<option' + (a.label === l ? ' selected' : '') + '>' + l + '</option>';
      }).join('') + '</select></div>' +

      '<div class="field"><label class="field-label" for="adName">Recipient name</label>' +
      '<input class="input" id="adName" type="text" value="' + LX.esc(a.name) + '" placeholder="Full name"></div>' +

      '<div class="field"><label class="field-label" for="adPhone">Mobile number</label>' +
      '<div class="input-wrap has-prefix"><span class="input-prefix">🇱🇰 +94</span>' +
      '<input class="input" id="adPhone" type="tel" inputmode="numeric" maxlength="12" value="' + LX.esc(LX.V.formatPhoneInput(a.phone)) + '" placeholder="77 123 4567"></div>' +
      '<div class="field-msg" id="adPhoneMsg"></div></div>' +

      '<div class="field"><label class="field-label" for="adLine1">Address line 1 <span class="req">*</span></label>' +
      '<input class="input" id="adLine1" type="text" value="' + LX.esc(a.line1) + '" placeholder="House no. and street">' +
      '<div class="field-msg" id="adLine1Msg"></div></div>' +

      '<div class="field"><label class="field-label" for="adLine2">Address line 2 <span class="muted">(optional)</span></label>' +
      '<input class="input" id="adLine2" type="text" value="' + LX.esc(a.line2) + '" placeholder="Apartment, landmark"></div>' +

      '<div class="cf-row">' +
      '<div class="field"><label class="field-label" for="adDistrict">District <span class="req">*</span></label>' +
      '<select class="select" id="adDistrict">' +
      LX.SL.districts.map(function (d) {
        return '<option value="' + d.id + '"' + (a.districtId === d.id ? ' selected' : '') + '>' +
          LX.esc(d.name) + (d.nameSi ? ' (' + d.nameSi + ')' : '') + '</option>';
      }).join('') + '</select>' +
      '<div class="field-msg" id="adDistrictMsg"></div></div>' +

      '<div class="field"><label class="field-label" for="adDivision">City / area <span class="req">*</span></label>' +
      '<select class="select" id="adDivision">' + divisionOptions(a.districtId, a.divisionCode) + '</select>' +
      '<div class="field-msg" id="adDivisionMsg"></div></div>' +
      '</div>' +

      '<div class="cf-row">' +
      '<div class="field"><label class="field-label" for="adArea">Sub-area <span class="muted">(optional)</span></label>' +
      '<select class="select" id="adArea">' + areaOptions(a.districtId, a.divisionCode, a.area) + '</select></div>' +

      '<div class="field"><label class="field-label" for="adPostal">Postal code <span class="req">*</span></label>' +
      '<input class="input" id="adPostal" type="text" inputmode="numeric" maxlength="5" value="' + LX.esc(a.postal) + '" placeholder="11550">' +
      '<div class="field-msg" id="adPostalMsg"></div></div>' +
      '</div>' +

      '<div class="field"><label class="field-label" for="adCountry">Country</label>' +
      '<div class="cf-country" id="adCountry"><span class="cf-flag">🇱🇰</span>' +
      '<span class="cf-country-name">Sri Lanka</span>' +
      '<svg class="cf-lock" viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></div></div>' +

      (existing ? '' :
        '<label class="check"><input type="checkbox" id="adDefault" checked>' +
        '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '<span>Set as default address</span></label>') +
      '</div>';

    LX.UI.openModal({
      title: existing ? 'Edit address' : 'Add a new address',
      body: bodyHTML,
      actions: [
        { label: 'Cancel', variant: 'btn-ghost', onClick: function (c) { c(); } },
        {
          label: 'Save address', variant: 'btn-gold',
          onClick: function (close) {
            var payload = readForm();
            var res = LX.Auth.saveAddress(payload, payload.isDefault);
            if (!res.ok) {
              paintErrors(res.errors || {});
              LX.UI.toast({ type: 'error', title: 'Check the form', message: 'Some fields need attention.' });
              return;
            }
            close();
            LX.UI.toast({ type: 'success', message: res.message });
            if (onSave) onSave(res.address);
            LX.Router.render();
          }
        }
      ],
      onMount: function (body) {
        var district = $('#adDistrict', body);
        var division = $('#adDivision', body);
        var area = $('#adArea', body);
        var postal = $('#adPostal', body);

        district.addEventListener('change', function () {
          division.innerHTML = divisionOptions(district.value, '');
          area.innerHTML = areaOptions(district.value, '', '');
          postal.value = '';
          postal.dispatchEvent(new Event('input'));
        });

        division.addEventListener('change', function () {
          var d = LX.SL.division(district.value, division.value);
          area.innerHTML = areaOptions(district.value, division.value, '');
          if (d) {
            postal.value = d.zip;
            var msg = $('#adPostalMsg', body);
            if (d.postalVia) {
              msg.textContent = 'Postal code ' + d.zip + ' (via ' + d.postalVia + ' post office)';
              msg.className = 'field-msg hint';
            } else {
              LX.CardForm.showOk(postal, msg, 'Postal code auto-filled');
            }
          }
        });

        area.addEventListener('change', function () {
          var d = LX.SL.division(district.value, division.value);
          if (!d) return;
          var chosen = null;
          d.areas.forEach(function (x) { if (x.name === area.value) chosen = x; });
          if (chosen) {
            postal.value = chosen.zip;
            var msg = $('#adPostalMsg', body);
            LX.CardForm.showOk(postal, msg, 'Postal code updated from ' + chosen.name);
          }
        });

        var phoneInput = $('#adPhone', body);
        phoneInput.addEventListener('input', function () {
          phoneInput.value = LX.V.formatPhoneInput(phoneInput.value);
        });

        postal.addEventListener('input', function () {
          postal.value = postal.value.replace(/\D/g, '').slice(0, 5);
        });
        postal.addEventListener('blur', function () {
          var r = LX.V.postal(postal.value);
          var msg = $('#adPostalMsg', body);
          if (!r.ok) LX.CardForm.showError(postal, msg, r.message);
          else LX.CardForm.showOk(postal, msg);
        });

        function readForm() {
          return {
            id: existing ? existing.id : undefined,
            label: $('#adLabel', body).value,
            name: $('#adName', body).value,
            phone: $('#adPhone', body).value,
            line1: $('#adLine1', body).value,
            line2: $('#adLine2', body).value,
            districtId: district.value,
            divisionCode: division.value,
            area: area.value,
            postal: postal.value,
            isDefault: existing ? existing.isDefault : ($('#adDefault', body) ? $('#adDefault', body).checked : true)
          };
        }

        function paintErrors(errors) {
          Object.keys(errors).forEach(function (k) {
            var map = {
              line1: ['#adLine1', '#adLine1Msg'], postal: ['#adPostal', '#adPostalMsg'],
              districtId: ['#adDistrict', '#adDistrictMsg'], divisionCode: ['#adDivision', '#adDivisionMsg'],
              phone: ['#adPhone', '#adPhoneMsg']
            };
            if (!map[k]) return;
            var input = $(map[k][0], body), msg = $(map[k][1], body);
            if (input && msg) LX.CardForm.showError(input, msg, errors[k]);
          });
        }
      }
    });
  }

  function mountAddresses(root) {
    function openNew() { addressModal(null); }
    var btn = $('#addAddress', root), btnEmpty = $('#addAddressEmpty', root);
    if (btn) btn.addEventListener('click', openNew);
    if (btnEmpty) btnEmpty.addEventListener('click', openNew);

    var u = LX.Auth.currentUser();

    $$('[data-edit]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-edit');
        (u.addresses || []).forEach(function (a) { if (a.id === id) addressModal(a); });
      });
    });

    $$('[data-default]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        LX.Auth.setDefaultAddress(b.getAttribute('data-default'));
        LX.UI.toast({ type: 'success', message: 'Default address updated.' });
        LX.Router.render();
      });
    });

    $$('[data-delete]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        LX.UI.confirm({
          title: 'Delete this address?',
          message: 'This can’t be undone.',
          confirmLabel: 'Delete', danger: true,
          onConfirm: function () {
            LX.Auth.deleteAddress(b.getAttribute('data-delete'));
            LX.UI.toast({ type: 'info', message: 'Address removed.' });
            LX.Router.render();
          }
        });
      });
    });
  }

  /* ═══ SETTINGS ═════════════════════════════════════════ */
  function renderSettings() {
    var u = LX.Auth.currentUser();
    var cards = u.savedCards || [];

    return '<section class="container page-head">' +
      '<p class="label label-gold">Your account</p>' +
      '<h1 class="h-serif">Settings</h1>' +
      '</section>' +

      '<section class="container acct-layout">' +
      '<aside class="acct-side">' + accountNav('settings') + '</aside>' +
      '<div class="acct-main">' +

      /* Profile */
      '<div class="panel">' +
      '<h3 class="h-serif">Profile</h3>' +
      '<form id="profileForm">' +
      '<div class="field"><label class="field-label" for="stName">Full name</label>' +
      '<input class="input" id="stName" type="text" value="' + LX.esc(u.name) + '">' +
      '<div class="field-msg" id="stNameMsg"></div></div>' +
      '<div class="field"><label class="field-label" for="stEmail">Email</label>' +
      '<input class="input" id="stEmail" type="email" value="' + LX.esc(u.email) + '" disabled>' +
      '<div class="field-msg hint">Your sign-in email can’t be changed in this demo.</div></div>' +
      '<div class="field"><label class="field-label" for="stPhone">Mobile number</label>' +
      '<div class="input-wrap has-prefix"><span class="input-prefix">🇱🇰 +94</span>' +
      '<input class="input" id="stPhone" type="tel" inputmode="numeric" maxlength="12" value="' + LX.esc(LX.V.formatPhoneInput(u.phone)) + '"></div>' +
      '<div class="field-msg" id="stPhoneMsg"></div></div>' +
      '<button class="btn btn-gold" type="submit">Save changes</button>' +
      '</form>' +
      '</div>' +

      /* Password */
      '<div class="panel" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Change password</h3>' +
      '<form id="pwForm">' +
      passwordFieldLocal('stCurrent', 'Current password', 'current-password') +
      passwordFieldLocal('stNew', 'New password', 'new-password') +
      rulesHTMLLocal() +
      passwordFieldLocal('stConfirm', 'Confirm new password', 'new-password') +
      '<button class="btn btn-gold" type="submit">Update password</button>' +
      '</form>' +
      '</div>' +

      /* Saved cards */
      '<div class="panel" style="margin-top:1.35rem">' +
      '<div class="row-between"><h3 class="h-serif">Saved cards</h3>' +
      '<span class="muted tiny">Only brand + last 4 are stored</span></div>' +
      (cards.length
        ? '<div class="card-list">' + cards.map(function (c) {
          return '<div class="list-row">' +
            '<div class="grow"><b>' + LX.esc(LX.Payment.brandLabel(c.brand)) + '</b>' +
            '<div class="muted small">•••• •••• •••• ' + LX.esc(c.last4) + ' · exp ' + LX.pad(c.expMonth) + '/' + String(c.expYear).slice(-2) + '</div>' +
            '<div class="muted tiny">' + LX.esc(c.nickname) + '</div></div>' +
            (c.isDefault ? '<span class="badge badge-gold">Default</span>' :
              '<button class="btn btn-quiet btn-sm" data-card-default="' + LX.esc(c.token) + '">Set default</button>') +
            '<button class="btn btn-danger btn-sm" data-card-delete="' + LX.esc(c.token) + '">Remove</button>' +
            '</div>';
        }).join('') + '</div>'
        : '<p class="muted small" style="margin-top:.65rem">No saved cards. Tick “Save my card” on the payment page to store one securely.</p>') +
      '</div>' +

      /* Security */
      '<div class="panel" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Security</h3>' +
      '<div class="kv"><span class="k">Password algorithm</span><span class="v">' +
      (LX.CRYPTO.mode === 'fallback' ? 'Iterated SHA-256 (reduced)' : 'PBKDF2-SHA256') + '</span></div>' +
      '<div class="kv"><span class="k">Iterations</span><span class="v">' +
      (LX.CRYPTO.mode === 'fallback' ? LX.CRYPTO.fallbackRounds.toLocaleString() : LX.CRYPTO.iterations.toLocaleString()) + '</span></div>' +
      '<div class="kv"><span class="k">Session length</span><span class="v">' +
      (LX.Auth.ensureSession() && LX.Auth.ensureSession().remember ? '7 days' : '1 day') + '</span></div>' +
      '<div class="kv"><span class="k">Data storage</span><span class="v">Local browser storage</span></div>' +
      (LX.CRYPTO.mode === 'fallback'
        ? '<div class="inline-note note-warn" style="margin-top:.85rem">WebCrypto is unavailable in this context (likely opened via file://). Hashing has fallen back to a reduced-strength method. For full security, run the site from localhost.</div>'
        : '') +
      '</div>' +

      /* Danger zone */
      '<div class="panel panel-danger" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Danger zone</h3>' +
      '<p class="muted small">Export a backup of all your local data, or reset it entirely.</p>' +
      '<div class="row wrap" style="gap:.65rem;margin-top:.95rem">' +
      '<button class="btn btn-ghost" id="stExport">Export JSON backup</button>' +
      '<button class="btn btn-danger" id="stReset">Reset all local data</button>' +
      '</div>' +
      '</div>' +

      '</div></section>';
  }

  function passwordFieldLocal(id, label, autocomplete) {
    return '<div class="field">' +
      '<label class="field-label" for="' + id + '">' + LX.esc(label) + '</label>' +
      '<div class="input-wrap"><input class="input" id="' + id + '" type="password" autocomplete="' + autocomplete + '">' +
      '<button type="button" class="pw-toggle" data-pw="' + id + '" aria-label="Show password">' +
      '<svg viewBox="0 0 24 24" width="19" height="19"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
      '</button></div>' +
      '<div class="field-msg" id="' + id + 'Msg"></div></div>';
  }
  function rulesHTMLLocal() {
    return '<div class="pw-rules" id="pwRules">' +
      [['length', 'At least 8 characters'], ['uppercase', 'One uppercase (A–Z)'], ['lowercase', 'One lowercase (a–z)'],
      ['digit', 'One number (0–9)'], ['symbol', 'One symbol — bonus']].map(function (r) {
        return '<div class="pw-rule" data-rule="' + r[0] + '"><i class="tick">✓</i><span>' + r[1] + '</span></div>';
      }).join('') + '</div>';
  }

  function mountSettings(root) {
    $$('[data-pw]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-pw'));
        if (!input) return;
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
      });
    });

    /* Profile */
    $('#profileForm', root).addEventListener('submit', function (e) {
      e.preventDefault();
      var res = LX.Auth.updateProfile({
        name: $('#stName', root).value,
        phone: $('#stPhone', root).value
      });
      if (!res.ok) {
        var map = { name: ['#stName', '#stNameMsg'], phone: ['#stPhone', '#stPhoneMsg'] };
        if (map[res.field]) LX.CardForm.showError($(map[res.field][0], root), $(map[res.field][1], root), res.message);
        LX.UI.toast({ type: 'error', message: res.message });
        return;
      }
      LX.UI.toast({ type: 'success', message: res.message });
      LX.Router.render();
    });

    /* Password */
    $('#pwForm', root).addEventListener('submit', function (e) {
      e.preventDefault();
      var cur = $('#stCurrent', root), nw = $('#stNew', root), cf = $('#stConfirm', root);
      if (nw.value !== cf.value) {
        LX.CardForm.showError(cf, $('#stConfirmMsg', root), 'Both passwords must match.');
        return;
      }
      LX.Auth.changePassword(cur.value, nw.value).then(function (res) {
        if (!res.ok) {
          var map = { current: ['#stCurrent', '#stCurrentMsg'], newPassword: ['#stNew', '#stNewMsg'] };
          if (map[res.field]) LX.CardForm.showError($(map[res.field][0], root), $(map[res.field][1], root), res.message);
          LX.UI.toast({ type: 'error', message: res.message });
          return;
        }
        LX.UI.toast({ type: 'success', message: res.message });
        LX.Router.render();
      });
    });

    /* Live rules for new password */
    var rules = $('#pwRules', root);
    var nw = $('#stNew', root);
    if (nw && rules) {
      nw.addEventListener('input', function () {
        var r = LX.V.password(nw.value, {});
        $$('.pw-rule', rules).forEach(function (node) {
          var key = node.getAttribute('data-rule');
          node.classList.toggle('ok', !!r.checks[key].ok);
        });
      });
    }

    /* Cards */
    $$('[data-card-default]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        LX.Auth.setDefaultCard(b.getAttribute('data-card-default'));
        LX.UI.toast({ type: 'success', message: 'Default card updated.' });
        LX.Router.render();
      });
    });
    $$('[data-card-delete]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        LX.UI.confirm({
          title: 'Remove this card?', message: 'The saved card will be deleted from this device.',
          confirmLabel: 'Remove', danger: true,
          onConfirm: function () {
            LX.Auth.deleteCard(b.getAttribute('data-card-delete'));
            LX.UI.toast({ type: 'info', message: 'Card removed.' });
            LX.Router.render();
          }
        });
      });
    });

    /* Danger zone */
    $('#stExport', root).addEventListener('click', function () {
      var json = LX.DB.exportJSON();
      var blob = new Blob([json], { type: 'application/json' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'luxe-intimo-backup-' + new Date().toISOString().slice(0, 10) + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 2000);
      LX.UI.toast({ type: 'success', message: 'Backup downloaded.' });
    });

    $('#stReset', root).addEventListener('click', function () {
      LX.UI.confirm({
        title: 'Reset all local data?',
        message: 'This deletes your account, orders, bag, wishlist and settings from this browser. This cannot be undone.',
        confirmLabel: 'Reset everything', danger: true,
        onConfirm: function () {
          LX.DB.clearAll();
          global.location.reload();
        }
      });
    });
  }

  /* ═══ WISHLIST ═════════════════════════════════════════ */
  function renderWishlist() {
    var ids = LX.Store.get('wishlist') || [];
    var items = ids.map(function (id) { return LX.Catalog.byId(id); }).filter(Boolean);

    return '<section class="container page-head">' +
      '<p class="label label-gold">Saved</p>' +
      '<h1 class="h-serif">Your Wishlist</h1>' +
      '<p class="muted">' + items.length + ' item' + (items.length === 1 ? '' : 's') + '</p>' +
      '</section>' +
      '<section class="container">' +
      (items.length
        ? '<div class="pgrid">' + items.map(function (p) { return LX.ProductCard.render(p); }).join('') + '</div>'
        : '<div class="empty">' +
        '<div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M12 20.5s-7.5-4.7-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5-7.5 9.7-7.5 9.7z" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linejoin="round"/></svg>' +
        '</div>' +
        '<h3>Nothing saved yet</h3>' +
        '<p>Tap the heart on any product to keep it here for later.</p>' +
        '<a class="btn btn-gold" href="#/shop">Discover products</a>' +
        '</div>') +
      '</section>';
  }

  function mountWishlist(root) {
    LX.ProductCard.wire(root);
    LX.UI.observeReveals(root);
  }

  LX.Pages.account = { title: 'My Account', render: renderAccount, mount: mountAccount };
  LX.Pages.orders = { title: 'Orders', render: renderOrders, mount: function () { } };
  LX.Pages.addresses = { title: 'Addresses', render: renderAddresses, mount: mountAddresses };
  LX.Pages.settings = { title: 'Settings', render: renderSettings, mount: mountSettings };
  LX.Pages.wishlist = { title: 'Wishlist', render: renderWishlist, mount: mountWishlist };
  LX.addressModal = addressModal;
})(window);