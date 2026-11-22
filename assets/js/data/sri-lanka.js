/* ═══════════════════════════════════════════════════════════
   LUXE INTIMO — data/sri-lanka.js
   6 Districts → 67 Polling Divisions → ~300 sub-areas
   Sources (blueprint §8.1):
     · Election Commission of Sri Lanka — Notice u/s 9(3),
       Registration of Electors Act No. 44 of 1980
     · Sri Lanka Post — Post Code Directory (slpost.gov.lk)
   Delivery zones & quotes (blueprint §8.6)
   ═══════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  var LX = global.LX;

  /* areas: [name, zip] pairs — normalised below */
  var DISTRICTS = [
    {
      id: 'colombo', name: 'Colombo', nameSi: 'කොළඹ', zone: 1, days: [1, 3],
      divisions: [
        { code: 'A', name: 'Colombo North', zip: '01100', areas: [['Pettah', '01100'], ['Kochchikade', '01200'], ['Kotahena', '01300'], ['Grandpass', '01400'], ['Mutwal', '01500'], ['Wolfendhal', '01200'], ['Bloemendhal', '01400']] },
        { code: 'B', name: 'Colombo Central', zip: '00200', areas: [['Hulftsdorp', '00200'], ['Aluthkade', '00200'], ['Maradana', '01000'], ['Dematagoda', '00900'], ['Panchikawatte', '01000']] },
        { code: 'C', name: 'Borella', zip: '00800', areas: [['Borella East', '00800'], ['Thimbirigasyaya', '00800'], ['Welikada', '00800'], ['Nawimana', '00800'], ['Nawala', '00800']] },
        { code: 'D', name: 'Colombo East', zip: '00500', areas: [['Narahenpita', '00500'], ['Havelock Town', '00500'], ['Kirulapone', '00500'], ['Polhengoda', '00500'], ['Cinnamon Gardens', '00700'], ['Longdon Place', '00500']] },
        { code: 'E', name: 'Colombo West', zip: '00300', areas: [['Kollupitiya', '00300'], ['Colpetty', '00300'], ['Bambalapitiya', '00400'], ['Vajiragama', '00300'], ['Wellawatte', '00600'], ['Kuppiyawatta', '00300']] },
        { code: 'F', name: 'Dehiwala', zip: '10350', areas: [['Dehiwala', '10350'], ['Mount Lavinia', '10370'], ['Gangodawila', '10350'], ['Watarappola', '10350'], ['Attidiya', '10350'], ['Kalubowila', '10350']] },
        { code: 'G', name: 'Ratmalana', zip: '10390', areas: [['Ratmalana', '10390'], ['Angulana', '10390'], ['Lakshapathiya', '10390'], ['Koralawella', '10390'], ['Rawathawatta', '10390']] },
        { code: 'H', name: 'Kolonnawa', zip: '10600', areas: [['Kolonnawa', '10600'], ['Wellampitiya', '10600'], ['Mulleriyawa', '10620'], ['Gothatuwa', '10620'], ['Orugodawatta', '10600']] },
        { code: 'I', name: 'Kotte', nameSi: 'කෝට්ටේ', zip: '10100', areas: [['Sri Jayawardenepura', '10100'], ['Rajagiriya', '10107'], ['Battaramulla', '10120'], ['Talawatugoda', '10116'], ['Hokandara', '10118']] },
        { code: 'J', name: 'Kaduwela', zip: '10640', areas: [['Kaduwela', '10640'], ['Malabe', '10115'], ['Koswatta', '10108'], ['Angoda', '10620'], ['Kosgama', '10640']] },
        { code: 'K', name: 'Avissawella', zip: '10700', areas: [['Avissawella', '10700'], ['Hanwella', '10660'], ['Yatiyantota', '10704'], ['Deraniyagala', '10732'], ['Labugama', '10700']] },
        { code: 'L', name: 'Homagama', zip: '10200', areas: [['Homagama', '10200'], ['Kottawa', '10230'], ['Meepe', '10204'], ['Kiriwattuduwa', '10208'], ['Padukka', '10500'], ['Ranala', '10200']] },
        { code: 'M', name: 'Maharagama', zip: '10280', areas: [['Maharagama', '10280'], ['Boralesgamuwa', '10290'], ['Wattegedara', '10280'], ['Kahawala', '10280'], ['Madiwela', '10280']] },
        { code: 'N', name: 'Kesbewa', zip: '10300', areas: [['Kesbewa', '10300'], ['Piliyandala', '10300'], ['Kahathuduwa', '10304'], ['Olaboduwa', '10304'], ['Madapatha', '10300'], ['Gorakapitiya', '10300']] },
        { code: 'O', name: 'Moratuwa', zip: '10400', areas: [['Moratuwa', '10400'], ['Egoda Uyana', '10400'], ['Katukurunda', '10400'], ['Idama', '10400'], ['Indibedda', '10400'], ['Horethuduwa', '10400']] }
      ]
    },
    {
      id: 'gampaha', name: 'Gampaha', nameSi: 'ගම්පහ', zone: 1, days: [1, 3],
      divisions: [
        { code: 'A', name: 'Wattala', zip: '11300', areas: [['Wattala', '11300'], ['Hendala', '11300'], ['Mabole', '11300'], ['Welisara', '11300'], ['Hunupitiya', '11300'], ['Kandawala', '11300']] },
        { code: 'B', name: 'Negombo', nameSi: 'මීගමුව', zip: '11500', areas: [['Negombo', '11500'], ['Dalupotha', '11500'], ['Katuwapitiya', '11500'], ['Thaladuwa', '11500'], ['Kurana', '11500'], ['Bolawalana', '11500']] },
        { code: 'C', name: 'Katana', zip: '11534', areas: [['Katana', '11534'], ['Dungalpitiya', '11524'], ['Waikkal', '11510'], ['Kudapadu', '11534'], ['Talahena', '11534']] },
        { code: 'D', name: 'Divulapitiya', nameSi: 'දිවුලපිටිය', zip: '11250', areas: [['Divulapitiya', '11250'], ['Radawadunna', '11250'], ['Mabodale', '11250'], ['Wilimbula', '11250'], ['Delgoda', '11250']] },
        { code: 'E', name: 'Mirigama', zip: '11200', areas: [['Mirigama', '11200'], ['Nittambuwa', '11220'], ['Veyangoda', '11230'], ['Pasyala', '11220']] },
        { code: 'F', name: 'Minuwangoda', nameSi: 'මිනුවන්ගොඩ', zip: '11550', areas: [['Andiambalama', '11558'], ['Horampella', '11564'], ['Kotugoda', '11390'], ['Kimbulapitiya', '11522'], ['Wegowwa', '11562'], ['Yatiyana', '11566']] },
        { code: 'G', name: 'Attanagalla', zip: '11120', areas: [['Attanagalla', '11120'], ['Banduragoda', '11120'], ['Udugampola', '11030'], ['Badalgamuwa', '11120'], ['Bemmulla', '11020']] },
        { code: 'H', name: 'Gampaha', zip: '11000', areas: [['Gampaha', '11000'], ['Yakkala', '11030'], ['Ganemulla', '11020'], ['Malwathuhiripitiya', '11000'], ['Weliweriya', '11030']] },
        { code: 'I', name: 'Ja-Ela', zip: '11350', areas: [['Ja-Ela', '11350'], ['Kapuwatte', '11350'], ['Ekala', '11380'], ['Dagonna', '11350'], ['Tuduwa', '11350']] },
        { code: 'J', name: 'Mahara', zip: '11851', areas: [['Mahara', '11851'], ['Kadawatha', '11850'], ['Ruggahawila', '11851'], ['Dambuwa', '11851'], ['Kiribathgoda', '10110']] },
        { code: 'K', name: 'Dompe', zip: '11680', areas: [['Dompe', '11680'], ['Henegama', '11680'], ['Welhena', '11680'], ['Depanama', '11680'], ['Watinapaha', '11680']] },
        { code: 'L', name: 'Biyagama', zip: '11650', areas: [['Biyagama', '11650'], ['Salpadawila', '11650'], ['Batapotha', '11650'], ['Raddoluwa', '11650']] },
        { code: 'M', name: 'Kelaniya', zip: '11600', areas: [['Kelaniya', '11600'], ['Peliyagoda', '11830'], ['Waragoda', '11600'], ['Mahawatta', '11600']] }
      ]
    },
    {
      id: 'kalutara', name: 'Kalutara', nameSi: 'කළුතර', zone: 2, days: [2, 4],
      divisions: [
        { code: 'A', name: 'Panadura', zip: '12500', areas: [['Panadura', '12500'], ['Elapita', '12500'], ['Pinwala', '12500'], ['Keselwatta', '12500'], ['Galthuduwa', '12500']] },
        { code: 'B', name: 'Bandaragama', zip: '12530', areas: [['Bandaragama', '12530'], ['Payagala', '12508'], ['Bolgoda', '12530'], ['Hirana', '12530'], ['Yatadolawatta', '12530']] },
        { code: 'C', name: 'Horana', zip: '12400', areas: [['Horana', '12400'], ['Pokunuwita', '12400'], ['Tummodara', '12400'], ['Kirigala', '12400'], ['Anguruwatota', '12400']] },
        { code: 'D', name: 'Bulathsinhala', zip: '12300', areas: [['Bulathsinhala', '12300'], ['Nagoda', '12300'], ['Diggala', '12300'], ['Hettimulla', '12300'], ['Walallawita', '12300']] },
        { code: 'E', name: 'Matugama', zip: '12100', areas: [['Matugama', '12100'], ['Dodangoda', '12110'], ['Mahagama', '12106'], ['Yagirala', '12124'], ['Wettawa', '12100']] },
        { code: 'F', name: 'Kalutara', zip: '12000', areas: [['Kalutara', '12000'], ['Katukurunda', '12000'], ['Wadduwa', '12140'], ['Kudaligama', '12000']] },
        { code: 'G', name: 'Beruwala', zip: '12070', areas: [['Beruwala', '12070'], ['Aluthgama', '12080'], ['Moragalla', '12070'], ['Dharga Town', '12090'], ['Maggona', '12070']] },
        { code: 'H', name: 'Agalawatta', zip: '12200', areas: [['Agalawatta', '12200'], ['Baduraliya', '12204'], ['Migahatenna', '12206'], ['Pimbura', '12208'], ['Palindanuwara', '12094']] }
      ]
    },
    {
      id: 'galle', name: 'Galle', nameSi: 'ගාල්ල', zone: 2, days: [2, 4],
      divisions: [
        { code: 'A', name: 'Balapitiya', zip: '80550', areas: [['Balapitiya', '80550'], ['Ahungalla', '80560'], ['Kosgoda', '80570'], ['Magalle', '80550'], ['Induruwa', '80500']] },
        { code: 'B', name: 'Ambalangoda', zip: '80300', areas: [['Ambalangoda', '80300'], ['Hikkaduwa', '80240'], ['Gonapinuwala', '80300'], ['Kandegoda', '80300'], ['Pitiduwa', '80300']] },
        { code: 'C', name: 'Karandeniya', zip: '80360', areas: [['Karandeniya', '80360'], ['Yakkalamulla', '80360'], ['Bemmulana', '80360'], ['Haburugala', '80360'], ['Poddala', '80350']] },
        { code: 'D', name: 'Bentara–Elpitiya', zip: '80400', areas: [['Elpitiya', '80400'], ['Bentota', '80500'], ['Niyagama', '80400'], ['Wathurugama', '80400'], ['Bentara', '80400'], ['Pannimulla', '80400']] },
        { code: 'E', name: 'Hiniduma', zip: '80080', areas: [['Hiniduma', '80080'], ['Lelwala', '80080'], ['Thawalama', '80080'], ['Nagoda', '80080'], ['Dikkumbura', '80080']] },
        { code: 'F', name: 'Baddegama', zip: '80200', areas: [['Baddegama', '80200'], ['Udugama', '80070'], ['Yatalamatta', '80200'], ['Ganegoda', '80200'], ['Meetiyagoda', '80250']] },
        { code: 'G', name: 'Ratgama', zip: '80260', areas: [['Ratgama', '80260'], ['Dodanduwa', '80250'], ['Boossa', '80270'], ['Uluvitike', '80260'], ['Wathugedara', '80260']] },
        { code: 'H', name: 'Galle', zip: '80000', areas: [['Galle', '80000'], ['Unawatuna', '80600'], ['Wakwella', '80000'], ['Dadalla', '80000'], ['Rumassala', '80000']] },
        { code: 'I', name: 'Akmeemana', zip: '80090', areas: [['Akmeemana', '80090'], ['Koggala', '80180'], ['Ahangama', '80650'], ['Ganegoda', '80090']] },
        { code: 'J', name: 'Habaraduwa', zip: '80630', areas: [['Habaraduwa', '80630'], ['Talpe', '80610'], ['Kataluwa', '80620'], ['Gintota', '80280'], ['Polhena', '80600']] }
      ]
    },
    {
      id: 'matara', name: 'Matara', nameSi: 'මාතර', zone: 2, days: [2, 4],
      divisions: [
        { code: 'A', name: 'Deniyaya', zip: '81500', areas: [['Deniyaya', '81500'], ['Kotapola', '81532'], ['Morawaka', '81610'], ['Pasgoda', '81534'], ['Bengamuwa', '81500']] },
        { code: 'B', name: 'Hakmana', zip: '81300', areas: [['Hakmana', '81300'], ['Nadugala', '81304'], ['Karagoda Uyangoda', '81302'], ['Katuwana', '81300'], ['Aturaliya', '81300']] },
        { code: 'C', name: 'Akuressa', zip: '81400', areas: [['Akuressa', '81400'], ['Telijjawila', '81410'], ['Pothupitiya', '81400'], ['Udupihilla', '81400'], ['Warapanduwa', '81400']] },
        { code: 'D', name: 'Kamburupitiya', zip: '81100', areas: [['Kamburupitiya', '81100'], ['Makandura', '81070'], ['Maliduwa', '81100'], ['Hulankanda', '81100'], ['Dampahala', '81100']] },
        { code: 'E', name: 'Devinuwara (Dondra)', zip: '81160', areas: [['Devinuwara (Dondra)', '81160'], ['Gandara', '81170'], ['Kumbalgama', '81160'], ['Kottegoda', '81160'], ['Warahena', '81160']] },
        { code: 'F', name: 'Matara', zip: '81000', areas: [['Matara', '81000'], ['Nupe', '81000'], ['Pallimulla', '81000'], ['Walgama', '81000'], ['Malimbada', '81000']] },
        { code: 'G', name: 'Weligama', zip: '81700', areas: [['Mirissa', '81740'], ['Kamburugamuwa', '81750'], ['Denipitiya', '81730'], ['Welipitiya', '81720']] }
      ]
    },
    {
      id: 'kurunegala', name: 'Kurunegala', nameSi: 'කුරුණෑගල', zone: 3, days: [2, 5],
      divisions: [
        { code: 'A', name: 'Galgamuwa', zip: '60700', areas: [['Galgamuwa', '60700'], ['Ehetuwewa', '60706'], ['Moragane', '60708'], ['Gokaralla', '60712'], ['Ambanpola', '60652']] },
        { code: 'B', name: 'Nikaweratiya', zip: '60470', areas: [['Nikaweratiya', '60470'], ['Thambagalla', '60470'], ['Eriyagolla', '60470'], ['Maduragoda', '60470'], ['Bamunupola', '60470']] },
        { code: 'C', name: 'Yapahuwa', zip: '60600', postalVia: 'Maho', areas: [['Maho', '60600'], ['Balalla', '60604'], ['Ridibendiella', '60606']] },
        { code: 'D', name: 'Hiriyala', zip: '60500', postalVia: 'Ibbagamuwa', areas: [['Ibbagamuwa', '60500'], ['Ganewatta', '60512'], ['Bogamulla', '60500'], ['Polpitigama', '60522']] },
        { code: 'E', name: 'Wariyapola', zip: '60400', areas: [['Wariyapola', '60400'], ['Kobeigane', '60412'], ['Dummalasuriya', '60402']] },
        { code: 'F', name: 'Panduwasnuwara', zip: '60430', postalVia: 'Hettipola', areas: [['Hettipola', '60430'], ['Sirisetagama', '60430'], ['Welambewa', '60430'], ['Kalugamuwa', '60430']] },
        { code: 'G', name: 'Bingiriya', zip: '60450', areas: [['Bingiriya', '60450'], ['Narammala', '60452'], ['Kudagama', '60450'], ['Udubaddawa', '60450']] },
        { code: 'H', name: 'Katugampola', zip: '60160', postalVia: 'Pannala', areas: [['Pannala', '60160'], ['Bujjampola', '60160'], ['Wadumunnegedara', '60160']] },
        { code: 'I', name: 'Kuliyapitiya', zip: '60200', areas: [['Kuliyapitiya', '60200'], ['Udagaldeniya', '60204'], ['Pilessa', '60206'], ['Halwatura', '60200']] },
        { code: 'J', name: 'Dambadeniya', zip: '60130', areas: [['Dambadeniya', '60130'], ['Giriulla', '60140'], ['Maduragoda', '60130']] },
        { code: 'K', name: 'Polgahawela', zip: '60300', areas: [['Polgahawela', '60300'], ['Alawwa', '60422'], ['Thorayaya', '60300']] },
        { code: 'L', name: 'Kurunegala', zip: '60000', areas: [['Kurunegala', '60000'], ['Boyagane', '60006'], ['Weerambugedara', '60004'], ['Ettungahakotuwa', '60008']] },
        { code: 'M', name: 'Mawathagama', zip: '60060', areas: [['Mawathagama', '60060'], ['Kalugamuwa', '60062'], ['Rideeliyadda', '60064'], ['Pothuhera', '60060']] },
        { code: 'N', name: 'Dodangaslanda', zip: '60530', areas: [['Dodangaslanda', '60530'], ['Wellagala', '60532'], ['Melsiripura', '60522']] }
      ]
    }
  ];

  /* ── Normalise areas ─────────────────────────────────── */
  DISTRICTS.forEach(function (d) {
    d.divisions.forEach(function (div) {
      div.districtId = d.id;
      div.districtName = d.name;
      div.zone = d.zone;
      div.id = d.id + '-' + div.code;
      div.areas = (div.areas || []).map(function (a) {
        return Array.isArray(a) ? { name: a[0], zip: a[1] } : a;
      });
      /* NOTE: the division's own ZIP is the default when no sub-area is
         picked (see the city ▾ onchange in checkout.js). Sub-area lists are
         therefore kept exactly as documented — never padded. */
    });
    d.divisionCount = d.divisions.length;
  });

  /* ── Pricing constants (blueprint §8.6) ──────────────── */
  var PRICING = {
    freeDeliveryThreshold: 500000, /* Rs. 5,000 in cents */
    codFee: 10000,                 /* Rs. 100 */
    expressDiscountWhenFree: 25000 /* Rs. 250 off express when standard is free */
  };

  var ZONES = {
    1: { name: 'Metro', standard: 30000, express: 55000, daysLabel: '1–3' },
    2: { name: 'Coastal', standard: 40000, express: 70000, daysLabel: '2–4' },
    3: { name: 'Inland', standard: 40000, express: 70000, daysLabel: '2–5' }
  };

  /* ── API ─────────────────────────────────────────────── */
  var SL = {
    districts: DISTRICTS,
    zones: ZONES,
    pricing: PRICING,

    district: function (id) {
      for (var i = 0; i < DISTRICTS.length; i++) if (DISTRICTS[i].id === id) return DISTRICTS[i];
      return null;
    },

    divisions: function (districtId) {
      var d = SL.district(districtId);
      return d ? d.divisions : [];
    },

    division: function (districtId, codeOrId) {
      var list = SL.divisions(districtId);
      for (var i = 0; i < list.length; i++) {
        if (list[i].code === codeOrId || list[i].id === codeOrId || list[i].name === codeOrId) return list[i];
      }
      return null;
    },

    findDivisionAny: function (codeOrName) {
      for (var i = 0; i < DISTRICTS.length; i++) {
        var d = DISTRICTS[i];
        for (var j = 0; j < d.divisions.length; j++) {
          var v = d.divisions[j];
          if (v.code === codeOrName || v.id === codeOrName || v.name.toLowerCase() === String(codeOrName).toLowerCase()) return v;
        }
      }
      return null;
    },

    zoneOf: function (districtId) {
      var d = SL.district(districtId);
      return d ? d.zone : 1;
    },

    /* ── Delivery quote (blueprint §8.6 rules) ─────────── */
    quote: function (opts) {
      var o = opts || {};
      var districtId = o.districtId || 'colombo';
      var d = SL.district(districtId) || DISTRICTS[0];
      var zone = ZONES[d.zone];
      var method = o.deliveryMethod === 'express' ? 'express' : 'standard';
      var afterDiscounts = Math.max(0, Math.round(o.afterDiscounts || 0));
      var isCOD = o.paymentMethod === 'cod';
      var couponFreeShip = !!o.couponFreeShip;

      var base = method === 'express' ? zone.express : zone.standard;
      var fee = base;
      var waived = false;

      if (method === 'standard') {
        if (afterDiscounts >= PRICING.freeDeliveryThreshold || couponFreeShip) { fee = 0; waived = true; }
      } else {
        /* Express: free-delivery unlocks only a Rs. 250 discount */
        if (afterDiscounts >= PRICING.freeDeliveryThreshold || couponFreeShip) {
          fee = Math.max(0, base - PRICING.expressDiscountWhenFree);
        }
      }

      var codFee = isCOD ? PRICING.codFee : 0;

      return {
        districtId: d.id,
        districtName: d.name,
        zone: d.zone,
        zoneName: zone.name,
        method: method,
        deliveryFee: fee,
        deliveryFeeWaived: waived,
        codFee: codFee,
        daysLabel: zone.daysLabel,
        total: fee + codFee
      };
    },

    /* ── ETA (weekends skipped — blueprint §8.6) ────────── */
    eta: function (method) {
      var now = Date.now();
      var d = method === 'express' ? [1, 2] : [2, 4];
      return {
        from: LX.addBusinessDays(now, d[0]),
        to: LX.addBusinessDays(now, d[1])
      };
    },

    etaLabel: function (method, longForm) {
      var e = SL.eta(method);
      if (longForm) return LX.fmtDateShort(e.from) + ' – ' + LX.fmtDateShort(e.to);
      return LX.fmtDateShort(e.from) + ' – ' + LX.fmtDateShort(e.to);
    },

    /* ── Address lookup (dev panel) ────────────────────── */
    search: function (query) {
      var q = String(query || '').trim().toLowerCase();
      if (!q) return [];
      var out = [];
      DISTRICTS.forEach(function (d) {
        d.divisions.forEach(function (v) {
          if (v.name.toLowerCase().indexOf(q) === 0) {
            out.push({ type: 'division', division: v.name, zip: v.zip, district: d.name, districtId: d.id, zone: d.zone, note: v.postalVia ? 'via ' + v.postalVia : '' });
          }
          v.areas.forEach(function (a) {
            if (a.name.toLowerCase().indexOf(q) === 0 || a.name.toLowerCase().indexOf(q) > -1) {
              out.push({ type: 'area', area: a.name, division: v.name, zip: a.zip, district: d.name, districtId: d.id, zone: d.zone });
            }
          });
        });
      });
      return out.slice(0, 12);
    },

    /* ── Validation helper ─────────────────────────────── */
    isValidPostal: function (z) { return /^\d{5}$/.test(String(z || '')); },

    allDivisionCount: function () {
      return DISTRICTS.reduce(function (t, d) { return t + d.divisions.length; }, 0);
    },

    allAreaCount: function () {
      var n = 0;
      DISTRICTS.forEach(function (d) { d.divisions.forEach(function (v) { n += v.areas.length; }); });
      return n;
    }
  };

  LX.SL = SL;
})(window);