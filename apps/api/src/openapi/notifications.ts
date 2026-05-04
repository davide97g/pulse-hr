import { createRoute } from "@hono/zod-openapi";
import { and, desc, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { requireUser } from "../middleware/auth.ts";
import { createApp, errorResponse, jsonBody, jsonContent, RequireAuth, z } from "./registry.ts";

export const notifications = createApp();

notifications.use("*", requireUser);

const TAG = "notifications";

const NotificationSchema = z
  .object({
    id: z.string(),
    userId: z.string(),
    kind: z.string(),
    title: z.string(),
    body: z.string().nullable(),
    link: z.string().nullable(),
    meta: z.record(z.string(), z.unknown()).nullable(),
    readAt: z.string().nullable(),
    createdAt: z.string(),
  })
  .openapi("Notification");

const ListQuery = z
  .object({
    unreadOnly: z.enum(["true", "false"]).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  })
  .openapi("NotificationListQuery");

const MarkReadBody = z
  .object({
    ids: z.array(z.string().uuid()).max(200).optional(),
    all: z.boolean().optional(),
  })
  .refine((v) => v.all === true || (v.ids && v.ids.length > 0), {
    message: "provide `ids` or `all: true`",
  })
  .openapi("MarkReadRequest");

const PreferencesSchema = z
  .object({
    releaseEmail: z.boolean(),
    mentionEmail: z.boolean(),
  })
  .openapi("NotificationPreferences");

const PreferencesUpdate = z
  .object({
    releaseEmail: z.boolean().optional(),
    mentionEmail: z.boolean().optional(),
  })
  .openapi("NotificationPreferencesUpdate");

// GET / -----------------------------------------------------------
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: [TAG],
  security: RequireAuth,
  summary: "List the current user's notifications",
  request: { query: ListQuery },
  responses: {
    200: jsonContent(z.object({ notifications: z.array(NotificationSchema) }), "Notifications"),
    401: errorResponse("Missing or invalid bearer token"),
  },
});

notifications.openapi(listRoute, async (c) => {
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

  return c.json({ notifications: rows as unknown as z.infer<typeof NotificationSchema>[] }, 200);
});

// POST /mark-read --------------------------------------------------
const markReadRoute = createRoute({
  method: "post",
  path: "/mark-read",
  tags: [TAG],
  security: RequireAuth,
  summary: "Mark notifications as read",
  request: { body: jsonBody(MarkReadBody) },
  responses: {
    200: jsonContent(z.object({ ok: z.literal(true) }), "Marked as read"),
  },
});

notifications.openapi(markReadRoute, async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json");
  const now = new Date();

  if (body.all) {
    await db
      .update(schema.notifications)
      .set({ readAt: now })
      .where(and(eq(schema.notifications.userId, user.id), isNull(schema.notifications.readAt)));
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
  return c.json({ ok: true as const }, 200);
});

// GET /preferences -------------------------------------------------
const getPrefsRoute = createRoute({
  method: "get",
  path: "/preferences",
  tags: [TAG],
  security: RequireAuth,
  summary: "Get notification preferences",
  responses: {
    200: jsonContent(PreferencesSchema, "Preferences (defaults applied if none stored)"),
  },
});

notifications.openapi(getPrefsRoute, async (c) => {
  const user = c.get("user");
  const rows = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, user.id))
    .limit(1);
  const row = rows[0];
  return c.json(
    {
      releaseEmail: row?.releaseEmail ?? true,
      mentionEmail: row?.mentionEmail ?? true,
    },
    200,
  );
});

// PUT /preferences -------------------------------------------------
const putPrefsRoute = createRoute({
  method: "put",
  path: "/preferences",
  tags: [TAG],
  security: RequireAuth,
  summary: "Upsert notification preferences",
  request: { body: jsonBody(PreferencesUpdate) },
  responses: {
    200: jsonContent(
      z.object({
        ok: z.literal(true),
        releaseEmail: z.boolean(),
        mentionEmail: z.boolean(),
      }),
      "Updated preferences",
    ),
  },
});

notifications.openapi(putPrefsRoute, async (c) => {
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
  return c.json({ ok: true as const, ...next }, 200);
});
