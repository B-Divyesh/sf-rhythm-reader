# Rhythm Reader polish round 2 handoff

## Outcome

This repair resolves all findings in reviews 1 and 2. The cassette-zine identity, static Vite/TypeScript artifact class, offline PWA, local-first storage, and free trainer are retained. The complete finding map is in `.factory/polish-2.md`.

## Repair

- Reversed the input-mode action labels so each says what clicking will do.
- Made **Start for real** discard the isolated demo namespace before returning home.
- Replaced the shallow input/calibration claim with an end-to-end proof of Space, screen, microphone-stream, timed adjustment, reload persistence, and correction application.
- Rewrote the three flagged README phrases and refreshed the verb-first catalog description.

## Local verification

- `npm ci`: passed with 0 reported vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed and generated `dist/`.
- Every command listed in `.factory/claims.json`: 9/9 passed (`npm run test:claims`).
- `npx playwright test --grep-invert @claim`: 19/19 passed, covering aXe route scans, keyboard/dialog behavior, 390 px layout and targets, routing/metadata, storage recovery, offline reload, and service-worker update.
- Output budgets: JavaScript 28.94 kB raw / 11.13 kB gzip; CSS 18.46 kB raw / 5.14 kB gzip; both below the static-web budgets.

## Deployment and live verification

- Deployed production `dist/` with `/opt/fleet/lib/deploy-static.sh rhythm-reader dist`.
- Deployed source repair: `30a73b659bfbe6e91bac0a2d16f87c16eb04a398`.
- Cold live checks passed at `https://rhythm-reader.sociobot.in/` and `/demo`. `verify-url.sh` recorded zero console/page errors, valid title/lang/main/one h1/alt text, and screenshots in `.factory/evidence/polish-2/`.
- Live root SHA-256 equals the deployed build’s `dist/index.html`: `7cccb4619fee1214ed5c194f27d4f03f4a4f12ed76bad8fe4fc05602da055b5f`.
- A live Playwright AxeBuilder scan found zero serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-tape`; every route had its expected title and exactly one h1, with no runtime errors.
- Fresh live `?demo=1` began at demo-only 4/4 despite seeded real 3/4 state; **Start for real** left no `demo:` keys and retained the original real settings byte-for-byte.

## Known gaps

None. Physical microphone onset accuracy still depends on a visitor’s hardware; the product and an oscillator-backed browser regression both exercise the detector and fallback path.

Pre-existing `graphify-out/` changes were preserved and excluded from the repair commit.
