/**
 * Public, unauthenticated endpoints. Anything mounted here is reachable
 * without a Clerk JWT — keep it anonymous (counts only, never PII, never
 * row-level content) and rate-limited.
 */
import { createRoute } from "@hono/zod-openapi";
import { and, count, gte, isNull, ne, eq } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { rateLimit } from "../middleware/rate-limit.ts";
import { createApp, jsonContent, z } from "./registry.ts";

export const publicApi = createApp();

const FeedbackStatsSchema = z
  .object({
    proposals: z.number().int().nonnegative().openapi({
      description: "Total non-deleted proposals across all statuses.",
      example: 247,
    }),
    votesThisWeek: z.number().int().nonnegative().openapi({
      description:
        "Non-zero votes (up or down) cast on proposals or comments in the last 7 days.",
      example: 1234,
    }),
    shipped: z.number().int().nonnegative().openapi({
      description: "Proposals + comments currently in status `shipped`.",
      example: 34,
    }),
    generatedAt: z.string().openapi({
      description: "ISO timestamp when the snapshot was computed.",
      example: "2026-05-18T10:11:12.000Z",
    }),
  })
  .openapi("PublicFeedbackStats");

const route = createRoute({
  method: "get",
  path: "/feedback-stats",
  tags: ["public"],
  summary: "Anonymous feedback activity counters",
  description:
    "Aggregate, anonymous counts powering the public Feedback marketing surfaces (e.g. the SignedOutGate footer). Returns only numeric aggregates — never row-level data. Rate-limited per IP.",
  responses: {
    200: jsonContent(FeedbackStatsSchema, "Aggregate counts"),
    429: jsonContent(
      z.object({
        error: z.object({ code: z.literal("rate_limited"), message: z.string() }),
      }),
      "Too many requests",
    ),
  },
});

// 30 req/min/IP is plenty for hero badges that the SPA caches client-side.
publicApi.use("/feedback-stats", rateLimit({ limit: 30, windowMs: 60_000, key: "feedback-stats" }));

publicApi.openapi(route, async (c) => {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [proposalsRow, shippedProposalsRow, shippedCommentsRow, propVotesRow, commVotesRow] =
    await Promise.all([
      db
        .select({ n: count() })
        .from(schema.proposals)
        .where(isNull(schema.proposals.deletedAt)),
      db
        .select({ n: count() })
        .from(schema.proposals)
        .where(
          and(
            isNull(schema.proposals.deletedAt),
            eq(schema.proposals.status, "shipped"),
          ),
        ),
      db
        .select({ n: count() })
        .from(schema.comments)
        .where(
          and(
            isNull(schema.comments.deletedAt),
            eq(schema.comments.status, "shipped"),
          ),
        ),
      db
        .select({ n: count() })
        .from(schema.proposalVotes)
        .where(
          and(
            ne(schema.proposalVotes.value, 0),
            gte(schema.proposalVotes.updatedAt, sevenDaysAgo),
          ),
        ),
      db
        .select({ n: count() })
        .from(schema.commentVotes)
        .where(
          and(
            ne(schema.commentVotes.value, 0),
            gte(schema.commentVotes.updatedAt, sevenDaysAgo),
          ),
        ),
    ]);

  const proposals = Number(proposalsRow[0]?.n ?? 0);
  const shipped =
    Number(shippedProposalsRow[0]?.n ?? 0) + Number(shippedCommentsRow[0]?.n ?? 0);
  const votesThisWeek =
    Number(propVotesRow[0]?.n ?? 0) + Number(commVotesRow[0]?.n ?? 0);

  // Cache at the edge for a minute — the SPA fetches this on every cold visit
  // to the SignedOutGate.
  c.header("Cache-Control", "public, max-age=60, s-maxage=60");

  return c.json(
    {
      proposals,
      votesThisWeek,
      shipped,
      generatedAt: new Date().toISOString(),
    },
    200,
  );
});
