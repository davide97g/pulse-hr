import { useAuth, useUser } from "@clerk/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import type { SidebarFeatureId } from "@/lib/sidebar-features";
import {
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
  readSidebarFeaturesFromStorage,
  writeSidebarFeaturesToStorage,
} from "@/lib/sidebar-features";
import { isAdminUser } from "@/lib/comments/admin";
import { pulseWorkspaceKey } from "@/lib/workspace-key";
import type { RoleFeatureOverrides } from "@/lib/role-features";
import type { Role } from "@/lib/role-override";

type SidebarFeaturesContextValue = {
  enabled: Record<SidebarFeatureId, boolean>;
  setEnabled: (id: SidebarFeatureId, value: boolean) => void;
  setAll: (next: Record<SidebarFeatureId, boolean>) => void;
  isFeatureEnabled: (id: SidebarFeatureId) => boolean;
  roleFeatures: RoleFeatureOverrides | null;
  setRoleFeature: (role: Role, id: SidebarFeatureId, value: boolean | null) => void;
  setRoleFeatures: (next: RoleFeatureOverrides | null) => void;
};

const ROLE_FEATURES_STORAGE_KEY = "pulse.roleFeatures.v1";

function readRoleFeaturesFromStorage(): RoleFeatureOverrides | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(ROLE_FEATURES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as RoleFeatureOverrides) : null;
  } catch {
    return null;
  }
}

function writeRoleFeaturesToStorage(value: RoleFeatureOverrides | null) {
  if (typeof window === "undefined") return;
  try {
    if (value === null) window.localStorage.removeItem(ROLE_FEATURES_STORAGE_KEY);
    else window.localStorage.setItem(ROLE_FEATURES_STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

const SidebarFeaturesContext = createContext<SidebarFeaturesContextValue | null>(null);

export function SidebarFeaturesProvider({ children }: { children: ReactNode }) {
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const workspaceKey = pulseWorkspaceKey();
  const [enabled, setEnabledState] = useState<Record<SidebarFeatureId, boolean>>(() =>
    typeof window === "undefined"
      ? defaultSidebarFeaturesEnabled()
      : readSidebarFeaturesFromStorage(),
  );
  const [roleFeaturesState, setRoleFeaturesState] = useState<RoleFeatureOverrides | null>(() =>
    readRoleFeaturesFromStorage(),
  );

  const persistRemote = useCallback(
    async (payload: {
      features?: Record<SidebarFeatureId, boolean>;
      roleFeatures?: RoleFeatureOverrides | null;
    }) => {
      if (!isAdminUser(user)) return;
      const token = await getToken();
      if (!token) return;
      try {
        const res = await fetch("/api/workspace/sidebar-features", {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ workspaceKey, ...payload }),
        });
        const body = (await res.json().catch(() => null)) as {
          error?: { code?: string; message?: string };
        } | null;
        if (!res.ok) {
          const detail =
            body?.error?.message ??
            body?.error?.code ??
            (res.status === 503
              ? "Configurazione server (es. Clerk) incompleta."
              : `HTTP ${res.status}`);
          toast.error("Salvataggio moduli menu non riuscito", { description: detail });
        }
      } catch (e) {
        toast.error("Salvataggio moduli menu non riuscito", {
          description: e instanceof Error ? e.message : "Errore di rete",
        });
      }
    },
    [user, getToken, workspaceKey],
  );

  useEffect(() => {
    if (!authLoaded || !isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        if (!token || cancelled) return;
        const url = `/api/workspace/sidebar-features?workspaceKey=${encodeURIComponent(workspaceKey)}`;
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as {
          features?: unknown;
          roleFeatures?: RoleFeatureOverrides | null;
        };
        if (cancelled) return;
        const merged = mergePartialFeaturesRecord(data.features);
        setEnabledState(merged);
        writeSidebarFeaturesToStorage(merged);
        const rf = data.roleFeatures ?? null;
        setRoleFeaturesState(rf);
        writeRoleFeaturesToStorage(rf);
      } catch (e) {
        if (cancelled) return;
        // Never toast here: production PWA/cache can serve old bundles and users
        // should not be interrupted for a background sync failure.
        console.warn(
          "[pulse] sidebar-features GET failed — using local cache. Check /api, DATABASE_URL, Neon migrations.",
          e,
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, getToken, workspaceKey]);

  const setEnabled = useCallback(
    (id: SidebarFeatureId, value: boolean) => {
      setEnabledState((prev) => {
        const next = { ...prev, [id]: value };
        writeSidebarFeaturesToStorage(next);
        void persistRemote({ features: next });
        return next;
      });
    },
    [persistRemote],
  );

  const setAll = useCallback(
    (next: Record<SidebarFeatureId, boolean>) => {
      const merged = { ...defaultSidebarFeaturesEnabled(), ...next };
      writeSidebarFeaturesToStorage(merged);
      setEnabledState(merged);
      void persistRemote({ features: merged });
    },
    [persistRemote],
  );

  const setRoleFeatures = useCallback(
    (next: RoleFeatureOverrides | null) => {
      setRoleFeaturesState(next);
      writeRoleFeaturesToStorage(next);
      void persistRemote({ roleFeatures: next });
    },
    [persistRemote],
  );

  const setRoleFeature = useCallback(
    (role: Role, id: SidebarFeatureId, value: boolean | null) => {
      setRoleFeaturesState((prev) => {
        const base: RoleFeatureOverrides = prev ? { ...prev } : {};
        const forRole: Partial<Record<SidebarFeatureId, boolean>> = {
          ...(base[role] ?? {}),
        };
        if (value === null) delete forRole[id];
        else forRole[id] = value;
        if (Object.keys(forRole).length === 0) {
          delete base[role];
        } else {
          base[role] = forRole;
        }
        const next: RoleFeatureOverrides | null =
          Object.keys(base).length === 0 ? null : base;
        writeRoleFeaturesToStorage(next);
        void persistRemote({ roleFeatures: next });
        return next;
      });
    },
    [persistRemote],
  );

  const isFeatureEnabled = useCallback((id: SidebarFeatureId) => enabled[id] !== false, [enabled]);

  const value = useMemo(
    () => ({
      enabled,
      setEnabled,
      setAll,
      isFeatureEnabled,
      roleFeatures: roleFeaturesState,
      setRoleFeature,
      setRoleFeatures,
    }),
    [enabled, setEnabled, setAll, isFeatureEnabled, roleFeaturesState, setRoleFeature, setRoleFeatures],
  );

  return (
    <SidebarFeaturesContext.Provider value={value}>{children}</SidebarFeaturesContext.Provider>
  );
}

/** Consumer hook colocated with the provider (standard React pattern). */
// eslint-disable-next-line react-refresh/only-export-components
export function useSidebarFeatures() {
  const ctx = useContext(SidebarFeaturesContext);
  if (!ctx) {
    throw new Error("useSidebarFeatures must be used within SidebarFeaturesProvider");
  }
  return ctx;
}
