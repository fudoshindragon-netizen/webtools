# Luna Cycle — store release guide

The Android and iPhone apps are a Capacitor shell around the cycle tracker. The website build is unchanged: Vercel still publishes `dist/`, and `dist/index.html` is still the NOBODY RUNS page. The app build copies that output to `app-dist/` and replaces `index.html` with the tracker, so the app opens on the tracker.

Suggested store listing name: **Luna Cycle**. Bundle id: **`com.microventurelabs.lunacycle`**. Both are in `app.config.json`, which `capacitor.config.js` reads. The hosted assistant and openFDA calls from the app use `apiBase` in that same file (default `https://generationwealthforever.com`). Change `apiBase` if the site’s origin changes, then run `npm run cap:sync`.

The store icon is the owner’s final artwork. `resources/play-store-icon-512.png` is the 512×512 full-bleed image to upload as the Play high-res icon. `resources/icon.png` is the 2048×2048 source used for the Android launcher (including adaptive icon densities), the iOS app icon, and the cycle-tracker favicon. `resources/luna-icon-512-border.png` is the same mark with a pale border, kept for reference. The splash is that artwork centered on the dark site background.

Privacy policy to paste into both stores: `https://generationwealthforever.com/privacy.html`. The privacy contact is `microventurelabs@gmail.com`.

## What you must do yourself

- A Google Play Console account ($25 once) and an Apple Developer Program account ($99 a year).
- A signing key you create and store offline. Do not commit it.
- A Mac with Xcode, or a Mac build service, for the iOS binary. This repository can produce the iOS project on Linux. It cannot compile it here.
- Screenshots from a phone or simulator for the store listings.
- The upload keystore, created on your own machine with the `keytool` command below. Do not commit the keystore or `android/key.properties`.

## 1. Build the web bundle the app ships

```bash
cd sales-page
npm ci
npm test
npm run build:app
```

`app-dist/` is gitignored. `npm run cap:sync` rebuilds it and copies it into the native projects.

## 2. Android App Bundle

Requirements: JDK 21, Android SDK platform 36 (or the `compileSdk` in `android/variables.gradle` if that file says otherwise), and build-tools.

Debug APK, unsigned by a release key, for sideloading onto your own phone:

```bash
npm run android:debug
```

The APK is `android/app/build/outputs/apk/debug/app-debug.apk`. The GitHub Action (`.github/workflows/android-debug.yml`) builds this same debug APK and uploads it as `luna-cycle-debug.apk`. It is signed with the Android debug keystore only, so it can be sideloaded for a personal test. Do not upload a debug APK to production.

### Upload key

The Play upload key is already created. It is an RSA 2048 key, valid for 10000 days, alias `luna-upload`, distinguished name `CN=MicroVenture Labs, O=MicroVenture Labs, C=US`. The keystore file and its passwords are not in git. Keep the delivered `luna-upload.jks` and the credentials file in private storage. Do not generate a second keystore. A new key is a different certificate, and Play will reject it for updates to this app.

`*.keystore`, `*.jks`, and `key.properties` are gitignored at the repo root and in `sales-page/`.

To sign another release, put that same keystore on disk and create `sales-page/android/key.properties` (this path is gitignored):

```
storeFile=/absolute/path/to/luna-upload.jks
storePassword=YOUR_STORE_PASSWORD
keyAlias=luna-upload
keyPassword=YOUR_KEY_PASSWORD
```

`storeFile` must be an absolute path, or a path relative to `sales-page/android/app`. `android/app/build.gradle` reads this file when it exists and applies it only to the release build.

After Play App Signing is on, Google holds the app-signing key and this file is only the upload key. If you lose the upload key, Play support can reset it. If you lose the keystore before enrollment, you cannot update the same app. Enroll this certificate as the upload key. Do not let Play replace it with a different upload key unless you intend to reset it.

### Build the signed AAB

`android/app/build.gradle` reads `android/key.properties` when that file exists and applies it only to the release build. Without the file, `bundleRelease` still produces an unsigned AAB, which Play Console will not accept.

```bash
cd sales-page
npm ci
npm run cap:sync
cd android
./gradlew bundleRelease
```

