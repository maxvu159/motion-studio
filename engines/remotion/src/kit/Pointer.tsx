import React from "react";
import { Easing, interpolate } from "remotion";
import { C, alpha } from "./brand";

/**
 * A cursor that clicks REAL elements. Every frame it measures the element tagged data-t="<id>"
 * (cards slide, zoom and whip in, so fixed coordinates miss the button — that was a real bug).
 * Put it at the top level of the scene (inside the root with id="ms-root"), not inside a transformed card.
 *
 * keys: one entry per stop. `at` is the beat the cursor arrives (and clicks, if click=true).
 * Travel takes up to 0.75 beat before `at`. fx/fy pick the point inside the element (0..1).
 * Put clicks on kicks / downbeats and make the UI react at the same beat.
 */
export type PointerKey = { at: number; t: string; click?: boolean; fx?: number; fy?: number };

export const Cursor: React.FC<{ x: number; y: number; o?: number; click?: number }> = ({ x, y, o = 1, click = 0 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: o, zIndex: 50 }}>
    {click > 0 ? (
      <div style={{ position: "absolute", left: -26, top: -26, width: 52, height: 52, borderRadius: 99, border: `3px solid ${alpha(C.accent, click)}`, transform: `scale(${1.6 - click * 0.6})` }} />
    ) : null}
    <svg width="34" height="40" viewBox="0 0 34 40">
      <path d="M2 2 L2 32 L10 25 L16 38 L22 35 L16 23 L28 23 Z" fill="#fff" stroke={C.bg} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  </div>
);

export const Pointer: React.FC<{ b: number; keys: PointerKey[]; from?: [number, number]; until?: number }> = ({
  b, keys, from = [1980, 1120], until = 1e9,
}) => {
  const [pos, setPos] = React.useState<Record<string, [number, number]>>({});
  React.useLayoutEffect(() => {
    const root = document.getElementById("ms-root");
    if (!root) return;
    const rr = root.getBoundingClientRect();
    const k = rr.width / root.offsetWidth; // studio preview scales the canvas; renders do not
    const next: Record<string, [number, number]> = {};
    let changed = false;
    for (const key of keys) {
      const id = key.t + key.at;
      const old = pos[id];
      const el = document.querySelector(`[data-t="${key.t}"]`);
      if (!el) {
        if (old) next[id] = old; // element gone (e.g. button became a badge): stay where it was
        continue;
      }
      const r = el.getBoundingClientRect();
      const p: [number, number] = [(r.left - rr.left + r.width * (key.fx ?? 0.5)) / k, (r.top - rr.top + r.height * (key.fy ?? 0.55)) / k];
      if (!old || Math.abs(old[0] - p[0]) > 0.3 || Math.abs(old[1] - p[1]) > 0.3) changed = true;
      next[id] = p;
    }
    if (changed) setPos(next);
  });
  if (!keys.length || b < keys[0].at - 0.9 || b > until) return null;
  let x = from[0], y = from[1];
  let prev: [number, number] = from;
  for (let i = 0; i < keys.length; i++) {
    const P = pos[keys[i].t + keys[i].at];
    if (!P) continue;
    const gap = i ? keys[i].at - keys[i - 1].at : 0.9;
    const mv = Math.min(0.75, gap * 0.8);
    const p = interpolate(b, [keys[i].at - mv, keys[i].at - 0.04], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.45, 0, 0.2, 1) });
    if (p <= 0) break;
    x = prev[0] + (P[0] - prev[0]) * p;
    y = prev[1] + (P[1] - prev[1]) * p;
    prev = P;
  }
  let click = 0;
  for (const key of keys) if (key.click && b >= key.at && b < key.at + 0.5) click = 1 - (b - key.at) / 0.5;
  const fade = interpolate(b, [keys[0].at - 0.9, keys[0].at - 0.6, until - 0.3, until], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <Cursor x={x - 3} y={y - 3} o={fade} click={click} />;
};
