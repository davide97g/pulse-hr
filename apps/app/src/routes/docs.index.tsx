import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, Sparkles, Gauge, Briefcase, Plug, Users } from "lucide-react";

export const Route = createFileRoute("/docs/")({
  head: () => ({ meta: [{ title: "Docs — Pulse HR" }] }),
  component: DocsHome,
});

const CARDS = [
  {
    to: "/docs/employee-score",
    label: "Employee Score",
    desc: "0–100 weighted average of delivery, utilisation, value, recognition, focus, and billable ratio. See how each factor is computed and what to do to move it.",
    icon: <Sparkles className="h-5 w-5" />,
    accent: "oklch(0.65 0.18 290)",
    featured: true,
  },
  {
    to: "/docs/saturation",
    label: "Saturation",
    desc: "Team load heatmap, utilisation trend, project margins, employee value, and the Insights triage surface.",
    icon: <Gauge className="h-5 w-5" />,
    accent: "oklch(0.65 0.16 220)",
  },
  {
    to: "/docs/clients-projects",
    label: "Clients & Projects",
    desc: "Managing clients, projects, team allocations, activity boards, Gantt charts, and owners.",
    icon: <Briefcase className="h-5 w-5" />,
    accent: "oklch(0.7 0.15 30)",
  },
  {
    to: "/docs/integrations",
    label: "Jira & Linear",
    desc: "Connecting external trackers, syncing issues into projects, and linking tickets to activities.",
    icon: <Plug className="h-5 w-5" />,
    accent: "oklch(0.6 0.18 258)",
  },
  {
    to: "/docs/kudos",
    label: "Kudos & Recognition",
    desc: "Peer kudos, coin amounts, leaderboard, and how kudos feed the employee score.",
    icon: <Users className="h-5 w-5" />,
    accent: "oklch(0.65 0.18 340)",
  },
] as const;

function DocsHome() {
  return (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">Welcome to Pulse HR docs</div>
        <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
          Short, practical explanations of the features you'll use day-to-day. Each topic has the
          formulas behind any number we surface, so nothing is magic.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {CARDS.map((c) => (
          <Link key={c.to} to={c.to}>
            <Card
              className="p-5 hover:shadow-md transition hover:-translate-y-0.5 h-full"
              style={{
                borderColor: c.featured
                  ? `color-mix(in oklch, ${c.accent} 40%, transparent)`
                  : undefined,
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: `color-mix(in oklch, ${c.accent} 18%, transparent)`,
                    color: c.accent,
                  }}
                >
                  {c.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="font-semibold">{c.label}</div>
                    <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {c.desc}
                  </div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
