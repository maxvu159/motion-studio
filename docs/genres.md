# Video types (what to call it, what makes it work, where to find examples)

Names people actually use, with the grammar we measured from references. Use these words in briefs and
when searching for examples.

## Brand manifesto / archival montage ("edit")
- **What:** a chain of instantly-recognisable images (archival, news, film, memes) that together make one
  argument the brand never states outright. Associative / "intellectual" montage: two images side by side
  create a third meaning.
- **Grammar:** typed terminal captions as narrator; real quotes as voice (Gekko, Cramer…); cuts 0.2-0.8 s
  that tighten into the drop; one silent beat before the reveal; minimal end card (logo + one line).
- **What makes it tasteful vs a TikTok edit:** one clear claim; symbols not pretty shots; rise-drop-silence
  structure; unified treatment (grade, frame/card, grain, one typeface); the end lands on the product.
- **Examples / search:** MTS launch (X), a16z "It's Time To Build", Adam Curtis style edit, "brand
  manifesto video", "archival montage edit", "finance edit", "wall street edit phonk", "<person> edit".
- **Template:** `montage` (canvas). Reference: `projects/quantpet-montage`.

## Cinematic / retro-futurist teaser
- **What:** world-building mood film, mostly generated or shot imagery, no UI, ends on name + date.
- **Grammar:** cuts locked to a steady beat (~0.8 s), archive → future contrast, hooded/anonymous figure,
  CRT terminal end card typing the date.
- **Search:** Erik Wernquist "Wanderers", "The High Frontier", Hello Tomorrow! main title, "1950s Super
  Panavision 70", "Kling 3.0 cinematic trailer", "Higgsfield short film", Ducat launch film.
- **Template:** not built (needs generated video); the montage engine can cut such footage.

## UI first look / sneak peek / product reveal
- **What:** recreated product screens animated as motion graphics (not a screen recording): feature by
  feature, cursor clicks, data animating, camera push/pan; ends with "coming soon" / CTA.
- **Grammar:** logo open in the quiet bar; one word per kick; each feature = headline column + floating UI
  card; whip-in on the downbeat; clicks on kicks, UI reacts on the click; chorus drop on the key action.
- **Search:** "product sneak peek video", "UI reveal animation", "SaaS product launch video", "app UI motion".
- **Template:** `first-look` (Remotion). Demo: `NorthwindFirstLook`.

## Stat card / data card
- **What:** one number that matters, with name, claim, description, source/date, partner row; often a
  scrolling wall of tickers/logos.
- **Grammar (measured):** wall moving at 0.0 s, logo 0.4, name 1.3, claim 1.6, description 2.3,
  count-up 3.5→5.0 on a data ease, source 5.5, partners 7.0, hold ≥ 1.2 s. 12-14 s total.
- **Template:** `stat-card` (Remotion). Demo: `NorthwindStat`.

## Launch teaser / logo reveal
- **What:** short kinetic piece: words slam on the beat, particles assemble the mark, lockup + CTA.
- **Template:** `launch-teaser` (canvas plugin). Demo: `projects/northwind-teaser`.
