import { useState } from "react";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { kudosTable } from "@/lib/tables/kudos";
import { useEmployees } from "@/lib/tables/employees";
import { Avatar } from "@/components/app/AppShell";
import { toast } from "sonner";
import type { Kudo } from "@/lib/mock-data";

const TAGS: Array<[Kudo["tag"], string]> = [
  ["craft", "CRAFT"],
  ["impact", "IMPATTO"],
  ["teamwork", "TEAMWORK"],
  ["courage", "CORAGGIO"],
  ["kindness", "GENTILEZZA"],
];

const COIN_OPTIONS = [5, 10, 25, 50];

export function NewKudosSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const employees = useEmployees();
  const [toId, setToId] = useState("");
  const [message, setMessage] = useState("");
  const [tag, setTag] = useState<Kudo["tag"]>("craft");
  const [amount, setAmount] = useState(5);

  function reset() {
    setToId("");
    setMessage("");
    setTag("craft");
    setAmount(5);
  }

  function publish() {
    if (!toId || !message.trim()) {
      toast.error("Scegli una persona e scrivi un messaggio");
      return;
    }
    const k: Kudo = {
      id: `kd-${Date.now()}`,
      fromId: "e1",
      toId,
      amount,
      tag,
      date: new Date().toISOString().slice(0, 10),
      message: message.trim(),
    };
    kudosTable.add(k);
    toast.success("Kudos pubblicato", {
      action: { label: "Annulla", onClick: () => kudosTable.remove(k.id) },
    });
    reset();
    onClose();
  }

  const target = employees.find((e) => e.id === toId);

  return (
    <SidePanel open={open} onClose={onClose} title="Nuovo kudos" width={520}>
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            DESTINATARIO
          </span>
          <select
            value={toId}
            onChange={(e) => setToId(e.target.value)}
            className="t-mono"
            style={{
              padding: "10px 12px",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--fg)",
            }}
          >
            <option value="">— Scegli —</option>
            {employees
              .filter((e) => e.id !== "e1")
              .map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name} · {e.department}
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            CATEGORIA
          </span>
          <div className="flex flex-wrap gap-1.5">
            {TAGS.map(([id, label]) => {
              const on = tag === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTag(id)}
                  className="t-mono"
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: `1px solid ${on ? "var(--ink)" : "var(--line)"}`,
                    background: on ? "var(--ink)" : "transparent",
                    color: on ? "var(--paper)" : "var(--muted-foreground)",
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            COIN
          </span>
          <div className="flex gap-1.5">
            {COIN_OPTIONS.map((n) => {
              const on = amount === n;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setAmount(n)}
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

        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            MESSAGGIO
          </span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Una frase concreta. Cosa ha fatto, perché conta."
            rows={4}
            style={{
              padding: "12px 14px",
              border: "1px solid var(--line-strong)",
              borderRadius: 12,
              background: "transparent",
              color: "var(--fg)",
              fontFamily: '"Fraunces", ui-serif, serif',
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.4,
              resize: "vertical",
            }}
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ANTEPRIMA
          </span>
          <div
            className="p-4 flex flex-col"
            style={{
              gap: 10,
              border: "1px solid var(--line)",
              borderRadius: 14,
              background: "var(--bg)",
            }}
          >
            <div className="flex items-center" style={{ gap: 10, flexWrap: "wrap" }}>
              {target ? (
                <>
                  <Avatar initials={target.initials} size={24} />
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {target.name.split(" ")[0]}
                  </span>
                </>
              ) : (
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  SCEGLI UNA PERSONA
                </span>
              )}
              <span style={{ flex: 1 }} />
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                {TAGS.find((t) => t[0] === tag)?.[1]}
              </span>
              <span className="t-mono" style={{ color: "var(--spark)" }}>
                +{amount}
              </span>
            </div>
            <p
              style={{
                margin: 0,
                fontFamily: '"Fraunces", ui-serif, serif',
                fontStyle: "italic",
                fontSize: 17,
                lineHeight: 1.4,
                color: message ? "var(--fg)" : "var(--muted-foreground)",
              }}
            >
              «{message || "Il tuo messaggio qui."}»
            </p>
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
            PUBBLICA →
          </button>
        </div>
      </div>
    </SidePanel>
  );
}
