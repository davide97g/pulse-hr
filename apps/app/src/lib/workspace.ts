/**
 * Per-Clerk-user persistent demo workspace controller.
 *
 * All data lives under `pulse.ws.<clerkUserId>.*` in localStorage. A workspace
 * is "ready" only after `createWorkspace()` has been called from onboarding;
 * before that, every registered table reads as empty. `resetWorkspace()` wipes
 * everything for the current user and returns the app to onboarding.
 *
 * Schema evolution: bump SCHEMA_VERSION when any entity type changes. On load,
 * `useWorkspaceStatus` flags `needsReset=true`; the SchemaResetToast surfaces
 * a sonner action to reset (no silent wipes).
 *
 * `storage.ts` registers tables here so seed/clear/hydrate can fan out.
 */
import { useSyncExternalStore } from "react";

export const SCHEMA_VERSION = 2;
export const DEFAULT_WORKSPACE_NAME = "Acme";
export const ANON_USER_ID = "__anon__";
export const SEEDED_OWNER_NAME = "Sarah Chen";
const ROOT = "pulse.ws";

// ── Current user ─────────────────────────────────────────────────────
let currentUserId: string | null = null;

interface RegisteredTable {
  key: string;
  /** Re-read from localStorage for the current namespace. */
  hydrate: () => void;
  /** Drop in-memory state to []. Does not touch localStorage. */
  clear: () => void;
  /** Write the seed array to localStorage + memory for current namespace. */
  seed: () => void;
}
const registry = new Map<string, RegisteredTable>();

export function registerTable(t: RegisteredTable) {
  registry.set(t.key, t);
}

export function getNamespace(): string | null {
  return currentUserId ? `${ROOT}.${currentUserId}` : null;
}

