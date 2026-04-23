import type { Author, CommentStatus } from "../comments/types";

export type ProposalType = "improvement" | "idea";

export type ProposalReply = {
  id: string;
  proposalId: string;
  body: string;
  author: Author;
  mentions?: string[];
  createdAt: string;
  updatedAt: string;
};

export type Proposal = {
  id: string;
  title: string;
  body: string;
  type: ProposalType;
  author: Author;
  status: CommentStatus;
  voteScore: number;
  myVote: -1 | 0 | 1;
  replies: ProposalReply[];
  createdAt: string;
  updatedAt: string;
};

export type NewProposalInput = {
  title: string;
  body: string;
  type: ProposalType;
};
