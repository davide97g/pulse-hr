import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { closuresSeed, __setClosures, type Closure } from "@/lib/offices";

export const closuresTable = createTable<Closure>("closures", closuresSeed, "clo");

export function useClosures(): Closure[] {
  return closuresTable.useAll();
}

export function useClosure(id: string): Closure | undefined {
  return closuresTable.useById(id);
}

closuresTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setClosures(closuresTable.getAll());
});
