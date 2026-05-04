import { useUser } from "@clerk/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useWorkspaceRole, type WorkspaceRole } from "@/lib/workspace-role";

/**
 * Two role concepts live here, deliberately kept separate:
 *
 *   - **Real role** — comes from Clerk `publicMetadata.role`. Server-set
 *     only (Clerk dashboard / backend), never written from the browser.
 *     Defaults to "user" — new sign-ups are NOT admins. Reserved for
 *     Pulse staff / system-level capabilities.
 *
 *   - **Workspace persona** — admin/hr/manager/finance/employee. Picked
 *     by the user at /welcome and stored locally per Clerk user (see
 *     `workspace-role.ts`). Drives sidebar groups, themes, role-as
 *     previews. Defaults to "admin" because every user owns their own
 *     demo workspace.
 *
 * `useEffectiveRole` returns the workspace persona, or the optional
 * "view as" override when set (any saved persona can preview another role
 * from the topbar switcher). UI gates that talk about "admin" almost always
 * mean **workspace persona admin** (`useIsEffectiveAdmin`); only Pulse-staff
 * features should call `useIsRealAdmin`.
 */
export type Role = "admin" | "hr" | "manager" | "finance" | "employee";
export const OVERRIDE_ROLES: Role[] = ["employee", "hr", "manager", "finance"];

const STORAGE_KEY = "pulse.roleOverride";

type Ctx = {
  override: Role | null;
  setOverride: (r: Role | null) => void;
};

const RoleOverrideContext = createContext<Ctx | null>(null);

function readStored(): Role | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v && OVERRIDE_ROLES.includes(v as Role) ? (v as Role) : null;
}

export function RoleOverrideProvider({ children }: { children: React.ReactNode }) {
  const [override, setOverrideState] = useState<Role | null>(() => readStored());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setOverrideState(readStored());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setOverride = useCallback((r: Role | null) => {
    if (r) window.localStorage.setItem(STORAGE_KEY, r);
    else window.localStorage.removeItem(STORAGE_KEY);
    setOverrideState(r);
  }, []);

  return (
    <RoleOverrideContext.Provider value={{ override, setOverride }}>
      {children}
    </RoleOverrideContext.Provider>
  );
}

export function useRoleOverride(): Ctx {
  const ctx = useContext(RoleOverrideContext);
  if (!ctx) throw new Error("useRoleOverride outside RoleOverrideProvider");
  return ctx;
}

function realRoleFromUser(user: unknown): string {
  // Server-controlled role only — `unsafeMetadata` is user-writable and
  // therefore must never count as a system role.
  const u = user as { publicMetadata?: Record<string, unknown> } | null | undefined;
  return (u?.publicMetadata?.role as string | undefined) ?? "";
}

/** Real Clerk role — Pulse staff / system flag. NOT the workspace persona. */
export function useRealRole(): string {
  const { user } = useUser();
  return realRoleFromUser(user);
}

/** True only for Pulse staff (`publicMetadata.role === "admin"`). */
export function useIsRealAdmin(): boolean {
  return useRealRole() === "admin";
}

/** Workspace persona — the frontend "what does the UI show" role. */
export function useWorkspacePersona(): WorkspaceRole {
  return useWorkspaceRole();
}

/**
 * Effective role for UI: workspace persona, unless a "view as" override
 * is active (see topbar Switch role).
 */
export function useEffectiveRole(): Role {
  const persona = useWorkspaceRole();
  const { override } = useRoleOverride();
  if (override) return override;
  return persona;
}

/** Workspace-level admin (owner of the demo workspace). */
export function useIsEffectiveAdmin(): boolean {
  return useEffectiveRole() === "admin";
}
