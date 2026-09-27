## Values to Replace

The following values are placeholders and must be updated before going live.

**Files containing placeholders:**
- [src/pages/api/create-checkout-session.ts](src/pages/api/create-checkout-session.ts)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Set to "payment" for one-time charges or "subscription" for recurring billing. |
| success_url | http://localhost:4321/success?session_id={CHECKOUT_SESSION_ID} | Your actual post-payment success page URL. Keep the {CHECKOUT_SESSION_ID} template. |
| cancel_url | http://localhost:4321/cancel | Your actual cancel/return page URL. |
| line_items[].price | price_... | Your actual Stripe Price ID from the Dashboard (https://dashboard.stripe.com/prices) or API. |

## Configured Parameters

These parameters were configured in Checkout Studio and are already set correctly.

**Files containing these parameters:**
- [src/pages/api/create-checkout-session.ts](src/pages/api/create-checkout-session.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | hosted_page (use `hosted` for Stripe SDK versions below 21.0.0) |
| billing_address_collection | auto |
| phone_number_collection.enabled | false |
| automatic_tax.enabled | false |
| allow_promotion_codes | false |
| submit_type | auto |
| integration_identifier | hosted_mobile_app_0001 |
| origin_context | mobile_app |

## Setup and Next Steps

- Add your Stripe secrets to your environment variables before deploying: `STRIPE_SECRET_KEY` and `DOMAIN`.
- If you are using a browser-facing public key elsewhere, keep it prefixed with `VITE_` when exposed in front-end code, but do not expose the secret key.
- Stripe SDK version note: use `ui_mode: "hosted_page"` for SDK 21.0.0+; use `"hosted"` for SDK versions below 21.0.0. This project did not declare a Stripe SDK version, so the default `hosted_page` value is currently in use.
- Install the Stripe SDK dependency in your project: `npm install stripe`.
- Create a real success/cancel page in your app and replace the placeholder URLs in the checkout session.
- Replace the `line_items` price with a real Stripe Price ID from your dashboard or API.
- Test the checkout flow in Stripe test mode using test card numbers, then switch to live mode when ready.
- Review your order fulfillment flow, inventory, and customer confirmations after checkout completes.

### Project structure

- [src/pages/api/create-checkout-session.ts](src/pages/api/create-checkout-session.ts) — minimal Stripe Checkout Session endpoint

### How the integration works

1. The app receives a POST request to the checkout endpoint.
2. The server creates a Stripe Checkout Session using the configured Hosted Checkout parameters.
3. Stripe returns a Checkout URL for the customer.
4. The browser redirects to that hosted payment page.

### Testing

- Use Stripe test mode and the official test card numbers from the Stripe docs.
- Confirm the flow with a successful payment and a canceled checkout.
- Check your Stripe Dashboard for completed Checkout Session events and webhook logs.

### Next steps

- Set up real product/price records in Stripe.
- Add fulfillment, order tracking, and post-payment messaging.
- Add webhook handling if you need to sync purchase status with your backend or database.

### Resources

- https://support.stripe.com
- https://docs.stripe.com/mcp
- https://dashboard.stripe.com
