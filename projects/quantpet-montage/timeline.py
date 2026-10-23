"""Quantpet concept film (reference project — script only, no media in the repo).

An archival hype montage: Margin Call cold open → "the old game" (1980s pits, Gekko, Black Monday,
Cramer, Lehman) → drop into retail/crypto memes → silence + typed question → recreated product UI on a
second drop → end card. 148 BPM. All picture/voice timings are in beats; speech in/out points came
from tools/words.py.

To rebuild it you need, in local/ (gitignored, NOT redistributable):
  local/footage/{old,retail,ai}/NN-*.mp4   gathered with the footage-hunt skill (see manifest.example.json)
  local/audio/vo_q.wav                     uvx edge-tts --voice en-US-ChristopherNeural --rate=-3% --pitch=-6Hz
                                           --text "What if the edge... was just a prompt?" --write-media vo_q.mp3
  local/sfx/                               uv run tools/sfx.py projects/quantpet-montage/local/sfx
  local/music.wav                          a licensed 148 BPM track; this cut used a drop at source 48.713s
Then: python3 timeline.py && node engines/canvas/render.js projects/quantpet-montage all
"""
import glob, os, sys
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../engines/canvas/lib'))
from montage import Timeline

tl = Timeline(__file__, bpm=148, brand='brands/demo', plugins=['projects/quantpet-montage/scenes/quantpet-ui.js'])
T, F = tl.T, tl.F
HERE = os.path.dirname(os.path.abspath(__file__))
O, RT, AI = 'local/footage/old', 'local/footage/retail', 'local/footage/ai'
SFX = 'local/sfx/'

def fx(group, name):
    """Footage file by its NN- prefix (hunters sometimes rename the slug)."""
    g = glob.glob(os.path.join(HERE, group, name[:3] + '*.mp4'))
    return g[0] if g else os.path.join(group, name)

# ---------------- COLD OPEN  k0-16
tl.sfx(0.0, SFX + 'ticker.wav', -8)
tl.shot('black', 0, 3)
tl.vo(0.40, fx(O, '01-margin-call.mp4'), 2.40, 5.25, 0)
tl.cap(0.40, 3.30, 'There are three ways to make a living in this business.', 'John Tuld · Margin Call (2011)', tt=3.05)
tl.clip(3, 9, fx(O, '01-margin-call.mp4'), 2.40 + (T(3) - 0.40), grade='bw', z0=1.16, z1=1.24)
tl.vo(T(9), fx(O, '01-margin-call.mp4'), 5.72, 6.45, 1)
tl.clip(9, 11, fx(O, '25-hft-orderflow.mp4'), 5.0, grade='cool', punch=True, tag='HFT · 9:30:00.001')
tl.words(9, 11, 'BE FIRST.', size=150)
tl.vo(T(11), fx(O, '01-margin-call.mp4'), 6.98, 7.85, 1)
tl.clip(11, 13.5, fx(O, '33-jim-simons.mp4'), 4.0, grade='bw', tag='RENAISSANCE · MEDALLION FUND')
tl.words(11, 13.5, 'BE SMARTER.', size=150)
tl.vo(T(13.5), fx(O, '01-margin-call.mp4'), 8.30, 9.05, 2)
tl.clip(13.5, 16, fx(O, '01-margin-call.mp4'), 8.30, grade='bw', z0=1.28, z1=1.36)
tl.words(13.5, 16, 'OR CHEAT.', size=150, col='#FF5B5B')
tl.flashes.append([F(9), 4, .5]); tl.flashes.append([F(11), 4, .5]); tl.flashes.append([F(13.5), 4, .5])

