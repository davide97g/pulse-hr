import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { notifications, __setNotifications, type Notification } from "@/lib/mock-data";

// Pristine seed captured at module-init time — stays stable even when the
// mock-data live binding is reassigned on mutation.
const seed = notifications;

export const notificationsTable = createTable<Notification>("notifications", seed, "n");

export function useNotifications(): Notification[] {
  return notificationsTable.useAll();
}

notificationsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setNotifications(notificationsTable.getAll());
});
