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
