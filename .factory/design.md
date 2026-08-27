# Rhythm Reader visual thesis

## Direction: cassette-era practice zine

Rhythm practice is repetitive, physical, and a little obsessive. The product should feel like a well-used rehearsal-room cassette insert: warm paper, ink that is almost black, fluorescent correction marks, clipped labels, and the precise mechanics of a tape deck. This makes the notation feel like the main artifact rather than dressing a generic dashboard in music icons. It is deliberately single-mode: an ink-on-paper daylight interface, with the dark tape-deck transport as its grounding surface.

## Palette

| Token | Value | Use |
| --- | --- | --- |
| `paper` | `#F3E9D0` | page and notation stock |
| `paper-high` | `#FFF9E9` | raised sheets |
| `ink` | `#171713` | primary type and rules |
| `muted-ink` | `#5D584C` | secondary copy (7.0:1 on paper) |
| `deck` | `#272923` | transport and footer |
| `coral` | `#D93F31` | record/late/danger, with text labels |
| `acid` | `#D7F23A` | focus, correct/on-time, active cues |
| `blue` | `#246B78` | early timing and informational marks |
| `amber` | `#A95B08` | missed/warning |

The stock is warm because this is a reading surface, not a dark studio UI. Acid yellow-green evokes highlighter and level meters; coral is a record-button cue. Timing feedback always combines colour with a symbol and word.

## Type and spacing

- Display: `Arial Black`, `Impact`, sans-serif; tight, uppercase, slightly rotated only on decorative labels. This uses local system faces and ships no font payload.
- Working text: `Arial`, `Helvetica Neue`, sans-serif; 16px minimum, generous 1.5 leading.
- Timing/count numerals: `Courier New`, monospace with tabular figures, like a cassette counter.
- Scale: 16 / 18 / 22 / 30 / clamp(40–72) px.
- Spacing: 4px base; recurring gaps 8, 12, 16, 24, 32, 48, 64px. Interactive targets are at least 48px.
- Desktop is an asymmetrical editorial spread: trainer occupies the broad left column, settings/history the narrow right. At 390px it becomes one ordered column and secondary explanation is shortened or moved below the playable surface.

## Shape, assets, and interaction grammar

- Paper panels use 1px ink rules and a hard 4px offset shadow—never soft SaaS shadows.
- Controls resemble punched cassette labels and deck switches. Rectangles are clipped by tiny angled corners; pills are reserved for meter/status readouts.
- The score is custom SVG notation with accessible text alternative. Bar lines and stems are crisp; timing marks appear directly beneath each onset as `E`, `ON`, `L`, or `×`.
- The primary interaction is one large tape-deck pad. Pressing Space or the pad visibly depresses it. A four-beat count-in advances through four square lamps. Results are revealed left-to-right like a marked-up take.
- Original decorative icons (metronome, tape spools, arrows) are hand-authored SVG using only geometric primitives.

## Motion policy

UI transitions last 160–240ms and use only transform/opacity. The tap pad depresses by 2px; count lamps snap on; result markers enter once from their note position. Nothing loops. With `prefers-reduced-motion: reduce`, transforms and reveal transitions become instantaneous opacity/state changes; audio timing remains unchanged.

## Generated hero asset and prompt sheet

Subject: an overhead still life of a translucent smoky cassette, wooden rhythm blocks, torn manuscript fragments containing only abstract staff-like marks, a pencil, and fluorescent correction stickers. World/materials: independent 1980s rehearsal zine, warm uncoated paper, photocopy grain, screenprint misregistration, cut-paper collage. Light/lens: hard side light, overhead 50mm editorial flat lay. Palette words: oatmeal paper, carbon ink, recording coral, acid chartreuse, faded teal. Composition: objects concentrated to the right with calm paper space at left; no people.

Negative list: no readable text, no letters or numbers, no logos, no watermark, no brands, no realistic copyrighted sheet music, no gradient, no glossy 3D render, no neon cyberpunk, no hands, no UI screenshot.

Prompt used: “Overhead editorial flat-lay illustration for a rhythm sight-reading practice web app: translucent smoky blank cassette with visible spools, two wooden rhythm blocks, torn scraps with abstract five-line music-staff gestures but no legible notation, sharpened pencil, fluorescent chartreuse correction tabs, coral paper dot. Cassette-era independent rehearsal zine, warm oatmeal uncoated paper, carbon-black photocopy grain, subtle screenprint misregistration, hand-cut collage edges, hard side light, 50mm overhead lens. Objects grouped on the right, generous calm blank paper on the left. Palette of oatmeal, carbon ink, recording coral, acid chartreuse, faded teal. Tactile, original, useful editorial artwork. No people, no hands, no readable text, no letters, no numbers, no logos, no watermark, no brands, no copyrighted music, no UI screenshot, no gradient, no glossy 3D, no cyberpunk.”

Provenance: generated specifically for Rhythm Reader with the factory Azure OpenAI image deployment (`factory-image`), 27 August 2026. Original generated asset; no third-party source material. Source PNG and prompt sidecar live in `assets/src/`; production WebP is optimized in `public/art/`. The footer discloses AI-assisted original artwork.

## Why this fits

The product asks a player to make short, repeatable “takes” and compare them honestly. A cassette deck supplies the physical model for record, rewind, replay, and take counters; a marked-up zine supplies the model for notation and feedback. The system is expressive without competing with the rhythm, and it avoids both conservatory formality and game-like synthetic randomness.
