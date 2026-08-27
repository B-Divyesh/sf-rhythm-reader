# Rhythm Reader handoff — repair candidate

## What changed

- Replaced the hand-maintained worker with `scripts/generate-sw.mjs`, which runs after every Vite build. It fingerprints the release (`package.json` version plus built content), writes `dist/sw.js`, and precaches every built HTML page, static shell file, and every hashed Vite JS/CSS file under `waitUntil`.
- Navigation requests are network-first with a cached document fallback. Asset requests are cache-first and never receive an HTML fallback. The asset lookup intentionally ignores `Vary: Origin`, which Vite uses and which otherwise prevents a precached module from matching the browser's module request.
- Added an explicit update path: a new worker waits, the app shows **Reload update**, and only that action sends `SKIP_WAITING`; `controllerchange` then reloads into the new release. `/sw.js` is served with `Cache-Control: no-cache` in the Static Web Apps configuration.
- Added release query metadata to the generated manifest start URL. The trainer, microphone path, local history/calibration, and Sociobot license behavior are unchanged.
- Raised the former 390 px misses: skip link, home link, footer links, range controls, and the independent checkbox all have at least 44 CSS px hit areas. The segmented radio choices retain their 44 px labelled switch surface.
- Deferred the below-the-fold mobile collage image so first paint prioritizes the practice headline without changing the product visual system or artwork.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:browser
npm run preview
```

Verification completed on 27 August 2026:

- `npm ci`: passed, 0 audit vulnerabilities.
- `npm test`: passed, 7/7 tests.
- `npm run build`: passed. It produced `dist/` and a generated release worker (`1.0.1-c37c07a4f01b` on the final verification build) with 9 precached files, including the current two hashed JS/CSS assets.
- `npm run test:browser`: passed, 3/3 Chromium checks. A fresh profile installed the worker, went offline, reloaded, and rendered the `h1` plus tap pad with no page errors; a failed unknown JS request failed rather than returning the app document. A previously controlled client then found the waiting worker, displayed **Reload update**, explicitly activated it, and transitioned to the new cache. The 390 px shell had no visible sub-44 px independent controls; axe had no serious or critical findings.
- Local production-preview Lighthouse, 390×844 mobile simulated throttling: Performance **99**, Accessibility **100**, LCP **1,254 ms**, CLS **0**, TBT **111 ms**. Initial JS is 23.98 KB (9.48 KB gzip) and CSS is 16.11 KB (4.66 KB gzip).
- Live-parity check was run against `https://rhythm-reader.sociobot.in`: it still serves the previous `index-D3KsWn3g.js` and 942-byte legacy service worker, whereas this candidate emits `index-CWrJXYyu.js` and the generated worker. That is expected before deployment and confirms the live site has not been accidentally treated as verified repair output.

## Deployment follow-up

The repository is ready to deploy as static `dist/`. After the factory deploys this commit, re-run the live cache-cleared offline reload, old-controlled-client update, and mobile Lighthouse checks against the deployed URL; the currently live pre-repair build cannot satisfy those release assertions until it is replaced.
