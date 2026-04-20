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

export const SCHEMA_VERSION = 1;
export const DEFAULT_WORKSPACE_NAME = "Acme";
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
  /** Clerk user is known. */
  hasUser: boolean;
  /** Workspace has been created (seed applied) for this user. */
  ready: boolean;
  /** Stored schema version differs from code SCHEMA_VERSION. */
  needsReset: boolean;
  /** User-chosen display name for this demo workspace. */
  name: string;
}

function snapshotStatus(): WorkspaceStatus {
  return {
    hasUser: currentUserId != null,
    ready: isWorkspaceReady(),
    needsReset: needsResetForSchema(),
    name: getWorkspaceName(),
  };
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
