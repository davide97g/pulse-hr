/**
 * Skills Matrix — mock seed + helpers.
 *
 * Catalog of 25 hard/soft skills, the active user (Davide / DG) self-matrix
 * (12 rows), the team grid for the manager heatmap, and a small slice marked
 * as proposed-awaiting-validation. Numbers tuned to produce visible team
 * strengths AND visible gaps so the manager view is interesting on first
 * render.
 *
 * IDs are local to this feature to avoid stomping on real `employees` seeds
 * elsewhere in mock-data — Skills views render this team only.
 */

export type SkillLevel = "novice" | "practitioner" | "expert" | "master";
export type SkillBucket = "hard" | "soft";
export type SkillValidation = "proposed" | "validated";

export interface SkillCatalogEntry {
  id: string;
  name: string;
  bucket: SkillBucket;
}

export interface SkillTeamMember {
  id: string;
  initials: string;
  name: string;
  role: string;
  dept: string;
}

export interface MySkillRow {
  id: string;
  sk: string;
  lvl: SkillLevel;
  val: SkillValidation;
  upd: string;
  by: string | null;
  note?: string;
}

export const LV: SkillLevel[] = ["novice", "practitioner", "expert", "master"];

export const LV_LABEL: Record<SkillLevel, string> = {
  novice: "Novice",
  practitioner: "Practitioner",
  expert: "Expert",
  master: "Master",
};

export const LV_INDEX: Record<SkillLevel, number> = {
  novice: 1,
  practitioner: 2,
  expert: 3,
  master: 4,
};

export const LV_PCT: Record<SkillLevel, number> = {
  novice: 35,
  practitioner: 60,
  expert: 85,
  master: 100,
};

export const LV_CAPTION: Record<SkillLevel, string> = {
  master: "Le poche cose che padroneggi",
  expert: "Dove ti chiamano per nome",
  practitioner: "Sai farlo bene · non insegnarlo",
  novice: "Sei in apprendimento attivo",
};

export const SKILL_CATALOG: SkillCatalogEntry[] = [
  { id: "react", name: "React", bucket: "hard" },
  { id: "ts", name: "TypeScript", bucket: "hard" },
  { id: "node", name: "Node.js", bucket: "hard" },
  { id: "nextjs", name: "Next.js", bucket: "hard" },
  { id: "sql", name: "SQL", bucket: "hard" },
  { id: "postgres", name: "PostgreSQL", bucket: "hard" },
  { id: "python", name: "Python", bucket: "hard" },
  { id: "aws", name: "AWS", bucket: "hard" },
  { id: "k8s", name: "Kubernetes", bucket: "hard" },
  { id: "figma", name: "Figma", bucket: "hard" },
  { id: "excel", name: "Excel", bucket: "hard" },
  { id: "gdpr", name: "GDPR", bucket: "hard" },
  { id: "tailwind", name: "Tailwind", bucket: "hard" },
  { id: "linux", name: "Linux", bucket: "hard" },
  { id: "mentor", name: "Mentoring", bucket: "soft" },
  { id: "speak", name: "Public speaking", bucket: "soft" },
  { id: "conflict", name: "Conflict resolution", bucket: "soft" },
  { id: "writing", name: "Async writing", bucket: "soft" },
  { id: "stake", name: "Stakeholder mgmt", bucket: "soft" },
  { id: "hiring", name: "Hiring", bucket: "soft" },
  { id: "facil", name: "Facilitation", bucket: "soft" },
  { id: "negot", name: "Negotiation", bucket: "soft" },
  { id: "coach", name: "Coaching", bucket: "soft" },
  { id: "story", name: "Storytelling", bucket: "soft" },
  { id: "empathy", name: "Empathy", bucket: "soft" },
];

export const SKILL_TEAM: SkillTeamMember[] = [
  { id: "av", initials: "AV", name: "Anna Vialli", role: "Sr Designer", dept: "Design" },
  { id: "mr", initials: "MR", name: "Marco Rinaldi", role: "Sr Engineer", dept: "Platform" },
  { id: "tg", initials: "TG", name: "Tom Greco", role: "Engineer", dept: "Platform" },
  { id: "sc", initials: "SC", name: "Sara Conti", role: "Designer", dept: "Design" },
  { id: "gp", initials: "GP", name: "Giulio Pieri", role: "Data Eng", dept: "Data" },
  { id: "lf", initials: "LF", name: "Lucia Ferri", role: "HR Lead", dept: "People" },
  { id: "rv", initials: "RV", name: "Riccardo Vedova", role: "Eng Manager", dept: "Platform" },
  { id: "em", initials: "EM", name: "Elena Marini", role: "Engineer", dept: "Platform" },
  { id: "dg", initials: "DG", name: "Davide Greco", role: "Designer", dept: "Design" },
];

