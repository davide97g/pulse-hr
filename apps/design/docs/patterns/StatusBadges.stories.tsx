import type { Meta, StoryObj } from "@storybook/react";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  Hourglass,
} from "lucide-react";
import { Badge } from "@pulse-hr/ui/primitives/badge";

const meta: Meta = {
  title: "Patterns/Status badges",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

function Status({
  tone,
  icon: Icon,
  label,
}: {
  tone: "ok" | "pending" | "warn" | "error" | "info";
  icon: typeof CheckCircle2;
  label: string;
}) {
  const map = {
    ok: "bg-success/15 text-success border-success/20",
    pending: "bg-muted text-muted-foreground border-border",
    warn: "bg-warning/15 text-warning border-warning/20",
    error: "bg-destructive/15 text-destructive border-destructive/20",
    info: "bg-info/15 text-info border-info/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${map[tone]}`}
    >
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export const Semantic: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Status tone="ok" icon={CheckCircle2} label="Approved" />
      <Status tone="pending" icon={Hourglass} label="Pending" />
      <Status tone="info" icon={Clock} label="In review" />
      <Status tone="warn" icon={AlertTriangle} label="Over budget" />
      <Status tone="error" icon={XCircle} label="Rejected" />
    </div>
  ),
};

export const ShadcnBadgeSlots: Story = {
  name: "Raw Badge variants (for reference)",
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  ),
};

export const InContext: Story = {
  render: () => (
    <ul className="max-w-md rounded-md border border-border bg-card divide-y divide-border">
      {[
        { who: "Alma Moretti", what: "Leave · May 4–6", s: "ok" as const },
        { who: "Teo Nava", what: "Expense · €142", s: "pending" as const },
        { who: "Mira Rossi", what: "Timesheet · wk 17", s: "warn" as const },
        { who: "Sana Said", what: "Leave · May 12", s: "error" as const },
      ].map((r) => (
        <li key={r.who} className="flex items-center justify-between px-4 py-3">
          <div>
            <div className="text-sm font-medium">{r.who}</div>
            <div className="text-xs text-muted-foreground">{r.what}</div>
          </div>
          <Status
            tone={r.s}
            icon={
              r.s === "ok"
                ? CheckCircle2
                : r.s === "pending"
                  ? Hourglass
                  : r.s === "warn"
                    ? AlertTriangle
                    : XCircle
            }
            label={
              r.s === "ok"
                ? "Approved"
                : r.s === "pending"
                  ? "Pending"
                  : r.s === "warn"
                    ? "Review"
                    : "Rejected"
            }
          />
        </li>
      ))}
    </ul>
  ),
};
