/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — app.js
   Boot sequence
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  function seedIfNeeded() {
    /* Keep seeded reviews stable across reloads */
    if (!LX.DB.get('reviews')) {
      LX.DB.set('reviews', LX.Catalog.reviews);
    }
    if (!LX.DB.get('seed_version')) {
      LX.DB.set('seed_version', 'luxe_intimo_v1');
    }
  }

  function checkSessionExpiry() {
    var s = LX.Store.get('session');
    if (s && s.expiresAt && s.expiresAt < Date.now()) {
      LX.Store.set('session', null, undefined, { immediate: true });
      LX.UI.toast({
        type: 'info',
        title: 'Session expired',
        message: 'You’ve been signed out for security. Please sign in again.'
      });
    }
  }

  function boot() {
    try {
      LX.Store.init();
    } catch (e) {
      console.error('[LX] store init failed', e);
    }

    seedIfNeeded();
    LX.UI.init();
    checkSessionExpiry();

    /* periodic session check (every 5 min) */
    setInterval(checkSessionExpiry, 5 * 60 * 1000);

    /* cross-tab awareness */
    LX.Store.subscribe('change:session', function (session) {
      if (!session) {
        var route = LX.Router.current();
        if (route && ['/account', '/orders', '/addresses', '/settings'].indexOf(route.path) > -1) {
          LX.Router.go('#/login');
        }
      }
    });

    LX.Router.start();

    /* diagnostics for the console */
    if (global.console && console.log) {
      console.log(
        '%c LUXE INTIMO %c v' + LX.VERSION + ' ',
        'background:#C9A961;color:#0B0B0D;font-weight:700;padding:3px 8px;border-radius:3px 0 0 3px',
        'background:#16161A;color:#F5F1EA;padding:3px 8px;border-radius:0 3px 3px 0'
      );
      console.log('  storage :', LX.DB.mode(), '·', LX.DB.usageReport().human);
      console.log('  crypto  :', LX.CRYPTO.mode === 'fallback' ? 'iterated SHA-256 (fallback)' : 'PBKDF2-SHA256 @ ' + LX.CRYPTO.iterations);
      console.log('  api     :', LX.Api.describe().mode, '·', LX.Api.describe().gateway);
      console.log('  explore :', 'LX.Catalog.all() · LX.SL.districts · LX.Card.TEST_CARDS · LX.DB.exportJSON()');
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);