function metaKey(suffix: string): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.${suffix}` : null;
}

export function setCurrentUserId(uid: string | null) {
  if (currentUserId === uid) return;
  currentUserId = uid;
  for (const t of registry.values()) {
    if (uid) t.hydrate();
    else t.clear();
  }
  notifyStatus();
  for (const cb of namespaceListeners) {
    try {
      cb();
    } catch (err) {
      console.warn("namespace listener", err);
    }
  }
}

// Lightweight pub-sub for "the active Clerk user changed". `workspace-role.ts`
// uses this to force its memoized snapshot to re-read from the new namespace.
const namespaceListeners = new Set<() => void>();
export function onNamespaceChange(cb: () => void): () => void {
  namespaceListeners.add(cb);
  return () => {
    namespaceListeners.delete(cb);
  };
}

// ── Workspace lifecycle ──────────────────────────────────────────────
export function isWorkspaceReady(): boolean {
  const k = metaKey("workspaceReady");
  if (!k) return false;
  try {
    return localStorage.getItem(k) === "true";
  } catch {
    return false;
  }
}

export function storedSchemaVersion(): number | null {
  const k = metaKey("schemaVersion");
  if (!k) return null;
  try {
    const v = localStorage.getItem(k);
    return v == null ? null : Number(v);
  } catch {
    return null;
  }
}

export function needsResetForSchema(): boolean {
  if (!isWorkspaceReady()) return false;
  const v = storedSchemaVersion();
  return v != null && v !== SCHEMA_VERSION;
}

export function getWorkspaceName(): string {
  const k = metaKey("workspaceName");
  if (!k) return DEFAULT_WORKSPACE_NAME;
  try {
    return localStorage.getItem(k) || DEFAULT_WORKSPACE_NAME;
  } catch {
    return DEFAULT_WORKSPACE_NAME;
  }
}

export function setWorkspaceName(name: string) {
  const k = metaKey("workspaceName");
  if (!k) return;
  try {
    localStorage.setItem(k, name);
  } catch (err) {
    console.warn("setWorkspaceName: write failed", err);
  }
  notifyStatus();
}

export function createWorkspace(name: string = DEFAULT_WORKSPACE_NAME) {
  const readyK = metaKey("workspaceReady");
  const versionK = metaKey("schemaVersion");
  const nameK = metaKey("workspaceName");
  if (!readyK || !versionK || !nameK) {
    console.warn("createWorkspace: no Clerk user yet, ignoring");
    return;
  }
  for (const t of registry.values()) t.seed();
  try {
    localStorage.setItem(readyK, "true");
    localStorage.setItem(versionK, String(SCHEMA_VERSION));
    localStorage.setItem(nameK, name.trim() || DEFAULT_WORKSPACE_NAME);
  } catch (err) {
    console.warn("createWorkspace: localStorage write failed", err);
  }
  notifyStatus();
}

function replaceStringDeep(value: unknown, from: string, to: string): unknown {
  if (typeof value === "string") return value === from ? to : value;
  if (Array.isArray(value)) return value.map((item) => replaceStringDeep(item, from, to));
  if (!value || typeof value !== "object") return value;
  const out: Record<string, unknown> = {};
  for (const [key, nested] of Object.entries(value)) {
    out[key] = replaceStringDeep(nested, from, to);
  }
  return out;
}

/**
 * Rewrites seeded owner placeholders inside the current namespace so the
 * default "me" identity reflects the signed-in user.
 */
export function personalizeWorkspaceOwner(ownerName: string) {
  const ns = getNamespace();
  const target = ownerName.trim();
  if (!ns || !target || target === SEEDED_OWNER_NAME) return;
  const prefix = `${ns}.`;
  const keys: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as unknown;
        const replaced = replaceStringDeep(parsed, SEEDED_OWNER_NAME, target);
        localStorage.setItem(key, JSON.stringify(replaced));
      } catch {
        // Ignore non-JSON entries (workspace metadata keys are plain strings).
      }
    }
  } catch (err) {
    console.warn("personalizeWorkspaceOwner: localStorage rewrite failed", err);
  }
  for (const t of registry.values()) t.hydrate();
  notifyStatus();
}

export function resetWorkspace() {
  const ns = getNamespace();
  if (!ns) return;
  const prefix = `${ns}.`;
  try {
    const toRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) toRemove.push(k);
    }
    toRemove.forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.warn("resetWorkspace: localStorage wipe failed", err);
  }
  for (const t of registry.values()) t.clear();
  notifyStatus();
}

// ── Status hook ──────────────────────────────────────────────────────
const statusListeners = new Set<() => void>();
let statusVersion = 0;
function notifyStatus() {
  statusVersion += 1;
  for (const l of statusListeners) {
    try {
      l();
    } catch (err) {
      console.warn("workspace status listener", err);
    }
  }
}

export interface WorkspaceStatus {
  /** Real Clerk user is known (excludes the anonymous demo namespace). */
  hasUser: boolean;
  /** Either a real or anonymous user namespace is active. */
  hasAnyUser: boolean;
  /** Workspace has been created (seed applied) for this namespace. */
  ready: boolean;
  /** Stored schema version differs from code SCHEMA_VERSION. */
  needsReset: boolean;
  /** User-chosen display name for this demo workspace. */
  name: string;
}

function snapshotStatus(): WorkspaceStatus {
  return {
    hasUser: currentUserId != null && currentUserId !== ANON_USER_ID,
    hasAnyUser: currentUserId != null,
    ready: isWorkspaceReady(),
    needsReset: needsResetForSchema(),
    name: getWorkspaceName(),
  };
}

export function isAnonymousWorkspace(): boolean {
  return currentUserId === ANON_USER_ID;
}

// Cache the snapshot object so useSyncExternalStore sees referential equality
// between renders when nothing changed.
let cachedStatus: WorkspaceStatus = snapshotStatus();
let cachedStatusVersion = statusVersion;
function getStatusSnapshot(): WorkspaceStatus {
  if (statusVersion !== cachedStatusVersion) {
    cachedStatus = snapshotStatus();
    cachedStatusVersion = statusVersion;
  }
  return cachedStatus;
}

function subscribeStatus(l: () => void) {
  statusListeners.add(l);
  return () => {
    statusListeners.delete(l);
  };
}

export function useWorkspaceStatus(): WorkspaceStatus {
  return useSyncExternalStore(subscribeStatus, getStatusSnapshot, getStatusSnapshot);
}
