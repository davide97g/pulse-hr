import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client.ts";
import { requireUser, isAdmin } from "../middleware/auth.ts";
import {
  EditProposalSchema,
  NewProposalSchema,
  NewReplySchema,
  StatusSchema,
  VoteSchema,
} from "../lib/validation.ts";
import { serializeProposal, serializeProposalReply } from "../lib/serialize.ts";
import {
  getPreferences,
  listAdmins,
  listWorkspaceMembers,
  notifyManyUsers,
  notifyUser,
  parseMentions,
} from "../services/notifications.ts";
import { absoluteAppUrl } from "../services/email.ts";

export const proposals = new Hono();

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idParam = z.object({ id: z.string().regex(UUID_RE, "invalid proposal id") });

proposals.use("*", requireUser);

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

// POST / — new proposal; notifies admins.
proposals.post("/", zValidator("json", NewProposalSchema), async (c) => {
  const user = c.get("user");
  const input = c.req.valid("json");

  const [row] = await db
    .insert(schema.proposals)
    .values({
      title: input.title,
      body: input.body,
      type: input.type,
      authorId: user.id,
      authorName: user.name,
      authorAvatar: user.avatarUrl,
    })
    .returning();

  try {
    const admins = await listAdmins();
    const targets = admins.map((a) => a.id).filter((id) => id !== user.id);
    if (targets.length > 0) {
      await notifyManyUsers(targets, () => ({
        kind: "comment.new",
        title: `${user.name} posted a ${input.type}`,
        body: `${row.title} — ${snippet(row.body)}`,
        link: `/feedback?p=${row.id}`,
        meta: { proposalId: row.id, type: row.type },
      }));
    }
  } catch (err) {
    console.warn("[api/proposals] notify admins failed (non-fatal)", err);
  }

  return c.json(serializeProposal(row, [], {}), 201);
});

