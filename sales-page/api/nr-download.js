// GET /api/nr-download?session_id={CHECKOUT_SESSION_ID}
// Verifies a paid Stripe Checkout Session, then streams the NOBODY RUNS zip.
//
// The public zip at /downloads/nr90d-axo6m5bcfa1j.zip is left in place until
// this gated path is proven and the Payment Link redirect is updated. This
// function never serves that public path; it only reads from private/.

import fs from 'node:fs';
import {
  DOWNLOAD_FILENAME,
  resolveZipPath,
  verifyAndAuthorize,
} from './lib/nr-verify.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).json({ ok: false, reason: 'method_not_allowed' });
  }

  const url = new URL(req.url || '', 'http://localhost');
  const sessionId = String(url.searchParams.get('session_id') || '').trim();
  const result = await verifyAndAuthorize(sessionId);

  if (!result.ok) {
    return res.status(result.status).json({ ok: false, reason: result.reason });
  }

  const zipPath = resolveZipPath();
  if (!zipPath) {
    console.warn('[nr-download] zip missing from private/; refusing to stream.');
    return res.status(503).json({ ok: false, reason: 'zip_missing' });
  }

  const stat = fs.statSync(zipPath);
  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Length', String(stat.size));
  res.setHeader(
    'Content-Disposition',
    'attachment; filename="' + DOWNLOAD_FILENAME + '"',
  );

  if (req.method === 'HEAD') {
    return res.status(200).end();
  }

  const stream = fs.createReadStream(zipPath);
  stream.on('error', (err) => {
    console.error('[nr-download] read failed:', err && err.code);
    if (!res.headersSent) {
      res.status(500).json({ ok: false, reason: 'read_failed' });
    } else {
      res.end();
    }
  });
  stream.pipe(res);
}
