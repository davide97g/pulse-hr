/**
 * Super Import — POST /parse + GET /quota.
 *
 * /parse accepts multipart/form-data:
 *   - envelope: JSON-stringified ParseRequestEnvelope (urls, textBody,
 *     contextNote, knownEntityDigest, voiceDurationSec?)
 *   - files: zero or more File parts (PDFs, images)
 *   - voice: optional File part (audio blob)
 * Auth: Clerk Bearer. Quota enforced server-side.
 */
import { createRoute } from "@hono/zod-openapi";
import {
  MAX_FILE_BYTES,
  MAX_FILES,
  MAX_TEXT_BYTES,
  MAX_VOICE_SECONDS,
  type ParsedEntity,
} from "@pulse-hr/shared/super-import";
import { requireUser } from "../middleware/auth.ts";
import { checkAndConsume, peekQuota } from "../services/super-import-quota.ts";
import { parseWithLlm, type LlmAttachment } from "../services/llm.ts";
import { transcribeAudio } from "../services/transcribe.ts";
import { fetchReadable } from "../services/url-fetch.ts";
import { createApp, errorResponse, jsonContent, RequireAuth, z } from "./registry.ts";

export const superImport = createApp();
superImport.use("*", requireUser);

const EnvelopeSchema = z.object({
  urls: z.array(z.string().url()).max(20),
  textBody: z.string().max(MAX_TEXT_BYTES),
  contextNote: z.string().max(4_000),
  voiceDurationSec: z.number().int().min(0).max(MAX_VOICE_SECONDS).optional(),
  knownEntityDigest: z
    .array(
      z.object({
        type: z.string(),
        id: z.string(),
        displayLabel: z.string(),
      }),
    )
    .max(500),
});

const ParsedEntitySchema = z
  .object({
    id: z.string(),
    entityType: z.string(),
    data: z.record(z.string(), z.unknown()),
    confidence: z.number().min(0).max(1),
    conflict: z
      .object({
        matchedId: z.string(),
        matchedLabel: z.string(),
        matchedFields: z.array(z.string()),
      })
      .optional(),
  })
  .openapi("ParsedEntity");

const QuotaShape = z
  .object({
    runsLeft: z.number().int().min(0),
    runsTotal: z.number().int().min(0),
    resetAt: z.string(),
  })
  .openapi("SuperImportQuota");

const ParseResponseSchema = z
  .object({
    entities: z.array(ParsedEntitySchema),
    quotaAfter: QuotaShape,
  })
  .openapi("SuperImportParseResponse");

const quotaRoute = createRoute({
  method: "get",
  path: "/quota",
  tags: ["super-import"],
  security: RequireAuth,
  summary: "Read the caller's Super Import quota",
  responses: {
    200: jsonContent(QuotaShape, "Current quota state"),
    401: errorResponse("Missing or invalid bearer token"),
  },
});

superImport.openapi(quotaRoute, (c) => {
  const user = c.get("user");
  return c.json(peekQuota(user.id), 200);
});

const parseRoute = createRoute({
  method: "post",
  path: "/parse",
  tags: ["super-import"],
  security: RequireAuth,
  summary: "Parse multi-modal input into structured entities",
  request: {
    body: {
      required: true,
      content: {
        "multipart/form-data": {
          schema: z
            .object({
              envelope: z.string().describe("JSON-stringified ParseRequestEnvelope"),
              files: z.array(z.any()).optional(),
              voice: z.any().optional(),
            })
            .openapi("SuperImportParseRequest"),
        },
      },
    },
  },
  responses: {
    200: jsonContent(ParseResponseSchema, "Parsed entities + remaining quota"),
    400: errorResponse("Invalid envelope or payload too large"),
    401: errorResponse("Missing or invalid bearer token"),
    429: errorResponse("Daily quota exhausted"),
    500: errorResponse("LLM or upstream service failed"),
  },
});

superImport.openapi(parseRoute, async (c) => {
  const user = c.get("user");

  const form = await c.req.formData();
  const envelopeRaw = form.get("envelope");
  if (typeof envelopeRaw !== "string") {
    return c.json({ error: { code: "bad_envelope", message: "envelope field missing" } }, 400);
  }
  let envelope: z.infer<typeof EnvelopeSchema>;
  try {
    envelope = EnvelopeSchema.parse(JSON.parse(envelopeRaw));
  } catch (err) {
    return c.json({ error: { code: "bad_envelope", message: (err as Error).message } }, 400);
  }

  const files: File[] = [];
  for (const entry of form.getAll("files")) {
    if (entry instanceof File) files.push(entry);
  }
  if (files.length > MAX_FILES) {
    return c.json({ error: { code: "too_many_files", message: `max ${MAX_FILES}` } }, 400);
  }
  for (const f of files) {
    if (f.size > MAX_FILE_BYTES) {
      return c.json({ error: { code: "file_too_large", message: f.name } }, 400);
    }
  }

  const voiceEntry = form.get("voice");
  const voiceFile = voiceEntry instanceof File ? voiceEntry : null;

  const consume = checkAndConsume(user.id);
  if (!consume.ok) {
    return c.json(
      { error: { code: "quota_exhausted", message: "Daily quota reached", resetAt: consume.resetAt } },
      429,
    );
  }

  try {
    const [urlContents, voiceTranscript, attachments] = await Promise.all([
      Promise.all(envelope.urls.map(fetchReadable)),
      voiceFile ? transcribeAudio(voiceFile, voiceFile.name) : Promise.resolve(undefined),
      Promise.all(
        files.map(async (f): Promise<LlmAttachment> => {
          const buf = new Uint8Array(await f.arrayBuffer());
          const base64 = Buffer.from(buf).toString("base64");
          if (f.type === "application/pdf") {
            return { kind: "pdf", mime: "application/pdf", base64 };
          }
          return { kind: "image", mime: f.type || "image/png", base64 };
        }),
      ),
    ]);

    const entities: ParsedEntity[] = await parseWithLlm({
      textBody: envelope.textBody,
      contextNote: envelope.contextNote,
      voiceTranscript,
      urlContents,
      attachments,
      knownEntityDigest: envelope.knownEntityDigest as never,
    });

    return c.json(
      {
        entities,
        quotaAfter: {
          runsLeft: consume.runsLeft,
          runsTotal: consume.runsTotal,
          resetAt: consume.resetAt,
        },
      },
      200,
    );
  } catch (err) {
    return c.json(
      { error: { code: "llm_failed", message: (err as Error).message } },
      500,
    );
  }
});
