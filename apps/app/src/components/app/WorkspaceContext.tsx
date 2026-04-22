import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { commesse, commessaById, type Commessa } from "@/lib/mock-data";

const STORAGE_KEY = "pulse.activeCommessa";

interface WorkspaceCtx {
  activeCommessaId: string;
  setActiveCommessaId: (id: string) => void;
  activeCommessa: Commessa | undefined;
}

const Ctx = createContext<WorkspaceCtx>({
  activeCommessaId: commesse[0].id,
  setActiveCommessaId: () => {},
  activeCommessa: commesse[0],
});

function readStored(): string {
  if (typeof window === "undefined") return commesse[0].id;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && commesse.some((c) => c.id === v)) return v;
  } catch {}
  return commesse[0].id;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeCommessaId, setActiveCommessaId] = useState(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeCommessaId);
    } catch {}
  }, [activeCommessaId]);

  const value = useMemo<WorkspaceCtx>(
    () => ({
      activeCommessaId,
      setActiveCommessaId,
      activeCommessa: commessaById(activeCommessaId),
    }),
    [activeCommessaId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  return useContext(Ctx);
}
