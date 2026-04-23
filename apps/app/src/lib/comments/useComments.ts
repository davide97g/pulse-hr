import { useCallback, useEffect, useRef, useState } from "react";
import type { Anchor, Author, Comment, NewCommentInput } from "./types";
import * as api from "./api";

const POLL_MS = 10_000;

export function useComments(route: string, userId: string | null) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refetch = useCallback(async () => {
    if (!userId) return;
    try {
      const next = await api.listComments(route);
      setComments(next);
      setLoaded(true);
    } catch {
      // keep previous comments on transient error
    }
  }, [route, userId]);

  useEffect(() => {
    // Drop the previous route's comments immediately so pins from another
    // page never leak onto this one while the new fetch is in flight.
    setComments([]);
    setLoaded(false);
    if (!userId) return;
    let cancelled = false;
    let timer: number | null = null;
    const tick = async () => {
      try {
        const next = await api.listComments(route);
        if (!cancelled) {
          setComments(next);
          setLoaded(true);
        }
      } catch {
        // swallow polling errors
      }
    };
    tick();
    const schedule = () => {
      if (document.hidden) return;
      timer = window.setTimeout(async () => {
        await tick();
        schedule();
      }, POLL_MS);
    };
    schedule();
    const onVisibility = () => {
      if (document.hidden) {
        if (timer) {
          window.clearTimeout(timer);
          timer = null;
        }
      } else {
        tick();
        schedule();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      if (timer) window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [route, userId]);

  const addComment = useCallback(async (input: NewCommentInput, author: Author) => {
    const optimistic: Comment = {
      id: `opt-${crypto.randomUUID()}`,
      route: input.route,
      anchor: input.anchor,
      pageMeta: input.pageMeta,
      body: input.body,
      author,
      status: "open",
      tags: input.tags ?? [],
      screenshotUrl: input.screenshotUrl ?? null,
      voteScore: 0,
      myVote: 0,
      replies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setComments((prev) => [optimistic, ...prev]);
    try {
      const created = await api.createComment(input);
      setComments((prev) => prev.map((c) => (c.id === optimistic.id ? created : c)));
      return created;
    } catch (err) {
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      throw err;
    }
  }, []);

  const addReply = useCallback(async (commentId: string, body: string) => {
    const reply = await api.createReply(commentId, body);
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId
          ? { ...c, replies: [...c.replies, reply], updatedAt: reply.createdAt }
          : c,
      ),
    );
    return reply;
  }, []);

  const vote = useCallback(
    async (commentId: string, value: -1 | 0 | 1) => {
      setComments((prev) =>
        prev.map((c) => {
          if (c.id !== commentId) return c;
          const delta = value - c.myVote;
          return { ...c, myVote: value, voteScore: c.voteScore + delta };
        }),
      );
      try {
        const { voteScore, myVote } = await api.setVote(commentId, value);
        setComments((prev) =>
          prev.map((c) => (c.id === commentId ? { ...c, voteScore, myVote } : c)),
        );
      } catch {
        refetch();
      }
    },
    [refetch],
  );

  const editComment = useCallback(async (commentId: string, body: string) => {
    const updated = await api.editComment(commentId, body);
    setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
    return updated;
  }, []);

  const deleteComment = useCallback(async (commentId: string) => {
    await api.deleteComment(commentId);
    setComments((prev) => prev.filter((c) => c.id !== commentId));
  }, []);

  const repositionComment = useCallback(
    async (commentId: string, anchor: Anchor) => {
      // optimistic — pin snaps to new spot immediately, server call reconciles
      setComments((prev) => prev.map((c) => (c.id === commentId ? { ...c, anchor } : c)));
      try {
        const updated = await api.repositionComment(commentId, anchor);
        setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
        return updated;
      } catch (err) {
        refetch();
        throw err;
      }
    },
    [refetch],
  );

  return {
    comments,
    loaded,
    refetch,
    addComment,
    addReply,
    vote,
    editComment,
    deleteComment,
    repositionComment,
  };
}
