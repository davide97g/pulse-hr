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
  salary: number;
  phone: string;
  employmentType: "Full-time" | "Part-time" | "Contractor";
}

const colors = [
  "oklch(0.7 0.15 30)", "oklch(0.7 0.15 80)", "oklch(0.65 0.15 155)",
  "oklch(0.6 0.16 220)", "oklch(0.6 0.18 280)", "oklch(0.65 0.18 340)",
  "oklch(0.7 0.13 110)", "oklch(0.6 0.16 195)",
];

const initials = (n: string) => n.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();

const raw: Omit<Employee, "avatarColor" | "initials">[] = [
  { id: "e1", name: "Sarah Chen", email: "sarah.chen@acme.co", role: "Head of Engineering", department: "Engineering", location: "San Francisco", status: "active", joinDate: "2021-03-14", salary: 185000, phone: "+1 415 555 0142", employmentType: "Full-time" },
  { id: "e2", name: "Marcus Rivera", email: "marcus.r@acme.co", role: "Senior Designer", department: "Design", manager: "Sarah Chen", location: "Remote — Mexico City", status: "remote", joinDate: "2022-06-01", salary: 112000, phone: "+52 55 5555 0188", employmentType: "Full-time" },
  { id: "e3", name: "Aisha Patel", email: "aisha.p@acme.co", role: "HR Business Partner", department: "People Ops", location: "London", status: "active", joinDate: "2020-11-09", salary: 98000, phone: "+44 20 7946 0123", employmentType: "Full-time" },
  { id: "e4", name: "Tom Becker", email: "tom.b@acme.co", role: "Backend Engineer", department: "Engineering", manager: "Sarah Chen", location: "Berlin", status: "on_leave", joinDate: "2023-01-23", salary: 89000, phone: "+49 30 5555 0167", employmentType: "Full-time" },
  { id: "e5", name: "Lina Rossi", email: "lina.r@acme.co", role: "Payroll Specialist", department: "Finance", location: "Milan", status: "active", joinDate: "2019-07-15", salary: 76000, phone: "+39 02 5555 0199", employmentType: "Full-time" },
  { id: "e6", name: "David Park", email: "david.p@acme.co", role: "Account Executive", department: "Sales", location: "New York", status: "active", joinDate: "2022-09-30", salary: 95000, phone: "+1 212 555 0145", employmentType: "Full-time" },
  { id: "e7", name: "Yuki Tanaka", email: "yuki.t@acme.co", role: "Product Manager", department: "Product", location: "Tokyo", status: "active", joinDate: "2021-12-02", salary: 132000, phone: "+81 3 5555 0177", employmentType: "Full-time" },
  { id: "e8", name: "Olivia Brown", email: "olivia.b@acme.co", role: "Recruiter", department: "People Ops", manager: "Aisha Patel", location: "Dublin", status: "active", joinDate: "2023-04-18", salary: 68000, phone: "+353 1 555 0136", employmentType: "Full-time" },
  { id: "e9", name: "Noah Williams", email: "noah.w@acme.co", role: "Frontend Engineer", department: "Engineering", manager: "Sarah Chen", location: "Toronto", status: "remote", joinDate: "2024-02-12", salary: 84000, phone: "+1 416 555 0102", employmentType: "Contractor" },
  { id: "e10", name: "Fatima Al-Sayed", email: "fatima.a@acme.co", role: "Data Analyst", department: "Product", manager: "Yuki Tanaka", location: "Dubai", status: "active", joinDate: "2023-08-05", salary: 78000, phone: "+971 4 555 0124", employmentType: "Full-time" },
  { id: "e11", name: "Greg Holland", email: "greg.h@acme.co", role: "DevOps Engineer", department: "Engineering", manager: "Sarah Chen", location: "Amsterdam", status: "offboarding", joinDate: "2020-05-20", salary: 102000, phone: "+31 20 555 0179", employmentType: "Full-time" },
  { id: "e12", name: "Priya Shah", email: "priya.s@acme.co", role: "Marketing Lead", department: "Marketing", location: "Mumbai", status: "active", joinDate: "2022-01-10", salary: 88000, phone: "+91 22 5555 0143", employmentType: "Full-time" },
];

