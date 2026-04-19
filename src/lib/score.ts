import {
  allocations,
  employees,
  focusSessionsSeed,
  goalsSeed,
  kudosSeed,
  timesheetEntries,
  type Employee,
} from "./mock-data";
import { personWeeklyLoad, personValue } from "./projects";

/**
 * Employee Score — 0..100, weighted average of six factors.
 * Factors are each normalised to 0..100 before weighting so a person
 * who is strong on some dimensions and average on others still scores well.
 *
 *   Score = 0.25·Delivery + 0.20·Utilization + 0.20·Value
 *         + 0.15·Recognition + 0.10·Focus + 0.10·Billable
 *
 * Values that can't be computed (e.g. billable for internal-only roles)
 * are dropped and the remaining weights rescaled, so every person has a
 * comparable number regardless of which data is present.
 */

export interface FactorBreakdown {
  key: FactorKey;
  label: string;
  value: number; // 0..100
  weight: number; // original weight (before rescale)
  detail: string; // human-readable calc
  missing?: boolean;
}

export type FactorKey =
  | "delivery"
  | "utilization"
  | "value"
  | "recognition"
  | "focus"
  | "billable";

export interface EmployeeScore {
  employeeId: string;
  score: number; // 0..100
  grade: "exceptional" | "strong" | "healthy" | "watch" | "struggling";
  factors: FactorBreakdown[];
}

export const SCORE_WEIGHTS: Record<FactorKey, number> = {
  delivery: 0.25,
  utilization: 0.2,
  value: 0.2,
  recognition: 0.15,
  focus: 0.1,
  billable: 0.1,
};

export const FACTOR_LABELS: Record<FactorKey, string> = {
  delivery: "Delivery",
  utilization: "Utilization",
  value: "Value",
  recognition: "Recognition",
  focus: "Focus",
  billable: "Billable",
};

export const FACTOR_DESCRIPTIONS: Record<FactorKey, string> = {
  delivery: "Average of goal progress + hit-rate across the person's active and recent goals.",
  utilization:
    "How close weekly allocation sits to the healthy band (70–90%). Above or below is penalised.",
  value:
    "Profit per hour delivered, normalised against the team. Rewards people whose allocations actually make margin.",
  recognition: "Kudos received and given in the last 60 days, normalised against peers.",
  focus: "Count of focus sessions in the last 30 days — proxy for deep work discipline.",
  billable:
    "Share of tracked hours that are billable to clients — skipped for internal-only roles.",
};

export function computeEmployeeScore(employeeId: string): EmployeeScore {
  const emp = employees.find((e) => e.id === employeeId);
  if (!emp) {
    return { employeeId, score: 0, grade: "struggling", factors: [] };
  }

  const factors: FactorBreakdown[] = [
    deliveryFactor(emp),
    utilizationFactor(emp),
    valueFactor(emp),
    recognitionFactor(emp),
    focusFactor(emp),
    billableFactor(emp),
  ];

  // Rescale weights over non-missing factors
  const totalWeight = factors
    .filter((f) => !f.missing)
    .reduce((s, f) => s + f.weight, 0);
  const weighted = factors.reduce(
    (s, f) => (f.missing ? s : s + f.value * (f.weight / Math.max(1e-6, totalWeight))),
    0,
  );
  const score = Math.round(Math.max(0, Math.min(100, weighted)));
  return { employeeId, score, grade: grade(score), factors };
}

export function allEmployeeScores(): EmployeeScore[] {
  return employees.map((e) => computeEmployeeScore(e.id));
}

function grade(score: number): EmployeeScore["grade"] {
  if (score >= 85) return "exceptional";
  if (score >= 70) return "strong";
  if (score >= 55) return "healthy";
  if (score >= 40) return "watch";
  return "struggling";
}

// ── Factor calculators ───────────────────────────────────────────────

function deliveryFactor(e: Employee): FactorBreakdown {
  const mine = goalsSeed.filter((g) => g.employeeId === e.id);
  if (mine.length === 0) {
    return {
      key: "delivery",
      label: FACTOR_LABELS.delivery,
      value: 60,
      weight: SCORE_WEIGHTS.delivery,
      detail: "No goals on record — neutral 60 placeholder.",
      missing: true,
    };
  }
  const hit = mine.filter((g) => g.status === "hit").length;
  const missed = mine.filter((g) => g.status === "missed").length;
  const progressAvg = mine.reduce((s, g) => s + g.progress, 0) / mine.length;
  const hitRate = (hit / Math.max(1, hit + missed)) * 100;
  const value = Math.round(0.6 * progressAvg + 0.4 * hitRate);
  return {
    key: "delivery",
    label: FACTOR_LABELS.delivery,
    value: clamp(value),
    weight: SCORE_WEIGHTS.delivery,
    detail: `${mine.length} goal(s) · avg progress ${progressAvg.toFixed(0)}% · hit-rate ${hitRate.toFixed(0)}%`,
  };
}

function utilizationFactor(e: Employee): FactorBreakdown {
  const load = personWeeklyLoad(e.id, new Date());
  // Piecewise: 0 at ≤10%, rises to 100 at 80%, falls to 60 at 110%+, 30 at 140%
  let v: number;
  if (load <= 10) v = 0;
  else if (load < 80) v = 20 + ((load - 10) / 70) * 80; // 20 → 100 linearly
  else if (load <= 100) v = 100 - ((load - 80) / 20) * 10; // 100 → 90
  else if (load <= 120) v = 90 - ((load - 100) / 20) * 30; // 90 → 60
  else v = Math.max(20, 60 - ((load - 120) / 30) * 30);
  return {
    key: "utilization",
    label: FACTOR_LABELS.utilization,
    value: clamp(Math.round(v)),
    weight: SCORE_WEIGHTS.utilization,
    detail: `This week's allocation ${load}% (sweet spot 70–90%).`,
  };
}

