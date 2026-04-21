import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../_lib/db.js";
import { requireUser } from "../_lib/auth.js";
import { badRequest, json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { ListQuerySchema, NewCommentSchema } from "../_lib/validation.js";
import { serializeComment } from "../_lib/serialize.js";
import { serve } from "../_lib/serve.js";
import { listAdmins, notifyManyUsers } from "../_lib/notifications.js";

async function handler(request: Request): Promise<Response> {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    if (request.method === "GET") {
      const url = new URL(request.url);
      const parsed = ListQuerySchema.safeParse({ route: url.searchParams.get("route") ?? "" });
      if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "bad route");
      const route = parsed.data.route;

      const rows = await db
        .select()
        .from(schema.comments)
        .where(and(eq(schema.comments.route, route), isNull(schema.comments.deletedAt)));

      const ids = rows.map((r) => r.id);
      const replies = ids.length
        ? await db
            .select()
            .from(schema.commentReplies)
            .where(
              and(
                inArray(schema.commentReplies.commentId, ids),
                isNull(schema.commentReplies.deletedAt),
              ),
            )
        : [];
      const myVotes = ids.length
        ? await db
            .select()
            .from(schema.commentVotes)
            .where(
              and(
                inArray(schema.commentVotes.commentId, ids),
                eq(schema.commentVotes.userId, user.id),
              ),
            )
        : [];
      const voteMap: Record<string, -1 | 0 | 1> = {};
      for (const v of myVotes) {
        voteMap[v.commentId] = v.value as -1 | 0 | 1;
      }
      const byComment: Record<string, typeof replies> = {};
      for (const r of replies) {
        (byComment[r.commentId] ||= []).push(r);
      }

      const result = rows
        .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
        .map((c) => serializeComment(c, byComment[c.id] ?? [], voteMap));
      return json(result);
    }

    if (request.method === "POST") {
      const body = await request.json().catch(() => null);
      const parsed = NewCommentSchema.safeParse(body);
      if (!parsed.success) {
        return badRequest(parsed.error.issues[0]?.message ?? "invalid payload");
      }
      const input = parsed.data;

      const [row] = await db
        .insert(schema.comments)
        .values({
          route: input.route,
          anchor: input.anchor,
          pageMeta: input.pageMeta,
          body: input.body,
          authorId: user.id,
          authorName: user.name,
          authorAvatar: user.avatarUrl,
          tags: input.tags ?? [],
          screenshotUrl: input.screenshotUrl ?? null,
        })
        .returning();

      // Fan out in-app "new comment" notifications to admins (never self).
      try {
        const admins = await listAdmins();
        const targets = admins.map((a) => a.id).filter((id) => id !== user.id);
        if (targets.length > 0) {
          await notifyManyUsers(targets, () => ({
            kind: "comment.new",
            title: `${user.name} left a comment`,
            body: snippet(row.body),
            link: `/feedback?c=${row.id}`,
            meta: { commentId: row.id, route: row.route },
          }));
        }
      } catch (err) {
        console.warn("[api/comments] notify admins failed (non-fatal)", err);
      }

      return json(serializeComment(row, [], {}), { status: 201 });
    }

    return methodNotAllowed(["GET", "POST"]);
  } catch (error) {
    return serverError(error);
  }
}

function snippet(s: string, max = 160): string {
  const t = s.trim().replace(/\s+/g, " ");
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
}

export default serve(handler);
