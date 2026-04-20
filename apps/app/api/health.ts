import { json, methodNotAllowed } from "./_lib/errors.js";
import { serve } from "./_lib/serve.js";

/**
 * Public diagnostics for Vercel/serverless (no secrets returned).
 * GET https://<domain>/api/health
 */
async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL?.trim());
  const hasClerkSecret = Boolean(process.env.CLERK_SECRET_KEY?.trim());
  const hasClerkPublishable =
    Boolean(process.env.CLERK_PUBLISHABLE_KEY?.trim()) ||
    Boolean(process.env.VITE_CLERK_PUBLISHABLE_KEY?.trim());

  let neon: { reachable: boolean; error?: string } = { reachable: false };
  if (hasDatabaseUrl) {
    try {
      const { neon: createNeon } = await import("@neondatabase/serverless");
      const sql = createNeon(process.env.DATABASE_URL!);
      await sql`SELECT 1`;
      neon = { reachable: true };
    } catch (e) {
      neon = {
        reachable: false,
        error: e instanceof Error ? e.message : String(e),
      };
    }
  } else {
    neon = { reachable: false, error: "DATABASE_URL empty" };
  }

  const checks = {
    databaseUrl: hasDatabaseUrl,
    clerkSecretKey: hasClerkSecret,
    clerkPublishableKey: hasClerkPublishable,
  };

  const ok =
    checks.databaseUrl && checks.clerkSecretKey && checks.clerkPublishableKey && neon.reachable;

  return json({
    ok,
    checks,
    neon,
    runtime: process.version,
    hint: !checks.clerkSecretKey
      ? "Add CLERK_SECRET_KEY from Clerk Dashboard → API Keys → Secret keys (same instance as your publishable key)."
      : !neon.reachable
        ? "DATABASE_URL is set but TCP/HTTP to Neon failed — verify the connection string and that migrations ran on this database."
        : undefined,
  });
}

export default serve(handler);
