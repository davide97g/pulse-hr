/**
 * Product tours. Each tour is a linear set of steps; a step can navigate to a
 * route and/or spotlight a DOM node by `data-tour` attribute. Steps without a
 * target render as a centered modal card.
 *
 * Completion state is persisted in localStorage so repeat visits don't nag.
 */

export type TourStep = {
  /** `data-tour` selector on the element to spotlight. Omit for centered. */
  target?: string;
  title: string;
  body: string;
  /** Navigate here before attempting to spotlight. */
  route?: string;
  /** Link to a relevant `/docs/*` page. */
  docHref?: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
};

export type Tour = {
  id: string;
  name: string;
  summary: string;
  /** Workflow grouping shown in the launcher. */
  workflow: "Getting started" | "Work" | "People" | "Money" | "Labs" | "Admin";
  /** Short estimate like "2 min" — purely informational. */
  duration: string;
  steps: TourStep[];
};

export const TOURS: Tour[] = [
  {
    id: "getting-started",
    name: "Welcome to Pulse HR",
    summary: "Sidebar, global search, status log, quick actions — the 60-second orientation.",
    workflow: "Getting started",
    duration: "1 min",
    steps: [
      {
        title: "Welcome to Pulse HR",
        body: "A quick tour of the shell so you know where to find things. You can exit any time — we won't show this again automatically.",
        route: "/",
      },
      {
        target: "sidebar-nav",
        title: "Sidebar navigation",
        body: "Every area of the app is grouped here: Overview, People, Work, Money, Insights, Labs, and Workspace. Items with a pulsing dot are new.",
        placement: "right",
      },
      {
        target: "topbar-search",
        title: "Global search — ⌘K",
        body: "Jump anywhere, find employees or projects, or type a natural-language command like 'log 4h on ACME yesterday'.",
        placement: "bottom",
      },
      {
        target: "topbar-status-log",
        title: "Status Log — ⌘J",
        body: "Your daily standup surface. Draft a status, answer manager asks, and see team updates in a single stream.",
        placement: "bottom",
      },
      {
        target: "topbar-new",
        title: "Quick actions",
        body: "Add an employee, request leave, submit an expense, or post a job — without leaving the page you're on.",
        placement: "bottom",
      },
      {
        target: "topbar-notifications",
        title: "Notifications",
        body: "Approvals, alerts, and informational pings. Click one to jump to the thing that needs attention.",
        placement: "bottom",
      },
      {
        title: "You're set",
        body: "More tours are available from the Help menu in the sidebar or via ⌘K → 'Take a tour'.",
        docHref: "/docs",
      },
    ],
  },
  {
    id: "time-tracking",
    name: "Log time on a commessa",
    summary: "Timesheets, the commessa pin, autofill, and submitting the week.",
    workflow: "Work",
    duration: "2 min",
    steps: [
      {
        title: "Time & attendance",
        body: "Log hours against commesse (project codes). We'll walk through the essentials.",
        route: "/time",
        docHref: "/docs/clients-projects",
      },
      {
        target: "topbar-commessa-pin",
        title: "Active commessa pin",
        body: "Pin the commessa you're working on and new entries default to it. The pin follows you between Time, Forecast, and Focus.",
        placement: "bottom",
      },
      {
        target: "page-header",
        title: "The week view",
        body: "A calendar of your days. Green means filled, amber means partial, red means missing — so you can see gaps at a glance.",
        placement: "bottom",
      },
      {
        title: "Autofill the week",
        body: "Use the Autofill dialog to generate a sensible draft from your calendar + recent activity, then tweak. Faster than typing eight entries.",
      },
      {
        title: "Submit for approval",
        body: "When the week looks right, submit. Your manager gets a notification and approvals flow back into Status Log.",
        docHref: "/docs/clients-projects",
      },
    ],
  },
  {
    id: "clients-projects",
    name: "Manage clients and projects",
    summary: "From client directory to project detail: activities, allocations, and Gantt.",
    workflow: "Work",
    duration: "2 min",
    steps: [
      {
        title: "Clients & Projects",
        body: "The commessa hub. Browse clients, drill into projects, see who's allocated and what's at risk.",
        route: "/clients",
        docHref: "/docs/clients-projects",
      },
      {
        target: "page-header",
        title: "Client directory",
        body: "Each card rolls up the client's active projects, health, and billing status.",
      },
      {
        title: "Project detail",
        body: "Open any project to see activities (board + Gantt), allocations, margin, and owner. Activities can be linked to Jira or Linear tickets.",
        docHref: "/docs/integrations",
      },
    ],
  },
  {
    id: "recruiting",
    name: "Move a candidate through the pipeline",
    summary: "Kanban stages, candidate profiles, and turning a hire into onboarding.",
    workflow: "People",
    duration: "2 min",
    steps: [
      {
        title: "Recruiting",
        body: "Candidates flow through a kanban from applied → offer. Drag across stages as they progress.",
        route: "/recruiting",
      },
      {
        target: "page-header",
        title: "Pipeline stages",
        body: "Each column is a stage. Counts update live. On mobile the board scrolls horizontally.",
      },
      {
        title: "Hire & handoff",
        body: "Marking a candidate as hired seeds an onboarding workflow — /onboarding picks it up with a default checklist.",
      },
    ],
  },
  {
    id: "payroll",
    name: "Run a payroll cycle",
    summary: "Reviewing a run, payslips, and re-opening if something's off.",
    workflow: "Money",
    duration: "2 min",
    steps: [
      {
        title: "Payroll",
        body: "Monthly runs roll up timesheets, leave, and expenses into payslips.",
        route: "/payroll",
      },
      {
        target: "page-header",
        title: "The run list",
        body: "Draft → Processing → Completed. Open a run to see every payslip, gross/net, and contributions.",
      },
      {
        title: "Payslip detail",
        body: "Each employee's payslip shows base, overtime, expenses reimbursed, deductions, and the final net.",
      },
    ],
  },
  {
    id: "labs-focus",
    name: "Labs: Focus, Pulse, Kudos, Forecast",
    summary:
      "The experimental suite — deep-work timer, vibe heatmap, peer coins, and burn forecasting.",
    workflow: "Labs",
    duration: "3 min",
    steps: [
      {
        title: "Labs",
        body: "Four experimental features live here, all tagged with a pulsing 'new' dot in the sidebar.",
      },
      {
        title: "Focus Mode",
        body: "Start a deep-work session tied to a commessa. We auto-decline interruptions and log the time when you finish.",
        route: "/focus",
      },
      {
        title: "Kudos",
        body: "Peer recognition with coins. Leaderboard + confetti. Kudos feed your employee score.",
        route: "/kudos",
        docHref: "/docs/kudos",
      },
      {
        title: "Commessa Forecast",
        body: "Burn projection with scenario sliders — drag to see how staffing changes move the end-date.",
        route: "/forecast",
      },
      {
        title: "Saturation",
        body: "Team load heatmap + utilisation trend. Spot who's overbooked before the week starts.",
        route: "/saturation",
        docHref: "/docs/saturation",
      },
    ],
  },
];

export const TOURS_BY_WORKFLOW: Record<string, Tour[]> = TOURS.reduce(
  (acc, t) => {
    (acc[t.workflow] ??= []).push(t);
    return acc;
  },
  {} as Record<string, Tour[]>,
);

const STORAGE_KEY = "pulse.tours.completed";

export function getCompletedTours(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function markTourCompleted(id: string): void {
  const current = new Set(getCompletedTours());
  current.add(id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...current]));
  } catch {
    /* ignore */
  }
}

export function clearCompletedTours(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function getTour(id: string): Tour | undefined {
  return TOURS.find((t) => t.id === id);
}
