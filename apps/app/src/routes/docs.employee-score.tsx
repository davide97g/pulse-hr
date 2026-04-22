import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  SCORE_WEIGHTS,
  FACTOR_LABELS,
  FACTOR_DESCRIPTIONS,
  scoreColor,
  type FactorKey,
} from "@/lib/score";

export const Route = createFileRoute("/docs/employee-score")({
  head: () => ({ meta: [{ title: "Employee Score — Pulse HR docs" }] }),
  component: EmployeeScoreDoc,
});

const ORDER: FactorKey[] = ["delivery", "utilization", "value", "recognition", "focus", "billable"];

const TIPS: Record<FactorKey, { how: string; gotcha?: string }> = {
  delivery: {
    how: "Set quarterly goals in Growth and keep progress updated — the factor blends hit-rate and average progress, so steady 80% progress beats one 100% goal plus a 0%.",
    gotcha:
      "If no goals are on file, this factor contributes a neutral 60 — don't game the score by deleting goals.",
  },
  utilization: {
    how: "Aim for 70–90% weekly allocation. The curve gently rewards up to 100%, then falls sharply — both bench and burnout cost you points.",
  },
  value: {
    how: "Worked directly on profitable projects at competitive rates. Measured as margin per hour across allocations, then ranked against peers.",
    gotcha:
      "Internal-only people (no billable allocations) get a neutral 60 here — this factor is rescaled so they aren't penalised.",
  },
  recognition: {
    how: "Kudos received and given in the last 60 days. Receiving weighs 4x more than giving, but giving still counts — pay the kindness forward.",
  },
  focus: {
    how: "Log focus sessions in Focus Mode. 8 sessions in the last 30 days = 100. Short sprints still count.",
  },
  billable: {
    how: "Share of timesheet hours flagged billable. Internal sync calls and HR rituals lower this — that's fine for support roles, where the factor is dropped.",
  },
};

function EmployeeScoreDoc() {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="text-lg font-semibold">Employee Score</div>
            <div className="text-xs text-muted-foreground">
              A single 0–100 signal that balances delivery, wellbeing, and business impact.
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed mt-3">
          We compute the score as a{" "}
          <span className="font-mono bg-muted px-1 py-0.5 rounded">weighted average</span> of six
          factors — each normalised to 0–100 before weighting. Factors that can't be measured for a
          given person (e.g. billable ratio for an internal-only role) are dropped and the remaining
          weights are rescaled, so every person has a comparable number without forced data.
        </p>
      </Card>

      <section>
        <div className="text-sm font-semibold mb-2">The formula</div>
        <Card className="p-5 font-mono text-xs leading-relaxed overflow-x-auto">
          <div className="whitespace-pre">
            {`score = 0.25·Delivery
      + 0.20·Utilization
      + 0.20·Value
      + 0.15·Recognition
      + 0.10·Focus
      + 0.10·Billable

grade  85–100 → exceptional
       70–84  → strong
       55–69  → healthy
       40–54  → watch
        0–39  → struggling`}
          </div>
        </Card>
      </section>

      <section>
        <div className="text-sm font-semibold mb-2">Factors in detail</div>
        <div className="space-y-3">
          {ORDER.map((k) => (
            <Card key={k} className="p-5">
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-sm">{FACTOR_LABELS[k]}</div>
                <Badge
                  variant="outline"
                  className="font-mono"
                  style={{
                    color: scoreColor(80),
                    borderColor: `color-mix(in oklch, ${scoreColor(80)} 35%, transparent)`,
                  }}
                >
                  weight {(SCORE_WEIGHTS[k] * 100).toFixed(0)}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                {FACTOR_DESCRIPTIONS[k]}
              </p>
              <div className="text-xs leading-relaxed">
                <span className="font-semibold">How to move it · </span>
                {TIPS[k].how}
              </div>
              {TIPS[k].gotcha && (
                <div className="mt-2 text-xs flex items-start gap-1.5 text-muted-foreground">
                  <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                  <span>{TIPS[k].gotcha}</span>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section>
        <div className="text-sm font-semibold mb-2">Where the score shows up</div>
        <Card className="p-5 text-xs leading-relaxed space-y-2">
          <p>
            You'll see it wherever employee context matters — in the Saturation overview, hovering
            on any avatar, the Growth page header, the People list, and each employee's profile
            page.
          </p>
          <p>
            The small info button next to a score opens a quick breakdown of the current factor
            values and links back here.
          </p>
        </Card>
      </section>

      <section>
        <div className="text-sm font-semibold mb-2">FAQ</div>
        <div className="space-y-2">
          <Faq q="Is this used for reviews or compensation?">
            No. The score is a workspace-health signal, not a performance review. It reflects
            conditions people are working under (load, recognition, focus time) as much as
            individual output, and changes week to week as context shifts.
          </Faq>
          <Faq q="Why does it change so much week over week?">
            Utilisation and recognition move quickly; delivery and value move slowly. That's by
            design — the score is a read on now, not a career metric.
          </Faq>
          <Faq q="Can I boost my score without doing the work?">
            Not really. The factors are deliberately hard to game individually, and gaming one
            usually hurts another (logging hours you didn't work trashes Value; bombarding coworkers
            with kudos dilutes your own Recognition ranking). Just do the work.
          </Faq>
        </div>
      </section>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <Card className="p-4">
      <div className="font-medium text-sm mb-1">{q}</div>
      <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
    </Card>
  );
}
