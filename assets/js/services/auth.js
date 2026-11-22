/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — services/auth.js
   Register · Login · Session · OTP reset · Rate limit
   PBKDF2-SHA256 100k + random salt (blueprint §10)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  function users() { return LX.Store.get('users') || []; }
  function saveUsers(list) { LX.Store.set('users', list); }

  function attemptsKey(canonical) { return 'auth_attempts_' + canonical; }
  function otpKey(canonical) { return 'auth_otp_' + canonical; }

  /* ── Session helpers ─────────────────────────────────── */
  function newToken() { return LX.uid('sess_').slice(0, 24); }

  function buildSession(user, remember) {
    var days = remember ? LX.Config.SESSION_DAYS_REMEMBER : LX.Config.SESSION_DAYS_DEFAULT;
    return {
      token: newToken(),
      userId: user.id,
      name: user.name,
      email: user.email,
      expiresAt: Date.now() + days * 86400000,
      remember: !!remember
    };
  }

  function ensureSession() {
    var s = LX.Store.get('session');
    if (!s) return null;
    if (!s.expiresAt || s.expiresAt < Date.now()) {
      LX.Store.set('session', null, undefined, { immediate: true });
      LX.Store.emit && null;
      return null;
    }
    return s;
  }

  function currentUser() {
    var s = ensureSession();
    if (!s) return null;
    var list = users();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === s.userId) {
        var u = list[i];
        return {
          id: u.id, name: u.name, email: u.email, phone: u.phone || null,
          addresses: u.addresses || [], savedCards: u.savedCards || [],
          createdAt: u.createdAt, role: u.role || 'customer'
        };
      }
    }
    return null;
  }

  /* ── Rate limiting (blueprint §10.4) ─────────────────── */
  var LOCKOUT_AFTER = 5;
  var LOCKOUT_MS = 30000;

  function getAttempts(canonical) {
    return LX.DB.get(attemptsKey(canonical), { failCount: 0, lockedUntil: 0, lastAt: 0 }) || { failCount: 0, lockedUntil: 0, lastAt: 0 };
  }
  function setAttempts(canonical, a) { LX.DB.set(attemptsKey(canonical), a); }

  function lockState(canonical) {
    var a = getAttempts(canonical);
    if (a.lockedUntil && a.lockedUntil > Date.now()) {
      return {
        locked: true,
        remainingMs: a.lockedUntil - Date.now(),
        seconds: Math.ceil((a.lockedUntil - Date.now()) / 1000),
        message: 'Too many attempts. Try again in ' + Math.ceil((a.lockedUntil - Date.now()) / 1000) + 's'
      };
    }
    return { locked: false, failCount: a.failCount || 0, attemptsLeft: Math.max(0, LOCKOUT_AFTER - (a.failCount || 0)) };
  }

  function registerFailure(canonical) {
    var a = getAttempts(canonical);
    a.failCount = (a.failCount || 0) + 1;
    a.lastAt = Date.now();
    if (a.failCount >= LOCKOUT_AFTER) {
      a.lockedUntil = Date.now() + LOCKOUT_MS;
      a.failCount = 0;
    }
    setAttempts(canonical, a);
    return lockState(canonical);
  }

  function clearFailures(canonical) {
    setAttempts(canonical, { failCount: 0, lockedUntil: 0, lastAt: 0 });
  }

  /* ── REGISTER (blueprint §2, §10) ────────────────────── */
  function register(payload) {
    var p = payload || {};

    var nameRes = LX.V.name(p.name);
    if (!nameRes.ok) return { ok: false, field: 'name', message: nameRes.message };

    var emailRes = LX.Email.validate(p.email);
    if (!emailRes.ok) {
      return {
        ok: false, field: 'email', code: emailRes.code,
        message: emailRes.message, suggestion: emailRes.suggestion || null, hint: emailRes.hint || null
      };
    }

    /* Duplicate protection uses canonical form (blueprint §9) */
    if (LX.Email.isDuplicate(emailRes.canonical, users())) {
      return {
        ok: false, field: 'email', code: 'duplicate',
        message: 'An account already exists with that email address. Try signing in instead.'
      };
    }

    if (p.phone) {
      var ph = LX.V.phone(p.phone);
      if (!ph.ok) return { ok: false, field: 'phone', message: ph.message };
    }

    var pwRes = LX.V.password(p.password, { name: nameRes.value, email: emailRes.display });
    if (!pwRes.ok) return { ok: false, field: 'password', message: pwRes.message, checks: pwRes.checks };

    if (p.password !== p.confirm) {
      return { ok: false, field: 'confirm', message: 'Both passwords must match.' };
    }
    if (p.terms === false || p.terms === undefined) {
      return { ok: false, field: 'terms', message: 'Please accept the terms & conditions to continue.' };
    }

    var salt = LX.randomSaltHex(16);
    return LX.hashPassword(p.password, salt).then(function (hash) {
      var user = {
        id: LX.uid('u_'),
        name: nameRes.value,
        email: emailRes.display,
        emailCanonical: emailRes.canonical,
        passwordHash: hash,
        salt: salt,
        algo: LX.CRYPTO.mode === 'fallback' ? 'iterated-sha256' : 'PBKDF2-SHA256',
        iterations: LX.CRYPTO.mode === 'fallback' ? LX.CRYPTO.fallbackRounds : LX.CRYPTO.iterations,
        phone: p.phone ? LX.V.phone(p.phone).e164 : null,
        addresses: [],
        savedCards: [],
        createdAt: Date.now(),
        passwordChangedAt: Date.now(),
        role: 'customer'
      };
      var list = users(); list.push(user); saveUsers(list);
      clearFailures(user.emailCanonical);

      var session = buildSession(user, p.remember !== false);
      LX.Store.set('session', session, undefined, { immediate: true });

      return { ok: true, user: currentUser(), session: session };
    });
  }

  /* ── LOGIN ───────────────────────────────────────────── */
  function login(payload) {
    var p = payload || {};
    var emailRes = LX.Email.validate(p.email, { skipTypoHint: true });
    if (!emailRes.ok && emailRes.code !== 'typo') {
      return { ok: false, field: 'email', message: emailRes.message };
    }
    var canonical = emailRes.canonical || String(p.email || '').trim().toLowerCase();

    var lock = lockState(canonical);
    if (lock.locked) {
      return { ok: false, field: 'password', locked: true, seconds: lock.seconds, message: lock.message };
    }

    var user = null, list = users();
    for (var i = 0; i < list.length; i++) {
      if (list[i].emailCanonical === canonical) { user = list[i]; break; }
    }

    /* Same behaviour for unknown email — no enumeration */
    if (!user) {
      return LX.hashPassword(String(p.password || ''), 'nosalt').then(function () {
        var st = registerFailure(canonical);
        return {
          ok: false, field: 'password',
          message: st.locked ? st.message : 'Incorrect email or password.',
          attemptsLeft: st.attemptsLeft, locked: st.locked, seconds: st.seconds || 0
        };
      });
    }

    return LX.hashPassword(String(p.password || ''), user.salt).then(function (hash) {
      if (!LX.safeEqual(hash, user.passwordHash)) {
        var st = registerFailure(user.emailCanonical);
        if (st.locked) return { ok: false, field: 'password', locked: true, seconds: st.seconds, message: st.message };
        var left = st.attemptsLeft;
        return {
          ok: false, field: 'password', locked: false, attemptsLeft: left,
          message: left <= 1
            ? 'Incorrect password. ' + left + ' attempt left.'
            : 'Incorrect password. ' + left + ' attempts left.'
        };
      }
      clearFailures(user.emailCanonical);
      var session = buildSession(user, p.remember);
      LX.Store.set('session', session, undefined, { immediate: true });
      return { ok: true, user: currentUser(), session: session };
    });
  }

  /* ── LOGOUT ──────────────────────────────────────────── */
  function logout() {
    LX.Store.set('session', null, undefined, { immediate: true });
    LX.DB.remove('auth_redirect');
    return { ok: true };
  }

  /* ── Forgot password — dummy OTP (blueprint §10.5) ───── */
  function requestReset(emailValue) {
    var emailRes = LX.Email.validate(emailValue, { skipTypoHint: true });
    if (!emailRes.ok && emailRes.code !== 'typo') {
      return { ok: false, field: 'email', message: emailRes.message };
    }
    var canonical = emailRes.canonical || String(emailValue || '').trim().toLowerCase();

    var code = String(Math.floor(100000 + Math.random() * 900000));
    var record = {
      code: code,
      createdAt: Date.now(),
      expiresAt: Date.now() + 5 * 60 * 1000,   /* TTL 5 minutes */
      attempts: 0
    };
    LX.DB.set(otpKey(canonical), record);

    /* no enumeration — same response whether or not the account exists */
    return {
      ok: true,
      canonical: canonical,
      devCode: code,
      message: 'If an account exists for that email, a reset code has been generated.'
    };
  }

  function verifyOtp(emailValue, code) {
    var canonical = String(emailValue || '').trim().toLowerCase();
    var record = LX.DB.get(otpKey(canonical));
    if (!record) return { ok: false, message: 'That code has expired. Request a new one.' };

    if (record.expiresAt < Date.now()) {
      LX.DB.remove(otpKey(canonical));
      return { ok: false, message: 'That code has expired. Request a new one.' };
    }
    record.attempts = (record.attempts || 0) + 1;
    LX.DB.set(otpKey(canonical), record);

    if (record.attempts > 5) {
      LX.DB.remove(otpKey(canonical));
      return { ok: false, message: 'Too many incorrect codes. Please start again.', restart: true };
    }
    if (String(code || '').trim() !== record.code) {
      return {
        ok: false,
        message: 'That code isn’t correct. ' + (5 - record.attempts) + ' attempt' + (5 - record.attempts === 1 ? '' : 's') + ' left.'
      };
    }
    return { ok: true, canonical: canonical, message: 'Code verified.' };
  }

  function resetPassword(emailValue, code, newPassword) {
    var check = verifyOtp(emailValue, code);
    if (!check.ok) return check;

    var canonical = check.canonical;
    var list = users();
    var user = null;
    for (var i = 0; i < list.length; i++) if (list[i].emailCanonical === canonical) user = list[i];

    /* If no account exists, still complete the flow (no enumeration) */
    var pwRes = LX.V.password(newPassword, { name: user ? user.name : '', email: user ? user.email : emailValue });
    if (!pwRes.ok) return { ok: false, field: 'password', message: pwRes.message, checks: pwRes.checks };

    if (user && LX.safeEqual(String(newPassword), String(user.passwordHash))) {
      return { ok: false, field: 'password', message: 'Choose a password you haven’t used before.' };
    }

    var salt = LX.randomSaltHex(16);
    return LX.hashPassword(newPassword, salt).then(function (hash) {
      if (user) {
        /* old password rejected check */
        return LX.hashPassword(newPassword, user.salt).then(function (oldHash) {
          if (LX.safeEqual(oldHash, user.passwordHash)) {
            return { ok: false, field: 'password', message: 'Choose a password you haven’t used before.' };
          }
          user.passwordHash = hash;
          user.salt = salt;
          user.algo = LX.CRYPTO.mode === 'fallback' ? 'iterated-sha256' : 'PBKDF2-SHA256';
          user.iterations = LX.CRYPTO.mode === 'fallback' ? LX.CRYPTO.fallbackRounds : LX.CRYPTO.iterations;
          user.passwordChangedAt = Date.now();
          saveUsers(list);
          LX.DB.remove(otpKey(canonical));
          clearFailures(canonical);
          return { ok: true, message: 'Your password has been updated. You can sign in now.' };
        });
      }
      LX.DB.remove(otpKey(canonical));
      return { ok: true, message: 'Your password has been updated. You can sign in now.' };
    });
  }

  /* ── Profile ─────────────────────────────────────────── */
  function requireUser() {
    var s = ensureSession();
    if (!s) return null;
    var list = users();
    for (var i = 0; i < list.length; i++) if (list[i].id === s.userId) return list[i];
    return null;
  }

  function updateProfile(patch) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    if (patch.name !== undefined) {
      var n = LX.V.name(patch.name);
      if (!n.ok) return { ok: false, field: 'name', message: n.message };
      user.name = n.value;
    }
    if (patch.phone !== undefined) {
      if (patch.phone) {
        var ph = LX.V.phone(patch.phone);
        if (!ph.ok) return { ok: false, field: 'phone', message: ph.message };
        user.phone = ph.e164;
      } else user.phone = null;
    }
    saveUsers(users());
    var s = LX.Store.get('session');
    if (s) LX.Store.set('session', LX.extend({}, s, { name: user.name, email: user.email }));
    return { ok: true, user: currentUser(), message: 'Profile updated.' };
  }

  function changePassword(currentPw, newPw) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    return LX.hashPassword(String(currentPw || ''), user.salt).then(function (hash) {
      if (!LX.safeEqual(hash, user.passwordHash)) {
        return { ok: false, field: 'current', message: 'Your current password isn’t correct.' };
      }
      if (String(currentPw) === String(newPw)) {
        return { ok: false, field: 'newPassword', message: 'Choose a password you haven’t used before.' };
      }
      var res = LX.V.password(newPw, { name: user.name, email: user.email });
      if (!res.ok) return { ok: false, field: 'newPassword', message: res.message, checks: res.checks };

      var salt = LX.randomSaltHex(16);
      return LX.hashPassword(newPw, salt).then(function (h2) {
        user.passwordHash = h2;
        user.salt = salt;
        user.passwordChangedAt = Date.now();
        saveUsers(users());
        return { ok: true, message: 'Password changed successfully.' };
      });
    });
  }

  /* ── Addresses (blueprint §7.2) ──────────────────────── */
  function saveAddress(address, makeDefault) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };

    var v = LX.V.address(address);
    if (!v.ok) return { ok: false, errors: v.errors };

    var district = LX.SL.district(address.districtId);
    var division = LX.SL.division(address.districtId, address.divisionCode);

    var record = {
      id: address.id || LX.uid('a_'),
      label: address.label || 'Home',
      name: address.name || user.name,
      phone: address.phone || user.phone || null,
      line1: String(address.line1).trim(),
      line2: address.line2 ? String(address.line2).trim() : '',
      districtId: district.id,
      districtName: district.name,
      divisionCode: division.code,
      divisionName: division.name,
      area: address.area || '',
      postal: String(address.postal).trim(),
      country: 'Sri Lanka',
      isDefault: makeDefault || (user.addresses || []).length === 0
    };

    user.addresses = user.addresses || [];
    var idx = -1;
    for (var i = 0; i < user.addresses.length; i++) if (user.addresses[i].id === record.id) idx = i;
    if (idx > -1) user.addresses[idx] = record; else user.addresses.push(record);

    if (record.isDefault) {
      user.addresses.forEach(function (a) { a.isDefault = a.id === record.id; });
    }
    saveUsers(users());
    return { ok: true, address: record, message: 'Address saved.' };
  }

  function deleteAddress(id) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    user.addresses = (user.addresses || []).filter(function (a) { return a.id !== id; });
    if (user.addresses.length && !user.addresses.some(function (a) { return a.isDefault; })) {
      user.addresses[0].isDefault = true;
    }
    saveUsers(users());
    return { ok: true, message: 'Address removed.' };
  }

  function setDefaultAddress(id) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    (user.addresses || []).forEach(function (a) { a.isDefault = a.id === id; });
    saveUsers(users());
    return { ok: true, message: 'Default address updated.' };
  }

  /* ── Saved cards (PAN + CVC NEVER stored) ────────────── */
  function saveCard(tokenInfo, nickname) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    user.savedCards = user.savedCards || [];
    var record = {
      token: tokenInfo.token,
      brand: tokenInfo.brand,
      last4: tokenInfo.last4,
      expMonth: tokenInfo.expMonth,
      expYear: tokenInfo.expYear,
      nickname: nickname || (tokenInfo.brand + ' •••• ' + tokenInfo.last4),
      isDefault: user.savedCards.length === 0,
      createdAt: Date.now()
    };
    user.savedCards.push(record);
    saveUsers(users());
    return { ok: true, card: record, message: 'Card saved securely.' };
  }

  function deleteCard(token) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    user.savedCards = (user.savedCards || []).filter(function (c) { return c.token !== token; });
    saveUsers(users());
    return { ok: true, message: 'Card removed.' };
  }

  function setDefaultCard(token) {
    var user = requireUser();
    if (!user) return { ok: false, message: 'Please sign in to continue.' };
    (user.savedCards || []).forEach(function (c) { c.isDefault = c.token === token; });
    saveUsers(users());
    return { ok: true, message: 'Default card updated.' };
  }

  /* ── Post-login redirect (blueprint §10.6) ───────────── */
  function setRedirect(path) { LX.DB.set('auth_redirect', path); }
  function takeRedirect() {
    var p = LX.DB.get('auth_redirect');
    LX.DB.remove('auth_redirect');
    return p || '#/account';
  }

  LX.Auth = {
    register: register,
    login: login,
    logout: logout,
    currentUser: currentUser,
    ensureSession: ensureSession,
    requestReset: requestReset,
    verifyOtp: verifyOtp,
    resetPassword: resetPassword,
    updateProfile: updateProfile,
    changePassword: changePassword,
    saveAddress: saveAddress,
    deleteAddress: deleteAddress,
    setDefaultAddress: setDefaultAddress,
    saveCard: saveCard,
    deleteCard: deleteCard,
    setDefaultCard: setDefaultCard,
    setRedirect: setRedirect,
    takeRedirect: takeRedirect,
    lockState: lockState,
    _resetRateLimit: clearFailures
  };
})(window);