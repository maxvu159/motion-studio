import React, { useMemo } from "react";
import { AbsoluteFill, Img, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { brand, brandFile, C } from "./brand";
import { MeshSurface, meshFromGrid } from "./MeshSurface";

/** Brand background: animated mesh gradient, flat colour, or an image — from brand.background. */
export const MeshBg: React.FC<{ loopSeconds?: number }> = ({ loopSeconds = 15 }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const bg = brand.background;
  const config = useMemo(() => (bg.type === "mesh" && bg.mesh ? meshFromGrid(bg.mesh, bg.grain ?? 9) : null), [bg]);
  if (bg.type === "image" && bg.image) return <AbsoluteFill><Img src={brandFile(bg.image)} style={{ width: "100%", height: "100%", objectFit: "cover" }} /></AbsoluteFill>;
  if (!config) return <AbsoluteFill style={{ background: C.bg }} />;
  return (
    <ThreeCanvas width={width} height={height} camera={{ fov: 52, position: [0, 0, 5], near: 0.1, far: 100 }} style={{ position: "absolute", inset: 0 }} gl={{ toneMapping: THREE.NoToneMapping }}>
      <MeshSurface t={frame / fps} width={width} height={height} loopSeconds={loopSeconds} config={config} />
    </ThreeCanvas>
  );
};
