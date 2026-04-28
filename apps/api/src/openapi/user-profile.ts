/**
 * Per-user profile + voting power + questionnaire history.
 *
 * Design: one normalized `user_profiles` row keyed by Clerk userId holds the
 * latest answers we care to query directly. Every submission is ALSO appended
 * to `questionnaire_responses` so the questionnaire can evolve (new fields,
 * new versions) without losing history.
 */
import { createRoute } from "@hono/zod-openapi";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { requireUser } from "../middleware/auth.ts";
import {
  grantPower,
  loadAndRefill,
  VP_BASELINE,
  VP_GRANT_QUESTIONNAIRE,
} from "../lib/voting-power.ts";
import { createApp, jsonBody, jsonContent, RequireAuth, z } from "./registry.ts";

export const userProfile = createApp();

userProfile.use("*", requireUser);

const TAG = "user-profile";

const QUESTIONNAIRE_KEY = "company_profile";
const QUESTIONNAIRE_VERSION = 1;

const CompanyProfileBody = z
  .object({
    companyName: z.string().trim().min(2).max(200),
    companyWebsite: z.string().trim().url(),
    companySize: z.string().trim().min(1).max(40),
    companyIndustry: z.string().trim().min(1).max(80),
    intentions: z.string().trim().max(2000).optional(),
    desires: z.string().trim().max(2000).optional(),
    origin: z.string().trim().max(200).optional(),
    painPoint: z.string().trim().max(2000).optional(),
    source: z.string().trim().max(200).optional(),
  })
  .openapi("CompanyProfile");

type CompanyProfile = z.infer<typeof CompanyProfileBody>;

const ProfileSchema = z
  .object({
    userId: z.string(),
    companyName: z.string().nullable(),
    companyWebsite: z.string().nullable(),
    companySize: z.string().nullable(),
    companyIndustry: z.string().nullable(),
    intentions: z.string().nullable(),
    desires: z.string().nullable(),
    origin: z.string().nullable(),
    painPoint: z.string().nullable(),
    source: z.string().nullable(),
    fullyAnswered: z.boolean(),
    updatedAt: z.string(),
  })
  .openapi("UserProfile");

const PowerRowSchema = z
  .object({
    userId: z.string(),
    power: z.number().int(),
    baseline: z.number().int(),
    lastRefillAt: z.string(),
  })
  .openapi("VotingPower");

const PowerEventSchema = z
  .object({
    id: z.string(),
    delta: z.number().int(),
    reason: z.string(),
    sourceKey: z.string().nullable(),
    at: z.string(),
  })
  .openapi("VotingPowerEvent");

const MeResponseSchema = z
  .object({
    profile: ProfileSchema.nullable(),
    power: PowerRowSchema,
    history: z.array(PowerEventSchema),
  })
  .openapi("UserMeResponse");

// GET /me ----------------------------------------------------------
const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: [TAG],
  security: RequireAuth,
  summary: "Get the current user's profile + voting power + history",
  responses: {
    200: jsonContent(MeResponseSchema, "Current-user snapshot"),
  },
});

userProfile.openapi(meRoute, async (c) => {
  const user = c.get("user");
  const power = await loadAndRefill(user.id);

  const [profileRow, history] = await Promise.all([
    db.select().from(schema.userProfiles).where(eq(schema.userProfiles.userId, user.id)).limit(1),
    db
      .select()
      .from(schema.votingPowerEvents)
      .where(eq(schema.votingPowerEvents.userId, user.id))
      .orderBy(desc(schema.votingPowerEvents.createdAt))
      .limit(50),
  ]);

  return c.json(
    {
      profile: profileRow[0] ? serializeProfile(profileRow[0]) : null,
      power: serializePowerRow(power),
      history: history.map(serializeEvent),
    } as unknown as z.infer<typeof MeResponseSchema>,
    200,
  );
});

// POST /company-profile --------------------------------------------
const companyRoute = createRoute({
  method: "post",
  path: "/company-profile",
  tags: [TAG],
  security: RequireAuth,
  summary: "Submit or update the company profile questionnaire",
  request: { body: jsonBody(CompanyProfileBody) },
  responses: {
    200: jsonContent(MeResponseSchema, "Updated profile + power"),
  },
});

