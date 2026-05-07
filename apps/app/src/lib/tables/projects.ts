import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { projects, __setProjects, type Project } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = projects;

export const projectsTable = createTable<Project>("projects", seed, "cm");

export function useProjects(): Project[] {
  return projectsTable.useAll();
}

projectsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setProjects(projectsTable.getAll());
});
