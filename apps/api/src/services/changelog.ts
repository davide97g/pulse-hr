import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Release } from "@pulse-hr/shared/changelog";

const here = dirname(fileURLToPath(import.meta.url));
const changelogPath = resolve(here, "..", "data", "changelog.json");

let cache: Release[] | null = null;

/**
 * Lazily loads the build-time generated `changelog.json`. Cached in memory
 * for the lifetime of the process.
 */
export function loadReleases(): Release[] {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(changelogPath, "utf8")) as Release[];
  } catch (err) {
    console.warn(
      "[api/changelog] missing or invalid changelog.json — run `bun run changelog:build`.",
      err,
    );
    cache = [];
  }
  return cache;
}

export function latestRelease(): Release | null {
  const r = loadReleases();
  return r[0] ?? null;
}