// PATCH /:id — edit title/body (author only).
proposals.patch("/:id", zValidator("param", idParam), async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const body = await c.req.json().catch(() => null);
  const parsed = EditProposalSchema.safeParse(body);
  if (!parsed.success) {
    return c.json(
      { error: { code: "bad_request", message: parsed.error.issues[0]?.message } },
      400,
    );
  }

  const [existing] = await db
    .select()
    .from(schema.proposals)
    .where(and(eq(schema.proposals.id, id), isNull(schema.proposals.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  if (existing.authorId !== user.id) return c.json({ error: { code: "forbidden" } }, 403);

  const updates: { updatedAt: Date; title?: string; body?: string } = { updatedAt: new Date() };
  if (parsed.data.title !== undefined) updates.title = parsed.data.title;
  if (parsed.data.body !== undefined) updates.body = parsed.data.body;
  const [updated] = await db
    .update(schema.proposals)
    .set(updates)
    .where(eq(schema.proposals.id, id))
    .returning();

  const [replies, votes] = await Promise.all([
    db
      .select()
      .from(schema.proposalReplies)
      .where(
        and(
          inArray(schema.proposalReplies.proposalId, [id]),
          isNull(schema.proposalReplies.deletedAt),
        ),
      ),
    db
      .select()
      .from(schema.proposalVotes)
      .where(
        and(eq(schema.proposalVotes.proposalId, id), eq(schema.proposalVotes.userId, user.id)),
      ),
  ]);
  const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
  return c.json(serializeProposal(updated, replies, { [id]: myVote }));
});

// DELETE /:id — soft-delete (author or admin).
proposals.delete("/:id", zValidator("param", idParam), async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const [existing] = await db
    .select()
    .from(schema.proposals)
    .where(and(eq(schema.proposals.id, id), isNull(schema.proposals.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  const isAuthor = existing.authorId === user.id;
  if (!isAuthor && !isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
  await db
    .update(schema.proposals)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(eq(schema.proposals.id, id));
  return c.body(null, 204);
});

// POST /:id/replies — create reply; notifies author + @mentions.
proposals.post(
  "/:id/replies",
  zValidator("param", idParam),
  zValidator("json", NewReplySchema),
  async (c) => {
    const user = c.get("user");
    const { id: proposalId } = c.req.valid("param");
    const input = c.req.valid("json");

    const [parent] = await db
      .select({
        id: schema.proposals.id,
        authorId: schema.proposals.authorId,
        title: schema.proposals.title,
      })
      .from(schema.proposals)
      .where(and(eq(schema.proposals.id, proposalId), isNull(schema.proposals.deletedAt)))
      .limit(1);
    if (!parent) return c.json({ error: { code: "not_found" } }, 404);

    let mentions: string[] = [];
    let members: Awaited<ReturnType<typeof listWorkspaceMembers>> = [];
    try {
      members = await listWorkspaceMembers();
      mentions = parseMentions(input.body, members).filter((id) => id !== user.id);
    } catch (err) {
      console.warn("[api/proposals/replies] mention parse failed (non-fatal)", err);
    }

    const [reply] = await db
      .insert(schema.proposalReplies)
      .values({
        proposalId,
        body: input.body,
        authorId: user.id,
        authorName: user.name,
        authorAvatar: user.avatarUrl,
        mentions,
      })
      .returning();

    await db
      .update(schema.proposals)
      .set({ updatedAt: new Date() })
      .where(eq(schema.proposals.id, proposalId));

    const deepLink = `/feedback?p=${proposalId}`;
    const replySnippet = snippet(input.body);

    try {
      if (parent.authorId && parent.authorId !== user.id) {
        await notifyUser({
          userId: parent.authorId,
          kind: "comment.reply",
          title: `${user.name} replied to your proposal`,
          body: replySnippet,
          link: deepLink,
          meta: { proposalId, replyId: reply.id },
        });
      }
    } catch (err) {
      console.warn("[api/proposals/replies] notify author failed (non-fatal)", err);
    }

    try {
      for (const uid of mentions) {
        await notifyUser({
          userId: uid,
          kind: "mention",
          title: `${user.name} mentioned you`,
          body: replySnippet,
          link: deepLink,
          meta: { proposalId, replyId: reply.id },
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
            commentTitle: snippet(parent.title, 80),
            replySnippet,
            link: absoluteAppUrl(deepLink),
          } as unknown as object,
        });
      }
    } catch (err) {
      console.warn("[api/proposals/replies] mention fanout failed (non-fatal)", err);
    }

    return c.json(serializeProposalReply(reply), 201);
  },
);

// POST /:id/vote — upsert my vote.
proposals.post(
  "/:id/vote",
  zValidator("param", idParam),
  zValidator("json", VoteSchema),
  async (c) => {
    const user = c.get("user");
    const { id: proposalId } = c.req.valid("param");
    const { value } = c.req.valid("json");

    const [parent] = await db
      .select({
        id: schema.proposals.id,
        authorId: schema.proposals.authorId,
        title: schema.proposals.title,
      })
      .from(schema.proposals)
      .where(and(eq(schema.proposals.id, proposalId), isNull(schema.proposals.deletedAt)))
      .limit(1);
    if (!parent) return c.json({ error: { code: "not_found" } }, 404);

    if (value === 0) {
      await db
        .delete(schema.proposalVotes)
        .where(
          and(
            eq(schema.proposalVotes.proposalId, proposalId),
            eq(schema.proposalVotes.userId, user.id),
          ),
        );
    } else {
      await db
        .insert(schema.proposalVotes)
        .values({ proposalId, userId: user.id, value })
        .onConflictDoUpdate({
          target: [schema.proposalVotes.proposalId, schema.proposalVotes.userId],
          set: { value, updatedAt: new Date() },
        });
    }

    const [{ total }] = await db
      .select({ total: sql<number>`coalesce(sum(${schema.proposalVotes.value})::int, 0)` })
      .from(schema.proposalVotes)
      .where(eq(schema.proposalVotes.proposalId, proposalId));

    await db
      .update(schema.proposals)
      .set({ voteScore: total, updatedAt: new Date() })
      .where(eq(schema.proposals.id, proposalId));

    try {
      if (value !== 0 && parent.authorId && parent.authorId !== user.id) {
        await notifyUser({
          userId: parent.authorId,
          kind: "comment.vote",
          title:
            value > 0
              ? `${user.name} upvoted your proposal`
              : `${user.name} downvoted your proposal`,
          body: snippet(parent.title),
          link: `/feedback?p=${proposalId}`,
          meta: { proposalId, value },
        });
      }
    } catch (err) {
      console.warn("[api/proposals/vote] notify failed (non-fatal)", err);
    }

    return c.json({ voteScore: total, myVote: value });
  },
);

// PATCH /:id/status — admin-only status transition.
proposals.patch(
  "/:id/status",
  zValidator("param", idParam),
  zValidator("json", StatusSchema),
  async (c) => {
    const user = c.get("user");
    if (!isAdmin(user)) return c.json({ error: { code: "forbidden" } }, 403);
    const { id } = c.req.valid("param");
    const { status } = c.req.valid("json");

    const prior = await db
      .select({ status: schema.proposals.status })
      .from(schema.proposals)
      .where(and(eq(schema.proposals.id, id), isNull(schema.proposals.deletedAt)))
      .limit(1);

    const [updated] = await db
      .update(schema.proposals)
      .set({ status, updatedAt: new Date() })
      .where(and(eq(schema.proposals.id, id), isNull(schema.proposals.deletedAt)))
      .returning();

    if (!updated) return c.json({ error: { code: "not_found" } }, 404);

    try {
      if (
        updated.authorId &&
        updated.authorId !== user.id &&
        prior[0]?.status !== updated.status
      ) {
        await notifyUser({
          userId: updated.authorId,
          kind: "comment.status",
          title: `Your proposal is now ${STATUS_LABELS[updated.status] ?? updated.status}`,
          body: snippet(updated.title),
          link: `/feedback?p=${updated.id}`,
          meta: { proposalId: updated.id, from: prior[0]?.status ?? null, to: updated.status },
        });
      }
    } catch (err) {
      console.warn("[api/proposals/status] notify failed (non-fatal)", err);
    }

    const replies = await db
      .select()
      .from(schema.proposalReplies)
      .where(
        and(
          inArray(schema.proposalReplies.proposalId, [updated.id]),
          isNull(schema.proposalReplies.deletedAt),
        ),
      );
    const votes = await db
      .select()
      .from(schema.proposalVotes)
      .where(
        and(
          eq(schema.proposalVotes.proposalId, updated.id),
          eq(schema.proposalVotes.userId, user.id),
        ),
      );
    const myVote = (votes[0]?.value ?? 0) as -1 | 0 | 1;
    return c.json(serializeProposal(updated, replies, { [updated.id]: myVote }));
  },
);
