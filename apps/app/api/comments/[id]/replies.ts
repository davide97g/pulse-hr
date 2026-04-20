import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../../_lib/db";
import { requireUser } from "../../_lib/auth";
import { badRequest, json, methodNotAllowed, notFound, serverError } from "../../_lib/errors";
import { NewReplySchema } from "../../_lib/validation";
import { serializeReply } from "../../_lib/serialize";
import { serve } from "../../_lib/serve";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    const url = new URL(request.url);
    const match = url.pathname.match(/\/api\/comments\/([^/]+)\/replies\/?$/);
    const commentId = match?.[1];
    if (!commentId || !UUID_RE.test(commentId)) return badRequest("invalid comment id");

    const body = await request.json().catch(() => null);
    const parsed = NewReplySchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");

    const parent = await db
      .select({ id: schema.comments.id })
      .from(schema.comments)
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .limit(1);
    if (parent.length === 0) return notFound("comment not found");

    const [reply] = await db
      .insert(schema.commentReplies)
      .values({
        commentId,
        body: parsed.data.body,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatarUrl,
      })
      .returning();

    await db
      .update(schema.comments)
      .set({ updatedAt: new Date() })
      .where(eq(schema.comments.id, commentId));

    return json(serializeReply(reply), { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
