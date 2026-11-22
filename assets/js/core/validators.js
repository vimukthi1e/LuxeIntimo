/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/validators.js
   Email · Password · Phone · Name · Postal · Address
   (blueprint §10.1, §10.2, §8.5, §10)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ── Common password blocklist ───────────────────────── */
  var COMMON = [
    'password', 'password1', 'password123', '12345678', '123456789', '1234567890',
    'qwerty123', 'qwertyui', 'qwerty1234', 'letmein1', 'welcome1', 'welcome123',
    'admin123', 'iloveyou', 'princess1', 'sunshine1', 'football1', 'monkey123',
    'abc12345', 'abcd1234', 'passw0rd', 'p@ssw0rd', 'trustno1', 'dragon123',
    'master123', 'hello123', 'freedom1', 'whatever1', 'qazwsxedc', '1qaz2wsx',
    'baseball1', 'superman1', 'michael1', 'shadow123', 'ashley123', 'bailey123',
    'jessica1', 'charlie1', 'thomas123', 'robert123', 'daniel123', 'internet',
    'samsung123', 'liverpool', 'chelsea1', 'jennifer', 'jordan123', 'harley1'
  ];

  /* ── EMAIL ───────────────────────────────────────────── */
  function email(value, opts) {
    return LX.Email.validate(value, opts);
  }

  /* ── PASSWORD (blueprint §10.1) ──────────────────────── */
  function password(value, ctx) {
    ctx = ctx || {};
    var pw = String(value || '');
    var checks = {
      length: { ok: false, label: 'At least 8 characters', required: true },
      uppercase: { ok: false, label: 'One uppercase letter (A–Z)', required: true },
      lowercase: { ok: false, label: 'One lowercase letter (a–z)', required: true },
      digit: { ok: false, label: 'One number (0–9)', required: true },
      symbol: { ok: false, label: 'One symbol (!@#$…) — bonus', required: false },
      nospace: { ok: false, label: 'No spaces', required: true },
      maxlen: { ok: false, label: '128 characters or fewer', required: true },
      notcommon: { ok: false, label: 'Not a commonly used password', required: true },
      personal: { ok: false, label: 'Doesn’t contain your name or email', required: true }
    };

    checks.length.ok = pw.length >= 8;
    checks.uppercase.ok = /[A-Z]/.test(pw);
    checks.lowercase.ok = /[a-z]/.test(pw);
    checks.digit.ok = /[0-9]/.test(pw);
    checks.symbol.ok = /[^A-Za-z0-9]/.test(pw);
    checks.nospace.ok = pw.length > 0 && !/\s/.test(pw);
    checks.maxlen.ok = pw.length > 0 && pw.length <= 128;

    var lower = pw.toLowerCase();
    checks.notcommon.ok = pw.length > 0 && COMMON.indexOf(lower) < 0;

    var personalOk = true;
    if (pw) {
      var emailLocal = String(ctx.email || '').split('@')[0].toLowerCase();
      var nameBits = String(ctx.name || '').toLowerCase().split(/\s+/).filter(function (b) { return b.length >= 3; });
      if (emailLocal && emailLocal.length >= 3 && lower.indexOf(emailLocal) > -1) personalOk = false;
      nameBits.forEach(function (b) { if (lower.indexOf(b) > -1) personalOk = false; });
    }
    checks.personal.ok = pw.length > 0 && personalOk;

    var required = ['length', 'uppercase', 'lowercase', 'digit', 'nospace', 'maxlen', 'notcommon', 'personal'];
    var passed = required.every(function (k) { return checks[k].ok; });
    var failedKey = required.filter(function (k) { return !checks[k].ok; })[0] || null;

    return {
      ok: pw.length > 0 && passed,
      value: pw,
      checks: checks,
      failedKey: failedKey,
      message: pw.length === 0 ? 'Enter a password.'
        : passed ? 'Password looks good.'
          : checks[failedKey].label,
      score: strength(pw, checks)
    };
  }

  /* Strength meter (blueprint §10.2) */
  function strength(pw, checks) {
    if (!pw) return { score: 0, band: 'none', label: '', color: 'var(--line)' };
    if (!checks) {
      checks = {
        length: { ok: pw.length >= 8 }, uppercase: { ok: /[A-Z]/.test(pw) },
        lowercase: { ok: /[a-z]/.test(pw) }, digit: { ok: /[0-9]/.test(pw) },
        symbol: { ok: /[^A-Za-z0-9]/.test(pw) }, notcommon: { ok: COMMON.indexOf(pw.toLowerCase()) < 0 }
      };
    }

    var s = 0;
    if (pw.length >= 8) s += 20;
    if (pw.length >= 12) s += 12;
    if (pw.length >= 16) s += 8;
    if (checks.lowercase.ok) s += 12;
    if (checks.uppercase.ok) s += 14;
    if (checks.digit.ok) s += 14;
    if (checks.symbol.ok) s += 18;

    var varieties = ['lowercase', 'uppercase', 'digit', 'symbol'].filter(function (k) { return checks[k] && checks[k].ok; }).length;
    if (varieties >= 4) s += 8;

    /* penalties */
    if (/(.)\1\1/.test(pw)) s -= 14;
    if (hasSequential(pw)) s -= 16;
    if (!checks.notcommon.ok) s = 6;

    s = Math.max(0, Math.min(100, s));

    var band, label, color;
    if (s <= 29) { band = 'weak'; label = 'Weak'; color = '#DF1B41'; }
    else if (s <= 54) { band = 'fair'; label = 'Fair'; color = '#D9A441'; }
    else if (s <= 77) { band = 'strong'; label = 'Strong'; color = '#7FB069'; }
    else { band = 'excellent'; label = 'Excellent'; color = '#4E9E6A'; }

    return { score: s, band: band, label: label, color: color };
  }

  function hasSequential(pw) {
    var lower = pw.toLowerCase();
    var runs = ['abcdefghijklmnopqrstuvwxyz', '01234567890', 'qwertyuiop', 'asdfghjkl', 'zxcvbnm'];
    for (var r = 0; r < runs.length; r++) {
      var s = runs[r];
      for (var i = 0; i + 3 < s.length + 1; i++) {
        var chunk = s.slice(i, i + 4);
        if (chunk.length === 4 && lower.indexOf(chunk) > -1) return true;
      }
    }
    return false;
  }

  /* ── PHONE (blueprint §10 · +94 locked, 9 digits, starts 7) ── */
  function phone(value) {
    var digits = String(value || '').replace(/\D/g, '');
    /* strip leading 94 / 0 */
    if (digits.indexOf('94') === 0 && digits.length > 9) digits = digits.slice(2);
    if (digits.indexOf('0') === 0) digits = digits.slice(1);

    if (!digits) return { ok: false, message: 'Enter your mobile number.', digits: '' };
    if (digits.length < 9) return { ok: false, message: 'Mobile number is incomplete — 9 digits required.', digits: digits };
    if (digits.length > 9) return { ok: false, message: 'Mobile number must be exactly 9 digits.', digits: digits };
    if (digits.charAt(0) !== '7') return { ok: false, message: 'Sri Lankan mobile numbers start with 7.', digits: digits };

    return {
      ok: true,
      digits: digits,
      e164: '+94' + digits,
      display: digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5),
      message: 'Mobile number verified'
    };
  }

  function formatPhoneInput(value) {
    var digits = String(value || '').replace(/\D/g, '');
    if (digits.indexOf('0') === 0) digits = digits.slice(1);
    if (digits.indexOf('94') === 0 && digits.length > 9) digits = digits.slice(2);
    digits = digits.slice(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + ' ' + digits.slice(2);
    return digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  }

  /* ── NAME ────────────────────────────────────────────── */
  function name(value) {
    var v = String(value || '').trim();
    if (!v) return { ok: false, message: 'Enter your full name.' };
    if (v.length < 2) return { ok: false, message: 'Name must be at least 2 characters.' };
    if (v.length > 80) return { ok: false, message: 'Name must be 80 characters or fewer.' };
    if (!/^[A-Za-zÀ-ɏ' .-]+$/.test(v)) return { ok: false, message: 'Use letters, spaces, hyphens and apostrophes only.' };
    if (!/[A-Za-zÀ-ɏ]/.test(v)) return { ok: false, message: 'Name must contain letters.' };
    return { ok: true, value: LX.titleCase(v), message: '' };
  }

  /* ── POSTAL (blueprint §8.5 — 5 digits) ──────────────── */
  function postal(value) {
    var v = String(value || '').replace(/\s/g, '');
    if (!v) return { ok: false, message: 'Enter a postal code.' };
    if (!/^\d+$/.test(v)) return { ok: false, message: 'Postal codes use numbers only.' };
    if (v.length !== 5) return { ok: false, message: 'Sri Lankan postal codes are 5 digits.' };
    return { ok: true, value: v, message: '' };
  }

  /* ── ADDRESS ─────────────────────────────────────────── */
  function address(a) {
    var errors = {};
    if (!a || !String(a.line1 || '').trim()) errors.line1 = 'Enter address line 1.';
    else if (String(a.line1).trim().length < 4) errors.line1 = 'Address looks too short.';

    if (!a || !a.districtId || !LX.SL.district(a.districtId)) errors.districtId = 'Select a district.';
    if (!a || !a.divisionCode || !LX.SL.division(a.districtId, a.divisionCode)) errors.divisionCode = 'Select a city / area.';

    var p = postal(a && a.postal);
    if (!p.ok) errors.postal = p.message;

    if (a && a.phone) {
      var ph = phone(a.phone);
      if (!ph.ok) errors.phone = ph.message;
    }

    return { ok: Object.keys(errors).length === 0, errors: errors };
  }

  /* ── CARD-HOLDER NAME (payment) ──────────────────────── */
  function cardHolder(value) {
    var v = String(value || '').trim();
    if (!v) return { ok: false, message: 'Enter the name on your card.' };
    if (v.length < 2) return { ok: false, message: 'Enter the name on your card.' };
    if (!/^[A-Za-zÀ-ɏ' .-]+$/.test(v)) return { ok: false, message: 'Card holder name can only use letters.' };
    return { ok: true, value: v, message: '' };
  }

  /* ── TERMS ───────────────────────────────────────────── */
  function required(value, msg) {
    var v = String(value === null || value === undefined ? '' : value).trim();
    return v ? { ok: true, value: v } : { ok: false, message: msg || 'This field is required.' };
  }

  LX.V = {
    email: email,
    password: password,
    strength: strength,
    phone: phone,
    formatPhoneInput: formatPhoneInput,
    name: name,
    postal: postal,
    address: address,
    cardHolder: cardHolder,
    required: required,
    COMMON_PASSWORDS: COMMON
  };
})(window);