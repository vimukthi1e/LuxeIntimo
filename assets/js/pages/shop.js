/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — pages/shop.js
   Filters · sort · grid/list · pagination (blueprint §20)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;
  var $ = LX.$, $$ = LX.$$;

  var PAGE_SIZE = 12;

  function priceRangeRupees() {
    var r = LX.Catalog.priceRange();
    return { min: 0, max: Math.ceil(r.max / 100 / 500) * 500 };
  }

  function readFilters(query) {
    return {
      gender: query.gender || 'all',
      category: query.category || '',
      size: query.size || '',
      color: query.color || '',
      min: query.min ? parseInt(query.min, 10) : null,
      max: query.max ? parseInt(query.max, 10) : null,
      sort: query.sort || 'featured',
      page: Math.max(1, parseInt(query.page || '1', 10)),
      view: query.view === 'list' ? 'list' : 'grid',
      isNew: query.new === '1',
      q: query.q || ''
    };
  }

  function applyFilters(f) {
    var list = LX.Catalog.all().slice();

    if (f.gender && f.gender !== 'all') {
      list = list.filter(function (p) { return LX.Catalog.matchesGender(p, f.gender); });
    }
    if (f.category) list = list.filter(function (p) { return p.category === f.category; });
    if (f.size) list = list.filter(function (p) { return p.sizes.indexOf(f.size) > -1; });
    if (f.color) list = list.filter(function (p) {
      return p.colors.some(function (c) { return c.name === f.color; });
    });
    if (f.isNew) list = list.filter(function (p) { return p.isNew; });
    if (f.q) {
      var q = f.q.toLowerCase();
      list = list.filter(function (p) {
        return p.name.toLowerCase().indexOf(q) > -1 ||
          p.category.toLowerCase().indexOf(q) > -1 ||
          p.fabric.toLowerCase().indexOf(q) > -1 ||
          p.description.toLowerCase().indexOf(q) > -1;
      });
    }
    if (f.min !== null) list = list.filter(function (p) { return p.price >= f.min * 100; });
    if (f.max !== null) list = list.filter(function (p) { return p.price <= f.max * 100; });

    switch (f.sort) {
      case 'price-asc': list = LX.sortBy(list, 'price', 'asc'); break;
      case 'price-desc': list = LX.sortBy(list, 'price', 'desc'); break;
      case 'rating': list = LX.sortBy(list, 'rating', 'desc'); break;
      case 'new': list = LX.sortBy(list, 'createdAt', 'desc'); break;
      case 'best': list = LX.sortBy(list, 'reviewCount', 'desc'); break;
      case 'name': list = LX.sortBy(list, 'name', 'asc'); break;
      default: list = LX.sortBy(list, function (p) { return p.featuredRank || 99; }, 'asc');
    }
    return list;
  }

  function renderShop(params, query) {
    var f = readFilters(query);
    var all = applyFilters(f);
    var totalPages = Math.max(1, Math.ceil(all.length / PAGE_SIZE));
    var page = Math.min(f.page, totalPages);
    var slice = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    var range = priceRangeRupees();

    var chipsActive = [];
    if (f.gender !== 'all') chipsActive.push({ key: 'gender', label: LX.titleCase(f.gender) });
    if (f.category) chipsActive.push({ key: 'category', label: LX.titleCase(f.category) });
    if (f.size) chipsActive.push({ key: 'size', label: 'Size ' + f.size });
    if (f.color) chipsActive.push({ key: 'color', label: f.color });
    if (f.isNew) chipsActive.push({ key: 'new', label: 'New in' });
    if (f.min) chipsActive.push({ key: 'min', label: 'From ' + f.min });
    if (f.max) chipsActive.push({ key: 'max', label: 'Up to ' + f.max });

    var titles = {
      all: 'The Collection', women: 'Women', men: 'Men', unisex: 'Unisex', combo: 'Combo Packs'
    };
    var title = f.category ? LX.titleCase(f.category) + (f.gender !== 'all' ? ' · ' + titles[f.gender] : '') : (titles[f.gender] || 'The Collection');

    return '' +
      '<section class="container page-head shop-head">' +
      '<p class="label label-gold">Shop</p>' +
      '<h1 class="h-serif">' + LX.esc(title) + '</h1>' +
      '<p class="muted">' + all.length + ' product' + (all.length === 1 ? '' : 's') +
      (f.q ? ' matching “' + LX.esc(f.q) + '”' : '') + '</p>' +
      '</section>' +

      '<section class="container shop-layout">' +

      /* ── Sidebar filters ── */
      '<aside class="shop-filters" id="shopFilters">' +
      '<div class="row-between"><h4>Filters</h4><button class="btn-link" id="clearFilters">Clear all</button></div>' +

      '<div class="filter-group">' +
      '<h5 class="filter-title">Category</h5>' +
      '<div class="filter-chips">' +
      ['bra', 'panty', 'set', 'camisole', 'brief', 'boxer', 'trunk', 'vest', 'combo'].map(function (c) {
        return '<button class="chip' + (f.category === c ? ' active-gold' : '') + '" data-filter="category" data-value="' + c + '">' + LX.titleCase(c) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +

      '<div class="filter-group">' +
      '<h5 class="filter-title">Size</h5>' +
      '<div class="filter-chips">' +
      LX.Catalog.allSizes().map(function (s) {
        return '<button class="chip' + (f.size === s ? ' active-gold' : '') + '" data-filter="size" data-value="' + LX.esc(s) + '">' + LX.esc(s) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +

      '<div class="filter-group">' +
      '<h5 class="filter-title">Colour</h5>' +
      '<div class="filter-chips">' +
      LX.Catalog.allColors().map(function (c) {
        return '<button class="chip' + (f.color === c.name ? ' active-gold' : '') + '" data-filter="color" data-value="' + LX.esc(c.name) + '">' +
          '<i class="swatch" style="background:' + LX.esc(c.hex) + '"></i>' + LX.esc(c.name) + '</button>';
      }).join('') +
      '</div>' +
      '</div>' +

      '<div class="filter-group">' +
      '<h5 class="filter-title">Price (Rs.)</h5>' +
      '<div class="price-inputs">' +
      '<input class="input" id="priceMin" type="number" inputmode="numeric" min="0" placeholder="From" value="' + (f.min !== null ? f.min : '') + '">' +
      '<span class="muted">–</span>' +
      '<input class="input" id="priceMax" type="number" inputmode="numeric" min="0" placeholder="To" value="' + (f.max !== null ? f.max : '') + '" max="' + range.max + '">' +
      '</div>' +
      '<p class="muted tiny">Catalogue range: Rs. 0 – ' + LX.money(range.max * 100) + '</p>' +
      '</div>' +

      '<div class="filter-group">' +
      '<h5 class="filter-title">Sort by</h5>' +
      '<select class="select" id="sortSelect">' +
      [['featured', 'Featured'], ['best', 'Best sellers'], ['new', 'Newest'], ['rating', 'Top rated'], ['price-asc', 'Price: low to high'], ['price-desc', 'Price: high to low'], ['name', 'Name A–Z']]
        .map(function (o) {
          return '<option value="' + o[0] + '"' + (f.sort === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
        }).join('') +
      '</select>' +
      '</div>' +
      '</aside>' +

      /* ── Results ── */
      '<div class="shop-results">' +

      '<div class="shop-toolbar">' +
      '<div class="row wrap" style="gap:.45rem">' +
      chipsActive.map(function (c) {
        return '<button class="chip chip-remove" data-remove="' + c.key + '">' + LX.esc(c.label) + '<span class="x">✕</span></button>';
      }).join('') +
      '</div>' +
      '<div class="row" style="gap:.35rem">' +
      '<button class="icon-btn view-btn' + (f.view === 'grid' ? ' active' : '') + '" data-view="grid" aria-label="Grid view">' +
      '<svg viewBox="0 0 24 24" width="19" height="19"><rect x="4" y="4" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="13" y="4" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="4" y="13" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="13" y="13" width="7" height="7" rx="1.6" stroke="currentColor" stroke-width="1.5" fill="none"/></svg></button>' +
      '<button class="icon-btn view-btn' + (f.view === 'list' ? ' active' : '') + '" data-view="list" aria-label="List view">' +
      '<svg viewBox="0 0 24 24" width="19" height="19"><path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>' +
      '</div>' +
      '</div>' +

      (slice.length
        ? '<div class="pgrid' + (f.view === 'list' ? ' list-view' : '') + '">' +
        slice.map(function (p) { return LX.ProductCard.render(p); }).join('') +
        '</div>'
        : '<div class="empty">' +
        '<div class="empty-icon">' +
        '<svg viewBox="0 0 24 24" width="28" height="28"><circle cx="11" cy="11" r="6.2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>' +
        '</div>' +
        '<h3>No products match those filters</h3>' +
        '<p>Try removing a filter or browsing the full collection.</p>' +
        '<button class="btn btn-gold" id="emptyClear">Clear all filters</button>' +
        '</div>') +

      /* pagination */
      (totalPages > 1
        ? '<div class="pagination" style="margin-top:2.4rem">' +
        '<button class="page-btn" data-page="' + (page - 1) + '"' + (page <= 1 ? ' disabled' : '') + '>←</button>' +
        Array.apply(null, Array(totalPages)).map(function (_, i) {
          var n = i + 1;
          return '<button class="page-btn' + (n === page ? ' active' : '') + '" data-page="' + n + '">' + n + '</button>';
        }).join('') +
        '<button class="page-btn" data-page="' + (page + 1) + '"' + (page >= totalPages ? ' disabled' : '') + '>→</button>' +
        '</div>'
        : '') +

      '</div>' +
      '</section>';
  }

  function mountShop(root, params, query) {
    var f = readFilters(query);

    function push(patch) {
      var next = LX.extend({}, query, patch);
      /* reset page when filters change */
      if (!('page' in patch)) next.page = '';
      LX.Router.go('#/shop' + LX.buildQuery(next));
    }

    $$('[data-filter]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-filter');
        var val = btn.getAttribute('data-value');
        var patch = {};
        patch[key] = (f[key] === val) ? '' : val;
        push(patch);
      });
    });

    $$('[data-remove]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.getAttribute('data-remove');
        var patch = {};
        patch[key] = '';
        push(patch);
      });
    });

    function clearAll() {
      LX.Router.go('#/shop');
    }
    var clearBtn = $('#clearFilters', root);
    if (clearBtn) clearBtn.addEventListener('click', clearAll);
    var emptyClear = $('#emptyClear', root);
    if (emptyClear) emptyClear.addEventListener('click', clearAll);

    var sortSel = $('#sortSelect', root);
    if (sortSel) sortSel.addEventListener('change', function () {
      push({ sort: sortSel.value });
    });

    var applyPrice = LX.debounce(function () {
      var mn = $('#priceMin', root), mx = $('#priceMax', root);
      push({ min: mn && mn.value ? mn.value : '', max: mx && mx.value ? mx.value : '' });
    }, 550);
    var mnEl = $('#priceMin', root), mxEl = $('#priceMax', root);
    if (mnEl) mnEl.addEventListener('input', applyPrice);
    if (mxEl) mxEl.addEventListener('input', applyPrice);

    $$('[data-view]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        push({ view: btn.getAttribute('data-view') });
      });
    });

    $$('[data-page]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (btn.disabled) return;
        push({ page: btn.getAttribute('data-page') });
        global.scrollTo({ top: 0, behavior: 'smooth' });
      });
    });

    LX.ProductCard.wire(root);
    LX.UI.observeReveals(root);
  }

  LX.Pages.shop = { title: 'Shop', render: renderShop, mount: mountShop };
})(window);