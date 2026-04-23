import { createFileRoute, Link } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";

export const Route = createFileRoute("/docs/saturation")({
  head: () => ({ meta: [{ title: "Saturation — Pulse HR docs" }] }),
  component: SaturationDoc,
});

function SaturationDoc() {
  return (
    <div className="space-y-5 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-info/10 text-info flex items-center justify-center">
            <Gauge className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Saturation</div>
            <div className="text-xs text-muted-foreground">
              How busy the org is, who's leaning in, and what each hour returns.
            </div>
          </div>
        </div>
      </Card>

      <Section title="Team load">
        <p>
          The <b>utilisation heatmap</b> shows one row per person, one column per upcoming week, and
          each cell is the sum of their allocation percentages in that week. Green is healthy, amber
          means over, red means burnout territory. Blank = bench.
        </p>
        <p>
          Next to it, the <b>trend chart</b> draws a line per employee using their avatar colour.
          Hover any row, line or legend item and the rest dim — good for isolating a single person
          across the team.
        </p>
      </Section>

      <Section title="Project margins">
        <p>
          Revenue − cost, summed per project year-to-date. Bars in the project's own colour are
          net-positive; red bars are net-negative. Feed projects into this view by adding
          allocations with rates in the{" "}
          <Link to="/clients" className="text-primary hover:underline">
            Clients &amp; Projects
          </Link>{" "}
          area.
        </p>
        <p className="text-xs text-muted-foreground">
          Cost = employee salary ÷ 1,800h baseline. Revenue = allocation % × rate × hours.
        </p>
      </Section>

      <Section title="Employee value">
        <p>
          A scatter plot of cost vs revenue per person. Upper-right = expensive and profitable;
          upper-left = leverage points; lower-right = watch list. Dot size scales with hours
          delivered.
        </p>
      </Section>

      <Section title="Insights">
        <p>
          A triage surface showing only the problems worth acting on today: losing projects,
          over-budget burn, at-risk and on-hold flags, people on the bench or overbooked, declining
          forward load, and low-health clients. Each row is severity-coded and deep-links to the
          relevant project where applicable.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5 space-y-2 text-sm leading-relaxed">
      <div className="font-semibold">{title}</div>
      {children}
    </Card>
  );
}
