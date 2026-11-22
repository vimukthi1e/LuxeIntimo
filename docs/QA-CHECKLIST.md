# QA Checklist — LUXE INTIMO

Run this end to end on **Windows (Chrome + Edge)** and on an **Android phone** (Chrome, mobile
viewport). Tick every box. Any ✗ is a bug.

> Tip: open DevTools → Console and keep it open the whole time. **The console must stay clean.**

---

## ✅ Already verified automatically

This build was exercised end to end in a real browser (Chromium, 1280×860 and iPhone 12 Pro
390×844) before hand-off. The items below are **already confirmed working** — the manual list
is for your own confidence and for regression checks after edits.

| Area | Verified |
|---|---|
| Logic suite | **286 / 286 assertions** pass (money as integer cents, pricing order, Luhn, delivery zones, SL address cascade, email rules, auth, orders, router) |
| Sri Lanka data | 6 districts · 67 polling divisions · 323 sub-areas with ZIP auto-fill (incl. Yapahuwa “via Maho”) |
| Catalogue | 28 products = 12 women + 10 men + 6 combos, all integer-cents prices |
| Full purchase flow | register → product → size required → cart → `WELCOME10` → checkout (Zone 1) → card → Pay → reCAPTCHA → order `LX-2026-00001` |
| Payment rules | Pay button **disabled until the card is valid**; reCAPTCHA appears **after** clicking Pay; no charge before it passes |
| Card engine | Luhn, brand detection, Amex `3782 822463 10005` + 4-digit CID, “Your card number is invalid.” |
| Data safety | stored `payment` = `{brand, last4, intentId, expMonth, expYear}` only — **no PAN, no CVC** anywhere in storage |
| Auth | “Incorrect password. 4 attempts left.” → “Too many attempts. Try again in 30s” · “That code isn’t correct. 3 attempts left.” · 3-step OTP wizard with dev code |
| Mobile | **0 touch targets under 44×44** across 7 pages · no horizontal scroll · header fits at 390px · 58px tab bar |
| Desktop | 4-column product grid · 4-column footer · full nav visible · tab bar hidden |
| Console | clean — no errors, warnings or unhandled rejections across 13 routes |

---

## 0 · Boot & runtime

- [ ] `start-server.bat` opens the browser at `http://localhost:8080` without errors
- [ ] Home page renders — hero, category tiles, product grids
- [ ] Console shows the `LUXE INTIMO v1.0.0` banner and `storage : localStorage`
- [ ] Console shows `crypto : PBKDF2-SHA256 @ 100000`
- [ ] Console shows `api : mock · MockGateway`
- [ ] No console errors or warnings on load
- [ ] Reload the page → nothing is lost
- [ ] Open two tabs → change something in one → the other updates

## 1 · Design & layout

- [ ] Dark theme everywhere (no light mode toggle exists)
- [ ] Gold appears only on accents, labels, hover states
- [ ] Header blurs and shrinks slightly on scroll
- [ ] Hero image slowly zooms (Ken Burns)
- [ ] Product card hover → image A cross-fades to image B
- [ ] Product card hover → card lifts, Quick Add slides up
- [ ] Skeleton shimmer appears while images load
- [ ] Scroll reveals fire sparingly, not on every element
- [ ] Resize to 360px wide → nothing overflows horizontally
- [ ] Mobile: bottom tab bar shows and has 5 items
- [ ] Mobile: tap targets are all ≥ 44px
- [ ] `prefers-reduced-motion` on → all animation stops

## 2 · Catalogue

- [ ] Home → Best Sellers, New Arrivals, Combos all render
- [ ] `#/shop` shows all 28 products
- [ ] Filter: Women → only women + unisex items
- [ ] Filter: Men → only men + unisex items
- [ ] Filter: Combos → 6 items
- [ ] Filter: category Bra / Panty / Set / Brief / Boxer / Trunk / Vest / Camisole
- [ ] Filter: size L
- [ ] Filter: colour Black
- [ ] Filter: price range
- [ ] Two filters combine correctly
- [ ] Sort: Featured / Best sellers / Newest / Top rated / Price ↑ / Price ↓ / Name
- [ ] Grid ↔ List toggle works and persists in the URL
- [ ] Pagination appears past 12 items and navigates correctly
- [ ] Clear all filters resets everything
- [ ] "No products match" empty state shows with a Clear button

