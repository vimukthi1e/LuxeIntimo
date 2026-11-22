/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — services/cart.js
   Pricing engine — calculation order is LOCKED (blueprint §13.1)
     1 Subtotal → 2 Combo (Buy 3 Get 1 Free) → 3 After Combo
     → 4 Coupon → 5 After Discounts → 6 Delivery → 7 COD → 8 Total
   All values INTEGER CENTS.
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  function items() { return (LX.Store.get('cart') || {}).items || []; }
  function save(list, coupon) {
    var c = coupon === undefined ? (LX.Store.get('cart') || {}).coupon : coupon;
    LX.Store.set('cart', { items: list, coupon: c || null, updatedAt: Date.now() });
  }
  function lineKey(productId, size, color) { return productId + '|' + size + '|' + (color || ''); }

  /* ── Mutations ───────────────────────────────────────── */
  function add(productId, size, color, qty) {
    qty = Math.max(1, Math.min(20, parseInt(qty, 10) || 1));
    var product = LX.Catalog.byId(productId);
    if (!product) return { ok: false, message: 'That product is no longer available.' };

    var stock = LX.Catalog.stockOf(productId, size, color);
    if (stock <= 0) return { ok: false, message: 'That size is currently sold out.' };

    var list = items().slice();
    var key = lineKey(productId, size, color);
    var existing = null;
    for (var i = 0; i < list.length; i++) if (list[i].key === key) existing = list[i];

    var currentQty = existing ? existing.qty : 0;
    if (currentQty + qty > stock) {
      return { ok: false, message: 'Only ' + stock + ' left in that size. You already have ' + currentQty + ' in your bag.' };
    }

    if (existing) {
      existing.qty += qty;
    } else {
      list.push({
        lineId: LX.uid('ln_'),
        key: key,
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.images[0],
        size: size,
        color: color || product.colors[0].name,
        sku: variantSku(product, size, color),
        unitPrice: product.price,
        compareAtPrice: product.compareAtPrice || null,
        isCombo: product.isCombo,
        qty: qty
      });
    }
    save(list);
    return { ok: true, message: product.name + ' added to your bag.', lineCount: list.length };
  }

  function variantSku(product, size, color) {
    for (var i = 0; i < product.variants.length; i++) {
      var v = product.variants[i];
      if (v.size === size && (!color || v.color === color)) return v.sku;
    }
    return product.id;
  }

  function setQty(lineId, qty) {
    qty = parseInt(qty, 10);
    if (isNaN(qty) || qty < 1) return remove(lineId);
    qty = Math.min(20, qty);
    var list = items().slice();
    for (var i = 0; i < list.length; i++) {
      if (list[i].lineId === lineId) {
        var stock = LX.Catalog.stockOf(list[i].productId, list[i].size, list[i].color);
        if (qty > stock) {
          list[i].qty = Math.max(1, stock);
          save(list);
          return { ok: false, message: 'Only ' + stock + ' available in that size — quantity adjusted.' };
        }
        list[i].qty = qty;
        save(list);
        return { ok: true };
      }
    }
    return { ok: false, message: 'Item not found in your bag.' };
  }

  function remove(lineId) {
    var list = items().filter(function (l) { return l.lineId !== lineId; });
    save(list);
    return { ok: true, message: 'Item removed from your bag.' };
  }

  function clear() { save([], null); }

  /* ── Coupon ──────────────────────────────────────────── */
  function applyCoupon(code) {
    var c = LX.Catalog.coupon(code);
    if (!c || !c.active) return { ok: false, message: 'That coupon code isn’t valid.' };
    var t = totals({ ignoreCoupon: true });
    if (c.minSubtotal && t.afterCombo < c.minSubtotal) {
      return {
        ok: false,
        message: c.code + ' needs a subtotal of ' + LX.money(c.minSubtotal) + '. Add ' +
          LX.money(c.minSubtotal - t.afterCombo) + ' more to use it.'
      };
    }
    var list = items();
    save(list, { code: c.code, type: c.type, value: c.value, label: c.label, appliedAt: Date.now() });
    return { ok: true, message: 'Coupon ' + c.code + ' applied — ' + c.label + '.' };
  }

  function removeCoupon() {
    save(items(), null);
    return { ok: true, message: 'Coupon removed.' };
  }

  /* ── Buy 3 Get 1 Free (combo items) ──────────────────── */
  function comboDiscount(list) {
    var units = [];
    list.forEach(function (l) {
      if (!l.isCombo) return;
      for (var i = 0; i < l.qty; i++) units.push(l.unitPrice);
    });
    if (units.length < 4) return { amount: 0, freeCount: 0, unitCount: units.length };
    units.sort(function (a, b) { return a - b; }); /* cheapest free first */
    var freeCount = Math.floor(units.length / 4);
    var amount = 0;
    for (var i = 0; i < freeCount; i++) amount += units[i];
    return { amount: amount, freeCount: freeCount, unitCount: units.length };
  }

  /* ── Totals (LOCKED order — blueprint §13.1) ─────────── */
  function totals(opts) {
    opts = opts || {};
    var list = items();

    /* 1. Subtotal */
    var subtotal = LX.sum(list.map(function (l) { return l.unitPrice * l.qty; }));

    /* 2. Combo discount — Buy 3 Get 1 Free */
    var combo = comboDiscount(list);

    /* 3. After combo */
    var afterCombo = subtotal - combo.amount;

    /* 4. Coupon */
    var coupon = opts.ignoreCoupon ? null : (opts.coupon !== undefined ? opts.coupon : (LX.Store.get('cart') || {}).coupon);
    var couponDiscount = 0;
    var couponFreeShip = false;
    var couponError = null;

    if (coupon) {
      if (coupon.minSubtotal && afterCombo < coupon.minSubtotal) {
        couponError = 'Coupon minimum not met';
      } else if (coupon.type === 'percent') {
        couponDiscount = Math.round(afterCombo * (coupon.value / 100));
      } else if (coupon.type === 'fixed') {
        couponDiscount = Math.min(coupon.value, afterCombo);
      } else if (coupon.type === 'freeShipping') {
        couponFreeShip = true;
      }
    }

    /* 5. After discounts */
    var afterDiscounts = Math.max(0, afterCombo - couponDiscount);

    /* 6/7. Delivery + COD */
    var quote = LX.SL.quote({
      districtId: opts.districtId || (LX.Store.get('checkout') || {}).shipping && (LX.Store.get('checkout') || {}).shipping.districtId,
      afterDiscounts: afterDiscounts,
      deliveryMethod: opts.deliveryMethod || (LX.Store.get('checkout') || {}).deliveryMethod || 'standard',
      paymentMethod: opts.paymentMethod || (LX.Store.get('checkout') || {}).paymentMethod || 'card',
      couponFreeShip: couponFreeShip
    });

    /* 8. Total — an empty bag never carries delivery or COD fees */
    if (list.length === 0) {
      quote.deliveryFee = 0;
      quote.codFee = 0;
      quote.deliveryFeeWaived = false;
    }
    var total = afterDiscounts + quote.deliveryFee + quote.codFee;

    return {
      itemCount: LX.sum(list.map(function (l) { return l.qty; })),
      lineCount: list.length,
      subtotal: subtotal,
      comboDiscount: combo.amount,
      comboFreeCount: combo.freeCount,
      comboUnitCount: combo.unitCount,
      afterCombo: afterCombo,
      coupon: coupon && !couponError ? coupon : null,
      couponCode: coupon && !couponError ? coupon.code : null,
      couponDiscount: couponDiscount,
      couponFreeShip: couponFreeShip && !couponError,
      couponError: couponError,
      afterDiscounts: afterDiscounts,
      deliveryFee: quote.deliveryFee,
      deliveryFeeWaived: quote.deliveryFeeWaived,
      deliveryMethod: quote.method,
      codFee: quote.codFee,
      zone: quote.zone,
      zoneName: quote.zoneName,
      districtName: quote.districtName,
      daysLabel: quote.daysLabel,
      total: total,
      saved: LX.sum(list.map(function (l) {
        return l.compareAtPrice ? (l.compareAtPrice - l.unitPrice) * l.qty : 0;
      })) + combo.amount
    };
  }

  /* ── Free delivery meter ─────────────────────────────── */
  function freeDeliveryMeter(afterDiscounts) {
    var threshold = LX.SL.pricing.freeDeliveryThreshold;
    var base = afterDiscounts === undefined ? totals().afterDiscounts : afterDiscounts;
    var remaining = Math.max(0, threshold - base);
    var pct = Math.min(100, Math.round((base / threshold) * 100));
    return {
      threshold: threshold,
      remaining: remaining,
      unlocked: remaining === 0,
      pct: pct,
      message: remaining === 0
        ? 'Free standard delivery unlocked'
        : 'Add ' + LX.money(remaining) + ' more for free delivery'
    };
  }

  /* ── Stock validation (blueprint §13.5) ──────────────── */
  function validate() {
    var notices = [];
    var list = items().slice();
    var kept = [];

    list.forEach(function (l) {
      var p = LX.Catalog.byId(l.productId);
      if (!p || !p.isActive) {
        notices.push({ type: 'warn', message: '“' + l.name + '” is no longer available and was removed.' });
        return;
      }
      if (p.price !== l.unitPrice) {
        notices.push({ type: 'info', message: 'Price of “' + l.name + '” updated to ' + LX.money(p.price) + '.' });
        l.unitPrice = p.price;
        l.compareAtPrice = p.compareAtPrice || null;
      }
      var stock = LX.Catalog.stockOf(l.productId, l.size, l.color);
      if (stock <= 0) {
        notices.push({ type: 'warn', message: '“' + l.name + '” (' + l.size + ') is sold out and was removed.' });
        return;
      }
      if (l.qty > stock) {
        notices.push({ type: 'warn', message: '“' + l.name + '” (' + l.size + ') reduced to ' + stock + ' — that’s all we have.' });
        l.qty = stock;
      }
      kept.push(l);
    });

    if (kept.length !== list.length || notices.some(function (n) { return n.type === 'warn'; })) {
      save(kept);
    }
    return { ok: kept.length > 0, notices: notices, items: kept };
  }

  /* ── UI helpers ──────────────────────────────────────── */
  function count() { return LX.sum(items().map(function (l) { return l.qty; })); }
  function isEmpty() { return items().length === 0; }

  function comboHint() {
    var combo = comboDiscount(items());
    if (combo.freeCount > 0) {
      return { applied: true, message: 'Buy 3 Get 1 Free applied · ' + combo.freeCount + ' free' };
    }
    var need = 4 - (combo.unitCount % 4);
    if (combo.unitCount > 0 && need < 4) {
      return { applied: false, message: 'Add ' + need + ' more combo item' + (need === 1 ? '' : 's') + ' to unlock Buy 3 Get 1 Free' };
    }
    return null;
  }

  function whatsappLink() {
    var lines = items().map(function (l) {
      return '• ' + l.name + ' (' + l.size + ' / ' + l.color + ') × ' + l.qty + ' — ' + LX.money(l.unitPrice * l.qty);
    });
    var t = totals();
    var msg = 'Hello LUXE INTIMO! I would like to order:%0A' +
      lines.map(encodeURIComponent).join('%0A') + '%0A%0A' +
      encodeURIComponent('Total: ' + LX.money(t.total));
    return 'https://wa.me/' + LX.Config.WHATSAPP + '?text=' + msg;
  }

  LX.Cart = {
    items: items, add: add, setQty: setQty, remove: remove, clear: clear,
    applyCoupon: applyCoupon, removeCoupon: removeCoupon,
    totals: totals, comboDiscount: comboDiscount, comboHint: comboHint,
    freeDeliveryMeter: freeDeliveryMeter, validate: validate,
    count: count, isEmpty: isEmpty, whatsappLink: whatsappLink
  };
})(window);