# Lessons (things that went wrong, and the fix that is now built in)

## Sync to music
- Laying cuts on an even beat grid is not enough. Songs have structure: silent/intro bars, kick-only
  bars, verse, chorus (a mid-frequency layer enters), fills at phrase ends, syncopated bass. A cut in the
  middle of a bar against a syncopated bass "doesn't land" even if it is on a beat.
  → `beatmap.py` prints kick/snare per 16th, loudness/bass/mid per bar. Put scene cuts on downbeats,
  big cuts on phrase starts, actions on kicks, reveals on fills.
- A chorus at 19 s is too late for a 30 s video. Re-arrange the track by bars (`music_edit.py`); keep the
  even/odd drum-pattern alternation (jump odd → even) and crossfade ~12 ms. The join is then inaudible.
- Verify with numbers: `sync_check.py` compares detected picture cuts with kick onsets in the final file.
  ±1 frame (33 ms at 30 fps) is the best possible; detect kicks with 35-200 Hz (the attack of synthetic
  kicks sits above 120 Hz).
- Claude cannot listen. Say "checked by numbers" when delivering; ask the user to listen at the joins.

## Picture
- **Cursor missed buttons** because it used fixed coordinates while the card slid and zoomed.
  → `<Pointer>` measures `data-t` elements every frame (relative to `#ms-root`). Render a still at every
  click moment and look.
- **Wrong font** slipped in: labels used a system mono, and ✓ ● ▾ ⌕ fell back to another typeface.
  → brand font everywhere; icons as SVG; `glyph_check.py` before rendering.
- Inter with `tabular-nums` widens hyphens ("plug - ins") → apply tnum only to numbers/UI cards.
- Remotion package versions must match exactly (pin all `@remotion/*` to the same version).
- WebGL (mesh background) needs `--gl=angle` (set in remotion.config.ts).
- Headline over a zooming UI card → fade the headline before the camera pushes in.

## Canvas engine
- A Python `http.server` stalled frame loads for seconds → load from file:// with
  `--allow-file-access-from-files` and decode with `createImageBitmap`.
- Playwright's default headless shell blocks file:// fetch → launch with `channel: 'chromium'`.
- zsh does not split `$var` into words: `for r in "0 375"; do node render.js frames $r` passes ONE
  argument → use `${=r}` or bash.

## Sources and tools
- The pinned yt-dlp starts returning HTTP 403 within months → `uvx yt-dlp@latest`.
- YouTube auto-subs are often blocked → `tools/words.py` (mlx-whisper) for word timings.
- Scratch/temp folders get wiped → keep every project in `projects/<slug>` (media in `local/`).
- Content claims drift: dev review caught "instant withdraw" (only when the vault holds enough idle USDC)
  and a roadmap item nobody had researched. Trace every claim to the claims source; mark plans as plans.
