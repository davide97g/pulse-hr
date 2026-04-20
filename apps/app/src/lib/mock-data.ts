export type EmployeeStatus = "active" | "on_leave" | "remote" | "offboarding";
export type Role = "Admin" | "HR Manager" | "Manager" | "Employee";

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  manager?: string;
  location: string;
  status: EmployeeStatus;
  avatarColor: string;
  initials: string;
  joinDate: string;
  birthday?: string; // "MM-DD"
  salary: number;
  phone: string;
  employmentType: "Full-time" | "Part-time" | "Contractor";
}

// Avatars render on a single neutral surface with themed ink; identity comes
// from initials, not hue. Keeps the UI calm even with 50+ avatars visible.
const AVATAR_SURFACE = "var(--avatar-surface)";

const initials = (n: string) =>
  n
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

const raw: Omit<Employee, "avatarColor" | "initials">[] = [
  {
    id: "e1",
    name: "Sarah Chen",
    email: "sarah.chen@acme.co",
    role: "Head of Engineering",
    department: "Engineering",
    location: "San Francisco",
    status: "active",
    joinDate: "2021-03-14",
    salary: 185000,
    phone: "+1 415 555 0142",
    employmentType: "Full-time",
  },
  {
    id: "e2",
    name: "Marcus Rivera",
    email: "marcus.r@acme.co",
    role: "Senior Designer",
    department: "Design",
    manager: "Sarah Chen",
    location: "Remote — Mexico City",
    status: "remote",
    joinDate: "2022-06-01",
    salary: 112000,
    phone: "+52 55 5555 0188",
    employmentType: "Full-time",
  },
  {
    id: "e3",
    name: "Aisha Patel",
    email: "aisha.p@acme.co",
    role: "HR Business Partner",
    department: "People Ops",
    location: "London",
    status: "active",
    joinDate: "2020-11-09",
    salary: 98000,
    phone: "+44 20 7946 0123",
    employmentType: "Full-time",
  },
  {
    id: "e4",
    name: "Tom Becker",
    email: "tom.b@acme.co",
    role: "Backend Engineer",
    department: "Engineering",
    manager: "Sarah Chen",
    location: "Berlin",
    status: "on_leave",
    joinDate: "2023-01-23",
    salary: 89000,
    phone: "+49 30 5555 0167",
    employmentType: "Full-time",
  },
  {
    id: "e5",
    name: "Lina Rossi",
    email: "lina.r@acme.co",
    role: "Payroll Specialist",
    department: "Finance",
    location: "Milan",
    status: "active",
    joinDate: "2019-07-15",
    salary: 76000,
    phone: "+39 02 5555 0199",
    employmentType: "Full-time",
  },
  {
    id: "e6",
    name: "David Park",
    email: "david.p@acme.co",
    role: "Account Executive",
    department: "Sales",
    location: "New York",
    status: "active",
    joinDate: "2022-09-30",
    salary: 95000,
    phone: "+1 212 555 0145",
    employmentType: "Full-time",
  },
  {
    id: "e7",
    name: "Yuki Tanaka",
    email: "yuki.t@acme.co",
    role: "Product Manager",
    department: "Product",
    location: "Tokyo",
    status: "active",
    joinDate: "2021-12-02",
    salary: 132000,
    phone: "+81 3 5555 0177",
    employmentType: "Full-time",
  },
  {
    id: "e8",
    name: "Olivia Brown",
    email: "olivia.b@acme.co",
    role: "Recruiter",
    department: "People Ops",
    manager: "Aisha Patel",
    location: "Dublin",
    status: "active",
    joinDate: "2023-04-18",
    salary: 68000,
    phone: "+353 1 555 0136",
    employmentType: "Full-time",
  },
  {
    id: "e9",
    name: "Noah Williams",
    email: "noah.w@acme.co",
    role: "Frontend Engineer",
    department: "Engineering",
    manager: "Sarah Chen",
    location: "Toronto",
    status: "remote",
    joinDate: "2024-02-12",
    salary: 84000,
    phone: "+1 416 555 0102",
    employmentType: "Contractor",
  },
  {
    id: "e10",
    name: "Fatima Al-Sayed",
    email: "fatima.a@acme.co",
    role: "Data Analyst",
    department: "Product",
    manager: "Yuki Tanaka",
    location: "Dubai",
    status: "active",
    joinDate: "2023-08-05",
    salary: 78000,
    phone: "+971 4 555 0124",
    employmentType: "Full-time",
  },
  {
    id: "e11",
    name: "Greg Holland",
    email: "greg.h@acme.co",
    role: "DevOps Engineer",
    department: "Engineering",
    manager: "Sarah Chen",
    location: "Amsterdam",
    status: "offboarding",
    joinDate: "2020-05-20",
    salary: 102000,
    phone: "+31 20 555 0179",
    employmentType: "Full-time",
  },
  {
    id: "e12",
    name: "Priya Shah",
    email: "priya.s@acme.co",
    role: "Marketing Lead",
    department: "Marketing",
    location: "Mumbai",
    status: "active",
    joinDate: "2022-01-10",
    salary: 88000,
    phone: "+91 22 5555 0143",
    employmentType: "Full-time",
  },
];

// Deterministic birthdays — cluster a few around "today" (2026-04-18) so
// the Moments ticker has live content, scatter the rest across the year.
const birthdayOverrides: Record<string, string> = {
  e1: "07-22",
  e2: "04-20", // this week
  e3: "11-03",
  e4: "04-25", // this week
  e5: "02-14",
  e6: "04-19", // tomorrow
  e7: "09-07",
  e8: "05-02", // next week
  e9: "04-18", // today
  e10: "12-01",
  e11: "06-10",
  e12: "03-28",
};

/**
 * `employees` is a `let` so the persistent table (lib/tables/employees.ts)
 * can keep this binding in sync with workspace state via `__setEmployees`.
 * ES module live bindings mean every `import { employees } from "@/lib/mock-data"`
 * site sees the latest array on every read — pair with EmployeesStoreProvider
 * mounted at the root to make React subtrees re-render on changes.
 *
 * `employeesSeed` is the pristine initial array, used as the table's seed
 * source and as a fallback for module-init-time derived data below.
 */
export let employees: Employee[] = raw.map((e) => ({
  ...e,
  initials: initials(e.name),
  avatarColor: AVATAR_SURFACE,
  birthday: birthdayOverrides[e.id],
}));

export const employeesSeed: Employee[] = employees;

/** Internal: called by the persistent table to push live state into this binding. */
export function __setEmployees(next: Employee[]) {
  employees = next;
}

export const employeeById = (id: string) => employees.find((e) => e.id === id);

export const departments = [
  { name: "Engineering", count: 5, lead: "Sarah Chen", budget: 2400000 },
  { name: "Design", count: 1, lead: "Marcus Rivera", budget: 380000 },
  { name: "People Ops", count: 2, lead: "Aisha Patel", budget: 290000 },
  { name: "Finance", count: 1, lead: "Lina Rossi", budget: 210000 },
  { name: "Sales", count: 1, lead: "David Park", budget: 540000 },
  { name: "Product", count: 2, lead: "Yuki Tanaka", budget: 480000 },
  { name: "Marketing", count: 1, lead: "Priya Shah", budget: 320000 },
];

export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveGranularity = "full" | "half";
export type HalfPeriod = "AM" | "PM";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Vacation" | "Sick" | "Personal" | "Parental";
  from: string;
  to: string;
  /** Equivalent working days (half-day rows store 0.5). */
  days: number;
  status: LeaveStatus;
  reason: string;
  submittedAt: string;
  granularity?: LeaveGranularity;
  halfPeriod?: HalfPeriod;
}

export let leaveRequests: LeaveRequest[] = [
  {
    id: "l1",
    employeeId: "e2",
    type: "Vacation",
    from: "2026-04-22",
    to: "2026-04-28",
    days: 5,
    status: "pending",
    reason: "Family trip",
    submittedAt: "2026-04-15",
  },
  {
    id: "l2",
    employeeId: "e4",
    type: "Sick",
    from: "2026-04-17",
    to: "2026-04-19",
    days: 3,
    status: "approved",
    reason: "Flu",
    submittedAt: "2026-04-16",
  },
  {
    id: "l3",
    employeeId: "e9",
    type: "Personal",
    from: "2026-05-02",
    to: "2026-05-02",
    days: 1,
    status: "pending",
    reason: "Appointment",
    submittedAt: "2026-04-14",
  },
  {
    id: "l4",
    employeeId: "e6",
    type: "Vacation",
    from: "2026-05-10",
    to: "2026-05-17",
    days: 6,
    status: "pending",
    reason: "Honeymoon",
    submittedAt: "2026-04-12",
  },
  {
    id: "l5",
    employeeId: "e10",
    type: "Parental",
    from: "2026-06-01",
    to: "2026-08-30",
    days: 64,
    status: "approved",
    reason: "Parental leave",
    submittedAt: "2026-03-20",
  },
  {
    id: "l6",
    employeeId: "e8",
    type: "Vacation",
    from: "2026-04-25",
    to: "2026-04-26",
    days: 2,
    status: "rejected",
    reason: "Conflict with hiring sprint",
    submittedAt: "2026-04-10",
  },
  // Current-month leave for the signed-in user (e1) so calendar shows live states
  {
    id: "l7",
    employeeId: "e1",
    type: "Sick",
    from: "2026-04-09",
    to: "2026-04-10",
    days: 2,
    status: "approved",
    reason: "Flu",
    submittedAt: "2026-04-09",
  },
  {
    id: "l8",
    employeeId: "e1",
    type: "Vacation",
    from: "2026-04-20",
    to: "2026-04-24",
    days: 5,
    status: "approved",
    reason: "Spring break",
    submittedAt: "2026-03-25",
  },
  {
    id: "l9",
    employeeId: "e1",
    type: "Personal",
    from: "2026-04-30",
    to: "2026-04-30",
    days: 0.5,
    status: "approved",
    reason: "Family appointment",
    submittedAt: "2026-04-16",
    granularity: "half",
    halfPeriod: "AM",
  },
  {
    id: "l10",
    employeeId: "e1",
    type: "Vacation",
    from: "2026-04-27",
    to: "2026-04-27",
    days: 0.5,
    status: "approved",
    reason: "Long weekend kickoff",
    submittedAt: "2026-04-17",
    granularity: "half",
    halfPeriod: "PM",
  },
];

export const leaveRequestsSeed: LeaveRequest[] = leaveRequests;
export function __setLeaveRequests(next: LeaveRequest[]) {
  leaveRequests = next;
}

export interface Expense {
  id: string;
  employeeId: string;
  description: string;
  category: "Travel" | "Meals" | "Software" | "Equipment";
  amount: number;
  currency: "USD" | "EUR" | "GBP";
  date: string;
  status: "pending" | "approved" | "reimbursed" | "rejected";
}

export let expenses: Expense[] = [
  {
    id: "x1",
    employeeId: "e6",
    description: "Client dinner — Acme Corp",
    category: "Meals",
    amount: 184.5,
    currency: "USD",
    date: "2026-04-12",
    status: "pending",
  },
  {
    id: "x2",
    employeeId: "e2",
    description: "Figma annual license",
    category: "Software",
    amount: 180,
    currency: "USD",
    date: "2026-04-08",
    status: "approved",
  },
  {
    id: "x3",
    employeeId: "e7",
    description: "Flight TYO → SFO",
    category: "Travel",
    amount: 1240,
    currency: "USD",
    date: "2026-04-02",
    status: "reimbursed",
  },
  {
    id: "x4",
    employeeId: "e9",
    description: "Standing desk",
    category: "Equipment",
    amount: 620,
    currency: "USD",
    date: "2026-04-14",
    status: "pending",
  },
  {
    id: "x5",
    employeeId: "e3",
    description: "Team offsite — London",
    category: "Travel",
    amount: 890,
    currency: "GBP",
    date: "2026-04-05",
    status: "approved",
  },
];

export const expensesSeed: Expense[] = expenses;
export function __setExpenses(next: Expense[]) {
  expenses = next;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: "Applied" | "Screen" | "Interview" | "Offer" | "Hired";
  initials: string;
  avatarColor: string;
  appliedDate: string;
  rating: number;
}
const cnames = [
  ["Emma Wilson", "Senior Engineer"],
  ["James Liu", "Senior Engineer"],
  ["Sofia Garcia", "Product Designer"],
  ["Raj Mehta", "Senior Engineer"],
  ["Hannah Kim", "Product Designer"],
  ["Leo Martin", "Account Executive"],
  ["Zoe Adams", "Product Manager"],
  ["Kai Yamamoto", "Account Executive"],
];
const stages: Candidate["stage"][] = ["Applied", "Screen", "Interview", "Offer", "Hired"];
export const candidates: Candidate[] = cnames.map(([n, r], i) => ({
  id: `c${i + 1}`,
  name: n,
  role: r,
  stage: stages[i % 5],
  initials: initials(n),
  avatarColor: AVATAR_SURFACE,
  appliedDate: `2026-04-${String(14 - i).padStart(2, "0")}`,
  rating: 3 + ((i * 7) % 3),
}));

