/*
 * Quantpet product UI + end card for the canvas runtime (reference project, concept film).
 * Shot types: 'quantpet-ui' (needs sh.act3 = seconds where the UI section starts) and 'quantpet-end'.
 * Kept close to the original hand-built version: an app drawn in canvas with a 2D camera (cam keys in
 * beats), motion blur via MS.blur, typed prompt, streamed strategy card, backtest curve, order fills.
 * The product palette below is the PRODUCT's UI (not the brand kit) — a recreated app keeps its own look.
 */
(() => {
const { cl, lerp, eio, eo, eo5, hash, rr, txt, spaced, wrap } = MS;
let ctx, W, H, FPS, F, SPB, ACT3;
const C={bg:'#07080A',panel:'#0D0F12',panel2:'#12151A',line:'#1E232B',text:'#ECEFF3',dim:'#7D8693',dim2:'#4A515C',
  lime:'#C8FF3C',green:'#2EE68F',red:'#FF5B5B',paper:'#ECEAE4',ink:'#111'};
// ---------- pixel pet
const PET=[
'..x..........x..',
'.xxx........xxx.',
'.xxxx......xxxx.',
'.xxxxxxxxxxxxxx.',
'xxxxxxxxxxxxxxxx',
'xxxxxxxxxxxxxxxx',
'xxxeexxxxxxeexxx',
'xxxeexxxxxxeexxx',
'xxxxxxxxxxxxxxxx',
'xxxxxxmxxmxxxxxx',
'xxxxxxxmmxxxxxxx',
'.xxxxxxxxxxxxxx.',
'..xxxxxxxxxxxx..'];
function drawPet(x,y,px,opt={}){ // x,y top-left
  const blink=opt.blink||0, col=opt.col||C.lime, eye=opt.eye||'#07080A', asm=opt.asm; // asm: assemble progress 0..1
  for(let r=0;r<PET.length;r++)for(let c=0;c<16;c++){const ch=PET[r][c];if(ch==='.')continue;
    let fill=col; if(ch==='e'){fill=(blink&&r===6)?col:eye;} if(ch==='m')fill=eye;
    let dx=x+c*px,dy=y+r*px,a=1;
    if(asm!==undefined){const k=r*16+c,d=hash(k*3.1),p=cl((asm-d*.45)/.55);const e=eo5(p);
      const sx=x+(hash(k*7.7)-.5)*px*70,sy=y+(hash(k*5.3)-.5)*px*40;dx=lerp(sx,dx,e);dy=lerp(sy,dy,e);a=cl(p*3);}
    ctx.globalAlpha=a;ctx.fillStyle=fill;ctx.fillRect(dx,dy,px+.6,px+.6);}
  ctx.globalAlpha=1;}
// ---------- QUANTPET APP
const PROMPT='Long BTC when funding flips negative, hedge with short NVDA. Keep drawdown under 8%.';
const ROWS=[['BTC-PERP','LONG','3x','0.42','118,240.0'],['NVDA-PERP','SHORT','1.5x','64','188.42'],['ETH-PERP','LONG','2x','5.10','4,412.6'],
  ['HYPE-PERP','LONG','2x','820','41.82'],['TSLA-PERP','SHORT','1x','30','431.10']];
function curve(n,seed,drift,vol){const a=[0];let v=0;for(let i=1;i<n;i++){v+=drift+(hash(i*1.7+seed)-.5)*vol+(hash(i*.31+seed*3)-.5)*vol*.6;a.push(v);}return a;}
const EQ=curve(220,4,.0105,.07),BM=curve(220,9,.0055,.16);
function cam(b){ // returns [cx,cy,zoom]
  const K=[[0,640,880,1.82],[7.6,650,885,1.9],[8.4,700,560,1.32],[13.6,700,600,1.42],[14.4,1560,350,1.75],[19.4,1540,360,1.85],[20.4,960,540,1.0],[23.6,960,540,1.04],[24.3,1555,820,1.62],[28,1555,830,1.7],[28.01,960,540,1.0],[33,960,540,1.08]];
  let i=0;while(i<K.length-1&&b>K[i+1][0])i++;const a=K[i],c=K[Math.min(i+1,K.length-1)];
  const hold=a===c?0:cl((b-a[0])/(c[0]-a[0]));
  // moves happen in first 0.8 beat after key if keys are close, else smooth
  const span=c[0]-a[0];const e=span<1.2?eio(hold):hold; // short spans = moves; long spans = slow drift
  return [lerp(a[1],c[1],e),lerp(a[2],c[2],e),lerp(a[3],c[3],e)];}
function chip(x,y,s,fg,bg,font=`600 20px ${F}`){ctx.font=font;const w=ctx.measureText(s).width+24;rr(x,y,w,34,8);ctx.fillStyle=bg;ctx.fill();txt(s,x+12,y+24,font,fg);return w;}
function drawApp(b,f){
  ctx.fillStyle=C.bg;ctx.fillRect(-2000,-2000,6000,6000);
  // sidebar
  ctx.fillStyle=C.panel;ctx.fillRect(0,0,88,H);ctx.fillStyle=C.line;ctx.fillRect(88,0,1,H);
  drawPet(20,26,3,{blink:(b%7>6.7)});
  for(let i=0;i<5;i++){rr(26,120+i*64,36,36,10);ctx.fillStyle=i===0?'#1A1F26':'transparent';ctx.fill();ctx.strokeStyle=i===0?'#2A313B':'#1B2027';ctx.lineWidth=1.5;ctx.stroke();}
  // topbar
  ctx.fillStyle=C.line;ctx.fillRect(88,72,W,1);
  txt('quantpet',116,47,`700 30px ${F}`,C.text);
  txt('Strategies',300,45,`500 20px ${F}`,C.text);txt('Backtests',420,45,`500 20px ${F}`,C.dim);txt('Portfolio',532,45,`500 20px ${F}`,C.dim);
  const live=b>=22;
  txt('Equity',1380,32,`500 15px ${F}`,C.dim);
  const eq=25000+(b>24?cl((b-24)/8)*1284.55:0);
  txt('$'+eq.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),1380,56,`600 22px ${F}`,C.text);
  rr(1620,20,260,36,18);ctx.fillStyle='#0F1A12';ctx.fill();ctx.strokeStyle='#1F3A26';ctx.stroke();
  ctx.fillStyle=C.green;ctx.beginPath();ctx.arc(1642,38,6,0,7);ctx.fill();txt('Hyperliquid · Mainnet',1658,45,`500 18px ${F}`,'#BFEFD0');
  // chat column
  const CX0=120,CX1=1180;
  // input
  const typing=cl((b-.25)/6.6);const nch=b<8?Math.floor(eo(typing)*PROMPT.length*1.0):0;
  const ib={x:160,y:890,w:980,h:112};rr(ib.x,ib.y,ib.w,ib.h,22);ctx.fillStyle=C.panel2;ctx.fill();
  ctx.strokeStyle=b<8?'#3A4A1E':C.line;ctx.lineWidth=2;ctx.stroke();
  if(b<8){const s=PROMPT.slice(0,nch);const lines=wrap(s,`500 26px ${F}`,820);
    if(!s){txt('Describe a strategy…',ib.x+28,ib.y+46,`500 26px ${F}`,C.dim2);}
    lines.slice(-2).forEach((ln,i)=>txt(ln,ib.x+28,ib.y+46+i*38,`500 26px ${F}`,C.text));
    const last=lines.length?lines[lines.length-1]:'';ctx.font=`500 26px ${F}`;const lw=ctx.measureText(last).width;
    const ly=ib.y+46+(Math.min(lines.length,2)-1)*38;if(((f>>3)&1)||nch<PROMPT.length){ctx.fillStyle=C.lime;ctx.fillRect(ib.x+28+lw+3,(lines.length?ly:ib.y+46)-24,14,30);}
  } else txt('Ask Quantpet to tweak, backtest or deploy…',ib.x+28,ib.y+64,`500 24px ${F}`,C.dim2);
  // send button
  const press=b>=7.7&&b<8.3?1-Math.abs(b-8)/.3:0;
  ctx.fillStyle=C.lime;ctx.beginPath();ctx.arc(ib.x+ib.w-56,ib.y+ib.h/2,30-press*4,0,7);ctx.fill();
  ctx.strokeStyle='#0A0B0D';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(ib.x+ib.w-56,ib.y+ib.h/2+12);ctx.lineTo(ib.x+ib.w-56,ib.y+ib.h/2-12);ctx.moveTo(ib.x+ib.w-66,ib.y+ib.h/2-2);ctx.lineTo(ib.x+ib.w-56,ib.y+ib.h/2-12);ctx.lineTo(ib.x+ib.w-46,ib.y+ib.h/2-2);ctx.stroke();
  // pet next to input
  if(b<8.6){const bob=Math.sin(b*Math.PI)*3;drawPet(ib.x-2,ib.y-74+bob,3.2,{blink:(b%4>3.75)});
    txt(b<7.8?'listening…':'on it.',ib.x+64,ib.y-44,`500 18px ${F}`,C.dim);}
  // empty-state hero
  if(b<8){ctx.globalAlpha=.9;txt('What do you want to trade today?',650,420,`700 54px ${F}`,C.text,'center');
    txt('Crypto & stock perps · executed on Hyperliquid',650,470,`500 22px ${F}`,C.dim,'center');ctx.globalAlpha=1;}
  // user bubble
  if(b>=8){const p=eo5(cl((b-8)/.6));const lines=wrap(PROMPT,`500 24px ${F}`,700);const bw=760,bh=lines.length*34+40;
    const bx=CX1-bw-20,by=110+(1-p)*30;ctx.globalAlpha=p;rr(bx,by,bw,bh,20);ctx.fillStyle='#1A2010';ctx.fill();ctx.strokeStyle='#33421A';ctx.stroke();
    lines.forEach((ln,i)=>txt(ln,bx+28,by+44+i*34,`500 24px ${F}`,'#E8F7C9'));ctx.globalAlpha=1;}
  // AI response card
  if(b>=8.4){const base=b-8.4;const y0=250;
    drawPet(170,y0,2.6,{blink:(b%3>2.8)});txt('Quantpet',230,y0+26,`700 24px ${F}`,C.text);
    if(b<9.6){const d='.'.repeat(1+Math.floor(b*4)%3);txt('thinking'+d,350,y0+26,`500 20px ${F}`,C.dim);}
    else{txt('strategy ready · 1.2s',350,y0+26,`500 20px ${F}`,C.green);}
    if(b>=9.6){const cx=160,cy=y0+60,cw=980,ch=540;const p=eo5(cl((b-9.6)/.6));ctx.globalAlpha=p;
      rr(cx,cy,cw,ch,22);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.stroke();
      spaced('STRATEGY',cx+36,cy+52,`600 18px ${F}`,C.dim,3);txt('Funding Flip Hedge',cx+36,cy+104,`700 44px ${F}`,C.text);
      let xx=cx+36;[['BTC-PERP',C.lime,'#1C240E'],['NVDA-PERP','#E8EDF3','#1A1E25'],['3x · 1.5x','#E8EDF3','#1A1E25']].forEach(([s,fg,bg])=>{xx+=chip(xx,cy+130,s,fg,bg)+10;});
      const R=[['IF','BTC funding < 0 for 8h','LONG BTC-PERP 3x'],['AND','hedge beta','SHORT NVDA-PERP 1.5x'],['EXIT','funding > 0.01%','or stop −2.5%'],['RISK','1% per trade','max drawdown 8%']];
      R.forEach((r,i)=>{const q=cl((b-10.2-i*.75)/.5);if(q<=0)return;const yy=cy+222+i*64;ctx.globalAlpha=p*q;
        ctx.fillStyle='#161A20';ctx.fillRect(cx+36,yy-34,cw-72,52);
        txt(r[0],cx+56,yy,`700 22px ${F}`,C.lime);txt(r[1],cx+150,yy,`500 22px ${F}`,C.text);
        txt('→ '+r[2],cx+cw-60,yy,`600 22px ${F}`,r[2].startsWith('SHORT')?C.red:r[2].startsWith('LONG')?C.green:C.text,'right');});
      ctx.globalAlpha=p;
      // buttons
      const by=cy+ch-86;const q2=cl((b-13.2)/.5);ctx.globalAlpha=p*q2;
      rr(cx+36,by,250,56,14);ctx.fillStyle='#161A20';ctx.fill();ctx.strokeStyle=C.line;ctx.stroke();
      txt(b>=19.5?'Backtest  ✓':'Backtest',cx+68,by+36,`600 22px ${F}`,b>=19.5?C.green:C.text);
      const click=b>=22&&b<22.5?1-(b-22)/.5:0;const dx=cx+306,dw=420;
      rr(dx-click*4,by-click*3,dw+click*8,56+click*6,14);ctx.fillStyle=live?C.green:C.lime;ctx.fill();
      txt(live?'● LIVE on Hyperliquid':'Deploy to Hyperliquid  →',dx+dw/2,by+37,`700 23px ${F}`,'#08090B','center');
      if(click>0){ctx.strokeStyle=`rgba(200,255,60,${click})`;ctx.lineWidth=3;rr(dx-(1-click)*40,by-(1-click)*40,dw+(1-click)*80,56+(1-click)*80,20);ctx.stroke();}
      ctx.globalAlpha=1;}
  }
  // right column: backtest
  const RX=1210,RW=680;
  rr(RX,96,RW,500,22);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=C.line;ctx.lineWidth=1.5;ctx.stroke();
  spaced('BACKTEST',RX+30,140,`600 17px ${F}`,C.dim,3);
  rr(RX+RW-196,116,170,32,8);ctx.fillStyle='#1C1A10';ctx.fill();txt('SIMULATED',RX+RW-111,138,`600 16px ${F}`,'#E9D58A','center');
  txt(b>=14?'Funding Flip Hedge · 2021–2026':'—',RX+30,178,`600 22px ${F}`,b>=14?C.text:C.dim2);
  const gx=RX+30,gy=200,gw=RW-60,gh=270;
  ctx.strokeStyle='#161A20';ctx.lineWidth=1;for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(gx,gy+i*gh/4);ctx.lineTo(gx+gw,gy+i*gh/4);ctx.stroke();}
  const prog=cl((b-14.2)/4.6);const draw=(arr,col,lw,glow,pp)=>{const n=Math.floor(pp*(arr.length-1));if(n<1)return;const mn=-1.2,mx=2.6;
    ctx.save();ctx.beginPath();for(let i=0;i<=n;i++){const x=gx+i/(arr.length-1)*gw,y=gy+gh-(arr[i]-mn)/(mx-mn)*gh;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}
    ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.lineJoin='round';if(glow){ctx.shadowColor=col;ctx.shadowBlur=18;}ctx.stroke();ctx.restore();
    if(glow&&pp<1){const i=n,x=gx+i/(arr.length-1)*gw,y=gy+gh-(arr[i]-mn)/(mx-mn)*gh;ctx.fillStyle=col;ctx.beginPath();ctx.arc(x,y,7,0,7);ctx.fill();}};
  draw(BM,'#4A515C',2.5,false,eio(prog));draw(EQ,C.lime,4,true,eio(prog));
  if(prog>0){txt('Strategy',gx+gw-200,gy+24,`500 16px ${F}`,C.lime);txt('BTC hold',gx+gw-90,gy+24,`500 16px ${F}`,C.dim);}
  const M=[['CAGR',38.2,'+','%',1],['Sharpe',2.14,'','',2],['Max DD',7.6,'−','%',1],['Win rate',61,'','%',0]];
  M.forEach((m,i)=>{const x=RX+30+i*162,q=eo(cl((b-15.5-i*.35)/2.2));txt(m[0],x,505,`500 16px ${F}`,C.dim);
    const v=(m[1]*q).toFixed(m[4]);txt(b>=15.5?m[2]+v+m[3]:'—',x,548,`700 32px ${F}`,i===2?C.red:i===0?C.green:C.text);});
  // orders
  rr(RX,616,RW,430,22);ctx.fillStyle=C.panel;ctx.fill();ctx.strokeStyle=C.line;ctx.stroke();
  spaced('LIVE ORDERS',RX+30,660,`600 17px ${F}`,C.dim,3);
  if(live){ctx.fillStyle=C.green;ctx.globalAlpha=.6+.4*Math.sin(b*Math.PI);ctx.beginPath();ctx.arc(RX+RW-40,654,7,0,7);ctx.fill();ctx.globalAlpha=1;}
  ['MARKET','SIDE','SIZE','PRICE','STATUS'].forEach((h,i)=>txt(h,RX+30+[0,190,320,420,560][i],700,`500 14px ${F}`,C.dim2));
  ROWS.forEach((r,i)=>{const t0=24+i*.5;const q=cl((b-t0)/.35);if(q<=0)return;const y=740+i*58;const e=eo5(q);
    ctx.globalAlpha=e;ctx.save();ctx.translate((1-e)*60,0);
    if(b-t0<.6){ctx.fillStyle=`rgba(200,255,60,${.18*(1-(b-t0)/.6)})`;ctx.fillRect(RX+14,y-36,RW-28,54);}
    txt(r[0],RX+30,y,`600 21px ${F}`,C.text);chip(RX+220-30,y-25,r[1]+' '+r[2],r[1]==='LONG'?C.green:C.red,r[1]==='LONG'?'#0F2218':'#2A1214',`700 16px ${F}`);
    txt(r[3],RX+350,y,`500 21px ${F}`,C.text);txt(r[4],RX+450,y,`500 21px ${F}`,C.text);
    txt('FILLED ✓',RX+590,y,`600 18px ${F}`,C.green);ctx.restore();ctx.globalAlpha=1;});
  if(b>=26){const q=cl((b-26)/2);const v=(1284.55*eo(q));txt('PnL today',RX+30,1018,`500 16px ${F}`,C.dim);
    txt('+$'+v.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}),RX+RW-30,1022,`700 30px ${F}`,C.green,'right');}
  // cursor
  if(b>=20&&b<23.5){const p=eio(cl((b-20.2)/1.6));const tx=160+306+300,ty=250+60+540-86+30;const x=lerp(1500,tx,p),y=lerp(980,ty,p);
    ctx.save();ctx.translate(x,y);ctx.fillStyle='#fff';ctx.strokeStyle='#000';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,34);ctx.lineTo(9,26);ctx.lineTo(16,40);ctx.lineTo(22,37);ctx.lineTo(15,24);ctx.lineTo(27,24);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
}
function drawUIat(fr,f){const b=(fr/FPS-ACT3)/SPB,bc=(f/FPS-ACT3)/SPB;const [cx,cy,z]=cam(b);
  ctx.save();ctx.translate(W/2,H/2);ctx.scale(z,z);ctx.translate(-cx,-cy);drawApp(bc,f);ctx.restore();}
