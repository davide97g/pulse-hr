import { useCallback, useEffect, useState } from "react";
import { useEffectiveRole } from "@/lib/role-override";
import type { LensId } from "./types";

const STORAGE_KEY = "pulse.dashboardLens.v1";

function readStored(): LensId | null {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(STORAGE_KEY);
    if (v === "workload" || v === "sentiment" || v === "presence") return v;
    return null;
  } catch {
    return null;
  }
}

function defaultForRole(role: string): LensId {
  if (role === "hr") return "sentiment";
  if (role === "manager") return "presence";
  return "workload";
}

export function useDashboardLens(): { lens: LensId; setLens: (l: LensId) => void } {
  const role = useEffectiveRole();
  const [override, setOverride] = useState<LensId | null>(() => readStored());

  // When role changes and the user hasn't set a preference, do nothing —
  // we still derive default from role at render time.
  const lens: LensId = override ?? defaultForRole(role);

  const setLens = useCallback((l: LensId) => {
    setOverride(l);
    try {
      window.localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);

  // Sync across tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const v = e.newValue;
      if (v === "workload" || v === "sentiment" || v === "presence") setOverride(v);
      else if (!v) setOverride(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  return { lens, setLens };
}
