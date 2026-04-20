import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../_lib/db";
import { requireUser } from "../_lib/auth";
import { json, methodNotAllowed, serverError } from "../_lib/errors";
import { serializeComment, type ApiComment } from "../_lib/serialize";

type BoardBuckets = Record<string, ApiComment[]>;

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") return methodNotAllowed(["GET"]);

  const user = await requireUser(request);
  if (user instanceof Response) return user;

  try {
    const rows = await db
      .select()
      .from(schema.comments)
      .where(isNull(schema.comments.deletedAt));

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
    for (const v of myVotes) voteMap[v.commentId] = v.value as -1 | 0 | 1;

    const repliesByComment: Record<string, typeof replies> = {};
    for (const r of replies) (repliesByComment[r.commentId] ||= []).push(r);

    const buckets: BoardBuckets = {
      open: [],
      triaged: [],
      planned: [],
      shipped: [],
      wont_do: [],
    };
    for (const c of rows) {
      const serialized = serializeComment(c, repliesByComment[c.id] ?? [], voteMap);
      if (buckets[c.status]) buckets[c.status].push(serialized);
    }
    for (const key of Object.keys(buckets)) {
      buckets[key].sort((a, b) =>
        b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1),
      );
    }

    return json(buckets);
  } catch (error) {
    return serverError(error);
  }
}
