import { Hono } from "hono";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { requireUser } from "../middleware/auth.ts";
import { serializeComment, type ApiComment } from "../lib/serialize.ts";

export const feedback = new Hono();

feedback.use("*", requireUser);

type BoardBuckets = Record<string, ApiComment[]>;

feedback.get("/board", async (c) => {
  const user = c.get("user");

  const rows = await db.select().from(schema.comments).where(isNull(schema.comments.deletedAt));
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
  for (const row of rows) {
    const serialized = serializeComment(row, repliesByComment[row.id] ?? [], voteMap);
    if (buckets[row.status]) buckets[row.status].push(serialized);
  }
  for (const key of Object.keys(buckets)) {
    buckets[key].sort(
      (a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1),
    );
  }

  return c.json(buckets);
});
