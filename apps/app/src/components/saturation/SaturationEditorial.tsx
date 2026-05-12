import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@pulse-hr/shared/i18n";
import { useEmployees } from "@/lib/tables/employees";
import { useAllocations } from "@/lib/tables/allocations";

const WEEK_LABELS = ["W18", "W19", "W20", "W21", "W22"];
const SCOPES = ["ENG_DESIGN", "ALL"] as const;
type Scope = (typeof SCOPES)[number];

function colorFor(v: number): { bg: string; text: string } {
  if (v === 0) return { bg: "transparent", text: "var(--muted-foreground)" };
  if (v >= 1.0)
    return { bg: "var(--spark)", text: "var(--spark-ink)" };
  if (v >= 0.85) return { bg: "var(--fg)", text: "var(--bg)" };
  return {
    bg: `color-mix(in oklch, var(--fg) ${Math.round(v * 100)}%, transparent)`,
    text: v >= 0.7 ? "var(--bg)" : "var(--fg)",
  };
}

export function SaturationEditorial() {
  const { t, locale } = useI18n();
  const employees = useEmployees();
  const allocations = useAllocations();
  const [scope, setScope] = useState<Scope>("ENG_DESIGN");

  const visibleEmployees = useMemo(() => {
    if (scope === "ALL") return employees.slice(0, 14);
    return employees
      .filter((e) =>
        ["Engineering", "Design", "Product"].includes(e.department),
      )
      .slice(0, 14);
  }, [employees, scope]);

  const matrix = useMemo(() => {
    return visibleEmployees.map((emp) => {
      const empAllocs = allocations.filter((a) => a.employeeId === emp.id);
      const baseSat = empAllocs.reduce((s, a) => s + a.percent, 0) / 100;
      // Vary per week with deterministic offset based on emp.id charcode
      const seed = emp.id
        .split("")
        .reduce((s, c) => s + c.charCodeAt(0), 0);
      const series = WEEK_LABELS.map((_, i) => {
        const wave = Math.sin((i + seed) * 0.7) * 0.15;
        const v = Math.max(0, Math.min(1.2, baseSat + wave));
        return Math.round(v * 100) / 100;
      });
      return { emp, series };
    });
  }, [visibleEmployees, allocations]);

  const overCount = matrix.filter((m) => m.series.some((v) => v > 1.0)).length;

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      {/* Hero */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {t("saturation.eyebrow", {
              from: WEEK_LABELS[0],
              to: WEEK_LABELS[WEEK_LABELS.length - 1],
            })}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(40px, 11vw, 116px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            {t("saturation.title.0")} <span style={{ fontStyle: "italic" }}>{t("saturation.title.1")}</span>
            <span style={{ color: "var(--spark)" }}>{t("saturation.title.2")}</span>
          </h1>
          <p
            style={{
              marginTop: 12,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 18,
            }}
          >
            {overCount > 0
              ? t("saturation.summary.over", {
                  n: overCount,
                  p:
                    locale === "it"
                      ? overCount === 1
                        ? "persona"
                        : "persone"
                      : overCount === 1
                        ? "person"
                        : "people",
                })
              : t("saturation.summary.ok")}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => setScope("ENG_DESIGN")}
            style={{
              background: scope === "ENG_DESIGN" ? "var(--ink)" : undefined,
              color: scope === "ENG_DESIGN" ? "var(--paper)" : undefined,
            }}
          >
            {t("saturation.scope.engDesign")}
          </button>
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => setScope("ALL")}
            style={{
              background: scope === "ALL" ? "var(--ink)" : undefined,
              color: scope === "ALL" ? "var(--paper)" : undefined,
            }}
          >
            {t("saturation.scope.all")}
          </button>
          <Link to="/projects" className="pill pill-dark pill-sm">
            {t("saturation.reassign")}
          </Link>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-4 items-center flex-wrap">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {t("saturation.legend")}:
        </span>
        {(
          [
            [t("saturation.legend.low"), "var(--bg-3)"],
            [t("saturation.legend.mid"), "var(--fg)"],
            [t("saturation.legend.over"), "var(--spark)"],
          ] as Array<[string, string]>
        ).map(([l, c]) => (
          <div key={l} className="flex items-center gap-2">
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 3,
                background: c,
                border: "1px solid var(--line)",
              }}
            />
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {l}
            </span>
          </div>
        ))}
      </div>

      {/* Heatmap (horizontal-scroll on narrow viewports) */}
      <div
        className="scrollbar-thin"
        style={{
          flex: 1,
          minHeight: 0,
          border: "1px solid var(--line)",
          borderRadius: 16,
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px repeat(5, minmax(72px, 1fr)) 96px",
            gridAutoRows: "minmax(56px, 1fr)",
            minWidth: 720,
          }}
        >
        <HeatmapHeader>{t("saturation.col.person")}</HeatmapHeader>
        {WEEK_LABELS.map((w) => (
          <HeatmapHeader key={w} center>
            {w}
          </HeatmapHeader>
        ))}
        <HeatmapHeader right>{t("people.kpi.median")}</HeatmapHeader>

        {matrix.map((row, i) => {
          const last = i === matrix.length - 1;
          const valid = row.series.filter((v) => v > 0);
          const avg = valid.length === 0 ? 0 : valid.reduce((a, b) => a + b, 0) / valid.length;
          const isOver = avg > 0.95;
          return (
            <RowFragment key={row.emp.id} last={last} initials={row.emp.initials} name={row.emp.name}>
              {row.series.map((v, j) => {
                const c = colorFor(v);
                return (
                  <div
                    key={j}
                    style={{
                      borderRight: "1px solid var(--line)",
                      borderBottom: last ? "none" : "1px solid var(--line)",
                      padding: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        background: c.bg,
                        borderRadius: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 36,
                      }}
                    >
                      <span
                        className="t-mono"
                        style={{
                          color: c.text,
                          fontSize: 11,
                        }}
                      >
                        {v === 0 ? "OFF" : `${Math.round(v * 100)}%`}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div
                style={{
                  padding: "12px 14px",
                  borderBottom: last ? "none" : "1px solid var(--line)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                }}
              >
                <span
                  className="t-num"
                  style={{
                    fontSize: 20,
                    letterSpacing: "-0.02em",
                    color: isOver ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {Math.round(avg * 100)}%
                </span>
              </div>
            </RowFragment>
          );
        })}
        </div>
      </div>
    </div>
  );
}

function HeatmapHeader({
  children,
  center,
  right,
}: {
  children: React.ReactNode;
  center?: boolean;
  right?: boolean;
}) {
  return (
    <div
      style={{
        padding: "16px 18px",
        borderRight: "1px solid var(--line)",
        borderBottom: "1px solid var(--line)",
        background: "var(--bg-2)",
        textAlign: center ? "center" : right ? "right" : "left",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {children}
      </span>
    </div>
  );
}

function RowFragment({
  initials,
  name,
  last,
  children,
}: {
  initials: string;
  name: string;
  last: boolean;
  children: React.ReactNode;
}) {
  return (
    <>
      <div
        style={{
          padding: "12px 18px",
          borderRight: "1px solid var(--line)",
          borderBottom: last ? "none" : "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span className="ph-avatar ph-avatar-sm">{initials}</span>
        <span
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 17,
            letterSpacing: "-0.005em",
          }}
        >
          {name}
        </span>
      </div>
      {children}
    </>
  );
}
