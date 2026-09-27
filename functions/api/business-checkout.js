// Cloudflare Pages Function: POST /api/business-checkout
const plans = {
  local: { variable: 'STRIPE_PRICE_LOCAL', price: 'price_1UJm7DCEDMxHVIYzB645A3KF', amount: 5000 },
  featured: { variable: 'STRIPE_PRICE_FEATURED', price: 'price_1UJm9BCEDMxHVIYzsFJSmDJU', amount: 10000 },
  spotlight: { variable: 'STRIPE_PRICE_SPOTLIGHT', price: 'price_1UJmAVCEDMxHVIYzxJz5zFVR', amount: 20000 },
};
const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
});
export async function onRequest({ request, env }) {
  if (request.method !== 'POST') return json({ error: 'Use POST.' }, 405);
  let domain;
  try {
    domain = new URL(env.DOMAIN || 'https://lastroundllc.com');
    if ((domain.protocol !== 'https:' && !(domain.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(domain.hostname))) || domain.username || domain.password) throw new Error();
  } catch { return json({ error: 'Checkout configuration needs attention.' }, 503); }
  if (request.headers.get('Origin') !== domain.origin) return json({ error: 'Open checkout from the Last Round website.' }, 403);
  if (!request.headers.get('Content-Type')?.includes('application/json')) return json({ error: 'Expected JSON.' }, 415);
  let input;
  try {
    const raw = await request.text();
    if (raw.length > 4096) return json({ error: 'Request is too large.' }, 413);
    input = JSON.parse(raw);
  } catch { return json({ error: 'Invalid request.' }, 400); }
  if (!input || typeof input.plan !== 'string' || !Object.hasOwn(plans, input.plan)) return json({ error: 'Choose a valid plan.' }, 400);
  const business = typeof input.business === 'string' ? input.business.trim() : '';
  const email = typeof input.email === 'string' ? input.email.trim() : '';
  if (!business || business.length > 100 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Enter your business name and a valid email.' }, 400);
  const plan = plans[input.plan];
  const priceId = env[plan.variable] || plan.price;
  if (!env.STRIPE_SECRET_KEY || !/^price_[A-Za-z0-9]+$/.test(priceId || '')) return json({ error: 'This plan is not ready for checkout yet. Please contact Last Round.' }, 503);
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` };
  try {
    // Check configured prices before charging: monthly USD and the advertised amount.
    const priceResponse = await fetch(`https://api.stripe.com/v1/prices/${encodeURIComponent(priceId)}`, { headers, signal: AbortSignal.timeout(8000) });
    const price = await priceResponse.json();
    if (!priceResponse.ok || !price.active || price.currency !== 'usd' || price.unit_amount !== plan.amount || price.recurring?.interval !== 'month' || price.recurring?.interval_count !== 1 || price.recurring?.usage_type !== 'licensed') return json({ error: 'This plan’s billing configuration needs attention. Please contact Last Round.' }, 503);
    const body = new URLSearchParams({
      mode: 'subscription', ui_mode: 'hosted',
      success_url: `${domain.origin}/?business_checkout=returned&session_id={CHECKOUT_SESSION_ID}#businesses`,
      cancel_url: `${domain.origin}/?business_checkout=canceled#businesses`,
      'line_items[0][price]': priceId, 'line_items[0][quantity]': '1',
      customer_email: email, billing_address_collection: 'auto',
      'phone_number_collection[enabled]': 'false', 'automatic_tax[enabled]': 'false',
      allow_promotion_codes: 'false',
      'metadata[plan]': input.plan, 'metadata[business_name]': business,
      'subscription_data[metadata][plan]': input.plan,
      'subscription_data[metadata][business_name]': business,
    });
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/x-www-form-urlencoded' },
      body, signal: AbortSignal.timeout(15000),
    });
    const session = await response.json();
    if (!response.ok || !session.url) return json({ error: 'Unable to open Stripe checkout. Please try again later.' }, 502);
    const url = new URL(session.url);
    if (url.protocol !== 'https:' || url.hostname !== 'checkout.stripe.com') throw new Error('Invalid checkout URL');
    return json({ url: url.href });
  } catch { return json({ error: 'Payment service is temporarily unavailable. Please try again.' }, 502); }
}