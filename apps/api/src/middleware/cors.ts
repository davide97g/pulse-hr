import { cors } from "hono/cors";

/**
 * CORS middleware driven by `CORS_ALLOWED_ORIGINS` (comma-separated).
 *
 * Each entry is either a literal origin (`https://pulse.example.com`) or a
 * glob with a single `*` (`https://*.vercel.app`). Requests without an
 * Origin header (e.g. server-to-server, GitHub Actions cron) are always
 * allowed — they don't trigger CORS in the first place.
 */
export function buildCors() {
  const raw = process.env.CORS_ALLOWED_ORIGINS ?? "http://localhost:5173";
  const patterns = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(toMatcher);

  return cors({
    origin: (origin) => {
      if (!origin) return "";
      return patterns.some((match) => match(origin)) ? origin : null;
    },
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["authorization", "content-type"],
    exposeHeaders: [],
    credentials: false,
    maxAge: 600,
  });
}

function toMatcher(pattern: string): (origin: string) => boolean {
  if (!pattern.includes("*")) {
    return (o) => o === pattern;
  }
  const re = new RegExp(
    "^" +
      pattern
        .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
        .replace(/\*/g, ".*") +
      "$",
  );
  return (o) => re.test(o);
}
