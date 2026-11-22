/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/product.js
   ★ Shared product card renderer ★ + product detail page
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  /* ═══ Shared card renderer (used by home/shop/cart/wishlist) ═══ */
  function starsHTML(rating) {
    var full = Math.round(rating);
    var out = '';
    for (var i = 0; i < 5; i++) out += i < full ? '★' : '☆';
    return '<span class="stars" aria-hidden="true">' + out + '</span>';
  }

  function discountPct(p) {
    if (!p.compareAtPrice || p.compareAtPrice <= p.price) return 0;
    return Math.round(((p.compareAtPrice - p.price) / p.compareAtPrice) * 100);
  }

  function badgeHTML(p) {
    var out = '';
    if (p.badge) {
      var cls = p.badge === 'LUXURY' ? 'badge-rose' : (p.badge === 'NEW' ? 'badge-ok' : 'badge-gold');
      out += '<span class="badge ' + cls + '">' + LX.esc(p.badge) + '</span>';
    }
    var off = discountPct(p);
    if (off >= 25) out += '<span class="badge badge-err">−' + off + '%</span>';
    return out;
  }

  function renderCard(p, opts) {
    opts = opts || {};
    var wished = LX.UI.isWished(p.id);
    var off = discountPct(p);

    return '' +
      '<article class="pcard" data-product="' + LX.esc(p.id) + '">' +
      '<div class="pcard-media">' +
      '<a href="#/product/' + LX.esc(p.slug) + '" aria-label="' + LX.esc(p.name) + '">' +
      '<img class="main" src="' + LX.esc(p.images[0]) + '" alt="' + LX.esc(p.name) + '" loading="lazy" ' +
      'onerror="LX.UI.imageFallback(this,\'' + LX.esc(p.name).replace(/'/g, '') + '\')">' +
      (p.images[1] ? '<img class="alt" src="' + LX.esc(p.images[1]) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '') +
      '</a>' +
      '<div class="pcard-tags">' + badgeHTML(p) + '</div>' +
      '<button class="pcard-wish' + (wished ? ' on' : '') + '" data-wish="' + LX.esc(p.id) + '" ' +
      'aria-label="' + (wished ? 'Remove from' : 'Add to') + ' wishlist" aria-pressed="' + wished + '">' +
      '<svg viewBox="0 0 24 24" width="18" height="18"><path d="M12 20.5s-7.5-4.7-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5-7.5 9.7-7.5 9.7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '<div class="pcard-quick">' +
      '<button class="btn btn-dark btn-sm btn-block" data-quick="' + LX.esc(p.id) + '">Quick Add</button>' +
      '</div>' +
      '</div>' +
      '<div class="pcard-body">' +
      '<p class="pcard-cat">' + LX.esc(p.isCombo ? 'Combo' : LX.titleCase(p.gender)) + ' · ' + LX.esc(LX.titleCase(p.category)) + '</p>' +
      '<a class="pcard-name" href="#/product/' + LX.esc(p.slug) + '">' + LX.esc(p.name) + '</a>' +
      '<div class="pcard-rating">' + starsHTML(p.rating) + '<span>' + p.rating.toFixed(1) + '</span><span class="muted">(' + p.reviewCount + ')</span></div>' +
      '<div class="pcard-price">' +
      '<span class="now">' + LX.money(p.price) + '</span>' +
      (p.compareAtPrice ? '<span class="was">' + LX.money(p.compareAtPrice) + '</span>' : '') +
      (off ? '<span class="off">−' + off + '%</span>' : '') +
      '</div>' +
      '</div>' +
      '</article>';
  }

  /* Shared click wiring for grids */
  function wireCards(root) {
    $$('[data-wish]', root).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        var id = btn.getAttribute('data-wish');
        var on = LX.UI.toggleWish(id);
        btn.classList.toggle('on', on);
        btn.setAttribute('aria-pressed', String(on));
        btn.setAttribute('aria-label', (on ? 'Remove from' : 'Add to') + ' wishlist');
      });
    });

    $$('[data-quick]', root).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault(); e.stopPropagation();
        openQuickAdd(btn.getAttribute('data-quick'));
      });
    });
  }

  /* ── Quick add modal ─────────────────────────────────── */
  function openQuickAdd(productId) {
    var p = LX.Catalog.byId(productId);
    if (!p) return;

    var size = p.sizes[Math.min(1, p.sizes.length - 1)];
    var color = p.colors[0].name;

    var bodyHTML =
      '<div class="qa-grid">' +
      '<div class="qa-media"><img src="' + LX.esc(p.images[0]) + '" alt="' + LX.esc(p.name) + '" onerror="LX.UI.imageFallback(this,\'' + LX.esc(p.name).replace(/'/g, '') + '\')"></div>' +
      '<div>' +
      '<p class="label">' + LX.esc(LX.titleCase(p.category)) + '</p>' +
      '<h4 class="h-serif" style="font-size:1.28rem;margin:.25rem 0 .5rem">' + LX.esc(p.name) + '</h4>' +
      '<p class="price-lg">' + LX.money(p.price) + '</p>' +
      '<div class="field" style="margin-top:1.15rem">' +
      '<span class="field-label">Size</span>' +
      '<div class="size-chips" id="qaSizes">' +
      p.sizes.map(function (s) {
        var stock = LX.Catalog.stockOf(p.id, s, color);
        var out = stock <= 0;
        return '<button type="button" class="chip size-chip' + (s === size ? ' active' : '') + '" data-size="' + LX.esc(s) + '"' + (out ? ' disabled title="Sold out"' : '') + '>' + LX.esc(s) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +
      '<div class="field">' +
      '<span class="field-label">Colour</span>' +
      '<div class="color-chips" id="qaColors">' +
      p.colors.map(function (c) {
        return '<button type="button" class="chip color-chip' + (c.name === color ? ' active' : '') + '" data-color="' + LX.esc(c.name) + '">' +
          '<i class="swatch" style="background:' + LX.esc(c.hex) + '"></i>' + LX.esc(c.name) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +
      '</div>' +
      '</div>';

    LX.UI.openModal({
      title: 'Quick Add',
      wide: true,
      body: bodyHTML,
      actions: [
        { label: 'Cancel', variant: 'btn-ghost', onClick: function (c) { c(); } },
        {
          label: 'Add to Bag', variant: 'btn-gold',
          onClick: function (close) {
            var res = LX.Cart.add(p.id, size, color, 1);
            if (!res.ok) { LX.UI.toast({ type: 'warn', message: res.message }); return; }
            close();
            LX.UI.toast({ type: 'success', title: 'Added to bag', message: p.name + ' · ' + size + ' / ' + color });
            LX.UI.updateBadges();
            LX.UI.openCart();
          }
        }
      ],
      onMount: function (body) {
        $$('[data-size]', body).forEach(function (btn) {
          btn.addEventListener('click', function () {
            if (btn.disabled) return;
            size = btn.getAttribute('data-size');
            $$('[data-size]', body).forEach(function (b) { b.classList.toggle('active', b === btn); });
            refreshStock();
          });
        });
        $$('[data-color]', body).forEach(function (btn) {
          btn.addEventListener('click', function () {
            color = btn.getAttribute('data-color');
            $$('[data-color]', body).forEach(function (b) { b.classList.toggle('active', b === btn); });
            refreshStock();
          });
        });

        function refreshStock() {
          $$('[data-size]', body).forEach(function (b) {
            var s = b.getAttribute('data-size');
            var stock = LX.Catalog.stockOf(p.id, s, color);
            b.disabled = stock <= 0;
            if (stock <= 0 && s === size) {
              var firstAvail = p.sizes.filter(function (x) { return LX.Catalog.stockOf(p.id, x, color) > 0; })[0];
              if (firstAvail) {
                size = firstAvail;
                $$('[data-size]', body).forEach(function (x) { x.classList.toggle('active', x.getAttribute('data-size') === size); });
              }
            }
          });
        }
      }
    });
  }

  /* ═══ PRODUCT DETAIL ═══════════════════════════════════ */
  function renderDetail(params) {
    var p = LX.Catalog.bySlug(params.slug);
    if (!p) {
      return '<div class="container"><div class="empty">' +
        '<div class="empty-icon">?</div>' +
        '<h3>Product not found</h3>' +
        '<p>That product may have been removed.</p>' +
        '<a class="btn btn-gold" href="#/shop">Back to shop</a>' +
        '</div></div>';
    }

    var color = p.colors[0].name;
    var size = null;
    var reviews = LX.Catalog.reviewsFor(p.id);

    return '' +
      '<div class="container breadcrumb">' +
      '<a href="#/">Home</a><i>/</i><a href="#/shop?gender=' + LX.esc(p.gender) + '">' + LX.esc(LX.titleCase(p.gender)) + '</a>' +
      '<i>/</i><span class="muted">' + LX.esc(p.name) + '</span>' +
      '</div>' +

      '<section class="container pdp">' +

      /* Gallery */
      '<div class="pdp-gallery">' +
      '<div class="pdp-main" id="pdpMain">' +
      '<img src="' + LX.esc(p.images[0]) + '" alt="' + LX.esc(p.name) + '" id="pdpImg" onerror="LX.UI.imageFallback(this,\'' + LX.esc(p.name).replace(/'/g, '') + '\')">' +
      '<button class="pdp-zoom" id="pdpZoom" aria-label="Zoom image">' +
      '<svg viewBox="0 0 24 24" width="18" height="18"><circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.6" fill="none"/><path d="m16 16 4.5 4.5M11 8.4v5.2M8.4 11h5.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>' +
      '</button>' +
      '</div>' +
      '<div class="pdp-thumbs" id="pdpThumbs">' +
      p.images.map(function (src, i) {
        return '<button class="pdp-thumb' + (i === 0 ? ' active' : '') + '" data-img="' + LX.esc(src) + '">' +
          '<img src="' + LX.esc(src) + '" alt="" loading="lazy" onerror="LX.UI.imageFallback(this,\'LX\')"></button>';
      }).join('') +
      '</div>' +
      '</div>' +

      /* Info */
      '<div class="pdp-info">' +
      '<div class="row wrap" style="gap:.5rem">' + badgeHTML(p) + '</div>' +
      '<h1 class="h-serif pdp-title">' + LX.esc(p.name) + '</h1>' +
      '<div class="row" style="gap:.65rem">' + starsHTML(p.rating) +
      '<span class="muted small">' + p.rating.toFixed(1) + ' · ' + p.reviewCount + ' reviews</span></div>' +

      '<div class="pdp-price">' +
      '<span class="price-lg">' + LX.money(p.price) + '</span>' +
      (p.compareAtPrice ? '<span class="muted"><s>' + LX.money(p.compareAtPrice) + '</s></span>' : '') +
      (discountPct(p) ? '<span class="badge badge-gold">Save ' + discountPct(p) + '%</span>' : '') +
      '</div>' +

      '<p class="muted pdp-desc">' + LX.esc(p.description) + '</p>' +

      /* Colour */
      '<div class="field">' +
      '<div class="row-between"><span class="field-label">Colour</span><span class="muted small" id="pdpColorName">' + LX.esc(color) + '</span></div>' +
      '<div class="color-chips" id="pdpColors">' +
      p.colors.map(function (c) {
        return '<button type="button" class="chip color-chip' + (c.name === color ? ' active' : '') + '" data-color="' + LX.esc(c.name) + '">' +
          '<i class="swatch" style="background:' + LX.esc(c.hex) + '"></i>' + LX.esc(c.name) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +

      /* Size */
      '<div class="field">' +
      '<div class="row-between">' +
      '<span class="field-label">Size</span>' +
      '<button class="btn-link" id="pdpSizeGuide">Size guide</button>' +
      '</div>' +
      '<div class="size-chips" id="pdpSizes">' +
      p.sizes.map(function (s) {
        var stock = LX.Catalog.stockOf(p.id, s, color);
        return '<button type="button" class="chip size-chip' + (s === size ? ' active' : '') + '" data-size="' + LX.esc(s) + '"' +
          (stock <= 0 ? ' disabled title="Sold out"' : '') + '>' + LX.esc(s) +
          (stock <= 0 ? '<span class="sold-x">✕</span>' : '') + '</button>';
      }).join('') +
      '</div>' +
      '<div class="field-msg hint" id="pdpSizeMsg">Select a size to continue.</div>' +
      '</div>' +

      /* Qty + actions */
      '<div class="pdp-actions">' +
      '<div class="qty-picker">' +
      '<button class="qty-btn" id="pdpQtyMinus" aria-label="Decrease">−</button>' +
      '<span class="qty-val" id="pdpQty">1</span>' +
      '<button class="qty-btn" id="pdpQtyPlus" aria-label="Increase">+</button>' +
      '</div>' +
      '<button class="btn btn-gold grow" id="pdpAdd">Add to Bag</button>' +
      '<button class="icon-btn pdp-wish" id="pdpWish" aria-label="Add to wishlist">' +
      '<svg viewBox="0 0 24 24" width="21" height="21"><path d="M12 20.5s-7.5-4.7-7.5-9.7A4.3 4.3 0 0 1 12 8.2a4.3 4.3 0 0 1 7.5 2.6c0 5-7.5 9.7-7.5 9.7z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linejoin="round"/></svg>' +
      '</button>' +
      '</div>' +

      /* Trust strip */
      '<div class="pdp-trust">' +
      '<div><b>Discreet packaging</b><span class="muted tiny">No branding on the box</span></div>' +
      '<div><b>Cash on delivery</b><span class="muted tiny">Available islandwide</span></div>' +
      '<div><b>7-day exchange</b><span class="muted tiny">Easy size swaps</span></div>' +
      '</div>' +

      /* Accordion */
      '<div class="accordion" id="pdpAccordion">' +
      '<details open>' +
      '<summary>Description</summary>' +
      '<div class="acc-body"><p class="muted">' + LX.esc(p.longDescription) + '</p>' +
      '<p class="muted tiny">' + LX.esc(p.modelNote) + '</p></div>' +
      '</details>' +
      '<details>' +
      '<summary>Fabric &amp; Care</summary>' +
      '<div class="acc-body">' +
      '<p class="muted"><b>' + LX.esc(p.fabric) + '</b> — ' + LX.esc(p.fabricDetail) + '</p>' +
      '<ul class="care-list muted small">' + p.care.map(function (c) { return '<li>' + LX.esc(c) + '</li>'; }).join('') + '</ul>' +
      '</div>' +
      '</details>' +
      '<details>' +
      '<summary>Delivery &amp; Returns</summary>' +
      '<div class="acc-body">' +
      '<div class="kv"><span class="k">Zone 1 — Colombo, Gampaha</span><span class="v">Rs. 300 · 1–3 days</span></div>' +
      '<div class="kv"><span class="k">Zone 2 — Kalutara, Galle, Matara</span><span class="v">Rs. 400 · 2–4 days</span></div>' +
      '<div class="kv"><span class="k">Zone 3 — Kurunegala</span><span class="v">Rs. 400 · 2–5 days</span></div>' +
      '<div class="kv"><span class="k">Free standard delivery</span><span class="v">Orders over Rs. 5,000</span></div>' +
      '<p class="muted tiny" style="margin-top:.75rem">Exchanges accepted within 7 days on unworn items in original packaging.</p>' +
      '</div>' +
      '</details>' +
      '</div>' +
      '</div>' +
      '</section>' +

      /* Reviews */
      '<section class="container section">' +
      '<div class="section-head"><div>' +
      '<p class="label label-gold">Verified reviews</p>' +
      '<h2 class="h-serif">What customers say</h2>' +
      '</div></div>' +
      '<div class="review-summary panel">' +
      '<div class="review-score">' +
      '<div class="price-lg">' + p.rating.toFixed(1) + '</div>' +
      starsHTML(p.rating) +
      '<p class="muted small">' + p.reviewCount + ' reviews</p>' +
      '</div>' +
      '<div class="grow">' +
      [5, 4, 3, 2, 1].map(function (n) {
        var pct = n === 5 ? 72 : (n === 4 ? 21 : (n === 3 ? 5 : (n === 2 ? 1 : 1)));
        return '<div class="rev-bar"><span class="tiny muted">' + n + '★</span>' +
          '<div class="meter"><i style="width:' + pct + '%"></i></div>' +
          '<span class="tiny muted">' + pct + '%</span></div>';
      }).join('') +
      '</div>' +
      '</div>' +
      '<div class="review-grid">' +
      reviews.map(function (r) {
        return '<div class="panel review-card">' +
          '<div class="row-between">' + starsHTML(r.rating) +
          (r.verified ? '<span class="badge badge-ok">Verified</span>' : '') + '</div>' +
          '<p class="review-title">' + LX.esc(r.title) + '</p>' +
          '<p class="muted small">' + LX.esc(r.body) + '</p>' +
          '<p class="muted tiny">' + LX.esc(r.author) + ' · ' + LX.fmtDate(r.createdAt) + '</p>' +
          '</div>';
      }).join('') +
      '</div>' +
      '</section>' +

      /* Related */
      '<section class="container section">' +
      '<div class="section-head"><div>' +
      '<p class="label label-gold">You may also like</p>' +
      '<h2 class="h-serif">Complete the look</h2>' +
      '</div></div>' +
      '<div class="pgrid">' + LX.Catalog.related(p, 4).map(renderCard).join('') + '</div>' +
      '</section>';
  }

  function mountDetail(root, params) {
    var p = LX.Catalog.bySlug(params.slug);
    if (!p) return;

    var color = p.colors[0].name;
    var size = null;
    var qty = 1;

    wireCards(root);

    /* thumbs */
    var img = $('#pdpImg', root);
    $$('.pdp-thumb', root).forEach(function (t) {
      t.addEventListener('click', function () {
        var src = t.getAttribute('data-img');
        if (img) { img.style.opacity = '0'; setTimeout(function () { img.src = src; img.style.opacity = '1'; }, 130); }
        $$('.pdp-thumb', root).forEach(function (x) { x.classList.toggle('active', x === t); });
      });
    });

    /* zoom */
    var zoomBtn = $('#pdpZoom', root);
    if (zoomBtn) zoomBtn.addEventListener('click', function () {
      var main = $('#pdpMain', root);
      if (main) main.classList.toggle('zoomed');
    });

    /* colour */
    $$('#pdpColors [data-color]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        color = btn.getAttribute('data-color');
        $$('#pdpColors [data-color]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        var label = $('#pdpColorName', root);
        if (label) label.textContent = color;
        refreshSizes();
      });
    });

    /* size */
    $$('#pdpSizes [data-size]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        size = btn.getAttribute('data-size');
        $$('#pdpSizes [data-size]', root).forEach(function (b) { b.classList.toggle('active', b === btn); });
        var msg = $('#pdpSizeMsg', root);
        if (msg) {
          var stock = LX.Catalog.stockOf(p.id, size, color);
          msg.textContent = stock <= 8 ? 'Only ' + stock + ' left in this size.' : 'In stock — ready to ship.';
          msg.className = 'field-msg ' + (stock <= 8 ? 'warn' : 'success');
        }
      });
    });

    function refreshSizes() {
      $$('#pdpSizes [data-size]', root).forEach(function (b) {
        var s = b.getAttribute('data-size');
        var stock = LX.Catalog.stockOf(p.id, s, color);
        b.disabled = stock <= 0;
        if (stock <= 0 && s === size) { size = null; b.classList.remove('active'); }
      });
    }

    /* qty */
    var qtyEl = $('#pdpQty', root);
    var minus = $('#pdpQtyMinus', root), plus = $('#pdpQtyPlus', root);
    if (minus) minus.addEventListener('click', function () {
      qty = Math.max(1, qty - 1); if (qtyEl) qtyEl.textContent = String(qty);
    });
    if (plus) plus.addEventListener('click', function () {
      qty = Math.min(20, qty + 1); if (qtyEl) qtyEl.textContent = String(qty);
    });

    /* add */
    var addBtn = $('#pdpAdd', root);
    if (addBtn) addBtn.addEventListener('click', function () {
      if (!size) {
        var msg = $('#pdpSizeMsg', root);
        if (msg) { msg.textContent = 'Please select a size.'; msg.className = 'field-msg error'; }
        var chips = $('#pdpSizes', root);
        if (chips) {
          chips.classList.add('shake');
          setTimeout(function () { chips.classList.remove('shake'); }, 220);
        }
        LX.UI.toast({ type: 'warn', message: 'Please select a size first.' });
        return;
      }
      var res = LX.Cart.add(p.id, size, color, qty);
      if (!res.ok) { LX.UI.toast({ type: 'error', message: res.message }); return; }
      LX.UI.toast({ type: 'success', title: 'Added to bag', message: p.name + ' · ' + size + ' / ' + color + ' × ' + qty });
      LX.UI.updateBadges();
      LX.UI.openCart();
    });

    /* wishlist */
    var wishBtn = $('#pdpWish', root);
    if (wishBtn) {
      wishBtn.classList.toggle('on', LX.UI.isWished(p.id));
      wishBtn.addEventListener('click', function () {
        var on = LX.UI.toggleWish(p.id);
        wishBtn.classList.toggle('on', on);
      });
    }

    /* size guide */
    var sg = $('#pdpSizeGuide', root);
    if (sg) sg.addEventListener('click', function () {
      LX.UI.openModal({
        title: LX.Catalog.sizeCharts[p.sizeChart].title,
        body: LX.sizeChartHTML(p.sizeChart),
        actions: [{ label: 'Close', variant: 'btn-gold', onClick: function (c) { c(); } }]
      });
    });
  }

  LX.ProductCard = {
    render: renderCard,
    wire: wireCards,
    stars: starsHTML,
    discountPct: discountPct,
    quickAdd: openQuickAdd
  };

  LX.Pages.product = {
    title: function (params) {
      var p = LX.Catalog.bySlug(params.slug);
      return p ? p.name : 'Product';
    },
    render: renderDetail,
    mount: mountDetail
  };
})(window);