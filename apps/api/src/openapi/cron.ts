/**
 * Cron endpoints protected by `requireCronSecret`. Called by GitHub Actions
 * scheduled workflows (see .github/workflows/cron-*.yml).
 */
import { createRoute } from "@hono/zod-openapi";
import { and, desc, eq, gte, isNull, sql } from "drizzle-orm";
import { render } from "@react-email/render";
import { marked } from "marked";
import { db, schema } from "../db/client.ts";
import { requireCronSecret } from "../middleware/cron.ts";
import { loadReleases } from "../services/changelog.ts";
import {
  getPreferences,
  listWorkspaceMembers,
  notifyManyUsers,
  queueEmail,
} from "../services/notifications.ts";
import { resend, EMAIL_FROM, absoluteAppUrl } from "../services/email.ts";
import { ReleaseAnnouncement, BODY_PLACEHOLDER_TOKEN } from "../emails/ReleaseAnnouncement.tsx";
import { MentionInReply } from "../emails/MentionInReply.tsx";
import { AdminMessage } from "../emails/AdminMessage.tsx";
import {
  createApp,
  errorResponse,
  jsonContent,
  RequireCronAuth,
  z,
} from "./registry.ts";

export const cron = createApp();
cron.use("*", requireCronSecret);

const TAG = "cron";

// Free-tier Resend cap.
const DAILY_CAP = 100;
// Per invocation. 60 already covered 1-minute cadence on Vercel; on GitHub
// Actions (5-min min granularity) we drain more per tick.
const BATCH = 80;

const AnnounceResultSchema = z
  .object({
    ok: z.literal(true),
    announced: z.array(z.string()),
    members: z.number().int().optional(),
  })
  .openapi("AnnounceReleaseResult");

const SendPendingResultSchema = z
  .object({
    ok: z.boolean(),
    reason: z.string().optional(),
    skipped: z.string().optional(),
    sentToday: z.number().int().optional(),
    attempted: z.number().int().optional(),
    results: z
      .array(
        z.object({
          id: z.string(),
          status: z.enum(["sent", "failed"]),
          error: z.string().optional(),
        }),
      )
      .optional(),
  })
  .openapi("SendPendingResult");

async function announceReleaseHandler(): Promise<{
  body: z.infer<typeof AnnounceResultSchema>;
  status: 200;
}> {
  const releases = loadReleases();
  if (releases.length === 0) {
    return { body: { ok: true as const, announced: [] }, status: 200 };
  }

  for (const r of releases) {
    await db
      .insert(schema.releasedVersions)
      .values({ version: r.version, title: r.title, releasedAt: new Date(r.date) })
      .onConflictDoNothing({ target: schema.releasedVersions.version });
  }

  const pending = await db
    .select()
    .from(schema.releasedVersions)
    .where(isNull(schema.releasedVersions.announcedAt));

  if (pending.length === 0) {
    return { body: { ok: true as const, announced: [] }, status: 200 };
  }

  const members = await listWorkspaceMembers();
  const announced: string[] = [];

  for (const row of pending) {
    const rel = releases.find((r) => r.version === row.version);
    if (!rel) continue;

    const userIds = members.map((m) => m.id);
    if (userIds.length > 0) {
      await notifyManyUsers(userIds, () => ({
        kind: "release",
        title: `Pulse HR ${rel.version} — ${rel.title}`,
        body: firstLine(rel.bodyMarkdown),
        link: rel.tour?.id ? `/?tour=${encodeURIComponent(rel.tour.id)}` : "/",
        meta: { version: rel.version, tourId: rel.tour?.id ?? null },
      }));
    }

    for (const m of members) {
      if (!m.email) continue;
      const prefs = await getPreferences(m.id);
      if (!prefs.releaseEmail) continue;
      await queueEmail({
        userId: m.id,
        email: m.email,
        templateKey: "release",
        payload: {
          version: rel.version,
          title: rel.title,
          bodyMarkdown: rel.bodyMarkdown,
          tourId: rel.tour?.id ?? null,
        },
      });
    }

    await db
      .update(schema.releasedVersions)
      .set({ announcedAt: new Date() })
      .where(eq(schema.releasedVersions.version, row.version));
    announced.push(row.version);
  }

  return { body: { ok: true as const, announced, members: members.length }, status: 200 };
}