export const employees: Employee[] = raw.map((e, i) => ({
  ...e,
  initials: initials(e.name),
  avatarColor: colors[i % colors.length],
}));

export const employeeById = (id: string) => employees.find(e => e.id === id);

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
export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Vacation" | "Sick" | "Personal" | "Parental";
  from: string;
  to: string;
  days: number;
  status: LeaveStatus;
  reason: string;
  submittedAt: string;
}

export const leaveRequests: LeaveRequest[] = [
  { id: "l1", employeeId: "e2", type: "Vacation", from: "2025-04-22", to: "2025-04-28", days: 5, status: "pending", reason: "Family trip", submittedAt: "2025-04-15" },
  { id: "l2", employeeId: "e4", type: "Sick", from: "2025-04-17", to: "2025-04-19", days: 3, status: "approved", reason: "Flu", submittedAt: "2025-04-16" },
  { id: "l3", employeeId: "e9", type: "Personal", from: "2025-05-02", to: "2025-05-02", days: 1, status: "pending", reason: "Appointment", submittedAt: "2025-04-14" },
  { id: "l4", employeeId: "e6", type: "Vacation", from: "2025-05-10", to: "2025-05-17", days: 6, status: "pending", reason: "Honeymoon", submittedAt: "2025-04-12" },
  { id: "l5", employeeId: "e10", type: "Parental", from: "2025-06-01", to: "2025-08-30", days: 64, status: "approved", reason: "Parental leave", submittedAt: "2025-03-20" },
  { id: "l6", employeeId: "e8", type: "Vacation", from: "2025-04-25", to: "2025-04-26", days: 2, status: "rejected", reason: "Conflict with hiring sprint", submittedAt: "2025-04-10" },
  // Current-month leave for the signed-in user (e1) so calendar shows live states
  { id: "l7", employeeId: "e1", type: "Sick",     from: "2026-04-09", to: "2026-04-10", days: 2, status: "approved", reason: "Flu",                   submittedAt: "2026-04-09" },
  { id: "l8", employeeId: "e1", type: "Vacation", from: "2026-04-20", to: "2026-04-24", days: 5, status: "approved", reason: "Spring break",          submittedAt: "2026-03-25" },
  { id: "l9", employeeId: "e1", type: "Personal", from: "2026-04-30", to: "2026-04-30", days: 1, status: "approved", reason: "Family appointment",    submittedAt: "2026-04-16" },
];

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

