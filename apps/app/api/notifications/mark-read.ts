import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db.js";
import { requireUser } from "../_lib/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";

const BodySchema = z
  .object({
    ids: z.array(z.string().uuid()).max(200).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => v.all === true || (v.ids && v.ids.length > 0), {
    message: "provide `ids` or `all: true`",
  });

async function handler(request: Request): Promise<Response> {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("invalid JSON body");
  }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");

  const now = new Date();
  try {
    if (parsed.data.all) {
      await db
        .update(schema.notifications)
        .set({ readAt: now })
        .where(
          and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt)),
        );
    } else {
      await db
        .update(schema.notifications)
        .set({ readAt: now })
        .where(
          and(
            eq(schema.notifications.userId, user.id),
            inArray(schema.notifications.id, parsed.data.ids!),
          ),
        );
    }
    return json({ ok: true });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
