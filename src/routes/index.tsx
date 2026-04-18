import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, ArrowDownRight, Check, X, Clock,
  Users, Wallet, AlertTriangle, TrendingUp, Calendar, FileCheck2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { NewBadge } from "@/components/app/NewBadge";
import { Heart, Gift, Focus as FocusIcon, Sparkles as SparkIcon } from "lucide-react";
import { MomentsCard } from "@/components/app/MomentsCard";
import { SwipeRow } from "@/components/app/SwipeRow";
import { employees, leaveRequests, employeeById, expenses, announcements } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Pulse HR" }] }),
  component: Dashboard,
});

function Dashboard() {
  const pendingLeaves = leaveRequests.filter(l => l.status === "pending");
  const pendingExpenses = expenses.filter(e => e.status === "pending");
  const [decided, setDecided] = useState<Record<string, "approved" | "rejected">>({});

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto fade-in">
      <PageHeader
        title="Good morning, Alex"
        description="Here's what needs your attention today."
        actions={
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-1.5" /> Today
          </Button>
        }
      />

      {/* Labs spotlight */}
      <div className="mb-6 relative rounded-xl iridescent-border bg-gradient-to-br from-primary/[0.05] via-transparent to-transparent p-5 overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04] grid-bg pointer-events-none" aria-hidden />
        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase tracking-[0.2em] font-semibold text-primary inline-flex items-center gap-1.5">
                <SparkIcon className="h-3.5 w-3.5" />What's new in Pulse
              </span>
              <NewBadge />
            </div>
            <div className="font-display text-xl leading-snug max-w-xl">
              Five Labs features are live — ask Copilot with <kbd className="font-mono text-[11px] border rounded px-1.5 py-0.5 bg-background">⌘J</kbd>, or jump straight in.
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 w-full md:w-auto">
            <LabsChip to="/pulse"     icon={<Heart     className="h-3.5 w-3.5" />} label="Team Pulse" />
            <LabsChip to="/forecast"  icon={<TrendingUp className="h-3.5 w-3.5" />} label="Forecast" />
            <LabsChip to="/kudos"     icon={<Gift      className="h-3.5 w-3.5" />} label="Kudos" />
            <LabsChip to="/focus"     icon={<FocusIcon className="h-3.5 w-3.5" />} label="Focus Mode" />
          </div>
        </div>
      </div>

      {/* KPI cards — action centers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<FileCheck2 className="h-4 w-4" />}
          label="Pending approvals"
          value={pendingLeaves.length + pendingExpenses.length}
          delta={`${pendingLeaves.length} leave • ${pendingExpenses.length} expense`}
          action={<Link to="/leave" className="text-primary text-xs font-medium hover:underline">Review now →</Link>}
        />
        <KpiCard
          icon={<Users className="h-4 w-4" />}
          label="Headcount"
          value={employees.length}
          delta="+2 this month"
          trend="up"
          action={<Link to="/people" className="text-primary text-xs font-medium hover:underline">View employees →</Link>}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Overtime hours"
          value="42h"
          delta="+18% vs last week"
          trend="up"
          warn
          action={<Link to="/time" className="text-primary text-xs font-medium hover:underline">View details →</Link>}
        />
        <KpiCard
          icon={<Wallet className="h-4 w-4" />}
          label="Payroll runs Apr 30"
          value="$124.5k"
          delta="12 employees"
          action={<Link to="/payroll" className="text-primary text-xs font-medium hover:underline">Review run →</Link>}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Approvals queue */}
        <Card className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">Approvals queue</div>
              <div className="text-xs text-muted-foreground mt-0.5">Inline approve or reject — no page reloads</div>
            </div>
            <Link to="/leave" className="text-xs text-primary font-medium hover:underline">See all</Link>
          </div>
          <div className="divide-y">
            {pendingLeaves.map((l) => {
              const emp = employeeById(l.employeeId)!;
              const state = decided[l.id];
              const decide = (status: "approved" | "rejected") =>
                setDecided(d => ({ ...d, [l.id]: status }));
              return (
                <SwipeRow
                  key={l.id}
                  onApprove={state ? undefined : () => decide("approved")}
                  onReject={state ? undefined : () => decide("rejected")}
                  disabled={!!state}
                >
                  <div className="px-5 py-3.5 flex items-center gap-3 hover:bg-muted/40 transition-colors">
                    <Avatar initials={emp.initials} color={emp.avatarColor} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.type} • {l.days} day{l.days > 1 ? "s" : ""} • {l.from} → {l.to}
                      </div>
                    </div>
                    {state ? (
                      <StatusBadge status={state} />
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => decide("rejected")}
                        >
                          <X className="h-4 w-4 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          className="h-8 px-3 bg-success text-success-foreground hover:bg-success/90"
                          onClick={() => decide("approved")}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                  </div>
                </SwipeRow>
              );
            })}
          </div>
          <div className="px-5 py-2 border-t text-[11px] text-muted-foreground md:hidden">
            Tip · swipe right to approve, left to reject.
          </div>
        </Card>

        {/* Right column */}
        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-sm">Today's presence</div>
              <div className="text-xs text-muted-foreground">12 employees</div>
            </div>
            <div className="flex items-end gap-3">
              <div>
                <div className="text-3xl font-semibold">9</div>
                <div className="text-xs text-muted-foreground">Clocked in</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-3xl font-semibold text-warning">2</div>
                <div className="text-xs text-muted-foreground">On leave</div>
              </div>
              <div className="h-10 w-px bg-border" />
              <div>
                <div className="text-3xl font-semibold text-muted-foreground">1</div>
                <div className="text-xs text-muted-foreground">Absent</div>
              </div>
            </div>
            <div className="mt-4 h-2 rounded-full bg-muted overflow-hidden flex">
              <div className="bg-success h-full" style={{ width: "75%" }} />
              <div className="bg-warning h-full" style={{ width: "17%" }} />
              <div className="bg-muted-foreground/30 h-full" style={{ width: "8%" }} />
            </div>
            <Button variant="outline" size="sm" className="w-full mt-4">
              View attendance <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Card>

          <Card className="p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <div className="font-semibold text-sm">Anomalies detected</div>
            </div>
            <div className="space-y-2.5 text-sm">
              <div className="flex items-start gap-2">
                <TrendingUp className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <div className="flex-1">Engineering overtime up <strong>18%</strong> this week.</div>
              </div>
              <div className="flex items-start gap-2">
                <Calendar className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <div className="flex-1">Overlapping leave: <strong>Sales team</strong> May 10–17.</div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Lower row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
        <div className="lg:col-span-2 space-y-4">
          <MomentsCard />
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-sm">Headcount trend</div>
              <div className="text-xs text-muted-foreground">Last 6 months</div>
            </div>
            <MiniChart />
          </Card>
        </div>

        <Card className="p-0">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <div className="font-semibold text-sm">Announcements</div>
            <Link to="/announcements" className="text-xs text-primary font-medium hover:underline">All</Link>
          </div>
          <div className="divide-y">
            {announcements.slice(0, 3).map((a) => (
              <div key={a.id} className="px-5 py-3.5 hover:bg-muted/40 cursor-pointer">
                <div className="text-sm font-medium">{a.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.body}</div>
                <div className="text-[11px] text-muted-foreground mt-1.5">{a.author} • {a.time}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  icon, label, value, delta, action, trend, warn,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  delta?: string;
  action?: React.ReactNode;
  trend?: "up" | "down";
  warn?: boolean;
}) {
  return (
    <Card className="p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center ${warn ? "bg-warning/10 text-warning" : "bg-primary/10 text-primary"}`}>
          {icon}
        </div>
        {trend === "up" && <ArrowUpRight className="h-4 w-4 text-success" />}
        {trend === "down" && <ArrowDownRight className="h-4 w-4 text-destructive" />}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-2xl font-semibold mt-0.5">{value}</div>
      {delta && <div className="text-xs text-muted-foreground mt-1">{delta}</div>}
      {action && <div className="mt-3 pt-3 border-t">{action}</div>}
    </Card>
  );
}

function LabsChip({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      to={to}
      className="group inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border bg-background/80 hover:bg-background hover:border-primary/40 transition-colors press-scale text-xs font-medium"
    >
      <span className="text-primary">{icon}</span>
      <span>{label}</span>
      <ArrowRight className="h-3 w-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
    </Link>
  );
}

function MiniChart() {
  const data = [9, 9, 10, 10, 11, 12];
  const labels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const max = 14;
  return (
    <div className="flex items-end gap-3 h-40">
      {data.map((v, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-2">
          <div className="flex-1 w-full flex items-end">
            <div
              className="w-full rounded-t-md bg-primary/15 hover:bg-primary/30 transition-colors relative group"
              style={{ height: `${(v / max) * 100}%` }}
            >
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] px-1.5 py-0.5 rounded">
                {v}
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-t-md" />
            </div>
          </div>
          <div className="text-[11px] text-muted-foreground">{labels[i]}</div>
        </div>
      ))}
    </div>
  );
}
