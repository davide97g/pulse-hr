/**
 * Drains the `notifications_outbox` table via Resend. Runs every minute on
 * Vercel Cron. Respects:
 *   - Resend free-tier daily cap (100 sends / 24h).
 *   - Per-invocation batch cap (60 rows) to keep function duration short.
 */
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { render } from "@react-email/render";
import { marked } from "marked";
import { db, schema } from "../_lib/db.js";
import { json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";
import { resend, EMAIL_FROM, absoluteAppUrl } from "../_lib/email.js";
import {
  ReleaseAnnouncement,
  BODY_PLACEHOLDER_TOKEN,
} from "../../src/emails/ReleaseAnnouncement.js";
import { MentionInReply } from "../../src/emails/MentionInReply.js";

const DAILY_CAP = 100;
const BATCH = 60;

function cronAuthorized(request: Request): boolean {
  if (request.headers.get("x-vercel-cron")) return true;
  const header = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return header === `Bearer ${secret}`;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST" && request.method !== "GET") {
    return methodNotAllowed(["GET", "POST"]);
  }
  if (!cronAuthorized(request)) {
    return new Response(
      JSON.stringify({ error: { code: "unauthorized", message: "cron auth required" } }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  }

  if (!resend) {
    return json({ ok: false, reason: "RESEND_API_KEY not configured" }, { status: 200 });
  }

  try {
    // How many sent in the last 24h?
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
    if (remaining === 0) return json({ ok: true, skipped: "daily-cap" });

    const take = Math.min(BATCH, remaining);

    const queued = await db
      .select()
      .from(schema.notificationsOutbox)
      .where(eq(schema.notificationsOutbox.status, "queued"))
      .orderBy(desc(schema.notificationsOutbox.createdAt))
      .limit(take);

    const results: Array<{ id: string; status: "sent" | "failed"; error?: string }> = [];

    for (const row of queued) {
      // Claim the row (best-effort; no Postgres row-locking in neon-http).
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

    return json({ ok: true, sentToday, attempted: queued.length, results });
  } catch (error) {
    return serverError(error);
  }
}

/**
 * Resend returns `{ error: { name, message, statusCode } }`; native errors are
 * Error instances; everything else gets safely JSON-stringified so "failed"
 * rows show actionable text instead of `[object Object]`.
 */
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
    const html = await render(
      MentionInReply({ mentionerName, commentTitle, replySnippet, link }),
    );
    return { subject: `${mentionerName} mentioned you in Pulse HR`, html };
  }

  throw new Error(`unknown templateKey: ${row.templateKey}`);
}

export default serve(handler);
