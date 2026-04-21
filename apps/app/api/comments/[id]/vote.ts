import { and, eq, isNull, sql } from "drizzle-orm";
import { db, schema } from "../../_lib/db.js";
import { requireUser } from "../../_lib/auth.js";
import { badRequest, json, methodNotAllowed, notFound, serverError } from "../../_lib/errors.js";
import { VoteSchema } from "../../_lib/validation.js";
import { serve } from "../../_lib/serve.js";
import { notifyUser } from "../../_lib/notifications.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/comments\/([^/]+)\/vote\/?$/);
    const commentId = match?.[1];
    if (!commentId || !UUID_RE.test(commentId)) return badRequest("invalid comment id");

    const body = await request.json().catch(() => null);
    const parsed = VoteSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");
    const value = parsed.data.value;

    const exists = await db
      .select({
        id: schema.comments.id,
        authorId: schema.comments.authorId,
        body: schema.comments.body,
      })
      .from(schema.comments)
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .limit(1);
    if (exists.length === 0) return notFound("comment not found");
    const parent = exists[0];

    if (value === 0) {
      await db
        .delete(schema.commentVotes)
        .where(
          and(
            eq(schema.commentVotes.commentId, commentId),
            eq(schema.commentVotes.userId, user.id),
          ),
        );
    } else {
      await db
        .insert(schema.commentVotes)
        .values({ commentId, userId: user.id, value })
        .onConflictDoUpdate({
          target: [schema.commentVotes.commentId, schema.commentVotes.userId],
          set: { value, updatedAt: new Date() },
        });
    }

    const [{ total }] = await db
      .select({ total: sql<number>`coalesce(sum(${schema.commentVotes.value})::int, 0)` })
      .from(schema.commentVotes)
      .where(eq(schema.commentVotes.commentId, commentId));

    await db
      .update(schema.comments)
      .set({ voteScore: total, updatedAt: new Date() })
      .where(eq(schema.comments.id, commentId));

    // Notify the comment author on a non-zero vote (never self).
    try {
      if (value !== 0 && parent.authorId && parent.authorId !== user.id) {
        await notifyUser({
          userId: parent.authorId,
          kind: "comment.vote",
          title:
            value > 0
              ? `${user.name} upvoted your comment`
              : `${user.name} downvoted your comment`,
          body: snippet(parent.body),
          link: `/feedback?c=${commentId}`,
          meta: { commentId, value },
        });
      }
    } catch (err) {
      console.warn("[api/vote] notify failed (non-fatal)", err);
    }

    return json({ voteScore: total, myVote: value });
  } catch (error) {
    return serverError(error);
  }
}

function snippet(s: string, max = 160): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default serve(handler);
