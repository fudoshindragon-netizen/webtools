# Cycle tracker — data, environment, and refresh

The tracker is a page on the existing Vite site (`cycle.html`), deployed with the rest of `sales-page` on Vercel. Personal logs stay in the browser. Two serverless routes live next to the quote routes:

- `GET /api/drug-lookup?q=` proxies [openFDA](https://api.fda.gov/drug/label.json) label text.
- `POST /api/cycle-assistant` optionally calls the [Vercel AI Gateway](https://vercel.com/docs/ai-gateway) through the AI SDK (`ai`).

`npm run dev` serves those routes as well, via the Vite plugin in `vite.config.js`.

## Environment variables

| Name | Required | Where |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | For the hosted symptom assistant locally | Vercel project env, or a local `.env` that is not committed. The AI SDK reads it. |
| `VERCEL_OIDC_TOKEN` | No action on Vercel | Injected for deployed functions. Do not copy it into the repo. |
| `CYCLE_ASSISTANT_MODEL` | No | Defaults to `openai/gpt-5.4-mini`. Set another `provider/model` id from the AI Gateway catalog if that slug is retired. |
| `OPENFDA_API_KEY` | No | Raises the openFDA rate limit. The public API works without it. |

No key is shipped to the browser. The symptom library answers with no key at all. The hosted button then explains how to set `AI_GATEWAY_API_KEY`.

## What is stored where

- Tracker, medications, and labs: `localStorage` key `gwf.cycleTracker.v1` on the device.
- Symptom chat: `sessionStorage` only, cleared with “Delete all my data.”
- Export / import: a JSON file the person downloads or chooses. Nothing is posted.
- Label lookup sends the drug name. The hosted assistant sends the question text only.

## Keeping the reference data current

Cited numbers live in `data/cycle/*.json`. `meta.json` has `version`, `lastReviewed`, and the URL plus a `mustContain` phrase for each source. The UI prints the version and the review date.

Refresh check:

```bash
cd sales-page
node scripts/refresh-health-data.mjs
```

The script fetches each source URL and each watched openFDA label. It fails if a page is down, a phrase we quote is gone, or a watched label excerpt no longer matches `data/cycle/source-watch.json`. It writes `data/cycle/refresh-report.json` (gitignored) and does **not** edit the clinical JSON. A person updates the data file, the review date, and the baseline:

```bash
node scripts/refresh-health-data.mjs --init
```

Commit the data change and the new `source-watch.json` after reading the diff.

GitHub Actions runs the same check every Monday at 15:00 UTC (`.github/workflows/refresh-health-data.yml`) and uploads the report. A red run means a cited page or label moved. It does not open a pull request by itself.

## Tests

```bash
cd sales-page
npm test
```

Covers cycle-date math, missed-dose rule selection (including the patch label versus CDC cutoff), the interaction matcher, symptom retrieval, and “every figure has a source id that exists.”

## Known limitations

- Missed combined pills do not have a published pregnancy percentage for one miss. The screen says that, and shows the yearly 7% / 0.3% figures as yearly figures only.
- The NuvaRing label (3 hours) and the CDC SPR (48 hours) disagree. Both results are shown. Annovera follows its own label, not the CDC ring algorithm.
- The fertile shading is this app’s calendar estimate (14 days before the predicted period, nine days wide). CDC’s “about nine or more fertile days” is the cited width, not a map of those exact dates.
- Reminders appear when the page is open. There is no background notification.
- The interaction list is a curated subset of the 2024 U.S. MEC plus two non-MEC sources for griseofulvin. Absence from the list is not a clearance.
- openFDA excerpts can be incomplete. The pharmacist line is on every flag.
- The hosted model is instructed to stay inside the library passages. It can still phrase them poorly. The library text is shown as well.
- Reference ranges are whatever the person types from their report. The app does not supply a normal range.
- This is educational information compiled from public sources. It is not medical advice.
