import { useUser } from "@clerk/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

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
  const u = user as
    | {
        publicMetadata?: Record<string, unknown>;
        unsafeMetadata?: Record<string, unknown>;
      }
    | null
    | undefined;
  return (
    (u?.publicMetadata?.role as string | undefined) ??
    (u?.unsafeMetadata?.role as string | undefined) ??
    ""
  );
}

/** The user's true Clerk role, ignoring any override. */
export function useRealRole(): string {
  const { user } = useUser();
  return realRoleFromUser(user);
}

/** The effective role — respects admin overrides. */
export function useEffectiveRole(): string {
  const real = useRealRole();
  const { override } = useRoleOverride();
  if (real === "admin" && override) return override;
  return real;
}

export function useIsRealAdmin(): boolean {
  return useRealRole() === "admin";
}

export function useIsEffectiveAdmin(): boolean {
  return useEffectiveRole() === "admin";
}
