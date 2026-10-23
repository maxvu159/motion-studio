# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy"]
# ///
"""Royalty-free test track with a known structure — for demos and for checking sync tooling.

    uv run tools/testloop.py out.wav --bpm 126 --bars 20

Layout (the same shape as the demo projects expect):
  bar 0      near-silent (soft riser)
  bar 1      four kicks only
  bars 2-3   groove: kick, snare on 2 & 4, hats, bass
  bars 4+    chorus: groove + chord stabs (mid layer); snare fill closes every 4th bar (4, 8, 12, 16 ...)
Not music to publish — use a licensed track for real deliverables (docs/rights.md).
"""
import argparse, subprocess
import numpy as np

ap = argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--bpm', type=float, default=126); ap.add_argument('--bars', type=int, default=20)
a = ap.parse_args()
SR = 48000; spb = 60 / a.bpm; N = int(a.bars * 4 * spb * SR) + SR
out = np.zeros(N); rng = np.random.default_rng(1)
def add(t, x, g=1.0):
    i = int(t * SR); j = min(N, i + len(x)); out[i:j] += x[:j - i] * g
tt = lambda d: np.arange(int(d * SR)) / SR
def kick():
    t = tt(0.35); f = 45 + 120 * np.exp(-t * 30); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 9)
def snare():
    t = tt(0.22); return (rng.standard_normal(len(t)) * 0.6 + np.sin(2 * np.pi * 190 * t) * 0.5) * np.exp(-t * 18)
def hat():
    t = tt(0.05); return rng.standard_normal(len(t)) * np.exp(-t * 90) * 0.25
def bass(freq, d):
    t = tt(d); return np.tanh(np.sin(2 * np.pi * freq * t) * 2) * np.exp(-t * 2.5) * 0.35
def chord(freqs, d):
    t = tt(d); x = sum(np.sign(np.sin(2 * np.pi * f * t)) * 0.5 + np.sin(2 * np.pi * f * 2 * t) * 0.2 for f in freqs)
    return x * np.exp(-t * 4) * 0.08
roots = [55.0, 55.0, 49.0, 41.2]; chords = [[220, 277, 330], [220, 277, 330], [196, 247, 294], [165, 208, 247]]
for b in range(a.bars):
    t0 = b * 4 * spb
    if b == 0:
        t = tt(4 * spb); add(t0, rng.standard_normal(len(t)) * (t / t[-1]) ** 2 * 0.05); continue
    for k in range(4): add(t0 + k * spb, kick(), 0.9)
    if b == 1: continue
    for k in (1, 3): add(t0 + k * spb, snare(), 0.5)
    for k in range(8): add(t0 + k * spb / 2 + spb / 2 * (k % 2 == 0) * 0, hat(), 0.8 if k % 2 else 0.4)
    r = roots[b % 4]; add(t0, bass(r, spb * 1.5)); add(t0 + 2.5 * spb, bass(r, spb))
    if b >= 4:
        c = chords[b % 4]
        for k in (0, 1.5, 2.5): add(t0 + k * spb, chord(c, spb * 0.9))
        if b % 4 == 0:  # fill on beats 3.5-4 of bars 4, 8, 12, 16
            for k in (2.5, 2.75, 3.0, 3.25, 3.5, 3.75): add(t0 + k * spb, snare(), 0.45)
out = np.tanh(out * 1.2) * 0.8
st = np.stack([out, out], 1).astype(np.float32)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', a.out], input=st.tobytes(), check=True)
print(f'{a.out}: {a.bars} bars @ {a.bpm} BPM = {a.bars*4*spb:.2f}s, bar 0 starts at 0.000s')
