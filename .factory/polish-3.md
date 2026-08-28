# Rhythm Reader polish round 3

Base review commit: `e640de17a1da555efe275fa744287c956229ea8e`. This record maps every review finding to the shipped repair and its repeatable proof. Live recheck evidence is recorded after deployment in `.factory/handoff.md`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| Review 1 B1 | Kept the one-click `/demo` and `?demo=1` sample with banner, reset, and a separate `demo:` namespace. Demo state now also clears on every exit path. | `@claim:demo-isolation`; live `/demo`; `.factory/evidence/polish-3/verify-demo.json`. |
| Review 1 B2 | Retained the registry and observable proof for every visitor promise; it now has ten unique tagged claim tests. | `.factory/claims.json`; each command listed there, run separately from a clean clone. |
| Review 1 B3 | The unregistered paid offer remains absent, so there is no dead checkout action. | `@claim:free-no-account`; live link crawl. |
| Review 1 B4 | Route titles, metadata, shared shell, focus announcement, assets, deep links, legal links, and designed 404 remain verified. | `tests/routing.spec.ts`; five-route aXe scan; live `/`, `/demo`, `/privacy`, `/terms`, and unknown path. |
| Review 1 B5 | The first viewport still states the job, adult musician audience, sample action, next result, and three facts. | `tests/routing.spec.ts` 390 px first-screen test; `.factory/evidence/polish-3/verify-root.json`. |
| Review 1 M1 | Kept the plain `rhythm pattern` / `practice` / `tap` vocabulary and updated the full copy audit. | `.factory/copy-audit.md`; README and live copy check. |
| Review 1 M2 | Controls name their result, including the truthful maximum-level action. | `tests/smoke.spec.ts` level-five action test. |
| Review 2 M1 | The input switch continues to name the mode selected by the click; README wording remains plain. | `@claim:input-calibration`; README review. |
| Review 2 M2 | Start for real and every normal site, browser-history, external-navigation, and return path discard demo keys without touching real keys. | Expanded `@claim:demo-isolation`. |
| Review 2 M3 | The input claim still performs screen, Space, synthetic microphone, calibration persistence, and score-correction checks. | `@claim:input-calibration`. |
| F-3-1 | Centralized SPA exit cleanup; added `beforeunload`/`pagehide` cleanup for outside-SPA exits, reload-only snapshot restoration, and history-return reseeding. | Expanded `@claim:demo-isolation` covers wordmark, header, footer, hash, Start for real, direct navigation, browser back, session cleanup, and byte-for-byte real-data preservation. |
| F-3-2 | Registered **Press N to show a new rhythm while practice is idle** and added its observable test. | `@claim:keyboard-shortcuts`. |
| F-3-3 | At difficulty 5, the result action is **Show a new level-5 rhythm**, never the impossible “Raise the difficulty.” | `tests/smoke.spec.ts` level-five action test; live demo with seeded level 5. |
| F-3-4 | The SVG description maps `on` to **on time** and adds punctuation to every generated sentence. | `tests/accessibility.spec.ts` score-description test; live demo accessibility check. |
