import { useAuth } from "@clerk/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiFetch } from "@/lib/api-client";

export type NotificationKind =
  | "release"
  | "comment.new"
  | "comment.reply"
  | "comment.vote"
  | "comment.status"
  | "mention";

export type NotificationRow = {
  id: string;
  userId: string;
  kind: NotificationKind;
  title: string;
  body: string;
  link: string | null;
  meta: Record<string, unknown> | null;
  readAt: string | null;
  createdAt: string;
};

type Ctx = {
  notifications: NotificationRow[];
  unreadCount: number;
  loading: boolean;
  refresh: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
};

const NotificationsContext = createContext<Ctx | null>(null);

const POLL_MS = 60_000;

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const fetchingRef = useRef(false);

  const authed = useCallback(
    async (path: string, init: RequestInit = {}): Promise<Response> => {
      const token = await getToken();
      return apiFetch(path, init, token);
    },
    [getToken],
  );

  const refresh = useCallback(async () => {
    if (!isSignedIn || fetchingRef.current) return;
    fetchingRef.current = true;
    setLoading(true);
    try {
      const res = await authed("/notifications?limit=40");
      if (!res.ok) throw new Error(String(res.status));
      const body = (await res.json()) as { notifications: NotificationRow[] };
      setNotifications(body.notifications ?? []);
    } catch (err) {
      // Silent — polling errors shouldn't nag the user. Log only in dev.
      if (import.meta.env.DEV) console.warn("[notifications] refresh failed", err);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [authed, isSignedIn]);

  // Initial load + focus-aware polling.
  useEffect(() => {
    if (!isSignedIn) return;
    void refresh();
    const timer = window.setInterval(() => void refresh(), POLL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      void timer;
    };
  }, [isSignedIn, refresh]);

  const markRead = useCallback(
    async (id: string) => {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      try {
        await authed("/notifications/mark-read", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ ids: [id] }),
        });
      } catch (err) {
        if (import.meta.env.DEV) console.warn("[notifications] markRead failed", err);
      }
    },
    [authed],
  );

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    try {
      await authed("/notifications/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch (err) {
      if (import.meta.env.DEV) console.warn("[notifications] markAllRead failed", err);
    }
  }, [authed]);

  const unreadCount = useMemo(() => notifications.filter((n) => !n.readAt).length, [notifications]);

  const value = useMemo(
    () => ({ notifications, unreadCount, loading, refresh, markRead, markAllRead }),
    [notifications, unreadCount, loading, refresh, markRead, markAllRead],
  );

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNotifications(): Ctx {
  const ctx = useContext(NotificationsContext);
  if (!ctx) throw new Error("useNotifications must be used inside <NotificationsProvider>");
  return ctx;
}
