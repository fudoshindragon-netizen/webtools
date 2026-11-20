import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PRODUCT_NAME,
  buildCheckoutForm,
  cancelUrl,
  createCheckoutSession,
  metadataFromQuery,
  publicBase,
  successUrl,
} from '../api/lib/nr-checkout.js';

describe('checkout URLs', () => {
  it('builds success and cancel URLs from a public base', () => {
    assert.equal(
      successUrl('https://generationwealthforever.com'),
      'https://generationwealthforever.com/nobody-runs-download.html?session_id={CHECKOUT_SESSION_ID}',
    );
    assert.equal(
      cancelUrl('https://generationwealthforever.com/'),
      'https://generationwealthforever.com/nobody-runs.html',
    );
  });

  it('prefers NR_PUBLIC_BASE_URL, then the request host', () => {
    assert.equal(
      publicBase({ headers: { host: 'example.com' } }, { NR_PUBLIC_BASE_URL: 'https://generationwealthforever.com/' }),
      'https://generationwealthforever.com',
    );
    assert.equal(
      publicBase({ headers: { host: 'preview.example', 'x-forwarded-proto': 'https' } }, {}),
      'https://preview.example',
    );
  });
});

describe('buildCheckoutForm', () => {
  it('uses NR_STRIPE_PRICE_ID when set', () => {
    const form = buildCheckoutForm(
      { NR_STRIPE_PRICE_ID: 'price_NR' },
      {
        success: successUrl('https://generationwealthforever.com'),
        cancel: cancelUrl('https://generationwealthforever.com'),
        metadata: { utm_source: 'mail' },
        clientReferenceId: 'camp__mail__email__none',
      },
    );
    assert.equal(form.get('mode'), 'payment');
    assert.equal(form.get('line_items[0][price]'), 'price_NR');
    assert.equal(form.get('line_items[0][quantity]'), '1');
    assert.equal(form.get('line_items[0][price_data][unit_amount]'), null);
    assert.equal(form.get('metadata[utm_source]'), 'mail');
    assert.equal(form.get('client_reference_id'), 'camp__mail__email__none');
    assert.ok(form.get('success_url').includes('{CHECKOUT_SESSION_ID}'));
  });

  it('falls back to a $39 price_data line item when no price id is set', () => {
    const form = buildCheckoutForm(
      {},
      {
        success: successUrl('https://generationwealthforever.com'),
        cancel: cancelUrl('https://generationwealthforever.com'),
      },
    );
    assert.equal(form.get('line_items[0][price_data][unit_amount]'), '3900');
    assert.equal(form.get('line_items[0][price_data][currency]'), 'usd');
    assert.equal(form.get('line_items[0][price_data][product_data][name]'), PRODUCT_NAME);
  });
});

describe('metadataFromQuery', () => {
  it('copies short utm_* values and ignores empties', () => {
    const meta = metadataFromQuery(
      'https://example.com/api/nr-checkout?utm_source=mail&utm_medium=&utm_campaign=nov',
    );
    assert.deepEqual(meta, { utm_source: 'mail', utm_campaign: 'nov' });
  });
});

function mockFetch(status, body) {
  return async () => ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  });
}

describe('createCheckoutSession', () => {
  it('returns 503 when STRIPE_SECRET_KEY is not set', async () => {
    const form = buildCheckoutForm({}, { success: 'https://x/s', cancel: 'https://x/c' });
    const r = await createCheckoutSession({}, form, mockFetch(200, { url: 'https://checkout.stripe.com/c/pay/cs_test_x' }));
    assert.deepEqual(r, { ok: false, status: 503, reason: 'not_configured' });
  });

  it('returns the hosted checkout URL on success', async () => {
    const form = buildCheckoutForm(
      { STRIPE_SECRET_KEY: 'sk_test_x', NR_STRIPE_PRICE_ID: 'price_NR' },
      { success: 'https://x/s', cancel: 'https://x/c' },
    );
    const r = await createCheckoutSession(
      { STRIPE_SECRET_KEY: 'sk_test_x' },
      form,
      mockFetch(200, { id: 'cs_test_abc', url: 'https://checkout.stripe.com/c/pay/cs_test_abc' }),
    );
    assert.deepEqual(r, {
      ok: true,
      url: 'https://checkout.stripe.com/c/pay/cs_test_abc',
      id: 'cs_test_abc',
    });
  });

  it('returns 503 when Stripe rejects the key', async () => {
    const form = buildCheckoutForm(
      { STRIPE_SECRET_KEY: 'sk_test_x' },
      { success: 'https://x/s', cancel: 'https://x/c' },
    );
    const r = await createCheckoutSession(
      { STRIPE_SECRET_KEY: 'sk_test_x' },
      form,
      mockFetch(401, { error: { type: 'invalid_request_error' } }),
    );
    assert.deepEqual(r, { ok: false, status: 503, reason: 'stripe_auth' });
  });
});