export const expenses: Expense[] = [
  { id: "x1", employeeId: "e6", description: "Client dinner — Acme Corp", category: "Meals", amount: 184.50, currency: "USD", date: "2025-04-12", status: "pending" },
  { id: "x2", employeeId: "e2", description: "Figma annual license", category: "Software", amount: 180, currency: "USD", date: "2025-04-08", status: "approved" },
  { id: "x3", employeeId: "e7", description: "Flight TYO → SFO", category: "Travel", amount: 1240, currency: "USD", date: "2025-04-02", status: "reimbursed" },
  { id: "x4", employeeId: "e9", description: "Standing desk", category: "Equipment", amount: 620, currency: "USD", date: "2025-04-14", status: "pending" },
  { id: "x5", employeeId: "e3", description: "Team offsite — London", category: "Travel", amount: 890, currency: "GBP", date: "2025-04-05", status: "approved" },
];

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
  ["Emma Wilson", "Senior Engineer"], ["James Liu", "Senior Engineer"],
  ["Sofia Garcia", "Product Designer"], ["Raj Mehta", "Senior Engineer"],
  ["Hannah Kim", "Product Designer"], ["Leo Martin", "Account Executive"],
  ["Zoe Adams", "Product Manager"], ["Kai Yamamoto", "Account Executive"],
];
const stages: Candidate["stage"][] = ["Applied","Screen","Interview","Offer","Hired"];
export const candidates: Candidate[] = cnames.map(([n,r], i) => ({
  id: `c${i+1}`, name: n, role: r,
  stage: stages[i % 5], initials: initials(n),
  avatarColor: colors[i % colors.length],
  appliedDate: `2025-04-${String(14-i).padStart(2,"0")}`,
  rating: 3 + ((i*7) % 3),
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
  { id: "p1", period: "April 2025", status: "scheduled", employees: 12, gross: 124500, net: 89200, date: "2025-04-30" },
  { id: "p2", period: "March 2025", status: "completed", employees: 12, gross: 122100, net: 87800, date: "2025-03-31" },
  { id: "p3", period: "February 2025", status: "completed", employees: 11, gross: 115400, net: 83100, date: "2025-02-28" },
  { id: "p4", period: "January 2025", status: "completed", employees: 11, gross: 114800, net: 82700, date: "2025-01-31" },
];

export type Vibe = "amazing" | "good" | "meh" | "rough" | "awful";
export interface PulseEntry {
  id: string;
  date: string;        // YYYY-MM-DD
  vibe: Vibe;
  note?: string;       // anonymous
  tag?: "workload" | "team" | "tools" | "growth" | "other";
}
const VIBE_ROT: Vibe[] = ["amazing", "good", "good", "meh", "rough", "good", "good", "amazing", "good", "meh"];
export const pulseEntries: PulseEntry[] = Array.from({ length: 42 }).map((_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (42 - i));
  return {
    id: `pl-${i}`,
    date: d.toISOString().slice(0, 10),
    vibe: VIBE_ROT[(i * 7) % VIBE_ROT.length],
    note: i % 5 === 0 ? ["Great sprint review today","Too many meetings this week","Learned something new","Feeling stuck on migration","Shipped the thing!"][i % 5] : undefined,
    tag: (["workload","team","tools","growth","other"] as const)[i % 5],
  };
});

export interface Kudo {
  id: string;
  fromId: string;
  toId: string;
  amount: number;   // coins
  message: string;
  tag: "teamwork" | "craft" | "impact" | "courage" | "kindness";
  date: string;
}
export const kudosSeed: Kudo[] = [
  { id: "kd1", fromId: "e3", toId: "e2", amount: 25, tag: "craft",    date: "2025-04-15", message: "The new onboarding flow is chef's kiss. Polished every single state." },
  { id: "kd2", fromId: "e1", toId: "e9", amount: 50, tag: "impact",   date: "2025-04-14", message: "Shipped the migration 2 days ahead of schedule. Huge." },
  { id: "kd3", fromId: "e7", toId: "e4", amount: 10, tag: "kindness", date: "2025-04-13", message: "Jumped in on my on-call even though it wasn't your rotation." },
  { id: "kd4", fromId: "e6", toId: "e10", amount: 30, tag: "teamwork", date: "2025-04-12", message: "Your Looker dashboards unlocked the whole pipeline conversation." },
  { id: "kd5", fromId: "e2", toId: "e3", amount: 15, tag: "kindness", date: "2025-04-11", message: "Took time to walk me through the leave policy. Appreciated." },
  { id: "kd6", fromId: "e1", toId: "e7", amount: 20, tag: "courage",  date: "2025-04-09", message: "Saying 'no, we shouldn't ship that yet' took guts. Right call." },
  { id: "kd7", fromId: "e9", toId: "e2", amount: 10, tag: "craft",    date: "2025-04-08", message: "The microcopy rewrite made the whole flow feel 10× better." },
  { id: "kd8", fromId: "e10", toId: "e1", amount: 40, tag: "impact",  date: "2025-04-07", message: "Your pairing session unblocked me for the rest of the sprint." },
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
  { id: "fs1", employeeId: "e1", date: "2025-04-17", startedAt: "09:00", durationMin: 90, commessaId: "cm1", meetingsDeclined: 2, note: "Migration script v3" },
  { id: "fs2", employeeId: "e1", date: "2025-04-17", startedAt: "14:00", durationMin: 60, commessaId: "cm1", meetingsDeclined: 1 },
  { id: "fs3", employeeId: "e1", date: "2025-04-16", startedAt: "10:00", durationMin: 90, commessaId: "cm3", meetingsDeclined: 3, note: "Design token audit" },
  { id: "fs4", employeeId: "e1", date: "2025-04-15", startedAt: "09:30", durationMin: 120, commessaId: "cm1", meetingsDeclined: 2 },
  { id: "fs5", employeeId: "e1", date: "2025-04-14", startedAt: "13:00", durationMin: 60, commessaId: "cm2", meetingsDeclined: 0 },
];

export interface CopilotSuggestion {
  id: string;
  prompt: string;
  category: "approvals" | "insights" | "admin" | "reports";
}
export const copilotSuggestions: CopilotSuggestion[] = [
  { id: "q1", prompt: "Approve all expenses under $200 from this week",             category: "approvals" },
  { id: "q2", prompt: "Who on the team has overlapping leave in May?",              category: "insights" },
  { id: "q3", prompt: "Summarize April payroll anomalies",                           category: "reports" },
  { id: "q4", prompt: "Draft a welcome email for Emma Wilson",                        category: "admin" },
  { id: "q5", prompt: "Which commesse are over budget this month?",                  category: "insights" },
  { id: "q6", prompt: "Generate a headcount report for Q2 planning",                  category: "reports" },
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
export const payslips: Payslip[] = payrollRuns.flatMap(r =>
  employees.slice(0, r.employees).map((e, i) => ({
    id: `${r.id}-${e.id}`,
    runId: r.id,
    employeeId: e.id,
    gross: Math.round(e.salary / 12),
    net: Math.round(e.salary / 12 * 0.72),
    tax: Math.round(e.salary / 12 * 0.22),
    benefits: Math.round(e.salary / 12 * 0.06),
    status: r.status === "completed" ? "paid" : r.status === "processing" ? "pending" : i % 9 === 0 ? "hold" : "pending",
  }))
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
  { id: "j1", title: "Senior Frontend Engineer", department: "Engineering", location: "Remote — EU", type: "Full-time", salary: "€80k – €110k", status: "open",  applicants: 12, posted: "2025-03-28", owner: "Sarah Chen",    description: "Ship the next generation of our platform UI with React, TanStack and Tailwind." },
  { id: "j2", title: "Product Designer",          department: "Design",      location: "Berlin",     type: "Full-time", salary: "€65k – €85k",  status: "open",  applicants: 8,  posted: "2025-04-02", owner: "Marcus Rivera", description: "Lead design system evolution and deliver polished flows for core product." },
  { id: "j3", title: "Account Executive",         department: "Sales",       location: "New York",   type: "Full-time", salary: "$90k + OTE",   status: "open",  applicants: 21, posted: "2025-04-10", owner: "David Park",    description: "Close mid-market deals and own relationships end-to-end." },
  { id: "j4", title: "Junior Recruiter",          department: "People Ops",  location: "Dublin",     type: "Full-time", salary: "€42k – €55k",  status: "draft", applicants: 0,  posted: "",           owner: "Aisha Patel",   description: "Source and screen candidates across EU engineering funnels." },
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
    id: "ow1", name: "Emma Wilson", role: "Senior Engineer", startDate: "2025-05-06", type: "onboarding",
    initials: "EW", color: "oklch(0.7 0.15 30)",
    tasks: [
      { id: "t1", label: "Send offer letter",          done: true,  owner: "Aisha Patel",  category: "Paperwork", due: "2025-04-18" },
      { id: "t2", label: "Run background check",       done: true,  owner: "Olivia Brown", category: "Paperwork", due: "2025-04-22" },
      { id: "t3", label: "Order laptop & equipment",   done: true,  owner: "IT Team",      category: "Access",    due: "2025-04-25" },
      { id: "t4", label: "Set up email & accounts",    done: false, owner: "IT Team",      category: "Access",    due: "2025-05-02" },
      { id: "t5", label: "Schedule welcome call",      done: false, owner: "Sarah Chen",   category: "People",    due: "2025-05-05" },
      { id: "t6", label: "Sign employment contract",   done: false, owner: "Emma Wilson",  category: "Paperwork", due: "2025-05-06" },
      { id: "t7", label: "Complete tax forms",         done: false, owner: "Emma Wilson",  category: "Paperwork", due: "2025-05-06" },
      { id: "t8", label: "First-week training plan",   done: false, owner: "Aisha Patel",  category: "Training",  due: "2025-05-13" },
    ],
  },
  {
    id: "ow2", name: "James Liu", role: "Senior Engineer", startDate: "2025-06-02", type: "onboarding",
    initials: "JL", color: "oklch(0.6 0.16 220)",
    tasks: [
      { id: "t1", label: "Offer accepted", done: true,  owner: "Aisha Patel",  category: "Paperwork" },
      { id: "t2", label: "Background check", done: false, owner: "Olivia Brown", category: "Paperwork" },
    ],
  },
  {
    id: "ow3", name: "Sofia Garcia", role: "Product Designer", startDate: "2025-05-19", type: "onboarding",
    initials: "SG", color: "oklch(0.65 0.18 340)",
    tasks: [
      { id: "t1", label: "Offer accepted",          done: true,  owner: "Olivia Brown", category: "Paperwork" },
      { id: "t2", label: "Background check",        done: true,  owner: "Olivia Brown", category: "Paperwork" },
      { id: "t3", label: "Order laptop",            done: true,  owner: "IT Team",      category: "Access" },
      { id: "t4", label: "Access to Figma org",     done: false, owner: "IT Team",      category: "Access" },
      { id: "t5", label: "Design onboarding brief", done: false, owner: "Marcus Rivera", category: "Training" },
    ],
  },
  {
    id: "ow4", name: "Greg Holland", role: "DevOps Engineer", startDate: "2025-04-30", type: "offboarding",
    initials: "GH", color: "oklch(0.7 0.13 110)",
    tasks: [
      { id: "t1", label: "Exit interview",        done: true,  owner: "Aisha Patel", category: "People" },
      { id: "t2", label: "Revoke production SSH", done: true,  owner: "IT Team",     category: "Access" },
      { id: "t3", label: "Return laptop",         done: false, owner: "Greg Holland", category: "Access" },
      { id: "t4", label: "Final payroll",         done: false, owner: "Lina Rossi",  category: "Paperwork" },
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
  { id: "d1", name: "Employment contract — Emma Wilson", folder: "Contracts", size: "112 KB", updated: "2d ago",  status: "pending",  owner: "Aisha Patel" },
  { id: "d2", name: "Company handbook 2025",              folder: "Policies",  size: "2.4 MB", updated: "1w ago",  status: "approved", owner: "Aisha Patel" },
  { id: "d3", name: "NDA Template",                        folder: "Templates", size: "84 KB",  updated: "2w ago",  status: "approved", owner: "Lina Rossi" },
  { id: "d4", name: "F24 — March 2025",                    folder: "Tax forms", size: "320 KB", updated: "3w ago",  status: "approved", owner: "Lina Rossi" },
  { id: "d5", name: "Remote work policy",                  folder: "Policies",  size: "180 KB", updated: "1mo ago", status: "approved", owner: "Aisha Patel" },
  { id: "d6", name: "Onboarding checklist v3",             folder: "Onboarding",size: "42 KB",  updated: "5d ago",  status: "draft",    owner: "Olivia Brown" },
  { id: "d7", name: "Expense policy 2025",                 folder: "Policies",  size: "96 KB",  updated: "1mo ago", status: "approved", owner: "Lina Rossi" },
];

export interface ApiKey { id: string; name: string; key: string; env: "prod" | "test"; createdAt: string; lastUsed: string; status: "active" | "revoked"; }
export const apiKeysSeed: ApiKey[] = [
  { id: "k1", name: "Production",  key: "pk_live_8fK2nDm2qx4f72", env: "prod", createdAt: "2025-01-14", lastUsed: "2m ago",  status: "active" },
  { id: "k2", name: "Staging",     key: "pk_test_D0pXvE9a91c",    env: "test", createdAt: "2025-03-02", lastUsed: "3h ago",  status: "active" },
];

export interface Webhook { id: string; url: string; events: string[]; status: "active" | "pending" | "paused"; deliveries: number; }
export const webhooksSeed: Webhook[] = [
  { id: "w1", url: "https://hooks.acme.co/hr/employees",   events: ["employee.created","employee.updated"], status: "active",  deliveries: 1204 },
  { id: "w2", url: "https://hooks.acme.co/hr/timesheets",  events: ["timesheet.submitted"],                 status: "active",  deliveries: 842 },
  { id: "w3", url: "https://internal.acme.co/payroll",      events: ["payroll.completed"],                   status: "pending", deliveries: 0 },
];

export interface CustomField { id: string; name: string; type: "Text" | "Select" | "Number" | "Date"; required: boolean; }
export const customFieldsSeed: CustomField[] = [
  { id: "cf1", name: "T-shirt size",         type: "Select", required: false },
  { id: "cf2", name: "Dietary preference",   type: "Text",   required: false },
  { id: "cf3", name: "Preferred pronouns",   type: "Text",   required: false },
];

export interface Role { id: string; name: string; desc: string; count: number; color: string; }
export const rolesSeed: Role[] = [
  { id: "r1", name: "Admin",      desc: "Full access to all modules and settings", count: 2,  color: "oklch(0.6 0.22 25)" },
  { id: "r2", name: "HR Manager", desc: "Manage employees, payroll, and reports",  count: 3,  color: "oklch(0.6 0.16 220)" },
  { id: "r3", name: "Manager",    desc: "Approve team requests, view team data",    count: 4,  color: "oklch(0.65 0.15 155)" },
  { id: "r4", name: "Employee",   desc: "Personal data, time, leave, expenses",     count: 12, color: "oklch(0.52 0.02 258)" },
];

export interface AuditEntry { id: string; who: string; what: string; when: string; severity: "info" | "warn" | "critical"; }
export const auditLogSeed: AuditEntry[] = [
  { id: "a1", who: "Aisha Patel",   what: "approved leave request for Tom Becker",    when: "2h ago",    severity: "info" },
  { id: "a2", who: "Lina Rossi",    what: "ran payroll for March 2025",                when: "Yesterday", severity: "info" },
  { id: "a3", who: "Alex Carter",   what: "added Emma Wilson as employee",             when: "2d ago",    severity: "info" },
  { id: "a4", who: "System",        what: "synced 12 records with QuickBooks",         when: "3d ago",    severity: "info" },
  { id: "a5", who: "Alex Carter",   what: "revoked API key pk_live_••••2a17",          when: "5d ago",    severity: "warn" },
  { id: "a6", who: "System",        what: "detected 3 failed SSO logins for e7",       when: "1w ago",    severity: "critical" },
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
  { id: "n1", title: "Leave request from Marcus Rivera", desc: "5 days vacation • Apr 22 – 28", time: "2m ago", type: "approval", unread: true },
  { id: "n2", title: "Expense over threshold", desc: "Noah Williams submitted $620 equipment", time: "1h ago", type: "alert", unread: true },
  { id: "n3", title: "Payroll run scheduled", desc: "April 2025 run will execute Apr 30", time: "3h ago", type: "info", unread: true },
  { id: "n4", title: "Tom Becker returning Monday", desc: "Sick leave ends Apr 19", time: "Yesterday", type: "info", unread: false },
  { id: "n5", title: "Onboarding task assigned", desc: "Send laptop to new hire", time: "2d ago", type: "info", unread: false },
];

export const announcements = [
  { id: "a1", author: "Aisha Patel", title: "Q2 OKRs published", body: "All teams: please review Q2 OKRs by Friday and confirm with your manager.", time: "2h ago", pinned: true },
  { id: "a2", author: "Sarah Chen", title: "All-hands moved to Thursday", body: "This week's all-hands is moved to Thursday at 4pm CET.", time: "1d ago", pinned: false },
  { id: "a3", author: "Lina Rossi", title: "Expense policy update", body: "New expense limits for travel apply starting May 1. See policy doc.", time: "3d ago", pinned: false },
];

export interface Commessa {
  id: string;
  code: string;
  name: string;
  client: string;
  color: string;
  budgetHours: number;
  burnedHours: number;
  status: "active" | "on_hold" | "closed";
  manager: string;
}

export const commesse: Commessa[] = [
  { id: "cm1", code: "ACM-2025-01", name: "Platform rebuild",     client: "Acme Corp",     color: "oklch(0.6 0.18 258)", budgetHours: 1200, burnedHours: 742, status: "active",  manager: "Sarah Chen" },
  { id: "cm2", code: "NOV-2025-07", name: "Mobile onboarding",    client: "Nova Retail",   color: "oklch(0.7 0.15 30)",  budgetHours: 480,  burnedHours: 189, status: "active",  manager: "Yuki Tanaka" },
  { id: "cm3", code: "BCO-2025-03", name: "Design system v2",     client: "Blanco Studio", color: "oklch(0.65 0.18 340)", budgetHours: 360,  burnedHours: 298, status: "active",  manager: "Marcus Rivera" },
  { id: "cm4", code: "INT-2025-00", name: "Internal — HR tooling", client: "Internal",     color: "oklch(0.65 0.15 155)", budgetHours: 200,  burnedHours: 87,  status: "active",  manager: "Aisha Patel" },
  { id: "cm5", code: "LGO-2024-12", name: "Legacy migration",     client: "Longo Group",   color: "oklch(0.7 0.13 110)",  budgetHours: 800,  burnedHours: 812, status: "on_hold", manager: "Tom Becker" },
  { id: "cm6", code: "ZNE-2025-04", name: "Analytics dashboard",  client: "Zenith Energy", color: "oklch(0.6 0.16 195)",  budgetHours: 540,  burnedHours: 120, status: "active",  manager: "Fatima Al-Sayed" },
];

export const commessaById = (id: string) => commesse.find(c => c.id === id);

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

export const timesheetEntries: TimesheetEntry[] = [
  // Historical seed
  { id: "t1",  employeeId: "e1", commessaId: "cm1", date: "2025-04-14", hours: 7.5, description: "API schema review + sprint planning", billable: true,  status: "approved" },
  { id: "t2",  employeeId: "e1", commessaId: "cm4", date: "2025-04-14", hours: 0.5, description: "1:1 with Aisha",                        billable: false, status: "approved" },
  { id: "t3",  employeeId: "e1", commessaId: "cm1", date: "2025-04-15", hours: 8,   description: "Migration dry-run on staging",           billable: true,  status: "submitted" },
  { id: "t4",  employeeId: "e1", commessaId: "cm2", date: "2025-04-16", hours: 4,   description: "Mobile sign-up flow spec",               billable: true,  status: "submitted" },
  { id: "t5",  employeeId: "e1", commessaId: "cm3", date: "2025-04-16", hours: 4,   description: "Token audit for v2",                     billable: true,  status: "draft" },
  { id: "t6",  employeeId: "e1", commessaId: "cm6", date: "2025-04-17", hours: 6,   description: "Dashboard wireframes review",            billable: true,  status: "draft" },

  // Current month (April 2026) — mix of filled / partial / missing days
  { id: "t10", employeeId: "e1", commessaId: "cm1", date: "2026-04-01", hours: 8,   description: "Quarter kickoff + architecture review",  billable: true,  status: "approved" },
  { id: "t11", employeeId: "e1", commessaId: "cm1", date: "2026-04-02", hours: 7,   description: "Migration rollback plan",                 billable: true,  status: "approved" },
  { id: "t12", employeeId: "e1", commessaId: "cm4", date: "2026-04-02", hours: 1,   description: "HR weekly sync",                          billable: false, status: "approved" },
  { id: "t13", employeeId: "e1", commessaId: "cm1", date: "2026-04-03", hours: 5,   description: "Staging smoke tests",                     billable: true,  status: "approved" }, // partial
  { id: "t14", employeeId: "e1", commessaId: "cm2", date: "2026-04-06", hours: 8,   description: "Mobile onboarding API contract",          billable: true,  status: "submitted" },
  { id: "t15", employeeId: "e1", commessaId: "cm3", date: "2026-04-07", hours: 4,   description: "Design tokens audit",                     billable: true,  status: "submitted" },
  { id: "t16", employeeId: "e1", commessaId: "cm1", date: "2026-04-07", hours: 4,   description: "Pairing with Noah on migration",          billable: true,  status: "submitted" },
  { id: "t17", employeeId: "e1", commessaId: "cm1", date: "2026-04-08", hours: 8,   description: "Cutover dry-run",                         billable: true,  status: "submitted" },
  { id: "t18", employeeId: "e1", commessaId: "cm6", date: "2026-04-13", hours: 6,   description: "Analytics ingestion spike",               billable: true,  status: "draft" }, // partial
  { id: "t19", employeeId: "e1", commessaId: "cm2", date: "2026-04-14", hours: 8,   description: "Mobile auth flow implementation",         billable: true,  status: "draft" },
  { id: "t20", employeeId: "e1", commessaId: "cm1", date: "2026-04-15", hours: 3,   description: "Incident post-mortem",                    billable: true,  status: "draft" }, // partial
  { id: "t21", employeeId: "e1", commessaId: "cm4", date: "2026-04-15", hours: 2,   description: "Interview loop — senior eng",             billable: false, status: "draft" },
];

export interface Holiday {
  date: string;      // YYYY-MM-DD
  name: string;
  country: "IT" | "US" | "UK" | "DE" | "all";
}
export const holidaysSeed: Holiday[] = [
  { date: "2026-01-01", name: "New Year's Day",        country: "all" },
  { date: "2026-01-06", name: "Epiphany",               country: "IT" },
  { date: "2026-04-06", name: "Easter Monday",          country: "IT" },
  { date: "2026-04-25", name: "Liberation Day",         country: "IT" },
  { date: "2026-05-01", name: "Labour Day",             country: "all" },
  { date: "2026-05-25", name: "Memorial Day",           country: "US" },
  { date: "2026-06-02", name: "Republic Day",           country: "IT" },
  { date: "2026-07-04", name: "Independence Day",       country: "US" },
  { date: "2026-08-15", name: "Ferragosto",             country: "IT" },
  { date: "2026-12-25", name: "Christmas Day",          country: "all" },
  { date: "2026-12-26", name: "St. Stephen's Day",      country: "IT" },
];

export const plugins = [
  { id: "pg1", name: "Slack", desc: "Sync notifications and approvals to Slack channels.", category: "Communication", installed: true, icon: "💬" },
  { id: "pg2", name: "Google Calendar", desc: "Two-way sync for leaves and meetings.", category: "Productivity", installed: true, icon: "📅" },
  { id: "pg3", name: "QuickBooks", desc: "Push payroll journal entries automatically.", category: "Accounting", installed: false, icon: "📊" },
  { id: "pg4", name: "DocuSign", desc: "Send contracts and offers for e-signature.", category: "Documents", installed: true, icon: "✍️" },
  { id: "pg5", name: "Greenhouse", desc: "Mirror candidate pipeline from Greenhouse ATS.", category: "Recruiting", installed: false, icon: "🌱" },
  { id: "pg6", name: "Stripe Payouts", desc: "Pay contractors via Stripe Connect.", category: "Payments", installed: false, icon: "💳" },
  { id: "pg7", name: "Okta SSO", desc: "Enterprise single sign-on with SCIM.", category: "Security", installed: true, icon: "🔐" },
  { id: "pg8", name: "Zapier", desc: "Connect to 5,000+ apps via Zapier.", category: "Automation", installed: false, icon: "⚡" },
];
