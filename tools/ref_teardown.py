# /// script
# requires-python = ">=3.9"
# dependencies = ["pillow"]
# ///
"""Tear down a reference video (X, YouTube, or a local file) so its grammar can be copied.

    uv run tools/ref_teardown.py <url-or-file> refs/<name>

Produces in refs/<name>/:
  video.mp4        the download (via `uvx yt-dlp@latest` — the pinned yt-dlp often gets HTTP 403)
  info.txt         duration, size, fps, caption text, cut count, cuts/second, average shot length
  cuts.txt         every detected cut time (scene score > 0.25)
  sheet_NN.jpg     time-labelled contact sheets, 30 tiles each (every 0.5s; 0.25s for clips < 25s)
Then READ the sheets and write the teardown: structure by time, what each shot implies,
cut rhythm vs music, type treatment, end card. See docs/genres.md for the vocabulary.
"""
import os, re, subprocess, sys

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
vid = os.path.join(out, 'video.mp4'); caption = ''
if os.path.exists(src):
    vid = src
elif not os.path.exists(vid):
    r = subprocess.run(['uvx', 'yt-dlp@latest', '-q', '--cookies-from-browser', 'chrome', '-f', 'bv*[height<=1080]+ba/b', '--merge-output-format', 'mp4',
                        '-o', vid, '--print', 'after_move:%(uploader)s | %(upload_date)s | %(description)s', src], capture_output=True, text=True)
    caption = r.stdout.strip()
    if not os.path.exists(vid): sys.exit('download failed:\n' + r.stderr[-800:])
probe = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration:stream=width,height,r_frame_rate', '-of', 'compact=p=0', vid], capture_output=True, text=True).stdout
dur = float(re.search(r'duration=([0-9.]+)', probe).group(1))
log = subprocess.run(['ffmpeg', '-hide_banner', '-i', vid, '-vf', "scale=480:-2,select='gt(scene,0.25)',showinfo", '-an', '-f', 'null', '-'], capture_output=True, text=True).stderr
cuts = [float(x) for x in re.findall(r'pts_time:([0-9.]+)', log)]
open(os.path.join(out, 'cuts.txt'), 'w').write('\n'.join(f'{c:.3f}' for c in cuts))
step = 0.25 if dur < 25 else 0.5
here = os.path.dirname(os.path.abspath(__file__))
n = 0; t = 0.0
while t < dur:
    end = min(dur, t + 30 * step)
    subprocess.run(['uv', 'run', os.path.join(here, 'sheet.py'), vid, os.path.join(out, f'sheet_{n:02d}.jpg'), '--every', str(step), '--start', str(t), '--end', str(end - 0.01), '--cols', '6', '--width', '320'],
                   capture_output=True)
    n += 1; t = end
info = f'{probe.strip()}\ncaption: {caption}\ncuts: {len(cuts)}  cuts/sec: {len(cuts)/dur:.2f}  avg shot: {dur/max(1,len(cuts)+1):.2f}s\nsheets: {n} (every {step}s)\n'
open(os.path.join(out, 'info.txt'), 'w').write(info); print(info)
