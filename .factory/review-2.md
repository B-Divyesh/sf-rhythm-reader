# Rhythm Reader — adversarial first-read review 2

**Date:** 28 August 2026

**Target:** <https://rhythm-reader.sociobot.in>

**Reviewed commit:** `ab23cbb9ebffe9b775b38275e60e4d9e4839aefa`
**Verdict:** **PASS**

There are zero BLOCKING findings and three minor findings. The first screen is clear at 390 px and desktop, the one-click demo immediately shows a realistic scored result, real practice data remains isolated, and all nine registered claim commands pass from a clean clone.

## Cold first read before scrolling

I opened the live URL in new Chromium contexts at 390 × 844 and 1440 × 900 with empty browser storage. I recorded only text visible in the first viewport before scrolling.

| Question | First-time answer | Exact copy that supports it |
| --- | --- | --- |
| What does this do? | It lets me practice reading rhythms by tapping and shows timing feedback. | “Practice reading rhythms by tapping them”; “See a scored two-bar rhythm right away.” |
| For whom? | Adult pianists, guitarists, and drummers preparing for rehearsal. | “For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal.” |
| What should I click first? | Open the pre-filled example. | “Try it with sample data” |

The same job, audience, action, expected result, and three facts were visible without scrolling in both viewports. The mobile page had no horizontal overflow (`scrollWidth = innerWidth = 390`). No first-screen blocker was found.

## Findings

### M1 — The input-mode button names the current state, not the click result

**Quote/evidence:** In the default keyboard/screen mode the button says “Use keyboard or screen taps.” Clicking it changes the mode to microphone input and changes the label to “Use microphone claps.” The labels are therefore reversed as action labels. README also uses “timing-mark types,” “off-device,” and “art provenance.”

**Why this can confuse a first-time visitor:** A verb-led button should predict what clicking does. This button appears to confirm the already active mode, while actually selecting the other one. The two README phrases require readers to translate implementation language.

**Concrete fix:** When keyboard/screen mode is active, label the button **Use microphone claps**. When microphone mode is active, label it **Use keyboard or screen taps**. Rewrite the sample bullet as **A completed sample with early, on-time, late, and missed marks**, “not sent off-device” as **not sent anywhere else**, and “art provenance” as **how the artwork was made**.

### M2 — “Start for real” does not discard the demo namespace

**Quote/evidence:** The banner says “Demo — sample data, nothing is saved.” After changing the demo and clicking “Start for real,” `demo:rr_settings:v1` and `demo:rr_history:v1` remained in local storage. Real `rr_*` values were unchanged, so isolation works, but returning to `/demo` can resume the old demo state.

**Why this can mislead a first-time visitor:** “Start for real” reads as leaving the sample behind. Retaining the sample changes conflicts with that expectation and with the demo contract that leaving demo mode discards demo data.

**Concrete fix:** Run `resetDemoStorage()` before navigating from **Start for real**, then add a browser assertion that no `demo:` keys remain after the action while all `rr_*` keys remain byte-for-byte unchanged.

### M3 — The input/calibration claim test checks controls, not the promised outcomes

**Quote/evidence:** The registered claim says, “Screen, Space-key, and microphone-clap input are available, with a saved timing adjustment.” Its passing `@claim:input-calibration` test starts with Space, changes the mode, opens the dialog, and checks the sentence “saved adjustment is applied.” It does not submit a screen tap, simulate a microphone clap, complete six calibration taps, reload to prove persistence, or compare a score with and without the saved offset.

**Why this matters:** The command is green even if microphone clap detection or calibration persistence/application breaks. A visitor-facing promise is therefore not fully protected by an observable outcome test.

**Concrete fix:** Use the fake audio device to produce a detectable clap during the playing phase; complete calibration with controlled timestamps; reload and verify the saved offset; then score fixed tap times twice and assert that applying the offset changes the measured timing gap by the saved amount.

## Copy audit

Counts treat hyphenated terms as one word. No sentence exceeds 22 words and no banned marketing adjective appears. The default landing copy is listed first; conditional status, result, and dialog sentences are listed separately because they are also landing-page copy.

### Landing-page sentences

