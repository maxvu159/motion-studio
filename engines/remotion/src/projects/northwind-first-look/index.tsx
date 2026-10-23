import React from "react";
import { FirstLook, FirstLookConfig, totalBeats } from "../../templates/first-look/FirstLook";
import { framesForBeats } from "../../kit/beat";
import { Create, Wallet, Discover, Follow, Deposit, Curator } from "./scenes";

// Demo: a fictional vault product, cut to a 126 BPM track with this bar layout
// (the same layout as the generated test loop, tools/testloop.py --preset chorus4):
//   bar 0 quiet · bar 1 four kicks (one word each) · bars 2-3 groove · chorus from bar 4 (the Deploy click)
// Scenes split each 4-bar phrase in two, so every cut is on a downbeat.
export const config: FirstLookConfig = {
  bpm: 126,
  product: { name: "Northwind", highlight: "Vaults" },
  eyebrow: ["First look", "Coming soon"],
  openBeats: 4,
  words: ["Create.", "Discover.", "Deposit.", "Follow."],
  scenes: [
    { id: "create", beats: 12, render: (b, b0) => <Create b={b} b0={b0} /> },
    { id: "wallet", beats: 8, render: (b, b0) => <Wallet b={b} b0={b0} /> },
    { id: "discover", beats: 8, render: (b, b0) => <Discover b={b} b0={b0} /> },
    { id: "follow", beats: 8, render: (b, b0) => <Follow b={b} b0={b0} /> },
    { id: "deposit", beats: 8, render: (b, b0) => <Deposit b={b} b0={b0} /> },
    { id: "curator", beats: 8, render: (b, b0) => <Curator b={b} b0={b0} /> },
  ],
  roadmap: { label: "On the roadmap", items: [["Strategy plug-ins", "for curators"], ["Multi-venue", "execution"], ["Public API", "for agents"]], note: "Planned. Details to follow.", beats: 8 },
  end: { line: "Coming soon", cta: "Curators: get in touch", beats: 8 },
  accents: [16],
};
export const NorthwindFirstLook: React.FC = () => <FirstLook config={config} />;
export const durationInFrames = framesForBeats(totalBeats(config), config.bpm);
