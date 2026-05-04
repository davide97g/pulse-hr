/**
 * Workspace persona ("frontend role") — admin / hr / manager / finance /
 * employee — picked at /welcome and stored locally per Clerk user.
 *
 * This is **not** the user's real Clerk role: real role comes from
 * `publicMetadata.role` and is server-controlled (Pulse staff only). The
 * persona is purely a UI flag that drives sidebar groups, themes and
 * role-as previews. Defaulting to "admin" makes sense because every user
 * owns the demo workspace they create.
 *
 * Stored alongside the workspace data under `pulse.ws.<userId>.role` so
 * `resetWorkspace()` (in workspace.ts) wipes it together with seeded
 * tables.
 */
import { useSyncExternalStore } from "react";
import { getNamespace, onNamespaceChange } from "@/lib/workspace";

export type WorkspaceRole = "admin" | "hr" | "manager" | "finance" | "employee";

const ALL: readonly WorkspaceRole[] = ["admin", "hr", "manager", "finance", "employee"];
export const DEFAULT_WORKSPACE_ROLE: WorkspaceRole = "admin";

function key(): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.role` : null;
}

function isWorkspaceRole(v: unknown): v is WorkspaceRole {
  return typeof v === "string" && (ALL as readonly string[]).includes(v);
}

export function getWorkspaceRole(): WorkspaceRole {
  const k = key();
  if (!k) return DEFAULT_WORKSPACE_ROLE;
  try {
    const v = localStorage.getItem(k);
    return isWorkspaceRole(v) ? v : DEFAULT_WORKSPACE_ROLE;
  } catch {
    return DEFAULT_WORKSPACE_ROLE;
  }
}

const listeners = new Set<() => void>();
let version = 0;
function notify() {
  version += 1;
  for (const l of listeners) {
    try {
      l();
    } catch (err) {
      console.warn("workspace-role listener", err);
    }
  }
}

export function setWorkspaceRole(role: WorkspaceRole) {
  const k = key();
  if (!k) return;
  try {
    localStorage.setItem(k, role);
  } catch (err) {
    console.warn("setWorkspaceRole: write failed", err);
  }
  notify();
}

// Cross-tab sync: storage event fires in *other* tabs when our key changes.
if (typeof window !== "undefined") {
  window.addEventListener("storage", (e) => {
    const k = key();
    if (k && e.key === k) notify();
  });
}

// Re-read when Clerk's userId flips (sign-in / sign-out / account swap).
onNamespaceChange(() => notify());

let cached: WorkspaceRole = DEFAULT_WORKSPACE_ROLE;
let cachedVersion = -1;
let cachedNamespace: string | null = null;
function getSnapshot(): WorkspaceRole {
  const ns = getNamespace();
  if (version !== cachedVersion || ns !== cachedNamespace) {
    cached = getWorkspaceRole();
    cachedVersion = version;
    cachedNamespace = ns;
  }
  return cached;
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function useWorkspaceRole(): WorkspaceRole {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

/** Notify subscribers — called by workspace.ts when the namespace flips. */
export function notifyWorkspaceRoleChange() {
  notify();
}
