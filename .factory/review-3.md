# Rhythm Reader — adversarial first-read review 3

**Date:** 28 August 2026  
**Target:** <https://rhythm-reader.sociobot.in>  
**Reviewed commit:** `b6dd98a099e307c0ae0298d8bb404571dba4fdba`  
**Verdict:** **FAIL**

One BLOCKING finding and three minor findings remain. The cold first screen is clear, the sample is immediately useful, all nine registered claim commands pass, real practice data stays isolated, and the route/accessibility checks pass. The demo still saves changed sample state when a visitor leaves through ordinary site navigation, one keyboard claim is absent from the claims registry, a result button promises an impossible level increase at level 5, and the score’s screen-reader description exposes the internal word “on” instead of “on time.”

## Cold first read before scrolling

I opened the live root in fresh Chromium contexts at 390 × 844 and 1440 × 900. Both had empty storage and remained at scroll position 0. I recorded only the first viewport.

| Question | First-time answer | Exact first-screen copy |
| --- | --- | --- |
| What does this do? | It lets me practise reading rhythms by tapping them and checks my timing. | “Practice reading rhythms by tapping them” |
| For whom? | Adult pianists, guitarists, and drummers preparing for rehearsal. | “For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal.” |
| What should I click first? | Open the ready-made scored example. | “Try it with sample data” and “See a scored two-bar rhythm right away.” |

The job, audience, first action, expected result, and three short facts were visible without scrolling at both sizes. At 390 px, `scrollWidth` equalled `innerWidth` at 390 px. The cold loads produced no console or page errors. There is no first-screen blocker.

## Findings

### F-3-1 — BLOCKING — Ordinary navigation preserves demo changes after leaving

**Quote/location:** The persistent `/demo` banner says **“Demo — sample data, nothing is saved”** and **“Changes stay separate from your practice history.”** The shared header also offers **Privacy**, **How it works**, and the Rhythm Reader home link.

**Observed live behavior:** In a fresh context, I opened `/demo`, changed the time signature from 4/4 to 6/8, then used the header **Privacy** link. On `/privacy`, both `demo:rr_settings:v1` and `demo:rr_history:v1` remained in localStorage. Clicking **Demo** again restored the changed 6/8 state instead of the original sample. The same code path is used by the wordmark, How it works, footer navigation, and browser back. **Start for real** does clear both demo keys, and real `rr_*` keys remain untouched.

**Why this misleads a first-time visitor:** The banner says nothing is saved, but an ordinary, prominent way of leaving the demo saves the visitor’s changes and restores them later. This violates the demo contract that leaving demo mode discards demo data. The existing `@claim:demo-isolation` test exercises Reset and Start for real only, so it stays green while the shared-navigation exit fails.

**Concrete fix:** Route every transition from demo mode to a non-demo route through one exit function that clears the `demo:` namespace before navigation, including wordmark, header/footer links, hash navigation, and `popstate`. Clear tab/session demo state when the demo is abandoned outside the SPA as well. Extend `@claim:demo-isolation` to change the sample, leave through each shared navigation path and browser back, return to `/demo`, assert the original sample is reseeded, and prove all real `rr_*` values remain byte-for-byte unchanged.

### F-3-2 — Minor — “N shows a new rhythm” is an unlisted claim

**Quote/location:** Landing trainer keyboard help: **“N shows a new rhythm.”**

**Evidence:** `.factory/claims.json` has nine entries, but none lists the `N` shortcut. No `@claim:` test presses `N` and observes a changed rhythm. The non-claim browser suites also contain no `N` key assertion.

**Why this matters:** This is a behavior a keyboard user can rely on, but the required claim registry cannot detect its regression.

**Concrete fix:** Add a `keyboard-shortcuts` claim and one tagged clean-demo test that records the rhythm id, presses `N` while idle, and asserts that a different rhythm appears. Alternatively, remove the sentence. Keep the existing Space behavior under `input-calibration`.

### F-3-3 — Minor — “Raise the difficulty” cannot do so at level 5

**Quote/location:** Result panel button: **“Raise the difficulty.”**

**Observed live behavior:** I seeded a valid level-5 demo result. The page showed “Pop backbeat · level 5” and the active **Raise the difficulty** button. Clicking it removed the result and generated another level-5 rhythm; the slider and stored setting both remained 5.

