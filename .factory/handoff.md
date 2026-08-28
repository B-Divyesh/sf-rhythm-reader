# Rhythm Reader review 3 handoff

## Outcome

Adversarial first-read review 3 is complete at commit `b6dd98a099e307c0ae0298d8bb404571dba4fdba`. The verdict in `.factory/review-3.md` is **FAIL** with one BLOCKING finding and three minor findings. No product code was changed.

## Remaining findings

- **F-3-1 (BLOCKING):** Leaving `/demo` through shared navigation or browser back retains changed `demo:` keys and restores them on return, despite the “nothing is saved” banner.
- **F-3-2:** “N shows a new rhythm” has no `.factory/claims.json` entry or tagged claim test.
- **F-3-3:** **Raise the difficulty** remains active at level 5 and only replaces the result with another level-5 rhythm.
- **F-3-4:** The score’s accessible SVG description says “on by … milliseconds” instead of “on time” and omits punctuation after the last tap.

## Verification performed

- Fresh live cold reads at 390 × 844 and 1440 × 900.
- One-click demo, sample result, Reset, Start for real, real/demo storage separation, shared-navigation exit, offline reload, and request interception.
- Every `.factory/claims.json` command run separately from clean clone `/tmp/rhythm-reader-review3.KK54Zg`: 9/9 passed.
- `npm test`: 13/13 passed.
- `npm run build`: passed; `dist/` generated. JS is 28.94 kB raw / 11.13 kB gzip; CSS is 18.46 kB raw / 5.14 kB gzip.
- Non-claim Playwright suite: 19/19 passed.
- Live AxeBuilder scan on `/`, `/demo`, `/privacy`, `/terms`, and an unknown route: zero violations.
- Live link crawl: every rendered HTTP link returned 200; explicit `mailto:` links were excluded.
- `/opt/fleet/lib/verify-url.sh`: passed with no console/page errors and valid title/lang/h1/main/alt/button labels.
- Live root HTML and hashed JS/CSS SHA-256 values match the clean production build.

## Next steps

Centralize demo exit cleanup across all navigation paths, add the missing `N` claim test, make the level-5 action truthful, and repair the generated score description. Then rerun the exact checks listed in the review.

Pre-existing modified `graphify-out/` analysis files were preserved and excluded from this review.
