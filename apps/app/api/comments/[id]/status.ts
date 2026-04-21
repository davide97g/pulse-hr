import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../../_lib/db.js";
import { isAdmin, requireUser } from "../../_lib/auth.js";
import {
  badRequest,
  forbidden,
  json,
  methodNotAllowed,
  notFound,
  serverError,
} from "../../_lib/errors.js";
import { StatusSchema } from "../../_lib/validation.js";
import { serializeComment } from "../../_lib/serialize.js";
import { serve } from "../../_lib/serve.js";
import { notifyUser } from "../../_lib/notifications.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handler(request: Request): Promise<Response> {
  if (request.method !== "PATCH") return methodNotAllowed(["PATCH"]);

  const user = await requireUser(request);
  if (user instanceof Response) return user;
  if (!isAdmin(user)) return forbidden();

  try {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/comments\/([^/]+)\/status\/?$/);
    const commentId = match?.[1];
    if (!commentId || !UUID_RE.test(commentId)) return badRequest("invalid comment id");

    const body = await request.json().catch(() => null);
    const parsed = StatusSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");

    // Read current status first so we only notify on an actual change.
    const prior = await db
      .select({ status: schema.comments.status })
      .from(schema.comments)
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .limit(1);

    const [updated] = await db
      .update(schema.comments)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .returning();

    if (!updated) return notFound("comment not found");

    try {
      if (
        updated.authorId &&
        updated.authorId !== user.id &&
        prior[0]?.status !== updated.status
      ) {
        await notifyUser({
          userId: updated.authorId,
          kind: "comment.status",
          title: `Your comment is now ${STATUS_LABELS[updated.status] ?? updated.status}`,
          body: snippet(updated.body),
          link: `/feedback?c=${updated.id}`,
          meta: {
            commentId: updated.id,
            from: prior[0]?.status ?? null,
            to: updated.status,
          },
        });
      }
    } catch (err) {
      console.warn("[api/status] notify failed (non-fatal)", err);
    }

    const replies = await db
      .select()
      .from(schema.commentReplies)
      .where(
        and(
          inArray(schema.commentReplies.commentId, [updated.id]),
          isNull(schema.commentReplies.deletedAt),
        ),
      );
    const votes = await db
      .select()
      .from(schema.commentVotes)
      .where(
        and(eq(schema.commentVotes.commentId, updated.id), eq(schema.commentVotes.userId, user.id)),
      );
    const myVote = votes[0]?.value ?? 0;

    return json(serializeComment(updated, replies, { [updated.id]: myVote as -1 | 0 | 1 }));
  } catch (error) {
    return serverError(error);
  }
}

const STATUS_LABELS: Record<string, string> = {
  open: "open",
  triaged: "triaged",
  planned: "planned",
  shipped: "shipped",
  wont_do: "declined",
};

function snippet(s: string, max = 160): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default serve(handler);
