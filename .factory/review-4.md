# Rhythm Reader — adversarial first-read review 4

**Date:** 28 August 2026  
**Target:** <https://rhythm-reader.sociobot.in>  
**Reviewed commit:** ed05925bf3b43d3e30b18f1573f6d8af6eb7c00d  
**Verdict:** **PASS**

There are zero findings. This review repeated the cold-read, demo, claims, history, routing, accessibility, link, and source checks. No claim command failed and no landing or README claim was left outside the registry.

## Cold first read

New empty Chromium contexts at 390 × 844 and 1440 × 900 loaded the live root without console or page errors. Before scrolling, a first-time visitor can answer all three questions.

| Question | Answer | Exact evidence |
| --- | --- | --- |
| What does this do? | Practice reading a rhythm and evaluate tap timing. | “Practice reading rhythms by tapping them”; “See a scored two-bar rhythm right away.” |
| For whom? | Adult pianists, guitarists, and drummers preparing for rehearsal. | “For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal.” |
| What should I click first? | Open the safe example. | “Try it with sample data” |

The mobile first screen contains the job-led six-word h1, audience, action/outcome, and three facts; scrollWidth is 390. The ink/paper cassette-zine surface, notation, tape-deck controls, hard shadows, and original collage are distinct and match the design record; this is not a generic SaaS template.

## Copy audit

Counts treat hyphenated and slash-separated terms as one word. Every sentence-like landing/product state and every README sentence or bullet is below. Dynamic n entries are the shipped templates. No entry is over 22 words. No banned marketing adjective, inconsistent core term, unclear heading, or non-result-naming control was found.

### Landing and product states

| Words | Exact sentence or template | Check |
| ---: | --- | --- |
| 6 | Practice reading rhythms by tapping them | Clear job-led h1 |
| 13 | For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal. | Clear audience |
| 7 | See a scored two-bar rhythm right away. | timing-feedback |
| 6 | Works offline after your first visit. | offline-reload |
| 6 | Practice history stays in this browser. | privacy-local-only |
| 3 | Free to use. | free-no-account |
| 2 | No account. | free-no-account |
| 4 | Space starts or taps. | input-calibration |
| 5 | N shows a new rhythm. | keyboard-shortcuts |
| 8 | Choose folk, march, pop, swing, or clave rhythms. | rhythm-options |
| 6 | Check the timing of each tap. | Clear heading |
| 8 | Scan both bars and count one bar silently. | Clear for named musicians |
| 11 | Use Space, the large button, or microphone claps after the count. | input-calibration |
| 10 | See early, on-time, late, and missed marks with a score. | timing-feedback |
| 5 | Timing practice, not music grading. | Clear scope heading |
| 11 | Rhythm Reader does not grade pitch, read MIDI, or copy songs. | scope-boundaries |
| 10 | It only compares your tap times with the shown rhythm. | scope-boundaries |
| 7 | Practice rhythm patterns and check each tap. | timing-feedback |
| 8 | Collage created for Rhythm Reader with AI assistance. | art-provenance |
| 3 | You are offline. | offline-reload status |
| 5 | Rhythm practice is still available. | offline-reload status |
| 5 | Damaged practice data was reset. | Clear recovery status |
| 6 | You can start a new rhythm. | Clear recovery next step |
| 5 | A new version is ready. | Clear update status |
| 4 | Use headphones if possible. | Clear advice |
| 12 | Tap the large button or Space when each click reaches your ears. | Clear calibration instruction |
| 9 | The saved adjustment is applied to later timing scores. | input-calibration |
| 5 | Saved timing adjustment: n ms. | Clear saved-state status |
| 7 | This browser does not provide microphone input. | Clear error reason |
| 6 | Screen and keyboard taps are ready. | Clear recovery next step |
| 3 | Microphone access failed. | Clear error status |
| 4 | Your taps were steady. | Clear result |
| 4 | Check the marked taps. | Clear result next step |
| 9 | Try the rhythm once more at a slower speed. | Clear result next step |
| 6 | Lower the speed and count aloud. | Clear result next step |
| 4 | Not enough taps matched. | Clear error status |
| 6 | Try again in a quiet place. | Clear recovery next step |
| 14 | The marks show one early tap, on-time taps, late taps, and a missed tap. | timing-feedback |
| 6 | Demo — sample data, nothing is saved. | demo-isolation |
| 7 | Changes stay separate from your practice history. | demo-isolation |
| 5 | The sample demo was reset. | demo-isolation reset outcome |
| 7 | 2 bars in 4/4 with 12 taps. | Generated summary form |
| 5 | Count 1 · 2 · 3 · 4. | Generated summary form |
| 6 | Tap n: early by n milliseconds. | Generated result form |
| 7 | Tap n: on time by n milliseconds. | Generated result form |
| 6 | Tap n: late by n milliseconds. | Generated result form |
| 3 | Tap n: missed. | Generated result form |

