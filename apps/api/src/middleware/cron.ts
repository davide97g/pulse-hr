import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

/**
 * Guards /cron/* routes. Only accepts requests whose Authorization header
 * matches `Bearer ${CRON_SECRET}`. GitHub Actions scheduled workflows send
 * this header.
 */
export const requireCronSecret: MiddlewareHandler = async (c, next) => {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    throw new HTTPException(503, {
      res: new Response(
        JSON.stringify({
          error: { code: "cron_secret_missing", message: "CRON_SECRET is not configured" },
        }),
        { status: 503, headers: { "content-type": "application/json" } },
      ),
    });
  }
  const header = c.req.header("authorization") ?? "";
  if (header !== `Bearer ${secret}`) {
    throw new HTTPException(401, {
      res: new Response(
        JSON.stringify({
          error: { code: "unauthorized", message: "cron auth required" },
        }),
        { status: 401, headers: { "content-type": "application/json" } },
      ),
    });
  }
  await next();
};
