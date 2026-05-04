/**
 * All /proposals/* endpoints. Behavior preserved 1:1 from the previous
 * `src/routes/proposals.ts`.
 */
import { createRoute } from "@hono/zod-openapi";
import { and, eq, inArray, isNull, sql } from "drizzle-orm";
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
  assertDailyCap,
  chargePower,
  grantPower,
  loadAndRefill,
  refundPower,
  VotingPowerError,
  VP_DAILY_PROPOSAL_CAP,
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

export const proposals = createApp();

const TAG = "proposals";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const idParam = z
  .object({ id: z.string().regex(UUID_RE, "invalid proposal id") })
  .openapi("ProposalIdParam");

NewProposalSchema.openapi("NewProposal");
EditProposalSchema.openapi("EditProposal");

const AuthorSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
  })
  .openapi("ProposalAuthor");

const ProposalReplySchema = z
  .object({
    id: z.string(),
    proposalId: z.string(),
    body: z.string(),
    author: AuthorSchema,
    mentions: z.array(z.string()),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("ProposalReply");

const ProposalSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    body: z.string(),
    type: z.enum(["improvement", "idea"]),
    author: AuthorSchema,
    status: z.enum(["open", "triaged", "planned", "shipped", "wont_do"]),
    voteScore: z.number().int(),
    myVote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
    replies: z.array(ProposalReplySchema),
    createdAt: z.string(),
    updatedAt: z.string(),
  })
  .openapi("Proposal");

const VoteResultSchema = z
  .object({
    voteScore: z.number().int(),
    myVote: z.union([z.literal(-1), z.literal(0), z.literal(1)]),
  })
  .openapi("ProposalVoteResult");

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

// POST / ------------------------------------------------------------
const createProposalRoute = createRoute({
  method: "post",
  path: "/",
  tags: [TAG],
  security: RequireAuth,
  summary: "Create a proposal",
  request: { body: jsonBody(NewProposalSchema) },
  responses: {
    201: jsonContent(ProposalSchema, "Proposal created"),
    422: errorResponse("Daily proposal cap reached"),
  },
});

proposals.openapi(createProposalRoute, async (c) => {
  const user = c.get("user");
  const input = c.req.valid("json");

  try {
    await assertDailyCap(user.id, "proposal", VP_DAILY_PROPOSAL_CAP);
  } catch (err) {
    if (err instanceof VotingPowerError) {
      return c.json({ error: { code: err.code, message: err.message } }, 422);
    }
    throw err;
  }

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

  return c.json(
    serializeProposal(row, [], {}) as unknown as z.infer<typeof ProposalSchema>,
    201,
  );
});

// PATCH /:id --------------------------------------------------------
const editRoute = createRoute({
  method: "patch",
  path: "/{id}",
  tags: [TAG],
  security: RequireAuth,
  summary: "Edit a proposal (author only)",
  request: { params: idParam, body: jsonBody(EditProposalSchema) },
  responses: {
    200: jsonContent(ProposalSchema, "Updated proposal"),
    400: errorResponse("Invalid body"),
    403: errorResponse("Not the author"),
    404: errorResponse("Proposal not found"),
  },
});

proposals.openapi(editRoute, async (c) => {
  const user = c.get("user");
  const { id } = c.req.valid("param");
  const parsed = c.req.valid("json");

  const [existing] = await db
    .select()
    .from(schema.proposals)
    .where(and(eq(schema.proposals.id, id), isNull(schema.proposals.deletedAt)));
  if (!existing) return c.json({ error: { code: "not_found" } }, 404);
  if (existing.authorId !== user.id) return c.json({ error: { code: "forbidden" } }, 403);

  const updates: { updatedAt: Date; title?: string; body?: string } = { updatedAt: new Date() };
  if (parsed.title !== undefined) updates.title = parsed.title;
  if (parsed.body !== undefined) updates.body = parsed.body;
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
  return c.json(
    serializeProposal(updated, replies, { [id]: myVote }) as unknown as z.infer<
      typeof ProposalSchema
    >,
    200,
  );
});

// DELETE /:id -------------------------------------------------------
const deleteRoute = createRoute({
  method: "delete",
  path: "/{id}",
  tags: [TAG],
  security: RequireAuth,
  summary: "Soft-delete a proposal",
  request: { params: idParam },
  responses: {
    204: { description: "Deleted" },
    403: errorResponse("Not the author and not an admin"),
    404: errorResponse("Proposal not found"),
  },
});

proposals.openapi(deleteRoute, async (c) => {
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

// POST /:id/replies -------------------------------------------------
const replyRoute = createRoute({
  method: "post",
  path: "/{id}/replies",
  tags: [TAG],
  security: RequireAuth,
  summary: "Reply to a proposal",
  request: { params: idParam, body: jsonBody(NewReplySchema) },
  responses: {
    201: jsonContent(ProposalReplySchema, "Reply created"),
    404: errorResponse("Parent proposal not found"),
  },
});

proposals.openapi(replyRoute, async (c) => {
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

  return c.json(serializeProposalReply(reply) as unknown as z.infer<typeof ProposalReplySchema>, 201);
});

// POST /:id/vote ----------------------------------------------------
const voteRoute = createRoute({
  method: "post",
  path: "/{id}/vote",
  tags: [TAG],
  security: RequireAuth,
  summary: "Cast, swap, or retract a vote on a proposal",
  request: { params: idParam, body: jsonBody(VoteSchema) },
  responses: {
    200: jsonContent(VoteResultSchema, "Updated vote score"),
    404: errorResponse("Proposal not found"),
    422: errorResponse("Insufficient voting power"),
  },
});

proposals.openapi(voteRoute, async (c) => {
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

  const [existingVote] = await db
    .select({ value: schema.proposalVotes.value })
    .from(schema.proposalVotes)
    .where(
      and(
        eq(schema.proposalVotes.proposalId, proposalId),
        eq(schema.proposalVotes.userId, user.id),
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

  return c.json({ voteScore: total, myVote: value }, 200);
});

// PATCH /:id/status -------------------------------------------------
const statusRoute = createRoute({
  method: "patch",
  path: "/{id}/status",
  tags: [TAG],
  security: RequireAuth,
  summary: "Move a proposal to a new status (admin only)",
  request: { params: idParam, body: jsonBody(StatusSchema) },
  responses: {
    200: jsonContent(ProposalSchema, "Updated proposal"),
    403: errorResponse("Not an admin"),
    404: errorResponse("Proposal not found"),
  },
});

proposals.openapi(statusRoute, async (c) => {
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

  if (updated.status === "planned" && prior[0]?.status !== "planned" && updated.authorId) {
    try {
      await grantPower(
        updated.authorId,
        VP_GRANT_PLANNED,
        "Planned: proposal",
        `planned:proposal:${updated.id}`,
      );
    } catch (err) {
      console.warn("[api/proposals/status] planned grant failed (non-fatal)", err);
    }
  }

  try {
    if (updated.authorId && updated.authorId !== user.id && prior[0]?.status !== updated.status) {
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
  return c.json(
    serializeProposal(updated, replies, { [updated.id]: myVote }) as unknown as z.infer<
      typeof ProposalSchema
    >,
    200,
  );
});
