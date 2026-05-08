import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { officesSeed, __setOffices, type Office } from "@/lib/offices";

export const officesTable = createTable<Office>("offices", officesSeed, "of");

export function useOffices(): Office[] {
  return officesTable.useAll();
}

export function useOffice(id: string): Office | undefined {
  return officesTable.useById(id);
}

officesTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setOffices(officesTable.getAll());
});
