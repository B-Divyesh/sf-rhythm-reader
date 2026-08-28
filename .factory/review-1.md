# Rhythm Reader — adversarial first-read review 1

**Date:** 28 August 2026  
**Target:** <https://rhythm-reader.sociobot.in>  
**Verdict:** **FAIL**

There are five BLOCKING findings. The product has a distinctive cassette-zine visual identity and the basic local test suites pass, but a cold visitor cannot enter a safe sample demo, the first screen does not say who the product is for, claims have no registry or proof, the paid CTA is dead, and required routes/metadata are absent.

## Method and first read

I used new Chromium contexts at 390 × 844 and 1440 × 900, with no prior storage, and waited for network idle before reading the first viewport. I then used a separate clean context for `?demo=1`, route checks, link crawling, and storage checks. No product code was changed.

### What a cold visitor can say before scrolling

| Question | Result |
| --- | --- |
| What does this do? | It appears to show a short rhythm and score taps as early, late, or missed. This is inferred from: “Read a short, real-feeling pattern. Tap it back. See exactly where every note landed—early, late, or missed.” |
| For whom? | **Cannot answer.** Neither first viewport names a player, instrument, level, or situation. The headline, “DON’T GUESS THE GROOVE.”, is a slogan rather than an audience/job statement. |
| What should I click first? | “Start a take” is visible, but it does not say that it opens a safe sample or what the resulting screen will show. There is no “Try it with sample data” action. |

This is a **BLOCKING** first-screen failure: the required audience is missing and the primary action is not a named, no-risk first step. The small mobile viewport also hides the “How it reads” and “Practice log” navigation, so it does not repair this ambiguity.

## Findings, highest severity first

### B1 — No one-click, isolated sample demo

**Quote/evidence:** The hero CTA is “Start a take”; there is no “Try it with sample data” control. Visiting `/?demo=1` produces the normal title and h1, “Rhythm Reader — honest rhythm sight-reading practice” and “Don’t guess the groove.” It has no “Demo — sample data, nothing is saved” banner, **Reset demo**, or **Start for real** control.

**Why this loses or misleads a first-time visitor:** A visitor has to decide whether a take will affect their real practice history before they have seen a completed example. The advertised demo URL is not a demo; it is an ordinary, empty trainer.

**Sandbox confirmation:** In one fresh context I seeded real `rr_settings:v1` with meter `3/4` and style `march`, opened `/?demo=1`, and saw those same values. Changing the demo page’s meter to `6/8` overwrote that same `rr_settings:v1` key. Therefore demo mode reads and writes real storage. There is no `.factory/demo.md`.

**Concrete fix:** Add `/demo` (and `?demo=1` if retained) that immediately renders a completed, realistic two-bar example with visible timing marks/history. Use only `demo:`-prefixed storage, never read `rr_*` keys while the banner is shown, and provide persistent **Demo — sample data, nothing is saved**, **Reset demo**, and **Start for real** controls. Add a demo storage-isolation regression and document it in `.factory/demo.md`.

### B2 — Claims are neither registered nor testable

**Quote/evidence:** `.factory/claims.json` is absent in the supplied clean clone. Consequently there are zero listed claim commands to run and no `@claim:<id>` tests. `npm test` has 12 passing unit tests and `npm run test:browser` has four passing browser tests, but neither supplies the required claim registry or one observable test per visitor promise.

**Why this loses or misleads a first-time visitor:** The landing page and README ask visitors to rely on privacy, offline, recording, pricing, originality, and timing-feedback promises without proof that a reviewer can rerun.

**Unlisted-claim inventory (each has no claims entry):**

