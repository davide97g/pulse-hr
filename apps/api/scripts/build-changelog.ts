#!/usr/bin/env bun
/**
 * Parses the repo-root CHANGELOG.md into apps/api/src/data/changelog.json so
 * the `/changelog` routes can serve release entries without parsing markdown
 * at request time. Runs automatically as a prebuild step.
 *
 * Section format:
 *   ## <version> — <YYYY-MM-DD> — "<title>"
 *   <markdown body>
 *   (optional fenced ```tour ... ``` with embedded Tour JSON)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Release } from "@pulse-hr/shared/changelog";

const here = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(here, "..");
const repoRoot = resolve(apiDir, "..", "..");
const src = resolve(repoRoot, "CHANGELOG.md");
const outDir = resolve(apiDir, "src", "data");
const out = resolve(outDir, "changelog.json");

const raw = readFileSync(src, "utf8");

const sections = raw
  .split(/\n(?=##\s+)/g)
  .map((s) => s.trim())
  .filter((s) => /^##\s+/.test(s));

const HEADING_RE = /^##\s+([0-9]+\.[0-9]+\.[0-9]+)\s+—\s+(\d{4}-\d{2}-\d{2})\s+—\s+"([^"]+)"/;
const TOUR_RE = /```tour\s+([\s\S]*?)```/;

const releases: Release[] = [];
for (const section of sections) {
  const heading = section.match(HEADING_RE);
  if (!heading) continue;
  const [, version, date, title] = heading;
  const afterHeading = section.replace(/^##\s+.+$/m, "").trim();

  let tour: Release["tour"] = null;
  const tourMatch = afterHeading.match(TOUR_RE);
  let bodyMarkdown = afterHeading;
  if (tourMatch) {
    try {
      tour = JSON.parse(tourMatch[1]);
    } catch (err) {
      console.warn(`[changelog] invalid tour JSON in ${version}:`, err);
    }
    bodyMarkdown = afterHeading.replace(TOUR_RE, "").trim();
  }

  releases.push({ version, date, title, bodyMarkdown, tour });
}

releases.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

mkdirSync(outDir, { recursive: true });
writeFileSync(out, JSON.stringify(releases, null, 2) + "\n");
console.log(`[changelog] wrote ${releases.length} release(s) → ${out}`);
