import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
  startOfDay,
  addDays,
  addMonths,
  subMonths,
  compareAsc,
  isWithinInterval,
  isAfter,
  isBefore,
  differenceInCalendarDays,
  setYear,
  getYear,
} from "date-fns";
import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Plane,
  Stethoscope,
  Cake,
  Sparkles,
  Trophy,
  ArrowRight,
  FileClock,
  ClipboardList,
  PartyPopper,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Badge } from "@pulse-hr/ui/primitives/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@pulse-hr/ui/primitives/popover";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { useGreeting } from "@/lib/current-user";
import { useEmployees } from "@/lib/tables/employees";
import { useLeaveRequests } from "@/lib/tables/leave";
import { useActivities } from "@/lib/tables/activities";
import { useTimesheetEntries } from "@/lib/tables/timesheetEntries";
import { useGcalEvents } from "@/lib/tables/gcalEvents";
import { useIntegration } from "@/lib/integrations-store";
import {
  holidaysSeed,
  type LeaveRequest,
  type Activity,
  type Holiday,
  type Employee,
  type TimesheetEntry,
  type GCalEvent,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const ME = "e1";
const VACATION_ALLOWANCE = 22;

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "My month — Pulse HR" }] }),
  component: CalendarPage,
});

type DayItem =
  | { kind: "leave"; ref: LeaveRequest; mine: boolean; tone: LeaveTone }
  | { kind: "holiday"; ref: Holiday }
  | { kind: "activity"; ref: Activity; overdue: boolean }
  | { kind: "birthday"; ref: Employee; mine: boolean }
  | { kind: "anniversary"; ref: Employee; years: number }
  | { kind: "event"; ref: GCalEvent };

type LeaveTone = "vacation" | "sick" | "personal" | "parental";

function leaveTone(t: LeaveRequest["type"]): LeaveTone {
  if (t === "Vacation") return "vacation";
  if (t === "Sick") return "sick";
  if (t === "Parental") return "parental";
  return "personal";
}

function leaveColor(tone: LeaveTone, mine: boolean) {
  if (!mine)
    return {
      bg: "color-mix(in oklch, var(--muted-foreground) 14%, transparent)",
      fg: "var(--muted-foreground)",
    };
  if (tone === "sick")
    return {
      bg: "color-mix(in oklch, var(--destructive) 16%, transparent)",
      fg: "var(--destructive)",
    };
  if (tone === "parental")
    return {
      bg: "color-mix(in oklch, var(--primary) 14%, transparent)",
      fg: "var(--primary)",
    };
  if (tone === "personal")
    return {
      bg: "color-mix(in oklch, var(--warning) 18%, transparent)",
      fg: "var(--warning)",
    };
  return {
    bg: "color-mix(in oklch, var(--primary) 18%, transparent)",
    fg: "var(--primary)",
  };
}

function holidayColor() {
  return {
    bg: "color-mix(in oklch, var(--success) 14%, transparent)",
    fg: "var(--success)",
  };
}

function activityColor(overdue: boolean) {
  return overdue
    ? {
        bg: "color-mix(in oklch, var(--destructive) 16%, transparent)",
        fg: "var(--destructive)",
      }
    : {
        bg: "color-mix(in oklch, var(--warning) 18%, transparent)",
        fg: "var(--warning)",
      };
}

function birthdayColor() {
  return {
    bg: "color-mix(in oklch, var(--labs) 18%, transparent)",
    fg: "var(--labs)",
  };
}

function eventColor() {
  return {
    bg: "color-mix(in oklch, var(--ring) 14%, transparent)",
    fg: "var(--foreground)",
  };
}

function itemColor(item: DayItem) {
  if (item.kind === "leave") return leaveColor(item.tone, item.mine);
  if (item.kind === "holiday") return holidayColor();
  if (item.kind === "activity") return activityColor(item.overdue);
  if (item.kind === "birthday" || item.kind === "anniversary") return birthdayColor();
  return eventColor();
}

