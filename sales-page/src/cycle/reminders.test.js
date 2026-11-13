import { test } from 'node:test';
import assert from 'node:assert/strict';
import { planReminders } from './reminders.js';

const morning = new Date(2026, 10, 6, 8, 0, 0);

test('daily pill is one repeating notification at the saved time', () => {
  const notes = planReminders({
    reminder: 'daily-pill',
    anchorDate: '2026-10-01',
    reminderHour: 21,
    reminderMinute: 30,
  }, '2026-11-06', { now: morning });
  assert.equal(notes.length, 1);
  assert.equal(notes[0].id, 1101);
  assert.equal(notes[0].schedule.repeats, true);
  assert.deepEqual(notes[0].schedule.on, { hour: 21, minute: 30 });
});

test('patch reminder repeats on the anchor weekday', () => {
  // 2026-11-02 is a Monday. Capacitor weekday Sunday = 1, so Monday = 2.
  const notes = planReminders({
    reminder: 'weekly-patch',
    anchorDate: '2026-11-02',
  }, '2026-11-06', { now: morning, hour: 9, minute: 0 });
  assert.equal(notes[0].schedule.on.weekday, 2);
  assert.equal(notes[0].schedule.repeats, true);
});

test('ring reminders include an in day and the out day 21 days later', () => {
  const notes = planReminders({
    reminder: 'ring-21-7',
    anchorDate: '2026-11-01',
  }, '2026-11-06', { now: morning, hour: 9, minute: 0 });
  const titles = notes.map((note) => note.title);
  assert.ok(titles.includes('Ring-in day'));
  assert.ok(titles.includes('Ring-out day'));
  const out = notes.find((note) => note.title === 'Ring-out day');
  assert.equal(out.schedule.at.slice(0, 10), '2026-11-22');
});

test('shot due date is 91 days after the anchor', () => {
  const notes = planReminders({
    reminder: 'shot-13',
    anchorDate: '2026-11-01',
  }, '2026-11-06', { now: morning, hour: 9, minute: 0 });
  const due = notes.find((note) => note.id === 1401);
  assert.equal(due.schedule.at.slice(0, 10), '2027-01-31');
});

test('methods without a timed dose schedule nothing', () => {
  assert.deepEqual(planReminders({ reminder: 'coital', anchorDate: '2026-11-01' }, '2026-11-06', { now: morning }), []);
  assert.deepEqual(planReminders({ reminder: '', anchorDate: '2026-11-01' }, '2026-11-06', { now: morning }), []);
});
