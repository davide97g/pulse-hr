import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useEmployees } from "@/lib/tables/employees";
import { type Employee } from "@/lib/mock-data";

const NOW = new Date();

function monthsBetween(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

function tenureYears(joinDate: string): number {
  const days = (NOW.getTime() - new Date(joinDate).getTime()) / 86_400_000;
  return Math.max(0, days / 365.25);
}

function ageFromBirthday(birthday?: string): number | null {
  if (!birthday) return null;
  // birthday is "MM-DD"; we have no year — derive a stable pseudo-age
  // from the month/day so the histogram is deterministic without real data.
  const [m, d] = birthday.split("-").map(Number);
  if (!m || !d) return null;
  return 22 + ((m * 31 + d) % 35);
}

function headcountOver12Months(employees: Employee[]): number[] {
  const series: number[] = [];
  for (let i = 11; i >= 0; i--) {
    const ref = new Date(NOW.getFullYear(), NOW.getMonth() - i + 1, 0);
    const count = employees.filter((e) => {
      const joined = new Date(e.joinDate);
      if (joined > ref) return false;
      if (e.status === "offboarding" && i < 3) return false;
      return true;
    }).length;
    series.push(count);
  }
  return series;
}

interface DonutSeg {
  name: string;
  n: number;
  color: string;
  dash: string;
  off: number;
}

function buildDonut(employees: Employee[]): { segs: DonutSeg[]; total: number; rows: Array<[string, number, string]> } {
  const counts = new Map<string, number>();
  for (const e of employees) counts.set(e.department, (counts.get(e.department) ?? 0) + 1);
  const palette = ["var(--spark)", "var(--fg)", "var(--fg-2)", "var(--muted)", "var(--ink-3)", "var(--paper-3)"];
  const rows: Array<[string, number, string]> = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name, n], i) => [name, n, palette[i % palette.length]]);
  const total = rows.reduce((acc, r) => acc + r[1], 0);
  const ringR = 68;
  const ringC = 2 * Math.PI * ringR;
  let acc = 0;
  const segs: DonutSeg[] = rows.map((r) => {
    const len = (r[1] / total) * ringC;
    const seg = { name: r[0], n: r[1], color: r[2], dash: `${len} ${ringC}`, off: -acc };
    acc += len;
    return seg;
  });
  return { segs, total, rows };
}

function tenureBuckets(employees: Employee[]): Array<[string, number]> {
  const buckets: Array<[string, number]> = [
    ["< 1a", 0],
    ["1–2a", 0],
    ["2–3a", 0],
    ["3–5a", 0],
    ["5a +", 0],
  ];
  for (const e of employees) {
    const t = tenureYears(e.joinDate);
    if (t < 1) buckets[0][1]++;
    else if (t < 2) buckets[1][1]++;
    else if (t < 3) buckets[2][1]++;
    else if (t < 5) buckets[3][1]++;
    else buckets[4][1]++;
  }
  return buckets;
}

function ageBuckets(employees: Employee[]): Array<[string, number]> {
  const buckets: Array<[string, number]> = [
    ["20s", 0],
    ["30s", 0],
    ["40s", 0],
    ["50+", 0],
  ];
  for (const e of employees) {
    const age = ageFromBirthday(e.birthday);
    if (age == null) {
      buckets[1][1]++;
      continue;
    }
    if (age < 30) buckets[0][1]++;
    else if (age < 40) buckets[1][1]++;
    else if (age < 50) buckets[2][1]++;
    else buckets[3][1]++;
  }
  return buckets;
}

function locationCounts(employees: Employee[]): Array<[string, number, number]> {
  const counts = new Map<string, number>();
  for (const e of employees) counts.set(e.location, (counts.get(e.location) ?? 0) + 1);
  const total = employees.length || 1;
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([loc, n]) => [loc, n, Math.round((n / total) * 100)]);
}

function recentJoins(employees: Employee[]): Employee[] {
  return [...employees]
    .sort((a, b) => new Date(b.joinDate).getTime() - new Date(a.joinDate).getTime())
    .slice(0, 3);
}

