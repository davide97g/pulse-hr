import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { customFieldsSeed, __setCustomFieldsSeed, type CustomField } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = customFieldsSeed;

export const customFieldsTable = createTable<CustomField>("customFields", seed, "cf");

export function useCustomFields(): CustomField[] {
  return customFieldsTable.useAll();
}

customFieldsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setCustomFieldsSeed(customFieldsTable.getAll());
});