**Why this confuses a first-time visitor:** The control names a result that is impossible at the maximum level. The visitor loses the result sheet without receiving the promised change.

**Concrete fix:** At level 5, remove or disable this action and show **Highest difficulty reached**, or replace it with **Show a new level-5 rhythm**. Add a level-5 result regression that checks the label, enabled state, and post-click outcome.

### F-3-4 — Minor — The accessible score uses “on” instead of “on time”

**Quote/location:** The demo notation’s SVG description says **“Tap 2: on by 8 milliseconds.”** The same wording appears for taps 4, 6, and 8; the final sentence is **“Tap 10: missed”** without final punctuation. Visible feedback calls this state **“ON on time.”**

**Why this confuses a first-time visitor:** A screen-reader user hears an internal enum value rather than the plain, consistently used result “on time.” “On by 8 milliseconds” does not explain a timing result on its own.

**Concrete fix:** Map the internal `on` value to **on time** in the SVG description and terminate every generated sentence. Add an accessibility assertion that the sample description contains “on time,” never matches `: on by`, and ends with punctuation.

## Copy audit

Counts treat hyphenated and slash-separated terms as one word. Sentence-like banner text and README bullets are included even when the source omits final punctuation. No sentence exceeds 22 words. No banned marketing adjective appears.

### Landing and conditional product copy

| Words | Exact sentence | Check |
| ---: | --- | --- |
| 13 | For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal. | Clear |
| 7 | See a scored two-bar rhythm right away. | Clear; `timing-feedback` |
| 6 | Works offline after your first visit. | Clear; `offline-reload` |
| 6 | Practice history stays in this browser. | Clear; `privacy-local-only` |
| 3 | Free to use. | Clear; `free-no-account` |
| 2 | No account. | Clear; `free-no-account` |
| 2 | Rhythm notation. | Clear accessible label |
| 6 | Scroll sideways on a small screen. | Clear accessible instruction |
| 4 | Space starts or taps. | Clear; `input-calibration` |
| 5 | N shows a new rhythm. | **Unlisted claim; F-3-2** |
| 8 | Choose folk, march, pop, swing, or clave rhythms. | Clear; `rhythm-options` |
| 6 | Check the timing of each tap. | Clear |
| 8 | Scan both bars and count one bar silently. | Clear for the named musician audience |
| 11 | Use Space, the large button, or microphone claps after the count. | Clear; `input-calibration` |
| 10 | See early, on-time, late, and missed marks with a score. | Clear; `timing-feedback` |
| 5 | Timing practice, not music grading. | Clear |
| 11 | Rhythm Reader does not grade pitch, read MIDI, or copy songs. | Clear; `scope-boundaries` |
| 10 | It only compares your tap times with the shown rhythm. | Clear; `scope-boundaries` |
| 7 | Practice rhythm patterns and check each tap. | Clear |
| 8 | Collage created for Rhythm Reader with AI assistance. | Clear; `art-provenance` |
| 4 | Built by Param Factory. | Clear attribution |
| 6 | Demo — sample data, nothing is saved. | Plain, but contradicted by F-3-1 on shared-navigation exit |
| 7 | Changes stay separate from your practice history. | Clear; `demo-isolation` |
| 14 | The marks show one early tap, on-time taps, late taps, and a missed tap. | Clear; `timing-feedback` |
| 3 | You are offline. | Clear status |
| 5 | Rhythm practice is still available. | Clear; `offline-reload` |
| 5 | Damaged practice data was reset. | Clear error outcome |
| 6 | You can start a new rhythm. | Clear recovery action |
| 5 | A new version is ready. | Clear status |
| 4 | Your taps were steady. | Clear result |
| 4 | Check the marked taps. | Clear result/action |
| 9 | Try the rhythm once more at a slower speed. | Clear result/action |
| 6 | Lower the speed and count aloud. | Clear result/action |
| 4 | Use headphones if possible. | Clear |
| 12 | Tap the large button or Space when each click reaches your ears. | Clear |
| 9 | The saved adjustment is applied to later timing scores. | Clear; `input-calibration` |
| 7 | This browser does not provide microphone input. | Clear error reason |
| 6 | Screen and keyboard taps are ready. | Clear recovery action |
| 3 | Microphone access failed. | Clear error outcome |
| 4 | Not enough taps matched. | Clear error outcome |
| 6 | Try again in a quiet place. | Clear recovery action |
| 5 | The sample demo was reset. | Clear status |

