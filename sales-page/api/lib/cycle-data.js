import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export function readCycleJson(name) {
  const candidates = [
    path.join(process.cwd(), 'data', 'cycle', name),
    path.join(here, '..', '..', 'data', 'cycle', name),
  ];
  for (const candidate of candidates) {
    try {
      return JSON.parse(readFileSync(candidate, 'utf8'));
    } catch {
      // try the next location
    }
  }
  throw new Error(`Could not read data/cycle/${name}`);
}

export function publicDrugName(value) {
  const cleaned = String(value || '')
    .replace(/[^a-zA-Z0-9 .+/-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
  return cleaned;
}
