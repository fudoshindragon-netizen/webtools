/** Pure lookups over the cited JSON. No network and no DOM. */

export function ruleMatches(match, input) {
  if (!match || Object.keys(match).length === 0) return true;
  if (match.unsure === true && input.unsure !== true) return false;
  if (match.unsure === false && input.unsure === true) return false;
  if (Array.isArray(match.week) && !match.week.includes(input.week)) return false;

  const numeric = [
    ['hours', 'hoursMaxExclusive', (value, limit) => value < limit],
    ['hours', 'hoursMin', (value, limit) => value >= limit],
    ['hours', 'hoursMax', (value, limit) => value <= limit],
    ['hours', 'hoursMinExclusive', (value, limit) => value > limit],
    ['days', 'daysMax', (value, limit) => value <= limit],
    ['days', 'daysMin', (value, limit) => value >= limit],
    ['days', 'daysMinExclusive', (value, limit) => value > limit],
    ['days', 'daysMaxExclusive', (value, limit) => value < limit],
    ['weeks', 'weeksMax', (value, limit) => value <= limit],
    ['weeks', 'weeksMin', (value, limit) => value >= limit],
    ['weeks', 'weeksMinExclusive', (value, limit) => value > limit],
    ['weeks', 'weeksMaxExclusive', (value, limit) => value < limit],
  ];

  for (const [field, key, test] of numeric) {
    if (match[key] == null) continue;
    const value = Number(input[field]);
    if (!Number.isFinite(value) || !test(value, match[key])) return false;
  }
  return true;
}

export function adviseMissed(catalog, input) {
  const method = catalog?.methods?.[input?.methodId];
  if (!method) return { ok: false, reason: 'unknown-method' };
  const situation = (method.situations || []).find((item) => item.id === input.situationId) || method.situations?.[0];
  if (!situation) return { ok: false, reason: 'unknown-situation' };

  const authorities = (situation.authorities || []).map((authority) => {
    const rule = (authority.rules || []).find((candidate) => ruleMatches(candidate.match, input));
    return {
      id: authority.id,
      name: authority.name,
      sourceId: authority.sourceId,
      rule: rule
        ? {
            id: rule.id,
            title: rule.title,
            actions: rule.actions,
            figureIds: rule.figureIds || [],
          }
        : null,
    };
  });

  return {
    ok: true,
    situation: { id: situation.id, label: situation.label, help: situation.help, fields: situation.fields || [] },
    authorities,
  };
}

export function resolveFigures(catalog, ids) {
  const unique = [...new Set(ids || [])];
  return unique.map((id) => ({ id, ...(catalog.figures?.[id] || { label: id, value: 'Missing figure', detail: '', sourceIds: [] }) }));
}

export function normalizeMed(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[^a-z0-9+]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function phraseIn(haystack, phrase) {
  const hay = ` ${normalizeMed(haystack)} `;
  const needle = ` ${normalizeMed(phrase)} `;
  if (needle === '  ') return false;
  return hay.includes(needle);
}

export function matchInteractions(entries, query) {
  const text = normalizeMed(query);
  if (!text) return [];
  const hits = [];
  for (const entry of entries || []) {
    const aliases = entry.aliases?.length ? entry.aliases : [entry.name];
    const matched = aliases.filter((alias) => phraseIn(text, alias));
    if (matched.length) hits.push({ ...entry, matchedAlias: matched[0] });
  }
  return hits;
}

export function splitMedList(value) {
  return String(value || '')
    .split(/[\n,;]+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

const STOP = new Set(['what', 'does', 'with', 'that', 'this', 'have', 'after', 'from', 'your', 'about', 'when', 'been', 'were', 'they', 'them', 'just', 'like', 'into', 'over', 'than', 'then', 'some', 'very', 'using', 'used']);

export function searchPassages(passages, query, limit = 3) {
  const tokens = normalizeMed(query)
    .split(' ')
    .filter((token) => token.length > 2 && !STOP.has(token));
  if (!tokens.length) return [];
  const scored = (passages || []).map((passage) => {
    const hay = normalizeMed(`${passage.title} ${passage.keywords?.join(' ') || ''} ${passage.body}`);
    let score = 0;
    for (const token of tokens) {
      if (hay.includes(token)) score += 1;
      if ((passage.keywords || []).some((keyword) => normalizeMed(keyword).includes(token))) score += 2;
    }
    return { passage, score };
  });
  return scored
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.passage);
}

export function collectSourceIds(value, found = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectSourceIds(item, found));
    return found;
  }
  if (value && typeof value === 'object') {
    if (Array.isArray(value.sourceIds)) value.sourceIds.forEach((id) => found.add(id));
    if (typeof value.sourceId === 'string') found.add(value.sourceId);
    Object.values(value).forEach((item) => collectSourceIds(item, found));
  }
  return found;
}
