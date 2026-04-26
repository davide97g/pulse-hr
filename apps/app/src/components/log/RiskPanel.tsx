import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, AlertTriangle, MessageSquare } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import type { Employee, EmployeeLogHealth, ManagerAsk } from "@/lib/mock-data";
import { managerAsksTable } from "@/lib/tables/managerAsks";
import { AskTopicDialog } from "./AskTopicDialog";

export interface RiskPanelProps {
  rows: { employee: Employee; health: EmployeeLogHealth }[];
}

interface RiskRow {
  employee: Employee;
  health: EmployeeLogHealth;
  reason: string;
  topic: string;
  prompt: string;
}

export function RiskPanel({ rows }: RiskPanelProps) {
  const [askFor, setAskFor] = useState<RiskRow | null>(null);
  const risks: RiskRow[] = rows
    .map(({ employee, health }) => {
      const reasons: string[] = [];
      if (health.trend === "down") reasons.push("trending down");
      if (health.dimensions.stress > 0.4) reasons.push("stress signals high");
      if (health.dimensions.engagement < -0.2) reasons.push("engagement dipping");
      if (health.score < 55) reasons.push("score below 55");
      if (reasons.length === 0) return null;
      const { topic, prompt } = riskPrompt(employee, health);
      return {
        employee,
        health,
        reason: reasons.slice(0, 2).join(" · "),
        topic,
        prompt,
      };
    })
    .filter((x): x is RiskRow => x !== null)
    .sort((a, b) => a.health.score - b.health.score)
    .slice(0, 6);

  return (
    <section className="rounded-xl border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold inline-flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          Risk signals
        </h3>
        <span className="text-[11px] text-muted-foreground">{risks.length} flagged</span>
      </div>
      {risks.length === 0 ? (
        <p className="text-xs text-muted-foreground">No risk signals — team is steady.</p>
      ) : (
        <ul className="space-y-2">
          {risks.map((r) => (
            <li
              key={r.employee.id}
              className="flex items-center gap-3 rounded-lg border bg-background/60 p-2.5"
            >
              <span className="grid h-8 w-8 place-items-center rounded-full bg-destructive/10 text-destructive">
                <ArrowDownRight className="h-4 w-4" />
              </span>
              <div className="flex-1 min-w-0">
                <Link
                  to="/log/$employeeId"
                  params={{ employeeId: r.employee.id }}
                  className="text-sm font-medium hover:underline truncate block"
                >
                  {r.employee.name}
                </Link>
                <div className="text-[11px] text-muted-foreground truncate">
                  Score {r.health.score} · {r.reason}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => setAskFor(r)}>
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Send empathetic ask
              </Button>
            </li>
          ))}
        </ul>
      )}
      {askFor && (
        <AskTopicDialog
          employeeId={askFor.employee.id}
          open
          onOpenChange={(o) => !o && setAskFor(null)}
          onCreate={(a: ManagerAsk) => managerAsksTable.add({ ...a, tone: "empathetic" })}
        />
      )}
    </section>
  );
}

function riskPrompt(employee: Employee, health: EmployeeLogHealth): { topic: string; prompt: string } {
  const first = employee.name.split(" ")[0];
  if (health.dimensions.stress > 0.4) {
    return {
      topic: "Workload check",
      prompt: `${first}, just a pulse — feeling stretched? Anything I can take off your plate this week?`,
    };
  }
  if (health.dimensions.engagement < -0.2) {
    return {
      topic: "Energy check",
      prompt: `Hey ${first}, energy-wise how's the work feeling lately? Anything that would re-spark momentum?`,
    };
  }
  if (health.trend === "down") {
    return {
      topic: "Trend check",
      prompt: `Noticing a dip this week, ${first}. Anything you'd want me to know — even off the record?`,
    };
  }
  return {
    topic: "How's it going",
    prompt: `Just checking in, ${first}. What would help most right now?`,
  };
}
