# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy"]
# ///
"""Re-arrange a track bar by bar (e.g. bring the chorus in earlier, loop it to the end).

    uv run tools/music_edit.py music.wav out.wav --bpm 126 --bar0 0.040 --map "0-3,10-17,10-17"

--map lists SOURCE bars in the order the video should hear them (ranges inclusive).
Contiguous source bars are copied as one untouched slice; every jump gets a short
crossfade (--xf, default 12 ms). Take --bpm and --bar0 from beatmap.py.

Rule of thumb from use: many grooves alternate two one-bar drum patterns, so jump from an
odd source bar to an even one (or check the beatmap rows) to keep the pattern intact.
"""
import argparse, subprocess
import numpy as np

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('out')
ap.add_argument('--bpm', type=float, required=True); ap.add_argument('--bar0', type=float, required=True)
ap.add_argument('--map', required=True); ap.add_argument('--xf', type=float, default=0.012)
ap.add_argument('--sr', type=int, default=48000)
a_ = ap.parse_args()

bars = []
for part in a_.map.split(','):
    lo, _, hi = part.strip().partition('-'); bars += list(range(int(lo), int(hi or lo) + 1))
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', a_.src, '-ac', '2', '-ar', str(a_.sr), '-f', 'f32le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.float32).reshape(-1, 2)
BAR = 4 * 60 / a_.bpm; sr = a_.sr; xf = int(a_.xf * sr)
runs = []                                         # [video bar, first source bar, length]
for k, sb in enumerate(bars):
    if runs and runs[-1][1] + runs[-1][2] == sb: runs[-1][2] += 1
    else: runs.append([k, sb, 1])
tot = int(round(len(bars) * BAR * sr)) + xf
out = np.zeros((tot, 2), np.float32)
for vk, sb, ln in runs:
    i0 = int(round((a_.bar0 + sb * BAR) * sr)); i1 = int(round((a_.bar0 + (sb + ln) * BAR) * sr))
    s = a[i0:i1 + xf].copy()
    if vk > 0: s[:xf] *= np.linspace(0, 1, xf)[:, None]
    s[-xf:] *= np.linspace(1, 0, xf)[:, None]
    o = int(round(vk * BAR * sr)); out[o:o + len(s)] += s[:tot - o]
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(sr), '-ac', '2', '-i', '-', a_.out], input=np.clip(out, -1, 1).tobytes(), check=True)
print('runs (video bar, source bar, n bars):', runs, f'-> {a_.out} {len(out)/sr:.2f}s; video bar 0 starts at 0.000s')
