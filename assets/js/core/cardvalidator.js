/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/cardvalidator.js
   ★ LUHN ENGINE ★  4 layers: brand → length → Luhn → expiry+CVC
   (blueprint §11.1, §11.2)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ── Brand rules table (blueprint §11.1) ─────────────── */
  var BRANDS = {
    visa: {
      label: 'Visa', cvcLabel: 'CVC', cvcLen: 3,
      lengths: [16, 13, 19], primary: 16,
      groups: [4, 4, 4, 4],
      test: function (d) { return d.charAt(0) === '4'; }
    },
    mastercard: {
      label: 'Mastercard', cvcLabel: 'CVC', cvcLen: 3,
      lengths: [16], primary: 16,
      groups: [4, 4, 4, 4],
      test: function (d) {
        var n2 = parseInt(d.slice(0, 2), 10);
        var n4 = parseInt(d.slice(0, 4), 10);
        return (n2 >= 51 && n2 <= 55) || (n4 >= 2221 && n4 <= 2720);
      }
    },
    amex: {
      label: 'American Express', cvcLabel: 'CID', cvcLen: 4,
      lengths: [15], primary: 15,
      groups: [4, 6, 5],
      test: function (d) {
        var n2 = d.slice(0, 2);
        return n2 === '34' || n2 === '37';
      }
    },
    discover: {
      label: 'Discover', cvcLabel: 'CVC', cvcLen: 3,
      lengths: [16, 19], primary: 16,
      groups: [4, 4, 4, 4],
      test: function (d) {
        var n4 = d.slice(0, 4), n2 = d.slice(0, 2), n3 = parseInt(d.slice(0, 3), 10);
        return n4 === '6011' || n2 === '65' || (n3 >= 644 && n3 <= 649);
      }
    },
    jcb: {
      label: 'JCB', cvcLabel: 'CVC', cvcLen: 3,
      lengths: [16, 19], primary: 16,
      groups: [4, 4, 4, 4],
      test: function (d) {
        var n4 = parseInt(d.slice(0, 4), 10);
        return n4 >= 3528 && n4 <= 3589;
      }
    },
    diners: {
      label: 'Diners Club', cvcLabel: 'CVC', cvcLen: 3,
      lengths: [14], primary: 14,
      groups: [4, 6, 4],
      test: function (d) {
        var n3 = parseInt(d.slice(0, 3), 10);
        var n2 = d.slice(0, 2);
        return (n3 >= 300 && n3 <= 305) || n2 === '36' || n2 === '38';
      }
    },
    unionpay: {
      label: 'UnionPay', cvcLabel: 'CVN', cvcLen: 3,
      lengths: [16, 17, 18, 19], primary: 16,
      groups: [4, 4, 4, 4],
      test: function (d) { return d.slice(0, 2) === '62'; }
    }
  };

  var ORDER = ['amex', 'diners', 'jcb', 'discover', 'mastercard', 'visa', 'unionpay'];

  /* ── LAYER 1 · Brand detect (BIN prefix) ─────────────── */
  function detect(digits) {
    digits = String(digits || '').replace(/\D/g, '');
    if (!digits) return { brand: null, config: null, label: 'Card' };
    for (var i = 0; i < ORDER.length; i++) {
      var key = ORDER[i];
      if (BRANDS[key].test(digits)) return { brand: key, config: BRANDS[key], label: BRANDS[key].label };
    }
    return { brand: null, config: null, label: 'Card', unknown: digits.length >= 4 };
  }

  /* ── LAYER 3 · Luhn checksum (standard algorithm) ────── */
  function luhn(digits) {
    digits = String(digits || '').replace(/\D/g, '');
    if (!digits) return false;
    var sum = 0, alt = false;
    for (var i = digits.length - 1; i >= 0; i--) {
      var n = parseInt(digits.charAt(i), 10);
      if (isNaN(n)) return false;
      if (alt) { n *= 2; if (n > 9) n -= 9; }
      sum += n;
      alt = !alt;
    }
    return sum % 10 === 0;
  }

  /* ── Grouping / display ──────────────────────────────── */
  function group(digits, brandKey) {
    digits = String(digits || '').replace(/\D/g, '');
    var cfg = brandKey && BRANDS[brandKey] ? BRANDS[brandKey] : detect(digits).config;
    var groups = cfg ? cfg.groups : [4, 4, 4, 4];
    var out = [], idx = 0;
    for (var g = 0; g < groups.length && idx < digits.length; g++) {
      out.push(digits.slice(idx, idx + groups[g]));
      idx += groups[g];
    }
    if (idx < digits.length) out.push(digits.slice(idx));
    return out.join(' ');
  }

  function maxDigits(brandKey) {
    var cfg = BRANDS[brandKey];
    return cfg ? Math.max.apply(null, cfg.lengths) : 19;
  }

  /* ── LAYER 2 + 3 · Card number validation ────────────── */
  function validateNumber(raw, opts) {
    opts = opts || {};
    var digits = String(raw || '').replace(/\D/g, '');
    var d = detect(digits);

    if (!digits) {
      return { ok: false, incomplete: true, brand: null, message: opts.touched ? 'Enter your card number.' : '', code: 'empty' };
    }

    if (!d.config) {
      if (digits.length < 4) return { ok: false, incomplete: true, brand: null, message: '', code: 'detecting' };
      return { ok: false, incomplete: true, brand: null, message: 'We don’t support this card brand.', code: 'brand', digits: digits };
    }

    var primary = d.config.primary;
    var maxLen = Math.max.apply(null, d.config.lengths);

    /* LAYER 2 · length */
    if (digits.length < primary) {
      return {
        ok: false, incomplete: true, brand: d.brand, config: d.config,
        message: opts.touched ? 'Your card number is incomplete.' : '', code: 'incomplete',
        digits: digits, need: primary
      };
    }
    if (d.config.lengths.indexOf(digits.length) < 0) {
      return {
        ok: false, incomplete: false, brand: d.brand, config: d.config,
        message: 'Your card number is invalid.', code: 'length',
        digits: digits
      };
    }

    /* LAYER 3 · Luhn */
    if (!luhn(digits)) {
      return {
        ok: false, incomplete: false, brand: d.brand, config: d.config,
        message: 'Your card number is invalid.', code: 'luhn',
        digits: digits
      };
    }

    return {
      ok: true, incomplete: false, brand: d.brand, config: d.config,
      label: d.label, digits: digits,
      lengthOk: true, luhnOk: true,
      cvcLen: d.config.cvcLen, cvcLabel: d.config.cvcLabel,
      message: ''
    };
  }

  /* ── LAYER 4a · Expiry ───────────────────────────────── */
  function validateExpiry(month, year, opts) {
    opts = opts || {};
    var m = parseInt(month, 10);
    var y = parseInt(year, 10);

    if (!month && !year) {
      return { ok: false, incomplete: true, message: opts.touched ? 'Enter your card’s expiration date.' : '', code: 'empty' };
    }

    if (isNaN(m) || m < 1) {
      return { ok: false, incomplete: true, message: opts.touched ? 'Your card’s expiration date is incomplete.' : '', code: 'incomplete' };
    }
    if (m > 12) {
      return { ok: false, incomplete: false, message: 'Your card’s expiration month is invalid.', code: 'month' };
    }

    if (isNaN(y) || String(year).length < 2) {
      return { ok: false, incomplete: true, message: 'Your card’s expiration date is incomplete.', code: 'incomplete' };
    }

    var fullYear = y < 100 ? 2000 + y : y;
    var now = new Date();
    var thisYear = now.getFullYear();
    var thisMonth = now.getMonth() + 1;

    if (fullYear < thisYear) {
      return { ok: false, incomplete: false, message: 'Your card’s expiration year is in the past.', code: 'past' };
    }
    if (fullYear > thisYear + 20) {
      return { ok: false, incomplete: false, message: 'Your card’s expiration year is too far in the future.', code: 'future' };
    }
    if (fullYear === thisYear && m < thisMonth) {
      return { ok: false, incomplete: false, message: 'Your card’s expiration date is in the past.', code: 'past' };
    }

    return { ok: true, month: m, year: fullYear, message: '' };
  }

  /* ── LAYER 4b · CVC / CID ────────────────────────────── */
  function validateCvc(raw, brandKey) {
    var cfg = brandKey && BRANDS[brandKey] ? BRANDS[brandKey] : null;
    var cvc = String(raw || '').replace(/\D/g, '');
    var need = cfg ? cfg.cvcLen : 3;

    if (!cvc) {
      return { ok: false, incomplete: true, message: 'Enter your card’s security code.', code: 'empty', need: need };
    }
    if (cvc.length < need) {
      /* Amex: 3 digits *feels* complete, so say so explicitly (blueprint §11.2) */
      if (brandKey === 'amex' && cvc.length >= 3) {
        return {
          ok: false, incomplete: false, need: 4,
          message: 'American Express cards require a 4-digit security code.', code: 'amex'
        };
      }
      return {
        ok: false, incomplete: true,
        message: 'Your card’s security code is incomplete.', code: 'incomplete', need: need
      };
    }
    if (cvc.length > need) {
      if (brandKey === 'amex') {
        return { ok: false, incomplete: false, need: 4, message: 'American Express cards require a 4-digit security code.', code: 'amex' };
      }
      return { ok: false, incomplete: false, need: need, message: 'Your card’s security code is too long.', code: 'long' };
    }
    /* Any digits are valid — length only (blueprint §11.1) */
    return { ok: true, value: cvc, need: need, message: '' };
  }

  /* ── Amex dynamic CVC spec helper (UI) ───────────────── */
  function cvcSpec(brandKey) {
    var cfg = BRANDS[brandKey];
    if (!cfg) return { len: 3, label: 'CVC', placeholder: 'CVC', groups: [4, 4, 4, 4] };
    return {
      len: cfg.cvcLen,
      label: cfg.cvcLabel,
      placeholder: cfg.cvcLabel,
      groups: cfg.groups,
      brand: brandKey
    };
  }

  /* ── Full card validation (Pay button gate) ──────────── */
  function validate(card, opts) {
    opts = opts || {};
    var num = validateNumber(card.number, { touched: opts.touched });
    var exp = validateExpiry(card.expMonth, card.expYear, { touched: opts.touched });
    var cvc = validateCvc(card.cvc, num.brand);
    var name = LX.V.cardHolder(card.name);

    var ok = num.ok && exp.ok && cvc.ok && name.ok;

    return {
      ok: ok,
      number: num,
      expiry: exp,
      cvc: cvc,
      name: name,
      brand: num.brand,
      brandLabel: num.brand ? BRANDS[num.brand].label : 'Card',
      last4: num.digits ? num.digits.slice(-4) : '',
      /* NEVER include card.number or card.cvc in anything that gets stored */
      safe: {
        brand: num.brand,
        last4: num.digits ? num.digits.slice(-4) : '',
        expMonth: exp.month || null,
        expYear: exp.year || null
      }
    };
  }

  /* ── Expiry auto-format: "1230" → "12 / 30" ──────────── */
  function formatExpiryInput(value) {
    var d = String(value || '').replace(/\D/g, '').slice(0, 4);
    if (d.length === 0) return '';
    if (d.length <= 2) {
      /* "1" → "1", "13" handled at validation */
      return d;
    }
    return d.slice(0, 2) + ' / ' + d.slice(2);
  }

  /* ── Test cards (blueprint §11.3) — all Luhn-pass ─────── */
  var TEST_CARDS = [
    { label: 'Visa', number: '4242 4242 4242 4242', brand: 'visa', cvc: '123', exp: '12 / 30' },
    { label: 'Visa Debit', number: '4000 0566 5566 5556', brand: 'visa', cvc: '123', exp: '12 / 30' },
    { label: 'Mastercard', number: '5555 5555 5555 4444', brand: 'mastercard', cvc: '123', exp: '12 / 30' },
    { label: 'Mastercard (2-series)', number: '2223 0031 2200 3222', brand: 'mastercard', cvc: '123', exp: '12 / 30' },
    { label: 'Amex', number: '3782 822463 10005', brand: 'amex', cvc: '1234', exp: '12 / 30' },
    { label: 'Amex 2', number: '3714 496353 98431', brand: 'amex', cvc: '1234', exp: '12 / 30' },
    { label: 'Discover', number: '6011 1111 1111 1117', brand: 'discover', cvc: '123', exp: '12 / 30' },
    { label: 'JCB', number: '3530 1113 3330 0000', brand: 'jcb', cvc: '123', exp: '12 / 30' },
    { label: 'Diners', number: '3056 9309 0259 04', brand: 'diners', cvc: '123', exp: '12 / 30' }
  ];

  LX.Card = {
    BRANDS: BRANDS,
    detect: detect,
    luhn: luhn,
    group: group,
    maxDigits: maxDigits,
    validateNumber: validateNumber,
    validateExpiry: validateExpiry,
    validateCvc: validateCvc,
    cvcSpec: cvcSpec,
    validate: validate,
    formatExpiryInput: formatExpiryInput,
    TEST_CARDS: TEST_CARDS
  };
})(window);