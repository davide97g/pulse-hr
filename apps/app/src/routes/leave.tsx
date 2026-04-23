import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Plus,
  Check,
  X,
  Calendar,
  Trash2,
  CalendarOff,
  Plane,
  Thermometer,
  User,
  Baby,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  format,
  parseISO,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@pulse-hr/ui/atoms/SidePanel";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { useQuickAction } from "@/components/app/QuickActions";
import { type LeaveRequest } from "@/lib/mock-data";
import { leaveTable, useLeaveRequests } from "@/lib/tables/leave";
import { employeeById } from "@/lib/tables/employees";
import { useBulkSelect, BulkBar, RowCheckbox, HeaderCheckbox } from "@/components/app/bulk";
import { useSavedViews } from "@/lib/useSavedViews";
import { SavedViewsBar } from "@/components/app/SavedViewsBar";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/leave")({
  head: () => ({ meta: [{ title: "Leave — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Leave,
});

function Leave() {
  const list = useLeaveRequests();
  const [selId, setSelId] = useUrlParam("sel");
  const selected = selId ? (list.find((l) => l.id === selId) ?? null) : null;
  const setSelected = (l: LeaveRequest | null) => setSelId(l?.id ?? null);
  const [toDelete, setToDelete] = useState<LeaveRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const { open: openAction } = useQuickAction();
  const leaveViews = useSavedViews<{ tab: string }>("leave", {
    defaults: { tab: "pending" },
    schema: { tab: "string" },
  });
  const activeTab = leaveViews.state.tab || "pending";
  const setTab = (t: string) => leaveViews.setState({ tab: t });

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const decide = (id: string, status: "approved" | "rejected") => {
    const before = leaveTable.getAll().find((l) => l.id === id);
    if (!before) return;
    leaveTable.update(id, { status });
    const e = employeeById(before.employeeId);
    const undo = () => leaveTable.update(id, { status: before.status });
    if (status === "approved") {
      toast.success(`Approved leave for ${e?.name ?? "employee"}`, {
        action: { label: "Undo", onClick: undo },
      });
    } else {
      toast.error(`Rejected leave for ${e?.name ?? "employee"}`, {
        action: { label: "Undo", onClick: undo },
      });
    }
  };

  const remove = (l: LeaveRequest) => {
    leaveTable.remove(l.id);
    if (selId === l.id) setSelId(null);
    toast("Request deleted", {
      action: { label: "Undo", onClick: () => leaveTable.add(l) },
    });
  };

  const filtered = (status: string) => list.filter((l) => l.status === status);

  const pendingRows = filtered("pending");
  const bulk = useBulkSelect(pendingRows);

  const bulkApprove = () => {
    const ids = [...bulk.selected];
    const snapshot = ids
      .map((id) => leaveTable.getAll().find((l) => l.id === id))
      .filter((l): l is LeaveRequest => !!l);
    for (const id of ids) leaveTable.update(id, { status: "approved" });
    bulk.clear();
    toast.success(`Approved ${ids.length} request${ids.length === 1 ? "" : "s"}`, {
      action: {
        label: "Undo",
        onClick: () => {
          for (const l of snapshot) leaveTable.update(l.id, { status: l.status });
        },
      },
    });
  };
  const bulkReject = () => {
    const ids = [...bulk.selected];
    const snapshot = ids
      .map((id) => leaveTable.getAll().find((l) => l.id === id))
      .filter((l): l is LeaveRequest => !!l);
    for (const id of ids) leaveTable.update(id, { status: "rejected" });
    bulk.clear();
    toast.error(`Rejected ${ids.length} request${ids.length === 1 ? "" : "s"}`, {
      action: {
        label: "Undo",
        onClick: () => {
          for (const l of snapshot) leaveTable.update(l.id, { status: l.status });
        },
      },
    });
  };
  const approveAllVisible = () => {
    const snapshot = pendingRows.slice();
    if (snapshot.length === 0) return;
    for (const l of snapshot) leaveTable.update(l.id, { status: "approved" });
    toast.success(`Approved ${snapshot.length} request${snapshot.length === 1 ? "" : "s"}`, {
      action: {
        label: "Undo",
        onClick: () => {
          for (const l of snapshot) leaveTable.update(l.id, { status: l.status });
        },
      },
    });
  };

  useEffect(() => {
    if (activeTab !== "pending") return;
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if ((e.target as HTMLElement | null)?.isContentEditable) return;
      if (e.key === "A" && e.shiftKey) {
        e.preventDefault();
        approveAllVisible();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, pendingRows]);

  const bulkDelete = () => {
    const rows = bulk.selectedRows;
    for (const r of rows) leaveTable.remove(r.id);
    bulk.clear();
    toast(`Deleted ${rows.length} request${rows.length === 1 ? "" : "s"}`, {
      action: {
        label: "Undo",
        onClick: () => {
          for (const r of rows) leaveTable.add(r);
        },
      },
    });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Leave"
        description="Manage leave requests, balances and the team calendar"
        actions={
          <Button size="sm" onClick={() => openAction("request-leave")}>
            <Plus className="h-4 w-4 mr-1.5" />
            Request leave
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {[
          { label: "Vacation", value: "12 / 25", color: "var(--cal-vacation)" },
          { label: "Sick", value: "2 / 10", color: "var(--cal-sick)" },
          { label: "Personal", value: "1 / 5", color: "var(--muted-foreground)" },
          { label: "Carry over", value: "3 days", color: "var(--success)" },
        ].map((b) => (
          <Card key={b.label} className="p-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: b.color }} />
              {b.label}
            </div>
            <div className="text-2xl font-semibold mt-1">{b.value}</div>
          </Card>
        ))}
      </div>

      <SavedViewsBar
        savedViews={leaveViews.savedViews}
        activeViewId={leaveViews.activeViewId}
        isDirty={leaveViews.isDirty}
        shareUrl={leaveViews.shareUrl}
        onApply={leaveViews.apply}
        onSave={leaveViews.save}
        onRemove={leaveViews.remove}
        onRename={leaveViews.rename}
        onReset={leaveViews.reset}
        placeholder="Pin a leave tab (pending / approved / calendar) as a bookmarkable link."
      />

      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending">Pending ({filtered("pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({filtered("approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({filtered("rejected").length})</TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Calendar
          </TabsTrigger>
        </TabsList>

        {(["pending", "approved", "rejected"] as const).map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
              {loading ? (
                <SkeletonRows rows={4} />
              ) : filtered(tab).length === 0 ? (
                <EmptyState
                  compact
                  icon={<CalendarOff className="h-6 w-6" />}
                  title={`No ${tab} requests`}
                  description={tab === "pending" ? "You're all caught up." : "Nothing here yet."}
                  action={
                    tab === "pending" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAction("request-leave")}
                      >
                        <Plus className="h-4 w-4 mr-1.5" />
                        Request leave
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                <>
                  {tab === "pending" && (
                    <div className="px-3 sm:px-5 py-2.5 border-b bg-muted/20 flex items-center gap-3 text-xs text-muted-foreground">
                      <HeaderCheckbox
                        allSelected={bulk.allSelected}
                        someSelected={bulk.someSelected}
                        onToggle={() => bulk.toggleAll()}
                      />
                      <span className="truncate">
                        {bulk.count > 0 ? (
                          <>
                            {bulk.count} of {pendingRows.length} selected
                          </>
                        ) : (
                          <>
                            <span className="hidden sm:inline">
                              Select rows to approve or reject in bulk
                            </span>
                            <span className="sm:hidden">Select rows for bulk actions</span>
                          </>
                        )}
                      </span>
                    </div>
                  )}
                  <div className="divide-y stagger-in">
                    {filtered(tab).map((l) => {
                      const e = employeeById(l.employeeId)!;
                      const selected = tab === "pending" && bulk.isSelected(l.id);
                      return (
                        <div
                          key={l.id}
                          tabIndex={tab === "pending" ? 0 : -1}
                          className={`group px-3 sm:px-5 py-3 flex items-center gap-2 sm:gap-3 hover:bg-muted/40 cursor-pointer transition-colors focus:outline-none focus-visible:bg-primary/[0.04] focus-visible:ring-2 focus-visible:ring-primary/30 ${selected ? "bg-primary/[0.04]" : ""}`}
                          onClick={() => setSelected(l)}
                          onKeyDown={
                            tab === "pending"
                              ? (e) => {
                                  if (e.metaKey || e.ctrlKey || e.altKey) return;
                                  if (e.key === "a" && !e.shiftKey) {
                                    e.preventDefault();
                                    decide(l.id, "approved");
                                  } else if (e.key === "r" && !e.shiftKey) {
                                    e.preventDefault();
                                    decide(l.id, "rejected");
                                  }
                                }
                              : undefined
                          }
                        >
                          {tab === "pending" && (
                            <RowCheckbox
                              checked={selected}
                              onChange={() => bulk.toggle(l.id)}
                              visibleWhen={bulk.count > 0 ? "always" : "hover-or-selected"}
                            />
                          )}
                          <Avatar
                            initials={e.initials}
                            color={e.avatarColor}
                            size={32}
                            employeeId={e.id}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm flex items-center gap-1.5 min-w-0">
                              <span className="truncate">{e.name}</span>
                              {l.granularity === "half" && (
                                <span className="hidden sm:inline-flex items-center gap-0.5 text-[9px] uppercase tracking-wider font-mono px-1.5 py-0.5 rounded border bg-muted/60 text-muted-foreground shrink-0">
                                  Half · {l.halfPeriod}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {l.type} · {l.days}d
                              {l.granularity === "half" ? ` ${l.halfPeriod}` : ""} · {l.from}
                              {l.granularity === "half" ? "" : ` → ${l.to}`}
                            </div>
                          </div>
                          <span className="hidden sm:inline-flex shrink-0">
                            <StatusBadge status={l.status} />
                          </span>
                          {tab === "pending" ? (
                            <div
                              className="flex gap-1 shrink-0"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 press-scale"
                                onClick={() => decide(l.id, "rejected")}
                                aria-label="Reject"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-8 px-2 sm:px-3 bg-success text-success-foreground hover:bg-success/90 press-scale"
                                onClick={() => decide(l.id, "approved")}
                                aria-label="Approve"
                              >
                                <Check className="h-4 w-4 sm:mr-1" />
                                <span className="hidden sm:inline">Approve</span>
                              </Button>
                            </div>
                          ) : (
                            <div
                              className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => setToDelete(l)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {tab === "pending" && (
                    <BulkBar
                      count={bulk.count}
                      onClear={bulk.clear}
                      noun="request"
                      actions={[
                        {
                          label: "Approve all",
                          icon: <Check className="h-3.5 w-3.5" />,
                          onClick: bulkApprove,
                          tone: "success",
                        },
                        {
                          label: "Reject all",
                          icon: <X className="h-3.5 w-3.5" />,
                          onClick: bulkReject,
                        },
                        {
                          label: "Delete",
                          icon: <Trash2 className="h-3.5 w-3.5" />,
                          onClick: bulkDelete,
                          tone: "destructive",
                        },
                      ]}
                    />
                  )}
                </>
              )}
            </Card>
          </TabsContent>
        ))}

        <TabsContent value="calendar" className="mt-4">
          <LeaveCalendar
            requests={list.filter((l) => l.status !== "rejected")}
            onSelect={setSelected}
          />
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete leave request?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete &&
                `${toDelete.days} day${toDelete.days > 1 ? "s" : ""} of ${toDelete.type} will be removed.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) remove(toDelete);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title="Leave request">
        {selected &&
          (() => {
            const e = employeeById(selected.employeeId)!;
            return (
              <div className="p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar initials={e.initials} color={e.avatarColor} size={48} employeeId={e.id} />
                  <div>
                    <div className="font-semibold">{e.name}</div>
                    <div className="text-xs text-muted-foreground">{e.role}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Type" value={selected.type} />
                  <Field label="Days" value={`${selected.days}`} />
                  <Field label="From" value={selected.from} />
                  <Field label="To" value={selected.to} />
                  <Field label="Submitted" value={selected.submittedAt} />
                  <Field label="Status" value={<StatusBadge status={selected.status} />} />
                </div>
                <div className="mt-4">
                  <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
                    Reason
                  </div>
                  <div className="text-sm p-3 rounded-md bg-muted/40">{selected.reason}</div>
                </div>
                {selected.status === "pending" && (
                  <div className="flex gap-2 mt-5">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => decide(selected.id, "rejected")}
                    >
                      <X className="h-4 w-4 mr-1.5" />
                      Reject
                    </Button>
                    <Button
                      className="flex-1 bg-success hover:bg-success/90 text-white"
                      onClick={() => decide(selected.id, "approved")}
                    >
                      <Check className="h-4 w-4 mr-1.5" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            );
          })()}
      </SidePanel>
    </div>
  );
}

const LEAVE_STYLE: Record<
  LeaveRequest["type"],
  { icon: typeof Plane; bg: string; fg: string; label: string }
> = {
  Vacation: {
    icon: Plane,
    bg: "color-mix(in oklch, var(--cal-vacation) 18%, transparent)",
    fg: "var(--cal-vacation)",
    label: "Vacation",
  },
  Sick: {
    icon: Thermometer,
    bg: "color-mix(in oklch, var(--destructive) 18%, transparent)",
    fg: "var(--destructive)",
    label: "Sick",
  },
  Personal: {
    icon: User,
    bg: "color-mix(in oklch, var(--muted-foreground) 18%, transparent)",
    fg: "var(--muted-foreground)",
    label: "Personal",
  },
  Parental: {
    icon: Baby,
    bg: "color-mix(in oklch, var(--success) 18%, transparent)",
    fg: "var(--success)",
    label: "Parental",
  },
};

function LeaveCalendar({
  requests,
  onSelect,
}: {
  requests: LeaveRequest[];
  onSelect: (l: LeaveRequest) => void;
}) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const leavesOn = (day: Date) =>
    requests.filter((l) =>
      isWithinInterval(startOfDay(day), {
        start: startOfDay(parseISO(l.from)),
        end: startOfDay(parseISO(l.to)),
      }),
    );

  const MAX_VISIBLE = 3;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="text-sm font-semibold">{format(today, "MMMM yyyy")}</div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          {(Object.keys(LEAVE_STYLE) as LeaveRequest["type"][]).map((t) => {
            const s = LEAVE_STYLE[t];
            const Icon = s.icon;
            return (
              <span key={t} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-flex items-center justify-center h-4 w-4 rounded"
                  style={{ backgroundColor: s.bg, color: s.fg }}
                >
                  <Icon className="h-2.5 w-2.5" />
                </span>
                {s.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1.5"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, today);
          const isToday = startOfDay(day).getTime() === startOfDay(today).getTime();
          const entries = leavesOn(day);
          const visible = entries.slice(0, MAX_VISIBLE);
          const overflow = entries.length - visible.length;
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[84px] border rounded-md p-1 flex flex-col gap-0.5 transition-colors ${
                inMonth ? "bg-background" : "bg-muted/20 text-muted-foreground/50"
              } ${isToday ? "ring-1 ring-primary/50" : ""}`}
            >
              <div
                className={`text-[11px] leading-none px-1 pt-0.5 pb-1 ${isToday ? "font-semibold text-primary" : ""}`}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-0.5 min-h-0">
                {visible.map((l) => {
                  const s = LEAVE_STYLE[l.type];
                  const Icon = s.icon;
                  const e = employeeById(l.employeeId);
                  const initials = e?.initials ?? "??";
                  const isHalf = l.granularity === "half";
                  return (
                    <button
                      key={l.id}
                      onClick={() => onSelect(l)}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate hover:brightness-110 press-scale text-left"
                      style={{ backgroundColor: s.bg, color: s.fg }}
                      title={`${e?.name ?? "?"} — ${l.type}${isHalf ? ` (${l.halfPeriod})` : ""}`}
                    >
                      <Icon className="h-2.5 w-2.5 shrink-0" />
                      <span className="truncate">{initials}</span>
                      {isHalf && <span className="ml-auto text-[9px] opacity-80">½</span>}
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{overflow} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="p-3 rounded-md bg-muted/40">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-sm font-medium mt-0.5">{value}</div>
    </div>
  );
}
