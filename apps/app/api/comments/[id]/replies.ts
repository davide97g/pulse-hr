import { and, eq, isNull } from "drizzle-orm";
import { db, schema } from "../../_lib/db.js";
import { requireUser } from "../../_lib/auth.js";
import { badRequest, json, methodNotAllowed, notFound, serverError } from "../../_lib/errors.js";
import { NewReplySchema } from "../../_lib/validation.js";
import { serializeReply } from "../../_lib/serialize.js";
import { serve } from "../../_lib/serve.js";
import {
  getPreferences,
  listWorkspaceMembers,
  notifyUser,
  parseMentions,
  queueEmail,
} from "../../_lib/notifications.js";
import { absoluteAppUrl } from "../../_lib/email.js";

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
      .select({
        id: schema.comments.id,
        authorId: schema.comments.authorId,
        body: schema.comments.body,
      })
      .from(schema.comments)
      .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
      .limit(1);
    if (parent.length === 0) return notFound("comment not found");
    const parentRow = parent[0];

    // Resolve @name mentions against workspace members.
    let mentions: string[] = [];
    let members: Awaited<ReturnType<typeof listWorkspaceMembers>> = [];
    try {
      members = await listWorkspaceMembers();
      mentions = parseMentions(parsed.data.body, members).filter((id) => id !== user.id);
    } catch (err) {
      console.warn("[api/replies] mention parse failed (non-fatal)", err);
    }

    const [reply] = await db
      .insert(schema.commentReplies)
      .values({
        commentId,
        body: parsed.data.body,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatarUrl,
        mentions,
      })
      .returning();

    await db
      .update(schema.comments)
      .set({ updatedAt: new Date() })
      .where(eq(schema.comments.id, commentId));

    const deepLink = `/feedback?c=${commentId}`;
    const replySnippet = snippet(parsed.data.body);

    // Notify the parent comment author (unless they authored this reply).
    try {
      if (parentRow.authorId && parentRow.authorId !== user.id) {
        await notifyUser({
          userId: parentRow.authorId,
          kind: "comment.reply",
          title: `${user.name} replied to your comment`,
          body: replySnippet,
          link: deepLink,
          meta: { commentId, replyId: reply.id },
        });
      }
    } catch (err) {
      console.warn("[api/replies] notify author failed (non-fatal)", err);
    }

    // In-app + (if opted in) email each mentioned user.
    try {
      for (const uid of mentions) {
        await notifyUser({
          userId: uid,
          kind: "mention",
          title: `${user.name} mentioned you`,
          body: replySnippet,
          link: deepLink,
          meta: { commentId, replyId: reply.id },
        });
        const member = members.find((m) => m.id === uid);
        if (!member?.email) continue;
        const prefs = await getPreferences(uid);
        if (!prefs.mentionEmail) continue;
        await queueEmail({
          userId: uid,
          email: member.email,
          templateKey: "mention",
          payload: {
            mentionerName: user.name,
            commentTitle: snippet(parentRow.body, 80),
            replySnippet,
            link: absoluteAppUrl(deepLink),
          },
        });
      }
    } catch (err) {
      console.warn("[api/replies] mention fanout failed (non-fatal)", err);
    }

    return json(serializeReply(reply), { status: 201 });
  } catch (error) {
    return serverError(error);
  }
}

function snippet(s: string, max = 160): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default serve(handler);
