/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/api.js
   ★ SWAP POINT ★  Mock REST + payment gateway contract
   Flip LX.Config.USE_MOCK = false + BASE_URL to go real.
   (blueprint §4.1, §11.7, §18)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ═══ CONFIG — the only two lines you touch to go live ═══ */
  var Config = {
    USE_MOCK: true,
    BASE_URL: 'https://api.luxeintimo.lk/v1',
    CURRENCY: 'LKR',
    CAPTCHA_BRAND: 'recaptcha',   // 'recaptcha' | 'generic'
    SESSION_DAYS_REMEMBER: 7,
    SESSION_DAYS_DEFAULT: 1,
    PBKDF2_ITERATIONS: 100000,
    APP_NAME: 'LUXE INTIMO',
    WHATSAPP: '94770000000'
  };

  /* ── Simulated network ───────────────────────────────── */
  function dev() { return LX.Store.get('dev') || {}; }
  function latency(base) {
    var d = dev();
    var ms = base === undefined ? 260 : base;
    if (d.instantPayment) ms = Math.min(ms, 12);
    if (d.slowNetwork) ms *= 4;
    return LX.sleep(ms);
  }

  function http(method, path, body) {
    /* Real transport — used when Config.USE_MOCK === false */
    return fetch(Config.BASE_URL.replace(/\/$/, '') + path, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include'
    }).then(function (r) {
      return r.json().then(function (data) {
        if (!r.ok) throw Object.assign(new Error(data.message || 'Request failed'), { status: r.status, data: data });
        return data;
      });
    });
  }

  /* ── IDs ─────────────────────────────────────────────── */
  function newIntentId() { return 'pi_' + LX.uid().slice(0, 24); }
  function newTokenId() { return 'pm_' + LX.uid().slice(0, 24); }
  function newRefundId() { return 're_' + LX.uid().slice(0, 24); }

  /* ── Payment gateway contract (blueprint §11.7) ──────── */
  var gateway = {
    createIntent: function (amount, currency, meta) {
      var intent = {
        id: newIntentId(),
        amount: Math.round(amount),
        currency: currency || Config.CURRENCY,
        status: 'requires_payment_method',
        clientSecret: LX.uid() + '_secret_' + LX.uid().slice(0, 10),
        meta: meta || {},
        createdAt: Date.now()
      };
      LX.Store.update('payments', function (list) {
        list = list || [];
        list.push({ intentId: intent.id, amount: intent.amount, currency: intent.currency, status: intent.status, meta: meta || {}, createdAt: intent.createdAt });
        return list;
      });
      return latency(180).then(function () { return intent; });
    },

    /* ★ PAN is NEVER returned or stored ★ */
    tokenize: function (card) {
      var impl = LX.GatewayMock && LX.GatewayMock.tokenize;
      return Promise.resolve(impl ? impl(card) : null).then(function (t) {
        return latency(220).then(function () { return t; });
      });
    },

    confirm: function (intentId, paymentMethod) {
      var record = null;
      var list = LX.Store.get('payments') || [];
      for (var i = 0; i < list.length; i++) if (list[i].intentId === intentId) record = list[i];
      if (!record) return Promise.reject(new Error('Payment intent not found.'));

      record.status = 'succeeded';
      record.paidAt = Date.now();
      record.paymentMethod = paymentMethod && paymentMethod.token ? {
        token: paymentMethod.token, brand: paymentMethod.brand, last4: paymentMethod.last4,
        expMonth: paymentMethod.expMonth, expYear: paymentMethod.expYear
      } : null;

      LX.Store.set('payments', list);
      return latency(320).then(function () {
        return { id: intentId, status: 'succeeded', paidAt: record.paidAt };
      });
    },

    refund: function (paymentId) {
      var list = LX.Store.get('payments') || [];
      for (var i = 0; i < list.length; i++) {
        if (list[i].intentId === paymentId) {
          list[i].status = 'refunded';
          list[i].refundedAt = Date.now();
        }
      }
      LX.Store.set('payments', list);
      return latency(200).then(function () {
        return { id: newRefundId(), status: 'succeeded' };
      });
    }
  };

  /* ── Order number sequence (blueprint §7.1) ──────────── */
  function nextOrderNumber() {
    var n = (LX.DB.get('counter_order', 0) || 0) + 1;
    LX.DB.set('counter_order', n);
    var year = new Date().getFullYear();
    return 'LX-' + year + '-' + LX.pad(n, 5);
  }

  /* ── Public API surface ──────────────────────────────── */
  var Api = {
    Config: Config,
    gateway: gateway,
    latency: latency,
    nextOrderNumber: nextOrderNumber,

    /* ── Products ──────────────────────────────────────── */
    products: {
      list: function () {
        return latency(180).then(function () {
          return { items: LX.Catalog.all(), count: LX.Catalog.all().length };
        });
      },
      get: function (slug) {
        return latency(120).then(function () {
          var p = LX.Catalog.bySlug(slug) || LX.Catalog.byId(slug);
          if (!p) throw Object.assign(new Error('Product not found.'), { status: 404 });
          return p;
        });
      },
      reviews: function (productId) {
        return latency(140).then(function () {
          return { items: LX.Catalog.reviewsFor(productId) };
        });
      }
    },

    /* ── Auth (delegates to LX.Auth service) ───────────── */
    auth: {
      register: function (payload) {
        return latency(620).then(function () { return LX.Auth.register(payload); });
      },
      login: function (payload) {
        return latency(520).then(function () { return LX.Auth.login(payload); });
      },
      logout: function () {
        return latency(80).then(function () { return LX.Auth.logout(); });
      },
      me: function () {
        return latency(60).then(function () { return LX.Auth.currentUser(); });
      },
      requestReset: function (email) {
        return latency(700).then(function () { return LX.Auth.requestReset(email); });
      },
      verifyOtp: function (email, code) {
        return latency(380).then(function () { return LX.Auth.verifyOtp(email, code); });
      },
      resetPassword: function (email, code, newPassword) {
        return latency(560).then(function () { return LX.Auth.resetPassword(email, code, newPassword); });
      }
    },

    /* ── Orders ────────────────────────────────────────── */
    orders: {
      create: function (draft) {
        return latency(320).then(function () { return LX.Order.create(draft); });
      },
      list: function (userId) {
        return latency(180).then(function () {
          var all = LX.Store.get('orders') || [];
          var mine = userId ? all.filter(function (o) { return o.userId === userId; }) : all;
          return { items: mine.sort(function (a, b) { return b.createdAt - a.createdAt; }) };
        });
      },
      get: function (orderNumber) {
        return latency(120).then(function () {
          var all = LX.Store.get('orders') || [];
          for (var i = 0; i < all.length; i++) {
            if (all[i].orderNumber === orderNumber || all[i].id === orderNumber) return all[i];
          }
          throw Object.assign(new Error('Order not found.'), { status: 404 });
        });
      },
      markPaid: function (orderNumber, payment) {
        return latency(180).then(function () { return LX.Order.markPaid(orderNumber, payment); });
      },
      updateStatus: function (orderNumber, status, note) {
        return latency(120).then(function () { return LX.Order.updateStatus(orderNumber, status, note); });
      }
    },

    /* ── Payments ──────────────────────────────────────── */
    payments: {
      list: function () { return latency(100).then(function () { return LX.Store.get('payments') || []; }); }
    },

    /* ── Raw transport (real backend mode) ─────────────── */
    request: function (method, path, body) {
      if (Config.USE_MOCK) return Promise.reject(new Error('Mock mode: no HTTP transport configured.'));
      return http(method, path, body);
    },

    /* Runtime diagnostics */
    describe: function () {
      return {
        mode: Config.USE_MOCK ? 'mock' : 'http',
        baseUrl: Config.USE_MOCK ? '(browser mock API layer)' : Config.BASE_URL,
        gateway: LX.GatewayMock ? 'MockGateway' : 'unbound',
        crypto: LX.CRYPTO.mode,
        storage: LX.DB.mode()
      };
    }
  };

  LX.Config = Config;
  LX.Api = Api;
})(window);