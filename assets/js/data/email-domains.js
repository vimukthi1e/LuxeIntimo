/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — data/email-domains.js
   6-step email validation pipeline (blueprint §9)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ── STEP 2 · Disposable blocklist ───────────────────── */
  var DISPOSABLE = [
    'mailinator.com', 'mailinator.net', 'tempmail.com', 'temp-mail.org', 'temp-mail.io',
    '10minutemail.com', '10minutemail.net', 'guerrillamail.com', 'guerrillamail.net',
    'yopmail.com', 'yopmail.net', 'sharklasers.com', 'throwawaymail.com',
    'trashmail.com', 'trashmail.me', 'getnada.com', 'maildrop.cc', 'fakeinbox.com',
    'dispostable.com', 'mailnesia.com', 'discard.email', 'inboxkitten.com', 'moakt.cc'
  ];

  /* ── STEP 3 · Typo map (40+) ─────────────────────────── */
  var TYPOS = {
    'gamil.com': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com',
    'gmail.con': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.cpm': 'gmail.com',
    'gmail.om': 'gmail.com', 'gmail.vom': 'gmail.com', 'gmaul.com': 'gmail.com',
    'gmsil.com': 'gmail.com', 'gemail.com': 'gmail.com', 'gmal.com': 'gmail.com',
    'gmail.com ': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmaill.com': 'gmail.com',
    'gmailm.com': 'gmail.com', 'gamil.co': 'gmail.com', 'gmailm.co': 'gmail.com',
    'gnail.com': 'gmail.com', 'gimal.com': 'gmail.com',
    'googlemail.co': 'gmail.com',
    'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'hotmal.com': 'hotmail.com',
    'hotmali.com': 'hotmail.com', 'hotmil.com': 'hotmail.com', 'homtail.com': 'hotmail.com',
    'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlok.co': 'outlook.com',
    'outlook.con': 'outlook.com', 'outlook.co': 'outlook.com', 'otlook.com': 'outlook.com',
    'yaho.com': 'yahoo.com', 'yahooo.com': 'yahoo.com', 'yaho.co': 'yahoo.com',
    'yahoo.con': 'yahoo.com', 'yahoo.co': 'yahoo.com', 'yahho.com': 'yahoo.com',
    'proton.com': 'proton.me', 'protonmai.com': 'proton.me', 'protonmail.co': 'proton.me',
    'proton.me ': 'proton.me', 'pronton.me': 'proton.me', 'protonmaill.com': 'proton.me',
    'icoud.com': 'icloud.com', 'iclod.com': 'icloud.com', 'icloud.co': 'icloud.com',
    'icloud.con': 'icloud.com',
    'live.con': 'live.com', 'liv.com': 'live.com', 'live.co': 'live.com',
    'zoho.co': 'zoho.com', 'zohoo.com': 'zoho.com',
    'gmx.co': 'gmx.com', 'gmz.com': 'gmx.com',
    'yandex.ru ': 'yandex.com', 'yandax.com': 'yandex.com',
    'tutanota.co': 'tutanota.com', 'tutamota.com': 'tutanota.com',
    'fastmial.com': 'fastmail.com', 'fastmai.com': 'fastmail.com',
    'slt.lk ': 'slt.lk', 'sltnet.co': 'sltnet.lk', 'sltnet.lk ': 'sltnet.lk',
    'dialog.lk ': 'dialog.lk', 'dialoglk': 'dialog.lk'
  };

  /* ── STEP 4 · Whitelist ──────────────────────────────── */
  /* rules: { min, max, allowed: regex for local part, startLetter, allowPlus, dotsIgnored } */
  var PROVIDERS = {
    'gmail.com': {
      label: 'Gmail', min: 6, max: 30, startLetter: true, allowPlus: true, dotsIgnored: true,
      rule: 'Gmail addresses need 6–30 characters, letters and numbers only (no underscores), starting with a letter.',
      check: function (local) {
        if (!/^[a-z]/.test(local)) return 'Gmail addresses must start with a letter.';
        if (!/^[a-z0-9.]+$/.test(local)) return 'Gmail doesn’t allow underscores or special characters.';
        return null;
      }
    },
    'googlemail.com': { alias: 'gmail.com' },
    'outlook.com': {
      label: 'Outlook', min: 1, max: 64, startLetter: true, allowPlus: false,
      rule: 'Outlook addresses can use letters, numbers, dots, hyphens and underscores.',
      check: function (local) {
        if (!/^[a-z]/.test(local)) return 'Outlook addresses must start with a letter.';
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Outlook allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      }
    },
    'hotmail.com': { label: 'Hotmail', min: 1, max: 64, startLetter: true, allowPlus: false,
      check: function (local) {
        if (!/^[a-z]/.test(local)) return 'Hotmail addresses must start with a letter.';
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Hotmail allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'live.com': { label: 'Outlook', min: 1, max: 64, startLetter: true, allowPlus: false },
    'msn.com': { label: 'Outlook', min: 1, max: 64, startLetter: true, allowPlus: false },

    'icloud.com': { label: 'iCloud', min: 3, max: 20, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'iCloud allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'me.com': { alias: 'icloud.com' },
    'mac.com': { alias: 'icloud.com' },

    'proton.me': {
      label: 'Proton', min: 1, max: 40, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Proton allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      }
    },
    'protonmail.com': { alias: 'proton.me' },
    'pm.me': { alias: 'proton.me' },

    'yahoo.com': {
      label: 'Yahoo', min: 4, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9.]+$/.test(local)) return 'Yahoo allows letters, numbers and dots only.';
        return null;
      }
    },
    'yahoo.co.uk': { alias: 'yahoo.com' },
    'ymail.com': { alias: 'yahoo.com' },

    'zoho.com': { label: 'Zoho', min: 1, max: 64, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Zoho allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'aol.com': { label: 'AOL', min: 3, max: 32, allowPlus: false },
    'gmx.com': { label: 'GMX', min: 3, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'GMX allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'mail.com': { label: 'Mail.com', min: 3, max: 32, allowPlus: false },
    'yandex.com': { label: 'Yandex', min: 3, max: 30, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Yandex allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'tutanota.com': { label: 'Tutanota', min: 3, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Tutanota allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },
    'tuta.io': { alias: 'tutanota.com' },
    'fastmail.com': { label: 'Fastmail', min: 3, max: 32, allowPlus: true,
      check: function (local) {
        if (!/^[a-z0-9._+-]+$/.test(local)) return 'Fastmail allows letters, numbers, dots, hyphens and underscores only.';
        return null;
      } },

    /* Sri Lankan providers */
    'slt.lk': { label: 'SLT', min: 3, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'SLT addresses can use letters, numbers, dots, hyphens and underscores.';
        return null;
      } },
    'sltnet.lk': { alias: 'slt.lk' },
    'dialog.lk': { label: 'Dialog', min: 3, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Dialog addresses can use letters, numbers, dots, hyphens and underscores.';
        return null;
      } },
    'mobitel.lk': { label: 'Mobitel', min: 3, max: 32, allowPlus: false,
      check: function (local) {
        if (!/^[a-z0-9._-]+$/.test(local)) return 'Mobitel addresses can use letters, numbers, dots, hyphens and underscores.';
        return null;
      } }
  };

  /* Custom domains — add here later without touching logic */
  var CUSTOM_DOMAINS = [];

  var CANONICAL_ALIAS = {
    'googlemail.com': 'gmail.com',
    'pm.me': 'proton.me',
    'protonmail.com': 'proton.me',
    'me.com': 'icloud.com',
    'mac.com': 'icloud.com',
    'hotmail.com': 'outlook.com',
    'live.com': 'outlook.com',
    'msn.com': 'outlook.com',
    'yahoo.co.uk': 'yahoo.com',
    'ymail.com': 'yahoo.com',
    'tuta.io': 'tutanota.com',
    'sltnet.lk': 'slt.lk'
  };

  /* ── Pipeline ────────────────────────────────────────── */
  function fail(code, message, extra) {
    var out = { ok: false, code: code, message: message, canonical: null, display: null, suggestion: null };
    if (extra) for (var k in extra) out[k] = extra[k];
    return out;
  }

  function validate(raw, opts) {
    opts = opts || {};
    var input = String(raw === null || raw === undefined ? '' : raw).trim();
    var display = input;

    /* ── STEP 1 · SYNTAX ─────────────────────────────── */
    if (!input) return fail('empty', 'Enter your email address.');

    if (input.length > 254) return fail('too_long', 'That email address is too long.');

    if (/\s/.test(input)) return fail('whitespace', 'Email addresses can’t contain spaces.');

    if (/[^\x20-\x7E]/.test(input)) {
      return fail('non_ascii', 'Email addresses can only use standard English characters.');
    }

    if (/[^a-zA-Z0-9@._%+\-]/.test(input.replace(/@/g, ''))) {
      return fail('invalid_chars', 'Email addresses can’t contain special characters like #, ! or $.');
    }

    var atCount = (input.match(/@/g) || []).length;
    if (atCount === 0) return fail('no_at', 'Your email address is missing an “@”.');
    if (atCount > 1) return fail('many_at', 'Your email address can only contain one “@”.');

    var atIdx = input.lastIndexOf('@');
    var local = input.slice(0, atIdx).toLowerCase();
    var domain = input.slice(atIdx + 1).toLowerCase();

    if (!local) return fail('no_local', 'Your email address is missing a name before the “@”.');
    if (local.length > 64) return fail('local_long', 'The part before the “@” is too long.');
    if (local.length < 1) return fail('local_short', 'The part before the “@” is too short.');

    if (!/^[a-z0-9._%+\-]+$/.test(local)) {
      return fail('local_chars', 'Use only letters, numbers, dots, underscores and hyphens before the “@”.');
    }
    if (/^[._]/.test(local) || /[._]$/.test(local)) {
      return fail('local_edge_dot', 'Email addresses can’t start or end with a dot.');
    }
    if (local.indexOf('..') > -1) {
      return fail('local_double_dot', 'Email addresses can’t contain two dots in a row.');
    }

    if (!domain) return fail('no_domain', 'Your email address is missing a domain after the “@”.');

    /* domain characters — catches `4proton#` */
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(domain)) {
      return fail('domain_chars', 'That domain isn’t valid. Check for typos or special characters.',
        { suggestion: suggestDomain(domain, input) });
    }

    var tld = domain.split('.').pop();
    if (tld.length < 2) return fail('tld_short', 'That domain’s ending looks wrong.');
    if (!/^[a-z]+$/.test(tld)) return fail('tld_chars', 'That domain’s ending looks wrong.');

    /* ── STEP 2 · DISPOSABLE ─────────────────────────── */
    if (DISPOSABLE.indexOf(domain) > -1) {
      return fail('disposable', 'Temporary email addresses aren’t accepted. Please use a permanent email.');
    }

    /* ── STEP 3 · TYPO DETECTION ─────────────────────── */
    /* Never "correct" a domain that is already recognised — e.g. gmail.com
       is 1 edit away from ymail.com and must not be rewritten. */
    var isKnown = !!PROVIDERS[domain] || CUSTOM_DOMAINS.indexOf(domain) > -1;
    var typoFix = null;
    if (!isKnown) {
      typoFix = TYPOS[domain] || null;
      if (!typoFix) {
        var domains = Object.keys(PROVIDERS).concat(CUSTOM_DOMAINS);
        var best = null, bestDist = 99;
        domains.forEach(function (d) {
          var dist = LX.levenshtein(domain, d);
          if (dist < bestDist && dist > 0 && dist <= 2) { bestDist = dist; best = d; }
        });
        if (best) typoFix = best;
      }
    }
    if (typoFix && !opts.skipTypoHint) {
      var fixedEmail = local + '@' + typoFix;
      return {
        ok: false,
        code: 'typo',
        message: 'Did you mean ' + fixedEmail + '?',
        suggestion: fixedEmail,
        suggestedDomain: typoFix,
        canonical: null,
        display: display,
        recoverable: true
      };
    }

    /* ── STEP 4 · WHITELIST ───────────────────────────── */
    var provider = PROVIDERS[domain];
    if (!provider && CUSTOM_DOMAINS.indexOf(domain) < 0) {
      return fail('unsupported', 'Please use a recognised email provider.', {
        hint: 'Gmail, Outlook, iCloud, Proton, Yahoo, Zoho, SLT, Dialog and more.',
        suggestion: suggestDomain(domain, input)
      });
    }
    if (provider && provider.alias) provider = PROVIDERS[provider.alias];

    /* ── STEP 5 · PROVIDER RULES ─────────────────────── */
    var effectiveLocal = local;
    var plusTag = null;

    if (provider) {
      if (provider.allowPlus === false && local.indexOf('+') > -1) {
        return fail('plus_not_allowed', provider.label + ' addresses can’t use “+” tags.');
      }
      if (local.indexOf('+') > -1) {
        plusTag = local.slice(local.indexOf('+') + 1);
        effectiveLocal = local.slice(0, local.indexOf('+'));
      }
      if (provider.dotsIgnored) effectiveLocal = effectiveLocal.replace(/\./g, '');

      /* Character / shape rules run BEFORE length so the most specific
         message wins — e.g. ab_cd@gmail.com reports the underscore rule,
         while ab@gmail.com reports the minimum length (blueprint §9). */
      if (provider.check) {
        var err = provider.check(effectiveLocal);
        if (err) return fail('provider_rule', err);
      }
      if (provider.startLetter && !/^[a-z]/.test(effectiveLocal)) {
        return fail('start_letter', (provider.label || 'This provider') + ' addresses must start with a letter.');
      }
      if (effectiveLocal.length < (provider.min || 1)) {
        return fail('local_short_provider',
          (provider.label || 'This provider') + ' addresses need at least ' + (provider.min || 1) + ' characters before the “@”.');
      }
      if (effectiveLocal.length > (provider.max || 64)) {
        return fail('local_long_provider',
          (provider.label || 'This provider') + ' addresses can have at most ' + provider.max + ' characters before the “@”.');
      }
    }

    /* ── STEP 6 · CANONICALIZE ────────────────────────── */
    var canonicalDomain = CANONICAL_ALIAS[domain] || domain;
    var canonicalLocal = effectiveLocal;
    if (canonicalDomain === 'gmail.com') canonicalLocal = canonicalLocal.replace(/\./g, '');

    var canonical = canonicalLocal + '@' + canonicalDomain;

    return {
      ok: true,
      code: 'ok',
      message: (provider && provider.label ? provider.label : 'Email') + ' address verified',
      display: display,
      local: local,
      domain: domain,
      plusTag: plusTag,
      canonical: canonical,
      providerLabel: provider ? (provider.label || canonicalDomain) : canonicalDomain
    };
  }

  /* Domain suggestion helper */
  function suggestDomain(domain, fullInput) {
    var known = Object.keys(PROVIDERS);
    var best = null, bestDist = 99;
    var bare = domain.split('.')[0];
    known.forEach(function (d) {
      var dist = LX.levenshtein(bare, d.split('.')[0]);
      if (dist < bestDist && dist <= 3) { bestDist = dist; best = d; }
    });
    if (best && domain !== best) {
      return String(fullInput || '').split('@')[0] + '@' + best;
    }
    return null;
  }

  /* Duplicate check uses canonical form (blueprint §9) */
  function isDuplicate(canonical, users, excludeUserId) {
    for (var i = 0; i < users.length; i++) {
      var u = users[i];
      if (excludeUserId && u.id === excludeUserId) continue;
      if (u.emailCanonical === canonical) return u;
    }
    return null;
  }

  LX.Email = {
    validate: validate,
    isDuplicate: isDuplicate,
    suggestDomain: suggestDomain,
    DISPOSABLE: DISPOSABLE,
    PROVIDERS: PROVIDERS,
    TYPOS: TYPOS,
    CUSTOM_DOMAINS: CUSTOM_DOMAINS,
    popular: ['gmail.com', 'outlook.com', 'icloud.com', 'proton.me', 'yahoo.com', 'slt.lk', 'dialog.lk']
  };
})(window);