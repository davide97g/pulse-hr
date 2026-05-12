import { describe, it, expect, beforeEach, mock } from "bun:test";
import { __resetQuotaForTest } from "../services/super-import-quota";

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
