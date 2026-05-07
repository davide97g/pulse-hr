import { useState } from "react";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { challengesTable } from "@/lib/tables/challenges";
import { useEmployees } from "@/lib/tables/employees";
import { toast } from "sonner";
import type { Challenge } from "@/lib/mock-data";

type ChallengeKind = "individual" | "squad" | "company";

const KINDS: Array<[ChallengeKind, string, string]> = [
  ["individual", "INDIVIDUALE", "1 persona, 1 obiettivo"],
  ["squad", "SQUADRA", "Team coinvolto"],
  ["company", "AZIENDA", "Aperta a tutti"],
];

const XP_PRESETS = [100, 200, 350, 500];

export function NewChallengeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const employees = useEmployees();
  const [kind, setKind] = useState<ChallengeKind>("squad");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueAt, setDueAt] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 21);
    return d.toISOString().slice(0, 10);
  });
  const [xp, setXp] = useState(200);
  const [ownerId, setOwnerId] = useState("e1");

  function reset() {
    setKind("squad");
    setTitle("");
    setDescription("");
    setXp(200);
  }

  function publish() {
    if (!title.trim()) {
      toast.error("Inserisci un titolo");
      return;
    }
    const c: Challenge = {
      id: `ch-${Date.now()}`,
      employeeId: ownerId,
      assignedBy: "e1",
      title: title.trim(),
      description: description.trim() || `Challenge ${kind}`,
      difficulty: xp >= 350 ? 3 : xp >= 200 ? 2 : 1,
      status: "open",
      createdAt: new Date().toISOString().slice(0, 10),
      dueAt,
      xpReward: xp,
    };
    challengesTable.add(c);
    toast.success("Challenge creata", {
      action: { label: "Annulla", onClick: () => challengesTable.remove(c.id) },
    });
    reset();
    onClose();
  }

  return (
    <SidePanel open={open} onClose={onClose} title="Nuova challenge" width={620}>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            TIPO
          </span>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {KINDS.map(([id, label, sub]) => {
              const on = kind === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setKind(id)}
                  className="p-3.5 flex flex-col text-left"
                  style={{
                    gap: 4,
                    border: `1px solid ${on ? "var(--spark)" : "var(--line)"}`,
                    background: on
                      ? "color-mix(in oklch, var(--spark) 8%, transparent)"
                      : "transparent",
                    borderRadius: 14,
                    cursor: "pointer",
                  }}
                >
                  <span
                    className="t-mono"
                    style={{ color: on ? "var(--spark)" : "var(--muted-foreground)" }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: '"Fraunces", ui-serif, serif',
                      fontStyle: "italic",
                      fontSize: 16,
                      lineHeight: 1.2,
                    }}
                  >
                    {sub}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            TITOLO
          </span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Migrazione DB · zero downtime"
            style={{
              borderBottom: "1px solid var(--line-strong)",
              border: "none",
              borderRadius: 0,
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: "var(--line-strong)",
              padding: "8px 0",
              background: "transparent",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 26,
              letterSpacing: "-0.02em",
              color: "var(--fg)",
              outline: "none",
            }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            DESCRIZIONE
          </span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Cosa serve, come si misura, chi è coinvolto."
            rows={3}
            style={{
              padding: "12px 14px",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--fg)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 16,
              lineHeight: 1.4,
              resize: "vertical",
            }}
          />
        </div>

        <div className="grid gap-3" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              SCADENZA
            </span>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDueAt(e.target.value)}
              className="t-mono"
              style={{
                padding: "10px 12px",
                border: "1px solid var(--line-strong)",
                borderRadius: 12,
                background: "transparent",
                color: "var(--fg)",
              }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              OWNER
            </span>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value)}
              className="t-mono"
              style={{
                padding: "10px 12px",
                border: "1px solid var(--line-strong)",
                borderRadius: 12,
                background: "transparent",
                color: "var(--fg)",
              }}
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            XP
          </span>
          <div className="flex gap-1.5 flex-wrap">
            {XP_PRESETS.map((n) => {
              const on = xp === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setXp(n)}
                  className="t-mono"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--spark)" : "var(--line)"}`,
                    background: on
                      ? "color-mix(in oklch, var(--spark) 12%, transparent)"
                      : "transparent",
                    color: on ? "var(--spark)" : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}
                >
                  +{n}
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ANTEPRIMA
          </span>
          <div
            className="p-4 flex flex-col"
            style={{
              gap: 8,
              border: "1px solid var(--line)",
              borderRadius: 14,
              background: "var(--bg)",
            }}
          >
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              {KINDS.find((k) => k[0] === kind)?.[1]}
            </span>
            <span
              style={{
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 21,
                letterSpacing: "-0.015em",
                lineHeight: 1.15,
                color: title ? "var(--fg)" : "var(--muted-foreground)",
              }}
            >
              {title || "Il titolo della challenge"}
            </span>
            {description && (
              <span style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
                {description}
              </span>
            )}
            <div className="flex items-center" style={{ gap: 10, marginTop: 4 }}>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                +{xp} XP
              </span>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                · scade {new Date(dueAt).toLocaleDateString("it-IT")}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={onClose}
            className="t-mono"
            style={{
              padding: "10px 16px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            ANNULLA
          </button>
          <span style={{ flex: 1 }} />
          <button
            type="button"
            onClick={publish}
            className="t-mono"
            style={{
              padding: "10px 18px",
              borderRadius: 999,
              border: "none",
              background: "var(--spark)",
              color: "var(--ink)",
              cursor: "pointer",
            }}
          >
            CREA →
          </button>
        </div>
      </div>
    </SidePanel>
  );
}
