import React from "react";
import { Img } from "remotion";
import { C, FONT, R, alpha, brand, brandFile } from "./brand";
import { prog } from "./beat";

// Building blocks for recreated product UI. All take an optional `t` = data-t target id,
// which is what <Pointer> measures to put the cursor exactly on the element.

export const Card: React.FC<{ style?: React.CSSProperties; children?: React.ReactNode; t?: string }> = ({ style, children, t }) => (
  <div
    data-t={t}
    style={{
      position: "absolute", background: C.surface, border: `1px solid ${C.line}`, borderRadius: R.card, overflow: "hidden",
      boxShadow: "0 40px 120px rgba(0,0,0,.45), 0 8px 24px rgba(0,0,0,.3)", color: C.text, fontFamily: FONT,
      // tabular figures keep table columns aligned; only inside UI cards (some fonts also widen hyphens under tnum)
      fontVariantNumeric: "tabular-nums", ...style,
    }}
  >
    {children}
  </div>
);

/** Small uppercase label (table headers, eyebrows). */
export const Micro: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div style={{ fontFamily: FONT, fontWeight: 500, fontSize: 14, letterSpacing: brand.type.labelTracking, textTransform: "uppercase", color: C.dim, ...style }}>
    {children}
  </div>
);

export const Pill: React.FC<{ children: React.ReactNode; fg?: string; bg?: string; style?: React.CSSProperties; t?: string }> = ({
  children, fg = C.text, bg = C.surface2, style, t,
}) => (
  <span
    data-t={t}
    style={{
      display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: R.pill, background: bg, color: fg,
      fontFamily: FONT, fontSize: 17, fontWeight: 500, whiteSpace: "nowrap", ...style,
    }}
  >
    {children}
  </span>
);

/** Primary (accent) button; ghost = neutral. `press` 0..1 from beat.press(). */
export const Btn: React.FC<{ children: React.ReactNode; press?: number; ghost?: boolean; style?: React.CSSProperties; t?: string }> = ({
  children, press = 0, ghost, style, t,
}) => (
  <div
    data-t={t}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", height: 60, borderRadius: R.pill,
      background: ghost ? C.surface2 : C.accent, color: ghost ? C.text : C.accentInk, fontFamily: FONT, fontWeight: 600, fontSize: 21,
      transform: `scale(${1 - press * 0.04})`, boxShadow: press > 0 ? `0 0 0 ${8 * press}px ${alpha(C.accent, 0.25 * press)}` : "none", ...style,
    }}
  >
    {children}
  </div>
);

