// Helpers for GET/POST /api/nr-checkout.
// Env names only (values never logged):
//   STRIPE_SECRET_KEY          required to create a Checkout Session
//   NR_STRIPE_PRICE_ID         preferred; uses the existing Stripe Price
//   NR_STRIPE_AMOUNT_CENTS     used with price_data if no price id (default 3900)
//   NR_STRIPE_CURRENCY         used with price_data if no price id (default usd)
//   NR_PUBLIC_BASE_URL         optional absolute origin for success/cancel URLs
//                              (default: request Host, or https://generationwealthforever.com)

import { getStripeKey } from './nr-verify.js';

export const PRODUCT_NAME =
  'NOBODY RUNS — The 90-Day Urban Family Preparedness Program';
export const DEFAULT_PUBLIC_BASE = 'https://generationwealthforever.com';
export const SUCCESS_PATH = '/nobody-runs-download.html';
export const CANCEL_PATH = '/nobody-runs.html';

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

export function publicBase(req, env = process.env) {
  const configured = String(env.NR_PUBLIC_BASE_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const headers = (req && req.headers) || {};
  const host = String(headers['x-forwarded-host'] || headers.host || '').split(',')[0].trim();
  if (host) {
    const proto = String(headers['x-forwarded-proto'] || 'https').split(',')[0].trim() || 'https';
    return proto + '://' + host;
  }
  return DEFAULT_PUBLIC_BASE;
}

export function successUrl(base) {
  return String(base).replace(/\/$/, '') + SUCCESS_PATH + '?session_id={CHECKOUT_SESSION_ID}';
}

export function cancelUrl(base) {
  return String(base).replace(/\/$/, '') + CANCEL_PATH;
}

export function metadataFromQuery(url) {
  const params = url instanceof URL ? url.searchParams : new URL(url, 'http://localhost').searchParams;
  const meta = {};
  for (const key of UTM_KEYS) {
    const v = String(params.get(key) || '').trim();
    if (v) meta[key] = v.slice(0, 40);
  }
  return meta;
}

export function buildCheckoutForm(env, { success, cancel, metadata, clientReferenceId }) {
  const body = new URLSearchParams();
  body.set('mode', 'payment');
  body.set('success_url', success);
  body.set('cancel_url', cancel);
  body.set('billing_address_collection', 'auto');
  body.set('allow_promotion_codes', 'false');

  const priceId = String(env.NR_STRIPE_PRICE_ID || '').trim();
  if (priceId) {
    body.set('line_items[0][price]', priceId);
    body.set('line_items[0][quantity]', '1');
  } else {
    const amount = String(env.NR_STRIPE_AMOUNT_CENTS || '3900').trim();
    const currency = String(env.NR_STRIPE_CURRENCY || 'usd').trim().toLowerCase();
    body.set('line_items[0][quantity]', '1');
    body.set('line_items[0][price_data][currency]', currency);
    body.set('line_items[0][price_data][unit_amount]', amount);
    body.set('line_items[0][price_data][product_data][name]', PRODUCT_NAME);
  }

  if (clientReferenceId) {
    body.set('client_reference_id', String(clientReferenceId).slice(0, 200));
  }
  if (metadata) {
    for (const [key, value] of Object.entries(metadata)) {
      if (value) body.set('metadata[' + key + ']', String(value).slice(0, 40));
    }
  }
  return body;
}

export async function createCheckoutSession(env, form, fetchImpl = fetch) {
  const secretKey = getStripeKey(env);
  if (!secretKey) {
    return { ok: false, status: 503, reason: 'not_configured' };
  }
  let res;
  try {
    res = await fetchImpl('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: 'Bearer ' + secretKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: form.toString(),
    });
  } catch {
    return { ok: false, status: 503, reason: 'stripe_unreachable' };
  }

  let body = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok || !body || !body.url) {
    if (res.status === 401 || res.status === 403) {
      return { ok: false, status: 503, reason: 'stripe_auth' };
    }
    return { ok: false, status: 503, reason: 'stripe_error' };
  }
  return { ok: true, url: body.url, id: body.id };
}
