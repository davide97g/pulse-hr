import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useEmployees } from "@/lib/tables/employees";
import { useLeaveRequests } from "@/lib/tables/leave";
import { useTimesheetEntries } from "@/lib/tables/timesheetEntries";
import {
  holidaysSeed,
  commesse,
  type Holiday,
  type LeaveRequest,
  type TimesheetEntry,
} from "@/lib/mock-data";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";

const ME = "e1";
const MONTHS_IT = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];
const WEEKDAYS_IT = ["DOM", "LUN", "MAR", "MER", "GIO", "VEN", "SAB"];

type TabId = "calendar" | "mine" | "commessa" | "team";

interface DayState {
  day: number;
  date: Date;
  iso: string;
  isWeekend: boolean;
  target: number;
  logged: number;
  leave: LeaveRequest | null;
  holiday: Holiday | null;
  isFuture: boolean;
  isToday: boolean;
}

function fmtHours(h: number): string {
  if (h === 0) return "—";
  return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
}

function isoOf(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function TimesheetCalendar() {
  const employees = useEmployees();
  const leaveRequests = useLeaveRequests();
  const timesheetEntries = useTimesheetEntries();

  const [tab, setTab] = useState<TabId>("calendar");
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [cursor, setCursor] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });

  const monthMeta = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();
    const firstWeekday = first.getDay();
    const today = new Date();
    const todayDay =
      today.getFullYear() === year && today.getMonth() === month ? today.getDate() : -1;

    const myEntries = timesheetEntries.filter((e) => e.employeeId === ME);
    const days: DayState[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const iso = isoOf(date);
      const wd = date.getDay();
      const isWeekend = wd === 0 || wd === 6;
      const holiday =
        holidaysSeed.find(
          (h) => h.date === iso && (h.country === "all" || h.country === "IT"),
        ) ?? null;
      const myLeave =
        leaveRequests.find(
          (l) =>
            l.employeeId === ME &&
            l.status === "approved" &&
            iso >= l.from &&
            iso <= l.to,
        ) ?? null;
      const target = isWeekend || holiday || myLeave ? 0 : 8;
      const logged = myEntries
        .filter((e) => e.date === iso)
        .reduce((s, e) => s + e.hours, 0);
      days.push({
        day: d,
        date,
        iso,
        isWeekend,
        target,
        logged,
        leave: myLeave,
        holiday,
        isFuture: d > todayDay && todayDay > 0,
        isToday: d === todayDay,
      });
    }
    return { year, month, daysInMonth, firstWeekday, todayDay, days };
  }, [cursor, leaveRequests, timesheetEntries]);

  const kpis = useMemo(() => {
    const workdays = monthMeta.days.filter((x) => x.target > 0);
    const filled = workdays.filter((x) => x.logged >= x.target).length;
    const totalLogged = monthMeta.days.reduce((s, x) => s + x.logged, 0);
    const totalTarget = workdays.length * 8;
    const missing = monthMeta.days.filter(
      (x) => x.target > 0 && x.logged < x.target && !x.isFuture,
    );
    const leave = monthMeta.days.filter((x) => x.leave).length;
    const holiday = monthMeta.days.filter((x) => x.holiday).length;
    const fillPct =
      workdays.length > 0 ? Math.round((filled / workdays.length) * 100) : 0;
    return {
      totalLogged,
      totalTarget,
      filled,
      workdays: workdays.length,
      missing,
      leave,
      holiday,
      fillPct,
    };
  }, [monthMeta]);

  const monthLabel = `${MONTHS_IT[monthMeta.month]} ${monthMeta.year}`;

  return (
    <div
      className="ph"
      style={{
        padding: "26px 24px 24px",
        minHeight: "calc(100vh - 3.5rem)",
        display: "flex",
        flexDirection: "column",
        gap: 18,
      }}
    >
      {/* HERO */}
      <div className="grid items-end gap-6" style={{ gridTemplateColumns: "1fr auto" }}>
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            TIME &amp; ATTENDANCE · CALENDARIO · {monthLabel.toUpperCase()}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "6px 0 0",
              fontSize: "clamp(56px, 7vw, 84px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            Presenze
            <span style={{ fontStyle: "italic" }}>, ora</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              maxWidth: 560,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.45,
            }}
          >
            Traccia le ore, registra contro le commesse, manda il timesheet per approvazione. Una
            pagina per il mese.
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => setCursor(new Date(monthMeta.year, monthMeta.month - 1, 1))}
            aria-label="Previous month"
          >
            ←
          </button>
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => {
              const n = new Date();
              setCursor(new Date(n.getFullYear(), n.getMonth(), 1));
            }}
          >
            Oggi
          </button>
          <button
            type="button"
            className="pill pill-ghost pill-sm"
            onClick={() => setCursor(new Date(monthMeta.year, monthMeta.month + 1, 1))}
            aria-label="Next month"
          >
            →
          </button>
          <Link to="/time" className="pill pill-ghost pill-sm">
            ⚡ Log now
          </Link>
          <button type="button" className="pill pill-spark pill-sm">
            + Nuova voce <span className="arr">→</span>
          </button>
        </div>
      </div>

      {/* TABS */}
      <div
        className="flex gap-1"
        style={{ borderBottom: "1px solid var(--line)", paddingBottom: 0 }}
      >
        {(
          [
            ["calendar", "Calendar"],
            ["mine", "My timesheet"],
            ["commessa", "By commessa"],
            ["team", "Team presence"],
          ] as Array<[TabId, string]>
        ).map(([k, l]) => {
          const active = k === tab;
          return (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "10px 14px",
                marginBottom: -1,
                borderBottom: `2px solid ${active ? "var(--spark)" : "transparent"}`,
                fontFamily: "Inter, system-ui, sans-serif",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                letterSpacing: "-0.01em",
                color: active ? "var(--fg)" : "var(--muted-foreground)",
              }}
            >
              {l}
            </button>
          );
        })}
      </div>

      {/* KPI strip */}
      <div
        style={{
          border: "1px solid var(--line)",
          borderRadius: 14,
          background: "var(--bg)",
          display: "flex",
        }}
      >
        <KpiCell
          label="LOGGED / TARGET"
          big={
            <>
              <span>{kpis.totalLogged.toFixed(0)}</span>
              <span style={{ color: "var(--muted-foreground)" }}> / {kpis.totalTarget}h</span>
            </>
          }
          sub={`${kpis.totalTarget}h ATTESI · ${kpis.totalTarget - kpis.totalLogged > 0 ? "−" : "+"}${Math.abs(kpis.totalTarget - kpis.totalLogged).toFixed(0)}h`}
        />
        <KpiCell
          label="FILL %"
          big={`${kpis.fillPct}%`}
          sub={`${kpis.filled}/${kpis.workdays} GIORNI COMPLETI`}
          accent={kpis.fillPct >= 80 ? "var(--spark)" : "var(--fg)"}
        />
        <KpiCell
          label="MISSING"
          big={
            <>
              <span>{kpis.missing.length}</span>
              {kpis.missing.length > 0 && (
                <span style={{ color: "var(--spark)", fontSize: 24, marginLeft: 8 }}>●</span>
              )}
            </>
          }
          sub={kpis.missing.length > 0 ? "VAI AL PRIMO →" : "TUTTO IN REGOLA"}
          action={kpis.missing.length > 0 ? () => setOpenDay(kpis.missing[0].day) : undefined}
        />
        <div
          style={{
            flex: 1,
            padding: "16px 20px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            LEAVE + HOLIDAYS
          </span>
          <span
            className="t-num"
            style={{ fontSize: 36, letterSpacing: "-0.04em", lineHeight: 1 }}
          >
            {kpis.leave + kpis.holiday}
          </span>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            {kpis.leave} FERIE · {kpis.holiday} FESTIVI
          </span>
        </div>
      </div>

      {/* TAB BODY */}
      {tab === "calendar" && (
        <CalendarGrid month={monthMeta} onPickDay={(d) => setOpenDay(d)} />
      )}
      {tab === "mine" && <MineTable days={monthMeta.days} entries={timesheetEntries} />}
      {tab === "commessa" && <CommessaTab entries={timesheetEntries} />}
      {tab === "team" && <TeamTab employees={employees} leave={leaveRequests} />}

      {tab === "calendar" && kpis.missing.length > 0 && (
        <MissingFooter days={kpis.missing.map((m) => m.day)} onPick={(d) => setOpenDay(d)} />
      )}

      {/* DAY DRAWER */}
      <SidePanel
        open={openDay != null}
        onClose={() => setOpenDay(null)}
        title={openDay != null ? `${openDay} ${MONTHS_IT[monthMeta.month]} ${monthMeta.year}` : ""}
      >
        {openDay != null && (
          <DayDrawerBody
            day={monthMeta.days.find((d) => d.day === openDay)!}
            entries={timesheetEntries.filter(
              (e) =>
                e.employeeId === ME &&
                e.date === isoOf(new Date(monthMeta.year, monthMeta.month, openDay)),
            )}
          />
        )}
      </SidePanel>
    </div>
  );
}

