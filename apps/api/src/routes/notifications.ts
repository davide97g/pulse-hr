import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client.ts";
import { requireUser } from "../middleware/auth.ts";

export const notifications = new Hono();

notifications.use("*", requireUser);

// GET / — list current user's notifications.
notifications.get(
  "/",
  zValidator(
    "query",
    z.object({
      unreadOnly: z.enum(["true", "false"]).optional(),
      limit: z.coerce.number().int().min(1).max(100).optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const { unreadOnly, limit } = c.req.valid("query");
    const take = limit ?? 30;
    const where =
      unreadOnly === "true"
        ? and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt))
        : eq(schema.notifications.userId, user.id);

    const rows = await db
      .select()
      .from(schema.notifications)
      .where(where)
      .orderBy(desc(schema.notifications.createdAt))
      .limit(take);

    return c.json({ notifications: rows });
  },
);

// POST /mark-read — body { ids?: string[], all?: true }.
notifications.post(
  "/mark-read",
  zValidator(
    "json",
    z
      .object({
        ids: z.array(z.string().uuid()).max(200).optional(),
        all: z.boolean().optional(),
      })
      .refine((v) => v.all === true || (v.ids && v.ids.length > 0), {
        message: "provide `ids` or `all: true`",
      }),
  ),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    const now = new Date();

    if (body.all) {
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
            inArray(schema.notifications.id, body.ids!),
          ),
        );
    }
    return c.json({ ok: true });
  },
);

// GET /preferences — returns row or defaults.
notifications.get("/preferences", async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, user.id))
    .limit(1);
  const row = rows[0];
  return c.json({
    releaseEmail: row?.releaseEmail ?? true,
    mentionEmail: row?.mentionEmail ?? true,
  });
});

// PUT /preferences — upsert per-channel toggles.
notifications.put(
  "/preferences",
  zValidator(
    "json",
    z.object({
      releaseEmail: z.boolean().optional(),
      mentionEmail: z.boolean().optional(),
    }),
  ),
  async (c) => {
    const user = c.get("user");
    const body = c.req.valid("json");
    const next = {
      releaseEmail: body.releaseEmail ?? true,
      mentionEmail: body.mentionEmail ?? true,
    };
    await db
      .insert(schema.notificationPreferences)
      .values({ userId: user.id, ...next, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: schema.notificationPreferences.userId,
        set: { ...next, updatedAt: new Date() },
      });
    return c.json({ ok: true, ...next });
  },
);
