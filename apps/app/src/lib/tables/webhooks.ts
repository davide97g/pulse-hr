import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { webhooksSeed, __setWebhooksSeed, type Webhook } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = webhooksSeed;

export const webhooksTable = createTable<Webhook>("webhooks", seed, "wh");

export function useWebhooks(): Webhook[] {
  return webhooksTable.useAll();
}

webhooksTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setWebhooksSeed(webhooksTable.getAll());
});