function KpiCell({
  label,
  big,
  sub,
  accent,
  action,
}: {
  label: string;
  big: React.ReactNode;
  sub: string;
  accent?: string;
  action?: () => void;
}) {
  return (
    <div
      style={{
        flex: 1,
        padding: "16px 20px",
        borderRight: "1px solid var(--line)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
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
        onClick={action}
        style={{
          color: action ? "var(--spark)" : "var(--muted-foreground)",
          cursor: action ? "pointer" : "default",
        }}
      >
        {sub}
      </span>
    </div>
  );
}

function CalendarGrid({
  month,
  onPickDay,
}: {
  month: { firstWeekday: number; daysInMonth: number; days: DayState[] };
  onPickDay: (d: number) => void;
}) {
  const cells: Array<DayState | null> = [];
  for (let i = 0; i < month.firstWeekday; i++) cells.push(null);
  for (const d of month.days) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = cells.length / 7;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          background: "var(--bg-2)",
          borderBottom: "1px solid var(--line-strong)",
        }}
      >
        {WEEKDAYS_IT.map((d, i) => (
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
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gridTemplateRows: `repeat(${weeks}, minmax(86px, 1fr))`,
        }}
      >
        {cells.map((cell, i) => (
          <DayCell key={i} cell={cell} idx={i} onClick={cell ? () => onPickDay(cell.day) : undefined} />
        ))}
      </div>
    </div>
  );
}

