import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import { C, FONT, EASE_DATA, alpha } from "../../kit/brand";
import { prog, typed, fmt } from "../../kit/beat";
import { Card, Micro, Pill, Btn, Field, Check, Avatar, Headline, Enter, Tick, Chev, Dot, SearchIcon } from "../../kit/ui";
import { Pointer } from "../../kit/Pointer";

// Recreated product screens for the demo project. Each scene is a component (b, b0) whose events are
// written in beats from the scene start. Elements the cursor clicks carry `t` / data-t ids.
// Worked example of the UI-first-look grammar: enter on the downbeat, click on kicks, react on the click.

// ================================================================ CREATE
const STEPS = ["Vault details", "Submit", "Vault setup", "Trading wallet", "Done"];
const Stepper: React.FC<{ active: number }> = ({ active }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
    {STEPS.map((s, i) => {
      const done = i < active, cur = i === active;
      return (
        <React.Fragment key={s}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: 99, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
              background: done ? C.positive : cur ? C.accent : C.surface2, color: done || cur ? C.accentInk : C.dim }}>
              {done ? <Tick size={15} /> : i + 1}
            </div>
            <span style={{ fontSize: 17, color: cur ? C.text : done ? C.dim : C.dim2, fontWeight: cur ? 600 : 500 }}>{s}</span>
          </div>
          {i < STEPS.length - 1 ? <div style={{ width: 26, height: 2, background: done ? C.positive : C.line }} /> : null}
        </React.Fragment>
      );
    })}
  </div>
);
export const Create: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const name = typed("Funding Basis Vault", b, b0 + 1.1, 1.6);
  const sym = typed("FBV", b, b0 + 3.1, 0.5);
  const desc = typed("Delta-neutral funding capture on perps, rebalanced daily.", b, b0 + 4.1, 3.0);
  // steps 2-4 ride the chorus' first snare fill (bar 4, beats 2.5 / 3)
  const active = b < b0 + 9 ? 0 : b < b0 + 10.5 ? 1 : b < b0 + 11 ? 2 : 3;
  const click = b >= b0 + 8 && b < b0 + 8.5 ? 1 - (b - b0 - 8) / 0.5 : 0;
  const cam = interpolate(b, [b0, b0 + 12], [1.0, 1.035]);
  return (
    <AbsoluteFill>
      <Headline b={b} b0={b0} idx="01 — CURATORS" title="Create your vault" sub="Name it, pick a share symbol and describe the strategy." />
      <Enter b={b} b0={b0}>
        <Card style={{ left: 800, top: 120, width: 1000, height: 840, transform: `scale(${cam})`, transformOrigin: "60% 40%" }}>
          <div style={{ padding: "36px 44px", display: "flex", flexDirection: "column", gap: 26 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <Micro>Vaults › Deploy</Micro>
                <div style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em", marginTop: 8 }}>Vault deployment</div>
              </div>
              <Pill fg={C.accent} bg={alpha(C.accent, 0.1)}>Testnet</Pill>
            </div>
            <Stepper active={active} />
            <div style={{ height: 1, background: C.line }} />
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 22 }}>
              <Field t="name" label="Vault name" value={name} placeholder="e.g. Funding Basis Vault" active={b >= b0 + 1 && b < b0 + 3} />
              <Field t="sym" label="Share symbol" value={sym} placeholder="e.g. BTC" active={b >= b0 + 3 && b < b0 + 4} />
            </div>
            <Field t="desc" label="Strategy description" value={desc} placeholder="Explain your strategy to depositors" active={b >= b0 + 4 && b < b0 + 7.6} h={104} />
            <div style={{ display: "flex", alignItems: "center", gap: 14, color: C.dim, fontSize: 18 }}>
              <span style={{ width: 10, height: 10, borderRadius: 9, background: C.accent }} /> Share token symbol:
              <span style={{ color: C.text }}>{sym || "—"}</span>
            </div>
            <Btn t="deploy" press={click} style={{ marginTop: 6 }}>{active === 0 ? "Deploy vault" : active === 1 ? "Submitting transaction…" : "Setting up your vault…"}</Btn>
          </div>
        </Card>
      </Enter>
      <Pointer b={b} until={b0 + 10} keys={[{ at: b0 + 1, t: "name", click: true, fx: 0.3 }, { at: b0 + 3, t: "sym", click: true, fx: 0.35 }, { at: b0 + 4, t: "desc", click: true, fx: 0.25, fy: 0.4 }, { at: b0 + 8, t: "deploy", click: true }]} />
    </AbsoluteFill>
  );
};

