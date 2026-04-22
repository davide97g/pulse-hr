/**
 * All /comments/* endpoints. Ported from apps/app/api/comments/{index,[id],[id]/{replies,vote,status}}.ts
 * with synchronous notification fanout preserved exactly.
 */
import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client.ts";
import { requireUser, isAdmin } from "../middleware/auth.ts";
import {
  AnchorSchema,
  ListQuerySchema,
  NewCommentSchema,
  NewReplySchema,
  StatusSchema,
  VoteSchema,
} from "../lib/validation.ts";
import { serializeComment, serializeReply } from "../lib/serialize.ts";
import {
  getPreferences,
  listAdmins,
  listWorkspaceMembers,
  notifyManyUsers,
  notifyUser,
  parseMentions,
} from "../services/notifications.ts";
import { absoluteAppUrl } from "../services/email.ts";

export const comments = new Hono();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const idParam = z.object({ id: z.string().regex(UUID_RE, "invalid comment id") });

comments.use("*", requireUser);

// GET / — list comments for a route.
comments.get("/", zValidator("query", ListQuerySchema), async (c) => {
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
  return c.json(result);
});

// POST / — new comment; notifies admins in-app.
comments.post("/", zValidator("json", NewCommentSchema), async (c) => {
  const user = c.get("user");
  const input = c.req.valid("json");

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

  return c.json(serializeComment(row, [], {}), 201);
});

// PATCH /:id — edit body/anchor (author only).
// DELETE /:id — soft-delete (author or admin).
comments.patch("/:id", zValidator("param", idParam), async (c) => {
  const user = c.get("user");
  const { id: commentId } = c.req.valid("param");
  const [existing] = await db
    .select()
    .from(schema.comments)
    .where(and(eq(schema.comments.id, commentId), isNull(schema.comments.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  if (existing.authorId !== user.id) return c.json({ error: { code: "forbidden" } }, 403);

  const EditSchema = z
    .object({
      body: z.string().trim().min(1).max(4096).optional(),
      anchor: AnchorSchema.optional(),
    })
    .refine((v) => v.body !== undefined || v.anchor !== undefined, {
      message: "body or anchor required",
    });
  const body = await c.req.json().catch(() => null);
  const parsed = EditSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { code: "bad_request", message: parsed.error.issues[0]?.message } },
      400,
    );
  }

  const bodyChanged = parsed.data.body !== undefined && parsed.data.body !== existing.body;
  const anchorChanged = parsed.data.anchor !== undefined;

  if (bodyChanged) {
    await db.insert(schema.commentRevisions).values({
      commentId,
      previousBody: existing.body,
      editedBy: user.id,
    });
  }
  const updates: { updatedAt: Date; body?: string; anchor?: typeof parsed.data.anchor } = {
    updatedAt: new Date(),
  };
  if (bodyChanged) updates.body = parsed.data.body;
  if (anchorChanged) updates.anchor = parsed.data.anchor;
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
  return c.json(serializeComment(updated, replies, { [commentId]: myVote }));
});

comments.delete("/:id", zValidator("param", idParam), async (c) => {
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

// POST /:id/replies — creates reply; notifies author + @mentions.
comments.post(
  "/:id/replies",
  zValidator("param", idParam),
  zValidator("json", NewReplySchema),
  async (c) => {
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

    return c.json(serializeReply(reply), 201);
  },
);

// POST /:id/vote — upsert my vote; notifies author on non-zero.
comments.post(
  "/:id/vote",
  zValidator("param", idParam),
  zValidator("json", VoteSchema),
  async (c) => {
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

    return c.json({ voteScore: total, myVote: value });
  },
);

// PATCH /:id/status — admin-only status transition; notifies author.
comments.patch(
  "/:id/status",
  zValidator("param", idParam),
  zValidator("json", StatusSchema),
  async (c) => {
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
    return c.json(serializeComment(updated, replies, { [updated.id]: myVote }));
  },
);

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
