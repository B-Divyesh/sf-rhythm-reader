# Rhythm Reader handoff — perfection loop round 1

## Status: PASS

All five blocking findings in `.factory/review-1.md` are resolved. The repaired static site was deployed to <https://rhythm-reader.sociobot.in> on 28 August 2026.

## What changed

- Replaced the slogan-led first screen with the job, named audience, one-click sample action, outcome text, and three plain facts.
- Added `/demo` and `?demo=1`. The demo opens on a scored two-bar rhythm with early, on-time, late, and missed marks.
- Isolated demo state in `demo:rr_settings:v1` and `demo:rr_history:v1`. Added persistent **Reset demo** and **Start for real** controls.
- Added `.factory/claims.json` with nine claims and exactly one tagged browser test for each claim.
- Removed the paid style-pack offer, checkout link, license dialog, and billing code. The required checkout endpoint returned HTTP 404, so no unavailable purchase is advertised. All five rhythm styles are free.
- Added real SPA views for `/demo`, `/privacy`, `/terms`, and unknown paths. Each route has its own title, description, canonical URL, one h1, shared header/footer, route announcement, heading focus, and back/forward behavior.
- Added real `robots.txt`, `sitemap.xml`, a 180 px Apple icon, a 1200×630 social image, Open Graph metadata, and Twitter metadata.
- Reworked labels and explanations around **rhythm**, **practice**, **practice history**, **tap**, and **timing adjustment**. The complete landing copy audit is in `.factory/copy-audit.md`.
- Kept the cassette-era practice-zine system. Added route, demo-strip, 404, and mobile guidance to `.factory/design.md`.
- Hardened the service worker so missing assets never receive HTML and update checks bypass caches.

## Clean-clone verification

Verified commit `80c03800d09bbb65ef62350ad82f284314bb37a4` from a new clone at `/tmp/rhythm-reader-final-pass.h3pQPi`:

- `npm ci` — passed; 0 vulnerabilities.
- `npm test` — 13/13 unit tests passed.
- Every command in `.factory/claims.json` ran separately — 9/9 passed.
- `npm run build` — passed; `dist/index.html` exists.
- `npm run test:browser` — 28/28 passed.
- Browser coverage includes all routes, route focus and history, 390 px layout, 200% text, 44 px targets, keyboard use, dialog behavior, demo reset/isolation, privacy interception, offline reload, worker updates, metadata assets, and storage recovery.
- Axe checks on `/`, `/demo`, `/privacy`, `/terms`, and `/404` found 0 serious or critical issues.
- Production bundles: JavaScript 28.89 kB raw / 11.11 kB gzip; CSS 18.46 kB raw / 5.14 kB gzip.

Local `verify-url.sh` passed with no console or page errors. Local mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 100; LCP 2,000 ms; CLS 0; transferred bytes 129,067.

## Deployment and live evidence

- Azure Static Web Apps deployment: `322e9df5-be8f-4e87-949d-f3f1de49c7d1`.
- Custom domain returned HTTPS 200.
- `/`, `/demo`, `/privacy`, `/terms`, and `/404` returned the app document and rendered their correct client-side views.
- `/robots.txt` returned `text/plain`; `/sitemap.xml` returned `text/xml`; the Apple icon returned `image/png`; the social image returned `image/jpeg`.
- Live `verify-url.sh` passed with the expected title, `lang="en"`, one h1, main landmark, alt text, and no console/page errors.
- A clean live browser context confirmed the demo title, banner, completed timing marks, 390 px width, `demo:` storage keys, unchanged seeded real settings, no cross-origin requests, offline reload, and 0 serious/critical axe findings.
- Live mobile Lighthouse: Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP 1,508 ms; CLS 0; transferred bytes 129,059.

## Run it

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:browser
npm run preview
```

## Known gaps and next steps

There are no known release blockers. A paid style pack can return only after the Sociobot billing product is registered and its checkout URL has an automated live health check. Physical clap timing still varies by microphone and device; the product presents its result as an estimate and provides a timing adjustment.

Pre-existing modified `graphify-out/` files were not changed or committed by this repair.
