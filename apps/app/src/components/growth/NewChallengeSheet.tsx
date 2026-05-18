import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { useI18n } from "@pulse-hr/shared/i18n";
import { challengesTable } from "@/lib/tables/challenges";
import { useEmployees } from "@/lib/tables/employees";
import { toast } from "sonner";
import type { Challenge } from "@/lib/mock-data";
import { useDraft } from "@/lib/use-draft";

type ChallengeKind = "individual" | "squad" | "company";

interface ChallengeDraft {
  kind: ChallengeKind;
  title: string;
  description: string;
  dueAt: string;
  xp: number;
  ownerId: string;
}

function defaultDueDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 21);
  return d.toISOString().slice(0, 10);
}

const KIND_LABELS: Record<"it" | "en", Array<[ChallengeKind, string, string]>> = {
  it: [
    ["individual", "INDIVIDUALE", "1 persona, 1 obiettivo"],
    ["squad", "SQUADRA", "Team coinvolto"],
    ["company", "AZIENDA", "Aperta a tutti"],
  ],
  en: [
    ["individual", "INDIVIDUAL", "1 person, 1 goal"],
    ["squad", "SQUAD", "Whole team involved"],
    ["company", "COMPANY", "Open to everyone"],
  ],
};

const XP_PRESETS = [100, 200, 350, 500];

export function NewChallengeSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const employees = useEmployees();
  const { locale } = useI18n();
  const KINDS = KIND_LABELS[locale];
  const { draft, setDraft, clearDraft } = useDraft<ChallengeDraft>(
    "pulsehr.draft.challenge-new",
    {
      kind: "squad",
      title: "",
      description: "",
      dueAt: defaultDueDate(),
      xp: 200,
      ownerId: "e1",
    },
  );
  const { kind, title, description, dueAt, xp, ownerId } = draft;

  function publish() {
    if (!title.trim()) {
      toast.error(locale === "it" ? "Inserisci un titolo" : "Enter a title");
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
    toast.success(locale === "it" ? "Challenge creata" : "Challenge created", {
      action: {
        label: locale === "it" ? "Annulla" : "Undo",
        onClick: () => challengesTable.remove(c.id),
      },
    });
    clearDraft();
    onClose();
  }

  return (
    <SidePanel
      open={open}
      onClose={onClose}
      title={locale === "it" ? "Nuova challenge" : "New challenge"}
      width={620}
    >
      <div className="p-5 flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {locale === "it" ? "TIPO" : "TYPE"}
          </span>
          <div className="grid gap-2.5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            {KINDS.map(([id, label, sub]) => {
              const on = kind === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setDraft({ kind: id })}
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
            {locale === "it" ? "TITOLO" : "TITLE"}
          </span>
          <input
            value={title}
            onChange={(e) => setDraft({ title: e.target.value })}
            placeholder={
              locale === "it" ? "Migrazione DB · zero downtime" : "DB migration · zero downtime"
            }
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
            {locale === "it" ? "DESCRIZIONE" : "DESCRIPTION"}
          </span>
          <textarea
            value={description}
            onChange={(e) => setDraft({ description: e.target.value })}
            placeholder={
              locale === "it"
                ? "Cosa serve, come si misura, chi è coinvolto."
                : "What's needed, how it's measured, who's involved."
            }
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
              {locale === "it" ? "SCADENZA" : "DUE"}
            </span>
            <input
              type="date"
              value={dueAt}
              onChange={(e) => setDraft({ dueAt: e.target.value })}
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
              onChange={(e) => setDraft({ ownerId: e.target.value })}
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
                  onClick={() => setDraft({ xp: n })}
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
            {locale === "it" ? "ANTEPRIMA" : "PREVIEW"}
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
              {title || (locale === "it" ? "Il titolo della challenge" : "The challenge title")}
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
                · {locale === "it" ? "scade" : "due"}{" "}
                {new Date(dueAt).toLocaleDateString(locale === "it" ? "it-IT" : "en-US")}
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
            {locale === "it" ? "ANNULLA" : "CANCEL"}
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
            {locale === "it" ? "CREA →" : "CREATE →"}
          </button>
        </div>
      </div>
    </SidePanel>
  );
}
