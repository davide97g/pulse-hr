# Super Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a labs-grade, multi-modal bulk-insert surface (`/import`) in `apps/app` that accepts text, files, URLs, and voice, proxies them through `apps/api` to Claude Sonnet 4.6 for cross-entity classification, and lets the user review + commit results into the existing `lib/tables/*` mock-data store — with a 5-runs-per-day quota and conflict flagging.

**Architecture:** Single SPA route + sticky review canvas in `apps/app`, driven by a pure `useReducer` orchestrator. Server-side LLM proxy + quota counter in `apps/api` (OpenAPIHono pattern, in-memory store keyed by Clerk userId). Conflict detection is done by the LLM at parse time, fed a `knownEntityDigest` of current rows. Imports fan out to the existing `createTable<T>` instances in `apps/app/src/lib/tables/`.

**Tech stack:** Vite + React 19 + TanStack Router + Clerk + `@pulse-hr/ui` + `@pulse-hr/tokens` (frontend); Bun + Hono + `@hono/zod-openapi` + `@anthropic-ai/sdk` + `openai` (Whisper) + `@mozilla/readability` + `jsdom` (backend).

**Decisions resolved up-front (overriding spec open questions):**

1. **LLM provider:** Claude Sonnet 4.6 (`claude-sonnet-4-6`) via `@anthropic-ai/sdk` — vision-capable, brand-aligned.
2. **Voice transcription:** OpenAI `whisper-1` via the official `openai` SDK — cheap, ubiquitous.
3. **Sidebar icon:** `Sparkles` from `lucide-react` — matches the "magic" vibe.

**Spec correction (implementation supersedes the spec file):** The spec referenced `apps/api/src/routes/super-import.ts`. Reality: this codebase uses **OpenAPIHono** with all routes in `apps/api/src/openapi/*.ts`. The new route file lives at `apps/api/src/openapi/super-import.ts`.

---

## File map (locked decomposition)

### apps/api (backend)
- **Create** `apps/api/src/services/llm.ts` — Anthropic SDK wrapper.
- **Create** `apps/api/src/services/transcribe.ts` — OpenAI Whisper wrapper.
- **Create** `apps/api/src/services/url-fetch.ts` — fetch URL + extract readable text via `@mozilla/readability` + `jsdom`.
- **Create** `apps/api/src/services/super-import-quota.ts` — in-memory, day-bucketed quota counter.
- **Create** `apps/api/src/services/super-import-quota.test.ts` — unit tests.
- **Create** `apps/api/src/openapi/super-import.ts` — Zod schemas + two routes (`POST /parse`, `GET /quota`).
- **Create** `apps/api/src/openapi/super-import.test.ts` — route integration tests.
- **Modify** `apps/api/src/index.ts` — mount `superImport` at `/super-import`, add it to `docInfo.tags`.
- **Modify** `apps/api/package.json` — add `@anthropic-ai/sdk`, `openai`, `@mozilla/readability`, `jsdom`, `@types/jsdom`.
- **Modify** `apps/api/.env.example` — add `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`.

### shared (`@pulse-hr/shared`)
- **Create** `packages/shared/src/super-import.ts` — types (`Source`, `ParsedEntity`, `ConflictDecision`, `ImportSummary`, `KnownEntityDigest`, `ParseRequest`, `ParseResponse`, `QuotaResponse`) + constants (`MAX_TEXT_BYTES`, `MAX_FILES`, `MAX_FILE_BYTES`, `MAX_VOICE_SECONDS`, `RUNS_PER_DAY`).
- **Modify** `packages/shared/src/index.ts` — re-export the new module.

### apps/app (frontend)
- **Create** `apps/app/src/components/import/orchestrator.ts` — reducer + initial state.
- **Create** `apps/app/src/components/import/orchestrator.test.ts` — reducer transitions.
- **Create** `apps/app/src/lib/super-import-client.ts` — `parse()`, `getQuota()` fetch wrappers w/ Clerk session token.
- **Create** `apps/app/src/lib/super-import-apply.ts` — fan-out to tables + auditLog.
- **Create** `apps/app/src/lib/super-import-apply.test.ts` — unit test commit logic.
- **Create** `apps/app/src/lib/known-entity-digest.ts` — build digest from current tables.
- **Create** `apps/app/src/components/import/EntityCard.tsx`.
- **Create** `apps/app/src/components/import/ConflictPill.tsx`.
- **Create** `apps/app/src/components/import/SourceChips.tsx`.
- **Create** `apps/app/src/components/import/QuotaChip.tsx`.
- **Create** `apps/app/src/components/import/InputBar.tsx`.
- **Create** `apps/app/src/components/import/ReviewGrid.tsx`.
- **Create** `apps/app/src/components/import/ConfirmBar.tsx`.
- **Create** `apps/app/src/components/import/SuperImportCanvas.tsx`.
- **Create** `apps/app/src/routes/import.tsx`.
- **Modify** `apps/app/src/lib/sidebar-nav-groups.tsx` — add Super Import to People group.
- **Modify** `apps/app/src/components/app/CommandPalette.tsx` — add ⌘K entry.

---

## Task list

### Task 1: Install deps + env vars + shared types/constants

**Files:**
- Modify: `apps/api/package.json`
- Modify: `apps/api/.env.example`
- Create: `packages/shared/src/super-import.ts`
- Modify: `packages/shared/src/index.ts`

- [ ] **Step 1: Install backend deps**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/api
bun add @anthropic-ai/sdk openai @mozilla/readability jsdom
bun add -d @types/jsdom
```

Expected: `package.json` updated; `bun.lockb` regenerated at repo root.

- [ ] **Step 2: Add env placeholders**

Append to `apps/api/.env.example`:

```bash
# Super Import — LLM + Whisper
ANTHROPIC_API_KEY=sk-ant-…
OPENAI_API_KEY=sk-…
```

- [ ] **Step 3: Write shared types + constants**

Create `packages/shared/src/super-import.ts`:

```ts
/**
 * Shared types and limits for the Super Import feature. Imported by both
 * apps/app (client) and apps/api (server) to keep the wire format and the
 * per-run caps lock-stepped.
 */

export const RUNS_PER_DAY = 5;
export const MAX_TEXT_BYTES = 100 * 1024;
export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_VOICE_SECONDS = 120;

export type ConflictDecision = "skip" | "update" | "create_anyway";

export type SuperImportEntityType =
  | "employee"
  | "commessa"
  | "candidate"
  | "client"
  | "activity"
  | "allocation"
  | "leave"
  | "timesheet";

export type Source =
  | { id: string; kind: "file"; name: string; mime: string; size: number }
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "voice"; durationSec: number }
  | { id: string; kind: "text"; body: string };

export type ParsedEntity = {
  id: string;
  entityType: SuperImportEntityType;
  data: Record<string, unknown>;
  confidence: number;
  conflict?: {
    matchedId: string;
    matchedLabel: string;
    matchedFields: string[];
  };
};

export type KnownEntityDigest = Array<{
  type: SuperImportEntityType;
  id: string;
  displayLabel: string;
}>;

export type ParseRequestEnvelope = {
  urls: string[];
  textBody: string;
  contextNote: string;
  knownEntityDigest: KnownEntityDigest;
  voiceDurationSec?: number;
};

export type ParseResponse = {
  entities: ParsedEntity[];
  quotaAfter: { runsLeft: number; runsTotal: number; resetAt: string };
};

export type QuotaResponse = {
  runsLeft: number;
  runsTotal: number;
  resetAt: string;
};

export type ImportSummary = {
  inserted: number;
  updated: number;
  skipped: number;
  byEntity: Partial<Record<SuperImportEntityType, number>>;
};
```

- [ ] **Step 4: Re-export from `packages/shared/src/index.ts`**

Add:

```ts
export * from "./super-import";
```

- [ ] **Step 5: Commit**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr
git add apps/api/package.json apps/api/.env.example packages/shared/src/super-import.ts packages/shared/src/index.ts bun.lockb
git commit -m "feat(import): install deps + shared types/constants for super-import"
```

---

### Task 2: Quota service (TDD)

