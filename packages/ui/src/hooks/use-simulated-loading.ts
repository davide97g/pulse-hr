import { useEffect, useState } from "react";

/**
 * Tiny "loading shimmer for mock-data routes" helper. Returns `true` for
 * `durationMs`, then flips to `false`. Resets whenever any value in `deps`
 * changes (so toggling a tab re-runs the shimmer).
 *
 * Same return shape as `useQuery({}).isPending`, so when real APIs land we
 * can swap call sites mechanically without a rename.
 */
export function useSimulatedLoading(durationMs = 420, deps: ReadonlyArray<unknown> = []): boolean {
  const [loading, setLoading] = useState(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    setLoading(true);
    const handle = window.setTimeout(() => setLoading(false), durationMs);
    return () => window.clearTimeout(handle);
  }, [durationMs, ...deps]);
  return loading;
}
