// POST /api/subscribe
// Adds an email address to a MailerLite group (API v2, /api/subscribers).
//
// Env: MAILERLITE_API_KEY, MAILERLITE_GROUP_ID
// If either is missing the endpoint refuses to accept sign-ups and answers
// 503 { ok: false, reason: "not_configured" } — the page then shows
// "Sign-up opens shortly". We never pretend a sign-up worked.

const MAILERLITE_API = 'https://connect.mailerlite.com/api';
// Deliberately simple: one @, a dot in the domain, no whitespace.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function readEmail(req) {
  const body = req.body;
  if (body == null) return '';
  if (typeof body === 'string') {
    const trimmed = body.trim();
    if (trimmed.startsWith('{')) {
      try {
        return String(JSON.parse(trimmed).email || '');
      } catch {
        return '';
      }
    }
    return String(new URLSearchParams(trimmed).get('email') || '');
  }
  return String(body.email || '');
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
  }

  const apiKey = (process.env.MAILERLITE_API_KEY || '').trim();
  const groupId = (process.env.MAILERLITE_GROUP_ID || '').trim();

  if (!apiKey || !groupId) {
    const missing = [
      !apiKey ? 'MAILERLITE_API_KEY' : null,
      !groupId ? 'MAILERLITE_GROUP_ID' : null,
    ].filter(Boolean);
    console.warn(`[subscribe] not configured — missing ${missing.join(', ')}. Sign-up refused, nothing stored.`);
    return res.status(503).json({ ok: false, reason: 'not_configured' });
  }

  const email = readEmail(req).trim().toLowerCase();
  if (!email || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ ok: false, reason: 'invalid_email' });
  }

  try {
    const upstream = await fetch(`${MAILERLITE_API}/subscribers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      // status "active" = opted in. No double opt-in because the form itself is
      // the opt-in; MailerLite still sends every unsubscribe link.
      body: JSON.stringify({ email, groups: [groupId], status: 'active' }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (upstream.ok) {
      return res.status(200).json({ ok: true });
    }

    // 422 is MailerLite's "already subscribed" / validation answer. Answering
    // "ok" for an address that is already on the list avoids turning the form
    // into a list-membership oracle. A genuinely invalid address is reported.
    const message = String(data?.message || '');
    if (upstream.status === 422) {
      if (/valid email|invalid/i.test(message)) {
        return res.status(400).json({ ok: false, reason: 'invalid_email' });
      }
      return res.status(200).json({ ok: true });
    }

    console.error(`[subscribe] MailerLite responded ${upstream.status}: ${message || 'no message'}`);
    return res.status(502).json({ ok: false, reason: 'upstream_error' });
  } catch (err) {
    console.error(`[subscribe] MailerLite request failed: ${err && err.message ? err.message : err}`);
    return res.status(502).json({ ok: false, reason: 'upstream_error' });
  }
}
