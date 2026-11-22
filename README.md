# 🏛️ LUXE INTIMO

**Premium innerwear e-commerce storefront — Sri Lanka.**
Dark-luxury design · women + men · 28 products · full order flow · card payment with a real Luhn validator · fake reCAPTCHA · local accounts.

> **This is a demonstration build.** There is no server, no real payment and no real business.
> Everything (accounts, orders, saved cards) lives in your own browser's local storage.

---

## ⚡ Quick Start

### 🪟 Windows PC (recommended)

**Double-click `start-server.bat`.** That's it.

It will find Python (or Node.js), start the site on `http://localhost:8080` and open your browser automatically.

> Alternative: right-click `start-server.ps1` → **Run with PowerShell**
> (if Windows blocks it: `powershell -ExecutionPolicy Bypass -File .\start-server.ps1`)

### 📱 Android (Termux)

```bash
pkg update && pkg install python -y
termux-setup-storage
cp -r LuxeIntimo ~/storage/shared/LuxeIntimo
cd ~/storage/shared/LuxeIntimo
python tools/serve.py          # → http://localhost:8080
```

Then open **`http://localhost:8080`** in Chrome.

### 🐧 Linux / macOS

```bash
./start-server.sh              # or: python3 tools/serve.py
```

### 📂 No Python or Node at all?

Just double-click **`index.html`**. Everything still works — but password hashing falls back to a
reduced-strength method and local storage can be less reliable. Running over `http://localhost` is
always better.

---

## 🧭 First things to try

| What | Where |
|---|---|
| Browse the catalogue | `#/shop` — filter by category, size, colour, price |
| See the payment system | Add to bag → checkout → pay with `4242 4242 4242 4242` |
| See the Luhn engine | `#/dev` → **Validator playground** (try `4242 4242 4242 4243`) |
| See email validation | `#/signup` → type `abc@gamil.com` (typo fix) or `ab_cd@gmail.com` (rejected) |
| See the address database | `#/dev` → **Address lookup** (try `Minuwangoda`) |
| Developer tools | Footer → small **`•`** button, or `#/dev` |

### 💳 Test cards (all Luhn-valid)

| Brand | Number | Security code |
|---|---|---|
| Visa | `4242 4242 4242 4242` | `123` |
| Visa Debit | `4000 0566 5566 5556` | `123` |
| Mastercard | `5555 5555 5555 4444` | `123` |
| Mastercard (2-series) | `2223 0031 2200 3222` | `123` |
| **Amex** | `3782 822463 10005` | **`1234`** (4 digits) |
| Amex 2 | `3714 496353 98431` | `1234` |
| Discover | `6011 1111 1111 1117` | `123` |
| JCB | `3530 1113 3330 0000` | `123` |
| Diners | `3056 9309 0259 04` | `123` |

Expiry: any future date, e.g. `12 / 30`.
**A card that passes the Luhn check always succeeds** — there are no decline scenarios.

### 🎟️ Coupons

`WELCOME10` (10% off, min Rs. 2,000) · `LUXE500` (Rs. 500 off, min Rs. 4,000) · `FREESHIP` (free standard delivery)

---

## 🗂️ Project Structure

```
LuxeIntimo/
├── index.html                 App shell (header, footer, overlays, script order)
├── start-server.bat           🪟 Windows — double-click launcher
├── start-server.ps1           🪟 Windows — PowerShell launcher
├── start-server.sh            📱 Termux / Linux launcher
├── tools/
│   ├── serve.py               Static server (Python, zero deps)
│   └── serve.js               Static server (Node, zero deps)
├── assets/
│   ├── css/                   tokens · base · components · pages · auth · checkout · payment
│   └── js/
│       ├── core/              utils · db · store · validators · api · router · cardvalidator
│       ├── data/              sri-lanka · products · email-domains
│       ├── services/          cart · auth · order · payment
│       ├── ui/                shell · captcha · cardform
│       ├── pages/             home · shop · product · cart · auth · account · checkout · pay · order · dev
│       └── app.js             Boot
└── docs/
    ├── MIGRATION.md           How to move to a real backend + real payment gateway
    └── QA-CHECKLIST.md        Full manual test checklist
```

**Script load order is fixed** (see the bottom of `index.html`):
`utils → db → store → sri-lanka → products → email-domains → validators → api → cart → auth → order → payment → cardvalidator → router → shell → captcha → cardform → pages/* → app.js`

---

## 🧱 Architecture

> **"A real backend — inside the browser."**

```
┌─────────────────────────────────────────────┐
│  UI LAYER      pages, components, shell     │
├─────────────────────────────────────────────┤
│  SERVICE LAYER auth · cart · order · payment│
├─────────────────────────────────────────────┤
│  API CONTRACT  LX.Api.*  ← ★ swap point ★   │
├──────────────────┬──────────────────────────┤
│  MockGateway     │  StripeGateway (future)  │
│  (now)           │  PayHereGateway (future) │
├──────────────────┴──────────────────────────┤
│  DB LAYER  localStorage (+ memory fallback) │
└─────────────────────────────────────────────┘
```

To point at a real server later, change **two lines** in `assets/js/core/api.js`:

```js
USE_MOCK: false,
BASE_URL: 'https://api.luxeintimo.lk/v1',
```

No UI file changes. See `docs/MIGRATION.md`.

---

## ✅ What is implemented

**Design** — dark luxury theme only, Cormorant Garamond + Manrope, restrained gold accents,
glass header with scroll shrink, Ken Burns hero, product-card image cross-fade, shimmer skeleton
loaders, toasts, empty states, free-delivery meter, `prefers-reduced-motion` support,
mobile tab bar with safe-area insets.

**Catalogue** — 28 products (Women 12 / Men 10 / Combos 6), grid + list view, filters
(category, size, colour, price), 7 sort modes, pagination, product gallery with thumbs and zoom,
size guide, reviews, quick-add, wishlist (works signed-out too), related products.

**Cart & pricing** — locked calculation order:
`subtotal → Buy 3 Get 1 Free (combo items) → coupon → delivery zone quote → COD fee → total`.
All money is stored as **integer cents** — no floating-point rupees anywhere.
Stock validation runs before every order.

**Auth** — PBKDF2-SHA256 (100,000 iterations, 16-byte random salt) with an iterated SHA-256
fallback for `file://`. 6-step email pipeline (syntax → disposable block → typo fix → whitelist →
provider rules → canonicalise). Password rules + live strength meter + common-password blocklist.
Rate limiting (5 wrong attempts → 30-second lockout with live countdown). 3-step forgot-password
wizard with a dummy OTP. Sessions last 7 days ("remember me") or 1 day. Protected routes redirect
back to where you were going.

**Address database** — 6 districts → **67 polling divisions** (Election Commission of Sri Lanka,
Notice u/s 9(3)) → 300+ sub-areas with postal codes (Sri Lanka Post). District → city → sub-area
cascades and auto-fills the ZIP. Yapahuwa shows the honest *"postal code 60600 (via Maho post
office)"* hint. Phone is `+94` locked and must be 9 digits starting with 7.

**Payment** — brand detection → length check → **standard Luhn checksum** → expiry + CVC length.
Amex gets a 4-digit **CID** (label and box width animate to match); everything else gets 3 digits.
Errors are Stripe's exact wording, in `#DF1B41`, with a shake that clears as you type. The Pay
button stays disabled until every field is valid **and** the captcha is ticked. A 4-stage processing
sequence runs before the animated checkmark. Card numbers and security codes are **never stored** —
only the brand, last 4 digits and expiry (and only if you tick "save my card").

**Fake reCAPTCHA** — 302×74 pixel-accurate replica with the checkbox, spinner, stroke-draw tick,
2-minute expiry and refresh. Swap `LX.Config.CAPTCHA_BRAND = 'generic'` for a neutral mark before
any public deployment.

**Orders** — order numbers `LX-2026-00042`, status timeline, tracking steps, receipt, guest
checkout, order history, WhatsApp order link.

**Dev panel (`#/dev`)** — runtime diagnostics, data stats, JSON export/import/reset/reseed,
one-click test cards with autofill, toggles (instant payment, skip captcha, slow network,
validation debug), a **validator playground** for the card/email/password engines, address lookup,
delivery quote and a JSON inspector.

---

## 💾 Your data

Everything is stored under the `luxe_intimo_v1:` prefix in your browser's local storage.

- **Settings → Export JSON backup** saves everything to a file.
- **Settings → Reset all local data** wipes it.
- Clearing your browser data deletes it. There is no cloud copy — by design.

---

## ⚠️ Things worth knowing

| | |
|---|---|
| **No real payment is taken** | The gateway is a mock. Luhn-valid cards always succeed. |
| **No shared database** | Each browser/device has its own isolated data. |
| **localStorage limit** | ~5 MB. Product images are remote URLs to stay well inside it. |
| **Images need internet** | Product photos load from Unsplash; if offline you get an elegant SVG placeholder. |
| **`file://` mode** | Works, but WebCrypto is unavailable so password hashing is weaker. Prefer localhost. |
| **Google mark** | The reCAPTCHA look-alike is for local testing only. Use `CAPTCHA_BRAND = 'generic'` if you ever host this publicly. |
| **Email rules are strict by design** | The blueprint locks provider rules: Gmail needs **6–30 characters** before the `@`, letters and numbers only (no underscores), starting with a letter. So `hello@gmail.com` is rejected while `username@gmail.com` passes. This is intentional — test it in `#/dev` → Validator playground. |
| **Real launch = PayHere / WebxPay** | Stripe does not support LKR. The gateway abstraction is already currency-flexible. |
| **If a change doesn’t show up, bump the cache version** | Every asset URL in `index.html` carries `?v=1.3.0`. Browsers cache CSS/JS hard, so after editing any asset change that number (e.g. to `?v=1.4.0`) and refresh. The bundled dev server also sends `Cache-Control: no-store`, so `start-server.bat` users normally don’t need this. |

---

## 📖 Docs

- `docs/QA-CHECKLIST.md` — step-by-step manual test script covering every feature
- `docs/MIGRATION.md` — how to swap in a real backend and a real payment gateway

---

Made in Sri Lanka 🇱🇰 · Demo build · v1.0