# ---------------- ACT 1  k16-40  "the old game"
tl.flashes.append([F(16), 6, .8]); tl.sfx(T(16), SFX + 'hit.wav', -4)
tl.clip(16, 17, fx(O, '08-ticker-machine.mp4'), 11.0, grade='sepia', tag='NEW YORK · 1867')
tl.clip(17, 18, fx(O, '03-pit-nymex.mp4'), 0.5, grade='sepia', mode='cardDark', cw=900)
tl.clip(18, 19, fx(O, '04-pit-cme.mp4'), 9.6, grade='sepia')
tl.clip(19, 20, fx(O, '05-desk-1980-phones.mp4'), 0.3, grade='sepia', tag='WALL ST · 1980')
tl.clip(20, 21, fx(O, '06-crt-1980-news.mp4'), 5.2, grade='cool', mode='cardDark', cw=980)
# Gekko: "greed," + "is good."
tl.clip(21, 23.4, fx(O, '02-gekko-greed.mp4'), 4.10 - (8.60 - T(21)), grade='sepia', z0=1.1, z1=1.14, tag='WALL STREET · 1987')
tl.clip(23.4, 25, fx(O, '02-gekko-greed.mp4'), 7.90 - (9.55 - T(23.4)), grade='sepia', z0=1.22, z1=1.26)
tl.vo(8.60, fx(O, '02-gekko-greed.mp4'), 4.10, 4.95, 1)
tl.vo(9.55, fx(O, '02-gekko-greed.mp4'), 7.90, 8.75, 1)
tl.cap(8.60, 10.4, 'Greed... is good.', 'Gordon Gekko · Wall Street (1987)', tt=9.9)
tl.clip(25, 26, fx(O, '23-wolf-wide.mp4'), 0.4, grade='pop', punch=True)
tl.clip(26, 27, fx(O, '22-wolf-chaos.mp4'), 3.4, grade='pop', punch=True)
tl.clip(27, 28, fx(O, '10-black-monday-dow-board.mp4'), 10.0, grade='none', mode='cardDark', cw=980, tag='OCT 19 · 1987')
tl.clip(28, 29, fx(O, '09-black-monday-anchor.mp4'), 3.2, grade='none')
tl.clip(29, 30, fx(O, '11-black-monday-floor.mp4'), 9.3, grade='sepia')
# Cramer
tl.clip(30, 33, fx(O, '15-cramer-bear-fine.mp4'), 3.98 - 0.10, grade='pop', tag='MAD MONEY · MAR 11 2008')
tl.vo(T(30) + 0.10, fx(O, '15-cramer-bear-fine.mp4'), 3.98, 5.30, 2)
tl.cap(T(30) + .1, T(33) + .3, 'Bear Stearns is fine!', 'Jim Cramer · CNBC', tt=T(30) + 1.3)
tl.sfx(T(32), SFX + 'riser.wav', -6)
tl.clip(33, 34, fx(O, '12-lehman-boxes-a.mp4'), 0.5, grade='cool', tag='LEHMAN · SEP 15 2008')
tl.clip(34, 35, fx(O, '14-evening-standard-2008.mp4'), 11.5, grade='cool', mode='card', cw=900)
tl.clip(35, 35.5, fx(O, '16-cnbc-limit-down.mp4'), 6.5, grade='none', punch=True)
tl.clip(35.5, 36, fx(O, '18-cnbc-nasdaq-wall.mp4'), 9.0, grade='none')
tl.clip(36, 36.5, fx(O, '27-hft-chart.mp4'), 5.4, grade='cool')
tl.clip(36.5, 37, fx(O, '13-lehman-boxes-b.mp4'), 7.0, grade='cool')
tl.clip(37, 38, fx(O, '28-bull-close.mp4'), 3.0, grade='bw', dim=.55)
tl.clip(38, 39, fx(O, '19-bigshort-goldman.mp4'), 4.0, grade='bw', dim=.55)
tl.clip(39, 40, fx(O, '24-bloomberg-terminal.mp4'), 6.5, grade='bw', dim=.6)
tl.words(37, 38, 'THE EDGE'); tl.words(38, 39, 'WAS NEVER'); tl.words(39, 40, 'YOURS.', col='#C8FF3C')
for k in (37, 38, 39): tl.sfx(T(k), SFX + 'hit.wav', -6)
tl.glitches.append([F(35), F(35) + 4, 26])


