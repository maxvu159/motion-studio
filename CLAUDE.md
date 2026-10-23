# motion-studio — instructions for Claude

This repo turns **an idea + a brand kit** into a finished, beat-synced motion video. You (Claude) drive
the whole pipeline: brief → reference teardown → plan → music → assets → build → stills → preview →
feedback → final. The user mostly reviews pictures and MP4s. Read this file fully before starting a video.

## Map
- `brands/<name>/brand.json` — colours, fonts (files next to it), radii, motion, background, logo, rules.
  `brands/_template` is blank; `brands/demo` (Northwind, Inter OFL) is the neutral example.
- `engines/remotion/` — Remotion 4: `src/kit` (brand loader, beat helpers, UI parts, `Pointer`, `MeshBg`),
  `src/templates/{first-look,stat-card}`, `src/projects/<slug>/` (scene code), `src/Root.tsx` (registry).
- `engines/canvas/` — deterministic canvas runtime (`runtime/comp.html`, `render.js`), Python timeline
  builder (`lib/montage.py`), plugins (`templates/launch-teaser/teaser.js`). Montage + teaser live here.
- `tools/` — `uv run tools/<x>.py` (deps declared inline). See "Tools" below.
- `projects/<slug>/` — brief.md, plan.md, notes.md, timeline.py / cues.json; heavy media in `local/` (gitignored).
- `docs/` — workflow.md (stage gates), genres.md (video types + keywords), lessons.md (bugs we hit), rights.md.
- `.claude/skills/` — new-video, ref-teardown, music-sync, footage-hunt, render-deliver.

## Which engine / template
| Video | Template | Engine |
|---|---|---|
| Product sneak peek: recreated UI, cursor clicks, feature by feature | `first-look` | Remotion |
| One number / stat with context, logo or ticker wall | `stat-card` | Remotion |
| Archival hype montage: footage, quotes, memes, typed captions, big words | `montage` (lib/montage.py) | canvas |
| Launch teaser / logo reveal: kinetic words → particles → lockup | `launch-teaser` plugin | canvas |
Mixed videos are fine: canvas plugins can draw product UI (see `projects/quantpet-montage/scenes/`).

## Stage gates (do not skip; each ends with something the user can look at)
0. **Intake** — idea, audience/platform, aspect + length, brand kit (or design system to convert into
   `brands/<name>/`), product source (repo, screens, Figma), and the **claims source** (content doc).
   Ask only for what is missing. Create `projects/<slug>/brief.md`.
1. **Reference** (if the user has examples) — `tools/ref_teardown.py`, read the sheets, name the genre
   (docs/genres.md), describe structure by time and what each shot implies.
2. **Plan** — storyboard table in BARS/BEATS with on-screen copy; every claim traced to the claims source.
   Get approval before building (plan.md). Flag anything that overclaims (e.g. "instant" without its condition).
3. **Music** — license first (docs/rights.md). `tools/beatmap.py` → read the map: intro/silence, kick-only
   bars, verse, chorus (mid layer jumps), fills, 4-bar phrases. Then lay scenes on it:
   scene cuts on downbeats, big cuts on phrase starts, micro-actions (word slams, clicks, rows) on kicks,
   reveals on fills. If the chorus comes too late, `tools/music_edit.py` (bar map, odd→even jumps).
4. **Assets** — brand kit complete; `tools/glyph_check.py` on all on-screen copy (no fallback glyphs);
   footage via the footage-hunt skill (parallel subagents, manifest per group); speech timing via `tools/words.py`.
5. **Build** — copy the closest project as a start. All timing in beats of the music; every value a pure
   function of the frame. Clickable elements get `t="id"`; the cursor is `<Pointer>` (it measures them).
6. **Stills gate** — render key frames AND every click moment (`remotion still` / `render.js stills`),
   tile with `tools/sheet.py`, and LOOK: overflow, contrast on the mesh, brand font everywhere,
   cursor on target, wording vs claims source. Fix before rendering video.
7. **Preview** — 720p (`--scale=0.6667`) or canvas `all`; `tools/mix.py` → `tools/mux.sh` →
   `tools/sync_check.py` must PASS; copy to `~/Downloads/<slug>-720p.mp4`; tell the user what to look at.
8. **Feedback → final** — iterate; final at 1080p (or 2K). Append decisions, measurements and gotchas
   to `projects/<slug>/notes.md`.

## Hard rules
- Brand font everywhere, including labels, numbers and addresses — no system mono. Tabular figures only
  inside UI/number elements (some fonts widen hyphens under tnum).
- Icons that fonts lack (✓ ● ▾ ⌕) are SVG, never characters.
- No springs/bounce on UI or numbers unless the brand says so. Energy comes from cutting on the beat.
- The cursor never uses fixed coordinates: `<Pointer keys=[{at, t, click}]>` + `t` ids on targets.
- No on-screen claim that is not in the claims source; numbers say where they come from; demo data is
  labelled as such.
- Never commit licensed footage, music, fonts or third-party logos. Media lives in `projects/*/local/`.
- You cannot hear. Audio is verified by numbers (beatmap, LUFS, sync_check). Say so when you deliver.
- Report what you verified and how (stills read, sync table, loudness), and what you did not.

## Tools (all `uv run tools/<name>.py ...`; `--help` style docs at the top of each file)
ref_teardown · beatmap · music_edit · testloop · words · sfx · mix · sync_check · sheet · glyph_check · footage_thumbs;
`tools/mux.sh`; `scripts/remote_render.sh` (render on another machine over ssh).

## Commands
```bash
# Remotion
cd engines/remotion && npm ci && npm run brand -- demo
npx remotion studio                                  # live preview
npx remotion still src/index.ts <Id> out/x.png --frame=120 --scale=0.5
npx remotion render src/index.ts <Id> ../../projects/<slug>/local/render.mp4 --scale=0.6667   # 720p preview
# Canvas
cd engines/canvas && npm ci && npx playwright install chromium
python3 ../../projects/<slug>/timeline.py
node render.js ../../projects/<slug> stills ../../projects/<slug>/local/check 30 90 150
node render.js ../../projects/<slug> all --jobs 4
# Sound + delivery
uv run tools/mix.py projects/<slug>/cues.json projects/<slug>/local/mix.wav
bash tools/mux.sh projects/<slug>/local/render.mp4 projects/<slug>/local/mix.wav ~/Downloads/<slug>-720p.mp4 2
uv run tools/sync_check.py ~/Downloads/<slug>-720p.mp4 --bpm <bpm> --beats <cut beats>
```
