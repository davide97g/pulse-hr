#!/usr/bin/env bun
/**
 * Emits the OpenAPI 3.1 spec to apps/api/openapi.json so consumers can grab
 * the contract without running the API. Runs as part of `prebuild` and is
 * the source of truth for client codegen.
 *
 * The same spec is also served live at GET /openapi.json — this script just
 * pulls the in-memory spec from the app and writes it to disk.
 */
import { writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { app } from "../src/index.ts";
import { docInfo } from "../src/openapi/registry.ts";

const here = dirname(fileURLToPath(import.meta.url));
const apiDir = resolve(here, "..");
const out = resolve(apiDir, "openapi.json");

const doc = app.getOpenAPI31Document(docInfo);

// Stable, pretty-printed JSON. Trailing newline so the file is POSIX-clean and
// re-running the script produces no diff.
writeFileSync(out, JSON.stringify(doc, null, 2) + "\n");

const operationCount = Object.values(doc.paths ?? {}).reduce(
  (sum, methods) => sum + Object.keys(methods ?? {}).length,
  0,
);
console.log(`[openapi] wrote ${operationCount} operation(s) → ${out}`);

// The import of ../src/index.ts has a side effect: it logs the listen line and
// would keep the Bun server alive. Force-exit so the prebuild step terminates.
process.exit(0);
