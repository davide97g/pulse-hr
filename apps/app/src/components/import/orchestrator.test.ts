import { describe, it, expect } from "bun:test";
import { initialState, reducer } from "./orchestrator";
import type { ParsedEntity } from "@pulse-hr/shared/super-import";

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
