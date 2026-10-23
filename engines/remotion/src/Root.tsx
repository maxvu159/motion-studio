import React from "react";
import { Composition } from "remotion";
import "./kit/brand";
import { NorthwindFirstLook, durationInFrames as nwFirstLookFrames } from "./projects/northwind-first-look";
import { StatCard } from "./templates/stat-card/StatCard";
import { props as nwStat } from "./projects/northwind-stat";

// Register one <Composition> per project. Id = project slug in PascalCase.
// The brand used is whatever `npm run brand -- <name>` copied into public/brand.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="NorthwindFirstLook" component={NorthwindFirstLook} durationInFrames={nwFirstLookFrames} fps={30} width={1920} height={1080} />
    <Composition id="NorthwindStat" component={StatCard} defaultProps={nwStat} durationInFrames={330} fps={30} width={1920} height={1080} />
  </>
);
