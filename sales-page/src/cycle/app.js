import meta from '../../data/cycle/meta.json';
import methodsDoc from '../../data/cycle/methods.json';
import missedDoc from '../../data/cycle/missed-dose.json';
import interactionsDoc from '../../data/cycle/interactions.json';
import labsDoc from '../../data/cycle/labs.json';
import symptomsDoc from '../../data/cycle/symptoms.json';
import {
  addDays, todayISO, monthGrid, predictFromStarts, inRange, reminderFor, formatISODate, diffDays,
} from './predict.js';
import { adviseMissed, resolveFigures, matchInteractions, splitMedList, searchPassages } from './match.js';
import {
  loadState, saveState, clearState, sanitizeImport, newId, exampleState,
  FLOW, SYMPTOMS, MOODS, MUCUS,
} from './store.js';
import {
  isNativeApp, apiUrl, prepareNativeShell, enableReminders, refreshNativeReminders, clearNativeReminders,
} from './native.js';

const VIEWS = [
  ['calendar', 'Calendar'],
  ['log', 'Log'],
  ['methods', 'Methods'],
  ['missed', 'Missed dose'],
  ['interactions', 'Medications'],
  ['labs', 'Labs'],
  ['assistant', 'Symptom guide'],
  ['privacy', 'Privacy'],
];

const state = loadState();
const today = todayISO();
const now = new Date();
const ui = {
  year: now.getFullYear(),
  month: now.getMonth(),
  selected: today,
  methodOpen: state.profile.methodId || 'combined-pill',
  missed: {
    methodId: state.profile.methodId || 'combined-pill',
    situationId: '',
    hours: '',
    days: '',
    weeks: '',
    week: '2',
    sex: 'no',
    unsure: false,
    ready: false,
  },
  medQuery: '',
  medKind: 'otc',
  lookup: null,
  lookupError: '',
  analyte: 'ferritin',
  chat: loadChat(),
  assistantStatus: '',
  reminderStatus: '',
};

const app = document.querySelector('#app');
const live = document.querySelector('#cy-live');

app.addEventListener('click', onClick);
app.addEventListener('submit', onSubmit);
app.addEventListener('change', onChange);
window.addEventListener('hashchange', render);

if (isNativeApp()) document.body.classList.add('is-native');
render();
void prepareNativeShell();
void refreshNativeReminders(state.profile).then((result) => {
  if (!result?.message) return;
  ui.reminderStatus = result.message;
  if (!location.hash || location.hash === '#calendar') render();
});

function render() {
  const current = view();
  app.innerHTML = `
    <div class="cy">
      <p class="cy-kicker">On this device · educational</p>
      <h1>Cycle and birth-control tracker</h1>
      <p class="cy-lead">Log periods, symptoms, a birth-control method, medications, and lab results in one place. Predictions and missed-dose notes are compiled from public sources. They are not a diagnosis and not a personal risk score.</p>
      <p class="cy-reviewed">Reference data version ${esc(meta.version)}. Last reviewed ${esc(meta.lastReviewed)}. Nothing you type in the tracker is uploaded unless you choose a label lookup or the hosted symptom assistant.</p>
      <nav class="cy-tabs" aria-label="Tracker sections">
        ${VIEWS.map(([id, label]) => `<a href="#${id}" ${current === id ? 'aria-current="page"' : ''}>${esc(label)}</a>`).join('')}
      </nav>
      ${section(current)}
    </div>`;
  requestAnimationFrame(drawCharts);
}

function section(current) {
  if (current === 'calendar') return viewCalendar();
  if (current === 'log') return viewLog();
  if (current === 'methods') return viewMethods();
  if (current === 'missed') return viewMissed();
  if (current === 'interactions') return viewInteractions();
  if (current === 'labs') return viewLabs();
  if (current === 'assistant') return viewAssistant();
  return viewPrivacy();
}

function view() {
  const id = location.hash.replace('#', '');
  return VIEWS.some(([key]) => key === id) ? id : 'calendar';
}

function prediction() {
  return predictFromStarts(state.periods.map((period) => period.start), {
    cycleLength: state.profile.cycleLength,
    periodLength: state.profile.periodLength,
  });
}

