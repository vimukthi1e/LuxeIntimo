/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — services/order.js
   Order draft → validate → place → status timeline
   (blueprint §7.2 Order, §14)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  var STATUS_FLOW = ['pending_payment', 'confirmed', 'processing', 'shipped', 'delivered'];

  var STATUS_META = {
    pending_payment: { label: 'Awaiting payment', tone: 'warn' },
    confirmed:       { label: 'Confirmed',        tone: 'ok' },
    processing:      { label: 'Being packed',     tone: 'ok' },
    shipped:         { label: 'On its way',       tone: 'ok' },
    delivered:       { label: 'Delivered',        tone: 'ok' },
    cancelled:       { label: 'Cancelled',        tone: 'err' }
  };

  function orders() { return LX.Store.get('orders') || []; }
  function saveOrders(list) { LX.Store.set('orders', list, undefined, { immediate: true }); }

  /* ── Create ──────────────────────────────────────────── */
  function create(draft) {
    var d = draft || {};

    /* Stock + price validation (blueprint §13.5) */
    var check = LX.Cart.validate();
    if (!check.ok) {
      return { ok: false, code: 'empty', message: 'Your bag is empty.', notices: check.notices };
    }
    if (check.notices.length) {
      return { ok: false, code: 'stock', message: 'Your bag changed before checkout. Please review and try again.', notices: check.notices };
    }

    /* Contact */
    var nameRes = LX.V.name(d.contact && d.contact.name);
    if (!nameRes.ok) return { ok: false, code: 'contact', field: 'name', message: nameRes.message };

    var emailRes = LX.Email.validate(d.contact && d.contact.email);
    if (!emailRes.ok) return { ok: false, code: 'contact', field: 'email', message: emailRes.message };

    var phoneRes = LX.V.phone(d.contact && d.contact.phone);
    if (!phoneRes.ok) return { ok: false, code: 'contact', field: 'phone', message: phoneRes.message };

    /* Shipping */
    var ship = d.shipping || {};
    var v = LX.V.address(ship);
    if (!v.ok) {
      var firstKey = Object.keys(v.errors)[0];
      return { ok: false, code: 'shipping', field: firstKey, errors: v.errors, message: v.errors[firstKey] };
    }

    var district = LX.SL.district(ship.districtId);
    var division = LX.SL.division(ship.districtId, ship.divisionCode);
    var area = null;
    if (ship.area) {
      division.areas.forEach(function (a) { if (a.name === ship.area) area = a; });
    }

    /* Totals */
    var totals = LX.Cart.totals({
      districtId: district.id,
      deliveryMethod: d.deliveryMethod,
      paymentMethod: d.paymentMethod
    });

    if (totals.total <= 0) {
      return { ok: false, code: 'totals', message: 'Order total must be greater than zero.' };
    }

    var user = LX.Auth.currentUser();
    var now = Date.now();
    var method = d.paymentMethod === 'cod' ? 'cod' : 'card';
    var status = method === 'cod' ? 'confirmed' : 'pending_payment';
    var paymentStatus = method === 'cod' ? 'pending_cod' : 'unpaid';

    var order = {
      id: LX.uid('o_'),
      orderNumber: LX.Api.nextOrderNumber(),
      userId: user ? user.id : null,
      items: LX.Cart.items().map(function (l) { return LX.extend({}, l); }),
      contact: { name: nameRes.value, email: emailRes.display, phone: phoneRes.e164 },
      shipping: {
        id: ship.id || LX.uid('a_'),
        label: ship.label || 'Home',
        name: ship.name || nameRes.value,
        phone: phoneRes.e164,
        line1: String(ship.line1).trim(),
        line2: ship.line2 ? String(ship.line2).trim() : '',
        districtId: district.id,
        districtName: district.name,
        divisionCode: division.code,
        divisionName: division.name,
        area: area ? area.name : (ship.area || ''),
        postal: String(ship.postal).trim(),
        country: 'Sri Lanka',
        isDefault: !!ship.isDefault
      },
      deliveryMethod: d.deliveryMethod === 'express' ? 'express' : 'standard',
      paymentMethod: method,
      subtotal: totals.subtotal,
      comboDiscount: totals.comboDiscount,
      couponDiscount: totals.couponDiscount,
      couponCode: totals.couponCode,
      discount: totals.comboDiscount + totals.couponDiscount,
      deliveryFee: totals.deliveryFee,
      codFee: totals.codFee,
      total: totals.total,
      status: status,
      paymentStatus: paymentStatus,
      payment: null,
      eta: LX.SL.eta(d.deliveryMethod === 'express' ? 'express' : 'standard'),
      timeline: [{ at: now, status: status, note: method === 'cod' ? 'Order placed — cash on delivery.' : 'Order created — awaiting payment.' }],
      createdAt: now,
      updatedAt: now
    };

    var list = orders();
    list.push(order);
    saveOrders(list);

    /* Save address to account if requested */
    if (user && d.saveAddress) {
      LX.Auth.saveAddress(LX.extend({}, order.shipping, { label: ship.label || 'Home' }), false);
    }

    /* Clear bag */
    LX.Cart.clear();

    return { ok: true, order: order, message: 'Order ' + order.orderNumber + ' created.' };
  }

  /* ── Payment completion ──────────────────────────────── */
  function markPaid(orderNumber, payment) {
    var list = orders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].orderNumber === orderNumber || list[i].id === orderNumber) {
        list[i].status = 'confirmed';
        list[i].paymentStatus = 'paid';
        list[i].payment = payment || null;
        list[i].updatedAt = Date.now();
        list[i].timeline.push({ at: Date.now(), status: 'confirmed', note: 'Payment received.' });
        saveOrders(list);
        return list[i];
      }
    }
    return null;
  }

  function updateStatus(orderNumber, status, note) {
    var list = orders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].orderNumber === orderNumber || list[i].id === orderNumber) {
        list[i].status = status;
        list[i].updatedAt = Date.now();
        list[i].timeline.push({ at: Date.now(), status: status, note: note || STATUS_META[status].label });
        saveOrders(list);
        return list[i];
      }
    }
    return null;
  }

  /* ── Queries ─────────────────────────────────────────── */
  function byNumber(orderNumber) {
    var list = orders();
    for (var i = 0; i < list.length; i++) {
      if (list[i].orderNumber === orderNumber || list[i].id === orderNumber) return list[i];
    }
    return null;
  }

  function forUser(userId) {
    return orders()
      .filter(function (o) { return o.userId === userId; })
      .sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  function all() {
    return orders().sort(function (a, b) { return b.createdAt - a.createdAt; });
  }

  function cancel(orderNumber, reason) {
    return updateStatus(orderNumber, 'cancelled', reason || 'Cancelled by customer.');
  }

  /* ── Timeline steps for UI ───────────────────────────── */
  function trackingSteps(order) {
    var reached = STATUS_FLOW.indexOf(order.status);
    return STATUS_FLOW.map(function (s, i) {
      var entry = null;
      for (var k = 0; k < order.timeline.length; k++) if (order.timeline[k].status === s) entry = order.timeline[k];
      return {
        key: s,
        label: STATUS_META[s].label,
        done: order.status !== 'cancelled' && i <= reached,
        current: order.status !== 'cancelled' && i === reached,
        at: entry ? entry.at : null,
        note: entry ? entry.note : ''
      };
    });
  }

  function receiptLines(order) {
    return order.items.map(function (l) {
      return {
        title: l.name,
        meta: [l.size, l.color].filter(Boolean).join(' / ') + ' × ' + l.qty,
        amount: l.unitPrice * l.qty
      };
    });
  }

  LX.Order = {
    create: create,
    markPaid: markPaid,
    updateStatus: updateStatus,
    cancel: cancel,
    byNumber: byNumber,
    forUser: forUser,
    all: all,
    trackingSteps: trackingSteps,
    receiptLines: receiptLines,
    STATUS_FLOW: STATUS_FLOW,
    STATUS_META: STATUS_META
  };
})(window);