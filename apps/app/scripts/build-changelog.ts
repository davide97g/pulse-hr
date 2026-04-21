#!/usr/bin/env bun
/**
 * Parses apps/app/CHANGELOG.md into api/_data/changelog.json so API handlers
 * can serve release entries without reading markdown at runtime.
 *
 * Expected section format:
 *   ## <version> — <date (YYYY-MM-DD)> — "<title>"
 *   <markdown body lines>
 *   (optional fenced ```tour ... ``` block with embedded Tour JSON)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const appDir = resolve(here, "..");
const src = resolve(appDir, "CHANGELOG.md");
const outDir = resolve(appDir, "api", "_data");
const out = resolve(outDir, "changelog.json");

type Release = {
  version: string;
  date: string;
  title: string;
  bodyMarkdown: string;
  tour: unknown | null;
};

const raw = readFileSync(src, "utf8");

// Split on `## ` at the start of a line. Keep the heading with each chunk.
const sections = raw
  .split(/\n(?=##\s+)/g)
  .map((s) => s.trim())
  .filter((s) => /^##\s+/.test(s));

const HEADING_RE = /^##\s+([0-9]+\.[0-9]+\.[0-9]+)\s+—\s+(\d{4}-\d{2}-\d{2})\s+—\s+"([^"]+)"/;
const TOUR_RE = /```tour\s+([\s\S]*?)```/;

const releases: Release[] = [];
for (const section of sections) {
  const heading = section.match(HEADING_RE);
  if (!heading) {
    // Non-release heading (e.g. "## Legend") — skip.
    continue;
  }
  const [, version, date, title] = heading;
  const afterHeading = section.replace(/^##\s+.+$/m, "").trim();

  let tour: unknown | null = null;
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
