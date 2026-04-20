import { createClerkClient, verifyToken } from "@clerk/backend";

const secretKey = process.env.CLERK_SECRET_KEY;
const publishableKey = process.env.CLERK_PUBLISHABLE_KEY ?? process.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!secretKey) {
  console.warn(
    "[api/auth] CLERK_SECRET_KEY is not set — /api requests will fail with 401.",
  );
}

const clerk = secretKey ? createClerkClient({ secretKey, publishableKey }) : null;

export type AuthedUser = {
  id: string;
  name: string;
  avatarUrl: string | null;
  email: string | null;
  role: string | null;
};

export async function requireUser(request: Request): Promise<AuthedUser | Response> {
  if (!secretKey) {
    return new Response(
      JSON.stringify({ error: { code: "server_misconfigured", message: "Clerk secret key missing" } }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }
  const header = request.headers.get("authorization") ?? "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) {
    return new Response(JSON.stringify({ error: { code: "unauthorized" } }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
  const token = match[1];
  try {
    const payload = await verifyToken(token, { secretKey });
    const userId = payload.sub;
    if (!userId) throw new Error("token missing sub");

    // Try cheap fields from the token first; fall back to Clerk API if absent.
    const claimName = (payload as Record<string, unknown>).name as string | undefined;
    const claimAvatar =
      ((payload as Record<string, unknown>).picture as string | undefined) ??
      ((payload as Record<string, unknown>).image_url as string | undefined);
    const claimEmail = (payload as Record<string, unknown>).email as string | undefined;
    const claimRole =
      ((payload as Record<string, unknown>).role as string | undefined) ??
      (((payload as Record<string, unknown>).public_metadata as
        | Record<string, unknown>
        | undefined)?.role as string | undefined);

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
        // proceed with whatever we have
      }
    }

    return {
      id: userId,
      name: name || "Someone",
      avatarUrl: avatarUrl ?? null,
      email: email ?? null,
      role: role ?? null,
    };
  } catch {
    return new Response(JSON.stringify({ error: { code: "unauthorized" } }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }
}

export function isAdmin(user: AuthedUser): boolean {
  if (user.role === "admin") return true;
  const allowlist = (process.env.FEEDBACK_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (allowlist.length && user.email && allowlist.includes(user.email.toLowerCase())) return true;
  return false;
}
