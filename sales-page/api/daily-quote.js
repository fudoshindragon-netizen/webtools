// GET /api/daily-quote — invoked by the Vercel cron "0 13 * * *".
//
// Picks today's entry from data/quotes.json by day-of-year (UTC), builds a
// one-quote email and sends it to the MailerLite group as an instant campaign.
//
// Env: MAILERLITE_API_KEY, MAILERLITE_GROUP_ID, MAILERLITE_SENDER_ID,
//      MAILING_ADDRESS (physical postal address — legally required in the
//      footer of every commercial email), optional MAILERLITE_SENDER_NAME.
//
// Honest failure: if any of those four is missing we log exactly which ones and
// return 200 without creating or sending anything, so the cron run is a no-op
// rather than a silent success. Every email carries an unsubscribe link
// ({$unsubscribe} — MailerLite fills it in) and the postal address.

import { readFileSync } from 'node:fs';
import path from 'node:path';

const MAILERLITE_API = 'https://connect.mailerlite.com/api';
const SITE = 'https://generationwealthforever.com';
const REQUIRED = ['MAILERLITE_API_KEY', 'MAILERLITE_GROUP_ID', 'MAILERLITE_SENDER_ID', 'MAILING_ADDRESS'];

function loadQuotes() {
  const candidates = [
    path.join(process.cwd(), 'data', 'quotes.json'),
    path.join(process.cwd(), '..', 'data', 'quotes.json'),
    path.join(path.dirname(new URL(import.meta.url).pathname), '..', 'data', 'quotes.json'),
  ];
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(readFileSync(candidate, 'utf8'));
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { quotes: parsed, source: candidate };
      }
    } catch {
      // try the next location
    }
  }
  return { quotes: [], source: null };
}

function dayOfYearUTC(date) {
  const year = date.getUTCFullYear();
  const startOfYear = Date.UTC(year, 0, 0);
  const today = Date.UTC(year, date.getUTCMonth(), date.getUTCDate());
  return Math.round((today - startOfYear) / 86400000);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[ch]));
}

