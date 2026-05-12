import { useState } from "react";
import { toast } from "sonner";
import { commentRepliesTable, useCommentReplies } from "@/lib/tables/commentReplies";

export function CommentThreadEditorial({ id }: { id: string }) {
  const thread = useCommentReplies();
  const [draft, setDraft] = useState("");

  function publish() {
    if (!draft.trim()) {
      toast.error("Scrivi qualcosa prima di pubblicare");
      return;
    }
    commentRepliesTable.add({
      whoInitials: "DG",
      whoName: "Davide",
      whoRole: "VP PRODUCT",
      time: new Date()
        .toLocaleString("it-IT", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
        .toUpperCase()
        .replace(",", " ·"),
      text: draft.trim(),
    });
    setDraft("");
    toast.success("Risposta pubblicata");
  }

  return (
    <div
      className="ph p-4 md:p-6 grid gap-12 min-h-full"
      style={{ gridTemplateColumns: "1fr 1.4fr" }}
    >
      {/* Context */}
      <aside className="flex flex-col justify-between min-h-0">
        <div>
          <span className="t-mono" style={{ color: "var(--spark)" }}>
            ⏤ THREAD #{id.slice(-4)} · {thread.length} RISPOSTE ⏤
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "12px 0 0",
              fontSize: "clamp(56px, 7vw, 84px)",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
            }}
          >
            Lavoro da <span style={{ fontStyle: "italic" }}>remoto</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 22,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 20,
              lineHeight: 1.4,
              maxWidth: 420,
            }}
          >
            Si discute la nuova policy: tre giorni in ufficio, due da casa, con qualche eccezione per
            team distribuiti.
          </p>
        </div>

        <div className="flex flex-col gap-3.5 mt-8">
          <div style={{ borderTop: "1px solid var(--line-strong)", paddingTop: 18 }}>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              PARTECIPANTI · {new Set(thread.map((t) => t.whoInitials)).size}
            </span>
            <div className="flex gap-2 mt-3 items-center flex-wrap">
              {Array.from(new Set(thread.map((t) => t.whoInitials))).map((i) => (
                <span key={i} className="ph-avatar ph-avatar-sm">
                  {i}
                </span>
              ))}
            </div>
          </div>
          <div
            className="grid pt-3.5"
            style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line)" }}
          >
            <Stat label="RISPOSTE" value={String(thread.length)} first />
            <Stat label="VISTE" value="98%" />
            <Stat label="KUDOS" value="5" accent />
          </div>
        </div>
      </aside>

      {/* Thread */}
      <section className="flex flex-col min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-6 pr-1.5 pb-4">
          {thread.map((c, i) => (
            <div
              key={c.id}
              className="grid"
              style={{
                gridTemplateColumns: "44px 1fr",
                gap: 16,
                paddingBottom: 22,
                borderBottom: i < thread.length - 1 ? "1px solid var(--line)" : "none",
              }}
            >
              <span className="ph-avatar ph-avatar-sm">{c.whoInitials}</span>
              <div>
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="t-body" style={{ fontWeight: 600 }}>
                    {c.whoName}
                  </span>
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {c.whoRole}
                  </span>
                  <span className="flex-1" />
                  <span
                    className="t-mono"
                    style={{ color: c.pinned ? "var(--spark)" : "var(--muted-foreground)" }}
                  >
                    {c.time}
                  </span>
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: c.pinned ? "italic" : "normal",
                    fontSize: 21,
                    lineHeight: 1.45,
                    letterSpacing: "-0.005em",
                    color: "var(--fg)",
                  }}
                >
                  {c.text}
                </p>
                <div className="mt-3 flex gap-3.5 items-center">
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    ↳ Rispondi
                  </span>
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    + Kudos
                  </span>
                  {c.pinned && (
                    <span className="t-mono" style={{ color: "var(--spark)" }}>
                      ● PINNED
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Reply */}
        <div
          className="pt-4 flex flex-col gap-3"
          style={{ borderTop: "1px solid var(--line-strong)" }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            RISPONDI COME · DAVIDE
          </span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Scrivi una risposta…"
            rows={2}
            style={{
              border: "1px solid var(--line)",
              borderRadius: 12,
              padding: "14px 16px",
              minHeight: 70,
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 18,
              color: "var(--fg)",
              background: "transparent",
              outline: "none",
              resize: "vertical",
            }}
          />
          <div className="flex gap-2.5 items-center">
            <button type="button" className="pill pill-ghost pill-sm">
              @persona
            </button>
            <button type="button" className="pill pill-ghost pill-sm">
              Allega
            </button>
            <span className="flex-1" />
            <button type="button" className="pill pill-spark pill-sm" onClick={publish}>
              ⌘⏎ Pubblica
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  first,
}: {
  label: string;
  value: string;
  accent?: boolean;
  first?: boolean;
}) {
  return (
    <div
      style={{
        paddingLeft: first ? 0 : 14,
        borderLeft: first ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <div
        className="t-num mt-1"
        style={{
          fontSize: 22,
          letterSpacing: "-0.02em",
          color: accent ? "var(--spark)" : "var(--fg)",
        }}
      >
        {value}
      </div>
    </div>
  );
}
