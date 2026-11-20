// GET or POST /api/nr-checkout
// Creates a Stripe Checkout Session for NOBODY RUNS ($39) and redirects to it.
// Returns 503 { ok: false, reason: "not_configured" } until STRIPE_SECRET_KEY
// is set. This endpoint is the public "Buy with card" target so the old
// Payment Link (which has no gated delivery) is not used on the site.
//
// success_url: {origin}/nobody-runs-download.html?session_id={CHECKOUT_SESSION_ID}
// cancel_url:  {origin}/nobody-runs.html

import {
  buildCheckoutForm,
  cancelUrl,
  createCheckoutSession,
  metadataFromQuery,
  publicBase,
  successUrl,
} from './lib/nr-checkout.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD, POST');
    return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
  }

  const url = new URL(req.url || '', 'http://localhost');
  const base = publicBase(req);
  const form = buildCheckoutForm(process.env, {
    success: successUrl(base),
    cancel: cancelUrl(base),
    metadata: metadataFromQuery(url),
    clientReferenceId: String(url.searchParams.get('client_reference_id') || '').trim(),
  });

  const result = await createCheckoutSession(process.env, form);
  if (!result.ok) {
    return res.status(result.status).json({ ok: false, reason: result.reason });
  }

  res.setHeader('Location', result.url);
  return res.status(303).end();
}