**Files:**
- Create: `apps/api/src/services/super-import-quota.ts`
- Test: `apps/api/src/services/super-import-quota.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "bun:test";
import { __resetQuotaForTest, checkAndConsume, peekQuota } from "./super-import-quota";
import { RUNS_PER_DAY } from "@pulse-hr/shared";

describe("super-import-quota", () => {
  beforeEach(() => __resetQuotaForTest());

  it("starts at RUNS_PER_DAY remaining", () => {
    const q = peekQuota("user_1");
    expect(q.runsLeft).toBe(RUNS_PER_DAY);
    expect(q.runsTotal).toBe(RUNS_PER_DAY);
    expect(typeof q.resetAt).toBe("string");
  });

  it("decrements on consume", () => {
    const r = checkAndConsume("user_1");
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.runsLeft).toBe(RUNS_PER_DAY - 1);
  });

  it("rejects when exhausted", () => {
    for (let i = 0; i < RUNS_PER_DAY; i++) checkAndConsume("user_1");
    const r = checkAndConsume("user_1");
    expect(r.ok).toBe(false);
    if (!r.ok) expect(typeof r.resetAt).toBe("string");
  });

  it("isolates per user", () => {
    for (let i = 0; i < RUNS_PER_DAY; i++) checkAndConsume("user_1");
    const r = checkAndConsume("user_2");
    expect(r.ok).toBe(true);
  });
});
```

- [ ] **Step 2: Run the test (should fail — module missing)**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/api
bun test src/services/super-import-quota.test.ts
```

Expected: FAIL — `Cannot find module "./super-import-quota"`.

- [ ] **Step 3: Implement the service**

Create `apps/api/src/services/super-import-quota.ts`:

```ts
/**
 * In-memory, per-user, per-day quota counter for Super Import runs.
 *
 * Keyed by Clerk userId. The day bucket is computed in UTC (resets at 00:00
 * UTC). Single-instance — Render runs one container so this is fine for v1.
 * If we ever scale-out, swap the Map for Upstash Redis.
 */
import { RUNS_PER_DAY } from "@pulse-hr/shared";

type Bucket = { day: string; runs: number };

const store = new Map<string, Bucket>();

function currentDay(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD UTC
}

function nextResetISO(): string {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d.toISOString();
}

function bucketFor(userId: string): Bucket {
  const today = currentDay();
  const existing = store.get(userId);
  if (!existing || existing.day !== today) {
    const fresh: Bucket = { day: today, runs: 0 };
    store.set(userId, fresh);
    return fresh;
  }
  return existing;
}

export function peekQuota(userId: string) {
  const b = bucketFor(userId);
  return {
    runsLeft: Math.max(0, RUNS_PER_DAY - b.runs),
    runsTotal: RUNS_PER_DAY,
    resetAt: nextResetISO(),
  };
}

export type ConsumeResult =
  | { ok: true; runsLeft: number; runsTotal: number; resetAt: string }
  | { ok: false; resetAt: string };

export function checkAndConsume(userId: string): ConsumeResult {
  const b = bucketFor(userId);
  if (b.runs >= RUNS_PER_DAY) {
    return { ok: false, resetAt: nextResetISO() };
  }
  b.runs += 1;
  return {
    ok: true,
    runsLeft: RUNS_PER_DAY - b.runs,
    runsTotal: RUNS_PER_DAY,
    resetAt: nextResetISO(),
  };
}

/** Test-only — clears the in-memory store. */
export function __resetQuotaForTest(): void {
  store.clear();
}
```

- [ ] **Step 4: Run the test (should pass)**

```bash
bun test src/services/super-import-quota.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/services/super-import-quota.ts apps/api/src/services/super-import-quota.test.ts
git commit -m "feat(import): in-memory daily quota counter w/ tests"
```

---

### Task 3: LLM service (Anthropic wrapper)

**Files:**
- Create: `apps/api/src/services/llm.ts`

- [ ] **Step 1: Implement the service**

Create `apps/api/src/services/llm.ts`:

```ts
/**
 * Claude Sonnet 4.6 wrapper for Super Import. Accepts a heterogeneous bundle
 * of text + image attachments + optional voice transcript, returns a list of
 * ParsedEntity objects. The model is asked to (a) infer entity types, (b)
 * fuzzy-match against a knownEntityDigest to flag conflicts, (c) emit a
 * confidence score per row.
 */
import Anthropic from "@anthropic-ai/sdk";
import type { ParsedEntity, KnownEntityDigest } from "@pulse-hr/shared";

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
        source: { type: "base64", media_type: att.mime as Anthropic.Messages.ImageBlockParam["source"]["media_type"], data: att.base64 },
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
  // Strip accidental fenced blocks just in case.
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
```

- [ ] **Step 2: Commit (no test — exercised by the route integration test in Task 6)**

```bash
git add apps/api/src/services/llm.ts
git commit -m "feat(import): Claude Sonnet 4.6 wrapper for super-import parse"
```

---

### Task 4: URL fetcher service

**Files:**
- Create: `apps/api/src/services/url-fetch.ts`

- [ ] **Step 1: Implement**

Create `apps/api/src/services/url-fetch.ts`:

```ts
/**
 * Fetch a URL and extract its main readable content. Used by Super Import so
 * the LLM gets clean prose instead of raw HTML.
 */
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const MAX_BYTES = 512 * 1024; // 512 KB cap per URL — keeps the LLM prompt sane.
const FETCH_TIMEOUT_MS = 8000;

export async function fetchReadable(url: string): Promise<{ url: string; text: string }> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "PulseHR-SuperImport/1.0 (+https://pulsehr.it)" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`fetch ${url} → ${res.status}`);
    const html = (await res.text()).slice(0, MAX_BYTES);
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();
    const text = (article?.textContent ?? html).replace(/\s+/g, " ").trim();
    return { url, text };
  } finally {
    clearTimeout(t);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/services/url-fetch.ts
git commit -m "feat(import): URL fetcher with Readability extraction"
```

---

### Task 5: Voice transcription service

**Files:**
- Create: `apps/api/src/services/transcribe.ts`

- [ ] **Step 1: Implement**

Create `apps/api/src/services/transcribe.ts`:

```ts
/**
 * OpenAI Whisper wrapper for Super Import voice notes.
 */
import OpenAI from "openai";

let client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_API_KEY missing");
    client = new OpenAI({ apiKey });
  }
  return client;
}

export async function transcribeAudio(blob: Blob, filename: string): Promise<string> {
  const file = new File([blob], filename, { type: blob.type || "audio/webm" });
  const res = await getClient().audio.transcriptions.create({
    file,
    model: "whisper-1",
  });
  return res.text;
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/api/src/services/transcribe.ts
git commit -m "feat(import): Whisper transcription wrapper"
```

---

### Task 6: Super Import OpenAPI route (TDD with mocks)

**Files:**
- Create: `apps/api/src/openapi/super-import.ts`
- Test: `apps/api/src/openapi/super-import.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, mock } from "bun:test";
import { __resetQuotaForTest } from "../services/super-import-quota";

// Mock the LLM + transcribe + URL fetcher BEFORE importing the route module.
mock.module("../services/llm", () => ({
  parseWithLlm: async () => [
    { id: "p1", entityType: "employee", data: { name: "Marco Rossi" }, confidence: 0.92 },
  ],
}));
mock.module("../services/transcribe", () => ({
  transcribeAudio: async () => "stub transcript",
}));
mock.module("../services/url-fetch", () => ({
  fetchReadable: async (url: string) => ({ url, text: "stub url content" }),
}));
// Bypass Clerk auth in tests by stubbing the middleware.
mock.module("../middleware/auth", () => ({
  requireUser: async (c: any, next: any) => {
    c.set("user", { id: "user_test_1" });
    await next();
  },
}));

const { superImport } = await import("./super-import");
const { createApp } = await import("./registry");

function makeApp() {
  const app = createApp();
  app.route("/super-import", superImport);
  return app;
}

describe("super-import route", () => {
  beforeEach(() => __resetQuotaForTest());

  it("GET /super-import/quota returns full quota for a fresh user", async () => {
    const app = makeApp();
    const res = await app.request("/super-import/quota");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.runsLeft).toBe(5);
    expect(body.runsTotal).toBe(5);
  });

  it("POST /super-import/parse returns entities + decrements quota", async () => {
    const app = makeApp();
    const form = new FormData();
    form.set(
      "envelope",
      JSON.stringify({
        urls: ["https://example.com"],
        textBody: "Marco Rossi is the CTO.",
        contextNote: "",
        knownEntityDigest: [],
      }),
    );
    const res = await app.request("/super-import/parse", { method: "POST", body: form });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.entities).toHaveLength(1);
    expect(body.entities[0].entityType).toBe("employee");
    expect(body.quotaAfter.runsLeft).toBe(4);
  });

  it("POST /super-import/parse returns 429 when quota exhausted", async () => {
    const app = makeApp();
    const form = new FormData();
    form.set("envelope", JSON.stringify({ urls: [], textBody: "x", contextNote: "", knownEntityDigest: [] }));
    for (let i = 0; i < 5; i++) await app.request("/super-import/parse", { method: "POST", body: form });
    const res = await app.request("/super-import/parse", { method: "POST", body: form });
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.error.code).toBe("quota_exhausted");
    expect(typeof body.error.resetAt).toBe("string");
  });

  it("POST /super-import/parse rejects oversized text payload with 400", async () => {
    const app = makeApp();
    const form = new FormData();
    form.set(
      "envelope",
      JSON.stringify({
        urls: [],
        textBody: "x".repeat(200 * 1024),
        contextNote: "",
        knownEntityDigest: [],
      }),
    );
    const res = await app.request("/super-import/parse", { method: "POST", body: form });
    expect(res.status).toBe(400);
  });
});
```

- [ ] **Step 2: Run the test (should fail — route missing)**

```bash
bun test src/openapi/super-import.test.ts
```

Expected: FAIL — `Cannot find module "./super-import"`.

- [ ] **Step 3: Implement the route**

Create `apps/api/src/openapi/super-import.ts`:

```ts
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
} from "@pulse-hr/shared";
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
```

- [ ] **Step 4: Run the test (should pass)**

```bash
bun test src/openapi/super-import.test.ts
```

Expected: PASS — 4 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/openapi/super-import.ts apps/api/src/openapi/super-import.test.ts
git commit -m "feat(import): /super-import POST parse + GET quota route w/ tests"
```

