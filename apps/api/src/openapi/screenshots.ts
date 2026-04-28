import { createRoute } from "@hono/zod-openapi";
import { requireUser } from "../middleware/auth.ts";
import { storageConfigured, uploadObject } from "../services/storage.ts";
import { createApp, errorResponse, jsonContent, RequireAuth, z } from "./registry.ts";

export const screenshots = createApp();

screenshots.use("*", requireUser);

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 3 * 1024 * 1024;

const UploadResponseSchema = z
  .object({ url: z.string().url() })
  .openapi("ScreenshotUploadResponse");

const uploadRoute = createRoute({
  method: "post",
  path: "/",
  tags: ["screenshots"],
  security: RequireAuth,
  summary: "Upload a screenshot for a comment",
  description:
    "Raw binary upload — set `Content-Type` to `image/jpeg`, `image/png`, or `image/webp`. Max 3 MB. Stored in R2 under `comments/<userId>/<uuid>.<ext>` and returns a public URL.",
  request: {
    body: {
      required: true,
      content: {
        "image/jpeg": { schema: z.string().openapi({ format: "binary" }) },
        "image/png": { schema: z.string().openapi({ format: "binary" }) },
        "image/webp": { schema: z.string().openapi({ format: "binary" }) },
      },
    },
  },
  responses: {
    200: jsonContent(UploadResponseSchema, "Upload succeeded"),
    400: errorResponse("Empty body"),
    413: errorResponse("Payload too large (>3 MB)"),
    415: errorResponse("Unsupported media type"),
    501: errorResponse("R2 storage not configured"),
  },
});

screenshots.openapi(uploadRoute, async (c) => {
  const user = c.get("user");

  if (!storageConfigured()) {
    return c.json(
      {
        error: {
          code: "storage_not_configured",
          message:
            "R2 credentials are not set (R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_BASE_URL).",
        },
      },
      501,
    );
  }

  const contentType = c.req.header("content-type") ?? "application/octet-stream";
  if (!ALLOWED_TYPES.has(contentType)) {
    return c.json({ error: { code: "unsupported_media_type", message: contentType } }, 415);
  }

  const buffer = await c.req.arrayBuffer();
  if (buffer.byteLength === 0) {
    return c.json({ error: { code: "empty_body" } }, 400);
  }
  if (buffer.byteLength > MAX_BYTES) {
    return c.json({ error: { code: "payload_too_large" } }, 413);
  }

  const ext = contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";
  const key = `comments/${user.id}/${crypto.randomUUID()}.${ext}`;
  const { url } = await uploadObject(key, buffer, contentType);
  return c.json({ url }, 200);
});
