import { Capacitor } from '@capacitor/core';
import appConfig from '../../app.config.json';
import { planReminders, reminderIds } from './reminders.js';
import { todayISO } from './predict.js';

export function isNativeApp() {
  try {
    return Capacitor.isNativePlatform() === true;
  } catch {
    return false;
  }
}

/** Relative on the website. Absolute, and configurable, inside the phone app. */
export function apiUrl(path) {
  if (!isNativeApp()) return path;
  const base = String(appConfig.apiBase || 'https://generationwealthforever.com').replace(/\/$/, '');
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function prepareNativeShell() {
  if (!isNativeApp()) return;
  document.body.classList.add('is-native');
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    await StatusBar.setBackgroundColor({ color: '#0a0a12' });
    await StatusBar.setStyle({ style: Style.Dark });
  } catch {
    /* Status bar styling is cosmetic. */
  }
}

export async function enableReminders(profile) {
  if (!isNativeApp()) {
    return { status: 'web', message: 'Phone reminders are part of the Android and iPhone app. This page only reminds you while it is open.' };
  }
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await ensureChannel(LocalNotifications);
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== 'granted') {
    return { status: 'denied', message: 'Notifications stay off until you allow them in system settings. The tracker still works without them.' };
  }
  return schedule(LocalNotifications, profile);
}

export async function refreshNativeReminders(profile) {
  if (!isNativeApp()) return { status: 'web', message: '' };
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  const perm = await LocalNotifications.checkPermissions();
  if (perm.display !== 'granted') {
    return { status: perm.display || 'prompt', message: 'Allow phone reminders if you want a pill, patch, ring, or shot alert. Saying no does not limit the tracker.' };
  }
  await ensureChannel(LocalNotifications);
  return schedule(LocalNotifications, profile);
}

export async function clearNativeReminders() {
  if (!isNativeApp()) return;
  const { LocalNotifications } = await import('@capacitor/local-notifications');
  await LocalNotifications.cancel({ notifications: reminderIds().map((id) => ({ id })) });
}

async function ensureChannel(LocalNotifications) {
  if (!LocalNotifications.createChannel) return;
  try {
    await LocalNotifications.createChannel({
      id: 'cycle-reminders',
      name: 'Method reminders',
      description: 'Pill, patch, ring, and shot dates saved on this phone.',
      importance: 4,
    });
  } catch {
    /* iOS has no channels. */
  }
}

async function schedule(LocalNotifications, profile) {
  await LocalNotifications.cancel({ notifications: reminderIds().map((id) => ({ id })) });
  const planned = planReminders(profile, todayISO(), {
    now: new Date(),
    hour: appConfig.reminderHour,
    minute: appConfig.reminderMinute,
  });
  if (!planned.length) {
    return { status: 'none', message: 'Nothing to schedule for this method. Pills, the patch, the ring, and the shot are the timed reminders.' };
  }
  await LocalNotifications.schedule({
    notifications: planned.map((item) => ({
      id: item.id,
      title: item.title,
      body: item.body,
      channelId: 'cycle-reminders',
      schedule: item.schedule.at ? { ...item.schedule, at: new Date(item.schedule.at) } : item.schedule,
    })),
  });
  return { status: 'scheduled', message: `Reminders are on for this phone (${planned.length} scheduled). They stay on the device.` };
}