// ================================================================ TRADING WALLET
export const Wallet: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const sel = b >= b0 + 2 ? 1 : 0;
  const ok = prog(b, b0 + 4, 0.5);
  const Opt: React.FC<{ i: number; t: string; d: string }> = ({ i, t, d }) => (
    <div data-t={`opt${i}`} style={{ flex: 1, borderRadius: 14, padding: "22px 24px", border: `1.5px solid ${sel === i ? C.accent : C.line}`, background: sel === i ? alpha(C.accent, 0.08) : C.surface2 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 22, height: 22, borderRadius: 99, border: `2px solid ${sel === i ? C.accent : C.dim2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {sel === i ? <div style={{ width: 11, height: 11, borderRadius: 99, background: C.accent }} /> : null}
        </div>
        <span style={{ fontSize: 23, fontWeight: 500 }}>{t}</span>
      </div>
      <div style={{ fontSize: 17, color: C.dim, marginTop: 10, lineHeight: 1.4 }}>{d}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Headline b={b} b0={b0} idx="02 — TRADING WALLET" title="A dedicated trading wallet" sub="It can place and cancel orders. It can never withdraw funds." />
      <Enter b={b} b0={b0}>
        <Card style={{ left: 800, top: 200, width: 1000, height: 520 }}>
          <div style={{ padding: "36px 44px" }}>
            <Micro>Step 4 of 5</Micro>
            <div style={{ fontSize: 38, fontWeight: 500, marginTop: 8, letterSpacing: "-0.02em" }}>Trading wallet</div>
            <div style={{ fontSize: 19, color: C.dim, marginTop: 10, lineHeight: 1.45 }}>
              This wallet trades for your vault. It can only place and cancel orders, never withdraw or transfer funds.
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 28 }}>
              <Opt i={0} t="Use the connected wallet" d="Your leader wallet also acts as the trading agent." />
              <Opt i={1} t="Create a new wallet" d="A fresh wallet generated in your browser." />
            </div>
          </div>
        </Card>
        {ok > 0 ? (
          <Card style={{ left: 1010, top: 560 + (1 - ok) * 40, width: 760, height: 330, opacity: ok, border: `1px solid ${alpha(C.positive, 0.45)}` }}>
            <div style={{ padding: "30px 36px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <Check size={36} />
                <span style={{ fontSize: 30, fontWeight: 500 }}>Your vault is ready to trade.</span>
              </div>
              {[["Vault", "Funding Basis Vault"], ["Leader", "0x7a3c…91c4"], ["Trading wallet", "0x4f21…e08b"]].map(([k, v], i) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", marginTop: i ? 14 : 26, fontSize: 20, opacity: prog(b, b0 + 4.5 + i * 0.5, 0.4) }}>
                  <span style={{ color: C.dim }}>{k}</span>
                  <span style={{ fontFamily: FONT, display: "flex", gap: 12, alignItems: "center" }}>
                    {v}
                    {i === 2 ? <Pill fg={C.positive} bg={alpha(C.positive, 0.12)} style={{ fontSize: 15, padding: "3px 10px" }}>Verified</Pill> : null}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        ) : null}
      </Enter>
      <Pointer b={b} until={b0 + 3.6} keys={[{ at: b0 + 2, t: "opt1", click: true, fx: 0.3, fy: 0.35 }]} />
    </AbsoluteFill>
  );
};

// ================================================================ DISCOVER
const VAULTS = [
  ["BTC Funding Basis", "USDC", "0x91f2…a2c0", 48210.55, 1.0412],
  ["BTC Trend Rider", "USDC", "0x3c0d…9d71", 31780.1, 0.9965],
  ["BTC/ETH Pairs", "USDC", "0x7a3c…91c4", 22405.0, 1.0128],
  ["BTC Range Grid", "USDC", "0xe81b…40fa", 15960.42, 1.0057],
  ["BTC Weekly Momentum", "USDC", "0x5b77…c3e9", 9120.87, 1.0201],
] as const;
export const Discover: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const q = typed("BTC", b, b0 + 1.1, 0.7);
  const filt = b >= b0 + 5;
  const cam = interpolate(b, [b0, b0 + 8], [1.0, 1.04]);
  return (
    <AbsoluteFill>
      <Headline b={b} b0={b0} idx="03 — DISCOVER" title="Discover vaults" sub="Search by name. Filter by asset or leader." />
      <Enter b={b} b0={b0}>
        <Card style={{ left: 760, top: 150, width: 1060, height: 780, transform: `scale(${cam})`, transformOrigin: "50% 30%" }}>
          <div style={{ padding: "34px 40px 0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ fontSize: 44, fontWeight: 500, letterSpacing: "-0.02em" }}>Vaults</div>
              <Btn style={{ width: 190, height: 50, fontSize: 18 }}>Create vault</Btn>
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24, alignItems: "center" }}>
              <Pill t="assets" bg={filt ? alpha(C.accent, 0.14) : C.surface2} fg={filt ? C.accent : C.text}>Assets{filt ? ": USDC" : ""} <Chev /></Pill>
              <Pill>Leaders <Chev /></Pill>
              <div data-t="search" style={{ flex: 1, height: 46, borderRadius: 9999, background: C.surface2, border: `1.5px solid ${q ? alpha(C.accent, 0.6) : C.line}`, display: "flex", alignItems: "center", padding: "0 20px", fontSize: 19, color: q ? C.text : C.dim2, gap: 10 }}>
                <SearchIcon />{q || "Search vaults…"}
              </div>
            </div>
          </div>
          <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1.3fr 1.4fr 1fr", padding: "14px 40px", background: C.surface2 }}>
            {["Vault", "Deposit", "Leader", "Total deposited", "Price / share"].map((h) => <Micro key={h} style={{ fontSize: 13 }}>{h}</Micro>)}
          </div>
          {VAULTS.map((v, i) => {
            const p = prog(b, b0 + 2 + i * 0.5, 0.4);
            return (
              <div key={v[0]} data-t={`row${i}`} style={{ display: "grid", gridTemplateColumns: "2.2fr 0.9fr 1.3fr 1.4fr 1fr", padding: "0 40px", height: 92, alignItems: "center", borderBottom: `1px solid ${C.line}`, opacity: p, transform: `translateY(${(1 - p) * 26}px)` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <Avatar seed={i} />
                  <div>
                    <div style={{ fontSize: 21, fontWeight: 500 }}>{v[0]}</div>
                    <Pill style={{ fontSize: 13, padding: "2px 10px", marginTop: 6 }} fg={C.dim}>Perp trading</Pill>
                  </div>
                </div>
                <span style={{ fontSize: 19 }}>{v[1]}</span>
                <span style={{ fontSize: 17, color: C.dim }}>{v[2]}</span>
                <span style={{ fontSize: 19 }}>${fmt(v[3])}</span>
                <span style={{ fontSize: 19 }}>{v[4].toFixed(4)}</span>
              </div>
            );
          })}
        </Card>
      </Enter>
      <Pointer b={b} until={b0 + 7.6} keys={[{ at: b0 + 1, t: "search", click: true, fx: 0.12 }, { at: b0 + 5, t: "assets", click: true }, { at: b0 + 6.5, t: "row0", fx: 0.2 }]} />
    </AbsoluteFill>
  );
};

// ================================================================ FOLLOW (vault page)
const POS = [
  ["BTC", "Long", 0.35, 118240, 1.0],
  ["ETH", "Short", 4.2, 4412.6, -1.0],
  ["HYPE", "Long", 820, 41.82, 1.0],
] as const;
const ACT = [
  ["0x3c0d…9d71", "Deposit", "2,500.00", "2,454.82"],
  ["0xa19e…07b3", "Withdraw", "800.00", "785.55"],
  ["0x5b77…c3e9", "Deposit", "1,200.00", "1,178.31"],
] as const;
const Chart: React.FC<{ p: number; w: number; h: number }> = ({ p, w, h }) => {
  const n = 120;
  const pts: [number, number][] = [];
  let v = 0;
  for (let i = 0; i < n; i++) {
    const s = Math.sin(i * 12.9898) * 43758.5453;
    v += 0.012 + (s - Math.floor(s) - 0.5) * 0.09;
    pts.push([(i / (n - 1)) * w, v]);
  }
  const mn = Math.min(...pts.map((q) => q[1])), mx = Math.max(...pts.map((q) => q[1]));
  const k = Math.max(2, Math.floor(p * n));
  const xy = pts.slice(0, k).map(([x, y]) => [x, h - 10 - ((y - mn) / (mx - mn)) * (h - 30)] as const);
  const d = xy.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const last = xy[xy.length - 1];
  return (
    <svg width={w} height={h}>
      {[0.25, 0.5, 0.75].map((g) => <line key={g} x1={0} x2={w} y1={h * g} y2={h * g} stroke={C.line} strokeDasharray="4 6" />)}
      <path d={`${d} L${last[0]},${h} L0,${h} Z`} fill={alpha(C.accent, 0.1)} />
      <path d={d} stroke={C.accent} strokeWidth={3} fill="none" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={7} fill={C.accent} />
    </svg>
  );
};
export const Follow: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const t = (b - b0) * 0.577;
  const cnt = (v: number) => v * interpolate(b, [b0 + 0.5, b0 + 3], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_DATA });
  // camera: overview → positions → activity
  const z = interpolate(b, [b0, b0 + 3.8, b0 + 4.3, b0 + 5.7, b0 + 6.2, b0 + 8], [0.86, 0.88, 1.18, 1.2, 1.18, 1.2], { extrapolateRight: "clamp" });
  const ty = interpolate(b, [b0, b0 + 3.8, b0 + 4.3, b0 + 5.7, b0 + 6.2], [0, 0, -40, -40, -300], { extrapolateRight: "clamp" });
  const tx = interpolate(b, [b0 + 3.8, b0 + 4.3, b0 + 5.7, b0 + 6.2], [0, -40, -40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 64, fontFamily: FONT, color: C.text, opacity: prog(b, b0, 0.6) * (1 - prog(b, b0 + 3.4, 0.4)), display: "flex", alignItems: "baseline", gap: 22, zIndex: 5 }}>
        <span style={{ fontSize: 18, color: C.accent, letterSpacing: "0.1em" }}>04 — FOLLOW</span>
        <span style={{ fontSize: 46, fontWeight: 500, letterSpacing: "-0.02em" }}>Live positions & activity, in one place.</span>
      </div>
      <Enter b={b} b0={b0} from={0}>
        <div style={{ position: "absolute", inset: 0, transform: `translate(${tx}px, ${ty}px) scale(${z})`, transformOrigin: "50% 45%" }}>
          <Card style={{ left: 160, top: 180, width: 1600, height: 1180 }}>
            <div style={{ padding: "34px 44px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                <Avatar size={72} seed={1} />
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 14 }}>
                    <span style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>Funding Basis Vault</span>
                    <span style={{ fontSize: 20, color: C.dim }}>FBV</span>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <Pill fg={C.positive} bg={alpha(C.positive, 0.12)} style={{ fontSize: 15 }}><Dot col={C.positive} /> Active</Pill>
                    <Pill style={{ fontSize: 15 }}>Perp trading</Pill>
                    <Pill style={{ fontSize: 15 }}>Testnet · USDC</Pill>
                    <Pill fg={C.warn} bg={alpha(C.warn, 0.12)} style={{ fontSize: 15 }}>Testnet · sample data</Pill>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", marginTop: 30, background: C.surface2, borderRadius: 14 }}>
                {[["TVL", `$${fmt(cnt(52340.18))}`], ["Price / share", cnt(1.0184).toFixed(4)], ["Shares outstanding", fmt(cnt(51393.7), 1)], ["Depositors", `${Math.round(cnt(37))}`]].map(([k, v]) => (
                  <div key={k} style={{ padding: "20px 26px" }}>
                    <Micro style={{ fontSize: 13 }}>{k}</Micro>
                    <div style={{ fontSize: 32, marginTop: 8 }}>{v}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.05fr", gap: 26, marginTop: 26 }}>
                <div style={{ background: C.surface2, borderRadius: 14, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", gap: 8 }}>{["PnL", "TVL", "Share price"].map((s, i) => { const on = i === (b >= b0 + 2 ? 2 : 0); return <Pill key={s} t={`met${i}`} style={{ fontSize: 14, padding: "4px 12px" }} bg={on ? alpha(C.accent, 0.14) : C.surface2} fg={on ? C.accent : C.dim}>{s}</Pill>; })}</div>
                    <div style={{ display: "flex", gap: 8 }}>{["7D", "30D", "All"].map((s, i) => { const on = i === (b >= b0 + 3 ? 1 : 2); return <Pill key={s} t={`rng${i}`} style={{ fontSize: 14, padding: "4px 12px" }} bg={on ? alpha(C.accent, 0.14) : C.surface2} fg={on ? C.accent : C.dim}>{s}</Pill>; })}</div>
                  </div>
                  <div style={{ marginTop: 18 }}><Chart p={prog(b, b0 + 0.5, 3)} w={650} h={250} /></div>
                </div>
                <div style={{ background: C.surface2, borderRadius: 14, padding: "20px 24px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 22, fontWeight: 500 }}>Positions</span>
                    <span data-t="live" style={{ fontSize: 13, color: C.positive, display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 9, background: C.positive, opacity: 0.5 + 0.5 * Math.sin(t * 6) }} />LIVE
                    </span>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr 1.2fr", marginTop: 16 }}>
                    {["Market", "Side", "Size", "Entry", "uPnL ($)"].map((h) => <Micro key={h} style={{ fontSize: 12 }}>{h}</Micro>)}
                  </div>
                  {POS.map((r, i) => {
                    const u = (i === 1 ? -1 : 1) * (40 + i * 23) + Math.sin(t * 2.3 + i * 1.7) * 9 + Math.sin(t * 5.1 + i) * 3;
                    const p = prog(b, b0 + 1 + i * 0.5, 0.4);
                    return (
                      <div key={r[0]} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1.2fr 1.2fr", height: 62, alignItems: "center", borderTop: `1px solid ${C.line}`, marginTop: i ? 0 : 12, fontSize: 19, opacity: p }}>
                        <span style={{ fontWeight: 500 }}>{r[0]}</span>
                        <span style={{ color: r[1] === "Long" ? C.positive : C.negative }}>{r[1]}</span>
                        <span style={{ fontFamily: FONT }}>{r[2]}</span>
                        <span style={{ fontFamily: FONT }}>{fmt(r[3], r[3] > 1000 ? 1 : 2)}</span>
                        <span style={{ color: u >= 0 ? C.positive : C.negative }}>{u >= 0 ? "+" : "−"}{fmt(Math.abs(u))}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: C.surface2, borderRadius: 14, padding: "20px 24px", marginTop: 26 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <span style={{ fontSize: 22, fontWeight: 500, marginRight: 14 }}>Activity</span>
                  {["All", "Deposit", "Withdraw"].map((s, i) => <Pill key={s} style={{ fontSize: 14, padding: "4px 12px" }} bg={i === 0 ? alpha(C.accent, 0.14) : C.surface2} fg={i === 0 ? C.accent : C.dim}>{s}</Pill>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.8fr", marginTop: 16 }}>
                  {["Address", "Type", "Amount (USDC)", "Shares", "When"].map((h) => <Micro key={h} style={{ fontSize: 12 }}>{h}</Micro>)}
                </div>
                {ACT.map((r, i) => (
                  <div key={r[0]} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr 0.8fr", height: 60, alignItems: "center", borderTop: `1px solid ${C.line}`, marginTop: i ? 0 : 12, fontSize: 19, opacity: prog(b, b0 + 6.5 + i * 0.25, 0.3) }}>
                    <span style={{ color: C.dim }}>{r[0]}</span>
                    <span><Pill style={{ fontSize: 14, padding: "3px 12px" }} fg={r[1] === "Deposit" ? C.positive : C.warn} bg={r[1] === "Deposit" ? alpha(C.positive, 0.12) : alpha(C.warn, 0.12)}>{r[1]}</Pill></span>
                    <span style={{ fontFamily: FONT }}>{r[2]}</span>
                    <span style={{ fontFamily: FONT }}>{r[3]}</span>
                    <span style={{ color: C.dim }}>{["2m ago", "18m ago", "1h ago"][i]}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </Enter>
      <Pointer b={b} until={b0 + 6.2} keys={[{ at: b0 + 2, t: "met2", click: true }, { at: b0 + 3, t: "rng1", click: true }, { at: b0 + 5, t: "live" }]} />
    </AbsoluteFill>
  );
};

// ================================================================ DEPOSIT / REDEEM
export const Deposit: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const redeem = b >= b0 + 4;
  const amt = redeem ? typed("500", b, b0 + 5.1, 0.5) : typed("1000", b, b0 + 1.1, 0.7);
  const n = Number(amt || 0);
  const shown = redeem ? amt : n ? fmt(n, 0) : "";
  const recv = redeem ? n * 1.0184 : n / 1.0184;
  const click = b >= b0 + 3 && b < b0 + 3.5 ? 1 - (b - b0 - 3) / 0.5 : b >= b0 + 6 && b < b0 + 6.5 ? 1 - (b - b0 - 6) / 0.5 : 0;
  const done = b >= b0 + 3.2 && b < b0 + 4;
  const toast = prog(b, b0 + 3.2, 0.3) * (1 - prog(b, b0 + 4.8, 0.3));
  const tabX = redeem ? 1 : 0;
  return (
    <AbsoluteFill>
      <Headline b={b} b0={b0} idx="05 — DEPOSIT & REDEEM" title="Deposit USDC. Redeem shares." sub="Redeem instantly when the vault holds enough idle USDC." w={640} />
      <Enter b={b} b0={b0}>
        <Card style={{ left: 1060, top: 130, width: 600, height: 820 }}>
          <div style={{ padding: 30 }}>
            <div style={{ display: "flex", background: C.surface2, borderRadius: 9999, padding: 5, position: "relative" }}>
              <div style={{ position: "absolute", top: 5, left: 5 + tabX * 265, width: 265, height: 50, borderRadius: 9999, background: C.surface2 }} />
              {["Deposit", "Redeem"].map((s, i) => <div key={s} data-t={`tab${i}`} style={{ flex: 1, height: 50, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 500, position: "relative", color: i === tabX ? C.text : C.dim }}>{s}</div>)}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
              <Micro>{redeem ? "You redeem" : "You deposit"}</Micro>
              <Micro style={{ color: C.dim }}>Bal. {redeem ? "981.93 FBV" : "2,500.00 USDC"} <span style={{ color: C.accent }}>MAX</span></Micro>
            </div>
            <div data-t="amt" style={{ marginTop: 14, height: 112, borderRadius: 14, background: C.surface2, border: `1.5px solid ${amt ? alpha(C.accent, 0.6) : C.line}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 24px" }}>
              <span style={{ fontSize: 52, color: amt ? C.text : C.dim2 }}>{shown || "0"}</span>
              <Pill style={{ fontSize: 19 }}>{redeem ? "FBV" : "USDC"}</Pill>
            </div>
            <div style={{ marginTop: 22, borderRadius: 14, border: `1px solid ${C.line}`, padding: "18px 22px" }}>
              <Micro style={{ fontSize: 12 }}>Exp. output</Micro>
              {[["Share price", "1.0184 USDC"], ["Receive", n ? `≈ ${fmt(recv)} ${redeem ? "USDC" : "FBV"}` : "—"], ["Settlement", "Instant"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 20, marginTop: 14 }}>
                  <span style={{ color: C.dim }}>{k}</span><span style={{ fontFamily: FONT }}>{v}</span>
                </div>
              ))}
            </div>
            <Btn t="dbtn" press={click} style={{ marginTop: 26, background: done ? C.positive : C.accent }}>
              {done ? <span style={{ display: "flex", gap: 8, alignItems: "center" }}>Deposited <Tick size={18} /></span> : !amt ? "Enter an amount" : redeem ? "Redeem" : "Deposit"}
            </Btn>
            <div style={{ marginTop: 26, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {[["Your position", redeem || done ? "981.93 FBV" : "—"], ["Contribution", redeem || done ? "$1,000.00" : "—"]].map(([k, v]) => (
                <div key={k} style={{ background: C.surface2, borderRadius: 12, padding: "14px 16px" }}>
                  <Micro style={{ fontSize: 12 }}>{k}</Micro>
                  <div style={{ fontSize: 21, marginTop: 6 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
        {toast > 0 ? (
          <div style={{ position: "absolute", left: 1060, top: 70 - (1 - toast) * 20, opacity: toast, display: "flex", gap: 12, alignItems: "center", background: C.surface, border: `1px solid ${alpha(C.positive, 0.45)}`, borderRadius: 12, padding: "12px 20px", fontFamily: FONT, color: C.text, fontSize: 19 }}>
            <Check size={24} /> Deposit confirmed · 981.93 FBV minted
          </div>
        ) : null}
      </Enter>
      <Pointer b={b} until={b0 + 7.5} keys={[{ at: b0 + 1, t: "amt", click: true, fx: 0.3 }, { at: b0 + 3, t: "dbtn", click: true }, { at: b0 + 4, t: "tab1", click: true }, { at: b0 + 5, t: "amt", click: true, fx: 0.3 }, { at: b0 + 6, t: "dbtn", click: true }]} />
    </AbsoluteFill>
  );
};

// ================================================================ CURATOR
export const Curator: React.FC<{ b: number; b0: number }> = ({ b, b0 }) => {
  const ex = b >= b0 + 4.15;
  const click = b >= b0 + 4 && b < b0 + 4.5 ? 1 - (b - b0 - 4) / 0.5 : 0;
  return (
    <AbsoluteFill>
      <Headline b={b} b0={b0} idx="06 — CURATOR DASHBOARD" title="Every pending withdrawal, at a glance." sub="Across the vaults your wallet leads." w={620} />
      <Enter b={b} b0={b0}>
        <Card style={{ left: 820, top: 230, width: 980, height: 600 }}>
          <div style={{ padding: "32px 40px" }}>
            <div style={{ fontSize: 34, fontWeight: 500, letterSpacing: "-0.02em" }}>Curator dashboard</div>
            <div style={{ marginTop: 22, border: `1px solid ${C.line}`, borderRadius: 14, padding: "22px 26px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 24, fontWeight: 500 }}>Funding Basis Vault <span style={{ color: C.dim, fontSize: 18 }}>(FBV)</span></span>
                <span style={{ fontSize: 15, color: C.dim }}>0x91f2…a2c0</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginTop: 18 }}>
                {[["Idle (vault)", "12,480.00"], ["Exchange (free)", "31,220.40"], ["Exchange (held)", "8,639.78"]].map(([k, v]) => (
                  <div key={k} style={{ background: C.surface2, borderRadius: 12, padding: "14px 18px" }}>
                    <Micro style={{ fontSize: 12 }}>{k}</Micro>
                    <div style={{ fontSize: 24, marginTop: 6 }}>{v} <span style={{ fontSize: 15, color: C.dim }}>USDC</span></div>
                  </div>
                ))}
              </div>
              {[["#14", "0x3c0d…9d71", "500.00 FBV", "509.20"], ["#15", "0xa19e…07b3", "220.00 FBV", "224.05"]].map((r, i) => (
                <div key={r[0]} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, height: 64, borderTop: `1px solid ${C.line}`, fontSize: 19, opacity: prog(b, b0 + 1 + i * 0.5, 0.4) }}>
                  <span style={{ fontFamily: FONT }}>{r[0]} · <span style={{ color: C.dim }}>{r[1]}</span> · {r[2]} → at least {r[3]} USDC</span>
                  {i === 0 && ex ? (
                    <Pill fg={C.positive} bg={alpha(C.positive, 0.12)}>Executed <Tick size={15} /></Pill>
                  ) : (
                    <Btn t={i === 0 ? "exec" : undefined} press={i === 0 ? click : 0} style={{ width: 140, height: 46, fontSize: 18 }}>Execute</Btn>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </Enter>
      <Pointer b={b} until={b0 + 5.6} keys={[{ at: b0 + 4, t: "exec", click: true }]} />
    </AbsoluteFill>
  );
};

