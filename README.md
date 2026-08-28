# Rhythm Reader

Rhythm Reader helps adult pianists, guitarists, and drummers practice short rhythm patterns. It marks each tap early, on time, late, or missed.

Live product: <https://rhythm-reader.sociobot.in>

One-click sample: <https://rhythm-reader.sociobot.in/demo>

## What it includes

- A completed sample with early, on-time, late, and missed marks
- Demo settings and history kept separate from real practice data
- Offline use after the first visit
- Practice history stored in this browser
- Five rhythm styles, three time signatures, and patterns from two to four bars
- Screen taps, Space-key taps, and microphone claps with a saved timing adjustment
- The full trainer without a payment or account gate

Practice data and microphone audio are not sent anywhere else. Microphone audio is checked in memory and is not recorded.

Rhythm Reader does not grade pitch, read MIDI, or provide song transcriptions.

## Run and verify

Use Node.js 20 or newer.

```sh
npm ci
npm test
npm run build
npm run test:claims
npm run test:browser
npm run preview
```

`npm run build` creates the static site in `dist/`. It also creates the offline worker.

Each visitor-facing promise and its test command is listed in [`.factory/claims.json`](.factory/claims.json).

## Deployment

Deploy `dist/` as an Azure Static Web App. The factory owns DNS and deployment configuration.

See [`.factory/brief.json`](.factory/brief.json) for scope. See [`.factory/design.md`](.factory/design.md) for the visual system and how the artwork was made.

## License

This project uses the MIT License. See [`LICENSE`](LICENSE).