export function EmployeesDashboard() {
  const employees = useEmployees();
  const navigate = useNavigate();

  const data = useMemo(() => {
    const headcount = headcountOver12Months(employees);
    const minHC = Math.min(...headcount, ...[0]);
    const maxHC = Math.max(...headcount) + 2;
    const donut = buildDonut(employees);
    const tenure = tenureBuckets(employees);
    const tenureMax = Math.max(1, ...tenure.map((t) => t[1]));
    const tenurePeak = tenure.reduce((p, t, i) => (t[1] > tenure[p][1] ? i : p), 0);
    const ages = ageBuckets(employees);
    const ageMax = Math.max(1, ages.reduce((acc, g) => acc + g[1], 0));
    const ageDominant = ages.reduce((p, g, i) => (g[1] > ages[p][1] ? i : p), 0);
    const locs = locationCounts(employees);
    const recents = recentJoins(employees);
    const onboardCount = employees.filter(
      (e) => e.status === "active" && new Date(e.joinDate) > new Date(Date.now() - 90 * 86_400_000),
    ).length;
    const leaveCount = employees.filter((e) => e.status === "on_leave").length;
    const avgTenure =
      employees.length === 0
        ? 0
        : employees.reduce((s, e) => s + tenureYears(e.joinDate), 0) / employees.length;
    const headDelta = headcount[11] - headcount[0];
    const headDeltaPct = headcount[0] === 0 ? 0 : (headDelta / headcount[0]) * 100;
    return {
      headcount,
      minHC,
      maxHC,
      donut,
      tenure,
      tenureMax,
      tenurePeak,
      ages,
      ageMax,
      ageDominant,
      locs,
      recents,
      onboardCount,
      leaveCount,
      avgTenure,
      headDelta,
      headDeltaPct,
    };
  }, [employees]);

  const months = ["G", "F", "M", "A", "M", "G", "L", "A", "S", "O", "N", "D"];
  // Rotate so series ends on current month
  const rotatedMonths = useMemo(() => {
    const m = NOW.getMonth(); // 0-11
    const ordered: string[] = [];
    for (let i = 0; i < 12; i++) ordered.push(months[(m - 11 + i + 12) % 12]);
    return ordered;
  }, []);

  const kpis: Array<[string, string, string, "spark" | undefined]> = [
    [
      "HEADCOUNT",
      String(employees.length),
      `${data.headDelta >= 0 ? "+" : ""}${data.headDelta} 12m`,
      "spark",
    ],
    ["ONBOARDING", String(data.onboardCount), "ultimi 90 gg", undefined],
    ["IN LEAVE", String(data.leaveCount), "oggi", undefined],
    ["AVG TENURE", `${data.avgTenure.toFixed(1)} a`, "media", undefined],
  ];

  const chartW = 600;
  const chartH = 180;

  return (
    <div className="p-4 md:p-6 flex flex-col gap-4 min-h-[calc(100vh-3.5rem)]">
      {/* HEADER */}
      <div className="grid items-end gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            EMPLOYEES · {NOW.toLocaleDateString("it-IT", { month: "long", year: "numeric" }).toUpperCase()} ·{" "}
            {employees.length} ATTIVE · {data.onboardCount} ONBOARDING · {data.leaveCount} LEAVE
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(56px, 7vw, 92px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Employees</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span
            className="t-mono"
            style={{
              color: "var(--muted-foreground)",
              border: "1px solid var(--line)",
              padding: "8px 14px",
              borderRadius: 999,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            ⌘K · CERCA PERSONA
          </span>
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => navigate({ to: "/people/new" })}
          >
            + Nuovo
          </button>
        </div>
      </div>

      {/* KPI BAND */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
        {kpis.map((c, i) => (
          <div
            key={i}
            style={{
              border: `1px solid ${c[3] === "spark" ? "var(--spark)" : "var(--line)"}`,
              borderRadius: 14,
              padding: "16px 18px",
              background:
                c[3] === "spark" ? "color-mix(in oklch, var(--spark) 8%, transparent)" : "transparent",
              display: "flex",
              flexDirection: "column",
              gap: 6,
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {c[0]}
            </span>
            <div className="t-num" style={{ fontSize: 44, letterSpacing: "-0.04em", lineHeight: 0.95 }}>
              {c[1]}
            </div>
            <span className="t-mono" style={{ color: "var(--fg-2)" }}>
              {c[2]}
            </span>
          </div>
        ))}
      </div>

      {/* CHART GRID */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "1.4fr 1fr 1fr", minHeight: 280 }}>
        {/* HEADCOUNT 12M */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "18px 20px 14px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 0,
            background: "var(--bg)",
          }}
        >
          <div className="flex items-baseline justify-between">
            <div>
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                HEADCOUNT · 12 MESI
              </span>
              <div
                style={{
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 22,
                  marginTop: 2,
                }}
              >
                Da {data.headcount[0]} a{" "}
                <span
                  style={{
                    color: "var(--spark)",
                    fontStyle: "normal",
                    fontFamily: "JetBrains Mono, ui-monospace, monospace",
                    fontSize: 18,
                  }}
                >
                  {data.headcount[11]}
                </span>
              </div>
            </div>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {data.headDelta >= 0 ? "+" : ""}
              {data.headDelta} · {data.headDeltaPct >= 0 ? "+" : ""}
              {data.headDeltaPct.toFixed(1)}%
            </span>
          </div>
          <svg
            viewBox={`0 0 ${chartW} ${chartH + 20}`}
            preserveAspectRatio="none"
            style={{ width: "100%", flex: 1, minHeight: 120 }}
          >
            {[0, 0.25, 0.5, 0.75, 1].map((g, i) => (
              <line
                key={i}
                x1="0"
                x2={chartW}
                y1={20 + g * (chartH - 20)}
                y2={20 + g * (chartH - 20)}
                stroke="var(--line)"
                strokeDasharray="2 4"
              />
            ))}
            <path
              d={
                "M 0 " +
                (20 +
                  (chartH - 20) *
                    (1 - (data.headcount[0] - data.minHC) / Math.max(1, data.maxHC - data.minHC))) +
                " " +
                data.headcount
                  .map((h, i) => {
                    const x = (i / (data.headcount.length - 1)) * chartW;
                    const y =
                      20 +
                      (chartH - 20) *
                        (1 - (h - data.minHC) / Math.max(1, data.maxHC - data.minHC));
                    return `L ${x} ${y}`;
                  })
                  .join(" ") +
                ` L ${chartW} ${chartH} L 0 ${chartH} Z`
              }
              fill="color-mix(in oklch, var(--spark) 22%, transparent)"
            />
            <path
              d={
                "M 0 " +
                (20 +
                  (chartH - 20) *
                    (1 - (data.headcount[0] - data.minHC) / Math.max(1, data.maxHC - data.minHC))) +
                " " +
                data.headcount
                  .map((h, i) => {
                    const x = (i / (data.headcount.length - 1)) * chartW;
                    const y =
                      20 +
                      (chartH - 20) *
                        (1 - (h - data.minHC) / Math.max(1, data.maxHC - data.minHC));
                    return `L ${x} ${y}`;
                  })
                  .join(" ")
              }
              fill="none"
              stroke="var(--spark)"
              strokeWidth="2.5"
            />
            {data.headcount.map((h, i) => {
              const x = (i / (data.headcount.length - 1)) * chartW;
              const y =
                20 +
                (chartH - 20) *
                  (1 - (h - data.minHC) / Math.max(1, data.maxHC - data.minHC));
              const last = i === data.headcount.length - 1;
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r={last ? 6 : 2.5} fill={last ? "var(--spark)" : "var(--fg)"} />
                  {last && (
                    <text
                      x={x - 8}
                      y={y - 12}
                      textAnchor="end"
                      fontFamily="JetBrains Mono, ui-monospace, monospace"
                      fontSize="13"
                      fill="var(--fg)"
                    >
                      {h}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="flex justify-between">
            {rotatedMonths.map((m, i) => (
              <span key={i} className="t-mono" style={{ color: "var(--muted-foreground)", fontSize: 9 }}>
                {m}
              </span>
            ))}
          </div>
        </section>

        {/* DEPARTMENT DONUT */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            PER DIPARTIMENTO
          </span>
          <div className="flex items-center gap-4 flex-1">
            <svg viewBox="-90 -90 180 180" style={{ width: 150, height: 150 }}>
              <circle r={68} fill="none" stroke="var(--line)" strokeWidth="14" />
              {data.donut.segs.map((s, i) => (
                <circle
                  key={i}
                  r={68}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="14"
                  strokeDasharray={s.dash}
                  strokeDashoffset={s.off}
                  transform="rotate(-90)"
                />
              ))}
              <text
                textAnchor="middle"
                y="-4"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize="11"
                fill="var(--muted-foreground)"
              >
                TOTAL
              </text>
              <text
                textAnchor="middle"
                y="18"
                fontFamily="JetBrains Mono, ui-monospace, monospace"
                fontSize="26"
                fill="var(--fg)"
              >
                {data.donut.total}
              </text>
            </svg>
            <div className="flex-1 flex flex-col gap-1.5">
              {data.donut.rows.map((d, i) => (
                <div
                  key={i}
                  className="grid items-center gap-2"
                  style={{ gridTemplateColumns: "10px 1fr auto" }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: 2, background: d[2] }} />
                  <span className="t-mono" style={{ fontSize: 10 }}>
                    {d[0]}
                  </span>
                  <span className="t-num" style={{ fontSize: 13 }}>
                    {d[1]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* TENURE HISTOGRAM */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 16,
            padding: "18px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ANZIANITÀ · DISTRIBUZIONE
          </span>
          <div className="flex items-end gap-2 pb-1" style={{ flex: 1, minHeight: 80 }}>
            {data.tenure.map((t, i) => {
              const h = (t[1] / data.tenureMax) * 100;
              const peak = i === data.tenurePeak;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1.5"
                  style={{ flex: 1 }}
                >
                  <span
                    className="t-num"
                    style={{ fontSize: 12, color: peak ? "var(--spark)" : "var(--fg)" }}
                  >
                    {t[1]}
                  </span>
                  <div
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      minHeight: 4,
                      background: peak ? "var(--spark)" : "var(--fg)",
                      borderRadius: "3px 3px 0 0",
                    }}
                  />
                </div>
              );
            })}
          </div>
          <div className="flex gap-2 pt-2" style={{ borderTop: "1px solid var(--line)" }}>
            {data.tenure.map((t, i) => (
              <span
                key={i}
                className="t-mono"
                style={{
                  flex: 1,
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                  fontSize: 9,
                }}
              >
                {t[0]}
              </span>
            ))}
          </div>
        </section>
      </div>

      {/* BOTTOM STRIP */}
      <div
        className="grid gap-3"
        style={{ gridTemplateColumns: "1.2fr 1fr 1.2fr", minHeight: 130 }}
      >
        {/* AGE */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--bg)",
          }}
        >
          <div className="flex justify-between">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              FASCE D'ETÀ
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {employees.length} TOT
            </span>
          </div>
          <div
            className="flex"
            style={{
              height: 22,
              borderRadius: 4,
              overflow: "hidden",
              border: "1px solid var(--line)",
            }}
          >
            {data.ages.map((g, i) => {
              const w = (g[1] / data.ageMax) * 100;
              const colors = ["var(--paper-3)", "var(--spark)", "var(--fg-2)", "var(--ink-3)"];
              return <div key={i} style={{ width: `${w}%`, background: colors[i] }} />;
            })}
          </div>
          <div className="flex gap-3.5">
            {data.ages.map((g, i) => (
              <div key={i} className="flex flex-col">
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", fontSize: 9 }}
                >
                  {g[0]}
                </span>
                <span
                  className="t-num"
                  style={{
                    fontSize: 16,
                    color: i === data.ageDominant ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {g[1]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* LOCATIONS */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--bg)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            LOCATION · {data.locs.length} SEDI
          </span>
          <div className="flex flex-col gap-1.5" style={{ flex: 1 }}>
            {data.locs.map((l, i) => (
              <div
                key={i}
                className="grid items-center gap-2"
                style={{ gridTemplateColumns: "70px 1fr 36px" }}
              >
                <span
                  className="t-mono"
                  style={{ fontSize: 10, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={l[0] as string}
                >
                  {l[0]}
                </span>
                <div style={{ height: 6, background: "var(--line)", borderRadius: 999 }}>
                  <div
                    style={{
                      width: `${l[2]}%`,
                      height: "100%",
                      background: i === 0 ? "var(--spark)" : "var(--fg)",
                      borderRadius: 999,
                    }}
                  />
                </div>
                <span className="t-num" style={{ fontSize: 12, textAlign: "right" }}>
                  {l[1]}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* RECENT */}
        <section
          style={{
            border: "1px solid var(--line)",
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            background: "var(--bg)",
          }}
        >
          <div className="flex justify-between">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ULTIMI INGRESSI
            </span>
            <span className="t-mono" style={{ color: "var(--spark)" }}>
              +{data.recents.length}
            </span>
          </div>
          <div className="flex flex-col gap-1 overflow-hidden" style={{ flex: 1 }}>
            {data.recents.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => navigate({ to: "/people/$employeeId", params: { employeeId: r.id } })}
                className="grid items-center gap-2 text-left"
                style={{
                  gridTemplateColumns: "20px 1fr 70px 50px",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <span className="ph-avatar ph-avatar-xs">{r.initials}</span>
                <span
                  style={{ fontFamily: "Fraunces, ui-serif, serif", fontStyle: "italic", fontSize: 15 }}
                >
                  {r.name}
                </span>
                <span
                  className="t-mono"
                  style={{
                    color:
                      r.status === "on_leave" || r.status === "offboarding"
                        ? "var(--muted-foreground)"
                        : "var(--fg-2)",
                  }}
                >
                  {r.status.toUpperCase().replace("_", " ")}
                </span>
                <span
                  className="t-mono"
                  style={{ color: "var(--muted-foreground)", textAlign: "right" }}
                >
                  {new Date(r.joinDate).toLocaleDateString("it-IT", { day: "2-digit", month: "short" })}
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
