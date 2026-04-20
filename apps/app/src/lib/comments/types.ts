export type CommentStatus = "open" | "triaged" | "planned" | "shipped" | "wont_do";

export type Anchor = {
  selector: string | null;
  xPct: number;
  yPct: number;
  fallbackX: number;
  fallbackY: number;
  scrollY: number;
};

export type PageMeta = {
  title: string;
  viewportW: number;
  viewportH: number;
  userAgent: string;
};

export type Author = {
  id: string;
  name: string;
  avatarUrl: string | null;
};

export type Reply = {
  id: string;
  commentId: string;
  body: string;
  author: Author;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  route: string;
  anchor: Anchor;
  pageMeta: PageMeta;
  body: string;
  author: Author;
  status: CommentStatus;
  tags: string[];
  screenshotUrl: string | null;
  voteScore: number;
  myVote: -1 | 0 | 1;
  replies: Reply[];
  createdAt: string;
  updatedAt: string;
};

export type NewCommentInput = {
  route: string;
  anchor: Anchor;
  pageMeta: PageMeta;
  body: string;
  tags?: string[];
  screenshotUrl?: string | null;
};
