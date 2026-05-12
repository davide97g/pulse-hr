/**
 * Client for the Super Import endpoints in apps/api. Uses Clerk's getToken()
 * to attach a Bearer JWT and posts multipart/form-data for /parse.
 */
import type {
  ParseRequestEnvelope,
  ParseResponse,
  QuotaResponse,
  Source,
} from "@pulse-hr/shared/super-import";

const API_BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:3000";

type GetToken = () => Promise<string | null>;

async function authHeaders(getToken: GetToken): Promise<HeadersInit> {
  const token = await getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getQuota(getToken: GetToken): Promise<QuotaResponse> {
  const res = await fetch(`${API_BASE}/super-import/quota`, {
    headers: { ...(await authHeaders(getToken)) },
  });
  if (!res.ok) throw new Error(`quota ${res.status}`);
  return (await res.json()) as QuotaResponse;
}

export type ClientSource = Source & {
  blob?: Blob;
};

export async function parse(
  getToken: GetToken,
  sources: ClientSource[],
  envelopeExtras: Omit<ParseRequestEnvelope, "textBody" | "urls" | "voiceDurationSec">,
): Promise<ParseResponse> {
  const urls = sources.filter((s): s is Extract<ClientSource, { kind: "url" }> => s.kind === "url").map((s) => s.url);
  const textParts = sources
    .filter((s): s is Extract<ClientSource, { kind: "text" }> => s.kind === "text")
    .map((s) => s.body);
  const textBody = textParts.join("\n\n---\n\n");

  const fileSources = sources.filter(
    (s): s is Extract<ClientSource, { kind: "file" }> => s.kind === "file",
  );
  const voiceSource = sources.find(
    (s): s is Extract<ClientSource, { kind: "voice" }> => s.kind === "voice",
  );

  const envelope: ParseRequestEnvelope = {
    ...envelopeExtras,
    urls,
    textBody,
    voiceDurationSec: voiceSource?.durationSec,
  };

  const form = new FormData();
  form.set("envelope", JSON.stringify(envelope));
  for (const f of fileSources) {
    if (!f.blob) continue;
    form.append("files", new File([f.blob], f.name, { type: f.mime }));
  }
  if (voiceSource?.blob) {
    form.set(
      "voice",
      new File([voiceSource.blob], "voice.webm", { type: voiceSource.blob.type || "audio/webm" }),
    );
  }

  const res = await fetch(`${API_BASE}/super-import/parse`, {
    method: "POST",
    headers: { ...(await authHeaders(getToken)) },
    body: form,
  });

  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    const err = new Error("quota_exhausted") as Error & { resetAt?: string; code?: string };
    err.code = "quota_exhausted";
    err.resetAt = (body as { error?: { resetAt?: string } }).error?.resetAt;
    throw err;
  }
  if (!res.ok) throw new Error(`parse ${res.status}`);
  return (await res.json()) as ParseResponse;
}
