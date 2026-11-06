// GET /api/drug-lookup?q=rifampin
// Proxies the public openFDA drug-label API and returns a short excerpt of
// drug_interactions (or dosage text if that section is absent).
// Optional env: OPENFDA_API_KEY (higher rate limit). Never sent to the browser.

import { publicDrugName } from './lib/cycle-data.js';

async function findLabel(name) {
  const fields = ['openfda.generic_name', 'openfda.brand_name', 'openfda.substance_name'];
  for (const field of fields) {
    const url = new URL('https://api.fda.gov/drug/label.json');
    url.searchParams.set('search', `${field}:"${name}"`);
    url.searchParams.set('limit', '1');
    const key = (process.env.OPENFDA_API_KEY || '').trim();
    if (key) url.searchParams.set('api_key', key);
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (response.status === 404) continue;
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`openFDA responded ${response.status}: ${detail.slice(0, 180)}`);
    }
    const data = await response.json();
    if (data.results?.[0]) return data.results[0];
  }
  return null;
}

function excerpt(label) {
  const interactions = label.drug_interactions?.[0] || '';
  const dosage = label.dosage_and_administration?.[0] || '';
  const text = interactions || dosage;
  const setId = label.openfda?.spl_set_id?.[0] || label.set_id || '';
  return {
    title: label.openfda?.brand_name?.[0] || label.openfda?.generic_name?.[0] || '',
    excerpt: text ? text.replace(/\s+/g, ' ').slice(0, 1800) : '',
    note: interactions
      ? 'From the label drug_interactions section.'
      : text
        ? 'This label record had no drug_interactions section. The excerpt is from dosage and administration instead.'
        : 'openFDA returned a label without those sections.',
    url: setId ? `https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=${setId}` : 'https://api.fda.gov/drug/label.json',
  };
}

export async function lookupDrug(rawName) {
  const name = publicDrugName(rawName);
  if (name.length < 3) {
    return { status: 400, body: { ok: false, message: 'Enter at least 3 letters of a medication name.' } };
  }
  const label = await findLabel(name);
  if (!label) return { status: 200, body: { ok: true, query: name, results: [] } };
  return { status: 200, body: { ok: true, query: name, results: [excerpt(label)] } };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, message: 'Use GET.' });
  }
  try {
    const query = req.query?.q || new URL(req.url, 'http://localhost').searchParams.get('q');
    const result = await lookupDrug(query);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error(`[drug-lookup] ${error.message}`);
    return res.status(502).json({ ok: false, message: 'The label service did not answer. Try again later, and confirm with your pharmacist.' });
  }
}
