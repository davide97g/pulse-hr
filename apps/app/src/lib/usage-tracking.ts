import { useEffect, useRef } from "react";
import { useUser } from "@clerk/react";
import { useLocation } from "@tanstack/react-router";

export type UsageEvent = {
  at: string;
  userId: string | null;
  email: string | null;
  kind: "page_view" | "action";
  path: string;
  name?: string;
  meta?: Record<string, unknown>;
};

const BUFFER_CAP = 500;
const buffer: UsageEvent[] = [];

function push(ev: UsageEvent) {
  buffer.push(ev);
  if (buffer.length > BUFFER_CAP) buffer.shift();
  if (typeof window !== "undefined") {
    (window as unknown as { __pulseUsage?: UsageEvent[] }).__pulseUsage = buffer;
  }
  if (import.meta.env.DEV) {
    console.debug("[usage]", ev.kind, ev.path, ev.name ?? "", ev.email ?? "anon");
  }
}

export function useTrackPageViews() {
  const { user, isLoaded, isSignedIn } = useUser();
  const location = useLocation();
  const lastPath = useRef<string>("");

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (lastPath.current === location.pathname) return;
    lastPath.current = location.pathname;
    push({
      at: new Date().toISOString(),
      userId: user?.id ?? null,
      email: user?.primaryEmailAddress?.emailAddress ?? null,
      kind: "page_view",
      path: location.pathname,
    });
  }, [isLoaded, isSignedIn, user, location.pathname]);
}

export function trackAction(name: string, meta?: Record<string, unknown>) {
  const anyWin = typeof window !== "undefined" ? (window as unknown as { Clerk?: { user?: { id: string; primaryEmailAddress?: { emailAddress: string } } } }) : undefined;
  const u = anyWin?.Clerk?.user;
  push({
    at: new Date().toISOString(),
    userId: u?.id ?? null,
    email: u?.primaryEmailAddress?.emailAddress ?? null,
    kind: "action",
    path: typeof location !== "undefined" ? location.pathname : "",
    name,
    meta,
  });
}

export function getUsageBuffer(): UsageEvent[] {
  return [...buffer];
}
