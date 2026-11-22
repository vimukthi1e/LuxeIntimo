/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/cartpage.js
   Bag · qty · coupon · Buy 3 Get 1 Free · free-delivery meter
   (blueprint §13, §14 step 1)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  function renderCart() {
    var items = LX.Cart.items();

    if (!items.length) {
      return '<div class="container"><div class="empty">' +
        '<div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="32" height="32"><path d="M6 8h12l-1 12H7L6 8z" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linejoin="round"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8" stroke="currentColor" stroke-width="1.4" fill="none"/></svg>' +
        '</div>' +
        '<h3>Your bag is empty</h3>' +
        '<p>Nothing here yet. Explore the collection and find something you’ll love.</p>' +
        '<a class="btn btn-gold" href="#/shop">Start Shopping</a>' +
        '</div></div>';
    }

    var t = LX.Cart.totals();
    var meter = LX.Cart.freeDeliveryMeter(t.afterDiscounts);
    var combo = LX.Cart.comboHint();

    return '' +
      '<section class="container page-head">' +
      '<p class="label label-gold">Step 1 of 3</p>' +
      '<h1 class="h-serif">Your Bag</h1>' +
      '<p class="muted">' + t.itemCount + ' item' + (t.itemCount === 1 ? '' : 's') + ' · ' + LX.money(t.subtotal) + '</p>' +
      '</section>' +

      '<section class="container cart-layout">' +

      /* ── Lines ── */
      '<div class="cart-lines">' +
      items.map(function (l) {
        return '<div class="cart-line" data-line="' + LX.esc(l.lineId) + '">' +
          '<a class="cart-thumb" href="#/product/' + LX.esc(l.slug) + '">' +
          '<img src="' + LX.esc(l.image) + '" alt="' + LX.esc(l.name) + '" loading="lazy" onerror="LX.UI.imageFallback(this,\'' + LX.esc(l.name).replace(/'/g, '') + '\')">' +
          '</a>' +
          '<div class="grow">' +
          '<a class="cart-name" href="#/product/' + LX.esc(l.slug) + '">' + LX.esc(l.name) + '</a>' +
          '<p class="muted small">' + LX.esc(l.size) + ' · ' + LX.esc(l.color) + '</p>' +
          (l.isCombo ? '<span class="badge badge-gold">Combo · Buy 3 Get 1 Free</span>' : '') +
          '<div class="cart-ctrl">' +
          '<div class="qty-picker">' +
          '<button class="qty-btn" data-qty="-1" aria-label="Decrease">−</button>' +
          '<span class="qty-val">' + l.qty + '</span>' +
          '<button class="qty-btn" data-qty="1" aria-label="Increase">+</button>' +
          '</div>' +
          '<button class="btn-link" data-remove>Remove</button>' +
          '</div>' +
          '</div>' +
          '<div class="cart-right">' +
          '<div class="cart-price">' + LX.money(l.unitPrice * l.qty) + '</div>' +
          (l.compareAtPrice ? '<div class="muted tiny"><s>' + LX.money(l.compareAtPrice * l.qty) + '</s></div>' : '') +
          '</div>' +
          '</div>';
      }).join('') +

      /* Coupon */
      '<div class="panel coupon-panel">' +
      '<h4>Have a coupon?</h4>' +
      '<div class="coupon-row">' +
      '<input class="input" id="couponInput" type="text" placeholder="Enter code (WELCOME10)" autocomplete="off" ' +
      'value="' + LX.esc(t.couponCode || '') + '">' +
      '<button class="btn btn-ghost" id="couponApply">Apply</button>' +
      (t.couponCode ? '<button class="btn btn-quiet" id="couponRemove">Remove</button>' : '') +
      '</div>' +
      '<div class="field-msg" id="couponMsg">' +
      (t.couponCode ? 'Coupon ' + LX.esc(t.couponCode) + ' applied.' : 'Try WELCOME10 · LUXE500 · FREESHIP') +
      '</div>' +
      '</div>' +

      /* Free delivery meter */
      '<div class="panel">' +
      '<div class="row-between">' +
      '<span class="small">' + LX.esc(meter.message) + '</span>' +
      '<span class="muted tiny">' + meter.pct + '%</span>' +
      '</div>' +
      '<div class="meter' + (meter.unlocked ? ' ok' : '') + '"><i style="width:' + meter.pct + '%"></i></div>' +
      '</div>' +

      /* Combo hint */
      (combo ? '<div class="inline-note ' + (combo.applied ? 'note-ok' : 'note-info') + '">' + LX.esc(combo.message) + '</div>' : '') +

      '<a class="btn btn-quiet btn-block" href="' + LX.esc(LX.Cart.whatsappLink()) + '" target="_blank" rel="noopener">' +
      'Order via WhatsApp</a>' +
      '</div>' +

      /* ── Summary ── */
      '<aside class="cart-summary sticky-panel">' +
      '<div class="panel panel-elevated">' +
      '<h3 class="h-serif">Order Summary</h3>' +
      '<div class="kv"><span class="k">Subtotal</span><span class="v">' + LX.money(t.subtotal) + '</span></div>' +
      (t.comboDiscount ? '<div class="kv"><span class="k">Buy 3 Get 1 Free</span><span class="v" style="color:var(--ok)">−' + LX.money(t.comboDiscount) + '</span></div>' : '') +
      (t.couponDiscount ? '<div class="kv"><span class="k">Coupon ' + LX.esc(t.couponCode) + '</span><span class="v" style="color:var(--ok)">−' + LX.money(t.couponDiscount) + '</span></div>' : '') +
      '<div class="kv"><span class="k">Delivery</span><span class="v">' + (t.deliveryFee === 0 ? 'FREE' : LX.money(t.deliveryFee)) + '</span></div>' +
      (t.codFee ? '<div class="kv"><span class="k">COD handling</span><span class="v">' + LX.money(t.codFee) + '</span></div>' : '') +
      '<div class="kv kv-total"><span class="k">Total</span><span class="v">' + LX.money(t.total) + '</span></div>' +
      (t.saved > 0 ? '<div class="inline-note note-ok">You’re saving ' + LX.money(t.saved) + ' on this order.</div>' : '') +
      '<a class="btn btn-gold btn-block btn-lg" href="#/checkout">Proceed to Checkout</a>' +
      '<a class="btn btn-ghost btn-block" href="#/shop">Continue Shopping</a>' +
      '<div class="secure-note">' +
      '<svg viewBox="0 0 24 24" width="15" height="15"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>' +
      '<span class="muted tiny">Discreet packaging · Cash on delivery available · 7-day exchange</span>' +
      '</div>' +
      '</div>' +
      '</aside>' +
      '</section>';
  }

  function mountCart(root) {
    function refresh() { LX.Router.render(); }

    $$('.cart-line', root).forEach(function (row) {
      var lineId = row.getAttribute('data-line');
      $$('[data-qty]', row).forEach(function (btn) {
        btn.addEventListener('click', function () {
          var delta = parseInt(btn.getAttribute('data-qty'), 10);
          var line = null;
          LX.Cart.items().forEach(function (l) { if (l.lineId === lineId) line = l; });
          if (!line) return;
          var res = LX.Cart.setQty(lineId, line.qty + delta);
          if (res && !res.ok && res.message) LX.UI.toast({ type: 'warn', message: res.message });
          refresh();
        });
      });
      var rm = row.querySelector('[data-remove]');
      if (rm) rm.addEventListener('click', function () {
        LX.Cart.remove(lineId);
        LX.UI.toast({ type: 'info', message: 'Item removed.' });
        refresh();
      });
    });

    var applyBtn = $('#couponApply', root);
    var removeBtn = $('#couponRemove', root);
    var input = $('#couponInput', root);
    var msg = $('#couponMsg', root);

    function applyCoupon() {
      if (!input) return;
      var res = LX.Cart.applyCoupon(input.value);
      if (msg) {
        msg.textContent = res.message;
        msg.className = 'field-msg ' + (res.ok ? 'success' : 'error');
      }
      LX.UI.toast({ type: res.ok ? 'success' : 'error', message: res.message });
      if (res.ok) setTimeout(refresh, 480);
    }

    if (applyBtn) applyBtn.addEventListener('click', applyCoupon);
    if (input) input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); applyCoupon(); }
    });
    if (removeBtn) removeBtn.addEventListener('click', function () {
      LX.Cart.removeCoupon();
      LX.UI.toast({ type: 'info', message: 'Coupon removed.' });
      refresh();
    });

    LX.UI.observeReveals(root);
  }

  LX.Pages.cart = { title: 'Your Bag', render: renderCart, mount: mountCart };
})(window);