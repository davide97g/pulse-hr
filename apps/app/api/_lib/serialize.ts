import type { DbComment, DbReply } from "../../src/lib/db/schema";

type MyVoteMap = Record<string, -1 | 0 | 1>;

export type ApiReply = {
  id: string;
  commentId: string;
  body: string;
  author: { id: string; name: string; avatarUrl: string | null };
  createdAt: string;
  updatedAt: string;
};

export type ApiComment = {
  id: string;
  route: string;
  anchor: unknown;
  pageMeta: unknown;
  body: string;
  author: { id: string; name: string; avatarUrl: string | null };
  status: string;
  tags: string[];
  screenshotUrl: string | null;
  voteScore: number;
  myVote: -1 | 0 | 1;
  replies: ApiReply[];
  createdAt: string;
  updatedAt: string;
};

export function serializeReply(r: DbReply): ApiReply {
  return {
    id: r.id,
    commentId: r.commentId,
    body: r.body,
    author: { id: r.authorId, name: r.authorName, avatarUrl: r.authorAvatar ?? null },
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export function serializeComment(
  c: DbComment,
  replies: DbReply[],
  myVotes: MyVoteMap,
): ApiComment {
  return {
    id: c.id,
    route: c.route,
    anchor: c.anchor,
    pageMeta: c.pageMeta,
    body: c.body,
    author: { id: c.authorId, name: c.authorName, avatarUrl: c.authorAvatar ?? null },
    status: c.status,
    tags: c.tags ?? [],
    screenshotUrl: c.screenshotUrl ?? null,
    voteScore: c.voteScore,
    myVote: myVotes[c.id] ?? 0,
    replies: replies
      .filter((r) => r.deletedAt == null)
      .sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))
      .map(serializeReply),
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}
