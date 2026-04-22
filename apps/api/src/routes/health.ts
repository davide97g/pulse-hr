import { Hono } from "hono";
import { neon } from "@neondatabase/serverless";

export const health = new Hono();

/** Public diagnostics. No secrets leaked. */
health.get("/", async (c) => {
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY?.trim());

  let neonCheck: { reachable: boolean; error?: string } = { reachable: false };
  if (hasDatabaseUrl) {
    try {
      const sql = neon(process.env.DATABASE_URL!);
      await sql`SELECT 1`;
      neonCheck = { reachable: true };
    } catch (e) {
      neonCheck = { reachable: false, error: e instanceof Error ? e.message : String(e) };
    }
  } else {
    neonCheck = { reachable: false, error: "DATABASE_URL empty" };
  }

  const checks = {
    databaseUrl: hasDatabaseUrl,
    clerkSecretKey: hasClerkSecret,
    resendKey: Boolean(process.env.RESEND_API_KEY?.trim()),
    cronSecret: Boolean(process.env.CRON_SECRET?.trim()),
    r2Configured: Boolean(
      process.env.R2_ACCOUNT_ID &&
      process.env.R2_ACCESS_KEY_ID &&
      process.env.R2_SECRET_ACCESS_KEY &&
      process.env.R2_BUCKET &&
      process.env.R2_PUBLIC_BASE_URL,
    ),
  };

  const ok = checks.databaseUrl && checks.clerkSecretKey && neonCheck.reachable;

  return c.json({
    ok,
    service: "@pulse-hr/api",
    checks,
    neon: neonCheck,
    runtime: typeof Bun !== "undefined" ? `bun ${Bun.version}` : process.version,
  });
});
