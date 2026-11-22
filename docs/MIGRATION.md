# Migration Guide — mock → real

The whole app is built behind one contract so that going live never touches the UI.

## 1. Point at a real server

`assets/js/core/api.js` → `LX.Config`:

```js
USE_MOCK: false,
BASE_URL: 'https://api.luxeintimo.lk/v1',
```

Every service call already goes through `LX.Api.*`, so nothing in `assets/js/pages/` or
`assets/js/ui/` changes. Not one character.

## 2. Endpoints your backend must expose

| Method | Path | Used by |
|---|---|---|
| `POST` | `/auth/register` | `LX.Api.auth.register` |
| `POST` | `/auth/login` | `LX.Api.auth.login` |
| `GET`  | `/auth/me` | `LX.Api.auth.me` |
| `POST` | `/auth/logout` | `LX.Api.auth.logout` |
| `POST` | `/auth/password/forgot` | `LX.Api.auth.requestReset` |
| `POST` | `/auth/password/verify` | `LX.Api.auth.verifyOtp` |
| `POST` | `/auth/password/reset` | `LX.Api.auth.resetPassword` |
| `GET`  | `/products` | `LX.Api.products.list` |
| `GET`  | `/products/:slug` | `LX.Api.products.get` |
| `GET`  | `/products/:id/reviews` | `LX.Api.products.reviews` |
| `POST` | `/orders` | `LX.Api.orders.create` |
| `GET`  | `/orders` | `LX.Api.orders.list` |
| `GET`  | `/orders/:id` | `LX.Api.orders.get` |
| `POST` | `/orders/:id/pay` | `LX.Api.orders.markPaid` |
| `POST` | `/payment_intents` | `LX.Api.gateway.createIntent` |
| `POST` | `/payment_methods` | `LX.Api.gateway.tokenize` |
| `POST` | `/payment_intents/:id/confirm` | `LX.Api.gateway.confirm` |
| `POST` | `/refunds` | `LX.Api.gateway.refund` |

## 3. Database schema

The exact tables are already defined in the blueprint (§7.2). Copy them straight into
PostgreSQL / MySQL:

`users` · `addresses` · `products` · `product_variants` · `reviews` · `orders` · `order_items` ·
`payments` · `coupons`

**Money rule:** every amount is an **integer in cents**. Rs. 2,990 → `299000`. Never use floats.

## 4. Swap the payment gateway

`LX.Api.gateway` is the contract. Implement the same four methods:

```js
LX.Api.gateway = {
  createIntent(amount, currency, meta)      // → { id, amount, currency, status, clientSecret }
  tokenize(card)                             // → { token, brand, last4, expMonth, expYear }
  confirm(intentId, paymentMethod)           // → { id, status: 'succeeded', paidAt }
  refund(paymentId)                          // → { id, status: 'succeeded' }
};
```

`tokenize` must **never** return the PAN or CVC. Today it is `MockGateway` in
`assets/js/services/payment.js`; tomorrow it is `StripeGateway` or `PayHereGateway`.

### ⚠️ LKR and Stripe

**Stripe does not support LKR.** For a real Sri Lankan launch:

| Gateway | LKR | Notes |
|---|---|---|
| **PayHere** 🇱🇰 | ✅ | Most widely used locally |
| **WebxPay** 🇱🇰 | ✅ | Good alternative |
| **Stripe** | ❌ | Needs USD conversion or a foreign entity |

Keep the Stripe-style **interface** and swap the backend to PayHere. The currency handling in the
gateway contract is already flexible.

## 5. PCI compliance

Right now the card form is our own JavaScript and only the brand + last 4 ever reach storage.

When you go live, replace `assets/js/ui/cardform.js` with a hosted field:

- **Stripe** → `Stripe Elements` (iframe)
- **PayHere** → their hosted payment page / iframe

The form is deliberately isolated in its own module so it can be replaced without touching
`paypage.js`. The full card number then never reaches your server.

## 6. Real email

Replace the dummy OTP in `LX.Auth.requestReset` with a transactional email call
(Postmark, Resend, AWS SES, Mailgun). The UI flow does not change.

## 7. Replacing localStorage

`assets/js/core/db.js` is the only module that touches storage. Implement the same
`get / set / remove / keys / clearAll / exportJSON / importJSON` surface against IndexedDB,
a remote API or a service worker cache, and everything above keeps working.

## 8. Offline / PWA (optional)

Because the site is already served over `http://localhost`, adding a service worker is safe:
register it from `app.js`, cache `index.html` + `assets/**`, and fall back to the cache when
offline. Product images stay remote.

## 9. Before you ever host this publicly

- Set `LX.Config.CAPTCHA_BRAND = 'generic'` (the reCAPTCHA look-alike is a trademark).
- Remove the `#/dev` route and the footer `•` button.
- Move all pricing/product data server-side and re-validate totals there.
- Add CSRF tokens and HTTP-only session cookies.