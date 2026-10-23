import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, EASE, EASE_DATA, FONT, brand } from "../../kit/brand";
import { Logo } from "../../kit/ui";
import { MeshBg } from "../../kit/MeshBg";

/**
 * STAT CARD template: one headline number with context, over a scrolling wall of tiles.
 * Timing grammar measured from reference clips (seconds, not beats — these cards usually run without
 * a beat-cut soundtrack): wall already moving at 0.0, logo 0.4, name 1.3, claim 1.6, description 2.3,
 * count-up 3.5→5.0 on the data ease, source/date 5.5, partner row 7.0, then hold ≥ 1.2s.
 * The number must come from a cited source (props.asOf names it). Never type a delta: compute it.
 */
export type StatCardProps = {
  name: string;
  claim: string;
  description: string;
  value: number;
  decimals: number;
  suffix?: string;
  unit?: string;
  asOf: string;
  wall: string[];        // short labels for the wall tiles (tickers, initials); no third-party logos needed
  partnersLabel?: string;
  partners?: string[];
};

const SCROLL = 164, GAP = 156, TILE = 128; // px/s, column pitch, tile size (measured)
const useSec = () => { const f = useCurrentFrame(); const { fps } = useVideoConfig(); return f / fps; };
const Reveal: React.FC<{ at: number; rise?: number; children: React.ReactNode }> = ({ at, rise = 28, children }) => {
  const t = useSec(); const p = interpolate(t, [at, at + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE });
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * rise}px)` }}>{children}</div>;
};
const shuffle = <T,>(a: T[], seed: number) => { const o = [...a]; let r = seed * 9301 + 49297; for (let i = o.length - 1; i > 0; i--) { r = (r * 9301 + 49297) % 233280; const j = Math.floor((r / 233280) * (i + 1)); [o[i], o[j]] = [o[j], o[i]]; } return o; };
const Column: React.FC<{ x: number; dir: 1 | -1; offset: number; seed: number; items: string[] }> = ({ x, dir, offset, seed, items }) => {
  const t = useSec(); const base = shuffle(items, seed); const loop = items.length * GAP;
  const shift = (((t * SCROLL * dir + offset) % loop) + loop) % loop;
  return (
    <div style={{ position: "absolute", left: x - TILE / 2, top: -loop + shift, width: TILE }}>
      {[...base, ...base].map((s, i) => (
        <div key={`${s}-${i}`} style={{ width: TILE, height: TILE, marginBottom: GAP - TILE, borderRadius: "50%", background: i % 3 ? C.surface2 : C.surface, border: `1px solid ${C.line}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 600, fontSize: s.length > 3 ? 26 : 34, color: i % 5 ? C.text : C.accent }}>{s}</div>
      ))}
    </div>
  );
};
export const StatCard: React.FC<StatCardProps> = (p) => {
  const t = useSec();
  const k = interpolate(t, [3.5, 5.0], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE_DATA });
  const Sp: React.FC<{ h: number }> = ({ h }) => <div style={{ height: h, flexShrink: 0 }} />;
  const items = p.wall.length >= 20 ? p.wall : [...p.wall, ...p.wall, ...p.wall].slice(0, Math.max(20, p.wall.length));
  return (
    <AbsoluteFill id="ms-root" style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <MeshBg />
      <div style={{ position: "absolute", left: 1000, top: 0, right: 0, bottom: 0, overflow: "hidden",
        maskImage: "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 13%, black 87%, transparent 100%)" }}>
        {[88, 244, 400, 556, 712, 868].map((x, i) => <Column key={x} x={x} dir={i % 2 ? 1 : -1} offset={[0, 78, 40, 110, 20, 95][i]} seed={[1, 17, 42, 73, 128, 205][i]} items={items} />)}
      </div>
      <div style={{ position: "absolute", left: 96, top: 72, bottom: 72, width: 830, display: "flex", flexDirection: "column", color: C.text }}>
        <Reveal at={0.4} rise={16}><Logo h={46} /></Reveal>
        <Sp h={78} />
        <Reveal at={1.3}><div style={{ fontSize: 100, fontWeight: brand.type.displayWeight, lineHeight: 1, color: C.accent, letterSpacing: brand.type.displayTracking }}>{p.name}</div></Reveal>
        <Sp h={26} />
        <Reveal at={1.6}><div style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.18, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>{p.claim}</div></Reveal>
        <Sp h={30} />
        <Reveal at={2.3}><div style={{ fontSize: 30, lineHeight: 1.5, color: C.dim, maxWidth: 740 }}>{p.description}</div></Reveal>
        <div style={{ flex: 1, minHeight: 34 }} />
        <Reveal at={3.5} rise={18}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 24 }}>
            <span style={{ fontSize: 148, fontVariantNumeric: "tabular-nums", fontWeight: brand.type.displayWeight, color: C.accent, letterSpacing: brand.type.displayTracking, lineHeight: 1 }}>{(p.value * k).toFixed(p.decimals)}{p.suffix ?? ""}</span>
            {p.unit ? <span style={{ fontSize: 32, fontWeight: 500, color: C.dim, letterSpacing: brand.type.labelTracking }}>{p.unit}</span> : null}
          </div>
        </Reveal>
        <Sp h={18} />
        <Reveal at={5.5} rise={14}><div style={{ fontSize: 26, color: C.dim2 }}>{p.asOf}</div></Reveal>
        <Sp h={50} />
        {p.partners?.length ? (
          <Reveal at={7.0}>
            <div style={{ fontSize: 23, color: C.dim2, letterSpacing: brand.type.labelTracking, marginBottom: 18, textTransform: "uppercase" }}>{p.partnersLabel ?? "With"}</div>
            <div style={{ display: "flex", gap: 20 }}>
              {p.partners.map((s) => <div key={s} style={{ height: 64, padding: "0 26px", borderRadius: 999, background: C.surface2, border: `1px solid ${C.line}`, display: "flex", alignItems: "center", fontSize: 24, fontWeight: 500 }}>{s}</div>)}
            </div>
          </Reveal>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
