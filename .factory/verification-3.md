# Independent verification 3 — PASS

**Candidate:** `e78f3c1750da7cdcb02d87f6c4bb663699514da4` (`e78f3c1`)

**Deployment:** <https://rhythm-reader.sociobot.in> tested 27 August 2026

## Verdict

**PASS.** This candidate satisfies the researched brief's smallest useful product and the previous verification's persisted-state recovery release blocker is fixed. The live static deployment is byte-identical to the production build from this candidate.

## Exact environment and quality gates

- Verified from a new clean detached worktree at the candidate SHA. The supplied `/work/repo` checkout had pre-existing modified `graphify-out/` analysis files; they were not used for source verification or changed by this QA.
- Node `v22.23.2`, npm `10.9.8`, Playwright Chromium `151.0.7922.34` (installed into the disposable container because the browser binary was initially absent).
- `npm ci` passed with 0 reported package vulnerabilities.
- `npm test` passed: **12/12** tests in 3 files.
- There is no separate lint script. `npm run build` passed its available type check (`tsc -b`), Vite production build, and generated build-versioned service worker.
- `npm run test:browser` passed: **4/4** Playwright tests. It covers 390 px semantic/aXe/touch-target checks, malformed parseable storage recovery, fresh-install controlled offline reload, and explicit old-client service-worker update activation.
- Production initial assets: JS **25,919 B / 10,164 B gzip** and CSS **16,148 B / 4,675 B gzip**; the JS and CSS budgets are met. Hero WebP is **109,354 B**.
- Independent local mobile Lighthouse (Lighthouse 12.8.2): Performance **99**, Accessibility **100**, Best Practices **100**, SEO **92**; LCP **1,253 ms**, CLS **0**, TBT **122 ms**, transfer **127,922 B**.

## Product acceptance evidence

- On a 390 x 844 viewport, the trainer had one `h1`, one `main`, `lang=en`, title, visible 4 px focus treatment, no horizontal overflow, and every visible interactive target was at least 44 CSS px. aXe found **zero serious or critical** findings (zero total violations).
- On desktop 1440 x 1000, aXe again found zero serious/critical findings and browser console/page-error listeners remained empty. Visual inspection confirmed the cassette-zine design matches `.factory/design.md` at both sizes.
- Keyboard-only use: Tab reached the Skip to trainer link with a visible focus outline; Enter moved to `main`; Space starts/registers a take and `N` generates a new pattern outside an active take.
- End-to-end drill: selected 6/8, 160 BPM, 2 bars, completed count-in/tapping, received a percentage plus per-note early/late/missed markers and extra-tap feedback, and confirmed the local daily history record. The level-5 boundary remained clamped after **Make it harder**.
- Boundary and recovery paths: selected 6/8, 4 bars, 160 BPM, level 5 and confirmed settings persisted; malformed but parseable settings/history recovery is covered by the passing browser regression; denied microphone input returns to tap input with a live announcement; an intercepted invalid license gives “That license is not active for Rhythm Reader”; insufficient calibration taps give “Not enough matched taps. Try again in a quiet spot.”
- `prefers-reduced-motion: reduce` reduces control transition duration to `0.01ms` and the stylesheet switches smooth scrolling to automatic.
- PWA: the passing browser suite verified a newly controlled client reloads the complete app offline, with cached current HTML and hashed JS/CSS; missing assets fail rather than being served HTML. It also verified an old controlled client exposes and activates a new worker.

## Privacy, browser policy, and deployment parity

- Normal local and live initial loads requested only same-origin HTML, hashed JS/CSS, and the self-hosted artwork. No analytics, tracking, third-party scripts, or CDN fonts were requested.
- The only exercised optional outbound request was the documented license restore request to `https://api.sociobot.in/api/v1/products/rhythm-reader/verify`; it occurs only after a user submits a restore token. The API's OPTIONS response permits the deployed origin. Checkout is a user-followed Sociobot link.
- Source and UI inspection confirm local-first settings/history/license storage; microphone analysis stays in-browser and audio is not uploaded. Privacy and terms are served and accurately disclose this.
- Live HTTPS responses include HSTS, CSP restricted to self plus documented Sociobot API `connect-src`, `X-Content-Type-Options: nosniff`, strict-origin referrer policy, and restrictive camera/geolocation/microphone permissions policy. The root revalidates at 30 seconds; hashed assets use `public, max-age=31536000, immutable`; `sw.js` is `no-cache`.
- SHA-256 was identical between `dist/` and live for all ten checked deployables: root HTML, both hashed assets, service worker, WebP artwork, manifest, favicon, legal CSS, privacy page, and terms page. Live desktop and mobile then independently showed no console/page errors and zero aXe serious/critical findings.

## Defects

No release-blocking, high, medium, or low product defects found.

## Known test boundary

Physical microphone/clap onset accuracy and actual per-device latency calibration cannot be measured acoustically in this container. Permission-denial, tap fallback, and insufficient-sample calibration recovery were exercised. No production code was modified during this verification.