userProfile.openapi(companyRoute, async (c) => {
  const user = c.get("user");
  const body = c.req.valid("json") as CompanyProfile;
  const now = new Date();

  await db
    .insert(schema.userProfiles)
    .values({
      userId: user.id,
      companyName: body.companyName,
      companyWebsite: body.companyWebsite,
      companySize: body.companySize,
      companyIndustry: body.companyIndustry,
      intentions: body.intentions ?? null,
      desires: body.desires ?? null,
      origin: body.origin ?? null,
      painPoint: body.painPoint ?? null,
      source: body.source ?? null,
      fullyAnswered: true,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: schema.userProfiles.userId,
      set: {
        companyName: body.companyName,
        companyWebsite: body.companyWebsite,
        companySize: body.companySize,
        companyIndustry: body.companyIndustry,
        intentions: body.intentions ?? null,
        desires: body.desires ?? null,
        origin: body.origin ?? null,
        painPoint: body.painPoint ?? null,
        source: body.source ?? null,
        fullyAnswered: true,
        updatedAt: now,
      },
    });

  await db.insert(schema.questionnaireResponses).values({
    userId: user.id,
    questionnaireKey: QUESTIONNAIRE_KEY,
    version: QUESTIONNAIRE_VERSION,
    answers: body,
    fullyAnswered: true,
    submittedAt: now,
  });

  await loadAndRefill(user.id);
  await grantPower(
    user.id,
    VP_GRANT_QUESTIONNAIRE,
    "Completed company profile",
    `questionnaire:${QUESTIONNAIRE_KEY}`,
  );

  const [powerRow, history] = await Promise.all([
    db.select().from(schema.votingPower).where(eq(schema.votingPower.userId, user.id)).limit(1),
    db
      .select()
      .from(schema.votingPowerEvents)
      .where(eq(schema.votingPowerEvents.userId, user.id))
      .orderBy(desc(schema.votingPowerEvents.createdAt))
      .limit(50),
  ]);

  return c.json(
    {
      profile: serializeProfile({
        userId: user.id,
        companyName: body.companyName,
        companyWebsite: body.companyWebsite,
        companySize: body.companySize,
        companyIndustry: body.companyIndustry,
        intentions: body.intentions ?? null,
        desires: body.desires ?? null,
        origin: body.origin ?? null,
        painPoint: body.painPoint ?? null,
        source: body.source ?? null,
        utmSource: null,
        utmMedium: null,
        utmCampaign: null,
        utmTerm: null,
        utmContent: null,
        fullyAnswered: true,
        createdAt: now,
        updatedAt: now,
      }),
      power: powerRow[0]
        ? serializePower(powerRow[0])
        : { userId: user.id, power: VP_BASELINE, baseline: VP_BASELINE, lastRefillAt: toIso(now) },
      history: history.map(serializeEvent),
    } as unknown as z.infer<typeof MeResponseSchema>,
    200,
  );
});

// POST /skip -------------------------------------------------------
const skipRoute = createRoute({
  method: "post",
  path: "/skip",
  tags: [TAG],
  security: RequireAuth,
  summary: "Skip the questionnaire",
  responses: {
    200: jsonContent(z.object({ ok: z.literal(true) }), "Skipped"),
  },
});

userProfile.openapi(skipRoute, async (c) => {
  const user = c.get("user");
  const now = new Date();
  await db
    .insert(schema.userProfiles)
    .values({
      userId: user.id,
      fullyAnswered: false,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: schema.userProfiles.userId });

  await loadAndRefill(user.id);

  return c.json({ ok: true as const }, 200);
});

function serializeProfile(row: typeof schema.userProfiles.$inferSelect) {
  return {
    userId: row.userId,
    companyName: row.companyName,
    companyWebsite: row.companyWebsite,
    companySize: row.companySize,
    companyIndustry: row.companyIndustry,
    intentions: row.intentions,
    desires: row.desires,
    origin: row.origin,
    painPoint: row.painPoint,
    source: row.source,
    fullyAnswered: row.fullyAnswered,
    updatedAt: toIso(row.updatedAt),
  };
}

function serializePower(row: typeof schema.votingPower.$inferSelect) {
  return {
    userId: row.userId,
    power: row.power,
    baseline: row.baseline,
    lastRefillAt: toIso(row.lastRefillAt),
  };
}

function serializePowerRow(power: {
  userId: string;
  power: number;
  baseline: number;
  lastRefillAt: Date;
}) {
  return {
    userId: power.userId,
    power: power.power,
    baseline: power.baseline,
    lastRefillAt: toIso(power.lastRefillAt),
  };
}

function serializeEvent(row: typeof schema.votingPowerEvents.$inferSelect) {
  return {
    id: row.id,
    delta: row.delta,
    reason: row.reason,
    sourceKey: row.sourceKey,
    at: toIso(row.createdAt),
  };
}

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}
