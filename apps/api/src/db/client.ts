import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema.ts";

// `scripts/build-openapi.ts` imports the full app graph without a DB. CI/root
// `bun run build` runs that prebuild without secrets. Production (Render) and
// local dev must set DATABASE_URL; the placeholder is only for module init.
const url =
  process.env.DATABASE_URL ??
  "postgresql://build_placeholder:unused@127.0.0.1:5432/postgres";

const client = neon(url);
export const db = drizzle(client, { schema });
export { schema };
