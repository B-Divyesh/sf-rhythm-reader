# Rhythm Reader handoff — persisted-state recovery repair

## Status: ready for Standard static deployment

This repair resolves the release blocker reported against candidate `1fed988de87f5df8360a95fca0c64659129ceb97`: valid JSON with an invalid shape or values in `rr_settings:v1` or `rr_history:v1` can no longer blank the trainer.

## What changed

- Added runtime normalization at the localStorage boundary. Settings now require the supported meter, style, and input-mode enums; 2–4 bars; even 50–160 BPM; difficulty 1–5; a boolean level lock; and an integer calibration offset from -250 to 250 ms.
- History now requires an array of real UTC `YYYY-MM-DD` day records with bounded integer drill counts and 0–100 scores. Invalid items, including `null`, are removed; duplicate days are merged; records are sorted and retained for the latest 90 days.
- Repaired JSON is written back when storage is available. Parse failures, `null`, `{}`, malformed arrays, and unavailable storage all fall back safely without throwing.
- A non-blocking status strip explains that saved practice data was repaired, while the default trainer renders normally.
- Added exact regressions for the reported invalid-enum/range settings object, `null` settings, `{}` history, `null`/invalid history items, duplicate-day normalization, and a browser reload with malformed settings and history.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Completed locally on 27 August 2026:

- `npm test` — **12/12 passed**.
- `npm run build` — passed (`tsc -b`, Vite, and versioned service-worker generation). Production initial JS is **25.92 kB** (10.21 kB gzip) and CSS is **16.15 kB** (4.68 kB gzip).
- `npm run test:browser` — **4/4 passed**: 390 px shell/touch targets and aXe serious/critical scan, malformed parseable storage recovery with no page errors, fresh controlled-client offline reload, and explicit service-worker update activation.
- `verify-url.sh` against the built local preview — HTTP 200, no console/page errors, title/lang/one h1/main/alt checks passed at desktop and 390 px.
- Mobile Lighthouse — Performance **98**, Accessibility **100**, Best Practices **100**, SEO **92**; LCP **1,275 ms**, CLS **0**.

## Deployment and live verification

Deploy the built `dist/` directory as the `rhythm-reader` **Standard** Azure Static Web App. Then run the same malformed-localStorage reload regression on `https://rhythm-reader.sociobot.in`, along with the offline reload and update activation tests. This section is updated with the resulting release URL and evidence after deployment.

## Known gaps

Physical clap onset accuracy and per-device calibration remain hardware-dependent and cannot be acoustically measured in this container. Permission-denial fallback remains covered by the existing product behavior.
