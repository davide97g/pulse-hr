import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db.js";
import { requireUser, isAdmin } from "../_lib/auth.js";
import { badRequest, forbidden, json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";
import {
  ALL_SIDEBAR_FEATURE_IDS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
} from "../../src/lib/sidebar-features.js";
import type { SidebarFeatureId } from "../../src/lib/sidebar-features.js";

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

const putBodySchema = z.object({
  workspaceKey: workspaceKeyParam,
  features: featuresRecord.optional(),
  roleFeatures: roleFeaturesRecord.nullish(),
});

async function handler(request: Request): Promise<Response> {
  const user = await requireUser(request);
  if (user instanceof Response) return user;

  const url = new URL(request.url);
  const workspaceKeyRaw = url.searchParams.get("workspaceKey")?.trim() ?? "";
  const parsedKey = workspaceKeyParam.safeParse(workspaceKeyRaw);

  if (request.method === "GET") {
    if (!parsedKey.success) {
      return badRequest(
        "workspaceKey query param is required (1–128 chars: letters, digits, . _ -)",
      );
    }
    try {
      const rows = await db
        .select()
        .from(schema.workspaceSidebarFeatures)
        .where(eq(schema.workspaceSidebarFeatures.workspaceKey, parsedKey.data))
        .limit(1);
      const merged = mergePartialFeaturesRecord(rows[0]?.features ?? {});
      const roleFeatures = (rows[0]?.roleFeatures ?? null) as
        | Record<string, Record<string, boolean>>
        | null;
      return json({
        workspaceKey: parsedKey.data,
        features: merged,
        roleFeatures,
      });
    } catch (error) {
      return serverError(error);
    }
  }

  if (request.method === "PUT") {
    if (!isAdmin(user)) return forbidden();
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return badRequest("invalid JSON body");
    }
    const parsed = putBodySchema.safeParse(body);
    if (!parsed.success) {
      const msg =
        parsed.error.flatten().fieldErrors.features?.[0] ?? parsed.error.issues[0]?.message;
      return badRequest(typeof msg === "string" ? msg : "invalid body");
    }
    const { workspaceKey, features, roleFeatures } = parsed.data;
    if (!features && roleFeatures === undefined) {
      return badRequest("provide features and/or roleFeatures");
    }
    try {
      const existing = await db
        .select()
        .from(schema.workspaceSidebarFeatures)
        .where(eq(schema.workspaceSidebarFeatures.workspaceKey, workspaceKey))
        .limit(1);

      const prevFeatures = (existing[0]?.features ?? null) as Record<string, boolean> | null;
      const mergedFeatures = features
        ? ({ ...defaultSidebarFeaturesEnabled(), ...features } as Record<SidebarFeatureId, boolean>)
        : prevFeatures
          ? ({ ...defaultSidebarFeaturesEnabled(), ...prevFeatures } as Record<SidebarFeatureId, boolean>)
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
      return json({
        ok: true,
        workspaceKey,
        features: mergedFeatures,
        roleFeatures: nextRoleFeatures,
      });
    } catch (error) {
      return serverError(error);
    }
  }

  return methodNotAllowed(["GET", "PUT"]);
}

export default serve(handler);
