/**
 * Synthesize a realistically distributed roster of `count` employees for the
 * demo workspace. Used at workspace-creation time to populate the employees
 * table to whatever company size (10 / 25 / 100) the user picked.
 *
 * Determinism: a fixed seed keeps the same name/role/salary tuple stable
 * across reloads so the dashboard reads as the same fictional company.
 */
import type { Employee, EmployeeStatus } from "./mock-data";

const FIRST_NAMES = [
  "Sofia", "Giulia", "Aurora", "Alice", "Ginevra", "Emma", "Vittoria", "Beatrice",
  "Greta", "Anna", "Chiara", "Martina", "Sara", "Elena", "Lucia", "Federica",
  "Valentina", "Francesca", "Marta", "Elisa", "Camilla", "Cecilia", "Bianca",
  "Leonardo", "Francesco", "Lorenzo", "Alessandro", "Mattia", "Andrea", "Gabriele",
  "Tommaso", "Riccardo", "Edoardo", "Giovanni", "Davide", "Matteo", "Federico",
  "Marco", "Luca", "Giuseppe", "Antonio", "Paolo", "Stefano", "Daniele", "Simone",
  "Nicola", "Filippo", "Roberto", "Emanuele", "Cristian", "Pietro", "Enrico",
  "Aisha", "Yuki", "Noah", "Olivia", "Ethan", "Maya", "Liam", "Zara", "Omar",
  "Priya", "Tariq", "Lena", "Hugo", "Ines", "Mateo", "Anya", "Kai", "Nora",
];

const LAST_NAMES = [
  "Rossi", "Russo", "Ferrari", "Esposito", "Bianchi", "Romano", "Colombo", "Ricci",
  "Marino", "Greco", "Bruno", "Gallo", "Conti", "De Luca", "Mancini", "Costa",
  "Giordano", "Rizzo", "Lombardi", "Moretti", "Barbieri", "Fontana", "Santoro",
  "Mariani", "Rinaldi", "Caruso", "Ferrara", "Galli", "Martini", "Leone",
  "Longo", "Gentile", "Martinelli", "Vitale", "Lombardo", "Serra", "Coppola",
  "De Santis", "D'Angelo", "Marchetti", "Parisi", "Villa", "Conte", "Ferri",
  "Fabbri", "Bianco", "Marini", "Grassi", "Valentini", "Messina", "Sala",
  "Patel", "Chen", "Park", "Tanaka", "Williams", "Becker", "Brown", "Khan",
  "Silva", "Lopez", "Müller", "Dubois", "Novak", "Andersen", "O'Brien",
];

interface RoleSpec {
  title: string;
  baseSalary: number;
  weight: number;
}

interface DeptSpec {
  name: string;
  ratio: number;
  roles: RoleSpec[];
  managerRole: string;
}

