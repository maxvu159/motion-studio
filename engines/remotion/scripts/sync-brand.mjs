// Copy brands/<name>/ into public/brand/ so compositions can import brand.json and load its files.
//   npm run brand -- demo
import { cpSync, rmSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const name = process.argv[2];
if (!name) { console.error("usage: npm run brand -- <brand-folder-name>"); process.exit(1); }
const here = dirname(fileURLToPath(import.meta.url));
const src = resolve(here, "../../../brands", name);
const dst = resolve(here, "../public/brand");
if (!existsSync(resolve(src, "brand.json"))) { console.error(`no brand.json in ${src}`); process.exit(1); }
rmSync(dst, { recursive: true, force: true });
cpSync(src, dst, { recursive: true });
console.log(`brand "${name}" -> public/brand`);
