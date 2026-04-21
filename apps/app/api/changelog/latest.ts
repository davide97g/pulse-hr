/** Returns just the newest release (or null). Used by ChangelogGate on boot. */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";

const here = dirname(fileURLToPath(import.meta.url));
const changelogPath = resolve(here, "..", "_data", "changelog.json");

let cache: unknown[] | null = null;
function loadReleases(): unknown[] {
  if (cache) return cache;
  try {
    const parsed = JSON.parse(readFileSync(changelogPath, "utf8"));
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  return cache;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  try {
    const releases = loadReleases();
    return json({ release: releases[0] ?? null });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
