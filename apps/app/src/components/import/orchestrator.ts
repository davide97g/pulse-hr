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
} from "@pulse-hr/shared/super-import";

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
