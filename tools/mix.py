# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy", "scipy"]
# ///
"""Mix music + voice clips + SFX from a cue sheet, duck music under speech, normalise.

    uv run tools/mix.py projects/<slug>/cues.json projects/<slug>/local/mix.wav

cues.json (paths relative to the json file):
{
  "total": 36.2,                       # seconds; output is cut/padded to this
  "music": {"file": "local/music.wav", "start": 0.0, "gain_db": 0,
            "fade_in": 0.03, "fade_out": 1.2,
            "segments": [{"t": 0, "a": 6.55, "b": 34.9}, {"t": 30.8, "a": 48.7, "b": 61.7}]},
                                       # segments optional: place source [a,b] at video time t
  "cues": [{"t": 0.4, "file": "local/clip.mp4", "a": 2.4, "b": 5.25, "db": 0, "fx": "film"},
           {"t": 3.6, "file": "local/sfx/hit.wav", "db": -6, "fx": "none"}],
                                       # fx: none (as is) | film (archival speech: band-pass, compress, level)
                                       #     | vo (narration: high-pass + light room)
  "duck_db": -7,                       # music reduction while any film/vo cue plays
  "lufs": -14                          # integrated loudness target (X/YouTube friendly)
}
Mixes are checked by numbers (loudness, peaks), never by ear — say so when you report.
"""
import json, os, subprocess, sys
import numpy as np
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
cfg_path, out_path = sys.argv[1], sys.argv[2]
cfg = json.load(open(cfg_path)); base = os.path.dirname(os.path.abspath(cfg_path))
P = lambda p: p if os.path.isabs(p) else os.path.join(base, p)
total = float(cfg['total']); N = int(total * SR) + SR

def load(path, a=0.0, b=None):
    cmd = ['ffmpeg', '-loglevel', 'error', '-ss', str(a)] + (['-t', str(b - a)] if b else []) + ['-i', P(path), '-vn', '-ac', '2', '-ar', str(SR), '-f', 'f32le', '-']
    return np.frombuffer(subprocess.run(cmd, capture_output=True).stdout, np.float32).reshape(-1, 2).copy()
def fade(x, fi, fo):
    a, b = min(len(x), int(fi * SR)), min(len(x), int(fo * SR))
    if a: x[:a] *= np.linspace(0, 1, a)[:, None]
    if b: x[-b:] *= np.linspace(1, 0, b)[:, None]
    return x
hp = lambda x, f: sosfilt(butter(2, f, 'hp', fs=SR, output='sos'), x, axis=0)
lp = lambda x, f: sosfilt(butter(2, f, 'lp', fs=SR, output='sos'), x, axis=0)
rng = np.random.default_rng(3)
def room(x, dur=1.4, wet=0.16):
    n = int(dur * SR); tt = np.arange(n) / SR
    ir = lp(rng.standard_normal((n, 2)) * np.exp(-tt / (dur / 6.9))[:, None], 6000); ir /= np.sqrt((ir ** 2).sum(0))
    y = np.stack([fftconvolve(x[:, i], ir[:, i]) for i in range(2)], 1)
    o = np.zeros_like(y); o[:len(x)] += x * (1 - wet); o += y * wet * 2.2; return o
def comp(x, thr=0.2, ratio=3):
    env = np.convolve(np.abs(x).max(1), np.ones(480) / 480, 'same')
    g = np.where(env > thr, (thr + (env - thr) / ratio) / np.maximum(env, 1e-9), 1); return x * g[:, None]
music = np.zeros((N, 2)); voice = np.zeros((N, 2)); fx = np.zeros((N, 2))
def put(buf, t, x):
    i = int(round(t * SR)); j = min(N, i + len(x))
    if j > i: buf[i:j] += x[:j - i]

m = cfg.get('music')
if m:
    g = 10 ** (m.get('gain_db', 0) / 20)
    segs = m.get('segments') or [{'t': 0.0, 'a': m.get('start', 0.0), 'b': m.get('start', 0.0) + total}]
    for k, s in enumerate(segs):
        x = load(m['file'], s['a'], s['b'])
        put(music, s['t'], fade(x, m.get('fade_in', 0.03) if k == 0 else 0.004, 0.02) * g)
for c in cfg.get('cues', []):
    x = load(c['file'], c.get('a', 0) or 0, c.get('b'))
    kind = c.get('fx', 'none'); g = 10 ** (c.get('db', 0) / 20)
    if kind == 'none': put(fx, c['t'], x * g); continue
    x = fade(x.mean(1, keepdims=True).repeat(2, 1), 0.012, 0.04)
    x = comp(hp(lp(x, 9000), 110)) if kind == 'film' else room(hp(x, 90))
    x = x / max(np.abs(x).max(), 1e-6) * 0.7 * g
    put(voice, c['t'], x)
act = np.convolve((np.abs(voice).max(1) > 0.01).astype(float), np.ones(int(0.12 * SR)) / int(0.12 * SR), 'same')
duck = 1 - (1 - 10 ** (cfg.get('duck_db', -7) / 20)) * np.clip(act * 3, 0, 1)
mix = music * duck[:, None] + voice + fx * 0.9
mix = mix[:int(total * SR)]
if m and m.get('fade_out'):
    n = int(m['fade_out'] * SR); mix[-n:] *= np.linspace(1, 0, n)[:, None]
mix /= max(1, np.abs(mix).max() / 0.98)
tmp = out_path + '.raw.wav'
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2', '-i', '-', tmp], input=mix.astype(np.float32).tobytes(), check=True)
subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', tmp, '-af',
                f"loudnorm=I={cfg.get('lufs', -14)}:TP=-1.5:LRA=11,alimiter=limit=0.89:level=false", '-ar', str(SR), out_path], check=True)
os.remove(tmp)
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', out_path, '-af', 'ebur128=peak=true', '-f', 'null', '-'], capture_output=True, text=True).stderr
lines = [l.strip() for l in st.splitlines() if l.strip().startswith(('I:', 'Peak:'))]
print('mix ->', out_path, '|', ' '.join(lines[-2:]))
