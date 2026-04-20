import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "../_lib/db";
import { requireUser, isAdmin } from "../_lib/auth";
import { badRequest, forbidden, json, methodNotAllowed, serverError } from "../_lib/errors";
import {
  ALL_SIDEBAR_FEATURE_IDS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
} from "../../src/lib/sidebar-features";
import type { SidebarFeatureId } from "../../src/lib/sidebar-features";

const workspaceKeyParam = z
  .string()
  .min(1)
  .max(128)
  .regex(/^[a-zA-Z0-9._-]+$/);

const putBodySchema = z.object({
  workspaceKey: workspaceKeyParam,
  features: z
    .record(z.string(), z.boolean())
    .refine(
      (rec) =>
        Object.keys(rec).every((k) => (ALL_SIDEBAR_FEATURE_IDS as readonly string[]).includes(k)),
      { message: "features contains unknown keys" },
    ),
});

export default async function handler(request: Request): Promise<Response> {
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
      return json({ workspaceKey: parsedKey.data, features: merged });
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
    const { workspaceKey, features } = parsed.data;
    const merged = { ...defaultSidebarFeaturesEnabled(), ...features } as Record<
      SidebarFeatureId,
      boolean
    >;
    try {
      await db
        .insert(schema.workspaceSidebarFeatures)
        .values({
          workspaceKey,
          features: merged,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: schema.workspaceSidebarFeatures.workspaceKey,
          set: {
            features: merged,
            updatedAt: new Date(),
          },
        });
      return json({ ok: true, workspaceKey, features: merged });
    } catch (error) {
      return serverError(error);
    }
  }

  return methodNotAllowed(["GET", "PUT"]);
}
