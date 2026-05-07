import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { offices, type Office } from "@/lib/offices";
import { useEmployees } from "@/lib/tables/employees";

export function OfficesEditorial() {
  const employees = useEmployees();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const byCity = new Map<string, number>();
    for (const e of employees) {
      const city = e.location.split(",")[0].trim();
      byCity.set(city, (byCity.get(city) ?? 0) + 1);
    }
    const rows = offices.map((o) => {
      const peopleCount = byCity.get(o.city) ?? 0;
      return { office: o, peopleCount };
    });
    const top = rows.sort((a, b) => b.peopleCount - a.peopleCount)[0];
    const countries = new Set(rows.map((r) => r.office.country));
    return { rows, topId: top?.office.id, countries: Array.from(countries) };
  }, [employees]);

  const italyCount = stats.rows.filter((r) => r.office.country === "Italy").length;
  const otherCount = stats.rows.length - italyCount;

  return (
    <div
      className="ph p-4 md:p-6 grid gap-11 min-h-[calc(100vh-3.5rem)]"
      style={{ gridTemplateColumns: "1fr 1.2fr" }}
    >
      <section className="flex flex-col justify-between gap-8">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SEDI · {stats.rows.length} UFFICI · {employees.length} PERSONE
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(80px, 11vw, 132px)",
              letterSpacing: "-0.05em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Sedi</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              maxWidth: 460,
              marginTop: 22,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 22,
              lineHeight: 1.35,
            }}
          >
            {stats.rows.length} stanz{stats.rows.length === 1 ? "a" : "e"} in{" "}
            {stats.countries.length} {stats.countries.length === 1 ? "paese" : "paesi"}.
          </p>
        </div>
        <div
          className="grid pt-6"
          style={{ gridTemplateColumns: "1fr 1fr 1fr", borderTop: "1px solid var(--line-strong)" }}
        >
          <Stat label="ITALIA" value={String(italyCount)} first />
          <Stat label="ALTRO" value={String(otherCount)} />
          <Stat label="TZ COVERAGE" value="9h" />
        </div>
      </section>

      <section className="flex flex-col gap-3.5 min-h-0 overflow-auto pr-1 pb-1">
        {stats.rows.map((r) => {
          const isTop = r.office.id === stats.topId;
          return (
            <button
              key={r.office.id}
              type="button"
              onClick={() => navigate({ to: "/offices/$officeId", params: { officeId: r.office.id } })}
              className="grid items-stretch text-left"
              style={{
                gridTemplateColumns: "120px 1fr auto",
                gap: 18,
                border: `1px solid ${isTop ? "var(--spark)" : "var(--line)"}`,
                borderRadius: 16,
                padding: 12,
                background: isTop
                  ? "color-mix(in oklch, var(--spark) 6%, transparent)"
                  : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                className="placeholder-img"
                style={{ width: 120, height: 110, borderRadius: 10 }}
              >
                <span className="cap t-mono-sm">{r.office.city.toUpperCase()}</span>
              </div>
              <div className="flex flex-col justify-between py-1.5 min-w-0">
                <div>
                  <span
                    className="t-mono"
                    style={{ color: isTop ? "var(--spark)" : "var(--muted-foreground)" }}
                  >
                    {r.office.city.toUpperCase()} · {r.office.country.toUpperCase()}
                  </span>
                  <div
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontWeight: 400,
                      fontSize: 28,
                      letterSpacing: "-0.025em",
                      lineHeight: 1,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontStyle: "italic" }}>{officeRole(r.office)}</span>
                  </div>
                </div>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {r.office.address}
                </span>
              </div>
              <div className="flex flex-col justify-between items-end px-3 py-1.5">
                <span
                  className="t-num"
                  style={{
                    fontSize: 32,
                    letterSpacing: "-0.03em",
                    color: isTop ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {r.peopleCount > 0 ? r.peopleCount : r.office.seatCapacity}
                </span>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  PERSONE
                </span>
              </div>
            </button>
          );
        })}
        {stats.rows.length === 0 && (
          <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
            <span className="t-mono">NESSUNA SEDE</span>
          </div>
        )}
      </section>
    </div>
  );
}

function officeRole(o: Office): string {
  // Heuristic from name. Falls back to "Sede".
  const name = o.name.toLowerCase();
  if (name.includes("hq") || name.includes("milan")) return "Sede principale";
  if (name.includes("eng")) return "Engineering hub";
  if (name.includes("sales")) return "Sales & client";
  if (name.includes("ops")) return "Operations";
  return "Sede";
}

function Stat({ label, value, first }: { label: string; value: string; first?: boolean }) {
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
      <div className="t-num mt-1" style={{ fontSize: 32, letterSpacing: "-0.03em" }}>
        {value}
      </div>
    </div>
  );
}
