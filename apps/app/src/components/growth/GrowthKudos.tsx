import { useMemo } from "react";
import { useKudos, kudosTable } from "@/lib/tables/kudos";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { Avatar } from "@/components/app/AppShell";
import { toast } from "sonner";
import type { Kudo } from "@/lib/mock-data";
import { useT, useI18n } from "@pulse-hr/shared/i18n";

function fmt(iso: string, locale: string) {
  const d = new Date(iso);
  const month = d
    .toLocaleString(locale === "it" ? "it-IT" : "en-US", { month: "short" })
    .toUpperCase()
    .replace(".", "");
  return `${String(d.getDate()).padStart(2, "0")} ${month}`;
}

const TAG_KEY: Record<Kudo["tag"], string> = {
  craft: "kudos.tag.craft",
  impact: "kudos.tag.impact",
  teamwork: "kudos.tag.teamwork",
  courage: "kudos.tag.courage",
  kindness: "kudos.tag.kindness",
};

export function GrowthKudos({ onOpenNewKudos }: { onOpenNewKudos: () => void }) {
  const kudos = useKudos();
  const employees = useEmployees();
  const t = useT();
  const { locale } = useI18n();

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
    toast(t("kudos.toast.removed"), {
      action: { label: t("common.undo"), onClick: () => kudosTable.add(k) },
    });
  }

  return (
    <div className="flex flex-col gap-4 min-h-0">
      <div className="grid gap-4 md:gap-6 items-end grid-cols-1 md:grid-cols-[1.2fr_1fr]">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.eyebrow", { n: monthCount })}
          </span>
          <h2
            className="text-[40px] md:text-[56px]"
            style={{
              fontFamily: '"Fraunces", ui-serif, serif',
              fontWeight: 400,
              margin: "6px 0 0",
              letterSpacing: "-0.04em",
              lineHeight: 0.92,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{t("kudos.heading")}</span>
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
            {t("kudos.new")}
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
            {t("kudos.composer.prompt")}
          </div>
          <div
            className="t-mono"
            style={{ marginTop: 10, color: "var(--spark)", display: "inline-block" }}
          >
            {t("kudos.composer.cta")}
          </div>
        </button>
      </div>

      {/* Leaderboard */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5"
        style={{
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
                {t("kudos.leaderboard.row", { recv: row.recv, given: row.given })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Wall */}
      <div
        className="grid gap-3 overflow-auto pr-1 stagger-in grid-cols-1 md:grid-cols-2"
        style={{ flex: 1, minHeight: 0, paddingBottom: 4 }}
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
                  {t(TAG_KEY[k.tag])}
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
                  {fmt(k.date, locale)}
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
                  {t("kudos.remove")}
                </button>
              </div>
            </div>
          );
        })}
        {wall.length === 0 && (
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("kudos.empty")}
          </span>
        )}
      </div>
    </div>
  );
}
