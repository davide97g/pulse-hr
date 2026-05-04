#!/usr/bin/env bun
/**
 * Drive a testreel recording for one spec.
 *
 * Pipeline:
 *   1. Load test credentials and template-substitute the spec.
 *   2. Inline `_setup.partial.json` if `"{{SETUP}}"` is present.
 *   3. Optionally spawn ghost-user Playwright sessions in parallel (for the
 *      feedback-live flow), reading `<spec>.ghosts.json` choreography.
 *   4. Run testreel against the compiled spec.
 *   5. Mux the configured background music track over the produced clip.
 *   6. Promote the clip + timeline + caption sidecar into
 *      `public/captures/<spec>/` for Remotion to consume.
 */
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  renameSync,
  copyFileSync,
} from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const studioDir = resolve(__dirname, "..", "..", "..");
const appDir = resolve(studioDir, "..", "app");
const specName = process.argv[2] ?? "kudos-copilot";
const format = process.env.FORMAT ?? "mp4";
const baseUrl = process.env.BASE_URL ?? "http://localhost:5173";
const feedbackBaseUrl = process.env.FEEDBACK_BASE_URL ?? "http://localhost:5174";
const enableGhosts = process.env.GHOSTS === "1";

const credsPath = resolve(appDir, "test.credentials.json");
if (!existsSync(credsPath)) {
  console.error(`missing ${credsPath}`);
  process.exit(1);
}
const credsRaw = JSON.parse(readFileSync(credsPath, "utf8"));
// Back-compat: support both flat `{email, password}` and nested
// `{ existing: {email, password}, new: {...}, ghosts: [...] }` shapes.
// Use CRED=new env var to pick the fresh-user slot for flows that need an
// un-onboarded account (workspace-create).
const credSlot = process.env.CRED ?? "existing";
const primary = credsRaw.email
  ? { email: credsRaw.email, password: credsRaw.password }
  : credsRaw[credSlot] ?? credsRaw.existing ?? credsRaw.new ?? null;
console.log(`[recordings] cred slot:    ${credsRaw.email ? "(flat)" : credSlot}`);
if (!primary?.email || !primary?.password) {
  console.error(`[recordings] no usable credentials in ${credsPath}`);
  process.exit(1);
}
const ghostCreds: Record<string, { email: string; password: string }> =
  credsRaw.ghosts ?? {};

const templatePath = resolve(studioDir, "specs", `${specName}.template.json`);
if (!existsSync(templatePath)) {
  console.error(`missing ${templatePath}`);
  process.exit(1);
}
let raw = readFileSync(templatePath, "utf8");

const setupPartialPath = resolve(studioDir, "specs", "_setup.partial.json");
if (existsSync(setupPartialPath) && raw.includes('"{{SETUP}}"')) {
  const setupBlock = readFileSync(setupPartialPath, "utf8").trim();
  raw = raw.replace('"{{SETUP}}"', setupBlock);
}

const rendered = raw
  .replaceAll("{{BASE_URL}}", baseUrl)
  .replaceAll("{{FEEDBACK_BASE_URL}}", feedbackBaseUrl)
  .replaceAll("{{TEST_EMAIL}}", primary.email)
  .replaceAll("{{TEST_PASSWORD}}", primary.password);

const outRoot = resolve(studioDir, "output");
const outDir = resolve(outRoot, specName);
mkdirSync(outDir, { recursive: true });

const compiledPath = resolve(outDir, `${specName}.json`);
writeFileSync(compiledPath, rendered);

console.log(`[recordings] base url:     ${baseUrl}`);
console.log(`[recordings] feedback url: ${feedbackBaseUrl}`);
console.log(`[recordings] compiled:     ${compiledPath}`);
console.log(`[recordings] format:       ${format}`);

// ─── Ghost users ──────────────────────────────────────────────────────────
const ghostsPath = resolve(studioDir, "specs", `${specName}.ghosts.json`);
const ghostProcesses: ChildProcess[] = [];
if (enableGhosts && existsSync(ghostsPath)) {
  const ghostsConfig = JSON.parse(readFileSync(ghostsPath, "utf8"));
  for (const ghost of ghostsConfig.ghosts ?? []) {
    const credPath = (ghost.credsKey ?? "").split(".");
    let creds: { email?: string; password?: string } | null = null;
    if (credPath[0] === "ghosts" && credPath[1] && ghostCreds[credPath[1]]) {
      creds = ghostCreds[credPath[1]];
    }
    if (!creds?.email || !creds?.password) {
      console.warn(`[ghost ${ghost.id}] no credentials at ${ghost.credsKey}, skipping`);
      continue;
    }
    const ghostScript = resolve(__dirname, "ghost.ts");
    const env = {
      ...process.env,
      GHOST_ID: ghost.id,
      GHOST_EMAIL: creds.email,
      GHOST_PASSWORD: creds.password,
      GHOST_IDENTITY: JSON.stringify(ghost.identity ?? {}),
      GHOST_ACTIONS: JSON.stringify(ghost.actions ?? []),
      FEEDBACK_BASE_URL: feedbackBaseUrl,
    };
    console.log(`[ghost ${ghost.id}] spawning`);
    const ghostProc = spawn("bun", [ghostScript], {
      cwd: studioDir,
      stdio: "inherit",
      env,
    });
    ghostProcesses.push(ghostProc);
  }
}

