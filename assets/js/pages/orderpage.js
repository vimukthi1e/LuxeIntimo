/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/orderpage.js
   Order confirmation · receipt · timeline · tracking
   (blueprint §14 step 4)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  function renderOrder(params) {
    var order = LX.Order.byNumber(params.orderNumber);
    if (!order) {
      return '<div class="container"><div class="empty">' +
        '<div class="empty-icon">?</div>' +
        '<h3>Order not found</h3>' +
        '<p>We couldn’t find an order with that number.</p>' +
        '<a class="btn btn-gold" href="#/orders">View your orders</a>' +
        '</div></div>';
    }

    var u = LX.Auth.currentUser();
    var steps = LX.Order.trackingSteps(order);
    var eta = order.eta || LX.SL.eta(order.deliveryMethod);

    return '' +
      /* ── Confirmation banner ── */
      '<section class="container order-hero">' +
      '<div class="order-hero-inner">' +
      '<svg class="check-draw" viewBox="0 0 52 52" width="82" height="82">' +
      '<circle cx="26" cy="26" r="23" fill="none" stroke="var(--ok)" stroke-width="2.4" class="cd-circle"/>' +
      '<path d="M15 26.5l7.4 7.6L37 18.6" fill="none" stroke="var(--ok)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" class="cd-check"/>' +
      '</svg>' +
      '<p class="label label-gold">Thank you</p>' +
      '<h1 class="h-serif">Order confirmed</h1>' +
      '<p class="muted">Order <b class="order-num">#' + LX.esc(order.orderNumber) + '</b> has been placed successfully.</p>' +
      '<p class="muted small">A confirmation has been sent to ' + LX.esc(order.contact.email) + '</p>' +
      '<div class="row wrap" style="gap:.72rem;justify-content:center;margin-top:1.35rem">' +
      '<a class="btn btn-gold" href="#/shop">Continue Shopping</a>' +
      (!u ? '<a class="btn btn-ghost" href="#/signup">Create an account to track this order</a>' : '') +
      '</div>' +
      '</div>' +
      '</section>' +

      /* ── ETA strip ── */
      '<section class="container">' +
      '<div class="eta-strip">' +
      '<div><p class="label">Estimated delivery</p>' +
      '<p class="h-serif">' + LX.fmtDateShort(eta.from) + ' – ' + LX.fmtDateShort(eta.to) + '</p></div>' +
      '<div><p class="label">Delivery method</p>' +
      '<p class="small">' + (order.deliveryMethod === 'express' ? 'Express delivery' : 'Standard delivery') + ' · Zone ' + LX.SL.zoneOf(order.shipping.districtId) + '</p></div>' +
      '<div><p class="label">Payment</p>' +
      '<p class="small">' + (order.paymentMethod === 'cod'
        ? 'Cash on delivery'
        : LX.esc(LX.Payment.brandLabel(order.payment && order.payment.brand)) + (order.payment && order.payment.last4 ? ' •••• ' + LX.esc(order.payment.last4) : '')) + '</p></div>' +
      '</div>' +
      '</section>' +

      '<section class="container order-layout">' +

      /* ── Left: items + timeline ── */
      '<div>' +
      '<div class="panel">' +
      '<h3 class="h-serif">Items</h3>' +
      '<div class="order-items">' +
      order.items.map(function (l) {
        return '<div class="list-row">' +
          '<div class="review-thumb"><img src="' + LX.esc(l.image) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'LX\')"></div>' +
          '<div class="grow"><b class="small">' + LX.esc(l.name) + '</b>' +
          '<div class="muted tiny">' + LX.esc(l.size) + ' · ' + LX.esc(l.color) + ' × ' + l.qty + '</div>' +
          (l.isCombo ? '<span class="badge badge-gold" style="margin-top:.35rem">Combo item</span>' : '') +
          '</div>' +
          '<div class="small nowrap">' + LX.money(l.unitPrice * l.qty) + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +
      '</div>' +

      '<div class="panel" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Order timeline</h3>' +
      '<div class="timeline" style="margin-top:1.15rem">' +
      order.timeline.map(function (t, i) {
        var isLast = i === order.timeline.length - 1;
        return '<div class="tl-item ' + (isLast ? 'current' : 'done') + '">' +
          '<div class="tl-title">' + LX.esc((LX.Order.STATUS_META[t.status] || { label: t.status }).label) + '</div>' +
          '<div class="tl-meta">' + LX.fmtDate(t.at, { time: true }) + (t.note ? ' · ' + LX.esc(t.note) : '') + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +

      '<div class="divider-soft"></div>' +
      '<p class="label">Tracking</p>' +
      '<div class="track-steps">' +
      steps.map(function (s) {
        return '<div class="track-step ' + (s.current ? 'current' : (s.done ? 'done' : '')) + '">' +
          '<i></i><span>' + LX.esc(s.label) + '</span></div>';
      }).join('') +
      '</div>' +
      '</div>' +
      '</div>' +

      /* ── Right: summary + address ── */
      '<aside>' +
      '<div class="panel panel-elevated">' +
      '<h3 class="h-serif">Receipt</h3>' +
      '<div class="kv"><span class="k">Subtotal</span><span class="v">' + LX.money(order.subtotal) + '</span></div>' +
      (order.comboDiscount ? '<div class="kv"><span class="k">Buy 3 Get 1 Free</span><span class="v" style="color:var(--ok)">−' + LX.money(order.comboDiscount) + '</span></div>' : '') +
      (order.couponDiscount ? '<div class="kv"><span class="k">Coupon ' + LX.esc(order.couponCode || '') + '</span><span class="v" style="color:var(--ok)">−' + LX.money(order.couponDiscount) + '</span></div>' : '') +
      '<div class="kv"><span class="k">Delivery</span><span class="v">' + (order.deliveryFee === 0 ? 'FREE' : LX.money(order.deliveryFee)) + '</span></div>' +
      (order.codFee ? '<div class="kv"><span class="k">COD handling</span><span class="v">' + LX.money(order.codFee) + '</span></div>' : '') +
      '<div class="kv kv-total"><span class="k">Total</span><span class="v">' + LX.money(order.total) + '</span></div>' +
      '<div class="inline-note ' + (order.paymentStatus === 'paid' ? 'note-ok' : 'note-info') + '" style="margin-top:.9rem">' +
      (order.paymentStatus === 'paid' ? '✓ Payment received' : 'Payment pending — cash on delivery') +
      '</div>' +
      '</div>' +

      '<div class="panel" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Delivery address</h3>' +
      '<p class="small" style="margin-top:.75rem"><b>' + LX.esc(order.shipping.name) + '</b></p>' +
      '<p class="muted small">' + LX.esc(order.shipping.line1) + (order.shipping.line2 ? ', ' + LX.esc(order.shipping.line2) : '') + '</p>' +
      (order.shipping.area ? '<p class="muted small">' + LX.esc(order.shipping.area) + '</p>' : '') +
      '<p class="muted small">' + LX.esc(order.shipping.divisionName) + ', ' + LX.esc(order.shipping.districtName) + ' ' + LX.esc(order.shipping.postal) + '</p>' +
      '<p class="muted small">🇱🇰 Sri Lanka</p>' +
      '<div class="divider-soft"></div>' +
      '<p class="label">Contact</p>' +
      '<p class="muted small">' + LX.esc(order.contact.name) + '</p>' +
      '<p class="muted small">' + LX.esc(order.contact.email) + '</p>' +
      '<p class="muted small">' + LX.esc(order.contact.phone) + '</p>' +
      '</div>' +

      '<div class="panel" style="margin-top:1.35rem">' +
      '<h3 class="h-serif">Need help?</h3>' +
      '<p class="muted small">Reply to your confirmation email or reach us on WhatsApp. Include your order number.</p>' +
      '<a class="btn btn-ghost btn-block btn-sm" style="margin-top:.85rem" ' +
      'href="https://wa.me/' + LX.esc(LX.Config.WHATSAPP) + '?text=' + encodeURIComponent('Hi LUXE INTIMO, I need help with order ' + order.orderNumber) + '" ' +
      'target="_blank" rel="noopener">Contact via WhatsApp</a>' +
      '</div>' +
      '</aside>' +

      '</section>';
  }

  function mountOrder(root, params) {
    var order = LX.Order.byNumber(params.orderNumber);
    if (!order) return;

    /* Animate the checkmark */
    var draw = $('.check-draw', root);
    if (draw) {
      requestAnimationFrame(function () {
        draw.classList.add('drawn');
      });
    }
  }

  LX.Pages.order = {
    title: function (params) { return 'Order ' + params.orderNumber; },
    render: renderOrder,
    mount: mountOrder
  };
})(window);