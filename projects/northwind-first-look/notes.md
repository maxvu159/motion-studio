# Northwind first look (demo)

- Template: first-look (Remotion). Scenes: `engines/remotion/src/projects/northwind-first-look/`.
- Music: generated test loop, 126 BPM, 20 bars (`uv run tools/testloop.py local/music.wav --bpm 126 --bars 20`).
  Bar map: 0 quiet · 1 four kicks · 2-3 groove · 4+ chorus, fills close bars 4/8/12/16.
- Layout: open bar 0, words bar 1 (one per kick), Create bars 2-4 (Deploy click = chorus entry, beat 16),
  then each 4-bar phrase split 2+2: Wallet/Discover, Follow/Deposit, Curator/Roadmap, End.
- Verified (2026-10-23): stills of every scene; `sync_check --beats 4,8,16,20,28,36,44,52,60,68` PASS
  (visual ≤ 29 ms, kick ≤ 1 ms); mix -13.7 LUFS.
- Origin: generalised from a real product first look (screens renamed, third-party names removed).
