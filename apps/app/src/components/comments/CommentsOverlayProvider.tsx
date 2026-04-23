import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth, useUser } from "@clerk/react";
import { useComments } from "@/lib/comments/useComments";
import { setTokenGetter } from "@/lib/comments/api";
import { getScrollRoot, resolveAnchor } from "@/lib/comments/anchor";
import { captureViewport, uploadScreenshot } from "@/lib/comments/screenshot";
import type { Author, Comment } from "@/lib/comments/types";

type Mode = "idle" | "placing";

type PlacementPoint = { x: number; y: number };

const VISIBILITY_KEY = "pulse.comments.visible";

type CommentsContextValue = {
  route: string;
  mode: Mode;
  enterPlacement: () => void;
  cancelPlacement: () => void;
  placementPoint: PlacementPoint | null;
  setPlacementPoint: (p: PlacementPoint | null) => void;
  pendingScreenshotUrl: string | null;
  screenshotStatus: "idle" | "capturing" | "ready" | "failed";
  activeCommentId: string | null;
  openThread: (id: string) => void;
  closeThread: () => void;
  comments: Comment[];
  author: Author | null;
  visible: boolean;
  toggleVisibility: () => void;
  submitNew: (body: string, captureAt: PlacementPoint, tags?: string[]) => Promise<void>;
  addReply: (commentId: string, body: string) => Promise<void>;
  vote: (commentId: string, value: -1 | 0 | 1) => Promise<void>;
  editComment: (commentId: string, body: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  repositionComment: (commentId: string, clientX: number, clientY: number) => Promise<void>;
};

const CommentsContext = createContext<CommentsContextValue | null>(null);

export function useCommentsOverlay(): CommentsContextValue {
  const ctx = useContext(CommentsContext);
  if (!ctx) throw new Error("useCommentsOverlay must be used inside CommentsOverlayProvider");
  return ctx;
}

export function CommentsOverlayProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const route = location.pathname;
  const { user } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    setTokenGetter(() => getToken());
    return () => setTokenGetter(null);
  }, [getToken]);

  const author: Author | null = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name:
        user.fullName ||
        user.firstName ||
        user.primaryEmailAddress?.emailAddress?.split("@")[0] ||
        "Someone",
      avatarUrl: user.imageUrl || null,
    };
  }, [user]);

  const {
    comments,
    loaded,
    addComment,
    addReply: addReplyApi,
    vote: voteApi,
    editComment: editCommentApi,
    deleteComment: deleteCommentApi,
    repositionComment: repositionCommentApi,
  } = useComments(route, user?.id ?? null);
  const autoOpenedRef = useRef<string | null>(null);

  const [visible, setVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    const raw = window.localStorage.getItem(VISIBILITY_KEY);
    return raw === null ? true : raw === "1";
  });
  const toggleVisibility = useCallback(() => {
    setVisible((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(VISIBILITY_KEY, next ? "1" : "0");
      } catch {
        // ignore storage errors
      }
      return next;
    });
  }, []);

  const [mode, setMode] = useState<Mode>("idle");
  const [placementPoint, setPlacementPointState] = useState<PlacementPoint | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [screenshotStatus, setScreenshotStatus] = useState<
    "idle" | "capturing" | "ready" | "failed"
  >("idle");
  const [pendingScreenshotUrl, setPendingScreenshotUrl] = useState<string | null>(null);
  const pendingScreenshotBlobRef = useRef<Blob | null>(null);

  const resetScreenshot = useCallback(() => {
    pendingScreenshotBlobRef.current = null;
    setPendingScreenshotUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setScreenshotStatus("idle");
  }, []);

  const setPlacementPoint = useCallback(
    (p: PlacementPoint | null) => {
      setPlacementPointState(p);
      if (!p) {
        resetScreenshot();
        return;
      }
      setScreenshotStatus("capturing");
      captureViewport()
        .then((blob) => {
          if (!blob) {
            setScreenshotStatus("failed");
            return;
          }
          pendingScreenshotBlobRef.current = blob;
          setPendingScreenshotUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(blob);
          });
          setScreenshotStatus("ready");
        })
        .catch(() => setScreenshotStatus("failed"));
    },
    [resetScreenshot],
  );

  const enterPlacement = useCallback(() => {
    setActiveCommentId(null);
    setPlacementPointState(null);
    resetScreenshot();
    setMode("placing");
  }, [resetScreenshot]);

  const cancelPlacement = useCallback(() => {
    setPlacementPointState(null);
    resetScreenshot();
    setMode("idle");
  }, [resetScreenshot]);

  const openThread = useCallback(
    (id: string) => {
      setMode("idle");
      setPlacementPointState(null);
      resetScreenshot();
      setActiveCommentId(id);
    },
    [resetScreenshot],
  );

  const closeThread = useCallback(() => setActiveCommentId(null), []);

  // Any in-flight placement or open thread belongs to the route we just left.
  // Clear them so we don't render a stale popover/composer over a new page.
  useEffect(() => {
    setMode("idle");
    setPlacementPointState(null);
    setActiveCommentId(null);
    resetScreenshot();
    autoOpenedRef.current = null;
  }, [route, resetScreenshot]);

  // Deep link: /{route}?thread=<id> auto-opens that pin once comments load and
  // scrolls it into view. Runs once per route visit.
  useEffect(() => {
    if (!loaded) return;
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const threadId = params.get("thread");
    if (!threadId) return;
    if (autoOpenedRef.current === threadId) return;
    const target = comments.find((c) => c.id === threadId);
    if (!target) return;
    autoOpenedRef.current = threadId;
    setActiveCommentId(threadId);
    const pos = resolveAnchor(target.anchor);
    if (pos) {
      const scrollRoot = getScrollRoot();
      const rootTop = scrollRoot?.getBoundingClientRect().top ?? 0;
      const targetTop = pos.y - rootTop - 120;
      scrollRoot?.scrollTo({
        top: Math.max(0, scrollRoot.scrollTop + targetTop),
        behavior: "smooth",
      });
    }
    params.delete("thread");
    const qs = params.toString();
    const next = window.location.pathname + (qs ? `?${qs}` : "");
    window.history.replaceState(null, "", next);
  }, [loaded, comments, route]);

  const submitNew = useCallback(
    async (body: string, captureAt: PlacementPoint, tags?: string[]) => {
      if (!author) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      const { captureAnchor, capturePageMeta } = await import("@/lib/comments/anchor");
      const anchor = captureAnchor(captureAt.x, captureAt.y);
      const pageMeta = capturePageMeta();

      let screenshotUrl: string | null = null;
      const blob = pendingScreenshotBlobRef.current;
      if (blob) {
        try {
          screenshotUrl = await uploadScreenshot(blob, () => getToken());
        } catch {
          screenshotUrl = null;
        }
      }

      await addComment(
        {
          route,
          anchor,
          pageMeta,
          body: trimmed,
          tags: tags && tags.length > 0 ? tags : undefined,
          screenshotUrl,
        },
        author,
      );
      setPlacementPointState(null);
      resetScreenshot();
      setMode("idle");
    },
    [addComment, author, getToken, resetScreenshot, route],
  );

  const addReply = useCallback(
    async (commentId: string, body: string) => {
      if (!author) return;
      const trimmed = body.trim();
      if (!trimmed) return;
      await addReplyApi(commentId, trimmed);
    },
    [addReplyApi, author],
  );

  const vote = useCallback(
    async (commentId: string, value: -1 | 0 | 1) => {
      await voteApi(commentId, value);
    },
    [voteApi],
  );

  const editComment = useCallback(
    async (commentId: string, body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      await editCommentApi(commentId, trimmed);
    },
    [editCommentApi],
  );

  const deleteComment = useCallback(
    async (commentId: string) => {
      await deleteCommentApi(commentId);
      setActiveCommentId(null);
    },
    [deleteCommentApi],
  );

  const repositionComment = useCallback(
    async (commentId: string, clientX: number, clientY: number) => {
      const target = comments.find((c) => c.id === commentId);
      if (!target || target.author.id !== author?.id) return;
      const { captureAnchor } = await import("@/lib/comments/anchor");
      const anchor = captureAnchor(clientX, clientY);
      await repositionCommentApi(commentId, anchor);
    },
    [comments, author?.id, repositionCommentApi],
  );

  const value: CommentsContextValue = {
    route,
    mode,
    enterPlacement,
    cancelPlacement,
    placementPoint,
    setPlacementPoint,
    pendingScreenshotUrl,
    screenshotStatus,
    activeCommentId,
    openThread,
    closeThread,
    comments,
    author,
    visible,
    toggleVisibility,
    submitNew,
    addReply,
    vote,
    editComment,
    deleteComment,
    repositionComment,
  };

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}