function itemTitle(item: DayItem) {
  if (item.kind === "leave") {
    const half =
      item.ref.granularity === "half" ? ` (${item.ref.halfPeriod})` : "";
    const who = item.mine ? "You" : "Colleague";
    return `${who} • ${item.ref.type}${half}`;
  }
  if (item.kind === "holiday") return item.ref.name;
  if (item.kind === "activity") return item.ref.title;
  if (item.kind === "birthday")
    return `${item.ref.name.split(" ")[0]} — birthday`;
  if (item.kind === "anniversary")
    return `${item.ref.name.split(" ")[0]} — ${item.years}y at the company`;
  return item.ref.title;
}

function itemIcon(item: DayItem) {
  if (item.kind === "leave") {
    if (item.tone === "sick") return <Stethoscope className="h-3 w-3" />;
    if (item.tone === "parental") return <Sparkles className="h-3 w-3" />;
    return <Plane className="h-3 w-3" />;
  }
  if (item.kind === "holiday") return <PartyPopper className="h-3 w-3" />;
  if (item.kind === "activity")
    return item.overdue ? (
      <AlertTriangle className="h-3 w-3" />
    ) : (
      <ClipboardList className="h-3 w-3" />
    );
  if (item.kind === "birthday") return <Cake className="h-3 w-3" />;
  if (item.kind === "anniversary") return <Trophy className="h-3 w-3" />;
  return <CalendarClock className="h-3 w-3" />;
}

