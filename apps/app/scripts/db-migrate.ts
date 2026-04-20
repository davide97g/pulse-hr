import { readdir, readFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const sql = neon(url);
const here = dirname(fileURLToPath(import.meta.url));
const migrationsDir = resolve(here, "..", "drizzle");

const files = (await readdir(migrationsDir))
  .filter((f) => f.endsWith(".sql"))
  .sort();

if (files.length === 0) {
  console.log("No migration files found.");
  process.exit(0);
}

for (const file of files) {
  const path = resolve(migrationsDir, file);
  const body = await readFile(path, "utf8");
  const statements = body
    .split(/-->\s*statement-breakpoint/gi)
    .map((s) => s.trim())
    .filter(Boolean);
  console.log(`▶ ${file} — ${statements.length} statement(s)`);
  for (const stmt of statements) {
    try {
      await sql.query(stmt);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (/already exists/i.test(msg)) {
        console.log(`  ↳ skip (already exists)`);
        continue;
      }
      console.error(`  ✗ ${msg}`);
      console.error(`    in:\n${stmt.slice(0, 200)}…`);
      process.exit(1);
    }
  }
  console.log(`  ✓ ${file}`);
}

console.log("Migrations applied.");
