"""Montage grammar demo on placeholder footage: typed cold open, beat-cut clips with grades, tags and
captions, slammed words on the last bar, a cursor beat in the silence, brand title card.
Music: generated test loop (bar 0 quiet, bar 1 kicks, groove from bar 2, chorus from bar 4)."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../engines/canvas/lib'))
from montage import Timeline

tl = Timeline(__file__, bpm=126, brand='brands/demo')
T = tl.T
F = 'local/footage/'
tl.shot('black', 0, 4)
tl.cap(0.3, T(4), 'Every market has one rule.', who='Cold open · typed caption', tt=T(3))
clips = ['a-testsrc', 'b-mandelbrot', 'c-life', 'd-cellauto', 'e-bars', 'f-rgb']
grades = ['sepia', 'bw', 'pop', 'cool', 'hot', 'none']
for i in range(8):      # bar 1-2: one clip per beat on the kicks
    tl.clip(4 + i, 5 + i, F + clips[i % 6] + '.mp4', 0.5 + i * 0.3, grade=grades[i % 6], punch=True, tag='ARCHIVE · 19%d0' % (6 + i % 4) if i % 3 == 0 else None)
tl.punch(4, 16)
tl.clip(12, 14, F + 'c-life.mp4', 1.0, grade='pop', mode='cardDark', cw=980, cap='a framed clip with a typed card caption')
tl.clip(14, 16, F + 'b-mandelbrot.mp4', 2.0, grade='cool', dim=0.5)
tl.words(14, 15, 'THE EDGE'); tl.words(15, 16, 'IS YOURS.', col='accent')
tl.glitch(8, 4, 26); tl.flash(8, 6, 0.8)
tl.shot('cursor', 16, 20, text='What if the edge was just a prompt?', td=0.2, tdur=1.4)
tl.shot('title', 20, 28, lines=['Northwind', 'Your edge, automated.'], size=110, accentLine=1)
tl.flash(20, 6, 0.6)
tl.music('local/music.wav', start=0.0, fade_out=1.2)
tl.build(total=round(T(28), 3))
