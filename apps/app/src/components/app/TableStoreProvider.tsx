/**
 * Subscribes to the "any persistent table changed" pulse and re-renders its
 * subtree on every mutation. Lets components that still read live bindings
 * from `mock-data.ts` (employees, etc.) reflect table changes without each
 * one being individually migrated to a hook.
 *
 * Mirrors the existing OfficesStoreProvider pattern, just generalised to
 * every table registered via `createTable`.
 */
import { useSyncExternalStore } from "react";
import { getAnyTableVersion, subscribeToAnyTable } from "@/lib/storage";

export function TableStoreProvider({ children }: { children: React.ReactNode }) {
  useSyncExternalStore(subscribeToAnyTable, getAnyTableVersion, getAnyTableVersion);
  return <>{children}</>;
}
