import { sql } from "drizzle-orm";
import {
  pgTable,
  uuid,
  text,
  integer,
  jsonb,
  timestamp,
  smallint,
  boolean,
  index,
  uniqueIndex,
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
  /** Clerk user ids parsed from `@name` tokens in `body` at save time. */
  mentions: text("mentions")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
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

export const proposals = pgTable(
  "proposals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    type: text("type").notNull(),
    authorId: text("author_id").notNull(),
    authorName: text("author_name").notNull(),
    authorAvatar: text("author_avatar"),
    status: text("status").notNull().default("open"),
    voteScore: integer("vote_score").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => ({
    byStatus: index("proposals_status_idx")
      .on(t.status)
      .where(sql`${t.deletedAt} is null`),
    byVoteScore: index("proposals_vote_score_idx").on(t.voteScore.desc()),
    statusCheck: check(
      "proposals_status_chk",
      sql`${t.status} in ('open','triaged','planned','shipped','wont_do')`,
    ),
    typeCheck: check("proposals_type_chk", sql`${t.type} in ('improvement','idea')`),
  }),
);

export const proposalReplies = pgTable("proposal_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  proposalId: uuid("proposal_id")
    .notNull()
    .references(() => proposals.id, { onDelete: "cascade" }),
  body: text("body").notNull(),
  authorId: text("author_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  mentions: text("mentions")
    .array()
    .notNull()
    .default(sql`ARRAY[]::text[]`),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const proposalVotes = pgTable(
  "proposal_votes",
  {
    proposalId: uuid("proposal_id")
      .notNull()
      .references(() => proposals.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull(),
    value: smallint("value").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.proposalId, t.userId] }),
    valueCheck: check("proposal_votes_value_chk", sql`${t.value} in (-1, 0, 1)`),
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

/**
 * Persistent in-app notifications. One row per user per event.
 * Event kinds:
 *  - `release`          — new changelog version announced
 *  - `comment.new`      — new top-level comment (admins only)
 *  - `comment.reply`    — someone replied to your comment
 *  - `comment.vote`     — someone voted on your comment
 *  - `comment.status`   — status transitioned on your comment
 *  - `mention`          — you were @-mentioned in a reply
 */
export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    link: text("link"),
    meta: jsonb("meta"),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byUserUnread: index("notifications_user_unread_idx")
      .on(t.userId, t.createdAt.desc())
      .where(sql`${t.readAt} is null`),
    byUser: index("notifications_user_idx").on(t.userId, t.createdAt.desc()),
    kindCheck: check(
      "notifications_kind_chk",
      sql`${t.kind} in ('release','comment.new','comment.reply','comment.vote','comment.status','mention')`,
    ),
  }),
);

/** Email queue. Populated synchronously; drained by /api/cron/send-pending. */
export const notificationsOutbox = pgTable(
  "notifications_outbox",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    email: text("email").notNull(),
    templateKey: text("template_key").notNull(),
    payload: jsonb("payload").notNull(),
    status: text("status").notNull().default("queued"),
    attempts: integer("attempts").notNull().default(0),
    lastError: text("last_error"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byStatus: index("notifications_outbox_status_idx").on(t.status, t.createdAt),
    statusCheck: check(
      "notifications_outbox_status_chk",
      sql`${t.status} in ('queued','sending','sent','failed')`,
    ),
    templateCheck: check(
      "notifications_outbox_template_chk",
      sql`${t.templateKey} in ('release','mention','admin_message')`,
    ),
  }),
);