| Location | Exact claim-like copy |
| --- | --- |
| Landing hero | “See exactly where every note landed—early, late, or missed.” |
| Landing hero | “Your practice log stays on this device.” |
| Landing status | “Offline — practice still works.” |
| Landing settings | “Patterns use original style grammars—not copied songs or random note soup.” |
| Landing how-it-works | “Every onset gets an early, on-time, late, or missed mark—plus a score.” |
| Landing paid area | “Unlock pop backbeat, swing, and 3–2 clave grammars plus future polyrhythm packs for $9 once.” |
| Landing paid area | “Core folk and march practice stays free.” |
| Landing paid area | “Sociobot/Dodo is the merchant of record.” / “No subscription.” |
| Landing footer | “Runs locally.” / “No analytics, ads, accounts, or uploaded recordings.” |
| Landing footer | “Original AI-assisted collage; no copyrighted music is used.” |
| Landing calibration | “We’ll subtract the measured device delay from future takes.” |
| Landing license dialog | “The token stays in this browser.” |
| README opening | “It generates short exercises … then marks each performed onset as early, on time, late, or missed.” |
| README features | All six feature bullets, including custom notation, input modes, calibration, local history, offline practice, and the paid-style unlock. |
| README privacy | “Microphone audio is processed in memory and is never recorded or uploaded.” |
| README build/test text | The offline reload, service-worker update, 390 px targets, and aXe verification statements. |

**Concrete fix:** Create `.factory/claims.json` and add one clean-state `@claim:` test per retained statement. In particular, test demo-only offline reload after first load; intercept all demo-flow requests and allow only same-origin requests for each privacy promise; assert that a demo take produces feedback; assert the $9/free-style state; and remove any claim that cannot be observed in that test.

### B3 — The purchase CTA is a dead link

**Quote/evidence:** “Buy the style pack” on the live landing page resolves to `https://api.sociobot.in/api/v1/products/rhythm-reader/checkout`, which returned HTTP **404** in the link crawl on 28 August 2026.

**Why this loses or misleads a first-time visitor:** The only visible purchase action promises an unlock, then fails before checkout. This makes the stated $9 offer unverifiable.

**Concrete fix:** Register/configure the product checkout endpoint and add a browser link-health test that follows the CTA to a successful, identifiable checkout response. Until it works, remove the paid offer and its CTA.

### B4 — Required routes, fallback behavior, and metadata are incomplete

**Quote/evidence:**

- `/demo` and `/404` both return the landing document and, after JavaScript, the ordinary trainer. `/demo` retains the landing title rather than `Demo — Rhythm Reader`; `/404` is not a designed not-found page.
- `/robots.txt`, `/sitemap.xml`, and `/apple-touch-icon.png` each return HTTP 200 **HTML for the SPA fallback**, not the requested robots file, XML sitemap, or 180 px image.
- The landing document has a valid title, `lang`, one h1, description, and SVG favicon, but no canonical link, Open Graph tags, Twitter card, or apple-touch icon link. The legal pages use different minimal header/footer shells, so the site header/footer is not consistent by route.

**Why this loses or misleads a first-time visitor:** A shared fallback disguises missing places as a working product. Bookmarking `/demo` does not enter a demo; a bad URL looks like an unrelated trainer rather than an explanation and route home. Search/social previews lack required identity metadata.

**Concrete fix:** Implement real `/demo` and `/404` states with route-specific titles, one h1, focus movement, and back-button behavior; serve real `robots.txt`, `sitemap.xml`, and Apple icon files; add canonical/OG/Twitter metadata and a product-derived 1200×630 image; and use the same header/footer shell (including Privacy and Terms) on legal pages. Add deep-link, back, focus, and asset-content tests.

### B5 — The first screen uses a slogan and unnamed action instead of the job and audience

**Quote/evidence:** “DON’T GUESS THE GROOVE.” and “Start a take.” The only explanatory line is “Read a short, real-feeling pattern. Tap it back. See exactly where every note landed—early, late, or missed.”

**Why this loses or misleads a first-time visitor:** “Groove” and “take” require music-production context and still do not say whether the product is for drummers, pianists, beginners, sight readers, or another group. A phone visitor cannot tell whether tapping starts a blank exercise, uses the microphone, records audio, or saves a result.