function viewCalendar() {
  const forecast = prediction();
  const cells = monthGrid(ui.year, ui.month);
  const monthLabel = new Date(ui.year, ui.month, 1).toLocaleString(undefined, { month: 'long', year: 'numeric' });
  const reminder = reminderFor({ ...state.profile, reminder: methodById(state.profile.methodId)?.reminder }, state.logs, today);
  const selectedLog = state.logs.find((log) => log.date === ui.selected);
  return `
    ${reminder ? banner(reminder) : ''}
    <div class="cy-stats">
      ${stat('Next period', forecast.nextStart ? pretty(forecast.nextStart) : 'Log a period start', forecast.usingDefault ? 'Using your default cycle length until two periods are logged.' : `Average of ${forecast.sampleSize} cycle${forecast.sampleSize === 1 ? '' : 's'}: ${forecast.average} days.`)}
      ${stat('Estimated fertile days', forecast.fertileStart ? `${pretty(forecast.fertileStart)} – ${pretty(forecast.fertileEnd)}` : '—', 'Nine days ending 14 days before the next predicted period. CDC says a regular cycle has about nine or more fertile days and does not assign these dates.')}
      ${stat('Method', methodById(state.profile.methodId)?.name || 'None chosen', state.profile.anchorDate ? `Anchor ${pretty(state.profile.anchorDate)}` : 'Set a start date on the Methods tab.')}
    </div>
    <form id="reminder-time" class="cy-card" style="margin-top:12px">
      <h2>Reminder time</h2>
      <p class="cy-muted">${isNativeApp() ? 'Allow notifications to schedule a pill, patch, ring, or shot reminder on this phone. The log still works if you decline.' : 'This website only reminds you while the page is open. The Android and iPhone app uses this time for a notification that stays on the phone.'}</p>
      <div class="cy-row">
        <div class="cy-field"><label for="reminder-clock">Time</label><input id="reminder-clock" name="reminderTime" type="time" required value="${esc(clockValue(state.profile))}"></div>
        <button class="primary" type="submit">Save time</button>
        ${isNativeApp() ? '<button type="button" data-action="allow-reminders">Allow phone reminders</button>' : ''}
      </div>
      ${ui.reminderStatus ? `<p class="cy-muted">${esc(ui.reminderStatus)}</p>` : ''}
    </form>
    <p class="cy-muted" style="margin:12px 0">${forecast.irregular ? 'Recent cycles vary by more than a week, so this shading is a rough sketch.' : 'Days outside the blue mark are not safe days. This is a calendar estimate, not an ovulation test.'}</p>
    <div class="cy-grid-2">
      <section class="cy-card" aria-labelledby="cal-title">
        <div class="cy-row" style="justify-content:space-between;margin-bottom:8px">
          <button type="button" data-action="month" data-delta="-1" aria-label="Previous month">←</button>
          <h2 id="cal-title">${esc(monthLabel)}</h2>
          <button type="button" data-action="month" data-delta="1" aria-label="Next month">→</button>
        </div>
        <div class="cy-legend">
          <span><i class="cy-swatch" style="background:rgba(255,107,157,.7)"></i>Period (P)</span>
          <span><i class="cy-swatch" style="border:1px dashed #ff6b9d"></i>Predicted (~)</span>
          <span><i class="cy-swatch" style="background:#6bc5ff"></i>Fertile estimate (F)</span>
        </div>
        <div class="cy-cal-head" aria-hidden="true">${['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => `<span>${day}</span>`).join('')}</div>
        <div class="cy-cal-grid" role="grid" aria-label="${esc(monthLabel)}">
          ${cells.map((iso) => iso ? dayButton(iso, forecast) : '<span></span>').join('')}
        </div>
      </section>
      <section class="cy-card" aria-labelledby="day-title">
        <h2 id="day-title">${pretty(ui.selected)}</h2>
        <p>${selectedLog ? `Flow: ${esc(selectedLog.flow)}. ${esc((selectedLog.symptoms || []).join(', ') || 'No symptoms logged.')}` : 'Nothing logged.'}</p>
        <div class="cy-row" style="margin-top:10px">
          <button type="button" class="primary" data-action="start-period" data-date="${ui.selected}">Period started</button>
          <button type="button" data-action="end-period" data-date="${ui.selected}">Period ended</button>
          <a class="cy-btn" href="#log">Full log</a>
        </div>
        <form id="quick-flow" style="margin-top:12px">
          <label for="quick-flow-select">Flow on this day</label>
          <select id="quick-flow-select" name="flow">${FLOW.map((item) => `<option value="${item.id}" ${selectedLog?.flow === item.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select>
          <button class="primary" type="submit" style="margin-top:8px">Save flow</button>
        </form>
      </section>
    </div>`;
}

function dayButton(iso, forecast) {
  const period = coveringPeriod(iso);
  const predicted = forecast.nextStart && inRange(iso, forecast.nextStart, forecast.predictedPeriodEnd);
  const fertile = inRange(iso, forecast.fertileStart, forecast.fertileEnd);
  const marks = [period ? 'P' : '', predicted && !period ? '~' : '', fertile ? 'F' : ''].filter(Boolean).join(' ');
  const classes = ['cy-day', period ? 'period' : '', predicted && !period ? 'predicted' : '', fertile ? 'fertile' : '', iso === today ? 'today' : ''].filter(Boolean).join(' ');
  const label = `${pretty(iso)}${period ? ', period' : ''}${predicted && !period ? ', predicted period' : ''}${fertile ? ', estimated fertile day' : ''}`;
  return `<button type="button" class="${classes}" data-action="select-day" data-date="${iso}" aria-pressed="${iso === ui.selected}" aria-label="${esc(label)}">${Number(iso.slice(-2))}<small>${esc(marks)}</small></button>`;
}

function viewLog() {
  const date = ui.selected || today;
  const existing = state.logs.find((log) => log.date === date);
  const logs = [...state.logs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30);
  return `
    <form id="log-form" class="cy-card">
      <h2>Day log</h2>
      <div class="cy-row">
        <div class="cy-field"><label for="log-date">Date</label><input id="log-date" name="date" type="date" required value="${esc(existing?.date || date)}"></div>
        <div class="cy-field"><label for="log-flow">Flow</label><select id="log-flow" name="flow">${FLOW.map((item) => `<option value="${item.id}" ${(existing?.flow || 'none') === item.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div>
        <div class="cy-field"><label for="log-adh">Method today</label><select id="log-adh" name="adherence">
          <option value="">Not recorded</option>
          <option value="taken" ${existing?.adherence === 'taken' ? 'selected' : ''}>Taken / used / done</option>
          <option value="missed" ${existing?.adherence === 'missed' ? 'selected' : ''}>Missed or late</option>
          <option value="done" ${existing?.adherence === 'done' ? 'selected' : ''}>Patch, ring, or shot done</option>
        </select></div>
      </div>
      <p style="margin-top:12px"><label>Symptoms</label></p>
      <div class="cy-checks">${SYMPTOMS.map((item) => `<label><input type="checkbox" name="symptoms" value="${esc(item)}" ${(existing?.symptoms || []).includes(item) ? 'checked' : ''}> ${esc(item)}</label>`).join('')}</div>
      <p style="margin-top:12px"><label>Mood</label></p>
      <div class="cy-checks">${MOODS.map((item) => `<label><input type="checkbox" name="mood" value="${esc(item)}" ${(existing?.mood || []).includes(item) ? 'checked' : ''}> ${esc(item)}</label>`).join('')}</div>
      <div class="cy-row" style="margin-top:12px">
        <div class="cy-field"><label for="bbt">Temperature (optional)</label><input id="bbt" name="bbt" inputmode="decimal" value="${esc(existing?.bbt ?? '')}" placeholder="97.8"></div>
        <div class="cy-field"><label for="mucus">Cervical mucus (optional)</label><select id="mucus" name="mucus">${MUCUS.map((item) => `<option value="${item.id}" ${(existing?.mucus || '') === item.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div>
      </div>
      <div class="cy-field" style="margin-top:12px"><label for="notes">Notes</label><textarea id="notes" name="notes" maxlength="2000">${esc(existing?.notes || '')}</textarea></div>
      <p class="cy-muted" id="heavy-note" ${existing?.flow === 'heavy' ? '' : 'hidden'}>Heavy bleeding — soaking a pad or tampon every hour for two hours, or quarter-sized clots — is a reason to contact a clinician. Cleveland Clinic describes those thresholds.</p>
      <div class="cy-row" style="margin-top:12px">
        <button class="primary" type="submit">Save day</button>
        <button type="button" data-action="start-period" data-date="${esc(date)}">Mark period start</button>
        <button type="button" data-action="end-period" data-date="${esc(date)}">Mark period end</button>
      </div>
    </form>
    <section class="cy-card" style="margin-top:14px">
      <h2>Recent days</h2>
      ${logs.length ? `<div class="cy-table-wrap"><table><thead><tr><th>Date</th><th>Flow</th><th>Symptoms</th><th>Method</th><th></th></tr></thead><tbody>
        ${logs.map((log) => `<tr><td><button type="button" data-action="edit-log" data-date="${log.date}">${pretty(log.date)}</button></td><td>${esc(log.flow)}</td><td>${esc((log.symptoms || []).join(', '))}</td><td>${esc(log.adherence || '')}</td><td><button type="button" data-action="delete-log" data-id="${esc(log.id)}">Delete</button></td></tr>`).join('')}
      </tbody></table></div>` : '<p>No days logged yet.</p>'}
      <h3 style="margin-top:16px">Periods</h3>
      ${state.periods.length ? `<ul>${[...state.periods].sort((a, b) => b.start.localeCompare(a.start)).map((period) => `<li>${pretty(period.start)} – ${period.end ? pretty(period.end) : 'ongoing'} <button type="button" data-action="delete-period" data-id="${esc(period.id)}">Delete</button></li>`).join('')}</ul>` : '<p>No period start saved yet.</p>'}
    </section>`;
}

function viewMethods() {
  const open = methodById(ui.methodOpen) || methodsDoc.methods[0];
  return `
    <p>${esc(methodsDoc.intro)}</p>
    <div class="cy-methods" style="margin-top:12px">
      ${methodsDoc.methods.map((method) => `<button type="button" class="cy-card cy-method ${state.profile.methodId === method.id ? 'active' : ''}" data-action="open-method" data-id="${method.id}"><strong>${esc(method.name)}</strong><br><span class="cy-muted">${esc(method.group)}</span><br>${method.effectiveness[0] ? `<span>${esc(method.effectiveness[0].value)} typical-style figure</span>` : ''}</button>`).join('')}
    </div>
    <article class="cy-card" style="margin-top:14px">
      <h2>${esc(open.name)}</h2>
      <p>${esc(open.how)}</p>
      <p><strong>How to track it.</strong> ${esc(open.tracking)}</p>
      <p>${esc(open.sti)}</p>
      ${open.effectiveness.map((item) => figureBlock(item.value, item.label, item.note, item.sourceIds)).join('')}
      ${open.yearsNote ? `<p class="cy-muted">${esc(open.yearsNote)}</p>` : ''}
      <form id="method-form" class="cy-row">
        <input type="hidden" name="methodId" value="${esc(open.id)}">
        <div class="cy-field"><label for="anchor">Start, insertion, or last dose</label><input id="anchor" name="anchorDate" type="date" value="${state.profile.methodId === open.id ? esc(state.profile.anchorDate) : ''}"></div>
        ${open.reminder === 'long-acting' ? `<div class="cy-field"><label for="years">Years on your device</label><input id="years" name="years" type="number" min="1" max="15" value="${state.profile.methodId === open.id ? esc(state.profile.years) : esc(open.years || 3)}"></div>` : ''}
        <button class="primary" type="submit">Use this method</button>
      </form>
      <p class="cy-sources">${sourceLinks(open.sourceIds)}</p>
    </article>`;
}

function viewMissed() {
  const methodId = ui.missed.methodId;
  const pack = missedDoc.methods[methodId];
  const situations = pack?.situations || [];
  const situation = situations.find((item) => item.id === ui.missed.situationId) || situations[0];
  if (situation && ui.missed.situationId !== situation.id) ui.missed.situationId = situation.id;
  const fields = situation?.fields || [];
  const result = ui.missed.ready && situation ? adviseMissed(missedDoc, numericMissed()) : null;
  return `
    <p>${esc(missedDoc.intro)}</p>
    <form id="missed-form" class="cy-card" style="margin-top:12px">
      <h2>What happened</h2>
      <div class="cy-row">
        <div class="cy-field"><label for="m-method">Method</label><select id="m-method" name="methodId">${Object.keys(missedDoc.methods).map((id) => `<option value="${id}" ${id === methodId ? 'selected' : ''}>${esc(methodById(id)?.name || id)}</option>`).join('')}</select></div>
        <div class="cy-field"><label for="m-sit">Situation</label><select id="m-sit" name="situationId">${situations.map((item) => `<option value="${item.id}" ${item.id === situation?.id ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}</select></div>
      </div>
      <p class="cy-muted">${esc(situation?.help || '')}</p>
      <div class="cy-row">
        ${fields.includes('hours') ? `<div class="cy-field"><label for="m-hours">Hours</label><input id="m-hours" name="hours" inputmode="decimal" value="${esc(ui.missed.hours)}" required></div>` : ''}
        ${fields.includes('days') ? `<div class="cy-field"><label for="m-days">Days</label><input id="m-days" name="days" inputmode="decimal" value="${esc(ui.missed.days)}" required></div>` : ''}
        ${fields.includes('weeks') ? `<div class="cy-field"><label for="m-weeks">Weeks since last shot</label><input id="m-weeks" name="weeks" inputmode="decimal" value="${esc(ui.missed.weeks)}" required></div>` : ''}
        ${fields.includes('week') ? `<div class="cy-field"><label for="m-week">Week of the pack, patch, or ring</label><select id="m-week" name="week"><option value="1" ${ui.missed.week === '1' ? 'selected' : ''}>Week 1</option><option value="2" ${ui.missed.week === '2' ? 'selected' : ''}>Week 2</option><option value="3" ${ui.missed.week === '3' ? 'selected' : ''}>Week 3 / last hormone week</option><option value="unsure" ${ui.missed.week === 'unsure' ? 'selected' : ''}>Not sure</option></select></div>` : ''}
        ${fields.includes('sex') ? `<div class="cy-field"><label for="m-sex">Unprotected sex in the last 5 days</label><select id="m-sex" name="sex"><option value="no" ${ui.missed.sex === 'no' ? 'selected' : ''}>No</option><option value="yes" ${ui.missed.sex === 'yes' ? 'selected' : ''}>Yes</option><option value="unsure" ${ui.missed.sex === 'unsure' ? 'selected' : ''}>Not sure</option></select></div>` : ''}
      </div>
      ${fields.includes('unsure') ? `<label class="cy-checkline"><input type="checkbox" name="unsure" ${ui.missed.unsure ? 'checked' : ''}> I am not sure how long it was off or out</label>` : ''}
      <button class="primary" type="submit">Show the published guidance</button>
    </form>
    <div aria-live="polite">${result ? renderAdvice(result) : ''}</div>
    <section class="cy-card" style="margin-top:14px">
      <h2>${esc(missedDoc.emergencyPanel.title)}</h2>
      <ul>${missedDoc.emergencyPanel.points.map((point) => `<li>${esc(point)}</li>`).join('')}</ul>
      ${resolveFigures(missedDoc, missedDoc.emergencyPanel.figureIds).map(renderFigure).join('')}
    </section>`;
}

function renderAdvice(result) {
  return result.authorities.map((authority) => `
    <article class="cy-card" style="margin-top:14px">
      <h2>${esc(authority.name)}</h2>
      ${authority.rule ? `<h3>${esc(authority.rule.title)}</h3><ol>${authority.rule.actions.map((step) => `<li>${esc(step)}</li>`).join('')}</ol>${resolveFigures(missedDoc, authority.rule.figureIds).map(renderFigure).join('')}` : '<p>No published rule matched those numbers. Check the hours or days, or pick the closer situation. Nothing is guessed.</p>'}
      <p class="cy-sources">${sourceLinks([authority.sourceId])}</p>
    </article>`).join('');
}

function viewInteractions() {
  const saved = state.medications.map((med) => med.name).join('\n');
  const query = [ui.medQuery, ...state.medications.map((med) => med.name)].filter(Boolean).join('\n');
  const hits = matchInteractions(interactionsDoc.entries, query);
  const unmatched = splitMedList(ui.medQuery).filter((name) => !matchInteractions(interactionsDoc.entries, name).length);
  return `
    <p>${esc(interactionsDoc.intro)}</p>
    <form id="med-form" class="cy-card" style="margin-top:12px">
      <h2>Medications on this device</h2>
      <div class="cy-row">
        <div class="cy-field"><label for="med-name">Name</label><input id="med-name" name="name" required placeholder="For example, rifampin"></div>
        <div class="cy-field"><label for="med-kind">Type</label><select id="med-kind" name="kind"><option value="rx">Prescription</option><option value="otc">OTC</option><option value="supplement">Supplement</option></select></div>
        <button class="primary" type="submit">Save on this device</button>
      </div>
      ${state.medications.length ? `<ul>${state.medications.map((med) => `<li>${esc(med.name)} <span class="cy-muted">(${esc(med.kind)})</span> <button type="button" data-action="delete-med" data-id="${esc(med.id)}">Remove</button> <button type="button" data-action="lookup-med" data-name="${esc(med.name)}">Look up label</button></li>`).join('')}</ul>` : '<p class="cy-muted">Nothing saved. The list stays in this browser.</p>'}
    </form>
    <form id="check-form" class="cy-card" style="margin-top:14px">
      <h2>Check a name</h2>
      <label for="med-query">One name, or several separated by commas. Saved medications are included.</label>
      <textarea id="med-query" name="query">${esc(ui.medQuery)}</textarea>
      <button class="primary" type="submit" style="margin-top:8px">Check the curated list</button>
      <p class="cy-muted">Looking up a label sends only that drug name to this site’s server, which asks openFDA. Cycle logs are not sent.</p>
    </form>
    <div aria-live="polite">
      ${hits.map(renderHit).join('')}
      ${unmatched.length ? `<p class="cy-banner info">No curated flag for ${esc(unmatched.join(', '))}. That is not a reason to assume it is fine with hormonal birth control. Use “Look up label” on a saved medicine, or type one name and check again.</p>` : ''}
      ${lookupCard()}
    </div>
    <p class="cy-muted" style="margin-top:8px">Saved list used for the check: ${saved ? esc(state.medications.map((med) => med.name).join(', ')) : 'none'}.</p>`;
}

function renderHit(entry) {
  return `<article class="cy-card" style="margin-top:12px">
    <h3>${esc(entry.name)} <span class="cy-flag ${esc(entry.flag)}">${esc(entry.flag.replaceAll('-', ' '))}</span></h3>
    <p>${esc(entry.summary)}</p>
    <div class="cy-table-wrap"><table><thead><tr><th>Method group</th><th>What the source says</th></tr></thead><tbody>
      ${Object.entries(entry.methods).map(([key, value]) => `<tr><td>${esc(key)}</td><td>${esc(value)}${interactionsDoc.categoryLegend[value] ? ` — ${esc(interactionsDoc.categoryLegend[value])}` : ''}</td></tr>`).join('')}
    </tbody></table></div>
    <p><strong>Confirm with your pharmacist</strong> before you change a pill time, add backup, or stop a medicine.</p>
    <p class="cy-sources">${sourceLinks(entry.sourceIds)}</p>
    <button type="button" data-action="lookup-med" data-name="${esc(entry.matchedAlias || entry.name)}">Look up the openFDA label</button>
  </article>`;
}

function lookupCard() {
  if (ui.lookupError) return `<p class="cy-banner alert">${esc(ui.lookupError)}</p>`;
  if (!ui.lookup) return '';
  const rows = ui.lookup.results || [];
  if (!rows.length) return `<p class="cy-banner info">openFDA returned no label for “${esc(ui.lookup.query)}”.</p>`;
  return rows.map((row) => `<article class="cy-card" style="margin-top:12px"><h3>Label excerpt: ${esc(row.title || ui.lookup.query)}</h3><p class="cy-muted">Excerpt only, trimmed. ${esc(row.note || '')}</p><p>${esc(row.excerpt || 'This label has no drug_interactions section in the openFDA record.')}</p><p class="cy-sources">${row.url ? `<a href="${esc(row.url)}" target="_blank" rel="noopener noreferrer">Open the label</a>` : ''}</p><p><strong>Confirm with your pharmacist.</strong></p></article>`).join('');
}

function viewLabs() {
  const info = labsDoc.analytes.find((item) => item.id === ui.analyte) || labsDoc.analytes[0];
  const rows = state.labs.filter((lab) => lab.analyte === info.id).sort((a, b) => a.date.localeCompare(b.date));
  return `
    <p>${esc(labsDoc.intro)}</p>
    <div class="cy-grid-2" style="margin-top:12px">
      <form id="lab-form" class="cy-card">
        <h2>Add a result</h2>
        <div class="cy-field"><label for="analyte">Test</label><select id="analyte" name="analyte">${labsDoc.analytes.map((item) => `<option value="${item.id}" ${item.id === info.id ? 'selected' : ''}>${esc(item.name)}</option>`).join('')}</select></div>
        <div class="cy-row">
          <div class="cy-field"><label for="lab-date">Date</label><input id="lab-date" name="date" type="date" required value="${today}"></div>
          <div class="cy-field"><label for="lab-value">Value</label><input id="lab-value" name="value" inputmode="decimal" required></div>
          <div class="cy-field"><label for="lab-unit">Unit</label><input id="lab-unit" name="unit" value="${esc(info.suggestedUnit)}"></div>
        </div>
        <div class="cy-row">
          <div class="cy-field"><label for="ref-low">Reference low</label><input id="ref-low" name="refLow" inputmode="decimal"></div>
          <div class="cy-field"><label for="ref-high">Reference high</label><input id="ref-high" name="refHigh" inputmode="decimal"></div>
        </div>
        <div class="cy-field"><label for="lab-note">Note</label><input id="lab-note" name="note" maxlength="300"></div>
        <button class="primary" type="submit" style="margin-top:8px">Save result</button>
      </form>
      <article class="cy-card">
        <h2>${esc(info.name)}</h2>
        <p>${esc(info.about)}</p>
        <p>${esc(info.cycleNote)}</p>
        <p class="cy-sources">${sourceLinks(info.sourceIds)}</p>
      </article>
    </div>
    <section class="cy-card" style="margin-top:14px">
      <h2>Trend</h2>
      ${rows.length >= 2 ? `<canvas data-chart="${esc(info.id)}" width="640" height="220" aria-hidden="true"></canvas>` : '<p>Add at least two results for this test to draw a line. The table is the record either way.</p>'}
      ${rows.length ? `<div class="cy-table-wrap"><table><caption class="cy-muted">${esc(info.name)} results on this device</caption><thead><tr><th>Date</th><th>Value</th><th>Unit</th><th>Reference</th><th>Note</th><th></th></tr></thead><tbody>
        ${rows.map((lab) => `<tr><td>${pretty(lab.date)}</td><td>${esc(lab.value)}</td><td>${esc(lab.unit)}</td><td>${lab.refLow !== '' || lab.refHigh !== '' ? `${esc(lab.refLow)}–${esc(lab.refHigh)}` : '—'}</td><td>${esc(lab.note)}</td><td><button type="button" data-action="delete-lab" data-id="${esc(lab.id)}">Delete</button></td></tr>`).join('')}
      </tbody></table></div>` : '<p>No results for this test.</p>'}
    </section>`;
}

function viewAssistant() {
  return `
    <p>This guide answers from a short library compiled from ACOG, Mayo Clinic, Cleveland Clinic, CDC, NHS, and MedlinePlus. It explains common possibilities. It does not diagnose you.</p>
    <form id="ask-form" class="cy-card" style="margin-top:12px">
      <label for="ask">What are you noticing?</label>
      <textarea id="ask" name="question" maxlength="2000" placeholder="For example: brown blood at the end of my period, or fishy odor after sex"></textarea>
      <div class="cy-row" style="margin-top:8px">
        <button class="primary" type="submit" name="mode" value="library">Explain from the library</button>
        <button type="submit" name="mode" value="hosted">Also ask the hosted assistant</button>
      </div>
      <p class="cy-muted">The library button stays on this device. The hosted button sends only the text in the box. Tracker, medication, and lab entries are not attached. ${esc(ui.assistantStatus)}</p>
    </form>
    <div class="cy-checks" style="margin-top:10px">
      ${['fishy odor after sex', 'brown blood at the end of my period', 'coconut oil and a latex condom', 'toy was not cleaned', 'antibacterial soap', 'burning when I pee'].map((prompt) => `<button type="button" data-action="prompt" data-prompt="${esc(prompt)}">${esc(prompt)}</button>`).join('')}
    </div>
    <div class="cy-chat" style="margin-top:12px" aria-live="polite">
      ${ui.chat.map((message) => `<div class="cy-bubble ${esc(message.role)}">${linkify(message.text)}</div>`).join('')}
    </div>`;
}

function viewPrivacy() {
  return `
    <section class="cy-card">
      <h2>What stays here</h2>
      <p>Period logs, the method you picked, medications, and lab numbers are stored in localStorage on this device. There is no account. This page does not load analytics. Export and import are JSON files you keep.</p>
      <p>A label lookup sends the drug name. The hosted assistant sends the question you submit. If you type a lab value or a story into that box, that text is included, because you put it there.</p>
      <p><a href="privacy.html">Privacy policy and educational terms</a></p>
      <div class="cy-row">
        <button type="button" class="primary" data-action="export">Export JSON</button>
        <button type="button" data-action="example">Load example data</button>
      </div>
      <form id="import-form" style="margin-top:12px">
        <label for="import-file">Import a JSON file</label>
        <input id="import-file" name="file" type="file" accept="application/json,.json">
        <button type="submit">Replace data on this device</button>
      </form>
    </section>
    <form id="delete-form" class="cy-card" style="margin-top:14px">
      <h2>Delete all my data</h2>
      <label class="cy-checkline"><input type="checkbox" name="confirm"> I understand this removes logs, medications, labs, and the symptom chat from this browser.</label>
      <button class="warn" type="submit" style="margin-top:8px">Delete all my data</button>
    </form>`;
}

function onClick(event) {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'month') {
    const next = new Date(ui.year, ui.month + Number(button.dataset.delta), 1);
    ui.year = next.getFullYear();
    ui.month = next.getMonth();
    render();
  } else if (action === 'select-day' || action === 'edit-log') {
    ui.selected = button.dataset.date;
    if (action === 'edit-log') location.hash = '#log';
    render();
  } else if (action === 'start-period') {
    startPeriod(button.dataset.date);
    announce('Period start saved on this device.');
    render();
  } else if (action === 'end-period') {
    endPeriod(button.dataset.date);
    announce('Period end saved on this device.');
    render();
  } else if (action === 'delete-log') {
    state.logs = state.logs.filter((log) => log.id !== button.dataset.id);
    saveState(state);
    render();
  } else if (action === 'delete-period') {
    state.periods = state.periods.filter((period) => period.id !== button.dataset.id);
    saveState(state);
    render();
  } else if (action === 'open-method') {
    ui.methodOpen = button.dataset.id;
    render();
  } else if (action === 'delete-med') {
    state.medications = state.medications.filter((med) => med.id !== button.dataset.id);
    saveState(state);
    render();
  } else if (action === 'lookup-med') {
    lookupDrug(button.dataset.name);
  } else if (action === 'delete-lab') {
    state.labs = state.labs.filter((lab) => lab.id !== button.dataset.id);
    saveState(state);
    render();
  } else if (action === 'prompt') {
    const box = document.querySelector('#ask');
    if (box) box.value = button.dataset.prompt;
  } else if (action === 'export') {
    exportJson();
  } else if (action === 'allow-reminders') {
    void enableReminders(state.profile).then((result) => {
      ui.reminderStatus = result.message;
      announce(result.message);
      render();
    });
  } else if (action === 'example') {
    const sample = exampleState(today);
    Object.assign(state, sample);
    saveState(state);
    ui.missed.methodId = state.profile.methodId;
    announce('Example data loaded on this device.');
    location.hash = '#calendar';
    render();
  }
}

function onChange(event) {
  if (event.target.id === 'm-method' || event.target.id === 'm-sit') {
    readMissed(event.target.form);
    ui.missed.ready = false;
    render();
  }
  if (event.target.id === 'analyte') {
    ui.analyte = event.target.value;
    render();
  }
  if (event.target.id === 'log-flow') {
    const note = document.querySelector('#heavy-note');
    if (note) note.hidden = event.target.value !== 'heavy';
  }
}

function onSubmit(event) {
  const form = event.target;
  if (!(form instanceof HTMLFormElement) || !app.contains(form)) return;
  event.preventDefault();
  const data = new FormData(form);
  if (form.id === 'quick-flow') saveFlow(ui.selected, String(data.get('flow') || 'none'));
  if (form.id === 'log-form') saveLog(data);
  if (form.id === 'method-form') saveMethod(data);
  if (form.id === 'reminder-time') saveReminderTime(data);
  if (form.id === 'missed-form') {
    readMissed(form);
    ui.missed.ready = true;
    render();
    return;
  }
  if (form.id === 'med-form') {
    state.medications.push({ id: newId(), name: String(data.get('name') || '').slice(0, 120), kind: String(data.get('kind') || 'otc') });
    saveState(state);
    render();
    return;
  }
  if (form.id === 'check-form') {
    ui.medQuery = String(data.get('query') || '');
    ui.lookup = null;
    render();
    return;
  }
  if (form.id === 'lab-form') saveLab(data);
  if (form.id === 'ask-form') ask(String(data.get('question') || ''), event.submitter?.value || 'library');
  if (form.id === 'import-form') importFile(data.get('file'));
  if (form.id === 'delete-form') {
    if (!data.get('confirm')) {
      announce('Check the box to confirm delete.');
      return;
    }
    clearState();
    void clearNativeReminders();
    const blank = emptyFromClear();
    state.profile = blank.profile;
    state.periods = [];
    state.logs = [];
    state.medications = [];
    state.labs = [];
    ui.chat = [];
    announce('Data on this device was deleted.');
    render();
  }
}

function emptyFromClear() {
  const blank = sanitizeImport({ profile: {}, periods: [], logs: [], medications: [], labs: [] });
  return blank;
}

function saveFlow(date, flow) {
  const existing = state.logs.find((log) => log.date === date);
  upsertLog({
    date,
    flow,
    symptoms: existing?.symptoms || [],
    mood: existing?.mood || [],
    notes: existing?.notes || '',
    adherence: existing?.adherence || '',
    bbt: existing?.bbt ?? '',
    mucus: existing?.mucus || '',
  });
  if (flow !== 'none') touchPeriod(date, flow);
  saveState(state);
  announce('Flow saved.');
  render();
}

function saveLog(data) {
  const date = String(data.get('date') || '');
  const flow = String(data.get('flow') || 'none');
  upsertLog({
    date,
    flow,
    symptoms: data.getAll('symptoms').map(String),
    mood: data.getAll('mood').map(String),
    notes: String(data.get('notes') || ''),
    adherence: String(data.get('adherence') || ''),
    bbt: data.get('bbt') === '' ? '' : Number(data.get('bbt')),
    mucus: String(data.get('mucus') || ''),
  });
  ui.selected = date;
  if (flow !== 'none') touchPeriod(date, flow);
  saveState(state);
  announce('Day saved on this device.');
  render();
}

function upsertLog(entry) {
  const index = state.logs.findIndex((log) => log.date === entry.date);
  if (index >= 0) state.logs[index] = { ...state.logs[index], ...entry, id: state.logs[index].id };
  else state.logs.push({ id: newId(), ...entry });
}

function touchPeriod(date, flow) {
  const prev = addDays(date, -1);
  const adjacent = state.periods.find((period) => period.end === prev || (!period.end && period.start <= date));
  if (adjacent && adjacent.start <= date && (!adjacent.end || adjacent.end >= prev)) {
    if (!adjacent.end || adjacent.end < date) adjacent.end = date;
    adjacent.flow = flow;
    return;
  }
  const covering = coveringPeriod(date);
  if (covering) {
    covering.flow = flow;
    return;
  }
  state.periods.push({ id: newId(), start: date, end: date, flow });
}

function startPeriod(date) {
  state.periods.forEach((period) => {
    if (!period.end && period.start < date) period.end = addDays(date, -1);
  });
  state.periods = state.periods.filter((period) => period.start !== date);
  state.periods.push({ id: newId(), start: date, end: '', flow: 'medium' });
  ui.selected = date;
  saveState(state);
}

function endPeriod(date) {
  const target = [...state.periods].reverse().find((period) => period.start <= date && (!period.end || period.end >= date));
  if (target) target.end = date;
  ui.selected = date;
  saveState(state);
}

function coveringPeriod(iso) {
  return state.periods.find((period) => period.start <= iso && (period.end ? period.end >= iso : iso <= today));
}

function saveMethod(data) {
  const method = methodById(String(data.get('methodId')));
  state.profile.methodId = method.id;
  state.profile.reminder = method.reminder;
  state.profile.anchorDate = String(data.get('anchorDate') || '');
  if (data.get('years')) state.profile.years = Number(data.get('years'));
  else if (method.years) state.profile.years = method.years;
  ui.missed.methodId = method.id;
  saveState(state);
  announce(`${method.name} saved on this device.`);
  void refreshNativeReminders(state.profile).then((result) => {
    if (result?.message) ui.reminderStatus = result.message;
  });
  render();
}

function saveReminderTime(data) {
  const [hour, minute] = String(data.get('reminderTime') || '09:00').split(':').map(Number);
  state.profile.reminderHour = Number.isFinite(hour) ? hour : 9;
  state.profile.reminderMinute = Number.isFinite(minute) ? minute : 0;
  saveState(state);
  void refreshNativeReminders(state.profile).then((result) => {
    ui.reminderStatus = result?.message || 'Reminder time saved on this device.';
    announce(ui.reminderStatus);
    render();
  });
}

function clockValue(profile) {
  const hour = String(profile.reminderHour ?? 9).padStart(2, '0');
  const minute = String(profile.reminderMinute ?? 0).padStart(2, '0');
  return `${hour}:${minute}`;
}

function readMissed(form) {
  const data = new FormData(form);
  ui.missed = {
    ...ui.missed,
    methodId: String(data.get('methodId') || ui.missed.methodId),
    situationId: String(data.get('situationId') || ''),
    hours: String(data.get('hours') ?? ui.missed.hours ?? ''),
    days: String(data.get('days') ?? ui.missed.days ?? ''),
    weeks: String(data.get('weeks') ?? ui.missed.weeks ?? ''),
    week: String(data.get('week') || ui.missed.week || '2'),
    sex: String(data.get('sex') || 'no'),
    unsure: data.get('unsure') === 'on' || data.get('unsure') === 'true',
  };
}

function numericMissed() {
  return {
    methodId: ui.missed.methodId,
    situationId: ui.missed.situationId,
    hours: ui.missed.hours === '' ? NaN : Number(ui.missed.hours),
    days: ui.missed.days === '' ? NaN : Number(ui.missed.days),
    weeks: ui.missed.weeks === '' ? NaN : Number(ui.missed.weeks),
    week: ui.missed.week,
    sex: ui.missed.sex,
    unsure: ui.missed.unsure,
  };
}

function saveLab(data) {
  const value = Number(data.get('value'));
  if (!Number.isFinite(value)) return;
  state.labs.push({
    id: newId(),
    analyte: String(data.get('analyte')),
    date: String(data.get('date')),
    value,
    unit: String(data.get('unit') || ''),
    refLow: data.get('refLow') === '' ? '' : Number(data.get('refLow')),
    refHigh: data.get('refHigh') === '' ? '' : Number(data.get('refHigh')),
    note: String(data.get('note') || ''),
  });
  ui.analyte = String(data.get('analyte'));
  saveState(state);
  announce('Lab result saved on this device.');
  render();
}

async function lookupDrug(name) {
  ui.lookupError = '';
  ui.lookup = null;
  announce('Looking up the public label.');
  render();
  try {
    const response = await fetch(apiUrl(`/api/drug-lookup?q=${encodeURIComponent(name)}`));
    const body = await response.json();
    if (!response.ok || body.ok === false) throw new Error(body.message || 'Label lookup failed.');
    ui.lookup = body;
  } catch (error) {
    ui.lookupError = `Label lookup did not complete (${error.message}). The curated note above is unchanged. Confirm with your pharmacist.`;
  }
  render();
}

function libraryAnswer(question) {
  const passages = searchPassages(symptomsDoc.passages, question, 3);
  if (!passages.length) {
    return 'The library does not have a passage that matches that question. It covers discharge, odor, period-blood color, soap and douching, lube, toys, yeast and BV care, and urinary burning. For fever, pelvic pain, heavy bleeding, pregnancy, or a possible STI, contact a clinician.';
  }
  return passages.map((passage) => {
    const sources = passage.sourceIds.map((id) => `${meta.sources[id].publisher}: ${meta.sources[id].url}`).join('\n');
    const see = passage.clinicianIf?.length ? `\nSee a clinician if: ${passage.clinicianIf.join(' ')}` : '';
    return `${passage.title}\n${passage.body}${see}\n${sources}`;
  }).join('\n\n');
}

async function ask(question, mode) {
  const text = question.trim();
  if (!text) return;
  ui.chat.push({ role: 'user', text });
  const grounded = libraryAnswer(text);
  if (mode === 'hosted') {
    ui.assistantStatus = 'Sending the question only.';
    ui.chat.push({ role: 'library', text: grounded });
    saveChat();
    render();
    try {
      const response = await fetch(apiUrl('/api/cycle-assistant'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: ui.chat.filter((message) => message.role === 'user').slice(-6).map((message) => ({ role: 'user', content: message.text })) }),
      });
      const body = await response.json();
      if (body.mode === 'model' && body.answer) {
        ui.chat.push({ role: 'model', text: body.answer });
        ui.assistantStatus = 'Hosted answer added under the library text.';
      } else {
        ui.assistantStatus = body.setup || body.warning || 'Hosted assistant is not available. The library answer above is the one to use.';
      }
    } catch (error) {
      ui.assistantStatus = `The hosted assistant could not be reached (${error.message}). The library answer is still above.`;
    }
  } else {
    ui.chat.push({ role: 'library', text: grounded });
    ui.assistantStatus = 'Answered from the on-device library. Nothing was sent.';
  }
  ui.chat = ui.chat.slice(-12);
  saveChat();
  render();
}

function exportJson() {
  const blob = new Blob([JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'cycle-tracker.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importFile(file) {
  if (!(file instanceof File)) return;
  try {
    const parsed = sanitizeImport(JSON.parse(await file.text()));
    if (!parsed) throw new Error('That file is not a tracker export.');
    Object.assign(state, parsed);
    saveState(state);
    announce('Import replaced the data on this device.');
    render();
  } catch (error) {
    announce(error.message);
  }
}

function drawCharts() {
  document.querySelectorAll('canvas[data-chart]').forEach((canvas) => {
    const rows = state.labs.filter((lab) => lab.analyte === canvas.dataset.chart).sort((a, b) => a.date.localeCompare(b.date));
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#0a0a12';
    ctx.fillRect(0, 0, width, height);
    const values = rows.map((row) => row.value);
    const low = Math.min(...values, ...rows.map((row) => (row.refLow === '' ? Infinity : row.refLow)));
    const high = Math.max(...values, ...rows.map((row) => (row.refHigh === '' ? -Infinity : row.refHigh)));
    const span = high - low || 1;
    const x = (index) => 40 + ((width - 60) * index) / Math.max(rows.length - 1, 1);
    const y = (value) => 20 + ((height - 40) * (high - value)) / span;
    const refLow = rows[rows.length - 1].refLow;
    const refHigh = rows[rows.length - 1].refHigh;
    if (refLow !== '' && refHigh !== '') {
      ctx.fillStyle = 'rgba(74,222,128,0.12)';
      ctx.fillRect(40, y(refHigh), width - 60, y(refLow) - y(refHigh));
    }
    ctx.strokeStyle = '#6bc5ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    rows.forEach((row, index) => {
      if (index === 0) ctx.moveTo(x(index), y(row.value));
      else ctx.lineTo(x(index), y(row.value));
    });
    ctx.stroke();
    ctx.fillStyle = '#e8e8f0';
    ctx.font = '12px sans-serif';
    ctx.fillText(String(Math.round(high * 100) / 100), 6, 16);
    ctx.fillText(String(Math.round(low * 100) / 100), 6, height - 8);
    rows.forEach((row, index) => {
      ctx.beginPath();
      ctx.arc(x(index), y(row.value), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  });
}

function methodById(id) {
  return methodsDoc.methods.find((method) => method.id === id);
}

function figureBlock(value, label, note, sourceIds) {
  return `<div class="cy-figure"><strong>${esc(value)}</strong> — ${esc(label)}<br>${esc(note || '')}<div class="cy-sources">${sourceLinks(sourceIds)}</div></div>`;
}

function renderFigure(figure) {
  return figureBlock(figure.value, figure.label, figure.detail, figure.sourceIds);
}

function sourceLinks(ids) {
  return (ids || []).filter((id) => meta.sources[id]).map((id) => {
    const source = meta.sources[id];
    return `<a href="${esc(source.url)}" target="_blank" rel="noopener noreferrer">${esc(source.publisher)}</a>`;
  }).join(' ');
}

function stat(label, value, note) {
  return `<div class="cy-card cy-stat"><span class="cy-muted">${esc(label)}</span><strong>${esc(value)}</strong><span class="cy-muted">${esc(note)}</span></div>`;
}

function banner(reminder) {
  return `<div class="cy-banner ${esc(reminder.tone)}"><strong>${esc(reminder.title)}</strong><br>${esc(reminder.detail)}</div>`;
}

function pretty(iso) {
  const [year, month, day] = String(iso).split('-').map(Number);
  if (!year) return iso;
  return new Date(year, month - 1, day).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function announce(message) {
  if (live) live.textContent = message;
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function linkify(value) {
  return esc(value).replace(/https:\/\/[^\s<]+/g, (url) => `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`);
}

function loadChat() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem('gwf.cycleChat.v1') || '[]');
    return Array.isArray(parsed) ? parsed.slice(-12) : [];
  } catch {
    return [];
  }
}

function saveChat() {
  try {
    sessionStorage.setItem('gwf.cycleChat.v1', JSON.stringify(ui.chat));
  } catch {
    /* ignore quota */
  }
}
