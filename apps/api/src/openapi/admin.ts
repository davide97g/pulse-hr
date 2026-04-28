/**
 * Admin-only endpoints used by the in-app "send email" form. The actual
 * delivery reuses the outbox + /cron/send-pending pipeline — this router
 * just validates the request and inserts the rows.
 */
import { createRoute } from "@hono/zod-openapi";
import { isAdmin, requireUser } from "../middleware/auth.ts";
import { listWorkspaceMembers, queueEmail } from "../services/notifications.ts";
import { createApp, errorResponse, jsonBody, jsonContent, RequireAuth, z } from "./registry.ts";

export const admin = createApp();

const TAG = "admin";

admin.use("*", requireUser);
admin.use("*", async (c, next) => {
  const user = c.get("user");
  if (!isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
  await next();
});

const MemberSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    email: z.string().nullable(),
    avatarUrl: z.string().nullable(),
    role: z.string().nullable(),
  })
  .openapi("WorkspaceMember");

const MembersResponseSchema = z
  .object({ members: z.array(MemberSchema) })
  .openapi("WorkspaceMembersResponse");

const SendEmailBody = z
  .object({
    userIds: z.array(z.string().min(1)).min(1).max(200),
    subject: z.string().trim().min(1).max(200),
    body: z.string().trim().min(1).max(8000),
  })
  .openapi("AdminSendEmailRequest");

const SendEmailResult = z
  .object({
    ok: z.literal(true),
    queued: z.number().int(),
    skipped: z.array(
      z.object({
        userId: z.string(),
        reason: z.string(),
      }),
    ),
  })
  .openapi("AdminSendEmailResult");

// GET /members ------------------------------------------------------
const membersRoute = createRoute({
  method: "get",
  path: "/members",
  tags: [TAG],
  security: RequireAuth,
  summary: "List all workspace members (admin only)",
  responses: {
    200: jsonContent(MembersResponseSchema, "Workspace members"),
    403: errorResponse("Not an admin"),
  },
});

admin.openapi(membersRoute, async (c) => {
  const members = await listWorkspaceMembers();
  return c.json(
    { members: members as unknown as z.infer<typeof MemberSchema>[] },
    200,
  );
});

// POST /send-email --------------------------------------------------
const sendEmailRoute = createRoute({
  method: "post",
  path: "/send-email",
  tags: [TAG],
  security: RequireAuth,
  summary: "Queue an email to selected workspace members",
  request: { body: jsonBody(SendEmailBody) },
  responses: {
    200: jsonContent(SendEmailResult, "Queue summary"),
    403: errorResponse("Not an admin"),
  },
});

admin.openapi(sendEmailRoute, async (c) => {
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

  return c.json({ ok: true as const, queued: queued.length, skipped }, 200);
});
