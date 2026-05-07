import type { Employee } from "@/lib/mock-data";
import type { ConstellationPerson, DeptId, PresenceState } from "./types";

const DEPT_FROM_NAME: Record<string, DeptId> = {
  Engineering: "ENG",
  Platform: "ENG",
  Data: "ENG",
  Design: "DESIGN",
  Product: "DESIGN",
  "People Ops": "PEOPLE",
  HR: "PEOPLE",
  Talent: "PEOPLE",
  Finance: "OPS",
  Sales: "OPS",
  Marketing: "OPS",
  Operations: "OPS",
};

export const DEPT_KEYS: DeptId[] = ["ENG", "DESIGN", "OPS", "PEOPLE"];

export function deptIdFor(department: string): DeptId {
  return DEPT_FROM_NAME[department] ?? "OPS";
}

export function countByDept(people: ConstellationPerson[]): Record<DeptId, number> {
  const out: Record<DeptId, number> = { ENG: 0, DESIGN: 0, OPS: 0, PEOPLE: 0 };
  for (const p of people) out[p.dept] += 1;
  return out;
}

const DEPT_CENTERS: Record<DeptId, [number, number]> = {
  ENG: [0, -1],
  DESIGN: [-5, 3],
  OPS: [5, 3],
  PEOPLE: [0, 6],
};

const SENT_BASE: Record<DeptId, number> = { ENG: 3.6, DESIGN: 4.1, OPS: 3.2, PEOPLE: 4.4 };
const SAT_BASE: Record<DeptId, number> = { ENG: 0.78, DESIGN: 0.66, OPS: 0.74, PEOPLE: 0.62 };
const PRES_BASE: Record<DeptId, number> = { ENG: 0.78, DESIGN: 0.72, OPS: 0.86, PEOPLE: 0.82 };

