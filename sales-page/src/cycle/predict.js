/** Calendar-date helpers and cycle estimates. Dates are YYYY-MM-DD in the local calendar, not UTC instants. */

export function parseISODate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
}

export function formatISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDays(iso, days) {
  const date = parseISODate(iso);
  if (!date || !Number.isFinite(days)) return null;
  date.setDate(date.getDate() + days);
  return formatISODate(date);
}

export function diffDays(laterIso, earlierIso) {
  const later = parseISODate(laterIso);
  const earlier = parseISODate(earlierIso);
  if (!later || !earlier) return null;
  return Math.round((later.getTime() - earlier.getTime()) / 86400000);
}

export function todayISO(now = new Date()) {
  return formatISODate(now);
}

export function addYears(iso, years) {
  const date = parseISODate(iso);
  if (!date || !Number.isFinite(years)) return null;
  date.setFullYear(date.getFullYear() + years);
  return formatISODate(date);
}

/**
 * Average recent cycle lengths. Intervals shorter than 15 days or longer than 45
 * are left out of the average and reported, because they usually mean a missed
 * log or a different pattern rather than a typical cycle.
 */
export function summarizeCycles(periodStarts, fallbackLength = 28) {
  const starts = [...new Set((periodStarts || []).filter((iso) => parseISODate(iso)))].sort();
  const intervals = [];
  const excluded = [];
  for (let i = 1; i < starts.length; i += 1) {
    const gap = diffDays(starts[i], starts[i - 1]);
    if (gap >= 15 && gap <= 45) intervals.push(gap);
    else excluded.push(gap);
  }
  const recent = intervals.slice(-6);
  const average = recent.length
    ? Math.round(recent.reduce((sum, n) => sum + n, 0) / recent.length)
    : fallbackLength;
  const min = recent.length ? Math.min(...recent) : null;
  const max = recent.length ? Math.max(...recent) : null;
  return {
    starts,
    intervals: recent,
    excluded,
    average,
    usingDefault: recent.length === 0,
    irregular: min != null && max - min > 7,
    sampleSize: recent.length,
  };
}

/**
 * Fertile shading is this app's calendar estimate: ovulation is placed 14 days
 * before the next predicted period, and nine days ending on that date are shaded
 * so the width matches CDC's "about nine or more fertile days." CDC does not
 * assign those exact dates.
 */
export function predictFromStarts(periodStarts, options = {}) {
  const fallbackLength = options.cycleLength || 28;
  const periodLength = options.periodLength || 5;
  const summary = summarizeCycles(periodStarts, fallbackLength);
  const lastStart = summary.starts[summary.starts.length - 1] || null;
  if (!lastStart) {
    return { ...summary, lastStart: null, nextStart: null, ovulation: null, fertileStart: null, fertileEnd: null, periodLength };
  }
  const nextStart = addDays(lastStart, summary.average);
  const ovulation = addDays(nextStart, -14);
  const fertileStart = addDays(ovulation, -8);
  const fertileEnd = ovulation;
  const predictedPeriodEnd = addDays(nextStart, Math.max(periodLength, 1) - 1);
  return {
    ...summary,
    lastStart,
    nextStart,
    ovulation,
    fertileStart,
    fertileEnd,
    predictedPeriodEnd,
    periodLength,
  };
}

export function monthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < startPad; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(formatISODate(new Date(year, month, day)));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function inRange(iso, start, end) {
  if (!iso || !start || !end) return false;
  return iso >= start && iso <= end;
}

export function periodSpans(periods) {
  return (periods || [])
    .filter((period) => parseISODate(period.start))
    .map((period) => ({
      ...period,
      end: period.end && parseISODate(period.end) ? period.end : period.start,
    }));
}

export function adherenceOn(logs, iso) {
  return (logs || []).find((log) => log.date === iso) || null;
}

/**
 * In-app reminder from the method anchor. This only runs while the page is open.
 */