The notation also generates these accessible sentences. The unscored tap total varies by generated rhythm; the observed cold render is listed. The demo sample is deterministic, so all ten result sentences are listed.

| Words | Exact generated sentence | Check |
| ---: | --- | --- |
| 7 | 2 bars in 4/4 with 12 taps. | Clear generated summary |
| 5 | Count 1 · 2 · 3 · 4. | Clear generated instruction |
| 6 | Tap 1: early by 118 milliseconds. | Clear |
| 6 | Tap 2: on by 8 milliseconds. | **Inconsistent internal term; F-3-4** |
| 6 | Tap 3: late by 124 milliseconds. | Clear |
| 6 | Tap 4: on by 24 milliseconds. | **Inconsistent internal term; F-3-4** |
| 6 | Tap 5: early by 118 milliseconds. | Clear |
| 6 | Tap 6: on by 8 milliseconds. | **Inconsistent internal term; F-3-4** |
| 6 | Tap 7: late by 124 milliseconds. | Clear |
| 6 | Tap 8: on by 24 milliseconds. | **Inconsistent internal term; F-3-4** |
| 6 | Tap 9: early by 118 milliseconds. | Clear |
| 3 | Tap 10: missed | Missing final punctuation; F-3-4 |

### README copy

| Words | Exact sentence or bullet | Check |
| ---: | --- | --- |
| 12 | Rhythm Reader helps adult pianists, guitarists, and drummers practice short rhythm patterns. | Clear |
| 10 | It marks each tap early, on time, late, or missed. | Clear; `timing-feedback` |
| 10 | A completed sample with early, on-time, late, and missed marks | Clear; `timing-feedback` |
| 10 | Demo settings and history kept separate from real practice data | Clear; `demo-isolation` |
| 6 | Offline use after the first visit | Clear; `offline-reload` |
| 6 | Practice history stored in this browser | Clear; `privacy-local-only` |
| 13 | Five rhythm styles, three time signatures, and patterns from two to four bars | Clear; `rhythm-options` |
| 12 | Screen taps, Space-key taps, and microphone claps with a saved timing adjustment | Clear; `input-calibration` |
| 9 | The full trainer without a payment or account gate | Clear; `free-no-account` |
| 10 | Practice data and microphone audio are not sent anywhere else. | Clear; `privacy-local-only` |
| 10 | Microphone audio is checked in memory and is not recorded. | Clear; `privacy-local-only` |
| 12 | Rhythm Reader does not grade pitch, read MIDI, or provide song transcriptions. | Clear; `scope-boundaries` |
| 5 | Use Node.js 20 or newer. | Appropriate developer instruction |
| 9 | `npm run build` creates the static site in `dist/`. | Appropriate developer instruction |
| 6 | It also creates the offline worker. | Appropriate developer instruction |
| 11 | Each visitor-facing promise and its test command is listed in `.factory/claims.json`. | Clear, except F-3-2 disproves completeness |
| 8 | Deploy `dist/` as an Azure Static Web App. | Appropriate deployment instruction |
| 7 | The factory owns DNS and deployment configuration. | Clear ownership statement |
| 4 | See `.factory/brief.json` for scope. | Clear |
| 12 | See `.factory/design.md` for the visual system and how the artwork was made. | Clear |
| 6 | This project uses the MIT License. | Clear |
| 2 | See `LICENSE`. | Clear |

### Headings, controls, and terminology

The six-word h1, **Practice reading rhythms by tapping them**, is job-led and within the nine-word limit. Landing headings identify their subjects without surrounding context. Decorative labels such as “SIDE A” and “READ · TAP · CHECK” are not headings; the tape label is hidden from assistive technology.