# ---------------- ACT 2  k40-70  "retail gets access"
tl.flashes.append([F(40), 6, 1]); tl.sfx(T(40), SFX + 'boom.wav', -5); tl.glitches.append([F(40), F(40) + 5, 30])
tl.clip(40, 41, fx(RT, '08-stonks-meme.mp4'), 0.2, grade='hot', punch=True)
tl.clip(41, 42, fx(RT, '03-gme-trader-hands-head.mp4'), 0.1, grade='pop', punch=True, tag='JAN 2021')
tl.clip(42, 43, fx(RT, '04-gme-3-to-347.mp4'), 6.6, grade='pop', punch=True)
tl.clip(43, 46, fx(RT, '01-roaring-kitty-i-like-the-stock.mp4'), 24.05, grade='pop', z0=1.0, z1=1.05, tag='U.S. CONGRESS · FEB 18 2021')
tl.vo(T(43) + .1, fx(RT, '01-roaring-kitty-i-like-the-stock.mp4'), 24.15, 25.12, 2)
tl.cap(T(43) + .1, T(46) + .2, 'I like the stock.', 'Keith Gill · "Roaring Kitty"', tt=T(43) + 1.0)
tl.clip(46, 47, fx(RT, '07-robinhood-app.mp4'), 0.5, grade='pop', punch=True)
tl.clip(47, 48, fx(RT, '05-wsb-phone-trading.mp4'), 4.0, grade='pop', punch=True)
tl.clip(48, 49, fx(RT, '09-this-is-fine.mp4'), 4.5, grade='pop', punch=True)
tl.clip(49, 50, fx(RT, '11-are-ya-winning-dad.mp4'), 3.0, grade='none', mode='card', cw=760)
tl.clip(50, 52, fx(RT, '02-elon-snl-its-a-hustle.mp4'), 9.75, grade='pop', z0=1.15, z1=1.2, tag='SNL · MAY 2021')
tl.vo(T(50) + .05, fx(RT, '02-elon-snl-its-a-hustle.mp4'), 9.80, 10.70, 1)
tl.cap(T(50) + .05, T(52) + .1, 'Yeah, it\'s a hustle.', 'Elon Musk · SNL', tt=T(50) + .8)
tl.clip(52, 53, fx(RT, '37-doge-shuttle-moon.mp4'), 19.0, grade='pop', punch=True)
tl.vo(T(52) + .02, fx(RT, '02-elon-snl-its-a-hustle.mp4'), 14.74, 15.42, 1)
tl.clip(53, 54, fx(RT, '13-pizza-laszlo-desk.mp4'), 1.2, grade='pop', tag='MAY 22 2010 · 10,000 BTC → 2 PIZZAS')
tl.clip(54, 55, fx(RT, '14-pizza-party.mp4'), 3.2, grade='pop', punch=True)
tl.clip(55, 56, fx(RT, '15-btc-100k-bbc.mp4'), 7.9, grade='pop', punch=True, tag='DEC 2024 · $100,000')
tl.clip(56, 57, fx(RT, '38-laser-eyes.mp4'), 3.2, grade='hot', punch=True)
tl.clip(57, 59, fx(RT, '12-bitconnect-scream.mp4'), 10.9, grade='hot', z0=1.05, z1=1.18)
tl.vo(T(57), fx(RT, '12-bitconnect-scream.mp4'), 10.9, 12.3, -1)
tl.glitches.append([F(57), F(57) + 4, 22])
tl.clip(59, 60, fx(RT, '27-interstellar-bitcoin.mp4'), 4.2, grade='pop')
tl.vo(T(59.5), fx(RT, '36-saylor-going-up-forever-laura.mp4'), 6.10, 7.48, 2)
tl.cap(T(59.5), T(63), 'It\'s going up forever, Laura.', 'Michael Saylor', tt=T(59.5) + 1.3)
tl.clip(60, 61, fx(RT, '30-stock-3d-candles.mp4'), 2.0, grade='pop', punch=True)
tl.clip(61, 62, fx(RT, '17-ftx-ftt-chart.mp4'), 5.8, grade='none', punch=True, tag='NOV 8 2022')
tl.clip(62, 62.5, fx(RT, '18-ftx-logo.mp4'), 7.1, grade='none')
tl.clip(62.5, 63, fx(RT, '28-stock-red-crash-arrow.mp4'), 2.0, grade='hot')
tl.clip(63, 64, fx(RT, '20-sbf-arrest.mp4'), 3.2, grade='cool', punch=True)
tl.clip(64, 64.5, fx(RT, '22-do-kwon-arrest.mp4'), 4.2, grade='cool')
tl.clip(64.5, 65, fx(RT, '10-bogdanoff-dump-it.mp4'), 21.0, grade='hot')
tl.clip(65, 66, fx(RT, '25-hyperliquid-40x-headline.mp4'), 1.6, grade='none', mode='card', cw=1000, tag='HYPERLIQUID · 2025')
tl.glitches.append([F(61), F(61) + 4, 22]); tl.glitches.append([F(65), F(65) + 3, 18])
tl.clip(66, 67, fx(RT, '33-robinhood-options-loss.mp4'), 22.7, grade='hot', dim=.5, mode='cardDark', cw=560)
tl.clip(67, 68, fx(RT, '40-daytrader-candles.mp4'), 13.0, grade='hot', dim=.5, z0=1.35, z1=1.4)
tl.clip(68, 69, fx(RT, '35-sad-pepe.mp4'), 0.5, grade='none', dim=.5, mode='card', cw=760)
tl.clip(69, 70, fx(RT, '28-stock-red-crash-arrow.mp4'), 3.5, grade='hot', dim=.55)
tl.words(66, 67, 'WE GOT'); tl.words(67, 68, 'ACCESS.'); tl.words(68, 69, 'NOT THE'); tl.words(69, 70, 'EDGE.', col='#FF5B5B')
for k in (66, 67, 68, 69): tl.sfx(T(k), SFX + 'hit.wav', -6)
tl.sfx(T(70) - .02, SFX + 'zap.wav', -8)
# ---------------- SILENCE k70-76
tl.shot('cursor', 70, 76, text='What if the edge was just a prompt?', td=.25, tdur=1.7)
tl.vo(T(70) + 0.20, 'local/audio/vo_q.wav', 0, None, 0, 'vo')
for i in range(35): tl.sfx(T(70) + .25 + 1.7 * (i + .5) / 35, SFX + 'key.wav', -12)
# ---------------- ACT 3 k76-108
tl.shot('quantpet-ui', 76, 108, act3=T(76))
tl.flashes.append([F(76), 5, .7]); tl.sfx(T(76), SFX + 'boom.wav', -6)
tl.vo(T(77), fx(AI, '06-jensen-iphone-moment.mp4'), 6.40, 9.28, 0)
tl.cap(T(77), T(77) + 3.1, 'The iPhone moment of AI has started.', 'Jensen Huang · NVIDIA GTC 2023', tt=T(77) + 2.8)
L = 86
def eo(t): return 1 - (1 - t) ** 3
for i in range(1, L + 1):  # char i appears when eo((b-.25)/6.6) >= i/L
    p = 1 - (1 - i / L) ** (1 / 3); b = .25 + 6.6 * p; tl.sfx(T(76 + b), SFX + 'key.wav', -14)