/** Per-user email category toggles. Missing row = defaults (both true). */
export const notificationPreferences = pgTable("notification_preferences", {
  userId: text("user_id").primaryKey(),
  releaseEmail: boolean("release_email").notNull().default(true),
  mentionEmail: boolean("mention_email").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/** Which changelog versions the announce cron has already fanned out. */
export const releasedVersions = pgTable("released_versions", {
  version: text("version").primaryKey(),
  title: text("title").notNull(),
  releasedAt: timestamp("released_at", { withTimezone: true }).notNull(),
  announcedAt: timestamp("announced_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Per-user profile keyed by Clerk userId. Holds the normalized answers
 * from the onboarding questionnaire(s). New fields (intentions, desires,
 * origin, pain_point, source) start nullable so questionnaires can
 * populate them over time. UTM columns are prepared for the deferred
 * utm-source tracking work.
 */
export const userProfiles = pgTable("user_profiles", {
  userId: text("user_id").primaryKey(),
  companyName: text("company_name"),
  companyWebsite: text("company_website"),
  companySize: text("company_size"),
  companyIndustry: text("company_industry"),
  intentions: text("intentions"),
  desires: text("desires"),
  origin: text("origin"),
  painPoint: text("pain_point"),
  source: text("source"),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  utmTerm: text("utm_term"),
  utmContent: text("utm_content"),
  fullyAnswered: boolean("fully_answered").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Append-only log of every questionnaire submission. `answers` is raw
 * JSON so each questionnaire can evolve its shape without a migration.
 * `questionnaire_key` namespaces different surveys (e.g. "company_profile",
 * "pain_points", "origin_survey"), `version` tracks shape revisions.
 */
export const questionnaireResponses = pgTable(
  "questionnaire_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    questionnaireKey: text("questionnaire_key").notNull(),
    version: integer("version").notNull().default(1),
    answers: jsonb("answers").notNull(),
    fullyAnswered: boolean("fully_answered").notNull().default(false),
    submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byUser: index("questionnaire_responses_user_idx").on(t.userId, t.submittedAt.desc()),
    byKey: index("questionnaire_responses_key_idx").on(t.questionnaireKey),
  }),
);

/**
 * Current voting power per user. One row per Clerk userId.
 *
 * Defaults reflect the v1 economy (see `src/lib/voting-power.ts`):
 * baseline 10, lazy weekly refill anchored at `lastRefillAt`.
 */
export const votingPower = pgTable("voting_power", {
  userId: text("user_id").primaryKey(),
  power: integer("power").notNull().default(10),
  baseline: integer("baseline").notNull().default(10),
  lastRefillAt: timestamp("last_refill_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/**
 * Append-only ledger of power grants/decrements for auditability.
 *
 * `(user_id, source_key)` is uniquely indexed when `source_key IS NOT NULL`,
 * which makes one-shot grants idempotent via INSERT … ON CONFLICT DO NOTHING.
 */
export const votingPowerEvents = pgTable(
  "voting_power_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull(),
    delta: integer("delta").notNull(),
    reason: text("reason").notNull(),
    /** Origin of the event, e.g. "questionnaire:company_profile". */
    sourceKey: text("source_key"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    byUser: index("voting_power_events_user_idx").on(t.userId, t.createdAt.desc()),
    bySource: uniqueIndex("voting_power_events_user_source_uniq")
      .on(t.userId, t.sourceKey)
      .where(sql`${t.sourceKey} is not null`),
  }),
);

export type DbUserProfile = typeof userProfiles.$inferSelect;
export type DbUserProfileInsert = typeof userProfiles.$inferInsert;
export type DbQuestionnaireResponse = typeof questionnaireResponses.$inferSelect;
export type DbQuestionnaireResponseInsert = typeof questionnaireResponses.$inferInsert;
export type DbVotingPower = typeof votingPower.$inferSelect;
export type DbVotingPowerInsert = typeof votingPower.$inferInsert;
export type DbVotingPowerEvent = typeof votingPowerEvents.$inferSelect;
export type DbVotingPowerEventInsert = typeof votingPowerEvents.$inferInsert;

export type DbComment = typeof comments.$inferSelect;
export type DbCommentInsert = typeof comments.$inferInsert;
export type DbReply = typeof commentReplies.$inferSelect;
export type DbReplyInsert = typeof commentReplies.$inferInsert;
export type DbVote = typeof commentVotes.$inferSelect;
export type DbWorkspaceSidebarFeatures = typeof workspaceSidebarFeatures.$inferSelect;
export type DbWorkspaceSidebarFeaturesInsert = typeof workspaceSidebarFeatures.$inferInsert;
export type DbNotification = typeof notifications.$inferSelect;
export type DbNotificationInsert = typeof notifications.$inferInsert;
export type DbOutbox = typeof notificationsOutbox.$inferSelect;
export type DbOutboxInsert = typeof notificationsOutbox.$inferInsert;
export type DbNotificationPreferences = typeof notificationPreferences.$inferSelect;
export type DbReleasedVersion = typeof releasedVersions.$inferSelect;
export type DbProposal = typeof proposals.$inferSelect;
export type DbProposalInsert = typeof proposals.$inferInsert;
export type DbProposalReply = typeof proposalReplies.$inferSelect;
export type DbProposalReplyInsert = typeof proposalReplies.$inferInsert;
export type DbProposalVote = typeof proposalVotes.$inferSelect;
