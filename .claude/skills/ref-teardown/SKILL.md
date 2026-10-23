---
name: ref-teardown
description: Analyse a reference video (X/YouTube link or file) — structure, cut rhythm, type treatment, what each shot implies, which genre it is, and where to find similar examples. USE when the user shares a video and asks "phân tích video này", "what kind of video is this", "làm giống video này", "find more like this".
---

# Reference teardown

1. `uv run tools/ref_teardown.py <url-or-file> refs/<name>` → `video.mp4`, `info.txt` (duration, cuts/sec,
   caption), `cuts.txt`, `sheet_NN.jpg` (time-labelled tiles).
2. READ every sheet. Write the teardown:
   - structure by time (0-6s …), what is on screen, what each image/sequence *implies*;
   - cut rhythm (cuts/sec, where it tightens, silences), music feel (run `tools/beatmap.py` on the audio
     if the music matters: `ffmpeg -i video.mp4 -vn music.wav`);
   - type: font style, typing captions, big words, end card;
   - genre name + why (docs/genres.md vocabulary).
3. Similar examples: search with the genre keywords (docs/genres.md). Check links resolve before listing;
   say which ones you actually opened vs picked by title.
4. If the user wants to make one: hand off to new-video with the genre → template mapping.
Keep references in `refs/` (gitignored media) and the written teardown in the project notes.
