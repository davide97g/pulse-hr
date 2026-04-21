/**
 * Cloudflare R2 uploader. R2 speaks the S3 API so we can upload with the
 * lightweight `aws4fetch` signer — no full AWS SDK required. Returns the
 * public URL computed from `R2_PUBLIC_BASE_URL` (either the r2.dev bucket
 * URL for dev or a custom subdomain for prod).
 */
import { AwsClient } from "aws4fetch";

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET;
const publicBase = (process.env.R2_PUBLIC_BASE_URL ?? "").replace(/\/+$/, "");

const client =
  accountId && accessKeyId && secretAccessKey
    ? new AwsClient({ accessKeyId, secretAccessKey, service: "s3", region: "auto" })
    : null;

export function storageConfigured(): boolean {
  return !!(client && bucket && publicBase);
}

export type UploadResult = { url: string; key: string };

export async function uploadObject(
  key: string,
  body: ArrayBuffer | Uint8Array,
  contentType: string,
): Promise<UploadResult> {
  if (!client || !accountId || !bucket || !publicBase) {
    throw new Error("R2 storage is not configured");
  }
  const url = `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${encodeKey(key)}`;
  const bytes = body instanceof Uint8Array ? body : new Uint8Array(body);
  const res = await client.fetch(url, {
    method: "PUT",
    body: bytes as BodyInit,
    headers: { "content-type": contentType },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`R2 PUT ${res.status}: ${text.slice(0, 200)}`);
  }
  return { url: `${publicBase}/${encodeKey(key)}`, key };
}

function encodeKey(key: string): string {
  return key
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}