## 3 · Product page

- [ ] Click a product → detail page opens
- [ ] Gallery thumbs switch the main image
- [ ] Zoom button enlarges the image
- [ ] Colour chips update the in-stock sizes
- [ ] Sold-out sizes are struck through and disabled
- [ ] Selecting a size shows remaining stock when low
- [ ] Add to bag without a size → error toast + shake
- [ ] Add to bag → toast + bag drawer opens
- [ ] Quantity picker updates
- [ ] Size guide modal opens and shows the right chart (women/men)
- [ ] Accordion sections open/close
- [ ] Reviews render with ratings and verified badges
- [ ] "Complete the look" shows 4 related products
- [ ] Wishlist heart toggles and updates the header badge

## 4 · Quick Add

- [ ] Hover a card → Quick Add appears
- [ ] Click Quick Add → modal with size + colour
- [ ] Sold-out size is disabled inside the modal
- [ ] Changing colour re-disables sold-out sizes
- [ ] Add to Bag → toast + drawer opens
- [ ] ESC closes the modal

## 5 · Cart / Bag

- [ ] Drawer opens from the header bag icon
- [ ] Quantity ± updates the totals live
- [ ] Quantity cannot exceed stock
- [ ] Remove deletes the line
- [ ] Empty bag shows the empty state
- [ ] **Buy 3 Get 1 Free** — add 4 combo items → cheapest one becomes free
- [ ] Buy 3 Get 1 Free hint appears at 2–3 combo items
- [ ] Coupon `WELCOME10` → 10% off (min Rs. 2,000)
- [ ] Coupon `LUXE500` → Rs. 500 off (min Rs. 4,000)
- [ ] Coupon `FREESHIP` → standard delivery becomes free
- [ ] Below-minimum coupon → clear error message with the exact shortfall
- [ ] Invalid coupon → error
- [ ] Remove coupon works
- [ ] Free-delivery meter fills and unlocks at Rs. 5,000
- [ ] WhatsApp button opens wa.me with the item list
- [ ] Cart page (`#/cart`) matches the drawer numbers

## 6 · Sign up

- [ ] `abc@gamil.com` → 🟡 "Did you mean abc@gmail.com?" + working **Yes, fix it**
- [ ] `abc@4proton#` → 🔴 invalid domain characters
- [ ] `abc@xyzqwe.com` → 🔴 recognised provider + chips
- [ ] `abc@mailinator.com` → 🔴 temporary emails not accepted
- [ ] `ab@gmail.com` → 🔴 Gmail needs ≥ 6 characters
- [ ] `ab_cd@gmail.com` → 🔴 Gmail doesn't allow underscores
- [ ] `v.i.mukthi@gmail.com` → 🟢 verified
- [ ] `vimukthi+shop@gmail.com` → 🟢 verified, tag ignored for sign-in
- [ ] Provider chips fill the domain
- [ ] Password checklist ticks live while typing
- [ ] Password strength meter moves Weak → Fair → Strong → Excellent
- [ ] `password` / `12345678` / `qwerty123` are rejected
- [ ] Password containing your name or email is rejected
- [ ] Mismatched confirm → inline error
- [ ] Unchecked terms → error
- [ ] Sign up → auto-signed-in → redirected to account
- [ ] Sign up again with `v.i.m.u.k.t.h.i@gmail.com` → 🔴 duplicate (canonical protection)

## 7 · Sign in / out

- [ ] Sign out → back to home
- [ ] Sign in with the same credentials works
- [ ] Remember me **on** → still signed in after reload
- [ ] Remember me **off** → session is shorter
- [ ] Wrong password ×1–4 → "Incorrect password. N attempts left."
- [ ] Wrong password ×5 → 🔒 "Too many attempts. Try again in 27s" with a live countdown
- [ ] Countdown reaches 0 → button re-enables
- [ ] Unknown email behaves identically (no account enumeration)
- [ ] Protected route (`#/account`) while signed out → redirect to `#/login`
- [ ] After signing in → returns to the original destination

## 8 · Forgot password

