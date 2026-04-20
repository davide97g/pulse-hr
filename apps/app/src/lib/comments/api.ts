import type { Anchor, Comment, NewCommentInput, Reply, CommentStatus } from "./types";

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

async function authHeader(): Promise<Record<string, string>> {
  if (!tokenGetter) {
    if (import.meta.env.DEV) {
      console.warn("[comments/api] no tokenGetter registered — request will 401");
    }
    return {};
  }
  const token = await tokenGetter();
  if (!token && import.meta.env.DEV) {
    console.warn("[comments/api] tokenGetter returned null — Clerk session not ready?");
  }
  return token ? { authorization: `Bearer ${token}` } : {};
}

type ApiError = { error: { code: string; message?: string } };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...init,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(await authHeader()),
      ...init.headers,
    },
  });
  if (!res.ok) {
    let code = `http_${res.status}`;
    let message = res.statusText;
    try {
      const body = (await res.json()) as ApiError;
      code = body.error?.code ?? code;
      message = body.error?.message ?? message;
    } catch {
      // ignore
    }
    throw Object.assign(new Error(message || code), { code, status: res.status });
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function listComments(route: string): Promise<Comment[]> {
  return request<Comment[]>(`/api/comments?route=${encodeURIComponent(route)}`);
}

export async function createComment(input: NewCommentInput): Promise<Comment> {
  return request<Comment>("/api/comments", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createReply(commentId: string, body: string): Promise<Reply> {
  return request<Reply>(`/api/comments/${commentId}/replies`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function setVote(
  commentId: string,
  value: -1 | 0 | 1,
): Promise<{ voteScore: number; myVote: -1 | 0 | 1 }> {
  return request<{ voteScore: number; myVote: -1 | 0 | 1 }>(
    `/api/comments/${commentId}/vote`,
    { method: "POST", body: JSON.stringify({ value }) },
  );
}

export type BoardBuckets = Record<CommentStatus, Comment[]>;

export async function fetchBoard(): Promise<BoardBuckets> {
  return request<BoardBuckets>("/api/feedback/board");
}

export async function setStatus(commentId: string, status: CommentStatus): Promise<Comment> {
  return request<Comment>(`/api/comments/${commentId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function editComment(commentId: string, body: string): Promise<Comment> {
  return request<Comment>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ body }),
  });
}

export async function deleteComment(commentId: string): Promise<void> {
  await request<void>(`/api/comments/${commentId}`, { method: "DELETE" });
}

export async function repositionComment(commentId: string, anchor: Anchor): Promise<Comment> {
  return request<Comment>(`/api/comments/${commentId}`, {
    method: "PATCH",
    body: JSON.stringify({ anchor }),
  });
}
