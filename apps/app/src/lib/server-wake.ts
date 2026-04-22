import { apiUrl } from "./api-client";

export type HealthState = "unknown" | "waking" | "awake" | "error";

const BACKOFF = [500, 1000, 2000, 3000, 4000];

export async function pingHealth(signal?: AbortSignal): Promise<boolean> {
  try {
    const res = await fetch(apiUrl("/health"), {
      signal,
      headers: { accept: "application/json" },
    });
    if (!res.ok) return false;
    const body = (await res.json()) as { ok?: boolean };
    return body.ok === true;
  } catch {
    return false;
  }
}

export type WakePolling = {
  stop: () => void;
  promise: Promise<"awake" | "aborted" | "timeout">;
};

export function startHealthPolling({
  timeoutMs = 90_000,
  onAttempt,
}: {
  timeoutMs?: number;
  onAttempt?: (attempt: number) => void;
} = {}): WakePolling {
  const abort = new AbortController();
  let stopped = false;
  let attempt = 0;
  const started = Date.now();

  const promise = new Promise<"awake" | "aborted" | "timeout">((resolve) => {
    const tick = async () => {
      if (stopped) {
        resolve("aborted");
        return;
      }
      attempt += 1;
      onAttempt?.(attempt);
      const ok = await pingHealth(abort.signal);
      if (ok) {
        resolve("awake");
        return;
      }
      if (Date.now() - started > timeoutMs) {
        resolve("timeout");
        return;
      }
      const delay = BACKOFF[Math.min(attempt - 1, BACKOFF.length - 1)]!;
      setTimeout(tick, delay);
    };
    tick();
  });

  return {
    stop: () => {
      stopped = true;
      abort.abort();
    },
    promise,
  };
}

const BOOT_SESSION_KEY = "pulse.booted";

export function markBootComplete() {
  try {
    sessionStorage.setItem(BOOT_SESSION_KEY, "1");
  } catch {
    /* noop */
  }
}

export function hasBooted(): boolean {
  try {
    return sessionStorage.getItem(BOOT_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}
