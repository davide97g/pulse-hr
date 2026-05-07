import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useKudos, kudosTable } from "@/lib/tables/kudos";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import type { Kudo } from "@/lib/mock-data";

const MONTHS_IT_SHORT = [
  "GEN",
  "FEB",
  "MAR",
  "APR",
  "MAG",
  "GIU",
  "LUG",
  "AGO",
  "SET",
  "OTT",
  "NOV",
  "DIC",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]} · ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function KudosEditorial() {
  const kudos = useKudos();
  const employees = useEmployees();
  const [draft, setDraft] = useState<{ toId: string; message: string; amount: number }>({
    toId: "",
    message: "",
    amount: 5,
  });

  const monthCount = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    return kudos.filter((k) => new Date(k.date) >= monthStart).length;
  }, [kudos]);

  const leaderboard = useMemo(() => {
    const counts = new Map<string, number>();
    for (const k of kudos) counts.set(k.toId, (counts.get(k.toId) ?? 0) + 1);
    return Array.from(counts.entries())
      .map(([id, count]) => ({ emp: employeeById(id) ?? employees.find((e) => e.id === id), count }))
      .filter((r): r is { emp: NonNullable<ReturnType<typeof employeeById>>; count: number } => !!r.emp)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [kudos, employees]);

  const recent = useMemo(() => {
    return [...kudos]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 8);
  }, [kudos]);

  function publish() {
    if (!draft.toId || !draft.message.trim()) {
      toast.error("Scegli una persona e scrivi un messaggio");
      return;
    }
    const k: Kudo = {
      id: `kd-${Date.now()}`,
      fromId: "e1",
      toId: draft.toId,
      amount: draft.amount,
      tag: "craft",
      date: new Date().toISOString().slice(0, 10),
      message: draft.message,
    };
    kudosTable.add(k);
    toast.success("Kudos pubblicato");
    setDraft({ toId: "", message: "", amount: 5 });
  }

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Hero + new kudos card */}
      <div className="grid gap-8 items-end" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PEER RECOGNITION · {monthCount} KUDOS QUESTO MESE
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 132px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Grazie</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 18,
              maxWidth: 480,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            Quando qualcuno ti rende il lavoro più leggero, vale la pena dirlo. Anche per scritto.
          </p>
        </div>
        <div
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 16,
            padding: "18px 22px",
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NUOVO KUDOS
          </span>
          <select
            value={draft.toId}
            onChange={(e) => setDraft({ ...draft, toId: e.target.value })}
            className="t-body mt-3 w-full"
            style={{
              border: "1px solid var(--line)",
              background: "transparent",
              borderRadius: 10,
              padding: "8px 10px",
              color: "var(--fg)",
            }}
          >
            <option value="">@persona</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <textarea
            placeholder="A chi vuoi dire grazie oggi?"
            value={draft.message}
            onChange={(e) => setDraft({ ...draft, message: e.target.value })}
            rows={2}
            className="mt-3 w-full"
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.4,
              color: "var(--fg)",
              background: "transparent",
              border: "1px solid var(--line)",
              borderRadius: 10,
              padding: "10px 12px",
              resize: "none",
              outline: "none",
            }}
          />
          <div className="flex gap-2 items-center mt-3">
            <select
              value={draft.amount}
              onChange={(e) => setDraft({ ...draft, amount: Number(e.target.value) })}
              className="t-mono"
              style={{
                padding: "5px 10px",
                borderRadius: 999,
                border: "1px solid var(--line-strong)",
                background: "transparent",
                color: "var(--fg)",
              }}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  +{n} coin
                </option>
              ))}
            </select>
            <span className="flex-1" />
            <button type="button" onClick={publish} className="pill pill-spark pill-sm">
              Pubblica <span className="arr">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* Leaderboard strip */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: `repeat(${Math.max(leaderboard.length, 1)}, 1fr)`,
          border: "1px solid var(--line)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {leaderboard.map((row, i) => (
          <div
            key={row.emp.id}
            className="flex items-center gap-3.5"
            style={{
              padding: "16px 20px",
              borderRight: i < leaderboard.length - 1 ? "1px solid var(--line)" : "none",
            }}
          >
            <span className="ph-avatar ph-avatar-sm">{row.emp.initials}</span>
            <div>
              <div
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: i === 0 ? "italic" : "normal",
                  fontSize: 22,
                  letterSpacing: "-0.02em",
                }}
              >
                {row.emp.name.split(" ")[0]}
              </div>
              <span
                className="t-mono"
                style={{ color: i === 0 ? "var(--spark)" : "var(--muted-foreground)" }}
              >
                {row.count} ricevuti
              </span>
            </div>
          </div>
        ))}
        {leaderboard.length === 0 && (
          <div className="p-4 text-center" style={{ color: "var(--muted-foreground)" }}>
            <span className="t-mono">NESSUN KUDOS ANCORA</span>
          </div>
        )}
      </div>

      {/* Kudos cards */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))",
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          paddingRight: 4,
          paddingBottom: 4,
        }}
      >
        {recent.map((k) => {
          const from = employeeById(k.fromId) ?? employees.find((e) => e.id === k.fromId);
          const to = employeeById(k.toId) ?? employees.find((e) => e.id === k.toId);
          if (!from || !to) return null;
          return (
            <article
              key={k.id}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: "22px 26px",
                display: "flex",
                flexDirection: "column",
                gap: 14,
                background: "var(--bg)",
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <span className="ph-avatar ph-avatar-sm">{from.initials}</span>
                <span className="t-body" style={{ fontWeight: 600 }}>
                  {from.name.split(" ")[0]}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  →
                </span>
                <span className="ph-avatar ph-avatar-sm">{to.initials}</span>
                <span className="t-body" style={{ fontWeight: 600 }}>
                  {to.name.split(" ")[0]}
                </span>
                <span className="flex-1" />
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  +{k.amount}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  lineHeight: 1.4,
                  color: "var(--fg)",
                  letterSpacing: "-0.005em",
                }}
              >
                «{k.message}»
              </p>
              <span className="t-mono" style={{ color: "var(--muted-foreground)", marginTop: "auto" }}>
                {formatDate(k.date)}
              </span>
            </article>
          );
        })}
      </div>
    </div>
  );
}
