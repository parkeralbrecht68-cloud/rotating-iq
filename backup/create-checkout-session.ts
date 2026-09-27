import type { APIRoute } from "astro";
import Stripe from "stripe";

export const prerender = false;

const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || "", {
  apiVersion: undefined,
});

export const POST: APIRoute = async ({ request }) => {
  let body: Record<string, unknown> = {};

  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    body = {};
  }

  const mode = "payment";

  const sessionParams = {
    ui_mode: "hosted_page",
    mode,
    billing_address_collection: "auto",
    phone_number_collection: { enabled: false },
    automatic_tax: { enabled: false },
    allow_promotion_codes: false,
    submit_type: "auto",
    integration_identifier: "hosted_mobile_app_0001",
    origin_context: "mobile_app",
    success_url: `${import.meta.env.DOMAIN || "http://localhost:4321"}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${import.meta.env.DOMAIN || "http://localhost:4321"}/cancel`,
    line_items: [{ price: "price_...", quantity: 1 }],
  };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return new Response(JSON.stringify({ url: session.url }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
};