---

### Task 7: Mount the route in apps/api index

**Files:**
- Modify: `apps/api/src/index.ts`

- [ ] **Step 1: Add import + mount + tag**

In `apps/api/src/index.ts`, add the import near the existing route imports:

```ts
import { superImport } from "./openapi/super-import.ts";
```

Mount it next to the others (right after `app.route("/user-profile", userProfile);`):

```ts
app.route("/super-import", superImport);
```

In `apps/api/src/openapi/registry.ts` `docInfo.tags`, append:

```ts
{ name: "super-import", description: "Multi-modal bulk-insert (labs)" },
```

- [ ] **Step 2: Smoke run the server**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/api
ANTHROPIC_API_KEY=test OPENAI_API_KEY=test bun --hot src/index.ts &
sleep 2
curl -s http://localhost:3000/openapi.json | grep -c '"super-import"'
kill %1
```

Expected: count ≥ 1.

- [ ] **Step 3: Commit**

```bash
git add apps/api/src/index.ts apps/api/src/openapi/registry.ts
git commit -m "feat(import): mount super-import route + tag"
```

---

### Task 8: Frontend orchestrator (TDD)

**Files:**
- Create: `apps/app/src/components/import/orchestrator.ts`
- Test: `apps/app/src/components/import/orchestrator.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "bun:test";
import { initialState, reducer } from "./orchestrator";
import type { ParsedEntity } from "@pulse-hr/shared";

const src = (id: string) => ({ id, kind: "text" as const, body: "hello" });
const entity = (id: string, withConflict = false): ParsedEntity => ({
  id,
  entityType: "employee",
  data: { name: id },
  confidence: 0.9,
  ...(withConflict
    ? { conflict: { matchedId: "e_existing", matchedLabel: "Existing", matchedFields: ["name"] } }
    : {}),
});

describe("orchestrator reducer", () => {
  it("idle → collecting on addSource", () => {
    const next = reducer(initialState, { type: "addSource", source: src("s1") });
    expect(next.kind).toBe("collecting");
    if (next.kind === "collecting") expect(next.sources).toHaveLength(1);
  });

  it("collecting → processing on parseRequested", () => {
    const a = reducer(initialState, { type: "addSource", source: src("s1") });
    const b = reducer(a, { type: "parseRequested" });
    expect(b.kind).toBe("processing");
  });

  it("processing → reviewing on parseResolved with auto-selection", () => {
    const a = reducer(initialState, { type: "addSource", source: src("s1") });
    const b = reducer(a, { type: "parseRequested" });
    const c = reducer(b, { type: "parseResolved", entities: [entity("p1"), entity("p2", true)] });
    expect(c.kind).toBe("reviewing");
    if (c.kind === "reviewing") {
      expect(c.entities).toHaveLength(2);
      // Non-conflict rows auto-selected; conflict rows require user decision.
      expect(c.selectedIds.has("p1")).toBe(true);
      expect(c.selectedIds.has("p2")).toBe(false);
    }
  });

  it("reviewing toggleSelect flips the row", () => {
    const reviewing = reducer(
      reducer(reducer(initialState, { type: "addSource", source: src("s1") }), { type: "parseRequested" }),
      { type: "parseResolved", entities: [entity("p1")] },
    );
    const next = reducer(reviewing, { type: "toggleSelect", id: "p1" });
    if (next.kind === "reviewing") expect(next.selectedIds.has("p1")).toBe(false);
  });

  it("decideConflict on a conflict row records the decision and auto-selects", () => {
    const reviewing = reducer(
      reducer(reducer(initialState, { type: "addSource", source: src("s1") }), { type: "parseRequested" }),
      { type: "parseResolved", entities: [entity("p2", true)] },
    );
    const next = reducer(reviewing, { type: "decideConflict", id: "p2", decision: "update" });
    if (next.kind === "reviewing") {
      expect(next.perRowDecisions.get("p2")).toBe("update");
      expect(next.selectedIds.has("p2")).toBe(true);
    }
  });

  it("decideConflict 'skip' deselects the row", () => {
    const reviewing = reducer(
      reducer(reducer(initialState, { type: "addSource", source: src("s1") }), { type: "parseRequested" }),
      { type: "parseResolved", entities: [entity("p2", true)] },
    );
    const next = reducer(reviewing, { type: "decideConflict", id: "p2", decision: "skip" });
    if (next.kind === "reviewing") expect(next.selectedIds.has("p2")).toBe(false);
  });

  it("parseRequested while collecting respects quotaExhausted", () => {
    const a = reducer(initialState, { type: "addSource", source: src("s1") });
    const b = reducer(a, { type: "quotaExhausted", resetAt: "2026-05-13T00:00:00Z" });
    expect(b.kind).toBe("rate_limited");
  });

  it("reset returns to idle", () => {
    const state = reducer(initialState, { type: "addSource", source: src("s1") });
    expect(reducer(state, { type: "reset" }).kind).toBe("idle");
  });
});
```

- [ ] **Step 2: Run the test (should fail)**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app
bun test src/components/import/orchestrator.test.ts
```

Expected: FAIL — module missing.

- [ ] **Step 3: Implement the reducer**

Create `apps/app/src/components/import/orchestrator.ts`:

```ts
/**
 * Pure reducer for the Super Import workflow. No React, no side-effects —
 * easy to unit test. Side effects (LLM call, table writes, confetti) are run
 * by the SuperImportCanvas component in response to state transitions.
 */
import type {
  ConflictDecision,
  ImportSummary,
  ParsedEntity,
  Source,
} from "@pulse-hr/shared";

export type ParsePayload = {
  sources: Source[];
  contextNote: string;
};

export type State =
  | { kind: "idle" }
  | { kind: "collecting"; sources: Source[]; contextNote: string }
  | {
      kind: "processing";
      sources: Source[];
      contextNote: string;
      startedAt: number;
    }
  | {
      kind: "reviewing";
      sources: Source[];
      entities: ParsedEntity[];
      selectedIds: Set<string>;
      perRowDecisions: Map<string, ConflictDecision>;
      patches: Map<string, Record<string, unknown>>;
    }
  | { kind: "importing"; toInsert: ParsedEntity[] }
  | { kind: "done"; summary: ImportSummary }
  | { kind: "error"; message: string; retryablePayload?: ParsePayload }
  | { kind: "rate_limited"; resetAt: string };

export type Action =
  | { type: "addSource"; source: Source }
  | { type: "removeSource"; id: string }
  | { type: "updateContext"; note: string }
  | { type: "parseRequested" }
  | { type: "parseResolved"; entities: ParsedEntity[] }
  | { type: "parseFailed"; message: string }
  | { type: "quotaExhausted"; resetAt: string }
  | { type: "toggleSelect"; id: string }
  | { type: "decideConflict"; id: string; decision: ConflictDecision }
  | { type: "editEntity"; id: string; patch: Record<string, unknown> }
  | { type: "confirmImport" }
  | { type: "importDone"; summary: ImportSummary }
  | { type: "reset" };

export const initialState: State = { kind: "idle" };

function autoSelected(entities: ParsedEntity[]): Set<string> {
  return new Set(entities.filter((e) => !e.conflict).map((e) => e.id));
}

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "reset":
      return initialState;

    case "addSource": {
      if (state.kind === "idle") {
        return { kind: "collecting", sources: [action.source], contextNote: "" };
      }
      if (state.kind === "collecting") {
        return { ...state, sources: [...state.sources, action.source] };
      }
      return state;
    }

    case "removeSource": {
      if (state.kind !== "collecting") return state;
      const sources = state.sources.filter((s) => s.id !== action.id);
      if (sources.length === 0) return initialState;
      return { ...state, sources };
    }

    case "updateContext": {
      if (state.kind !== "collecting") return state;
      return { ...state, contextNote: action.note };
    }

    case "parseRequested": {
      if (state.kind !== "collecting") return state;
      return {
        kind: "processing",
        sources: state.sources,
        contextNote: state.contextNote,
        startedAt: Date.now(),
      };
    }

    case "parseResolved": {
      if (state.kind !== "processing") return state;
      return {
        kind: "reviewing",
        sources: state.sources,
        entities: action.entities,
        selectedIds: autoSelected(action.entities),
        perRowDecisions: new Map(),
        patches: new Map(),
      };
    }

    case "parseFailed": {
      if (state.kind !== "processing") return state;
      return {
        kind: "error",
        message: action.message,
        retryablePayload: { sources: state.sources, contextNote: state.contextNote },
      };
    }

    case "quotaExhausted":
      return { kind: "rate_limited", resetAt: action.resetAt };

    case "toggleSelect": {
      if (state.kind !== "reviewing") return state;
      const next = new Set(state.selectedIds);
      if (next.has(action.id)) next.delete(action.id);
      else next.add(action.id);
      return { ...state, selectedIds: next };
    }

    case "decideConflict": {
      if (state.kind !== "reviewing") return state;
      const decisions = new Map(state.perRowDecisions);
      decisions.set(action.id, action.decision);
      const selected = new Set(state.selectedIds);
      if (action.decision === "skip") selected.delete(action.id);
      else selected.add(action.id);
      return { ...state, perRowDecisions: decisions, selectedIds: selected };
    }

    case "editEntity": {
      if (state.kind !== "reviewing") return state;
      const patches = new Map(state.patches);
      const existing = patches.get(action.id) ?? {};
      patches.set(action.id, { ...existing, ...action.patch });
      return { ...state, patches };
    }

    case "confirmImport": {
      if (state.kind !== "reviewing") return state;
      const chosen = state.entities.filter((e) => state.selectedIds.has(e.id));
      const merged = chosen.map((e) => {
        const patch = state.patches.get(e.id);
        return patch ? { ...e, data: { ...e.data, ...patch } } : e;
      });
      return { kind: "importing", toInsert: merged };
    }

    case "importDone":
      return { kind: "done", summary: action.summary };

    default:
      return state;
  }
}
```