async function sendPendingHandler(): Promise<{
  body: z.infer<typeof SendPendingResultSchema>;
  status: 200;
}> {
  if (!resend) {
    return { body: { ok: false, reason: "RESEND_API_KEY not configured" }, status: 200 };
  }

  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const sentCountRows = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(schema.notificationsOutbox)
    .where(
      and(
        eq(schema.notificationsOutbox.status, "sent"),
        gte(schema.notificationsOutbox.sentAt, oneDayAgo),
      ),
    );
  const sentToday = sentCountRows[0]?.c ?? 0;
  const remaining = Math.max(0, DAILY_CAP - sentToday);
  if (remaining === 0) return { body: { ok: true, skipped: "daily-cap" }, status: 200 };

  const take = Math.min(BATCH, remaining);
  const queued = await db
    .select()
    .from(schema.notificationsOutbox)
    .where(eq(schema.notificationsOutbox.status, "queued"))
    .orderBy(desc(schema.notificationsOutbox.createdAt))
    .limit(take);

  const results: Array<{ id: string; status: "sent" | "failed"; error?: string }> = [];

  for (const row of queued) {
    await db
      .update(schema.notificationsOutbox)
      .set({ status: "sending", attempts: row.attempts + 1 })
      .where(eq(schema.notificationsOutbox.id, row.id));

    try {
      const { subject, html } = await renderEmail(row);
      const sent = await resend.emails.send({
        from: EMAIL_FROM,
        to: row.email,
        subject,
        html,
      });
      const sendError = (sent as { error?: unknown }).error;
      if (sendError) throw sendError;
      await db
        .update(schema.notificationsOutbox)
        .set({ status: "sent", sentAt: new Date(), lastError: null })
        .where(eq(schema.notificationsOutbox.id, row.id));
      results.push({ id: row.id, status: "sent" });
    } catch (err) {
      const msg = formatError(err);
      await db
        .update(schema.notificationsOutbox)
        .set({ status: "failed", lastError: msg })
        .where(eq(schema.notificationsOutbox.id, row.id));
      results.push({ id: row.id, status: "failed", error: msg });
    }
  }

  return { body: { ok: true, sentToday, attempted: queued.length, results }, status: 200 };
}

const announceGet = createRoute({
  method: "get",
  path: "/announce-release",
  tags: [TAG],
  security: RequireCronAuth,
  summary: "Diff CHANGELOG.md against released_versions; fan out per version",
  responses: {
    200: jsonContent(AnnounceResultSchema, "OK"),
    401: errorResponse("Cron secret missing or invalid"),
    503: errorResponse("CRON_SECRET not configured"),
  },
});
const announcePost = createRoute({ ...announceGet, method: "post" });
cron.openapi(announceGet, async (c) => {
  const r = await announceReleaseHandler();
  return c.json(r.body, r.status);
});
cron.openapi(announcePost, async (c) => {
  const r = await announceReleaseHandler();
  return c.json(r.body, r.status);
});

const sendGet = createRoute({
  method: "get",
  path: "/send-pending",
  tags: [TAG],
  security: RequireCronAuth,
  summary: "Drain the email outbox via Resend (cap-respecting)",
  responses: {
    200: jsonContent(SendPendingResultSchema, "OK"),
    401: errorResponse("Cron secret missing or invalid"),
    503: errorResponse("CRON_SECRET not configured"),
  },
});
const sendPost = createRoute({ ...sendGet, method: "post" });
cron.openapi(sendGet, async (c) => {
  const r = await sendPendingHandler();
  return c.json(r.body, r.status);
});
cron.openapi(sendPost, async (c) => {
  const r = await sendPendingHandler();
  return c.json(r.body, r.status);
});

function formatError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object") {
    const e = err as { message?: unknown; name?: unknown; statusCode?: unknown };
    const parts: string[] = [];
    if (typeof e.name === "string") parts.push(e.name);
    if (typeof e.statusCode === "number") parts.push(`[${e.statusCode}]`);
    if (typeof e.message === "string") parts.push(e.message);
    if (parts.length > 0) return parts.join(" ");
    try {
      return JSON.stringify(err);
    } catch {
      return "send failed";
    }
  }
  return String(err);
}

async function renderEmail(
  row: typeof schema.notificationsOutbox.$inferSelect,
): Promise<{ subject: string; html: string }> {
  const p = row.payload as Record<string, unknown>;
  if (row.templateKey === "release") {
    const version = String(p.version ?? "");
    const title = String(p.title ?? "");
    const markdown = String(p.bodyMarkdown ?? "");
    const tourId = (p.tourId as string | null | undefined) ?? null;
    const bodyHtml = String(await marked.parse(markdown));

    let html = await render(
      ReleaseAnnouncement({
        version,
        title,
        appUrl: absoluteAppUrl("/"),
        tourId,
      }),
    );
    html = html.replace(BODY_PLACEHOLDER_TOKEN, bodyHtml);
    return { subject: `Pulse HR ${version} — ${title}`, html };
  }

  if (row.templateKey === "mention") {
    const mentionerName = String(p.mentionerName ?? "Someone");
    const commentTitle = String(p.commentTitle ?? "a comment");
    const replySnippet = String(p.replySnippet ?? "");
    const link = String(p.link ?? absoluteAppUrl("/feedback"));
    const html = await render(MentionInReply({ mentionerName, commentTitle, replySnippet, link }));
    return { subject: `${mentionerName} mentioned you in Pulse HR`, html };
  }

  if (row.templateKey === "admin_message") {
    const senderName = String(p.senderName ?? "An admin");
    const subject = String(p.subject ?? `A message from ${senderName}`);
    const body = String(p.body ?? "");
    const html = await render(
      AdminMessage({ senderName, subject, body, appUrl: absoluteAppUrl("/") }),
    );
    return { subject, html };
  }

  throw new Error(`unknown templateKey: ${row.templateKey}`);
}

function firstLine(md: string): string {
  const trimmed = md.trim();
  const line = trimmed.split("\n").find((l) => l.trim().length > 0) ?? trimmed;
  return line.replace(/^[-*]\s+/, "").slice(0, 240);
}
