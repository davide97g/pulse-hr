#!/usr/bin/env bun
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const recordingsDir = resolve(__dirname, "..");
const appDir = resolve(recordingsDir, "..");
const specName = process.argv[2] ?? "kudos-copilot";
const format = process.env.FORMAT ?? "mp4";
const baseUrl = process.env.BASE_URL ?? "http://localhost:5173";

const credsPath = resolve(appDir, "test.credentials.json");
if (!existsSync(credsPath)) {
  console.error(`missing ${credsPath}`);
  process.exit(1);
}
const { email, password } = JSON.parse(readFileSync(credsPath, "utf8"));

const templatePath = resolve(recordingsDir, "specs", `${specName}.template.json`);
if (!existsSync(templatePath)) {
  console.error(`missing ${templatePath}`);
  process.exit(1);
}
let raw = readFileSync(templatePath, "utf8");

const setupPartialPath = resolve(recordingsDir, "specs", "_setup.partial.json");
if (existsSync(setupPartialPath) && raw.includes('"{{SETUP}}"')) {
  const setupBlock = readFileSync(setupPartialPath, "utf8").trim();
  raw = raw.replace('"{{SETUP}}"', setupBlock);
}

const rendered = raw
  .replaceAll("{{BASE_URL}}", baseUrl)
  .replaceAll("{{TEST_EMAIL}}", email)
  .replaceAll("{{TEST_PASSWORD}}", password);

const outRoot = resolve(recordingsDir, "output");
const outDir = resolve(outRoot, specName);
mkdirSync(outDir, { recursive: true });
const compiledPath = resolve(outDir, `${specName}.json`);
writeFileSync(compiledPath, rendered);

console.log(`[recordings] base url: ${baseUrl}`);
console.log(`[recordings] compiled: ${compiledPath}`);
console.log(`[recordings] format:   ${format}`);

const args = [compiledPath, "--format", format, "-o", outDir, "--clean"];
if (process.env.HEADED === "1") args.push("--headed");
if (process.env.VERBOSE === "1") args.push("--verbose");

const child = spawn("bunx", ["testreel", ...args], {
  cwd: recordingsDir,
  stdio: "inherit",
  env: process.env,
});
child.on("exit", (code) => process.exit(code ?? 0));