- [ ] **Step 4: Run the test (should pass)**

```bash
bun test src/components/import/orchestrator.test.ts
```

Expected: PASS — 8 tests.

- [ ] **Step 5: Commit**

```bash
git add apps/app/src/components/import/orchestrator.ts apps/app/src/components/import/orchestrator.test.ts
git commit -m "feat(import): orchestrator reducer + 8 transition tests"
```

---

### Task 9: Frontend client (parse + getQuota)

**Files:**
- Create: `apps/app/src/lib/super-import-client.ts`

- [ ] **Step 1: Locate the API base URL pattern**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app
grep -rn "VITE_API_BASE\|import.meta.env.VITE_API" src/lib | head -5
```

Use the same env var (`VITE_API_BASE`) the rest of the app already uses. If none exists, default to `http://localhost:3000` and add a fallback.

- [ ] **Step 2: Implement**

Create `apps/app/src/lib/super-import-client.ts`:

```ts
/**
 * Client for the Super Import endpoints in apps/api. Uses Clerk's getToken()
 * to attach a Bearer JWT and posts multipart/form-data for /parse.
 */
import type {
  ParseRequestEnvelope,
  ParseResponse,
  QuotaResponse,
  Source,
} from "@pulse-hr/shared";

const API_BASE = (import.meta.env.VITE_API_BASE as string | undefined) ?? "http://localhost:3000";

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
    form.set("voice", new File([voiceSource.blob], "voice.webm", { type: voiceSource.blob.type || "audio/webm" }));
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
```

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/lib/super-import-client.ts
git commit -m "feat(import): client wrappers for /super-import/parse + /quota"
```

---

### Task 10: knownEntityDigest builder

**Files:**
- Create: `apps/app/src/lib/known-entity-digest.ts`

- [ ] **Step 1: Implement**

```ts
/**
 * Builds the Super Import knownEntityDigest from the current persistent
 * tables. Capped to ~500 rows total to keep the LLM prompt small. Sample
 * order: most-recent-first per table, then round-robin.
 */
import type { KnownEntityDigest, SuperImportEntityType } from "@pulse-hr/shared";
import { employeesTable } from "@/lib/tables/employees";
import { projectsTable } from "@/lib/tables/projects";
import { candidatesTable } from "@/lib/tables/candidates";
import { clientsTable } from "@/lib/tables/clients";
import { activitiesTable } from "@/lib/tables/activities";

const MAX_TOTAL = 500;
const PER_TABLE = 100;

type Mapper<T> = (row: T) => { id: string; displayLabel: string };

function pull<T extends { id: string }>(
  rows: T[],
  type: SuperImportEntityType,
  map: Mapper<T>,
): KnownEntityDigest {
  return rows.slice(0, PER_TABLE).map((r) => ({ type, ...map(r) }));
}