export interface PayrollRun {
  id: string;
  period: string;
  status: "draft" | "processing" | "completed" | "scheduled";
  employees: number;
  gross: number;
  net: number;
  date: string;
}
export const payrollRuns: PayrollRun[] = [
  {
    id: "p1",
    period: "April 2026",
    status: "scheduled",
    employees: 12,
    gross: 124500,
    net: 89200,
    date: "2026-04-30",
  },
  {
    id: "p2",
    period: "March 2026",
    status: "completed",
    employees: 12,
    gross: 122100,
    net: 87800,
    date: "2026-03-31",
  },
  {
    id: "p3",
    period: "February 2026",
    status: "completed",
    employees: 11,
    gross: 115400,
    net: 83100,
    date: "2026-02-28",
  },
  {
    id: "p4",
    period: "January 2026",
    status: "completed",
    employees: 11,
    gross: 114800,
    net: 82700,
    date: "2026-01-31",
  },
];

export type Vibe = "amazing" | "good" | "meh" | "rough" | "awful";
export interface PulseEntry {
  id: string;
  date: string; // YYYY-MM-DD
  vibe: Vibe;
  note?: string; // anonymous
  tag?: "workload" | "team" | "tools" | "growth" | "other";
}
const VIBE_ROT: Vibe[] = [
  "amazing",
  "good",
  "good",
  "meh",
  "rough",
  "good",
  "good",
  "amazing",
  "good",
  "meh",
];
export const pulseEntries: PulseEntry[] = Array.from({ length: 42 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (42 - i));
  return {
    id: `pl-${i}`,
    date: d.toISOString().slice(0, 10),
    vibe: VIBE_ROT[(i * 7) % VIBE_ROT.length],
    note:
      i % 5 === 0
        ? [
            "Great sprint review today",
            "Too many meetings this week",
            "Learned something new",
            "Feeling stuck on migration",
            "Shipped the thing!",
          ][i % 5]
        : undefined,
    tag: (["workload", "team", "tools", "growth", "other"] as const)[i % 5],
  };
});

export type LogTopic = "status" | "win" | "pain" | "challenge" | "feedback" | "freeform";
export type LogSentiment = "positive" | "neutral" | "mixed" | "negative";

export interface LogMessage {
  id: string;
  employeeId: string;
  role: "agent" | "employee";
  text: string;
  createdAt: string; // ISO
  topic?: LogTopic;
  sentiment?: LogSentiment;
  voice?: boolean;
  actionId?: string;
}

export interface LogSession {
  id: string;
  employeeId: string;
  startedAt: string; // ISO date
  endedAt?: string; // undefined = active
  summary?: string; // visible to the employee
  managerSummary?: string; // redacted; only summary crosses the boundary
  topics: LogTopic[];
  healthDelta: number; // -10..+10
}

export interface ManagerAsk {
  id: string;
  managerId: string;
  employeeId: string;
  topic: string; // "Feedback on ACME demo"
  prompt: string; // what the agent will ask
  createdAt: string;
  dueAt?: string;
  answeredAt?: string;
  answerSummary?: string; // only summary crosses the boundary
  status: "pending" | "answered" | "expired";
  tone?: "neutral" | "empathetic" | "probing";
}

export interface EmployeeLogHealth {
  employeeId: string;
  score: number; // 0..100
  trend: "up" | "flat" | "down";
  lastLogAt?: string;
  lastSentiment?: LogSentiment;
  openAsks: number;
  recap: string; // 1-2 sentence AI mock, manager-safe
  recapUpdatedAt: string;
  sparkline: number[]; // 14 daily sentiment ticks, -1..+1
}

function lcg(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const TOPICS_ORDER: LogTopic[] = ["status", "win", "pain", "challenge", "feedback", "freeform"];
const SENTIMENTS: LogSentiment[] = ["positive", "neutral", "mixed", "negative"];

function iso(daysAgo: number, hour = 9) {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString();
}

const SAMPLE_EMP_LINES = [
  "Shipped the pricing page ahead of the sprint goal.",
  "Blocked on the legal review for the ACME contract.",
  "Spent the morning debugging a flaky export in payroll.",
  "Pairing session with Luca helped me unstick the onboarding flow.",
  "Feeling stretched thin — three clients active at once.",
  "Client demo went well, they want to scope phase 2.",
  "Stuck on a bug in the time-tracking module; escalating to ops.",
];
const SAMPLE_AGENT_LINES = [
  "Nice — want me to log that as a win?",
  "Noted. What would unblock this the fastest?",
  "Got it. Anything you'd want your manager to know, summary-only?",
  "Mid-sprint check: any risks I should flag into next Monday's plan?",
  "Thanks for sharing. I'll tag this as a pain point in your recap.",
];

export const logSessions: LogSession[] = (() => {
  const rand = lcg(42);
  const out: LogSession[] = [];
  for (const e of employees) {
    for (let day = 28; day >= 0; day -= Math.max(1, Math.floor(rand() * 3))) {
      const topics = [TOPICS_ORDER[Math.floor(rand() * 4)]];
      if (rand() > 0.6) topics.push(TOPICS_ORDER[Math.floor(rand() * 6)]);
      out.push({
        id: `ls-${e.id}-${day}`,
        employeeId: e.id,
        startedAt: iso(day, 9),
        endedAt: day === 0 ? undefined : iso(day, 17),
        summary:
          day === 0
            ? undefined
            : `Covered ${topics.join(", ")} with ${Math.floor(rand() * 4) + 2} exchanges.`,
        managerSummary:
          day === 0
            ? undefined
            : `Recent focus: ${topics[0]}. Sentiment ${SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)]}.`,
        topics,
        healthDelta: Math.round((rand() * 20 - 10) * 10) / 10,
      });
    }
  }
  return out;
})();

export const logMessages: LogMessage[] = (() => {
  const rand = lcg(101);
  const out: LogMessage[] = [];
  for (const s of logSessions) {
    const turns = 3 + Math.floor(rand() * 4);
    for (let t = 0; t < turns; t++) {
      const isAgent = t % 2 === 0;
      const createdAt = new Date(new Date(s.startedAt).getTime() + t * 8 * 60_000).toISOString();
      out.push({
        id: `lm-${s.id}-${t}`,
        employeeId: s.employeeId,
        role: isAgent ? "agent" : "employee",
        text: isAgent
          ? SAMPLE_AGENT_LINES[Math.floor(rand() * SAMPLE_AGENT_LINES.length)]
          : SAMPLE_EMP_LINES[Math.floor(rand() * SAMPLE_EMP_LINES.length)],
        createdAt,
        topic: s.topics[Math.floor(rand() * s.topics.length)],
        sentiment: SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)],
        voice: rand() > 0.85,
      });
    }
  }
  return out;
})();

export const managerAsks: ManagerAsk[] = [
  {
    id: "ma-1",
    managerId: employees[0].id,
    employeeId: employees[3].id,
    topic: "Feedback on the ACME demo",
    prompt:
      "How did the ACME demo feel from your side? Anything we should change before the follow-up?",
    createdAt: iso(1),
    dueAt: iso(-3),
    status: "pending",
    tone: "neutral",
  },
  {
    id: "ma-2",
    managerId: employees[0].id,
    employeeId: employees[5].id,
    topic: "Mid-sprint blockers",
    prompt: "Anything blocking you mid-sprint that I can help unstick?",
    createdAt: iso(2),
    status: "pending",
    tone: "empathetic",
  },
  {
    id: "ma-3",
    managerId: employees[0].id,
    employeeId: employees[2].id,
    topic: "Internal project — payroll v2",
    prompt: "Quick read on the payroll v2 kickoff — risks you see, wins so far?",
    createdAt: iso(4),
    answeredAt: iso(2),
    answerSummary: "Confident on scope; worried about QA capacity. Wants a week buffer.",
    status: "answered",
    tone: "probing",
  },
  {
    id: "ma-4",
    managerId: employees[0].id,
    employeeId: employees[7].id,
    topic: "Energy check",
    prompt: "Just a pulse — how's your week feeling energy-wise?",
    createdAt: iso(5),
    dueAt: iso(-1),
    status: "expired",
    tone: "empathetic",
  },
];

export const employeeLogHealth: EmployeeLogHealth[] = employees.map((e, i) => {
  const rand = lcg(200 + i);
  const score = Math.round(55 + rand() * 45);
  const trend: EmployeeLogHealth["trend"] = score > 78 ? "up" : score < 60 ? "down" : "flat";
  const days = Math.floor(rand() * 8);
  return {
    employeeId: e.id,
    score,
    trend,
    lastLogAt: iso(days),
    lastSentiment: SENTIMENTS[Math.floor(rand() * SENTIMENTS.length)],
    openAsks: managerAsks.filter((a) => a.employeeId === e.id && a.status === "pending").length,
    recap:
      score > 78
        ? `${e.name.split(" ")[0]} is shipping consistently and flagging risks early.`
        : score < 60
          ? `${e.name.split(" ")[0]} is signalling overload — two pain points in the last week.`
          : `${e.name.split(" ")[0]} is steady; mix of wins and minor blockers.`,
    recapUpdatedAt: iso(0, 7),
    sparkline: Array.from({ length: 14 }, () => Math.round((rand() * 2 - 1) * 100) / 100),
  };
});

