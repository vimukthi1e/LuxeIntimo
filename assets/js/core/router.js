/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/router.js
   Hash router · params · guards (blueprint §6, §10.6)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  LX.Pages = LX.Pages || {};

  var routes = [];
  var current = { path: '/', name: null, params: {}, query: {} };
  var started = false;
  var renderToken = 0;

  /* ── Route table ─────────────────────────────────────── */
  function add(pattern, name, opts) {
    var parts = pattern.split('/').filter(Boolean);
    routes.push({
      pattern: pattern,
      name: name,
      parts: parts,
      opts: opts || {}
    });
    return LX.Router;
  }

  function match(path) {
    var segs = path.split('/').filter(Boolean);
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      if (r.parts.length !== segs.length) continue;
      var params = {}, ok = true;
      for (var j = 0; j < r.parts.length; j++) {
        var p = r.parts[j];
        if (p.charAt(0) === ':') params[p.slice(1)] = decodeURIComponent(segs[j]);
        else if (p !== segs[j]) { ok = false; break; }
      }
      if (ok) return { route: r, params: params };
    }
    return null;
  }

  /* ── Hash parsing ────────────────────────────────────── */
  function parseHash() {
    var raw = global.location.hash || '#/';
    if (raw.charAt(0) === '#') raw = raw.slice(1);
    if (!raw || raw === '/') raw = '/';
    var qIdx = raw.indexOf('?');
    var path = qIdx < 0 ? raw : raw.slice(0, qIdx);
    var qs = qIdx < 0 ? '' : raw.slice(qIdx + 1);
    if (path.charAt(0) !== '/') path = '/' + path;
    return { path: path, query: LX.parseQuery(qs), raw: raw };
  }

  /* ── Navigation ──────────────────────────────────────── */
  function go(hashOrPath, opts) {
    var target = hashOrPath;
    if (target.charAt(0) !== '#') target = '#' + (target.charAt(0) === '/' ? target : '/' + target);
    if (global.location.hash === target) {
      render(opts);
    } else {
      global.location.hash = target;
    }
  }

  function replace(hashOrPath) {
    var target = hashOrPath;
    if (target.charAt(0) !== '#') target = '#' + (target.charAt(0) === '/' ? target : '/' + target);
    var base = global.location.href.split('#')[0];
    try {
      global.history.replaceState(null, '', base + target);
    } catch (e) {
      global.location.hash = target;
      return;
    }
    render();
  }

  function link(path, query) {
    return '#' + (path.charAt(0) === '/' ? path : '/' + path) + (query ? LX.buildQuery(query) : '');
  }

  /* ── Render ──────────────────────────────────────────── */
  function render(opts) {
    opts = opts || {};
    var parsed = parseHash();
    var found = match(parsed.path);

    if (!found) {
      /* Unknown route → home */
      console.warn('[LX.Router] no route for', parsed.path);
      global.location.hash = '#/';
      return;
    }

    var route = found.route;
    var params = found.params;
    var page = LX.Pages[route.name];

    if (!page) {
      console.error('[LX.Router] page not registered:', route.name);
      return;
    }

    /* ── Guards ───────────────────────────────────────── */
    if (route.opts.requireAuth && !LX.Auth.ensureSession()) {
      LX.Auth.setRedirect(parsed.raw.charAt(0) === '#' ? parsed.raw : '#' + parsed.raw);
      LX.Router.go('#/login', { flash: 'Please sign in to continue.' });
      return;
    }
    if (route.opts.guestOnly && LX.Auth.ensureSession()) {
      LX.Router.go('#/account');
      return;
    }

    /* ── Pending order guard (pay page) ───────────────── */
    if (route.opts.requireDraft) {
      var draft = LX.Store.get('checkout');
      var pending = LX.DB.get('pending_order');
      if (!pending) {
        LX.Router.go('#/cart');
        return;
      }
    }

    current = {
      path: parsed.path,
      name: route.name,
      params: params,
      query: parsed.query,
      hash: parsed.raw,
      pattern: route.pattern
    };

    var token = ++renderToken;
    var root = LX.$('#app');

    /* Page lifecycle */
    try {
      if (LX.Router._teardown) {
        try { LX.Router._teardown(); } catch (e) { console.warn('[LX.Router] teardown error', e); }
        LX.Router._teardown = null;
      }

      var html = page.render(params, parsed.query);
      if (token !== renderToken) return;
      root.innerHTML = html;

      if (page.mount) {
        var td = page.mount(root, params, parsed.query);
        if (typeof td === 'function') LX.Router._teardown = td;
      }
    } catch (err) {
      console.error('[LX.Router] render error in "' + route.name + '"', err);
      root.innerHTML =
        '<div class="container"><div class="empty">' +
        '<div class="empty-icon">!</div>' +
        '<h3>Something went wrong</h3>' +
        '<p>This page failed to load. Please try again.</p>' +
        '<a class="btn btn-gold" href="#/">Back to home</a>' +
        '</div></div>';
    }

    /* Post-render */
    if (!opts.keepScroll) {
      global.scrollTo({ top: 0, behavior: 'auto' });
    }
    if (page.title !== undefined) {
      document.title = (typeof page.title === 'function' ? page.title(params) : page.title) + ' — LUXE INTIMO';
    } else {
      document.title = 'LUXE INTIMO — Premium Innerwear | Sri Lanka';
    }

    LX.Store.set('route', current, undefined, { immediate: true });
    LX.Store.emit && null;
    LX.Router.emit('navigate', current);

    /* focus management for a11y */
    var main = LX.$('#main');
    if (main) main.focus({ preventScroll: true });
  }

  /* ── Events ──────────────────────────────────────────── */
  var emitter = LX.Emitter();

  /* ── Lifecycle ───────────────────────────────────────── */
  function start() {
    if (started) return;
    started = true;

    global.addEventListener('hashchange', function () { render(); });

    if (!global.location.hash) {
      try {
        global.history.replaceState(null, '', global.location.href.split('#')[0] + '#/');
      } catch (e) { global.location.hash = '#/'; }
    }
    render();
  }

  /* ── Route definitions ───────────────────────────────── */
  add('/', 'home');
  add('/about', 'about');
  add('/shop', 'shop');
  add('/product/:slug', 'product');
  add('/cart', 'cart');
  add('/checkout', 'checkout');
  add('/pay', 'pay', { requireDraft: true });
  add('/order/:orderNumber', 'order');
  add('/login', 'login', { guestOnly: true });
  add('/signup', 'signup', { guestOnly: true });
  add('/forgot', 'forgot', { guestOnly: true });
  add('/account', 'account', { requireAuth: true });
  add('/orders', 'orders', { requireAuth: true });
  add('/addresses', 'addresses', { requireAuth: true });
  add('/settings', 'settings', { requireAuth: true });
  add('/wishlist', 'wishlist');
  add('/dev', 'dev');

  LX.Router = {
    add: add,
    go: go,
    replace: replace,
    link: link,
    start: start,
    render: render,
    current: function () { return current; },
    query: function () { return current.query; },
    params: function () { return current.params; },
    on: emitter.on,
    emit: emitter.emit,
    routes: routes,
    _teardown: null
  };
})(window);