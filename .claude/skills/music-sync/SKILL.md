---
name: music-sync
description: Fit a video to its music — tempo/bar grid, song structure (intro, kick-only bars, verse, chorus, fills, phrases), scene layout on bars, re-arranging the track so the chorus lands earlier, and measuring that cuts hit the kicks. USE when choosing or changing music, when the user says the cut "doesn't land", "chưa khớp nhạc", "điệp khúc đến muộn", or before any render with music.
---

# Music sync

## Analyse
`uv run tools/beatmap.py local/music.wav --bpm-min 70 --bpm-max 160` → table + `music_map.png`.
Read it: per bar → kick/snare 16ths, loudness, bass, **mid** (chorus layers raise mid), fills (snare runs
at the end of a bar), silent/kick-only bars. Write the bar map into `plan.md` (bar → section).

## Lay scenes on it (all timing in beats; bar n = beats 4n..4n+3)
- Scene cuts on downbeats only. Big transitions on phrase starts (usually every 4 bars).
- Split a 4-bar phrase between two scenes (2+2) rather than cutting mid-phrase.
- Quiet bar → logo open. Kick-only bar → one slammed word per kick. Chorus entry → the key action
  (e.g. the Deploy click) + a flash accent. Fills → reveals (rows appearing, stepper steps).
- Clicks, word slams, row reveals on kicks / 8ths. Typing spans whole beats.

## Re-arrange the track when needed
`uv run tools/music_edit.py src.wav local/music.wav --bpm <bpm> --bar0 <first downbeat> --map "0-3,10-17,10-17"`
(source bars in play order). Jump from an odd to an even bar if the groove alternates two patterns;
loop the chorus to the end instead of dropping back to the verse. Re-run beatmap on the result.

## Verify (after mux)
`uv run tools/sync_check.py final.mp4 --bpm <bpm> --beats <every designed cut>` must PASS (≤ 1 frame).
It also lists downbeats without a kick (a broken edit shows up here). You cannot listen: report the
numbers and ask the user to listen at the edit points.