async function drawUI(sh,f){await MS.blur(fr=>drawUIat(fr,f),f,6,.5);}
// ---------- special scenes
function drawEnd(sh,f){const t=(f-sh.t0)/FPS;ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  // glow
  const g=ctx.createRadialGradient(W/2,H/2-40,10,W/2,H/2-40,700);g.addColorStop(0,`rgba(200,255,60,${.10*cl(t/1)})`);g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  const px=17;const pw=16*px;const asm=cl(t/.9);
  drawPet(W/2-pw/2,H/2-300,px,{asm,blink:(t>2.6&&t<2.75)});
  const wq=eo5(cl((t-.7)/.7));ctx.globalAlpha=wq;spaced('quantpet',W/2,H/2+110+(1-wq)*20,`700 156px ${F}`,'#fff',-4,'center');
  const q2=cl((t-1.5)/.6);ctx.globalAlpha=q2;const tg='Your edge is a prompt.';txt(tg.slice(0,Math.floor(cl((t-1.5)/1.0)*tg.length)),W/2,H/2+200,`500 46px ${F}`,C.lime,'center');
  ctx.globalAlpha=cl((t-2.6)/.6)*.75;txt('Crypto & stock perps  ·  Executed on Hyperliquid',W/2,H-130,`500 22px ${F}`,'#fff','center');
  ctx.globalAlpha=cl((t-2.6)/.6)*.4;txt('Concept film · simulated product, data and returns · not financial advice',W/2,H-90,`500 16px ${F}`,'#fff','center');
  ctx.globalAlpha=1;}

const bind = sh => { ctx = MS.ctx; W = MS.W; H = MS.H; FPS = MS.FPS; F = MS.FONT; SPB = 60 / MS.EDL.bpm; ACT3 = sh.act3; };
MS.scene('quantpet-ui', async (sh, f) => { bind(sh); await drawUI(sh, f); });
MS.scene('quantpet-end', (sh, f) => { bind(sh); drawEnd(sh, f); });
})();