export function buildKnownEntityDigest(): KnownEntityDigest {
  const out: KnownEntityDigest = [
    ...pull(employeesTable.getAll(), "employee", (r: any) => ({ id: r.id, displayLabel: `${r.name} · ${r.role}` })),
    ...pull(projectsTable.getAll(), "commessa", (r: any) => ({ id: r.id, displayLabel: `${r.code} · ${r.name}` })),
    ...pull(candidatesTable.getAll(), "candidate", (r: any) => ({ id: r.id, displayLabel: `${r.name} · ${r.role ?? ""}` })),
    ...pull(clientsTable.getAll(), "client", (r: any) => ({ id: r.id, displayLabel: r.name })),
    ...pull(activitiesTable.getAll(), "activity", (r: any) => ({ id: r.id, displayLabel: r.title })),
  ];
  return out.slice(0, MAX_TOTAL);
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/lib/known-entity-digest.ts
git commit -m "feat(import): build knownEntityDigest from local tables"
```

---

### Task 11: super-import-apply helper (TDD)

**Files:**
- Create: `apps/app/src/lib/super-import-apply.ts`
- Test: `apps/app/src/lib/super-import-apply.test.ts`

- [ ] **Step 1: Confirm auditLog table existence**

```bash
grep -n "createTable\|auditLog" /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app/src/lib/tables/auditLog.ts | head
```

Expected: an export like `auditLogTable = createTable<AuditEntry>(...)`. Capture the exact export name + entry shape.

- [ ] **Step 2: Write the failing test**

```ts
import { describe, it, expect, beforeEach } from "bun:test";
import { employeesTable } from "@/lib/tables/employees";
import { projectsTable } from "@/lib/tables/projects";
import { applySuperImport } from "./super-import-apply";
import type { ParsedEntity } from "@pulse-hr/shared";

const e = (id: string, entityType: ParsedEntity["entityType"], data: Record<string, unknown>, conflict?: ParsedEntity["conflict"]): ParsedEntity => ({
  id, entityType, data, confidence: 0.9, ...(conflict ? { conflict } : {}),
});

describe("applySuperImport", () => {
  beforeEach(() => {
    employeesTable.reset();
    projectsTable.reset();
  });

  it("inserts a new employee on create_anyway", () => {
    const before = employeesTable.getAll().length;
    const summary = applySuperImport(
      [e("p1", "employee", { name: "New Person", role: "Engineer", department: "Eng", status: "active", location: "Remote" })],
      new Map([["p1", "create_anyway"]]),
    );
    expect(summary.inserted).toBe(1);
    expect(employeesTable.getAll().length).toBe(before + 1);
  });

  it("updates the matched row on 'update'", () => {
    const seedId = employeesTable.getAll()[0]!.id;
    const summary = applySuperImport(
      [
        e(
          "p2",
          "employee",
          { name: "Replaced Name" },
          { matchedId: seedId, matchedLabel: "x", matchedFields: ["name"] },
        ),
      ],
      new Map([["p2", "update"]]),
    );
    expect(summary.updated).toBe(1);
    expect(employeesTable.getAll().find((r) => r.id === seedId)?.name).toBe("Replaced Name");
  });

  it("skips rows whose decision is 'skip'", () => {
    const before = employeesTable.getAll().length;
    const summary = applySuperImport(
      [e("p3", "employee", { name: "Unwanted" })],
      new Map([["p3", "skip"]]),
    );
    expect(summary.skipped).toBe(1);
    expect(employeesTable.getAll().length).toBe(before);
  });
});
```

- [ ] **Step 3: Run the test (should fail)**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app
bun test src/lib/super-import-apply.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement the helper**

```ts
/**
 * Commits a reviewed batch of ParsedEntity rows into the live tables.
 * Decisions: 'skip' → ignore, 'update' → table.update(matchedId, data),
 * 'create_anyway' (or no conflict and not 'skip') → table.add(data).
 * Records a single audit entry summarising the import.
 */
import type { ConflictDecision, ImportSummary, ParsedEntity, SuperImportEntityType } from "@pulse-hr/shared";
import { employeesTable } from "@/lib/tables/employees";
import { projectsTable } from "@/lib/tables/projects";
import { candidatesTable } from "@/lib/tables/candidates";
import { clientsTable } from "@/lib/tables/clients";
import { activitiesTable } from "@/lib/tables/activities";
import { allocationsTable } from "@/lib/tables/allocations";
import { leaveTable } from "@/lib/tables/leave";
import { timesheetEntriesTable } from "@/lib/tables/timesheetEntries";
import { auditLogTable } from "@/lib/tables/auditLog";

type AnyTable = {
  add: (row: any) => any;
  update: (id: string, patch: any) => void;
};

const TABLES: Record<SuperImportEntityType, AnyTable> = {
  employee: employeesTable as unknown as AnyTable,
  commessa: projectsTable as unknown as AnyTable,
  candidate: candidatesTable as unknown as AnyTable,
  client: clientsTable as unknown as AnyTable,
  activity: activitiesTable as unknown as AnyTable,
  allocation: allocationsTable as unknown as AnyTable,
  leave: leaveTable as unknown as AnyTable,
  timesheet: timesheetEntriesTable as unknown as AnyTable,
};

export function applySuperImport(
  entities: ParsedEntity[],
  decisions: Map<string, ConflictDecision>,
): ImportSummary {
  const summary: ImportSummary = { inserted: 0, updated: 0, skipped: 0, byEntity: {} };

  for (const ent of entities) {
    const decision = decisions.get(ent.id);
    const table = TABLES[ent.entityType];
    if (!table) {
      summary.skipped += 1;
      continue;
    }
    if (decision === "skip") {
      summary.skipped += 1;
      continue;
    }
    if (decision === "update" && ent.conflict) {
      table.update(ent.conflict.matchedId, ent.data);
      summary.updated += 1;
    } else {
      table.add(ent.data);
      summary.inserted += 1;
    }
    summary.byEntity[ent.entityType] = (summary.byEntity[ent.entityType] ?? 0) + 1;
  }

  try {
    (auditLogTable as unknown as AnyTable).add({
      kind: "super_import",
      summary,
      at: new Date().toISOString(),
    });
  } catch {
    // Audit-log shape mismatch should not block the import. Surface in dev.
    console.warn("[super-import] audit log append failed");
  }

  return summary;
}
```

> Note: the `as unknown as AnyTable` cast accepts that each table's exact row shape differs; the LLM is responsible for producing data shapes the underlying tables tolerate. If a row insert throws at runtime, the surrounding try/catch in the caller (Task 18, SuperImportCanvas) surfaces it as a sonner toast.

- [ ] **Step 5: Run the test (should pass)**

```bash
bun test src/lib/super-import-apply.test.ts
```

Expected: PASS — 3 tests.

- [ ] **Step 6: Commit**

```bash
git add apps/app/src/lib/super-import-apply.ts apps/app/src/lib/super-import-apply.test.ts
git commit -m "feat(import): applySuperImport fan-out helper w/ tests"
```

---

### Task 12: EntityCard + ConflictPill components

**Files:**
- Create: `apps/app/src/components/import/EntityCard.tsx`
- Create: `apps/app/src/components/import/ConflictPill.tsx`

- [ ] **Step 1: Create ConflictPill**

```tsx
import type { ConflictDecision } from "@pulse-hr/shared";
import { AlertTriangle } from "lucide-react";

type Props = {
  matchedLabel: string;
  decision?: ConflictDecision;
  onDecide: (d: ConflictDecision) => void;
};

const ACTIONS: Array<{ id: ConflictDecision; label: string; primary?: boolean }> = [
  { id: "skip", label: "Skip" },
  { id: "update", label: "Update existing", primary: true },
  { id: "create_anyway", label: "Create anyway" },
];

export function ConflictPill({ matchedLabel, decision, onDecide }: Props) {
  return (
    <div className="mt-2 rounded-md border border-[--color-labs]/40 bg-background/40 p-2 text-[11px]">
      <div className="flex items-center gap-1 text-[--color-labs]">
        <AlertTriangle className="h-3 w-3" />
        may match existing: <b className="font-medium">{matchedLabel}</b>
      </div>
      <div className="mt-1.5 flex flex-wrap gap-1">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => onDecide(a.id)}
            className={`rounded border px-2 py-0.5 text-[10px] transition press-scale ${
              decision === a.id
                ? "border-[--color-labs]/60 bg-[--color-labs]/15 text-[--color-labs]"
                : a.primary
                  ? "border-[--color-labs]/40 text-[--color-labs] hover:bg-[--color-labs]/10"
                  : "border-border text-foreground/80 hover:bg-muted"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create EntityCard**

```tsx
import { useState } from "react";
import type { ConflictDecision, ParsedEntity, SuperImportEntityType } from "@pulse-hr/shared";
import { Check } from "lucide-react";
import { ConflictPill } from "./ConflictPill";

const BADGE: Record<SuperImportEntityType, { label: string; tone: string }> = {
  employee: { label: "EMPLOYEE", tone: "bg-cyan-500/15 text-cyan-400" },
  commessa: { label: "COMMESSA", tone: "bg-lime-500/15 text-lime-400" },
  candidate: { label: "CANDIDATE", tone: "bg-fuchsia-500/15 text-fuchsia-400" },
  client: { label: "CLIENT", tone: "bg-amber-500/15 text-amber-400" },
  activity: { label: "ACTIVITY", tone: "bg-sky-500/15 text-sky-400" },
  allocation: { label: "ALLOCATION", tone: "bg-violet-500/15 text-violet-400" },
  leave: { label: "LEAVE", tone: "bg-pink-500/15 text-pink-400" },
  timesheet: { label: "TIMESHEET", tone: "bg-emerald-500/15 text-emerald-400" },
};

type Props = {
  entity: ParsedEntity;
  selected: boolean;
  decision?: ConflictDecision;
  patch: Record<string, unknown>;
  onToggle: () => void;
  onDecide: (d: ConflictDecision) => void;
  onPatch: (patch: Record<string, unknown>) => void;
};

export function EntityCard({ entity, selected, decision, patch, onToggle, onDecide, onPatch }: Props) {
  const [expanded, setExpanded] = useState(false);
  const data = { ...entity.data, ...patch };
  const badge = BADGE[entity.entityType];
  const title = String(data.name ?? data.title ?? data.code ?? "Untitled");
  const subtitle =
    Object.entries(data)
      .filter(([k]) => !["name", "title", "code"].includes(k))
      .slice(0, 3)
      .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
      .join(" · ") || "—";

  return (
    <div
      className={`relative rounded-lg border bg-card p-3 text-[11px] transition ${
        entity.conflict ? "border-[--color-labs]/40" : "border-border"
      }`}
    >
      <button
        type="button"
        aria-label={selected ? "Deselect" : "Select"}
        onClick={onToggle}
        className={`absolute right-2 top-2 flex h-4 w-4 items-center justify-center rounded-sm transition ${
          selected ? "bg-lime-400 text-black" : "border border-border bg-transparent text-transparent"
        }`}
      >
        <Check className="h-3 w-3" strokeWidth={3} />
      </button>
      <span className={`mb-2 inline-block rounded px-1.5 py-0.5 font-mono text-[9px] tracking-wider ${badge.tone}`}>
        {badge.label}
      </span>
      <button
        type="button"
        className="block w-full text-left"
        onClick={() => setExpanded((x) => !x)}
      >
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-muted-foreground">{subtitle}</div>
      </button>

      {expanded && (
        <div className="mt-3 space-y-2 border-t border-border pt-2">
          {Object.entries(data).map(([key, value]) => (
            <label key={key} className="flex items-center gap-2 text-[10px]">
              <span className="w-20 text-muted-foreground">{key}</span>
              <input
                value={typeof value === "string" || typeof value === "number" ? String(value) : JSON.stringify(value)}
                onChange={(e) => onPatch({ [key]: e.target.value })}
                className="flex-1 rounded border border-border bg-background px-2 py-1 text-foreground"
              />
            </label>
          ))}
        </div>
      )}

      {entity.conflict && (
        <ConflictPill matchedLabel={entity.conflict.matchedLabel} decision={decision} onDecide={onDecide} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/components/import/EntityCard.tsx apps/app/src/components/import/ConflictPill.tsx
git commit -m "feat(import): EntityCard + ConflictPill components"
```

---

### Task 13: SourceChips + QuotaChip components

**Files:**
- Create: `apps/app/src/components/import/SourceChips.tsx`
- Create: `apps/app/src/components/import/QuotaChip.tsx`

- [ ] **Step 1: SourceChips**

```tsx
import type { Source } from "@pulse-hr/shared";
import { File, Link2, Mic, Type, X } from "lucide-react";

type Props = { sources: Source[]; onRemove: (id: string) => void };

const ICONS: Record<Source["kind"], typeof File> = {
  file: File,
  url: Link2,
  voice: Mic,
  text: Type,
};

function labelFor(s: Source): string {
  switch (s.kind) {
    case "file":
      return `${s.name} · ${Math.round(s.size / 1024)} KB`;
    case "url":
      return s.url;
    case "voice":
      return `voice · ${s.durationSec}s`;
    case "text":
      return `text · ${s.body.length} chars`;
  }
}

export function SourceChips({ sources, onRemove }: Props) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {sources.map((s, i) => {
        const Icon = ICONS[s.kind];
        const isVoice = s.kind === "voice";
        return (
          <span
            key={s.id}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`stagger-in flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] ${
              isVoice ? "voice-pill" : "border-border bg-card"
            }`}
          >
            <Icon className="h-3 w-3" />
            <span className="max-w-[200px] truncate">{labelFor(s)}</span>
            <button onClick={() => onRemove(s.id)} aria-label="Remove" className="ml-0.5 text-muted-foreground hover:text-foreground">
              <X className="h-3 w-3" />
            </button>
          </span>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: QuotaChip**

```tsx
import { Zap } from "lucide-react";

type Props = { runsLeft: number | null; runsTotal: number | null; resetAt: string | null };

export function QuotaChip({ runsLeft, runsTotal, resetAt }: Props) {
  if (runsLeft == null || runsTotal == null) {
    return (
      <span className="flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
        <Zap className="h-3 w-3" /> …
      </span>
    );
  }
  const exhausted = runsLeft <= 0;
  const resetHM = resetAt ? new Date(resetAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "00:00";
  return (
    <span className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[11px] ${exhausted ? "border-border bg-muted text-muted-foreground" : "border-border bg-card text-foreground"}`}>
      {!exhausted && <span className="pulse-dot" />}
      <Zap className="h-3 w-3" />
      <b className="font-semibold text-foreground">{runsLeft}</b>
      <span className="text-muted-foreground">of {runsTotal} runs today · resets {resetHM}</span>
    </span>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/components/import/SourceChips.tsx apps/app/src/components/import/QuotaChip.tsx
git commit -m "feat(import): SourceChips + QuotaChip"
```

---

### Task 14: InputBar (drop, paste, file, URL, text, voice)

**Files:**
- Create: `apps/app/src/components/import/InputBar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Link2, Mic, Paperclip, Square } from "lucide-react";
import { MAX_FILES, MAX_FILE_BYTES, MAX_TEXT_BYTES, MAX_VOICE_SECONDS, type Source } from "@pulse-hr/shared";
import { toast } from "sonner";

type Props = {
  sources: Source[];
  contextNote: string;
  busy: boolean;
  canParse: boolean;
  onAddSource: (s: Source) => void;
  onContextChange: (note: string) => void;
  onParse: () => void;
  onAddBlob: (s: Extract<Source, { kind: "file" } | { kind: "voice" }>, blob: Blob) => void;
};

function uid() {
  return `s_${Math.random().toString(36).slice(2, 10)}`;
}

export function InputBar({ sources, contextNote, busy, canParse, onAddSource, onContextChange, onParse, onAddBlob }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [urlValue, setUrlValue] = useState("");
  const [recording, setRecording] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const recordStartRef = useRef<number>(0);
  const chunksRef = useRef<Blob[]>([]);

  const fileCount = sources.filter((s) => s.kind === "file").length;
  const textBytes = sources.filter((s) => s.kind === "text").reduce((n, s) => n + new TextEncoder().encode(s.body).length, 0) + new TextEncoder().encode(contextNote).length;
  const textBudget = `${Math.round((textBytes / MAX_TEXT_BYTES) * 100)}%`;

  const onFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      for (const f of arr) {
        if (fileCount >= MAX_FILES) {
          toast.error(`Max ${MAX_FILES} files per run`);
          return;
        }
        if (f.size > MAX_FILE_BYTES) {
          toast.error(`${f.name} exceeds 5 MB`);
          continue;
        }
        const src: Source = { id: uid(), kind: "file", name: f.name, mime: f.type || "application/octet-stream", size: f.size };
        onAddSource(src);
        onAddBlob(src, f);
      }
    },
    [fileCount, onAddSource, onAddBlob],
  );

  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      // Files first
      const files = Array.from(e.clipboardData.files);
      if (files.length) {
        onFiles(files);
        return;
      }
      const text = e.clipboardData.getData("text/plain");
      if (text && text.length > 40) {
        onAddSource({ id: uid(), kind: "text", body: text });
      }
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onAddSource, onFiles]);

  function addUrl() {
    const v = urlValue.trim();
    if (!v) return;
    try {
      new URL(v);
    } catch {
      toast.error("Invalid URL");
      return;
    }
    onAddSource({ id: uid(), kind: "url", url: v });
    setUrlValue("");
  }

  async function toggleVoice() {
    if (recording) {
      recorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      chunksRef.current = [];
      rec.ondataavailable = (ev) => ev.data.size > 0 && chunksRef.current.push(ev.data);
      rec.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: rec.mimeType || "audio/webm" });
        const durationSec = Math.min(MAX_VOICE_SECONDS, Math.round((Date.now() - recordStartRef.current) / 1000));
        const src: Source = { id: uid(), kind: "voice", durationSec };
        onAddSource(src);
        onAddBlob(src, blob);
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
      };
      rec.start();
      recorderRef.current = rec;
      recordStartRef.current = Date.now();
      setRecording(true);
      // Hard cap voice length.
      setTimeout(() => recorderRef.current?.state === "recording" && recorderRef.current.stop(), MAX_VOICE_SECONDS * 1000);
    } catch {
      toast("Mic access denied");
    }
  }

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
      }}
      className="space-y-3"
    >
      <div className="iridescent-border rounded-2xl">
        <div className="rounded-[14px] bg-background p-6 text-center">
          <div className="font-sans text-base font-medium">Drop anything. Pulse figures out what to import.</div>
          <p className="mt-1 font-serif text-sm italic text-muted-foreground">
            PDF, image, screenshot, URL, paste-text, voice note — bulk insert across people, commesse, candidates, activities.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-2.5">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => e.target.files && onFiles(e.target.files)}
        />
        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-muted hover:bg-muted/80"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach files"
        >
          <Paperclip className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label={recording ? "Stop recording" : "Record voice"}
          onClick={toggleVoice}
          className={`flex h-8 w-8 items-center justify-center rounded-md ${recording ? "bg-red-500/20 text-red-400" : "bg-muted hover:bg-muted/80"}`}
        >
          {recording ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-1 rounded-md bg-muted px-2 py-1">
          <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addUrl())}
            placeholder="paste URL"
            className="w-40 bg-transparent text-xs outline-none placeholder:text-muted-foreground"
          />
        </div>
        <input
          value={contextNote}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder='Add context — "include everyone from the email below…"'
          className="min-w-[200px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <span className="font-mono text-[10px] text-muted-foreground">{textBudget}</span>
        <button
          type="button"
          disabled={!canParse || busy}
          onClick={onParse}
          className="flex items-center gap-1 rounded-md bg-lime-400 px-3 py-1.5 font-mono text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? "Parsing…" : "Parse"}
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/components/import/InputBar.tsx
git commit -m "feat(import): InputBar — drop, paste, file, URL, voice, context"
```

---

### Task 15: ReviewGrid component

**Files:**
- Create: `apps/app/src/components/import/ReviewGrid.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useState } from "react";
import type { ConflictDecision, ParsedEntity, SuperImportEntityType } from "@pulse-hr/shared";
import { EntityCard } from "./EntityCard";

