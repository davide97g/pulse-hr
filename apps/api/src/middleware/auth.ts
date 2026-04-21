import { createClerkClient, verifyToken } from "@clerk/backend";
import type { MiddlewareHandler } from "hono";
import { HTTPException } from "hono/http-exception";

export type AuthedUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  role: string | null;
};

declare module "hono" {
  interface ContextVariableMap {
    user: AuthedUser;
  }
}

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey =
  process.env.CLERK_PUBLISHABLE_KEY ?? process.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!secretKey) {
  console.warn("[api/auth] CLERK_SECRET_KEY is not set — /api requests will fail with 401.");
}

const clerk = secretKey ? createClerkClient({ secretKey, publishableKey }) : null;

/**
 * Requires a valid Clerk bearer token. Attaches the user to `c.var.user` so
 * downstream handlers can read it with `c.get("user")`.
 */
export const requireUser: MiddlewareHandler = async (c, next) => {
  if (!secretKey) {
    throw new HTTPException(503, {
      res: jsonError(503, {
        code: "clerk_secret_missing",
        message:
          "Set CLERK_SECRET_KEY on the server. The publishable key alone is not enough.",
      }),
    });
  }
  const header = c.req.header("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    throw new HTTPException(401, {
      res: jsonError(401, {
        code: "no_bearer_token",
        message: "Authorization header missing or malformed",
      }),
    });
  }
  const token = match[1];
  let userId: string;
  let claims: Record<string, unknown>;
  try {
    const payload = await verifyToken(token, { secretKey });
    userId = payload.sub as string;
    if (!userId) throw new Error("token missing sub");
    claims = payload as Record<string, unknown>;
  } catch (err) {
    const message = err instanceof Error ? err.message : "token verification failed";
    if (process.env.NODE_ENV !== "production") {
      console.warn("[api/auth] verifyToken failed:", message);
    }
    throw new HTTPException(401, {
      res: jsonError(401, { code: "token_verify_failed", message }),
    });
  }

  const claimName = claims.name as string | undefined;
  const claimAvatar =
    (claims.picture as string | undefined) ?? (claims.image_url as string | undefined);
  const claimEmail = claims.email as string | undefined;
  const claimRole =
    (claims.role as string | undefined) ??
    ((claims.public_metadata as Record<string, unknown> | undefined)?.role as string | undefined);

  let name = claimName;
  let avatarUrl = claimAvatar ?? null;
  let email = claimEmail ?? null;
  let role = claimRole ?? null;

  if ((!name || !email) && clerk) {
    try {
      const user = await clerk.users.getUser(userId);
      name =
        name ||
        user.fullName ||
        user.firstName ||
        user.emailAddresses[0]?.emailAddress.split("@")[0] ||
        "Someone";
      avatarUrl = avatarUrl ?? user.imageUrl ?? null;
      email = email ?? user.emailAddresses[0]?.emailAddress ?? null;
      role =
        role ??
        ((user.publicMetadata as Record<string, unknown> | undefined)?.role as string | null) ??
        null;
    } catch {
      /* proceed with whatever we have */
    }
  }

  c.set("user", {
    id: userId,
    name: name || "Someone",
    avatarUrl: avatarUrl ?? null,
    email: email ?? null,
    role: role ?? null,
  });
  await next();
};

export function isAdmin(user: AuthedUser): boolean {
  if (user.role === "admin") return true;
  const allowlist = (process.env.FEEDBACK_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length && user.email && allowlist.includes(user.email.toLowerCase())) return true;
  return false;
}

function jsonError(status: number, body: { code: string; message?: string }): Response {
  return new Response(JSON.stringify({ error: body }), {
    status,
    headers: { "content-type": "application/json" },
  });
}
