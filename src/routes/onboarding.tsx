import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Pulse HR" }] }),
  component: Onboarding,
});

const initialTasks = [
  { id: "t1", label: "Send offer letter", done: true, owner: "Aisha Patel" },
  { id: "t2", label: "Run background check", done: true, owner: "Olivia Brown" },
  { id: "t3", label: "Order laptop & equipment", done: true, owner: "IT Team" },
  { id: "t4", label: "Set up email & accounts", done: false, owner: "IT Team" },
  { id: "t5", label: "Schedule welcome call", done: false, owner: "Sarah Chen" },
  { id: "t6", label: "Sign employment contract", done: false, owner: "Emma Wilson" },
  { id: "t7", label: "Complete tax forms", done: false, owner: "Emma Wilson" },
  { id: "t8", label: "First-week training", done: false, owner: "Aisha Patel" },
];

function Onboarding() {
  const [tasks, setTasks] = useState(initialTasks);
  const done = tasks.filter(t => t.done).length;
  const pct = (done / tasks.length) * 100;

  return (
    <div className="p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader
        title="Onboarding"
        description="Active workflows for new hires"
        actions={<Button size="sm"><Plus className="h-4 w-4 mr-1.5" />New workflow</Button>}
      />

      <Card className="p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          <Avatar initials="EW" color="oklch(0.7 0.15 30)" size={56} />
          <div className="flex-1">
            <div className="text-lg font-semibold">Emma Wilson</div>
            <div className="text-sm text-muted-foreground">Senior Engineer • Starts May 6, 2025</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold">{done}/{tasks.length}</div>
            <div className="text-xs text-muted-foreground">tasks complete</div>
          </div>
        </div>
        <Progress value={pct} className="h-2" />

        <div className="mt-6 space-y-1.5">
          {tasks.map(t => (
            <div
              key={t.id}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/40 cursor-pointer group"
              onClick={() => setTasks(arr => arr.map(x => x.id === t.id ? { ...x, done: !x.done } : x))}
            >
              {t.done ? <CheckCircle2 className="h-5 w-5 text-success shrink-0" /> : <Circle className="h-5 w-5 text-muted-foreground/50 shrink-0" />}
              <div className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : ""}`}>{t.label}</div>
              <div className="text-xs text-muted-foreground">{t.owner}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <div className="text-sm font-semibold mb-3">Other workflows in progress</div>
        <div className="space-y-2">
          {[
            { name: "James Liu", role: "Senior Engineer", pct: 25 },
            { name: "Sofia Garcia", role: "Product Designer", pct: 60 },
            { name: "Greg Holland", role: "Offboarding", pct: 80 },
          ].map((w, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-md border hover:bg-muted/40 cursor-pointer">
              <Avatar initials={w.name.split(" ").map(p => p[0]).join("")} color="oklch(0.6 0.16 220)" size={32} />
              <div className="flex-1">
                <div className="text-sm font-medium">{w.name}</div>
                <div className="text-xs text-muted-foreground">{w.role}</div>
              </div>
              <div className="w-32"><Progress value={w.pct} className="h-1.5" /></div>
              <div className="text-xs text-muted-foreground w-10 text-right">{w.pct}%</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
