# /// script
# requires-python = ">=3.9"
# dependencies = ["fonttools"]
# ///
"""Check the brand font actually contains every character used on screen.

    uv run tools/glyph_check.py brands/<brand>/brand.json <file-or-text> [...]

Arguments after the brand can be files (scene code, copy docs) or literal strings.
A missing glyph is silently drawn by a fallback font in the browser — exactly the bug where
✓ ● ▾ ⌕ rendered in a different typeface. Replace them with SVG icons or supported characters.
Also reports whether the font has tabular figures (tnum) for aligned numbers.
"""
import json, os, re, sys
from fontTools.ttLib import TTFont

brand = sys.argv[1]; bdir = os.path.dirname(os.path.abspath(brand)); b = json.load(open(brand))
text = ''
for arg in sys.argv[2:]:
    if os.path.exists(arg):
        s = open(arg, encoding='utf-8', errors='ignore').read()
        if arg.endswith(('.ts', '.tsx', '.js', '.py')):   # code: only string literals and JSX text
            parts = re.findall(r'"([^"\n]*)"|\'([^\'\n]*)\'|`([^`]*)`|>([^<>{}\n]+)<', s)
            s = ' '.join(''.join(m) for m in parts)
        text += s
    else: text += arg
chars = sorted({c for c in text if not c.isspace() and ord(c) > 31})
bad = 0
for fdef in b['type']['files']:
    font = TTFont(os.path.join(bdir, fdef['file'])); cmap = font.getBestCmap()
    missing = [c for c in chars if ord(c) not in cmap]
    feats = {r.FeatureTag for r in font['GSUB'].table.FeatureList.FeatureRecord} if 'GSUB' in font else set()
    print(f"{fdef['file']}: {len(chars)} chars checked, missing: {' '.join(missing) or 'none'}  | tnum: {'yes' if 'tnum' in feats else 'NO'}")
    bad += bool(missing)
sys.exit(1 if bad else 0)
