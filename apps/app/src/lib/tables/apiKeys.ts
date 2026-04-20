import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { apiKeysSeed, __setApiKeysSeed, type ApiKey } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = apiKeysSeed;

export const apiKeysTable = createTable<ApiKey>("apiKeys", seed, "ak");

export function useApiKeys(): ApiKey[] {
  return apiKeysTable.useAll();
}

apiKeysTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setApiKeysSeed(apiKeysTable.getAll());
});
