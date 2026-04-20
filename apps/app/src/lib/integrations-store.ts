import { useEffect, useState } from "react";
import {
  integrationsSeed,
  type IntegrationConnection,
  type IntegrationProvider,
} from "./mock-data";

// Module-level store so /settings and /calendar share the same mock connection
// state within a single session. Not persisted — consistent with the rest of
// the app's "resets on reload" rule.

let state: IntegrationConnection[] = integrationsSeed.map((c) => ({ ...c }));
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export function updateIntegration(next: IntegrationConnection) {
  state = state.map((c) => (c.provider === next.provider ? next : c));
  notify();
}

export function useIntegrations() {
  const [snap, setSnap] = useState(state);
  useEffect(() => {
    const l = () => setSnap([...state]);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  return snap;
}

export function useIntegration(provider: IntegrationProvider): IntegrationConnection {
  const all = useIntegrations();
  return all.find((c) => c.provider === provider)!;
}
