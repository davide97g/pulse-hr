/**
 * Returns every release from the build-time generated `changelog.json`.
 * No auth required — changelog is public product information.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";

const here = dirname(fileURLToPath(import.meta.url));
const changelogPath = resolve(here, "..", "_data", "changelog.json");

let cache: unknown | null = null;
function loadChangelog(): unknown {
  if (cache) return cache;
  try {
    cache = JSON.parse(readFileSync(changelogPath, "utf8"));
  } catch (err) {
    console.warn("[api/changelog] missing or invalid changelog.json — run `bun run changelog:build`.", err);
    cache = [];
  }
  return cache;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);
  try {
    return json({ releases: loadChangelog() });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
