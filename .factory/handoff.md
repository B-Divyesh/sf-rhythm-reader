# Rhythm Reader polish round 3 handoff

## Outcome

All findings in `.factory/review-1.md`, `.factory/review-2.md`, and `.factory/review-3.md` are repaired. The product remains a Vite + TypeScript static web app and is deployed at <https://rhythm-reader.sociobot.in>.

- Repair code: `6d643f08748af770603972e388e079aa1f03d5a2`
- Documentation/evidence commit before deployment: `7c5225d`
- Azure Static Web Apps deployment: `c721fe6e-df9f-419b-8958-3a46d0bfbf8d`
- Known gaps: none.

## What changed

- Demo exit is now comprehensive: internal links, hash navigation, browser history, direct navigation, tab exit, and return all discard `demo:` data without touching `rr_*` data. Reload keeps the in-progress demo long enough for the calibration regression.
- Added the `keyboard-shortcuts` claim and an observable `N`-key test.
- Replaced the impossible level-five “Raise the difficulty” action with “Show a new level-5 rhythm.”
- Changed accessible score text from internal `on` to plain `on time` and punctuated every generated result sentence.
- Updated the catalog sentence, demo documentation, copy audit, claim registry, and complete finding map in `.factory/polish-3.md`.

## Verification

From a clean clone at `/tmp/rhythm-reader-polish3.jD4aGc` on repair commit `6d643f0`:

- `npm ci`: passed with no vulnerabilities.
- `npm test`: 13/13 passed.
- `npm run build`: passed and produced `dist/`. Initial JavaScript is 30.34 kB raw / 11.49 kB gzip; CSS is 18.46 kB raw / 5.14 kB gzip.
- Every claims command ran separately and passed: `timing-feedback`, `demo-isolation`, `offline-reload`, `privacy-local-only`, `input-calibration`, `keyboard-shortcuts`, `rhythm-options`, `free-no-account`, `scope-boundaries`, and `art-provenance`.
- Full Playwright suite: 31/31 passed, including routing, keyboard, 390 px layout, 200% text, storage recovery, offline/PWA update, microphone/calibration, privacy interception, and Axe checks.

Local evidence is under `.factory/evidence/polish-3/local-root/` and `.factory/evidence/polish-3/local-demo/`. `/opt/fleet/lib/verify-url.sh` reported zero console errors, valid title/lang/h1/main, no missing image alt text, and no unlabeled buttons on both routes. Local mobile Lighthouse scored 98 performance and 100 accessibility (LCP 1,955 ms; CLS 0); see `.factory/evidence/polish-3/lighthouse-mobile.json`.

## Production recheck

After deployment, cold `verify-url.sh` checks passed for `/`, `/demo`, `/privacy`, `/terms`, and `/missing-tape`; all five had the correct route title, one h1, main landmark, no console errors, and no missing alt or button labels. Captures and reports are in `.factory/evidence/polish-3/live-*/`.

I also rechecked every round-3 finding on the live site in fresh browser contexts:

- Entered `?demo=1`, changed it to 6/8, exited through Privacy, and confirmed no `demo:` local or session keys remained while seeded real keys stayed byte-for-byte unchanged. Re-entering `/demo` seeded 4/4 again.
- Pressed `N` in live demo and observed a new rhythm identifier.
- Seeded live level 5 and confirmed the enabled action is “Show a new level-5 rhythm”; [capture](evidence/polish-3/live-level-five.png).
- Confirmed the live SVG description contains “on time,” never `: on by`, and ends with punctuation.
- Ran AxeBuilder on `/`, `/demo`, `/privacy`, `/terms`, and `/missing-tape`: zero serious or critical violations.
- Crawled 13 rendered live links: all HTTP links returned success; explicit `mailto:` links were excluded. `robots.txt`, `sitemap.xml`, icons, manifest, social image, and service worker returned correct live content types.

Pre-existing modified `graphify-out/` analysis files were preserved and are not part of this repair.
