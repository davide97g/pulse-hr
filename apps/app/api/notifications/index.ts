import { and, desc, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db.js";
import { requireUser } from "../_lib/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";

const QuerySchema = z.object({
  unreadOnly: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

async function handler(request: Request): Promise<Response> {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const url = new URL(request.url);
  const parsed = QuerySchema.safeParse({
    unreadOnly: url.searchParams.get("unreadOnly") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
  });
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "bad query");

  const unreadOnly = parsed.data.unreadOnly === "true";
  const limit = parsed.data.limit ?? 30;

  try {
    const where = unreadOnly
      ? and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt))
      : eq(schema.notifications.userId, user.id);

    const rows = await db
      .select()
      .from(schema.notifications)
      .where(where)
      .orderBy(desc(schema.notifications.createdAt))
      .limit(limit);

    return json({ notifications: rows });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
