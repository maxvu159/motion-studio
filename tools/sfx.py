# /// script
# requires-python = ">=3.9"
# dependencies = ["numpy"]
# ///
"""Synthesized, royalty-free SFX kit (48 kHz mono WAV).

    uv run tools/sfx.py projects/<slug>/local/sfx

key (typing), blip (UI ping), click (button), whoosh, boom (impact + sub), riser (2 bars @148bpm),
ticker (mechanical tape clatter), shutter, zap (glitch), hit (short sub hit for big words).
Everything is generated from noise and sines, so it is safe to commit and to publish.
"""
import numpy as np, wave, sys, os
SR=48000
OUT=sys.argv[1] if len(sys.argv)>1 else 'sfx'
os.makedirs(OUT,exist_ok=True)
rng=np.random.default_rng(7)
def save(name,x):
    x=np.clip(x,-1,1);w=wave.open(f'{OUT}/{name}.wav','w');w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
    w.writeframes((x*32767).astype(np.int16).tobytes());w.close()
def env(n,a,d):t=np.arange(n)/SR;return np.minimum(1,t/a)*np.exp(-t/d)
def lp(x,c):  # one-pole lowpass, c in Hz (array or scalar)
    c=np.broadcast_to(np.asarray(c,float),x.shape);a=np.exp(-2*np.pi*c/SR);y=np.zeros_like(x);s=0.
    for i in range(len(x)):s=a[i]*s+(1-a[i])*x[i];y[i]=s
    return y
def hp(x,c):return x-lp(x,c)
# key click
n=int(.035*SR);x=rng.standard_normal(n)*env(n,.0005,.006);x=hp(x,1800)*.9;x+=np.sin(2*np.pi*2200*np.arange(n)/SR)*env(n,.0003,.004)*.3;save('key',x*.7)
# ui blip (order fill)
n=int(.18*SR);t=np.arange(n)/SR;x=(np.sin(2*np.pi*1320*t)+.5*np.sin(2*np.pi*1980*t))*env(n,.002,.05);save('blip',x*.35)
# click (button)
n=int(.12*SR);t=np.arange(n)/SR;x=np.sin(2*np.pi*(900-500*t/.12)*t)*env(n,.001,.025)+hp(rng.standard_normal(n),3000)*env(n,.0005,.004)*.6;save('click',x*.6)
# whoosh
n=int(.55*SR);t=np.arange(n)/SR;e=np.sin(np.pi*np.minimum(1,t/.55))**2;nz=rng.standard_normal(n);x=lp(nz,300+5000*e)-lp(nz,120+800*e);save('whoosh',x*e*1.4)
# impact / boom
n=int(3.5*SR);t=np.arange(n)/SR;f=42+80*np.exp(-t*18);ph=2*np.cumsum(np.pi*f)/SR;x=np.sin(ph)*np.exp(-t/1.1)*.95
x+=lp(rng.standard_normal(n),900)*np.exp(-t/.08)*1.2+hp(rng.standard_normal(n),2500)*np.exp(-t/.025)*.4;save('boom',np.tanh(x*1.3)*.9)
# riser (2 bars)
n=int(3.25*SR);t=np.arange(n)/SR;p=t/t[-1];nz=rng.standard_normal(n);x=hp(lp(nz,400+9000*p**2),200+1500*p)*p**2.2
x+=np.sin(2*np.pi*np.cumsum(200+900*p**2)/SR)*p**3*.15;save('riser',x*.8)
# ticker tape clatter (2s of fast mechanical ticks)
n=int(2.6*SR);x=np.zeros(n);i=0
while i<n-2000:
    m=int(.012*SR);c=rng.standard_normal(m)*env(m,.0002,.0025);x[i:i+m]+=hp(c,1200)*(.5+.5*rng.random());i+=int(SR*(.028+.03*rng.random()))
save('ticker',lp(x,6000)*.8)
# shutter
n=int(.16*SR);x=np.zeros(n);c=hp(rng.standard_normal(1200),2000)*env(1200,.0002,.004);x[:1200]+=c;x[3600:4800]+=c*.7;save('shutter',x*.8)
# glitch zap
n=int(.2*SR);t=np.arange(n)/SR;sq=np.sign(np.sin(2*np.pi*(80+3000*rng.random(n)//300*1)*t));x=sq*env(n,.001,.05)*.25+hp(rng.standard_normal(n),4000)*env(n,.001,.03)*.3;save('zap',x)
# sub drop hit for big words
n=int(1.2*SR);t=np.arange(n)/SR;f=55+120*np.exp(-t*25);x=np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-t/.35)+hp(rng.standard_normal(n),1500)*np.exp(-t/.02)*.5;save('hit',np.tanh(x*1.5)*.8)
print('wrote', sorted(os.listdir(OUT)), 'to', OUT)
