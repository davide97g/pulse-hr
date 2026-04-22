#!/usr/bin/env bun
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  renameSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recordingsDir = resolve(__dirname, "..");
const appDir = resolve(recordingsDir, "..");
const specName = process.argv[2] ?? "kudos-copilot";
const format = process.env.FORMAT ?? "mp4";
const baseUrl = process.env.BASE_URL ?? "http://localhost:5173";

const credsPath = resolve(appDir, "test.credentials.json");
if (!existsSync(credsPath)) {
  console.error(`missing ${credsPath}`);
  process.exit(1);
}
const { email, password } = JSON.parse(readFileSync(credsPath, "utf8"));

const templatePath = resolve(recordingsDir, "specs", `${specName}.template.json`);
if (!existsSync(templatePath)) {
  console.error(`missing ${templatePath}`);
  process.exit(1);
}
let raw = readFileSync(templatePath, "utf8");

const setupPartialPath = resolve(recordingsDir, "specs", "_setup.partial.json");
if (existsSync(setupPartialPath) && raw.includes('"{{SETUP}}"')) {
  const setupBlock = readFileSync(setupPartialPath, "utf8").trim();
  raw = raw.replace('"{{SETUP}}"', setupBlock);
}

const rendered = raw
  .replaceAll("{{BASE_URL}}", baseUrl)
  .replaceAll("{{TEST_EMAIL}}", email)
  .replaceAll("{{TEST_PASSWORD}}", password);

const outRoot = resolve(recordingsDir, "output");
const outDir = resolve(outRoot, specName);
mkdirSync(outDir, { recursive: true });
const compiledPath = resolve(outDir, `${specName}.json`);
writeFileSync(compiledPath, rendered);

console.log(`[recordings] base url: ${baseUrl}`);
console.log(`[recordings] compiled: ${compiledPath}`);
console.log(`[recordings] format:   ${format}`);

const args = [compiledPath, "--format", format, "-o", outDir, "--clean"];
if (process.env.HEADED === "1") args.push("--headed");
if (process.env.VERBOSE === "1") args.push("--verbose");

const child = spawn("bunx", ["testreel", ...args], {
  cwd: recordingsDir,
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => {
  if (code !== 0) process.exit(code ?? 1);

  const audioPath = process.env.AUDIO
    ? resolve(recordingsDir, process.env.AUDIO)
    : resolve(recordingsDir, "audio", "Launch Window.mp3");

  if (!existsSync(audioPath)) {
    console.log(`[recordings] no audio at ${audioPath}, skipping mux`);
    process.exit(0);
  }

  const latest = readdirSync(outDir)
    .filter((f) => f.endsWith(`.${format}`))
    .map((f) => ({ f, t: Number(f.match(/(\d+)\.[a-z0-9]+$/)?.[1] ?? 0) }))
    .sort((a, b) => b.t - a.t)[0]?.f;

  if (!latest) {
    console.log(`[recordings] no ${format} in output, skipping mux`);
    process.exit(0);
  }

  const video = resolve(outDir, latest);
  const tmp = resolve(outDir, `__tmp.${format}`);

  const probe = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", video],
    { encoding: "utf8" },
  );
  const duration = Number((probe.stdout ?? "").trim()) || 0;
  const fadeOutStart = Math.max(0, duration - 2.5);

  console.log(
    `[recordings] muxing audio: ${audioPath} (video=${duration.toFixed(2)}s, fade@${fadeOutStart.toFixed(2)}s)`,
  );
  const ff = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      video,
      "-i",
      audioPath,
      "-filter_complex",
      `[1:a]afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2[a]`,
      "-map",
      "0:v",
      "-map",
      "[a]",
      "-c:v",
      "copy",
      "-c:a",
      "aac",
      "-b:a",
      "192k",
      "-shortest",
      tmp,
    ],
    { stdio: "inherit" },
  );

  if (ff.status === 0) {
    renameSync(tmp, video);
    console.log(`[recordings] audio muxed -> ${video}`);
  } else {
    console.error("[recordings] ffmpeg failed");
    process.exit(ff.status ?? 1);
  }
  process.exit(0);
});