export interface Kudo {
  id: string;
  fromId: string;
  toId: string;
  amount: number; // coins
  message: string;
  tag: "teamwork" | "craft" | "impact" | "courage" | "kindness";
  date: string;
}
export const kudosSeed: Kudo[] = [
  // ── recent (this week · 2026-04-12..18) ─────────────────────────────
  {
    id: "kd1",
    fromId: "e3",
    toId: "e2",
    amount: 25,
    tag: "craft",
    date: "2026-04-17",
    message: "The new onboarding flow is chef's kiss. Polished every single state.",
  },
  {
    id: "kd2",
    fromId: "e1",
    toId: "e9",
    amount: 50,
    tag: "impact",
    date: "2026-04-17",
    message: "Shipped the migration 2 days ahead of schedule. Huge.",
  },
  {
    id: "kd3",
    fromId: "e7",
    toId: "e4",
    amount: 10,
    tag: "kindness",
    date: "2026-04-16",
    message: "Jumped in on my on-call even though it wasn't your rotation.",
  },
  {
    id: "kd4",
    fromId: "e6",
    toId: "e10",
    amount: 30,
    tag: "teamwork",
    date: "2026-04-16",
    message: "Your Looker dashboards unlocked the whole pipeline conversation.",
  },
  {
    id: "kd5",
    fromId: "e2",
    toId: "e3",
    amount: 15,
    tag: "kindness",
    date: "2026-04-15",
    message: "Took time to walk me through the leave policy. Appreciated.",
  },
  {
    id: "kd6",
    fromId: "e1",
    toId: "e7",
    amount: 20,
    tag: "courage",
    date: "2026-04-15",
    message: "Saying 'no, we shouldn't ship that yet' took guts. Right call.",
  },
  {
    id: "kd7",
    fromId: "e9",
    toId: "e2",
    amount: 10,
    tag: "craft",
    date: "2026-04-14",
    message: "The microcopy rewrite made the whole flow feel 10× better.",
  },
  {
    id: "kd8",
    fromId: "e10",
    toId: "e1",
    amount: 40,
    tag: "impact",
    date: "2026-04-14",
    message: "Your pairing session unblocked me for the rest of the sprint.",
  },
  {
    id: "kd9",
    fromId: "e3",
    toId: "e1",
    amount: 30,
    tag: "teamwork",
    date: "2026-04-13",
    message: "Facilitated the cross-team roadmap session like a pro.",
  },
  {
    id: "kd10",
    fromId: "e4",
    toId: "e9",
    amount: 25,
    tag: "craft",
    date: "2026-04-13",
    message: "Code review on the auth refactor was surgical.",
  },
  {
    id: "kd11",
    fromId: "e7",
    toId: "e2",
    amount: 20,
    tag: "impact",
    date: "2026-04-12",
    message: "Mobile-first redesign lifted activation by 14% in the beta.",
  },
  {
    id: "kd12",
    fromId: "e5",
    toId: "e3",
    amount: 15,
    tag: "kindness",
    date: "2026-04-12",
    message: "Thanks for catching the payroll discrepancy before it shipped.",
  },

  // ── this month (March 18 – April 11) ────────────────────────────────
  {
    id: "kd13",
    fromId: "e3",
    toId: "e1",
    amount: 35,
    tag: "craft",
    date: "2026-04-10",
    message: "The migration architecture doc is the clearest thing I've read all quarter.",
  },
  {
    id: "kd14",
    fromId: "e1",
    toId: "e4",
    amount: 20,
    tag: "teamwork",
    date: "2026-04-09",
    message: "Volunteered for the on-call swap without being asked.",
  },
  {
    id: "kd15",
    fromId: "e9",
    toId: "e1",
    amount: 30,
    tag: "kindness",
    date: "2026-04-08",
    message: "Your post-mortem coaching made the retro feel safe.",
  },
  {
    id: "kd16",
    fromId: "e2",
    toId: "e7",
    amount: 20,
    tag: "craft",
    date: "2026-04-07",
    message: "PRD structure change saved us a week of scope confusion.",
  },
  {
    id: "kd17",
    fromId: "e10",
    toId: "e7",
    amount: 15,
    tag: "courage",
    date: "2026-04-07",
    message: "Pushed back on exec on timeline — and got the realistic one.",
  },
  {
    id: "kd18",
    fromId: "e6",
    toId: "e7",
    amount: 25,
    tag: "impact",
    date: "2026-04-05",
    message: "Roadmap clarity moved the sales conversation forward.",
  },
  {
    id: "kd19",
    fromId: "e1",
    toId: "e2",
    amount: 30,
    tag: "craft",
    date: "2026-04-04",
    message: "Design tokens rollout felt effortless — that's all you.",
  },
  {
    id: "kd20",
    fromId: "e12",
    toId: "e2",
    amount: 20,
    tag: "teamwork",
    date: "2026-04-03",
    message: "Partnered beautifully with marketing on the launch page.",
  },
  {
    id: "kd21",
    fromId: "e7",
    toId: "e10",
    amount: 20,
    tag: "craft",
    date: "2026-04-02",
    message: "Data-quality framework you built is being copied by two other teams.",
  },
  {
    id: "kd22",
    fromId: "e2",
    toId: "e10",
    amount: 15,
    tag: "kindness",
    date: "2026-04-01",
    message: "Walked me through the cohort logic with patience.",
  },
  {
    id: "kd23",
    fromId: "e1",
    toId: "e4",
    amount: 25,
    tag: "impact",
    date: "2026-03-30",
    message: "Cache layer rewrite cut p95 by 38%.",
  },
  {
    id: "kd24",
    fromId: "e3",
    toId: "e8",
    amount: 20,
    tag: "teamwork",
    date: "2026-03-29",
    message: "Candidate-experience rework is already showing in survey scores.",
  },
  {
    id: "kd25",
    fromId: "e1",
    toId: "e8",
    amount: 15,
    tag: "craft",
    date: "2026-03-28",
    message: "Scorecard rewrite is tight — clear wins.",
  },
  {
    id: "kd26",
    fromId: "e8",
    toId: "e3",
    amount: 20,
    tag: "kindness",
    date: "2026-03-27",
    message: "Your feedback on the rubric session was exactly what I needed.",
  },
  {
    id: "kd27",
    fromId: "e6",
    toId: "e12",
    amount: 30,
    tag: "impact",
    date: "2026-03-26",
    message: "Campaign drove 2× pipeline vs. target — huge quarter for sales.",
  },
  {
    id: "kd28",
    fromId: "e12",
    toId: "e6",
    amount: 15,
    tag: "courage",
    date: "2026-03-25",
    message: "Cold-calling the enterprise list took guts. Paid off.",
  },
  {
    id: "kd29",
    fromId: "e3",
    toId: "e5",
    amount: 20,
    tag: "craft",
    date: "2026-03-24",
    message: "Payroll close documentation is gorgeous.",
  },
  {
    id: "kd30",
    fromId: "e1",
    toId: "e11",
    amount: 10,
    tag: "teamwork",
    date: "2026-03-22",
    message: "Smooth handover of the deploy pipeline — thanks for the walkthroughs.",
  },
  {
    id: "kd31",
    fromId: "e9",
    toId: "e4",
    amount: 20,
    tag: "craft",
    date: "2026-03-20",
    message: "The query-planner deep-dive was unreal.",
  },

  // ── earlier this year (Jan – Mar 17) ────────────────────────────────
  {
    id: "kd32",
    fromId: "e3",
    toId: "e1",
    amount: 50,
    tag: "courage",
    date: "2026-03-10",
    message: "Called the incident early and ate the downtime. Right call, hard call.",
  },
  {
    id: "kd33",
    fromId: "e2",
    toId: "e1",
    amount: 20,
    tag: "kindness",
    date: "2026-03-02",
    message: "Your 1:1 slots are the most helpful hour of my week.",
  },
  {
    id: "kd34",
    fromId: "e7",
    toId: "e1",
    amount: 30,
    tag: "impact",
    date: "2026-02-24",
    message: "Platform rebuild scoping saved the company from a 6-month detour.",
  },
  {
    id: "kd35",
    fromId: "e9",
    toId: "e1",
    amount: 15,
    tag: "teamwork",
    date: "2026-02-12",
    message: "Team sync format you piloted is now org-wide.",
  },
  {
    id: "kd36",
    fromId: "e3",
    toId: "e2",
    amount: 25,
    tag: "impact",
    date: "2026-02-26",
    message: "Recruiting page redesign — hiring funnel is up and to the right.",
  },
  {
    id: "kd37",
    fromId: "e9",
    toId: "e2",
    amount: 20,
    tag: "courage",
    date: "2026-02-14",
    message: "Pitching the bold direction in exec review took courage.",
  },
  {
    id: "kd38",
    fromId: "e1",
    toId: "e7",
    amount: 35,
    tag: "craft",
    date: "2026-03-04",
    message: "Specs for Growth module were flawless.",
  },
  {
    id: "kd39",
    fromId: "e3",
    toId: "e7",
    amount: 20,
    tag: "teamwork",
    date: "2026-02-08",
    message: "Cross-functional alignment around the new goals framework.",
  },
  {
    id: "kd40",
    fromId: "e10",
    toId: "e9",
    amount: 20,
    tag: "kindness",
    date: "2026-03-05",
    message: "Rubber-ducked my SQL nightmare for an hour. Legend.",
  },
  {
    id: "kd41",
    fromId: "e2",
    toId: "e9",
    amount: 15,
    tag: "impact",
    date: "2026-02-18",
    message: "Front-end perf work shaved 400ms off the shell.",
  },
  {
    id: "kd42",
    fromId: "e7",
    toId: "e9",
    amount: 25,
    tag: "craft",
    date: "2026-01-30",
    message: "Component architecture decisions are paying dividends.",
  },
  {
    id: "kd43",
    fromId: "e1",
    toId: "e3",
    amount: 30,
    tag: "impact",
    date: "2026-03-08",
    message: "Org-design work delivered a calmer Q1 for everyone.",
  },
  {
    id: "kd44",
    fromId: "e8",
    toId: "e3",
    amount: 15,
    tag: "craft",
    date: "2026-02-20",
    message: "Offer-letter template is a masterclass.",
  },
  {
    id: "kd45",
    fromId: "e12",
    toId: "e3",
    amount: 10,
    tag: "courage",
    date: "2026-01-28",
    message: "Standing up for the contractor pay-parity case — respect.",
  },
  {
    id: "kd46",
    fromId: "e7",
    toId: "e10",
    amount: 30,
    tag: "impact",
    date: "2026-02-22",
    message: "North-star metric work set the product bar for the year.",
  },
  {
    id: "kd47",
    fromId: "e1",
    toId: "e10",
    amount: 10,
    tag: "teamwork",
    date: "2026-01-18",
    message: "Paired with eng on the event schema — saved us weeks.",
  },
  {
    id: "kd48",
    fromId: "e2",
    toId: "e12",
    amount: 25,
    tag: "craft",
    date: "2026-02-02",
    message: "Brand refresh system is tight, consistent, and fun.",
  },
  {
    id: "kd49",
    fromId: "e3",
    toId: "e12",
    amount: 10,
    tag: "kindness",
    date: "2026-01-22",
    message: "Welcoming the new marketing hire made her first week.",
  },
  {
    id: "kd50",
    fromId: "e1",
    toId: "e4",
    amount: 15,
    tag: "impact",
    date: "2026-01-10",
    message: "Index tuning on the hot table dropped read latency significantly.",
  },
  {
    id: "kd51",
    fromId: "e4",
    toId: "e11",
    amount: 20,
    tag: "craft",
    date: "2026-02-15",
    message: "Terraform module overhaul is elegant.",
  },
  {
    id: "kd52",
    fromId: "e1",
    toId: "e11",
    amount: 25,
    tag: "teamwork",
    date: "2026-03-12",
    message: "Coordinated platform migration across four teams without drama.",
  },
  {
    id: "kd53",
    fromId: "e7",
    toId: "e6",
    amount: 10,
    tag: "kindness",
    date: "2026-02-06",
    message: "Took the time to debug a prospect's integration after hours.",
  },
  {
    id: "kd54",
    fromId: "e1",
    toId: "e5",
    amount: 15,
    tag: "craft",
    date: "2026-01-24",
    message: "Payroll audit tooling is sharper than what I've seen at bigger cos.",
  },
  {
    id: "kd55",
    fromId: "e3",
    toId: "e8",
    amount: 20,
    tag: "impact",
    date: "2026-02-28",
    message: "Hiring quality bar lifted — the last two hires are killing it.",
  },
  {
    id: "kd56",
    fromId: "e5",
    toId: "e1",
    amount: 10,
    tag: "teamwork",
    date: "2026-03-16",
    message: "Partnered with finance on the headcount model — very appreciated.",
  },
];

export interface FocusSession {
  id: string;
  employeeId: string;
  date: string;
  startedAt: string; // HH:MM
  durationMin: number;
  commessaId: string;
  note?: string;
  meetingsDeclined: number;
}
export const focusSessionsSeed: FocusSession[] = [
  // e1 — Sarah
  {
    id: "fs1",
    employeeId: "e1",
    date: "2026-04-17",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm1",
    meetingsDeclined: 2,
    note: "Migration script v3",
  },
  {
    id: "fs2",
    employeeId: "e1",
    date: "2026-04-17",
    startedAt: "14:00",
    durationMin: 60,
    commessaId: "cm1",
    meetingsDeclined: 1,
  },
  {
    id: "fs3",
    employeeId: "e1",
    date: "2026-04-16",
    startedAt: "10:00",
    durationMin: 90,
    commessaId: "cm3",
    meetingsDeclined: 3,
    note: "Design token audit",
  },
  {
    id: "fs4",
    employeeId: "e1",
    date: "2026-04-15",
    startedAt: "09:30",
    durationMin: 120,
    commessaId: "cm1",
    meetingsDeclined: 2,
  },
  {
    id: "fs5",
    employeeId: "e1",
    date: "2026-04-14",
    startedAt: "13:00",
    durationMin: 60,
    commessaId: "cm2",
    meetingsDeclined: 0,
  },
  {
    id: "fs6",
    employeeId: "e1",
    date: "2026-04-10",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm1",
    meetingsDeclined: 2,
  },
  {
    id: "fs7",
    employeeId: "e1",
    date: "2026-04-03",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm1",
    meetingsDeclined: 1,
  },
  // e2 — Marcus
  {
    id: "fs8",
    employeeId: "e2",
    date: "2026-04-17",
    startedAt: "10:30",
    durationMin: 120,
    commessaId: "cm3",
    meetingsDeclined: 3,
    note: "Onboarding polish",
  },
  {
    id: "fs9",
    employeeId: "e2",
    date: "2026-04-15",
    startedAt: "14:00",
    durationMin: 90,
    commessaId: "cm3",
    meetingsDeclined: 2,
  },
  {
    id: "fs10",
    employeeId: "e2",
    date: "2026-04-09",
    startedAt: "10:00",
    durationMin: 90,
    commessaId: "cm3",
    meetingsDeclined: 2,
  },
  {
    id: "fs11",
    employeeId: "e2",
    date: "2026-04-02",
    startedAt: "10:00",
    durationMin: 120,
    commessaId: "cm3",
    meetingsDeclined: 3,
  },
  // e4 — Tom
  {
    id: "fs12",
    employeeId: "e4",
    date: "2026-04-15",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm2",
    meetingsDeclined: 1,
    note: "Cache layer",
  },
  {
    id: "fs13",
    employeeId: "e4",
    date: "2026-04-10",
    startedAt: "09:00",
    durationMin: 120,
    commessaId: "cm2",
    meetingsDeclined: 2,
  },
  // e7 — Yuki
  {
    id: "fs14",
    employeeId: "e7",
    date: "2026-04-16",
    startedAt: "09:00",
    durationMin: 60,
    commessaId: "cm2",
    meetingsDeclined: 1,
    note: "Roadmap review",
  },
  {
    id: "fs15",
    employeeId: "e7",
    date: "2026-04-14",
    startedAt: "14:00",
    durationMin: 90,
    commessaId: "cm2",
    meetingsDeclined: 2,
  },
  {
    id: "fs16",
    employeeId: "e7",
    date: "2026-04-07",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm2",
    meetingsDeclined: 2,
  },
  // e9 — Noah
  {
    id: "fs17",
    employeeId: "e9",
    date: "2026-04-17",
    startedAt: "10:00",
    durationMin: 120,
    commessaId: "cm1",
    meetingsDeclined: 3,
    note: "Perf pass",
  },
  {
    id: "fs18",
    employeeId: "e9",
    date: "2026-04-15",
    startedAt: "09:30",
    durationMin: 90,
    commessaId: "cm1",
    meetingsDeclined: 2,
  },
  {
    id: "fs19",
    employeeId: "e9",
    date: "2026-04-14",
    startedAt: "14:00",
    durationMin: 60,
    commessaId: "cm1",
    meetingsDeclined: 1,
  },
  {
    id: "fs20",
    employeeId: "e9",
    date: "2026-04-08",
    startedAt: "09:00",
    durationMin: 120,
    commessaId: "cm1",
    meetingsDeclined: 3,
  },
  {
    id: "fs21",
    employeeId: "e9",
    date: "2026-04-01",
    startedAt: "09:00",
    durationMin: 90,
    commessaId: "cm1",
    meetingsDeclined: 2,
  },
  // e10 — Fatima
  {
    id: "fs22",
    employeeId: "e10",
    date: "2026-04-16",
    startedAt: "11:00",
    durationMin: 60,
    commessaId: "cm2",
    meetingsDeclined: 1,
    note: "Cohort analysis",
  },
  {
    id: "fs23",
    employeeId: "e10",
    date: "2026-04-09",
    startedAt: "10:00",
    durationMin: 90,
    commessaId: "cm2",
    meetingsDeclined: 2,
  },
  // e3 — Aisha
  {
    id: "fs24",
    employeeId: "e3",
    date: "2026-04-15",
    startedAt: "09:00",
    durationMin: 60,
    commessaId: "cm4",
    meetingsDeclined: 1,
  },
  {
    id: "fs25",
    employeeId: "e3",
    date: "2026-04-08",
    startedAt: "09:00",
    durationMin: 60,
    commessaId: "cm4",
    meetingsDeclined: 1,
  },
];