function DayCell({
  cell,
  idx,
  onClick,
}: {
  cell: DayState | null;
  idx: number;
  onClick?: () => void;
}) {
  const col = idx % 7;
  const row = Math.floor(idx / 7);
  const baseBorder = {
    borderRight: col < 6 ? "1px solid var(--line)" : "none",
    borderBottom: "1px solid var(--line)",
  };
  if (!cell) {
    return (
      <div
        style={{
          background: "color-mix(in oklch, var(--bg-3) 30%, transparent)",
          ...baseBorder,
        }}
      />
    );
  }

  const filled = cell.target > 0 && cell.logged >= cell.target;
  const partial = cell.target > 0 && cell.logged > 0 && cell.logged < cell.target;
  const missing = cell.target > 0 && cell.logged === 0 && !cell.isFuture;

  let bg = "transparent";
  if (cell.isWeekend) bg = "color-mix(in oklch, var(--bg-3) 30%, transparent)";
  else if (cell.holiday) bg = "color-mix(in oklch, var(--bg-2) 60%, transparent)";
  else if (cell.leave) bg = "color-mix(in oklch, var(--bg-3) 50%, transparent)";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...baseBorder,
        background: bg,
        textAlign: "left",
        cursor: "pointer",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        outline: cell.isToday ? "2px solid var(--spark)" : "none",
        outlineOffset: -2,
        font: "inherit",
        color: "inherit",
      }}
      aria-label={`Day ${cell.day}`}
    >
      <div className="flex items-baseline justify-between">
        <span
          className="t-num"
          style={{
            fontSize: 18,
            letterSpacing: "-0.02em",
            color: cell.isWeekend ? "var(--muted-foreground)" : "var(--fg)",
          }}
        >
          {cell.day}
        </span>
        {missing && (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--spark)",
              boxShadow: "0 0 8px var(--spark)",
            }}
          />
        )}
        {filled && (
          <span className="t-mono-sm" style={{ color: "var(--muted-foreground)" }}>
            ✓
          </span>
        )}
      </div>
      {cell.holiday && (
        <span
          className="t-mono-sm"
          style={{
            color: "var(--muted-foreground)",
            border: "1px solid var(--line)",
            padding: "2px 6px",
            borderRadius: 999,
            alignSelf: "flex-start",
          }}
        >
          {cell.holiday.name}
        </span>
      )}
      {cell.leave && (
        <span
          className="t-mono-sm"
          style={{
            color: "var(--fg-2)",
          }}
        >
          {cell.leave.type === "Vacation" ? "FERIE" : cell.leave.type.toUpperCase()}
        </span>
      )}
      {cell.target > 0 && (
        <span
          className="t-num"
          style={{
            fontSize: 12,
            color: filled
              ? "var(--fg-2)"
              : partial
                ? "var(--fg-2)"
                : missing
                  ? "var(--spark)"
                  : "var(--muted-foreground)",
            marginTop: "auto",
          }}
        >
          {cell.logged > 0 ? fmtHours(cell.logged) : missing ? "—" : ""}
        </span>
      )}
      {void row}
    </button>
  );
}

