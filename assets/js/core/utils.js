/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/utils.js
   Global namespace + primitives (blueprint §6)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX || (global.LX = {});
  LX.VERSION = '1.0.0';
  LX.PROTOCOL = 1;

  /* ── DOM helpers ─────────────────────────────────────── */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        var v = attrs[k];
        if (v === null || v === undefined || v === false) continue;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'dataset') { for (var d in v) node.dataset[d] = v[d]; }
        else if (k.slice(0, 2) === 'on' && typeof v === 'function') node.addEventListener(k.slice(2).toLowerCase(), v);
        else node.setAttribute(k, v === true ? '' : v);
      }
    }
    (children || []).forEach(function (c) {
      if (c === null || c === undefined || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  /* ── Safe HTML escaping ──────────────────────────────── */
  var ESC_MAP = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
  function esc(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"'`]/g, function (c) { return ESC_MAP[c]; });
  }
  function attr(str) { return esc(str); }

  /* ── Money: INTEGER CENTS ONLY (blueprint §7.3) ───────── */
  function money(cents) {
    var n = Math.round(Number(cents) || 0);
    var neg = n < 0;
    var abs = Math.abs(n);
    var rupees = Math.floor(abs / 100);
    var s = String(rupees).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + 'Rs. ' + s;
  }
  function moneyFull(cents) {
    var n = Math.round(Number(cents) || 0);
    var neg = n < 0;
    var abs = Math.abs(n);
    var rupees = Math.floor(abs / 100);
    var rem = abs % 100;
    var s = String(rupees).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return (neg ? '−' : '') + 'Rs. ' + s + '.' + (rem < 10 ? '0' + rem : rem);
  }
  function toCents(rupees) { return Math.round((Number(rupees) || 0) * 100); }

  /* ── IDs / tokens ────────────────────────────────────── */
  function uid(prefix) {
    var rnd = new Uint8Array(12);
    fillRandom(rnd);
    var s = '';
    for (var i = 0; i < rnd.length; i++) s += ('0' + rnd[i].toString(16)).slice(-2);
    return (prefix || '') + s;
  }
  function fillRandom(arr) {
    if (global.crypto && global.crypto.getRandomValues) { global.crypto.getRandomValues(arr); return arr; }
    for (var i = 0; i < arr.length; i++) arr[i] = Math.floor(Math.random() * 256);
    return arr;
  }
  function hex(bytes) {
    var out = '';
    for (var i = 0; i < bytes.length; i++) out += ('0' + bytes[i].toString(16)).slice(-2);
    return out;
  }

  /* ── Dates ───────────────────────────────────────────── */
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  function fmtDate(ts, opts) {
    if (!ts) return '—';
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    var o = opts || {};
    var day = d.getDate(), mon = MONTHS[d.getMonth()], yr = d.getFullYear();
    if (o.time) {
      var h = d.getHours(), m = d.getMinutes();
      var ap = h >= 12 ? 'PM' : 'AM';
      var h12 = h % 12; if (h12 === 0) h12 = 12;
      return mon + ' ' + day + ', ' + yr + ' · ' + h12 + ':' + (m < 10 ? '0' + m : m) + ' ' + ap;
    }
    return mon + ' ' + day + ', ' + yr;
  }
  function fmtDateShort(ts) {
    var d = new Date(ts);
    if (isNaN(d.getTime())) return '—';
    return d.getDate() + ' ' + MONTHS[d.getMonth()].slice(0, 3) + ' ' + d.getFullYear();
  }
  function addDays(ts, n) { var d = new Date(ts); d.setDate(d.getDate() + n); return d.getTime(); }
  function isWeekend(ts) { var g = new Date(ts).getDay(); return g === 0 || g === 6; }
  function addBusinessDays(fromTs, n) {
    var d = new Date(fromTs);
    var added = 0, guard = 0;
    while (added < n && guard++ < 90) {
      d.setDate(d.getDate() + 1);
      if (!isWeekend(d.getTime())) added++;
    }
    return d.getTime();
  }
  function timeAgo(ts) {
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    return Math.floor(s / 86400) + 'd ago';
  }

  /* ── String helpers ──────────────────────────────────── */
  function titleCase(s) {
    return String(s || '').replace(/\w\S*/g, function (t) { return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase(); });
  }
  function slugify(s) {
    return String(s || '').toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  function truncate(s, n) {
    s = String(s || '');
    return s.length > n ? s.slice(0, n - 1).trim() + '…' : s;
  }

  /* ── Levenshtein (blueprint §9 step 3) ───────────────── */
  function levenshtein(a, b) {
    a = String(a || ''); b = String(b || '');
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    var prev = new Array(b.length + 1), cur = new Array(b.length + 1);
    for (var j = 0; j <= b.length; j++) prev[j] = j;
    for (var i = 1; i <= a.length; i++) {
      cur[0] = i;
      for (var k = 1; k <= b.length; k++) {
        var cost = a.charAt(i - 1) === b.charAt(k - 1) ? 0 : 1;
        cur[k] = Math.min(prev[k] + 1, cur[k - 1] + 1, prev[k - 1] + cost);
      }
      var t = prev; prev = cur; cur = t;
    }
    return prev[b.length];
  }

  /* ── Timing ──────────────────────────────────────────── */
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function debounce(fn, wait) {
    var t;
    return function () {
      var args = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, args); }, wait || 180);
    };
  }
  function throttle(fn, wait) {
    var last = 0, timer = null;
    return function () {
      var now = Date.now(), args = arguments, self = this;
      if (now - last >= wait) { last = now; fn.apply(self, args); }
      else if (!timer) {
        timer = setTimeout(function () { timer = null; last = Date.now(); fn.apply(self, args); }, wait - (now - last));
      }
    };
  }

  /* ── Deep clone / merge ──────────────────────────────── */
  function clone(o) { return o === undefined ? o : JSON.parse(JSON.stringify(o)); }
  function extend(target) {
    for (var i = 1; i < arguments.length; i++) {
      var src = arguments[i]; if (!src) continue;
      for (var k in src) if (Object.prototype.hasOwnProperty.call(src, k)) target[k] = src[k];
    }
    return target;
  }

  /* ── CRYPTO — PBKDF2-SHA256 100k (blueprint §10.3) ───── */
  var CRYPTO = {
    mode: 'unknown',   // 'pbkdf2' | 'fallback'
    iterations: 100000,
    fallbackRounds: 2000
  };

  /* Eager capability detection so the UI can report honestly from boot,
     not only after the first hash. */
  CRYPTO.mode = (global.crypto && global.crypto.subtle
    && typeof global.crypto.subtle.importKey === 'function'
    && typeof global.crypto.subtle.deriveBits === 'function') ? 'pbkdf2' : 'fallback';

  function utf8(str) {
    if (global.TextEncoder) return new TextEncoder().encode(str);
    var out = [], i, c;
    for (i = 0; i < str.length; i++) {
      c = str.charCodeAt(i);
      if (c < 0x80) out.push(c);
      else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63));
      else out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63));
    }
    return new Uint8Array(out);
  }

  function sha256Fallback(bytes) {
    /* Iterated SHA-256 substitute for environments without WebCrypto.
       NOTE: reduced-strength by design — only used on file:// (blueprint §10.3). */
    var K = [
      0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
      0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
      0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
      0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
      0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
      0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
      0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
      0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
    ];
    function rotr(x, n) { return (x >>> n) | (x << (32 - n)); }
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var l = bytes.length;
    var withPad = new Uint8Array((((l + 9) >> 6) + 1) << 6);
    withPad.set(bytes);
    withPad[l] = 0x80;
    var bitLen = l * 8;
    var dv = new DataView(withPad.buffer);
    dv.setUint32(withPad.length - 4, bitLen >>> 0);
    dv.setUint32(withPad.length - 8, Math.floor(bitLen / 4294967296));
    for (var off = 0; off < withPad.length; off += 64) {
      var w = new Array(64), i;
      for (i = 0; i < 16; i++) w[i] = dv.getUint32(off + i * 4);
      for (i = 16; i < 64; i++) {
        var s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i = 0; i < 64; i++) {
        var S1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i] + w[i]) | 0;
        var S0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
        var mj = (a & b) ^ (a & c) ^ (b & c);
        var t2 = (S0 + mj) | 0;
        h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0;
      }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
      H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    var out = new Uint8Array(32);
    for (var j = 0; j < 8; j++) {
      out[j * 4] = (H[j] >>> 24) & 255; out[j * 4 + 1] = (H[j] >>> 16) & 255;
      out[j * 4 + 2] = (H[j] >>> 8) & 255; out[j * 4 + 3] = H[j] & 255;
    }
    return out;
  }

  function randomSaltHex(bytes) {
    return hex(fillRandom(new Uint8Array(bytes || 16)));
  }

  function toHexBytes(hexStr) {
    var out = new Uint8Array(hexStr.length / 2);
    for (var i = 0; i < out.length; i++) out[i] = parseInt(hexStr.substr(i * 2, 2), 16);
    return out;
  }

  /**
   * hashPassword(password, saltHex) -> Promise<hex>
   * PBKDF2-SHA256 @100k. Fallback: iterated SHA-256 @2000 (file:// only).
   */
  function hashPassword(password, saltHex) {
    var subtle = global.crypto && global.crypto.subtle;
    if (subtle && typeof subtle.importKey === 'function') {
      CRYPTO.mode = 'pbkdf2';
      return subtle.importKey('raw', utf8(password), { name: 'PBKDF2' }, false, ['deriveBits'])
        .then(function (key) {
          return subtle.deriveBits(
            { name: 'PBKDF2', hash: 'SHA-256', salt: toHexBytes(saltHex), iterations: CRYPTO.iterations },
            key, 256
          );
        })
        .then(function (buf) { return hex(new Uint8Array(buf)); })
        .catch(function () {
          CRYPTO.mode = 'fallback';
          return hashPasswordFallback(password, saltHex);
        });
    }
    CRYPTO.mode = 'fallback';
    return Promise.resolve(hashPasswordFallback(password, saltHex));
  }

  function hashPasswordFallback(password, saltHex) {
    var acc = utf8(password + ':' + saltHex);
    for (var i = 0; i < CRYPTO.fallbackRounds; i++) acc = sha256Fallback(acc);
    return hex(acc);
  }

  /* Constant-time-ish comparison */
  function safeEqual(a, b) {
    a = String(a || ''); b = String(b || '');
    if (a.length !== b.length) {
      /* still walk to reduce trivial timing leak */
      var dummy = 0;
      for (var i = 0; i < a.length; i++) dummy ^= a.charCodeAt(i);
      return false;
    }
    var diff = 0;
    for (var j = 0; j < a.length; j++) diff |= a.charCodeAt(j) ^ b.charCodeAt(j);
    return diff === 0;
  }

  /* ── Clipboard ───────────────────────────────────────── */
  function copyText(text) {
    if (global.navigator && navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.cssText = 'position:absolute;left:-9999px;top:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch (e) { return false; }
  }

  /* ── Query params (for hash routes) ──────────────────── */
  function parseQuery(qs) {
    var out = {};
    String(qs || '').replace(/^\?/, '').split('&').forEach(function (pair) {
      if (!pair) return;
      var idx = pair.indexOf('=');
      var k = decodeURIComponent(idx < 0 ? pair : pair.slice(0, idx));
      var v = idx < 0 ? '' : decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, ' '));
      out[k] = v;
    });
    return out;
  }
  function buildQuery(obj) {
    var parts = [];
    for (var k in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, k)) continue;
      var v = obj[k];
      if (v === null || v === undefined || v === '') continue;
      parts.push(encodeURIComponent(k) + '=' + encodeURIComponent(v));
    }
    return parts.length ? '?' + parts.join('&') : '';
  }

  /* ── Misc ────────────────────────────────────────────── */
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
  function unique(arr) { return arr.filter(function (v, i, a) { return a.indexOf(v) === i; }); }
  function sum(arr, key) {
    return arr.reduce(function (t, x) { return t + (key ? (x[key] || 0) : (x || 0)); }, 0);
  }
  function sortBy(arr, key, dir) {
    var m = dir === 'desc' ? -1 : 1;
    return arr.slice().sort(function (a, b) {
      var av = typeof key === 'function' ? key(a) : a[key];
      var bv = typeof key === 'function' ? key(b) : b[key];
      if (av === bv) return 0;
      return (av > bv ? 1 : -1) * m;
    });
  }
  function pad(n, len) { var s = String(n); while (s.length < (len || 2)) s = '0' + s; return s; }

  /* ── Storage usage estimate ──────────────────────────── */
  function bytesOf(str) {
    if (global.Blob) { try { return new Blob([str]).size; } catch (e) { } }
    return String(str).length * 2;
  }
  function humanBytes(n) {
    if (n < 1024) return n + ' B';
    if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
    return (n / 1048576).toFixed(2) + ' MB';
  }

  /* ── Tiny event emitter ──────────────────────────────── */
  function Emitter() {
    var map = {};
    return {
      on: function (evt, fn) { (map[evt] = map[evt] || []).push(fn); return function () { this.off(evt, fn); }.bind(this); },
      off: function (evt, fn) {
        if (!map[evt]) return;
        map[evt] = map[evt].filter(function (f) { return f !== fn; });
      },
      emit: function (evt, data) {
        (map[evt] || []).slice().forEach(function (f) {
          try { f(data); } catch (e) { console.error('[LX] listener error on "' + evt + '"', e); }
        });
      }
    };
  }

  /* ── Export ──────────────────────────────────────────── */
  LX.$ = $; LX.$$ = $$; LX.el = el;
  LX.esc = esc; LX.attr = attr;
  LX.money = money; LX.moneyFull = moneyFull; LX.toCents = toCents;
  LX.uid = uid; LX.hex = hex; LX.fillRandom = fillRandom; LX.randomSaltHex = randomSaltHex;
  LX.fmtDate = fmtDate; LX.fmtDateShort = fmtDateShort; LX.addDays = addDays;
  LX.addBusinessDays = addBusinessDays; LX.isWeekend = isWeekend; LX.timeAgo = timeAgo;
  LX.MONTHS = MONTHS; LX.DAYS = DAYS;
  LX.titleCase = titleCase; LX.slugify = slugify; LX.truncate = truncate; LX.levenshtein = levenshtein;
  LX.sleep = sleep; LX.debounce = debounce; LX.throttle = throttle;
  LX.clone = clone; LX.extend = extend; LX.clamp = clamp; LX.unique = unique; LX.sum = sum;
  LX.sortBy = sortBy; LX.pad = pad;
  LX.CRYPTO = CRYPTO;
  LX.hashPassword = hashPassword; LX.safeEqual = safeEqual;
  LX.bytesOf = bytesOf; LX.humanBytes = humanBytes;
  LX.copyText = copyText;
  LX.parseQuery = parseQuery; LX.buildQuery = buildQuery;
  LX.Emitter = Emitter;

})(window);