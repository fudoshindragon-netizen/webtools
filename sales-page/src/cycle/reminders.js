import { addDays, addYears, parseISODate, diffDays } from './predict.js';

/** Ids we own. Cancelling this list clears every reminder this app scheduled. */
export function reminderIds() {
  const ids = [1101, 1201, 1401, 1402, 1501, 1502];
  for (let i = 0; i < 16; i += 1) ids.push(1301 + i);
  return ids;
}

function clock(profile, defaults) {
  const hour = Number.isFinite(Number(profile.reminderHour)) ? Number(profile.reminderHour) : defaults.hour;
  const minute = Number.isFinite(Number(profile.reminderMinute)) ? Number(profile.reminderMinute) : defaults.minute;
  return {
    hour: Math.min(23, Math.max(0, hour)),
    minute: Math.min(59, Math.max(0, minute)),
  };
}

function localDate(iso, hour, minute) {
  const date = parseISODate(iso);
  if (!date) return null;
  date.setHours(hour, minute, 0, 0);
  return date;
}

function isFuture(date, now) {
  return date && date.getTime() > now.getTime();
}

function oneShot(id, title, body, when) {
  return {
    id,
    title,
    body,
    schedule: { at: when.toISOString(), allowWhileIdle: true },
  };
}

/**
 * Notification plan for the phone app. Repeating pill and patch reminders keep
 * firing if the app is not opened. Ring and shot dates are the next concrete
 * occurrences; opening the app replaces them.
 */
export function planReminders(profile, today, options = {}) {
  const now = options.now instanceof Date ? options.now : new Date();
  const defaults = { hour: options.hour ?? 9, minute: options.minute ?? 0 };
  const { hour, minute } = clock(profile || {}, defaults);
  const kind = profile?.reminder || '';
  const anchor = profile?.anchorDate || '';
  if (!kind || !parseISODate(anchor) || diffDays(today, anchor) == null) return [];

  if (diffDays(today, anchor) < 0) {
    const start = localDate(anchor, hour, minute);
    if (!isFuture(start, now)) return [];
    return [oneShot(1101, 'Method date', 'The start date you saved in Luna Cycle is today. Open the app to keep logging.', start)];
  }

  if (kind === 'daily-pill') {
    return [{
      id: 1101,
      title: 'Time for your pill',
      body: 'A reminder you set on this phone. It is not a medical instruction.',
      schedule: { repeats: true, on: { hour, minute }, allowWhileIdle: true },
    }];
  }

  if (kind === 'weekly-patch') {
    const weekday = parseISODate(anchor).getDay() + 1;
    return [{
      id: 1201,
      title: 'Patch day',
      body: 'Apply a new patch, or remove it if this is your patch-free week. The app shows which week you are in.',
      schedule: { repeats: true, on: { weekday, hour, minute }, allowWhileIdle: true },
    }];
  }

  if (kind === 'ring-21-7') {
    let cycleStart = anchor;
    let guard = 0;
    while (addDays(cycleStart, 27) < today && guard < 48) {
      cycleStart = addDays(cycleStart, 28);
      guard += 1;
    }
    const notes = [];
    for (let i = 0; i < 6; i += 1) {
      const start = addDays(cycleStart, i * 28);
      const out = addDays(start, 21);
      const startAt = localDate(start, hour, minute);
      const outAt = localDate(out, hour, minute);
      if (isFuture(startAt, now)) {
        notes.push(oneShot(1301 + i * 2, 'Ring-in day', 'Insert the ring for 21 days if that is the schedule you are following.', startAt));
      }
      if (isFuture(outAt, now)) {
        notes.push(oneShot(1302 + i * 2, 'Ring-out day', 'Remove the ring for the 7-day break if that is the schedule you are following.', outAt));
      }
    }
    return notes;
  }

  if (kind === 'shot-13') {
    const due = addDays(anchor, 91);
    const grace = addDays(anchor, 105);
    const warn = addDays(grace, -2);
    const notes = [];
    const dueAt = localDate(due, hour, minute);
    const warnAt = localDate(warn, hour, minute);
    if (isFuture(dueAt, now)) {
      notes.push(oneShot(1401, 'Shot due', `The 13-week date counted from the shot date in the app is ${due}.`, dueAt));
    }
    if (isFuture(warnAt, now)) {
      notes.push(oneShot(1402, 'Shot window is ending', `The 15-week grace period described by CDC runs through ${grace}.`, warnAt));
    }
    if (!notes.length) {
      const tomorrow = new Date(now.getTime());
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(hour, minute, 0, 0);
      if (tomorrow.getTime() <= now.getTime()) tomorrow.setDate(tomorrow.getDate() + 1);
      notes.push(oneShot(1401, 'Shot date has passed', 'The 15-week window counted from the date in the app has passed. Open the missed-dose view.', tomorrow));
    }
    return notes;
  }

  if (kind === 'long-acting') {
    const years = Number(profile.years) || 3;
    const due = addYears(anchor, years);
    const soon = addDays(due, -30);
    const notes = [];
    const soonAt = localDate(soon, hour, minute);
    const dueAt = localDate(due, hour, minute);
    if (isFuture(soonAt, now)) {
      notes.push(oneShot(1501, 'Replacement coming up', `The date counted from insertion is ${due}. Confirm the years on your device.`, soonAt));
    }
    if (isFuture(dueAt, now)) {
      notes.push(oneShot(1502, 'Labeled duration reached', 'Contact the clinician who placed it. Use condoms until you are seen.', dueAt));
    }
    return notes;
  }

  return [];
}
