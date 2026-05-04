import { createRoute } from "@hono/zod-openapi";
import { eq } from "drizzle-orm";
import { db, schema } from "../db/client.ts";
import { isAdmin, requireUser } from "../middleware/auth.ts";
import {
  ALL_SIDEBAR_FEATURE_IDS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
  type SidebarFeatureId,
} from "@pulse-hr/shared/sidebar-features";
import { createApp, errorResponse, jsonBody, jsonContent, RequireAuth, z } from "./registry.ts";

export const workspace = createApp();

const TAG = "workspace";

const workspaceKeyParam = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9._-]+$/);

const KNOWN_ROLES = ["admin", "hr", "manager", "finance", "employee"] as const;

const featuresRecord = z
  .record(z.string(), z.boolean())
  .refine(
    (rec) =>
      Object.keys(rec).every((k) => (ALL_SIDEBAR_FEATURE_IDS as readonly string[]).includes(k)),
    { message: "features contains unknown keys" },
  );

const roleFeaturesRecord = z
  .record(z.string(), featuresRecord)
  .refine((rec) => Object.keys(rec).every((k) => (KNOWN_ROLES as readonly string[]).includes(k)), {
    message: "roleFeatures contains unknown roles",
  });

const SidebarFeaturesResponse = z
  .object({
    workspaceKey: z.string(),
    features: z.record(z.string(), z.boolean()),
    roleFeatures: z.record(z.string(), z.record(z.string(), z.boolean())).nullable(),
  })
  .openapi("SidebarFeaturesResponse");

const PutBody = z
  .object({
    workspaceKey: workspaceKeyParam,
    features: featuresRecord.optional(),
    roleFeatures: roleFeaturesRecord.nullish(),
  })
  .openapi("SidebarFeaturesUpdate");

const PutResponse = z
  .object({
    ok: z.literal(true),
    workspaceKey: z.string(),
    features: z.record(z.string(), z.boolean()),
    roleFeatures: z.record(z.string(), z.record(z.string(), z.boolean())).nullable(),
  })
  .openapi("SidebarFeaturesPutResponse");

workspace.use("/sidebar-features", requireUser);

// GET /sidebar-features --------------------------------------------
const getRoute = createRoute({
  method: "get",
  path: "/sidebar-features",
  tags: [TAG],
  security: RequireAuth,
  summary: "Get sidebar feature flags for a workspace",
  request: { query: z.object({ workspaceKey: workspaceKeyParam }) },
  responses: {
    200: jsonContent(SidebarFeaturesResponse, "Effective feature flags"),
    401: errorResponse("Missing or invalid bearer token"),
  },
});

workspace.openapi(getRoute, async (c) => {
  const { workspaceKey } = c.req.valid("query");
  const rows = await db
    .select()
    .from(schema.workspaceSidebarFeatures)
    .where(eq(schema.workspaceSidebarFeatures.workspaceKey, workspaceKey))
    .limit(1);
  const merged = mergePartialFeaturesRecord(rows[0]?.features ?? {});
  const roleFeatures = (rows[0]?.roleFeatures ?? null) as Record<
    string,
    Record<string, boolean>
  > | null;
  return c.json({ workspaceKey, features: merged, roleFeatures }, 200);
});

// PUT /sidebar-features --------------------------------------------
const putRoute = createRoute({
  method: "put",
  path: "/sidebar-features",
  tags: [TAG],
  security: RequireAuth,
  summary: "Update sidebar feature flags (admin only)",
  request: { body: jsonBody(PutBody) },
  responses: {
    200: jsonContent(PutResponse, "Updated feature flags"),
    400: errorResponse("Provide features and/or roleFeatures"),
    403: errorResponse("Not an admin"),
  },
});

workspace.openapi(putRoute, async (c) => {
  const user = c.get("user");
  if (!isAdmin(user)) {
    return c.json({ error: { code: "forbidden" } }, 403);
  }
  const { workspaceKey, features, roleFeatures } = c.req.valid("json");
  if (!features && roleFeatures === undefined) {
    return c.json(
      { error: { code: "bad_request", message: "provide features and/or roleFeatures" } },
      400,
    );
  }

  const existing = await db
    .select()
    .from(schema.workspaceSidebarFeatures)
    .where(eq(schema.workspaceSidebarFeatures.workspaceKey, workspaceKey))
    .limit(1);

  const prevFeatures = (existing[0]?.features ?? null) as Record<string, boolean> | null;
  const mergedFeatures = features
    ? ({ ...defaultSidebarFeaturesEnabled(), ...features } as Record<SidebarFeatureId, boolean>)
    : prevFeatures
      ? ({ ...defaultSidebarFeaturesEnabled(), ...prevFeatures } as Record<
          SidebarFeatureId,
          boolean
        >)
      : defaultSidebarFeaturesEnabled();

  const nextRoleFeatures =
    roleFeatures === undefined
      ? ((existing[0]?.roleFeatures ?? null) as Record<string, Record<string, boolean>> | null)
      : (roleFeatures ?? null);

  await db
    .insert(schema.workspaceSidebarFeatures)
    .values({
      workspaceKey,
      features: mergedFeatures,
      roleFeatures: nextRoleFeatures,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: schema.workspaceSidebarFeatures.workspaceKey,
      set: {
        features: mergedFeatures,
        roleFeatures: nextRoleFeatures,
        updatedAt: new Date(),
      },
    });

  return c.json(
    {
      ok: true as const,
      workspaceKey,
      features: mergedFeatures,
      roleFeatures: nextRoleFeatures,
    },
    200,
  );
});