function valueFactor(e: Employee): FactorBreakdown {
  const allVals = personValue();
  const mine = allVals.find((p) => p.employeeId === e.id);
  if (!mine || mine.hours <= 0) {
    return {
      key: "value",
      label: FACTOR_LABELS.value,
      value: 60,
      weight: SCORE_WEIGHTS.value,
      detail: "No billed allocations yet — neutral score.",
      missing: true,
    };
  }
  const myPerHour = (mine.revenue - mine.cost) / mine.hours;
  const peers = allVals.filter((p) => p.hours > 0);
  const perHours = peers.map((p) => (p.revenue - p.cost) / p.hours);
  const max = Math.max(...perHours);
  const min = Math.min(...perHours);
  const range = max - min || 1;
  const norm = ((myPerHour - min) / range) * 100;
  return {
    key: "value",
    label: FACTOR_LABELS.value,
    value: clamp(Math.round(norm)),
    weight: SCORE_WEIGHTS.value,
    detail: `€${myPerHour.toFixed(0)}/h margin delivered — ranked vs peers.`,
  };
}

function recognitionFactor(e: Employee): FactorBreakdown {
  const cutoff = Date.now() - 60 * 24 * 60 * 60 * 1000;
  const within = (iso: string) => new Date(iso).getTime() >= cutoff;
  const received = kudosSeed
    .filter((k) => k.toId === e.id && within(k.date))
    .reduce((s, k) => s + k.amount, 0);
  const given = kudosSeed
    .filter((k) => k.fromId === e.id && within(k.date))
    .reduce((s, k) => s + k.amount, 0);
  const totalReceived = employees.map(
    (emp) =>
      kudosSeed
        .filter((k) => k.toId === emp.id && within(k.date))
        .reduce((s, k) => s + k.amount, 0),
  );
  const max = Math.max(1, ...totalReceived);
  const norm = (received / max) * 80 + Math.min(20, (given / max) * 20);
  return {
    key: "recognition",
    label: FACTOR_LABELS.recognition,
    value: clamp(Math.round(norm)),
    weight: SCORE_WEIGHTS.recognition,
    detail: `${received} coins received · ${given} coins given in last 60d.`,
  };
}

function focusFactor(e: Employee): FactorBreakdown {
  const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const mine = focusSessionsSeed.filter(
    (f) => f.employeeId === e.id && new Date(f.date).getTime() >= cutoff,
  );
  if (mine.length === 0) {
    return {
      key: "focus",
      label: FACTOR_LABELS.focus,
      value: 50,
      weight: SCORE_WEIGHTS.focus,
      detail: "No focus sessions in the last 30 days.",
      missing: true,
    };
  }
  // 8 sessions/month = 100
  const v = Math.min(100, (mine.length / 8) * 100);
  return {
    key: "focus",
    label: FACTOR_LABELS.focus,
    value: clamp(Math.round(v)),
    weight: SCORE_WEIGHTS.focus,
    detail: `${mine.length} focus session(s) in last 30 days.`,
  };
}

function billableFactor(e: Employee): FactorBreakdown {
  const mine = timesheetEntries.filter((t) => t.employeeId === e.id);
  if (mine.length === 0) {
    // Fall back to allocations to see if person has any billable work
    const mineAllocs = allocations.filter((a) => a.employeeId === e.id);
    if (mineAllocs.length === 0) {
      return {
        key: "billable",
        label: FACTOR_LABELS.billable,
        value: 0,
        weight: SCORE_WEIGHTS.billable,
        detail: "No tracked hours or allocations.",
        missing: true,
      };
    }
    const billablePct = mineAllocs.some((a) => (a.billableRate ?? 0) > 0) ? 75 : 40;
    return {
      key: "billable",
      label: FACTOR_LABELS.billable,
      value: billablePct,
      weight: SCORE_WEIGHTS.billable,
      detail: "Estimated from current allocations (no timesheets yet).",
    };
  }
  const total = mine.reduce((s, t) => s + t.hours, 0);
  const billable = mine.filter((t) => t.billable).reduce((s, t) => s + t.hours, 0);
  const pct = total > 0 ? (billable / total) * 100 : 0;
  return {
    key: "billable",
    label: FACTOR_LABELS.billable,
    value: clamp(Math.round(pct)),
    weight: SCORE_WEIGHTS.billable,
    detail: `${billable.toFixed(0)}h billable of ${total.toFixed(0)}h tracked.`,
  };
}

function clamp(v: number): number {
  return Math.max(0, Math.min(100, v));
}

export function scoreColor(score: number): string {
  if (score >= 85) return "oklch(0.65 0.18 155)"; // vibrant green
  if (score >= 70) return "oklch(0.7 0.14 155)"; // softer green
  if (score >= 55) return "oklch(0.72 0.12 80)"; // amber
  if (score >= 40) return "oklch(0.7 0.16 40)"; // orange
  return "oklch(0.6 0.2 25)"; // red
}

export function scoreTone(score: number): "good" | "ok" | "warn" | "bad" {
  if (score >= 70) return "good";
  if (score >= 55) return "ok";
  if (score >= 40) return "warn";
  return "bad";
}
