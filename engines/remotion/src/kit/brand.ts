import { continueRender, delayRender, Easing, staticFile } from "remotion";
// public/brand is a copy of brands/<name>/ made by `npm run brand -- <name>`. It is gitignored.
import raw from "../../public/brand/brand.json";

export type Brand = {
  name: string;
  wordmark?: string | null;
  colors: {
    bg: string; surface: string; surface2: string; line: string; text: string; dim: string; dim2: string;
    accent: string; accentInk: string; positive: string; negative: string; warn: string;
  };
  type: { family: string; files: { weight: number; file: string }[]; displayWeight: number; displayTracking: string; labelTracking: string };
  radii: { card: number; hero: number; pill: number };
  motion: { ease: number[]; easeData: number[]; springs: boolean };
  logo: { mark: string };
  background: { type: "mesh" | "flat" | "image"; mesh?: string[][]; grain?: number; image?: string };
};
export const brand = raw as unknown as Brand;
export const C = brand.colors;
export const FONT = `"${brand.type.family}", sans-serif`;
export const R = brand.radii;
const [a, b, c, d] = brand.motion.ease;
export const EASE = Easing.bezier(a, b, c, d);
const [e, f, g, h] = brand.motion.easeData;
export const EASE_DATA = Easing.bezier(e, f, g, h);
export const brandFile = (p: string) => staticFile(`brand/${p}`);
/** rgba() from a brand hex colour. */
export const alpha = (hex: string, a: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};

// Load every listed weight before the first frame is captured; a missing weight would be faked by the browser.
const handle = delayRender(`brand fonts: ${brand.type.family}`);
Promise.all(
  brand.type.files.map(async ({ weight, file }) => {
    const ff = new FontFace(brand.type.family, `url(${brandFile(file)})`, { weight: String(weight) });
    await ff.load();
    document.fonts.add(ff);
  }),
)
  .then(() => continueRender(handle))
  .catch((err) => {
    console.error("brand font failed to load", err);
    continueRender(handle);
  });
