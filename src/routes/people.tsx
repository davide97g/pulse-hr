import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  Search, Filter, Download, Plus, MoreHorizontal, Mail, Phone, MapPin,
  Calendar, Briefcase, DollarSign, FileText, Building2, Trash2, Send,
  UserX, Users as UsersIcon, Sparkles, Flame, Trophy, Target, ArrowUpRight, Zap,
} from "lucide-react";
import { growthSummaryFor, strengthRadarFor, type StrengthTag } from "@/lib/growth";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows } from "@/components/app/SkeletonList";
import { useQuickAction } from "@/components/app/QuickActions";
import { employees as seed, type Employee, departments } from "@/lib/mock-data";
import { useSavedViews } from "@/lib/useSavedViews";
import { SavedViewsBar } from "@/components/app/SavedViewsBar";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/people")({
  head: () => ({ meta: [{ title: "Employees — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: People,
});

interface PeopleView { q: string; dept: string }

function People() {
  const views = useSavedViews<PeopleView>("people", {
    defaults: { q: "", dept: "" },
    schema: { q: "string", dept: "string" },
  });
  const q = views.state.q;
  const dept = views.state.dept || null;
  const setQ = (v: string) => views.setState({ q: v });
  const setDept = (v: string | null) => views.setState({ dept: v ?? "" });
  const [selected, setSelected] = useState<Employee | null>(null);
  const [list, setList] = useState<Employee[]>(seed);
  const [toDelete, setToDelete] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const { open: openAction } = useQuickAction();

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(
    () =>
      list.filter(
        e =>
          (!q ||
            e.name.toLowerCase().includes(q.toLowerCase()) ||
            e.role.toLowerCase().includes(q.toLowerCase())) &&
          (!dept || e.department === dept)
      ),
    [q, dept, list]
  );

  const remove = (e: Employee) => {
    setList(l => l.filter(x => x.id !== e.id));
    setSelected(s => (s?.id === e.id ? null : s));
    toast(`${e.name} removed`, {
      description: "Employee archived (mock).",
      action: {
        label: "Undo",
        onClick: () => setList(l => [e, ...l]),
      },
    });
  };

  const clearFilters = () => { setQ(""); setDept(null); };

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="People"
        description={`${list.length} employees across ${departments.length} departments`}
        actions={
          <>
            <Button
              variant="outline" size="sm" className="press-scale"
              onClick={() => toast.success("Export started", { description: "CSV will download shortly." })}
            >
              <Download className="h-4 w-4 mr-1.5" />Export
            </Button>
            <Button size="sm" className="press-scale" onClick={() => openAction("add-employee")}>
              <Plus className="h-4 w-4 mr-1.5" />Add employee
            </Button>
          </>
        }
      />

      <SavedViewsBar
        savedViews={views.savedViews}
        activeViewId={views.activeViewId}
        isDirty={views.isDirty}
        shareUrl={views.shareUrl}
        onApply={views.apply}
        onSave={views.save}
        onRemove={views.remove}
        onRename={views.rename}
        onReset={views.reset}
        placeholder="Save a people view once, jump to it with one click."
      />

      <Card className="p-3 mb-4 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="h-4 w-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search by name or role" className="pl-8 h-9" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setDept(null)}
            className={cn(
              "h-8 px-3 rounded-md text-sm transition-colors press-scale",
              !dept ? "bg-foreground text-background" : "hover:bg-muted"
            )}
          >
            All
          </button>
          {departments.slice(0, 5).map(d => (
            <button
              key={d.name}
              onClick={() => setDept(d.name)}
              className={cn(
                "h-8 px-3 rounded-md text-sm transition-colors press-scale",
                dept === d.name ? "bg-foreground text-background" : "hover:bg-muted"
              )}
            >
              {d.name}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => toast("Filters", { description: "Open advanced filter builder" })}>
          <Filter className="h-4 w-4 mr-1.5" />More filters
        </Button>
      </Card>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="grid">Cards</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            {loading ? (
              <SkeletonRows rows={8} />
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={list.length === 0 ? <UserX className="h-6 w-6" /> : <Search className="h-6 w-6" />}
                title={list.length === 0 ? "No employees yet" : "No matches found"}
                description={
                  list.length === 0
                    ? "Add your first teammate to populate the directory."
                    : "Try loosening filters or search terms."
                }
                action={
                  list.length === 0 ? (
                    <Button size="sm" onClick={() => openAction("add-employee")}>
                      <Plus className="h-4 w-4 mr-1.5" />Add employee
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={clearFilters}>Clear filters</Button>
                  )
                }
              />
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                  <tr>
                    <th className="text-left font-medium px-4 py-2.5">Employee</th>
                    <th className="text-left font-medium px-4 py-2.5">Department</th>
                    <th className="text-left font-medium px-4 py-2.5">Location</th>
                    <th className="text-left font-medium px-4 py-2.5">Status</th>
                    <th className="text-left font-medium px-4 py-2.5">Joined</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody className="stagger-in">
                  {filtered.map(e => (
                    <tr
                      key={e.id}
                      onClick={() => setSelected(e)}
                      className="border-t cursor-pointer hover:bg-muted/40 transition-colors group"
                    >
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-3">
                          <Avatar initials={e.initials} color={e.avatarColor} size={32} />
                          <div className="min-w-0">
                            <div className="font-medium truncate">{e.name}</div>
                            <div className="text-xs text-muted-foreground truncate">{e.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.department}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{e.location}</td>
                      <td className="px-4 py-2.5"><StatusBadge status={e.status} /></td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{e.joinDate}</td>
                      <td className="px-2" onClick={ev => ev.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelected(e)}>View profile</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Email drafted to ${e.name}`)}>
                              <Send className="h-4 w-4 mr-2" />Send message
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.success(`Started offboarding for ${e.name}`)}>
                              Start offboarding
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive" onClick={() => setToDelete(e)}>
                              <Trash2 className="h-4 w-4 mr-2" />Remove
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="grid" className="mt-4">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-[60%] shimmer rounded" />
                      <div className="h-2.5 w-[40%] shimmer rounded" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<UsersIcon className="h-6 w-6" />}
              title="No employees match"
              action={<Button size="sm" variant="outline" onClick={clearFilters}>Clear filters</Button>}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 stagger-in">
              {filtered.map(e => (
                <Card
                  key={e.id}
                  onClick={() => setSelected(e)}
                  className="p-5 cursor-pointer hover:shadow-md transition-all press-scale"
                >
                  <div className="flex items-start gap-3">
                    <Avatar initials={e.initials} color={e.avatarColor} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{e.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{e.role}</div>
                      <div className="mt-2"><StatusBadge status={e.status} /></div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t grid grid-cols-2 text-xs text-muted-foreground gap-2">
                    <div className="flex items-center gap-1.5"><Building2 className="h-3 w-3" />{e.department}</div>
                    <div className="flex items-center gap-1.5 truncate"><MapPin className="h-3 w-3" />{e.location}</div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <EmployeePanel employee={selected} onClose={() => setSelected(null)} onDelete={e => setToDelete(e)} />

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will archive their profile. You can undo this action from the toast for a few seconds.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (toDelete) remove(toDelete); setToDelete(null); }}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function EmployeePanel({
  employee, onClose, onDelete,
}: { employee: Employee | null; onClose: () => void; onDelete: (e: Employee) => void }) {
  return (
    <SidePanel
      open={!!employee}
      onClose={onClose}
      width={520}
      title={
        employee && (
          <div className="flex items-center gap-2.5">
            <Avatar initials={employee.initials} color={employee.avatarColor} size={28} />
            <span>{employee.name}</span>
          </div>
        )
      }
    >
      {employee && (
        <div className="p-5">
          <div className="flex items-center gap-4 mb-5">
            <Avatar initials={employee.initials} color={employee.avatarColor} size={64} />
            <div className="flex-1">
              <div className="text-lg font-semibold">{employee.name}</div>
              <div className="text-sm text-muted-foreground">{employee.role}</div>
              <div className="mt-2"><StatusBadge status={employee.status} /></div>
            </div>
          </div>
          <div className="flex gap-2 mb-5">
            <Button size="sm" variant="outline" className="flex-1 press-scale" onClick={() => toast.success(`Email drafted to ${employee.name}`)}>
              <Mail className="h-3.5 w-3.5 mr-1.5" />Email
            </Button>
            <Button size="sm" variant="outline" className="flex-1 press-scale" onClick={() => toast.success("Calendar opened", { description: `Schedule a meeting with ${employee.name}` })}>
              <Calendar className="h-3.5 w-3.5 mr-1.5" />Schedule
            </Button>
            <Button size="sm" variant="outline" className="flex-1 press-scale" onClick={() => toast("Edit mode", { description: "Tap any field to edit inline" })}>Edit</Button>
            <Button size="sm" variant="outline" className="press-scale text-destructive hover:bg-destructive/10" onClick={() => onDelete(employee)}>
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <GrowthSummaryCard employeeId={employee.id} />

          <Tabs defaultValue="profile">
            <TabsList className="w-full grid grid-cols-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="job">Job</TabsTrigger>
              <TabsTrigger value="docs">Docs</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-4 space-y-3">
              <Field icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={employee.email} />
              <Field icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={employee.phone} />
              <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Location" value={employee.location} />
              <Field icon={<Calendar className="h-3.5 w-3.5" />} label="Joined" value={employee.joinDate} />
            </TabsContent>
            <TabsContent value="job" className="mt-4 space-y-3">
              <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Role" value={employee.role} />
              <Field icon={<Building2 className="h-3.5 w-3.5" />} label="Department" value={employee.department} />
              <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Employment" value={employee.employmentType} />
              <Field icon={<DollarSign className="h-3.5 w-3.5" />} label="Salary" value={`$${employee.salary.toLocaleString()} / year`} />
              {employee.manager && <Field icon={<Briefcase className="h-3.5 w-3.5" />} label="Manager" value={employee.manager} />}
            </TabsContent>
            <TabsContent value="docs" className="mt-4">
              <div className="space-y-2 stagger-in">
                {["Employment contract", "NDA", "Tax form W-9", "Equipment policy"].map(d => (
                  <button
                    key={d}
                    onClick={() => toast.success(`Opening ${d}`, { description: "Document preview" })}
                    className="w-full flex items-center gap-3 p-2.5 rounded-md border hover:bg-muted/40 hover:border-primary/40 text-left transition-colors press-scale"
                  >
                    <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 text-sm">{d}</div>
                    <span className="text-xs text-muted-foreground">PDF</span>
                  </button>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="activity" className="mt-4 space-y-3 stagger-in">
              {[
                { t: "2d ago", a: "Submitted timesheet for week of Apr 7" },
                { t: "1w ago", a: "Updated tax withholding" },
                { t: "2w ago", a: "Completed onboarding training" },
                { t: "1mo ago", a: "Joined Acme Inc." },
              ].map((it, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="text-xs text-muted-foreground w-16 shrink-0 pt-0.5">{it.t}</div>
                  <div className="flex-1">{it.a}</div>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </SidePanel>
  );
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="text-sm font-medium text-right">{value}</div>
    </div>
  );
}

const RADAR_TAG_COLOR: Record<StrengthTag, string> = {
  impact:   "oklch(0.7 0.15 30)",
  craft:    "oklch(0.65 0.18 340)",
  teamwork: "oklch(0.6 0.16 220)",
  courage:  "oklch(0.75 0.15 75)",
  kindness: "oklch(0.65 0.15 155)",
};

function GrowthSummaryCard({ employeeId }: { employeeId: string }) {
  const summary = useMemo(() => growthSummaryFor(employeeId), [employeeId]);
  const radar = useMemo(() => strengthRadarFor(employeeId), [employeeId]);
  if (!summary) return null;
  const { level, next, progressPct, xp, streak, kudosReceived, goalsActive, challengesOpen, badgesEarned } = summary;
  const topStrength = [...radar].sort((a, b) => b.value - a.value)[0];

  return (
    <Card className="p-4 mb-5 relative overflow-hidden iridescent-border">
      <div
        className="absolute -top-10 -right-10 h-28 w-28 rounded-full blur-2xl pointer-events-none"
        style={{ backgroundColor: level.color, opacity: 0.18 }}
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Growth</div>
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded"
            style={{ background: `${level.color.replace(")", " / 0.15)").replace("oklch(", "oklch(")}`, color: level.color }}
          >
            L{level.tier} · {level.name}
          </span>
          {streak > 0 && (
            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-warning ml-auto">
              <Flame className="h-3 w-3" /> {streak}w
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] mb-1">
          <span className="text-muted-foreground">XP</span>
          <span className="font-mono tabular-nums">{xp.total.toLocaleString()} · {progressPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${progressPct}%`, backgroundColor: level.color }}
          />
        </div>
        {next && (
          <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">
            next · {next.name} at {next.xpMin.toLocaleString()}
          </div>
        )}

        <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t">
          <MiniStat icon={<Zap className="h-3 w-3" />} value={kudosReceived} label="kudos" />
          <MiniStat icon={<Target className="h-3 w-3" />} value={goalsActive} label="goals" />
          <MiniStat icon={<Trophy className="h-3 w-3" />} value={challengesOpen} label="open" />
          <MiniStat icon={<Sparkles className="h-3 w-3" />} value={badgesEarned} label="badges" />
        </div>

        {topStrength && topStrength.value > 0 && (
          <div className="mt-3 pt-3 border-t flex items-center gap-2">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Top strength</div>
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: RADAR_TAG_COLOR[topStrength.tag] }}
            />
            <span className="text-xs font-medium capitalize">{topStrength.tag}</span>
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground ml-auto">{topStrength.value}/100</span>
          </div>
        )}

        <Link
          to="/growth"
          search={{ employee: employeeId }}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline press-scale"
        >
          See full growth profile
          <ArrowUpRight className="h-3 w-3" />
        </Link>
      </div>
    </Card>
  );
}

function MiniStat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-sm font-semibold tabular-nums flex items-center justify-center gap-1">
        <span className="text-muted-foreground">{icon}</span>{value}
      </div>
      <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{label}</div>
    </div>
  );
}
