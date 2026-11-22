/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — services/payment.js
   MockGateway implementation + 4-stage processing sequence
   ★ PAN and CVC are NEVER persisted (PCI — blueprint §11.8) ★
   (blueprint §11)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ── MockGateway (swap-ready — blueprint §11.7) ──────── */
  var GatewayMock = {
    name: 'MockGateway',

    /* Returns a token. The full card number is discarded immediately. */
    tokenize: function (card) {
      var digits = String(card && card.number ? card.number : '').replace(/\D/g, '');
      var brand = (card && card.brand) || LX.Card.detect(digits).brand;
      return {
        token: 'pm_' + LX.uid().slice(0, 24),
        brand: brand,
        last4: digits.slice(-4),
        expMonth: card ? card.expMonth : null,
        expYear: card ? card.expYear : null,
        /* NOTE: no PAN, no CVC — by design */
      };
    }
  };

  /* ── Processing stages (blueprint §11.6) ─────────────── */
  var STAGES = [
    { key: 'validate',  label: 'Validating card…',        ms: 400 },
    { key: 'bank',      label: 'Contacting bank…',        ms: 900 },
    { key: 'authorize', label: 'Authorizing payment…',    ms: 700 },
    { key: 'confirm',   label: 'Confirming…',             ms: 400 }
  ];

  function runStages(onStage) {
    var dev = LX.Store.get('dev') || {};
    var chain = Promise.resolve();
    STAGES.forEach(function (s, i) {
      chain = chain.then(function () {
        if (onStage) onStage(s, i, STAGES.length);
        return LX.sleep(dev.instantPayment ? 8 : s.ms);
      });
    });
    return chain;
  }

  /* ── Card payment ────────────────────────────────────── */
  function processCard(opts) {
    var o = opts || {};
    var order = o.order;
    if (!order) return Promise.reject(new Error('No order to pay.'));

    return Promise.resolve(runStages(o.onStage))
      .then(function () {
        return LX.Api.gateway.createIntent(order.total, LX.Config.CURRENCY, {
          orderNumber: order.orderNumber,
          email: order.contact ? order.contact.email : null
        });
      })
      .then(function (intent) {
        /* ★ tokenize discards the PAN ★ */
        return Promise.resolve(GatewayMock.tokenize(o.card)).then(function (pm) {
          return { intent: intent, pm: pm };
        });
      })
      .then(function (ctx) {
        return LX.Api.gateway.confirm(ctx.intent.id, ctx.pm).then(function (res) {
          return { intent: ctx.intent, pm: ctx.pm, result: res };
        });
      })
      .then(function (ctx) {
        var payment = {
          brand: ctx.pm.brand,
          last4: ctx.pm.last4,
          intentId: ctx.intent.id,
          expMonth: ctx.pm.expMonth,
          expYear: ctx.pm.expYear,
          paidAt: ctx.result.paidAt
        };
        var updated = LX.Order.markPaid(order.orderNumber, payment);

        /* Saved cards: token + brand + last4 only */
        if (o.saveCard) {
          LX.Auth.saveCard({
            token: ctx.pm.token,
            brand: ctx.pm.brand,
            last4: ctx.pm.last4,
            expMonth: ctx.pm.expMonth,
            expYear: ctx.pm.expYear
          }, o.cardNickname);
        }

        return {
          ok: true,
          order: updated,
          payment: payment,
          intentId: ctx.intent.id
        };
      });
  }

  /* ── Cash on delivery ────────────────────────────────── */
  function processCOD(order) {
    return LX.sleep(320).then(function () {
      var updated = LX.Order.updateStatus(order.orderNumber, 'confirmed', 'Cash on delivery order confirmed.');
      updated = LX.Order.byNumber(order.orderNumber);
      return { ok: true, order: updated, payment: { brand: 'COD', last4: '—', intentId: null } };
    });
  }

  /* ── Refund (dev panel) ──────────────────────────────── */
  function refund(orderNumber) {
    var order = LX.Order.byNumber(orderNumber);
    if (!order) return Promise.resolve({ ok: false, message: 'Order not found.' });
    return LX.Api.gateway.refund(order.payment && order.payment.intentId).then(function (res) {
      LX.Order.updateStatus(orderNumber, 'cancelled', 'Payment refunded.');
      return { ok: true, refund: res };
    });
  }

  /* ── Brand display helpers ───────────────────────────── */
  var BRAND_LABELS = {
    visa: 'Visa', mastercard: 'Mastercard', amex: 'American Express',
    discover: 'Discover', jcb: 'JCB', diners: 'Diners Club', unionpay: 'UnionPay'
  };

  LX.GatewayMock = GatewayMock;
  LX.Payment = {
    processCard: processCard,
    processCOD: processCOD,
    refund: refund,
    runStages: runStages,
    STAGES: STAGES,
    brandLabel: function (b) { return BRAND_LABELS[b] || (b ? LX.titleCase(b) : 'Card'); }
  };
})(window);