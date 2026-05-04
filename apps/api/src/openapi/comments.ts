/**
 * All /comments/* endpoints. Behaviour preserved 1:1 from the previous
 * `src/routes/comments.ts`; this file just rewires the same handlers through
 * `createRoute()` so they show up in /openapi.json.
 *
 * Validation schemas come from `src/lib/validation.ts` — `.openapi("Name")`
 * is applied at use-site to register named refs in components.schemas.
 */
import { createRoute } from "@hono/zod-openapi";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { requireUser, isAdmin } from "../middleware/auth.ts";
import {
  AnchorSchema,
  ListQuerySchema,
  NewCommentSchema,
  NewReplySchema,
  PageMetaSchema,
  StatusSchema,
  VoteSchema,
} from "../lib/validation.ts";
import { serializeComment, serializeReply } from "../lib/serialize.ts";
import {
  assertDailyCap,
  chargePower,
  grantPower,
  loadAndRefill,
  refundPower,
  VotingPowerError,
  VP_DAILY_COMMENT_CAP,
  VP_GRANT_PLANNED,
  VP_VOTE_COST,
} from "../lib/voting-power.ts";
import {
  getPreferences,
  listAdmins,
  listWorkspaceMembers,
  notifyManyUsers,
  notifyUser,
  parseMentions,
} from "../services/notifications.ts";
import { absoluteAppUrl } from "../services/email.ts";
import {
  createApp,
  errorResponse,
  jsonBody,
  jsonContent,
  RequireAuth,
  z,
} from "./registry.ts";

export const comments = createApp();

const TAG = "comments";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idParam = z
  .object({ id: z.string().regex(UUID_RE, "invalid comment id").openapi({ example: "9d4a0a8c-1c8e-4b2a-9c4f-0a8c1c8e4b2a" }) })
  .openapi("CommentIdParam");

// Register names for the request schemas so they appear as components.schemas refs.
AnchorSchema.openapi("CommentAnchor");
PageMetaSchema.openapi("PageMeta");
ListQuerySchema.openapi("CommentListQuery");
NewCommentSchema.openapi("NewComment");
NewReplySchema.openapi("NewReply");
VoteSchema.openapi("Vote");
StatusSchema.openapi("CommentStatus");

const AuthorSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  })
  .openapi("Author");

const ReplySchema = z
  .object({
    id: z.string(),
    commentId: z.string(),
    body: z.string(),
    author: AuthorSchema,
    mentions: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Reply");

const CommentSchema = z
  .object({
    id: z.string(),
    route: z.string(),
    anchor: AnchorSchema,
    pageMeta: PageMetaSchema,
    body: z.string(),
    author: AuthorSchema,
    status: z.enum(["open", "triaged", "planned", "shipped", "wont_do"]),
    tags: z.array(z.string()),
    screenshotUrl: z.string().nullable(),
    voteScore: z.number().int(),
    myVote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
    replies: z.array(ReplySchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Comment");

const VoteResultSchema = z
  .object({
    voteScore: z.number().int(),
    myVote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  })
  .openapi("VoteResult");

const EditCommentSchema = z
  .object({
    body: z.string().trim().min(1).max(4096).optional(),
    anchor: AnchorSchema.optional(),
  })
  .refine((v) => v.body !== undefined || v.anchor !== undefined, {
    message: "body or anchor required",
  })
  .openapi("EditComment");

comments.use("*", requireUser);

// GET / — list comments for a route ----------------------------------------
const listRoute = createRoute({
  method: "get",
  path: "/",
  tags: [TAG],
  security: RequireAuth,
  summary: "List comments for a route",
  request: { query: ListQuerySchema },
  responses: {
    200: jsonContent(z.array(CommentSchema), "Comments on the requested route"),
    401: errorResponse("Missing or invalid bearer token"),
  },
});

comments.openapi(listRoute, async (c) => {
  const user = c.get("user");
  const { route } = c.req.valid("query");

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
          and(inArray(schema.commentVotes.commentId, ids), eq(schema.commentVotes.userId, user.id)),
        )
    : [];
  const voteMap: Record<string, -1 | 0 | 1> = {};
  for (const v of myVotes) voteMap[v.commentId] = v.value as -1 | 0 | 1;
  const byComment: Record<string, typeof replies> = {};
  for (const r of replies) (byComment[r.commentId] ||= []).push(r);

  const result = rows
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .map((cc) => serializeComment(cc, byComment[cc.id] ?? [], voteMap));
  // Cast: serializer types are wider than the Zod schema (anchor/pageMeta unknown).
  return c.json(result as unknown as z.infer<typeof CommentSchema>[], 200);
});

// POST / — new comment ------------------------------------------------------
const createRouteDef = createRoute({
  method: "post",
  path: "/",
  tags: [TAG],
  security: RequireAuth,
  summary: "Create a comment",
  request: { body: jsonBody(NewCommentSchema) },
  responses: {
    201: jsonContent(CommentSchema, "Comment created"),
    401: errorResponse("Missing or invalid bearer token"),
    422: errorResponse("Daily comment cap reached"),
  },
});

comments.openapi(createRouteDef, async (c) => {
  const user = c.get("user");
  const input = c.req.valid("json");

  try {
    await assertDailyCap(user.id, "comment", VP_DAILY_COMMENT_CAP);
  } catch (err) {
    if (err instanceof VotingPowerError) {
      return c.json({ error: { code: err.code, message: err.message } }, 422);
    }
    throw err;
  }

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

  return c.json(serializeComment(row, [], {}) as unknown as z.infer<typeof CommentSchema>, 201);
});

// PATCH /:id — edit body or anchor (author only) ----------------------------
const editRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: [TAG],
  security: RequireAuth,
  summary: "Edit a comment",
  description: "Author-only. Body changes append a revision row; anchor changes do not.",
  request: { params: idParam, body: jsonBody(EditCommentSchema) },
  responses: {
    200: jsonContent(CommentSchema, "Updated comment"),
    400: errorResponse("Invalid body"),
    403: errorResponse("Not the author"),
    404: errorResponse("Comment not found"),
  },
});

comments.openapi(editRoute, async (c) => {
  const user = c.get("user");
  const { id: commentId } = c.req.valid("param");
  const [existing] = await db
    .select()
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  if (existing.authorId !== user.id) return c.json({ error: { code: "forbidden" } }, 403);

  const parsed = c.req.valid("json");
  const bodyChanged = parsed.body !== undefined && parsed.body !== existing.body;
  const anchorChanged = parsed.anchor !== undefined;

  if (bodyChanged) {
    await db.insert(schema.commentRevisions).values({
      commentId,
      previousBody: existing.body,
      editedBy: user.id,
    });
  }
  const updates: { updatedAt: Date; body?: string; anchor?: typeof parsed.anchor } = {
    updatedAt: new Date(),
  };
  if (bodyChanged) updates.body = parsed.body;
  if (anchorChanged) updates.anchor = parsed.anchor;
  const [updated] = await db
    .update(schema.comments)
    .set(updates)
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
        and(eq(schema.commentVotes.commentId, commentId), eq(schema.commentVotes.userId, user.id)),
      ),
  ]);
  const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
  return c.json(
    serializeComment(updated, replies, { [commentId]: myVote }) as unknown as z.infer<
      typeof CommentSchema
    >,
    200,
  );
});

