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

Deployment, cold live checks, screenshots, and the final commit are appended after the work-order deploy completes.

## Known gaps

None. Physical microphone onset accuracy still depends on a visitor’s hardware; the product and an oscillator-backed browser regression both exercise the detector and fallback path.

Pre-existing `graphify-out/` changes were preserved and excluded from the repair commit.
