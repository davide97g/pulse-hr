/**
 * Diffs CHANGELOG entries against `released_versions` and fans out
 * notifications + outbox rows for any new version.
 *
 * Invoked by Vercel Cron hourly (see vercel.json). Protected by:
 *   - `x-vercel-cron` header (set by the Vercel scheduler), AND
 *   - `Authorization: Bearer ${CRON_SECRET}`.
 * Either passing auth is sufficient for manual triggering in dev.
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { eq, isNull } from "drizzle-orm";
import { db, schema } from "../_lib/db.js";
import { json, methodNotAllowed, serverError } from "../_lib/errors.js";
import { serve } from "../_lib/serve.js";
import {
  listWorkspaceMembers,
  notifyManyUsers,
  queueEmail,
  getPreferences,
} from "../_lib/notifications.js";

const here = dirname(fileURLToPath(import.meta.url));
const changelogPath = resolve(here, "..", "_data", "changelog.json");

type Release = {
  version: string;
  date: string;
  title: string;
  bodyMarkdown: string;
  tour?: { id?: string } | null;
};

function loadReleases(): Release[] {
  try {
    return JSON.parse(readFileSync(changelogPath, "utf8")) as Release[];
  } catch {
    return [];
  }
}

function cronAuthorized(request: Request): boolean {
  if (request.headers.get("x-vercel-cron")) return true;
  const header = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return header === `Bearer ${secret}`;
}

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST" && request.method !== "GET") {
    return methodNotAllowed(["GET", "POST"]);
  }
  if (!cronAuthorized(request)) {
    return new Response(
      JSON.stringify({ error: { code: "unauthorized", message: "cron auth required" } }),
      { status: 401, headers: { "content-type": "application/json" } },
    );
  }

  try {
    const releases = loadReleases();
    if (releases.length === 0) return json({ ok: true, announced: [] });

    // Upsert each release into released_versions so we can detect new ones.
    for (const r of releases) {
      await db
        .insert(schema.releasedVersions)
        .values({
          version: r.version,
          title: r.title,
          releasedAt: new Date(r.date),
        })
        .onConflictDoNothing({ target: schema.releasedVersions.version });
    }

    // Any version we've inserted but never announced is pending fanout.
    const pending = await db
      .select()
      .from(schema.releasedVersions)
      .where(isNull(schema.releasedVersions.announcedAt));

    if (pending.length === 0) return json({ ok: true, announced: [] });

    const members = await listWorkspaceMembers();
    const announced: string[] = [];

    for (const row of pending) {
      const rel = releases.find((r) => r.version === row.version);
      if (!rel) continue;

      // In-app notification for every user.
      const userIds = members.map((m) => m.id);
      if (userIds.length > 0) {
        await notifyManyUsers(userIds, () => ({
          kind: "release",
          title: `Pulse HR ${rel.version} — ${rel.title}`,
          body: firstLine(rel.bodyMarkdown),
          link: rel.tour?.id ? `/?tour=${encodeURIComponent(rel.tour.id)}` : "/",
          meta: { version: rel.version, tourId: rel.tour?.id ?? null },
        }));
      }

      // Outbox row per user that hasn't opted out.
      for (const m of members) {
        if (!m.email) continue;
        const prefs = await getPreferences(m.id);
        if (!prefs.releaseEmail) continue;
        await queueEmail({
          userId: m.id,
          email: m.email,
          templateKey: "release",
          payload: {
            version: rel.version,
            title: rel.title,
            bodyMarkdown: rel.bodyMarkdown,
            tourId: rel.tour?.id ?? null,
          },
        });
      }

      await db
        .update(schema.releasedVersions)
        .set({ announcedAt: new Date() })
        .where(eq(schema.releasedVersions.version, row.version));

      announced.push(row.version);
    }

    return json({ ok: true, announced, members: members.length });
  } catch (error) {
    return serverError(error);
  }
}

function firstLine(md: string): string {
  const trimmed = md.trim();
  const line = trimmed.split("\n").find((l) => l.trim().length > 0) ?? trimmed;
  const plain = line.replace(/^[-*]\s+/, "").slice(0, 240);
  return plain;
}

export default serve(handler);
