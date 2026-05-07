import type { ReactNode } from "react";

export type DeptId = "ENG" | "DESIGN" | "OPS" | "PEOPLE";
export type LensId = "workload" | "sentiment" | "presence";
export type PresenceState = "OFFICE" | "REMOTE" | "LEAVE" | "SICK" | "OUT";

export interface ConstellationPerson {
  id: string;
  q: number;
  r: number;
  dept: DeptId;
  sat: number;
  sentiment: number;
  presence: PresenceState;
  arrival: string;
  lastOneOnOne: number;
  kudosThisMonth: number;
  surveyResponded: boolean;
  name: string;
  role: string;
  project: string;
  initials: string;
}

export interface LegendNumeric {
  kind: "numeric";
  bg: string;
  glow: boolean;
}
export interface LegendState {
  kind: "state";
  bg: string;
  glow: boolean;
}

export interface MicroCardConfig {
  eyebrow: string;
  title: string;
  big: string;
  caption: string;
  accent?: boolean;
  spark?: boolean;
  status?: string;
  link: string;
}

export interface LensConfig {
  id: LensId;
  role: string;
  eyebrow: string;
  headline: [string, string, string];
  captionMono: string;
  kpiLabel: string;
  legendLabel: string;
  legend: Array<[number | PresenceState, string]>;
  legendKind?: "states" | "numeric";
  fill: (p: ConstellationPerson) => string;
  ring: (p: ConstellationPerson) => string;
  glow: (p: ConstellationPerson) => boolean;
  kpiValue: (people: ConstellationPerson[]) => string | number;
  kpiSuffix: string;
  statTriad: (people: ConstellationPerson[]) => Array<[string, number, boolean]>;
  legendItem: (entry: number | PresenceState) => { bg: string; glow: boolean };
  narrative: ReactNode;
  actions: Array<string | { spark: true; label: string; to?: string } | { label: string; to: string }>;
  tooltipPrimary: (p: ConstellationPerson) => { label: string; value: string; accent: boolean };
  tooltipSecondary: (p: ConstellationPerson) => { label: string; value: string };
}
