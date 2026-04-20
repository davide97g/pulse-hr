import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { clients, __setClients, type Client } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = clients;

export const clientsTable = createTable<Client>("clients", seed, "cl");

export function useClients(): Client[] {
  return clientsTable.useAll();
}

clientsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setClients(clientsTable.getAll());
});
