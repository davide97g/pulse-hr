import { createRoute } from "@hono/zod-openapi";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { requireUser } from "../middleware/auth.ts";
import { serializeComment, serializeProposal } from "../lib/serialize.ts";
import { createApp, errorResponse, jsonContent, RequireAuth, z } from "./registry.ts";

export const feedback = createApp();

feedback.use("*", requireUser);

const BoardItemSchema = z
  .object({
    kind: z.enum(["comment", "proposal"]),
    id: z.string(),
    body: z.string(),
    voteScore: z.number().int(),
    myVote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
    status: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .catchall(z.unknown())
  .openapi("BoardItem");

const BoardSchema = z
  .object({
    open: z.array(BoardItemSchema),
    triaged: z.array(BoardItemSchema),
    planned: z.array(BoardItemSchema),
    shipped: z.array(BoardItemSchema),
    wont_do: z.array(BoardItemSchema),
  })
  .openapi("FeedbackBoard");

type BoardItem = z.infer<typeof BoardItemSchema>;
type BoardBuckets = Record<string, BoardItem[]>;

const boardRoute = createRoute({
  method: "get",
  path: "/board",
  tags: ["feedback"],
  security: RequireAuth,
  summary: "Combined comments + proposals grouped by status",
  responses: {
    200: jsonContent(BoardSchema, "Board buckets"),
    401: errorResponse("Missing or invalid bearer token"),
  },
});

feedback.openapi(boardRoute, async (c) => {
  const user = c.get("user");

  const [commentRows, proposalRows] = await Promise.all([
    db.select().from(schema.comments).where(isNull(schema.comments.deletedAt)),
    db.select().from(schema.proposals).where(isNull(schema.proposals.deletedAt)),
  ]);

  const commentIds = commentRows.map((r) => r.id);
  const proposalIds = proposalRows.map((r) => r.id);

  const [commentReplies, commentVotes, proposalReplies, proposalVotes] = await Promise.all([
    commentIds.length
      ? db
          .select()
          .from(schema.commentReplies)
          .where(
            and(
              inArray(schema.commentReplies.commentId, commentIds),
              isNull(schema.commentReplies.deletedAt),
            ),
          )
      : Promise.resolve([] as (typeof schema.commentReplies.$inferSelect)[]),
    commentIds.length
      ? db
          .select()
          .from(schema.commentVotes)
          .where(
            and(
              inArray(schema.commentVotes.commentId, commentIds),
              eq(schema.commentVotes.userId, user.id),
            ),
          )
      : Promise.resolve([] as (typeof schema.commentVotes.$inferSelect)[]),
    proposalIds.length
      ? db
          .select()
          .from(schema.proposalReplies)
          .where(
            and(
              inArray(schema.proposalReplies.proposalId, proposalIds),
              isNull(schema.proposalReplies.deletedAt),
            ),
          )
      : Promise.resolve([] as (typeof schema.proposalReplies.$inferSelect)[]),
    proposalIds.length
      ? db
          .select()
          .from(schema.proposalVotes)
          .where(
            and(
              inArray(schema.proposalVotes.proposalId, proposalIds),
              eq(schema.proposalVotes.userId, user.id),
            ),
          )
      : Promise.resolve([] as (typeof schema.proposalVotes.$inferSelect)[]),
  ]);

  const commentVoteMap: Record<string, -1 | 0 | 1> = {};
  for (const v of commentVotes) commentVoteMap[v.commentId] = v.value as -1 | 0 | 1;
  const commentRepliesByParent: Record<string, typeof commentReplies> = {};
  for (const r of commentReplies) (commentRepliesByParent[r.commentId] ||= []).push(r);

  const proposalVoteMap: Record<string, -1 | 0 | 1> = {};
  for (const v of proposalVotes) proposalVoteMap[v.proposalId] = v.value as -1 | 0 | 1;
  const proposalRepliesByParent: Record<string, typeof proposalReplies> = {};
  for (const r of proposalReplies) (proposalRepliesByParent[r.proposalId] ||= []).push(r);

  const buckets: BoardBuckets = {
    open: [],
    triaged: [],
    planned: [],
    shipped: [],
    wont_do: [],
  };
  for (const row of commentRows) {
    if (!buckets[row.status]) continue;
    const serialized = serializeComment(row, commentRepliesByParent[row.id] ?? [], commentVoteMap);
    buckets[row.status].push({ ...serialized, kind: "comment" } as unknown as BoardItem);
  }
  for (const row of proposalRows) {
    if (!buckets[row.status]) continue;
    const serialized = serializeProposal(
      row,
      proposalRepliesByParent[row.id] ?? [],
      proposalVoteMap,
    );
    buckets[row.status].push({ ...serialized, kind: "proposal" } as unknown as BoardItem);
  }
  for (const key of Object.keys(buckets)) {
    buckets[key].sort((a, b) => b.voteScore - a.voteScore || (a.createdAt < b.createdAt ? 1 : -1));
  }

  return c.json(buckets as unknown as z.infer<typeof BoardSchema>, 200);
});
