/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — ui/captcha.js
   Fake reCAPTCHA v2 replica (blueprint §12)
   ⚠ Trademark: CAPTCHA_BRAND = 'generic' swaps the mark
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$;

  var EXPIRY_MS = 2 * 60 * 1000; /* 2 minutes (blueprint §12.3) */

  /* reCAPTCHA-style mark (blue §4285f4 / deep #1c3aa9) */
  var MARK_SVG =
    '<svg class="rc-mark" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">' +
    '<path fill="#1c3aa9" d="M24 4c11 0 20 9 20 20 0 11-9 20-20 20S4 35 4 24 13 4 24 4z" opacity=".16"/>' +
    '<path fill="#4285f4" d="M24 8c8.8 0 16 7.2 16 16 0 8.8-7.2 16-16 16S8 32.8 8 24 15.2 8 24 8z" opacity=".22"/>' +
    '<path fill="#4285f4" d="M35.6 17.4A12.7 12.7 0 0 0 24 11.3V6.4A17.7 17.7 0 0 1 41.6 22h-4.9c0-1.8-.4-3.5-1.1-4.6z"/>' +
    '<path fill="#1c3aa9" d="M24 36.7c-3.4 0-6.5-1.3-8.8-3.4l-3.5 3.6A17.6 17.6 0 0 0 24 41.6v-4.9z" opacity=".85"/>' +
    '<path fill="#4285f4" d="M36.5 25.2H24v-7.2h12.2c-.6-3.3-2.2-6.3-4.6-8.6l3.5-3.5A17.4 17.4 0 0 1 42 24c0 1.1-.1 2.1-.3 3.2h-5.2z" opacity=".9"/>' +
    '<path fill="#1c3aa9" d="M12.1 33.3l3.5-3.5a11.7 11.7 0 0 0 8.4 3.5h.1V42c-5 0-9.6-2.1-12.8-5.4l.8-3.3z" opacity=".8"/>' +
    '</svg>';

  var GENERIC_SVG =
    '<svg class="rc-mark" viewBox="0 0 48 48" width="34" height="34" aria-hidden="true">' +
    '<circle cx="24" cy="24" r="17" fill="none" stroke="#4E9E6A" stroke-width="3"/>' +
    '<path d="M16 24.5l6 6 11-12" fill="none" stroke="#4E9E6A" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function brandMark() {
    return (LX.Config && LX.Config.CAPTCHA_BRAND === 'generic') ? GENERIC_SVG : MARK_SVG;
  }

  function mount(container, opts) {
    opts = opts || {};
    var verified = false;
    var expiryTimer = null;
    var destroyed = false;

    var label = (LX.Config && LX.Config.CAPTCHA_BRAND === 'generic')
      ? 'Security check' : 'I’m not a robot';
    var brandName = (LX.Config && LX.Config.CAPTCHA_BRAND === 'generic')
      ? 'SecureCheck' : 'reCAPTCHA';

    container.innerHTML =
      '<div class="rc-box" role="checkbox" aria-checked="false" tabindex="0" aria-label="' + LX.esc(label) + '">' +
      '<div class="rc-left">' +
      '<div class="rc-check">' +
      '<span class="rc-spinner" aria-hidden="true"></span>' +
      '<svg class="rc-tick" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12.6l4.8 5 10-11" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '</div>' +
      '<div class="rc-label">' + LX.esc(label) + '</div>' +
      '</div>' +
      '<div class="rc-right">' +
      brandMark() +
      '<div class="rc-brand">' + LX.esc(brandName) + '</div>' +
      '<div class="rc-terms"><button type="button" class="rc-link" data-rc="privacy">Privacy</button> - <button type="button" class="rc-link" data-rc="terms">Terms</button></div>' +
      '<button type="button" class="rc-refresh" data-rc="refresh" title="Reset" aria-label="Reset verification">↻</button>' +
      '</div>' +
      '</div>' +
      '<div class="rc-msg" aria-live="polite"></div>';

    var box = container.querySelector('.rc-box');
    var msg = container.querySelector('.rc-msg');

    function setMsg(text, tone) {
      if (!msg) return;
      msg.textContent = text || '';
      msg.className = 'rc-msg' + (tone ? ' rc-msg-' + tone : '');
    }

    function verify() {
      if (verified || destroyed) return;
      var dev = LX.Store.get('dev') || {};
      if (dev.skipCaptcha) {
        verified = true;
        paintVerified();
        emit();
        return;
      }
      box.classList.add('rc-loading');
      setMsg('');
      var delay = 600 + Math.floor(Math.random() * 500);
      setTimeout(function () {
        if (destroyed) return;
        box.classList.remove('rc-loading');
        verified = true;
        paintVerified();
        setMsg('Verified', 'ok');
        startExpiry();
        emit();
      }, delay);
    }

    function paintVerified() {
      box.classList.add('rc-verified');
      box.setAttribute('aria-checked', 'true');
    }

    function reset(silent) {
      verified = false;
      box.classList.remove('rc-verified', 'rc-loading');
      box.setAttribute('aria-checked', 'false');
      if (expiryTimer) { clearTimeout(expiryTimer); expiryTimer = null; }
      if (!silent) setMsg('');
      emit();
    }

    function startExpiry() {
      if (expiryTimer) clearTimeout(expiryTimer);
      expiryTimer = setTimeout(function () {
        if (destroyed) return;
        reset(true);
        setMsg('Verification expired. Check the checkbox again.', 'warn');
      }, EXPIRY_MS);
    }

    function emit() {
      if (opts.onChange) opts.onChange(verified);
    }

    /* ── Events ──────────────────────────────────────── */
    box.addEventListener('click', verify);
    box.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter' || e.keyCode === 32 || e.keyCode === 13) {
        e.preventDefault();
        verify();
      }
    });

    container.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-rc]') : null;
      if (!btn) return;
      var action = btn.getAttribute('data-rc');
      if (action === 'refresh') {
        e.preventDefault(); e.stopPropagation();
        reset(true);
        setMsg('Verification reset.', 'info');
      } else if (action === 'privacy' || action === 'terms') {
        e.preventDefault(); e.stopPropagation();
        showLegal(action);
      }
    });

    function showLegal(kind) {
      LX.UI.openModal({
        title: kind === 'privacy' ? 'Privacy Policy' : 'Terms of Service',
        body:
          '<div class="muted small stack">' +
          '<p>This is a demonstration build. No data leaves your device — everything is stored locally in your browser.</p>' +
          '<p>Card details are never stored. Only the card brand and last four digits are kept, and only if you choose to save the card.</p>' +
          (kind === 'terms'
            ? '<p>By placing an order you agree that this is a test storefront. No real payment is taken and no goods are shipped.</p>'
            : '<p>Local account data can be exported or deleted at any time from the developer panel.</p>') +
          '</div>',
        actions: [{ label: 'Close', variant: 'btn-gold', onClick: function (c) { c(); } }]
      });
    }

    /* Dev shortcut */
    if ((LX.Store.get('dev') || {}).skipCaptcha) {
      verified = true;
      paintVerified();
      setTimeout(emit, 0);
    }

    return {
      isVerified: function () { return verified; },
      reset: reset,
      destroy: function () {
        destroyed = true;
        if (expiryTimer) clearTimeout(expiryTimer);
        container.innerHTML = '';
      }
    };
  }

  LX.Captcha = { mount: mount, EXPIRY_MS: EXPIRY_MS };
})(window);