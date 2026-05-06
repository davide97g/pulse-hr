import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { EditorialPage } from "@/components/app/layouts/EditorialPage";
import { EditorialPill } from "@pulse-hr/ui/atoms/EditorialPill";
import { Eyebrow } from "@pulse-hr/ui/atoms/Eyebrow";
import { AvatarDisplay } from "@pulse-hr/ui/atoms/AvatarDisplay";
import { TimesheetAutofillDialog } from "@/components/app/TimesheetAutofillDialog";
import { useEmployees } from "@/lib/tables/employees";
import { useTimesheetEntries } from "@/lib/tables/timesheetEntries";
import { commesse } from "@/lib/mock-data";

export const Route = createFileRoute("/time")({
  head: () => ({ meta: [{ title: "Time & attendance — Pulse HR" }] }),
  component: TimePage,
});

const WEEKDAY_HEAD = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];
const WEEKDAY_FULL = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
const MONTHS_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
const MONTHS_IT_UPPER = MONTHS_IT.map((m) => m.toUpperCase());

const HOLIDAYS_IT_2026: Record<string, string> = {
  "2026-01-01": "Capodanno",
  "2026-01-06": "Epifania",
  "2026-04-06": "Pasquetta",
  "2026-04-25": "Liberazione",
  "2026-05-01": "Festa del Lavoro",
  "2026-06-02": "Repubblica",
  "2026-08-15": "Ferragosto",
  "2026-11-01": "Ognissanti",
  "2026-12-08": "Immacolata",
  "2026-12-25": "Natale",
  "2026-12-26": "S. Stefano",
};