export interface Payslip {
  id: string;
  runId: string;
  employeeId: string;
  gross: number;
  net: number;
  tax: number;
  benefits: number;
  status: "pending" | "paid" | "hold";
}
export const payslips: Payslip[] = payrollRuns.flatMap((r) =>
  employees.slice(0, r.employees).map((e, i) => ({
    id: `${r.id}-${e.id}`,
    runId: r.id,
    employeeId: e.id,
    gross: Math.round(e.salary / 12),
    net: Math.round((e.salary / 12) * 0.72),
    tax: Math.round((e.salary / 12) * 0.22),
    benefits: Math.round((e.salary / 12) * 0.06),
    status:
      r.status === "completed"
        ? "paid"
        : r.status === "processing"
          ? "pending"
          : i % 9 === 0
            ? "hold"
            : "pending",
  })),
);

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: "Full-time" | "Part-time" | "Contractor";
  salary: string;
  status: "draft" | "open" | "closed";
  applicants: number;
  posted: string;
  owner: string;
  description: string;
}
export const jobPostings: JobPosting[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote — EU",
    type: "Full-time",
    salary: "€80k – €110k",
    status: "open",
    applicants: 12,
    posted: "2026-03-28",
    owner: "Sarah Chen",
    description: "Ship the next generation of our platform UI with React, TanStack and Tailwind.",
  },
  {
    id: "j2",
    title: "Product Designer",
    department: "Design",
    location: "Berlin",
    type: "Full-time",
    salary: "€65k – €85k",
    status: "open",
    applicants: 8,
    posted: "2026-04-02",
    owner: "Marcus Rivera",
    description: "Lead design system evolution and deliver polished flows for core product.",
  },
  {
    id: "j3",
    title: "Account Executive",
    department: "Sales",
    location: "New York",
    type: "Full-time",
    salary: "$90k + OTE",
    status: "open",
    applicants: 21,
    posted: "2026-04-10",
    owner: "David Park",
    description: "Close mid-market deals and own relationships end-to-end.",
  },
  {
    id: "j4",
    title: "Junior Recruiter",
    department: "People Ops",
    location: "Dublin",
    type: "Full-time",
    salary: "€42k – €55k",
    status: "draft",
    applicants: 0,
    posted: "",
    owner: "Aisha Patel",
    description: "Source and screen candidates across EU engineering funnels.",
  },
];

export interface OnboardingTask {
  id: string;
  label: string;
  done: boolean;
  owner: string;
  due?: string;
  category: "Paperwork" | "Access" | "People" | "Training";
}

export interface OnboardingWorkflow {
  id: string;
  name: string;
  role: string;
  startDate: string;
  type: "onboarding" | "offboarding";
  initials: string;
  color: string;
  tasks: OnboardingTask[];
}
export const onboardingWorkflows: OnboardingWorkflow[] = [
  {
    id: "ow1",
    name: "Emma Wilson",
    role: "Senior Engineer",
    startDate: "2026-05-06",
    type: "onboarding",
    initials: "EW",
    color: "oklch(0.7 0.15 30)",
    tasks: [
      {
        id: "t1",
        label: "Send offer letter",
        done: true,
        owner: "Aisha Patel",
        category: "Paperwork",
        due: "2026-04-18",
      },
      {
        id: "t2",
        label: "Run background check",
        done: true,
        owner: "Olivia Brown",
        category: "Paperwork",
        due: "2026-04-22",
      },
      {
        id: "t3",
        label: "Order laptop & equipment",
        done: true,
        owner: "IT Team",
        category: "Access",
        due: "2026-04-25",
      },
      {
        id: "t4",
        label: "Set up email & accounts",
        done: false,
        owner: "IT Team",
        category: "Access",
        due: "2026-05-02",
      },
      {
        id: "t5",
        label: "Schedule welcome call",
        done: false,
        owner: "Sarah Chen",
        category: "People",
        due: "2026-05-05",
      },
      {
        id: "t6",
        label: "Sign employment contract",
        done: false,
        owner: "Emma Wilson",
        category: "Paperwork",
        due: "2026-05-06",
      },
      {
        id: "t7",
        label: "Complete tax forms",
        done: false,
        owner: "Emma Wilson",
        category: "Paperwork",
        due: "2026-05-06",
      },
      {
        id: "t8",
        label: "First-week training plan",
        done: false,
        owner: "Aisha Patel",
        category: "Training",
        due: "2026-05-13",
      },
    ],
  },
  {
    id: "ow2",
    name: "James Liu",
    role: "Senior Engineer",
    startDate: "2026-06-02",
    type: "onboarding",
    initials: "JL",
    color: "oklch(0.6 0.16 220)",
    tasks: [
      {
        id: "t1",
        label: "Offer accepted",
        done: true,
        owner: "Aisha Patel",
        category: "Paperwork",
      },
      {
        id: "t2",
        label: "Background check",
        done: false,
        owner: "Olivia Brown",
        category: "Paperwork",
      },
    ],
  },
  {
    id: "ow3",
    name: "Sofia Garcia",
    role: "Product Designer",
    startDate: "2026-05-19",
    type: "onboarding",
    initials: "SG",
    color: "oklch(0.65 0.18 340)",
    tasks: [
      {
        id: "t1",
        label: "Offer accepted",
        done: true,
        owner: "Olivia Brown",
        category: "Paperwork",
      },
      {
        id: "t2",
        label: "Background check",
        done: true,
        owner: "Olivia Brown",
        category: "Paperwork",
      },
      { id: "t3", label: "Order laptop", done: true, owner: "IT Team", category: "Access" },
      { id: "t4", label: "Access to Figma org", done: false, owner: "IT Team", category: "Access" },
      {
        id: "t5",
        label: "Design onboarding brief",
        done: false,
        owner: "Marcus Rivera",
        category: "Training",
      },
    ],
  },
  {
    id: "ow4",
    name: "Greg Holland",
    role: "DevOps Engineer",
    startDate: "2026-04-30",
    type: "offboarding",
    initials: "GH",
    color: "oklch(0.7 0.13 110)",
    tasks: [
      { id: "t1", label: "Exit interview", done: true, owner: "Aisha Patel", category: "People" },
      {
        id: "t2",
        label: "Revoke production SSH",
        done: true,
        owner: "IT Team",
        category: "Access",
      },
      { id: "t3", label: "Return laptop", done: false, owner: "Greg Holland", category: "Access" },
      { id: "t4", label: "Final payroll", done: false, owner: "Lina Rossi", category: "Paperwork" },
    ],
  },
];

export interface Doc {
  id: string;
  name: string;
  folder: string;
  size: string;
  updated: string;
  status: "approved" | "pending" | "draft";
  owner: string;
}
export const docsSeed: Doc[] = [
  {
    id: "d1",
    name: "Employment contract — Emma Wilson",
    folder: "Contracts",
    size: "112 KB",
    updated: "2d ago",
    status: "pending",
    owner: "Aisha Patel",
  },
  {
    id: "d2",
    name: "Company handbook 2026",
    folder: "Policies",
    size: "2.4 MB",
    updated: "1w ago",
    status: "approved",
    owner: "Aisha Patel",
  },
  {
    id: "d3",
    name: "NDA Template",
    folder: "Templates",
    size: "84 KB",
    updated: "2w ago",
    status: "approved",
    owner: "Lina Rossi",
  },
  {
    id: "d4",
    name: "F24 — March 2026",
    folder: "Tax forms",
    size: "320 KB",
    updated: "3w ago",
    status: "approved",
    owner: "Lina Rossi",
  },
  {
    id: "d5",
    name: "Remote work policy",
    folder: "Policies",
    size: "180 KB",
    updated: "1mo ago",
    status: "approved",
    owner: "Aisha Patel",
  },
  {
    id: "d6",
    name: "Onboarding checklist v3",
    folder: "Onboarding",
    size: "42 KB",
    updated: "5d ago",
    status: "draft",
    owner: "Olivia Brown",
  },
  {
    id: "d7",
    name: "Expense policy 2026",
    folder: "Policies",
    size: "96 KB",
    updated: "1mo ago",
    status: "approved",
    owner: "Lina Rossi",
  },
];

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  env: "prod" | "test";
  createdAt: string;
  lastUsed: string;
  status: "active" | "revoked";
}
export const apiKeysSeed: ApiKey[] = [
  {
    id: "k1",
    name: "Production",
    key: "pk_live_8fK2nDm2qx4f72",
    env: "prod",
    createdAt: "2026-01-14",
    lastUsed: "2m ago",
    status: "active",
  },
  {
    id: "k2",
    name: "Staging",
    key: "pk_test_D0pXvE9a91c",
    env: "test",
    createdAt: "2026-03-02",
    lastUsed: "3h ago",
    status: "active",
  },
];

export interface Webhook {
  id: string;
  url: string;
  events: string[];
  status: "active" | "pending" | "paused";
  deliveries: number;
}
export const webhooksSeed: Webhook[] = [
  {
    id: "w1",
    url: "https://hooks.acme.co/hr/employees",
    events: ["employee.created", "employee.updated"],
    status: "active",
    deliveries: 1204,
  },
  {
    id: "w2",
    url: "https://hooks.acme.co/hr/timesheets",
    events: ["timesheet.submitted"],
    status: "active",
    deliveries: 842,
  },
  {
    id: "w3",
    url: "https://internal.acme.co/payroll",
    events: ["payroll.completed"],
    status: "pending",
    deliveries: 0,
  },
];

export interface CustomField {
  id: string;
  name: string;
  type: "Text" | "Select" | "Number" | "Date";
  required: boolean;
}
export const customFieldsSeed: CustomField[] = [
  { id: "cf1", name: "T-shirt size", type: "Select", required: false },
  { id: "cf2", name: "Dietary preference", type: "Text", required: false },
  { id: "cf3", name: "Preferred pronouns", type: "Text", required: false },
];

export interface Role {
  id: string;
  name: string;
  desc: string;
  count: number;
  color: string;
}
export const rolesSeed: Role[] = [
  {
    id: "r1",
    name: "Admin",
    desc: "Full access to all modules and settings",
    count: 2,
    color: "oklch(0.6 0.22 25)",
  },
  {
    id: "r2",
    name: "HR Manager",
    desc: "Manage employees, payroll, and reports",
    count: 3,
    color: "oklch(0.6 0.16 220)",
  },
  {
    id: "r3",
    name: "Manager",
    desc: "Approve team requests, view team data",
    count: 4,
    color: "oklch(0.65 0.15 155)",
  },
  {
    id: "r4",
    name: "Employee",
    desc: "Personal data, time, leave, expenses",
    count: 12,
    color: "oklch(0.52 0.02 258)",
  },
];

export interface AuditEntry {
  id: string;
  who: string;
  what: string;
  when: string;
  severity: "info" | "warn" | "critical";
}
export const auditLogSeed: AuditEntry[] = [
  {
    id: "a1",
    who: "Aisha Patel",
    what: "approved leave request for Tom Becker",
    when: "2h ago",
    severity: "info",
  },
  {
    id: "a2",
    who: "Lina Rossi",
    what: "ran payroll for March 2026",
    when: "Yesterday",
    severity: "info",
  },
  {
    id: "a3",
    who: "Alex Carter",
    what: "added Emma Wilson as employee",
    when: "2d ago",
    severity: "info",
  },
  {
    id: "a4",
    who: "System",
    what: "synced 12 records with QuickBooks",
    when: "3d ago",
    severity: "info",
  },
  {
    id: "a5",
    who: "Alex Carter",
    what: "revoked API key pk_live_••••2a17",
    when: "5d ago",
    severity: "warn",
  },
  {
    id: "a6",
    who: "System",
    what: "detected 3 failed SSO logins for e7",
    when: "1w ago",
    severity: "critical",
  },
];

