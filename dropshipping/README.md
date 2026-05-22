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
| Brand name | _filled in after preview selection — see `store-config.md`_ |
| Store domain | _filled in after preview selection — see `store-config.md`_ |

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
| `store-config.md` | Brand name, theme, domain, palette, fonts (filled after preview pick) |
| `zendrop-setup.md` | Step-by-step Zendrop install + auto-fulfillment configuration |
| `payments-and-policies.md` | Shopify Payments activation + required policy pages |
| `launch-checklist.md` | Pre-launch QA: test order, tracking sync, mobile, speed |

## What to do next

1. Open the Shopify preview links surfaced by the assistant.
2. Pick a theme + brand name you like.
3. Click the preview's signup link — this provisions the real store.
4. Fill in `store-config.md` with the chosen brand name and domain.
5. Follow `zendrop-setup.md` to install Zendrop and enable auto-fulfillment.
6. Follow `payments-and-policies.md` to activate Shopify Payments and policies.
7. Run `launch-checklist.md` end-to-end before driving any ad traffic.
