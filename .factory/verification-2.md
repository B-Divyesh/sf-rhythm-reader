# Independent verification 2 — FAIL

**Candidate:** `1fed988de87f5df8360a95fca0c64659129ceb97` (`1fed988`)

**Deployment:** <https://rhythm-reader.sociobot.in> tested 27 August 2026

## Verdict

**FAIL.** The candidate and live deployment otherwise match and the main tap-in practice flow works, including repaired service-worker offline reload. However, valid-JSON malformed local state crashes the application to a blank page with an uncaught error. The product promises local persistence and needs to recover from malformed persisted input; this also fails the work order's malformed/recovery-input check.

## Exact environment and quality gates

- Created a clean detached Git worktree at the candidate SHA. The supplied worktree had unrelated `graphify-out/` changes and was not used for source verification.
- Node `v22.23.2`, npm `10.9.8`, Chromium supplied by Playwright `151.0.7922.34`.
- `npm ci`: passed; `npm audit --omit=dev --json` reported zero vulnerabilities.
- `npm test`: passed, 7/7 tests in 3 files.
- There is no standalone lint script. `npm run build` passed, including `tsc -b`, Vite production build, and generated service worker.
- `npm run test:browser`: passed, 3/3 Chromium tests after installing the missing Playwright browser in this disposable environment. It covers 390 px shell/aXe, fresh-install offline reload, and controlled-client update activation.
- Production output: JavaScript 23,978 B (9,480 B gzip), CSS 16,107 B (4,660 B gzip), hero WebP 109,354 B. Initial JS/CSS meet the stated budgets.
- Independent local mobile Lighthouse: Performance **97**, Accessibility **100**, Best Practices **100**, SEO **92**; LCP **1,302 ms**, CLS **0**, TBT **204 ms**. This run used Chrome headless with Lighthouse's mobile defaults.

## End-to-end product evidence

- Desktop normal flow: selected 4/4, March, 2 bars, 160 BPM; used the screen tap pad against all 19 rendered onsets. The completed take showed all per-note timing markers and scored **94%**, `9 ms` average edge, 0 extra taps. An intentionally incomplete repeat scored **4%** and presented Again / New, same level / Make it harder.
- Boundary state: 6/8, 4 bars, 160 BPM, level 5 rendered and labelled the dotted-quarter beat correctly. Premium grammars remained unavailable without a license.
- Keyboard-only: Tab reached the visible skip link (4 px focus outline); Space started the count-in and registered a tap; `N` was disabled during a take. No keyboard trap was found.
- Mobile at 390 x 844: no horizontal page overflow (390 px scroll width), tap pad measured 334 x 120 px, and the independent browser suite found all visible targets at least 44 CSS px. Reduced motion changed scrolling to `auto` and tap transition duration to `0.01 ms`.
- Malformed JSON (`{bad`) for settings/history recovered to default 4/4 / 84 BPM with no error. Mic denial fell back to Tap input and announced the denial. A restore token containing `<img src=x onerror=alert(1)>` was not executed/rendered; an intercepted invalid Sociobot response produced the correct inactive-license notice.
- aXe found zero violations (and therefore zero serious/critical findings) on desktop and 390 px mobile. Privacy and terms each have a title, one h1, and zero serious/critical aXe findings. Normal desktop/mobile loads had no console or page errors.

## Release-blocking defect

### High — valid but malformed localStorage blanks the product

**Reproduced locally and on the live deployment.**

1. Load the trainer normally.
2. In site localStorage, set `rr_settings:v1` to:

   ```json
   {"meter":"999","style":"not-a-style","bars":"∞","tempo":"fast","difficulty":99,"lockLevel":"maybe","inputMode":"unknown","calibrationMs":"NaN"}
   ```

3. Reload.

**Actual:** `#app` is empty, no h1 renders, and Chrome reports `Cannot read properties of undefined (reading 'length')` from pattern generation.

Additional independent failures: `rr_history:v1 = {}` produces `R.find is not a function`; `rr_history:v1 = [null]` produces `Cannot read properties of null (reading 'date')`. The visible application is blank in each case.

**Expected:** validate stored shapes/enums/ranges and safely reset or repair invalid settings/history, then render a usable default trainer with a non-blocking notice. Catching JSON parse failures alone is insufficient for a local-first app whose persisted state can be stale, manually edited, or corrupted.

## Privacy, security, PWA, and deployment parity

- Source inspection and a clean normal load found no analytics, trackers, CDN fonts, or third-party scripts. Normal startup requests stayed same-origin. Optional license verification goes only to the documented Sociobot endpoint; microphone data is processed in memory. Privacy/terms accurately describe local settings, history, optional license, microphone handling, purchase merchant, and data clearing.
- Live HTTPS sends HSTS, CSP (`default-src 'self'`; documented Sociobot API only in `connect-src`), `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and a restrictive permissions policy. Hashed JS/CSS use `max-age=31536000, immutable`; the root has 30-second revalidation and `sw.js` has `Cache-Control: no-cache`.
- The live service worker is `rhythm-reader-1.0.1-c37c07a4f01b`, precaches root HTML plus current hashed JS/CSS and static/legal pages, and successfully rendered the h1 and tap pad after an offline reload. The repository browser test also passed explicit old-to-new worker activation.
- SHA-256 matched between candidate `dist/` and live for `index.html`, both hashed assets, art, favicon, manifest, service worker, privacy/terms, and legal CSS. The deployment is therefore the tested candidate, not the prior pre-repair deployment.

## Required resolution and retest

1. Validate every localStorage record after parsing: settings must be a plain object with allowed meter/style/input values and finite bounded numeric fields; history must be an array of valid day records.
2. On invalid data, discard/repair it and render defaults, with a clear recoverable notice where useful.
3. Add automated browser/unit cases for invalid-but-parseable settings and history. Re-run the exact commands above plus local and live malformed-storage reloads before a PASS.

## Known test boundary

Physical microphone/clap-onset accuracy and per-device latency calibration could not be acoustically assessed in this container. Permission-denial and in-memory fallback behavior were exercised.
