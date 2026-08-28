# Rhythm Reader polish round 2

Base review commit: `4624f9dea877edf141a506c0144e3fdf0f452774`. This document maps every finding from `.factory/review-1.md` and `.factory/review-2.md` to its shipped repair and repeatable evidence.

| Finding | Change made | Evidence |
| --- | --- | --- |
| Review 1 B1 | `/demo` and `?demo=1` enter a seeded `demo:` namespace, show the persistent sample banner, Reset demo, and Start for real. | `@claim:demo-isolation`, `@claim:timing-feedback`, `@claim:offline-reload`; `tests/routing.spec.ts`; live `/demo` check after deploy. |
| Review 1 B2 | Added nine registered claims with exactly one tagged browser test each. Retained copy is covered by those observable tests. | `.factory/claims.json`; `npm run test:claims` (9/9). |
| Review 1 B3 | Removed the unregistered, dead paid checkout offer. The whole trainer is plainly free and needs no account. | `@claim:free-no-account`; live landing link check. |
| Review 1 B4 | Implemented route-aware titles, descriptions, canonical/OG metadata, shared shell, route-focus announcements, designed 404, sitemap/robots/icons, and SWA fallback exclusions. | `tests/routing.spec.ts` (8/8); `tests/accessibility.spec.ts` (5 route checks); live `verify-url.sh`. |
| Review 1 B5 | Replaced the slogan with the job-led h1, named adult musicians and rehearsal context, and put Try it with sample data plus its outcome in the first screen. | `tests/routing.spec.ts` mobile first-screen test; live 390 px screenshot. |
| Review 1 M1 | Standardized rhythm pattern/practice/practice history/tap/timing adjustment/rhythm style. Rewrote landing and README language in plain words. | `.factory/copy-audit.md`; `@claim:scope-boundaries`; README review. |
| Review 1 M2 | Controls now name their action/result, including the input switch and demo actions. | `@claim:input-calibration`; keyboard accessibility test. |
| Review 2 M1 | Corrected the input switch: tap mode offers **Use microphone claps**; microphone mode offers **Use keyboard or screen taps**. Rewrote the three flagged README phrases. | `@claim:input-calibration`; `@claim:privacy-local-only`; live demo check. |
| Review 2 M2 | Start for real now clears both `demo:rr_settings:v1` and `demo:rr_history:v1` before returning home; real keys stay unchanged. | `@claim:demo-isolation` asserts no `demo:` keys remain and checks byte-for-byte real values. |
| Review 2 M3 | Expanded the claim test to submit Space and screen taps, detect an oscillator-backed test microphone stream, complete six timed adjustment taps, reload the saved value, and compare raw versus corrected scoring. | `@claim:input-calibration` (passing); `src/scoring.ts` direct result assertions. |

## Local evidence

- `npm test`: 13 unit tests passed.
- `npm run build`: passed; `dist/` generated. Initial JavaScript is 28.94 kB raw / 11.13 kB gzip and CSS is 18.46 kB raw / 5.14 kB gzip.
- `npm run test:claims`: 9/9 passed.
- `npx playwright test --grep-invert @claim`: 19/19 passed (accessibility, keyboard, mobile layout, routing, storage recovery, PWA offline/update).

The post-deploy screenshots and URL verification are recorded in `.factory/handoff.md`.
