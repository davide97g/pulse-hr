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
 *      `captures/<spec>/` (Remotion publicDir) for Remotion to consume.
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
// apps/marketing/studio/recordings/scripts/run.ts → studio dir is two levels up.
const studioDir = resolve(__dirname, "..", "..");
const appDir = resolve(studioDir, "..", "..", "app");
const specName = process.argv[2] ?? "kudos-give";
const format = process.env.FORMAT ?? "mp4";
const baseUrl = process.env.BASE_URL ?? "http://localhost:5173";
const feedbackBaseUrl = process.env.FEEDBACK_BASE_URL ?? "http://localhost:5174";
const enableGhosts = process.env.GHOSTS === "1";
// MOBILE=1 swaps the spec to a real phone capture: portrait viewport, portrait
// outputSize, no macOS chrome, tighter padding, phone screen radius. Resulting
// artefact lands at captures/<spec>/clip.shorts.mp4 so Remotion can choose it
// for the shorts aspect.
const mobile = process.env.MOBILE === "1";
const variantSuffix = mobile ? ".shorts" : "";

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

const specsDir = resolve(studioDir, "recordings", "specs");
const templatePath = resolve(specsDir, `${specName}.template.json`);
if (!existsSync(templatePath)) {
  console.error(`missing ${templatePath}`);
  process.exit(1);
}
let raw = readFileSync(templatePath, "utf8");

const setupPartialPath = resolve(specsDir, "_setup.partial.json");
if (existsSync(setupPartialPath) && raw.includes('"{{SETUP}}"')) {
  const setupBlock = readFileSync(setupPartialPath, "utf8").trim();
  raw = raw.replace('"{{SETUP}}"', setupBlock);
}

// Trailer specs use SETUP_TRAILER. On MOBILE=1 we prefer the dedicated mobile
// setup partial (login → navigate to /?demo_workspace= which trips the
// dev-only WorkspaceMount bypass) so the recording doesn't depend on the
// onboarding dialog rendering correctly at narrow widths.
const setupTrailerDesktopPath = resolve(specsDir, "_setup-trailer.partial.json");
const setupTrailerMobilePath = resolve(specsDir, "_setup-trailer.mobile.partial.json");
const setupTrailerPath =
  mobile && existsSync(setupTrailerMobilePath)
    ? setupTrailerMobilePath
    : setupTrailerDesktopPath;
if (existsSync(setupTrailerPath) && raw.includes('"{{SETUP_TRAILER}}"')) {
  const setupBlock = readFileSync(setupTrailerPath, "utf8").trim();
  raw = raw.replace('"{{SETUP_TRAILER}}"', setupBlock);
}

let rendered = raw
  .replaceAll("{{BASE_URL}}", baseUrl)
  .replaceAll("{{FEEDBACK_BASE_URL}}", feedbackBaseUrl)
  .replaceAll("{{TEST_EMAIL}}", primary.email)
  .replaceAll("{{TEST_PASSWORD}}", primary.password);

// The "What's new" changelog modal pops on first sight of a new app version
// and would cover the recording. Suppress for every recording — `null` skips
// reseeding existing keys so per-spec overrides still win.
{
  const spec = JSON.parse(rendered);
  spec.localStorage = {
    "pulse.changelog.skip": "1",
    ...(spec.localStorage ?? {}),
  };
  if (mobile) {
    // 540×960 viewport (9:16 aspect) maps cleanly 2× to a 1080×1920 frame so
    // the recording fills it edge-to-edge — no dark borders for Remotion to
    // crop. Chrome + padding + radius are all stripped so the captured app
    // is the entire frame.
    spec.viewport = { width: 540, height: 960 };
    spec.outputSize = { width: 1080, height: 1920 };
    spec.chrome = { trafficLights: false, url: false, titleBarHeight: 0 };
    spec.background = {
      color: spec.background?.color ?? "#0a0a0f",
      padding: 0,
      borderRadius: 0,
    };
  }
  rendered = JSON.stringify(spec, null, 2);
}

const outRoot = resolve(studioDir, "output");
const outDir = resolve(outRoot, mobile ? `${specName}.shorts` : specName);
mkdirSync(outDir, { recursive: true });

const compiledPath = resolve(outDir, `${specName}${variantSuffix}.json`);
writeFileSync(compiledPath, rendered);

console.log(`[recordings] base url:     ${baseUrl}`);
console.log(`[recordings] feedback url: ${feedbackBaseUrl}`);
console.log(`[recordings] compiled:     ${compiledPath}`);
console.log(`[recordings] format:       ${format}`);
console.log(`[recordings] variant:      ${mobile ? "mobile / shorts (1080x1920)" : "desktop (1920x1080)"}`);

// ─── Ghost users ──────────────────────────────────────────────────────────
const ghostsPath = resolve(specsDir, `${specName}.ghosts.json`);
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

  // ─── Promote to captures/ (Remotion publicDir) ──────────────────────────
  // Desktop variant lands at clip.mp4. Mobile variant lands at clip.shorts.mp4,
  // alongside the desktop file — Remotion's shorts compositions pick the
  // portrait clip when present.
  const capturesDir = resolve(studioDir, "captures", specName);
  mkdirSync(capturesDir, { recursive: true });
  const targetClip = resolve(capturesDir, `clip${variantSuffix}.${format}`);
  copyFileSync(video, targetClip);
  console.log(`[recordings] promoted -> ${targetClip}`);

  const timelinePath = resolve(outDir, "timeline.json");
  if (existsSync(timelinePath)) {
    copyFileSync(
      timelinePath,
      resolve(capturesDir, `timeline${variantSuffix}.json`),
    );
  }

  // ─── Caption merge ──────────────────────────────────────────────────────
  // Shorts may carry their own caption sidecar (different wording for portrait
  // wrapping). If <spec>.shorts.captions.json exists it wins for MOBILE runs;
  // otherwise we fall back to the shared <spec>.captions.json so a mobile
  // recording is never caption-less.
  const sidecarShortsPath = resolve(specsDir, `${specName}.shorts.captions.json`);
  const sidecarSharedPath = resolve(specsDir, `${specName}.captions.json`);
  const sidecarPath =
    mobile && existsSync(sidecarShortsPath) ? sidecarShortsPath : sidecarSharedPath;
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
      const outName = `captions${variantSuffix}.timed.json`;
      writeFileSync(
        resolve(capturesDir, outName),
        JSON.stringify({ spec: specName, captions: timed }, null, 2),
      );
      console.log(`[recordings] captions merged -> ${capturesDir}/${outName}`);
    } catch (err) {
      console.warn(`[recordings] caption merge failed:`, err);
    }
  }

  process.exit(0);
});
