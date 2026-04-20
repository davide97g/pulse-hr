import { put } from "@vercel/blob";
import { requireUser } from "./_lib/auth";
import { err, json, methodNotAllowed, serverError } from "./_lib/errors";
import { serve } from "./_lib/serve";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024; // 3 MB

async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return methodNotAllowed(["POST"]);

  const user = await requireUser(request);
  if (user instanceof Response) return user;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return err(501, "storage_not_configured", "BLOB_READ_WRITE_TOKEN is not set");
  }

  try {
    const contentType = request.headers.get("content-type") ?? "application/octet-stream";
    if (!ALLOWED_TYPES.has(contentType)) {
      return err(415, "unsupported_media_type", contentType);
    }

    const buffer = await request.arrayBuffer();
    if (buffer.byteLength === 0) return err(400, "empty_body");
    if (buffer.byteLength > MAX_BYTES) return err(413, "payload_too_large");

    const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
    const key = `comments/${user.id}/${crypto.randomUUID()}.${ext}`;
    const { url } = await put(key, buffer, {
      access: "public",
      contentType,
      addRandomSuffix: false,
    });

    return json({ url });
  } catch (error) {
    return serverError(error);
  }
}

export default serve(handler);
