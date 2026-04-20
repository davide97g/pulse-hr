import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { BookOpen, Gauge, Briefcase, Plug, Users, Sparkles } from "lucide-react";
import { PageHeader } from "@/components/app/AppShell";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Docs — Pulse HR" }] }),
  component: DocsLayout,
});

const INDEX = [
  {
    to: "/docs/employee-score",
    label: "Employee Score",
    desc: "How the 0–100 number is derived and how to influence each factor.",
    icon: <Sparkles className="h-4 w-4" />,
    accent: true,
  },
  {
    to: "/docs/saturation",
    label: "Saturation",
    desc: "Reading the heatmap, trend chart, margin, cost-vs-value, and insights.",
    icon: <Gauge className="h-4 w-4" />,
  },
  {
    to: "/docs/clients-projects",
    label: "Clients & Projects",
    desc: "Hierarchy, allocations, activities, boards, and Gantt charts.",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    to: "/docs/integrations",
    label: "Jira & Linear",
    desc: "Connecting external trackers and linking tickets to work.",
    icon: <Plug className="h-4 w-4" />,
  },
  {
    to: "/docs/kudos",
    label: "Kudos & Recognition",
    desc: "Peer coins, leaderboards, and how kudos feed the employee score.",
    icon: <Users className="h-4 w-4" />,
  },
] as const;

function DocsLayout() {
  return (
    <div className="p-4 md:p-6 fade-in">
      <PageHeader
        title={
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Docs
          </span>
        }
        description="How the features in Pulse HR work — plain-English explanations, formulas, and tips."
      />
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        <aside className="space-y-1 text-sm">
          <div className="text-[11px] text-muted-foreground uppercase tracking-wide mb-2 px-2">
            Topics
          </div>
          {INDEX.map((e) => (
            <Link
              key={e.to}
              to={e.to}
              className="flex items-start gap-2 px-3 py-2 rounded-md hover:bg-muted transition [&.active]:bg-muted"
              activeProps={{ className: "bg-muted font-medium" }}
            >
              <span
                className={`h-6 w-6 rounded-md flex items-center justify-center shrink-0 ${e.accent ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}
              >
                {e.icon}
              </span>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{e.label}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-2">{e.desc}</div>
              </div>
            </Link>
          ))}
        </aside>
        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
