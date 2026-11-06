// Regenerates capacitor.config.json from app.config.json.
// Capacitor's CLI loads JSON (or CommonJS). This package is ESM, so the
// editable source of truth stays in app.config.json.
import { readFileSync, writeFileSync } from 'node:fs';

const app = JSON.parse(readFileSync(new URL('../app.config.json', import.meta.url), 'utf8'));
const config = {
  appId: app.appId,
  appName: app.appName,
  webDir: 'app-dist',
  android: { allowMixedContent: false },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_notify',
      iconColor: '#ff6b9d',
    },
    SplashScreen: {
      launchAutoHide: true,
      backgroundColor: '#0a0a12',
      showSpinner: false,
    },
  },
};
writeFileSync(new URL('../capacitor.config.json', import.meta.url), `${JSON.stringify(config, null, 2)}\n`);
console.log(`capacitor.config.json ← ${config.appName} (${config.appId})`);
