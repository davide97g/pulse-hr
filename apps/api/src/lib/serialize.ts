import type { DbComment, DbReply, DbProposal, DbProposalReply } from "../db/schema.ts";

type MyVoteMap = Record<string, -1 | 0 | 1>;

function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const d = new Date(value as string | number);
  return Number.isNaN(d.getTime()) ? new Date(0).toISOString() : d.toISOString();
}

export type ApiReply = {
  id: string;
  commentId: string;
  body: string;
  author: { id: string; name: string; avatarUrl: string | null };
  mentions: string[];
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
    mentions: r.mentions ?? [],
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

export type ApiProposalReply = {
  id: string;
  proposalId: string;
  body: string;
  author: { id: string; name: string; avatarUrl: string | null };
  mentions: string[];
  createdAt: string;
  updatedAt: string;
};

export type ApiProposal = {
  id: string;
  title: string;
  body: string;
  type: "bug" | "idea" | "improvement";
  author: { id: string; name: string; avatarUrl: string | null };
  status: string;
  voteScore: number;
  myVote: -1 | 0 | 1;
  replies: ApiProposalReply[];
  createdAt: string;
  updatedAt: string;
};

export function serializeProposalReply(r: DbProposalReply): ApiProposalReply {
  return {
    id: r.id,
    proposalId: r.proposalId,
    body: r.body,
    author: { id: r.authorId, name: r.authorName, avatarUrl: r.authorAvatar ?? null },
    mentions: r.mentions ?? [],
    createdAt: toIso(r.createdAt),
    updatedAt: toIso(r.updatedAt),
  };
}

export function serializeProposal(
  p: DbProposal,
  replies: DbProposalReply[],
  myVotes: MyVoteMap,
): ApiProposal {
  return {
    id: p.id,
    title: p.title,
    body: p.body,
    type: p.type as "bug" | "idea" | "improvement",
    author: { id: p.authorId, name: p.authorName, avatarUrl: p.authorAvatar ?? null },
    status: p.status,
    voteScore: p.voteScore,
    myVote: myVotes[p.id] ?? 0,
    replies: replies
      .filter((r) => r.deletedAt == null)
      .sort((a, b) => (toIso(a.createdAt) < toIso(b.createdAt) ? -1 : 1))
      .map(serializeProposalReply),
    createdAt: toIso(p.createdAt),
    updatedAt: toIso(p.updatedAt),
  };
}

export function serializeComment(c: DbComment, replies: DbReply[], myVotes: MyVoteMap): ApiComment {
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
      .sort((a, b) => (toIso(a.createdAt) < toIso(b.createdAt) ? -1 : 1))
      .map(serializeReply),
    createdAt: toIso(c.createdAt),
    updatedAt: toIso(c.updatedAt),
  };
}