Controls normally name their result: **Try it with sample data**, **Show a new rhythm**, **Start rhythm practice**, **Use microphone claps**, **Use keyboard or screen taps**, **Adjust tap timing**, **Try this rhythm again**, **Reset demo**, **Start for real**, and **Reload the update**. The level-5 form of **Raise the difficulty** is the only result-label failure and is F-3-3. The generated accessible terminology failure is F-3-4.

| Concept | Consistent term |
| --- | --- |
| Shown material | rhythm / rhythm pattern |
| One scored attempt | practice |
| Saved record | practice history |
| Timing event | tap |
| Device correction | timing adjustment |
| Category | rhythm style |

`MIDI`, `BPM`, and `time signature` are appropriate for the explicitly named musician audience. Node.js, `dist/`, and Azure Static Web App appear only in developer instructions.

## Demo and sandbox verification

From the mobile cold page, one click on **Try it with sample data** opened `/demo` with title `Demo — Rhythm Reader`, h1 “See a scored two-bar rhythm,” the persistent demo banner, a 64% completed result, all four timing-marker kinds, and three recent sample-history days.

I seeded real 3/4 settings and a nine-practice real history record before entry. The demo opened with its own 4/4 pop sample. Changing the demo to 6/8 and using **Reset demo** restored the original 4/4 sample; the real values stayed byte-for-byte unchanged. **Start for real** removed all `demo:` keys and retained both real keys. Request interception through demo entry, microphone-mode start, and Reset observed no cross-origin request. A newly controlled live demo reloaded offline with its h1, result, and banner.

F-3-1 is the remaining sandbox failure: header/footer/hash/back exits do not discard the demo namespace.

## Claims verification

I made a clean local clone at `/tmp/rhythm-reader-review3.KK54Zg`, confirmed HEAD `b6dd98a099e307c0ae0298d8bb404571dba4fdba`, ran `npm ci`, and ran every command from `.factory/claims.json` separately.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| `timing-feedback` | PASS | Demo result, score, and early/on-time/late/missed marks |
| `demo-isolation` | PASS for listed test; incomplete exit coverage | Demo-only writes; Reset and Start for real preserve seeded real values. F-3-1 is outside the test. |
| `offline-reload` | PASS | Controlled `/demo` reloaded offline with result and banner |
| `privacy-local-only` | PASS | No cross-origin requests, account fields, or audio persistence; only demo keys |
| `input-calibration` | PASS | Space and screen taps, oscillator-backed microphone input, six-tap adjustment, reload persistence, and corrected score gap |
| `rhythm-options` | PASS | Five styles, three time signatures, and 2–4 bars selectable |
| `free-no-account` | PASS | No checkout/account fields and no disabled style |
| `scope-boundaries` | PASS | Timing marks present; no pitch, MIDI, file, or song input |
| `art-provenance` | PASS | Source prompt sidecar, design record, production asset, and footer disclosure |

All nine commands exited zero, and every registered id appears exactly once as an `@claim:<id>` test tag. F-3-2 is the one unlisted live claim. The clean clone also passed `npm test` (13/13), `npm run build`, and the 19 non-claim Playwright tests. The build produced 28.94 kB raw / 11.13 kB gzip JavaScript and 18.46 kB raw / 5.14 kB gzip CSS.

## Earlier finding recheck

I read `.factory/review-1.md`, `.factory/review-2.md`, `.factory/polish-2.md`, all three verification records, and the prior handoff. Each earlier finding was checked on the live site and in current code.

