import { cors } from "hono/cors";

/**
 * CORS middleware. Whitelist rules:
 *
 *   1. In dev (`NODE_ENV !== "production"`), any `http://localhost:*` or
 *      `http://127.0.0.1:*` origin is always allowed — we don't want to
 *      juggle env vars while bouncing between Vite (5173) and Storybook /
 *      playwright (4173, 6006, …).
 *
 *   2. In every environment, origins listed in `CORS_ALLOWED_ORIGINS` are
 *      allowed. Each entry is either a literal origin
 *      (`https://app.pulsehr.it`) or a glob with a single `*`
 *      (`https://*.vercel.app`). Production servers set this to the live
 *      frontend URL(s); dev boxes usually leave it empty because of rule 1.
 *
 *   3. Requests without an Origin header (server-to-server, GitHub Actions
 *      cron) bypass CORS entirely — the browser doesn't add the header in
 *      those cases, so there's nothing to enforce.
 */
export function buildCors() {
  const isDev = process.env.NODE_ENV !== "production";
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "";
  const patterns = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toMatcher);

  return cors({
    origin: (origin) => {
      if (!origin) return "";
      if (isDev && isLocalhost(origin)) return origin;
      return patterns.some((match) => match(origin)) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["authorization", "content-type"],
    exposeHeaders: [],
    credentials: false,
    maxAge: 600,
  });
}

function isLocalhost(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/.test(origin);
}

function toMatcher(pattern: string): (origin: string) => boolean {
  if (!pattern.includes("*")) {
    return (o) => o === pattern;
  }
  const re = new RegExp(
    "^" +
      pattern.replace(/[.+?^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*") +
      "$",
  );
  return (o) => re.test(o);
}