function seeded(seed: number) {
  let s = seed | 0;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function deptFor(emp: Employee): DeptId {
  return DEPT_FROM_NAME[emp.department] ?? "OPS";
}

function presenceFor(status: Employee["status"], rand: () => number): PresenceState {
  if (status === "on_leave") return "LEAVE";
  if (status === "offboarding") return "OUT";
  if (status === "remote") return "REMOTE";
  const r = rand();
  if (r < 0.65) return "OFFICE";
  if (r < 0.92) return "REMOTE";
  if (r < 0.96) return "SICK";
  return "OUT";
}

interface Project {
  ownerId: string;
  code: string;
  budgetHours: number;
  burnedHours: number;
}

/**
 * Synthetic personas used only when the workspace roster is too small to
 * read as a company. Real employees from the table take precedence; this
 * pool only fills the remaining slots up to a comfortable minimum.
 */
const SYNTHETIC_NAMES: Array<{ name: string; role: string; dept: DeptId }> = [
  { name: "Davide Greco", role: "Tech Lead", dept: "ENG" },
  { name: "Marta Esposito", role: "Finance Manager", dept: "OPS" },
  { name: "Luca Rinaldi", role: "Designer", dept: "DESIGN" },
  { name: "Alice Conti", role: "PM", dept: "ENG" },
  { name: "Sara Ferrari", role: "Backend", dept: "ENG" },
  { name: "Giulia Parisi", role: "QA Lead", dept: "ENG" },
  { name: "Marco Neri", role: "DevOps", dept: "OPS" },
  { name: "Federica Bianchi", role: "HR", dept: "PEOPLE" },
  { name: "Riccardo Costa", role: "Mobile", dept: "ENG" },
  { name: "Elena Santoro", role: "Frontend", dept: "ENG" },
  { name: "Valeria Marini", role: "Data", dept: "ENG" },
  { name: "Tommaso Fabbri", role: "Backend", dept: "ENG" },
  { name: "Chiara Russo", role: "PM", dept: "PEOPLE" },
  { name: "Andrea Longo", role: "Designer", dept: "DESIGN" },
  { name: "Nadia Volta", role: "Designer", dept: "DESIGN" },
  { name: "Paolo Rota", role: "Accountant", dept: "OPS" },
  { name: "Federica Bruno", role: "Recruiter", dept: "PEOPLE" },
  { name: "Lucia Ferri", role: "HR Lead", dept: "PEOPLE" },
];

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const DEPT_RATIOS: Record<DeptId, number> = {
  ENG: 58 / 142,
  DESIGN: 22 / 142,
  OPS: 38 / 142,
  PEOPLE: 24 / 142,
};

/**
 * Spread `total` headcount across the four constellation buckets using the
 * editorial-grade ratios. Largest-remainder rounding so the parts add up to
 * `total` exactly. Useful when you want department targets that scale with
 * the workspace's chosen company size.
 */
export function deptTargetsFor(total: number): Record<DeptId, number> {
  if (total <= 0) return { ENG: 0, DESIGN: 0, OPS: 0, PEOPLE: 0 };
  const exact = DEPT_KEYS.map((k) => ({ k, v: DEPT_RATIOS[k] * total }));
  const floors = exact.map((x) => ({ k: x.k, n: Math.floor(x.v), frac: x.v - Math.floor(x.v) }));
  let used = floors.reduce((a, x) => a + x.n, 0);
  const sorted = [...floors].sort((a, b) => b.frac - a.frac);
  let i = 0;
  while (used < total && i < sorted.length) {
    sorted[i].n += 1;
    used += 1;
    i += 1;
  }
  const out: Record<DeptId, number> = { ENG: 0, DESIGN: 0, OPS: 0, PEOPLE: 0 };
  for (const f of floors) out[f.k] = f.n;
  return out;
}

interface RawSeed {
  id: string;
  name: string;
  role: string;
  initials: string;
  dept: DeptId;
  status: Employee["status"];
  syn: boolean;
}

export function buildConstellationPeople(
  employees: Employee[],
  projects: Project[],
  totalTarget?: number,
): ConstellationPerson[] {
  const rand = seeded(73);

  // Targets: when an explicit total is provided, distribute it. Otherwise
  // honour the real roster, only padding up to a comfortable minimum so a
  // 5-person company doesn't render as a lonely cluster.
  const target = totalTarget != null ? totalTarget : Math.max(employees.length, 0);
  const deptTargets = deptTargetsFor(target);

  // Assemble pool grouped by dept, padding up to dept target with synthetic personas.
  const byDept: Record<DeptId, RawSeed[]> = { ENG: [], DESIGN: [], OPS: [], PEOPLE: [] };
  for (const emp of employees) {
    const d = deptFor(emp);
    byDept[d].push({
      id: emp.id,
      name: emp.name,
      role: emp.role,
      initials: emp.initials,
      dept: d,
      status: emp.status,
      syn: false,
    });
  }
  let synIdx = 0;
  for (const dept of DEPT_KEYS) {
    const t = deptTargets[dept];
    while (byDept[dept].length < t) {
      // Find a synthetic that matches the dept; cycle list.
      let candidate = SYNTHETIC_NAMES[synIdx % SYNTHETIC_NAMES.length];
      let guard = 0;
      while (candidate.dept !== dept && guard < SYNTHETIC_NAMES.length) {
        synIdx++;
        candidate = SYNTHETIC_NAMES[synIdx % SYNTHETIC_NAMES.length];
        guard++;
      }
      synIdx++;
      const variant = byDept[dept].length;
      byDept[dept].push({
        id: `syn-${dept}-${variant}`,
        name: candidate.name,
        role: candidate.role,
        initials: initialsOf(candidate.name),
        dept,
        status: "active",
        syn: true,
      });
    }
  }

  // Project saturation by ownerId
  const ownerSat = new Map<string, number>();
  for (const p of projects) {
    if (p.budgetHours <= 0) continue;
    const sat = p.burnedHours / p.budgetHours;
    const prev = ownerSat.get(p.ownerId);
    ownerSat.set(p.ownerId, prev != null ? Math.max(prev, sat) : sat);
  }
  const ownerProject = new Map<string, string>();
  for (const p of projects) {
    if (!ownerProject.has(p.ownerId)) ownerProject.set(p.ownerId, p.code);
  }

  const people: ConstellationPerson[] = [];

  for (const dept of Object.keys(byDept) as DeptId[]) {
    const seeds = byDept[dept];
    const center = DEPT_CENTERS[dept];
    const placed = new Set<string>();
    const queue: Array<[number, number]> = [[center[0], center[1]]];

    let i = 0;
    while (i < seeds.length && queue.length) {
      const idx = Math.floor(rand() * Math.min(6, queue.length));
      const [q, r] = queue.splice(idx, 1)[0];
      const key = `${q},${r}`;
      if (placed.has(key)) continue;
      placed.add(key);

      const seed = seeds[i++];
      const realSat = ownerSat.get(seed.id);
      const baseSat = SAT_BASE[dept];
      const sat = realSat != null
        ? Math.max(0.1, Math.min(1.25, realSat))
        : Math.max(0.1, Math.min(1.25, baseSat + (rand() - 0.5) * 0.55));

      const sentiment = Math.max(1.2, Math.min(5.0, SENT_BASE[dept] + (rand() - 0.5) * 1.6));

      let presence: PresenceState;
      if (!seed.syn) {
        presence = presenceFor(seed.status, rand);
      } else {
        const roll = rand();
        const base = PRES_BASE[dept];
        if (roll < base * 0.65) presence = "OFFICE";
        else if (roll < base) presence = "REMOTE";
        else if (roll < base + 0.08) presence = "LEAVE";
        else if (roll < base + 0.14) presence = "SICK";
        else presence = "OUT";
      }

      const arrivalH = 8 + Math.floor(rand() * 3);
      const arrivalM = Math.floor(rand() * 60);
      const arrival =
        presence === "OFFICE" || presence === "REMOTE"
          ? `${String(arrivalH).padStart(2, "0")}:${String(arrivalM).padStart(2, "0")}`
          : "—";

      const project = ownerProject.get(seed.id) ?? (dept === "PEOPLE" ? "People" : dept === "OPS" ? "Internal" : "—");

      people.push({
        id: seed.id,
        q,
        r,
        dept,
        sat,
        sentiment,
        presence,
        arrival,
        lastOneOnOne: Math.floor(rand() * 60),
        kudosThisMonth: Math.floor(rand() * 8),
        surveyResponded: rand() > 0.18,
        name: seed.name,
        role: seed.role,
        project,
        initials: seed.initials || initialsOf(seed.name),
      });

      const dirs: Array<[number, number]> = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
        [1, -1],
        [-1, 1],
      ];
      for (const [dq, dr] of dirs) {
        const nk = `${q + dq},${r + dr}`;
        if (!placed.has(nk)) queue.push([q + dq, r + dr]);
      }
    }
  }

  return people;
}

/** Legacy default, kept for callers that still want the editorial 142 mix. */
export const DEPT_TOTALS = deptTargetsFor(142);
