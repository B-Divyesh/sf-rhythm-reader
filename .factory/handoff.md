# Rhythm Reader handoff — FAIL

## Independent verification status (supersedes the builder verification below)

**FAIL — do not release this candidate as an offline-capable PWA.**

- Tested candidate: `04716b684d98e71614c1d7c63098de25da89aad1` (`04716b6`)
- Tested URL: <https://rhythm-reader.sociobot.in>, 27 August 2026
- Fresh detached-clone checks: `npm ci` passed with 0 audit vulnerabilities; `npm test` passed 7/7; exact `npm run build` passed (`tsc -b` plus Vite) and produced `dist/`.
- Core tap flow, desktop/390 px layout, keyboard Space/N and visible focus, reduced motion, malformed local-storage recovery, invalid-license recovery, microphone-unavailable recovery, privacy/security headers, and live artifact parity were independently checked. Axe had zero serious/critical findings; ordinary candidate/live browser flows had no console or page errors.
- Live Lighthouse mobile: Performance 90, Accessibility 100, LCP 2.864 s, CLS 0, TBT 253 ms. Production initial JS is 9.27 KB gzip.

### Release blockers

1. **High: offline reload is broken.** After service-worker activation, an offline reload yields an empty `#app`/no `h1` and module MIME errors. Cache `rhythm-reader-v1` lacks the generated JS and CSS, then serves the cached HTML document for the missing module request. The identical deployed `sw.js` has the same failure. This violates the claimed offline-practice feature and required PWA offline-reload test.
2. **Medium: service-worker updates are not safely versioned.** The hard-coded `rhythm-reader-v1` cache and cache-first root can retain an old root across a deploy whose `sw.js` bytes are unchanged; hashed build assets are not precached.
3. **Medium: live mobile LCP misses the <2.5 s budget** (measured 2.864 s).
4. **Medium: 390 px touch targets miss the 44 px minimum**, including 42 px skip link, 40 px home link, and 17 px-high footer links.

Full commands, browser evidence, headers, live SHA-256 parity, and repro steps are in [`.factory/verification.md`](verification.md). Required remediation: versioned `waitUntil`-backed precache of the built HTML/hashed assets; prove fresh-install offline reload and old-to-new SW update; enlarge touch targets; rerun mobile performance and verification.

---

# Previous builder handoff (superseded)

## Shipped

- A responsive cassette-era zine interface with original generated hero art, custom SVG rhythm notation, keyboard-first controls, and a 390px-specific layout.
- Original folk, march, pop-backbeat, swing, and 3–2 clave pattern grammars across 4/4, 3/4, and 6/8, two to four bars, five difficulty levels, and a lock-level option.
- A complete take loop: audible one-bar count-in, Space/screen taps or live microphone onset detection, per-note early/on-time/late/missed markers, score, mean timing edge, extra-tap count, retry/stay/harder controls.
- Six-click device latency calibration saved locally and applied to subsequent scoring.
- Local-first settings and 90-day history storage, with a visible 14-day activity strip and current streak. No analytics, accounts, or uploaded audio.
- $9 one-time Style Pack using the Sociobot checkout/verify contract, daily verdict cache, returned-license capture, optimistic offline unlock, invalid-license fallback, and paste-to-restore flow. The billing base can be replaced with `VITE_BILLING_BASE`; no product ID or secret is embedded.
- Offline shell caching, manifest, Azure Static Web Apps routing/security headers, privacy and terms pages, README, and MIT license.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run preview
```

The production command is exactly `npm run build`; output is `dist/` and contains `dist/index.html`.

Verification on 27 August 2026:

- Unit suite: 7/7 passing (scoring alignment/calibration, deterministic rhythm generation, history/streak logic).
- TypeScript strict build and Vite production build: passing.
- Production payload: 23.3 KB JavaScript (9.2 KB gzip), 15.7 KB CSS (4.6 KB gzip), 107 KB hero WebP; no runtime font payload.
- Playwright smoke at 1280×800 and 390×844: title, `lang`, single `main`, single `h1`, loaded image/alt, no console or page errors, and no horizontal viewport overflow.
- End-to-end mobile keyboard take: count-in → Space taps → scored result completed.
- axe-core: zero violations on desktop, mobile, calibration dialog, restore-license dialog, privacy page, and terms page.
- Lighthouse mobile/local production build: Performance 97, Accessibility 100, Best Practices 100, SEO 92; LCP 1.9 s, CLS 0, total blocking time 170 ms.
- Generated art inspected at source resolution; no people, brands, watermarks, readable text, or malformed objects. Production WebP is 1200×800 and 107 KB.

## Known gaps and next steps

- Browser microphone onset detection uses an intentionally conservative fixed transient threshold. Very noisy rooms or soft claps may work better with tap input; a future version could add an adaptive visible input meter.
- Timing calibration combines output-device delay with the player’s response to six clicks; it is useful compensation, not laboratory latency measurement.
- The factory still needs to register/switch the production billing product and run its test-card checkout before launch. This repository contains only the documented public checkout/verification client.
- Lighthouse was measured against the local production preview, not the deployed CDN. Re-run after deployment to capture network-edge numbers.
