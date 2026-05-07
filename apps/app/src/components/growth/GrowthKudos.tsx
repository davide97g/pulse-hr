import { useMemo } from "react";
import { useKudos, kudosTable } from "@/lib/tables/kudos";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { Avatar } from "@/components/app/AppShell";
import { toast } from "sonner";
import type { Kudo } from "@/lib/mock-data";

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
function fmt(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()]}`;
}

const TAG_LABEL: Record<Kudo["tag"], string> = {
  craft: "CRAFT",
  impact: "IMPATTO",
  teamwork: "TEAMWORK",
  courage: "CORAGGIO",
  kindness: "GENTILEZZA",
};

export function GrowthKudos({ onOpenNewKudos }: { onOpenNewKudos: () => void }) {
  const kudos = useKudos();
  const employees = useEmployees();

  const monthCount = useMemo(() => {
    const start = new Date();
    start.setDate(1);
    start.setHours(0, 0, 0, 0);
    return kudos.filter((k) => new Date(k.date) >= start).length;
  }, [kudos]);

  const top = useMemo(() => {
    const received = new Map<string, number>();
    const given = new Map<string, number>();
    for (const k of kudos) {
      received.set(k.toId, (received.get(k.toId) ?? 0) + 1);
      given.set(k.fromId, (given.get(k.fromId) ?? 0) + 1);
    }
    return employees
      .map((e) => ({ e, recv: received.get(e.id) ?? 0, given: given.get(e.id) ?? 0 }))
      .sort((a, b) => b.recv - a.recv)
      .slice(0, 5);
  }, [kudos, employees]);

  const wall = useMemo(
    () => [...kudos].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 12),
    [kudos],
  );

  function deleteKudo(k: Kudo) {
    kudosTable.remove(k.id);
    toast("Kudos rimosso", {
      action: { label: "Annulla", onClick: () => kudosTable.add(k) },
    });
  }

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="grid gap-6 items-end" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PEER RECOGNITION · {monthCount} KUDOS QUESTO MESE
          </span>
          <h2
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontWeight: 400,
              margin: "6px 0 0",
              fontSize: 56,
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Grazie</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h2>
        </div>

        <button
          type="button"
          onClick={onOpenNewKudos}
          className="p-4 text-left"
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 16,
            background: "var(--bg)",
            cursor: "pointer",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NUOVO KUDOS
          </span>
          <div
            style={{
              marginTop: 8,
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 18,
              lineHeight: 1.4,
              color: "var(--muted-foreground)",
            }}
          >
            A chi vuoi dire grazie oggi?
          </div>
          <div
            className="t-mono"
            style={{ marginTop: 10, color: "var(--spark)", display: "inline-block" }}
          >
            APRI COMPOSER →
          </div>
        </button>
      </div>

      {/* Leaderboard */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          border: "1px solid var(--line-strong)",
          borderRadius: 14,
          overflow: "hidden",
        }}
      >
        {top.map((row, i) => (
          <div
            key={row.e.id}
            className="p-4 flex items-center"
            style={{
              gap: 12,
              borderRight: i < top.length - 1 ? "1px solid var(--line)" : "none",
              background:
                i === 0 ? "color-mix(in oklch, var(--spark) 8%, transparent)" : "transparent",
            }}
          >
            <span
              className="t-num"
              style={{ fontSize: 16, color: "var(--muted-foreground)", width: 18 }}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <Avatar initials={row.e.initials} size={32} employeeId={row.e.id} />
            <div className="flex flex-col">
              <span
                style={{
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: i === 0 ? "italic" : "normal",
                  fontSize: 18,
                  letterSpacing: "-0.02em",
                }}
              >
                {row.e.name.split(" ")[0]}
              </span>
              <span
                className="t-mono"
                style={{ color: i === 0 ? "var(--spark)" : "var(--muted-foreground)" }}
              >
                {row.recv} ricevuti · +{row.given} dati
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Wall */}
      <div
        className="grid gap-3 overflow-auto pr-1 stagger-in"
        style={{ gridTemplateColumns: "1fr 1fr", flex: 1, minHeight: 0, paddingBottom: 4 }}
      >
        {wall.map((k) => {
          const from = employeeById(k.fromId);
          const to = employeeById(k.toId);
          return (
            <div
              key={k.id}
              className="p-5 flex flex-col"
              style={{
                gap: 12,
                border: "1px solid var(--line)",
                borderRadius: 16,
                background: "var(--bg)",
              }}
            >
              <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
                {from && <Avatar initials={from.initials} size={28} employeeId={from.id} />}
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {from?.name.split(" ")[0] ?? "—"}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  →
                </span>
                {to && <Avatar initials={to.initials} size={28} employeeId={to.id} />}
                <span style={{ fontWeight: 600, fontSize: 14 }}>
                  {to?.name.split(" ")[0] ?? "—"}
                </span>
                <span style={{ flex: 1 }} />
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {TAG_LABEL[k.tag]}
                </span>
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  +{k.amount}
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: "italic",
                  fontSize: 18,
                  lineHeight: 1.4,
                  letterSpacing: "-0.005em",
                }}
              >
                «{k.message}»
              </p>
              <div className="flex items-center" style={{ gap: 10, marginTop: "auto" }}>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {fmt(k.date)}
                </span>
                <span style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => deleteKudo(k)}
                  className="t-mono"
                  style={{
                    color: "var(--muted-foreground)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Rimuovi
                </button>
              </div>
            </div>
          );
        })}
        {wall.length === 0 && (
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            NESSUN KUDOS — INIZIA TU.
          </span>
        )}
      </div>
    </div>
  );
}