const DEPT_SPECS: DeptSpec[] = [
  {
    name: "Engineering",
    ratio: 0.32,
    managerRole: "Engineering Manager",
    roles: [
      { title: "Senior Backend Engineer", baseSalary: 68000, weight: 3 },
      { title: "Backend Engineer", baseSalary: 52000, weight: 4 },
      { title: "Senior Frontend Engineer", baseSalary: 66000, weight: 2 },
      { title: "Frontend Engineer", baseSalary: 50000, weight: 4 },
      { title: "Mobile Engineer", baseSalary: 56000, weight: 2 },
      { title: "Staff Engineer", baseSalary: 88000, weight: 1 },
      { title: "QA Engineer", baseSalary: 46000, weight: 2 },
      { title: "Tech Lead", baseSalary: 78000, weight: 1 },
    ],
  },
  {
    name: "Platform",
    ratio: 0.05,
    managerRole: "Head of Platform",
    roles: [
      { title: "DevOps Engineer", baseSalary: 64000, weight: 3 },
      { title: "Site Reliability Engineer", baseSalary: 70000, weight: 2 },
      { title: "Security Engineer", baseSalary: 72000, weight: 1 },
    ],
  },
  {
    name: "Data",
    ratio: 0.05,
    managerRole: "Head of Data",
    roles: [
      { title: "Data Engineer", baseSalary: 60000, weight: 2 },
      { title: "Analytics Engineer", baseSalary: 56000, weight: 2 },
      { title: "Data Scientist", baseSalary: 64000, weight: 1 },
    ],
  },
  {
    name: "Design",
    ratio: 0.08,
    managerRole: "Design Lead",
    roles: [
      { title: "Senior Product Designer", baseSalary: 60000, weight: 2 },
      { title: "Product Designer", baseSalary: 48000, weight: 3 },
      { title: "UX Researcher", baseSalary: 50000, weight: 1 },
      { title: "Brand Designer", baseSalary: 46000, weight: 1 },
    ],
  },
  {
    name: "Product",
    ratio: 0.06,
    managerRole: "Head of Product",
    roles: [
      { title: "Product Manager", baseSalary: 64000, weight: 3 },
      { title: "Senior Product Manager", baseSalary: 80000, weight: 1 },
      { title: "Technical Program Manager", baseSalary: 70000, weight: 1 },
    ],
  },
  {
    name: "People Ops",
    ratio: 0.06,
    managerRole: "Head of People",
    roles: [
      { title: "HR Business Partner", baseSalary: 52000, weight: 2 },
      { title: "People Operations Specialist", baseSalary: 42000, weight: 2 },
      { title: "Recruiter", baseSalary: 46000, weight: 2 },
    ],
  },
  {
    name: "HR",
    ratio: 0.03,
    managerRole: "HR Manager",
    roles: [
      { title: "Payroll Specialist", baseSalary: 44000, weight: 1 },
      { title: "Benefits Specialist", baseSalary: 42000, weight: 1 },
    ],
  },
  {
    name: "Finance",
    ratio: 0.06,
    managerRole: "CFO",
    roles: [
      { title: "Finance Specialist", baseSalary: 50000, weight: 2 },
      { title: "Accountant", baseSalary: 44000, weight: 2 },
      { title: "FP&A Analyst", baseSalary: 56000, weight: 1 },
    ],
  },
  {
    name: "Sales",
    ratio: 0.12,
    managerRole: "Head of Sales",
    roles: [
      { title: "Account Executive", baseSalary: 54000, weight: 4 },
      { title: "SDR", baseSalary: 38000, weight: 3 },
      { title: "Account Manager", baseSalary: 56000, weight: 2 },
      { title: "Solutions Engineer", baseSalary: 64000, weight: 1 },
    ],
  },
  {
    name: "Marketing",
    ratio: 0.09,
    managerRole: "Head of Marketing",
    roles: [
      { title: "Marketing Manager", baseSalary: 56000, weight: 1 },
      { title: "Content Strategist", baseSalary: 46000, weight: 2 },
      { title: "Growth Marketer", baseSalary: 52000, weight: 2 },
      { title: "Designer (Marketing)", baseSalary: 44000, weight: 1 },
    ],
  },
  {
    name: "Operations",
    ratio: 0.08,
    managerRole: "Head of Operations",
    roles: [
      { title: "Operations Manager", baseSalary: 56000, weight: 1 },
      { title: "Office Manager", baseSalary: 38000, weight: 2 },
      { title: "Customer Operations Specialist", baseSalary: 42000, weight: 3 },
    ],
  },
];

const LOCATIONS = ["Milan", "Rome", "Turin", "Bologna", "Florence", "Remote"];
const STATUSES: Array<{ status: EmployeeStatus; weight: number }> = [
  { status: "active", weight: 78 },
  { status: "remote", weight: 14 },
  { status: "on_leave", weight: 5 },
  { status: "offboarding", weight: 3 },
];
const EMPLOYMENT: Array<{ kind: Employee["employmentType"]; weight: number }> = [
  { kind: "Full-time", weight: 80 },
  { kind: "Part-time", weight: 12 },
  { kind: "Contractor", weight: 8 },
];

function makeRand(seed: number) {
  let s = seed | 0 || 1;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickWeighted<T extends { weight: number }>(items: T[], rand: () => number): T {
  const total = items.reduce((acc, it) => acc + it.weight, 0);
  const target = rand() * total;
  let acc = 0;
  for (const it of items) {
    acc += it.weight;
    if (target <= acc) return it;
  }
  return items[items.length - 1];
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0] ?? "")
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function emailFor(name: string, domain: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z\s]/g, "")
    .trim()
    .split(/\s+/)
    .join(".");
  return `${slug}@${domain}`;
}

function isoDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

