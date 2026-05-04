#!/usr/bin/env bun
/**
 * Audit + fix per CONVENTIONS.md §6:
 *   - Collapse `{zoom selector=X scale=S}` immediately followed by
 *     `{click selector=X}` into a single `{click selector=X zoom=S}`.
 *   - Strip decorative standalone zoom steps (main, text=*, xpath following).
 *   - Drop redundant `zoom scale=1` resets that immediately follow another reset.
 *
 * Idempotent. Run again after editing specs.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specsDir = resolve(__dirname, "..", "specs");

const DECORATIVE_SELECTORS = [
  /^main$/,
  /^text=/,
  /xpath=following/,
];

const isDecorative = (sel: string | undefined) =>
  !!sel && DECORATIVE_SELECTORS.some((rx) => rx.test(sel));

const transformSteps = (steps: any[]): { steps: any[]; removed: number; collapsed: number } => {
  const out: any[] = [];
  let collapsed = 0;
  let removed = 0;

  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    const next = steps[i + 1];

    // Drop decorative zoom-into-label.
    if (s?.action === "zoom" && isDecorative(s.selector)) {
      removed += 1;
      // Also drop the matching reset that usually follows a few steps later if it's the next step.
      if (next?.action === "zoom" && next.scale === 1 && !next.selector) {
        removed += 1;
        i += 1;
      }
      continue;
    }

    // Collapse zoom→click on same selector.
    if (
      s?.action === "zoom"
      && s.selector
      && next?.action === "click"
      && next.selector === s.selector
      && typeof s.scale === "number"
      && s.scale > 1
    ) {
      out.push({ ...next, zoom: s.scale });
      collapsed += 1;
      i += 1; // skip the click we just absorbed
      continue;
    }

    // Drop redundant adjacent {zoom scale=1} resets.
    const last = out[out.length - 1];
    if (
      s?.action === "zoom"
      && s.scale === 1
      && !s.selector
      && last?.action === "zoom"
      && last.scale === 1
      && !last.selector
    ) {
      removed += 1;
      continue;
    }

    out.push(s);
  }

  return { steps: out, removed, collapsed };
};

const files = readdirSync(specsDir).filter(
  (f) => f.endsWith(".template.json") && !f.startsWith("_"),
);

let totalCollapsed = 0;
let totalRemoved = 0;
let touched = 0;

for (const f of files) {
  const path = resolve(specsDir, f);
  const json = JSON.parse(readFileSync(path, "utf8"));

  let perFileCollapsed = 0;
  let perFileRemoved = 0;

  if (Array.isArray(json.steps)) {
    const r = transformSteps(json.steps);
    json.steps = r.steps;
    perFileCollapsed += r.collapsed;
    perFileRemoved += r.removed;
  }
  if (json.setup?.steps && Array.isArray(json.setup.steps)) {
    const r = transformSteps(json.setup.steps);
    json.setup.steps = r.steps;
    perFileCollapsed += r.collapsed;
    perFileRemoved += r.removed;
  }

  if (perFileCollapsed > 0 || perFileRemoved > 0) {
    writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
    console.log(`  ✎ ${f}  collapsed=${perFileCollapsed}  removed=${perFileRemoved}`);
    touched += 1;
    totalCollapsed += perFileCollapsed;
    totalRemoved += perFileRemoved;
  }
}

console.log(
  `[sweep-zoom] ${touched}/${files.length} spec(s) updated · collapsed=${totalCollapsed} removed=${totalRemoved}`,
);
