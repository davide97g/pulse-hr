// render.mjs — Deterministic frame capture for Pulse HR Reel 001.
//
// Launches a headless Chromium at 1080×1920, loads render.html (which mounts
// ReelScene inside a RenderStage whose playhead is controlled by
// window.__setTime), steps time across the 15-second reel at a fixed frame
// rate, and writes each frame as PNG. ffmpeg encodes the PNGs to MP4.
//
// Usage:
//   bun install              # installs Playwright (workspace root)
//   bunx playwright install chromium
//   node render.mjs          # writes frames/*.png and ../out/reel-001-open-source.mp4

import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, ".."); // docs/brand/reels/001-open-source
const FRAMES_DIR = path.join(__dirname, "frames");
const OUT_DIR = path.join(ROOT, "out");
const OUT_FILE = path.join(OUT_DIR, "reel-001-open-source.mp4");

// ── Config ──────────────────────────────────────────────────────────────────
const WIDTH = 1080;
const HEIGHT = 1920;
const DURATION = 15.0; // seconds
const FPS = 30;
const TOTAL_FRAMES = Math.round(DURATION * FPS);

// ── Static server — serves everything under docs/brand/reels/001-open-source ─
function startServer() {
  const mime = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript",
    ".jsx": "text/babel", // served as text, Babel compiles client-side
    ".css": "text/css",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".json": "application/json",
    ".md": "text/markdown",
  };

  const server = http.createServer((req, res) => {
    let urlPath = decodeURIComponent(req.url.split("?")[0]);
    if (urlPath === "/") urlPath = "/render/render.html";
    const fsPath = path.join(ROOT, urlPath);
    if (!fsPath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    fs.readFile(fsPath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end(`Not found: ${urlPath}`);
        return;
      }
      const ext = path.extname(fsPath);
      res.writeHead(200, {
        "Content-Type": mime[ext] || "application/octet-stream",
        "Cache-Control": "no-store",
      });
      res.end(data);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, port });
    });
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  // Clean + prepare output dirs
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/render/render.html`;
  console.log(`[render] serving ${ROOT} on :${port}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  // Surface in-page errors — Babel compile errors, etc.
  page.on("pageerror", (err) => console.error("[page error]", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.error("[page console]", msg.text());
  });

  console.log(`[render] navigating to ${url}`);
  await page.goto(url, { waitUntil: "networkidle" });

  // Wait for RenderStage to announce readiness.
  await page.waitForFunction(() => window.__ready === true, { timeout: 30_000 });

  // Give the web fonts a moment to actually paint — otherwise the first few
  // frames render in fallback fonts.
  await page.evaluate(async () => {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  });
  await page.waitForTimeout(500);

  console.log(`[render] capturing ${TOTAL_FRAMES} frames at ${FPS}fps`);
  const started = Date.now();

  for (let i = 0; i < TOTAL_FRAMES; i++) {
    const t = i / FPS;
    await page.evaluate((t) => window.__setTime(t), t);
    // One extra tick for React to render synchronously-ish
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(r)));
    const out = path.join(FRAMES_DIR, `frame-${String(i).padStart(5, "0")}.png`);
    await page.screenshot({
      path: out,
      omitBackground: false,
      type: "png",
      clip: { x: 0, y: 0, width: WIDTH, height: HEIGHT },
    });
    if (i % 30 === 0 || i === TOTAL_FRAMES - 1) {
      const elapsed = ((Date.now() - started) / 1000).toFixed(1);
      console.log(
        `[render] frame ${i + 1}/${TOTAL_FRAMES} (t=${t.toFixed(2)}s) · ${elapsed}s elapsed`,
      );
    }
  }

  await browser.close();
  server.close();

  // ── Encode ─────────────────────────────────────────────────────────────────
  console.log(`[encode] ffmpeg → ${OUT_FILE}`);
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-framerate",
      String(FPS),
      "-i",
      path.join(FRAMES_DIR, "frame-%05d.png"),
      "-c:v",
      "libx264",
      "-pix_fmt",
      "yuv420p",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-movflags",
      "+faststart",
      "-profile:v",
      "high",
      "-level",
      "4.1",
      "-r",
      String(FPS),
      OUT_FILE,
    ],
    { stdio: "inherit" },
  );

  if (ff.status !== 0) {
    console.error("[encode] ffmpeg failed with status", ff.status);
    process.exit(ff.status ?? 1);
  }

  const stat = fs.statSync(OUT_FILE);
  console.log(
    `[done] ${OUT_FILE} (${(stat.size / 1e6).toFixed(2)} MB, ${DURATION}s, ${FPS}fps, ${WIDTH}×${HEIGHT})`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
