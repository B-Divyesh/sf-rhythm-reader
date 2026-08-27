# Independent verification — FAIL

**Tested candidate:** `04716b684d98e71614c1d7c63098de25da89aad1` (`04716b6`)

**Tested deployment:** <https://rhythm-reader.sociobot.in> on 27 August 2026

**Verdict: FAIL.** The tap-in trainer’s core browser flow works, but the shipped PWA cannot reload offline. This directly contradicts the documented “Offline practice via a small service worker” feature and the work order’s required PWA offline-reload verification.

## Exact environment and build

- Created a fresh detached clone of the candidate, outside the supplied worktree (which contained unrelated untracked `graphify-out/` files).
- Node `v22.23.2`, npm `10.9.8`.
- `npm ci`: passed; audit reported **0 vulnerabilities**.
- `npm test`: passed, **7/7** tests in 3 files.
- No separate lint script exists. `npm run build` ran the available TypeScript check (`tsc -b`) and exact production Vite build successfully.
- Production output: JS 23,358 bytes / 9.27 KB gzip; CSS 15,711 bytes / 4.59 KB gzip; hero WebP 109,354 bytes. Initial JS is well below the 200 KB budget.

## Product checks

- Desktop and 390×844 mobile Playwright checks passed without horizontal viewport overflow (390 px scroll width = 390 px). The primary tap pad was 334×120 px on mobile.
- A normal tap drill was completed in 6/8 at 160 BPM: count-in, taps, per-note E/ON/L/× feedback, percentage score, repeat/same-level/harder controls, and local take history all appeared. A deliberately imperfect take scored 61% with four extra taps; scheduled note taps produced 88% and zero extra taps.
- Boundary settings exercised: 6/8, 160 BPM, two bars, free March grammar; locked premium grammars remained disabled.
- Keyboard-only smoke passed: Tab reached the skip link with a 4 px visible focus outline; `N` changed the pattern; Space started the count-in.
- `prefers-reduced-motion: reduce` changed scrolling to `auto` and tap transition duration to `0.01ms`.
- Malformed `rr_settings:v1` and `rr_history:v1` localStorage values recovered to the default 4/4, 84 BPM, Folk state without a page error.
- A malicious-looking restored license token (`<img src=x onerror=alert(1)>`) was not rendered/executed. With a stubbed invalid billing response, the dialog announced “That license is not active for Rhythm Reader.”
- With microphone permission/device unavailable, starting mic mode fell back to screen/Space tap input and announced the device failure. A physical microphone/clap-onset quality test was not possible in this container.
- `@axe-core/playwright` found **0 serious or critical findings** (in fact zero violations) on the loaded desktop page. Semantic smoke passed: `lang=en`, title, exactly one `h1`, one `main`, and no image missing `alt`. Normal desktop/live flows had no console errors or page errors.
- Live Lighthouse mobile result: Performance **90**, Accessibility **100**, LCP **2,864 ms**, CLS **0**, TBT **253 ms**.

## Privacy, requests, security, deployment parity

- Initial normal page load made no outbound request. The only optional outbound paths found are Sociobot checkout/verification; no analytics, CDN font, or third-party script is loaded.
- Privacy/terms accurately disclose local settings/history/license storage, optional microphone processing, and Sociobot/Dodo billing. The candidate stores audio only in memory and does not upload it.
- Live responses include HSTS, CSP, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, and a restrictive permissions policy. CSP limits `connect-src` to the two documented Sociobot API origins.
- Live HTML uses the exact candidate `index-D3KsWn3g.js` and `index-ifoukYFN.css`; SHA-256 matched for every deployable artifact checked: index, JS, CSS, art, favicon, manifest, service worker, privacy/terms pages, and legal CSS. `/staticwebapp.config.json` is deployment configuration, so the host returns the SPA document rather than serving it publicly.
- Live caching is correct for hashed JS/CSS (`max-age=31536000, immutable`), and index/service-worker HTML has a 30-second revalidation policy.

## Release-blocking defects

### High — PWA offline reload fails (observed)

**Steps:** Start with a clean browser profile at the candidate production preview; wait for the service worker to activate and control the page; switch the browser offline; reload. Repeat after returning online and reloading once.

**Expected:** The documented offline shell reloads the trainer and permits local practice.

**Actual:** Both offline reloads leave an empty `#app` with no `h1`. Chrome reports: “Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of `text/html`.”

**Evidence:** Cache `rhythm-reader-v1` contains only `/`, favicon, manifest, art, privacy, and terms. It contains neither `/assets/index-D3KsWn3g.js` nor `/assets/index-ifoukYFN.css`. For a missing asset, `sw.js` falls back to the cached `/` document, yielding HTML for a JavaScript request. The un-awaited dynamic `cache.put` does not make the assets reliably available. The exact live `sw.js` has the same SHA-256, so the deployed site has the same defect.

### Medium — service-worker update is not safely versioned

`public/sw.js` hard-codes `rhythm-reader-v1`, precaches a cache-first `/`, and does not inject the current hashed build assets or a build version. Therefore a deploy where `sw.js` itself is unchanged can indefinitely retain the old cached root, which still points at prior hashed assets. This does not meet the required service-worker update behavior. The failed offline reload above also prevented a successful end-to-end update/offline cycle.

### Medium — live mobile performance budget missed

The independent mobile Lighthouse run measured LCP 2.864 s (budget: <2.5 s) and TBT 253 ms. Performance score was 90 and bundle sizes pass, but this misses the explicit LCP target.

### Medium — several 390 px interactive targets are below the stated 44 px minimum

Measured examples: skip link 140×42 px, wordmark/home link 175×40 px, footer Privacy/Terms/Source links 52×17, 44×17, and 51×17 px. Axe does not flag these, but they fail the factory accessibility/touch-target requirement.

## Required next steps

1. Replace the service worker with a build-versioned, `waitUntil`-backed precache of the generated `index.html`, hashed JS/CSS, and required static assets; cache navigation separately from asset requests and never answer an asset request with the HTML fallback. Verify a fresh-install offline reload and an old-to-new service-worker update in a clean browser profile.
2. Re-run mobile Lighthouse after the offline fix and reduce LCP below 2.5 seconds.
3. Increase the small links/controls to 44×44 CSS px (or supply padding that creates that hit target), then recheck at 390 px.
