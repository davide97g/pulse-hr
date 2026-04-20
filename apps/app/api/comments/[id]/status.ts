import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../../_lib/db";
import { isAdmin, requireUser } from "../../_lib/auth";
import {
  badRequest,
  forbidden,
  json,
  methodNotAllowed,
  notFound,
  serverError,
} from "../../_lib/errors";
import { StatusSchema } from "../../_lib/validation";
import { serializeComment } from "../../_lib/serialize";
import { serve } from "../../_lib/serve";

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

    const [updated] = await db
      .update(schema.comments)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .returning();

    if (!updated) return notFound("comment not found");

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

export default serve(handler);
