import { useSyncExternalStore } from "react";
import { officesStore } from "@/lib/offices";

/**
 * Mount near the root so the whole React tree re-renders when the
 * offices/rooms/seats/closures module-level state changes. Consumer
 * components read the live ESM bindings directly (`offices`, `rooms`,
 * …), so they just need this provider in the tree to see updates.
 */
export function OfficesStoreProvider({ children }: { children: React.ReactNode }) {
  useSyncExternalStore(officesStore.subscribe, officesStore.getVersion, officesStore.getVersion);
  return <>{children}</>;
}
