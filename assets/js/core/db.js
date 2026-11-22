/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — core/db.js
   localStorage primary + memory fallback (blueprint §7.1)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var PREFIX = 'luxe_intimo_v1:';
  var memory = {};
  var mode = 'localStorage';

  /* ── Storage detection ───────────────────────────────── */
  var store = (function () {
    try {
      if (!global.localStorage) throw new Error('no localStorage');
      var probe = PREFIX + '__probe__';
      global.localStorage.setItem(probe, '1');
      global.localStorage.removeItem(probe);
      return global.localStorage;
    } catch (e) {
      mode = 'memory';
      return null;
    }
  })();

  function key(k) { return PREFIX + k; }

  /* ── Public API ──────────────────────────────────────── */
  var DB = {
    mode: function () { return mode; },
    prefix: PREFIX,

    get: function (k, fallback) {
      try {
        var raw = store ? store.getItem(key(k)) : memory[key(k)];
        if (raw === null || raw === undefined) return fallback === undefined ? null : fallback;
        return JSON.parse(raw);
      } catch (e) {
        console.warn('[LX.DB] get failed:', k, e);
        return fallback === undefined ? null : fallback;
      }
    },

    set: function (k, value) {
      var raw;
      try { raw = JSON.stringify(value); }
      catch (e) { console.error('[LX.DB] serialize failed:', k, e); return false; }
      try {
        if (store) store.setItem(key(k), raw);
        else memory[key(k)] = raw;
        return true;
      } catch (e) {
        /* Quota exceeded → try memory, report honestly */
        console.warn('[LX.DB] write failed (quota?)', k, e);
        memory[key(k)] = raw;
        return false;
      }
    },

    remove: function (k) {
      try {
        if (store) store.removeItem(key(k));
        else delete memory[key(k)];
      } catch (e) { /* noop */ }
    },

    keys: function () {
      var out = [];
      if (store) {
        for (var i = 0; i < store.length; i++) {
          var k = store.key(i);
          if (k && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length));
        }
      } else {
        for (var m in memory) {
          if (m.indexOf(PREFIX) === 0) out.push(m.slice(PREFIX.length));
        }
      }
      return out.sort();
    },

    has: function (k) {
      return DB.get(k, undefined) !== undefined && DB.get(k, undefined) !== null;
    },

    clearAll: function () {
      DB.keys().forEach(function (k) { DB.remove(k); });
    },

    /* ── Backup (blueprint §17 risk #4) ─────────────────── */
    exportJSON: function () {
      var data = {};
      DB.keys().forEach(function (k) { data[k] = DB.get(k); });
      return JSON.stringify({
        _app: 'LUXE INTIMO',
        _schema: 'luxe_intimo_v1',
        _version: LX.VERSION,
        _exportedAt: new Date().toISOString(),
        data: data
      }, null, 2);
    },

    importJSON: function (text, opts) {
      var parsed;
      try { parsed = JSON.parse(text); }
      catch (e) { return { ok: false, error: 'That file is not valid JSON.' }; }
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        return { ok: false, error: 'That file is not a LUXE INTIMO backup.' };
      }
      var count = 0;
      var merge = opts && opts.merge;
      if (!merge) DB.clearAll();
      Object.keys(parsed.data).forEach(function (k) {
        if (DB.set(k, parsed.data[k])) count++;
      });
      return { ok: true, count: count };
    },

    /* ── Usage meter (blueprint §17 risk #1) ────────────── */
    usageBytes: function () {
      if (store) {
        var total = 0;
        for (var i = 0; i < store.length; i++) {
          var k = store.key(i);
          if (k && k.indexOf(PREFIX) === 0) {
            var v = store.getItem(k) || '';
            total += LX.bytesOf(k) + LX.bytesOf(v);
          }
        }
        return total;
      }
      var t = 0;
      for (var m in memory) t += LX.bytesOf(m) + LX.bytesOf(memory[m]);
      return t;
    },

    usageReport: function () {
      var bytes = DB.usageBytes();
      var limit = 5 * 1024 * 1024;
      return {
        mode: mode,
        bytes: bytes,
        human: LX.humanBytes(bytes),
        limit: limit,
        pct: Math.min(100, Math.round((bytes / limit) * 100))
      };
    }
  };

  /* ── Cross-tab sync (blueprint §17 risk #5) ──────────── */
  var emitter = LX.Emitter();
  DB.on = emitter.on;
  DB.emit = emitter.emit;

  if (global.addEventListener) {
    global.addEventListener('storage', function (e) {
      if (!e || !e.key || e.key.indexOf(PREFIX) !== 0) return;
      emitter.emit('change', {
        key: e.key.slice(PREFIX.length),
        newValue: e.newValue,
        oldValue: e.oldValue
      });
      emitter.emit('sync', e.key.slice(PREFIX.length));
    });
  }

  LX.DB = DB;
})(window);