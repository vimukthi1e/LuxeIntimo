/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — ui/cardform.js
   Stripe-style card element (blueprint §11.1, §11.2, §11.4)
   Errors: #DF1B41 + inline text + shake · type-to-clear
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  /* ── Brand chips (small SVG marks) ───────────────────── */
  var BRAND_MARKS = {
    visa: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="Visa"><rect width="40" height="26" rx="4" fill="#1434CB"/><text x="20" y="18" font-family="Arial,Helvetica,sans-serif" font-size="13" font-style="italic" font-weight="700" fill="#fff" text-anchor="middle">VISA</text></svg>',
    mastercard: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="Mastercard"><rect width="40" height="26" rx="4" fill="#22252A"/><circle cx="16" cy="13" r="7.5" fill="#EB001B"/><circle cx="25" cy="13" r="7.5" fill="#F79E1B"/><path d="M20.5 7.6a7.5 7.5 0 0 0 0 10.8 7.5 7.5 0 0 0 0-10.8z" fill="#FF5F00"/></svg>',
    amex: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="American Express"><rect width="40" height="26" rx="4" fill="#006FCF"/><text x="20" y="12.5" font-family="Arial,Helvetica,sans-serif" font-size="7" font-weight="700" fill="#fff" text-anchor="middle">AMERICAN</text><text x="20" y="20.5" font-family="Arial,Helvetica,sans-serif" font-size="7" font-weight="700" fill="#fff" text-anchor="middle">EXPRESS</text></svg>',
    discover: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="Discover"><rect width="40" height="26" rx="4" fill="#F7F7F7"/><rect y="14" width="40" height="12" rx="4" fill="#F58220"/><text x="20" y="12.5" font-family="Arial,Helvetica,sans-serif" font-size="6.5" font-weight="700" fill="#222" text-anchor="middle">DISCOVER</text></svg>',
    jcb: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="JCB"><rect width="40" height="26" rx="4" fill="#fff"/><rect x="4" y="3" width="9" height="20" rx="3" fill="#0E4C96"/><rect x="15.5" y="3" width="9" height="20" rx="3" fill="#B3282D"/><rect x="27" y="3" width="9" height="20" rx="3" fill="#00873E"/><text x="20" y="17" font-family="Arial,Helvetica,sans-serif" font-size="8" font-weight="700" fill="#fff" text-anchor="middle">JCB</text></svg>',
    diners: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="Diners Club"><rect width="40" height="26" rx="4" fill="#0079BE"/><circle cx="20" cy="13" r="8.5" fill="#fff"/><circle cx="17" cy="13" r="5" fill="#0079BE"/><circle cx="23" cy="13" r="5" fill="#0079BE"/></svg>',
    unionpay: '<svg viewBox="0 0 40 26" width="34" height="22" aria-label="UnionPay"><rect width="40" height="26" rx="4" fill="#fff"/><rect x="2" width="12" height="26" rx="3" fill="#E21836"/><rect x="15" width="12" height="26" rx="3" fill="#00447C"/><rect x="28" width="10" height="26" rx="3" fill="#007B84"/></svg>'
  };

  function brandIcon(brandKey) {
    return BRAND_MARKS[brandKey] ||
      '<svg viewBox="0 0 40 26" width="34" height="22" aria-hidden="true"><rect width="40" height="26" rx="4" fill="none" stroke="#2A2A31" stroke-width="1.2" stroke-dasharray="3 3"/></svg>';
  }

  /* ── Error painting (blueprint §11.2) ────────────────── */
  function showError(input, msgEl, message) {
    input.classList.add('is-error');
    input.classList.remove('is-ok');
    if (msgEl) {
      msgEl.textContent = message;
      msgEl.className = 'field-msg error';
    }
    if (input.classList.contains('shake')) {
      input.classList.remove('shake');
      /* force reflow so the animation restarts */
      void input.offsetWidth;
    }
    input.classList.add('shake');
    setTimeout(function () { input.classList.remove('shake'); }, 220);
  }

  function clearError(input, msgEl) {
    input.classList.remove('is-error', 'shake');
    if (msgEl) { msgEl.textContent = ''; msgEl.className = 'field-msg'; }
  }

  function showOk(input, msgEl, message) {
    input.classList.remove('is-error');
    input.classList.add('is-ok');
    if (msgEl && message) { msgEl.textContent = message; msgEl.className = 'field-msg success'; }
    else if (msgEl) { msgEl.textContent = ''; msgEl.className = 'field-msg'; }
  }

  /* ═══ Mount ═══════════════════════════════════════════ */
  function mount(container, opts) {
    opts = opts || {};
    var state = {
      brand: null,
      captchaVerified: false,
      destroyed: false
    };

    var canSaveCard = !!opts.canSaveCard;

    container.innerHTML =
      '<div class="card-form">' +

      /* Email */
      '<div class="field">' +
      '<label class="field-label" for="cfEmail">Email</label>' +
      '<input class="input" id="cfEmail" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" value="' + LX.esc(opts.email || '') + '">' +
      '<div class="field-msg" id="cfEmailMsg"></div>' +
      '</div>' +

      /* Card number */
      '<div class="field">' +
      '<label class="field-label" for="cfNumber">Card number</label>' +
      '<div class="input-wrap">' +
      '<input class="input cf-number" id="cfNumber" type="text" inputmode="numeric" autocomplete="cc-number" placeholder="1234 1234 1234 1234" maxlength="23" spellcheck="false">' +
      '<span class="cf-brand" id="cfBrand"></span>' +
      '</div>' +
      '<div class="field-msg" id="cfNumberMsg"></div>' +
      '</div>' +

      /* Expiry + CVC */
      '<div class="cf-row">' +
      '<div class="field">' +
      '<label class="field-label" for="cfExpiry">Expiry</label>' +
      '<input class="input cf-expiry" id="cfExpiry" type="text" inputmode="numeric" autocomplete="cc-exp" placeholder="MM / YY" maxlength="7" spellcheck="false">' +
      '<div class="field-msg" id="cfExpiryMsg"></div>' +
      '</div>' +
      '<div class="field cf-cvc-field" id="cfCvcField">' +
      '<label class="field-label" for="cfCvc" id="cfCvcLabel">CVC</label>' +
      '<input class="input cf-cvc" id="cfCvc" type="text" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" maxlength="4" spellcheck="false">' +
      '<div class="field-msg" id="cfCvcMsg"></div>' +
      '</div>' +
      '</div>' +

      /* Cardholder name */
      '<div class="field">' +
      '<label class="field-label" for="cfName">Cardholder name</label>' +
      '<input class="input" id="cfName" type="text" autocomplete="cc-name" placeholder="Name on card" spellcheck="false">' +
      '<div class="field-msg" id="cfNameMsg"></div>' +
      '</div>' +

      /* Country — locked (blueprint §11.4) */
      '<div class="field">' +
      '<label class="field-label" for="cfCountry">Country or region</label>' +
      '<div class="cf-country" id="cfCountry">' +
      '<span class="cf-flag" aria-hidden="true">🇱🇰</span>' +
      '<span class="cf-country-name">Sri Lanka</span>' +
      '<svg class="cf-lock" viewBox="0 0 24 24" width="14" height="14" aria-label="Locked"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>' +
      '</div>' +
      '</div>' +

      /* Save card */
      (canSaveCard
        ? '<label class="check cf-save"><input type="checkbox" id="cfSave"><span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span><span>Save my card for faster checkout</span></label>'
        : '') +

      '</div>';

    /* ── Element refs ───────────────────────────────── */
    var elEmail = $('#cfEmail', container), msgEmail = $('#cfEmailMsg', container);
    var elNumber = $('#cfNumber', container), msgNumber = $('#cfNumberMsg', container);
    var elBrand = $('#cfBrand', container);
    var elExpiry = $('#cfExpiry', container), msgExpiry = $('#cfExpiryMsg', container);
    var elCvc = $('#cfCvc', container), msgCvc = $('#cfCvcMsg', container);
    var elCvcLabel = $('#cfCvcLabel', container);
    var elCvcField = $('#cfCvcField', container);
    var elName = $('#cfName', container), msgName = $('#cfNameMsg', container);
    var elSave = $('#cfSave', container);

    /* ── Card number ────────────────────────────────── */
    function paintBrand(digits) {
      var d = LX.Card.detect(digits);
      state.brand = d.brand;
      elBrand.innerHTML = brandIcon(d.brand);
      elBrand.classList.toggle('visible', !!d.brand);

      /* Amex ↔ CVC swap (blueprint §11.1) */
      var spec = LX.Card.cvcSpec(d.brand);
      elCvcLabel.textContent = spec.label;
      elCvc.placeholder = spec.placeholder;
      elCvc.setAttribute('maxlength', String(spec.len));
      elCvcField.classList.toggle('is-amex', d.brand === 'amex');

      /* Trim CVC if it no longer fits */
      if (elCvc.value.replace(/\D/g, '').length > spec.len) {
        elCvc.value = elCvc.value.replace(/\D/g, '').slice(0, spec.len);
      }
    }

    elNumber.addEventListener('input', function () {
      var digits = elNumber.value.replace(/\D/g, '').slice(0, 19);
      paintBrand(digits);
      elNumber.value = LX.Card.group(digits, state.brand);
      clearError(elNumber, msgNumber);
      if (digits.length >= 12) {
        var r = LX.Card.validateNumber(digits);
        if (r.ok) showOk(elNumber, msgNumber);
      }
      notify();
    });

    elNumber.addEventListener('focus', function () {
      var digits = elNumber.value.replace(/\D/g, '');
      elNumber.value = digits;
    });

    elNumber.addEventListener('blur', function () {
      var digits = elNumber.value.replace(/\D/g, '');
      elNumber.value = LX.Card.group(digits, state.brand);
      var r = LX.Card.validateNumber(digits, { touched: true });
      if (!r.ok && r.message) showError(elNumber, msgNumber, r.message);
      else if (r.ok) showOk(elNumber, msgNumber);
      notify();
    });

    /* ── Expiry ─────────────────────────────────────── */
    elExpiry.addEventListener('input', function () {
      var raw = elExpiry.value.replace(/\D/g, '').slice(0, 4);
      elExpiry.value = LX.Card.formatExpiryInput(raw);
      clearError(elExpiry, msgExpiry);

      /* auto-advance to CVC when MM complete */
      if (raw.length === 4) {
        var r = LX.Card.validateExpiry(raw.slice(0, 2), raw.slice(2));
        if (r.ok) { showOk(elExpiry, msgExpiry); elCvc.focus(); }
      }
      notify();
    });

    elExpiry.addEventListener('blur', function () {
      var raw = elExpiry.value.replace(/\D/g, '');
      var r = LX.Card.validateExpiry(raw.slice(0, 2), raw.slice(2), { touched: true });
      if (!r.ok && r.message) showError(elExpiry, msgExpiry, r.message);
      else if (r.ok) showOk(elExpiry, msgExpiry);
      notify();
    });

    /* ── CVC ────────────────────────────────────────── */
    elCvc.addEventListener('input', function () {
      var spec = LX.Card.cvcSpec(state.brand);
      elCvc.value = elCvc.value.replace(/\D/g, '').slice(0, spec.len);
      clearError(elCvc, msgCvc);
      notify();
    });

    elCvc.addEventListener('blur', function () {
      var r = LX.Card.validateCvc(elCvc.value, state.brand);
      if (!r.ok && r.message) showError(elCvc, msgCvc, r.message);
      else if (r.ok) showOk(elCvc, msgCvc);
      notify();
    });

    /* ── Name ───────────────────────────────────────── */
    elName.addEventListener('input', function () { clearError(elName, msgName); notify(); });
    elName.addEventListener('blur', function () {
      var r = LX.V.cardHolder(elName.value);
      if (!r.ok && elName.value) showError(elName, msgName, r.message);
      else if (r.ok) showOk(elName, msgName);
      notify();
    });

    /* ── Email ──────────────────────────────────────── */
    elEmail.addEventListener('input', function () { clearError(elEmail, msgEmail); notify(); });
    elEmail.addEventListener('blur', function () {
      var r = LX.Email.validate(elEmail.value, { skipTypoHint: true });
      if (!r.ok && elEmail.value) showError(elEmail, msgEmail, r.message);
      else if (r.ok) showOk(elEmail, msgEmail);
      notify();
    });

    if (elSave) elSave.addEventListener('change', notify);

    /* ── Public ─────────────────────────────────────── */
    function values() {
      var expRaw = elExpiry.value.replace(/\D/g, '');
      return {
        email: elEmail.value.trim(),
        number: elNumber.value.replace(/\D/g, ''),
        expMonth: expRaw.slice(0, 2),
        expYear: expRaw.slice(2),
        cvc: elCvc.value.replace(/\D/g, ''),
        name: elName.value.trim(),
        brand: state.brand,
        saveCard: elSave ? elSave.checked : false
      };
    }

    function validate(touched) {
      var v = values();
      var num = LX.Card.validateNumber(v.number, { touched: touched });
      var exp = LX.Card.validateExpiry(v.expMonth, v.expYear, { touched: touched });
      var cvc = LX.Card.validateCvc(v.cvc, num.brand);
      var name = LX.V.cardHolder(v.name);
      var em = LX.Email.validate(v.email, { skipTypoHint: true });

      if (!em.ok && (touched || v.email)) showError(elEmail, msgEmail, em.message);
      else if (em.ok) showOk(elEmail, msgEmail);

      if (!num.ok && (touched || v.number)) showError(elNumber, msgNumber, num.message || 'Your card number is incomplete.');
      else if (num.ok) showOk(elNumber, msgNumber);

      if (!exp.ok && (touched || v.expMonth || v.expYear)) showError(elExpiry, msgExpiry, exp.message || 'Your card’s expiration date is incomplete.');
      else if (exp.ok) showOk(elExpiry, msgExpiry);

      if (!cvc.ok && (touched || v.cvc)) showError(elCvc, msgCvc, cvc.message || 'Your card’s security code is incomplete.');
      else if (cvc.ok) showOk(elCvc, msgCvc);

      if (!name.ok && (touched || v.name)) showError(elName, msgName, name.message);
      else if (name.ok) showOk(elName, msgName);

      var ok = num.ok && exp.ok && cvc.ok && name.ok && em.ok;
      return {
        ok: ok,
        values: v,
        number: num, expiry: exp, cvc: cvc, name: name, email: em,
        safe: { brand: num.brand, last4: v.number.slice(-4), expMonth: exp.month, expYear: exp.year }
      };
    }

    function notify() {
      if (opts.onChange) opts.onChange(validate(false), values());
    }

    /* ── Dev autofill ───────────────────────────────── */
    function fill(card) {
      var digits = String(card.number || '').replace(/\D/g, '');
      paintBrand(digits);
      elNumber.value = LX.Card.group(digits, state.brand);
      elExpiry.value = String(card.exp || '12 / 30');
      elCvc.value = String(card.cvc || '123');
      elName.value = card.name || 'Test Cardholder';
      if (!elEmail.value && opts.email) elEmail.value = opts.email;
      notify();
    }

    /* prefill */
    if (opts.card) fill(opts.card);
    if (opts.email && !elEmail.value) elEmail.value = opts.email;
    paintBrand(elNumber.value.replace(/\D/g, ''));

    return {
      values: values,
      validate: validate,
      fill: fill,
      reset: function () {
        elNumber.value = ''; elExpiry.value = ''; elCvc.value = ''; elName.value = '';
        if (elSave) elSave.checked = false;
        paintBrand('');
        [elNumber, elExpiry, elCvc, elName, elEmail].forEach(function (n) {
          n.classList.remove('is-error', 'is-ok', 'shake');
        });
        $$('.field-msg', container).forEach(function (m) { m.textContent = ''; m.className = 'field-msg'; });
      },
      focus: function () { elNumber.focus(); },
      setEmail: function (v) { elEmail.value = v || ''; },
      destroy: function () {
        state.destroyed = true;
        container.innerHTML = '';
      }
    };
  }

  LX.CardForm = {
    mount: mount,
    brandIcon: brandIcon,
    showError: showError,
    clearError: clearError,
    showOk: showOk
  };
})(window);