tl.sfx(T(84), SFX + 'click.wav', -6); tl.sfx(T(84.3), SFX + 'whoosh.wav', -10)
# machine-edge inserts while Quantpet "thinks"
tl.clip(84.4, 84.8, fx(AI, '02-kasparov-head-in-hands-video.mp4'), 4.6, grade='bw', mode='cardDark', cw=820, tag='DEEP BLUE · 1997')
tl.clip(84.8, 85.2, fx(AI, '04-lee-sedol-defeat.mp4'), 4.0, grade='cool', tag='ALPHAGO · 2016')
tl.clip(85.2, 85.6, fx(AI, '08-gpu-chips.mp4'), 4.5, grade='cool')
for k in (84.4, 84.8, 85.2): tl.sfx(T(k), SFX + 'shutter.wav', -8)
tl.sfx(T(90.3), SFX + 'whoosh.wav', -10); tl.sfx(T(96.3), SFX + 'whoosh.wav', -12); tl.sfx(T(98), SFX + 'click.wav', -3); tl.sfx(T(100.2), SFX + 'whoosh.wav', -12)
for i in range(5): tl.sfx(T(100 + i * .5), SFX + 'blip.wav', -6)
# final words over machine-age shots
tl.clip(104, 105, fx(AI, '13-typing-dark.mp4'), 0.5, grade='cool', dim=.45, punch=True)
tl.clip(105, 106, fx(AI, '15-neural-net-abstract.mp4'), 2.5, grade='cool', dim=.4, punch=True)
tl.clip(106, 107, fx(AI, '17-saturn-ignition.mp4'), 4.5, grade='hot', dim=.4, punch=True)
tl.clip(107, 108, fx(AI, '18-saturn-liftoff.mp4'), 28.5, grade='pop', dim=.35, punch=True)
tl.words(104, 105, 'PROMPT.'); tl.words(105, 106, 'BACKTEST.'); tl.words(106, 107, 'DEPLOY.'); tl.words(107, 108, 'REPEAT.', col='#C8FF3C')
for k in (104, 105, 106, 107): tl.sfx(T(k), SFX + 'hit.wav', -6); tl.flashes.append([F(k), 3, .35])
# ---------------- END
tl.shot('quantpet-end', 108, 0, T1=50.0)
tl.flashes.append([F(108), 8, .9]); tl.sfx(T(108), SFX + 'boom.wav', -2)

tl.punch(0, 200)
tl.music('local/music.wav', segments=[{'t': 0.0, 'a': 6.551, 'b': 6.551 + T(70)}, {'t': T(76), 'a': 48.713, 'b': 48.713 + T(108) - T(76)},
                                      {'t': T(108), 'a': 61.686, 'b': 62.6}], fade_out=0.8)
tl.build(total=50.0)
