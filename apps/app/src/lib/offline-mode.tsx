import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type Ctx = {
  offline: boolean;
  enable: () => void;
  disable: () => void;
};

const OfflineCtx = createContext<Ctx | null>(null);

const KEY = "pulse.offline";

function read(): boolean {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

function write(on: boolean) {
  try {
    if (on) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    /* noop */
  }
}

// Synchronous accessor for modules outside the React tree (e.g. apiFetch).
export function isOfflineMode(): boolean {
  return read();
}

export function OfflineModeProvider({ children }: { children: ReactNode }) {
  const [offline, setOffline] = useState<boolean>(() => read());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY) setOffline(read());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const enable = useCallback(() => {
    write(true);
    setOffline(true);
  }, []);

  const disable = useCallback(() => {
    write(false);
    setOffline(false);
  }, []);

  const value = useMemo(() => ({ offline, enable, disable }), [offline, enable, disable]);
  return <OfflineCtx.Provider value={value}>{children}</OfflineCtx.Provider>;
}

export function useOfflineMode(): Ctx {
  const ctx = useContext(OfflineCtx);
  if (!ctx) {
    return { offline: false, enable: () => {}, disable: () => {} };
  }
  return ctx;
}
