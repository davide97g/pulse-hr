/**
 * Admin-only endpoints used by the in-app "send email" form. The actual
 * delivery reuses the outbox + /cron/send-pending pipeline — this router
 * just validates the request and inserts the rows.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { isAdmin, requireUser } from "../middleware/auth.ts";
import { listWorkspaceMembers, queueEmail } from "../services/notifications.ts";

export const admin = new Hono();

admin.use("*", requireUser);
admin.use("*", async (c, next) => {
  const user = c.get("user");
  if (!isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
  await next();
});

// GET /admin/members — returns every Clerk user in the workspace.
// Only admins can see this list; used by the send-email composer.
admin.get("/members", async (c) => {
  const members = await listWorkspaceMembers();
  return c.json({ members });
});

const SendEmailBody = z.object({
  userIds: z.array(z.string().min(1)).min(1).max(200),
  subject: z.string().trim().min(1).max(200),
  body: z.string().trim().min(1).max(8000),
});

// POST /admin/send-email — queues one outbox row per targeted user.
admin.post("/send-email", zValidator("json", SendEmailBody), async (c) => {
  const sender = c.get("user");
  const { userIds, subject, body } = c.req.valid("json");

  const members = await listWorkspaceMembers();
  const byId = new Map(members.map((m) => [m.id, m]));

  const queued: string[] = [];
  const skipped: Array<{ userId: string; reason: string }> = [];

  for (const uid of userIds) {
    const m = byId.get(uid);
    if (!m) {
      skipped.push({ userId: uid, reason: "not_a_member" });
      continue;
    }
    if (!m.email) {
      skipped.push({ userId: uid, reason: "no_email" });
      continue;
    }
    await queueEmail({
      userId: uid,
      email: m.email,
      templateKey: "admin_message",
      payload: {
        senderName: sender.name,
        senderId: sender.id,
        subject,
        body,
      },
    });
    queued.push(uid);
  }

  return c.json({ ok: true, queued: queued.length, skipped });
});