| Words | Exact sentence | Check |
| ---: | --- | --- |
| 13 | For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal. | Clear |
| 7 | See a scored two-bar rhythm right away. | Clear; claim covered by `timing-feedback` |
| 6 | Works offline after your first visit. | Clear; claim covered by `offline-reload` |
| 6 | Practice history stays in this browser. | Clear; claim covered by `privacy-local-only` |
| 3 | Free to use. | Clear; claim covered by `free-no-account` |
| 2 | No account. | Clear; claim covered by `free-no-account` |
| 4 | Space starts or taps. | Clear |
| 5 | N shows a new rhythm. | Clear |
| 8 | Choose folk, march, pop, swing, or clave rhythms. | Clear for the named musician audience; covered by `rhythm-options` |
| 6 | Check the timing of each tap. | Clear |
| 8 | Scan both bars and count one bar silently. | Clear for the named musician audience |
| 11 | Use Space, the large button, or microphone claps after the count. | Clear; covered by `input-calibration` |
| 10 | See early, on-time, late, and missed marks with a score. | Clear; covered by `timing-feedback` |
| 5 | Timing practice, not music grading. | Clear |
| 11 | Rhythm Reader does not grade pitch, read MIDI, or copy songs. | Clear for the named musician audience; covered by `scope-boundaries` |
| 10 | It only compares your tap times with the shown rhythm. | Clear; covered by `scope-boundaries` |
| 7 | Practice rhythm patterns and check each tap. | Clear |
| 8 | Collage created for Rhythm Reader with AI assistance. | Clear; covered by `art-provenance` |

### Conditional landing-page sentences

| Words | Exact sentence | Check |
| ---: | --- | --- |
| 2 | Rhythm notation. | Clear accessible label |
| 6 | Scroll sideways on a small screen. | Clear accessible instruction |
| 3 | You are offline. | Clear |
| 5 | Rhythm practice is still available. | Clear; covered by `offline-reload` |
| 5 | Damaged practice data was reset. | Clear error outcome |
| 6 | You can start a new rhythm. | Clear recovery action |
| 5 | A new version is ready. | Clear status |
| 4 | Use headphones if possible. | Clear |
| 12 | Tap the large button or Space when each click reaches your ears. | Clear |
| 9 | The saved adjustment is applied to later timing scores. | Clear, but behavioral proof is incomplete; see M3 |
| 4 | Your taps were steady. | Clear result |
| 4 | Check the marked taps. | Clear result/action |
| 9 | Try the rhythm once more at a slower speed. | Clear result/action |
| 6 | Lower the speed and count aloud. | Clear result/action |
| 4 | Not enough taps matched. | Clear error |
| 6 | Try again in a quiet place. | Clear recovery action |

### README sentences and bullet lines

Bullets are included even when they are fragments because they are visitor-facing copy.

| Words | Exact copy | Check |
| ---: | --- | --- |
| 12 | Rhythm Reader helps adult pianists, guitarists, and drummers practice short rhythm patterns. | Clear |
| 10 | It marks each tap early, on time, late, or missed. | Clear; covered by `timing-feedback` |
| 10 | A completed sample with a score and four timing-mark types | Understandable, but “timing-mark types” is stiff; prefer **A completed sample with early, on-time, late, and missed marks** |
| 10 | Demo settings and history kept separate from real practice data | Clear; covered by `demo-isolation` |
| 6 | Offline use after the first visit | Clear; covered by `offline-reload` |
| 6 | Practice history stored in this browser | Clear; covered by `privacy-local-only` |
| 13 | Five rhythm styles, three time signatures, and patterns from two to four bars | Clear; covered by `rhythm-options` |
| 10 | Screen, Space-key, and microphone-clap input with a saved timing adjustment | Clear enough for musicians; behavioral proof gap in M3 |
| 9 | The full trainer without a payment or account gate | Clear; covered by `free-no-account` |
| 9 | Practice data and microphone audio are not sent off-device. | Jargon: “off-device”; rewrite in M1 |
| 10 | Microphone audio is checked in memory and is not recorded. | “In memory” is technical but explains the privacy mechanism; covered by `privacy-local-only` |
| 12 | Rhythm Reader does not grade pitch, read MIDI, or provide song transcriptions. | Clear for the named audience; covered by `scope-boundaries` |
| 6 | Use Node.js 20 or newer. | Appropriate developer instruction |
| 9 | `npm run build` creates the static site in `dist/`. | Appropriate developer instruction |
| 6 | It also creates the offline worker. | Appropriate developer instruction |
| 13 | Each visitor-facing promise and its test command is listed in `.factory/claims.json`. | Clear |
| 8 | Deploy `dist/` as an Azure Static Web App. | Appropriate deployment instruction |
| 7 | The factory owns DNS and deployment configuration. | Clear ownership statement |
| 6 | See `.factory/brief.json` for scope. | Clear |
| 11 | See `.factory/design.md` for the visual system and art provenance. | Jargon: “art provenance”; rewrite in M1 |
| 6 | This project uses the MIT License. | Clear |
| 2 | See `LICENSE`. | Clear |

