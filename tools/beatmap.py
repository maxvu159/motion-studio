# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy", "scipy", "pillow"]
# ///
"""Map a track's rhythm and structure so scenes can be cut to it.

    uv run tools/beatmap.py music.wav [--bpm-min 70 --bpm-max 160] [--bars 40]

Writes next to the audio:
  <name>_map.png   one row per bar: 16 sixteenth-cells (red kick, green snare, blue hats),
                   then loudness / bass / mid bars — read this picture to find intro, verse,
                   chorus (mid layer jumps), fills (snare runs at the end of a bar) and breaks.
  <name>_map.json  bpm, beat period, first downbeat, per-bar features — feed to music_edit / sync work.
Prints a per-bar table with the same information as text.
"""
import argparse, json, subprocess, sys
import numpy as np
from scipy.signal import stft
from PIL import Image, ImageDraw

ap = argparse.ArgumentParser()
ap.add_argument('audio'); ap.add_argument('--bpm-min', type=float, default=70); ap.add_argument('--bpm-max', type=float, default=160)
ap.add_argument('--bars', type=int, default=48, help='bars to print in the text table')
args = ap.parse_args()

SR = 44100
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', args.audio, '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
a = np.frombuffer(raw, np.float32)
if not len(a): sys.exit('could not decode audio (is ffmpeg installed?)')
hop = 256; fps = SR / hop; dur = len(a) / SR
f, t, Z = stft(a, SR, nperseg=2048, noverlap=2048 - hop)
A = np.abs(Z); M = np.log1p(A * 10)
flux = lambda m: np.r_[0, np.maximum(0, np.diff(m, axis=1)).sum(0)]
kick = flux(M[(f >= 35) & (f < 120)]); snare = flux(M[(f >= 1500) & (f < 5000)]); hat = flux(M[f >= 7000])
onset = kick * 2 + snare + hat * 0.5

# tempo + phase: coarse grid search on onset strength, then refine
def score(bpm, ph, until=min(dur, 150)):
    i = np.round(np.arange(ph, until, 60 / bpm) * fps).astype(int); i = i[i < len(onset)]
    return onset[i].mean() if len(i) else 0
best = max(((score(b, p), b, p) for b in np.arange(args.bpm_min, args.bpm_max, 0.1) for p in np.arange(0, 60 / b, 0.01)))
best = max(((score(b, p), b, p) for b in np.arange(best[1] - 0.15, best[1] + 0.15, 0.01) for p in np.arange(max(0, best[2] - 0.02), best[2] + 0.02, 0.002)))
_, bpm, ph = best; per = 60 / bpm
beats = np.arange(ph, dur, per)
kb = np.array([kick[min(len(kick) - 1, int(round(b * fps)))] for b in beats])
down = int(np.argmax([kb[k::4].mean() for k in range(4)]))
bar0 = beats[down] % (4 * per)
if bar0 > 4 * per - 0.06: bar0 -= 4 * per          # a hair before t=0 means the grid starts at 0
bar0 = max(0.0, bar0)
nb = int((dur - bar0) / (4 * per))

def strength(sig, tt, w=0.035):
    seg = sig[max(0, int((tt - w) * fps)):max(1, int((tt + w) * fps))]; return float(seg.max()) if len(seg) else 0.0
cells = np.zeros((nb, 16, 3)); loud = np.zeros(nb); bass = np.zeros(nb); mid = np.zeros(nb)
rms = np.sqrt((A ** 2).sum(0)); lowE = A[(f >= 35) & (f < 160)].sum(0); midE = A[(f >= 150) & (f < 1500)].sum(0)
for b in range(nb):
    for s in range(16):
        tt = bar0 + (b * 4 + s / 4) * per
        cells[b, s] = [strength(kick, tt), strength(snare, tt), strength(hat, tt)]
    m = (t >= bar0 + b * 4 * per) & (t < bar0 + (b + 1) * 4 * per)
    loud[b], bass[b], mid[b] = rms[m].mean(), lowE[m].mean(), midE[m].mean()
for k in range(3): cells[:, :, k] /= np.percentile(cells[:, :, k], 99) + 1e-9
loud /= loud.max(); bass /= bass.max(); mid /= mid.max()

print(f'{args.audio}: {bpm:.2f} BPM, beat {per:.4f}s, bar {4*per:.4f}s, first downbeat {bar0:.3f}s, {nb} bars')
pat = lambda v: ''.join('#' if x > .5 else '+' if x > .3 else '.' for x in v)
print('bar   time   loud bass  mid | kick 16ths       | snare 16ths')
for b in range(min(nb, args.bars)):
    print(f'{b:3d} {bar0 + b*4*per:7.2f}  {loud[b]:.2f} {bass[b]:.2f} {mid[b]:.2f} | {pat(cells[b,:,0])} | {pat(cells[b,:,1])}')

CW, RH = 34, 22; W = 16 * CW + 560; H = nb * RH + 30
img = Image.new('RGB', (W, H), 'black'); d = ImageDraw.Draw(img)
for b in range(nb):
    y = 20 + b * RH
    d.text((4, y + 4), f'{b:3d} {bar0 + b*4*per:6.2f}s', fill='white')
    for s in range(16):
        x = 110 + s * CW; k, sn, h = np.clip(cells[b, s], 0, 1)
        d.rectangle([x, y, x + CW - 3, y + RH - 4], fill=(int(255 * k), int(220 * sn), int(204 * h)))
        if s % 4 == 0: d.line([(x - 2, y), (x - 2, y + RH - 4)], fill=(120, 120, 120))
    bx = 110 + 16 * CW + 20
    for j, (v, c) in enumerate([(loud[b], (200, 200, 200)), (bass[b], (255, 140, 60)), (mid[b], (120, 200, 255))]):
        d.rectangle([bx + j * 140, y + 2, bx + j * 140 + int(120 * v), y + RH - 6], fill=c)
d.text((110, 2), 'beats 1-4 in 16ths: red kick / green snare / blue hats', fill='white')
d.text((110 + 16 * CW + 20, 2), 'loudness        bass          mid (chorus layers)', fill='white')
base = args.audio.rsplit('.', 1)[0]
img.save(base + '_map.png')
json.dump(dict(bpm=bpm, per=per, bar0=bar0, bars=nb, cells=cells.round(3).tolist(), loud=loud.round(3).tolist(),
               bass=bass.round(3).tolist(), mid=mid.round(3).tolist()), open(base + '_map.json', 'w'))
print('wrote', base + '_map.png', base + '_map.json')
