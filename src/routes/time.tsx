import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Play, Square, MapPin, Smartphone, Wifi, Plus, Pencil, Trash2, Copy,
  CalendarDays, Briefcase, Timer, CheckCircle2, Send, Circle, Clock,
  Search, SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Avatar, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows } from "@/components/app/SkeletonList";
import {
  employees, commesse, commessaById,
  timesheetEntries as seedEntries, type TimesheetEntry,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/time")({
  head: () => ({ meta: [{ title: "Time & attendance — Pulse HR" }] }),
  component: Time,
});

const ME = "e1";

function Time() {
  const [clockedIn, setClockedIn] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [activeCommessa, setActiveCommessa] = useState<string>("cm1");
  const [loading, setLoading] = useState(true);

  const [entries, setEntries] = useState<TimesheetEntry[]>(seedEntries);
  const [editEntry, setEditEntry] = useState<TimesheetEntry | "new" | null>(null);
  const [toDelete, setToDelete] = useState<TimesheetEntry | null>(null);
  const [filterCommessa, setFilterCommessa] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [q, setQ] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 520);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!clockedIn) return;
    const i = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(i);
  }, [clockedIn]);

  const fmt = (s: number) =>
    `${Math.floor(s / 3600).toString().padStart(2, "0")}:${Math.floor((s % 3600) / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const myEntries = useMemo(
    () => entries.filter(e => e.employeeId === ME),
    [entries]
  );
  const filteredEntries = useMemo(() => {
    return myEntries.filter(e => {
      if (filterCommessa !== "all" && e.commessaId !== filterCommessa) return false;
      if (filterStatus !== "all" && e.status !== filterStatus) return false;
      if (q && !e.description.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [myEntries, filterCommessa, filterStatus, q]);

  const weekTotal = useMemo(
    () => myEntries.reduce((acc, e) => acc + e.hours, 0),
    [myEntries]
  );
  const byCommessa = useMemo(() => {
    const map = new Map<string, number>();
    myEntries.forEach(e => map.set(e.commessaId, (map.get(e.commessaId) ?? 0) + e.hours));
    return [...map.entries()]
      .map(([id, hours]) => ({ commessa: commessaById(id)!, hours }))
      .filter(x => x.commessa)
      .sort((a, b) => b.hours - a.hours);
  }, [myEntries]);

  const stopClockAndLog = () => {
    if (seconds < 30) {
      setClockedIn(false);
      setSeconds(0);
      toast("Clock stopped", { description: "Session too short to save." });
      return;
    }
    const hours = Math.max(0.1, Math.round((seconds / 3600) * 100) / 100);
    const c = commessaById(activeCommessa)!;
    const newEntry: TimesheetEntry = {
      id: `t-${Date.now()}`,
      employeeId: ME,
      commessaId: activeCommessa,
      date: new Date().toISOString().slice(0, 10),
      hours,
      description: `Tracked time on ${c.name}`,
      billable: true,
      status: "draft",
    };
    setEntries(es => [newEntry, ...es]);
    setClockedIn(false);
    setSeconds(0);
    toast.success(`Logged ${hours}h to ${c.code}`, {
      description: "Saved as draft in your timesheet.",
      icon: <Timer className="h-4 w-4" />,
    });
  };

  const saveEntry = (data: Omit<TimesheetEntry, "id" | "employeeId" | "status">, id?: string) => {
    if (id) {
      setEntries(es =>
        es.map(e => (e.id === id ? { ...e, ...data } : e))
      );
      toast.success("Entry updated");
    } else {
      const newEntry: TimesheetEntry = {
        ...data,
        id: `t-${Date.now()}`,
        employeeId: ME,
        status: "draft",
      };
      setEntries(es => [newEntry, ...es]);
      toast.success("Entry added", {
        description: `${data.hours}h logged to ${commessaById(data.commessaId)?.code}`,
      });
    }
  };

  const deleteEntry = (id: string) => {
    setEntries(es => es.filter(e => e.id !== id));
    toast("Entry deleted", {
      description: "Hours removed from your timesheet.",
      icon: <Trash2 className="h-4 w-4" />,
    });
  };

  const duplicate = (e: TimesheetEntry) => {
    const copy = { ...e, id: `t-${Date.now()}`, status: "draft" as const };
    setEntries(es => [copy, ...es]);
    toast.success("Entry duplicated");
  };

  const submitDrafts = () => {
    const count = myEntries.filter(e => e.status === "draft").length;
    if (!count) {
      toast("No drafts", { description: "Nothing pending submission." });
      return;
    }
    setEntries(es =>
      es.map(e => (e.employeeId === ME && e.status === "draft" ? { ...e, status: "submitted" } : e))
    );
    toast.success(`Submitted ${count} entr${count > 1 ? "ies" : "y"}`, {
      description: "Sent to your manager for approval.",
      icon: <Send className="h-4 w-4" />,
    });
  };

  const activeC = commessaById(activeCommessa);

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Time & attendance"
        description="Track presence, log hours against commesse, and submit your timesheet."
        actions={
          <>
            <Button variant="outline" size="sm" className="press-scale" onClick={submitDrafts}>
              <Send className="h-4 w-4 mr-1.5" /> Submit drafts
            </Button>
            <Button size="sm" className="press-scale" onClick={() => setEditEntry("new")}>
              <Plus className="h-4 w-4 mr-1.5" /> New entry
            </Button>
          </>
        }
      />

      {/* Clock + week summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <Card className="p-6 lg:col-span-1 relative overflow-hidden">
          <div
            className="absolute inset-0 opacity-[0.08] grid-bg pointer-events-none"
            aria-hidden
          />
          <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full blur-3xl pointer-events-none"
               style={{ backgroundColor: activeC?.color, opacity: 0.18 }} aria-hidden />

          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Your clock</div>
              {clockedIn && (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-success">
                  <span className="h-1.5 w-1.5 rounded-full bg-success pulse-dot" />
                  LIVE
                </span>
              )}
            </div>
            <div className="text-[40px] leading-none font-mono font-semibold tabular-nums">{fmt(seconds)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {clockedIn
                ? <>Working on <span className="font-medium text-foreground">{activeC?.code}</span> · {activeC?.name}</>
                : "Not clocked in"}
            </div>

            <div className="mt-4 space-y-2">
              <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Active commessa</Label>
              <Select value={activeCommessa} onValueChange={setActiveCommessa}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {commesse.filter(c => c.status === "active").map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-medium">{c.code}</span>
                        <span className="text-muted-foreground">· {c.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={() => (clockedIn ? stopClockAndLog() : setClockedIn(true))}
              className={cn(
                "w-full mt-4 press-scale transition-colors",
                clockedIn
                  ? "bg-destructive hover:bg-destructive/90 text-white"
                  : "bg-success hover:bg-success/90 text-white"
              )}
            >
              {clockedIn
                ? <><Square className="h-4 w-4 mr-1.5" /> Stop & log hours</>
                : <><Play className="h-4 w-4 mr-1.5" /> Clock in</>}
            </Button>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { i: MapPin, l: "GPS" },
                { i: Smartphone, l: "NFC" },
                { i: Wifi, l: "QR" },
              ].map(({ i: Icon, l }) => (
                <button
                  key={l}
                  onClick={() => toast(`${l} check-in ready`, { description: "Point-of-presence verified." })}
                  className="text-center p-2 rounded-md bg-background border hover:border-primary hover:bg-primary/5 transition-colors press-scale"
                >
                  <Icon className="h-3.5 w-3.5 mx-auto text-muted-foreground" />
                  <div className="text-[10px] mt-1">{l}</div>
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="font-semibold text-sm">This week</div>
            <div className="text-xs text-muted-foreground">Mon – Sun</div>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => {
              const hours = [8.2, 7.9, 8.5, 9.1, 8.0, 0, 0][i];
              const max = 10;
              const isToday = i === 3;
              return (
                <div key={d} className="flex flex-col items-center group">
                  <div className={cn(
                    "text-[11px] mb-2",
                    isToday ? "text-foreground font-medium" : "text-muted-foreground"
                  )}>{d}</div>
                  <div className="h-32 w-full bg-muted/40 rounded-md flex items-end p-1 relative overflow-hidden">
                    <div
                      className={cn(
                        "w-full rounded transition-all duration-500 ease-out",
                        isToday ? "bg-primary" : "bg-primary/60 group-hover:bg-primary/80"
                      )}
                      style={{ height: hours ? `${(hours / max) * 100}%` : "4px" }}
                    />
                    {isToday && (
                      <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                    )}
                  </div>
                  <div className="text-xs font-medium mt-2 tabular-nums">{hours ? `${hours.toFixed(1)}h` : "—"}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Logged</div>
              <div className="text-lg font-semibold tabular-nums">{weekTotal.toFixed(1)}h</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Target</div>
              <div className="text-lg font-semibold tabular-nums">40.0h</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Variance</div>
              <div className={cn(
                "text-lg font-semibold tabular-nums",
                weekTotal >= 40 ? "text-success" : "text-warning"
              )}>
                {weekTotal >= 40 ? "+" : ""}{(weekTotal - 40).toFixed(1)}h
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="timesheet">
        <TabsList>
          <TabsTrigger value="timesheet"><Clock className="h-3.5 w-3.5 mr-1.5" />My timesheet</TabsTrigger>
          <TabsTrigger value="commesse"><Briefcase className="h-3.5 w-3.5 mr-1.5" />By commessa</TabsTrigger>
          <TabsTrigger value="team"><CalendarDays className="h-3.5 w-3.5 mr-1.5" />Team presence</TabsTrigger>
        </TabsList>

        {/* Timesheet CRUD */}
        <TabsContent value="timesheet" className="mt-4">
          <Card className="p-3 mb-3 flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search description…"
                className="pl-8 h-9"
              />
            </div>
            <Select value={filterCommessa} onValueChange={setFilterCommessa}>
              <SelectTrigger className="h-9 w-[220px]">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Commessa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All commesse</SelectItem>
                {commesse.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                      {c.code}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-9 w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </Card>

          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            {loading ? (
              <SkeletonRows rows={5} />
            ) : filteredEntries.length === 0 ? (
              <EmptyState
                icon={<Timer className="h-6 w-6" />}
                title={myEntries.length === 0 ? "No hours logged yet" : "No entries match"}
                description={
                  myEntries.length === 0
                    ? "Start the clock above or add a manual entry against a commessa."
                    : "Try clearing the filters or searching by description."
                }
                action={
                  <div className="flex gap-2">
                    {myEntries.length > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => { setQ(""); setFilterCommessa("all"); setFilterStatus("all"); }}
                      >
                        Clear filters
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setEditEntry("new")}>
                      <Plus className="h-4 w-4 mr-1.5" /> New entry
                    </Button>
                  </div>
                }
              />
            ) : (
              <>
                <div className="px-5 py-3 border-b flex items-center justify-between bg-muted/30">
                  <div className="text-xs text-muted-foreground">
                    {filteredEntries.length} entr{filteredEntries.length === 1 ? "y" : "ies"} ·
                    <span className="ml-1 font-medium text-foreground tabular-nums">
                      {filteredEntries.reduce((a, e) => a + e.hours, 0).toFixed(1)}h
                    </span>
                  </div>
                </div>
                <ul className="divide-y stagger-in">
                  {filteredEntries.map(e => {
                    const c = commessaById(e.commessaId)!;
                    return (
                      <li
                        key={e.id}
                        className="group px-5 py-3 flex items-center gap-3 hover:bg-muted/40 transition-colors"
                      >
                        <div className="relative h-9 w-1 rounded-full" style={{ backgroundColor: c.color }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono tracking-wide px-1.5 py-0.5 rounded border bg-muted/60">
                              {c.code}
                            </span>
                            <div className="text-sm font-medium truncate">{e.description}</div>
                            {!e.billable && (
                              <span className="text-[10px] uppercase tracking-wider text-muted-foreground border rounded px-1 py-px">
                                internal
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {c.name} · {e.date}
                          </div>
                        </div>
                        <div className="text-right hidden sm:block">
                          <div className="text-sm font-semibold tabular-nums">{e.hours.toFixed(1)}h</div>
                          <div className="mt-0.5"><StatusBadge status={e.status} /></div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => duplicate(e)} title="Duplicate">
                            <Copy className="h-3.5 w-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => setEditEntry(e)} title="Edit">
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            size="icon" variant="ghost"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => setToDelete(e)}
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </Card>
        </TabsContent>

        {/* Commesse roll-up */}
        <TabsContent value="commesse" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="p-5 space-y-3">
                  <div className="h-4 w-[50%] shimmer rounded" />
                  <div className="h-3 w-[70%] shimmer rounded" />
                  <div className="h-2 w-full shimmer rounded" />
                </Card>
              ))}
            </div>
          ) : byCommessa.length === 0 ? (
            <EmptyState
              icon={<Briefcase className="h-6 w-6" />}
              title="No hours per commessa yet"
              description="Log your first entry to see commessa roll-ups here."
              action={<Button size="sm" onClick={() => setEditEntry("new")}><Plus className="h-4 w-4 mr-1.5" />New entry</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 stagger-in">
              {byCommessa.map(({ commessa: c, hours }) => {
                const pct = Math.min(100, Math.round((c.burnedHours / c.budgetHours) * 100));
                const over = c.burnedHours > c.budgetHours;
                return (
                  <Card key={c.id} className="p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span className="text-[11px] font-mono tracking-wide px-1.5 py-0.5 rounded border bg-muted/60">
                            {c.code}
                          </span>
                          <StatusBadge status={c.status === "on_hold" ? "pending" : c.status === "closed" ? "rejected" : "active"} />
                        </div>
                        <div className="font-semibold mt-2 truncate">{c.name}</div>
                        <div className="text-xs text-muted-foreground">{c.client} · {c.manager}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Yours</div>
                        <div className="text-lg font-semibold tabular-nums">{hours.toFixed(1)}h</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5">
                      <span>Budget burn</span>
                      <span className={cn("tabular-nums font-medium", over ? "text-destructive" : "text-foreground")}>
                        {c.burnedHours} / {c.budgetHours}h · {pct}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-[width] duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: over ? "var(--color-destructive)" : c.color,
                        }}
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="team" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b">
              <div className="font-semibold text-sm">Live attendance</div>
              <div className="text-xs text-muted-foreground">Real-time presence across the company</div>
            </div>
            {loading ? (
              <SkeletonRows rows={6} />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Employee</th>
                    <th className="text-left font-medium px-4 py-2.5">Clock in</th>
                    <th className="text-left font-medium px-4 py-2.5">Hours today</th>
                    <th className="text-left font-medium px-4 py-2.5">Method</th>
                    <th className="text-left font-medium px-4 py-2.5">Status</th>
                  </tr>
                </thead>
                <tbody className="stagger-in">
                  {employees.slice(0, 8).map((e, i) => {
                    const status = i === 3 ? "on_leave" : i === 6 ? "on_leave" : "active";
                    return (
                      <tr key={e.id} className="border-t hover:bg-muted/40">
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2.5">
                            <Avatar initials={e.initials} color={e.avatarColor} size={28} />
                            <div>
                              <div className="font-medium">{e.name}</div>
                              <div className="text-xs text-muted-foreground">{e.department}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">
                          {status === "on_leave" ? "—" : `0${8 + (i % 2)}:${String(15 + i * 3).padStart(2, "0")}`}
                        </td>
                        <td className="px-4 py-2.5 font-medium tabular-nums">
                          {status === "on_leave" ? "—" : `${(7 + i * 0.3).toFixed(1)}h`}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground text-xs">{["GPS", "NFC", "Web", "QR"][i % 4]}</td>
                        <td className="px-4 py-2.5"><StatusBadge status={status} /></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <SidePanel
        open={editEntry !== null}
        onClose={() => setEditEntry(null)}
        width={520}
        title={editEntry === "new" ? "New timesheet entry" : "Edit entry"}
      >
        {editEntry !== null && (
          <EntryForm
            entry={editEntry === "new" ? null : editEntry}
            onCancel={() => setEditEntry(null)}
            onSave={data => {
              saveEntry(data, editEntry === "new" ? undefined : editEntry.id);
              setEditEntry(null);
            }}
          />
        )}
      </SidePanel>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete timesheet entry?</AlertDialogTitle>
            <AlertDialogDescription>
              {toDelete && (
                <>
                  {toDelete.hours.toFixed(1)}h on{" "}
                  <span className="font-medium">{commessaById(toDelete.commessaId)?.code}</span>{" "}
                  ({toDelete.date}) will be permanently removed.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) deleteEntry(toDelete.id);
                setToDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EntryForm({
  entry,
  onCancel,
  onSave,
}: {
  entry: TimesheetEntry | null;
  onCancel: () => void;
  onSave: (data: Omit<TimesheetEntry, "id" | "employeeId" | "status">) => void;
}) {
  const [date, setDate] = useState(entry?.date ?? new Date().toISOString().slice(0, 10));
  const [commessaId, setCommessaId] = useState(entry?.commessaId ?? commesse[0].id);
  const [hours, setHours] = useState(String(entry?.hours ?? 1));
  const [description, setDescription] = useState(entry?.description ?? "");
  const [billable, setBillable] = useState(entry?.billable ?? true);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => firstFieldRef.current?.focus(), 180);
    return () => clearTimeout(t);
  }, []);

  const c = commessaById(commessaId);
  const h = Number(hours);
  const valid = !!c && h > 0 && h <= 24 && description.trim().length > 0;

  return (
    <>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40">
          <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center">
            <Timer className="h-4 w-4" />
          </div>
          <div className="text-sm">
            <div className="font-medium">Log hours to a commessa</div>
            <div className="text-xs text-muted-foreground">Drafts can be edited before submission.</div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Commessa</Label>
          <Select value={commessaId} onValueChange={setCommessaId}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {commesse.map(cm => (
                <SelectItem key={cm.id} value={cm.id} disabled={cm.status === "closed"}>
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: cm.color }} />
                    <span className="font-mono text-xs">{cm.code}</span>
                    <span className="text-muted-foreground">· {cm.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {c && (
            <div className="text-xs text-muted-foreground flex items-center justify-between pt-1">
              <span>{c.client} · Lead {c.manager}</span>
              <span className="tabular-nums">{c.burnedHours} / {c.budgetHours}h budget</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input ref={firstFieldRef} type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Hours</Label>
            <Input type="number" step="0.25" min="0.25" max="24" value={hours} onChange={e => setHours(e.target.value)} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Description</Label>
          <Textarea
            rows={3}
            placeholder="What did you work on?"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="text-sm font-medium">Billable time</div>
            <div className="text-xs text-muted-foreground">Uncheck for internal work not billed to client.</div>
          </div>
          <Switch checked={billable} onCheckedChange={setBillable} />
        </div>

        <div className="flex gap-2 pt-1">
          {[1, 2, 4, 8].map(v => (
            <button
              key={v}
              onClick={() => setHours(String(v))}
              className="flex-1 text-xs py-1.5 rounded-md border hover:bg-muted press-scale"
              type="button"
            >
              {v}h
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 py-3 border-t flex justify-between items-center sticky bottom-0 bg-card">
        <div className="text-xs text-muted-foreground">
          {valid ? (
            <span className="inline-flex items-center gap-1.5 text-success">
              <CheckCircle2 className="h-3.5 w-3.5" /> Ready to save
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5">
              <Circle className="h-3.5 w-3.5" /> Fill required fields
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <Button
            disabled={!valid}
            onClick={() => onSave({ date, commessaId, hours: h, description: description.trim(), billable })}
          >
            {entry ? "Save changes" : "Add entry"}
          </Button>
        </div>
      </div>
    </>
  );
}
