import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db.js";
import { requireUser } from "../_lib/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";

const PrefsBody = z.object({
  releaseEmail: z.boolean().optional(),
  mentionEmail: z.boolean().optional(),
});

async function handler(request: Request): Promise<Response> {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    if (request.method === "GET") {
      const rows = await db
        .select()
        .from(schema.notificationPreferences)
        .where(eq(schema.notificationPreferences.userId, user.id))
        .limit(1);
      const row = rows[0];
      return json({
        releaseEmail: row?.releaseEmail ?? true,
        mentionEmail: row?.mentionEmail ?? true,
      });
    }

    if (request.method === "PUT") {
      let body: unknown;
      try {
        body = await request.json();
      } catch {
        return badRequest("invalid JSON body");
      }
      const parsed = PrefsBody.safeParse(body);
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");

      const next = {
        releaseEmail: parsed.data.releaseEmail ?? true,
        mentionEmail: parsed.data.mentionEmail ?? true,
      };

      await db
        .insert(schema.notificationPreferences)
        .values({ userId: user.id, ...next, updatedAt: new Date() })
        .onConflictDoUpdate({
          target: schema.notificationPreferences.userId,
          set: { ...next, updatedAt: new Date() },
        });

      return json({ ok: true, ...next });
    }

    return methodNotAllowed(["GET", "PUT"]);
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
