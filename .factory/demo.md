# Rhythm Reader sample demo

- Open <https://rhythm-reader.sociobot.in/demo> or add `?demo=1` to the home URL.
- The page opens with a completed two-bar pop rhythm. Its marks include early, on-time, late, and missed taps.
- The sample practice history contains three recent days with realistic scores.
- **Reset demo** removes the demo keys and restores the original sample.
- **Start for real** returns to `/` without copying sample activity.
- Leaving the demo through its header, footer, wordmark, hash links, browser back button, or another page also removes the sample keys.
- Reloading keeps the current sample in this browser tab. It never copies it into real practice data.

Demo settings and history use `demo:rr_settings:v1` and `demo:rr_history:v1`. The demo never reads or writes `rr_settings:v1` or `rr_history:v1`.