**Concrete fix:** Replace the h1 with a ≤9-word plain job statement and name the audience in the supporting sentence. For example: **“Practice reading rhythms by tapping them”**; **“For musicians who want clear timing feedback before a rehearsal.”** Replace the CTA with **“Try a two-bar sample rhythm”** and adjacent text **“See scored early, on-time, late, and missed taps.”**

### M1 — Copy is jargon-heavy, uses inconsistent concepts, and has long README sentences

**Quote/evidence:** “style grammar,” “onset,” “polyrhythm packs,” “meter,” “calibration,” “precache,” “service-worker,” and “semantic shell” are unexplained. The same activity is variously a “take,” “drill,” “pattern,” “exercise,” “practice tape,” and “phrase.” Headings such as “SIDE A,” “Read the edges,” “More musical words,” and “One clean purchase” do not state their subject when read out of context. The README has sentences of 26, 42, 29, and 26 words (full audit below).

**Why this loses or misleads a first-time visitor:** The cassette metaphor is visually distinctive, but it masks the task and makes keyboard/control labels harder to scan. Technical README prose also mixes user outcomes with implementation details.

**Concrete fix:** Use **rhythm pattern** consistently for what is read, **practice** for one attempt, and **practice history** for saved results. Replace “style grammar” with “rhythm style,” “onset” with “tap,” and “polyrhythm packs” with a named future feature only when it exists. Change “Read the edges” to “Check each tap,” and “More musical words. One clean purchase.” to “More rhythm styles for $9 once.” Split the four over-22-word README sentences as shown in the audit notes.

### M2 — Several controls do not name the result

**Quote/evidence:** “Start a take,” “Unlock styles,” “New pattern,” “Tap input,” “Get pop, swing + clave →,” and “Have a license? Restore it.”

**Why this loses or misleads a first-time visitor:** The labels make the visitor infer whether an action starts playback, opens a purchase, changes a setting, or restores a purchase.

**Concrete fix:** Use “Try a two-bar sample rhythm,” “See paid rhythm styles,” “Show a new rhythm,” “Use keyboard or screen taps,” “See paid rhythm styles,” and “Restore a style-pack license.” Keep “Buy the style pack,” “Reload update,” and “Verify and unlock,” which name a concrete result.

## Copy audit

Word counts treat a hyphenated or apostrophized word as one word. The sentence tables include all static sentence-level copy in the loaded landing template (including conditional status/dialog text) and README prose. Labels, headings, and controls without sentence form are listed after the tables.

### Landing sentences

