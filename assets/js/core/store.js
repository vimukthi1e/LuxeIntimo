/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/store.js
   Reactive state · pub/sub · persisted slices · cross-tab
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* Persisted slice names (blueprint §7.1) */
  var SLICES = ['session', 'cart', 'wishlist', 'checkout', 'prefs', 'dev', 'users', 'orders', 'payments', 'reviews'];

  var state = {
    /* transient (not persisted) */
    route: { path: '/', params: {} },
    ui: {
      cartOpen: false,
      navOpen: false,
      modal: null,
      booted: false,
      authRedirect: null
    }
  };

  var emitter = LX.Emitter();
  var saveTimers = {};

  /* ── Defaults ────────────────────────────────────────── */
  var DEFAULTS = {
    session: null,
    cart: { items: [], coupon: null, updatedAt: 0 },
    wishlist: [],
    checkout: {
      contact: { name: '', email: '', phone: '' },
      shipping: null,
      saveAddress: true,
      deliveryMethod: 'standard',
      paymentMethod: 'card',
      terms: false
    },
    prefs: {
      currency: 'LKR',
      locale: 'en-LK',
      seenSizeGuide: false
    },
    dev: {
      instantPayment: false,
      skipCaptcha: false,
      showValidationDebug: false,
      slowNetwork: false
    },
    users: [],
    orders: [],
    payments: [],
    reviews: null
  };

  function clone(v) { return v === null || v === undefined ? v : JSON.parse(JSON.stringify(v)); }

  /* ── Load / Save ─────────────────────────────────────── */
  function loadSlice(name) {
    var stored = LX.DB.get(name, undefined);
    if (stored === undefined || stored === null) {
      state[name] = clone(DEFAULTS[name]);
      return;
    }
    /* Shallow-merge objects so new DEFAULTS keys appear after upgrades */
    if (DEFAULTS[name] !== null && typeof DEFAULTS[name] === 'object' && !Array.isArray(DEFAULTS[name])
      && typeof stored === 'object' && !Array.isArray(stored)) {
      var merged = clone(DEFAULTS[name]);
      for (var k in stored) if (Object.prototype.hasOwnProperty.call(stored, k)) merged[k] = stored[k];
      state[name] = merged;
    } else {
      state[name] = stored;
    }
  }

  function saveSlice(name, immediate) {
    if (SLICES.indexOf(name) < 0) return;
    if (immediate) {
      clearTimeout(saveTimers[name]);
      LX.DB.set(name, state[name]);
      return;
    }
    clearTimeout(saveTimers[name]);
    saveTimers[name] = setTimeout(function () {
      LX.DB.set(name, state[name]);
    }, 220);
  }

  /* ── Public API ──────────────────────────────────────── */
  var Store = {
    SLICES: SLICES,

    init: function () {
      SLICES.forEach(loadSlice);
      if (!Array.isArray(state.users)) state.users = [];
      if (!Array.isArray(state.orders)) state.orders = [];
      if (!Array.isArray(state.payments)) state.payments = [];
      if (!Array.isArray(state.wishlist)) state.wishlist = [];
      if (!state.cart || typeof state.cart !== 'object') state.cart = clone(DEFAULTS.cart);
      if (!Array.isArray(state.cart.items)) state.cart.items = [];

      /* Cross-tab: refresh slices changed elsewhere */
      LX.DB.on('sync', function (key) {
        if (SLICES.indexOf(key) < 0) return;
        var fresh = LX.DB.get(key, undefined);
        if (fresh === undefined) return;
        state[key] = fresh;
        emitter.emit('change:' + key, state[key]);
        emitter.emit('change', { slice: key, value: state[key], remote: true });
        emitter.emit('remote:' + key, state[key]);
      });

      state.ui.booted = true;
      return Store;
    },

    /* read */
    get: function (slice, path) {
      var v = state[slice];
      if (path === undefined || path === null) return v;
      var parts = String(path).split('.');
      for (var i = 0; i < parts.length && v != null; i++) v = v[parts[i]];
      return v;
    },

    /* write (whole slice or deep path) */
    set: function (slice, pathOrValue, value, opts) {
      var path = null, val = pathOrValue;
      if (value !== undefined || (typeof pathOrValue === 'string' && pathOrValue.indexOf('.') > -1 && arguments.length >= 3)) {
        path = pathOrValue; val = value;
      }
      if (arguments.length === 3 && typeof pathOrValue === 'string') { path = pathOrValue; val = value; }

      if (path) {
        var parts = String(path).split('.');
        var target = state[slice];
        for (var i = 0; i < parts.length - 1; i++) {
          if (target[parts[i]] === undefined || target[parts[i]] === null || typeof target[parts[i]] !== 'object') {
            target[parts[i]] = {};
          }
          target = target[parts[i]];
        }
        target[parts[parts.length - 1]] = val;
      } else {
        state[slice] = val;
      }

      saveSlice(slice, opts && opts.immediate);
      emitter.emit('change:' + slice, state[slice]);
      emitter.emit('change', { slice: slice, value: state[slice], remote: false });
      return state[slice];
    },

    /* functional update */
    update: function (slice, fn, opts) {
      var next = fn(state[slice]);
      if (next !== undefined) state[slice] = next;
      saveSlice(slice, opts && opts.immediate);
      emitter.emit('change:' + slice, state[slice]);
      emitter.emit('change', { slice: slice, value: state[slice], remote: false });
      return state[slice];
    },

    /* force persist */
    persist: function (slice) {
      if (slice) { LX.DB.set(slice, state[slice]); return; }
      SLICES.forEach(function (s) { LX.DB.set(s, state[s]); });
    },

    reset: function (slice) {
      state[slice] = clone(DEFAULTS[slice]);
      LX.DB.set(slice, state[slice]);
      emitter.emit('change:' + slice, state[slice]);
    },

    /* subscribe: returns unsubscribe fn */
    subscribe: function (evt, fn) { return emitter.on(evt, fn); },

    /* transient UI helpers */
    ui: function (key, value) {
      if (value === undefined) return state.ui[key];
      state.ui[key] = value;
      emitter.emit('ui', { key: key, value: value });
      emitter.emit('ui:' + key, value);
      return value;
    },

    raw: function () { return state; }
  };

  LX.Store = Store;
})(window);