// DELETE /:id — soft-delete -------------------------------------------------
const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: [TAG],
  security: RequireAuth,
  summary: "Soft-delete a comment",
  description: "Author or admin. Returns 204 with no body.",
  request: { params: idParam },
  responses: {
    204: { description: "Deleted" },
    403: errorResponse("Not the author and not an admin"),
    404: errorResponse("Comment not found"),
  },
});

comments.openapi(deleteRoute, async (c) => {
  const user = c.get("user");
  const { id: commentId } = c.req.valid("param");
  const [existing] = await db
    .select()
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  const isAuthor = existing.authorId === user.id;
  if (!isAuthor && !isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
  await db
    .update(schema.comments)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.comments.id, commentId));
  return c.body(null, 204);
});

// POST /:id/replies ---------------------------------------------------------
const replyRoute = createRoute({
  method: "post",
  path: "/{id}/replies",
  tags: [TAG],
  security: RequireAuth,
  summary: "Reply to a comment",
  request: { params: idParam, body: jsonBody(NewReplySchema) },
  responses: {
    201: jsonContent(ReplySchema, "Reply created"),
    404: errorResponse("Parent comment not found"),
  },
});

comments.openapi(replyRoute, async (c) => {
  const user = c.get("user");
  const { id: commentId } = c.req.valid("param");
  const input = c.req.valid("json");

  const [parent] = await db
    .select({
      id: schema.comments.id,
      authorId: schema.comments.authorId,
      body: schema.comments.body,
    })
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
    .limit(1);
  if (!parent) return c.json({ error: { code: "not_found" } }, 404);

  let mentions: string[] = [];
  let members: Awaited<ReturnType<typeof listWorkspaceMembers>> = [];
  try {
    members = await listWorkspaceMembers();
    mentions = parseMentions(input.body, members).filter((id) => id !== user.id);
  } catch (err) {
    console.warn("[api/replies] mention parse failed (non-fatal)", err);
  }

  const [reply] = await db
    .insert(schema.commentReplies)
    .values({
      commentId,
      body: input.body,
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
  const replySnippet = snippet(input.body);

  try {
    if (parent.authorId && parent.authorId !== user.id) {
      await notifyUser({
        userId: parent.authorId,
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
      await db.insert(schema.notificationsOutbox).values({
        userId: uid,
        email: member.email,
        templateKey: "mention",
        payload: {
          mentionerName: user.name,
          commentTitle: snippet(parent.body, 80),
          replySnippet,
          link: absoluteAppUrl(deepLink),
        } as unknown as object,
      });
    }
  } catch (err) {
    console.warn("[api/replies] mention fanout failed (non-fatal)", err);
  }

  return c.json(serializeReply(reply) as unknown as z.infer<typeof ReplySchema>, 201);
});

// POST /:id/vote ------------------------------------------------------------
const voteRoute = createRoute({
  method: "post",
  path: "/{id}/vote",
  tags: [TAG],
  security: RequireAuth,
  summary: "Cast, swap, or retract a vote",
  description:
    "Voting power economy: charge 1 on first cast, refund 1 on retract, refund + charge on swap (net 0, two ledger rows). Same value resubmitted is a no-op.",
  request: { params: idParam, body: jsonBody(VoteSchema) },
  responses: {
    200: jsonContent(VoteResultSchema, "Updated vote score"),
    404: errorResponse("Comment not found"),
    422: errorResponse("Insufficient voting power"),
  },
});

comments.openapi(voteRoute, async (c) => {
  const user = c.get("user");
  const { id: commentId } = c.req.valid("param");
  const { value } = c.req.valid("json");

  const [parent] = await db
    .select({
      id: schema.comments.id,
      authorId: schema.comments.authorId,
      body: schema.comments.body,
    })
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
    .limit(1);
  if (!parent) return c.json({ error: { code: "not_found" } }, 404);

  const [existingVote] = await db
    .select({ value: schema.commentVotes.value })
    .from(schema.commentVotes)
    .where(
      and(
        eq(schema.commentVotes.commentId, commentId),
        eq(schema.commentVotes.userId, user.id),
      ),
    )
    .limit(1);
  const prior = (existingVote?.value ?? 0) as -1 | 0 | 1;

  if (prior !== value) {
    try {
      await loadAndRefill(user.id);
      if (prior !== 0) {
        await refundPower(user.id, VP_VOTE_COST, "Vote retract", null);
      }
      if (value !== 0) {
        await chargePower(user.id, VP_VOTE_COST, "Vote cast", null);
      }
    } catch (err) {
      if (err instanceof VotingPowerError) {
        return c.json({ error: { code: err.code, message: err.message } }, 422);
      }
      throw err;
    }
  }

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

  try {
    if (value !== 0 && parent.authorId && parent.authorId !== user.id) {
      await notifyUser({
        userId: parent.authorId,
        kind: "comment.vote",
        title:
          value > 0 ? `${user.name} upvoted your comment` : `${user.name} downvoted your comment`,
        body: snippet(parent.body),
        link: `/feedback?c=${commentId}`,
        meta: { commentId, value },
      });
    }
  } catch (err) {
    console.warn("[api/vote] notify failed (non-fatal)", err);
  }

  return c.json({ voteScore: total, myVote: value }, 200);
});

// PATCH /:id/status — admin-only --------------------------------------------
const statusRoute = createRoute({
  method: "patch",
  path: "/{id}/status",
  tags: [TAG],
  security: RequireAuth,
  summary: "Move a comment to a new status (admin only)",
  request: { params: idParam, body: jsonBody(StatusSchema) },
  responses: {
    200: jsonContent(CommentSchema, "Updated comment"),
    403: errorResponse("Not an admin"),
    404: errorResponse("Comment not found"),
  },
});

comments.openapi(statusRoute, async (c) => {
  const user = c.get("user");
  if (!isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
  const { id: commentId } = c.req.valid("param");
  const { status } = c.req.valid("json");

  const prior = await db
    .select({ status: schema.comments.status })
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
    .limit(1);

  const [updated] = await db
    .update(schema.comments)
    .set({ status, updatedAt: new Date() })
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)))
    .returning();

  if (!updated) return c.json({ error: { code: "not_found" } }, 404);

  // Reward the author once when their item is moved into "planned".
  // Idempotent via the unique partial index on (user_id, source_key).
  if (updated.status === "planned" && prior[0]?.status !== "planned" && updated.authorId) {
    try {
      await grantPower(
        updated.authorId,
        VP_GRANT_PLANNED,
        "Planned: comment",
        `planned:comment:${updated.id}`,
      );
    } catch (err) {
      console.warn("[api/comments/status] planned grant failed (non-fatal)", err);
    }
  }

  try {
    if (updated.authorId && updated.authorId !== user.id && prior[0]?.status !== updated.status) {
      await notifyUser({
        userId: updated.authorId,
        kind: "comment.status",
        title: `Your comment is now ${STATUS_LABELS[updated.status] ?? updated.status}`,
        body: snippet(updated.body),
        link: `/feedback?c=${updated.id}`,
        meta: { commentId: updated.id, from: prior[0]?.status ?? null, to: updated.status },
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
  const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
  return c.json(
    serializeComment(updated, replies, { [updated.id]: myVote }) as unknown as z.infer<
      typeof CommentSchema
    >,
    200,
  );
});

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