/** Labelled input; `active` shows the focus ring and caret. */
export const Field: React.FC<{ label: string; value: string; placeholder?: string; active?: boolean; h?: number; t?: string }> = ({
  label, value, placeholder, active, h = 64, t,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <div style={{ fontSize: 17, color: C.dim, fontWeight: 500 }}>{label}</div>
    <div
      data-t={t}
      style={{
        minHeight: h, borderRadius: 12, background: C.surface2, border: `1.5px solid ${active ? alpha(C.accent, 0.75) : C.line}`,
        padding: "16px 20px", fontSize: 22, color: value ? C.text : C.dim2, lineHeight: 1.35, boxSizing: "border-box",
      }}
    >
      {value || placeholder}
      {active ? <span style={{ display: "inline-block", width: 3, height: 26, background: C.accent, marginLeft: 3, verticalAlign: -4 }} /> : null}
    </div>
  </div>
);

export const Avatar: React.FC<{ size?: number; seed?: number }> = ({ size = 44, seed = 0 }) => {
  const sets = [[C.accent, C.positive, C.surface2], [C.positive, C.accent, C.bg], [C.text, C.accent, C.surface], [C.warn, C.accent, C.bg]];
  const [a, b, c] = sets[seed % sets.length];
  return <div style={{ width: size, height: size, borderRadius: 999, flex: "none", background: `radial-gradient(circle at 30% 30%, ${a} 0%, ${b} 45%, ${c} 100%)` }} />;
};

// Icons as SVG: brand fonts rarely contain ✓ ● ▾ ⌕ and the browser would silently fall back to another typeface.
export const Check: React.FC<{ size?: number; col?: string }> = ({ size = 22, col = C.positive }) => (
  <svg width={size} height={size} viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill={col} /><path d="M7 12.5 L10.5 16 L17 9" stroke={C.bg} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Tick: React.FC<{ size?: number; col?: string }> = ({ size = 16, col = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" style={{ display: "inline-block", verticalAlign: -2 }}><path d="M3 8.5 L6.5 12 L13 4.5" stroke={col} strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
export const Chev: React.FC = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" style={{ marginLeft: 2 }}><path d="M2.5 4.5 L6 8 L9.5 4.5" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" /></svg>
);
export const Dot: React.FC<{ col: string; size?: number }> = ({ col, size = 9 }) => (
  <span style={{ display: "inline-block", width: size, height: size, borderRadius: 99, background: col }} />
);
export const SearchIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18"><circle cx="8" cy="8" r="5.5" stroke={C.dim} strokeWidth="2" fill="none" /><path d="M12 12 L16 16" stroke={C.dim} strokeWidth="2" strokeLinecap="round" /></svg>
);

/** Brand mark (from brand.logo.mark) + optional wordmark text in the brand font. */
export const Logo: React.FC<{ h: number; word?: boolean; text?: string; color?: string }> = ({ h, word = true, text, color = C.text }) => (
  <div style={{ display: "flex", alignItems: "center", gap: h * 0.28 }}>
    <Img src={brandFile(brand.logo.mark)} style={{ height: h, width: h }} />
    {word ? (
      <span style={{ fontFamily: FONT, fontWeight: brand.type.displayWeight, fontSize: h * 0.62, letterSpacing: brand.type.displayTracking, color }}>
        {text ?? brand.wordmark ?? brand.name}
      </span>
    ) : null}
  </div>
);

/** Feature-scene headline column: index label, title, subline — staggered on the beat. */
export const Headline: React.FC<{ b: number; b0: number; idx: string; title: string; sub: string; x?: number; y?: number; w?: number }> = ({
  b, b0, idx, title, sub, x = 120, y = 360, w = 600,
}) => {
  const p1 = prog(b, b0, 0.7), p2 = prog(b, b0 + 0.35, 0.7), p3 = prog(b, b0 + 0.7, 0.7);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, fontFamily: FONT, color: C.text }}>
      <div style={{ opacity: p1, transform: `translateY(${(1 - p1) * 24}px)`, display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontSize: 18, fontWeight: 500, color: C.accent, letterSpacing: brand.type.labelTracking }}>{idx}</span>
        <span style={{ height: 1.5, width: 64 * p1, background: C.accent, opacity: 0.7 }} />
      </div>
      <div style={{ opacity: p2, transform: `translateY(${(1 - p2) * 30}px)`, fontSize: 76, fontWeight: brand.type.displayWeight, letterSpacing: brand.type.displayTracking, lineHeight: 1.02, marginTop: 22 }}>
        {title}
      </div>
      <div style={{ opacity: p3 * 0.85, transform: `translateY(${(1 - p3) * 20}px)`, fontSize: 26, marginTop: 24, color: C.dim, lineHeight: 1.35 }}>{sub}</div>
    </div>
  );
};

/** Whip-in: slide from the right with motion blur, settle on the brand ease. */
export const Enter: React.FC<{ b: number; b0: number; children: React.ReactNode; from?: number; dur?: number }> = ({ b, b0, children, from = 260, dur = 0.55 }) => {
  const p = prog(b, b0, dur); const v = 1 - p;
  return (
    <div style={{ position: "absolute", inset: 0, transform: `translateX(${v * from}px)`, opacity: Math.min(1, p * 2.2), filter: v > 0.02 ? `blur(${v * 14}px)` : "none" }}>
      {children}
    </div>
  );
};
