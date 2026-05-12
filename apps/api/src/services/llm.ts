/**
 * Claude Sonnet 4.6 wrapper for Super Import. Accepts a heterogeneous bundle
 * of text + image attachments + optional voice transcript, returns a list of
 * ParsedEntity objects. The model is asked to (a) infer entity types, (b)
 * fuzzy-match against a knownEntityDigest to flag conflicts, (c) emit a
 * confidence score per row.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ParsedEntity, KnownEntityDigest } from "@pulse-hr/shared/super-import";

const MODEL = "claude-sonnet-4-6";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY missing");
    client = new Anthropic({ apiKey });
  }
  return client;
}

export type LlmAttachment =
  | { kind: "image"; mime: string; base64: string }
  | { kind: "pdf"; mime: "application/pdf"; base64: string };

export type LlmRequest = {
  textBody: string;
  contextNote: string;
  voiceTranscript?: string;
  urlContents: Array<{ url: string; text: string }>;
  attachments: LlmAttachment[];
  knownEntityDigest: KnownEntityDigest;
};

const SYSTEM_PROMPT = `You are the parser for Pulse HR "Super Import". You convert messy multi-modal input into structured records for these entity types:
employee, commessa (Italian project code), candidate, client, activity, allocation, leave, timesheet.

Rules:
- Output STRICTLY a JSON array of ParsedEntity objects. No prose, no markdown, no backticks. Just the array.
- Each ParsedEntity has: { id, entityType, data, confidence, conflict? }.
- "id" must be a fresh UUID v4 you generate (these are draft IDs the client may replace on commit).
- "data" is a record specific to the entityType. Use the most natural fields you can extract; do not invent values for fields you cannot ground.
- "confidence" is 0..1.
- If a parsed record likely matches an item in knownEntityDigest, populate "conflict" with { matchedId, matchedLabel, matchedFields: string[] }. Otherwise omit "conflict".
- Skip duplicates within your own output.
- Italian terms are preferred for commessa/cliente when the source uses them. Otherwise English is fine.`;

function buildUserMessage(req: LlmRequest): Anthropic.Messages.MessageParam {
  const blocks: Anthropic.Messages.ContentBlockParam[] = [];
  for (const att of req.attachments) {
    if (att.kind === "image") {
      blocks.push({
        type: "image",
        source: {
          type: "base64",
          media_type: att.mime as Anthropic.Messages.Base64ImageSource["media_type"],
          data: att.base64,
        },
      });
    } else {
      blocks.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: att.base64 },
      });
    }
  }

  const urlBlock = req.urlContents.length
    ? `\n\nURL contents:\n${req.urlContents.map((u) => `--- ${u.url} ---\n${u.text}`).join("\n\n")}`
    : "";
  const voiceBlock = req.voiceTranscript ? `\n\nVoice transcript:\n${req.voiceTranscript}` : "";
  const digestBlock = req.knownEntityDigest.length
    ? `\n\nKnown entities (for conflict detection):\n${JSON.stringify(req.knownEntityDigest)}`
    : "";

  blocks.push({
    type: "text",
    text: `Context note: ${req.contextNote || "(none)"}\n\nText body:\n${req.textBody || "(none)"}${urlBlock}${voiceBlock}${digestBlock}\n\nReturn the JSON array now.`,
  });

  return { role: "user", content: blocks };
}

export async function parseWithLlm(req: LlmRequest): Promise<ParsedEntity[]> {
  const message = await getClient().messages.create({
    model: MODEL,
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [buildUserMessage(req)],
  });

  const textBlock = message.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("LLM returned no text content");
  }
  const raw = textBlock.text.trim();
  const stripped = raw.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripped);
  } catch (err) {
    throw new Error(`LLM returned non-JSON: ${(err as Error).message}`);
  }
  if (!Array.isArray(parsed)) throw new Error("LLM did not return an array");
  return parsed as ParsedEntity[];
}