function MineTable({ days, entries }: { days: DayState[]; entries: TimesheetEntry[] }) {
  const mine = entries.filter((e) => e.employeeId === ME);
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        className="tab-row head"
        style={
          {
            "--cols": "80px 1fr 100px 100px",
            background: "var(--bg-2)",
          } as React.CSSProperties
        }
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>DATA</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>COMMESSA</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>ORE</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>STATO</span>
      </div>
      {mine.slice(0, 60).map((e) => {
        const c = commesse.find((x) => x.id === e.commessaId);
        return (
          <div
            key={e.id}
            className="tab-row"
            style={
              {
                "--cols": "80px 1fr 100px 100px",
                "--row-pad": "10px",
                alignItems: "center",
              } as React.CSSProperties
            }
          >
            <span className="t-mono" style={{ color: "var(--fg-2)" }}>
              {e.date.slice(8, 10)}/{e.date.slice(5, 7)}
            </span>
            <span className="t-body">
              <span className="t-mono" style={{ color: "var(--fg)", marginRight: 8 }}>
                {c?.code ?? "—"}
              </span>
              <span style={{ fontStyle: "italic", fontFamily: "Fraunces, ui-serif, serif" }}>
                {c?.name ?? "—"}
              </span>
            </span>
            <span className="t-num" style={{ textAlign: "right" }}>{fmtHours(e.hours)}</span>
            <span className="t-mono" style={{ textAlign: "right", color: "var(--muted-foreground)" }}>
              {e.status.toUpperCase()}
            </span>
          </div>
        );
      })}
      {mine.length === 0 && (
        <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
          <span className="t-mono">NESSUNA VOCE</span>
        </div>
      )}
      {void days}
    </div>
  );
}

function CommessaTab({ entries }: { entries: TimesheetEntry[] }) {
  const totals = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of entries.filter((x) => x.employeeId === ME)) {
      m.set(e.commessaId, (m.get(e.commessaId) ?? 0) + e.hours);
    }
    return Array.from(m.entries())
      .map(([commessaId, hours]) => {
        const c = commesse.find((x) => x.id === commessaId);
        return { code: c?.code ?? "—", name: c?.name ?? "—", hours };
      })
      .sort((a, b) => b.hours - a.hours);
  }, [entries]);

  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        className="tab-row head"
        style={
          {
            "--cols": "120px 1fr 80px",
            background: "var(--bg-2)",
          } as React.CSSProperties
        }
      >
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>CODICE</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>NOME</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>ORE</span>
      </div>
      {totals.map((t) => (
        <div
          key={t.code}
          className="tab-row"
          style={
            {
              "--cols": "120px 1fr 80px",
              "--row-pad": "10px",
              alignItems: "center",
            } as React.CSSProperties
          }
        >
          <span className="t-mono" style={{ color: "var(--fg)" }}>
            {t.code}
          </span>
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--fg-2)",
            }}
          >
            {t.name}
          </span>
          <span className="t-num" style={{ textAlign: "right" }}>{fmtHours(t.hours)}</span>
        </div>
      ))}
      {totals.length === 0 && (
        <div className="p-8 text-center" style={{ color: "var(--muted-foreground)" }}>
          <span className="t-mono">NESSUNA VOCE</span>
        </div>
      )}
    </div>
  );
}

