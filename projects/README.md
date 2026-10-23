# Projects

One folder per video. Keep here: `brief.md`, `plan.md` (storyboard in bars/beats), `notes.md`
(decisions, measurements, gotchas), `timeline.py` (canvas) and `cues.json` (mix). Media, renders and
generated files go in `local/` (gitignored). Remotion scene code lives in
`engines/remotion/src/projects/<slug>/` (the bundler needs it inside the engine).

| Project | Template | How to run |
|---|---|---|
| northwind-first-look | first-look (Remotion) | `npx remotion render src/index.ts NorthwindFirstLook …`; music: `uv run tools/testloop.py projects/northwind-first-look/local/music.wav` |
| northwind-teaser | launch-teaser (canvas) | testloop as above into its `local/`, `python3 timeline.py`, `node engines/canvas/render.js projects/northwind-teaser all` |
| demo-montage | montage (canvas) | `bash make_placeholders.sh`, testloop, `python3 timeline.py`, render `all` |
| quantpet-montage | montage + product UI plugin | reference only — needs footage/music you supply (see timeline.py header) |
