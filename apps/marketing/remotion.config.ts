import { Config } from "@remotion/cli/config";
import { resolve } from "node:path";

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
// Point Remotion's staticFile root at studio/ so `staticFile("captures/...")`
// resolves to apps/marketing/studio/captures/<spec>/clip.mp4 — and Astro's
// public/ stays exclusively for the marketing site. Remotion always runs from
// apps/marketing (the workspace root), so resolving against CWD is reliable
// and avoids ESM-only `import.meta.url` (the config is loaded as CJS).
Config.setPublicDir(resolve(process.cwd(), "studio"));