type DayRecord = {
  date: string;
  day: number;
  weekday: number;
  isWeekend: boolean;
  target: number;
  logged: number;
  leave: "leave" | "holiday" | null;
  label: string | null;
  breakdown: { commessaId: string; code: string; name: string; hours: number }[];
};

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fmtHours(h: number): string {
  if (!h) return "—";
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

type Tab = "calendar" | "mine" | "commessa" | "team";

function TimePage() {
  const employees = useEmployees();
  const entries = useTimesheetEntries();

  const [employeeId, setEmployeeId] = useState(() => employees[0]?.id ?? "");
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [tab, setTab] = useState<Tab>("calendar");
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [autofillOpen, setAutofillOpen] = useState(false);

  const employee = useMemo(
    () => employees.find((e) => e.id === employeeId) ?? employees[0],
    [employeeId, employees],
  );

  const monthDays = useMemo<DayRecord[]>(() => {
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate();
    const records: DayRecord[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(cursor.year, cursor.month, d);
      const weekday = date.getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      const dateStr = ymd(date);
      const dayEntries = entries.filter(
        (e) => e.employeeId === employeeId && e.date === dateStr,
      );
      const logged = dayEntries.reduce((s, e) => s + e.hours, 0);
      const breakdown = dayEntries.map((e) => {
        const c = commesse.find((c) => c.id === e.commessaId);
        return {
          commessaId: e.commessaId,
          code: c?.code ?? e.commessaId,
          name: c?.name ?? "—",
          hours: e.hours,
        };
      });
      const holiday = HOLIDAYS_IT_2026[dateStr];
      const leave = holiday ? ("holiday" as const) : null;
      records.push({
        date: dateStr,
        day: d,
        weekday,
        isWeekend,
        target: holiday || isWeekend ? 0 : 8,
        logged,
        leave,
        label: holiday ?? null,
        breakdown,
      });
    }
    return records;
  }, [cursor, entries, employeeId]);

  const today = useMemo(() => {
    const now = new Date();
    if (now.getFullYear() !== cursor.year || now.getMonth() !== cursor.month) return -1;
    return now.getDate();
  }, [cursor]);

  const workdays = monthDays.filter((d) => d.target > 0).length;
  const filled = monthDays.filter((d) => d.target > 0 && d.logged >= d.target).length;
  const totalLogged = monthDays.reduce((s, d) => s + d.logged, 0);
  const totalTarget = workdays * 8;
  const missingDays = monthDays
    .filter((d) => d.target > 0 && d.logged < d.target && (today < 0 || d.day <= today))
    .map((d) => d.day);
  const leaveDays = monthDays.filter((d) => d.leave === "leave").length;
  const holidayDays = monthDays.filter((d) => d.leave === "holiday").length;
  const fillPct = workdays ? Math.round((filled / workdays) * 100) : 0;

  const firstWeekday = new Date(cursor.year, cursor.month, 1).getDay();
  const cells: (DayRecord | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  monthDays.forEach((d) => cells.push(d));
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = MONTHS_IT_UPPER[cursor.month];
  const monthLower = MONTHS_IT[cursor.month];

  const goPrev = () =>
    setCursor((c) => {
      const m = c.month === 0 ? 11 : c.month - 1;
      const y = c.month === 0 ? c.year - 1 : c.year;
      return { year: y, month: m };
    });
  const goNext = () =>
    setCursor((c) => {
      const m = c.month === 11 ? 0 : c.month + 1;
      const y = c.month === 11 ? c.year + 1 : c.year;
      return { year: y, month: m };
    });

  const jumpToFirstMissing = () => {
    if (missingDays.length > 0) setOpenDay(missingDays[0]);
  };

  const totalsByCommessa = useMemo(() => {
    const map = new Map<string, { code: string; name: string; hours: number }>();
    for (const d of monthDays) {
      for (const b of d.breakdown) {
        const cur = map.get(b.commessaId);
        if (cur) cur.hours += b.hours;
        else map.set(b.commessaId, { code: b.code, name: b.name, hours: b.hours });
      }
    }
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [monthDays]);

  return (
    <EditorialPage
      eyebrow={
        <Eyebrow
          tag={
            missingDays.length > 0 ? (
              <span className="tag-attention">⚠ {missingDays.length} GIORNI MANCANTI</span>
            ) : (
              <span className="tag-spark">
                <span className="dot" style={{ background: "var(--spark-ink)", boxShadow: "none" }} />
                ALLINEATO
              </span>
            )
          }
          note={`· ${employee?.name ?? "—"}`}
        >
          TIME &amp; ATTENDANCE · CALENDARIO · {monthLabel} {cursor.year}
        </Eyebrow>
      }
      actions={
        <>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            className="pill pill-ghost pill-sm"
            style={{ paddingRight: 28 }}
          >
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
          <EditorialPill kind="ghost" size="sm" onClick={goPrev}>
            ←
          </EditorialPill>
          <EditorialPill kind="ghost" size="sm" onClick={goNext}>
            →
          </EditorialPill>
          <EditorialPill kind="ghost" size="sm" onClick={() => setAutofillOpen(true)}>
            ⚡ Auto-fill
          </EditorialPill>
          <EditorialPill kind="spark" size="sm" arrow onClick={() => setOpenDay(today > 0 ? today : 1)}>
            + Voce
          </EditorialPill>
        </>
      }
      title={
        <>
          Presenze
          <span style={{ fontStyle: "italic" }}>, ora</span>
          <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
        </>
      }
      italic={false}
      summary={
        <>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            SOMMARIO · {monthLabel} {cursor.year}
          </span>
          <p className="t-body-lg" style={{ marginTop: 8, color: "var(--fg-2)" }}>
            <strong style={{ fontWeight: 600 }}>{totalLogged.toFixed(0)}h</strong> registrate su{" "}
            <strong style={{ fontWeight: 600 }}>{totalTarget}h</strong> attese.
            {missingDays.length > 0 && (
              <>
                {" "}
                <span className="spark-mark" style={{ fontWeight: 600 }}>
                  {missingDays.length} giorni da riempire
                </span>
              </>
            )}
            .
          </p>
        </>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1" style={{ borderBottom: "1px solid var(--line)" }}>
        {(
          [
            ["calendar", "Calendar"],
            ["mine", "My timesheet"],
            ["commessa", "By commessa"],
            ["team", "Team presence"],
          ] as [Tab, string][]
        ).map(([k, l]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className="press-scale"
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              padding: "10px 14px",
              marginBottom: -1,
              borderBottom: `2px solid ${tab === k ? "var(--spark)" : "transparent"}`,
              fontFamily: "Geist, ui-sans-serif, sans-serif",
              fontSize: 13,
              fontWeight: tab === k ? 600 : 400,
              letterSpacing: "-0.01em",
              color: tab === k ? "var(--fg)" : "var(--muted-foreground)",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* KPI strip */}
      <div className="solid-card flex" style={{ borderRadius: 14 }}>
        <Kpi
          label="LOGGED / TARGET"
          big={
            <>
              <span>{totalLogged.toFixed(0)}</span>
              <span style={{ color: "var(--muted-foreground)" }}> / {totalTarget}h</span>
            </>
          }
          sub={`${totalTarget}h ATTESI · ${totalTarget - totalLogged > 0 ? "−" : "+"}${Math.abs(totalTarget - totalLogged).toFixed(0)}h`}
        />
        <Kpi
          label="FILL %"
          big={`${fillPct}%`}
          sub={`${filled}/${workdays} GIORNI COMPLETI`}
          accent={fillPct >= 80 ? "var(--spark)" : "var(--fg)"}
        />
        <Kpi
          label="MISSING"
          big={
            <>
              <span>{missingDays.length}</span>
              {missingDays.length > 0 && (
                <span style={{ color: "var(--spark)", fontSize: 24, marginLeft: 8 }}>●</span>
              )}
            </>
          }
          sub={missingDays.length > 0 ? "VAI AL PRIMO →" : "TUTTO IN REGOLA"}
          action={missingDays.length > 0 ? jumpToFirstMissing : undefined}
        />
        <Kpi
          last
          label="LEAVE + HOLIDAYS"
          big={`${leaveDays + holidayDays}`}
          sub={`${leaveDays} FERIE · ${holidayDays} FESTIVI`}
        />
      </div>

      {tab === "calendar" && (
        <CalendarGrid cells={cells} weeks={cells.length / 7} today={today} onPickDay={setOpenDay} />
      )}
      {tab === "mine" && <MineTable monthDays={monthDays} today={today} />}
      {tab === "commessa" && <ByCommessa totals={totalsByCommessa} month={monthLabel} />}
      {tab === "team" && <TeamPresence employees={employees} entries={entries} cursor={cursor} />}

      {tab === "calendar" && missingDays.length > 0 && (
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{
            border: "1px solid var(--line-strong)",
            borderLeft: "3px solid var(--spark)",
            borderRadius: 10,
            background: "var(--bg-2)",
          }}
        >
          <span className="t-mono" style={{ color: "var(--spark)" }}>
            !
          </span>
          <span className="text-sm">
            Hai <b>{missingDays.length} giorni mancanti</b> questo mese.
          </span>
          <span style={{ flex: 1 }} />
          <div className="flex gap-1.5 flex-wrap">
            {missingDays.slice(0, 4).map((d) => (
              <button
                key={d}
                onClick={() => setOpenDay(d)}
                className="t-mono"
                style={{
                  padding: "5px 10px",
                  borderRadius: 999,
                  border: "1px solid var(--line-strong)",
                  background: "transparent",
                  color: "var(--fg)",
                  cursor: "pointer",
                }}
              >
                {monthLabel.slice(0, 3)} {d}
              </button>
            ))}
            {missingDays.length > 4 && (
              <span className="t-mono self-center" style={{ color: "var(--muted-foreground)" }}>
                +{missingDays.length - 4}
              </span>
            )}
          </div>
          <EditorialPill
            kind="spark"
            size="sm"
            onClick={() => {
              setAutofillOpen(true);
              toast.success("Auto-fill avviato", { description: "Compilazione in corso." });
            }}
          >
            ⚡ Riempi tutto
          </EditorialPill>
        </div>
      )}

      {openDay != null && (
        <DayDrawer
          rec={monthDays.find((d) => d.day === openDay)!}
          monthLower={monthLower}
          onClose={() => setOpenDay(null)}
        />
      )}

      <TimesheetAutofillDialog open={autofillOpen} onOpenChange={setAutofillOpen} />
    </EditorialPage>
  );
}

function Kpi({
  label,
  big,
  sub,
  accent,
  action,
  last,
}: {
  label: string;
  big: React.ReactNode;
  sub: string;
  accent?: string;
  action?: () => void;
  last?: boolean;
}) {
  return (
    <div
      className="flex flex-col gap-1.5"
      style={{
        flex: 1,
        padding: "16px 20px",
        borderRight: last ? "none" : "1px solid var(--line)",
      }}
    >
      <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
        {label}
      </span>
      <span
        className="t-num"
        style={{
          fontSize: 36,
          letterSpacing: "-0.04em",
          lineHeight: 1,
          color: accent ?? "var(--fg)",
        }}
      >
        {big}
      </span>
      <span
        className="t-mono"
        style={{
          color: action ? "var(--spark)" : "var(--muted-foreground)",
          cursor: action ? "pointer" : "default",
        }}
        onClick={action}
      >
        {sub}
      </span>
    </div>
  );
}

function CalendarGrid({
  cells,
  weeks,
  today,
  onPickDay,
}: {
  cells: (DayRecord | null)[];
  weeks: number;
  today: number;
  onPickDay: (d: number) => void;
}) {
  return (
    <div
      className="solid-card overflow-hidden flex flex-col"
      style={{ borderRadius: 14, minHeight: 480 }}
    >
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          background: "var(--bg-2)",
          borderBottom: "1px solid var(--line-strong)",
        }}
      >
        {WEEKDAY_HEAD.map((d, i) => (
          <div
            key={i}
            style={{
              padding: "10px 14px",
              borderRight: i < 6 ? "1px solid var(--line)" : "none",
            }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {d}
            </span>
          </div>
        ))}
      </div>
      <div
        className="flex-1 grid"
        style={{
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${weeks}, minmax(96px, 1fr))`,
        }}
      >
        {cells.map((d, i) => (
          <DayCell key={i} d={d} idx={i} today={today} onPickDay={onPickDay} />
        ))}
      </div>
    </div>
  );
}

function DayCell({
  d,
  idx,
  today,
  onPickDay,
}: {
  d: DayRecord | null;
  idx: number;
  today: number;
  onPickDay: (day: number) => void;
}) {
  const wd = idx % 7;
  if (!d) {
    return (
      <div
        style={{
          borderRight: wd < 6 ? "1px solid var(--line)" : "none",
          borderBottom: "1px solid var(--line)",
          background: "var(--bg-2)",
          opacity: 0.4,
        }}
      />
    );
  }
  const missing = d.target > 0 && d.logged < d.target && (today < 0 || d.day <= today);
  const complete = d.target > 0 && d.logged >= d.target;
  const isLeave = d.leave === "leave" || d.leave === "holiday";
  const isToday = d.day === today;

  let stripe = "transparent";
  if (complete) stripe = "var(--spark)";
  else if (missing) stripe = "color-mix(in oklch, var(--fg) 35%, transparent)";

  let bg = "var(--bg)";
  if (d.isWeekend) bg = "var(--bg-2)";
  if (isLeave) bg = "var(--bg-3)";

  return (
    <button
      onClick={() => onPickDay(d.day)}
      className="text-left flex flex-col gap-1.5"
      style={{
        position: "relative",
        borderRight: wd < 6 ? "1px solid var(--line)" : "none",
        borderBottom: "1px solid var(--line)",
        padding: "10px 12px",
        background: bg,
        cursor: "pointer",
        outline: isToday ? "1.5px solid var(--spark)" : "none",
        outlineOffset: -2,
        minHeight: 0,
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 3,
          background: stripe,
        }}
      />
      <div className="flex items-baseline justify-between">
        <span
          className="t-num"
          style={{
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: isToday
              ? "var(--spark)"
              : isLeave
                ? "var(--fg-2)"
                : d.isWeekend
                  ? "var(--muted-foreground)"
                  : "var(--fg)",
          }}
        >
          {d.day}
        </span>
        {isToday && <span className="dot" aria-hidden />}
      </div>
      {isLeave && (
        <span
          className="t-mono"
          style={{
            color: d.leave === "holiday" ? "var(--spark)" : "var(--fg-2)",
            fontSize: 9,
          }}
        >
          {d.leave === "holiday" ? "★ FESTIVO" : "▲ FERIE"}
        </span>
      )}
      {!isLeave && d.target > 0 && (
        <div className="flex items-baseline justify-between gap-1.5" style={{ marginTop: "auto" }}>
          <span
            className="t-num"
            style={{
              fontSize: 16,
              letterSpacing: "-0.02em",
              color: complete
                ? "var(--spark)"
                : missing
                  ? "var(--fg)"
                  : "var(--muted-foreground)",
            }}
          >
            {d.logged > 0 ? d.logged.toFixed(d.logged % 1 === 0 ? 0 : 1) : "—"}
            <span className="t-mono" style={{ color: "var(--muted-foreground)", marginLeft: 2 }}>
              /{d.target}
            </span>
          </span>
          {missing && (
            <span className="t-mono" style={{ color: "var(--spark)", fontSize: 9 }}>
              !
            </span>
          )}
        </div>
      )}
      {isLeave && d.label && (
        <span
          className="t-body-lg"
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontStyle: "italic",
            fontSize: 13,
            color: "var(--fg-2)",
            marginTop: "auto",
          }}
        >
          {d.label}
        </span>
      )}
    </button>
  );
}

function MineTable({ monthDays, today }: { monthDays: DayRecord[]; today: number }) {
  return (
    <div className="solid-card overflow-hidden" style={{ borderRadius: 14 }}>
      <div
        className="grid t-mono"
        style={{
          gridTemplateColumns: "60px 60px 1fr 100px 100px 110px 1fr",
          background: "var(--bg-2)",
          borderBottom: "1px solid var(--line-strong)",
          color: "var(--muted-foreground)",
        }}
      >
        {["GIORNO", "DOW", "STATO", "LOGGED", "TARGET", "DELTA", "COMMESSE"].map((h, i) => (
          <div
            key={i}
            style={{
              padding: "12px 14px",
              borderRight: i < 6 ? "1px solid var(--line)" : "none",
            }}
          >
            {h}
          </div>
        ))}
      </div>
      <div className="max-h-[560px] overflow-auto">
        {monthDays.map((d) => {
          const isLeave = d.leave != null;
          const complete = d.target > 0 && d.logged >= d.target;
          const missing = d.target > 0 && d.logged < d.target && (today < 0 || d.day <= today);
          const delta = d.logged - d.target;
          return (
            <div
              key={d.date}
              className="grid"
              style={{
                gridTemplateColumns: "60px 60px 1fr 100px 100px 110px 1fr",
                borderBottom: "1px solid var(--line)",
                alignItems: "center",
                background: d.isWeekend ? "var(--bg-2)" : "transparent",
                opacity: !d.isWeekend || isLeave || d.logged > 0 ? 1 : 0.65,
              }}
            >
              <div style={{ padding: "12px 14px", borderRight: "1px solid var(--line)" }}>
                <span
                  className="t-num"
                  style={{
                    fontSize: 18,
                    letterSpacing: "-0.02em",
                    color: d.day === today ? "var(--spark)" : "var(--fg)",
                  }}
                >
                  {d.day}
                </span>
              </div>
              <div style={{ padding: "12px 14px", borderRight: "1px solid var(--line)" }}>
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {WEEKDAY_HEAD[d.weekday]}
                </span>
              </div>
              <div style={{ padding: "12px 14px", borderRight: "1px solid var(--line)" }}>
                <span
                  className="t-mono"
                  style={{
                    color: complete
                      ? "var(--spark)"
                      : missing
                        ? "var(--fg)"
                        : isLeave
                          ? "var(--fg-2)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {isLeave
                    ? d.leave === "holiday"
                      ? `★ FESTIVO · ${d.label}`
                      : `▲ FERIE · ${d.label ?? ""}`
                    : d.isWeekend
                      ? "○ WEEKEND"
                      : complete
                        ? "● COMPLETO"
                        : missing
                          ? "▲ MANCANTE"
                          : "○ FUTURO"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  textAlign: "right",
                  borderRight: "1px solid var(--line)",
                }}
              >
                <span
                  className="t-num"
                  style={{ fontSize: 16, color: complete ? "var(--spark)" : "var(--fg)" }}
                >
                  {fmtHours(d.logged)}
                </span>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  textAlign: "right",
                  borderRight: "1px solid var(--line)",
                }}
              >
                <span className="t-num" style={{ fontSize: 16, color: "var(--muted-foreground)" }}>
                  {d.target ? `${d.target}h` : "—"}
                </span>
              </div>
              <div
                style={{
                  padding: "12px 14px",
                  textAlign: "right",
                  borderRight: "1px solid var(--line)",
                }}
              >
                <span
                  className="t-num"
                  style={{
                    fontSize: 16,
                    color:
                      delta < 0
                        ? "var(--fg)"
                        : delta > 0
                          ? "var(--spark)"
                          : "var(--muted-foreground)",
                  }}
                >
                  {d.target ? `${delta >= 0 ? "+" : ""}${delta.toFixed(0)}h` : "—"}
                </span>
              </div>
              <div className="flex gap-1.5 flex-wrap" style={{ padding: "12px 14px" }}>
                {d.breakdown.map((b, i) => (
                  <span
                    key={i}
                    className="t-mono"
                    style={{
                      padding: "3px 8px",
                      borderRadius: 4,
                      border: "1px solid var(--line)",
                      color: "var(--fg-2)",
                      fontSize: 10,
                    }}
                  >
                    {b.code} · {b.hours}h
                  </span>
                ))}
                {d.breakdown.length === 0 && !isLeave && (
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    —
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ByCommessa({
  totals,
  month,
}: {
  totals: { code: string; name: string; hours: number }[];
  month: string;
}) {
  const grand = totals.reduce((s, r) => s + r.hours, 0);
  const max = totals.reduce((m, r) => Math.max(m, r.hours), 0) || 1;
  const top = totals[0];
  const topPct = top ? Math.round((top.hours / Math.max(grand, 1)) * 100) : 0;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-5">
      <div className="solid-card flex flex-col gap-4 p-6" style={{ borderRadius: 14 }}>
        <div className="flex items-baseline justify-between">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ORE PER COMMESSA · {month}
          </span>
          <span className="t-num" style={{ fontSize: 28, letterSpacing: "-0.03em" }}>
            {grand.toFixed(1)}h
          </span>
        </div>
        <div className="divider-strong" />
        <div className="flex flex-col gap-4 mt-1">
          {totals.length === 0 && (
            <span
              style={{
                color: "var(--muted-foreground)",
                fontStyle: "italic",
                fontFamily: "Fraunces, ui-serif, serif",
              }}
            >
              Nessuna ora registrata questo mese.
            </span>
          )}
          {totals.map((r, i) => (
            <div key={r.code} className="flex flex-col gap-1.5">
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-3">
                  <span
                    className="t-mono"
                    style={{ color: i === 0 ? "var(--spark)" : "var(--fg)" }}
                  >
                    {r.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 18,
                      color: "var(--fg-2)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {r.name}
                  </span>
                </div>
                <span className="t-num" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>
                  {r.hours.toFixed(1)}h
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: "var(--bg-2)",
                  border: "1px solid var(--line)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(r.hours / max) * 100}%`,
                    height: "100%",
                    background: i === 0 ? "var(--spark)" : "var(--fg)",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div
        className="solid-card flex flex-col gap-3 p-6"
        style={{ borderRadius: 14, background: "var(--bg-2)" }}
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          DISTRIBUZIONE
        </span>
        {top ? (
          <h3
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontWeight: 400,
              fontSize: 32,
              letterSpacing: "-0.025em",
              lineHeight: 1.05,
              margin: 0,
            }}
          >
            {top.name} tiene il {topPct}%<span style={{ color: "var(--spark)" }}>.</span>
          </h3>
        ) : (
          <h3
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 28,
              margin: 0,
            }}
          >
            Nessuna distribuzione.
          </h3>
        )}
        <p style={{ margin: 0, color: "var(--fg-2)", fontSize: 14, lineHeight: 1.55 }}>
          Le ore più alte concentrano l'attenzione del mese. Mantenere bilanciato il portafoglio
          aiuta a evitare saturazioni su singole commesse.
        </p>
        <div className="mt-auto flex gap-2">
          <EditorialPill kind="ghost" size="sm">
            ↗ Esporta CSV
          </EditorialPill>
          <EditorialPill kind="ghost" size="sm">
            ⏵ Forecast
          </EditorialPill>
        </div>
      </div>
    </div>
  );
}

function TeamPresence({
  employees,
  entries,
  cursor,
}: {
  employees: ReturnType<typeof useEmployees>;
  entries: ReturnType<typeof useTimesheetEntries>;
  cursor: { year: number; month: number };
}) {
  const today = new Date();
  const todayStr =
    today.getFullYear() === cursor.year && today.getMonth() === cursor.month
      ? ymd(today)
      : ymd(new Date(cursor.year, cursor.month, 1));

  const stateMeta: Record<string, [string, string]> = {
    active: ["IN UFFICIO", "var(--spark)"],
    remote: ["REMOTE", "var(--fg)"],
    on_leave: ["FERIE", "var(--muted-foreground)"],
    onboarding: ["ONBOARDING", "var(--fg-2)"],
    offboarding: ["OFFBOARDING", "var(--muted-foreground)"],
  };

  const counts = employees.reduce<Record<string, number>>((m, e) => {
    m[e.status] = (m[e.status] ?? 0) + 1;
    return m;
  }, {});

  const hoursToday = (eId: string) =>
    entries
      .filter((e) => e.employeeId === eId && e.date === todayStr)
      .reduce((s, e) => s + e.hours, 0);

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2.5 flex-wrap">
        {Object.entries(counts).map(([k, n]) => (
          <div
            key={k}
            className="flex items-baseline gap-2.5"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid var(--line)",
              background: "var(--bg)",
            }}
          >
            <span
              className="t-num"
              style={{
                fontSize: 22,
                letterSpacing: "-0.02em",
                color: stateMeta[k]?.[1] ?? "var(--fg)",
              }}
            >
              {n}
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {stateMeta[k]?.[0] ?? k.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="solid-card overflow-hidden" style={{ borderRadius: 14 }}>
        <div
          className="grid t-mono"
          style={{
            gridTemplateColumns: "1fr 160px 1fr 120px",
            background: "var(--bg-2)",
            borderBottom: "1px solid var(--line-strong)",
            color: "var(--muted-foreground)",
            position: "sticky",
            top: 0,
          }}
        >
          {["PERSONA", "STATO", "RUOLO", "ORE OGGI"].map((h, i) => (
            <div
              key={i}
              style={{
                padding: "12px 16px",
                borderRight: i < 3 ? "1px solid var(--line)" : "none",
              }}
            >
              {h}
            </div>
          ))}
        </div>
        <div className="max-h-[480px] overflow-auto">
          {employees.map((e) => {
            const onLeave = e.status === "on_leave";
            return (
              <div
                key={e.id}
                className="grid"
                style={{
                  gridTemplateColumns: "1fr 160px 1fr 120px",
                  alignItems: "center",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <div
                  className="flex items-center gap-3"
                  style={{ padding: "14px 16px", borderRight: "1px solid var(--line)" }}
                >
                  <AvatarDisplay initials={e.initials} size="sm" />
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontSize: 18,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {e.name}
                  </span>
                </div>
                <div style={{ padding: "14px 16px", borderRight: "1px solid var(--line)" }}>
                  <span
                    className="t-mono"
                    style={{ color: stateMeta[e.status]?.[1] ?? "var(--fg)" }}
                  >
                    {stateMeta[e.status]?.[0] ?? e.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ padding: "14px 16px", borderRight: "1px solid var(--line)" }}>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 16,
                      color: "var(--fg-2)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {e.role}
                  </span>
                </div>
                <div style={{ padding: "14px 16px", textAlign: "right" }}>
                  <span
                    className="t-num"
                    style={{
                      fontSize: 18,
                      letterSpacing: "-0.02em",
                      color: onLeave ? "var(--muted-foreground)" : "var(--fg)",
                    }}
                  >
                    {onLeave ? "—" : `${hoursToday(e.id)}h`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function DayDrawer({
  rec,
  monthLower,
  onClose,
}: {
  rec: DayRecord;
  monthLower: string;
  onClose: () => void;
}) {
  const isLeave = rec.leave != null;
  const wdName = WEEKDAY_FULL[rec.weekday];
  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40"
        style={{
          background: "color-mix(in oklch, var(--bg) 70%, transparent)",
          backdropFilter: "blur(2px)",
        }}
      />
      <aside
        className="fade-up fixed top-0 right-0 bottom-0 flex flex-col gap-4 overflow-auto z-50"
        style={{
          width: 460,
          maxWidth: "100vw",
          background: "var(--bg)",
          borderLeft: "1px solid var(--line-strong)",
          padding: "28px 32px",
        }}
      >
        <div className="flex items-center justify-between">
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {wdName.toUpperCase()} · {monthLower.toUpperCase()}
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--muted-foreground)",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        <h2
          style={{
            fontFamily: "Fraunces, ui-serif, serif",
            fontWeight: 400,
            fontSize: 96,
            lineHeight: 0.86,
            letterSpacing: "-0.045em",
            margin: 0,
          }}
        >
          <span style={{ fontStyle: "italic" }}>{rec.day}</span>
          <span style={{ color: "var(--spark)" }}>.</span>
          <span
            style={{
              marginLeft: 14,
              fontSize: 28,
              color: "var(--muted-foreground)",
              letterSpacing: "-0.02em",
              verticalAlign: "middle",
            }}
          >
            {monthLower}
          </span>
        </h2>

        {!isLeave && rec.target > 0 && (
          <div
            className="flex gap-6 items-baseline"
            style={{ paddingBottom: 14, borderBottom: "1px solid var(--line)" }}
          >
            <div className="flex flex-col gap-0.5">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                LOGGED
              </span>
              <span
                className="t-num"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.03em",
                  color: rec.logged >= rec.target ? "var(--spark)" : "var(--fg)",
                }}
              >
                {rec.logged.toFixed(rec.logged % 1 === 0 ? 0 : 1)}h
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                TARGET
              </span>
              <span
                className="t-num"
                style={{
                  fontSize: 32,
                  letterSpacing: "-0.03em",
                  color: "var(--muted-foreground)",
                }}
              >
                {rec.target}h
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                STATO
              </span>
              <span
                className="t-mono"
                style={{
                  color: rec.logged >= rec.target ? "var(--spark)" : "var(--fg)",
                }}
              >
                {rec.logged >= rec.target ? "● COMPLETO" : "○ DA RIEMPIRE"}
              </span>
            </div>
          </div>
        )}

        {isLeave && (
          <div
            className="px-4 py-4 rounded-xl"
            style={{ background: "var(--bg-2)", border: "1px solid var(--line)" }}
          >
            <span
              className="t-mono"
              style={{
                color: rec.leave === "holiday" ? "var(--spark)" : "var(--muted-foreground)",
              }}
            >
              {rec.leave === "holiday" ? "★ FESTIVITÀ" : "▲ FERIE APPROVATE"}
            </span>
            <p
              style={{
                margin: "6px 0 0",
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 22,
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              {rec.label}
            </p>
          </div>
        )}

        {!isLeave && (
          <div className="flex flex-col gap-2.5">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ORE PER COMMESSA
            </span>
            {rec.breakdown.length > 0 ? (
              rec.breakdown.map((b, i) => (
                <div
                  key={i}
                  className="grid items-center gap-3.5"
                  style={{
                    gridTemplateColumns: "auto 1fr auto",
                    padding: "10px 0",
                    borderBottom: "1px solid var(--line)",
                  }}
                >
                  <span className="t-mono" style={{ color: "var(--fg)" }}>
                    {b.code}
                  </span>
                  <span
                    style={{
                      fontFamily: "Fraunces, ui-serif, serif",
                      fontStyle: "italic",
                      fontSize: 16,
                      color: "var(--fg-2)",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {b.name}
                  </span>
                  <span className="t-num" style={{ fontSize: 18, letterSpacing: "-0.02em" }}>
                    {b.hours.toFixed(b.hours % 1 === 0 ? 0 : 1)}h
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "20px 0",
                  borderTop: "1px solid var(--line)",
                  borderBottom: "1px solid var(--line)",
                }}
              >
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 17,
                    color: "var(--muted-foreground)",
                  }}
                >
                  Nessuna ora registrata. Inizia digitando il codice della commessa.
                </span>
              </div>
            )}
          </div>
        )}

        {!isLeave && (
          <div
            className="flex flex-col gap-2.5 mt-auto"
            style={{ paddingTop: 14, borderTop: "1px solid var(--line)" }}
          >
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              AGGIUNGI VOCE
            </span>
            <div className="grid gap-2" style={{ gridTemplateColumns: "1fr 80px" }}>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line-strong)",
                  color: "var(--muted-foreground)",
                  fontFamily: "Fraunces, ui-serif, serif",
                  fontStyle: "italic",
                  fontSize: 16,
                }}
              >
                Codice commessa…
              </div>
              <div
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--line-strong)",
                  color: "var(--muted-foreground)",
                  fontFamily: "JetBrains Mono, ui-monospace, monospace",
                  fontSize: 13,
                  textAlign: "right",
                }}
              >
                0.0h
              </div>
            </div>
            <div className="flex gap-1.5">
              <EditorialPill kind="ghost" size="sm">
                ⌘D Duplica ieri
              </EditorialPill>
              <span style={{ flex: 1 }} />
              <EditorialPill
                kind="spark"
                size="sm"
                onClick={() => {
                  toast.success("Voce aggiunta", { description: `${rec.date}` });
                  onClose();
                }}
              >
                + Aggiungi
              </EditorialPill>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
