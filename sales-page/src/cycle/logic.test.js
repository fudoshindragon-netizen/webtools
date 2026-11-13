import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { predictFromStarts, addDays, diffDays } from './predict.js';
import { adviseMissed, matchInteractions, resolveFigures, searchPassages, collectSourceIds } from './match.js';
import { sanitizeImport } from './store.js';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'data', 'cycle');
const read = (name) => JSON.parse(readFileSync(path.join(root, name), 'utf8'));
const meta = read('meta.json');
const methods = read('methods.json');
const missed = read('missed-dose.json');
const interactions = read('interactions.json');
const symptoms = read('symptoms.json');
const labs = read('labs.json');

test('cycle estimate uses a 28-day average and a nine-day window', () => {
  const prediction = predictFromStarts(['2026-01-01', '2026-01-29', '2026-02-26']);
  assert.equal(prediction.average, 28);
  assert.equal(prediction.usingDefault, false);
  assert.equal(prediction.nextStart, '2026-03-26');
  assert.equal(prediction.ovulation, addDays('2026-03-26', -14));
  assert.equal(diffDays(prediction.fertileEnd, prediction.fertileStart), 8);
  assert.equal(prediction.fertileEnd, '2026-03-12');
  assert.equal(prediction.fertileStart, '2026-03-04');
});

test('short and very long gaps are excluded from the average', () => {
  const prediction = predictFromStarts(['2026-01-01', '2026-01-05', '2026-03-20'], { cycleLength: 30 });
  assert.equal(prediction.usingDefault, true);
  assert.equal(prediction.average, 30);
  assert.equal(prediction.excluded.length, 2);
});

test('one late combined pill does not invent a pregnancy percentage', () => {
  const result = adviseMissed(missed, { methodId: 'combined-pill', situationId: 'late-or-missed', hours: 30, week: '2', sex: 'no' });
  assert.equal(result.authorities[0].rule.id, 'coc-under-48');
  assert.match(result.authorities[0].rule.actions.join(' '), /No additional contraceptive protection/);
  const figures = resolveFigures(missed, result.authorities[0].rule.figureIds);
  assert.ok(figures.some((figure) => figure.value === 'No single percentage published'));
  assert.ok(figures.every((figure) => figure.sourceIds.length > 0));
});

test('two-day combined-pill miss asks for seven days of backup', () => {
  const result = adviseMissed(missed, { methodId: 'combined-pill', situationId: 'late-or-missed', hours: 50, week: '1', sex: 'yes' });
  assert.equal(result.authorities[0].rule.id, 'coc-48-or-more');
  assert.match(result.authorities[0].rule.actions.join(' '), /7 days/);
});

test('mini-pill at 4 hours and drospirenone at 4 hours follow different rules', () => {
  const mini = adviseMissed(missed, { methodId: 'pop-traditional', situationId: 'late-pill', hours: 4, sex: 'yes' });
  assert.equal(mini.authorities[0].rule.id, 'pop-over-3');
  const drsp = adviseMissed(missed, { methodId: 'pop-drospirenone', situationId: 'late-or-missed', hours: 4, week: '2', sex: 'no' });
  assert.equal(drsp.authorities[0].rule.id, 'drsp-under-48');
  assert.match(drsp.authorities[0].rule.actions.join(' '), /No additional contraceptive protection/);
});

test('patch label and CDC disagree at 30 hours', () => {
  const result = adviseMissed(missed, { methodId: 'patch', situationId: 'off-or-late', hours: 30, week: '2', sex: 'no', unsure: false });
  const label = result.authorities.find((item) => item.id === 'xulane-label').rule;
  const cdc = result.authorities.find((item) => item.id === 'cdc-spr').rule;
  assert.equal(label.id, 'xulane-24-or-more');
  assert.equal(cdc.id, 'cdc-patch-under-48');
});

test('NuvaRing label uses 3 hours and a 28-day left-in limit', () => {
  const brief = adviseMissed(missed, { methodId: 'ring-nuvaring', situationId: 'out', hours: 2, week: '1', sex: 'no' });
  assert.equal(brief.authorities.find((item) => item.id === 'nuvaring-label').rule.id, 'nv-under-3');
  const weekOne = adviseMissed(missed, { methodId: 'ring-nuvaring', situationId: 'out', hours: 5, week: '1', sex: 'yes' });
  assert.equal(weekOne.authorities.find((item) => item.id === 'nuvaring-label').rule.id, 'nv-over-3-week-12');
  const left = adviseMissed(missed, { methodId: 'ring-nuvaring', situationId: 'left-in', days: 30 });
  assert.equal(left.authorities[0].rule.id, 'nv-left-over-28');
  const still = adviseMissed(missed, { methodId: 'ring-nuvaring', situationId: 'left-in', days: 28 });
  assert.equal(still.authorities[0].rule.id, 'nv-left-through-28');
});

