import type { ReactNode } from "react";
import type { ConstellationPerson, LensConfig, PresenceState } from "./types";

function satFill(sat: number, dark: boolean): string {
  if (sat > 1.05) return dark ? "#b4ff39" : "#9be01a";
  if (sat > 0.95) return dark ? "#cdff66" : "#b4ff39";
  if (sat > 0.8) return dark ? "#7d9a40" : "#5b7a26";
  if (sat > 0.6) return dark ? "#3f4a26" : "#cfd6b8";
  if (sat > 0.4) return dark ? "#2c2f24" : "#e2dfd0";
  return dark ? "#23211d" : "#ecebe5";
}
function satRing(sat: number, dark: boolean): string {
  if (sat > 1.05) return dark ? "#eaffb6" : "#5b7a26";
  return "transparent";
}
function sentimentFill(s: number, dark: boolean, responded = true): string {
  if (!responded) return dark ? "#1a1814" : "#e6e3da";
  if (s < 2.0) return dark ? "#ff6a3d" : "#e85a2a";
  if (s < 2.7) return dark ? "#a83a1d" : "#f3b497";
  if (s < 3.4) return dark ? "#3a3329" : "#dad5c4";
  if (s < 4.1) return dark ? "#7d9a40" : "#cfd6b8";
  return dark ? "#b4ff39" : "#9be01a";
}
function sentimentRing(s: number, dark: boolean, responded = true): string {
  if (!responded) return dark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.18)";
  if (s < 2.0) return dark ? "#ffb89c" : "#a8330e";
  if (s > 4.5) return dark ? "#eaffb6" : "#5b7a26";
  return "transparent";
}
function presenceFill(state: PresenceState, dark: boolean): string {
  switch (state) {
    case "OFFICE":
      return dark ? "#b4ff39" : "#9be01a";
    case "REMOTE":
      return dark ? "#5e7a26" : "#7d9a40";
    case "LEAVE":
      return dark ? "#3a3329" : "#dad5c4";
    case "SICK":
      return dark ? "#a83a1d" : "#e85a2a";
    case "OUT":
    default:
      return dark ? "#23211d" : "#ecebe5";
  }
}
function presenceRing(state: PresenceState, dark: boolean): string {
  if (state === "OFFICE") return dark ? "#eaffb6" : "#5b7a26";
  if (state === "SICK") return dark ? "#ffb89c" : "#a8330e";
  return "transparent";
}
function presenceLabel(state: PresenceState): string {
  return (
    {
      OFFICE: "in ufficio",
      REMOTE: "remoto",
      LEAVE: "ferie",
      SICK: "malattia",
      OUT: "fuori",
    }[state] ?? state
  );
}

export function workloadLens(dark: boolean, narrative: ReactNode, captionMono: string): LensConfig {
  return {
    id: "workload",
    role: "CEO · COO · Resource manager",
    eyebrow: "WORKLOAD",
    headline: ["L'azienda ", "respira", "."],
    captionMono,
    kpiLabel: "SATURAZIONE MEDIA",
    legendLabel: "CARICO PER PERSONA",
    legend: [
      [0.3, "<40"],
      [0.55, "40–60"],
      [0.75, "60–80"],
      [0.9, "80–95"],
      [1.0, "≈100"],
      [1.15, ">100"],
    ],
    legendKind: "numeric",
    fill: (p) => satFill(p.sat, dark),
    ring: (p) => satRing(p.sat, dark),
    glow: (p) => p.sat > 1.05,
    kpiValue: (people) => {
      const total = people.length || 1;
      return Math.round((100 * people.reduce((a, p) => a + p.sat, 0)) / total);
    },
    kpiSuffix: "%",
    statTriad: (people) => [
      ["OVER", people.filter((p) => p.sat > 1.05).length, true],
      ["BALANCED", people.filter((p) => p.sat > 0.6 && p.sat <= 1.05).length, false],
      ["IDLE", people.filter((p) => p.sat <= 0.4).length, false],
    ],
    legendItem: (s) => ({ bg: satFill(s as number, dark), glow: (s as number) > 1.05 }),
    narrative,
    actions: [
      { label: "Progetti", to: "/projects" },
      { label: "Reports", to: "/reports" },
      { spark: true, label: "Apri saturation", to: "/saturation" },
    ],
    tooltipPrimary: (p) => ({
      label: "SATURAZIONE",
      value: `${Math.round(p.sat * 100)}%`,
      accent: p.sat > 1.05,
    }),
    tooltipSecondary: (p) => ({ label: "SU", value: p.project }),
  };
}

