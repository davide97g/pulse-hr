import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ListChecks, Search, Briefcase, Layers } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Avatar, PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { Button } from "@pulse-hr/ui/primitives/button";
import { useActivities } from "@/lib/tables/activities";
import { usePlans } from "@/lib/tables/plans";
import { useCommesse } from "@/lib/tables/commesse";
import { employeeById, employees, type ActivityStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ActivitiesSearch = {
  q?: string;
  assignee?: string;
  status?: ActivityStatus;
  project?: string;
  plan?: string;
  scope?: "mine" | "all";
  period?: "week" | "month" | "quarter" | "all";
};

const STATUSES: ActivityStatus[] = ["todo", "in_progress", "review", "done", "blocked"];

export const Route = createFileRoute("/activities")({
  head: () => ({ meta: [{ title: "Activities — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>): ActivitiesSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    assignee: typeof s.assignee === "string" ? s.assignee : undefined,
    status: typeof s.status === "string" ? (s.status as ActivityStatus) : undefined,
    project: typeof s.project === "string" ? s.project : undefined,
    plan: typeof s.plan === "string" ? s.plan : undefined,
    scope: (s.scope as ActivitiesSearch["scope"]) || undefined,
    period: (s.period as ActivitiesSearch["period"]) || undefined,
  }),
  component: ActivitiesPage,
});

function ActivitiesPage() {
  const nav = useNavigate({ from: "/activities" });
  const search = Route.useSearch();
  const setSearch = (patch: Partial<ActivitiesSearch>) =>
    nav({ search: (prev) => ({ ...prev, ...patch }) });

  const activities = useActivities();
  const plans = usePlans();
  const projects = useCommesse();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  // First-employee fallback for "Mine" filter — no real "current user" in mock.
  const me = employees[0];
  const scope = search.scope ?? "mine";
  const period = search.period ?? "month";
  const q = search.q ?? "";

  const periodWindow = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    if (period === "week") start.setDate(now.getDate() - now.getDay());
    else if (period === "month") start.setDate(1);
    else if (period === "quarter") {
      const m = now.getMonth();
      start.setMonth(m - (m % 3));
      start.setDate(1);
    }
    const end = new Date(start);
    if (period === "week") end.setDate(start.getDate() + 7);
    else if (period === "month") end.setMonth(start.getMonth() + 1);
    else if (period === "quarter") end.setMonth(start.getMonth() + 3);
    else return null;
    return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)] as const;
  }, [period]);

  const filtered = useMemo(() => {
    return activities
      .filter((a) => {
        if (search.status && a.status !== search.status) return false;
        if (search.plan && a.planId !== search.plan) return false;
        if (search.project) {
          const plan = plans.find((p) => p.id === a.planId);
          if (!plan || plan.projectId !== search.project) return false;
        }
        if (search.assignee && a.assigneeId !== search.assignee) return false;
        if (scope === "mine" && a.assigneeId !== me?.id) return false;
        if (periodWindow) {
          const start = a.startDate ?? "";
          const end = a.endDate ?? "";
          // Keep if no period (treat as ongoing) or any overlap with window
          if (start && end) {
            if (end < periodWindow[0] || start > periodWindow[1]) return false;
          }
        }
        if (q) {
          const blob = `${a.title} ${a.description ?? ""}`.toLowerCase();
          if (!blob.includes(q.toLowerCase())) return false;
        }
        return true;
      })
      .sort((a, b) => (a.endDate ?? "").localeCompare(b.endDate ?? ""));
  }, [activities, plans, search, scope, periodWindow, q, me?.id]);

  return (
    <div className="p-4 md:p-6 fade-in space-y-5">
      <PageHeader
        title="Activities"
        description="Every activity across all plans and projects."
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 p-3 border-b">
          <ScopeToggle
            value={scope}
            onChange={(v) => setSearch({ scope: v === "mine" ? undefined : v })}
          />
          <PeriodToggle
            value={period}
            onChange={(v) => setSearch({ period: v === "month" ? undefined : v })}
          />
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search…"
              className="pl-9"
              value={q}
              onChange={(e) => setSearch({ q: e.target.value || undefined })}
            />
          </div>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.project ?? ""}
            onChange={(e) =>
              setSearch({ project: e.target.value || undefined, plan: undefined })
            }
          >
            <option value="">All projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.status ?? ""}
            onChange={(e) =>
              setSearch({
                status: (e.target.value || undefined) as ActivityStatus | undefined,
              })
            }
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <select
            className="h-9 px-3 text-sm bg-background border rounded-md"
            value={search.assignee ?? ""}
            onChange={(e) => setSearch({ assignee: e.target.value || undefined })}
          >
            <option value="">All assignees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <SkeletonRows rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            tone="filter"
            icon={<ListChecks className="h-5 w-5" />}
            title="No activities match"
            description="Try widening the period or clearing filters."
            action={
              <Button
                variant="outline"
                onClick={() =>
                  nav({
                    search: { scope: "all", period: "all" } satisfies ActivitiesSearch,
                  })
                }
              >
                Show all
              </Button>
            }
          />
        ) : (
          <div className="overflow-x-auto scrollbar-thin [&_table]:min-w-[820px]">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground bg-muted/40">
                <tr>
                  <th className="text-left font-medium px-5 py-2.5">Activity</th>
                  <th className="text-left font-medium px-3 py-2.5">Plan / Project</th>
                  <th className="text-left font-medium px-3 py-2.5">Assignee</th>
                  <th className="text-left font-medium px-3 py-2.5">Status</th>
                  <th className="text-right font-medium px-3 py-2.5">Hours</th>
                  <th className="text-right font-medium px-3 py-2.5">End</th>
                </tr>
              </thead>
              <tbody className="stagger-in">
                {filtered.map((a) => {
                  const plan = plans.find((p) => p.id === a.planId);
                  const project = plan ? projects.find((pr) => pr.id === plan.projectId) : null;
                  const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
                  return (
                    <tr
                      key={a.id}
                      className={cn("border-t hover:bg-muted/30 cursor-pointer")}
                      onClick={() => {
                        if (project && plan)
                          nav({
                            to: "/projects/$projectId/plans/$planId",
                            params: { projectId: project.id, planId: plan.id },
                            search: { tab: "activities" },
                          });
                      }}
                    >
                      <td className="px-5 py-3">
                        <div className="font-medium">{a.title}</div>
                        {a.description && (
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {a.description}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <Layers className="h-3 w-3 text-muted-foreground" />
                          <span>{plan?.name ?? "—"}</span>
                        </div>
                        {project && (
                          <Link
                            to="/projects/$projectId"
                            params={{ projectId: project.id }}
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-muted-foreground hover:underline inline-flex items-center gap-1.5"
                          >
                            <Briefcase className="h-3 w-3" />
                            {project.name}
                          </Link>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs">
                        {assignee ? (
                          <span className="inline-flex items-center gap-2">
                            <Avatar
                              initials={assignee.initials}
                              color={assignee.avatarColor}
                              size={20}
                            />
                            {assignee.name}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs">
                        {a.estimateHours}h
                      </td>
                      <td className="px-3 py-3 text-right tabular-nums text-xs">
                        {a.endDate ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function ScopeToggle({
  value,
  onChange,
}: {
  value: "mine" | "all";
  onChange: (v: "mine" | "all") => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
      {(["mine", "all"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-2.5 py-1 rounded font-medium transition",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {v === "mine" ? "Mine" : "All"}
        </button>
      ))}
    </div>
  );
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: "week" | "month" | "quarter" | "all";
  onChange: (v: "week" | "month" | "quarter" | "all") => void;
}) {
  return (
    <div className="inline-flex rounded-md border bg-background p-0.5 text-xs">
      {(["week", "month", "quarter", "all"] as const).map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={cn(
            "px-2.5 py-1 rounded font-medium transition capitalize",
            value === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {v}
        </button>
      ))}
    </div>
  );
}
