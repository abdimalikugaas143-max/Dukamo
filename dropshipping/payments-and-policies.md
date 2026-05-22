# Payments & Policies

Payments and legal pages are the two things Shopify won't let you skip — the
checkout literally won't open to the public without them. Both are quick.

## Payment providers

In Shopify admin: **Settings → Payments**.

### 1. Shopify Payments (primary)

Activates Visa, Mastercard, Amex, Discover, Shop Pay, Apple Pay, Google Pay all
at once. Lowest fees, fastest payout (2 business days in the US).

You'll need:
- Legal business name (or your full name if sole proprietor)
- Business address
- EIN or SSN (US)
- Bank account routing + account number for payouts

Click **Activate Shopify Payments** → fill the form → wait ~5 minutes for
Shopify to confirm.

Once active, also confirm these are enabled inside Shopify Payments:
- ✅ Shop Pay (Shopify's one-tap accelerated checkout — ~20% conversion lift)
- ✅ Apple Pay
- ✅ Google Pay

### 2. PayPal (secondary, optional but recommended)

Older buyers and gift-shoppers still default to PayPal. Adding it is two
clicks.

- Settings → Payments → **PayPal** → **Activate** → sign in.

### 3. Disable the test gateway BEFORE going live

Settings → Payments → scroll to bottom → **Manage** Bogus / Test gateway →
**Deactivate**. Forgetting this means real customers can checkout with fake
cards.

## Required policy pages

Shopify auto-generates templates that are good enough for a US dropshipping
store. **Settings → Policies → Generate template** for each, then tweak the
shipping policy as below.

| Policy | Template? | Tweak |
|---|---|---|
| Refund policy | ✅ Use template as-is | none |
| Privacy policy | ✅ Use template as-is | none |
| Terms of service | ✅ Use template as-is | none |
| Shipping policy | ⚠️ Override | See block below |
| Contact information | n/a | Create a `/pages/contact` page with email + form |

### Shipping policy override

Paste this into the shipping policy editor (replace the generated one):

> **Shipping policy**
>
> We ship from our US warehouse. All US orders ship **free** with tracked
> delivery in **5–9 business days**.
>
> You'll receive a confirmation email with tracking as soon as your order
> ships, usually within 1–3 business days of purchase.
>
> Orders are processed Monday–Friday. Orders placed on weekends or holidays
> ship the next business day.
>
> Lost or stuck in transit? Email us at [support@yourdomain.com] and we'll
> resend or refund — your call.

## Contact page

Settings → Pages → **Add page** → title "Contact" → use the **"Contact"**
template (it includes a form). Page body:

> We answer every email within 24 hours.
>
> **Email:** support@yourdomain.com

Link this page in the footer navigation.

## Tax

Settings → Taxes and duties → **United States** → let Shopify auto-calculate.
You don't need to register for sales tax in any state until you cross that
state's nexus threshold (usually $100K/yr or 200 orders). Shopify will warn
you when you're approaching one.

## Notification emails (one quick polish)

Settings → Notifications → **Order confirmation** and **Shipping
confirmation** → swap the default Shopify logo for the store logo (uploaded
during theme setup). This makes the post-purchase emails look branded, which
reduces "is this a scam?" support tickets.
