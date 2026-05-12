import { Config } from "@remotion/cli/config";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.setConcurrency(null);
// Point Remotion's staticFile root at studio/ so `staticFile("captures/...")`
// resolves to apps/marketing/studio/captures/<spec>/clip.mp4 — and Astro's
// public/ stays exclusively for the marketing site.
Config.setPublicDir(resolve(__dirname, "studio"));
