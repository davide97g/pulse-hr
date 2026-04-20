import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { useAuth, useUser } from "@clerk/react";
import { useComments } from "@/lib/comments/useComments";
import { setTokenGetter } from "@/lib/comments/api";
import { getScrollRoot, resolveAnchor } from "@/lib/comments/anchor";
import type { Author, Comment } from "@/lib/comments/types";

type Mode = "idle" | "placing";

type PlacementPoint = { x: number; y: number };

type CommentsContextValue = {
  route: string;
  mode: Mode;
  enterPlacement: () => void;
  cancelPlacement: () => void;
  placementPoint: PlacementPoint | null;
  setPlacementPoint: (p: PlacementPoint | null) => void;
  activeCommentId: string | null;
  openThread: (id: string) => void;
  closeThread: () => void;
  comments: Comment[];
  author: Author | null;
  submitNew: (body: string, captureAt: PlacementPoint, tags?: string[]) => Promise<void>;
  addReply: (commentId: string, body: string) => Promise<void>;
  vote: (commentId: string, value: -1 | 0 | 1) => Promise<void>;
  editComment: (commentId: string, body: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
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
  } = useComments(route, user?.id ?? null);
  const autoOpenedRef = useRef<string | null>(null);

  const [mode, setMode] = useState<Mode>("idle");
  const [placementPoint, setPlacementPoint] = useState<PlacementPoint | null>(null);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

  const enterPlacement = useCallback(() => {
    setActiveCommentId(null);
    setPlacementPoint(null);
    setMode("placing");
  }, []);

  const cancelPlacement = useCallback(() => {
    setPlacementPoint(null);
    setMode("idle");
  }, []);

  const openThread = useCallback((id: string) => {
    setMode("idle");
    setPlacementPoint(null);
    setActiveCommentId(id);
  }, []);

  const closeThread = useCallback(() => setActiveCommentId(null), []);

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
      scrollRoot?.scrollTo({ top: Math.max(0, scrollRoot.scrollTop + targetTop), behavior: "smooth" });
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
      await addComment(
        {
          route,
          anchor,
          pageMeta,
          body: trimmed,
          tags: tags && tags.length > 0 ? tags : undefined,
        },
        author,
      );
      setPlacementPoint(null);
      setMode("idle");
    },
    [addComment, author, route],
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

  const value: CommentsContextValue = {
    route,
    mode,
    enterPlacement,
    cancelPlacement,
    placementPoint,
    setPlacementPoint,
    activeCommentId,
    openThread,
    closeThread,
    comments,
    author,
    submitNew,
    addReply,
    vote,
    editComment,
    deleteComment,
  };

  return <CommentsContext.Provider value={value}>{children}</CommentsContext.Provider>;
}