function birthdayFromRand(rand: () => number): string {
  const month = Math.floor(rand() * 12) + 1;
  const day = Math.floor(rand() * 28) + 1;
  return `${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function phoneFor(rand: () => number): string {
  const area = 300 + Math.floor(rand() * 700);
  const mid = 1000 + Math.floor(rand() * 9000);
  const tail = 1000 + Math.floor(rand() * 9000);
  return `+39 ${area} ${mid} ${tail}`;
}

function targetsFor(count: number): Array<{ dept: string; managerRole: string; n: number }> {
  // Continuous allocation by ratio with largest-remainder rounding so the
  // sum equals exactly `count`. Each dept gets at least 1 only when count
  // is large enough (>= 25); below that we keep it lean.
  const totalRatio = DEPT_SPECS.reduce((a, d) => a + d.ratio, 0);
  const raw = DEPT_SPECS.map((d) => ({
    spec: d,
    exact: (d.ratio / totalRatio) * count,
  }));
  const floors = raw.map((r) => ({ ...r, n: Math.floor(r.exact), frac: r.exact - Math.floor(r.exact) }));
  let used = floors.reduce((a, x) => a + x.n, 0);
  const sorted = [...floors].sort((a, b) => b.frac - a.frac);
  let i = 0;
  while (used < count && i < sorted.length) {
    sorted[i].n += 1;
    used += 1;
    i += 1;
  }
  return floors.map((f) => ({ dept: f.spec.name, managerRole: f.spec.managerRole, n: f.n }));
}

export interface GenerateOptions {
  /** Workspace name — used to derive email domain. */
  workspaceName: string;
  /** Optional employees to seed first (e.g. user-provided teammates). */
  manualEmployees?: Employee[];
  /** Total headcount target. */
  count: number;
  /** Optional deterministic seed; defaults to 41 so repeated reloads match. */
  seed?: number;
}

export function generateEmployees(opts: GenerateOptions): Employee[] {
  const { workspaceName, count, manualEmployees = [], seed = 41 } = opts;
  const rand = makeRand(seed);
  const domain = `${workspaceName.toLowerCase().replace(/[^a-z0-9]/g, "")}.co` || "acme.co";

  const remaining = Math.max(0, count - manualEmployees.length);
  const targets = targetsFor(remaining);
  const usedNames = new Set<string>(manualEmployees.map((e) => e.name));

  const out: Employee[] = manualEmployees.map((e, idx) => ({
    ...e,
    id: e.id || `e${idx + 1}`,
  }));
  let nextId = out.length + 1;

  for (const t of targets) {
    const spec = DEPT_SPECS.find((d) => d.name === t.dept);
    if (!spec || t.n === 0) continue;
    // First slot in a dept is the manager.
    for (let i = 0; i < t.n; i++) {
      let name = "";
      let attempts = 0;
      while (attempts < 12) {
        const candidate = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)}`;
        if (!usedNames.has(candidate)) {
          name = candidate;
          break;
        }
        attempts += 1;
      }
      if (!name) name = `${pick(FIRST_NAMES, rand)} ${pick(LAST_NAMES, rand)} ${nextId}`;
      usedNames.add(name);

      const isManager = i === 0;
      const role = isManager ? spec.managerRole : pickWeighted(spec.roles, rand).title;
      const baseSalary = isManager
        ? Math.max(...spec.roles.map((r) => r.baseSalary)) + 12000
        : (spec.roles.find((r) => r.title === role)?.baseSalary ?? 50000);
      const salary = Math.round((baseSalary + (rand() - 0.5) * 12000) / 500) * 500;
      const status = pickWeighted(STATUSES, rand).status;
      const employmentType = pickWeighted(EMPLOYMENT, rand).kind;
      const location = pick(LOCATIONS, rand);
      const joinDays = 30 + Math.floor(rand() * 365 * 6);
      const id = `e${nextId++}`;

      out.push({
        id,
        name,
        email: emailFor(name, domain),
        role,
        department: spec.name,
        location,
        status,
        avatarColor: "var(--avatar-surface)",
        initials: initialsOf(name),
        joinDate: isoDate(joinDays),
        birthday: birthdayFromRand(rand),
        salary,
        phone: phoneFor(rand),
        employmentType,
      });
    }
  }

  // Wire up `manager` field: pick the dept's manager (first row in that dept,
  // by role suffix Manager/Head/Lead/CFO) for everyone else in the dept.
  const managerByDept = new Map<string, string>();
  for (const e of out) {
    if (managerByDept.has(e.department)) continue;
    if (/Head|Manager|Lead|CFO|Director/.test(e.role)) managerByDept.set(e.department, e.name);
  }
  return out.map((e) =>
    e.manager || !managerByDept.has(e.department) || managerByDept.get(e.department) === e.name
      ? e
      : { ...e, manager: managerByDept.get(e.department) },
  );
}
