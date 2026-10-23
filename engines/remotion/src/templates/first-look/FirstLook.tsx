import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { C, FONT, alpha, brand } from "../../kit/brand";
import { prog, useBeat } from "../../kit/beat";
import { Logo, Micro, Pill } from "../../kit/ui";
import { MeshBg } from "../../kit/MeshBg";

/**
 * UI FIRST LOOK / SNEAK PEEK template.
 * open (logo + product) → one word per beat → feature scenes (project-provided) → roadmap → end card.
 * Everything is in beats of the project's music. Put scene boundaries on downbeats, big ones on phrase
 * starts (see tools/beatmap.py), and the clicks inside scenes on kicks.
 */
export type FeatureScene = {
  id: string;
  /** length in beats (multiple of 4 = whole bars) */
  beats: number;
  /** draws the scene; b = current beat, b0 = beat the scene starts */
  render: (b: number, b0: number) => React.ReactNode;
};
export type FirstLookConfig = {
  bpm: number;
  product: { name: string; highlight?: string };
  eyebrow: string[];
  openBeats: number;
  words: string[];
  scenes: FeatureScene[];
  roadmap?: { label: string; items: [string, string][]; note?: string; beats: number };
  end: { line: string; cta?: string; beats: number };
  /** extra beats that get a cut flash (e.g. the chorus drop inside a scene) */
  accents?: number[];
};

export const totalBeats = (c: FirstLookConfig) =>
  c.openBeats + c.words.length + c.scenes.reduce((s, x) => s + x.beats, 0) + (c.roadmap?.beats ?? 0) + c.end.beats;

const Open: React.FC<{ b: number; c: FirstLookConfig }> = ({ b, c }) => {
  const g = prog(b, 0.15, 1.2), w = prog(b, 1.0, 1.0), e = prog(b, 2.0, 0.8);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, color: C.text }}>
      <div style={{ display: "flex", alignItems: "center", gap: 34 }}>
        <div style={{ transform: `scale(${0.7 + 0.3 * g}) rotate(${(1 - g) * -20}deg)`, opacity: g }}><Logo h={150} word={false} /></div>
        <div style={{ transform: `translateX(${(1 - w) * -60}px)`, opacity: w, display: "flex", alignItems: "baseline", gap: 26 }}>
          <span style={{ fontSize: 128, fontWeight: brand.type.displayWeight, letterSpacing: brand.type.displayTracking }}>{c.product.name}</span>
          {c.product.highlight ? <span style={{ fontSize: 128, fontWeight: 700, letterSpacing: brand.type.displayTracking, color: C.accent }}>{c.product.highlight}</span> : null}
        </div>
      </div>
      <div style={{ position: "absolute", top: 690, opacity: e, transform: `translateY(${(1 - e) * 16}px)`, display: "flex", gap: 16, alignItems: "center" }}>
        {c.eyebrow.map((s, i) => (
          <React.Fragment key={s}>
            {i ? <span style={{ width: 8, height: 8, borderRadius: 9, background: C.accent }} /> : null}
            <Micro style={{ fontSize: 22, color: i ? C.dim : C.text }}>{s}</Micro>
          </React.Fragment>
        ))}
      </div>
    </AbsoluteFill>
  );
};

const Words: React.FC<{ b: number; b0: number; words: string[] }> = ({ b, b0, words }) => {
  const i = Math.min(words.length - 1, Math.floor(b - b0));
  const p = prog(b - b0 - i, 0, 0.35);
  const w = words[i];
  const dot = w.endsWith(".");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 250, letterSpacing: "-0.045em", color: C.text, transform: `translateY(${(1 - p) * 60}px) scale(${1.06 - 0.06 * p})`, opacity: p }}>
        {dot ? w.slice(0, -1) : w}
        {dot ? <span style={{ color: C.accent }}>.</span> : null}
      </div>
      <div style={{ position: "absolute", bottom: 120, display: "flex", gap: 14 }}>
        {words.map((_, k) => <div key={k} style={{ width: k === i ? 44 : 12, height: 6, borderRadius: 9, background: k <= i ? C.accent : "rgba(255,255,255,.25)" }} />)}
      </div>
    </AbsoluteFill>
  );
};