export interface Notification {
  id: string;
  title: string;
  desc: string;
  time: string;
  type: "approval" | "info" | "alert";
  unread: boolean;
}
export const notifications: Notification[] = [
  {
    id: "n1",
    title: "Leave request from Marcus Rivera",
    desc: "5 days vacation • Apr 22 – 28",
    time: "2m ago",
    type: "approval",
    unread: true,
  },
  {
    id: "n2",
    title: "Expense over threshold",
    desc: "Noah Williams submitted $620 equipment",
    time: "1h ago",
    type: "alert",
    unread: true,
  },
  {
    id: "n3",
    title: "Payroll run scheduled",
    desc: "April 2026 run will execute Apr 30",
    time: "3h ago",
    type: "info",
    unread: true,
  },
  {
    id: "n4",
    title: "Tom Becker returning Monday",
    desc: "Sick leave ends Apr 19",
    time: "Yesterday",
    type: "info",
    unread: false,
  },
  {
    id: "n5",
    title: "Onboarding task assigned",
    desc: "Send laptop to new hire",
    time: "2d ago",
    type: "info",
    unread: false,
  },
];

export const announcements = [
  {
    id: "a1",
    author: "Aisha Patel",
    title: "Q2 OKRs published",
    body: "All teams: please review Q2 OKRs by Friday and confirm with your manager.",
    time: "2h ago",
    pinned: true,
  },
  {
    id: "a2",
    author: "Sarah Chen",
    title: "All-hands moved to Thursday",
    body: "This week's all-hands is moved to Thursday at 4pm CET.",
    time: "1d ago",
    pinned: false,
  },
  {
    id: "a3",
    author: "Lina Rossi",
    title: "Expense policy update",
    body: "New expense limits for travel apply starting May 1. See policy doc.",
    time: "3d ago",
    pinned: false,
  },
];

// ── Clients / Projects / PM ────────────────────────────────────────────

export type IntegrationProvider = "jira" | "linear" | "google-calendar";
export type AllocationType = "dev" | "design" | "pm" | "qa" | "ops" | "consult";
export type ProjectStatus = "active" | "on_hold" | "closed" | "at_risk" | "done" | "draft";
export type ActivityStatus = "todo" | "in_progress" | "review" | "done" | "blocked";

export interface Client {
  id: string;
  name: string;
  industry: string;
  accountOwnerId: string;
  healthScore: number;
  billingCurrency: "EUR" | "USD" | "GBP";
  contactName: string;
  contactEmail: string;
  website?: string;
  notes?: string;
  createdAt: string;
  colorToken: string;
}

export const clients: Client[] = [
  {
    id: "cl1",
    name: "Acme Corp",
    industry: "SaaS",
    accountOwnerId: "e1",
    healthScore: 82,
    billingCurrency: "EUR",
    contactName: "Rachel Morton",
    contactEmail: "rachel@acme.test",
    website: "acme.test",
    notes: "Platform rebuild flagship account — quarterly steerco.",
    createdAt: "2024-09-10",
    colorToken: "oklch(0.6 0.18 258)",
  },
  {
    id: "cl2",
    name: "Nova Retail",
    industry: "Retail",
    accountOwnerId: "e7",
    healthScore: 71,
    billingCurrency: "EUR",
    contactName: "Diego Romero",
    contactEmail: "diego@novaretail.test",
    website: "novaretail.test",
    notes: "Mobile-first onboarding program.",
    createdAt: "2025-01-18",
    colorToken: "oklch(0.7 0.15 30)",
  },
  {
    id: "cl3",
    name: "Blanco Studio",
    industry: "Creative",
    accountOwnerId: "e2",
    healthScore: 88,
    billingCurrency: "EUR",
    contactName: "Sophie Blanco",
    contactEmail: "sophie@blanco.test",
    website: "blanco.test",
    notes: "Design system partnership.",
    createdAt: "2024-11-02",
    colorToken: "oklch(0.65 0.18 340)",
  },
  {
    id: "cl4",
    name: "Internal",
    industry: "Internal",
    accountOwnerId: "e3",
    healthScore: 95,
    billingCurrency: "EUR",
    contactName: "Aisha Patel",
    contactEmail: "aisha.p@acme.co",
    website: undefined,
    notes: "Internal tooling — no external billing.",
    createdAt: "2024-01-01",
    colorToken: "oklch(0.65 0.15 155)",
  },
  {
    id: "cl5",
    name: "Longo Group",
    industry: "Manufacturing",
    accountOwnerId: "e4",
    healthScore: 48,
    billingCurrency: "EUR",
    contactName: "Marco Longo",
    contactEmail: "m.longo@longo.test",
    website: "longo.test",
    notes: "Legacy migration — currently on hold pending budget renewal.",
    createdAt: "2023-08-22",
    colorToken: "oklch(0.7 0.13 110)",
  },
  {
    id: "cl6",
    name: "Zenith Energy",
    industry: "Energy",
    accountOwnerId: "e10",
    healthScore: 77,
    billingCurrency: "EUR",
    contactName: "Eleanor Wick",
    contactEmail: "eleanor@zenith.test",
    website: "zenith.test",
    notes: "Analytics program — expanding scope to forecasting in Q3.",
    createdAt: "2025-02-14",
    colorToken: "oklch(0.6 0.16 195)",
  },
];

export const clientById = (id: string) => clients.find((c) => c.id === id);

/**
 * Commessa = Project. The legacy name `Commessa` is kept because Time/Focus/Forecast
 * routes already reference it; the new Clients/Projects feature treats each commessa
 * as a project with a `clientId` FK and extended PM metadata.
 */
export interface Commessa {
  id: string;
  code: string;
  name: string;
  client: string; // denormalised client name (kept for legacy readers)
  clientId: string;
  ownerId: string; // responsible employee id (replaces plain-text `manager`)
  color: string;
  budgetHours: number;
  burnedHours: number;
  status: ProjectStatus;
  manager: string; // kept for legacy display (employee name)
  startDate: string;
  endDate: string;
  defaultBillableRate: number; // €/h
  tags: string[];
  externalLinks: { provider: IntegrationProvider; key: string; url: string }[];
}

export type Project = Commessa;

export const commesse: Commessa[] = [
  {
    id: "cm1",
    code: "ACM-2025-01",
    name: "Platform rebuild",
    client: "Acme Corp",
    clientId: "cl1",
    ownerId: "e1",
    color: "oklch(0.6 0.18 258)",
    budgetHours: 1200,
    burnedHours: 742,
    status: "active",
    manager: "Sarah Chen",
    startDate: "2025-10-01",
    endDate: "2026-06-30",
    defaultBillableRate: 145,
    tags: ["platform", "backend"],
    externalLinks: [{ provider: "jira", key: "ACME-18", url: "https://jira.test/ACME-18" }],
  },
  {
    id: "cm2",
    code: "NOV-2025-07",
    name: "Mobile onboarding",
    client: "Nova Retail",
    clientId: "cl2",
    ownerId: "e7",
    color: "oklch(0.7 0.15 30)",
    budgetHours: 480,
    burnedHours: 189,
    status: "active",
    manager: "Yuki Tanaka",
    startDate: "2026-02-01",
    endDate: "2026-07-15",
    defaultBillableRate: 130,
    tags: ["mobile", "ux"],
    externalLinks: [{ provider: "linear", key: "NOV-3", url: "https://linear.test/NOV-3" }],
  },
  {
    id: "cm3",
    code: "BCO-2025-03",
    name: "Design system v2",
    client: "Blanco Studio",
    clientId: "cl3",
    ownerId: "e2",
    color: "oklch(0.65 0.18 340)",
    budgetHours: 360,
    burnedHours: 298,
    status: "at_risk",
    manager: "Marcus Rivera",
    startDate: "2025-12-01",
    endDate: "2026-05-15",
    defaultBillableRate: 120,
    tags: ["design", "tokens"],
    externalLinks: [],
  },
  {
    id: "cm4",
    code: "INT-2025-00",
    name: "Internal — HR tooling",
    client: "Internal",
    clientId: "cl4",
    ownerId: "e3",
    color: "oklch(0.65 0.15 155)",
    budgetHours: 200,
    burnedHours: 87,
    status: "active",
    manager: "Aisha Patel",
    startDate: "2026-01-15",
    endDate: "2026-09-30",
    defaultBillableRate: 0,
    tags: ["internal"],
    externalLinks: [],
  },
  {
    id: "cm5",
    code: "LGO-2024-12",
    name: "Legacy migration",
    client: "Longo Group",
    clientId: "cl5",
    ownerId: "e4",
    color: "oklch(0.7 0.13 110)",
    budgetHours: 800,
    burnedHours: 812,
    status: "on_hold",
    manager: "Tom Becker",
    startDate: "2024-09-01",
    endDate: "2026-03-31",
    defaultBillableRate: 110,
    tags: ["legacy", "migration"],
    externalLinks: [{ provider: "jira", key: "LGO-42", url: "https://jira.test/LGO-42" }],
  },
  {
    id: "cm6",
    code: "ZNE-2025-04",
    name: "Analytics dashboard",
    client: "Zenith Energy",
    clientId: "cl6",
    ownerId: "e10",
    color: "oklch(0.6 0.16 195)",
    budgetHours: 540,
    burnedHours: 120,
    status: "active",
    manager: "Fatima Al-Sayed",
    startDate: "2026-03-01",
    endDate: "2026-10-31",
    defaultBillableRate: 135,
    tags: ["analytics", "data"],
    externalLinks: [],
  },
];

export const commessaById = (id: string) => commesse.find((c) => c.id === id);
export const projectById = commessaById;

export interface Allocation {
  id: string;
  projectId: string;
  employeeId: string;
  type: AllocationType;
  percent: number; // 0–100 weekly FTE
  startDate: string;
  endDate: string;
  billableRate?: number; // overrides project.defaultBillableRate
  note?: string;
}

export const allocations: Allocation[] = [
  // cm1 — Platform rebuild
  {
    id: "al1",
    projectId: "cm1",
    employeeId: "e1",
    type: "pm",
    percent: 40,
    startDate: "2025-10-01",
    endDate: "2026-06-30",
    billableRate: 180,
    note: "Engineering lead",
  },
  {
    id: "al2",
    projectId: "cm1",
    employeeId: "e9",
    type: "dev",
    percent: 80,
    startDate: "2025-11-01",
    endDate: "2026-06-30",
    billableRate: 125,
  },
  {
    id: "al3",
    projectId: "cm1",
    employeeId: "e4",
    type: "dev",
    percent: 50,
    startDate: "2025-11-15",
    endDate: "2026-04-30",
    billableRate: 120,
  },
  {
    id: "al4",
    projectId: "cm1",
    employeeId: "e11",
    type: "ops",
    percent: 30,
    startDate: "2025-12-01",
    endDate: "2026-05-31",
    billableRate: 140,
  },
  // cm2 — Mobile onboarding
  {
    id: "al5",
    projectId: "cm2",
    employeeId: "e7",
    type: "pm",
    percent: 30,
    startDate: "2026-02-01",
    endDate: "2026-07-15",
    billableRate: 165,
  },
  {
    id: "al6",
    projectId: "cm2",
    employeeId: "e9",
    type: "dev",
    percent: 20,
    startDate: "2026-02-01",
    endDate: "2026-07-15",
    billableRate: 125,
  },
  {
    id: "al7",
    projectId: "cm2",
    employeeId: "e2",
    type: "design",
    percent: 40,
    startDate: "2026-02-15",
    endDate: "2026-06-15",
    billableRate: 130,
  },
  // cm3 — Design system v2
  {
    id: "al8",
    projectId: "cm3",
    employeeId: "e2",
    type: "design",
    percent: 60,
    startDate: "2025-12-01",
    endDate: "2026-05-15",
    billableRate: 130,
  },
  {
    id: "al9",
    projectId: "cm3",
    employeeId: "e1",
    type: "consult",
    percent: 10,
    startDate: "2026-01-01",
    endDate: "2026-05-15",
    billableRate: 180,
  },
  // cm4 — Internal HR tooling
  {
    id: "al10",
    projectId: "cm4",
    employeeId: "e3",
    type: "pm",
    percent: 40,
    startDate: "2026-01-15",
    endDate: "2026-09-30",
  },
  {
    id: "al11",
    projectId: "cm4",
    employeeId: "e8",
    type: "qa",
    percent: 20,
    startDate: "2026-03-01",
    endDate: "2026-09-30",
  },
  // cm5 — Legacy migration (on hold)
  {
    id: "al12",
    projectId: "cm5",
    employeeId: "e4",
    type: "dev",
    percent: 20,
    startDate: "2024-09-01",
    endDate: "2026-03-31",
    billableRate: 115,
  },
  // cm6 — Analytics dashboard
  {
    id: "al13",
    projectId: "cm6",
    employeeId: "e10",
    type: "dev",
    percent: 70,
    startDate: "2026-03-01",
    endDate: "2026-10-31",
    billableRate: 135,
  },
  {
    id: "al14",
    projectId: "cm6",
    employeeId: "e1",
    type: "consult",
    percent: 10,
    startDate: "2026-03-01",
    endDate: "2026-06-30",
    billableRate: 180,
  },
  {
    id: "al15",
    projectId: "cm6",
    employeeId: "e7",
    type: "pm",
    percent: 15,
    startDate: "2026-03-01",
    endDate: "2026-10-31",
    billableRate: 165,
  },
  {
    id: "al16",
    projectId: "cm6",
    employeeId: "e12",
    type: "design",
    percent: 25,
    startDate: "2026-04-01",
    endDate: "2026-08-31",
    billableRate: 120,
  },
  {
    id: "al17",
    projectId: "cm1",
    employeeId: "e12",
    type: "consult",
    percent: 10,
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    billableRate: 130,
    note: "Launch comms",
  },
  {
    id: "al18",
    projectId: "cm2",
    employeeId: "e8",
    type: "qa",
    percent: 20,
    startDate: "2026-03-15",
    endDate: "2026-07-15",
    billableRate: 95,
  },
];

