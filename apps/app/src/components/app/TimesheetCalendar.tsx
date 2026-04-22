import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  addMonths,
  subMonths,
  format,
  isSameDay,
  addDays,
  subDays,
  endOfMonth,
  isWeekend,
  parseISO,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Wand2,
  AlertCircle,
  TrendingUp,
  Sparkles,
  Users,
  User,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PageHeader, Avatar } from "./AppShell";
import { DayCell } from "./DayCell";
import { DayPeekPopover } from "./DayPeekPopover";
import { BulkEntryDialog } from "./BulkEntryDialog";
import { TimesheetAutofillDialog } from "./TimesheetAutofillDialog";
import {
  getDayInfo,
  getMonthStats,
  getMonthMatrix,
  weekdayLabels,
  synthesizeTeamEntries,
  type DayInfo,
  type DayStatus,
} from "@/lib/timesheet";
import {
  commesse,
  commessaById,
  employees,
  employeeById,
  type TimesheetEntry,
  type TimesheetTemplate,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";

type Mode = "copy-week" | "fill-missing" | "apply-range";

interface Props {
  entries: TimesheetEntry[];
  templates?: TimesheetTemplate[];
  onSaveTemplate?: (t: Omit<TimesheetTemplate, "id">) => void;
  onDeleteTemplate?: (id: string) => void;
  onAdd: (e: Omit<TimesheetEntry, "id" | "status" | "employeeId">) => void;
  onAddMany: (rows: Omit<TimesheetEntry, "id" | "status" | "employeeId">[]) => void;
  onEdit: (entry: TimesheetEntry) => void;
  onDelete: (id: string) => void;
}

export function TimesheetCalendar({
  entries,
  templates = [],
  onSaveTemplate,
  onDeleteTemplate,
  onAdd,
  onAddMany,
  onEdit,
  onDelete,
}: Props) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [view, setView] = useState<"mine" | "team">("mine");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [rangeAnchor, setRangeAnchor] = useState<Date | null>(null);
  const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkMode, setBulkMode] = useState<Mode>("copy-week");
  const [autofillOpen, setAutofillOpen] = useState(false);
  const [commessaFilter, setCommessaFilter] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(false);

  const weekdays = useMemo(() => weekdayLabels(), []);
  const today = useMemo(() => new Date(), []);
  const monthLabel = format(month, "MMMM yyyy");

  // Build day info array for the current calendar grid
  const grid = useMemo(() => getMonthMatrix(month), [month]);
  const dayInfos = useMemo<DayInfo[]>(
    () => grid.map((d) => getDayInfo(d, ME, entries, month, { today })),
    [grid, entries, month, today],
  );
  const stats = useMemo(
    () => getMonthStats(month, ME, entries, { today }),
    [month, entries, today],
  );

  const selectedInfo = dayInfos.find((d) => d.iso === selectedDay) ?? null;
  const selectedRange = useMemo<Date[]>(() => {
    if (!rangeAnchor || !rangeEnd) return [];
    const start = rangeAnchor < rangeEnd ? rangeAnchor : rangeEnd;
    const end = rangeAnchor < rangeEnd ? rangeEnd : rangeAnchor;
    const out: Date[] = [];
    for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
    return out;
  }, [rangeAnchor, rangeEnd]);

  const prevDayEntries = useMemo(() => {
    if (!selectedInfo) return [];
    let d = subDays(selectedInfo.date, 1);
    for (let i = 0; i < 7; i++) {
      if (isWeekend(d)) {
        d = subDays(d, 1);
        continue;
      }
      const iso = format(d, "yyyy-MM-dd");
      const rows = entries.filter((e) => e.employeeId === ME && e.date === iso);
      if (rows.length) return rows;
      d = subDays(d, 1);
    }
    return [];
  }, [selectedInfo, entries]);

  // External triggers (Command Palette, Copilot)
  useEffect(() => {
    const onAutofill = () => setAutofillOpen(true);
    const onBulk = (e: Event) => {
      const ce = e as CustomEvent<{ mode?: Mode }>;
      setBulkMode(ce.detail?.mode ?? "copy-week");
      setBulkOpen(true);
    };
    window.addEventListener("pulse:open-autofill", onAutofill);
    window.addEventListener("pulse:open-bulk", onBulk);
    return () => {
      window.removeEventListener("pulse:open-autofill", onAutofill);
      window.removeEventListener("pulse:open-bulk", onBulk);
    };
  }, []);

  const handleCellClick = (info: DayInfo, ev: React.MouseEvent, el: HTMLElement) => {
    if (ev.shiftKey && rangeAnchor) {
      setRangeEnd(info.date);
      setBulkMode("apply-range");
      setBulkOpen(true);
      return;
    }
    setRangeAnchor(info.date);
    setRangeEnd(null);
    setSelectedDay(info.iso);
    setAnchorEl(el);
  };

  const missingList = dayInfos.filter((d) => d.status === "missing" && d.inMonth);

  // Team view data
  const teamIds = useMemo(() => employees.slice(0, 8).map((e) => e.id), []);
  const teamEntries = useMemo(() => synthesizeTeamEntries(teamIds, month), [teamIds, month]);
  const teamDays = useMemo(
    () =>
      teamIds.map((eid) => ({
        eid,
        days: grid.map((d) => getDayInfo(d, eid, teamEntries, month, { today })),
      })),
    [teamIds, teamEntries, grid, month, today],
  );

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMonth(subMonths(month, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 press-scale"
            onClick={() => setMonth(startOfMonth(new Date()))}
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setMonth(addMonths(month, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 font-display text-2xl leading-none">{monthLabel}</div>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex rounded-md border p-0.5 bg-background">
            <button
              onClick={() => setView("mine")}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "mine"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <User className="h-3.5 w-3.5" /> Mine
            </button>
            <button
              onClick={() => setView("team")}
              className={cn(
                "px-3 h-8 text-xs rounded-sm inline-flex items-center gap-1.5 press-scale",
                view === "team"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Users className="h-3.5 w-3.5" /> Team
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-9 press-scale"
            onClick={() => setAutofillOpen(true)}
          >
            <Sparkles className="h-4 w-4 mr-1.5 text-primary" /> Draft week
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-9 press-scale"
            onClick={() => {
              setBulkMode("copy-week");
              setBulkOpen(true);
            }}
          >
            <Wand2 className="h-4 w-4 mr-1.5 text-primary" /> Bulk entry
          </Button>
        </div>
      </div>

      {view === "mine" && (
        <>
          {/* ── Observability strip ────────────────────────────── */}
          <Card className="p-4 mb-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatBlock
                label="Logged / target"
                value={`${stats.logged.toFixed(0)}h`}
                sub={`of ${stats.target}h · ${stats.variance >= 0 ? "+" : ""}${stats.variance.toFixed(0)}h`}
                subTone={stats.variance < 0 ? "warn" : "success"}
              />
              <StatBlock
                label="Fill %"
                value={`${stats.fillPct}%`}
                sub={`${stats.filledDays}/${stats.workdays} workdays`}
              />
              <button
                onClick={() => {
                  if (missingList[0]) {
                    setSelectedDay(missingList[0].iso);
                    setAnchorEl(document.querySelector(`[data-day="${missingList[0].iso}"]`));
                  }
                }}
                className="text-left rounded-md hover:bg-muted/40 p-1 -m-1 transition-colors"
              >
                <StatBlock
                  label="Missing"
                  value={`${stats.missingDays}`}
                  sub={stats.missingDays === 0 ? "All caught up" : "Click to jump"}
                  subTone={stats.missingDays === 0 ? "success" : "destructive"}
                  icon={
                    stats.missingDays > 0 ? (
                      <AlertCircle className="h-3.5 w-3.5 text-destructive" />
                    ) : undefined
                  }
                />
              </button>
              <StatBlock
                label="Leave + holidays"
                value={`${stats.leaveDays + stats.holidayDays}`}
                sub={`${stats.leaveDays} leave · ${stats.holidayDays} holidays`}
              />
            </div>

            {stats.byCommessa.length > 0 && (
              <div className="mt-3 pt-3 border-t flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" /> Top commesse
                </span>
                {stats.byCommessa.slice(0, 4).map((c) => (
                  <button
                    key={c.commessaId}
                    onClick={() =>
                      setCommessaFilter(commessaFilter === c.commessaId ? null : c.commessaId)
                    }
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-1 rounded border text-xs transition-colors press-scale",
                      commessaFilter === c.commessaId
                        ? "bg-primary/10 border-primary/40"
                        : "hover:bg-muted/40",
                    )}
                  >
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                    <span className="font-mono text-[10px]">{c.code}</span>
                    <span className="tabular-nums font-medium">{c.hours.toFixed(0)}h</span>
                  </button>
                ))}
                {commessaFilter && (
                  <button
                    onClick={() => setCommessaFilter(null)}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline"
                  >
                    clear
                  </button>
                )}
              </div>
            )}
          </Card>

          {/* ── Legend ─────────────────────────────────────────── */}
          <button
            onClick={() => setLegendOpen((o) => !o)}
            className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
          >
            <Info className="h-3 w-3" /> {legendOpen ? "Hide" : "Show"} legend
          </button>
          {legendOpen && <Legend />}

          {/* ── Calendar grid ──────────────────────────────────── */}
          <Card className="p-2 sm:p-3">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekdays.map((w, i) => (
                <div
                  key={i}
                  className="text-[10px] uppercase tracking-wider text-muted-foreground text-center py-1.5 font-medium"
                >
                  {w}
                </div>
              ))}
            </div>
            <TooltipProvider delayDuration={350} disableHoverableContent>
              <div className="grid grid-cols-7 gap-1 stagger-in">
                {dayInfos.map((info, i) => (
                  <div key={info.iso} data-day={info.iso}>
                    <DayCell
                      info={info}
                      month={month}
                      today={today}
                      selected={selectedDay === info.iso}
                      inRange={selectedRange.some((d) => isSameDay(d, info.date))}
                      tabIndex={i === 0 ? 0 : -1}
                      commessaFilter={commessaFilter}
                      onClick={(e) => handleCellClick(info, e, e.currentTarget as HTMLElement)}
                    />
                  </div>
                ))}
              </div>
            </TooltipProvider>
          </Card>

          {/* ── Missing-days helper row ───────────────────────── */}
          {missingList.length > 0 && (
            <Card className="p-3 mt-3 border-destructive/30 bg-destructive/[0.03]">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm font-medium">
                  You have {missingList.length} missing workday{missingList.length === 1 ? "" : "s"}{" "}
                  this month
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto press-scale"
                  onClick={() => {
                    setBulkMode("fill-missing");
                    setBulkOpen(true);
                  }}
                >
                  <Sparkles className="h-3.5 w-3.5 mr-1.5 text-primary" /> Fill all
                </Button>
              </div>
              <div className="flex gap-1 flex-wrap">
                {missingList.slice(0, 12).map((d) => (
                  <button
                    key={d.iso}
                    onClick={() => {
                      setSelectedDay(d.iso);
                      setAnchorEl(document.querySelector(`[data-day="${d.iso}"] button`));
                    }}
                    className="text-[11px] font-mono px-1.5 py-0.5 rounded border bg-background hover:bg-muted press-scale"
                  >
                    {format(d.date, "MMM d")}
                  </button>
                ))}
                {missingList.length > 12 && (
                  <span className="text-[11px] text-muted-foreground px-1.5 py-0.5">
                    +{missingList.length - 12} more
                  </span>
                )}
              </div>
            </Card>
          )}
        </>
      )}

      {view === "team" && <TeamGrid days={dayInfos} teamDays={teamDays} />}

      {/* ── Peek popover ──────────────────────────────────────── */}
      <DayPeekPopover
        open={view === "mine" && selectedDay !== null && anchorEl !== null}
        anchor={anchorEl}
        info={selectedInfo}
        prevDayEntries={prevDayEntries}
        templates={templates}
        onClose={() => {
          setSelectedDay(null);
          setAnchorEl(null);
        }}
        onAdd={(data) => onAdd(data)}
        onEdit={onEdit}
        onDelete={onDelete}
        onSaveTemplate={onSaveTemplate}
        onCopyFromPrev={() => {
          if (!selectedInfo) return;
          prevDayEntries.forEach((r) =>
            onAdd({
              commessaId: r.commessaId,
              date: selectedInfo.iso,
              hours: r.hours,
              description: r.description,
              billable: r.billable,
            }),
          );
        }}
      />

      {/* ── Bulk dialog ───────────────────────────────────────── */}
      <BulkEntryDialog
        open={bulkOpen}
        mode={bulkMode}
        onModeChange={setBulkMode}
        onClose={() => {
          setBulkOpen(false);
          setRangeAnchor(null);
          setRangeEnd(null);
        }}
        employeeId={ME}
        entries={entries}
        month={month}
        selectedRange={selectedRange}
        templates={templates}
        onSubmitBatch={(rows) => onAddMany(rows)}
      />

      {/* ── AI auto-fill ─────────────────────────────────────── */}
      <TimesheetAutofillDialog
        open={autofillOpen}
        onClose={() => setAutofillOpen(false)}
        entries={entries}
        employeeId={ME}
        onAccept={(rows) => onAddMany(rows)}
      />
    </div>
  );
}

function StatBlock({
  label,
  value,
  sub,
  subTone,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  subTone?: "success" | "warn" | "destructive";
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
        {label}
      </div>
      <div className="font-mono text-2xl tabular-nums mt-0.5 flex items-center gap-1.5">
        {value}
        {icon}
      </div>
      {sub && (
        <div
          className={cn(
            "text-[11px] mt-0.5",
            subTone === "success" && "text-success",
            subTone === "warn" && "text-warning",
            subTone === "destructive" && "text-destructive",
            !subTone && "text-muted-foreground",
          )}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

function Legend() {
  const items: { status: DayStatus; label: string }[] = [
    { status: "filled", label: "Filled (≥ 8h)" },
    { status: "partial", label: "Partial (<8h)" },
    { status: "missing", label: "Missing" },
    { status: "sick", label: "Sick leave" },
    { status: "vacation", label: "Vacation" },
    { status: "personal", label: "Personal" },
    { status: "parental", label: "Parental" },
    { status: "holiday", label: "Public holiday" },
    { status: "weekend", label: "Weekend" },
    { status: "future", label: "Upcoming" },
  ];
  return (
    <Card className="p-3 mb-3 text-[11px]">
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {items.map((i) => (
          <div key={i.status} className="flex items-center gap-1.5">
            <span className={cn("h-3 w-3 rounded border", legendSwatch(i.status))} />
            <span className="text-muted-foreground">{i.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function legendSwatch(s: DayStatus): string {
  switch (s) {
    case "filled":
      return "bg-success/40 border-success/40";
    case "partial":
      return "bg-warning/40 border-warning/40";
    case "missing":
      return "bg-destructive/30 border-destructive/40";
    case "sick":
      return "bg-cal-sick/40 border-cal-sick/40";
    case "vacation":
      return "bg-cal-vacation/40 border-cal-vacation/40";
    case "personal":
      return "bg-cal-personal/40 border-cal-personal/40";
    case "parental":
      return "bg-cal-parental/40 border-cal-parental/40";
    case "holiday":
      return "bg-cal-holiday/40 border-cal-holiday/40";
    case "weekend":
      return "bg-muted border-border";
    case "future":
      return "bg-background border-dashed border-border";
  }
}

function TeamGrid({
  days,
  teamDays,
}: {
  days: DayInfo[];
  teamDays: { eid: string; days: DayInfo[] }[];
}) {
  return (
    <TooltipProvider delayDuration={100}>
      <Card className="p-0 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <div className="font-semibold text-sm">Team timesheet coverage</div>
            <div className="text-[11px] text-muted-foreground">
              One row per teammate · dot colour = dominant day state
            </div>
          </div>
        </div>
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-xs" style={{ minWidth: 640 }}>
            <thead className="bg-muted/30 text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr>
                <th
                  className="text-left px-3 py-2 sticky left-0 bg-muted/30 z-10"
                  style={{ minWidth: 180 }}
                >
                  Employee
                </th>
                {days.map((d, i) => (
                  <th
                    key={i}
                    className={cn(
                      "px-0.5 py-2 text-center font-mono font-normal",
                      !d.inMonth && "text-muted-foreground/40",
                      isSameDay(d.date, new Date()) && "text-primary font-semibold",
                    )}
                  >
                    {format(d.date, "d")}
                  </th>
                ))}
                <th className="text-right px-3 py-2 sticky right-0 bg-muted/30 z-10">Hours</th>
              </tr>
            </thead>
            <tbody>
              {teamDays.map(({ eid, days: eDays }) => {
                const emp = employeeById(eid);
                if (!emp) return null;
                const total = eDays.reduce((a, d) => a + (d.inMonth ? d.hours : 0), 0);
                return (
                  <tr key={eid} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="px-3 py-1.5 sticky left-0 bg-background z-10">
                      <div className="flex items-center gap-2">
                        <Avatar
                          initials={emp.initials}
                          color={emp.avatarColor}
                          size={24}
                          employeeId={emp.id}
                        />
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate">{emp.name}</div>
                          <div className="text-[10px] text-muted-foreground truncate">
                            {emp.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    {eDays.map((d, i) => (
                      <td key={i} className="px-0.5 py-1.5 text-center">
                        {d.inMonth ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                className={cn(
                                  "inline-block h-3 w-3 rounded-full transition-transform hover:scale-150",
                                  dotClass(d.status),
                                )}
                              />
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="text-[11px]">
                                <div className="font-medium">{format(d.date, "EEE, MMM d")}</div>
                                <div className="text-muted-foreground capitalize">
                                  {d.status}
                                  {d.hours > 0 ? ` · ${d.hours}h` : ""}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="inline-block h-3 w-3" />
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-1.5 text-right font-mono tabular-nums sticky right-0 bg-background z-10">
                      {total.toFixed(0)}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2 border-t bg-muted/20 flex items-center gap-3 flex-wrap text-[10px]">
          <LegendDot status="filled" label="Filled" />
          <LegendDot status="partial" label="Partial" />
          <LegendDot status="missing" label="Missing" />
          <LegendDot status="sick" label="Sick" />
          <LegendDot status="vacation" label="Leave" />
          <LegendDot status="holiday" label="Holiday" />
          <LegendDot status="weekend" label="Weekend" />
        </div>
      </Card>
    </TooltipProvider>
  );
}

function dotClass(s: DayStatus): string {
  switch (s) {
    case "filled":
      return "bg-success";
    case "partial":
      return "bg-warning";
    case "missing":
      return "bg-destructive";
    case "sick":
      return "bg-cal-sick";
    case "vacation":
      return "bg-cal-vacation";
    case "personal":
      return "bg-cal-personal";
    case "parental":
      return "bg-cal-parental";
    case "holiday":
      return "bg-cal-holiday";
    case "weekend":
      return "bg-muted ring-1 ring-border/60";
    case "future":
      return "bg-background ring-1 ring-border border-dashed";
  }
}

function LegendDot({ status, label }: { status: DayStatus; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-muted-foreground">
      <span className={cn("h-2 w-2 rounded-full", dotClass(status))} />
      {label}
    </span>
  );
}