| Words | Sentence | Audit |
| ---: | --- | --- |
| 3 | Sight-read the rhythm. | Jargon: “sight-read”. |
| 3 | Hear the truth. | Marketing/vague: “truth”. |
| 4 | Don’t guess the groove. | Slogan; jargon: “groove”. |
| 5 | Read a short, real-feeling pattern. | Vague adjective: “real-feeling”. |
| 3 | Tap it back. | Clear but lacks outcome. |
| 10 | See exactly where every note landed—early, late, or missed. | Unlisted claim; “note” conflicts with a tap rhythm. |
| 2 | No account. | Unlisted privacy/product claim. |
| 7 | Your practice log stays on this device. | Unlisted privacy claim; “log” differs from history. |
| 4 | Offline — practice still works. | Unlisted offline claim. |
| 7 | License checks will resume when you reconnect. | Unlisted behavior claim. |
| 7 | Saved practice settings or history were repaired. | Clear recovery text. |
| 6 | Your trainer is ready to use. | “Trainer” is another product name. |
| 6 | A new Rhythm Reader is ready. | Vague update wording. |
| 11 | Keyboard: Space starts/taps · N new pattern · inputs remain normally editable. | Technical/compact; split into help items. |
| 12 | Patterns use original style grammars—not copied songs or random note soup. | Unlisted claim; jargon and dismissive “note soup”. |
| 8 | The take gets marked where you played it. | “Take” is unexplained. |
| 11 | Scan the whole phrase and count a bar in your head. | Jargon: phrase/bar. |
| 11 | Use Space, the big pad, or your microphone after the count-in. | “count-in” unexplained. |
| 13 | Every onset gets an early, on-time, late, or missed mark—plus a score. | Unlisted claim; jargon: onset. |
| 3 | More musical words. | Unclear heading fragment. |
| 3 | One clean purchase. | Marketing adjective; unclear heading fragment. |
| 16 | Unlock pop backbeat, swing, and 3–2 clave grammars plus future polyrhythm packs for $9 once. | Unlisted price/content claim; jargon. |
| 7 | Core folk and march practice stays free. | Unlisted availability claim. |
| 7 | Sociobot/Dodo is the merchant of record. | Unlisted payment claim; unexplained names. |
| 2 | No subscription. | Unlisted payment claim. |
| 2 | Runs locally. | Unlisted local-processing claim. |
| 7 | No analytics, ads, accounts, or uploaded recordings. | Unlisted privacy claim. |
| 8 | Original AI-assisted collage; no copyrighted music is used. | Unlisted provenance/copyright claim. |
| 4 | Tap with six clicks | Heading; rewrite “Calibrate tap timing with six clicks.” |
| 5 | Use headphones if you can. | Clear. |
| 12 | Tap the pad or Space exactly when each click reaches your ears. | Clear enough; “pad” should be “tap button”. |
| 9 | We’ll subtract the measured device delay from future takes. | Unlisted functional claim; “take” inconsistent. |
| 4 | Current offset: 0 ms | Technical label; explain as timing adjustment. |
| 3 | Paste your license | Heading; rewrite “Restore your style-pack license.” |
| 6 | The token stays in this browser. | Unlisted privacy claim; token is unexplained. |

### README sentences

| Words | Sentence | Audit |
| ---: | --- | --- |
| 15 | Rhythm Reader is a local-first tap-in sight-reading trainer for adult amateur pianists, guitarists, and drummers. | Jargon: local-first/tap-in/sight-reading; audience appears here but not on first screen. |
| 26 | It generates short exercises from original folk, march, pop, swing, and clave pattern grammars, then marks each performed onset as early, on time, late, or missed. | **Over 22**, unlisted claim, jargon. Rewrite: “Choose a short rhythm style. Tap each rhythm. The trainer marks each tap early, on time, late, or missed.” |
| 14 | This deliberately does not grade pitch, accept MIDI, provide accounts, or transcribe copyrighted songs. | Unlisted scope claim; MIDI jargon. |
| 12 | Microphone audio is processed in memory and is never recorded or uploaded. | Unlisted privacy claim. |
| 6 | Requires Node.js 20 or newer. | Clear developer requirement. |
| 9 | The exact production build command is npm run build. | Clear. |
| 42 | It runs Vite and then generates dist/sw.js from the current release: the worker precaches built HTML plus all Vite-hashed JavaScript/CSS, never substitutes HTML for failed asset requests, and waits for the in-app Reload update confirmation before activating an update. | **Over 22**, implementation jargon and unlisted claims. Rewrite: “`npm run build` creates `dist/`. It also creates the offline worker.” |
| 12 | Static output lands in dist/, with dist/index.html at its root. | Clear enough. |
| 21 | VITE_BILLING_BASE can override the production billing origin for a registered staging product; the default is https://api.sociobot.in. | Implementation jargon; move to advanced deployment notes. |
| 29 | npm run test:browser rebuilds first, then verifies the cache-cleared offline reload, explicit service-worker update activation, 390 px touch targets, semantic shell, and axe serious/critical findings in Chromium. | **Over 22**, jargon and unlisted verification claims. Rewrite: “`npm run test:browser` rebuilds the app first. It checks offline reload, update activation, touch targets, and accessibility in Chromium.” |
| 8 | Deploy dist/ as an Azure Static Web App. | Clear deployment instruction. |
| 7 | The factory owns DNS and billing-product registration. | Clear internal ownership note. |
| 26 | The researched scope is in .factory/brief.json, the cassette-zine visual system and artwork provenance in .factory/design.md, and build verification in .factory/handoff.md. | **Over 22**. Rewrite: “See `.factory/brief.json` for scope. See `.factory/design.md` for design and art provenance. See `.factory/handoff.md` for verification.” |
| 1 | MIT. | Fragment; combine with licence heading. |
| 2 | See LICENSE. | Clear. |