// ─── testreel ─────────────────────────────────────────────────────────────
const args = [compiledPath, "--format", format, "-o", outDir, "--clean"];
if (process.env.HEADED === "1") args.push("--headed");
if (process.env.VERBOSE === "1") args.push("--verbose");

const child = spawn("bunx", ["testreel", ...args], {
  cwd: studioDir,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  for (const g of ghostProcesses) {
    if (!g.killed) g.kill("SIGTERM");
  }
  if (code !== 0) process.exit(code ?? 1);

  // ─── Audio mux ──────────────────────────────────────────────────────────
  const audioPath = process.env.AUDIO
    ? resolve(studioDir, process.env.AUDIO)
    : resolve(studioDir, "audio", "Launch Window.mp3");

  const latest = readdirSync(outDir)
    .filter((f) => f.endsWith(`.${format}`) && !f.startsWith("__"))
    .map((f) => ({ f, t: Number(f.match(/(\d+)\.[a-z0-9]+$/)?.[1] ?? 0) }))
    .sort((a, b) => b.t - a.t)[0]?.f;

  if (!latest) {
    console.log(`[recordings] no ${format} in output, skipping`);
    process.exit(0);
  }

  const video = resolve(outDir, latest);

  if (existsSync(audioPath)) {
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
        "-y", "-i", video, "-i", audioPath,
        "-filter_complex",
        `[1:a]afade=t=in:st=0:d=1.5,afade=t=out:st=${fadeOutStart}:d=2[a]`,
        "-map", "0:v", "-map", "[a]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-shortest", tmp,
      ],
      { stdio: "inherit" },
    );

    if (ff.status === 0) {
      renameSync(tmp, video);
      console.log(`[recordings] audio muxed -> ${video}`);
    } else {
      console.error("[recordings] ffmpeg failed");
    }
  } else {
    console.log(`[recordings] no audio at ${audioPath}, skipping mux`);
  }

  // ─── Promote to public/captures ─────────────────────────────────────────
  const capturesDir = resolve(studioDir, "public", "captures", specName);
  mkdirSync(capturesDir, { recursive: true });
  const targetClip = resolve(capturesDir, `clip.${format}`);
  copyFileSync(video, targetClip);
  console.log(`[recordings] promoted -> ${targetClip}`);

  const timelinePath = resolve(outDir, "timeline.json");
  if (existsSync(timelinePath)) {
    copyFileSync(timelinePath, resolve(capturesDir, "timeline.json"));
  }

  // ─── Caption merge ──────────────────────────────────────────────────────
  const sidecarPath = resolve(studioDir, "specs", `${specName}.captions.json`);
  if (existsSync(sidecarPath) && existsSync(timelinePath)) {
    try {
      const sidecar = JSON.parse(readFileSync(sidecarPath, "utf8"));
      const timeline = JSON.parse(readFileSync(timelinePath, "utf8"));
      const stepStartMs: number[] = (timeline.steps ?? []).map(
        (s: { t: number }) => s.t,
      );
      const setupOffsetMs = stepStartMs[0] ?? 0;
      const timed = (sidecar.captions ?? [])
        .map((c: { atStep: number; text: string; holdMs: number }) => {
          const raw = stepStartMs[c.atStep];
          if (raw === undefined) return null;
          return {
            atMs: Math.max(0, raw - setupOffsetMs),
            holdMs: c.holdMs,
            text: c.text,
          };
        })
        .filter(Boolean);
      writeFileSync(
        resolve(capturesDir, "captions.timed.json"),
        JSON.stringify({ spec: specName, captions: timed }, null, 2),
      );
      console.log(`[recordings] captions merged -> ${capturesDir}/captions.timed.json`);
    } catch (err) {
      console.warn(`[recordings] caption merge failed:`, err);
    }
  }

  process.exit(0);
});