function buildHtml(quote, postalAddress) {
  const text = escapeHtml(quote.text);
  const note = escapeHtml(quote.note);
  const address = escapeHtml(postalAddress).replace(/\n/g, '<br />');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${text}</title>
  </head>
  <body style="margin:0;padding:0;background:#0a0a12;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a12;padding:28px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#12121e;border:1px solid #1e1e32;border-radius:12px;padding:32px 28px;font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
            <tr>
              <td>
                <p style="margin:0 0 18px;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;color:#7c7c9a;font-weight:700;">MicroVenture Labs &middot; daily quote</p>
                <p style="margin:0 0 18px;font-size:23px;line-height:1.35;font-weight:800;color:#e8e8f0;">${text}</p>
                <p style="margin:0 0 26px;font-size:16px;line-height:1.65;color:#b8b8d0;">${note}</p>
                <p style="margin:0 0 26px;">
                  <a href="${SITE}" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#ff6b9d;color:#ffffff;font-size:15px;font-weight:700;text-decoration:none;">The 90-day program &rarr;</a>
                </p>
                <hr style="border:none;border-top:1px solid #1e1e32;margin:0 0 16px;" />
                <p style="margin:0 0 10px;font-size:12px;line-height:1.7;color:#7c7c9a;">
                  You are getting this because you asked for one short quote a day at ${escapeHtml(SITE)}.<br />
                  <a href="{$unsubscribe}" style="color:#6bc5ff;text-decoration:underline;">Unsubscribe</a> — one click, no questions.
                </p>
                <p style="margin:0;font-size:12px;line-height:1.7;color:#7c7c9a;">${address}</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

async function ml(pathname, apiKey, init = {}) {
  const response = await fetch(`${MAILERLITE_API}${pathname}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...(init.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
}

// Cheap idempotence: if a campaign with today's exact name already exists we do
// not send a second copy. Best effort — a failure here never blocks the send.
async function alreadySentToday(campaignName, apiKey) {
  try {
    const { response, data } = await ml('/campaigns?limit=50', apiKey, { method: 'GET' });
    if (!response.ok) return false;
    const items = Array.isArray(data?.data) ? data.data : [];
    return items.some((item) => item && item.name === campaignName);
  } catch {
    return false;
  }
}

export default async function handler(req, res) {
  const now = new Date();

  // ?dryRun=1 — report which quote today resolves to and where the data file was
  // found, without touching MailerLite. Safe: no env needed, nothing is sent.
  const dryRun = req.query && String(req.query.dryRun || '') === '1';
  if (dryRun) {
    const { quotes, source } = loadQuotes();
    const doy = dayOfYearUTC(now);
    const quote = quotes.length > 0 ? quotes[(doy - 1) % quotes.length] : null;
    return res.status(200).json({
      ok: quotes.length > 0,
      dryRun: true,
      dayOfYear: doy,
      quoteCount: quotes.length,
      source,
      quote,
    });
  }

  const missing = REQUIRED.filter((key) => !String(process.env[key] || '').trim());
  if (missing.length > 0) {
    console.warn(`[daily-quote] not configured — missing ${missing.join(', ')}. Nothing created, nothing sent.`);
    return res.status(200).json({ ok: false, reason: 'not_configured', missing });
  }

  const apiKey = process.env.MAILERLITE_API_KEY.trim();
  const groupId = process.env.MAILERLITE_GROUP_ID.trim();
  const senderId = process.env.MAILERLITE_SENDER_ID.trim();
  const senderName = (process.env.MAILERLITE_SENDER_NAME || 'MicroVenture Labs').trim();
  const postalAddress = process.env.MAILING_ADDRESS.trim();

  const { quotes, source } = loadQuotes();
  if (quotes.length === 0) {
    console.error('[daily-quote] data/quotes.json could not be read or is empty — nothing sent.');
    return res.status(200).json({ ok: false, reason: 'no_quotes' });
  }

  const doy = dayOfYearUTC(now);
  const quote = quotes[(doy - 1) % quotes.length];
  const dateISO = now.toISOString().slice(0, 10);
  const campaignName = `Daily quote ${dateISO} #${quote.id}`;

  if (await alreadySentToday(campaignName, apiKey)) {
    console.log(`[daily-quote] "${campaignName}" already exists — not sending a duplicate.`);
    return res.status(200).json({ ok: true, skipped: 'already_sent', campaign: campaignName, quoteId: quote.id });
  }

  const subject = quote.text.length > 120 ? `${quote.text.slice(0, 117)}...` : quote.text;

  const create = await ml('/campaigns', apiKey, {
    method: 'POST',
    body: JSON.stringify({
      name: campaignName,
      type: 'regular',
      emails: [
        {
          subject,
          from: senderId,
          from_name: senderName,
          content: buildHtml(quote, postalAddress),
        },
      ],
      groups: [groupId],
    }),
  });

  if (!create.response.ok) {
    const detail = create.data?.message || JSON.stringify(create.data).slice(0, 300);
    console.error(`[daily-quote] campaign create failed (${create.response.status}): ${detail}`);
    return res.status(502).json({ ok: false, reason: 'campaign_create_failed', status: create.response.status });
  }

  const campaignId = create.data?.data?.id;
  if (!campaignId) {
    console.error('[daily-quote] campaign created but no id came back — cannot schedule it.');
    return res.status(502).json({ ok: false, reason: 'campaign_create_failed', detail: 'no campaign id' });
  }

  const send = await ml(`/campaigns/${campaignId}/schedule`, apiKey, {
    method: 'POST',
    body: JSON.stringify({ delivery: 'instant' }),
  });

  if (!send.response.ok) {
    const detail = send.data?.message || JSON.stringify(send.data).slice(0, 300);
    console.error(`[daily-quote] campaign ${campaignId} created but send failed (${send.response.status}): ${detail}`);
    return res.status(502).json({ ok: false, reason: 'send_failed', campaignId, status: send.response.status });
  }

  console.log(
    `[daily-quote] sent "${campaignName}" (quote #${quote.id}, day ${doy}, quotes from ${source}) to group ${groupId} as campaign ${campaignId}.`
  );
  return res.status(200).json({
    ok: true,
    campaign: campaignName,
    campaignId,
    quoteId: quote.id,
    dayOfYear: doy,
  });
}
