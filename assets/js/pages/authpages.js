/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/authpages.js
   Sign up · Sign in · Forgot password (3-step OTP wizard)
   (blueprint §9 pipeline UI, §10.1–10.6)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  /* ── Shared widgets ──────────────────────────────────── */
  function emailField(id, opts) {
    opts = opts || {};
    return '' +
      '<div class="field">' +
      '<label class="field-label" for="' + id + '">Email address <span class="req">*</span></label>' +
      '<input class="input" id="' + id + '" type="email" inputmode="email" autocomplete="' + (opts.autocomplete || 'email') + '" placeholder="you@gmail.com" spellcheck="false">' +
      '<div class="field-msg" id="' + id + 'Msg"></div>' +
      '<div class="email-chips">' +
      LX.Email.popular.map(function (d) {
        return '<button type="button" class="chip tiny-chip" data-domain="' + LX.esc(d) + '">@' + LX.esc(d) + '</button>';
      }).join('') +
      '</div>' +
      '</div>';
  }

  function passwordField(id, label, autocomplete) {
    return '' +
      '<div class="field">' +
      '<label class="field-label" for="' + id + '">' + LX.esc(label) + ' <span class="req">*</span></label>' +
      '<div class="input-wrap input-wrap--pw">' +
      '<input class="input" id="' + id + '" type="password" autocomplete="' + (autocomplete || 'new-password') + '" placeholder="••••••••">' +
      '<button type="button" class="pw-toggle" data-pw="' + id + '" aria-label="Show password">' +
      '<svg viewBox="0 0 24 24" width="19" height="19"><path d="M2.5 12S6 5.8 12 5.8 21.5 12 21.5 12 18 18.2 12 18.2 2.5 12 2.5 12z" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" fill="none"/></svg>' +
      '</button>' +
      '</div>' +
      '<div class="field-msg" id="' + id + 'Msg"></div>' +
      '</div>';
  }

  function rulesHTML() {
    return '<div class="pw-rules" id="pwRules">' +
      [['length', 'At least 8 characters'], ['uppercase', 'One uppercase (A–Z)'], ['lowercase', 'One lowercase (a–z)'],
      ['digit', 'One number (0–9)'], ['symbol', 'One symbol — bonus']].map(function (r) {
        return '<div class="pw-rule" data-rule="' + r[0] + '"><i class="tick">✓</i><span>' + r[1] + '</span></div>';
      }).join('') +
      '</div>';
  }

  function strengthHTML() {
    return '<div class="pw-strength" id="pwStrength">' +
      '<div class="row-between"><span class="tiny muted">Password strength</span><span class="tiny" id="pwStrengthLabel">—</span></div>' +
      '<div class="meter"><i id="pwStrengthBar" style="width:0%"></i></div>' +
      '</div>';
  }

  function phoneField(id, value) {
    return '' +
      '<div class="field">' +
      '<label class="field-label" for="' + id + '">Mobile number <span class="muted">(optional)</span></label>' +
      '<div class="input-wrap has-prefix">' +
      '<span class="input-prefix">🇱🇰 +94</span>' +
      '<input class="input" id="' + id + '" type="tel" inputmode="numeric" autocomplete="tel-national" placeholder="77 123 4567" maxlength="12" value="' + LX.esc(value || '') + '">' +
      '</div>' +
      '<div class="field-msg hint">Sri Lankan numbers only · starts with 7</div>' +
      '<div class="field-msg" id="' + id + 'Msg"></div>' +
      '</div>';
  }

  /* Email live validation + typo suggestion */
  function wireEmail(input, msg, opts) {
    opts = opts || {};
    function run() {
      var v = input.value.trim();
      if (!v) { LX.CardForm.clearError(input, msg); return; }
      var r = LX.Email.validate(v);
      if (r.ok) {
        LX.CardForm.showOk(input, msg, r.providerLabel + ' address verified' + (r.plusTag ? ' · tag ignored for sign-in' : ''));
        return;
      }
      if (r.code === 'typo' && r.suggestion) {
        LX.CardForm.clearError(input, msg);
        msg.className = 'field-msg warn';
        msg.innerHTML = 'Did you mean <b>' + LX.esc(r.suggestion) + '</b>? ' +
          '<button type="button" class="btn-link" data-fix-email="' + LX.esc(r.suggestion) + '">Yes, fix it</button>';
        var fix = msg.querySelector('[data-fix-email]');
        if (fix) fix.addEventListener('click', function () {
          input.value = r.suggestion;
          run();
          input.focus();
        });
        return;
      }
      LX.CardForm.showError(input, msg, r.message);
      if (r.hint) {
        var hint = document.createElement('div');
        hint.className = 'field-msg hint';
        hint.textContent = r.hint;
        if (msg.nextElementSibling === null || !msg.nextElementSibling.classList.contains('hint')) {
          msg.parentNode.insertBefore(hint, msg.nextSibling);
        } else {
          msg.nextElementSibling.textContent = r.hint;
        }
      }
    }
    input.addEventListener('input', function () {
      LX.CardForm.clearError(input, msg);
      if (opts.onChange) opts.onChange();
    });
    input.addEventListener('blur', run);
    return run;
  }

  function wirePasswordToggle() {
    $$('[data-pw]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.getAttribute('data-pw'));
        if (!input) return;
        var showing = input.type === 'text';
        input.type = showing ? 'password' : 'text';
        btn.classList.toggle('active', !showing);
        btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      });
    });
  }

  function wirePasswordRules(input, opts) {
    opts = opts || {};
    var rules = $('#pwRules');
    var bar = $('#pwStrengthBar');
    var label = $('#pwStrengthLabel');

    function run() {
      var r = LX.V.password(input.value, opts.ctx ? opts.ctx() : {});
      if (rules) {
        $$('.pw-rule', rules).forEach(function (node) {
          var key = node.getAttribute('data-rule');
          node.classList.toggle('ok', !!r.checks[key].ok);
          node.classList.toggle('req-miss', r.checks[key].required && !r.checks[key].ok);
        });
      }
      if (bar) {
        bar.style.width = r.score.score + '%';
        bar.style.background = r.score.color;
      }
      if (label) {
        label.textContent = input.value ? r.score.label : '—';
        label.style.color = r.score.color;
      }
      return r;
    }
    input.addEventListener('input', run);
    return run;
  }

  function wirePhone(input) {
    input.addEventListener('input', function () {
      input.value = LX.V.formatPhoneInput(input.value);
      var msg = input.closest('.field').querySelector('#' + input.id + 'Msg');
      if (msg) {
        if (input.value.replace(/\D/g, '').length === 9) {
          var r = LX.V.phone(input.value);
          if (r.ok) LX.CardForm.showOk(input, msg, 'Mobile number verified');
          else LX.CardForm.showError(input, msg, r.message);
        } else LX.CardForm.clearError(input, msg);
      }
    });
  }

  /* Blueprint §10.3 — "Disable submit until valid".
     The gate re-evaluates on every input/change so the button unlocks the
     moment the form is complete. Field-level messages still explain what is
     missing, so a disabled button is never a dead end. */
  function wireSubmitGate(form, submit, computeValid) {
    function refresh() {
      if (submit.getAttribute('data-busy') === '1') return;   // in-flight request
      var ok = false;
      try { ok = !!computeValid(); } catch (e) { ok = false; }
      submit.disabled = !ok;
    }
    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    form.addEventListener('keyup', refresh);
    refresh();
    return refresh;
  }

  /* ═══ SIGN UP ══════════════════════════════════════════ */
  function renderSignup() {
    return '' +
      '<section class="auth-wrap">' +
      '<div class="auth-card">' +
      '<div class="auth-head">' +
      '<p class="label label-gold">Join us</p>' +
      '<h1 class="h-serif">Create your account</h1>' +
      '<p class="muted">Save your addresses, track orders and check out faster.</p>' +
      '</div>' +

      '<form id="signupForm" novalidate>' +
      '<div class="field">' +
      '<label class="field-label" for="suName">Full name <span class="req">*</span></label>' +
      '<input class="input" id="suName" type="text" autocomplete="name" placeholder="Nadeesha Perera">' +
      '<div class="field-msg" id="suNameMsg"></div>' +
      '</div>' +

      emailField('suEmail') +
      phoneField('suPhone') +
      passwordField('suPassword', 'Password', 'new-password') +
      rulesHTML() +
      strengthHTML() +
      passwordField('suConfirm', 'Confirm password', 'new-password') +

      '<label class="check" style="margin:1.15rem 0">' +
      '<input type="checkbox" id="suTerms">' +
      '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>I agree to the <a class="btn-link" href="#/about">Terms of Service</a> and <a class="btn-link" href="#/about">Privacy Policy</a>.</span>' +
      '</label>' +
      '<div class="field-msg" id="suTermsMsg"></div>' +

      '<button class="btn btn-gold btn-block btn-lg" type="submit" id="suSubmit">Create Account</button>' +
      '</form>' +

      '<p class="auth-alt">Already have an account? <a class="btn-link" href="#/login">Sign in</a></p>' +
      '</div>' +
      '</section>';
  }

  function mountSignup(root) {
    var fName = $('#suName', root), fNameMsg = $('#suNameMsg', root);
    var fEmail = $('#suEmail', root);
    var fPhone = $('#suPhone', root);
    var fPw = $('#suPassword', root);
    var fConfirm = $('#suConfirm', root), fConfirmMsg = $('#suConfirmMsg', root);
    var fTerms = $('#suTerms', root), fTermsMsg = $('#suTermsMsg', root);
    var submit = $('#suSubmit', root);
    var form = $('#signupForm', root);

    wireEmail(fEmail, $('#suEmailMsg', root));
    wirePhone(fPhone);
    wirePasswordToggle();

    var runRules = wirePasswordRules(fPw, {
      ctx: function () { return { name: fName.value, email: fEmail.value }; }
    });

    fName.addEventListener('input', function () { LX.CardForm.clearError(fName, fNameMsg); runRules(); });
    fConfirm.addEventListener('input', function () {
      LX.CardForm.clearError(fConfirm, fConfirmMsg);
      if (fConfirm.value && fConfirm.value !== fPw.value) {
        LX.CardForm.showError(fConfirm, fConfirmMsg, 'Both passwords must match.');
      } else if (fConfirm.value) {
        LX.CardForm.showOk(fConfirm, fConfirmMsg);
      }
    });

    $$('.email-chips [data-domain]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var local = fEmail.value.split('@')[0].trim();
        fEmail.value = (local || 'you') + '@' + btn.getAttribute('data-domain');
        fEmail.dispatchEvent(new Event('input'));
        fEmail.focus();
      });
    });

    /* Read the same live rule list the user sees — never a second source of truth. */
    function passwordRulesPass() {
      runRules();
      var items = $$('#pwRules .pw-rule', root);
      if (!items.length) return false;
      for (var i = 0; i < items.length; i++) {
        if ((' ' + items[i].className + ' ').indexOf(' ok ') === -1) return false;
      }
      return true;
    }

    wireSubmitGate(form, submit, function () {
      return !!fName.value.trim() && LX.V.name(fName.value).ok &&
        LX.Email.validate(fEmail.value).ok &&
        LX.V.phone(fPhone.value).ok &&
        !!fPw.value && passwordRulesPass() &&
        fConfirm.value === fPw.value &&
        fTerms.checked;
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var nameRes = LX.V.name(fName.value);
      if (!nameRes.ok) { LX.CardForm.showError(fName, fNameMsg, nameRes.message); fName.focus(); return; }
      LX.CardForm.showOk(fName, fNameMsg);

      var emailRes = LX.Email.validate(fEmail.value);
      if (!emailRes.ok) {
        LX.CardForm.showError(fEmail, $('#suEmailMsg', root), emailRes.message);
        fEmail.focus();
        return;
      }

      if (!fTerms.checked) {
        fTermsMsg.textContent = 'Please accept the terms & conditions to continue.';
        fTermsMsg.className = 'field-msg error';
        return;
      }
      fTermsMsg.textContent = '';

      if (fPw.value !== fConfirm.value) {
        LX.CardForm.showError(fConfirm, fConfirmMsg, 'Both passwords must match.');
        fConfirm.focus();
        return;
      }

      submit.disabled = true;
      submit.setAttribute('data-busy', '1');
      submit.innerHTML = '<span class="spinner spinner-light"></span> Creating account…';

      LX.Api.auth.register({
        name: fName.value,
        email: fEmail.value,
        phone: fPhone.value,
        password: fPw.value,
        confirm: fConfirm.value,
        terms: fTerms.checked,
        remember: true
      }).then(function (res) {
        submit.disabled = false;
        submit.removeAttribute('data-busy');
        submit.textContent = 'Create Account';

        if (!res.ok) {
          if (res.field === 'email') {
            LX.CardForm.showError(fEmail, $('#suEmailMsg', root), res.message);
            fEmail.focus();
          } else if (res.field === 'password') {
            LX.CardForm.showError(fPw, $('#suPasswordMsg', root), res.message);
            fPw.focus();
          } else if (res.field === 'confirm') {
            LX.CardForm.showError(fConfirm, fConfirmMsg, res.message);
          } else if (res.field === 'phone') {
            LX.CardForm.showError(fPhone, $('#suPhoneMsg', root), res.message);
          } else {
            LX.CardForm.showError(fName, fNameMsg, res.message);
          }
          LX.UI.toast({ type: 'error', title: 'Could not create account', message: res.message });
          return;
        }

        LX.UI.toast({ type: 'success', title: 'Welcome to LUXE INTIMO', message: 'Your account is ready, ' + res.user.name.split(' ')[0] + '.' });
        LX.Router.go(LX.Auth.takeRedirect());
      }).catch(function (err) {
        submit.disabled = false;
        submit.removeAttribute('data-busy');
        submit.textContent = 'Create Account';
        LX.UI.toast({ type: 'error', title: 'Something went wrong', message: String(err && err.message || err) });
      });
    });
  }

  /* ═══ LOGIN ════════════════════════════════════════════ */
  function renderLogin() {
    return '' +
      '<section class="auth-wrap">' +
      '<div class="auth-card">' +
      '<div class="auth-head">' +
      '<p class="label label-gold">Welcome back</p>' +
      '<h1 class="h-serif">Sign in</h1>' +
      '<p class="muted">Access your orders, addresses and saved cards.</p>' +
      '</div>' +

      '<form id="loginForm" novalidate>' +
      emailField('liEmail') +
      passwordField('liPassword', 'Password', 'current-password') +

      '<div class="row-between" style="margin:.35rem 0 1.35rem">' +
      '<label class="check"><input type="checkbox" id="liRemember" checked>' +
      '<span class="box"><svg viewBox="0 0 24 24" width="12" height="12"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#0B0B0D" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg></span>' +
      '<span>Remember me</span></label>' +
      '<a class="btn-link" href="#/forgot">Forgot password?</a>' +
      '</div>' +

      '<div class="field-msg error" id="liFormMsg" style="margin-bottom:.85rem"></div>' +

      '<button class="btn btn-gold btn-block btn-lg" type="submit" id="liSubmit">Sign In</button>' +
      '</form>' +

      '<p class="auth-alt">New to LUXE INTIMO? <a class="btn-link" href="#/signup">Create an account</a></p>' +
      '</div>' +
      '</section>';
  }

  function mountLogin(root) {
    var fEmail = $('#liEmail', root);
    var fPw = $('#liPassword', root);
    var fRemember = $('#liRemember', root);
    var formMsg = $('#liFormMsg', root);
    var submit = $('#liSubmit', root);
    var form = $('#loginForm', root);

    wireEmail(fEmail, $('#liEmailMsg', root), {});
    wirePasswordToggle();

    wireSubmitGate(form, submit, function () {
      return LX.Email.validate(fEmail.value, { skipTypoHint: true }).ok && !!fPw.value;
    });

    /* lockout countdown */
    var countdownTimer = null;
    function startCountdown(seconds) {
      if (countdownTimer) clearInterval(countdownTimer);
      var left = seconds;
      submit.disabled = true;
      submit.setAttribute('data-busy', '1');   // hold the gate closed for the lockout
      formMsg.textContent = 'Too many attempts. Try again in ' + left + 's';
      countdownTimer = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(countdownTimer);
          submit.disabled = false;
          submit.removeAttribute('data-busy');
          formMsg.textContent = '';
          return;
        }
        formMsg.textContent = 'Too many attempts. Try again in ' + left + 's';
      }, 1000);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var emailRes = LX.Email.validate(fEmail.value, { skipTypoHint: true });
      if (!emailRes.ok && emailRes.code !== 'typo') {
        LX.CardForm.showError(fEmail, $('#liEmailMsg', root), emailRes.message);
        fEmail.focus();
        return;
      }
      if (!fPw.value) {
        LX.CardForm.showError(fPw, $('#liPasswordMsg', root), 'Enter your password.');
        fPw.focus();
        return;
      }

      submit.disabled = true;
      submit.setAttribute('data-busy', '1');
      submit.innerHTML = '<span class="spinner spinner-light"></span> Signing in…';
      formMsg.textContent = '';

      LX.Api.auth.login({
        email: fEmail.value,
        password: fPw.value,
        remember: fRemember.checked
      }).then(function (res) {
        if (!res.ok) {
          submit.disabled = false;
          submit.removeAttribute('data-busy');
          submit.textContent = 'Sign In';

          if (res.locked) {
            startCountdown(res.seconds || 30);
            LX.CardForm.showError(fPw, $('#liPasswordMsg', root), res.message);
            return;
          }
          LX.CardForm.showError(fPw, $('#liPasswordMsg', root), res.message);
          formMsg.textContent = res.attemptsLeft !== undefined && res.attemptsLeft <= 2
            ? res.message : '';
          fPw.focus();
          return;
        }

        submit.textContent = 'Signed in ✓';
        LX.UI.toast({ type: 'success', title: 'Welcome back', message: 'Signed in as ' + res.user.name + '.' });
        LX.Router.go(LX.Auth.takeRedirect());
      }).catch(function (err) {
        submit.disabled = false;
        submit.removeAttribute('data-busy');
        submit.textContent = 'Sign In';
        LX.UI.toast({ type: 'error', title: 'Something went wrong', message: String(err && err.message || err) });
      });
    });
  }

  /* ═══ FORGOT (3-step wizard) ═══════════════════════════ */
  var wizard = { step: 1, email: '', code: '', devCode: null };

  function renderForgot() {
    return '' +
      '<section class="auth-wrap">' +
      '<div class="auth-card">' +
      '<div class="auth-head">' +
      '<p class="label label-gold">Account recovery</p>' +
      '<h1 class="h-serif">Reset your password</h1>' +
      '</div>' +
      '<div class="wizard-steps" id="wizardSteps">' +
      ['Request code', 'Verify code', 'New password'].map(function (s, i) {
        return '<div class="wizard-step' + (i === 0 ? ' active' : '') + '" data-step="' + (i + 1) + '">' +
          '<i>' + (i + 1) + '</i><span>' + s + '</span></div>';
      }).join('') +
      '</div>' +
      '<div id="forgotBody"></div>' +
      '<p class="auth-alt">Remembered it? <a class="btn-link" href="#/login">Back to sign in</a></p>' +
      '</div>' +
      '</section>';
  }

  function forgotStepHTML(step) {
    if (step === 1) {
      return '<form id="fgStep1">' +
        '<p class="muted">Enter the email address on your account and we’ll generate a verification code.</p>' +
        emailField('fgEmail') +
        '<button class="btn btn-gold btn-block btn-lg" type="submit" id="fgSend">Send verification code</button>' +
        '</form>';
    }
    if (step === 2) {
      return '<form id="fgStep2">' +
        '<p class="muted">Enter the 6-digit code sent to <b>' + LX.esc(wizard.email) + '</b>.</p>' +
        '<div class="otp-row" id="otpRow">' +
        Array.apply(null, Array(6)).map(function (_, i) {
          return '<input class="otp-box" type="text" inputmode="numeric" maxlength="1" data-otp="' + i + '" aria-label="Digit ' + (i + 1) + '">';
        }).join('') +
        '</div>' +
        '<div class="field-msg" id="otpMsg"></div>' +
        '<div class="row-between" style="margin:1.15rem 0">' +
        '<span class="muted tiny" id="otpTimer">Code expires in 5:00</span>' +
        '<button type="button" class="btn-link" id="fgResend">Resend code</button>' +
        '</div>' +
        '<button class="btn btn-gold btn-block btn-lg" type="submit" id="fgVerify">Verify code</button>' +
        '</form>';
    }
    return '<form id="fgStep3">' +
      '<p class="muted">Choose a new password for <b>' + LX.esc(wizard.email) + '</b>.</p>' +
      passwordField('fgPassword', 'New password', 'new-password') +
      rulesHTML() +
      strengthHTML() +
      passwordField('fgConfirm', 'Confirm new password', 'new-password') +
      '<button class="btn btn-gold btn-block btn-lg" type="submit" id="fgReset">Update password</button>' +
      '</form>';
  }

  function mountForgot(root) {
    var body = $('#forgotBody', root);
    var steps = $$('.wizard-step', root);

    function goStep(n) {
      wizard.step = n;
      steps.forEach(function (s, i) {
        s.classList.toggle('active', i === n - 1);
        s.classList.toggle('done', i < n - 1);
      });
      body.innerHTML = forgotStepHTML(n);
      if (n === 1) wireStep1();
      if (n === 2) wireStep2();
      if (n === 3) wireStep3();
    }

    /* ── Step 1 ───────────────────────────────────────── */
    function wireStep1() {
      var fEmail = $('#fgEmail', body);
      wireEmail(fEmail, $('#fgEmailMsg', body));
      $$('.email-chips [data-domain]', body).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var local = fEmail.value.split('@')[0].trim();
          fEmail.value = (local || 'you') + '@' + btn.getAttribute('data-domain');
          fEmail.dispatchEvent(new Event('input'));
          fEmail.focus();
        });
      });

      $('#fgStep1', body).addEventListener('submit', function (e) {
        e.preventDefault();
        var btn = $('#fgSend', body);
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner spinner-light"></span> Generating code…';

        LX.Api.auth.requestReset(fEmail.value).then(function (res) {
          btn.disabled = false;
          btn.textContent = 'Send verification code';
          if (!res.ok) {
            LX.CardForm.showError(fEmail, $('#fgEmailMsg', body), res.message);
            return;
          }
          wizard.email = fEmail.value.trim();
          wizard.devCode = res.devCode;
          LX.UI.toast({ type: 'info', title: 'Code generated', message: 'Use the code shown below (demo mode).' });
          goStep(2);
        });
      });
    }

    /* ── Step 2 ───────────────────────────────────────── */
    function wireStep2() {
      var boxes = $$('.otp-box', body);
      var msg = $('#otpMsg', body);

      /* DEV MODE box (blueprint §10.5) */
      if (wizard.devCode) {
        var devBox = LX.el('div', { class: 'inline-note note-info', style: 'margin-bottom:1.1rem' });
        devBox.innerHTML =
          '<div style="width:100%">' +
          '<div class="label label-gold">Dev mode — your code</div>' +
          '<div class="row-between" style="margin-top:.55rem">' +
          '<b class="otp-devcode">' + LX.esc(wizard.devCode) + '</b>' +
          '<button type="button" class="btn btn-quiet btn-sm" id="fgAutofill">Autofill</button>' +
          '</div></div>';
        body.insertBefore(devBox, body.firstChild);
        $('#fgAutofill', body).addEventListener('click', function () {
          var code = wizard.devCode.split('');
          boxes.forEach(function (b, i) { b.value = code[i] || ''; });
          boxes[5].focus();
          msg.textContent = '';
        });
      }

      boxes.forEach(function (box, i) {
        box.addEventListener('input', function () {
          box.value = box.value.replace(/\D/g, '').slice(0, 1);
          if (box.value && i < 5) boxes[i + 1].focus();
          if (boxes.every(function (b) { return b.value; })) {
            setTimeout(function () { $('#fgStep2', body).requestSubmit ? $('#fgStep2', body).requestSubmit() : null; }, 120);
          }
        });
        box.addEventListener('keydown', function (e) {
          if (e.key === 'Backspace' && !box.value && i > 0) boxes[i - 1].focus();
          if (e.key === 'ArrowLeft' && i > 0) boxes[i - 1].focus();
          if (e.key === 'ArrowRight' && i < 5) boxes[i + 1].focus();
        });
        box.addEventListener('paste', function (e) {
          e.preventDefault();
          var text = (e.clipboardData || global.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
          for (var k = 0; k < 6; k++) boxes[k].value = text.charAt(k) || '';
          if (text.length >= 6) boxes[5].focus();
        });
      });

      /* countdown */
      var left = 300;
      var timerEl = $('#otpTimer', body);
      var timer = setInterval(function () {
        left--;
        if (left <= 0) {
          clearInterval(timer);
          if (timerEl) timerEl.innerHTML = '<span style="color:var(--err)">Code expired</span>';
          return;
        }
        if (timerEl) timerEl.textContent = 'Code expires in ' + Math.floor(left / 60) + ':' + LX.pad(left % 60);
      }, 1000);
      body._otpTimer = timer;

      $('#fgResend', body).addEventListener('click', function () {
        LX.Api.auth.requestReset(wizard.email).then(function (res) {
          wizard.devCode = res.devCode;
          LX.UI.toast({ type: 'info', message: 'A new code has been generated.' });
          goStep(2);
        });
      });

      $('#fgStep2', body).addEventListener('submit', function (e) {
        e.preventDefault();
        var code = boxes.map(function (b) { return b.value; }).join('');
        if (code.length < 6) {
          msg.textContent = 'Enter all 6 digits.';
          msg.className = 'field-msg error';
          return;
        }
        var btn = $('#fgVerify', body);
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner spinner-light"></span> Verifying…';

        LX.Api.auth.verifyOtp(wizard.email, code).then(function (res) {
          btn.disabled = false;
          btn.textContent = 'Verify code';
          if (!res.ok) {
            msg.textContent = res.message;
            msg.className = 'field-msg error';
            if (res.restart) {
              setTimeout(function () { goStep(1); }, 1200);
            }
            return;
          }
          wizard.code = code;
          goStep(3);
        });
      });
    }

    /* ── Step 3 ───────────────────────────────────────── */
    function wireStep3() {
      var fPw = $('#fgPassword', body);
      var fConfirm = $('#fgConfirm', body);
      wirePasswordToggle();
      var runRules = wirePasswordRules(fPw, { ctx: function () { return { email: wizard.email }; } });

      fConfirm.addEventListener('input', function () {
        var msg = $('#fgConfirmMsg', body);
        if (fConfirm.value && fConfirm.value !== fPw.value) LX.CardForm.showError(fConfirm, msg, 'Both passwords must match.');
        else if (fConfirm.value) LX.CardForm.showOk(fConfirm, msg);
        else LX.CardForm.clearError(fConfirm, msg);
      });

      $('#fgStep3', body).addEventListener('submit', function (e) {
        e.preventDefault();
        runRules();

        if (fPw.value !== fConfirm.value) {
          LX.CardForm.showError(fConfirm, $('#fgConfirmMsg', body), 'Both passwords must match.');
          return;
        }

        var btn = $('#fgReset', body);
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner spinner-light"></span> Updating…';

        LX.Api.auth.resetPassword(wizard.email, wizard.code, fPw.value).then(function (res) {
          btn.disabled = false;
          btn.textContent = 'Update password';
          if (!res.ok) {
            if (res.field === 'password') LX.CardForm.showError(fPw, $('#fgPasswordMsg', body), res.message);
            else LX.UI.toast({ type: 'error', message: res.message });
            return;
          }
          body.innerHTML =
            '<div class="empty" style="padding:1.6rem 0">' +
            '<div class="empty-icon" style="color:var(--ok)">' +
            '<svg viewBox="0 0 24 24" width="32" height="32"><circle cx="12" cy="12" r="9.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7.8 12.4l2.9 2.9 5.6-6.2" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
            '</div>' +
            '<h3>Password updated</h3>' +
            '<p>Your password has been changed. Sign in with your new password.</p>' +
            '<a class="btn btn-gold" href="#/login">Sign In</a>' +
            '</div>';
          LX.UI.toast({ type: 'success', title: 'Password updated', message: res.message });
        });
      });
    }

    goStep(1);
  }

  LX.Pages.signup = { title: 'Create Account', render: renderSignup, mount: mountSignup };
  LX.Pages.login = { title: 'Sign In', render: renderLogin, mount: mountLogin };
  LX.Pages.forgot = { title: 'Reset Password', render: renderForgot, mount: mountForgot };
})(window);