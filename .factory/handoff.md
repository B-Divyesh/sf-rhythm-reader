# Rhythm Reader handoff — adversarial review 1

## Status: **FAIL**

On 28 August 2026, a read-only first-visitor review was completed against the live site at <https://rhythm-reader.sociobot.in>. The full evidence and copy audit are in [`.factory/review-1.md`](review-1.md).

### What was verified

- Fresh mobile (390 px) and desktop visits, live route/metadata checks, link crawl, and a direct `?demo=1` storage-isolation check.
- A clean local clone at `c7011136ddd1ae591f784cfb0605f4d6e94e85e5`: `npm test` (12 passed), `npm run build` (passed), and `npm run test:browser` (4 passed).
- The review made no product-code changes. This handoff and the review are the only intended committed changes; pre-existing `graphify-out/` modifications were left untouched.

### Known blockers / next steps

1. Implement a real, isolated sample demo with reset/start-real controls and documentation.
2. Add `.factory/claims.json` and clean-state, observable claim tests.
3. Repair/register the style-pack checkout endpoint; the live CTA returned 404.
4. Add real `/demo` and designed `/404` routes plus canonical/OG/Twitter, robots, sitemap, and Apple-touch artifacts.
5. Replace the slogan-led first screen with a plain job, audience, and sample CTA; simplify inconsistent jargon.

---

# Rhythm Reader handoff — verification 3 PASS

## Status: **PASS** — deployed static web

Independent verification of candidate `e78f3c1750da7cdcb02d87f6c4bb663699514da4` against <https://rhythm-reader.sociobot.in> passed on 27 August 2026. The live deployment is byte-identical to the candidate production build. See `.factory/verification-3.md` for exact evidence and the complete acceptance report.

### Final verifier evidence

- Clean-worktree `npm ci`, `npm test` (**12/12**), exact `npm run build`, and `npm run test:browser` (**4/4**) passed.
- Verified normal tap-in drill completion, timing feedback/history, settings boundaries, keyboard flow, mobile 390 px, desktop, mic/license/calibration recovery, reduced motion, service-worker offline reload and update activation.
- Live desktop and mobile had no console/page errors and zero aXe serious/critical findings. Local mobile Lighthouse: Performance 99, Accessibility 100, Best Practices 100, SEO 92; LCP 1,253 ms and CLS 0.
- No product defects were found. Hardware acoustic accuracy remains the only untestable boundary in this container.

---

# Rhythm Reader handoff — persisted-state recovery repair

This repair resolves the release blocker reported against candidate `1fed988de87f5df8360a95fca0c64659129ceb97`: valid JSON with an invalid shape or values in `rr_settings:v1` or `rr_history:v1` can no longer blank the trainer.

## What changed

- Added runtime normalization at the localStorage boundary. Settings now require the supported meter, style, and input-mode enums; 2–4 bars; even 50–160 BPM; difficulty 1–5; a boolean level lock; and an integer calibration offset from -250 to 250 ms.
- History now requires an array of real UTC `YYYY-MM-DD` day records with bounded integer drill counts and 0–100 scores. Invalid items, including `null`, are removed; duplicate days are merged; records are sorted and retained for the latest 90 days.
- Repaired JSON is written back when storage is available. Parse failures, `null`, `{}`, malformed arrays, and unavailable storage all fall back safely without throwing.
- A non-blocking status strip explains that saved practice data was repaired, while the default trainer renders normally.
- Added exact regressions for the reported invalid-enum/range settings object, `null` settings, `{}` history, `null`/invalid history items, duplicate-day normalization, and a browser reload with malformed settings and history.

## Verification

Run from the repository root:

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

Completed locally on 27 August 2026:

- `npm test` — **12/12 passed**.
- `npm run build` — passed (`tsc -b`, Vite, and versioned service-worker generation). Production initial JS is **25.92 kB** (10.21 kB gzip) and CSS is **16.15 kB** (4.68 kB gzip).
- `npm run test:browser` — **4/4 passed**: 390 px shell/touch targets and aXe serious/critical scan, malformed parseable storage recovery with no page errors, fresh controlled-client offline reload, and explicit service-worker update activation.
- `verify-url.sh` against the built local preview — HTTP 200, no console/page errors, title/lang/one h1/main/alt checks passed at desktop and 390 px.
- Mobile Lighthouse — Performance **98**, Accessibility **100**, Best Practices **100**, SEO **92**; LCP **1,275 ms**, CLS **0**.

## Deployment and live verification

Deployed `dist/` to the `rhythm-reader` **Standard** Azure Static Web App on 27 August 2026. The public URL is <https://rhythm-reader.sociobot.in>.

- Deployment `03269ac5-a633-4288-ae4e-c93591250a67` completed successfully; HTTPS returned 200.
- `verify-url.sh` on the live URL reported no console or page errors, and passed title/lang/one h1/main/alt checks at desktop and 390 px mobile.
- Live Playwright regression seeded the exact invalid settings object and malformed history array, then confirmed the visible repair notice, default 84 BPM trainer, normalized default settings, empty normalized history, and no errors.
- The same fresh live client was controlled by the service worker and reloaded offline with the trainer h1 intact.
- Live 390 px Playwright aXe scan found **0 violations** (0 serious/critical).
- The local browser suite verifies the separate old-client update activation path; a deliberate live release update is not triggered during post-deploy verification.

## Known gaps

Physical clap onset accuracy and per-device calibration remain hardware-dependent and cannot be acoustically measured in this container. Permission-denial fallback remains covered by the existing product behavior.