| Earlier id | Current status | Independent confirmation |
| --- | --- | --- |
| Review 1 B1 — no isolated sample demo | Fixed for the specified entry/reset/real-data paths | `/demo` and `?demo=1` seed only `demo:` keys, show the sample/banner, Reset works, and Start for real clears. F-3-1 identifies a different shared-navigation exit gap. |
| Review 1 B2 — no claims registry/tests | Fixed for the original claim inventory | Nine entries and nine unique tagged tests run. F-3-2 identifies a later keyboard sentence omitted from the registry. |
| Review 1 B3 — dead purchase link | Fixed | The paid offer and checkout link are absent; every rendered HTTP link returned 200. |
| Review 1 B4 — routes/metadata/assets incomplete | Fixed | Five route states, route metadata, shared shell, crawler assets, icons, sitemap, fallback config, focus, and back/forward checks pass. |
| Review 1 B5 — slogan and unnamed audience/action | Fixed | Job-led h1, named adult musicians, sample action, result caption, and three facts are all in the first viewport. |
| Review 1 M1 — jargon/inconsistent copy | Fixed | Current terminology is consistent; no long or banned landing/README sentence remains. |
| Review 1 M2 — controls do not name results | Fixed for the quoted controls | Input and sample controls name their outcomes. F-3-3 is a separate maximum-level boundary state. |
| Review 2 M1 — reversed input control and README jargon | Fixed | Tap mode offers **Use microphone claps**; microphone mode offers **Use keyboard or screen taps**; the three README phrases were rewritten. |
| Review 2 M2 — Start for real retains demo keys | Fixed for **Start for real** | Live use leaves no `demo:` key and preserves real values. F-3-1 covers leaving by other navigation. |
| Review 2 M3 — shallow input/calibration claim | Fixed | The test now exercises Space, screen, synthetic microphone signal, six timed taps, reload, and correction application. |

## Structure, links, accessibility, and visual identity

| Check | Result |
| --- | --- |
| Title pattern | PASS — root is “Rhythm Reader — tap rhythm reading practice”; demo/privacy/terms/not-found have route titles, all under 60 characters |
| Semantic page structure | PASS — `lang=en`, one h1, one main, ordered headings, header/nav/footer on all five routes |
| Metadata | PASS — descriptions, route canonicals, OG/Twitter card, 1200 × 630 image, SVG favicon, 180 px Apple icon, manifest, and theme color |
| Designed 404 | PASS — an unknown deep link shows “This page missed the beat” and a return action in the cassette-zine style |
| Routing | PASS — deep links load, client transitions and back/forward restore route state and focus the new h1, and `/#how` reaches the section |
| Link crawl | PASS — all rendered HTTP links across root/demo/privacy/terms/not-found returned 200; the two explicit `mailto:` links were excluded |
| Crawler/deploy files | PASS — robots, sitemap, icons, manifest, service worker, and fallback exclusions have correct live content types |
| Accessibility | PASS — live AxeBuilder scans found zero violations on all five routes at 390 px; keyboard skip/focus/dialog, 200% text, 44 px targets, reduced motion, labels, and alt text are covered by passing tests |
| Console/load | PASS — `/opt/fleet/lib/verify-url.sh` reported title, lang, one h1, main, no missing alt, no unlabeled buttons, and zero console/page errors |
| Security/privacy surface | PASS — live CSP, HSTS, nosniff, referrer policy, and restrictive permissions policy are present; no analytics, CDN scripts, or fonts load |
| Visual identity | PASS — the asymmetrical paper/ink cassette-zine layout, hard offset shadows, notation sheet, deck controls, and original collage are product-specific rather than a generic SaaS template |

The clean build’s root HTML, hashed JS, and hashed CSS are byte-identical to live. Initial JavaScript is 11.13 kB gzip, below both static-product budgets.

## End-to-end product check

On the live 390 px trainer I selected 3/4 and 160 BPM, completed the count-in with screen taps, received a 36% result with per-tap markers, and confirmed one completed practice in `rr_history:v1`. No runtime error occurred. Keyboard focus, Space input, microphone-stream input, timing adjustment, malformed-storage recovery, and PWA update/offline paths also pass the clean browser suites.

## Missed leverage

No additional AI, import, export, or sync feature is an obvious requirement for the stated job. Rhythm generation and timing comparison are deterministic, immediate, and available offline; adding model calls would weaken that loop. Sync would conflict with the stated local-first privacy model, and the product explicitly sets expectations that it does not accept MIDI or song transcriptions. The disclosed AI-assisted collage is visual provenance, not a decorative runtime AI feature, and no provider key or model endpoint ships in the app.

## What would make this perfect

1. Discard demo state on every way out of demo mode and add exit-path isolation coverage.
2. Register and test the `N` shortcut, or remove its sentence.
3. Give the level-5 result a truthful final-state action and test that boundary.
4. Say “on time” in the generated score description and punctuate every result sentence.

After those four changes, rerun every claim command, the live shared-navigation demo sequence, the five-route Axe/link scan, and the full copy audit. The standard for PASS is zero remaining findings.