test('Annovera uses 2 hours, not the CDC 48-hour ring rule', () => {
  const result = adviseMissed(missed, { methodId: 'ring-annovera', situationId: 'out', hours: 3, sex: 'yes' });
  assert.equal(result.authorities.length, 1);
  assert.equal(result.authorities[0].rule.id, 'an-over-2');
  assert.match(result.authorities[0].rule.actions.join(' '), /estrogen/i);
});

test('Depo grace period includes 15 weeks and not 16', () => {
  const grace = adviseMissed(missed, { methodId: 'depo', situationId: 'late-shot', weeks: 14, sex: 'no' });
  assert.equal(grace.authorities[0].rule.id, 'depo-grace');
  const edge = adviseMissed(missed, { methodId: 'depo', situationId: 'late-shot', weeks: 15, sex: 'no' });
  assert.equal(edge.authorities[0].rule.id, 'depo-grace');
  const late = adviseMissed(missed, { methodId: 'depo', situationId: 'late-shot', weeks: 16, sex: 'yes' });
  assert.equal(late.authorities[0].rule.id, 'depo-late');
  const figures = resolveFigures(missed, late.authorities[0].rule.figureIds);
  assert.ok(figures.some((figure) => /no single percentage/i.test(figure.value)));
});

test('interaction matcher flags rifampin, lamotrigine, and St John, and clears amoxicillin', () => {
  const rifampin = matchInteractions(interactions.entries, 'Started Rifadin yesterday');
  assert.equal(rifampin[0].id, 'rifampin');
  const lamotrigine = matchInteractions(interactions.entries, 'lamictal');
  assert.equal(lamotrigine[0].flag, 'two-way');
  const wort = matchInteractions(interactions.entries, "St. John's wort capsule");
  assert.equal(wort[0].id, 'st-johns-wort');
  const antibiotic = matchInteractions(interactions.entries, 'amoxicillin');
  assert.equal(antibiotic[0].flag, 'no-known-interaction');
  const vitamin = matchInteractions(interactions.entries, 'vitamin D');
  assert.equal(vitamin.length, 0);
});

test('symptom search finds BV, lube, and blood color', () => {
  assert.equal(searchPassages(symptoms.passages, 'fishy odor after sex')[0].id, 'bv');
  assert.equal(searchPassages(symptoms.passages, 'coconut oil lube on a latex condom')[0].id, 'lube');
  assert.equal(searchPassages(symptoms.passages, 'brown blood at the end of my period')[0].id, 'blood-color');
});

test('every cited source id exists and every figure has a source', () => {
  const ids = new Set([
    ...collectSourceIds(methods),
    ...collectSourceIds(missed),
    ...collectSourceIds(interactions),
    ...collectSourceIds(symptoms),
    ...collectSourceIds(labs),
  ]);
  for (const id of ids) {
    assert.ok(meta.sources[id], `missing source ${id}`);
    assert.match(meta.sources[id].url, /^https:\/\//);
  }
  for (const figure of Object.values(missed.figures)) {
    assert.ok(figure.value);
    assert.ok(figure.sourceIds.length > 0);
  }
  assert.equal(methods.lastReviewed, meta.lastReviewed);
});

test('import drops junk and keeps a valid lab', () => {
  const clean = sanitizeImport({
    profile: { cycleLength: 999, methodId: 'patch' },
    labs: [{ analyte: 'ferritin', date: '2026-01-02', value: '14.5', unit: 'ng/mL', refLow: 15, refHigh: 150 }],
    medications: [{ name: '<script>', kind: 'rx' }],
    notes: 'ignored',
  });
  assert.equal(clean.profile.cycleLength, 60);
  assert.equal(clean.profile.methodId, 'patch');
  assert.equal(clean.labs[0].value, 14.5);
  assert.equal(clean.medications[0].name, '<script>');
  assert.equal(sanitizeImport(null), null);
});