Headings make sense alone: “Practice reading rhythms by tapping them,” “Choose your rhythm,” “Practice history,” “How rhythm practice works,” “Check the timing of each tap,” “Read the rhythm,” “Tap or clap,” “Check each tap,” and “What it does not do.” Decorative tape labels are hidden from assistive technology. Controls name their result: Try it with sample data, Show a new rhythm, Show a new level-5 rhythm, Use microphone claps, Use keyboard or screen taps, Adjust tap timing, Try this rhythm again, Reset demo, Start for real, and Reload the update.

### README

| Words | Exact sentence or bullet | Check |
| ---: | --- | --- |
| 12 | Rhythm Reader helps adult pianists, guitarists, and drummers practice short rhythm patterns. | Clear |
| 10 | It marks each tap early, on time, late, or missed. | timing-feedback |
| 10 | A completed sample with early, on-time, late, and missed marks | timing-feedback |
| 10 | Demo settings and history kept separate from real practice data | demo-isolation |
| 6 | Offline use after the first visit | offline-reload |
| 6 | Practice history stored in this browser | privacy-local-only |
| 13 | Five rhythm styles, three time signatures, and patterns from two to four bars | rhythm-options |
| 12 | Screen taps, Space-key taps, and microphone claps with a saved timing adjustment | input-calibration |
| 9 | The full trainer without a payment or account gate | free-no-account |
| 10 | Practice data and microphone audio are not sent anywhere else. | privacy-local-only |
| 10 | Microphone audio is checked in memory and is not recorded. | privacy-local-only |
| 12 | Rhythm Reader does not grade pitch, read MIDI, or provide song transcriptions. | scope-boundaries |
| 5 | Use Node.js 20 or newer. | Developer instruction |
| 9 | npm run build creates the static site in dist/. | Developer instruction |
| 6 | It also creates the offline worker. | Developer instruction |
| 13 | Each visitor-facing promise and its test command is listed in .factory/claims.json. | Confirmed below |
| 8 | Deploy dist/ as an Azure Static Web App. | Developer instruction |
| 7 | The factory owns DNS and deployment configuration. | Clear ownership |
| 6 | See .factory/brief.json for scope. | Clear |
| 12 | See .factory/design.md for the visual system and how the artwork was made. | Clear |
| 6 | This project uses the MIT License. | Clear |
| 2 | See LICENSE. | Clear |

Core terms remain rhythm/rhythm pattern, practice, practice history, tap, timing adjustment, and rhythm style. MIDI, BPM, and time signature fit the named musician audience; build terms occur only in developer instructions.

## Demo and sandbox verification

From the mobile cold page, one click opened /demo with title “Demo — Rhythm Reader,” h1 “See a scored two-bar rhythm,” the persistent banner, Reset demo, Start for real, a completed 64% result, every timing marker, and three realistic practice-history days. I seeded real rr_settings:v1 and rr_history:v1, changed the demo to 6/8, and reset it. Reset restored 4/4 and real values stayed byte-for-byte unchanged. Start for real cleared all demo: local/session keys without changing real data.

The clean isolation test also checks header/footer/hash/direct-navigation and back-button exits. Each removes sample keys and a return opens a fresh sample. The privacy test intercepts the full demo/microphone/reset flow and observed no cross-origin request. The offline test loads /demo, waits for service-worker control, turns the browser offline, reloads, and retains the score and banner.

## Claims verification