export function sentimentLens(dark: boolean, narrative: ReactNode, captionMono: string): LensConfig {
  return {
    id: "sentiment",
    role: "HR · People ops",
    eyebrow: "SENTIMENT",
    headline: ["L'azienda ", "sente", "."],
    captionMono,
    kpiLabel: "ENPS / MOOD MEDIO",
    legendLabel: "BENESSERE PER PERSONA",
    legend: [
      [1.6, "1·CRITICO"],
      [2.4, "2·BASSO"],
      [3.2, "3·NEUTRO"],
      [3.9, "4·BENE"],
      [4.6, "5·ALTO"],
    ],
    legendKind: "numeric",
    fill: (p) => sentimentFill(p.sentiment, dark, p.surveyResponded),
    ring: (p) => sentimentRing(p.sentiment, dark, p.surveyResponded),
    glow: (p) => p.sentiment < 2.2,
    kpiValue: (people) => {
      const r = people.filter((p) => p.surveyResponded);
      if (!r.length) return "0.0";
      return (r.reduce((a, p) => a + p.sentiment, 0) / r.length).toFixed(1);
    },
    kpiSuffix: "/ 5",
    statTriad: (people) => [
      [
        "A RISCHIO",
        people.filter((p) => p.surveyResponded && p.sentiment < 2.5).length,
        true,
      ],
      [
        "NEUTRI",
        people.filter((p) => p.surveyResponded && p.sentiment >= 2.5 && p.sentiment < 3.8).length,
        false,
      ],
      ["FELICI", people.filter((p) => p.surveyResponded && p.sentiment >= 3.8).length, false],
    ],
    legendItem: (s) => ({ bg: sentimentFill(s as number, dark, true), glow: (s as number) < 2.2 }),
    narrative,
    actions: [
      { label: "Status log", to: "/log" },
      { label: "Reports", to: "/reports" },
      { spark: true, label: "Apri growth", to: "/growth" },
    ],
    tooltipPrimary: (p) => ({
      label: "MOOD",
      value: p.surveyResponded ? `${p.sentiment.toFixed(1)} / 5` : "no risp.",
      accent: p.surveyResponded && p.sentiment < 2.5,
    }),
    tooltipSecondary: (p) => ({
      label: "ULTIMO 1-ON-1",
      value: p.lastOneOnOne === 0 ? "oggi" : `${p.lastOneOnOne}g fa`,
    }),
  };
}

export function presenceLens(dark: boolean, narrative: ReactNode, captionMono: string): LensConfig {
  return {
    id: "presence",
    role: "PM · Team lead",
    eyebrow: "PRESENZA",
    headline: ["Oggi ", "ci sono", "."],
    captionMono,
    kpiLabel: "PRESENTI ORA",
    legendLabel: "STATO PER PERSONA",
    legend: [
      ["OFFICE", "office"],
      ["REMOTE", "remote"],
      ["LEAVE", "ferie"],
      ["SICK", "malattia"],
      ["OUT", "fuori"],
    ],
    legendKind: "states",
    fill: (p) => presenceFill(p.presence, dark),
    ring: (p) => presenceRing(p.presence, dark),
    glow: (p) => p.presence === "SICK",
    kpiValue: (people) =>
      people.filter((p) => p.presence === "OFFICE" || p.presence === "REMOTE").length,
    kpiSuffix: `/ ${"x".repeat(0)}`,
    statTriad: (people) => [
      ["OFFICE", people.filter((p) => p.presence === "OFFICE").length, true],
      ["REMOTE", people.filter((p) => p.presence === "REMOTE").length, false],
      [
        "ASSENTI",
        people.filter((p) => p.presence === "LEAVE" || p.presence === "SICK" || p.presence === "OUT")
          .length,
        false,
      ],
    ],
    legendItem: (state) => ({
      bg: presenceFill(state as PresenceState, dark),
      glow: (state as PresenceState) === "SICK",
    }),
    narrative,
    actions: [
      { label: "Calendario", to: "/time" },
      { label: "Uffici", to: "/offices" },
      { spark: true, label: "Apri timesheet", to: "/time" },
    ],
    tooltipPrimary: (p) => ({
      label: "STATO",
      value: presenceLabel(p.presence),
      accent: p.presence === "OFFICE",
    }),
    tooltipSecondary: (p) => ({ label: "DA", value: p.arrival }),
  };
}

export function lensFor(
  id: LensConfig["id"],
  dark: boolean,
  options: { narrative: ReactNode; captionMono: string; totalPeople: number },
): LensConfig {
  if (id === "sentiment") return sentimentLens(dark, options.narrative, options.captionMono);
  if (id === "presence") {
    const lens = presenceLens(dark, options.narrative, options.captionMono);
    return { ...lens, kpiSuffix: `/ ${options.totalPeople}` };
  }
  return workloadLens(dark, options.narrative, options.captionMono);
}

export type { ConstellationPerson };
