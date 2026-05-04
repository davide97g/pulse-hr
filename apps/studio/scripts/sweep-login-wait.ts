#!/usr/bin/env bun
/**
 * Inject a `wait waitFor=input[type=password]` step between the email and
 * password fields of every spec touching Clerk's staged login form.
 *
 * Why: Clerk shows email first, transitions to password after the email is
 * accepted client-side. Without an explicit wait, testreel's default 5s
 * selector timeout races the transition and step 5 fails.
 *
 * Idempotent — skips specs that already have a guard step.
 */
import { readdirSync, readFileSync, writeFileSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const specsDir = resolve(__dirname, "..", "specs");

const EMAIL_SEL = "input[type=email]";
const PASSWORD_SEL = "input[type=password]";

const GUARD_STEP = {
  action: "wait" as const,
  ms: 400,
  waitFor: PASSWORD_SEL,
  timeout: 15000,
};

const isEmailType = (s: any) =>
  s
  && (s.action === "type" || s.action === "fill")
  && s.selector === EMAIL_SEL;
const isPasswordType = (s: any) =>
  s
  && (s.action === "type" || s.action === "fill")
  && s.selector === PASSWORD_SEL;
const isPasswordWait = (s: any) =>
  s?.action === "wait" && s.waitFor === PASSWORD_SEL;

function patch(steps: any[]): { steps: any[]; added: number } {
  if (!Array.isArray(steps)) return { steps, added: 0 };
  const out: any[] = [];
  let added = 0;

  for (let i = 0; i < steps.length; i++) {
    out.push(steps[i]);
    if (!isEmailType(steps[i])) continue;

    // Find the next password type/fill, looking past intervening waits/zooms.
    let j = i + 1;
    while (j < steps.length && !isPasswordType(steps[j])) {
      if (isPasswordWait(steps[j])) {
        // already guarded
        j = -1;
        break;
      }
      j += 1;
    }
    if (j === -1) continue;
    if (j >= steps.length) continue;

    // Insert guard immediately after the email step.
    out.push({ ...GUARD_STEP });
    added += 1;
  }

  return { steps: out, added };
}

const files = readdirSync(specsDir).filter((f) =>
  f.endsWith(".json") && statSync(resolve(specsDir, f)).isFile(),
);

let totalAdded = 0;
let touched = 0;
for (const f of files) {
  const path = resolve(specsDir, f);
  const json = JSON.parse(readFileSync(path, "utf8"));

  let added = 0;
  if (Array.isArray(json.steps)) {
    const r = patch(json.steps);
    json.steps = r.steps;
    added += r.added;
  }
  if (json.setup?.steps) {
    const r = patch(json.setup.steps);
    json.setup.steps = r.steps;
    added += r.added;
  }
  // For _setup.partial.json the steps live at the root.
  if (Array.isArray(json.steps) === false && json.setup === undefined) {
    // already handled above (root .steps); _setup.partial.json has top-level
    // .steps too, so this branch is just defensive.
  }

  if (added > 0) {
    writeFileSync(path, JSON.stringify(json, null, 2) + "\n");
    console.log(`  ✎ ${f}  +${added} guard(s)`);
    touched += 1;
    totalAdded += added;
  }
}

console.log(`[sweep-login-wait] ${touched}/${files.length} file(s) updated · added=${totalAdded}`);
