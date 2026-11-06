const KEY = 'gwf.cycleTracker.v1';

export function emptyState() {
  return {
    version: 1,
    profile: {
      cycleLength: 28,
      periodLength: 5,
      methodId: '',
      anchorDate: '',
      years: 8,
      reminder: '',
    },
    periods: [],
    logs: [],
    medications: [],
    labs: [],
  };
}

function storage() {
  try {
    if (typeof localStorage === 'undefined') return null;
    return localStorage;
  } catch {
    return null;
  }
}

export function loadState() {
  const bin = storage();
  if (!bin) return emptyState();
  try {
    const parsed = JSON.parse(bin.getItem(KEY) || '');
    return sanitizeImport(parsed) || emptyState();
  } catch {
    return emptyState();
  }
}

export function saveState(state) {
  const bin = storage();
  if (!bin) return;
  bin.setItem(KEY, JSON.stringify(state));
}

export function clearState() {
  const bin = storage();
  if (bin) bin.removeItem(KEY);
  try {
    sessionStorage.removeItem('gwf.cycleChat.v1');
  } catch {
    /* private mode */
  }
}

function asId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cleanDate(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) ? String(value) : '';
}

function cleanText(value, max) {
  return String(value || '').slice(0, max);
}

export function sanitizeImport(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const next = emptyState();
  const profile = raw.profile || {};
  next.profile.cycleLength = clamp(profile.cycleLength, 15, 60, 28);
  next.profile.periodLength = clamp(profile.periodLength, 1, 14, 5);
  next.profile.methodId = cleanText(profile.methodId, 40);
  next.profile.anchorDate = cleanDate(profile.anchorDate);
  next.profile.years = clamp(profile.years, 1, 15, 8);
  next.profile.reminder = cleanText(profile.reminder, 40);

  next.periods = (Array.isArray(raw.periods) ? raw.periods : []).slice(0, 400).map((period) => ({
    id: cleanText(period.id, 40) || asId(),
    start: cleanDate(period.start),
    end: cleanDate(period.end),
    flow: cleanText(period.flow, 20) || 'medium',
  })).filter((period) => period.start);

  next.logs = (Array.isArray(raw.logs) ? raw.logs : []).slice(0, 2000).map((log) => ({
    id: cleanText(log.id, 40) || asId(),
    date: cleanDate(log.date),
    flow: cleanText(log.flow, 20) || 'none',
    symptoms: arrayOfText(log.symptoms, 16, 40),
    mood: arrayOfText(log.mood, 8, 40),
    notes: cleanText(log.notes, 2000),
    adherence: cleanText(log.adherence, 20),
    bbt: numberOrBlank(log.bbt),
    mucus: cleanText(log.mucus, 20),
  })).filter((log) => log.date);

  next.medications = (Array.isArray(raw.medications) ? raw.medications : []).slice(0, 200).map((med) => ({
    id: cleanText(med.id, 40) || asId(),
    name: cleanText(med.name, 120),
    kind: ['otc', 'rx', 'supplement'].includes(med.kind) ? med.kind : 'otc',
  })).filter((med) => med.name);

  next.labs = (Array.isArray(raw.labs) ? raw.labs : []).slice(0, 1000).map((lab) => ({
    id: cleanText(lab.id, 40) || asId(),
    analyte: cleanText(lab.analyte, 40),
    date: cleanDate(lab.date),
    value: numberOrBlank(lab.value),
    unit: cleanText(lab.unit, 20),
    refLow: numberOrBlank(lab.refLow),
    refHigh: numberOrBlank(lab.refHigh),
    note: cleanText(lab.note, 300),
  })).filter((lab) => lab.analyte && lab.date && lab.value !== '');

  return next;
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function arrayOfText(value, maxItems, maxLen) {
  if (!Array.isArray(value)) return [];
  return value.map((item) => cleanText(item, maxLen)).filter(Boolean).slice(0, maxItems);
}

function numberOrBlank(value) {
  if (value === '' || value == null) return '';
  const number = Number(value);
  return Number.isFinite(number) ? number : '';
}

export function newId() {
  return asId();
}

export const FLOW = [
  { id: 'none', label: 'No bleeding' },
  { id: 'spotting', label: 'Spotting' },
  { id: 'light', label: 'Light' },
  { id: 'medium', label: 'Medium' },
  { id: 'heavy', label: 'Heavy' },
];

export const SYMPTOMS = [
  'cramps', 'headache', 'breast tenderness', 'bloating', 'acne', 'nausea', 'fatigue',
  'backache', 'diarrhea', 'discharge change', 'odor', 'spotting',
];

export const MOODS = ['calm', 'happy', 'irritable', 'anxious', 'low', 'weepy', 'energized'];

export const MUCUS = [
  { id: '', label: 'Not recorded' },
  { id: 'dry', label: 'Dry' },
  { id: 'sticky', label: 'Sticky' },
  { id: 'creamy', label: 'Creamy' },
  { id: 'eggwhite', label: 'Egg-white / stretchy' },
];

export function exampleState(today) {
  const state = emptyState();
  state.profile = {
    cycleLength: 28,
    periodLength: 5,
    methodId: 'combined-pill',
    anchorDate: shift(today, -10),
    years: 8,
    reminder: 'daily-pill',
  };
  const starts = [shift(today, -84), shift(today, -56), shift(today, -28)];
  state.periods = starts.map((start, index) => ({
    id: `example-p-${index}`,
    start,
    end: shift(start, 4),
    flow: 'medium',
  }));
  state.logs = [
    { id: 'example-l-1', date: shift(today, -2), flow: 'none', symptoms: ['cramps', 'bloating'], mood: ['irritable'], notes: 'Example note. This is sample data.', adherence: 'taken', bbt: '', mucus: '' },
    { id: 'example-l-2', date: shift(today, -1), flow: 'none', symptoms: ['fatigue'], mood: ['low'], notes: '', adherence: 'missed', bbt: 97.4, mucus: 'creamy' },
  ];
  state.medications = [
    { id: 'example-m-1', name: 'Ibuprofen', kind: 'otc' },
    { id: 'example-m-2', name: 'Vitamin D', kind: 'supplement' },
  ];
  state.labs = [
    { id: 'example-b-1', analyte: 'ferritin', date: shift(today, -120), value: 18, unit: 'ng/mL', refLow: 15, refHigh: 150, note: 'Example' },
    { id: 'example-b-2', analyte: 'ferritin', date: shift(today, -40), value: 28, unit: 'ng/mL', refLow: 15, refHigh: 150, note: 'Example' },
    { id: 'example-b-3', analyte: 'hemoglobin', date: shift(today, -120), value: 11.8, unit: 'g/dL', refLow: 12, refHigh: 15.5, note: 'Example' },
    { id: 'example-b-4', analyte: 'hemoglobin', date: shift(today, -40), value: 12.6, unit: 'g/dL', refLow: 12, refHigh: 15.5, note: 'Example' },
  ];
  return state;
}

function shift(iso, days) {
  const [year, month, day] = iso.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  date.setDate(date.getDate() + days);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
