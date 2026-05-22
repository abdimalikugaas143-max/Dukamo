# Manual Setup Walkthrough (Shopify admin)

These are the click-by-click steps for everything that would have been done
through the Shopify MCP. The store **cozy-cherny.myshopify.com** is already
provisioned — this doc takes it from "empty store" to "ready to take orders".

Source of truth for the copy/pricing is `product-spec.md`. When in doubt,
copy-paste from there.

---

## 1. Create the product

In the Shopify admin (left sidebar): **Products → Add product**.

| Field | Value (copy from `product-spec.md`) |
|---|---|
| Title | Rain Cloud Aroma Diffuser |
| Description | Paste the "Page copy" section from `product-spec.md` (hero subtitle + bullets + how it works + FAQ + trust badges). Use the rich-text editor's headings + bullet list. |
| Media | Upload the 8 images listed in `product-spec.md` in that order. Hero shot first. |
| Pricing → Price | **$49.99** |
| Pricing → Compare-at price | $79.99 |
| Pricing → Cost per item | $15.00 (so profit reporting works) |
| Pricing → Charge tax | ✅ on |
| Inventory → Track quantity | **off** (Zendrop owns inventory) |
| Inventory → Continue selling when out of stock | ✅ on |
| Inventory → SKU | leave blank for now (set per-variant in step below) |
| Shipping → This is a physical product | ✅ on |
| Shipping → Weight | 0.6 kg (placeholder; Zendrop overrides) |
| Variants → Add option | Option name: **Color** → Values: **White**, **Grey** |
| Variants → SKU per variant | White → `RC-DIFF-WHT`, Grey → `RC-DIFF-GRY` |
| Search engine listing → Title | Rain Cloud Aroma Diffuser — Real Rain Humidifier + Night Light |
| Search engine listing → Description | The viral cloud-shaped diffuser with real water-drip rain, 7 night lights, and essential-oil mist. Free US shipping, 5–9 day delivery. |
| Search engine listing → URL handle | `rain-cloud-aroma-diffuser` |
| Product organization → Product type | Home Fragrance |
| Product organization → Vendor | Cozy Cherny |
| Product organization → Tags | `rain-cloud, diffuser, humidifier, home-decor, bestseller, gift` |
| Status | **Active** |

Click **Save**.

---

## 2. Build the Bestsellers collection

**Products → Collections → Create collection**.

| Field | Value |
|---|---|
| Title | Bestsellers |
| Description | Our most-loved items. |
| Collection type | Manual |
| Products | Add the Rain Cloud Aroma Diffuser |
| Search engine listing → URL handle | `bestsellers` |

Save.

Then **Online Store → Themes → Customize**. On the homepage, edit the
**Featured collection** section → select **Bestsellers**. Save.

---

## 3. Theme polish (5 minutes)

**Online Store → Themes → Customize** on the live theme (default: Dawn).

- **Logo** — Upload a text logo for "Cozy Cherny" (Canva 1-minute job; transparent PNG, ~400x100).
- **Colors** — Background `#FAF7F2`, accent `#E8C9C0`, text `#1A2238`.
- **Header → Menu** — Verify the main nav has: Home / Shop / About / Contact.
- **Footer → Newsletter** — Enable, with subtitle "Get 10% off your first order".
- **Announcement bar** — Set to "Free US shipping · Ships in 5–9 days".

Save and preview on mobile (Shopify's customizer has a phone-view toggle).

---

## 4. Required pages

**Online Store → Pages → Add page** for each:

| Page title | Template | Body |
|---|---|---|
| About | Default page | "Cozy Cherny is a small home-decor brand making everyday moments feel calmer. Our Rain Cloud Aroma Diffuser is the centerpiece — real water, real rain, real calm." |
| Contact | **Contact** (has a form) | "We answer every email within 24 hours. Email: support@yourdomain.com" |

Then **Settings → Policies → Generate template** for each of:
- Refund policy
- Privacy policy
- Terms of service
- Shipping policy → **replace** the generated text with the override in `payments-and-policies.md`

Save.

**Online Store → Navigation → Footer menu** — add About, Contact, Refund
policy, Privacy policy, Terms of service, Shipping policy.

---

## 5. Payments

**Settings → Payments**.

- **Activate Shopify Payments** — fill in business + bank details. Once active,
  confirm Shop Pay, Apple Pay, Google Pay are all toggled on.
- Optional: **Activate PayPal**.
- Scroll down → **Deactivate** the test/Bogus gateway.

Detailed walkthrough in `payments-and-policies.md`.

---

## 6. Shipping

**Settings → Shipping and delivery**.

- Edit the default profile → **United States** zone → **Add rate** → **Free
  shipping**, conditions: none. Save.
- Delete the "Rest of world" zone (or set rates so high it's effectively off).

---

## 7. Install Zendrop

**Apps → Shopify App Store → search "Zendrop" → Install**.

From here, follow `zendrop-setup.md` exactly. The key moments:
- Sign up for the Free plan.
- Find a US-warehouse supplier for "rain cloud diffuser".
- Import → then **link to existing Shopify product** (don't create a duplicate).
- Settings → enable Auto-Fulfill + tracking sync.
- Top up the wallet with $200, enable auto-reload at $50.

---

## 8. Go-live

Walk `launch-checklist.md` top to bottom. The key gate is the **end-to-end
live test** — place one real $49.99 order from your phone, confirm Zendrop
auto-fulfills it within 5 min and tracking syncs back within 48 hrs, then
refund. Only after that passes should you drive any ad traffic.
