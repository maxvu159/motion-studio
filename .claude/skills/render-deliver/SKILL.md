---
name: render-deliver
description: Render, check and deliver a video from this repo — stills gate, 720p preview or final, audio mix and mux, sync report, local or remote (ssh) rendering, delivery to ~/Downloads. USE when it is time to render, preview, export, "xuất video", "render lại", "gửi bản 1080p", or to render on the Mac mini / another machine.
---

# Render & deliver

1. **Stills gate** (always first)
   - Remotion: `npx remotion still src/index.ts <Id> out/s<f>.png --frame=<f> --scale=0.5` for key frames and
     every click moment (frame = beat × 60/BPM × 30).
   - Canvas: `node render.js ../../projects/<slug> stills ../../projects/<slug>/local/check <f...>`.
   - `uv run tools/sheet.py '<dir>/*.png' sheet.jpg` → Read → fix → repeat.
2. **Render**
   - Remotion preview: `npx remotion render src/index.ts <Id> ../../projects/<slug>/local/render.mp4 --scale=0.6667`
     (final: no `--scale`, or `--scale=1.3333` for 2K).
   - Canvas: `node render.js ../../projects/<slug> all --jobs 4` → `local/render.mp4`.
   - Remote: `RENDER_HOST=<ssh alias> scripts/remote_render.sh remotion|canvas …` (see README).
3. **Sound**: `uv run tools/mix.py projects/<slug>/cues.json projects/<slug>/local/mix.wav` (-14 LUFS, limiter).
4. **Mux**: `bash tools/mux.sh <render.mp4> <mix.wav> ~/Downloads/<slug>-<res>.mp4 <poster second>`.
5. **Verify**: `uv run tools/sync_check.py <final> --bpm <bpm> --beats <cuts>` → PASS; `ffprobe` size/fps/length;
   a contact sheet of the final (`tools/sheet.py --every 1`).
6. **Deliver**: path, resolution, length, what changed, what was verified (stills read, sync table,
   loudness), what was not (no listening), and the next decision for the user. Log in `projects/<slug>/notes.md`.