export const MY_ID = "dg";

export const MY_SKILLS: MySkillRow[] = [
  { id: "s1", sk: "figma", lvl: "master", val: "validated", upd: "12 apr 2026", by: "av", note: "Owns the design-system file." },
  { id: "s2", sk: "react", lvl: "expert", val: "validated", upd: "08 apr 2026", by: "rv" },
  { id: "s3", sk: "ts", lvl: "expert", val: "validated", upd: "08 apr 2026", by: "rv" },
  { id: "s4", sk: "tailwind", lvl: "expert", val: "validated", upd: "02 mar 2026", by: "av" },
  { id: "s5", sk: "story", lvl: "expert", val: "validated", upd: "26 feb 2026", by: "lf", note: "Wrote the rewrite of the homepage." },
  { id: "s6", sk: "nextjs", lvl: "practitioner", val: "validated", upd: "14 feb 2026", by: "rv" },
  { id: "s7", sk: "writing", lvl: "practitioner", val: "validated", upd: "30 gen 2026", by: "lf", note: "RFCs land well in async." },
  { id: "s8", sk: "facil", lvl: "practitioner", val: "validated", upd: "22 gen 2026", by: "lf" },
  { id: "s9", sk: "mentor", lvl: "practitioner", val: "proposed", upd: "06 mag 2026", by: null, note: "Mentoring Sara since february." },
  { id: "s10", sk: "speak", lvl: "novice", val: "proposed", upd: "06 mag 2026", by: null },
  { id: "s11", sk: "sql", lvl: "novice", val: "validated", upd: "12 dic 2025", by: "rv" },
  { id: "s12", sk: "gdpr", lvl: "novice", val: "validated", upd: "10 nov 2025", by: "lf" },
];

type GridRow = Partial<Record<string, SkillLevel>>;

export const SKILL_GRID: Record<string, GridRow> = {
  react: { mr: "master", em: "expert", tg: "practitioner", dg: "expert", rv: "expert" },
  ts: { mr: "master", em: "expert", tg: "practitioner", dg: "expert", rv: "master", gp: "practitioner" },
  node: { mr: "expert", em: "practitioner", tg: "novice", rv: "expert" },
  nextjs: { mr: "expert", em: "practitioner", dg: "practitioner" },
  sql: { gp: "master", mr: "expert", rv: "expert", dg: "novice", em: "practitioner", tg: "novice" },
  postgres: { gp: "master", rv: "expert", mr: "practitioner", em: "novice" },
  python: { gp: "expert", mr: "practitioner" },
  aws: { rv: "expert", mr: "practitioner", em: "novice" },
  k8s: { rv: "practitioner", mr: "novice" },
  figma: { av: "master", sc: "expert", dg: "master", lf: "novice" },
  excel: { lf: "expert", gp: "practitioner", rv: "practitioner" },
  gdpr: { lf: "master", rv: "practitioner", dg: "novice" },
  tailwind: { dg: "expert", av: "expert", sc: "practitioner", mr: "practitioner", em: "practitioner" },
  linux: { rv: "expert", mr: "expert", gp: "practitioner" },
  mentor: { av: "master", lf: "master", rv: "expert", mr: "expert", dg: "practitioner" },
  speak: { lf: "expert", av: "practitioner", rv: "practitioner", dg: "novice" },
  conflict: { lf: "expert", rv: "expert", av: "practitioner" },
  writing: { rv: "master", mr: "expert", av: "expert", dg: "practitioner", lf: "expert" },
  stake: { lf: "expert", rv: "expert", av: "practitioner" },
  hiring: { lf: "master", rv: "expert" },
  facil: { lf: "expert", av: "practitioner", dg: "practitioner", rv: "practitioner" },
  negot: { lf: "practitioner", rv: "practitioner" },
  coach: { lf: "expert", av: "expert", rv: "practitioner" },
  story: { av: "expert", dg: "expert", sc: "practitioner", lf: "practitioner" },
  empathy: { lf: "master", av: "expert", sc: "expert", dg: "expert", tg: "practitioner", em: "practitioner" },
};