- [ ] Step 1: enter email → dev box shows the 6-digit code + **Autofill**
- [ ] Autofill fills the 6 boxes
- [ ] Boxes auto-advance, backspace goes back, paste works
- [ ] Countdown shows "Code expires in 5:00" and ticks down
- [ ] Wrong code → error with attempts left
- [ ] 5 wrong codes → "Please start again"
- [ ] Resend code generates a new one
- [ ] Step 3: weak password rejected, strength meter shows
- [ ] Reusing the old password rejected
- [ ] Success screen → Sign In with the new password works

## 9 · Address database

- [ ] District dropdown shows exactly **6** districts
- [ ] Selecting a district filters the city dropdown
- [ ] **Minuwangoda → 11550**
- [ ] **Kotte → Sri Jayawardenepura 10100 / Rajagiriya 10107 / Battaramulla 10120**
- [ ] **Weligama → Mirissa 81740 / Kamburugamuwa 81750**
- [ ] **Colombo North → Pettah 01100 / Kotahena 01300**
- [ ] **Yapahuwa → 60600** and shows the hint *"postal code 60600 (via Maho post office)"*
- [ ] Sub-area selection updates the ZIP
- [ ] ZIP is editable and validates to 5 digits
- [ ] Phone input: `0771234567` → `77 123 4567`
- [ ] `+94` prefix is locked and cannot be edited
- [ ] Phone must start with 7 and be 9 digits
- [ ] Country is locked to 🇱🇰 Sri Lanka
- [ ] Save address → appears in `#/addresses`
- [ ] Edit / Set default / Delete all work

## 10 · Checkout

- [ ] Contact pre-fills when signed in
- [ ] Saved addresses appear as selectable cards
- [ ] "Use a new address" reveals the full form
- [ ] District → city → sub-area cascade works
- [ ] ZIP auto-fills and shows the "via …" hint where relevant
- [ ] Standard vs Express changes the delivery fee live
- [ ] Standard is FREE at Rs. 5,000+
- [ ] Express gets Rs. 250 off at Rs. 5,000+
- [ ] COD adds Rs. 100
- [ ] ETA dates show and skip weekends
- [ ] Summary totals update live with every change
- [ ] Terms unchecked → error
- [ ] Missing name / email / phone / address → inline errors
- [ ] Guest checkout works without an account
- [ ] Place Order → goes to the payment page (card)

## 11 · Payment ★

- [ ] Page looks like Stripe Checkout (dark summary left, form right)
- [ ] Visa `4242…` → brand icon fades in, Luhn ✓
- [ ] `4242 4242 4242 4243` → 🔴 "Your card number is invalid."
- [ ] Incomplete number → 🔴 "Your card number is incomplete."
- [ ] `1234 5678 9012 3456` → 🔴 "We don’t support this card brand."
- [ ] Amex `3782 822463 10005` → 15 digits, grouping 4-6-5
- [ ] Amex → CVC label becomes **CID**, box accepts **4** digits
- [ ] Amex with 3 digits → 🔴 "American Express cards require a 4-digit security code."
- [ ] Diners `3056 9309 0259 04` → 14 digits
- [ ] Month `13` → 🔴 "Your card’s expiration month is invalid."
- [ ] Year in the past → 🔴 "Your card’s expiration year is in the past."
- [ ] Expiry auto-formats `1230` → `12 / 30` and auto-advances to CVC
- [ ] Empty cardholder → 🔴 "Enter the name on your card."
- [ ] Typing in an errored field **clears** the error immediately
- [ ] Error border is `#DF1B41` and the field shakes once
- [ ] Country 🇱🇰 is shown and locked; **no** address / city / ZIP fields exist
- [ ] Pay button is **disabled and greyed** until everything is valid
- [ ] Captcha: click → spinner → green tick
- [ ] Captcha: 2 minutes → auto-reset with "Verification expired…"
- [ ] Captcha: refresh icon resets manually
- [ ] Captcha: Privacy / Terms open a modal
- [ ] All valid + captcha → Pay button turns gold and enables
- [ ] Pay → 4 stages: Validating card… → Contacting bank… → Authorizing… → Confirming…
- [ ] Animated checkmark draws
- [ ] Redirects to the order confirmation page
- [ ] Luhn-valid card always succeeds (no decline path exists)
- [ ] Tick "Save my card" → appears in Settings → Saved Cards
- [ ] Saved card stores brand + last 4 only
- [ ] Saved card at checkout asks only for the CVC
- [ ] **DevTools → Application → Local Storage → no full card number anywhere**

