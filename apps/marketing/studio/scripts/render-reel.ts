#!/usr/bin/env bun
/**
 * Render reels into apps/marketing/public/studio/reels/<flow>/<aspect>.mp4.
 *
 * Usage:
 *   bun studio/scripts/render-reel.ts                 → render every reel × aspect
 *   bun studio/scripts/render-reel.ts --all           → same
 *   bun studio/scripts/render-reel.ts kudos-give      → render reel-kudos-give-* in all aspects
 *   bun studio/scripts/render-reel.ts montage         → render montage-* in all aspects
 *   bun studio/scripts/render-reel.ts kudos-give 1080 → render only the HD landscape variant
 */
import { existsSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
// apps/marketing/studio/scripts/render-reel.ts → studio dir is one level up.
const studioDir = resolve(__dirname, "..");
const marketingDir = resolve(studioDir, "..");
const entry = resolve(studioDir, "remotion", "index.ts");

const FLOWS = [
  "kudos-give",
  "time-attendance-entry",
  "growth-checks",
  "growth-tour",
  "skills-tour",
  "comment-create",
  "comment-create-board",
  "comments-thread",
  "comments-thread-board",
  "workspace-create",
];
const ASPECTS = ["1080", "shorts", "square"];

const args = process.argv.slice(2);
const all = args.length === 0 || args.includes("--all");
const target = !all ? args[0] : null;
const aspectFilter = !all ? args[1] : null;

interface Job {
  composition: string;
  outPath: string;
}

const buildJobs = (): Job[] => {
  const jobs: Job[] = [];
  const aspects = aspectFilter ? [aspectFilter] : ASPECTS;

  if (all || target === "montage") {
    for (const a of aspects) {
      jobs.push({
        composition: `montage-${a}`,
        outPath: resolve(
          marketingDir,
          "public",
          "studio",
          "reels",
          "montage",
          `${a}.mp4`,
        ),
      });
    }
  }

  if (all || (target && target !== "montage")) {
    const flows = target && target !== "montage" ? [target] : FLOWS;
    for (const flow of flows) {
      if (!FLOWS.includes(flow)) {
        console.warn(`[render-reel] unknown flow: ${flow}`);
        continue;
      }
      for (const a of aspects) {
        const capture = resolve(
          studioDir,
          "captures",
          flow,
          "clip.mp4",
        );
        if (!existsSync(capture)) {
          console.warn(`[render-reel] skip ${flow} (${a}) — no capture at ${capture}`);
          continue;
        }
        jobs.push({
          composition: `reel-${flow}-${a}`,
          outPath: resolve(
            marketingDir,
            "public",
            "studio",
            "reels",
            flow,
            `${a}.mp4`,
          ),
        });
      }
    }
  }

  return jobs;
};

const jobs = buildJobs();
if (jobs.length === 0) {
  console.log("[render-reel] no jobs");
  process.exit(0);
}

console.log(`[render-reel] ${jobs.length} job(s)`);
let failed = 0;
for (const job of jobs) {
  mkdirSync(dirname(job.outPath), { recursive: true });
  console.log(`  → ${job.composition} → ${job.outPath}`);
  const r = spawnSync(
    "bun",
    [
      "remotion",
      "render",
      entry,
      job.composition,
      job.outPath,
      "--codec=h264",
      "--crf=20",
    ],
    { stdio: "inherit", cwd: marketingDir },
  );
  if (r.status !== 0) {
    failed += 1;
    console.error(`[render-reel] failed: ${job.composition}`);
  }
}
process.exit(failed > 0 ? 1 : 0);
