# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy", "scipy"]
# ///
"""Measure how well a finished video's cuts sit on the music.

    uv run tools/sync_check.py final.mp4 --bpm 126 --beats 4,8,16,20 [--offset 0] [--tol 0.034]

For each designed cut (in beats from video start, music beat 0 at --offset seconds) it reports
the nearest detected visual cut (ffmpeg scene score) and the nearest kick onset, in ms.
Also checks every downbeat has a kick (catches broken music edits).
Exit code 1 if any designed cut misses its visual cut or kick by more than --tol (default one 30fps frame).
"""
import argparse, subprocess, re, sys
import numpy as np
from scipy.signal import stft

ap = argparse.ArgumentParser()
ap.add_argument('video'); ap.add_argument('--bpm', type=float, required=True); ap.add_argument('--beats', required=True)
ap.add_argument('--offset', type=float, default=0.0); ap.add_argument('--tol', type=float, default=0.034)
ap.add_argument('--scene', type=float, default=0.12)
a = ap.parse_args()
spb = 60 / a.bpm; want = [float(x) for x in a.beats.split(',')]

log = subprocess.run(['ffmpeg', '-hide_banner', '-i', a.video, '-vf', f"select='gt(scene,{a.scene})',showinfo", '-an', '-f', 'null', '-'],
                     capture_output=True, text=True).stderr
cuts = np.array([float(x) for x in re.findall(r'pts_time:([0-9.]+)', log)])
SR = 44100
raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-i', a.video, '-vn', '-ac', '1', '-ar', str(SR), '-f', 'f32le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, np.float32); hop = 128; fps = SR / hop
f, t, Z = stft(x, SR, nperseg=1024, noverlap=1024 - hop)
kf = np.r_[0, np.maximum(0, np.diff(np.log1p(np.abs(Z[(f >= 35) & (f < 200)]) * 10), axis=1)).sum(0)]
thr = np.percentile(kf, 95)
def kick_near(T, win=0.08):
    """strongest low-band onset within ±win of T; None if nothing kick-like there"""
    i0, i1 = max(0, int((T - win) * fps)), min(len(kf), int((T + win) * fps) + 1)
    if i1 <= i0: return None
    k = i0 + int(np.argmax(kf[i0:i1]))
    return k / fps if kf[k] >= thr else None

bad = 0
print(f'{"beat":>6} {"time":>8} {"visual":>9} {"kick":>9}')
for b in want:
    T = a.offset + b * spb
    dv = (cuts[np.argmin(abs(cuts - T))] - T) if len(cuts) else np.inf
    kn = kick_near(T); dk = (kn - T) if kn is not None else np.inf
    ok = abs(dv) <= a.tol and abs(dk) <= a.tol
    bad += not ok
    print(f'{b:6.2f} {T:7.3f}s {dv*1000:+7.0f}ms {dk*1000:+7.0f}ms {"" if ok else "  <-- off (inf = no kick there)"}')
dur = len(x) / SR; nbar = int((dur - a.offset) / (4 * spb))
miss = [k for k in range(0, nbar) if kick_near(a.offset + 4 * k * spb, a.tol) is None]
print('downbeats without a kick:', miss or 'none')
print('PASS' if not bad else f'FAIL: {bad} cut(s) off by more than {a.tol*1000:.0f}ms')
sys.exit(1 if bad else 0)
