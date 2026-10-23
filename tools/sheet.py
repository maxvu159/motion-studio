# /// script
# requires-python = ">=3.9"
# dependencies = ["pillow"]
# ///
"""Contact sheet with a time label on every tile — the main way Claude 'watches' a video.

    uv run tools/sheet.py video.mp4 out.jpg --every 0.5 [--start 0 --end 12] [--cols 6 --width 360]
    uv run tools/sheet.py video.mp4 out.jpg --at 1.9,3.8,7.6          # exact moments (e.g. clicks)
    uv run tools/sheet.py 'stills/*.png' out.jpg                      # tile existing images

Read the resulting image. Labels are seconds (or file names for image globs).
"""
import argparse, glob, os, subprocess, tempfile
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--every', type=float, default=0.5); ap.add_argument('--start', type=float, default=0); ap.add_argument('--end', type=float)
ap.add_argument('--at'); ap.add_argument('--cols', type=int, default=6); ap.add_argument('--width', type=int, default=360)
a = ap.parse_args()

tiles = []
if any(ch in a.src for ch in '*?'):
    tiles = [(os.path.basename(p), Image.open(p).convert('RGB')) for p in sorted(glob.glob(a.src))]
else:
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', a.src], capture_output=True, text=True).stdout)
    times = [float(x) for x in a.at.split(',')] if a.at else []
    if not times:
        t = a.start; end = min(a.end or dur, dur - 0.01)
        while t <= end: times.append(round(t, 3)); t += a.every
    tmp = tempfile.mkdtemp()
    for i, t in enumerate(times):
        p = f'{tmp}/{i:04d}.png'
        subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', str(t), '-i', a.src, '-frames:v', '1', '-vf', f'scale={a.width}:-2', p])
        if os.path.exists(p): tiles.append((f'{t:.2f}s', Image.open(p).convert('RGB')))
if not tiles: raise SystemExit('nothing to tile')
w = a.width; h = int(tiles[0][1].height * w / tiles[0][1].width); lab = 20
rows = (len(tiles) + a.cols - 1) // a.cols
sheet = Image.new('RGB', (a.cols * (w + 4), rows * (h + lab + 4)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for i, (name, im) in enumerate(tiles):
    x, y = (i % a.cols) * (w + 4), (i // a.cols) * (h + lab + 4)
    sheet.paste(im.resize((w, h)), (x, y + lab)); d.text((x + 4, y + 4), name, fill=(255, 220, 80))
sheet.save(a.out, quality=88); print(f'{len(tiles)} tiles -> {a.out}')
