/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — ui/shell.js
   Header · drawers · modal · toast · cart drawer · tab bar
   (blueprint §5.4, §5.5)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  /* ── Toast ───────────────────────────────────────────── */
  var TOAST_ICON = {
    success: '✓', error: '!', warn: '!', info: 'i'
  };

  function toast(opts) {
    var o = typeof opts === 'string' ? { message: opts } : (opts || {});
    var type = o.type || 'info';
    var stack = $('#toastStack');
    if (!stack) return;

    var node = LX.el('div', { class: 'toast toast-' + type, role: 'status' }, [
      LX.el('div', { class: 'toast-icon', text: TOAST_ICON[type] || 'i' }),
      LX.el('div', { class: 'grow' }, [
        o.title ? LX.el('div', { class: 'toast-title', text: o.title }) : null,
        o.message ? LX.el('div', { class: 'toast-msg', text: o.message }) : null
      ]),
      LX.el('button', {
        class: 'toast-x', 'aria-label': 'Dismiss',
        onclick: function () { dismiss(); }
      }, ['✕'])
    ]);

    stack.appendChild(node);
    var live = $('#liveRegion');
    if (live) live.textContent = (o.title ? o.title + '. ' : '') + (o.message || '');

    var timer = null;
    function dismiss() {
      if (timer) clearTimeout(timer);
      if (!node.parentNode) return;
      node.classList.add('out');
      setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 260);
    }
    timer = setTimeout(dismiss, o.duration || (type === 'error' ? 5200 : 3600));
    return { dismiss: dismiss };
  }

  /* ── Modal ───────────────────────────────────────────── */
  var modalState = { open: false, lastFocus: null, onClose: null };

  function openModal(opts) {
    var o = opts || {};
    var layer = $('#modalRoot');
    if (!layer) return;

    modalState.lastFocus = document.activeElement;
    modalState.onClose = o.onClose || null;
    modalState.open = true;

    $('#modalTitle').textContent = o.title || '';
    $('#modalBody').innerHTML = o.body || '';
    $('#modalBody').classList.toggle('modal-body-wide', !!o.wide);

    var foot = $('#modalFoot');
    foot.innerHTML = '';
    (o.actions || []).forEach(function (a) {
      var btn = LX.el('button', {
        class: 'btn ' + (a.variant || 'btn-ghost') + (a.block ? ' btn-block' : ''),
        onclick: function () {
          if (a.onClick) a.onClick(closeModal);
          else closeModal();
        }
      }, [a.label]);
      if (a.id) btn.id = a.id;
      foot.appendChild(btn);
    });
    foot.style.display = (o.actions || []).length ? '' : 'none';

    var modal = layer.querySelector('.modal');
    modal.classList.toggle('modal-wide', !!o.wide);

    layer.hidden = false;
    document.body.classList.add('no-scroll');
    if (o.onMount) o.onMount($('#modalBody'), closeModal);

    var focusable = modal.querySelector('input, select, textarea, button:not([data-close-modal])');
    if (focusable) setTimeout(function () { focusable.focus(); }, 60);
  }

  function closeModal() {
    var layer = $('#modalRoot');
    if (!layer || layer.hidden) return;
    layer.hidden = true;
    document.body.classList.remove('no-scroll');
    modalState.open = false;
    if (modalState.lastFocus && modalState.lastFocus.focus) {
      try { modalState.lastFocus.focus(); } catch (e) { }
    }
    if (modalState.onClose) { var f = modalState.onClose; modalState.onClose = null; f(); }
  }

  function confirmDialog(opts) {
    var o = opts || {};
    openModal({
      title: o.title || 'Are you sure?',
      body: '<p class="muted">' + LX.esc(o.message || '') + '</p>',
      actions: [
        { label: o.cancelLabel || 'Cancel', variant: 'btn-ghost', onClick: closeModal },
        {
          label: o.confirmLabel || 'Confirm', variant: o.danger ? 'btn-danger' : 'btn-gold',
          onClick: function (close) {
            close();
            if (o.onConfirm) o.onConfirm();
          }
        }
      ]
    });
  }

  /* ── Body scroll lock + ESC ──────────────────────────── */
  function anyLayerOpen() {
    var cart = $('#cartDrawer'), nav = $('#navDrawer'), modal = $('#modalRoot');
    return (cart && !cart.hidden) || (nav && !nav.hidden) || (modal && !modal.hidden);
  }

  function syncScrollLock() {
    document.body.classList.toggle('no-scroll', anyLayerOpen());
  }

  /* ── Nav drawer ──────────────────────────────────────── */
  function openNav() {
    var d = $('#navDrawer'); if (!d) return;
    d.hidden = false;
    var t = $('#navToggle'); if (t) t.setAttribute('aria-expanded', 'true');
    syncScrollLock();
  }
  function closeNav() {
    var d = $('#navDrawer'); if (!d) return;
    d.hidden = true;
    var t = $('#navToggle'); if (t) t.setAttribute('aria-expanded', 'false');
    syncScrollLock();
  }

  /* ── Cart drawer ─────────────────────────────────────── */
  function openCart() {
    renderBag();
    var d = $('#cartDrawer'); if (!d) return;
    d.hidden = false;
    syncScrollLock();
  }
  function closeCart() {
    var d = $('#cartDrawer'); if (!d) return;
    d.hidden = true;
    syncScrollLock();
  }

  function renderBag() {
    var body = $('#bagBody'), foot = $('#bagFoot');
    if (!body || !foot) return;

    var items = LX.Cart.items();
    var label = $('#bagCountLabel');
    if (label) {
      var n = LX.Cart.count();
      label.textContent = n ? '(' + n + ' item' + (n === 1 ? '' : 's') + ')' : '';
    }

    if (!items.length) {
      body.innerHTML =
        '<div class="empty">' +
        '<div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="30" height="30"><path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>' +
        '</div>' +
        '<h3>Your bag is empty</h3>' +
        '<p>Add something luxurious — you deserve it.</p>' +
        '<a class="btn btn-gold" href="#/shop" data-close-cart>Start Shopping</a>' +
        '</div>';
      foot.innerHTML = '';
      return;
    }

    var html = '<div class="bag-lines">';
    items.forEach(function (l) {
      html +=
        '<div class="bag-line" data-line="' + LX.esc(l.lineId) + '">' +
        '<div class="bag-thumb">' +
        '<img src="' + LX.esc(l.image) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'' + LX.esc(l.name).replace(/'/g, '') + '\')">' +
        '</div>' +
        '<div class="grow">' +
        '<div class="bag-name">' + LX.esc(l.name) + '</div>' +
        '<div class="muted tiny">' + LX.esc(l.size) + ' / ' + LX.esc(l.color) + '</div>' +
        '<div class="bag-ctrl">' +
        '<button class="qty-btn" data-qty="-1" aria-label="Decrease quantity">−</button>' +
        '<span class="qty-val">' + l.qty + '</span>' +
        '<button class="qty-btn" data-qty="1" aria-label="Increase quantity">+</button>' +
        '</div>' +
        '</div>' +
        '<div class="bag-right">' +
        '<div class="bag-price">' + LX.money(l.unitPrice * l.qty) + '</div>' +
        '<button class="btn-link tiny" data-remove>Remove</button>' +
        '</div>' +
        '</div>';
    });
    html += '</div>';

    var t = LX.Cart.totals();
    var meter = LX.Cart.freeDeliveryMeter(t.afterDiscounts);
    var combo = LX.Cart.comboHint();

    html += '<div class="bag-meter">';
    html += '<div class="row-between tiny"><span class="muted">' + LX.esc(meter.message) + '</span><span class="muted">' + meter.pct + '%</span></div>';
    html += '<div class="meter' + (meter.unlocked ? ' ok' : '') + '"><i style="width:' + meter.pct + '%"></i></div>';
    html += '</div>';

    if (combo) {
      html += '<div class="inline-note ' + (combo.applied ? 'note-ok' : 'note-info') + '">' + LX.esc(combo.message) + '</div>';
    }
    if (t.comboDiscount > 0) {
      html += '<div class="inline-note note-ok">Buy 3 Get 1 Free applied · you saved ' + LX.money(t.comboDiscount) + '</div>';
    }

    body.innerHTML = html;

    /* wire qty controls */
    $$('.bag-line', body).forEach(function (row) {
      var lineId = row.getAttribute('data-line');
      $$('[data-qty]', row).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var delta = parseInt(btn.getAttribute('data-qty'), 10);
          var line = null;
          LX.Cart.items().forEach(function (l) { if (l.lineId === lineId) line = l; });
          if (!line) return;
          var res = LX.Cart.setQty(lineId, line.qty + delta);
          if (res && res.message && !res.ok) toast({ type: 'warn', message: res.message });
          renderBag();
          updateBadges();
        });
      });
      var rm = row.querySelector('[data-remove]');
      if (rm) rm.addEventListener('click', function () {
        LX.Cart.remove(lineId);
        toast({ type: 'info', message: 'Item removed from your bag.' });
        renderBag();
        updateBadges();
      });
    });

    foot.innerHTML =
      '<div class="kv"><span class="k">Subtotal</span><span class="v">' + LX.money(t.subtotal) + '</span></div>' +
      (t.comboDiscount ? '<div class="kv"><span class="k">Combo discount</span><span class="v" style="color:var(--ok)">−' + LX.money(t.comboDiscount) + '</span></div>' : '') +
      '<div class="kv"><span class="k">Delivery</span><span class="v">' + (t.deliveryFee === 0 ? 'FREE' : LX.money(t.deliveryFee)) + '</span></div>' +
      '<div class="kv kv-total"><span class="k">Total</span><span class="v">' + LX.money(t.total) + '</span></div>' +
      '<a class="btn btn-gold btn-block" href="#/checkout" data-close-cart>Checkout</a>' +
      '<a class="btn btn-ghost btn-block btn-sm" href="#/cart" data-close-cart>View Bag</a>' +
      '<a class="btn btn-quiet btn-block btn-sm" href="' + LX.esc(LX.Cart.whatsappLink()) + '" target="_blank" rel="noopener">Order via WhatsApp</a>';
  }

  /* ── Badges ──────────────────────────────────────────── */
  function updateBadges() {
    var count = LX.Cart.count();
    [['#cartCount', count], ['#tabCartCount', count]].forEach(function (pair) {
      var node = $(pair[0]);
      if (!node) return;
      node.textContent = String(pair[1]);
      node.hidden = pair[1] === 0;
    });

    var wish = (LX.Store.get('wishlist') || []).length;
    var wb = $('#wishBadge');
    if (wb) { wb.textContent = String(wish); wb.hidden = wish === 0; }
  }

  /* ── Image fallback (offline Unsplash) ───────────────── */
  function imageFallback(img, label) {
    var wrap = img.parentNode;
    if (!wrap) return;
    if (wrap.querySelector('.img-fallback')) return;
    img.style.display = 'none';
    var initials = String(label || 'LUXE').split(/\s+/).slice(0, 2).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
    var fb = LX.el('div', { class: 'img-fallback' }, [
      LX.el('div', { class: 'mono', text: initials }),
      LX.el('div', { class: 'cap', text: 'LUXE INTIMO' })
    ]);
    wrap.appendChild(fb);
  }

  /* ── Header scroll behaviour ─────────────────────────── */
  function initHeader() {
    var header = $('#siteHeader');
    if (!header) return;
    var onScroll = LX.throttle(function () {
      header.classList.toggle('scrolled', global.scrollY > 24);
    }, 100);
    global.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Active nav highlight ────────────────────────────── */
  function highlightNav(route) {
    if (!route) return;
    var path = route.path;
    $$('.main-nav a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      var target = href.replace('#', '').split('?')[0];
      var active = target === path ||
        (target === '/shop' && (path === '/shop' || path.indexOf('/product') === 0)) ||
        (target === '/about' && path === '/about');
      a.classList.toggle('active', active);
    });
    $$('.tabbar a').forEach(function (a) {
      var tab = a.getAttribute('data-tab');
      var active =
        (tab === 'home' && path === '/') ||
        (tab === 'shop' && (path === '/shop' || path.indexOf('/product') === 0)) ||
        (tab === 'cart' && (path === '/cart' || path === '/checkout' || path === '/pay')) ||
        (tab === 'wishlist' && path === '/wishlist') ||
        (tab === 'account' && ['/account', '/orders', '/addresses', '/settings', '/login', '/signup'].indexOf(path) > -1);
      a.classList.toggle('active', active);
    });
  }

  /* ── Overlay close helpers ───────────────────────────── */
  function bindOverlays() {
    document.addEventListener('click', function (e) {
      var t = e.target;
      if (!t.closest) return;

      if (t.closest('[data-close-drawer]')) { closeNav(); return; }
      if (t.closest('[data-close-cart]')) { closeCart(); return; }
      if (t.closest('[data-close-modal]')) { closeModal(); return; }

      /* ESC-equivalent close on scrim */
      if (t.classList && t.classList.contains('drawer-scrim')) { closeNav(); closeCart(); return; }
      if (t.classList && t.classList.contains('modal-scrim')) { closeModal(); return; }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        if (modalState.open) { closeModal(); return; }
        var cart = $('#cartDrawer'); if (cart && !cart.hidden) { closeCart(); return; }
        var nav = $('#navDrawer'); if (nav && !nav.hidden) { closeNav(); return; }
      }
    });

    var navToggle = $('#navToggle');
    if (navToggle) navToggle.addEventListener('click', function () {
      var d = $('#navDrawer');
      if (d && d.hidden) openNav(); else closeNav();
    });

    var cartToggle = $('#cartToggle');
    if (cartToggle) cartToggle.addEventListener('click', openCart);

    var devDot = $('#devDot');
    if (devDot) devDot.addEventListener('click', function () { LX.Router.go('#/dev'); });

    /* Close drawers when a nav link inside is used */
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('#navDrawer a, #cartDrawer a') : null;
      if (a) { closeNav(); closeCart(); }
    });
  }

  /* ── Reveal on scroll (used sparingly — blueprint §5.5) ─ */
  var observer = null;
  function observeReveals(root) {
    if (!global.IntersectionObserver) return;
    if (observer) observer.disconnect();
    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('revealed');
          observer.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    LX.$$('.reveal', root || document).forEach(function (n) { observer.observe(n); });
  }

  /* ── Wishlist helpers (shared) ───────────────────────── */
  function isWished(productId) {
    return (LX.Store.get('wishlist') || []).indexOf(productId) > -1;
  }
  function toggleWish(productId) {
    var list = (LX.Store.get('wishlist') || []).slice();
    var i = list.indexOf(productId);
    if (i > -1) {
      list.splice(i, 1);
      LX.Store.set('wishlist', list);
      toast({ type: 'info', message: 'Removed from your saved items.' });
      updateBadges();
      return false;
    }
    list.push(productId);
    LX.Store.set('wishlist', list);
    toast({ type: 'success', message: 'Saved to your wishlist.' });
    updateBadges();
    return true;
  }

  /* ── Boot ────────────────────────────────────────────── */
  function init() {
    initHeader();
    bindOverlays();
    updateBadges();

    var year = $('#yearNow');
    if (year) year.textContent = String(new Date().getFullYear());

    LX.Store.subscribe('change:cart', function () {
      updateBadges();
      var drawer = $('#cartDrawer');
      if (drawer && !drawer.hidden) renderBag();
    });
    LX.Store.subscribe('change:wishlist', updateBadges);
    LX.Store.subscribe('change:session', updateBadges);

    LX.Router.on('navigate', function (route) {
      highlightNav(route);
      observeReveals();
      closeNav();
    });
  }

  LX.UI = {
    toast: toast,
    openModal: openModal,
    closeModal: closeModal,
    confirm: confirmDialog,
    openCart: openCart,
    closeCart: closeCart,
    openNav: openNav,
    closeNav: closeNav,
    renderBag: renderBag,
    updateBadges: updateBadges,
    imageFallback: imageFallback,
    isWished: isWished,
    toggleWish: toggleWish,
    observeReveals: observeReveals,
    init: init
  };
})(window);