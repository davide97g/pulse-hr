import { useMemo } from "react";
import { useChallenges, challengesTable } from "@/lib/tables/challenges";
import { employeeById } from "@/lib/tables/employees";
import { toast } from "sonner";
import type { Challenge } from "@/lib/mock-data";

const MONTHS_IT = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
function fmtDeadline(iso: string) {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT[d.getMonth()].toLowerCase()}`;
}

function deadlineProgress(c: Challenge): number {
  const start = new Date(c.createdAt).getTime();
  const due = new Date(c.dueAt).getTime();
  const now = Date.now();
  if (due <= start) return 0;
  return Math.max(0, Math.min(1, (now - start) / (due - start)));
}

export function GrowthChallenges({ onOpenNewChallenge }: { onOpenNewChallenge: () => void }) {
  const challenges = useChallenges();

  const { open, inProgress, completed } = useMemo(() => {
    const sorted = [...challenges].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const active = sorted.filter((c) => c.status === "open");
    const fresh = active.filter((c) => deadlineProgress(c) < 0.05);
    const ongoing = active.filter((c) => deadlineProgress(c) >= 0.05);
    const done = sorted.filter((c) => c.status === "succeeded" || c.status === "failed");
    return { open: fresh, inProgress: ongoing, completed: done };
  }, [challenges]);

  const totals = useMemo(() => {
    const xp = challenges.reduce((a, c) => a + (c.status === "succeeded" ? c.xpReward : 0), 0);
    const monthXp = (() => {
      const start = new Date();
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      return challenges
        .filter((c) => c.status === "succeeded" && new Date(c.dueAt) >= start)
        .reduce((a, c) => a + c.xpReward, 0);
    })();
    const winners = challenges.filter((c) => c.status === "succeeded").length;
    const closingSoon = (() => {
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 7);
      const now = new Date();
      return challenges.filter(
        (c) => c.status === "open" && new Date(c.dueAt) <= horizon && new Date(c.dueAt) >= now,
      ).length;
    })();
    const total = challenges.length;
    const completion = total === 0 ? 0 : Math.round((winners / total) * 100);
    return { xp, monthXp, winners, closingSoon, completion };
  }, [challenges]);

  function deleteChallenge(c: Challenge) {
    challengesTable.remove(c.id);
    toast("Challenge rimossa", {
      action: {
        label: "Annulla",
        onClick: () => challengesTable.add(c),
      },
    });
  }

  const ribbon: Array<[string, string, boolean]> = [
    ["XP TOTALE", `${(totals.xp / 1000).toFixed(1)}k`, false],
    ["XP MESE", `${(totals.monthXp / 1000).toFixed(1)}k`, true],
    ["VINCITORI", String(totals.winners), false],
    ["IN SCADENZA", String(totals.closingSoon), totals.closingSoon > 0],
    ["TASSO COMPL.", `${totals.completion}%`, false],
  ];

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onOpenNewChallenge}
          className="t-mono"
          style={{
            padding: "8px 14px",
            borderRadius: 999,
            background: "var(--ink)",
            color: "var(--paper)",
            border: "none",
            cursor: "pointer",
          }}
        >
          + NUOVA CHALLENGE
        </button>
      </div>

      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(5, minmax(0, 1fr))",
          borderTop: "1px solid var(--line-strong)",
          borderBottom: "1px solid var(--line)",
          padding: "12px 0",
        }}
      >
        {ribbon.map(([l, v, sp], i) => (
          <div
            key={l}
            style={{
              paddingLeft: i === 0 ? 0 : 14,
              borderLeft: i === 0 ? "none" : "1px solid var(--line)",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {l}
            </span>
            <div
              className="t-num"
              style={{
                fontSize: 26,
                marginTop: 2,
                letterSpacing: "-0.02em",
                color: sp ? "var(--spark)" : "var(--fg)",
              }}
            >
              {v}
            </div>
          </div>
        ))}
      </div>

      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "1fr 1fr 1fr", flex: 1, minHeight: 0 }}
      >
        <Column
          title="APERTE"
          accent="var(--muted-foreground)"
          items={open}
          onDelete={deleteChallenge}
        />
        <Column
          title="IN CORSO"
          accent="var(--spark)"
          items={inProgress}
          onDelete={deleteChallenge}
          showProgress
        />
        <Column
          title="COMPLETATE"
          accent="var(--fg)"
          items={completed}
          onDelete={deleteChallenge}
          done
        />
      </div>
    </div>
  );
}

function Column({
  title,
  accent,
  items,
  onDelete,
  showProgress,
  done,
}: {
  title: string;
  accent: string;
  items: Challenge[];
  onDelete: (c: Challenge) => void;
  showProgress?: boolean;
  done?: boolean;
}) {
  return (
    <section className="flex flex-col gap-2 min-h-0">
      <div
        className="flex items-baseline"
        style={{ gap: 10, paddingBottom: 8, borderBottom: `2px solid ${accent}` }}
      >
        <span className="t-mono" style={{ color: accent }}>
          {title}
        </span>
        <span className="t-num" style={{ fontSize: 18 }}>
          {items.length}
        </span>
      </div>
      <div
        className="flex flex-col gap-2.5 overflow-auto pr-1 stagger-in"
        style={{ flex: 1, minHeight: 0, paddingBottom: 4 }}
      >
        {items.length === 0 && (
          <span className="t-mono" style={{ color: "var(--muted-foreground)", padding: "8px 0" }}>
            VUOTO
          </span>
        )}
        {items.map((c) => {
          const owner = employeeById(c.employeeId);
          const prog = deadlineProgress(c);
          return (
            <div
              key={c.id}
              className="p-4 flex flex-col"
              style={{
                gap: 8,
                border: "1px solid var(--line)",
                borderRadius: 14,
                background: "var(--bg)",
                opacity: done ? 0.78 : 1,
              }}
            >
              <span className="t-mono" style={{ color: accent }}>
                {owner?.department.toUpperCase() ?? "TEAM"}
              </span>
              <span
                style={{
                  fontFamily: '"Fraunces", ui-serif, serif',
                  fontStyle: "italic",
                  fontSize: 20,
                  letterSpacing: "-0.015em",
                  textDecoration: done ? "line-through" : "none",
                  color: done ? "var(--muted-foreground)" : "var(--fg)",
                  lineHeight: 1.15,
                }}
              >
                {c.title}
              </span>
              {c.description && (
                <span style={{ color: "var(--muted-foreground)", fontSize: 13, lineHeight: 1.4 }}>
                  {c.description}
                </span>
              )}
              {showProgress && (
                <div
                  style={{
                    height: 4,
                    background: "var(--line)",
                    borderRadius: 999,
                    marginTop: 2,
                  }}
                >
                  <div
                    style={{
                      width: `${prog * 100}%`,
                      height: "100%",
                      background: "var(--spark)",
                      borderRadius: 999,
                    }}
                  />
                </div>
              )}
              <div
                className="flex items-center"
                style={{ gap: 10, marginTop: 4, flexWrap: "wrap" }}
              >
                <span className="t-mono" style={{ color: "var(--spark)" }}>
                  +{c.xpReward} XP
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  · {fmtDeadline(c.dueAt)}
                </span>
                <span style={{ flex: 1 }} />
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {owner ? owner.name.split(" ")[0] : "—"}
                </span>
                <button
                  type="button"
                  onClick={() => onDelete(c)}
                  className="t-mono"
                  style={{
                    color: "var(--muted-foreground)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  ×
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
