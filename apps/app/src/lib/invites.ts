import { useSyncExternalStore } from "react";
import { getNamespace } from "./workspace";

export type InviteRole = "Admin" | "Member" | "Viewer" | "Guest";
export type InviteStatus = "pending" | "expired";

export interface InviteRow {
  id: string;
  initials: string;
  name: string;
  email: string;
  role: InviteRole;
  sent: string;
  status: InviteStatus;
  /** ISO date for Guest expiry. */
  expiresAt?: string;
}

const SUFFIX = "invites";

const SEED: InviteRow[] = [
  { id: "i1", initials: "GP", name: "Giulia Pavan",    email: "giulia.pavan@bitrock.it",    role: "Member", sent: "12 mag · 14:02", status: "pending" },
  { id: "i2", initials: "AB", name: "Alberto Bianchi", email: "alberto.bianchi@bitrock.it", role: "Admin",  sent: "11 mag · 09:18", status: "pending" },
  { id: "i3", initials: "EZ", name: "Elena Zara",      email: "elena.zara@bitrock.it",      role: "Member", sent: "10 mag · 16:44", status: "pending" },
  { id: "i4", initials: "FL", name: "Fabio Lupo",      email: "fabio.lupo@bitrock.it",      role: "Viewer", sent: "02 mag · 11:00", status: "expired" },
];

const LINK_TOKEN = "k7a-29p-fr";

function storageKey(): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.${SUFFIX}` : null;
}

const listeners = new Set<() => void>();
let cache: InviteRow[] = SEED;

function read(): InviteRow[] {
  const k = storageKey();
  if (!k) return SEED;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as InviteRow[];
    if (!Array.isArray(parsed)) return SEED;
    return parsed;
  } catch {
    return SEED;
  }
}

function refresh() {
  cache = read();
  for (const l of listeners) l();
}

refresh();

if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    if (e.key && e.key.endsWith(`.${SUFFIX}`)) refresh();
  });
}

function persist(next: InviteRow[]) {
  cache = next;
  const k = storageKey();
  if (k) {
    try {
      localStorage.setItem(k, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }
  for (const l of listeners) l();
}

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return (local.slice(0, 2) || "??").toUpperCase();
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function nowStamp(locale: "it" | "en" = "it"): string {
  const d = new Date();
  if (locale === "it") {
    const day = d.getDate().toString().padStart(2, "0");
    const month = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"][d.getMonth()];
    const time = `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
    return `${day} ${month} · ${time}`;
  }
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function addInvites(emails: string[], role: InviteRole, expiresInDays?: number): InviteRow[] {
  const stamp = nowStamp();
  const added: InviteRow[] = emails.map((email, i) => {
    const expiresAt =
      role === "Guest" && expiresInDays
        ? new Date(Date.now() + expiresInDays * 86_400_000).toISOString()
        : undefined;
    return {
      id: `i${Date.now()}-${i}`,
      initials: initialsFromEmail(email),
      name: nameFromEmail(email),
      email,
      role,
      sent: stamp,
      status: "pending",
      expiresAt,
    };
  });
  persist([...added, ...cache]);
  return added;
}

export function resendInvite(id: string) {
  persist(
    cache.map((i) =>
      i.id === id ? { ...i, sent: nowStamp(), status: "pending" } : i,
    ),
  );
}

export function revokeInvite(id: string): InviteRow | undefined {
  const removed = cache.find((i) => i.id === id);
  if (!removed) return undefined;
  persist(cache.filter((i) => i.id !== id));
  return removed;
}

export function restoreInvite(row: InviteRow) {
  if (cache.some((i) => i.id === row.id)) return;
  persist([row, ...cache]);
}

export function updateInviteRole(id: string, role: InviteRole) {
  persist(cache.map((i) => (i.id === id ? { ...i, role } : i)));
}

export function getInviteLink(slug: string): string {
  return `pulse.hr/join/${slug}/${LINK_TOKEN}`;
}

export function getInviteToken(): string {
  return LINK_TOKEN;
}

export function useInvites(): InviteRow[] {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => cache,
    () => cache,
  );
}
