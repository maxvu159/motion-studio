---
name: footage-hunt
description: Gather footage, archival clips, memes and speech quotes for a montage — parallel subagents per theme, short verified segments, a manifest with best moments and exact speech timings. USE when a montage/teaser needs real-world footage ("tìm footage", "find clips of …", "gom tư liệu").
---

# Footage hunt

Split the shot list into 2-4 themes (e.g. old era / retail era / AI era) and spawn one subagent per theme
in parallel. Each brief must contain: the numbered shot list, the output dir
`projects/<slug>/local/footage/<theme>/`, and these rules:

- Search: `uvx yt-dlp@latest --flat-playlist --print "%(title)s | %(duration_string)s | %(view_count)s | https://youtu.be/%(id)s" "ytsearch8:<query>"`
- Download only the needed 4-15 s: `--download-sections "*MM:SS-MM:SS" --force-keyframes-at-cuts`,
  `-f "bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080]"`, `--cookies-from-browser chrome` if 403.
- Speech: word timings with `uv run tools/words.py clip.mp4` (screams/singing: pick from loudness).
- Verify EVERY clip by eye: `uv run tools/sheet.py clip.mp4 sheet.jpg --every 0.5` and Read it. Reject
  burned-in subtitles, big watermarks, reaction facecams, wrong content.
- Name `NN-slug.mp4`. Write `manifest.json`:
  `[{id, file, src_url, w, h, fps, dur, best_in, best_out, desc, speech: null|{text,in,out}, rights}]`
- Delete temp files. Reply with a short found/failed/notes summary.

Then `uv run tools/footage_thumbs.py <manifest>` per theme and Read the thumbs before writing the timeline.
Footage is never committed (projects/*/local is gitignored); note rights per clip (docs/rights.md).