export interface Activity {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  status: ActivityStatus;
  assigneeId?: string;
  startDate?: string;
  endDate?: string;
  dependencies: string[];
  ticketLink?: { provider: IntegrationProvider; key: string; url: string };
  order: number;
}

export const activities: Activity[] = [
  // cm1
  {
    id: "ac1",
    projectId: "cm1",
    title: "Finalise API contract",
    description: "REST + GraphQL surfaces, auth layer agreed with client.",
    status: "done",
    assigneeId: "e1",
    startDate: "2026-03-02",
    endDate: "2026-03-20",
    dependencies: [],
    ticketLink: { provider: "jira", key: "ACME-21", url: "https://jira.test/ACME-21" },
    order: 1,
  },
  {
    id: "ac2",
    projectId: "cm1",
    title: "Migration dry-run on staging",
    description: "End-to-end smoke test with production data volumes.",
    status: "in_progress",
    assigneeId: "e9",
    startDate: "2026-04-01",
    endDate: "2026-04-25",
    dependencies: ["ac1"],
    ticketLink: { provider: "jira", key: "ACME-22", url: "https://jira.test/ACME-22" },
    order: 1,
  },
  {
    id: "ac3",
    projectId: "cm1",
    title: "Rollback plan sign-off",
    description: "DR runbook + legal review.",
    status: "review",
    assigneeId: "e4",
    startDate: "2026-04-10",
    endDate: "2026-04-22",
    dependencies: ["ac1"],
    order: 1,
  },
  {
    id: "ac4",
    projectId: "cm1",
    title: "Cutover window scheduling",
    description: "Coordinate with Acme ops + support.",
    status: "todo",
    assigneeId: "e1",
    startDate: "2026-05-01",
    endDate: "2026-05-10",
    dependencies: ["ac2", "ac3"],
    order: 1,
  },
  {
    id: "ac5",
    projectId: "cm1",
    title: "Post-cutover monitoring",
    description: "24×7 rota for first week after go-live.",
    status: "todo",
    assigneeId: "e11",
    startDate: "2026-05-11",
    endDate: "2026-05-25",
    dependencies: ["ac4"],
    order: 2,
  },
  {
    id: "ac6",
    projectId: "cm1",
    title: "Launch comms pack",
    description: "Marketing + internal announcement.",
    status: "blocked",
    assigneeId: "e12",
    startDate: "2026-05-05",
    endDate: "2026-05-18",
    dependencies: ["ac4"],
    ticketLink: { provider: "linear", key: "NOV-9", url: "https://linear.test/NOV-9" },
    order: 1,
  },
  // cm2
  {
    id: "ac7",
    projectId: "cm2",
    title: "Onboarding UX research",
    description: "User interviews + competitor teardown.",
    status: "done",
    assigneeId: "e7",
    startDate: "2026-02-10",
    endDate: "2026-03-05",
    dependencies: [],
    order: 1,
  },
  {
    id: "ac8",
    projectId: "cm2",
    title: "Sign-up flow prototype",
    description: "Hi-fi Figma with variants.",
    status: "in_progress",
    assigneeId: "e2",
    startDate: "2026-03-05",
    endDate: "2026-04-20",
    dependencies: ["ac7"],
    ticketLink: { provider: "linear", key: "NOV-11", url: "https://linear.test/NOV-11" },
    order: 1,
  },
  {
    id: "ac9",
    projectId: "cm2",
    title: "Auth API integration",
    description: "OTP + social.",
    status: "todo",
    assigneeId: "e9",
    startDate: "2026-04-20",
    endDate: "2026-05-20",
    dependencies: ["ac8"],
    ticketLink: { provider: "linear", key: "NOV-14", url: "https://linear.test/NOV-14" },
    order: 1,
  },
  {
    id: "ac10",
    projectId: "cm2",
    title: "QA + accessibility audit",
    description: "Screen reader, contrast, tap targets.",
    status: "todo",
    assigneeId: "e8",
    startDate: "2026-05-20",
    endDate: "2026-06-15",
    dependencies: ["ac9"],
    order: 2,
  },
  // cm3
  {
    id: "ac11",
    projectId: "cm3",
    title: "Token migration",
    description: "Move from SCSS vars to oklch CSS variables.",
    status: "review",
    assigneeId: "e2",
    startDate: "2026-02-01",
    endDate: "2026-04-10",
    dependencies: [],
    order: 1,
  },
  {
    id: "ac12",
    projectId: "cm3",
    title: "Component library audit",
    description: "Button/Input/Card parity with Figma.",
    status: "in_progress",
    assigneeId: "e2",
    startDate: "2026-03-01",
    endDate: "2026-05-01",
    dependencies: [],
    order: 2,
  },
  {
    id: "ac13",
    projectId: "cm3",
    title: "Docs site refresh",
    description: "New IA + search.",
    status: "todo",
    assigneeId: "e1",
    startDate: "2026-04-15",
    endDate: "2026-05-15",
    dependencies: ["ac12"],
    order: 1,
  },
  // cm4
  {
    id: "ac14",
    projectId: "cm4",
    title: "Leave policy engine",
    description: "Rule engine powering the leave tab.",
    status: "done",
    assigneeId: "e3",
    startDate: "2026-01-20",
    endDate: "2026-03-01",
    dependencies: [],
    order: 1,
  },
  {
    id: "ac15",
    projectId: "cm4",
    title: "Payroll approval workflow",
    description: "Multi-step approval with audit log.",
    status: "in_progress",
    assigneeId: "e3",
    startDate: "2026-03-01",
    endDate: "2026-05-15",
    dependencies: ["ac14"],
    order: 1,
  },
  // cm6
  {
    id: "ac16",
    projectId: "cm6",
    title: "Ingestion spike",
    description: "Assess throughput + schema evolution.",
    status: "done",
    assigneeId: "e10",
    startDate: "2026-03-05",
    endDate: "2026-03-25",
    dependencies: [],
    order: 1,
  },
  {
    id: "ac17",
    projectId: "cm6",
    title: "Dashboard wireframes",
    description: "Five primary boards.",
    status: "in_progress",
    assigneeId: "e12",
    startDate: "2026-04-01",
    endDate: "2026-05-10",
    dependencies: ["ac16"],
    order: 1,
  },
  {
    id: "ac18",
    projectId: "cm6",
    title: "ETL pipeline v1",
    description: "Airflow DAGs + monitoring.",
    status: "todo",
    assigneeId: "e10",
    startDate: "2026-05-10",
    endDate: "2026-07-10",
    dependencies: ["ac16"],
    ticketLink: { provider: "jira", key: "ZNE-3", url: "https://jira.test/ZNE-3" },
    order: 2,
  },
  {
    id: "ac19",
    projectId: "cm6",
    title: "Exec-level reporting",
    description: "Quarterly rollups.",
    status: "todo",
    assigneeId: "e10",
    startDate: "2026-07-10",
    endDate: "2026-09-01",
    dependencies: ["ac18"],
    order: 3,
  },
];

export type SyncDirection = "import" | "two-way";

export interface IntegrationConnection {
  provider: IntegrationProvider;
  status: "connected" | "disconnected" | "error";
  workspace?: string;
  connectedAt?: string;
  syncedAt?: string;
  /** Only meaningful for google-calendar. Import = read-only; two-way = push + pull. */
  syncDirection?: SyncDirection;
  webhookEvents: { id: string; at: string; kind: string; summary: string }[];
}

export const integrationsSeed: IntegrationConnection[] = [
  { provider: "jira", status: "disconnected", webhookEvents: [] },
  { provider: "linear", status: "disconnected", webhookEvents: [] },
  { provider: "google-calendar", status: "disconnected", webhookEvents: [] },
];

/** Seeded ticket pool returned by the mock Jira/Linear sync. */
export interface MockIssue {
  provider: IntegrationProvider;
  key: string;
  title: string;
  status: "open" | "in_progress" | "done";
  assignee?: string;
  url: string;
}
export const mockIssuePool: Record<string, MockIssue[]> = {
  cm1: [
    {
      provider: "jira",
      key: "ACME-22",
      title: "Migration dry-run on staging",
      status: "in_progress",
      assignee: "Noah Williams",
      url: "https://jira.test/ACME-22",
    },
    {
      provider: "jira",
      key: "ACME-23",
      title: "DR plan review",
      status: "open",
      assignee: "Tom Becker",
      url: "https://jira.test/ACME-23",
    },
    {
      provider: "jira",
      key: "ACME-24",
      title: "Cutover window",
      status: "open",
      assignee: "Sarah Chen",
      url: "https://jira.test/ACME-24",
    },
    {
      provider: "jira",
      key: "ACME-25",
      title: "Post-cutover monitoring",
      status: "open",
      assignee: "Greg Holland",
      url: "https://jira.test/ACME-25",
    },
    {
      provider: "jira",
      key: "ACME-26",
      title: "Launch comms draft",
      status: "open",
      assignee: "Priya Shah",
      url: "https://jira.test/ACME-26",
    },
  ],
  cm2: [
    {
      provider: "linear",
      key: "NOV-11",
      title: "Sign-up flow prototype",
      status: "in_progress",
      assignee: "Marcus Rivera",
      url: "https://linear.test/NOV-11",
    },
    {
      provider: "linear",
      key: "NOV-12",
      title: "Social auth spec",
      status: "open",
      assignee: "Noah Williams",
      url: "https://linear.test/NOV-12",
    },
    {
      provider: "linear",
      key: "NOV-13",
      title: "Retry & error states",
      status: "open",
      assignee: "Marcus Rivera",
      url: "https://linear.test/NOV-13",
    },
    {
      provider: "linear",
      key: "NOV-14",
      title: "Auth API integration",
      status: "open",
      assignee: "Noah Williams",
      url: "https://linear.test/NOV-14",
    },
  ],
  cm6: [
    {
      provider: "jira",
      key: "ZNE-3",
      title: "ETL pipeline v1",
      status: "open",
      assignee: "Fatima Al-Sayed",
      url: "https://jira.test/ZNE-3",
    },
    {
      provider: "jira",
      key: "ZNE-4",
      title: "Dashboard wireframes",
      status: "in_progress",
      assignee: "Priya Shah",
      url: "https://jira.test/ZNE-4",
    },
    {
      provider: "jira",
      key: "ZNE-5",
      title: "Data warehouse provisioning",
      status: "done",
      assignee: "Fatima Al-Sayed",
      url: "https://jira.test/ZNE-5",
    },
  ],
};

export type TimesheetEntryStatus = "draft" | "submitted" | "approved" | "rejected";
export interface TimesheetEntry {
  id: string;
  employeeId: string;
  commessaId: string;
  date: string;
  hours: number;
  description: string;
  billable: boolean;
  status: TimesheetEntryStatus;
}

export interface CalendarEvent {
  id: string;
  date: string;
  startedAt: string;
  endedAt: string;
  title: string;
  attendees?: string[];
  commessaHint?: string; // commessaId or fragment to match
}
/**
 * Synthetic "Google Calendar" events spanning recent weeks.
 * Used by the AI auto-fill flow to materialize draft timesheet entries.
 */
