# Rhythm Reader

Rhythm Reader is a local-first tap-in sight-reading trainer for adult amateur pianists, guitarists, and drummers. It generates short exercises from original folk, march, pop, swing, and clave pattern grammars, then marks each performed onset as early, on time, late, or missed.

Live product: <https://rhythm-reader.sociobot.in>

## What it includes

- Custom SVG rhythm notation for 4/4, 3/4, and 6/8 exercises from two to four bars
- Audible count-in and screen, Space-key, or microphone/clap input
- Per-device timing calibration, per-note feedback, overall score, and level controls
- A 14-day drill calendar stored only in local storage
- Offline practice via a release-versioned precache, with a visible reload control when an update is ready
- Free folk and march grammars; a one-time Sociobot license unlocks additional styles

This deliberately does not grade pitch, accept MIDI, provide accounts, or transcribe copyrighted songs. Microphone audio is processed in memory and is never recorded or uploaded.

## Run and verify

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
npm run test:browser
npm run preview
```

The exact production build command is `npm run build`. It runs Vite and then generates `dist/sw.js` from the current release: the worker precaches built HTML plus all Vite-hashed JavaScript/CSS, never substitutes HTML for failed asset requests, and waits for the in-app **Reload update** confirmation before activating an update. Static output lands in `dist/`, with `dist/index.html` at its root. `VITE_BILLING_BASE` can override the production billing origin for a registered staging product; the default is `https://api.sociobot.in`.

`npm run test:browser` rebuilds first, then verifies the cache-cleared offline reload, explicit service-worker update activation, 390 px touch targets, semantic shell, and axe serious/critical findings in Chromium.

## Deployment

Deploy `dist/` as an Azure Static Web App. `public/staticwebapp.config.json` supplies fallback routing, security headers, and immutable-friendly hashed asset behavior. The factory owns DNS and billing-product registration.

The researched scope is in [`.factory/brief.json`](.factory/brief.json), the cassette-zine visual system and artwork provenance in [`.factory/design.md`](.factory/design.md), and build verification in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT. See [`LICENSE`](LICENSE).
