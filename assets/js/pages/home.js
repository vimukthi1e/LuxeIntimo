/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/home.js  (+ About)
   (blueprint §5.5 UX patterns · 1.html layout base)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  function heroProduct() { return LX.Catalog.byId('p001') || LX.Catalog.all()[0]; }

  function cardHTML(p) { return LX.ProductCard.render(p); }

  function gridHTML(list) {
    return '<div class="pgrid">' + list.map(cardHTML).join('') + '</div>';
  }

  /* ═══ HOME ═════════════════════════════════════════════ */
  function renderHome() {
    var hp = heroProduct();
    var featured = LX.Catalog.featured(4);
    var best = LX.Catalog.bestSellers(4);
    var fresh = LX.Catalog.newArrivals(4);
    var combos = LX.Catalog.all().filter(function (p) { return p.isCombo; }).slice(0, 4);

    return '' +
      /* ── HERO ── */
      '<section class="hero">' +
      '<div class="container hero-grid">' +
      '<div class="hero-copy">' +
      '<p class="label label-gold">New Collection · 2026</p>' +
      '<h1 class="hero-title">Comfort<br>Meets <em class="gold-text">Luxury.</em></h1>' +
      '<p class="hero-lede">Premium innerwear crafted for Sri Lanka. Breathable, seamless, and designed to feel like nothing — but look like everything. For Him &amp; For Her.</p>' +
      '<div class="hero-actions">' +
      '<a class="btn btn-dark" href="#/shop?gender=women">Shop Women →</a>' +
      '<a class="btn btn-ghost" href="#/shop?gender=men">Shop Men</a>' +
      '</div>' +
      '<div class="hero-stats">' +
      '<div><b class="h-serif">4.9★</b><span class="muted small">2,400+ Reviews</span></div>' +
      '<div><b class="h-serif">10k+</b><span class="muted small">Happy Customers</span></div>' +
      '<div><b class="h-serif">100%</b><span class="muted small">Cotton &amp; Modal</span></div>' +
      '</div>' +
      '</div>' +

      '<div class="hero-media">' +
      '<div class="hero-frame">' +
      '<img class="kenburns" src="' + LX.esc(hp.images[0]) + '" alt="LUXE INTIMO premium innerwear" ' +
      'onerror="LX.UI.imageFallback(this,\'' + LX.esc(hp.name).replace(/'/g, '') + '\')">' +
      '</div>' +
      '<div class="hero-card glass-card">' +
      '<div>' +
      '<p class="label">Best Seller</p>' +
      '<p class="hero-card-name h-serif">' + LX.esc(hp.name) + '</p>' +
      '<p class="hero-card-price">' + LX.money(hp.price) +
      (hp.compareAtPrice ? ' <span class="muted small"><s>' + LX.money(hp.compareAtPrice) + '</s></span>' : '') +
      '</p>' +
      '</div>' +
      '<a class="btn btn-gold btn-sm" href="#/product/' + LX.esc(hp.slug) + '">View</a>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</section>' +

      /* ── CATEGORY TILES ── */
      '<section class="container section">' +
      '<div class="cat-grid">' +
      '<a class="cat-tile" href="#/shop?gender=women">' +
      '<img src="' + LX.esc(LX.Catalog.byId('p005') ? LX.Catalog.byId('p005').images[0] : '') + '" alt="Women" loading="lazy" onerror="LX.UI.imageFallback(this,\'Women\')">' +
      '<div class="cat-overlay"><p class="h-serif">Women</p><p class="tiny">Bra · Panty · Sets →</p></div>' +
      '</a>' +
      '<a class="cat-tile" href="#/shop?gender=men">' +
      '<img src="' + LX.esc(LX.Catalog.byId('p013') ? LX.Catalog.byId('p013').images[0] : '') + '" alt="Men" loading="lazy" onerror="LX.UI.imageFallback(this,\'Men\')">' +
      '<div class="cat-overlay"><p class="h-serif">Men</p><p class="tiny">Brief · Boxer · Trunk →</p></div>' +
      '</a>' +
      '<a class="cat-tile cat-tile-dark" href="#/shop?category=combo">' +
      '<div class="cat-inner">' +
      '<p class="label label-gold">Premium</p>' +
      '<p class="h-serif">Buy 3 Get 1 FREE</p>' +
      '<p class="muted small">On all combo packs. No code needed.</p>' +
      '</div>' +
      '</a>' +
      '<div class="cat-tile cat-tile-sand">' +
      '<div class="cat-inner">' +
      '<p class="label">Discreet Delivery</p>' +
      '<p class="h-serif">100% Private Packaging</p>' +
      '<p class="muted small">No brand name on the box. No one knows.</p>' +
      '</div>' +
      '</div>' +
      '</div>' +
      '</section>' +

      /* ── FEATURED ── */
      '<section class="container section">' +
      '<div class="section-head">' +
      '<div>' +
      '<p class="label label-gold">Curated</p>' +
      '<h2 class="h-serif">Shop The Collection</h2>' +
      '<p class="muted small">Premium fabrics · Perfect fit · Discreet delivery</p>' +
      '</div>' +
      '<a class="btn btn-ghost btn-sm" href="#/shop">View all</a>' +
      '</div>' +
      gridHTML(featured) +
      '</section>' +

      /* ── BANNER ── */
      '<section class="container section">' +
      '<div class="promo-band">' +
      '<div>' +
      '<p class="label label-gold">Limited</p>' +
      '<h2 class="h-serif">Free islandwide delivery over Rs. 5,000</h2>' +
      '<p class="muted">Plus cash on delivery, 7-day size exchange and completely discreet packaging on every order.</p>' +
      '</div>' +
      '<a class="btn btn-gold" href="#/shop?sort=best">Shop Best Sellers</a>' +
      '</div>' +
      '</section>' +

      /* ── BEST SELLERS ── */
      '<section class="container section">' +
      '<div class="section-head">' +
      '<div>' +
      '<p class="label label-gold">Most Loved</p>' +
      '<h2 class="h-serif">Best Sellers</h2>' +
      '</div>' +
      '<a class="btn btn-ghost btn-sm" href="#/shop?sort=best">See all</a>' +
      '</div>' +
      gridHTML(best) +
      '</section>' +

      /* ── TRUST (1.html “Why LUXE INTIMO”) ── */
      '<section class="container section">' +
      '<div class="trust-band">' +
      '<div class="trust-col">' +
      '<p class="h-serif">Why LUXE INTIMO?</p>' +
      '<p class="muted">We import premium Modal &amp; Egyptian Cotton. No cheap lace, no itching. Designed in Colombo, loved all over Sri Lanka.</p>' +
      '</div>' +
      '<div class="trust-col trust-list">' +
      '<p>✓ Seamless — no visible lines</p>' +
      '<p>✓ Breathable — perfect for the SL climate</p>' +
      '<p>✓ Sizes XS to 3XL — real sizes</p>' +
      '</div>' +
      '<div class="trust-col trust-list">' +
      '<p>✓ Cash on delivery available</p>' +
      '<p>✓ Easy 7-day size exchange</p>' +
      '<p>✓ WhatsApp support, 7 days a week</p>' +
      '</div>' +
      '</div>' +
      '</section>' +

      /* ── NEW ARRIVALS ── */
      '<section class="container section">' +
      '<div class="section-head">' +
      '<div>' +
      '<p class="label label-gold">Just Landed</p>' +
      '<h2 class="h-serif">New Arrivals</h2>' +
      '</div>' +
      '<a class="btn btn-ghost btn-sm" href="#/shop?new=1">See all</a>' +
      '</div>' +
      gridHTML(fresh) +
      '</section>' +

      /* ── COMBOS ── */
      '<section class="container section">' +
      '<div class="section-head">' +
      '<div>' +
      '<p class="label label-gold">Bundle &amp; Save</p>' +
      '<h2 class="h-serif">Combo Packs</h2>' +
      '<p class="muted small">Buy 3 Get 1 Free applies automatically at checkout.</p>' +
      '</div>' +
      '<a class="btn btn-ghost btn-sm" href="#/shop?category=combo">See all</a>' +
      '</div>' +
      gridHTML(combos) +
      '</section>' +

      /* ── CLOSING CTA ── */
      '<section class="container section">' +
      '<div class="cta-band">' +
      '<p class="label label-gold">Ready?</p>' +
      '<h2 class="h-serif">Experience everyday luxury.</h2>' +
      '<p class="muted">Join over 10,000 Sri Lankans who upgraded what they wear underneath.</p>' +
      '<a class="btn btn-gold btn-lg" href="#/shop">Shop the Collection</a>' +
      '</div>' +
      '</section>';
  }

  function mountHome() {
    LX.UI.observeReveals();
  }

  /* ═══ ABOUT ════════════════════════════════════════════ */
  function renderAbout() {
    return '' +
      '<section class="container page-head">' +
      '<p class="label label-gold">Our Story</p>' +
      '<h1 class="h-serif">About LUXE INTIMO</h1>' +
      '<p class="muted lede">Designed in Colombo. Made for how Sri Lanka actually lives — heat, humidity and everything in between.</p>' +
      '</section>' +

      '<section class="container section">' +
      '<div class="about-grid">' +
      '<div class="panel">' +
      '<h3 class="h-serif">The Fabric</h3>' +
      '<p class="muted">We import OEKO-TEX® certified Modal and long-staple Egyptian cotton. No cheap lace, no scratchy seams, no fading after three washes.</p>' +
      '</div>' +
      '<div class="panel">' +
      '<h3 class="h-serif">The Fit</h3>' +
      '<p class="muted">Sizes XS to 3XL — real sizes, graded properly. Every style is tested on real Sri Lankan bodies before it goes live.</p>' +
      '</div>' +
      '<div class="panel">' +
      '<h3 class="h-serif">The Promise</h3>' +
      '<p class="muted">Completely discreet packaging, cash on delivery, and a 7-day size exchange. No questions asked.</p>' +
      '</div>' +
      '</div>' +
      '</section>' +

      '<section class="container section">' +
      '<h2 class="h-serif center">Size Guide</h2>' +
      '<div class="sizeguide-wrap">' +
      sizeChartHTML('women') +
      sizeChartHTML('men') +
      '</div>' +
      '</section>' +

      '<section class="container section">' +
      '<div class="panel panel-elevated">' +
      '<h3 class="h-serif">Delivery &amp; Returns</h3>' +
      '<div class="kv"><span class="k">Zone 1 — Colombo, Gampaha</span><span class="v">Rs. 300 · 1–3 days</span></div>' +
      '<div class="kv"><span class="k">Zone 2 — Kalutara, Galle, Matara</span><span class="v">Rs. 400 · 2–4 days</span></div>' +
      '<div class="kv"><span class="k">Zone 3 — Kurunegala</span><span class="v">Rs. 400 · 2–5 days</span></div>' +
      '<div class="kv"><span class="k">Free standard delivery</span><span class="v">Orders over Rs. 5,000</span></div>' +
      '<div class="kv"><span class="k">Cash on delivery handling</span><span class="v">+ Rs. 100</span></div>' +
      '<div class="divider-soft"></div>' +
      '<p class="muted small">Weekends and public holidays are skipped when calculating delivery estimates. Items can be exchanged within 7 days of delivery if unworn and in original packaging.</p>' +
      '</div>' +
      '</section>' +

      '<section class="container section">' +
      '<div class="panel">' +
      '<h3 class="h-serif">Privacy &amp; Terms</h3>' +
      '<p class="muted small">This is a demonstration storefront. All account, order and payment data is stored locally in your own browser and is never sent to any server. Card numbers and security codes are never stored — only the card brand and last four digits, and only if you choose to save the card.</p>' +
      '</div>' +
      '</section>';
  }

  function sizeChartHTML(kind) {
    var c = LX.Catalog.sizeCharts[kind];
    return '<div class="panel">' +
      '<h4 class="h-serif" style="font-size:1.15rem">' + LX.esc(c.title) + '</h4>' +
      '<div class="size-table">' +
      '<div class="size-row size-head">' + c.columns.map(function (h) { return '<span>' + LX.esc(h) + '</span>'; }).join('') + '</div>' +
      c.rows.map(function (r) {
        return '<div class="size-row">' + r.map(function (v) { return '<span>' + LX.esc(v) + '</span>'; }).join('') + '</div>';
      }).join('') +
      '</div>' +
      '<p class="muted tiny" style="margin-top:.8rem">' + LX.esc(c.note) + '</p>' +
      '</div>';
  }

  LX.Pages.home = { title: 'Premium Innerwear', render: renderHome, mount: mountHome };
  LX.Pages.about = { title: 'About Us', render: renderAbout, mount: function () { LX.UI.observeReveals(); } };
  LX.sizeChartHTML = sizeChartHTML;
})(window);