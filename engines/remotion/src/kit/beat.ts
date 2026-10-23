import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { EASE } from "./brand";

/** Beats elapsed since video start. Every timing in a project is written in beats of its music. */
export const useBeat = (bpm: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps) * (bpm / 60);
};
export const framesForBeats = (beats: number, bpm: number, fps = 30) => Math.round((beats * 60 * fps) / bpm);
/** 0→1 between beat b0 and b0+dur, brand ease. */
export const prog = (b: number, b0: number, dur = 0.6, ease = EASE) =>
  interpolate(b, [b0, b0 + dur], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
/** Typewriter: the part of `s` typed by beat b. */
export const typed = (s: string, b: number, b0: number, dur: number) =>
  s.slice(0, Math.floor(interpolate(b, [b0, b0 + dur], [0, s.length], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
/** Button press pulse 1→0 over half a beat after `at`. */
export const press = (b: number, at: number, dur = 0.5) => (b >= at && b < at + dur ? 1 - (b - at) / dur : 0);
export const fmt = (v: number, d = 2) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
