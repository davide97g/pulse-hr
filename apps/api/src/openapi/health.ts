import { neon } from "@neondatabase/serverless";
import { createRoute } from "@hono/zod-openapi";
import { createApp, jsonContent, z } from "./registry.ts";

export const health = createApp();

const NeonCheckSchema = z
  .object({
    reachable: z.boolean(),
    error: z.string().optional(),
  })
  .openapi("NeonCheck");

const HealthChecksSchema = z
  .object({
    databaseUrl: z.boolean(),
    clerkSecretKey: z.boolean(),
    resendKey: z.boolean(),
    cronSecret: z.boolean(),
    r2Configured: z.boolean(),
  })
  .openapi("HealthChecks");

const HealthResponseSchema = z
  .object({
    ok: z.boolean().openapi({ description: "True iff database, Clerk, and Neon are all healthy" }),
    service: z.literal("@pulse-hr/api"),
    checks: HealthChecksSchema,
    neon: NeonCheckSchema,
    runtime: z.string().openapi({ example: "bun 1.3.11" }),
  })
  .openapi("HealthResponse");

const route = createRoute({
  method: "get",
  path: "/",
  tags: ["system"],
  summary: "Service health check",
  description:
    "Public diagnostics endpoint. Returns environment configuration flags and a live Neon connectivity probe. No secrets are leaked — only booleans indicating whether keys are present.",
  responses: {
    200: jsonContent(HealthResponseSchema, "Health snapshot"),
  },
});

health.openapi(route, async (c) => {
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

  return c.json(
    {
      ok,
      service: "@pulse-hr/api" as const,
      checks,
      neon: neonCheck,
      runtime: typeof Bun !== "undefined" ? `bun ${Bun.version}` : process.version,
    },
    200,
  );
});
