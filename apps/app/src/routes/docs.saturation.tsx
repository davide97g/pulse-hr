import { createFileRoute } from "@tanstack/react-router";
import { Gauge } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";

export const Route = createFileRoute("/docs/saturation")({
  head: () => ({ meta: [{ title: "Workload check-in — Pulse HR docs" }] }),
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
            <div className="text-lg font-semibold">Workload check-in</div>
            <div className="text-xs text-muted-foreground">
              One tap a week. The shape of a sparkline, not a spreadsheet.
            </div>
          </div>
        </div>
      </Card>

      <Section title="How it works">
        <p>
          Every Friday, each teammate gets a soft nudge: <b>how heavy is this week?</b> Four
          options, all emoji, all one tap — 🌤 Light, ⛅ Balanced, 🌧 Heavy, ⛈ Overloaded. That's the
          whole interaction. No form, no percentage, no project selector.
        </p>
        <p>
          The answer is stored on your own profile. You can change it any time during the week;
          only the last answer counts.
        </p>
      </Section>

      <Section title="What you see">
        <p>
          An <b>8-week sparkline</b> of your own answers — a single line moving between the four
          levels. Future weeks are dashed circles waiting to be filled. The sparkline is private to
          you.
        </p>
        <p>
          Managers see a <b>team aggregate</b> only — how many people landed in each bucket per
          week, and the trend. They never see who answered what.
        </p>
      </Section>

      <Section title="What it isn't">
        <p>
          Pulse HR does <b>not</b> track hours. There are no allocations, no project codes, no
          percentages, no commesse, no timesheets. If your team needs hour-level capacity planning,
          keep using the tool you already have — Harvest, Toggl, Tempo, Float, your spreadsheet.
        </p>
        <p>
          The workload check-in answers a different question:{" "}
          <i>does this team feel okay right now?</i>
        </p>
        <p className="text-xs text-muted-foreground">
          The old allocation-driven heatmap is parked. The check-in is the whole feature.
        </p>
      </Section>

      <Section title="Why it works">
        <p>
          A four-option weekly question gets answered. A 12-field timesheet doesn't. The signal is
          fuzzy on purpose — over eight weeks the shape of a person's sparkline tells you more than
          any precise hour count, because it's the only number that captures both objective load and
          how they're carrying it.
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
