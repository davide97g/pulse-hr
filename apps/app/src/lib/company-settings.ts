/**
 * Company profile + security toggles for /settings. Workspace display name
 * lives in `workspace.ts` (single source of truth for the sidebar); this slice
 * owns the rest.
 */
import { useSyncExternalStore } from "react";
import { getNamespace } from "./workspace";

export interface SecurityPrefs {
  twofa: boolean;
  sso: boolean;
  sessionTimeout: boolean;
  ipAllowlist: boolean;
}

export interface CompanySettings {
  legal: string;
  country: string;
  currency: string;
  security: SecurityPrefs;
}

const DEFAULTS: CompanySettings = {
  legal: "",
  country: "United States",
  currency: "USD",
  security: {
    twofa: true,
    sso: true,
    sessionTimeout: false,
    ipAllowlist: false,
  },
};

const SUFFIX = "companySettings";

function storageKey(): string | null {
  const ns = getNamespace();
  return ns ? `${ns}.${SUFFIX}` : null;
}

const listeners = new Set<() => void>();
let cache: CompanySettings = DEFAULTS;

function read(): CompanySettings {
  const k = storageKey();
  if (!k) return DEFAULTS;
  try {
    const raw = localStorage.getItem(k);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw) as Partial<CompanySettings>;
    return {
      ...DEFAULTS,
      ...parsed,
      security: { ...DEFAULTS.security, ...(parsed.security ?? {}) },
    };
  } catch {
    return DEFAULTS;
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

function persist(next: CompanySettings) {
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

export function updateCompanySettings(patch: Partial<Omit<CompanySettings, "security">>) {
  persist({ ...cache, ...patch });
}

export function updateSecurity(patch: Partial<SecurityPrefs>) {
  persist({ ...cache, security: { ...cache.security, ...patch } });
}

export function useCompanySettings(): CompanySettings {
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
