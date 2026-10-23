# /// script
# requires-python = ">=3.9"
# dependencies = ["pillow"]
# ///
"""One labelled thumbnail per clip in a footage manifest (the frame at its best moment).

    uv run tools/footage_thumbs.py projects/<slug>/local/footage/<group>/manifest.json

Writes _thumbs.jpg next to the manifest. Manifest format: see .claude/skills/footage-hunt/SKILL.md.
"""
import json, os, subprocess, sys, tempfile
from PIL import Image, ImageDraw

man = sys.argv[1]; d = os.path.dirname(os.path.abspath(man)); m = json.load(open(man))
tw, th, cols = 384, 216, 6; rows = (len(m) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 28)), 'black'); dr = ImageDraw.Draw(sheet); tmp = tempfile.mkdtemp()
for i, c in enumerate(m):
    f = c['file'] if os.path.isabs(c['file']) else os.path.join(d, c['file'])
    t = (c.get('best_in', 0) + c.get('best_out', c.get('best_in', 0))) / 2; p = f'{tmp}/{i}.jpg'
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', f, '-frames:v', '1', '-vf',
                    f'scale={tw}:{th}:force_original_aspect_ratio=decrease,pad={tw}:{th}:(ow-iw)/2:(oh-ih)/2', p])
    x, y = (i % cols) * tw, (i // cols) * (th + 28)
    if os.path.exists(p): sheet.paste(Image.open(p), (x, y))
    dr.text((x + 4, y + th + 6), f"{c['id']} {c.get('w','?')}x{c.get('h','?')} {c.get('dur',0):.0f}s"[:48], fill='yellow')
out = os.path.join(d, '_thumbs.jpg'); sheet.save(out, quality=85); print(len(m), 'clips ->', out)
