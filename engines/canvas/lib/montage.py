"""Timeline builder for the canvas engine (montage, teaser and any beat-cut edit).

A project's timeline.py does:

    import sys; sys.path.insert(0, '<repo>/engines/canvas/lib'); from montage import Timeline
    tl = Timeline(__file__, bpm=148, brand='brands/demo', plugins=['engines/canvas/templates/launch-teaser/teaser.js'])
    T = tl.T                                    # beats -> seconds
    tl.clip(16, 17, 'local/footage/ticker.mp4', 11.0, grade='sepia', tag='NEW YORK · 1867')
    tl.vo(T(21), 'local/footage/gekko.mp4', 4.10, 4.95, db=1)
    tl.cap(8.6, 10.4, 'Greed... is good.', who='Gordon Gekko · Wall Street (1987)', tt=9.9)
    tl.words(37, 38, 'THE EDGE')
    tl.shot('cursor', 70, 76, text='What if the edge was just a prompt?')
    tl.music('local/music.wav', start=6.551)   # or segments=[...]
    tl.build(total=50.0)

Everything is in BEATS of the music (k), except caption/vo times which are seconds (use T(k)).
build() extracts each clip's frames (only the frames used) into local/shots/<id>/, then writes
edl.json (read by runtime/comp.html) and cues.json (read by tools/mix.py).
"""
import hashlib, json, os, subprocess

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../..'))


class Timeline:
    def __init__(self, timeline_file, bpm, fps=30, w=1920, h=1080, brand='brands/demo', plugins=(), grain=0.13, vignette=True):
        self.dir = os.path.dirname(os.path.abspath(timeline_file))
        self.bpm, self.fps, self.w, self.h = bpm, fps, w, h
        self.spb = 60 / bpm
        self.brand, self.plugins, self.grain, self.vignette = brand, list(plugins), grain, vignette
        self.shots, self.captions, self.big, self.flashes, self.glitches, self.cues = [], [], [], [], [], []
        self._music, self.punch_beats = None, []

    # ---- time
    def T(self, k):
        return k * self.spb

    def F(self, k):
        return round(self.T(k) * self.fps)

    def _path(self, p):
        return p if os.path.isabs(p) else os.path.join(self.dir, p)

    def _rel(self, p):
        """Path as written into cues.json: relative to the project folder (portable across machines)."""
        return os.path.relpath(self._path(p), self.dir)

    # ---- picture
    def clip(self, k0, k1, file, src, **o):
        """Footage shot from beat k0 to k1, starting at `src` seconds in `file`.
        o: grade (bw|sepia|pop|cool|hot|none), mode (card|cardDark), cw, cap, tag, dim, punch, z0, z1, dx, dy, speed."""
        self.shots.append(dict(type='clip', k0=k0, k1=k1, file=self._path(file), src=src, **o))

    def shot(self, type, k0, k1, **fields):
        """Any non-footage shot: 'black', 'title' (lines, size, accentLine), 'cursor' (text, td, tdur),
        or a plugin type (fields are passed through to the plugin)."""
        self.shots.append(dict(type=type, k0=k0, k1=k1, **fields))

    def cap(self, t0, t1, text, who=None, tt=None):
        """Typed caption (seconds). tt = when typing finishes; default t1."""
        self.captions.append(dict(t0=t0, t1=t1, text=text, who=who, tt=tt or t1))

    def words(self, k0, k1, text, **o):
        """Big slammed line on the beat. o: size, col ('accent'|'negative'|hex), bg, bga, y."""
        self.big.append(dict(t0=self.T(k0), t1=self.T(k1), text=text, **o))

    def flash(self, k, frames=4, a=0.5):
        self.flashes.append([self.F(k), frames, a])

    def glitch(self, k, frames=4, amount=24):
        self.glitches.append([self.F(k), self.F(k) + frames, amount])

    def punch(self, k0, k1):
        """Beats on which clips with punch=True get a zoom bump."""
        self.punch_beats += [self.T(k) for k in range(int(k0), int(k1))]

    # ---- sound
    def vo(self, t, file, a, b=None, db=0, fx='film'):
        """Speech/sound from a file placed at t seconds. fx: film (archival), vo (narration), none."""
        self.cues.append(dict(t=t, file=self._rel(file), a=a, b=b, db=db, fx=fx))

    def sfx(self, t, file, db=0):
        self.cues.append(dict(t=t, file=self._rel(file), a=0, b=None, db=db, fx='none'))

    def music(self, file, start=0.0, segments=None, fade_in=0.03, fade_out=1.0):
        self._music = dict(file=self._rel(file), start=start, fade_in=fade_in, fade_out=fade_out)
        if segments: self._music['segments'] = segments

    # ---- output
    def build(self, total):
        out, nframes = [], round(total * self.fps)
        for s in self.shots:
            s = dict(s)
            s['t0'] = round(s.pop('T0') * self.fps) if 'T0' in s else self.F(s['k0'])
            s['t1'] = round(s.pop('T1') * self.fps) if 'T1' in s else self.F(s['k1'])
            s.pop('k0', None); s.pop('k1', None)
            if s['type'] == 'clip':
                key = f"{s['file']}|{s['src']:.3f}|{s['t0']}|{s['t1']}|{s.get('speed', 1)}"
                s['id'] = hashlib.md5(key.encode()).hexdigest()[:10]
                n = int((s['t1'] - s['t0']) * s.get('speed', 1)) + 1
                d = os.path.join(self.dir, 'local/shots', s['id'])
                if not os.path.exists(os.path.join(d, f'{n:04d}.jpg')):
                    os.makedirs(d, exist_ok=True)
                    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-ss', f"{max(0, s['src']):.3f}", '-i', s['file'], '-frames:v', str(n),
                                    '-vf', f"fps={self.fps},scale='min(1920,iw)':-2", '-q:v', '2', os.path.join(d, '%04d.jpg')], check=True)
                got = len([x for x in os.listdir(d) if x.endswith('.jpg')])
                if got < n: print(f"WARN {os.path.basename(s['file'])}: only {got}/{n} frames from {s['src']}s (clip too short?)")
                s['nf'] = min(n, got); s.pop('file')
            out.append(s)
        edl = dict(fps=self.fps, w=self.w, h=self.h, bpm=self.bpm, total=nframes, brand=self.brand, plugins=self.plugins,
                   grain=self.grain, vignette=self.vignette, punch=self.punch_beats, shots=sorted(out, key=lambda s: s['t0']),
                   captions=self.captions, big=self.big, flash=self.flashes, glitch=self.glitches, fadeOut=[nframes - 30, nframes])
        json.dump(edl, open(os.path.join(self.dir, 'edl.json'), 'w'))
        cues = dict(total=total, cues=self.cues, lufs=-14)
        if self._music: cues['music'] = self._music
        json.dump(cues, open(os.path.join(self.dir, 'cues.json'), 'w'), indent=1)
        print(f'{len(out)} shots, {nframes} frames ({total}s) -> edl.json, cues.json')
        return edl
