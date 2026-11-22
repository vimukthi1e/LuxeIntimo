/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — data/products.js
   28 products (Women 12 · Men 10 · Combos 6) + reviews + coupons
   Money: INTEGER CENTS  (blueprint §7.3)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* ── Unsplash CDN pool (offline → SVG fallback) ──────── */
  function u(id, w) { return 'https://images.unsplash.com/photo-' + id + '?auto=format&fit=crop&w=' + (w || 800) + '&q=80'; }
  var IMG = {
    a: '1582533561751-ef6f6ab93a2e', b: '1596755094514-f87e34085b2c', c: '1624378439575-d8705ad7ae80',
    d: '1571513800374-df1bbe650e56', e: '1594633312681-425c7b97ccd1', f: '1582639510494-c80b5de9f148',
    g: '1583743814966-8936f5b7be1a', h: '1594938298603-c8148c4dae35', i: '1591047139829-d91aecb6caea',
    j: '1516589178581-6cd7833ae3b2', k: '1490481651871-ab68de25d43d', l: '1483985988355-763728e1935b',
    m: '1445205170230-053b83016050', n: '1469334031218-e382a71b716b', o: '1487222477894-8943e31ef7b2',
    p: '1479064555552-3ef4979f8908', q: '1434389677669-e08b4cac3105', r: '1552374196-c4e7ffc6e126',
    s: '1441984904996-e0b6ba687e04', t: '1492707892479-7bc8d5a4ee93', v: '1515886657613-9f3515b0c78f',
    w: '1529139574466-a303027c1d8b', x: '1503342217505-b0a15ec3261c', y: '1496747611176-843222e1e57c',
    z: '1502716119720-b23a93e5fe1b', aa: '1485462537746-965f33f7f6a7', ab: '1509631179647-0177331693ae',
    ac: '1462804993656-fac4ff489837'
  };

  var W_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
  var M_SIZES = ['S', 'M', 'L', 'XL', '2XL', '3XL'];

  var NEUTRALS = [
    { name: 'Nude', hex: '#D8B79B' }, { name: 'Black', hex: '#1B1B1E' },
    { name: 'Ivory', hex: '#EDE6DA' }, { name: 'Rose', hex: '#C48A92' }
  ];
  var MENS = [
    { name: 'Charcoal', hex: '#3C3F45' }, { name: 'Navy', hex: '#232C42' },
    { name: 'White', hex: '#EFEFEF' }, { name: 'Olive', hex: '#4C5240' },
    { name: 'Midnight', hex: '#141A26' }, { name: 'Sand', hex: '#C8B79A' }
  ];

  var CARE = [
    'Machine wash cold on a gentle cycle',
    'Do not bleach',
    'Line dry in shade — do not tumble dry',
    'Do not iron directly on lace or trims',
    'Wash with similar colours'
  ];

  function stockFor(size, i) {
    /* deterministic pseudo-stock so UI states are stable across reloads */
    var h = 0, s = size + i;
    for (var j = 0; j < s.length; j++) h = (h * 31 + s.charCodeAt(j)) % 97;
    return 4 + (h % 22);
  }

  function mk(o, i) {
    var sizes = o.sizes || (o.gender === 'men' ? M_SIZES : W_SIZES);
    var colors = o.colors || (o.gender === 'men' ? MENS : NEUTRALS);
    var variants = [];
    sizes.forEach(function (size) {
      colors.forEach(function (c) {
        variants.push({
          size: size,
          color: c.name,
          hex: c.hex,
          sku: LX.slugify(o.name).slice(0, 14).toUpperCase() + '-' + size + '-' + c.name.slice(0, 2).toUpperCase(),
          stock: stockFor(size + c.name, i)
        });
      });
    });

    return {
      id: 'p' + LX.pad(i + 1, 3),
      slug: LX.slugify(o.name),
      name: o.name,
      gender: o.gender,
      category: o.category,
      price: o.price,
      compareAtPrice: o.compare || null,
      currency: 'LKR',
      description: o.desc,
      longDescription: o.long || (o.desc + ' Designed in Colombo for Sri Lankan weather — breathable, seamless and made to move with you.'),
      fabric: o.fabric || 'Modal Blend',
      fabricDetail: o.fabricDetail || 'OEKO-TEX® certified modal-cotton blend. Soft hand-feel, breathable, colour-fast.',
      care: CARE,
      images: (o.imgs || [IMG.a, IMG.b]).map(function (k) { return u(k, 900); }),
      variants: variants,
      sizes: sizes,
      colors: colors,
      sizeChart: o.gender === 'men' ? 'men' : 'women',
      rating: o.rating || 4.6,
      reviewCount: o.reviews || 120,
      tags: o.tags || [],
      badge: o.badge || null,
      isCombo: !!o.isCombo,
      audience: o.audience || (o.isCombo ? 'unisex' : o.gender),
      featuredRank: o.rank || 0,
      isNew: !!o.isNew,
      isActive: true,
      createdAt: Date.now() - (i * 86400000),
      modelNote: o.modelNote || 'Model is 5\'6" and wears size S.'
    };
  }

  /* ═══ WOMEN (12) ═══════════════════════════════════════ */
  var WOMEN = [
    { name: 'Luxe Seamless Bra — Nude', gender: 'women', category: 'bra', price: 349000, compare: 399000, badge: 'BEST SELLER', rating: 4.9, reviews: 412, rank: 1, fabric: 'Microfibre Modal', imgs: [IMG.d, IMG.b, IMG.f], desc: 'Wire-free seamless bra with second-skin comfort and invisible edges.' },
    { name: 'CloudSoft T-Shirt Bra — Black', gender: 'women', category: 'bra', price: 329000, badge: 'NEW', isNew: true, rating: 4.8, reviews: 188, rank: 4, imgs: [IMG.f, IMG.e, IMG.d], desc: 'Moulded cups that disappear under everything. Zero show-through.' },
    { name: 'Satin Balconette Bra — Champagne', gender: 'women', category: 'bra', price: 429000, compare: 529000, badge: 'LUXURY', rating: 4.7, reviews: 96, fabric: 'Stretch Satin', imgs: [IMG.e, IMG.f, IMG.k], desc: 'Structured balconette lift finished with matte satin and gold hardware.' },
    { name: 'Everyday Cotton Bra — Beige', gender: 'women', category: 'bra', price: 249000, rating: 4.6, reviews: 254, fabric: 'Egyptian Cotton', imgs: [IMG.b, IMG.d, IMG.g], desc: 'Pure cotton comfort for all-day wear in the Sri Lankan climate.' },
    { name: 'Silk Touch Panty Pack (3pcs)', gender: 'women', category: 'panty', price: 299000, compare: 399000, badge: 'COMBO', rating: 4.8, reviews: 331, rank: 2, imgs: [IMG.e, IMG.f, IMG.a], desc: 'Three silky-smooth mid-rise panties. Laser-cut edges, no lines.' },
    { name: 'French Lace Thong — Midnight', gender: 'women', category: 'panty', price: 189000, badge: 'LUXURY', rating: 4.5, reviews: 74, fabric: 'French Leavers Lace', imgs: [IMG.k, IMG.e, IMG.f], desc: 'Delicate French lace with a soft cotton gusset.' },
    { name: 'High-Waist Comfort Brief (5pcs)', gender: 'women', category: 'panty', price: 349000, rating: 4.7, reviews: 208, fabric: 'Cotton Modal', imgs: [IMG.g, IMG.b, IMG.d], desc: 'Full coverage, tummy-smoothing, five everyday essentials.' },
    { name: 'Premium Lace Lingerie Set — Black', gender: 'women', category: 'set', price: 499000, compare: 649000, badge: 'LUXURY', rating: 4.9, reviews: 167, rank: 3, imgs: [IMG.f, IMG.k, IMG.e], desc: 'Matching lace bralette and brief — the complete look.' },
    { name: 'Seamless Luxury Set — Rose', gender: 'women', category: 'set', price: 299000, compare: 399000, badge: 'BEST SELLER', rating: 4.8, reviews: 289, imgs: [IMG.b, IMG.e, IMG.d], desc: 'The set that started it all. Seamless, weightless, unforgettable.' },
    { name: 'Modal Camisole — Ivory', gender: 'women', category: 'camisole', price: 279000, badge: 'NEW', isNew: true, rating: 4.6, reviews: 61, imgs: [IMG.l, IMG.b, IMG.k], desc: 'Buttery modal camisole — layer it or wear it solo.' },
    { name: 'Bridal Satin Set — Pearl', gender: 'women', category: 'set', price: 649000, compare: 849000, badge: 'LUXURY', rating: 5.0, reviews: 42, fabric: 'Silk-touch Satin', imgs: [IMG.k, IMG.e, IMG.j], desc: 'Hand-finished bridal set with pearl detail and satin ribbon ties.' },
    { name: 'Sculpt Bodysuit — Onyx', gender: 'women', category: 'set', price: 549000, badge: 'NEW', isNew: true, rating: 4.7, reviews: 88, imgs: [IMG.a, IMG.f, IMG.k], desc: 'Smoothing bodysuit with snap closure and sculpting panels.' }
  ];

  /* ═══ MEN (10) ═════════════════════════════════════════ */
  var MEN = [
    { name: 'Men Modal Boxer — Charcoal', gender: 'men', category: 'boxer', price: 249000, compare: 299000, badge: 'BEST SELLER', rating: 4.8, reviews: 356, rank: 2, imgs: [IMG.h, IMG.i, IMG.c], desc: 'Long-leg modal boxer that never rides up.' },
    { name: 'Men Seamless Trunk (3pcs)', gender: 'men', category: 'trunk', price: 399000, compare: 549000, badge: 'COMBO', rating: 4.7, reviews: 243, rank: 1, imgs: [IMG.c, IMG.h, IMG.i], desc: 'Three seamless trunks with a contoured pouch and soft waistband.' },
    { name: 'Luxury Bamboo Brief — White', gender: 'men', category: 'brief', price: 199000, badge: 'NEW', isNew: true, rating: 4.6, reviews: 129, fabric: 'Bamboo Viscose', imgs: [IMG.i, IMG.c, IMG.h], desc: 'Naturally breathable bamboo fibre with anti-odour finish.' },
    { name: 'Classic Cotton Brief (5pcs)', gender: 'men', category: 'brief', price: 299000, rating: 4.5, reviews: 198, fabric: 'Egyptian Cotton', imgs: [IMG.c, IMG.h, IMG.a], desc: 'Five everyday cotton briefs. Soft waistband, no dig.' },
    { name: 'Premium Boxer Brief — Navy', gender: 'men', category: 'boxer', price: 229000, compare: 279000, rating: 4.7, reviews: 176, imgs: [IMG.h, IMG.c, IMG.j], desc: 'Supportive boxer brief with a smooth, stay-put leg.' },
    { name: 'Ice-Silk Trunk — Olive', gender: 'men', category: 'trunk', price: 259000, badge: 'NEW', isNew: true, rating: 4.6, reviews: 87, fabric: 'Ice-Silk Nylon', imgs: [IMG.c, IMG.i, IMG.h], desc: 'Cool-touch ice silk that works with the heat.' },
    { name: 'Everyday Vest (2pcs) — White', gender: 'men', category: 'vest', price: 279000, rating: 4.4, reviews: 141, imgs: [IMG.i, IMG.h, IMG.c], desc: 'Two breathable cotton vests with reinforced shoulders.' },
    { name: 'Performance Boxer — Graphite', gender: 'men', category: 'boxer', price: 319000, compare: 399000, badge: 'BEST SELLER', rating: 4.8, reviews: 205, fabric: 'Performance Mesh', imgs: [IMG.j, IMG.h, IMG.c], desc: 'Moisture-wicking mesh boxer built for movement.' },
    { name: 'Pouch Brief — Midnight', gender: 'men', category: 'brief', price: 179000, rating: 4.5, reviews: 92, imgs: [IMG.h, IMG.c, IMG.i], desc: 'Contoured pouch brief with a wide comfort waistband.' },
    { name: 'Modal Lounge Set — Sand', gender: 'men', category: 'set', price: 499000, compare: 629000, badge: 'LUXURY', rating: 4.7, reviews: 64, imgs: [IMG.j, IMG.i, IMG.h], desc: 'Boxer + tee lounge set in brushed modal. Weekend uniform.' }
  ];

  /* ═══ COMBOS (6) ═══════════════════════════════════════ */
  var COMBOS = [
    { name: 'Couple Combo — His & Hers', gender: 'unisex', category: 'combo', price: 599000, compare: 799000, isCombo: true, badge: 'VALENTINE', rating: 4.9, reviews: 121, rank: 1, imgs: [IMG.j, IMG.a, IMG.b], desc: 'Matching modal sets for two. Gift-boxed and ready.' },
    { name: "Women's Essentials 5-Pack", gender: 'unisex', audience: 'women', category: 'combo', price: 549000, compare: 749000, isCombo: true, badge: 'COMBO', rating: 4.8, reviews: 203, imgs: [IMG.b, IMG.e, IMG.f], desc: 'Five everyday panties + one free camisole.' },
    { name: "Men's Essentials 5-Pack", gender: 'unisex', audience: 'men', category: 'combo', price: 499000, compare: 699000, isCombo: true, badge: 'COMBO', rating: 4.7, reviews: 187, imgs: [IMG.h, IMG.c, IMG.i], desc: 'Five trunks + one free vest. Drawer refresh, sorted.' },
    { name: 'Weekend Duo Set — 2 Sets', gender: 'unisex', category: 'combo', price: 699000, compare: 899000, isCombo: true, badge: 'COMBO', rating: 4.6, reviews: 74, imgs: [IMG.a, IMG.j, IMG.k], desc: 'Two premium sets at one price. Mix and match.' },
    { name: 'Bridal Box — Women’s Set', gender: 'unisex', audience: 'women', category: 'combo', price: 899000, compare: 1149000, isCombo: true, badge: 'LUXURY', rating: 5.0, reviews: 38, imgs: [IMG.k, IMG.e, IMG.j], desc: 'Bridal satin set + lace set + camisole in one keepsake box.' },
    { name: 'Ultimate Drawer Refresh', gender: 'unisex', category: 'combo', price: 999000, compare: 1399000, isCombo: true, badge: 'BEST SELLER', rating: 4.9, reviews: 96, rank: 3, imgs: [IMG.l, IMG.a, IMG.c], desc: 'Twelve pieces across women’s and men’s. Our biggest saving.' }
  ];

  var CATALOG = WOMEN.concat(MEN, COMBOS).map(mk);

  /* ── Seeded reviews ──────────────────────────────────── */
  var REVIEW_NAMES = [
    'Nadeesha P.', 'Chathura S.', 'Imasha W.', 'Kasun R.', 'Sanduni T.',
    'Dilshan M.', 'Yashodha K.', 'Ravindu G.', 'Thilini A.', 'Nuwan J.',
    'Hasitha D.', 'Piumi N.', 'Sahan B.', 'Kavindi L.', 'Charith F.'
  ];
  var REVIEW_TEXTS = [
    'Absolutely worth it. The fabric feels far more expensive than it is.',
    'Fit is exactly as described. Ordered a second set already.',
    'Packaging was completely discreet — no branding at all. Thank you!',
    'Delivery to Gampaha took 2 days. Very smooth experience.',
    'Soft, breathable, and the seams really are invisible.',
    'Sizing runs true. I normally wear M and M was perfect.',
    'Colour held up after 5 washes. No fading.',
    'Best innerwear I have bought in Sri Lanka. Genuinely.',
    'The free delivery over Rs. 5,000 made this a no-brainer.',
    'Comfortable all day in this heat. Very impressed.',
    'Great quality but I would love more colours.',
    'Bought as a gift and the presentation box was beautiful.',
    'Waistband does not dig in — exactly what I wanted.',
    'Customer support on WhatsApp replied in minutes.',
    'Ordered on Friday, arrived Tuesday (weekend skip as promised).'
  ];

  var reviews = [];
  CATALOG.forEach(function (p, pi) {
    var n = 2 + (pi % 4);
    for (var i = 0; i < n; i++) {
      var seed = (pi * 7 + i * 13) % 15;
      var rseed = (pi * 3 + i * 5) % 10;
      reviews.push({
        id: 'r' + LX.pad(reviews.length + 1, 4),
        productId: p.id,
        author: REVIEW_NAMES[seed],
        rating: rseed < 2 ? 4 : (rseed < 7 ? 5 : 4),
        title: rseed < 5 ? 'Exceeded expectations' : 'Great purchase',
        body: REVIEW_TEXTS[(pi + i * 3) % REVIEW_TEXTS.length],
        verified: i % 3 !== 2,
        createdAt: Date.now() - ((pi * 3 + i) * 86400000 * 2)
      });
    }
  });

  /* ── Coupons (blueprint §13.3) ───────────────────────── */
  var COUPONS = [
    { code: 'WELCOME10', type: 'percent', value: 10, minSubtotal: 200000, label: '10% off your first order', active: true },
    { code: 'LUXE500', type: 'fixed', value: 50000, minSubtotal: 400000, label: 'Rs. 500 off orders over Rs. 4,000', active: true },
    { code: 'FREESHIP', type: 'freeShipping', value: 0, minSubtotal: 0, label: 'Free standard delivery', active: true }
  ];

  /* ── Size charts ─────────────────────────────────────── */
  var SIZE_CHARTS = {
    women: {
      title: 'Women’s Size Guide',
      unit: 'cm',
      columns: ['Size', 'Bust', 'Waist', 'Hip'],
      rows: [
        ['XS', '78–82', '60–64', '86–90'],
        ['S', '83–87', '65–69', '91–95'],
        ['M', '88–92', '70–74', '96–100'],
        ['L', '93–98', '75–80', '101–106'],
        ['XL', '99–104', '81–86', '107–112'],
        ['2XL', '105–111', '87–93', '113–119'],
        ['3XL', '112–118', '94–100', '120–126']
      ],
      note: 'Measurements are body measurements, not garment measurements. If you are between sizes, size up for comfort.'
    },
    men: {
      title: 'Men’s Size Guide',
      unit: 'cm',
      columns: ['Size', 'Waist', 'Hip', 'Inseam'],
      rows: [
        ['S', '71–76', '86–91', '76'],
        ['M', '77–82', '92–97', '78'],
        ['L', '83–89', '98–104', '80'],
        ['XL', '90–96', '105–111', '81'],
        ['2XL', '97–103', '112–118', '82'],
        ['3XL', '104–111', '119–126', '82']
      ],
      note: 'Boxers and trunks are cut with a relaxed leg. For a closer fit, size down one.'
    }
  };

  /* ── Public API ──────────────────────────────────────── */
  /* Combos are a distinct group (Women 12 · Men 10 · Combos 6).
     Their `audience` decides which section they appear in. */
  function matchAudience(p, gender) {
    if (p.isCombo) {
      var a = p.audience || 'unisex';
      return a === gender || a === 'unisex';
    }
    return p.gender === gender || p.gender === 'unisex';
  }

  var Catalog = {
    products: CATALOG,
    reviews: reviews,
    coupons: COUPONS,
    sizeCharts: SIZE_CHARTS,

    all: function () { return CATALOG.filter(function (p) { return p.isActive; }); },

    byId: function (id) {
      for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].id === id) return CATALOG[i];
      return null;
    },

    bySlug: function (slug) {
      for (var i = 0; i < CATALOG.length; i++) if (CATALOG[i].slug === slug) return CATALOG[i];
      return null;
    },

    matchesGender: matchAudience,

    byGender: function (g) {
      return Catalog.all().filter(function (p) {
        return g === 'all' ? true : matchAudience(p, g);
      });
    },

    featured: function (n) {
      return Catalog.all()
        .filter(function (p) { return p.featuredRank > 0; })
        .sort(function (a, b) { return a.featuredRank - b.featuredRank; })
        .slice(0, n || 8);
    },

    newArrivals: function (n) {
      return Catalog.all().filter(function (p) { return p.isNew; }).slice(0, n || 8);
    },

    bestSellers: function (n) {
      return Catalog.all().slice().sort(function (a, b) { return b.reviewCount - a.reviewCount; }).slice(0, n || 8);
    },

    related: function (product, n) {
      return Catalog.all()
        .filter(function (p) { return p.id !== product.id && (p.category === product.category || p.gender === product.gender); })
        .slice(0, n || 4);
    },

    reviewsFor: function (productId) {
      return reviews.filter(function (r) { return r.productId === productId; })
        .sort(function (a, b) { return b.createdAt - a.createdAt; });
    },

    coupon: function (code) {
      var c = String(code || '').trim().toUpperCase();
      for (var i = 0; i < COUPONS.length; i++) if (COUPONS[i].code === c) return COUPONS[i];
      return null;
    },

    categories: function () {
      var map = {};
      Catalog.all().forEach(function (p) { map[p.category] = (map[p.category] || 0) + 1; });
      return map;
    },

    priceRange: function () {
      var prices = Catalog.all().map(function (p) { return p.price; });
      return { min: Math.min.apply(null, prices), max: Math.max.apply(null, prices) };
    },

    allSizes: function () {
      var s = {};
      Catalog.all().forEach(function (p) { p.sizes.forEach(function (x) { s[x] = 1; }); });
      return Object.keys(s);
    },

    allColors: function () {
      var map = {};
      Catalog.all().forEach(function (p) {
        p.colors.forEach(function (c) {
          if (!map[c.name]) map[c.name] = c.hex;
        });
      });
      return Object.keys(map).map(function (k) { return { name: k, hex: map[k] }; });
    },

    stockOf: function (productId, size, color) {
      var p = Catalog.byId(productId);
      if (!p) return 0;
      for (var i = 0; i < p.variants.length; i++) {
        var v = p.variants[i];
        if (v.size === size && (!color || v.color === color)) return v.stock;
      }
      return 0;
    }
  };

  LX.Catalog = Catalog;
})(window);