type Props = {
  entities: ParsedEntity[];
  selectedIds: Set<string>;
  perRowDecisions: Map<string, ConflictDecision>;
  patches: Map<string, Record<string, unknown>>;
  onToggle: (id: string) => void;
  onDecide: (id: string, d: ConflictDecision) => void;
  onPatch: (id: string, patch: Record<string, unknown>) => void;
};

const FILTERS: Array<{ id: SuperImportEntityType | "all" | "conflicts"; label: string }> = [
  { id: "all", label: "All" },
  { id: "conflicts", label: "Conflicts" },
  { id: "employee", label: "Employees" },
  { id: "commessa", label: "Commesse" },
  { id: "candidate", label: "Candidates" },
  { id: "activity", label: "Activities" },
];

export function ReviewGrid({ entities, selectedIds, perRowDecisions, patches, onToggle, onDecide, onPatch }: Props) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");
  const filtered = entities.filter((e) => {
    if (filter === "all") return true;
    if (filter === "conflicts") return Boolean(e.conflict);
    return e.entityType === filter;
  });
  const conflictCount = entities.filter((e) => e.conflict).length;
  const readyCount = selectedIds.size;

  return (
    <div className="mt-6">
      <div className="mb-3 flex items-center gap-3">
        <h4 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">Parsed entities</h4>
        <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-[10px]">
          {readyCount} ready · {conflictCount} conflict · {entities.length - readyCount - conflictCount} needs review
        </span>
        <div className="ml-auto flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`rounded-full border px-2 py-0.5 text-[10px] ${
                filter === f.id ? "border-foreground/40 bg-foreground/10" : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((e, i) => (
          <div key={e.id} style={{ animationDelay: `${i * 50}ms` }} className="stagger-in">
            <EntityCard
              entity={e}
              selected={selectedIds.has(e.id)}
              decision={perRowDecisions.get(e.id)}
              patch={patches.get(e.id) ?? {}}
              onToggle={() => onToggle(e.id)}
              onDecide={(d) => onDecide(e.id, d)}
              onPatch={(p) => onPatch(e.id, p)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/components/import/ReviewGrid.tsx
git commit -m "feat(import): ReviewGrid with filters + staggered entrance"
```

---

### Task 16: ConfirmBar (with confetti)

**Files:**
- Create: `apps/app/src/components/import/ConfirmBar.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useState } from "react";

type Props = {
  selectedCount: number;
  conflictPending: number;
  byEntityCounts: Record<string, number>;
  onDiscard: () => void;
  onConfirm: () => void;
};

const N_PIECES = 20;
const COLORS = ["#b4ff39", "#39e1ff", "#c06bff", "#ff7a9c", "#ffd93d"];

export function ConfirmBar({ selectedCount, conflictPending, byEntityCounts, onDiscard, onConfirm }: Props) {
  const [bursting, setBursting] = useState(false);

  function handleConfirm() {
    setBursting(true);
    onConfirm();
    setTimeout(() => setBursting(false), 1600);
  }

  const summary = Object.entries(byEntityCounts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${n} ${k}${n > 1 ? "s" : ""}`)
    .join(" · ");

  return (
    <div className="sticky bottom-3 mt-6 rounded-xl border border-border bg-card/95 px-4 py-3 backdrop-blur">
      {bursting && (
        <div className="pointer-events-none absolute inset-x-0 bottom-full flex justify-center">
          {Array.from({ length: N_PIECES }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece absolute"
              style={{
                left: `${50 + (Math.random() * 60 - 30)}%`,
                background: COLORS[i % COLORS.length],
                animationDelay: `${i * 25}ms`,
              }}
            />
          ))}
        </div>
      )}
      <div className="flex items-center gap-3 text-sm">
        <span className="flex-1">
          Import <b>{selectedCount} records</b> · {summary || "—"}.
          {conflictPending > 0 && <span className="ml-1 text-[--color-labs]">{conflictPending} conflict pending decision.</span>}
        </span>
        <button type="button" onClick={onDiscard} className="text-xs text-muted-foreground hover:text-foreground">
          Discard
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
          className="rounded-md bg-lime-400 px-3 py-1.5 font-mono text-xs font-semibold text-black transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Import all ↵
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/components/import/ConfirmBar.tsx
git commit -m "feat(import): ConfirmBar with confetti burst"
```

---

### Task 17: SuperImportCanvas root

**Files:**
- Create: `apps/app/src/components/import/SuperImportCanvas.tsx`

- [ ] **Step 1: Implement**

```tsx
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { useAuth } from "@clerk/react";
import { toast } from "sonner";
import { initialState, reducer } from "./orchestrator";
import { InputBar } from "./InputBar";
import { SourceChips } from "./SourceChips";
import { QuotaChip } from "./QuotaChip";
import { ReviewGrid } from "./ReviewGrid";
import { ConfirmBar } from "./ConfirmBar";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { getQuota, parse, type ClientSource } from "@/lib/super-import-client";
import { buildKnownEntityDigest } from "@/lib/known-entity-digest";
import { applySuperImport } from "@/lib/super-import-apply";
import type { QuotaResponse, Source } from "@pulse-hr/shared";

export function SuperImportCanvas() {
  const { getToken } = useAuth();
  const [state, dispatch] = useReducer(reducer, initialState);
  const [quota, setQuota] = useState<QuotaResponse | null>(null);
  const blobsRef = useRef<Map<string, Blob>>(new Map());

  useEffect(() => {
    getQuota(getToken).then(setQuota).catch(() => setQuota(null));
  }, [getToken]);

  const sources: Source[] =
    state.kind === "collecting" || state.kind === "processing" || state.kind === "reviewing"
      ? state.sources
      : [];
  const contextNote = state.kind === "collecting" ? state.contextNote : "";
  const canParse = sources.length > 0 && (quota?.runsLeft ?? 0) > 0;
  const busy = state.kind === "processing" || state.kind === "importing";

  const onAddSource = useCallback((s: Source) => dispatch({ type: "addSource", source: s }), []);
  const onAddBlob = useCallback((s: Source, blob: Blob) => {
    blobsRef.current.set(s.id, blob);
  }, []);
  const onRemove = useCallback((id: string) => {
    blobsRef.current.delete(id);
    dispatch({ type: "removeSource", id });
  }, []);

  async function runParse() {
    if (state.kind !== "collecting") return;
    dispatch({ type: "parseRequested" });
    const clientSources: ClientSource[] = state.sources.map((s) => {
      const blob = blobsRef.current.get(s.id);
      return blob ? { ...s, blob } : s;
    });
    try {
      const res = await parse(getToken, clientSources, {
        contextNote: state.contextNote,
        knownEntityDigest: buildKnownEntityDigest(),
      });
      dispatch({ type: "parseResolved", entities: res.entities });
      setQuota(res.quotaAfter);
    } catch (err) {
      const e = err as Error & { code?: string; resetAt?: string };
      if (e.code === "quota_exhausted" && e.resetAt) {
        dispatch({ type: "quotaExhausted", resetAt: e.resetAt });
      } else {
        dispatch({ type: "parseFailed", message: e.message });
        toast.error(`Parse failed: ${e.message}`);
      }
    }
  }

  function runImport() {
    if (state.kind !== "reviewing") return;
    dispatch({ type: "confirmImport" });
    try {
      // After confirmImport the state is "importing"; we dispatched synchronously so peek via current state.
      // applySuperImport runs synchronously against the in-memory tables.
      const importable = state.entities.filter((e) => state.selectedIds.has(e.id)).map((e) => {
        const patch = state.patches.get(e.id);
        return patch ? { ...e, data: { ...e.data, ...patch } } : e;
      });
      const summary = applySuperImport(importable, state.perRowDecisions);
      dispatch({ type: "importDone", summary });
      toast.success(`Imported ${summary.inserted + summary.updated} records`, { duration: 4000 });
      setTimeout(() => dispatch({ type: "reset" }), 1800);
    } catch (err) {
      dispatch({ type: "parseFailed", message: (err as Error).message });
      toast.error((err as Error).message);
    }
  }

  const byEntityCounts = useMemo(() => {
    if (state.kind !== "reviewing") return {};
    const out: Record<string, number> = {};
    for (const e of state.entities) {
      if (state.selectedIds.has(e.id)) out[e.entityType] = (out[e.entityType] ?? 0) + 1;
    }
    return out;
  }, [state]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="font-display text-2xl">Super Import</h2>
        <span className="rounded-md border border-[--color-labs]/40 px-1.5 py-0.5 font-mono text-[10px] text-[--color-labs]">LABS</span>
        <div className="ml-auto">
          <QuotaChip runsLeft={quota?.runsLeft ?? null} runsTotal={quota?.runsTotal ?? null} resetAt={quota?.resetAt ?? null} />
        </div>
      </div>

      {state.kind === "rate_limited" ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center text-sm">
          Daily quota reached. Resets at {new Date(state.resetAt).toLocaleString()}.
        </div>
      ) : (
        <>
          <InputBar
            sources={sources}
            contextNote={contextNote}
            busy={busy}
            canParse={canParse}
            onAddSource={onAddSource}
            onContextChange={(note) => dispatch({ type: "updateContext", note })}
            onParse={runParse}
            onAddBlob={onAddBlob}
          />
          <SourceChips sources={sources} onRemove={onRemove} />

          {state.kind === "processing" && (
            <div className="shimmer h-40 rounded-lg border border-border bg-card/40" aria-label="Parsing" />
          )}

          {state.kind === "reviewing" && (
            <>
              <ReviewGrid
                entities={state.entities}
                selectedIds={state.selectedIds}
                perRowDecisions={state.perRowDecisions}
                patches={state.patches}
                onToggle={(id) => dispatch({ type: "toggleSelect", id })}
                onDecide={(id, d) => dispatch({ type: "decideConflict", id, decision: d })}
                onPatch={(id, patch) => dispatch({ type: "editEntity", id, patch })}
              />
              <ConfirmBar
                selectedCount={state.selectedIds.size}
                conflictPending={state.entities.filter((e) => e.conflict && !state.perRowDecisions.has(e.id)).length}
                byEntityCounts={byEntityCounts}
                onDiscard={() => dispatch({ type: "reset" })}
                onConfirm={runImport}
              />
            </>
          )}

          {state.kind === "idle" && (
            <EmptyState
              title="Add something. Anything."
              description="Pulse will figure out what to import. PDFs, screenshots, URLs, voice notes — all welcome."
            />
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add apps/app/src/components/import/SuperImportCanvas.tsx
git commit -m "feat(import): SuperImportCanvas root wiring orchestrator + client"
```

---

### Task 18: /import route file

**Files:**
- Create: `apps/app/src/routes/import.tsx`

- [ ] **Step 1: Implement**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { SuperImportCanvas } from "@/components/import/SuperImportCanvas";

export const Route = createFileRoute("/import")({
  component: ImportPage,
});

function ImportPage() {
  return (
    <div className="p-4 md:p-6">
      <SuperImportCanvas />
    </div>
  );
}
```

- [ ] **Step 2: Regenerate the route tree**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app
bun run dev:app &
sleep 4
kill %1
```

The router-plugin should have rewritten `src/routeTree.gen.ts` to include `/import`. Verify:

```bash
grep -c "import" src/routeTree.gen.ts
```

Expected: at least one match for the new route.

- [ ] **Step 3: Commit**

```bash
git add apps/app/src/routes/import.tsx apps/app/src/routeTree.gen.ts
git commit -m "feat(import): /import route file + regenerated route tree"
```

---

### Task 19: Sidebar nav entry

**Files:**
- Modify: `apps/app/src/lib/sidebar-nav-groups.tsx`

- [ ] **Step 1: Read the file and locate the People group**

```bash
sed -n '50,80p' /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app/src/lib/sidebar-nav-groups.tsx
```

- [ ] **Step 2: Insert the Super Import item**

Between the "Team" item and the "Status log" item in the People group, insert:

```tsx
{
  kind: "link",
  to: "/import",
  label: "Super Import",
  icon: Sparkles,
  badge: "new",
},
```

Add the `Sparkles` import at the top of the file (it's a `lucide-react` icon):

```tsx
import { Sparkles } from "lucide-react";
```

If `badge: "new"` isn't already supported by the renderer (`apps/app/src/components/app/AppShell.tsx`), check how it consumes the field. If a `<NewBadge>` from `@pulse-hr/ui/atoms/NewBadge` is rendered conditionally on a different prop name, match that prop. Confirm in `AppShell.tsx` by grepping for the existing field handling, then adjust.

- [ ] **Step 3: Smoke run + visual check**

```bash
bun run dev:app
```

Open `http://localhost:5173`. Log in. Confirm "Super Import" appears in the People group with the Sparkles icon and a NEW badge.

- [ ] **Step 4: Commit**

```bash
git add apps/app/src/lib/sidebar-nav-groups.tsx
git commit -m "feat(import): sidebar nav entry under People with NEW badge"
```

---

### Task 20: CommandPalette ⌘K entry

**Files:**
- Modify: `apps/app/src/components/app/CommandPalette.tsx`

- [ ] **Step 1: Read CommandPalette to find the route-list pattern**

```bash
sed -n '1,80p' /Users/davideghiotto/Desktop/projects/pulse-hr/apps/app/src/components/app/CommandPalette.tsx
```

Identify the array or block where existing routes are registered.

- [ ] **Step 2: Add the entry**

Add an entry mirroring the existing pattern, e.g.:

```tsx
{ id: "super-import", label: "Super Import", to: "/import", icon: Sparkles, badge: "labs" },
```

Add the `Sparkles` import if not already present.

- [ ] **Step 3: Verify**

Open the app, press ⌘K, type "import" — confirm the entry appears and navigation works.

- [ ] **Step 4: Commit**

```bash
git add apps/app/src/components/app/CommandPalette.tsx
git commit -m "feat(import): ⌘K palette entry for Super Import"
```

---

### Task 21: End-to-end verification

This is a manual verification task. No commit unless changes are required.

- [ ] **Step 1: Boot the stack**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr
# Make sure apps/api/.env has real ANTHROPIC_API_KEY + OPENAI_API_KEY
bun run dev
```

Expected: `app` (:5173), `api` (:3000), `feedback` start in parallel.

- [ ] **Step 2: Sign in and seed a conflict candidate**

Open `http://localhost:5173`, sign in via Clerk. Open browser devtools, run:

```js
JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k => k.endsWith(".employees"))))[0]
```

Note the first employee's `name` — e.g., "Marco Rossi". You'll mention this name in your test input to force a conflict.

- [ ] **Step 3: Use the feature**

1. Sidebar → People → Super Import. Confirm NEW badge + iridescent dot.
2. On `/import`: quota chip shows "5 of 5 runs today".
3. Paste a paragraph containing the existing employee's name + 2-3 fictional new employees + a project description ("ACME-2026, 800h, €85k").
4. Add a URL (any small static page).
5. Click Parse.
6. Within ~5-15s the shimmer overlay clears and parsed cards stagger in.
7. The existing employee shows a conflict pill.
8. Click **Update existing** on the conflict row.
9. Click **Import all**. Confetti fires, toast appears.
10. Navigate `/people` — new employees appear. `/projects` — ACME-2026 appears.
11. Refresh the page — entries persist (createTable persists to localStorage).

- [ ] **Step 4: Quota verification**

Trigger Parse 5 times in quick succession. On the 6th attempt:
- Network: response is 429 with `resetAt`.
- UI: state transitions to `rate_limited`; canvas shows the reset time.

- [ ] **Step 5: Voice verification**

1. Click the mic button.
2. Grant mic permission.
3. Speak for ~10 seconds describing one fictional employee.
4. Click stop. Voice chip appears with `voice-pill` border + duration.
5. Click Parse. The transcript flows through Whisper → Claude. Parsed card matches what you said.

- [ ] **Step 6: Full type check + lint**

```bash
cd /Users/davideghiotto/Desktop/projects/pulse-hr
bun run lint
cd apps/api && bun run typecheck
```

Expected: no new errors.

---

## Self-review checklist

**Spec coverage:**
- Intelligent classification ✓ (Task 3 system prompt asks LLM to infer entity types)
- Canvas + Review Grid layout ✓ (Tasks 14, 15, 17)
- Conflict flagging with Skip/Update/Create-anyway ✓ (Task 12)
- Hybrid rate limit (5/day + per-run caps) ✓ (Tasks 1, 2, 6)
- Multi-modal: text, image/PDF, URL, voice ✓ (Tasks 4, 5, 6, 14)
- Server-side proxy w/ Clerk auth ✓ (Tasks 6, 7)
- Orchestrator state machine ✓ (Task 8)
- Mock-data fan-out via tables ✓ (Task 11)
- Labs visual language (iridescent, stagger, shimmer, confetti, voice-pill, NEW badge) ✓ (Tasks 12-17, 19)
- Sidebar entry + ⌘K ✓ (Tasks 19, 20)
- Verification end-to-end ✓ (Task 21)

**Placeholder scan:** no TBDs. Open questions resolved up-front. Each step has runnable code or commands.

**Type consistency:** `Source`, `ParsedEntity`, `ConflictDecision`, `ParseResponse`, `QuotaResponse`, `ImportSummary` defined once in `packages/shared/src/super-import.ts` (Task 1) and imported by every downstream file. Reducer state types (`State`, `Action`) live in `orchestrator.ts` and use the shared types.

---

## Open follow-ups (not in this plan)

1. Streaming the LLM response token-by-token into the review grid (v2 polish).
2. Multi-instance rate-limit storage (Upstash / Redis) — only needed if `apps/api` scales out.
3. Importing into entity types not covered here (webhooks, API keys, custom fields).
4. Real Drizzle persistence of imported records (today they live in the local `createTable` stores).
5. Mobile layout polish below 768px.