export const mockCalendarEvents: CalendarEvent[] = [
  {
    id: "ev-100",
    date: "2026-04-13",
    startedAt: "09:00",
    endedAt: "10:00",
    title: "Migration standup",
    attendees: ["e1", "e9", "e4"],
    commessaHint: "cm1",
  },
  {
    id: "ev-101",
    date: "2026-04-13",
    startedAt: "10:00",
    endedAt: "12:00",
    title: "Cutover rehearsal",
    attendees: ["e1", "e9"],
    commessaHint: "cm1",
  },
  {
    id: "ev-102",
    date: "2026-04-13",
    startedAt: "14:00",
    endedAt: "15:00",
    title: "Mobile onboarding spec review",
    attendees: ["e1", "e7"],
    commessaHint: "cm2",
  },
  {
    id: "ev-103",
    date: "2026-04-13",
    startedAt: "15:00",
    endedAt: "17:00",
    title: "Deep work — API contract",
    attendees: ["e1"],
    commessaHint: "cm2",
  },
  {
    id: "ev-110",
    date: "2026-04-14",
    startedAt: "09:00",
    endedAt: "09:30",
    title: "All-hands",
    attendees: ["e1", "e3"],
    commessaHint: "cm4",
  },
  {
    id: "ev-111",
    date: "2026-04-14",
    startedAt: "09:30",
    endedAt: "12:00",
    title: "Design tokens sync",
    attendees: ["e1", "e2"],
    commessaHint: "cm3",
  },
  {
    id: "ev-112",
    date: "2026-04-14",
    startedAt: "13:00",
    endedAt: "17:00",
    title: "Migration pairing — Noah",
    attendees: ["e1", "e9"],
    commessaHint: "cm1",
  },
  {
    id: "ev-120",
    date: "2026-04-15",
    startedAt: "09:00",
    endedAt: "10:00",
    title: "Incident post-mortem",
    attendees: ["e1", "e9", "e11"],
    commessaHint: "cm1",
  },
  {
    id: "ev-121",
    date: "2026-04-15",
    startedAt: "10:00",
    endedAt: "12:00",
    title: "Interview — senior engineer",
    attendees: ["e1", "e3", "e8"],
    commessaHint: "cm4",
  },
  {
    id: "ev-122",
    date: "2026-04-15",
    startedAt: "14:00",
    endedAt: "16:00",
    title: "Analytics ingestion spike",
    attendees: ["e1", "e10"],
    commessaHint: "cm6",
  },
  {
    id: "ev-130",
    date: "2026-04-16",
    startedAt: "09:00",
    endedAt: "11:00",
    title: "Platform roadmap refinement",
    attendees: ["e1", "e7", "e9"],
    commessaHint: "cm1",
  },
  {
    id: "ev-131",
    date: "2026-04-16",
    startedAt: "11:00",
    endedAt: "12:30",
    title: "Design critique",
    attendees: ["e1", "e2"],
    commessaHint: "cm3",
  },
  {
    id: "ev-132",
    date: "2026-04-16",
    startedAt: "14:00",
    endedAt: "17:00",
    title: "Mobile onboarding API implementation",
    attendees: ["e1", "e9"],
    commessaHint: "cm2",
  },
  {
    id: "ev-140",
    date: "2026-04-17",
    startedAt: "09:30",
    endedAt: "10:30",
    title: "Sprint review",
    attendees: ["e1", "e3", "e7"],
    commessaHint: "cm4",
  },
  {
    id: "ev-141",
    date: "2026-04-17",
    startedAt: "10:30",
    endedAt: "12:30",
    title: "Retro + planning",
    attendees: ["e1", "e3"],
    commessaHint: "cm4",
  },
  {
    id: "ev-142",
    date: "2026-04-17",
    startedAt: "14:00",
    endedAt: "17:00",
    title: "Migration cutover dry-run",
    attendees: ["e1", "e9", "e4"],
    commessaHint: "cm1",
  },
];

export interface TimesheetTemplate {
  id: string;
  name: string;
  commessaId: string;
  hours: number;
  description: string;
  billable: boolean;
  icon?: string;
}
export const timesheetTemplatesSeed: TimesheetTemplate[] = [
  {
    id: "tt1",
    name: "Deep work — migration",
    commessaId: "cm1",
    hours: 8,
    description: "Migration workstream",
    billable: true,
    icon: "🛠",
  },
  {
    id: "tt2",
    name: "Mobile API pairing",
    commessaId: "cm2",
    hours: 4,
    description: "Mobile onboarding API pairing",
    billable: true,
    icon: "📱",
  },
  {
    id: "tt3",
    name: "Design system audit",
    commessaId: "cm3",
    hours: 4,
    description: "Design tokens + component audit",
    billable: true,
    icon: "🎨",
  },
  {
    id: "tt4",
    name: "Internal / HR sync",
    commessaId: "cm4",
    hours: 1,
    description: "HR + internal coordination",
    billable: false,
    icon: "💬",
  },
  {
    id: "tt5",
    name: "Full day · analytics",
    commessaId: "cm6",
    hours: 8,
    description: "Analytics dashboards",
    billable: true,
    icon: "📊",
  },
];

export const timesheetEntries: TimesheetEntry[] = [
  // Historical seed
  {
    id: "t1",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-14",
    hours: 7.5,
    description: "API schema review + sprint planning",
    billable: true,
    status: "approved",
  },
  {
    id: "t2",
    employeeId: "e1",
    commessaId: "cm4",
    date: "2026-04-14",
    hours: 0.5,
    description: "1:1 with Aisha",
    billable: false,
    status: "approved",
  },
  {
    id: "t3",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-15",
    hours: 8,
    description: "Migration dry-run on staging",
    billable: true,
    status: "submitted",
  },
  {
    id: "t4",
    employeeId: "e1",
    commessaId: "cm2",
    date: "2026-04-16",
    hours: 4,
    description: "Mobile sign-up flow spec",
    billable: true,
    status: "submitted",
  },
  {
    id: "t5",
    employeeId: "e1",
    commessaId: "cm3",
    date: "2026-04-16",
    hours: 4,
    description: "Token audit for v2",
    billable: true,
    status: "draft",
  },
  {
    id: "t6",
    employeeId: "e1",
    commessaId: "cm6",
    date: "2026-04-17",
    hours: 6,
    description: "Dashboard wireframes review",
    billable: true,
    status: "draft",
  },

  // Current month (April 2026) — mix of filled / partial / missing days
  {
    id: "t10",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-01",
    hours: 8,
    description: "Quarter kickoff + architecture review",
    billable: true,
    status: "approved",
  },
  {
    id: "t11",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-02",
    hours: 7,
    description: "Migration rollback plan",
    billable: true,
    status: "approved",
  },
  {
    id: "t12",
    employeeId: "e1",
    commessaId: "cm4",
    date: "2026-04-02",
    hours: 1,
    description: "HR weekly sync",
    billable: false,
    status: "approved",
  },
  {
    id: "t13",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-03",
    hours: 5,
    description: "Staging smoke tests",
    billable: true,
    status: "approved",
  }, // partial
  {
    id: "t14",
    employeeId: "e1",
    commessaId: "cm2",
    date: "2026-04-06",
    hours: 8,
    description: "Mobile onboarding API contract",
    billable: true,
    status: "submitted",
  },
  {
    id: "t15",
    employeeId: "e1",
    commessaId: "cm3",
    date: "2026-04-07",
    hours: 4,
    description: "Design tokens audit",
    billable: true,
    status: "submitted",
  },
  {
    id: "t16",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-07",
    hours: 4,
    description: "Pairing with Noah on migration",
    billable: true,
    status: "submitted",
  },
  {
    id: "t17",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-08",
    hours: 8,
    description: "Cutover dry-run",
    billable: true,
    status: "submitted",
  },
  {
    id: "t18",
    employeeId: "e1",
    commessaId: "cm6",
    date: "2026-04-13",
    hours: 6,
    description: "Analytics ingestion spike",
    billable: true,
    status: "draft",
  }, // partial
  {
    id: "t19",
    employeeId: "e1",
    commessaId: "cm2",
    date: "2026-04-14",
    hours: 8,
    description: "Mobile auth flow implementation",
    billable: true,
    status: "draft",
  },
  {
    id: "t20",
    employeeId: "e1",
    commessaId: "cm1",
    date: "2026-04-15",
    hours: 3,
    description: "Incident post-mortem",
    billable: true,
    status: "draft",
  }, // partial
  {
    id: "t21",
    employeeId: "e1",
    commessaId: "cm4",
    date: "2026-04-15",
    hours: 2,
    description: "Interview loop — senior eng",
    billable: false,
    status: "draft",
  },
];

export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  country: "IT" | "US" | "UK" | "DE" | "all";
}
export const holidaysSeed: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day", country: "all" },
  { date: "2026-01-06", name: "Epiphany", country: "IT" },
  { date: "2026-04-06", name: "Easter Monday", country: "IT" },
  { date: "2026-04-25", name: "Liberation Day", country: "IT" },
  { date: "2026-05-01", name: "Labour Day", country: "all" },
  { date: "2026-05-25", name: "Memorial Day", country: "US" },
  { date: "2026-06-02", name: "Republic Day", country: "IT" },
  { date: "2026-07-04", name: "Independence Day", country: "US" },
  { date: "2026-08-15", name: "Ferragosto", country: "IT" },
  { date: "2026-12-25", name: "Christmas Day", country: "all" },
  { date: "2026-12-26", name: "St. Stephen's Day", country: "IT" },
];

// ── Growth module ──────────────────────────────────────────────────────

export type GoalStatus = "active" | "hit" | "missed";
export interface Goal {
  id: string;
  employeeId: string;
  quarter: string; // "Q2 2026"
  title: string;
  metric: string; // "Reduce p95 API latency"
  target: string; // "< 200ms"
  progress: number; // 0..100
  status: GoalStatus;
  tag: "impact" | "craft" | "teamwork" | "courage" | "kindness";
  createdAt: string;
  dueAt: string;
}

export type ChallengeStatus = "open" | "succeeded" | "failed";
export interface Challenge {
  id: string;
  employeeId: string;
  assignedBy: string; // employeeId
  title: string;
  description: string;
  difficulty: 1 | 2 | 3; // 1 = easy, 3 = hard
  status: ChallengeStatus;
  createdAt: string;
  dueAt: string;
  xpReward: number;
}

export interface ActionItem {
  text: string;
  done: boolean;
}
export interface OneOnOne {
  id: string;
  employeeId: string; // subject
  managerId: string;
  date: string;
  agenda: string[];
  notes: string;
  actionItems: ActionItem[];
}

export type NoteTone = "praise" | "observation" | "concern";
export interface GrowthNote {
  id: string;
  employeeId: string;
  authorId: string;
  body: string;
  tone: NoteTone;
  createdAt: string;
  privateNote?: boolean;
}

