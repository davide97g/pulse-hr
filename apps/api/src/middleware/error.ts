import type { ErrorHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Global error handler. Honors HTTPException status/message; everything else
 * becomes a 500 with a sanitized message (raw SQL leaks get redacted so
 * Drizzle/Postgres error text never lands in a client response).
 */
export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  console.error("[api] unhandled error:", err);
  const raw = err instanceof Error ? err.message : "unknown";
  const looksLikeSql = /(^|\s)(select|insert|update|delete|failed query)/i.test(raw);
  const message = looksLikeSql
    ? "Database query failed. Check server logs and that migrations have run."
    : raw;
  return c.json({ error: { code: "server_error", message } }, 500);
};
