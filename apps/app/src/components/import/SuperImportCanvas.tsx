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
import type { QuotaResponse, Source } from "@pulse-hr/shared/super-import";

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
  const onAddBlob = useCallback(
    (s: Extract<Source, { kind: "file" } | { kind: "voice" }>, blob: Blob) => {
      blobsRef.current.set(s.id, blob);
    },
    [],
  );
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
    const importable = state.entities
      .filter((e) => state.selectedIds.has(e.id))
      .map((e) => {
        const patch = state.patches.get(e.id);
        return patch ? { ...e, data: { ...e.data, ...patch } } : e;
      });
    dispatch({ type: "confirmImport" });
    try {
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
        <span className="rounded-md border border-[--color-labs]/40 px-1.5 py-0.5 font-mono text-[10px] text-[--color-labs]">
          LABS
        </span>
        <div className="ml-auto">
          <QuotaChip
            runsLeft={quota?.runsLeft ?? null}
            runsTotal={quota?.runsTotal ?? null}
            resetAt={quota?.resetAt ?? null}
          />
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
            <div
              className="shimmer h-40 rounded-lg border border-border bg-card/40"
              aria-label="Parsing"
            />
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
                conflictPending={
                  state.entities.filter((e) => e.conflict && !state.perRowDecisions.has(e.id))
                    .length
                }
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