export const goalsSeed: Goal[] = [
  {
    id: "g1",
    employeeId: "e1",
    quarter: "Q2 2026",
    title: "Ship migration GA",
    metric: "Zero downtime cutover",
    target: "0 incidents",
    progress: 78,
    status: "active",
    tag: "impact",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
  {
    id: "g2",
    employeeId: "e1",
    quarter: "Q2 2026",
    title: "Mentor 2 junior engineers",
    metric: "Weekly pairing sessions",
    target: "≥ 12 sessions",
    progress: 60,
    status: "active",
    tag: "kindness",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
  {
    id: "g3",
    employeeId: "e1",
    quarter: "Q1 2026",
    title: "Design system v2 adoption",
    metric: "% components migrated",
    target: "≥ 80%",
    progress: 100,
    status: "hit",
    tag: "craft",
    createdAt: "2026-01-08",
    dueAt: "2026-03-31",
  },
  {
    id: "g4",
    employeeId: "e2",
    quarter: "Q2 2026",
    title: "Mobile onboarding delivery",
    metric: "Time-to-first-value",
    target: "< 3 min",
    progress: 45,
    status: "active",
    tag: "craft",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
  {
    id: "g5",
    employeeId: "e4",
    quarter: "Q1 2026",
    title: "Service reliability",
    metric: "% uptime",
    target: "≥ 99.95%",
    progress: 92,
    status: "missed",
    tag: "impact",
    createdAt: "2026-01-08",
    dueAt: "2026-03-31",
  },
  {
    id: "g6",
    employeeId: "e9",
    quarter: "Q2 2026",
    title: "Become cutover lead",
    metric: "Own 2 commesse rollouts",
    target: "2 rollouts",
    progress: 30,
    status: "active",
    tag: "courage",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
  {
    id: "g7",
    employeeId: "e7",
    quarter: "Q2 2026",
    title: "Launch analytics dashboard",
    metric: "Dashboards live",
    target: "≥ 5",
    progress: 40,
    status: "active",
    tag: "impact",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
  {
    id: "g8",
    employeeId: "e3",
    quarter: "Q2 2026",
    title: "Cut onboarding to 3 days",
    metric: "New-hire time-to-productive",
    target: "≤ 3 days",
    progress: 55,
    status: "active",
    tag: "teamwork",
    createdAt: "2026-03-20",
    dueAt: "2026-06-30",
  },
];

export const challengesSeed: Challenge[] = [
  {
    id: "ch1",
    employeeId: "e1",
    assignedBy: "e3",
    title: "Ship blameless post-mortem template",
    description: "Author + roll out across Engineering.",
    difficulty: 2,
    status: "succeeded",
    xpReward: 100,
    createdAt: "2026-02-10",
    dueAt: "2026-03-15",
  },
  {
    id: "ch2",
    employeeId: "e1",
    assignedBy: "e3",
    title: "Present cutover plan to exec team",
    description: "30-min readout with Q&A.",
    difficulty: 3,
    status: "open",
    xpReward: 150,
    createdAt: "2026-04-01",
    dueAt: "2026-05-08",
  },
  {
    id: "ch3",
    employeeId: "e2",
    assignedBy: "e3",
    title: "Run design critique for recruiting",
    description: "Host weekly critiques for 4 weeks.",
    difficulty: 2,
    status: "succeeded",
    xpReward: 100,
    createdAt: "2026-02-15",
    dueAt: "2026-03-20",
  },
  {
    id: "ch4",
    employeeId: "e9",
    assignedBy: "e1",
    title: "Own the migration cutover checklist",
    description: "Author, review with ops, drive the run book.",
    difficulty: 2,
    status: "open",
    xpReward: 100,
    createdAt: "2026-04-05",
    dueAt: "2026-05-15",
  },
  {
    id: "ch5",
    employeeId: "e4",
    assignedBy: "e1",
    title: "Reduce p95 API latency by 30%",
    description: "Ship with a load-test dashboard.",
    difficulty: 3,
    status: "failed",
    xpReward: 150,
    createdAt: "2026-01-20",
    dueAt: "2026-03-15",
  },
  {
    id: "ch6",
    employeeId: "e7",
    assignedBy: "e3",
    title: "Draft Q3 product roadmap",
    description: "Collect inputs, publish, drive review.",
    difficulty: 2,
    status: "open",
    xpReward: 100,
    createdAt: "2026-04-02",
    dueAt: "2026-05-20",
  },
];

export const oneOnOnesSeed: OneOnOne[] = [
  {
    id: "o1",
    employeeId: "e1",
    managerId: "e3",
    date: "2026-04-10",
    agenda: ["Migration risk review", "Mentoring load", "Career goals check-in"],
    notes:
      "Solid progress on the rebuild. Comfortable with the pace. Wants more architecture influence.",
    actionItems: [
      { text: "Draft architecture review cadence", done: true },
      { text: "Pair Sarah with Noah on deploy story", done: false },
    ],
  },
  {
    id: "o2",
    employeeId: "e1",
    managerId: "e3",
    date: "2026-03-27",
    agenda: ["Sprint recap", "Hiring pipeline"],
    notes: "Strong demo. Interview loop needs calibration — inconsistent scorecards.",
    actionItems: [
      { text: "Schedule calibration session", done: true },
      { text: "Write the senior-engineer rubric", done: true },
    ],
  },
  {
    id: "o3",
    employeeId: "e2",
    managerId: "e3",
    date: "2026-04-08",
    agenda: ["Design system adoption", "Brand refresh brief"],
    notes: "Energized by the v2 rollout. Wants more time for brand work.",
    actionItems: [{ text: "Carve 20% time for brand", done: false }],
  },
  {
    id: "o4",
    employeeId: "e9",
    managerId: "e1",
    date: "2026-04-09",
    agenda: ["Deep-work balance", "Cutover ownership"],
    notes: "Focus sessions are landing. Stretch goal: take the lead on the next cutover.",
    actionItems: [{ text: "Assign cutover run book", done: true }],
  },
];

// ── Seasonal (weekly / monthly / yearly) team challenges ──────────────
export type SeasonalPeriod = "weekly" | "monthly" | "yearly";
export interface SeasonalChallenge {
  id: string;
  period: SeasonalPeriod;
  title: string;
  description: string;
  emoji: string;
  xpReward: number;
  startDate: string;
  endDate: string;
  /** Participants who've contributed progress toward this challenge. */
  participants: { employeeId: string; progress: number }[];
}

export const seasonalChallengesSeed: SeasonalChallenge[] = [
  {
    id: "sc-week-1",
    period: "weekly",
    title: "Shipping Sprint",
    description: "Most XP earned this week wins the badge. Resets Monday.",
    emoji: "🚀",
    xpReward: 200,
    startDate: "2026-04-13",
    endDate: "2026-04-19",
    participants: [
      { employeeId: "e1", progress: 145 },
      { employeeId: "e9", progress: 130 },
      { employeeId: "e2", progress: 95 },
      { employeeId: "e7", progress: 80 },
      { employeeId: "e10", progress: 55 },
    ],
  },
  {
    id: "sc-week-2",
    period: "weekly",
    title: "Kudos Cascade",
    description: "Give 3+ kudos this week to unlock a team booster.",
    emoji: "💐",
    xpReward: 80,
    startDate: "2026-04-13",
    endDate: "2026-04-19",
    participants: [
      { employeeId: "e3", progress: 4 },
      { employeeId: "e1", progress: 3 },
      { employeeId: "e7", progress: 2 },
    ],
  },
  {
    id: "sc-month-1",
    period: "monthly",
    title: "April Momentum",
    description: "Accumulate 500 XP in the month to unlock the Momentum badge.",
    emoji: "🔥",
    xpReward: 400,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    participants: [
      { employeeId: "e1", progress: 430 },
      { employeeId: "e9", progress: 380 },
      { employeeId: "e2", progress: 280 },
      { employeeId: "e7", progress: 240 },
      { employeeId: "e10", progress: 190 },
      { employeeId: "e3", progress: 160 },
      { employeeId: "e4", progress: 130 },
    ],
  },
  {
    id: "sc-month-2",
    period: "monthly",
    title: "Focus Forty",
    description: "Log 40 hours of deep-work focus sessions this month.",
    emoji: "🎯",
    xpReward: 300,
    startDate: "2026-04-01",
    endDate: "2026-04-30",
    participants: [
      { employeeId: "e9", progress: 28 },
      { employeeId: "e1", progress: 24 },
      { employeeId: "e2", progress: 18 },
      { employeeId: "e7", progress: 12 },
    ],
  },
  {
    id: "sc-year-1",
    period: "yearly",
    title: "Year of Craft",
    description: "Ship 10 craft-tagged kudos recipients + 3 hit goals. Annual trophy at EOY.",
    emoji: "🏆",
    xpReward: 2000,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    participants: [
      { employeeId: "e2", progress: 68 },
      { employeeId: "e1", progress: 61 },
      { employeeId: "e9", progress: 54 },
      { employeeId: "e7", progress: 48 },
      { employeeId: "e10", progress: 36 },
      { employeeId: "e3", progress: 28 },
    ],
  },
  {
    id: "sc-year-2",
    period: "yearly",
    title: "Mentor of the Year",
    description: "Give 50+ kudos and log 10+ 1:1s in 2026.",
    emoji: "🧭",
    xpReward: 1500,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    participants: [
      { employeeId: "e3", progress: 42 },
      { employeeId: "e1", progress: 38 },
      { employeeId: "e7", progress: 24 },
    ],
  },
];

export const growthNotesSeed: GrowthNote[] = [
  {
    id: "gn1",
    employeeId: "e1",
    authorId: "e3",
    body: "Exceptional judgment under pressure during the Jan incident — made the right call to pause rollout.",
    tone: "praise",
    createdAt: "2026-01-22",
  },
  {
    id: "gn2",
    employeeId: "e1",
    authorId: "e3",
    body: "Tends to absorb too much work — watch for burnout signals and delegate.",
    tone: "observation",
    createdAt: "2026-03-12",
  },
  {
    id: "gn3",
    employeeId: "e2",
    authorId: "e3",
    body: "Design critique format has lifted the whole team's quality bar.",
    tone: "praise",
    createdAt: "2026-03-30",
  },
  {
    id: "gn4",
    employeeId: "e4",
    authorId: "e1",
    body: "Missed the Q1 reliability target — discuss realistic scope for Q2.",
    tone: "concern",
    createdAt: "2026-04-02",
  },
  {
    id: "gn5",
    employeeId: "e9",
    authorId: "e1",
    body: "Pairing with Noah is producing real velocity gains on migration.",
    tone: "praise",
    createdAt: "2026-04-09",
  },
];

export const plugins = [
  {
    id: "pg1",
    name: "Slack",
    desc: "Sync notifications and approvals to Slack channels.",
    category: "Communication",
    installed: true,
    icon: "💬",
  },
  {
    id: "pg2",
    name: "Google Calendar",
    desc: "Two-way sync for leaves and meetings.",
    category: "Productivity",
    installed: true,
    icon: "📅",
  },
  {
    id: "pg3",
    name: "QuickBooks",
    desc: "Push payroll journal entries automatically.",
    category: "Accounting",
    installed: false,
    icon: "📊",
  },
  {
    id: "pg4",
    name: "DocuSign",
    desc: "Send contracts and offers for e-signature.",
    category: "Documents",
    installed: true,
    icon: "✍️",
  },
  {
    id: "pg5",
    name: "Greenhouse",
    desc: "Mirror candidate pipeline from Greenhouse ATS.",
    category: "Recruiting",
    installed: false,
    icon: "🌱",
  },
  {
    id: "pg6",
    name: "Stripe Payouts",
    desc: "Pay contractors via Stripe Connect.",
    category: "Payments",
    installed: false,
    icon: "💳",
  },
  {
    id: "pg7",
    name: "Okta SSO",
    desc: "Enterprise single sign-on with SCIM.",
    category: "Security",
    installed: true,
    icon: "🔐",
  },
  {
    id: "pg8",
    name: "Zapier",
    desc: "Connect to 5,000+ apps via Zapier.",
    category: "Automation",
    installed: false,
    icon: "⚡",
  },
];

// ── Google Calendar sync (mock) ─────────────────────────────────────────
// Distinct from the AI-timesheet `CalendarEvent` above: this models fully-fledged
// calendar entries surfaced in the /calendar page once a Google account is linked.

export type GCalEventStatus = "confirmed" | "tentative" | "cancelled";
export type GCalEventSource = "google" | "pulse";

export interface GCalEvent {
  id: string;
  title: string;
  /** ISO datetime — event start. */
  start: string;
  /** ISO datetime — event end. */
  end: string;
  /** Employee ids — used to render attendee avatars. */
  attendees: string[];
  location?: string;
  commessaId?: string;
  source: GCalEventSource;
  status: GCalEventStatus;
  description?: string;
}

/**
 * Seeded events around today (2026-04-20). A few "pulse"-origin entries live here
 * too so the two-way sync UI has something to show off the distinction.
 */
export const gcalEventsSeed: GCalEvent[] = [
  {
    id: "gc-1",
    title: "Daily standup",
    start: "2026-04-20T09:30:00",
    end: "2026-04-20T10:00:00",
    attendees: ["e1", "e2", "e3", "e7"],
    location: "Meet — /standup-platform",
    commessaId: "cm1",
    source: "google",
    status: "confirmed",
    description: "Quick round-robin on sprint progress.",
  },
  {
    id: "gc-2",
    title: "Design review — Acme",
    start: "2026-04-20T14:00:00",
    end: "2026-04-20T15:00:00",
    attendees: ["e1", "e2"],
    location: "Room Nebula",
    commessaId: "cm1",
    source: "google",
    status: "confirmed",
  },
  {
    id: "gc-3",
    title: "1:1 with manager",
    start: "2026-04-21T11:00:00",
    end: "2026-04-21T11:30:00",
    attendees: ["e1"],
    source: "google",
    status: "confirmed",
    description: "Career check-in.",
  },
  {
    id: "gc-4",
    title: "Sprint planning",
    start: "2026-04-22T15:00:00",
    end: "2026-04-22T16:30:00",
    attendees: ["e1", "e2", "e3", "e7", "e4"],
    commessaId: "cm2",
    source: "google",
    status: "confirmed",
  },
  {
    id: "gc-5",
    title: "Client call — Nova Retail",
    start: "2026-04-23T10:00:00",
    end: "2026-04-23T11:00:00",
    attendees: ["e7", "e1"],
    location: "Meet — /nova-weekly",
    commessaId: "cm2",
    source: "google",
    status: "confirmed",
  },
  {
    id: "gc-6",
    title: "Focus block — design system",
    start: "2026-04-23T14:00:00",
    end: "2026-04-23T17:00:00",
    attendees: ["e2"],
    commessaId: "cm3",
    source: "pulse",
    status: "tentative",
    description: "Auto-created from Focus Mode.",
  },
  {
    id: "gc-7",
    title: "Team retro",
    start: "2026-04-24T16:00:00",
    end: "2026-04-24T17:00:00",
    attendees: ["e1", "e2", "e3", "e4", "e7"],
    source: "google",
    status: "confirmed",
  },
  {
    id: "gc-8",
    title: "Kickoff — new commessa",
    start: "2026-04-27T09:00:00",
    end: "2026-04-27T10:30:00",
    attendees: ["e1", "e2", "e7"],
    location: "Room Polaris",
    source: "google",
    status: "tentative",
  },
];
