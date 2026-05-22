# Launch Checklist

Walk this top-to-bottom before driving any paid ad traffic. Each item is a
hard gate — if it fails, do not send traffic.

## Pre-flight (Shopify + Zendrop config)

- [ ] Brand name and `.myshopify.com` domain recorded in `store-config.md`
- [ ] Custom domain purchased and pointed (DNS may take 30 min – 2 hrs)
- [ ] Product live at `/products/rain-cloud-aroma-diffuser` with $49.99 price
- [ ] Both color variants exist (White, Grey) with matching SKUs
- [ ] Compare-at price ($79.99) shows strike-through on the product page
- [ ] At least 6 product images uploaded, hero is the rain-drip white shot
- [ ] "Bestsellers" collection created and set as homepage featured collection
- [ ] All 4 policy pages published (refund, privacy, terms, shipping)
- [ ] Contact page published with email + form, linked in footer
- [ ] Shopify Payments activated (Shop Pay, Apple Pay, Google Pay enabled)
- [ ] PayPal activated (optional but recommended)
- [ ] Test / Bogus gateway **deactivated**
- [ ] Zendrop installed, product linked, auto-fulfill **ON**, tracking sync **ON**
- [ ] Zendrop wallet topped up to $200, auto-reload enabled

## End-to-end live test

This is the only test that proves "visitor pays → supplier ships" actually
works. Do it once, real money, then refund.

1. [ ] On a phone (different IP / not logged into Shopify admin), open the
       storefront, add the diffuser to cart, check out for **$49.99** with a
       real card.
2. [ ] Shopify order appears in admin within seconds, status **Paid**.
3. [ ] Within 5 minutes, Zendrop **Orders** tab shows the order as
       **Auto-Fulfilled**, status **Awaiting Shipment**.
4. [ ] Within 24–48 hrs, Shopify order shows a tracking number on the line
       item, status flips to **Fulfilled**.
5. [ ] You (as the customer) receive Shopify's "Your order is on its way"
       email with the tracking link.
6. [ ] **Cancel** in Zendrop within the cancellation window, then **Refund**
       in Shopify — confirm both reflect refunded.

If any of 1–5 fails, the loop is broken — do **not** open the store to the
public until it's fixed. See troubleshooting at the bottom of
`zendrop-setup.md`.

## Polish (do before paid ads, not before launch)

- [ ] Mobile checkout tested on iOS Safari + Android Chrome (real devices)
- [ ] Page speed under 3s on mobile (PageSpeed Insights → mobile)
- [ ] Favicon set in theme settings
- [ ] Social share image (Open Graph) set in Settings → Preferences
- [ ] Email + SMS marketing consent at checkout enabled
- [ ] Abandoned-checkout email automation enabled (Settings → Notifications →
      Abandoned checkout email → ON, send after 1 hour)
- [ ] Shopify Inbox app installed for live chat (free)
- [ ] At least 5 reviews on the product page (import via Zendrop or use
      Shopify's free Product Reviews app)

## Day-one monitoring

- [ ] Watch Zendrop Orders tab for the first 5 real orders. Confirm each one
      auto-fulfills within 5 min and gets tracking within 48 hrs.
- [ ] Set a Zendrop wallet low-balance email alert at $50.
- [ ] Set Shopify's "Order placed" notification to your phone so you see new
      orders in real-time the first week.
