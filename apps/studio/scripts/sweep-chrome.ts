#!/usr/bin/env bun
/**
 * One-shot sweep — applies CONVENTIONS.md chrome + localStorage rules to every
 * *.template.json in apps/studio/specs/. Idempotent. Run again after editing.
 */
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specsDir = resolve(__dirname, "..", "specs");

const CANONICAL_CHROME = {
  trafficLights: true,
  url: false,
  titleBarColor: "#0a0a0f",
  titleBarHeight: 32,
};

const CANONICAL_BACKGROUND = {
  color: "#0a0a0f",
  padding: 60,
  borderRadius: 12,
};

const CANONICAL_CURSOR = {
  enabled: true,
  style: "default",
  rippleColor: "#9b87ff",
  transitionMs: 320,
};

const CANONICAL_LOCAL_STORAGE_KEYS: Record<string, string> = {
  "pulse.theme": "employee",
  "pulse.devBanner": "false",
  "pulse.tours.completed": '["all"]',
  "pulse.skipBoot": "1",
};

const files = readdirSync(specsDir).filter(
  (f) => f.endsWith(".template.json") && !f.startsWith("_"),
);

let touched = 0;
for (const f of files) {
  const path = resolve(specsDir, f);
  const raw = readFileSync(path, "utf8");
  const json = JSON.parse(raw);

  const before = JSON.stringify(json);

  json.chrome = { ...CANONICAL_CHROME };
  json.background = { ...CANONICAL_BACKGROUND };
  json.cursor = { ...CANONICAL_CURSOR };

  json.localStorage = {
    ...CANONICAL_LOCAL_STORAGE_KEYS,
    ...(json.localStorage ?? {}),
  };
  // CONVENTIONS overrides explicit values for the canonical keys, in case a spec
  // had a stale value:
  for (const k of Object.keys(CANONICAL_LOCAL_STORAGE_KEYS)) {
    json.localStorage[k] = CANONICAL_LOCAL_STORAGE_KEYS[k];
  }

  const after = JSON.stringify(json);
  if (after !== before) {
    writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
    touched += 1;
    console.log(`  ✎ ${f}`);
  }
}

console.log(`[sweep-chrome] ${touched}/${files.length} spec(s) updated`);