Upload `sales-page/android/app/build/outputs/bundle/release/app-release.aab`.

Enroll in Play App Signing when the console asks. Let Google generate the app-signing key, and use the keystore above as the upload key. Do not download a signing key into this repository.

Play listing icon: upload `sales-page/resources/play-store-icon-512.png` (512×512). Privacy contact for the listing and the policy URL: `microventurelabs@gmail.com` and `https://generationwealthforever.com/privacy.html`.

### Play Console

1. Create the app. Name: Luna Cycle. Default language: English. App or game: App. Free.
2. Category: Health & fitness. The tracker is education and a personal log. It is not a medical device. The privacy page says that.
3. Store listing: short description, full description, and a link to `https://generationwealthforever.com/privacy.html`. Phone screenshots (1080×1920 PNG, fictional example data) are in `sales-page/store-assets/screenshots/`. The 1024×500 feature graphic is `sales-page/store-assets/feature-graphic-1024x500.png`. The 512×512 listing icon is `sales-page/resources/play-store-icon-512.png`.
4. Content rating questionnaire: answer from the real behavior. No violence, no sexual content as pornography, no user-generated public posts, no unrestricted web browsing as the product. Health and fitness questions: it lets someone record menstrual and contraceptive information for themselves. It does not provide a diagnosis.
5. Target audience: 18 and older. The privacy page says the tracker is not directed at children under 13.
6. Ads: No. The tracker has no ad SDK and no analytics.
7. News / government: No.
8. Health apps declaration (the form Play shows for health and fitness):
   - The app is **not** a medical device and is **not** for diagnosis, treatment, or clinical decision support.
   - It provides health-related **education** and a **personal record** the user keeps on the device.
   - It does not connect to a regulated health service, EHR, or insurance API.
   - Privacy policy URL: `https://generationwealthforever.com/privacy.html`.
9. Data safety form, answered from the code as of this release:

| Question | Answer |
| --- | --- |
| Does the app collect or share any of the required user data types? | Yes, only for the two optional network actions below. The log itself is not collected. |
| Is all of the user data collected by your app encrypted in transit? | Yes. The app calls `https://generationwealthforever.com`. |
| Do you provide a way for users to request that their data be deleted? | Yes. “Delete all my data” on the Privacy tab deletes the on-device record and cancels reminders. Nothing is held in an account to delete server-side. Say that in the form’s explanation. |
| Health and fitness | Collected only if the user types health details into the hosted assistant and sends that question. Not shared with advertisers. Purpose: app functionality. Not required for the app to work. |
| Other user-generated content / the drug name | Collected only when the user taps “Look up label.” Sent to our server and then to openFDA. Purpose: app functionality. Optional. |
| Personal info, financial info, location, contacts, photos, audio, files, calendar, web browsing, device or other IDs | Not collected. |
| Data shared | Not sold. Not shared for advertising. The assistant question is processed by the AI Gateway to produce the reply. The drug name is sent to openFDA. Declare those as service providers / app functionality, not as “sharing” for ads, using the console’s current wording for processors. |
| Analytics, advertising ID, crash SDK | None in the tracker or the app. |
| Account creation | No. |

10. Exact alarms: the app requests `SCHEDULE_EXACT_ALARM` so a pill reminder can fire at the minute the user picked while the phone is idle. In Play Console, if a declaration for exact alarms appears, the use is a user-scheduled health reminder, not an alarm-clock app and not `USE_EXACT_ALARM`. Users can deny notification permission and still use the log. If a review rejects the exact-alarm permission, remove `SCHEDULE_EXACT_ALARM` from `AndroidManifest.xml` and `allowWhileIdle: true` from `src/cycle/reminders.js`, then ship inexact reminders.

11. Upload the AAB to an internal testing track first. Install it from the Play testing link before production.

## 3. iOS and App Store Connect

The `ios/` project is committed. Building it needs macOS and Xcode (current Capacitor releases expect a recent Xcode). On a Mac:

```bash
cd sales-page
npm ci
npm run cap:sync
open ios/App/App.xcodeproj
```

Capacitor 8 includes the iOS plugins with Swift Package Manager (`ios/App/CapApp-SPM`). There is no Podfile and no `pod install` step.