export const PROPOSED: ReadonlySet<string> = new Set([
  "mentor:dg",
  "speak:dg",
  "k8s:mr",
  "negot:rv",
  "story:sc",
  "python:gp",
  "nextjs:dg",
]);

export function cellLevel(skillId: string, empId: string): SkillLevel | undefined {
  return SKILL_GRID[skillId]?.[empId];
}

export function isProposed(skillId: string, empId: string): boolean {
  return PROPOSED.has(`${skillId}:${empId}`);
}

export function skill(id: string): SkillCatalogEntry | undefined {
  return SKILL_CATALOG.find((s) => s.id === id);
}

export function employee(id: string): SkillTeamMember | undefined {
  return SKILL_TEAM.find((e) => e.id === id);
}

export function levelPct(lvl: SkillLevel | undefined): number {
  return lvl ? LV_PCT[lvl] : 0;
}

export interface LevelDistribution {
  n: number;
  val: number;
  dist: Record<SkillLevel, number>;
}

export function countByLevel(empId: string): LevelDistribution {
  const dist: Record<SkillLevel, number> = { novice: 0, practitioner: 0, expert: 0, master: 0 };
  let n = 0;
  let val = 0;
  if (empId === MY_ID) {
    for (const r of MY_SKILLS) {
      n++;
      dist[r.lvl]++;
      if (r.val === "validated") val++;
    }
  } else {
    for (const s of SKILL_CATALOG) {
      const l = cellLevel(s.id, empId);
      if (l) {
        n++;
        dist[l]++;
        if (!isProposed(s.id, empId)) val++;
      }
    }
  }
  return { n, val, dist };
}

export interface TeamMetrics {
  skills: number;
  people: number;
  totalCells: number;
  coverage: number;
  pending: number;
  gaps: number;
}

export function teamMetrics(): TeamMetrics {
  let totalCells = 0;
  let pending = 0;
  let validCovered = 0;
  let gaps = 0;
  for (const s of SKILL_CATALOG) {
    let validatedCount = 0;
    let practitionerPlus = 0;
    for (const e of SKILL_TEAM) {
      const l = cellLevel(s.id, e.id);
      if (l) {
        totalCells++;
        if (isProposed(s.id, e.id)) pending++;
        else validatedCount++;
        if (LV_INDEX[l] >= 2) practitionerPlus++;
      }
    }
    if (validatedCount >= 1) validCovered++;
    if (practitionerPlus <= 1) gaps++;
  }
  return {
    skills: SKILL_CATALOG.length,
    people: SKILL_TEAM.length,
    totalCells,
    coverage: Math.round((100 * validCovered) / SKILL_CATALOG.length),
    pending,
    gaps,
  };
}

export interface PerSkillAggregate extends SkillCatalogEntry {
  people: { e: SkillTeamMember; lvl: SkillLevel; proposed: boolean }[];
  expertPlus: { e: SkillTeamMember; lvl: SkillLevel; proposed: boolean }[];
  practPlus: { e: SkillTeamMember; lvl: SkillLevel; proposed: boolean }[];
}

export function perSkillAggregates(): PerSkillAggregate[] {
  return SKILL_CATALOG.map((s) => {
    const people: PerSkillAggregate["people"] = [];
    for (const e of SKILL_TEAM) {
      const l = cellLevel(s.id, e.id);
      if (l) people.push({ e, lvl: l, proposed: isProposed(s.id, e.id) });
    }
    const expertPlus = people.filter((p) => LV_INDEX[p.lvl] >= 3);
    const practPlus = people.filter((p) => LV_INDEX[p.lvl] >= 2);
    return { ...s, people, expertPlus, practPlus };
  });
}

export interface PendingRow {
  s: SkillCatalogEntry;
  e: SkillTeamMember;
  lvl: SkillLevel;
  key: string;
}

export function pendingRows(): PendingRow[] {
  const rows: PendingRow[] = [];
  PROPOSED.forEach((key) => {
    const [sId, eId] = key.split(":");
    const s = skill(sId);
    const e = employee(eId);
    const lvl = cellLevel(sId, eId);
    if (!s || !e || !lvl) return;
    rows.push({ s, e, lvl, key });
  });
  rows.sort((a, b) => LV_INDEX[b.lvl] - LV_INDEX[a.lvl]);
  return rows;
}