const Roadmap: React.FC<{ b: number; b0: number; r: NonNullable<FirstLookConfig["roadmap"]> }> = ({ b, b0, r }) => {
  const step = Math.max(1, Math.floor((r.beats - 2) / Math.max(1, r.items.length)));
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <div style={{ position: "absolute", left: 120, top: 240, opacity: prog(b, b0, 0.6) }}><Micro style={{ fontSize: 22, color: C.accent }}>{r.label}</Micro></div>
      {r.items.map(([a, c], i) => {
        const p = prog(b, b0 + 1 + i * step, 0.6);
        return (
          <div key={a} style={{ position: "absolute", left: 120, top: 320 + i * 150, opacity: p, transform: `translateX(${(1 - p) * 80}px)`, display: "flex", alignItems: "center", gap: 34 }}>
            <div style={{ width: 70, height: 70, borderRadius: 99, border: `2px dashed ${C.accent}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.accent, fontSize: 24, fontWeight: 500 }}>0{i + 1}</div>
            <div style={{ fontSize: 76, fontWeight: brand.type.displayWeight, letterSpacing: brand.type.displayTracking }}>{a} <span style={{ color: C.dim, fontWeight: 400 }}>{c}</span></div>
          </div>
        );
      })}
      {r.note ? <div style={{ position: "absolute", left: 120, top: 800, opacity: prog(b, b0 + r.beats - 1.5, 0.5) * 0.8, fontSize: 24, color: C.dim }}>{r.note}</div> : null}
    </AbsoluteFill>
  );
};

const End: React.FC<{ b: number; b0: number; c: FirstLookConfig }> = ({ b, b0, c }) => {
  const p = prog(b, b0, 0.9), q = prog(b, b0 + 2, 0.7), r = prog(b, b0 + 4, 0.7);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, color: C.text }}>
      <div style={{ opacity: p, transform: `scale(${0.94 + 0.06 * p})`, display: "flex", alignItems: "center", gap: 30 }}>
        <Logo h={120} word={false} />
        <span style={{ fontSize: 112, fontWeight: brand.type.displayWeight, letterSpacing: brand.type.displayTracking }}>
          {c.product.name} {c.product.highlight ? <span style={{ color: C.accent, fontWeight: 700 }}>{c.product.highlight}</span> : null}
        </span>
      </div>
      <div style={{ marginTop: 44, opacity: q, transform: `translateY(${(1 - q) * 14}px)`, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ width: 12, height: 12, borderRadius: 9, background: C.accent }} />
        <span style={{ fontSize: 32 }}>{c.end.line}</span>
      </div>
      {c.end.cta ? (
        <div style={{ marginTop: 34, opacity: r, transform: `translateY(${(1 - r) * 14}px)` }}>
          <Pill bg={alpha(C.accent, 0.12)} fg={C.accent} style={{ fontSize: 26, padding: "12px 26px" }}>{c.end.cta}</Pill>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const FirstLook: React.FC<{ config: FirstLookConfig }> = ({ config: c }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const b = useBeat(c.bpm);
  // scene table in beats
  const table: { b0: number; b1: number; draw: () => React.ReactNode }[] = [];
  let at = 0;
  table.push({ b0: 0, b1: c.openBeats, draw: () => <Open b={b} c={c} /> }); at = c.openBeats;
  const w0 = at; table.push({ b0: w0, b1: w0 + c.words.length, draw: () => <Words b={b} b0={w0} words={c.words} /> }); at += c.words.length;
  for (const s of c.scenes) { const s0 = at; table.push({ b0: s0, b1: s0 + s.beats, draw: () => s.render(b, s0) }); at += s.beats; }
  if (c.roadmap) { const r0 = at; const r = c.roadmap; table.push({ b0: r0, b1: r0 + r.beats, draw: () => <Roadmap b={b} b0={r0} r={r} /> }); at += r.beats; }
  const e0 = at; table.push({ b0: e0, b1: e0 + c.end.beats + 99, draw: () => <End b={b} b0={e0} c={c} /> });
  const cur = table.find((s) => b >= s.b0 && b < s.b1) ?? table[table.length - 1];
  const cuts = [...table.slice(1).map((s) => s.b0), ...(c.accents ?? [])];
  const since = Math.min(...cuts.map((x) => (b >= x ? b - x : 99)));
  const flash = since < 0.25 ? (1 - since / 0.25) * 0.18 : 0;
  const fadeOut = interpolate(frame, [durationInFrames - 18, durationInFrames - 1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill id="ms-root" style={{ backgroundColor: C.bg, fontFamily: FONT }}>
      <MeshBg />
      {cur.draw()}
      <AbsoluteFill style={{ background: alpha(C.accent, flash), pointerEvents: "none" }} />
      <AbsoluteFill style={{ background: alpha(C.bg, fadeOut) }} />
    </AbsoluteFill>
  );
};
