import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { projects, projectById, type Project } from "@/lib/mock-data";

const STORAGE_KEY = "pulse.activeProject";

interface WorkspaceCtx {
  activeProjectId: string;
  setActiveProjectId: (id: string) => void;
  activeProject: Project | undefined;
}

const Ctx = createContext<WorkspaceCtx>({
  activeProjectId: projects[0].id,
  setActiveProjectId: () => {},
  activeProject: projects[0],
});

function readStored(): string {
  if (typeof window === "undefined") return projects[0].id;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && projects.some((c) => c.id === v)) return v;
  } catch {}
  return projects[0].id;
}

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeProjectId, setActiveProjectId] = useState(() => readStored());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, activeProjectId);
    } catch {}
  }, [activeProjectId]);

  const value = useMemo<WorkspaceCtx>(
    () => ({
      activeProjectId,
      setActiveProjectId,
      activeProject: projectById(activeProjectId),
    }),
    [activeProjectId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useWorkspace() {
  return useContext(Ctx);
}
