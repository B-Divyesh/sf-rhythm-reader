# Rhythm Reader polish round 3

Base review commit: `e640de17a1da555efe275fa744287c956229ea8e`. Repair code shipped in `6d643f08748af770603972e388e079aa1f03d5a2` and was deployed in Azure Static Web Apps deployment `c721fe6e-df9f-419b-8958-3a46d0bfbf8d`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| Review 1 B1 | Kept the one-click `/demo` and `?demo=1` sample with banner, reset, and a separate `demo:` namespace. Demo state now also clears on every exit path. | `@claim:demo-isolation`; [live demo capture](evidence/polish-3/live-demo/screenshot-mobile.png); `https://rhythm-reader.sociobot.in/demo`. |
| Review 1 B2 | Retained the registry and observable proof for every visitor promise; it now has ten unique tagged claim tests. | `.factory/claims.json`; each command listed there passed separately in clean clone `/tmp/rhythm-reader-polish3.jD4aGc`. |
| Review 1 B3 | The unregistered paid offer remains absent, so there is no dead checkout action. | `@claim:free-no-account`; live crawl of 13 rendered links passed. |
| Review 1 B4 | Route titles, metadata, shared shell, focus announcement, assets, deep links, legal links, and designed 404 remain verified. | `tests/routing.spec.ts`; live aXe on five routes; [root verification](evidence/polish-3/live-root/verify.json). |
| Review 1 B5 | The first viewport still states the job, adult musician audience, sample action, next result, and three facts. | `tests/routing.spec.ts` 390 px first-screen test; [live 390 px capture](evidence/polish-3/live-root/screenshot-mobile.png). |
| Review 1 M1 | Kept the plain `rhythm pattern` / `practice` / `tap` vocabulary and updated the full copy audit. | `.factory/copy-audit.md`; cold live root check. |
| Review 1 M2 | Controls name their result, including the truthful maximum-level action. | `tests/smoke.spec.ts` level-five action test; [live level-five capture](evidence/polish-3/live-level-five.png). |
| Review 2 M1 | The input switch continues to name the mode selected by the click; README wording remains plain. | `@claim:input-calibration`; live demo capture. |
| Review 2 M2 | Start for real and every normal site, browser-history, external-navigation, and return path discard demo keys without touching real keys. | Expanded `@claim:demo-isolation`; live exit/reseed probe. |
| Review 2 M3 | The input claim still performs screen, Space, synthetic microphone, calibration persistence, and score-correction checks. | `@claim:input-calibration` passed from the clean clone. |
| F-3-1 | Centralized SPA exit cleanup; added `beforeunload`/`pagehide` cleanup for outside-SPA exits, reload-only snapshot restoration, and history-return reseeding. | Expanded `@claim:demo-isolation` covers wordmark, header, footer, hash, Start for real, direct navigation, browser back, session cleanup, and byte-for-byte real-data preservation; live probe passed. |
| F-3-2 | Registered **Press N to show a new rhythm while practice is idle** and added its observable test. | `@claim:keyboard-shortcuts`; live `/demo` probe pressed `N` and observed a new rhythm identifier. |
| F-3-3 | At difficulty 5, the result action is **Show a new level-5 rhythm**, never the impossible “Raise the difficulty.” | `tests/smoke.spec.ts` level-five action test; [live level-five capture](evidence/polish-3/live-level-five.png). |
| F-3-4 | The SVG description maps `on` to **on time** and adds punctuation to every generated sentence. | `tests/accessibility.spec.ts` score-description test; live `/demo` description probe and aXe scan passed. |
