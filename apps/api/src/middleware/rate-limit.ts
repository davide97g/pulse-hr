import type { MiddlewareHandler } from "hono";

/**
 * Lightweight per-IP rate limiter. In-memory sliding window — fine for a single
 * Render instance. If we ever scale horizontally, swap the store for Redis.
 *
 * Used to protect public, unauthenticated endpoints from accidental or
 * malicious overuse (e.g. the SignedOutGate hero stats).
 */
type Bucket = { count: number; resetAt: number };

const stores = new WeakMap<object, Map<string, Bucket>>();

function getStore(key: object): Map<string, Bucket> {
  let s = stores.get(key);
  if (!s) {
    s = new Map();
    stores.set(key, s);
  }
  return s;
}

function clientIp(c: Parameters<MiddlewareHandler>[0]): string {
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return c.req.header("x-real-ip") ?? "unknown";
}

export function rateLimit(opts: {
  /** Max requests per window per IP. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
  /** Optional namespace so different routes don't share a bucket. */
  key?: string;
}): MiddlewareHandler {
  const namespace = { tag: opts.key ?? "default" };
  const store = getStore(namespace);

  return async (c, next) => {
    const ip = clientIp(c);
    const now = Date.now();
    const bucket = store.get(ip);

    if (!bucket || bucket.resetAt <= now) {
      store.set(ip, { count: 1, resetAt: now + opts.windowMs });
    } else if (bucket.count >= opts.limit) {
      const retry = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      c.header("Retry-After", String(retry));
      c.header("X-RateLimit-Limit", String(opts.limit));
      c.header("X-RateLimit-Remaining", "0");
      c.header("X-RateLimit-Reset", String(Math.ceil(bucket.resetAt / 1000)));
      return c.json(
        { error: { code: "rate_limited", message: "too many requests" } },
        429,
      );
    } else {
      bucket.count += 1;
    }

    const current = store.get(ip)!;
    c.header("X-RateLimit-Limit", String(opts.limit));
    c.header("X-RateLimit-Remaining", String(Math.max(0, opts.limit - current.count)));
    c.header("X-RateLimit-Reset", String(Math.ceil(current.resetAt / 1000)));

    // Opportunistic GC: prune expired entries when the map grows.
    if (store.size > 5000) {
      for (const [k, v] of store) if (v.resetAt <= now) store.delete(k);
    }

    await next();
  };
}
