import { useNavigate, useSearch } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Binds one URL search param to state.
 * Omitted/empty/default values are removed from the URL.
 *
 * Works on any route. Routes with a typed `validateSearch` must list the key
 * in their schema or it will be stripped on reload.
 */
export function useUrlParam(
  key: string,
  defaultValue: string = "",
): [string, (v: string | null) => void] {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;
  const raw = search[key];
  const value = typeof raw === "string" && raw.length > 0 ? raw : defaultValue;

  const set = useCallback(
    (v: string | null) => {
      navigate({
        to: ".",
        search: ((prev: Record<string, string | undefined>) => {
          const next: Record<string, string | undefined> = { ...prev };
          if (v === null || v === "" || v === defaultValue) delete next[key];
          else next[key] = v;
          return next;
        }) as never,
        replace: true,
      });
    },
    [navigate, key, defaultValue],
  );

  return [value, set];
}

/** Boolean flag sugar on top of useUrlParam: "1" = on, absent = off. */
export function useUrlFlag(key: string): [boolean, (v: boolean) => void] {
  const [v, setV] = useUrlParam(key);
  return [v === "1", (on) => setV(on ? "1" : null)];
}
