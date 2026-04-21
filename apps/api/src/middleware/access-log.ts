import type { MiddlewareHandler } from "hono";

/**
 * Access logger tuned for a public HTTP API on Render.
 *
 *   - 2xx/3xx        → single line: "<method> <path> <status> <ms>ms".
 *   - 4xx            → same line, `!` prefix, warn channel.
 *   - 5xx            → same line, `!` prefix, error channel.
 *   - 404            → suppressed. Public endpoints get constant scanner
 *                      traffic (phpMyAdmin, crypto/banking phishing kits,
 *                      leaked-credential probes). Hono answers 404 correctly
 *                      and there's no signal in logging every miss.
 *
 * If you need to audit 404s temporarily, set `LOG_404=1` to re-enable them.
 */
export function accessLog(): MiddlewareHandler {
  const log404 = process.env.LOG_404 === "1";
  return async (c, next) => {
    const start = performance.now();
    await next();
    const status = c.res.status;
    if (status === 404 && !log404) return;
    const ms = Math.round(performance.now() - start);
    const marker = status >= 400 ? "!" : " ";
    const line = `${marker} ${c.req.method.padEnd(6)} ${c.req.path} ${status} ${ms}ms`;
    if (status >= 500) console.error(line);
    else if (status >= 400) console.warn(line);
    else console.log(line);
  };
}
