/**
 * Shared helpers for inserting in-app notifications and queuing outbox emails.
 * Routes should call `notifyUser` / `queueEmail` rather than touching the
 * tables directly, so the two always stay consistent and per-user email
 * preferences are checked in one place.
 */
import { eq } from "drizzle-orm";
import { createClerkClient } from "@clerk/backend";
import { db, schema } from "../db/client.ts";

export type NotificationKind =
  | "release"
  | "comment.new"
  | "comment.reply"
  | "comment.vote"
  | "comment.status"
  | "mention";

export type NotifyInput = {
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string;
  meta?: Record<string, unknown>;
};

export async function notifyUser(input: NotifyInput): Promise<void> {
  await db.insert(schema.notifications).values({
    userId: input.userId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    link: input.link ?? null,
    meta: (input.meta ?? null) as unknown as object | null,
  });
}

export async function notifyManyUsers(
  userIds: string[],
  buildInput: (userId: string) => Omit<NotifyInput, "userId">,
): Promise<void> {
  if (userIds.length === 0) return;
  const rows = userIds.map((userId) => {
    const part = buildInput(userId);
    return {
      userId,
      kind: part.kind,
      title: part.title,
      body: part.body,
      link: part.link ?? null,
      meta: (part.meta ?? null) as unknown as object | null,
    };
  });
  await db.insert(schema.notifications).values(rows);
}

export type QueueEmailInput = {
  userId: string;
  email: string;
  templateKey: "release" | "mention" | "admin_message";
  payload: Record<string, unknown>;
};

export async function queueEmail(input: QueueEmailInput): Promise<void> {
  await db.insert(schema.notificationsOutbox).values({
    userId: input.userId,
    email: input.email,
    templateKey: input.templateKey,
    payload: input.payload as unknown as object,
  });
}

/** Fetch per-user toggles, returning defaults when no row exists. */
export async function getPreferences(
  userId: string,
): Promise<{ releaseEmail: boolean; mentionEmail: boolean }> {
  const rows = await db
    .select()
    .from(schema.notificationPreferences)
    .where(eq(schema.notificationPreferences.userId, userId))
    .limit(1);
  const r = rows[0];
  return {
    releaseEmail: r?.releaseEmail ?? true,
    mentionEmail: r?.mentionEmail ?? true,
  };
}

// ── Admin / member lookup ───────────────────────────────────────────────

const clerkSecret = process.env.CLERK_SECRET_KEY;
const clerk = clerkSecret ? createClerkClient({ secretKey: clerkSecret }) : null;

export type MemberLite = {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
};

let memberCache: { at: number; members: MemberLite[] } | null = null;
const MEMBER_TTL_MS = 60_000;

/**
 * Lists every Clerk user. Cached for 60s in module scope so the comment hot
 * path doesn't hit Clerk on every mutation. Returns [] if Clerk isn't
 * configured — callers should degrade gracefully.
 */
export async function listWorkspaceMembers(): Promise<MemberLite[]> {
  if (!clerk) return [];
  const now = Date.now();
  if (memberCache && now - memberCache.at < MEMBER_TTL_MS) return memberCache.members;

  const members: MemberLite[] = [];
  let offset = 0;
  const limit = 200;
  for (;;) {
    const page = await clerk.users.getUserList({ limit, offset });
    const list = Array.isArray(page) ? page : (page.data ?? []);
    for (const u of list) {
      members.push({
        id: u.id,
        name:
          u.fullName ||
          u.firstName ||
          u.emailAddresses[0]?.emailAddress.split("@")[0] ||
          "Someone",
        email: u.emailAddresses[0]?.emailAddress ?? null,
        role:
          ((u.publicMetadata as Record<string, unknown> | undefined)?.role as string | null) ??
          null,
      });
    }
    if (list.length < limit) break;
    offset += limit;
    if (offset > 5_000) break; // safety
  }
  memberCache = { at: now, members };
  return members;
}

export async function listAdmins(): Promise<MemberLite[]> {
  const members = await listWorkspaceMembers();
  const allowlist = (process.env.FEEDBACK_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return members.filter((m) => {
    if (m.role === "admin") return true;
    if (m.email && allowlist.includes(m.email.toLowerCase())) return true;
    return false;
  });
}

/**
 * Parses `@name` tokens from text. Matches against workspace member names
 * (case-insensitive, longest-match-first so "@Andrea Mazza" wins over
 * "@Andrea"). Returns the distinct Clerk user ids that match.
 */
export function parseMentions(text: string, members: MemberLite[]): string[] {
  if (!text.includes("@") || members.length === 0) return [];
  const sorted = [...members].sort((a, b) => b.name.length - a.name.length);
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const m of sorted) {
    const needle = `@${m.name.toLowerCase()}`;
    if (lower.includes(needle)) found.add(m.id);
  }
  return [...found];
}
