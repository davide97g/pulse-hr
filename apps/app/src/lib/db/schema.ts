import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  smallint,
  index,
  primaryKey,
  check,
} from "drizzle-orm/pg-core";

export const comments = pgTable(
  "comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    route: text("route").notNull(),
    anchor: jsonb("anchor").notNull(),
    pageMeta: jsonb("page_meta"),
    body: text("body").notNull(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    authorAvatar: text("author_avatar"),
    status: text("status").notNull().default("open"),
    tags: text("tags")
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    screenshotUrl: text("screenshot_url"),
    voteScore: integer("vote_score").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    byRoute: index("comments_route_idx")
      .on(t.route)
      .where(sql`${t.deletedAt} is null`),
    byStatus: index("comments_status_idx")
      .on(t.status)
      .where(sql`${t.deletedAt} is null`),
    byVoteScore: index("comments_vote_score_idx").on(t.voteScore.desc()),
    statusCheck: check(
      "comments_status_chk",
      sql`${t.status} in ('open','triaged','planned','shipped','wont_do')`,
    ),
  }),
);

export const commentReplies = pgTable("comment_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  commentId: uuid("comment_id")
    .notNull()
    .references(() => comments.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const commentVotes = pgTable(
  "comment_votes",
  {
    commentId: uuid("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    value: smallint("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.commentId, t.userId] }),
    valueCheck: check("comment_votes_value_chk", sql`${t.value} in (-1, 0, 1)`),
  }),
);

export const commentRevisions = pgTable("comment_revisions", {
  id: uuid("id").defaultRandom().primaryKey(),
  commentId: uuid("comment_id"),
  replyId: uuid("reply_id"),
  previousBody: text("previous_body").notNull(),
  editedBy: text("edited_by").notNull(),
  editedAt: timestamp("edited_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Enabled/disabled Pulse sidebar modules per workspace (Neon). */
export const workspaceSidebarFeatures = pgTable("workspace_sidebar_features", {
  workspaceKey: text("workspace_key").primaryKey(),
  /** Partial map of feature id → boolean; missing keys default to true in the app. */
  features: jsonb("features").notNull(),
  /**
   * Optional per-role overrides applied on top of the hardcoded role allowlist:
   * `Record<Role, Record<SidebarFeatureId, boolean>>`. Missing roles/keys
   * fall back to the code-defined defaults.
   */
  roleFeatures: jsonb("role_features"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type DbComment = typeof comments.$inferSelect;
export type DbCommentInsert = typeof comments.$inferInsert;
export type DbReply = typeof commentReplies.$inferSelect;
export type DbReplyInsert = typeof commentReplies.$inferInsert;
export type DbVote = typeof commentVotes.$inferSelect;
export type DbWorkspaceSidebarFeatures = typeof workspaceSidebarFeatures.$inferSelect;
export type DbWorkspaceSidebarFeaturesInsert = typeof workspaceSidebarFeatures.$inferInsert;