### Non-sentence headings, labels, and controls checked

| Copy | Check / proposed rewrite |
| --- | --- |
| “SIDE A”, “SIDE B STYLE PACK”, “Your practice tape” | Metaphors do not identify the section. Use “Rhythm practice,” “Paid rhythm styles,” and “Practice settings.” |
| “READ → TAP → KNOW” | Vague final verb. Use “Read → tap → see timing.” |
| “How it reads” | Does not say this is instructions. Use “How rhythm practice works.” |
| “HONEST FEEDBACK” | Marketing adjective. Use “Tap timing feedback.” |
| “Read the edges” | Does not make sense alone. Use “Check each tap.” |
| “Start a take” | Does not name outcome; see B5 rewrite. |
| “Unlock styles” / “Get pop, swing + clave →” | Unclear destination. Use “See paid rhythm styles.” |
| “New pattern” | Use “Show a new rhythm.” |
| “Tap input” | State state/result: “Use keyboard or screen taps.” |
| “Have a license? Restore it” | Use “Restore a style-pack license.” |
| README bullets “Custom SVG…”, “Audible count-in…”, “Per-device…”, “A 14-day…”, “Offline practice…”, “Free folk…” | They are feature/behavior claims without registry entries; “SVG,” “precache,” and “grammar” are jargon. Convert them to plain, tested outcome statements. |

## Claim test and privacy checks

`claims.json` was absent, so there were no listed claim commands to execute. From a clean local clone at commit `c7011136ddd1ae591f784cfb0605f4d6e94e85e5`:

| Command | Result |
| --- | --- |
| `npm ci && npm test` | PASS — 12 tests in 3 files. |
| `npm run build` | PASS — created `dist/`; initial JS 25.92 kB / 10.21 kB gzip. |
| `npm run test:browser` | PASS — 4 tests. Includes local offline reload, update activation, mobile/aXe shell, and malformed-storage recovery. |

These are not a substitute for claim tests: none enters a demo sandbox, asserts a `demo:` namespace, resets demo data, or tests the live privacy statements under request interception. In the live `?demo=1` check, normal initial requests were same-origin document, JS, CSS, and artwork requests, but that result does not prove the privacy claims because no actual demo mode exists and no claim test covers the full demo flow.

## Structure check summary

| Check | Result |
| --- | --- |
| Distinct visual identity | PASS. The visible paper/ink/cassette collage is product-specific rather than a generic SaaS template. |
| Landing title, `lang`, one h1, main, description, favicon | PASS. |
| Plain-language h1 / first-screen audience / primary sample CTA | **FAIL — B1/B5.** |
| Canonical, OG/Twitter image, Apple touch icon | **FAIL — B4.** |
| Real robots.txt and sitemap.xml | **FAIL — B4.** Both return fallback HTML. |
| Designed 404 | **FAIL — B4.** `/404` is the normal trainer. |
| `/demo`, deep links, back/focus route behavior | **FAIL — B1/B4.** `/demo` is normal state; no route transition exists. |
| Header/footer with Privacy/Terms on each route | **FAIL — B4.** Legal pages use a different minimal shell. |
| Link crawl | **FAIL — B3.** Purchase endpoint is 404; other rendered links were 200. |

## Acceptance condition

Re-review only after the five blockers are resolved and their clean-state tests are added. The product may pass when there are zero BLOCKING findings and at most three minor findings.