In Xcode: set the team, confirm the bundle id matches `app.config.json`, choose Any iOS Device, Product → Archive, then Distribute to App Store Connect.

Cloud options if you do not have a Mac:

- **Codemagic**: connect the GitHub repo, use the Capacitor/iOS workflow, set the `sales-page` directory as the project root, run `npm ci && npm run cap:sync` before `xcodebuild`, and upload the archive with an App Store Connect API key.
- **GitHub Actions `macos-latest`**: a workflow can run `npm run cap:sync` and `xcodebuild -project ios/App/App.xcodeproj -scheme App -sdk iphoneos archive`. Signing needs an Apple certificate and provisioning profile stored as secrets. This is the same idea as EAS Build, which is Expo’s service and does not build this Capacitor project unless you adopt Expo. Do not switch the project to Expo just to use EAS.
- **MacStadium or a rented Mac**: same commands as a local Mac.

### App Privacy nutrition label

Answer for data **sent off the device**. Data that stays in the app is not “collected” in Apple’s form.

| Data type | Collected? | Linked to identity? | Used for tracking? | Purpose |
| --- | --- | --- | --- | --- |
| Health & Fitness | Only if the user sends a hosted-assistant question that contains health details | No | No | App functionality |
| Other user content (drug name on label lookup) | Only when they tap Look up label | No | No | App functionality |
| Contact info, location, identifiers, purchases, search history, browsing history, diagnostics | No | — | No | — |

“Data used to track you”: No.

Privacy policy URL in App Store Connect: `https://generationwealthforever.com/privacy.html`.

Age rating: 17+ or 18+ is the conservative match for sexual-health education. Answer the questionnaire honestly: infrequent medical or treatment information, no unrestricted web access as the product, no user-generated public content.

### Guideline 4.2 (minimum functionality)

Apple rejects sites wrapped in a web view that add nothing a bookmark would not do. This app is still a web UI inside Capacitor, and you should be ready to say so. What is native, and what to point at in review notes:

- The tracker is bundled. Logging, the calendar, method pages, missed-dose figures, the curated interaction list, lab charts, and the symptom library work with the phone in airplane mode. Only the hosted assistant and the openFDA lookup need a network, and both are explicit buttons.
- Personal data never goes to an account. It stays on device, with export and delete.
- Reminders use Capacitor Local Notifications: a system permission prompt, a notification channel on Android, and scheduled alerts for a daily pill time, a weekly patch day, ring in and out dates, and the shot date. Those fire when the app is not open.
- The app hides the marketing site navigation. It opens on the tracker, with its own icon and splash, not on the NOBODY RUNS sales page.
- Review notes you can paste: “Luna Cycle is an offline personal log and education app. Open it in airplane mode, save a period, and set a pill reminder. Network is used only if the reviewer taps Look up label or Also ask the hosted assistant.”

If a reviewer still treats it as a thin wrapper, the next product step is a fully native screen for the calendar. That is not required for this release’s architecture, but it is the escalation if 4.2 comes back.

## 4. Changing the name or bundle id

Edit `app.config.json`. Then:

```bash
# Before the first store upload only:
rm -rf android ios
npx cap add android
npx cap add ios
npx @capacitor/assets generate --iconBackgroundColor '#0a0a12' --splashBackgroundColor '#0a0a12'
npm run cap:sync
```

After either store has accepted a build, you cannot change the bundle id of that listing. Ship a new app if the id must change.

## 5. Notifications, in one place

`src/cycle/reminders.js` decides what to schedule. `src/cycle/native.js` asks for permission only after the user taps “Allow phone reminders,” or refreshes an already granted schedule when the app opens. Declining permission does not block the log.

- Pill: repeating daily at `reminderHour`:`reminderMinute` (default 9:00, also in `app.config.json`).
- Patch: repeating weekly on the weekday of the anchor date.
- Ring: the next in and out dates (21 days in, 7 days out), refreshed when the app is opened.
- Shot: the 13-week date and a notice before the 15-week grace date.
- Implant and IUD: 30 days before the labeled duration, and on that date.

Opening the app on or after a method change replaces the scheduled set. Ring and shot dates that are further out than the planned list get their next batch the next time the app opens.
