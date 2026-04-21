import { apiUrl } from "@/lib/api-client";
import type { CommentStatus } from "../comments/types";
import type { NewProposalInput, Proposal, ProposalReply } from "./types";

type TokenGetter = () => Promise<string | null>;

let tokenGetter: TokenGetter | null = null;

export function setTokenGetter(getter: TokenGetter | null): void {
  tokenGetter = getter;
}

type ApiError = { error: { code: string; message?: string } };

async function authHeader(): Promise<Record<string, string>> {
  if (!tokenGetter) return {};
  const token = await tokenGetter();
  return token ? { authorization: `Bearer ${token}` } : {};
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(apiUrl(path), {
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

export async function createProposal(input: NewProposalInput): Promise<Proposal> {
  return request<Proposal>("/proposals", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function editProposal(
  id: string,
  input: { title?: string; body?: string },
): Promise<Proposal> {
  return request<Proposal>(`/proposals/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export async function deleteProposal(id: string): Promise<void> {
  await request<void>(`/proposals/${id}`, { method: "DELETE" });
}

export async function createProposalReply(
  proposalId: string,
  body: string,
): Promise<ProposalReply> {
  return request<ProposalReply>(`/proposals/${proposalId}/replies`, {
    method: "POST",
    body: JSON.stringify({ body }),
  });
}

export async function setProposalVote(
  proposalId: string,
  value: -1 | 0 | 1,
): Promise<{ voteScore: number; myVote: -1 | 0 | 1 }> {
  return request<{ voteScore: number; myVote: -1 | 0 | 1 }>(
    `/proposals/${proposalId}/vote`,
    { method: "POST", body: JSON.stringify({ value }) },
  );
}

export async function setProposalStatus(
  proposalId: string,
  status: CommentStatus,
): Promise<Proposal> {
  return request<Proposal>(`/proposals/${proposalId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
