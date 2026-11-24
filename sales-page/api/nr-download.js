// GET /api/nr-download?session_id={CHECKOUT_SESSION_ID}
// Verifies a paid Stripe Checkout Session, then streams the NOBODY RUNS zip.
// The zip is never served from public/. It comes from sales-page/private/ or
// from NR_ZIP_BLOB_URL (server-side only).

import fs from 'node:fs';
import {
  DOWNLOAD_FILENAME,
  blobZipUrl,
  fetchZipFromBlob,
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

  const headers = {
    'Content-Type': 'application/zip',
    'Content-Disposition': 'attachment; filename="' + DOWNLOAD_FILENAME + '"',
  };

  if (blobZipUrl()) {
    try {
      const blob = await fetchZipFromBlob();
      if (!blob || !blob.ok) {
        console.warn('[nr-download] blob zip fetch failed; refusing to stream.');
        return res.status(503).json({ ok: false, reason: 'zip_missing' });
      }
      headers['Content-Length'] = String(blob.buffer.length);
      Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));
      if (req.method === 'HEAD') return res.status(200).end();
      return res.status(200).end(blob.buffer);
    } catch {
      console.warn('[nr-download] blob zip threw; refusing to stream.');
      return res.status(503).json({ ok: false, reason: 'zip_missing' });
    }
  }

  const zipPath = resolveZipPath();
  if (!zipPath) {
    console.warn('[nr-download] zip missing from private/; refusing to stream.');
    return res.status(503).json({ ok: false, reason: 'zip_missing' });
  }

  const stat = fs.statSync(zipPath);
  headers['Content-Length'] = String(stat.size);
  Object.entries(headers).forEach(([k, v]) => res.setHeader(k, v));

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
