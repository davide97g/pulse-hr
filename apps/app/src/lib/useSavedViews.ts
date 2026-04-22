import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";

export type FieldType = "string" | "number" | "boolean" | "array";

export interface SavedView<State> {
  id: string;
  name: string;
  state: State;
  createdAt: string;
}

type Schema<State> = { [K in keyof State]: FieldType };

interface Options<State> {
  defaults: State;
  schema: Schema<State>;
}

interface Api<State> {
  state: State;
  setState: (patch: Partial<State>) => void;
  reset: () => void;
  savedViews: SavedView<State>[];
  save: (name: string) => SavedView<State>;
  apply: (id: string) => void;
  remove: (id: string) => void;
  rename: (id: string, name: string) => void;
  shareUrl: string;
  activeViewId: string | null;
  isDirty: boolean;
}

const lastKey = (scope: string) => `pulse.views.${scope}.last`;
const listKey = (scope: string) => `pulse.views.${scope}.list`;

// ── serialization ──────────────────────────────────────────────────────
function encodeValue(v: unknown, type: FieldType): string | null {
  if (v === undefined || v === null) return null;
  switch (type) {
    case "string":  return typeof v === "string" && v.length > 0 ? v : null;
    case "number":  return typeof v === "number" && !Number.isNaN(v) ? String(v) : null;
    case "boolean": return v ? "1" : "0";
    case "array":   return Array.isArray(v) && v.length > 0 ? (v as unknown[]).map(String).join(",") : null;
  }
}

function decodeValue(raw: string | null | undefined, type: FieldType): unknown {
  if (raw === null || raw === undefined || raw === "") return undefined;
  switch (type) {
    case "string":  return raw;
    case "number":  { const n = Number(raw); return Number.isFinite(n) ? n : undefined; }
    case "boolean": return raw === "1" || raw === "true";
    case "array":   return raw.split(",").filter(Boolean);
  }
}

function stateToSearch<State>(state: State, schema: Schema<State>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const key of Object.keys(schema) as (keyof State)[]) {
    const enc = encodeValue(state[key], schema[key]);
    if (enc !== null) out[String(key)] = enc;
  }
  return out;
}

function searchToState<State>(
  search: Record<string, unknown>,
  schema: Schema<State>,
  defaults: State,
): State {
  const out = { ...defaults } as State;
  for (const key of Object.keys(schema) as (keyof State)[]) {
    const raw = search[String(key)];
    const dec = decodeValue(typeof raw === "string" ? raw : raw == null ? null : String(raw), schema[key]);
    if (dec !== undefined) (out as Record<string, unknown>)[String(key)] = dec as never;
  }
  return out;
}

function statesEqual<State>(a: State, b: State, schema: Schema<State>): boolean {
  for (const key of Object.keys(schema) as (keyof State)[]) {
    const av = a[key];
    const bv = b[key];
    if (schema[key] === "array") {
      const aa = Array.isArray(av) ? [...(av as unknown[])].sort() : [];
      const bb = Array.isArray(bv) ? [...(bv as unknown[])].sort() : [];
      if (aa.length !== bb.length) return false;
      for (let i = 0; i < aa.length; i++) if (aa[i] !== bb[i]) return false;
    } else if (av !== bv) {
      return false;
    }
  }
  return true;
}

// ── hook ───────────────────────────────────────────────────────────────
export function useSavedViews<State extends Record<string, unknown>>(
  scope: string,
  { defaults, schema }: Options<State>,
): Api<State> {
  const navigate = useNavigate();
  const location = useLocation();

  const initial = useMemo<State>(() => {
    const searchEntries = new URLSearchParams(
      typeof window !== "undefined" ? window.location.search : "",
    );
    const fromUrl: Record<string, string> = {};
    searchEntries.forEach((v, k) => { fromUrl[k] = v; });
    if (Object.keys(fromUrl).length > 0) {
      return searchToState<State>(fromUrl, schema, defaults);
    }
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem(lastKey(scope));
        if (raw) return { ...defaults, ...(JSON.parse(raw) as Partial<State>) };
      } catch {}
    }
    return defaults;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [state, setStateInner] = useState<State>(initial);
  const [savedViews, setSavedViews] = useState<SavedView<State>[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(listKey(scope));
      if (raw) return JSON.parse(raw) as SavedView<State>[];
    } catch {}
    return [];
  });

  // Sync out → URL + localStorage. Merge with any non-schema search keys
  // (e.g. side-panel selection / inner-tab state set by useUrlParam) so they
  // are not stripped when filters change.
  useEffect(() => {
    const fromState = stateToSearch(state, schema);
    navigate({
      to: location.pathname,
      search: (prev) => {
        const next = { ...(prev as Record<string, unknown>) };
        for (const k of Object.keys(schema)) delete next[k];
        return { ...next, ...fromState } as never;
      },
      replace: true,
    });
    try { localStorage.setItem(lastKey(scope), JSON.stringify(state)); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const setState = useCallback((patch: Partial<State>) => {
    setStateInner(prev => ({ ...prev, ...patch }));
  }, []);

  const reset = useCallback(() => setStateInner(defaults), [defaults]);

  const persistViews = (next: SavedView<State>[]) => {
    setSavedViews(next);
    try { localStorage.setItem(listKey(scope), JSON.stringify(next)); } catch {}
  };

  const save = useCallback((name: string): SavedView<State> => {
    const view: SavedView<State> = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      name,
      state,
      createdAt: new Date().toISOString(),
    };
    persistViews([view, ...savedViews]);
    return view;
  }, [state, savedViews, scope]);

  const apply = useCallback((id: string) => {
    const v = savedViews.find(x => x.id === id);
    if (!v) return;
    setStateInner({ ...defaults, ...v.state });
  }, [savedViews, defaults]);

  const remove = useCallback((id: string) => {
    persistViews(savedViews.filter(v => v.id !== id));
  }, [savedViews, scope]);

  const rename = useCallback((id: string, name: string) => {
    persistViews(savedViews.map(v => (v.id === id ? { ...v, name } : v)));
  }, [savedViews, scope]);

  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(stateToSearch(state, schema));
    return `${window.location.origin}${location.pathname}${params.size ? `?${params.toString()}` : ""}`;
  }, [state, location.pathname, schema]);

  const activeViewId = useMemo(() => {
    const match = savedViews.find(v => statesEqual(v.state, state, schema));
    return match?.id ?? null;
  }, [savedViews, state, schema]);

  const isDirty = useMemo(
    () => !statesEqual(state, defaults, schema),
    [state, defaults, schema],
  );

  return { state, setState, reset, savedViews, save, apply, remove, rename, shareUrl, activeViewId, isDirty };
}