I made a clean external clone at /tmp/rhythm-reader-review4.QuiB8H, confirmed ed05925bf3b43d3e30b18f1573f6d8af6eb7c00d, installed with npm ci, and ran every exact command in .factory/claims.json separately. All ten passed. A subsequent npm run test:claims also passed all ten. Each id has exactly one @claim:id test.

| Claim id | Result | Observable evidence |
| --- | --- | --- |
| timing-feedback | PASS | Score plus early/on-time/late/missed marks |
| demo-isolation | PASS | Demo-only storage, exit cleanup, byte-identical real keys |
| offline-reload | PASS | Controlled offline demo reload |
| privacy-local-only | PASS | No cross-origin request or audio persistence |
| input-calibration | PASS | Screen, Space, synthetic microphone, six-click persistence, corrected score |
| keyboard-shortcuts | PASS | N changes the idle rhythm identifier |
| rhythm-options | PASS | Five styles, three signatures, 2–4 bars |
| free-no-account | PASS | No checkout/account field or disabled style |
| scope-boundaries | PASS | Timing feedback only; no pitch, MIDI, song input |
| art-provenance | PASS | Prompt, design record, production art, footer disclosure |

All live landing/README claims map to the registry; none is unlisted.

## Earlier finding recheck

I read every earlier review, polish record, verification record, and handoff. All earlier findings are fixed in live behavior and current code.

| Earlier finding | Status now |
| --- | --- |
| Review 1 B1 — no isolated sample demo | Fixed: /demo/?demo=1 result, banner, reset, isolated storage |
| Review 1 B2 — claims registry/tests absent | Fixed: ten registered, unique, passing observable tests |
| Review 1 B3 — dead paid CTA | Fixed: paid offer removed; rendered HTTP links return 200 |
| Review 1 B4 — routes/metadata incomplete | Fixed: route states, metadata, assets, shell, focus, fallback verified |
| Review 1 B5 — slogan/unnamed audience/action | Fixed: job h1, audience, sample CTA/outcome, facts |
| Review 1 M1 — jargon/inconsistent copy | Fixed: current audit uses consistent plain vocabulary |
| Review 1 M2 — unnamed controls | Fixed: current controls name their outcome |
| Review 2 M1 — reversed input control/README jargon | Fixed: input action states its target mode; README is plain |
| Review 2 M2 — Start for real retained demo data | Fixed: demo keys clear while real keys remain |
| Review 2 M3 — shallow calibration proof | Fixed: claim test checks input/calibration outcomes |
| F-3-1 — ordinary demo exits retained state | Fixed: cleanup and exit-path coverage |
| F-3-2 — N shortcut unregistered | Fixed: registered observable test |
| F-3-3 — impossible level-five action | Fixed: truthful level-five action |
| F-3-4 — SVG used “on”/missing punctuation | Fixed: “on time” and complete sentences |

## Structure, accessibility, and links

| Check | Result |
| --- | --- |
| Titles, h1, metadata | PASS — valid route pattern, one h1, description, canonical, OG/Twitter, favicon, Apple icon, manifest, theme color |
| Routes and 404 | PASS — intended deep-link states; back/forward focuses and announces h1; unknown URL has designed return state |
| Shell and links | PASS — shared header/footer, skip link, Privacy/Terms; rendered HTTP links/crawler assets return 200; mail links explicit |
| Accessibility and console | PASS — zero serious/critical Axe findings over five routes; zero console/page errors |
| Privacy/security | PASS — no runtime AI/provider key or analytics; CSP, HSTS, nosniff, referrer, permissions headers present |
| Build/performance | PASS — dist generated; JS 11.49 kB gzip, CSS 5.14 kB gzip |

The clean clone passed npm test (13 tests), npm run build, npm run test:claims (10 tests), and npm run test:browser (31 tests; Playwright last-run record is passed).

## Missed leverage

No AI, import/export, or sync feature is implied by the stated job. The useful loop is immediate, deterministic rhythm generation and local tap comparison; AI would not improve the required action, while sync conflicts with the stated local-first privacy model. The AI reference is only a clear build-time artwork disclosure; source inspection found no provider endpoint or embedded key.

## What would make this perfect

No product change is required. Preserve the visible demo and exit isolation, register a test before adding any visitor-facing promise, and rerun the clean-clone claim and browser suites after each copy or routing change.