function CalendarPage() {
  const greeting = useGreeting();
  const employees = useEmployees();
  const leaves = useLeaveRequests();
  const activities = useActivities();
  const timesheets = useTimesheetEntries();
  const events = useGcalEvents();
  const gcal = useIntegration("google-calendar");
  const gcalConnected = gcal.status === "connected";

  const today = useMemo(() => startOfDay(new Date()), []);
  const [cursor, setCursor] = useState<Date>(startOfMonth(today));
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd],
  );

  const itemsForDay = useMemo(
    () => buildItemsForDay({ leaves, activities, employees, events, today }),
    [leaves, activities, employees, events, today],
  );

  const myDraftEntries = timesheets.filter(
    (t) => t.employeeId === ME && t.status === "draft",
  );
  const myPendingLeaves = leaves.filter(
    (l) => l.employeeId === ME && l.status === "pending",
  );
  const myActivities = activities.filter((a) => a.assigneeId === ME);
  const overdueActivities = myActivities.filter(
    (a) => a.endDate && a.status !== "done" && parseISO(a.endDate) < today,
  );
  const dueThisWeek = myActivities.filter((a) => {
    if (!a.endDate || a.status === "done") return false;
    const end = parseISO(a.endDate);
    return isWithinInterval(end, {
      start: today,
      end: addDays(today, 7),
    });
  });

  const myApprovedLeaves = leaves.filter(
    (l) => l.employeeId === ME && l.status === "approved",
  );
  const usedYearTo = myApprovedLeaves
    .filter(
      (l) =>
        l.type === "Vacation" || l.type === "Personal" || l.type === "Parental",
    )
    .reduce((sum, l) => sum + (l.type === "Vacation" ? l.days : 0), 0);
  const balance = Math.max(0, VACATION_ALLOWANCE - usedYearTo);

  const outToday = leaves.filter(
    (l) =>
      l.status === "approved" &&
      l.employeeId !== ME &&
      isWithinInterval(today, {
        start: startOfDay(parseISO(l.from)),
        end: startOfDay(parseISO(l.to)),
      }),
  );

  const upcomingBirthdays = useMemo(
    () => birthdaysIn(employees, today, 14).filter((b) => b.employee.id !== ME),
    [employees, today],
  );

  const ambient = useMemo(() => {
    const bits: string[] = [];
    if (outToday.length)
      bits.push(
        `${outToday.length} ${outToday.length === 1 ? "colleague" : "colleagues"} out today`,
      );
    if (upcomingBirthdays.length)
      bits.push(
        `${upcomingBirthdays.length} birthday${upcomingBirthdays.length === 1 ? "" : "s"} this fortnight`,
      );
    if (overdueActivities.length)
      bits.push(`${overdueActivities.length} overdue activity`);
    return bits.length ? bits.join(" · ") : "Nothing to flag — enjoy the calm.";
  }, [outToday.length, upcomingBirthdays.length, overdueActivities.length]);

  const upcoming = useMemo(
    () => buildUpcoming(itemsForDay, today, 14),
    [itemsForDay, today],
  );

  const upcomingHolidays = useMemo(
    () =>
      holidaysSeed
        .map((h) => ({ ...h, parsed: parseISO(h.date) }))
        .filter((h) => h.parsed >= today)
        .sort((a, b) => compareAsc(a.parsed, b.parsed))
        .slice(0, 5),
    [today],
  );

  return (
    <div className="p-4 md:p-6 space-y-5 fade-in">
      <PageHeader
        eyebrow="WORK · CALENDARIO · IL TUO MESE"
        title={greeting}
        description={ambient}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link to="/leave">Request leave</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/time">Submit timesheet</Link>
            </Button>
          </div>
        }
      />

      <ActionBanner
        drafts={myDraftEntries}
        pendingLeaves={myPendingLeaves}
        overdue={overdueActivities}
        dueThisWeek={dueThisWeek}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3 p-4">
          <MonthHeader
            cursor={cursor}
            today={today}
            onPrev={() => setCursor((c) => subMonths(c, 1))}
            onNext={() => setCursor((c) => addMonths(c, 1))}
            onToday={() => setCursor(startOfMonth(today))}
          />
          <MonthGrid
            days={days}
            cursor={cursor}
            today={today}
            itemsForDay={itemsForDay}
            onSelect={setSelectedDay}
          />
          <Legend gcalConnected={gcalConnected} />
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Coming up</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Next 14 days · what to expect
              </div>
            </div>
            <Badge
              variant="outline"
              className="text-[10px] bg-success/10 text-success border-success/30"
            >
              <span
                className="pulse-dot mr-1.5"
                style={{ backgroundColor: "var(--success)" }}
              />
              Live
            </Badge>
          </div>
          <ComingUpList groups={upcoming} today={today} />
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-semibold text-sm">Time-off balance</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Year {getYear(today)} — based on approved requests
              </div>
            </div>
            <Link
              to="/leave"
              className="text-xs text-muted-foreground hover:text-foreground font-medium underline-offset-4 hover:underline"
            >
              Manage →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <BalancePill
              label="Vacation left"
              value={balance}
              suffix="days"
              tone="primary"
            />
            <BalancePill
              label="Used"
              value={usedYearTo}
              suffix={`/ ${VACATION_ALLOWANCE}`}
              tone="muted"
            />
            <BalancePill
              label="Pending"
              value={myPendingLeaves.reduce((s, l) => s + l.days, 0)}
              suffix="days"
              tone="warning"
            />
            <BalancePill
              label="Sick (yr)"
              value={myApprovedLeaves
                .filter((l) => l.type === "Sick")
                .reduce((s, l) => s + l.days, 0)}
              suffix="days"
              tone="muted"
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">Upcoming holidays</div>
            <span className="text-xs text-muted-foreground">IT calendar</span>
          </div>
          {upcomingHolidays.length === 0 ? (
            <div className="text-xs text-muted-foreground">
              None in the next stretch.
            </div>
          ) : (
            <ul className="space-y-2">
              {upcomingHolidays.map((h) => {
                const inDays = differenceInCalendarDays(h.parsed, today);
                return (
                  <li
                    key={h.date}
                    className="flex items-center gap-3 text-sm group"
                  >
                    <div className="w-12 shrink-0 text-center">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {format(h.parsed, "MMM")}
                      </div>
                      <div className="text-base font-semibold leading-tight">
                        {format(h.parsed, "d")}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{h.name}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {inDays === 0
                          ? "Today"
                          : inDays === 1
                            ? "Tomorrow"
                            : `In ${inDays} days`}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>

      <SidePanel
        open={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        title={selectedDay ? format(selectedDay, "EEEE d MMMM") : ""}
      >
        {selectedDay && (
          <DayDetail
            day={selectedDay}
            items={itemsForDay(selectedDay)}
            timesheet={timesheets.filter(
              (t) => t.employeeId === ME && isSameDay(parseISO(t.date), selectedDay),
            )}
          />
        )}
      </SidePanel>
    </div>
  );
}

function buildItemsForDay(input: {
  leaves: LeaveRequest[];
  activities: Activity[];
  employees: Employee[];
  events: GCalEvent[];
  today: Date;
}) {
  const { leaves, activities, employees, events, today } = input;
  return (day: Date): DayItem[] => {
    const out: DayItem[] = [];
    for (const l of leaves) {
      if (l.status === "rejected") continue;
      const from = startOfDay(parseISO(l.from));
      const to = startOfDay(parseISO(l.to));
      if (isWithinInterval(day, { start: from, end: to })) {
        out.push({
          kind: "leave",
          ref: l,
          mine: l.employeeId === ME,
          tone: leaveTone(l.type),
        });
      }
    }
    for (const h of holidaysSeed) {
      if (isSameDay(parseISO(h.date), day)) out.push({ kind: "holiday", ref: h });
    }
    for (const a of activities) {
      if (!a.endDate || a.assigneeId !== ME || a.status === "done") continue;
      const end = startOfDay(parseISO(a.endDate));
      if (isSameDay(end, day)) {
        out.push({ kind: "activity", ref: a, overdue: end < today });
      }
    }
    for (const e of employees) {
      if (!e.birthday) continue;
      const [m, d] = e.birthday.split("-").map(Number);
      const dayMatch = day.getMonth() + 1 === m && day.getDate() === d;
      if (dayMatch) out.push({ kind: "birthday", ref: e, mine: e.id === ME });
      const j = parseISO(e.joinDate);
      const yearOnDay = setYear(j, getYear(day));
      if (isSameDay(yearOnDay, day) && !isSameDay(j, day)) {
        const years = getYear(day) - getYear(j);
        if (years > 0)
          out.push({ kind: "anniversary", ref: e, years });
      }
    }
    for (const ev of events) {
      const start = parseISO(ev.start);
      const isMine = ev.attendees.includes(ME);
      if (isMine && isSameDay(start, day)) out.push({ kind: "event", ref: ev });
    }
    return out;
  };
}

function buildUpcoming(
  itemsForDay: (d: Date) => DayItem[],
  today: Date,
  windowDays: number,
) {
  const groups: { label: string; date: Date; items: DayItem[] }[] = [];
  for (let i = 0; i < windowDays; i++) {
    const d = addDays(today, i);
    const items = itemsForDay(d);
    if (items.length === 0) continue;
    const label =
      i === 0 ? "Today" : i === 1 ? "Tomorrow" : format(d, "EEE d MMM");
    groups.push({ label, date: d, items });
  }
  return groups;
}

function birthdaysIn(employees: Employee[], today: Date, windowDays: number) {
  const end = addDays(today, windowDays);
  return employees
    .filter((e) => !!e.birthday)
    .map((e) => {
      const [m, d] = e.birthday!.split("-").map(Number);
      let next = setYear(new Date(getYear(today), m - 1, d), getYear(today));
      if (isBefore(next, today)) next = setYear(next, getYear(today) + 1);
      return { employee: e, next };
    })
    .filter((x) => isAfter(x.next, addDays(today, -1)) && isBefore(x.next, end))
    .sort((a, b) => compareAsc(a.next, b.next));
}

function ActionBanner({
  drafts,
  pendingLeaves,
  overdue,
  dueThisWeek,
}: {
  drafts: TimesheetEntry[];
  pendingLeaves: LeaveRequest[];
  overdue: Activity[];
  dueThisWeek: Activity[];
}) {
  const draftHours = drafts.reduce((s, t) => s + t.hours, 0);
  const draftDays = new Set(drafts.map((t) => t.date)).size;
  const items: {
    icon: React.ReactNode;
    title: React.ReactNode;
    body: string;
    cta: { label: string; to: string };
    tone: "warning" | "primary" | "destructive";
  }[] = [];

  if (drafts.length > 0) {
    items.push({
      icon: <FileClock className="h-4 w-4" />,
      title: (
        <>
          {draftHours}h in <strong>draft</strong> across {draftDays}{" "}
          {draftDays === 1 ? "day" : "days"}
        </>
      ),
      body: "Submit your timesheet before approval cut-off.",
      cta: { label: "Open timesheet", to: "/time" },
      tone: "warning",
    });
  }
  if (pendingLeaves.length > 0) {
    items.push({
      icon: <Clock className="h-4 w-4" />,
      title: (
        <>
          {pendingLeaves.length} leave{" "}
          {pendingLeaves.length === 1 ? "request" : "requests"} pending
        </>
      ),
      body: pendingLeaves
        .map((l) => `${l.type} ${format(parseISO(l.from), "d MMM")}`)
        .slice(0, 2)
        .join(" · "),
      cta: { label: "Track status", to: "/leave" },
      tone: "primary",
    });
  }
  if (overdue.length > 0) {
    items.push({
      icon: <AlertTriangle className="h-4 w-4" />,
      title: (
        <>
          {overdue.length} activity{" "}
          {overdue.length === 1 ? "is" : "are"} <strong>overdue</strong>
        </>
      ),
      body: overdue.map((a) => a.title).slice(0, 2).join(" · "),
      cta: { label: "Catch up", to: "/activities" },
      tone: "destructive",
    });
  } else if (dueThisWeek.length > 0) {
    items.push({
      icon: <ClipboardList className="h-4 w-4" />,
      title: (
        <>
          {dueThisWeek.length} activity due this week
        </>
      ),
      body: dueThisWeek.map((a) => a.title).slice(0, 2).join(" · "),
      cta: { label: "View activities", to: "/activities" },
      tone: "warning",
    });
  }

  if (items.length === 0) {
    return (
      <Card className="p-4 flex items-center gap-3 border-success/30 bg-success/5">
        <div className="h-9 w-9 rounded-full bg-success/15 text-success flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <div className="text-sm">
          You're all caught up. Timesheet is in, no overdue work, no pending
          leave to chase.
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 stagger-in">
      {items.map((it, idx) => (
        <Card
          key={idx}
          className={cn(
            "p-4 flex items-start gap-3 border-l-4",
            it.tone === "warning" && "border-l-warning",
            it.tone === "primary" && "border-l-primary",
            it.tone === "destructive" && "border-l-destructive",
          )}
        >
          <div
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
              it.tone === "warning" && "bg-warning/15 text-warning",
              it.tone === "primary" && "bg-primary/15 text-primary",
              it.tone === "destructive" && "bg-destructive/15 text-destructive",
            )}
          >
            {it.icon}
          </div>
          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-sm">{it.title}</div>
            <div className="text-xs text-muted-foreground line-clamp-2">
              {it.body}
            </div>
            <div className="pt-1">
              <Link
                to={it.cta.to}
                className="text-xs font-medium text-foreground inline-flex items-center gap-1 hover:underline underline-offset-4"
              >
                {it.cta.label}
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function MonthHeader({
  cursor,
  today,
  onPrev,
  onNext,
  onToday,
}: {
  cursor: Date;
  today: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  const isCurrentMonth = isSameDay(startOfMonth(cursor), startOfMonth(today));
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="text-base font-semibold">{format(cursor, "MMMM yyyy")}</div>
        {!isCurrentMonth && (
          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={onToday}>
            Today
          </Button>
        )}
      </div>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onPrev}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function MonthGrid({
  days,
  cursor,
  today,
  itemsForDay,
  onSelect,
}: {
  days: Date[];
  cursor: Date;
  today: Date;
  itemsForDay: (d: Date) => DayItem[];
  onSelect: (d: Date) => void;
}) {
  const MAX = 3;
  return (
    <>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div
            key={d}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1.5"
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((day) => {
          const inMonth = isSameMonth(day, cursor);
          const isToday = isSameDay(day, today);
          const isWeekend = day.getDay() === 0 || day.getDay() === 6;
          const items = itemsForDay(day);
          const visible = items.slice(0, MAX);
          const overflow = items.length - visible.length;
          const dayBtn = (
            <button
              type="button"
              onClick={() => onSelect(day)}
              className={cn(
                "min-h-[88px] w-full border rounded-md p-1 flex flex-col gap-0.5 transition-colors text-left press-scale",
                inMonth ? "bg-background" : "bg-muted/20 text-muted-foreground/40",
                isWeekend && inMonth && "bg-muted/15",
                isToday && "ring-2 ring-primary/60 ring-offset-1 ring-offset-background",
                "hover:bg-muted/30",
              )}
            >
              <div
                className={cn(
                  "text-[11px] leading-none px-1 pt-0.5 pb-1 flex items-center justify-between",
                  isToday && "font-semibold text-primary",
                )}
              >
                <span>{format(day, "d")}</span>
                {items.length > 0 && (
                  <span className="text-[9px] font-medium text-muted-foreground tabular-nums">
                    {items.length}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-0.5 min-h-0">
                {visible.map((item, i) => {
                  const c = itemColor(item);
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate"
                      style={{ backgroundColor: c.bg, color: c.fg }}
                    >
                      <span className="shrink-0 opacity-90">{itemIcon(item)}</span>
                      <span className="truncate">{itemTitle(item)}</span>
                    </div>
                  );
                })}
                {overflow > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1">
                    +{overflow} more
                  </div>
                )}
              </div>
            </button>
          );
          if (items.length === 0) return <div key={day.toISOString()}>{dayBtn}</div>;
          return (
            <Popover key={day.toISOString()}>
              <PopoverTrigger asChild>
                <div
                  onClick={(ev) => {
                    if (ev.detail === 2) onSelect(day);
                  }}
                >
                  {dayBtn}
                </div>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-72 p-0"
                onOpenAutoFocus={(e) => e.preventDefault()}
              >
                <div className="px-3 py-2.5 border-b flex items-center justify-between">
                  <div className="text-sm font-semibold">
                    {format(day, "EEEE d MMM")}
                  </div>
                  <button
                    onClick={() => onSelect(day)}
                    className="text-[11px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                  >
                    Open
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="p-2 space-y-1.5 max-h-72 overflow-y-auto">
                  {items.map((it, i) => (
                    <DayItemRow key={i} item={it} dense />
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          );
        })}
      </div>
    </>
  );
}

function Legend({ gcalConnected }: { gcalConnected: boolean }) {
  const swatches: { label: string; tone: { bg: string; fg: string } }[] = [
    { label: "Your leave", tone: leaveColor("vacation", true) },
    { label: "Sick", tone: leaveColor("sick", true) },
    { label: "Team out", tone: leaveColor("vacation", false) },
    { label: "Holiday", tone: holidayColor() },
    { label: "Activity due", tone: activityColor(false) },
    { label: "Birthday", tone: birthdayColor() },
  ];
  if (gcalConnected) swatches.push({ label: "Meeting", tone: eventColor() });
  return (
    <div className="mt-3 pt-3 border-t flex items-center gap-3 flex-wrap">
      {swatches.map((s) => (
        <span
          key={s.label}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground"
        >
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: s.tone.bg }}
          />
          {s.label}
        </span>
      ))}
    </div>
  );
}

function ComingUpList({
  groups,
  today,
}: {
  groups: { label: string; date: Date; items: DayItem[] }[];
  today: Date;
}) {
  if (groups.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          tone="welcome"
          title="A clean fortnight"
          description="No leave, no holidays, no due activities. Pick something from the backlog or go for a walk."
          icon={<Sparkles className="h-5 w-5" />}
        />
      </div>
    );
  }
  return (
    <div className="divide-y max-h-[560px] overflow-y-auto">
      {groups.map((g) => {
        const inDays = differenceInCalendarDays(g.date, today);
        return (
          <div key={g.date.toISOString()} className="px-5 py-3">
            <div className="flex items-baseline justify-between mb-2">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {g.label}
              </div>
              <div className="text-[10px] text-muted-foreground">
                {inDays === 0
                  ? "now"
                  : inDays === 1
                    ? "tomorrow"
                    : `in ${inDays}d`}
              </div>
            </div>
            <ul className="space-y-1.5">
              {g.items.map((it, i) => (
                <li key={i}>
                  <DayItemRow item={it} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

function DayItemRow({ item, dense = false }: { item: DayItem; dense?: boolean }) {
  const c = itemColor(item);
  const sub = itemSubtitle(item);
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-md",
        dense ? "px-2 py-1.5" : "px-2.5 py-1.5",
      )}
    >
      <div
        className="h-6 w-6 rounded-md flex items-center justify-center shrink-0"
        style={{ backgroundColor: c.bg, color: c.fg }}
      >
        {itemIcon(item)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{itemTitle(item)}</div>
        {sub && (
          <div className="text-[11px] text-muted-foreground truncate">{sub}</div>
        )}
      </div>
    </div>
  );
}

function itemSubtitle(item: DayItem): string | null {
  if (item.kind === "leave") {
    if (item.ref.granularity === "half")
      return `Half day · ${item.ref.halfPeriod}`;
    const days = item.ref.days;
    return `${days} day${days === 1 ? "" : "s"} · ${item.ref.status}`;
  }
  if (item.kind === "holiday") return item.ref.country.toUpperCase();
  if (item.kind === "activity") return item.overdue ? "Overdue" : "Due today";
  if (item.kind === "birthday") return "Send a kudos";
  if (item.kind === "anniversary") return `Joined ${item.ref.joinDate}`;
  if (item.kind === "event")
    return `${format(parseISO(item.ref.start), "HH:mm")}–${format(parseISO(item.ref.end), "HH:mm")}${item.ref.location ? " · " + item.ref.location : ""}`;
  return null;
}

function DayDetail({
  day,
  items,
  timesheet,
}: {
  day: Date;
  items: DayItem[];
  timesheet: TimesheetEntry[];
}) {
  const totalLogged = timesheet.reduce((s, t) => s + t.hours, 0);
  const draftCount = timesheet.filter((t) => t.status === "draft").length;
  const isHoliday = items.some((i) => i.kind === "holiday");
  const onLeave = items.some((i) => i.kind === "leave" && i.mine);
  return (
    <div className="p-5 space-y-5">
      <div className="rounded-lg border bg-muted/30 p-3 flex items-start gap-3">
        <div className="h-10 w-10 rounded-md bg-background flex flex-col items-center justify-center shrink-0">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            {format(day, "MMM")}
          </div>
          <div className="text-sm font-semibold leading-tight">
            {format(day, "d")}
          </div>
        </div>
        <div className="flex-1 min-w-0 text-sm">
          {isHoliday ? (
            <span>Public holiday — no work expected.</span>
          ) : onLeave ? (
            <span>You're off this day. Out of office is set.</span>
          ) : totalLogged > 0 ? (
            <span>
              <strong>{totalLogged}h</strong> logged
              {draftCount > 0 ? (
                <>
                  {" "}
                  · <span className="text-warning">{draftCount} draft</span>
                </>
              ) : null}
              .
            </span>
          ) : (
            <span className="text-muted-foreground">
              Nothing logged for this day.
            </span>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-sm text-muted-foreground">
          A quiet day. Nothing scheduled.
        </div>
      ) : (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            What's on
          </div>
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <li key={i}>
                <DayItemRow item={it} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {timesheet.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
            Timesheet
          </div>
          <ul className="space-y-1.5">
            {timesheet.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-2"
              >
                <Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="truncate">{t.description}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t.hours}h · {t.status}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="pt-2 border-t flex items-center justify-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link to="/leave">Request leave</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/time">Open timesheet</Link>
        </Button>
      </div>
    </div>
  );
}

function BalancePill({
  label,
  value,
  suffix,
  tone,
}: {
  label: string;
  value: number;
  suffix: string;
  tone: "primary" | "warning" | "muted";
}) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        tone === "primary" && "bg-primary/5 border-primary/20",
        tone === "warning" && "bg-warning/5 border-warning/20",
        tone === "muted" && "bg-muted/30",
      )}
    >
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1">
        <span
          className={cn(
            "text-2xl font-semibold tabular-nums",
            tone === "primary" && "text-primary",
            tone === "warning" && "text-warning",
          )}
        >
          {value}
        </span>
        <span className="text-[11px] text-muted-foreground">{suffix}</span>
      </div>
    </div>
  );
}

