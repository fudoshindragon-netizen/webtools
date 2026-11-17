// Shared helpers for GET /api/nr-download.
// Env names only (values never logged):
//   STRIPE_SECRET_KEY          required to verify a Checkout Session
//   NR_STRIPE_PRICE_ID         optional; if set, a line item must use this price
//   NR_STRIPE_PRODUCT_ID       optional; if set, a line item must use this product
//   NR_STRIPE_PAYMENT_LINK_ID  optional; if set, session.payment_link must match
//   NR_STRIPE_AMOUNT_CENTS     fallback amount check if price/product unset (default 3900)
//   NR_STRIPE_CURRENCY         fallback currency check (default usd)

import fs from 'node:fs';
import path from 'node:path';

export const SESSION_ID_RE = /^cs_(test|live)_[A-Za-z0-9]+$/;
export const DOWNLOAD_FILENAME = 'nobody-runs-v1.0.zip';
export const ZIP_CANDIDATES = [
  'private/nr90d-axo6m5bcfa1j.zip',
  'private/nobody-runs-v1.0.zip',
];

export function getStripeKey(env = process.env) {
  return String(env.STRIPE_SECRET_KEY || '').trim();
}

export function readSessionId(req) {
  const url = new URL(req.url || '', 'http://localhost');
  return String(url.searchParams.get('session_id') || '').trim();
}

function lineItemPriceId(item) {
  const price = item && item.price;
  if (typeof price === 'string') return price;
  if (price && typeof price.id === 'string') return price.id;
  return '';
}

function lineItemProductId(item) {
  const price = item && item.price;
  if (!price || typeof price === 'string') return '';
  const product = price.product;
  if (typeof product === 'string') return product;
  if (product && typeof product.id === 'string') return product.id;
  return '';
}

function paymentLinkIdOf(session) {
  const pl = session && session.payment_link;
  if (typeof pl === 'string') return pl;
  if (pl && typeof pl.id === 'string') return pl.id;
  return '';
}

export function evaluateSession(session, env = process.env) {
  if (!session || session.object !== 'checkout.session') {
    return { ok: false, status: 403, reason: 'invalid_session' };
  }
  if (session.payment_status !== 'paid') {
    return { ok: false, status: 403, reason: 'unpaid' };
  }

  const priceId = String(env.NR_STRIPE_PRICE_ID || '').trim();
  const productId = String(env.NR_STRIPE_PRODUCT_ID || '').trim();
  const paymentLinkId = String(env.NR_STRIPE_PAYMENT_LINK_ID || '').trim();
  const expectedAmount = String(env.NR_STRIPE_AMOUNT_CENTS || '3900').trim();
  const expectedCurrency = String(env.NR_STRIPE_CURRENCY || 'usd').trim().toLowerCase();

  if (paymentLinkId && paymentLinkIdOf(session) !== paymentLinkId) {
    return { ok: false, status: 403, reason: 'wrong_payment_link' };
  }

  const items = (session.line_items && session.line_items.data) || [];
  if (priceId || productId) {
    const match = items.some((item) => {
      if (priceId && lineItemPriceId(item) === priceId) return true;
      if (productId && lineItemProductId(item) === productId) return true;
      return false;
    });
    if (!match) return { ok: false, status: 403, reason: 'wrong_product' };
  } else if (
    String(session.amount_total) !== expectedAmount ||
    String(session.currency || '').toLowerCase() !== expectedCurrency
  ) {
    // Weaker fallback until NR_STRIPE_PRICE_ID (or product / payment link) is set.
    return { ok: false, status: 403, reason: 'wrong_amount' };
  }

  return { ok: true };
}

export async function retrieveCheckoutSession(sessionId, { secretKey, fetchImpl = fetch }) {
  const url =
    'https://api.stripe.com/v1/checkout/sessions/' +
    encodeURIComponent(sessionId) +
    '?expand[]=line_items';
  const res = await fetchImpl(url, {
    headers: { Authorization: 'Bearer ' + secretKey },
  });
  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  return { status: res.status, body };
}

export function resolveZipPath(cwd = process.cwd(), existsFn = fs.existsSync) {
  for (const rel of ZIP_CANDIDATES) {
    const abs = path.resolve(cwd, rel);
    if (existsFn(abs)) return abs;
  }
  return null;
}

export async function verifyAndAuthorize(sessionId, deps = {}) {
  const env = deps.env || process.env;
  const fetchImpl = deps.fetchImpl || fetch;

  if (!sessionId) {
    return { ok: false, status: 400, reason: 'missing_session_id' };
  }
  if (!SESSION_ID_RE.test(sessionId)) {
    return { ok: false, status: 400, reason: 'invalid_session_id' };
  }

  const secretKey = getStripeKey(env);
  if (!secretKey) {
    return { ok: false, status: 503, reason: 'not_configured' };
  }

  let retrieved;
  try {
    retrieved = await retrieveCheckoutSession(sessionId, { secretKey, fetchImpl });
  } catch {
    return { ok: false, status: 503, reason: 'stripe_unreachable' };
  }

  if (retrieved.status === 404 || !retrieved.body || retrieved.body.error) {
    return { ok: false, status: 403, reason: 'invalid_session' };
  }
  if (retrieved.status < 200 || retrieved.status >= 300) {
    return { ok: false, status: 503, reason: 'stripe_error' };
  }

  return evaluateSession(retrieved.body, env);
}
