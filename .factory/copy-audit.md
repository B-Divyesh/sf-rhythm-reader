# Rhythm Reader copy audit

Audit date: 28 August 2026. Hyphenated terms count as one word. No listed sentence exceeds 22 words or uses a banned marketing term.

## Landing and product states

| Words | Sentence | Result |
| ---: | --- | --- |
| 6 | Practice reading rhythms by tapping them | Covered by `timing-feedback` |
| 13 | For adult pianists, guitarists, and drummers who want clear timing feedback before rehearsal. | Pass |
| 7 | See a scored two-bar rhythm right away. | Pass |
| 6 | Works offline after your first visit. | Pass |
| 6 | Practice history stays in this browser. | Pass |
| 3 | Free to use. | Pass |
| 2 | No account. | Pass |
| 8 | Scan both bars and count one bar silently. | Pass |
| 11 | Use Space, the large button, or microphone claps after the count. | Pass |
| 10 | See early, on-time, late, and missed marks with a score. | Pass |
| 11 | Rhythm Reader does not grade pitch, read MIDI, or copy songs. | Pass |
| 10 | It only compares your tap times with the shown rhythm. | Pass |
| 3 | You are offline. | Pass |
| 5 | Rhythm practice is still available. | Pass |
| 5 | Damaged practice data was reset. | Pass |
| 6 | You can start a new rhythm. | Pass |
| 5 | A new version is ready. | Pass |
| 8 | Choose folk, march, pop, swing, or clave rhythms. | Pass |
| 4 | Space starts or taps. | Pass |
| 5 | N shows a new rhythm. | Registered as `keyboard-shortcuts` |
| 3 | Use headphones if possible. | Pass |
| 12 | Tap the large button or Space when each click reaches your ears. | Pass |
| 9 | The saved adjustment is applied to later timing scores. | Pass |
| 4 | Your taps were steady. | Pass |
| 4 | Check the marked taps. | Pass |
| 9 | Try the rhythm once more at a slower speed. | Pass |
| 6 | Lower the speed and count aloud. | Pass |
| 4 | Not enough taps matched. | Pass |
| 6 | Try again in a quiet place. | Pass |
| 14 | The marks show one early tap, on-time taps, late taps, and a missed tap. | Pass |
| 6 | Demo — sample data, nothing is saved. | Covered by `demo-isolation` |
| 7 | Changes stay separate from your practice history. | Covered by `demo-isolation` |
| 5 | The sample demo was reset. | Pass |
| 8 | Collage created for Rhythm Reader with AI assistance. | Covered by `art-provenance` |
| 7 | Practice rhythm patterns and check each tap. | Covered by `timing-feedback` |

The generated score description uses complete forms: `Tap n: early by n milliseconds.`, `Tap n: on time by n milliseconds.`, `Tap n: late by n milliseconds.`, and `Tap n: missed.` The accessibility regression verifies the wording and final punctuation.

## README sentences and bullets

| Words | Sentence or bullet | Result |
| ---: | --- | --- |
| 12 | Rhythm Reader helps adult pianists, guitarists, and drummers practice short rhythm patterns. | Pass |
| 10 | It marks each tap early, on time, late, or missed. | Covered by `timing-feedback` |
| 10 | A completed sample with early, on-time, late, and missed marks | Covered by `timing-feedback` |
| 10 | Demo settings and history kept separate from real practice data | Covered by `demo-isolation` |
| 6 | Offline use after the first visit | Covered by `offline-reload` |
| 6 | Practice history stored in this browser | Covered by `privacy-local-only` |
| 13 | Five rhythm styles, three time signatures, and patterns from two to four bars | Covered by `rhythm-options` |
| 12 | Screen taps, Space-key taps, and microphone claps with a saved timing adjustment | Covered by `input-calibration` |
| 9 | The full trainer without a payment or account gate | Covered by `free-no-account` |
| 10 | Practice data and microphone audio are not sent anywhere else. | Covered by `privacy-local-only` |
| 10 | Microphone audio is checked in memory and is not recorded. | Covered by `privacy-local-only` |
| 12 | Rhythm Reader does not grade pitch, read MIDI, or provide song transcriptions. | Covered by `scope-boundaries` |

## Terminology and controls

| Concept | One term used |
| --- | --- |
| Shown material | rhythm / rhythm pattern |
| One scored attempt | practice |
| Saved record | practice history |
| Timing event | tap |
| Device correction | timing adjustment |
| Category | rhythm style |

Controls name their result: **Try it with sample data**, **Show a new rhythm**, **Show a new level-5 rhythm**, **Use microphone claps**, **Use keyboard or screen taps**, **Adjust tap timing**, **Reset demo**, and **Start for real**.
