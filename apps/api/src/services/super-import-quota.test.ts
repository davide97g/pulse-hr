import { describe, it, expect, beforeEach } from "bun:test";
import { __resetQuotaForTest, checkAndConsume, peekQuota } from "./super-import-quota";
import { RUNS_PER_DAY } from "@pulse-hr/shared/super-import";

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
