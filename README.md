# motion-studio

Make brand / motion / launch videos with Claude Code. Bring **an idea and a brand kit** (colours, fonts,
logo — or a design system); Claude plans the video, cuts it to the music, renders previews and iterates
with you until the final MP4.

Four templates, two engines:

| Template | What it is | Engine | Demo project |
|---|---|---|---|
| UI first look | product sneak peek: recreated screens, cursor clicks, feature by feature | Remotion | `NorthwindFirstLook` |
| Stat card | one number with context, scrolling ticker wall | Remotion | `NorthwindStat` |
| Archival hype montage | footage, quotes, memes, typed captions, big beat words | canvas | `projects/demo-montage`, `projects/quantpet-montage` (script only) |
| Launch teaser | kinetic words → particles assemble the logo → lockup | canvas | `projects/northwind-teaser` |

## Setup (macOS, Apple Silicon)
```bash
brew install ffmpeg node uv        # or your preferred installers; Python deps install on demand via uv
cd engines/remotion && npm ci && npm run brand -- demo && cd ../..
cd engines/canvas && npm ci && npx playwright install chromium && cd ../..
```

## Make a video
Open Claude Code in this folder and say what you want, e.g.

> Make a 30s first-look video for <product>. Brand kit is in brands/<name>. Features and claims are in
> <doc>. Music: <licensed track>. 720p preview first.

Claude follows `CLAUDE.md`: intake → (reference teardown) → plan for your approval → music analysis →
build → stills check → 720p preview with a sync report → your feedback → final.

## Add your brand
Copy `brands/_template` to `brands/<name>`, fill `brand.json`, put font files in `fonts/` and the logo
SVG in `logos/` (plain `<path>`s; tag the symbol paths `data-role="glyph"` for the teaser particles).
Then `npm run brand -- <name>` (Remotion) or set `brand='brands/<name>'` in a canvas timeline.
Check every on-screen character exists in your font: `uv run tools/glyph_check.py brands/<name>/brand.json <copy files>`.

## Render somewhere else
`RENDER_HOST=my-mac-mini scripts/remote_render.sh remotion NorthwindFirstLook projects/northwind-first-look/local/render.mp4 --scale=0.6667`
syncs the repo over ssh, renders there, and copies the result back.

## Rights
Fonts, music, footage and third-party logos must be licensed for how you publish. Instrumentals of songs
are still copyrighted. See `docs/rights.md`. The repo ships only OFL fonts and generated media.