## 12 · Cash on delivery

- [ ] Select COD → order confirms immediately
- [ ] Order status is `confirmed`, payment status `pending_cod`
- [ ] COD fee Rs. 100 appears in the totals
- [ ] Confirmation page shows "Cash on delivery"

## 13 · Post-order

- [ ] Confirmation shows the animated checkmark
- [ ] Order number format `LX-2026-00001`
- [ ] Delivery ETA strip shows dates
- [ ] Timeline shows every status with timestamps
- [ ] Tracking steps highlight the current stage
- [ ] Receipt totals match the checkout totals exactly
- [ ] Delivery address and contact are correct
- [ ] WhatsApp help link contains the order number
- [ ] `#/orders` lists the order
- [ ] Guest order shows "Create an account to track this order"

## 14 · Account

- [ ] Overview stats (orders, total spent, saved items, member since) are correct
- [ ] Default address card shows
- [ ] Recent orders list shows
- [ ] Orders page lists all orders
- [ ] Addresses CRUD + set default
- [ ] Settings → profile update works
- [ ] Settings → change password works and old password stops working
- [ ] Settings → saved cards list / set default / remove
- [ ] Settings → security info shows the real algorithm in use
- [ ] Export JSON downloads a backup file
- [ ] Reset all local data wipes everything

## 15 · Wishlist

- [ ] Heart toggles from the card, product page and quick-add
- [ ] Header badge count updates
- [ ] `#/wishlist` shows saved items
- [ ] Works while signed out
- [ ] Empty state shows

## 16 · Dev panel (`#/dev`)

- [ ] Footer `•` opens `#/dev`
- [ ] Runtime shows version, protocol, API mode, gateway, storage, crypto
- [ ] Storage meter shows real usage
- [ ] Data counts (users / orders / payments / products / divisions / sub-areas) are correct
- [ ] Export JSON copies + downloads
- [ ] Import JSON restores
- [ ] Reseed products resets the catalogue
- [ ] Reset all wipes everything
- [ ] Test cards copy on click
- [ ] "Autofill payment form" fills the pay page
- [ ] Toggles persist and actually change behaviour
- [ ] Validator playground: card → brand, length, Luhn, CVC required, grouping
- [ ] Validator playground: email → syntax, disposable, provider, canonical, display
- [ ] Validator playground: password → score + band
- [ ] Address lookup: `Minuwangoda` → `11550 · Gampaha · Zone 1`
- [ ] Delivery quote updates with district / method / COD
- [ ] Inspector shows real JSON for each key

## 17 · Polish & accessibility

- [ ] All drawers and modals close with ESC
- [ ] Body scroll locks behind overlays
- [ ] Focus rings are visible on keyboard navigation
- [ ] Tab order is logical on the payment form
- [ ] Images have alt text
- [ ] `prefers-reduced-motion` respected
- [ ] Product images fail gracefully to the SVG placeholder when offline
- [ ] **Zero console errors** on every page above

## 18 · Cross-platform

### Windows
- [ ] `start-server.bat` works with Python installed
- [ ] `start-server.bat` works with only Node.js installed
- [ ] `start-server.bat` opens `index.html` directly when neither exists
- [ ] `start-server.ps1` works
- [ ] Chrome and Edge both pass
- [ ] Ctrl+C stops the server cleanly

### Android (Termux)
- [ ] `python tools/serve.py` starts
- [ ] `http://localhost:8080` opens in Chrome
- [ ] All touch interactions work (no hover-only affordances)
- [ ] Bottom tab bar respects the safe area on a gesture-nav phone
- [ ] Landscape orientation does not break the layout

### `file://` fallback
- [ ] Double-clicking `index.html` renders the full site
- [ ] Hash routing works
- [ ] Warning appears in Settings about reduced hashing strength
- [ ] Full purchase flow completes end to end