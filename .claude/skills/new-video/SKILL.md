---
name: new-video
description: Start or continue a brand/motion video in this repo — sneak peek / first look, stat card, archival hype montage, launch teaser or logo reveal. USE when the user asks to make, plan, storyboard, remake or iterate a video ("make a first look video for X", "launch teaser for our brand", "làm video", "dựng video", "video giới thiệu sản phẩm", "làm lại video kiểu này"). Runs the stage gates in CLAUDE.md from intake to preview.
---

# New video

Follow `CLAUDE.md` stage gates. This skill is the checklist for gates 0-2 and the hand-off to the others.

## 0. Intake → `projects/<slug>/brief.md`
Ask only for what is missing (one round, multiple-choice where possible):
1. Goal, audience, platform (X / YouTube / site), aspect (16:9, 4:5, 9:16), target length.
2. Brand: existing `brands/<name>`? If they give a design system / Figma / site instead, create
   `brands/<name>/brand.json` from `brands/_template` (colours, font files, radii, motion, mesh palette,
   logo SVG with `data-role="glyph"` on the symbol) and show a still of the open/end card for approval.
3. Product source: repo (read layouts only — never copy the product's own copy/branding if it differs from
   the brand), screenshots, Figma.
4. Claims source: the doc every on-screen sentence must come from. No source → keep copy generic and say so.
5. Music: licensed track? internal preview only? (docs/rights.md). No track → `tools/testloop.py` for the edit.

## 1. Reference (optional) → ref-teardown skill

## 2. Plan → `projects/<slug>/plan.md`, then get approval
- Pick template/engine (table in CLAUDE.md). Copy the closest demo project as the starting point:
  Remotion `src/projects/northwind-first-look`, `northwind-stat`; canvas `projects/demo-montage`,
  `projects/northwind-teaser`, `projects/quantpet-montage`.
- Storyboard in bars/beats (music-sync skill gives the bar map): time | bars | scene | copy | claim source.
- Flag overclaims and items that are plans, not features.
- After approval: music-sync → assets (footage-hunt) → build → render-deliver.