function TeamTab({
  employees,
  leave,
}: {
  employees: ReturnType<typeof useEmployees>;
  leave: LeaveRequest[];
}) {
  const today = isoOf(new Date());
  return (
    <div
      style={{
        border: "1px solid var(--line)",
        borderRadius: 14,
        overflow: "hidden",
      }}
    >
      <div
        className="tab-row head"
        style={
          {
            "--cols": "44px 1.4fr 1fr 100px",
            background: "var(--bg-2)",
          } as React.CSSProperties
        }
      >
        <span></span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>NOME</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>STATO OGGI</span>
        <span className="t-mono" style={{ color: "var(--muted-foreground)", textAlign: "right" }}>SEDE</span>
      </div>
      {employees.slice(0, 30).map((emp) => {
        const onLeave = leave.find(
          (l) =>
            l.employeeId === emp.id &&
            l.status === "approved" &&
            today >= l.from &&
            today <= l.to,
        );
        const state = onLeave
          ? `${onLeave.type === "Vacation" ? "FERIE" : onLeave.type.toUpperCase()}`
          : emp.status === "remote"
            ? "REMOTE"
            : emp.status === "on_leave"
              ? "LEAVE"
              : "OFFICE";
        const accent = state === "OFFICE";
        return (
          <div
            key={emp.id}
            className="tab-row"
            style={
              {
                "--cols": "44px 1.4fr 1fr 100px",
                "--row-pad": "10px",
                alignItems: "center",
              } as React.CSSProperties
            }
          >
            <span className="ph-avatar ph-avatar-sm">{emp.initials}</span>
            <span className="t-body" style={{ fontWeight: 500 }}>
              {emp.name}
            </span>
            <span
              className="t-mono"
              style={{
                color: accent ? "var(--spark)" : "var(--fg-2)",
              }}
            >
              {state}
            </span>
            <span
              className="t-mono"
              style={{ textAlign: "right", color: "var(--muted-foreground)" }}
            >
              {emp.location.split(",")[0]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function MissingFooter({
  days,
  onPick,
}: {
  days: number[];
  onPick: (d: number) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid var(--spark)",
        background: "color-mix(in oklch, var(--spark) 6%, transparent)",
        borderRadius: 14,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        flexWrap: "wrap",
      }}
    >
      <span className="tag-attention">⚠ {days.length} GIORNI MANCANTI</span>
      <span
        style={{
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 16,
          color: "var(--fg-2)",
        }}
      >
        Compila prima di venerdì.
      </span>
      <div className="flex gap-2 flex-wrap">
        {days.map((d) => (
          <button
            key={d}
            type="button"
            className="t-mono"
            onClick={() => onPick(d)}
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              border: "1px solid var(--line-strong)",
              background: "transparent",
              color: "var(--fg)",
              cursor: "pointer",
            }}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
}

function DayDrawerBody({ day, entries }: { day: DayState; entries: TimesheetEntry[] }) {
  const totalLogged = entries.reduce((s, e) => s + e.hours, 0);
  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-baseline justify-between">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {day.isWeekend ? "WEEKEND" : day.holiday ? day.holiday.name.toUpperCase() : day.leave ? "LEAVE" : "WORKDAY"}
        </span>
        <span
          className="t-num"
          style={{ fontSize: 28, letterSpacing: "-0.03em", color: "var(--fg)" }}
        >
          {fmtHours(totalLogged)}{" "}
          <span style={{ color: "var(--muted-foreground)", fontSize: 18 }}>
            / {day.target}h
          </span>
        </span>
      </div>
      <div style={{ borderTop: "1px solid var(--line)" }} />
      {entries.length === 0 ? (
        <div className="t-mono py-6 text-center" style={{ color: "var(--muted-foreground)" }}>
          NESSUNA VOCE
        </div>
      ) : (
        entries.map((e) => {
          const c = commesse.find((x) => x.id === e.commessaId);
          return (
            <div key={e.id} className="flex items-baseline justify-between">
              <div className="flex flex-col">
                <span className="t-mono" style={{ color: "var(--fg)" }}>
                  {c?.code ?? "—"}
                </span>
                <span
                  style={{
                    fontFamily: "Fraunces, ui-serif, serif",
                    fontStyle: "italic",
                    fontSize: 16,
                    color: "var(--fg-2)",
                  }}
                >
                  {c?.name ?? e.description}
                </span>
              </div>
              <span className="t-num" style={{ fontSize: 20 }}>
                {fmtHours(e.hours)}
              </span>
            </div>
          );
        })
      )}
    </div>
  );
}
