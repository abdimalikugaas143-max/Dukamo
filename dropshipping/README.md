# Dropshipping Store — Rain Cloud Aroma Diffuser

This folder documents the Shopify dropshipping store launched off this branch.
The storefront itself lives on Shopify's servers; nothing in this repo serves
customer traffic. These files exist so the configuration is reproducible and
auditable.

## What was launched

| Field | Value |
|---|---|
| Winning product | Rain Cloud Aroma Diffuser |
| Hero price | $49.99 (compare-at $79.99) |
| Storefront platform | Shopify (Basic plan) |
| Payments | Shopify Payments + Shop Pay + Apple/Google Pay |
| Fulfillment | Zendrop (auto-forward on paid) |
| Supplier shipping | US-based, 2–5 business days |
| Brand name | Cozy Cherny |
| Store domain | `cozy-cherny.myshopify.com` |
| Admin URL | https://admin.shopify.com/store/cozy-cherny |

## End-to-end flow

```
Customer  →  Shopify storefront  →  Shopify checkout (Shopify Payments)
                                              ↓ payment captured
                                Zendrop (auto-fulfill webhook)
                                              ↓
                              Zendrop's US supplier ships order
                                              ↓
                        Tracking number syncs back into Shopify
                                              ↓
                          Shopify emails customer the tracking
```

No custom server code sits in this loop — Shopify and Zendrop handle every step
once the configuration in these files is applied.

## Files in this folder

| File | Purpose |
|---|---|
| `product-spec.md` | Final product copy: title, price, description, bullets, FAQ, SEO |
| `store-config.md` | Brand name, theme, domain, palette, fonts |
| `manual-setup-walkthrough.md` | Click-by-click Shopify admin steps (start here) |
| `zendrop-setup.md` | Step-by-step Zendrop install + auto-fulfillment configuration |
| `payments-and-policies.md` | Shopify Payments activation + required policy pages |
| `launch-checklist.md` | Pre-launch QA: test order, tracking sync, mobile, speed |

## What to do next

Work through these in order. Each one points back to the specs above for the
exact text/values to use.

1. `manual-setup-walkthrough.md` — create the product, collection, pages, and
   theme polish in Shopify admin.
2. `zendrop-setup.md` — install Zendrop, link the supplier, enable auto-fulfill.
3. `payments-and-policies.md` — activate Shopify Payments + policy pages.
4. `launch-checklist.md` — run the end-to-end live test, then go live.
