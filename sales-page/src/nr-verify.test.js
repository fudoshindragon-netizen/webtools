import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  SESSION_ID_RE,
  evaluateSession,
  verifyAndAuthorize,
} from '../api/lib/nr-verify.js';

const PAID = {
  object: 'checkout.session',
  payment_status: 'paid',
  amount_total: 3900,
  currency: 'usd',
  payment_link: 'plink_NR',
  line_items: {
    data: [
      {
        price: { id: 'price_NR', product: 'prod_NR' },
      },
    ],
  },
};

describe('session id format', () => {
  it('accepts Stripe test and live checkout session ids', () => {
    assert.equal(SESSION_ID_RE.test('cs_test_abcABC123'), true);
    assert.equal(SESSION_ID_RE.test('cs_live_abcABC123'), true);
  });
  it('rejects missing, garbage, or path-like values', () => {
    assert.equal(SESSION_ID_RE.test(''), false);
    assert.equal(SESSION_ID_RE.test('cs_test_abc/../x'), false);
    assert.equal(SESSION_ID_RE.test('not-a-session'), false);
    assert.equal(SESSION_ID_RE.test('cs_abc'), false);
  });
});

describe('evaluateSession', () => {
  it('rejects unpaid sessions', () => {
    const r = evaluateSession({ ...PAID, payment_status: 'unpaid' }, {});
    assert.deepEqual(r, { ok: false, status: 403, reason: 'unpaid' });
  });
  it('rejects a paid session for the wrong price when NR_STRIPE_PRICE_ID is set', () => {
    const r = evaluateSession(PAID, { NR_STRIPE_PRICE_ID: 'price_OTHER' });
    assert.deepEqual(r, { ok: false, status: 403, reason: 'wrong_product' });
  });
  it('accepts a paid session with the expected price', () => {
    const r = evaluateSession(PAID, { NR_STRIPE_PRICE_ID: 'price_NR' });
    assert.deepEqual(r, { ok: true });
  });
  it('accepts a paid $39 session when no price/product id is configured (fallback)', () => {
    const r = evaluateSession(PAID, {});
    assert.deepEqual(r, { ok: true });
  });
  it('rejects a paid session with the wrong amount when no price id is configured', () => {
    const r = evaluateSession({ ...PAID, amount_total: 1500 }, {});
    assert.deepEqual(r, { ok: false, status: 403, reason: 'wrong_amount' });
  });
  it('rejects a paid session from the wrong payment link when configured', () => {
    const r = evaluateSession(PAID, { NR_STRIPE_PAYMENT_LINK_ID: 'plink_OTHER' });
    assert.deepEqual(r, { ok: false, status: 403, reason: 'wrong_payment_link' });
  });
});

function mockFetch(status, body) {
  return async () => ({
    status,
    json: async () => body,
  });
}

describe('verifyAndAuthorize', () => {
  it('returns 400 when session_id is missing or malformed', async () => {
    const missing = await verifyAndAuthorize('', { env: { STRIPE_SECRET_KEY: 'sk_test_x' } });
    assert.equal(missing.status, 400);
    assert.equal(missing.reason, 'missing_session_id');
    const bad = await verifyAndAuthorize('nope', { env: { STRIPE_SECRET_KEY: 'sk_test_x' } });
    assert.equal(bad.status, 400);
    assert.equal(bad.reason, 'invalid_session_id');
  });

  it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
    const r = await verifyAndAuthorize('cs_test_abcABC123', { env: {} });
    assert.deepEqual(r, { ok: false, status: 503, reason: 'not_configured' });
  });

  it('returns 403 for a fake session id that Stripe does not know', async () => {
    const r = await verifyAndAuthorize('cs_test_doesNotExist999', {
      env: { STRIPE_SECRET_KEY: 'sk_test_x' },
      fetchImpl: mockFetch(404, { error: { type: 'invalid_request_error' } }),
    });
    assert.deepEqual(r, { ok: false, status: 403, reason: 'invalid_session' });
  });

  it('returns 403 for an unpaid session', async () => {
    const r = await verifyAndAuthorize('cs_test_unpaidSession1', {
      env: { STRIPE_SECRET_KEY: 'sk_test_x' },
      fetchImpl: mockFetch(200, { ...PAID, payment_status: 'unpaid' }),
    });
    assert.deepEqual(r, { ok: false, status: 403, reason: 'unpaid' });
  });

  it('authorizes a paid session for the matching price', async () => {
    const r = await verifyAndAuthorize('cs_test_paidSessionOK1', {
      env: { STRIPE_SECRET_KEY: 'sk_test_x', NR_STRIPE_PRICE_ID: 'price_NR' },
      fetchImpl: mockFetch(200, PAID),
    });
    assert.deepEqual(r, { ok: true });
  });
});
