// Re-check the public pages and openFDA labels cited by the cycle tracker.
// Does not edit clinical numbers. Exits 1 when a page is down, a required
// phrase disappeared, or an openFDA excerpt changed since source-watch.json.
//
//   node scripts/refresh-health-data.mjs          # compare and flag
//   node scripts/refresh-health-data.mjs --init   # write source-watch.json
//
// Weekly GitHub Action: .github/workflows/refresh-health-data.yml

import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { inflateSync, inflateRawSync } from 'node:zlib';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = path.join(root, 'data', 'cycle');
const meta = JSON.parse(readFileSync(path.join(dataDir, 'meta.json'), 'utf8'));
const watchPath = path.join(dataDir, 'source-watch.json');
const reportPath = path.join(dataDir, 'refresh-report.json');
const init = process.argv.includes('--init');

const AGENTS = [
  'MicroVentureLabs-health-data-refresh/1.0 (educational citation check)',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
];

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

function readableText(buffer) {
  const raw = buffer.toString('latin1');
  const chunks = [raw];
  const streams = raw.matchAll(/stream\r?\n([\s\S]*?)endstream/g);
  for (const match of streams) {
    const slice = Buffer.from(match[1], 'latin1');
    for (const inflate of [inflateSync, inflateRawSync]) {
      try {
        chunks.push(inflate(slice).toString('latin1'));
        break;
      } catch {
        // not a flate stream
      }
    }
  }
  const combined = chunks.join('\n');
  // PDF text often stores one syllable per parenthesis. Joining those literals
  // reconstructs phrases such as "three hours".
  const literals = [...combined.matchAll(/\((?:\\\)|[^)]){1,80}\)/g)]
    .map((match) => match[0].slice(1, -1))
    .join('');
  return `${combined}\n${literals}`;
}

async function fetchText(url) {
  let last = null;
  for (const agent of AGENTS) {
    const response = await fetch(url, {
      headers: { 'User-Agent': agent, Accept: 'text/html,application/pdf,application/json;q=0.9,*/*;q=0.8' },
      redirect: 'follow',
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    last = { ok: response.ok, status: response.status, text: readableText(buffer), finalUrl: response.url };
    if (response.ok) return last;
    if (response.status !== 403 && response.status !== 401) return last;
  }
  return last;
}

async function checkPages() {
  const findings = [];
  for (const [id, source] of Object.entries(meta.sources)) {
    try {
      const result = await fetchText(source.checkUrl || source.url);
      const missing = (source.mustContain || []).filter((phrase) => !result.text.toLowerCase().includes(phrase.toLowerCase()));
      const problem = !result.ok || missing.length > 0;
      findings.push({
        id,
        url: source.url,
        status: result.status,
        ok: !problem,
        missing,
        note: !result.ok ? `HTTP ${result.status}` : missing.length ? `Missing: ${missing.join(' | ')}` : 'phrases still present',
      });
    } catch (error) {
      findings.push({ id, url: source.url, status: 0, ok: false, missing: source.mustContain || [], note: error.message });
    }
  }
  return findings;
}

async function openFdaSnapshots() {
  const snapshots = {};
  const findings = [];
  for (const item of meta.openFdaWatch || []) {
    const url = new URL('https://api.fda.gov/drug/label.json');
    url.searchParams.set('search', item.search);
    url.searchParams.set('limit', '1');
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        findings.push({ id: item.id, ok: false, note: `openFDA HTTP ${response.status}` });
        continue;
      }
      const data = await response.json();
      const label = data.results?.[0] || {};
      const joined = (item.fields || []).map((field) => (label[field]?.[0] || '')).join('\n').replace(/\s+/g, ' ').trim();
      const digest = hash(joined);
      snapshots[item.id] = { label: item.label, search: item.search, sha256: digest, chars: joined.length };
      findings.push({ id: item.id, ok: true, note: joined ? `${joined.length} characters hashed` : 'label had none of the watched fields' });
    } catch (error) {
      findings.push({ id: item.id, ok: false, note: error.message });
    }
  }
  return { snapshots, findings };
}

function compareSnapshots(next) {
  let previous = {};
  try {
    previous = JSON.parse(readFileSync(watchPath, 'utf8')).openfda || {};
  } catch {
    previous = {};
  }
  const drifts = [];
  if (!init) {
    for (const [id, snap] of Object.entries(next)) {
      if (!previous[id]) drifts.push(`${id}: no baseline in source-watch.json (run with --init after review)`);
      else if (previous[id].sha256 !== snap.sha256) drifts.push(`${id}: openFDA text changed`);
    }
  }
  return drifts;
}

const pages = await checkPages();
const fda = await openFdaSnapshots();
const drifts = compareSnapshots(fda.snapshots);
const pageFailures = pages.filter((item) => !item.ok);
const fdaFailures = fda.findings.filter((item) => !item.ok);
const report = {
  checkedAt: new Date().toISOString(),
  datasetVersion: meta.version,
  pageFailures,
  fdaFailures,
  drifts,
  pages,
  openfda: fda.findings,
};

mkdirSync(dataDir, { recursive: true });
writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

if (init) {
  writeFileSync(watchPath, `${JSON.stringify({ generatedAt: report.checkedAt, openfda: fda.snapshots }, null, 2)}\n`);
  console.log(`Wrote ${watchPath}`);
}

console.log(`Pages ok ${pages.length - pageFailures.length}/${pages.length}. openFDA drifts: ${drifts.length}. Report: ${reportPath}`);
if (pageFailures.length || fdaFailures.length || (!init && drifts.length)) {
  for (const item of pageFailures) console.error(`PAGE ${item.id}: ${item.note}`);
  for (const item of fdaFailures) console.error(`FDA ${item.id}: ${item.note}`);
  for (const drift of drifts) console.error(`DRIFT ${drift}`);
  process.exitCode = 1;
}
