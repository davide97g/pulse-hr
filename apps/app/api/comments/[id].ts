import { and, eq, inArray, isNull } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db";
import { isAdmin, requireUser } from "../_lib/auth";
import {
  badRequest,
  forbidden,
  json,
  methodNotAllowed,
  notFound,
  serverError,
} from "../_lib/errors";
import { serializeComment } from "../_lib/serialize";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EditSchema = z.object({
  body: z.string().trim().min(1).max(4096),
});

function commentIdFrom(request: Request): string | null {
  const url = new URL(request.url);
  const match = url.pathname.match(/\/api\/comments\/([^/]+)\/?$/);
  return match?.[1] ?? null;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "PATCH" && request.method !== "DELETE") {
    return methodNotAllowed(["PATCH", "DELETE"]);
  }

  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    const commentId = commentIdFrom(request);
    if (!commentId || !UUID_RE.test(commentId)) return badRequest("invalid comment id");

    const [existing] = await db
      .select()
      .from(schema.comments)
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)));
    if (!existing) return notFound("comment not found");

    if (request.method === "DELETE") {
      const isAuthor = existing.authorId === user.id;
      if (!isAuthor && !isAdmin(user)) return forbidden();
      await db
        .update(schema.comments)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(schema.comments.id, commentId));
      return new Response(null, { status: 204 });
    }

    // PATCH
    if (existing.authorId !== user.id) return forbidden();
    const body = await request.json().catch(() => null);
    const parsed = EditSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");
    if (parsed.data.body === existing.body) {
      // no-op; just return current state
      const [replies, votes] = await Promise.all([
        db
          .select()
          .from(schema.commentReplies)
          .where(
            and(
              inArray(schema.commentReplies.commentId, [commentId]),
              isNull(schema.commentReplies.deletedAt),
            ),
          ),
        db
          .select()
          .from(schema.commentVotes)
          .where(
            and(
              eq(schema.commentVotes.commentId, commentId),
              eq(schema.commentVotes.userId, user.id),
            ),
          ),
      ]);
      const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
      return json(serializeComment(existing, replies, { [commentId]: myVote }));
    }

    await db.insert(schema.commentRevisions).values({
      commentId,
      previousBody: existing.body,
      editedBy: user.id,
    });
    const [updated] = await db
      .update(schema.comments)
      .set({ body: parsed.data.body, updatedAt: new Date() })
      .where(eq(schema.comments.id, commentId))
      .returning();
    const [replies, votes] = await Promise.all([
      db
        .select()
        .from(schema.commentReplies)
        .where(
          and(
            inArray(schema.commentReplies.commentId, [commentId]),
            isNull(schema.commentReplies.deletedAt),
          ),
        ),
      db
        .select()
        .from(schema.commentVotes)
        .where(
          and(
            eq(schema.commentVotes.commentId, commentId),
            eq(schema.commentVotes.userId, user.id),
          ),
        ),
    ]);
    const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
    return json(serializeComment(updated, replies, { [commentId]: myVote }));
  } catch (error) {
    return serverError(error);
  }
}
