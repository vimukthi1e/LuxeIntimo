/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/checkout.js
   Step 2 · Contact → Shipping → Delivery → Payment → Review
   (blueprint §8.5 cascade, §8.6 zones, §14)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  /* ── District cascade markup (shared) ────────────────── */
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

  function renderCheckout() {
    if (LX.Cart.isEmpty()) {
      return '<div class="container"><div class="empty">' +
        '<div class="empty-icon">!</div>' +
        '<h3>Your bag is empty</h3>' +
        '<p>Add something to your bag before checking out.</p>' +
        '<a class="btn btn-gold" href="#/shop">Shop the collection</a>' +
        '</div></div>';
    }

    var u = LX.Auth.currentUser();
    var draft = LX.Store.get('checkout') || {};
    var contact = draft.contact || {};
    var saved = (u && u.addresses) || [];
    var t = LX.Cart.totals({ districtId: draft.shipping ? draft.shipping.districtId : undefined });

    return '' +
      '<section class="container page-head">' +
      '<p class="label label-gold">Step 2 of 3</p>' +
      '<h1 class="h-serif">Checkout</h1>' +
      '<div class="steps-bar">' +
      ['Bag', 'Details', 'Payment'].map(function (s, i) {
        return '<div class="step-item' + (i <= 1 ? ' done' : '') + (i === 1 ? ' current' : '') + '"><i>' + (i + 1) + '</i><span>' + s + '</span></div>';
      }).join('') +
      '</div>' +
      '</section>' +

      '<section class="container checkout-layout">' +

      '<form class="checkout-form" id="checkoutForm" novalidate>' +

      /* ── ① CONTACT ── */
      '<div class="panel checkout-section">' +
      '<div class="checkout-head"><i>1</i><h3 class="h-serif">Contact</h3>' +
      (u ? '<span class="badge badge-dim">Signed in</span>' : '<a class="btn-link" href="#/login">Sign in</a>') + '</div>' +

      '<div class="field"><label class="field-label" for="ckName">Full name <span class="req">*</span></label>' +
      '<input class="input" id="ckName" type="text" autocomplete="name" value="' + LX.esc(contact.name || (u ? u.name : '')) + '" placeholder="Nadeesha Perera">' +
      '<div class="field-msg" id="ckNameMsg"></div></div>' +

      '<div class="field"><label class="field-label" for="ckEmail">Email <span class="req">*</span></label>' +
      '<input class="input" id="ckEmail" type="email" inputmode="email" autocomplete="email" value="' + LX.esc(contact.email || (u ? u.email : '')) + '" placeholder="you@gmail.com">' +
      '<div class="field-msg" id="ckEmailMsg"></div></div>' +

      '<div class="field"><label class="field-label" for="ckPhone">Mobile number <span class="req">*</span></label>' +
      '<div class="input-wrap has-prefix"><span class="input-prefix">🇱🇰 +94</span>' +
      '<input class="input" id="ckPhone" type="tel" inputmode="numeric" maxlength="12" autocomplete="tel-national" value="' + LX.esc(LX.V.formatPhoneInput(contact.phone || (u && u.phone) || '')) + '" placeholder="77 123 4567"></div>' +
      '<div class="field-msg hint">+94 is locked · 9 digits starting with 7</div>' +
      '<div class="field-msg" id="ckPhoneMsg"></div></div>' +
      '</div>' +

      /* ── ② SHIPPING ── */
      '<div class="panel checkout-section">' +
      '<div class="checkout-head"><i>2</i><h3 class="h-serif">Shipping address</h3></div>' +

      (saved.length
        ? '<div class="saved-addrs">' + saved.map(function (a, i) {
          return '<label class="radio-row' + (i === 0 ? ' selected' : '') + '" data-saved="' + LX.esc(a.id) + '">' +
            '<input type="radio" name="savedAddr" ' + (i === 0 ? 'checked' : '') + '>' +
            '<span class="dot"></span>' +
            '<span class="grow"><b>' + LX.esc(a.name) + '</b>' +
            (a.isDefault ? ' <span class="badge badge-gold">Default</span>' : '') +
            '<div class="muted small">' + LX.esc(a.line1) + (a.line2 ? ', ' + LX.esc(a.line2) : '') + '</div>' +
            '<div class="muted small">' + LX.esc(a.divisionName) + ', ' + LX.esc(a.districtName) + ' ' + LX.esc(a.postal) + '</div>' +
            '</span></label>';
        }).join('') +
        '<label class="check" style="margin-top:.85rem"><input type="radio" name="savedAddr" id="ckNewAddr">' +
        '<span class="box"></span><span>Use a new address</span></label>' +
        '</div>'
        : '') +

      '<div id="addrFields"' + (saved.length ? ' class="hidden"' : '') + '>' +

      '<div class="field"><label class="field-label" for="ckLine1">Address line 1 <span class="req">*</span></label>' +
      '<input class="input" id="ckLine1" type="text" autocomplete="address-line1" placeholder="House no. and street" value="' + LX.esc(draft.shipping ? draft.shipping.line1 : '') + '">' +
      '<div class="field-msg" id="ckLine1Msg"></div></div>' +

      '<div class="field"><label class="field-label" for="ckLine2">Address line 2 <span class="muted">(optional)</span></label>' +
      '<input class="input" id="ckLine2" type="text" autocomplete="address-line2" placeholder="Apartment, landmark" value="' + LX.esc(draft.shipping ? draft.shipping.line2 : '') + '"></div>' +

      '<div class="cf-row">' +
      '<div class="field"><label class="field-label" for="ckDistrict">District <span class="req">*</span></label>' +
      '<select class="select" id="ckDistrict">' +
      LX.SL.districts.map(function (d) {
        return '<option value="' + d.id + '">' + LX.esc(d.name) + (d.nameSi ? ' (' + d.nameSi + ')' : '') + '</option>';
      }).join('') + '</select></div>' +

      '<div class="field"><label class="field-label" for="ckDivision">City / area <span class="req">*</span></label>' +
      '<select class="select" id="ckDivision">' + divisionOptions('colombo', '') + '</select>' +
      '<div class="field-msg" id="ckDivisionMsg"></div></div>' +
      '</div>' +

      '<div class="cf-row">' +
      '<div class="field"><label class="field-label" for="ckArea">Sub-area <span class="muted">(optional)</span></label>' +
      '<select class="select" id="ckArea">' + areaOptions('colombo', '', '') + '</select></div>' +

      '<div class="field"><label class="field-label" for="ckPostal">Postal code <span class="req">*</span></label>' +
      '<input class="input" id="ckPostal" type="text" inputmode="numeric" maxlength="5" placeholder="11550">' +
      '<div class="field-msg" id="ckPostalMsg"></div></div>' +
      '</div>' +

      '<div class="field"><label class="field-label">Country</label>' +
      '<div class="cf-country"><span class="cf-flag">🇱🇰</span><span class="cf-country-name">Sri Lanka</span>' +
      '<svg class="cf-lock" viewBox="0 0 24 24" width="14" height="14"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></div></div>' +

      (u ? '<label class="check"><input type="checkbox" id="ckSaveAddr" checked>' +
        '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
        '<span>Save this address to my account</span></label>' : '') +

      '</div>' +
      '</div>' +

      /* ── ③ DELIVERY ── */
      '<div class="panel checkout-section">' +
      '<div class="checkout-head"><i>3</i><h3 class="h-serif">Delivery method</h3></div>' +
      '<div class="delivery-opts" id="deliveryOpts">' +
      deliveryOptionHTML('standard', draft.deliveryMethod !== 'express', t) +
      deliveryOptionHTML('express', draft.deliveryMethod === 'express', t) +
      '</div>' +
      '<div class="inline-note note-info" id="etaNote"></div>' +
      '</div>' +

      /* ── ④ PAYMENT ── */
      '<div class="panel checkout-section">' +
      '<div class="checkout-head"><i>4</i><h3 class="h-serif">Payment method</h3></div>' +
      '<div class="delivery-opts" id="paymentOpts">' +
      '<label class="radio-row' + (draft.paymentMethod !== 'cod' ? ' selected' : '') + '" data-payment="card">' +
      '<input type="radio" name="payMethod"' + (draft.paymentMethod !== 'cod' ? ' checked' : '') + '>' +
      '<span class="dot"></span>' +
      '<span class="grow"><b>Card</b>' +
      '<div class="muted small">Visa · Mastercard · American Express</div></span>' +
      '<span class="pay-brands">' + LX.CardForm.brandIcon('visa') + LX.CardForm.brandIcon('mastercard') + LX.CardForm.brandIcon('amex') + '</span>' +
      '</label>' +
      '<label class="radio-row' + (draft.paymentMethod === 'cod' ? ' selected' : '') + '" data-payment="cod">' +
      '<input type="radio" name="payMethod"' + (draft.paymentMethod === 'cod' ? ' checked' : '') + '>' +
      '<span class="dot"></span>' +
      '<span class="grow"><b>Cash on Delivery</b>' +
      '<div class="muted small">+ Rs. 100 handling fee</div></span>' +
      '</label>' +
      '</div>' +
      '</div>' +

      /* ── ⑤ REVIEW ── */
      '<div class="panel checkout-section">' +
      '<div class="checkout-head"><i>5</i><h3 class="h-serif">Review</h3></div>' +
      '<div class="review-items">' +
      LX.Cart.items().map(function (l) {
        return '<div class="list-row">' +
          '<div class="review-thumb"><img src="' + LX.esc(l.image) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'LX\')"></div>' +
          '<div class="grow"><b class="small">' + LX.esc(l.name) + '</b>' +
          '<div class="muted tiny">' + LX.esc(l.size) + ' · ' + LX.esc(l.color) + ' × ' + l.qty + '</div></div>' +
          '<div class="small">' + LX.money(l.unitPrice * l.qty) + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +

      '<label class="check" style="margin-top:1.15rem"><input type="checkbox" id="ckTerms">' +
      '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>I agree to the terms of service and understand this is a demonstration store.</span></label>' +
      '<div class="field-msg" id="ckTermsMsg"></div>' +

      '<button class="btn btn-gold btn-block btn-lg" type="submit" id="ckPlace" style="margin-top:1.15rem">Place Order</button>' +
      '<a class="btn btn-ghost btn-block" href="#/cart">Back to bag</a>' +
      '</div>' +

      '</form>' +

      /* ── SUMMARY ── */
      '<aside class="checkout-summary sticky-panel" id="checkoutSummary">' +
      summaryHTML(t) +
      '</aside>' +

      '</section>';
  }

  function deliveryOptionHTML(method, selected, t) {
    var isStd = method === 'standard';
    var label = isStd ? 'Standard delivery' : 'Express delivery';
    var eta = LX.SL.eta(method);
    var quote = LX.SL.quote({
      districtId: t.districtName ? undefined : undefined,
      afterDiscounts: t.afterDiscounts,
      deliveryMethod: method,
      paymentMethod: t.codFee ? 'cod' : 'card',
      couponFreeShip: t.couponFreeShip
    });
    return '<label class="radio-row' + (selected ? ' selected' : '') + '" data-delivery="' + method + '">' +
      '<input type="radio" name="delivery"' + (selected ? ' checked' : '') + '>' +
      '<span class="dot"></span>' +
      '<span class="grow"><b>' + label + '</b>' +
      '<div class="muted small">' + LX.fmtDateShort(eta.from) + ' – ' + LX.fmtDateShort(eta.to) + '</div></span>' +
      '<b>' + (quote.deliveryFee === 0 ? 'FREE' : LX.money(quote.deliveryFee)) + '</b>' +
      '</label>';
  }

  function summaryHTML(t) {
    return '<div class="panel panel-elevated">' +
      '<h3 class="h-serif">Order Summary</h3>' +
      '<div class="kv"><span class="k">Subtotal</span><span class="v">' + LX.money(t.subtotal) + '</span></div>' +
      (t.comboDiscount ? '<div class="kv"><span class="k">Buy 3 Get 1 Free</span><span class="v" style="color:var(--ok)">−' + LX.money(t.comboDiscount) + '</span></div>' : '') +
      (t.couponDiscount ? '<div class="kv"><span class="k">Coupon ' + LX.esc(t.couponCode) + '</span><span class="v" style="color:var(--ok)">−' + LX.money(t.couponDiscount) + '</span></div>' : '') +
      '<div class="kv"><span class="k">Delivery' + (t.zoneName ? ' · Zone ' + t.zone : '') + '</span><span class="v">' +
      (t.deliveryFee === 0 ? 'FREE' : LX.money(t.deliveryFee)) + '</span></div>' +
      (t.codFee ? '<div class="kv"><span class="k">COD handling</span><span class="v">' + LX.money(t.codFee) + '</span></div>' : '') +
      '<div class="kv kv-total"><span class="k">Total</span><span class="v">' + LX.money(t.total) + '</span></div>' +
      (t.saved > 0 ? '<div class="inline-note note-ok">You’re saving ' + LX.money(t.saved) + '.</div>' : '') +
      '<div class="secure-note">' +
      '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<span class="muted tiny">Discreet packaging on every order</span></div>' +
      '</div>';
  }

  /* ═══ MOUNT ════════════════════════════════════════════ */
  function mountCheckout(root) {
    var draft = LX.Store.get('checkout') || {};
    var u = LX.Auth.currentUser();

    var elName = $('#ckName', root), elEmail = $('#ckEmail', root), elPhone = $('#ckPhone', root);
    var elLine1 = $('#ckLine1', root), elLine2 = $('#ckLine2', root);
    var elDistrict = $('#ckDistrict', root), elDivision = $('#ckDivision', root);
    var elArea = $('#ckArea', root), elPostal = $('#ckPostal', root);
    var addrFields = $('#addrFields', root);

    var selectedSaved = null;
    var deliveryMethod = draft.deliveryMethod || 'standard';
    var paymentMethod = draft.paymentMethod || 'card';

    /* ── Saved address selection ─────────────────────── */
    $$('[data-saved]', root).forEach(function (row) {
      row.addEventListener('click', function () {
        selectedSaved = row.getAttribute('data-saved');
        $$('[data-saved]', root).forEach(function (r) { r.classList.toggle('selected', r === row); });
        if (addrFields) addrFields.classList.add('hidden');
        refreshTotals();
      });
    });
    var newAddrToggle = $('#ckNewAddr', root);
    if (newAddrToggle) {
      newAddrToggle.closest('.check').addEventListener('click', function () {
        setTimeout(function () {
          if (newAddrToggle.checked) {
            selectedSaved = null;
            $$('[data-saved]', root).forEach(function (r) { r.classList.remove('selected'); });
            if (addrFields) addrFields.classList.remove('hidden');
          }
        }, 0);
      });
    }
    if ((u && u.addresses || []).length) {
      var first = (u.addresses || [])[0];
      var def = (u.addresses || []).filter(function (a) { return a.isDefault; })[0] || first;
      selectedSaved = def.id;
    }

    /* ── District cascade ────────────────────────────── */
    if (elDistrict) {
      elDistrict.addEventListener('change', function () {
        elDivision.innerHTML = divisionOptions(elDistrict.value, '');
        elArea.innerHTML = areaOptions(elDistrict.value, '', '');
        elPostal.value = '';
        refreshTotals();
      });
      elDivision.addEventListener('change', function () {
        var d = LX.SL.division(elDistrict.value, elDivision.value);
        elArea.innerHTML = areaOptions(elDistrict.value, elDivision.value, '');
        if (d) {
          elPostal.value = d.zip;
          var msg = $('#ckPostalMsg', root);
          if (d.postalVia) {
            msg.textContent = 'Postal code ' + d.zip + ' (via ' + d.postalVia + ' post office)';
            msg.className = 'field-msg hint';
          } else LX.CardForm.showOk(elPostal, msg, 'Postal code auto-filled');
        }
      });
      elArea.addEventListener('change', function () {
        var d = LX.SL.division(elDistrict.value, elDivision.value);
        if (!d) return;
        d.areas.forEach(function (x) {
          if (x.name === elArea.value) {
            elPostal.value = x.zip;
            LX.CardForm.showOk(elPostal, $('#ckPostalMsg', root), 'Postal code updated from ' + x.name);
          }
        });
      });
      if (elPostal) {
        elPostal.addEventListener('input', function () {
          elPostal.value = elPostal.value.replace(/\D/g, '').slice(0, 5);
          refreshTotals();
        });
      }
    }

    if (elPhone) {
      elPhone.addEventListener('input', function () {
        elPhone.value = LX.V.formatPhoneInput(elPhone.value);
      });
    }

    /* ── Delivery method ─────────────────────────────── */
    $$('[data-delivery]', root).forEach(function (row) {
      row.addEventListener('click', function () {
        deliveryMethod = row.getAttribute('data-delivery');
        $$('[data-delivery]', root).forEach(function (r) { r.classList.toggle('selected', r === row); });
        refreshTotals();
      });
    });

    /* ── Payment method ──────────────────────────────── */
    $$('[data-payment]', root).forEach(function (row) {
      row.addEventListener('click', function () {
        paymentMethod = row.getAttribute('data-payment');
        $$('[data-payment]', root).forEach(function (r) { r.classList.toggle('selected', r === row); });
        refreshTotals();
      });
    });

    /* ── Totals refresh ──────────────────────────────── */
    function currentDistrictId() {
      if (selectedSaved) {
        var found = null;
        (u && u.addresses || []).forEach(function (a) { if (a.id === selectedSaved) found = a; });
        return found ? found.districtId : 'colombo';
      }
      return elDistrict ? elDistrict.value : 'colombo';
    }

    function refreshTotals() {
      var t = LX.Cart.totals({
        districtId: currentDistrictId(),
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod
      });
      var sum = $('#checkoutSummary', root);
      if (sum) sum.innerHTML = summaryHTML(t);

      /* delivery option prices */
      $$('[data-delivery]', root).forEach(function (row) {
        var m = row.getAttribute('data-delivery');
        var q = LX.SL.quote({
          districtId: currentDistrictId(),
          afterDiscounts: t.afterDiscounts,
          deliveryMethod: m,
          paymentMethod: paymentMethod,
          couponFreeShip: t.couponFreeShip
        });
        var priceEl = row.querySelector('b:last-child');
        if (priceEl) priceEl.textContent = q.deliveryFee === 0 ? 'FREE' : LX.money(q.deliveryFee);
      });

      var eta = $('#etaNote', root);
      if (eta) {
        var e = LX.SL.eta(deliveryMethod);
        eta.innerHTML = 'Estimated delivery: <b>' + LX.fmtDateShort(e.from) + ' – ' + LX.fmtDateShort(e.to) + '</b>' +
          ' · Zone ' + t.zone + ' (' + LX.esc(t.zoneName) + ')' +
          '<br><span class="tiny">Weekends and public holidays are skipped.</span>';
      }
    }
    refreshTotals();

    /* ── Submit ──────────────────────────────────────── */
    $('#checkoutForm', root).addEventListener('submit', function (e) {
      e.preventDefault();

      /* validate contact */
      var nameRes = LX.V.name(elName.value);
      if (!nameRes.ok) { LX.CardForm.showError(elName, $('#ckNameMsg', root), nameRes.message); elName.focus(); return; }
      LX.CardForm.showOk(elName, $('#ckNameMsg', root));

      var emailRes = LX.Email.validate(elEmail.value);
      if (!emailRes.ok) {
        var m = $('#ckEmailMsg', root);
        LX.CardForm.showError(elEmail, m, emailRes.message);
        if (emailRes.code === 'typo' && emailRes.suggestion) {
          LX.CardForm.clearError(elEmail, m);
          m.className = 'field-msg warn';
          m.innerHTML = 'Did you mean <b>' + LX.esc(emailRes.suggestion) + '</b>? ' +
            '<button type="button" class="btn-link" data-fix="' + LX.esc(emailRes.suggestion) + '">Yes, fix it</button>';
          var fix = m.querySelector('[data-fix]');
          if (fix) fix.addEventListener('click', function () {
            elEmail.value = emailRes.suggestion;
            LX.CardForm.clearError(elEmail, m);
          });
        }
        elEmail.focus();
        return;
      }
      LX.CardForm.showOk(elEmail, $('#ckEmailMsg', root));

      var phoneRes = LX.V.phone(elPhone.value);
      if (!phoneRes.ok) { LX.CardForm.showError(elPhone, $('#ckPhoneMsg', root), phoneRes.message); elPhone.focus(); return; }
      LX.CardForm.showOk(elPhone, $('#ckPhoneMsg', root));

      /* build shipping */
      var shipping = null;
      if (selectedSaved) {
        (u.addresses || []).forEach(function (a) { if (a.id === selectedSaved) shipping = a; });
      } else {
        if (!elLine1.value.trim()) { LX.CardForm.showError(elLine1, $('#ckLine1Msg', root), 'Enter address line 1.'); elLine1.focus(); return; }
        LX.CardForm.showOk(elLine1, $('#ckLine1Msg', root));

        if (!elDivision.value) { LX.CardForm.showError(elDivision, $('#ckDivisionMsg', root), 'Select a city / area.'); elDivision.focus(); return; }
        LX.CardForm.showOk(elDivision, $('#ckDivisionMsg', root));

        var postalRes = LX.V.postal(elPostal.value);
        if (!postalRes.ok) { LX.CardForm.showError(elPostal, $('#ckPostalMsg', root), postalRes.message); elPostal.focus(); return; }
        LX.CardForm.showOk(elPostal, $('#ckPostalMsg', root));

        var district = LX.SL.district(elDistrict.value);
        var division = LX.SL.division(elDistrict.value, elDivision.value);
        shipping = {
          label: 'Home',
          name: nameRes.value,
          phone: phoneRes.e164,
          line1: elLine1.value.trim(),
          line2: elLine2.value.trim(),
          districtId: district.id,
          districtName: district.name,
          divisionCode: division.code,
          divisionName: division.name,
          area: elArea.value || '',
          postal: elPostal.value,
          country: 'Sri Lanka',
          isDefault: false
        };
      }

      if (!$('#ckTerms', root).checked) {
        var tm = $('#ckTermsMsg', root);
        tm.textContent = 'Please accept the terms to place your order.';
        tm.className = 'field-msg error';
        return;
      }
      $('#ckTermsMsg', root).textContent = '';

      /* persist draft */
      LX.Store.set('checkout', {
        contact: { name: nameRes.value, email: emailRes.display, phone: phoneRes.e164 },
        shipping: shipping,
        saveAddress: $('#ckSaveAddr', root) ? $('#ckSaveAddr', root).checked : false,
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod,
        terms: true
      }, undefined, { immediate: true });

      /* place order */
      var btn = $('#ckPlace', root);
      btn.disabled = true;
      btn.innerHTML = '<span class="spinner spinner-light"></span> Placing order…';

      LX.Api.orders.create({
        contact: { name: nameRes.value, email: emailRes.display, phone: phoneRes.e164 },
        shipping: shipping,
        saveAddress: $('#ckSaveAddr', root) ? $('#ckSaveAddr', root).checked : false,
        deliveryMethod: deliveryMethod,
        paymentMethod: paymentMethod
      }).then(function (res) {
        if (!res.ok) {
          btn.disabled = false;
          btn.textContent = 'Place Order';
          LX.UI.toast({
            type: 'error',
            title: 'Could not place order',
            message: res.message,
            duration: 6000
          });
          if (res.notices && res.notices.length) {
            res.notices.forEach(function (n) { LX.UI.toast({ type: n.type === 'warn' ? 'warn' : 'info', message: n.message }); });
            setTimeout(function () { LX.Router.render(); }, 900);
          }
          return;
        }

        var order = res.order;
        if (order.paymentMethod === 'card') {
          LX.DB.set('pending_order', { orderNumber: order.orderNumber, createdAt: Date.now() });
          LX.Router.go('#/pay');
        } else {
          /* COD → straight to confirmation */
          LX.Payment.processCOD(order).then(function (r) {
            LX.DB.remove('pending_order');
            LX.Router.go('#/order/' + r.order.orderNumber);
          });
        }
      }).catch(function (err) {
        btn.disabled = false;
        btn.textContent = 'Place Order';
        LX.UI.toast({ type: 'error', title: 'Something went wrong', message: String(err && err.message || err) });
      });
    });
  }

  LX.Pages.checkout = { title: 'Checkout', render: renderCheckout, mount: mountCheckout };
})(window);