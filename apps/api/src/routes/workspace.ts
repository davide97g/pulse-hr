import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../db/client.ts";
import { requireUser, isAdmin } from "../middleware/auth.ts";
import {
  ALL_SIDEBAR_FEATURE_IDS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
  type SidebarFeatureId,
} from "@pulse-hr/shared/sidebar-features";

export const workspace = new Hono();

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

const putBody = z.object({
  workspaceKey: workspaceKeyParam,
  features: featuresRecord.optional(),
  roleFeatures: roleFeaturesRecord.nullish(),
});

workspace.use("/sidebar-features", requireUser);

workspace.get(
  "/sidebar-features",
  zValidator("query", z.object({ workspaceKey: workspaceKeyParam })),
  async (c) => {
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
    return c.json({ workspaceKey, features: merged, roleFeatures });
  },
);

workspace.put("/sidebar-features", zValidator("json", putBody), async (c) => {
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

  return c.json({
    ok: true,
    workspaceKey,
    features: mergedFeatures,
    roleFeatures: nextRoleFeatures,
  });
});