export function reminderFor(profile, logs, today) {
  if (!profile?.methodId || !profile.anchorDate || !parseISODate(profile.anchorDate)) return null;
  const kind = profile.reminder || 'daily-pill';
  const anchor = profile.anchorDate;
  const elapsed = diffDays(today, anchor);
  if (elapsed == null || elapsed < 0) {
    return { tone: 'info', title: 'Method starts later', detail: `The date you entered is ${anchor}.` };
  }
  const logged = adherenceOn(logs, today);

  if (kind === 'daily-pill') {
    if (logged?.adherence === 'taken') {
      return { tone: 'ok', title: 'Today’s pill is logged', detail: 'Stored only on this device.' };
    }
    return { tone: 'due', title: 'No pill logged today', detail: 'Combined pills and mini-pills are taken every day. This note is only on screen. The phone app can also notify you at the time you set.' };
  }

  if (kind === 'weekly-patch') {
    const dayInCycle = elapsed % 28;
    const changeDays = [0, 7, 14, 21];
    const onChangeDay = changeDays.includes(dayInCycle);
    if (dayInCycle >= 21) {
      return { tone: 'info', title: 'Patch-free week', detail: onChangeDay ? 'Removal day, if you follow a 3-weeks-on schedule.' : 'No patch this week on a standard 21/7 schedule.' };
    }
    if (onChangeDay && logged?.adherence !== 'done') {
      return { tone: 'due', title: 'Patch change day', detail: 'Apply a new patch and keep the same change day unless a missed-patch rule told you to start over.' };
    }
    return { tone: 'ok', title: 'Patch week in progress', detail: `Day ${dayInCycle + 1} of a 28-day patch cycle counted from ${anchor}.` };
  }

  if (kind === 'ring-21-7') {
    const dayInCycle = elapsed % 28;
    if (dayInCycle === 0 && logged?.adherence !== 'done') {
      return { tone: 'due', title: 'Ring-in day', detail: 'Insert the ring if you are on a 21-days-in, 7-days-out schedule.' };
    }
    if (dayInCycle === 21 && logged?.adherence !== 'done') {
      return { tone: 'due', title: 'Ring-out day', detail: 'Remove the ring for the 7-day break if that is your schedule.' };
    }
    if (dayInCycle > 21) {
      return { tone: 'info', title: 'Ring-free days', detail: `Day ${dayInCycle - 20} of the 7-day break, counted from ${anchor}.` };
    }
    return { tone: 'ok', title: 'Ring-in days', detail: `Day ${dayInCycle + 1} of 21, counted from ${anchor}.` };
  }

  if (kind === 'shot-13') {
    const next = addDays(anchor, 91);
    const grace = addDays(anchor, 105);
    if (today <= next) return { tone: 'ok', title: 'Shot not due yet', detail: `Scheduled at 13 weeks (${next}). CDC’s grace period runs through 15 weeks (${grace}).` };
    if (today <= grace) return { tone: 'due', title: 'Inside the late window', detail: `Past 13 weeks. CDC says a repeat shot through ${grace} does not need extra contraception for lateness alone.` };
    return { tone: 'alert', title: 'Past 15 weeks', detail: `The grace period CDC describes ended ${grace}. Open the missed-dose view before assuming you are covered.` };
  }

  if (kind === 'long-acting') {
    const years = Number(profile.years) || 3;
    const due = addYears(anchor, years);
    if (today < due) return { tone: 'ok', title: 'Replacement date ahead', detail: `Counted as ${years} years from ${anchor}, which is ${due}. Use the years on your device, not this default.` };
    return { tone: 'alert', title: 'Labeled duration reached', detail: `The date counted from insertion is ${due}. Contact the clinician who placed it. Use condoms until you are seen.` };
  }

  if (kind === 'coital') {
    return { tone: 'info', title: 'No daily dose', detail: 'Barrier methods and withdrawal only apply to the act when you use them. Log use on those days.' };
  }

  if (kind === 'as-needed') {
    return { tone: 'info', title: 'Not a routine method', detail: 'Emergency contraception is taken after unprotected sex. It is not a daily pill.' };
  }

  return { tone: 'info', title: 'Check today’s plan', detail: 'Open the method page for how this one is tracked.' };
}
