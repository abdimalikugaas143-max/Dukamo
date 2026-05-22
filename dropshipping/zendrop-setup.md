# Zendrop Setup — Auto-Fulfill Paid Orders

Zendrop is the dropshipping layer. Once configured, every paid order on the
Shopify storefront is automatically placed with a US-based supplier without
human action, and the tracking number is written back to Shopify.

## Why Zendrop (vs alternatives)

- **US warehouse** — 2–5 day shipping vs 2–4 weeks for AliExpress.
- **Native Shopify app** — no API keys, no glue code.
- **Auto-fulfill on payment capture** — single toggle, no Zapier required.
- **Tracking sync back to Shopify** — Shopify emails the customer automatically.
- **Free tier** is enough until you're doing real volume.

## One-time install

1. In Shopify admin: **Apps** → search **Zendrop** → **Install**.
2. Accept the OAuth permission scopes.
3. On the Zendrop signup screen, pick the **Free** plan.
4. Zendrop drops you in its dashboard — leave it open for the next steps.

## Source the product

1. In Zendrop: **Find Products** → search **"rain cloud diffuser"**.
2. Filter: **Warehouse = USA**, sort by **Most Ordered**.
3. Pick a supplier with:
   - 4.5+ supplier rating
   - <2% defect rate
   - "Verified" badge
   - Cost ~$12–$18 (we sell at $49.99 → ~$30–35 margin pre-ad spend)
4. Click **Import to Store** → choose the storefront.

## Link Zendrop's product to YOUR Shopify product

Zendrop will, by default, create a NEW product in Shopify. We don't want that —
we want to keep the copy and pricing we already set. Re-link instead:

1. After import, open **Products** in Zendrop.
2. Find the just-imported product → **⋯** → **Link to existing Shopify product**.
3. Pick the Rain Cloud Aroma Diffuser we already created.
4. Match each Zendrop variant (White, Grey) to the Shopify variant of the same
   color.
5. Delete the duplicate Shopify product Zendrop created on import.

End state: one Shopify product, our copy/pricing/images, with Zendrop's
supplier wired up underneath each variant.

## Enable auto-fulfillment

In Zendrop: **Settings** → **Fulfillment**:

- ✅ **Auto-fulfill paid orders** — "Automatically place supplier orders when
  the Shopify order is paid."
- ✅ **Auto-sync tracking** — "Write supplier tracking numbers back to Shopify
  and mark the line items as fulfilled."
- ✅ **Auto-email tracking to customer** — Shopify handles this when the
  fulfillment is marked complete.
- ❌ **Auto-process refunds** — leave off. Handle refunds manually so a hostile
  customer can't trigger one before the supplier ships.

## Top up the Zendrop wallet

Zendrop charges the supplier cost from a prepaid wallet, not your bank on each
order — this avoids declined cards mid-fulfillment.

- Settings → Wallet → **Add funds** → start with **$200**. That covers ~13
  orders at $15 cost. Top up when it drops below $50.
- Enable **Auto-reload** when balance < $50, reload $200.

## Confirm the wiring

Run this one test before driving traffic (also in `launch-checklist.md`):

1. Place a real test order on the live storefront for $49.99.
2. Within 5 minutes, Zendrop's **Orders** tab should show the order as
   **Auto-Fulfilled**, status **Awaiting Shipment**.
3. Within 24–48 hours, the order in Shopify admin should show a tracking
   number and the customer should have received a "Your order is on its way"
   email automatically.
4. If you want to abort the test before it ships: in Zendrop, **Cancel order**
   within the cancellation window (usually 12 hours), then refund the
   customer in Shopify.

If step 2 doesn't happen, the most common cause is: auto-fulfill was not
enabled, the Zendrop wallet had insufficient balance, or the variant was not
correctly linked. Re-run the link step above.