### Headings, terminology, and controls

The landing headings make sense when read alone: “Practice reading rhythms by tapping them,” “Choose your rhythm,” “Practice history,” “How rhythm practice works,” “Check the timing of each tap,” “Read the rhythm,” “Tap or clap,” “Check each tap,” “What it does not do,” and “Timing practice, not music grading.” README headings also identify their sections without surrounding context.

Terminology is consistent around **rhythm/rhythm pattern**, **practice**, **practice history**, **tap**, **timing adjustment**, and **rhythm style**. No banned marketing adjective appears. Result-naming controls include **Try it with sample data**, **Show a new rhythm**, **Start practice**, **Adjust tap timing**, **Try this rhythm again**, **Raise the difficulty**, **Reload the update**, **Start timing adjustment**, **Reset demo**, and **Start for real**. The one reversed input-mode label is M1.

## Demo and sandbox verification

From a fresh 390 px context, one click on **Try it with sample data** opened `/demo` with:

- title `Demo — Rhythm Reader` and h1 “See a scored two-bar rhythm”;
- the persistent banner, **Reset demo**, and **Start for real**;
- a 64% completed result, average timing gap, and early/on-time/late/missed markers;
- three realistic practice-history days.

I seeded `rr_settings:v1` and `rr_history:v1`, changed the demo meter to 6/8, and reset the demo. The real values remained byte-for-byte unchanged. Demo writes used only `demo:rr_settings:v1` and `demo:rr_history:v1`. Request interception across entry and use observed zero cross-origin requests. The clean `offline-reload` claim test loaded the sample, enabled browser offline mode, reloaded, and found the scored demo and banner. M2 records the only sandbox lifecycle gap.

## Claims verification

I cloned commit `ab23cbb9ebffe9b775b38275e60e4d9e4839aefa` into `/tmp/rhythm-reader-review2.njNEpC`, ran `npm ci`, and ran each command from `.factory/claims.json` separately.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `timing-feedback` | PASS | Score and early, on-time, late, and missed marks |
| `demo-isolation` | PASS | Demo-only settings/history keys; seeded real values unchanged after change/reset |
| `offline-reload` | PASS | `/demo` reloaded offline with result and banner |
| `privacy-local-only` | PASS | No cross-origin requests or persisted audio; demo-only keys |
| `input-calibration` | PASS, limited | Space starts; input mode changes; timing dialog opens. See M3. |
| `rhythm-options` | PASS | Five styles, three time signatures, and 2–4 bars selectable |
| `free-no-account` | PASS | No checkout/account fields or disabled styles |
| `scope-boundaries` | PASS | Timing marks present; no pitch, MIDI, or song input |
| `art-provenance` | PASS | Prompt sidecar, design record, production asset, and disclosure present |

Each ID occurs exactly once as an `@claim:<id>` tag. No landing/README claim-like sentence lacks a corresponding registry entry. All commands exited zero; M3 concerns assertion depth, not a failed command.

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Title pattern and per-route titles | PASS — home, demo, privacy, terms, and not-found titles are plain and under 60 characters |
| One h1, `main`, shared header/footer | PASS on all routes |
| Description, canonical, OG/Twitter, favicon, Apple icon, theme color | PASS; the referenced 1200×630 social image returns JPEG |
| `robots.txt`, `sitemap.xml`, SPA fallback, security headers | PASS with correct content types; CSP, referrer policy, and nosniff present |
| Designed 404 | PASS — “This page missed the beat” with a return action |
| Deep links, client navigation, back/forward, route focus/announcement | PASS; route changes and history focus `#page-title` |
| Link crawl | PASS — every rendered HTTP link returned 200; `mailto:` links are explicit |
| Console/load checks | PASS — live verifier found no errors, one h1, `lang`, `main`, labels, and alt text |
| Accessibility smoke test | PASS — axe found zero serious/critical violations on `/`, `/demo`, `/privacy`, `/terms`, and an unknown route |
| Distinct identity | PASS — asymmetrical cassette/practice-zine composition, paper/ink palette, hard shadows, tape-deck controls, and original collage are not a generic SaaS template |

## Build evidence

From the clean clone:

- `npm test`: 13/13 passed.
- `npm run build`: passed and created `dist/`; JavaScript is 28.89 kB raw / 11.11 kB gzip.
- `npm run test:browser`: 28/28 passed.
- Every `.factory/claims.json` command: 9/9 passed separately.

Acceptance condition is met: zero BLOCKING findings and three minor findings.
