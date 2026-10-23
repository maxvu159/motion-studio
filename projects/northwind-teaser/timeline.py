"""Launch teaser for the demo brand: 4 words on the four kicks of bar 1, particles assemble the
mark on the groove (bar 2), lockup from bar 3 through the chorus entry (bar 4).
Music: the generated test loop started at its bar 1 (1.905s), so video beat 0 = a kick."""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../engines/canvas/lib'))
from montage import Timeline

tl = Timeline(__file__, bpm=126, brand='brands/demo', plugins=['engines/canvas/templates/launch-teaser/teaser.js'], grain=0.06)
tl.shot('teaser', 0, 20, words=['ONE', 'VAULT.', 'EVERY', 'MARKET.'], name='Northwind', tagline='Vaults for every market.', cta='Coming soon', phase=[4, 4, 12])
tl.flash(4, 4, 0.35); tl.flash(8, 6, 0.6)
tl.music('local/music.wav', start=1.905, fade_out=1.2)
tl.build(total=round(tl.T(20), 3))
