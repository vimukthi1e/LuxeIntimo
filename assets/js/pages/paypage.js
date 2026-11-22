/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/paypage.js
   ★ Stripe Checkout look ★  (blueprint §11.4, §11.5, §11.6)
   Left: order summary · Right: card form + captcha + Pay
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  var form = null;
  var captcha = null;

  function renderPay() {
    var pending = LX.DB.get('pending_order');
    if (!pending) {
      return '<div class="container"><div class="empty"><div class="empty-icon">!</div>' +
        '<h3>No order to pay</h3><p>Your session may have expired.</p>' +
        '<a class="btn btn-gold" href="#/cart">Back to bag</a></div></div>';
    }

    var order = LX.Order.byNumber(pending.orderNumber);
    if (!order) {
      return '<div class="container"><div class="empty"><div class="empty-icon">!</div>' +
        '<h3>Order not found</h3><a class="btn btn-gold" href="#/cart">Back to bag</a></div></div>';
    }

    var u = LX.Auth.currentUser();
    var savedCards = (u && u.savedCards) || [];

    return '' +
      '<div class="pay-shell">' +

      /* ── LEFT · summary ── */
      '<aside class="pay-summary">' +
      '<div class="pay-sum-inner">' +
      '<a class="brand pay-brand" href="#/"><span class="brand-a">LUXE</span><span class="brand-b">INTIMO</span></a>' +
      '<a class="pay-back" href="#/checkout">← Back to checkout</a>' +

      '<div class="pay-amount-block">' +
      '<p class="label">Order total</p>' +
      '<div class="pay-amount">' + LX.moneyFull(order.total) + '</div>' +
      '<p class="muted small">Order #' + LX.esc(order.orderNumber) + '</p>' +
      '</div>' +

      '<div class="pay-items">' +
      order.items.map(function (l) {
        return '<div class="pay-item">' +
          '<div class="pay-item-img"><img src="' + LX.esc(l.image) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'LX\')">' +
          '<span class="pay-item-qty">' + l.qty + '</span></div>' +
          '<div class="grow"><div class="small">' + LX.esc(l.name) + '</div>' +
          '<div class="muted tiny">' + LX.esc(l.size) + ' / ' + LX.esc(l.color) + '</div></div>' +
          '<div class="small nowrap">' + LX.money(l.unitPrice * l.qty) + '</div>' +
          '</div>';
      }).join('') +
      '</div>' +

      '<div class="pay-totals">' +
      '<div class="kv"><span class="k">Subtotal</span><span class="v">' + LX.money(order.subtotal) + '</span></div>' +
      (order.comboDiscount ? '<div class="kv"><span class="k">Combo discount</span><span class="v" style="color:var(--ok)">−' + LX.money(order.comboDiscount) + '</span></div>' : '') +
      (order.couponDiscount ? '<div class="kv"><span class="k">Coupon ' + LX.esc(order.couponCode || '') + '</span><span class="v" style="color:var(--ok)">−' + LX.money(order.couponDiscount) + '</span></div>' : '') +
      '<div class="kv"><span class="k">Delivery</span><span class="v">' + (order.deliveryFee === 0 ? 'FREE' : LX.money(order.deliveryFee)) + '</span></div>' +
      (order.codFee ? '<div class="kv"><span class="k">COD handling</span><span class="v">' + LX.money(order.codFee) + '</span></div>' : '') +
      '<div class="kv kv-total"><span class="k">Total due</span><span class="v">' + LX.moneyFull(order.total) + '</span></div>' +
      '</div>' +

      '<div class="inline-note note-info">' +
      '<svg viewBox="0 0 24 24" width="17" height="17" style="flex:none;margin-top:2px"><rect x="4" y="8" width="16" height="12" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 8V6.6a4 4 0 0 1 8 0V8" fill="none" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="14" r="1.6" fill="currentColor"/></svg>' +
      '<span>Discreet packaging — no brand name appears on the box.</span>' +
      '</div>' +
      '</div>' +
      '</aside>' +

      /* ── RIGHT · form ── */
      '<main class="pay-form-wrap">' +
      '<div class="pay-form-inner">' +

      '<div class="pay-mobile-head">' +
      '<a class="brand" href="#/"><span class="brand-a">LUXE</span><span class="brand-b">INTIMO</span></a>' +
      '<button class="btn btn-quiet btn-sm" id="paySummaryToggle">Summary ▾</button>' +
      '</div>' +
      '<div class="pay-mobile-summary" id="payMobileSummary" hidden></div>' +

      '<h1 class="pay-title">Pay with card</h1>' +

      (savedCards.length
        ? '<div class="saved-cards" id="savedCards">' +
        '<p class="field-label">Use a saved card</p>' +
        savedCards.map(function (c, i) {
          return '<label class="radio-row' + (i === 0 ? ' selected' : '') + '" data-saved-card="' + LX.esc(c.token) + '">' +
            '<input type="radio" name="savedCard"' + (i === 0 ? ' checked' : '') + '>' +
            '<span class="dot"></span>' +
            '<span class="grow"><b>' + LX.esc(LX.Payment.brandLabel(c.brand)) + ' •••• ' + LX.esc(c.last4) + '</b>' +
            '<div class="muted tiny">Expires ' + LX.pad(c.expMonth) + '/' + String(c.expYear).slice(-2) + '</div></span>' +
            '</label>';
        }).join('') +
        '<label class="check" style="margin-top:.85rem"><input type="radio" name="savedCard" id="useNewCard">' +
        '<span class="box"></span><span>Use a new card</span></label>' +
        '</div>'
        : '') +

      '<div id="cardFormHost"' + ((savedCards.length) ? ' class="hidden"' : '') + '></div>' +

      (savedCards.length
        ? '<div id="savedCvcWrap" class="hidden">' +
        '<div class="field"><label class="field-label" for="savedCvc">Security code</label>' +
        '<input class="input" id="savedCvc" type="text" inputmode="numeric" maxlength="4" placeholder="CVC">' +
        '<div class="field-msg" id="savedCvcMsg"></div></div>' +
        '</div>'
        : '') +

      /* reCAPTCHA — revealed after the first "Pay" click (blueprint §10.4) */
      '<div class="captcha-wrap" id="captchaWrap" hidden>' +
      '<div class="inline-note note-info captcha-note">' +
      '<span>Quick security check before we process your payment.</span></div>' +
      '<div id="captchaHost"></div></div>' +

      /* Pay button */
      '<button class="btn btn-gold btn-block btn-lg pay-btn" id="payBtn" disabled>' +
      '<span class="pay-btn-label">Pay ' + LX.moneyFull(order.total) + '</span>' +
      '</button>' +

      '<div class="pay-progress" id="payProgress" hidden>' +
      '<div class="pay-stages">' +
      LX.Payment.STAGES.map(function (s, i) {
        return '<div class="pay-stage" data-stage="' + i + '"><i></i><span>' + LX.esc(s.label) + '</span></div>';
      }).join('') +
      '</div>' +
      '</div>' +

      '<div class="pay-success" id="paySuccess" hidden>' +
      '<svg class="check-draw" viewBox="0 0 52 52" width="76" height="76">' +
      '<circle cx="26" cy="26" r="23" fill="none" stroke="var(--ok)" stroke-width="2.4" class="cd-circle"/>' +
      '<path d="M15 26.5l7.4 7.6L37 18.6" fill="none" stroke="var(--ok)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" class="cd-check"/>' +
      '</svg>' +
      '<h3 class="h-serif">Payment successful</h3>' +
      '<p class="muted">Taking you to your order…</p>' +
      '</div>' +

      '<div class="pay-footer-note">' +
      '<svg viewBox="0 0 24 24" width="13" height="13"><rect x="5" y="10.5" width="14" height="10" rx="2.2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.2 10.5V8a3.8 3.8 0 0 1 7.6 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/></svg>' +
      '<span>Powered by <b>stripe</b> (mock) · This is a demo — no real payment is taken</span>' +
      '</div>' +

      '</div>' +
      '</main>' +
      '</div>';
  }

  /* ═══ MOUNT ════════════════════════════════════════════ */
  function mountPay(root) {
    var pending = LX.DB.get('pending_order');
    if (!pending) return;
    var order = LX.Order.byNumber(pending.orderNumber);
    if (!order) return;

    var u = LX.Auth.currentUser();
    var savedCards = (u && u.savedCards) || [];
    var usingSavedToken = savedCards.length ? savedCards[0].token : null;
    var captchaOk = false;
    var submitting = false;

    /* ── Card form ───────────────────────────────────── */
    form = LX.CardForm.mount($('#cardFormHost', root), {
      email: order.contact ? order.contact.email : '',
      canSaveCard: !!u,
      onChange: function (validation) {
        updatePayButton(validation);
      }
    });

    /* ── Dev panel autofill ──────────────────────────── */
    var autofill = LX.DB.get('dev_autofill');
    if (autofill && autofill.card) {
      form.fill(autofill.card);
      LX.DB.remove('dev_autofill');
      LX.UI.toast({ type: 'info', title: 'Test card autofilled', message: autofill.card.label + ' · ' + autofill.card.number });
    }

    /* ── Captcha ─────────────────────────────────────── */
    captcha = LX.Captcha.mount($('#captchaHost', root), {
      onChange: function (verified) {
        captchaOk = verified;
        updatePayButton(form.validate(false));
        /* The user already pressed Pay — continue the moment they pass. */
        if (verified && captchaPending) beginPayment();
      }
    });

    /* ── Saved card toggle ───────────────────────────── */
    var newCardToggle = $('#useNewCard', root);
    if (newCardToggle) {
      newCardToggle.closest('.check').addEventListener('click', function () {
        setTimeout(function () {
          if (newCardToggle.checked) {
            usingSavedToken = null;
            $$('[data-saved-card]', root).forEach(function (r) { r.classList.remove('selected'); });
            $('#cardFormHost', root).classList.remove('hidden');
            $('#savedCvcWrap', root).classList.add('hidden');
            updatePayButton(form.validate(false));
          }
        }, 0);
      });
    }
    $$('[data-saved-card]', root).forEach(function (row) {
      row.addEventListener('click', function () {
        usingSavedToken = row.getAttribute('data-saved-card');
        $$('[data-saved-card]', root).forEach(function (r) { r.classList.toggle('selected', r === row); });
        $('#cardFormHost', root).classList.add('hidden');
        $('#savedCvcWrap', root).classList.remove('hidden');
        updatePayButton(form.validate(false));
      });
    });

    var savedCvc = $('#savedCvc', root);
    if (savedCvc) savedCvc.addEventListener('input', function () {
      savedCvc.value = savedCvc.value.replace(/\D/g, '').slice(0, 4);
      LX.CardForm.clearError(savedCvc, $('#savedCvcMsg', root));
      updatePayButton(form.validate(false));
    });

    /* ── Mobile summary accordion ────────────────────── */
    var toggle = $('#paySummaryToggle', root);
    if (toggle) {
      var mobileSum = $('#payMobileSummary', root);
      var t = LX.Cart.totals();
      mobileSum.innerHTML =
        '<div class="kv"><span class="k">Order total</span><span class="v">' + LX.moneyFull(order.total) + '</span></div>' +
        '<div class="kv"><span class="k">Order</span><span class="v">#' + LX.esc(order.orderNumber) + '</span></div>';
      toggle.addEventListener('click', function () {
        mobileSum.hidden = !mobileSum.hidden;
        toggle.textContent = mobileSum.hidden ? 'Summary ▾' : 'Summary ▴';
      });
    }

    /* ── Pay button gate (blueprint §11.5) ───────────── */
    var payBtn = $('#payBtn', root);

    function updatePayButton(validation) {
      if (!payBtn) return;
      var ok;
      if (usingSavedToken) {
        var need = 3;
        savedCards.forEach(function (c) { if (c.token === usingSavedToken && c.brand === 'amex') need = 4; });
        var cvcVal = savedCvc ? savedCvc.value.replace(/\D/g, '') : '';
        ok = cvcVal.length === need && !submitting;
      } else {
        /* Blueprint §10.4 — "The Pay button stays disabled until the card is
           valid." The reCAPTCHA is not part of this gate: it appears AFTER the
           first Pay click. */
        ok = validation.ok && !submitting;
      }
      payBtn.disabled = !ok;
      payBtn.setAttribute('aria-disabled', String(!ok));
    }

    /* ── Submit ──────────────────────────────────────── */
    /* ── Submit ─────────────────────────────────────
       First click reveals the reCAPTCHA; passing it runs the payment. */
    var captchaPending = false;

    function revealCaptcha() {
      var wrap = $('#captchaWrap', root);
      if (wrap) {
        wrap.hidden = false;
        try { wrap.scrollIntoView({ block: 'center' }); } catch (e) { /* noop */ }
      }
      var box = $('#captchaHost .rc-check', root);
      if (box && box.focus) { try { box.focus(); } catch (e) { /* noop */ } }
    }

    payBtn.addEventListener('click', function () {
      if (payBtn.disabled || submitting) return;
      if (!captchaOk) {
        captchaPending = true;
        revealCaptcha();
        return;
      }
      beginPayment();
    });

    function beginPayment() {
      captchaPending = false;

      var cardPayload = null;
      if (usingSavedToken) {
        var saved = null;
        savedCards.forEach(function (c) { if (c.token === usingSavedToken) saved = c; });
        if (!saved) return;
        var need = saved.brand === 'amex' ? 4 : 3;
        var cvcVal = savedCvc.value.replace(/\D/g, '');
        if (cvcVal.length !== need) {
          LX.CardForm.showError(savedCvc, $('#savedCvcMsg', root),
            saved.brand === 'amex'
              ? 'American Express cards require a 4-digit security code.'
              : 'Your card’s security code is incomplete.');
          return;
        }
        cardPayload = {
          number: '', brand: saved.brand, last4: saved.last4,
          expMonth: saved.expMonth, expYear: saved.expYear, cvc: cvcVal
        };
      } else {
        var v = form.validate(true);
        if (!v.ok) {
          LX.UI.toast({ type: 'error', title: 'Check your card details', message: 'Some fields need attention.' });
          return;
        }
        cardPayload = {
          number: v.values.number,
          brand: v.number.brand,
          expMonth: v.expiry.month,
          expYear: v.expiry.year,
          cvc: v.values.cvc,
          name: v.values.name
        };
      }

      submitting = true;
      payBtn.disabled = true;
      payBtn.innerHTML = '<span class="spinner spinner-light"></span><span> Processing…</span>';

      /* stages UI */
      var progress = $('#payProgress', root);
      if (progress) progress.hidden = false;

      LX.Payment.processCard({
        order: order,
        card: cardPayload,
        saveCard: !usingSavedToken && form.values().saveCard,
        onStage: function (stage, index) {
          $$('.pay-stage', root).forEach(function (node, i) {
            node.classList.toggle('active', i === index);
            node.classList.toggle('done', i < index);
          });
        }
      }).then(function (res) {
        submitting = false;
        LX.DB.remove('pending_order');

        if (progress) progress.hidden = true;
        var success = $('#paySuccess', root);
        if (success) success.hidden = false;
        payBtn.hidden = true;

        LX.UI.toast({ type: 'success', title: 'Payment successful', message: 'Order ' + res.order.orderNumber + ' confirmed.' });

        setTimeout(function () {
          LX.Router.go('#/order/' + res.order.orderNumber);
        }, 1500);
      }).catch(function (err) {
        submitting = false;
        payBtn.disabled = false;
        payBtn.innerHTML = '<span class="pay-btn-label">Pay ' + LX.moneyFull(order.total) + '</span>';
        if (progress) progress.hidden = true;
        LX.UI.toast({
          type: 'error', title: 'Payment failed',
          message: String(err && err.message || err), duration: 7000
        });
      });
    }

    /* teardown */
    return function () {
      if (form && form.destroy) form.destroy();
      if (captcha && captcha.destroy) captcha.destroy();
      form = null;
      captcha = null;
    };
  }

  LX.Pages.pay = { title: 'Payment', render: renderPay, mount: mountPay };
})(window);