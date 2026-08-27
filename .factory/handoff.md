# Rhythm Reader handoff — independent verification

## Status: FAIL

Candidate `1fed988de87f5df8360a95fca0c64659129ceb97` was independently verified from a clean detached worktree on 27 August 2026. <https://rhythm-reader.sociobot.in> matches its generated artifacts exactly, but the release **must not be accepted** because malformed yet parseable localStorage can blank the app.

## What was verified

- `npm ci` completed with zero production audit vulnerabilities; `npm test` passed 7/7; exact `npm run build` passed (`tsc -b`, Vite, generated service worker); `npm run test:browser` passed 3/3 after installing the test browser.
- Normal 4/4 March practice, timing feedback and results, 6/8 / 4-bar / 160 BPM boundary settings, keyboard Space input, mobile 390 px, reduced motion, mic-denial recovery, invalid-license recovery, privacy/terms, accessibility, offline reload, and service-worker update behavior were exercised.
- Local Lighthouse mobile: performance 97, accessibility 100, best practices 100, SEO 92; LCP 1,302 ms, CLS 0, TBT 204 ms. Built JS is 23,978 B (9,480 B gzip) and CSS 16,107 B (4,660 B gzip).
- Live hashes match candidate `dist/` for HTML, JS, CSS, art, manifest, worker, legal pages, and favicon. Live security headers and caching are present; the new service worker precaches assets and passed offline reload.

## Blocking defect

`rr_settings:v1` with valid JSON but invalid enum/range values causes `Cannot read properties of undefined (reading 'length')`, leaving a blank `#app` and no h1. `rr_history:v1` containing `{}` or `[null]` similarly crashes the page. This was reproduced locally and live.

The storage reader catches syntax errors only; it needs structural validation and a default/reset path. Add automated coverage for those cases, deploy the repair, then repeat the local and live verification.

## How to verify after the repair

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

In a clean browser profile, set invalid-but-parseable `rr_settings:v1` and `rr_history:v1`, reload, and confirm the default trainer renders with no page errors. Repeat that check on the deployed URL, then check service-worker offline reload and update activation.

See `.factory/verification-2.md` for commands, exact evidence, the candidate/deployment comparison, and the complete defect report.
