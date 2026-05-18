/**
 * Product tours. Each tour is a linear set of steps; a step can navigate to a
 * route and/or spotlight a DOM node by `data-tour` attribute. Steps without a
 * target render as a centered modal card.
 *
 * Completion state is persisted in localStorage so repeat visits don't nag.
 *
 * Translatable fields (`name`, `summary`, step `title`/`body`) are i18n keys.
 * Pass them through `t()` at render time. The English fallback lives in the
 * dictionary; ad-hoc tours (e.g. release tours) can still pass plain strings
 * because `t()` returns the key verbatim when it's not in the dict.
 */

export type TourStep = {
  /** `data-tour` selector on the element to spotlight. Omit for centered. */
  target?: string;
  /** i18n key (or literal). */
  title: string;
  /** i18n key (or literal). */
  body: string;
  /** Navigate here before attempting to spotlight. */
  route?: string;
  /** Link to a relevant `/docs/*` page. */
  docHref?: string;
  placement?: "top" | "bottom" | "left" | "right" | "auto";
};

export type TourWorkflow =
  | "Getting started"
  | "Work"
  | "People"
  | "Money"
  | "Highlights"
  | "Admin";

export type Tour = {
  id: string;
  /** i18n key (or literal). */
  name: string;
  /** i18n key (or literal). */
  summary: string;
  /** Workflow grouping shown in the launcher. */
  workflow: TourWorkflow;
  /** Short estimate like "2 min" — purely informational. */
  duration: string;
  steps: TourStep[];
};

/** Maps the typed `workflow` value to its i18n key. */
export const WORKFLOW_LABEL_KEYS: Record<TourWorkflow, string> = {
  "Getting started": "tours.workflow.gettingStarted",
  Work: "tours.workflow.work",
  People: "tours.workflow.people",
  Money: "tours.workflow.money",
  Highlights: "tours.workflow.highlights",
  Admin: "tours.workflow.admin",
};

export const TOURS: Tour[] = [
  {
    id: "getting-started",
    name: "tours.t.getting-started.name",
    summary: "tours.t.getting-started.summary",
    workflow: "Getting started",
    duration: "1 min",
    steps: [
      {
        title: "tours.t.getting-started.step.1.title",
        body: "tours.t.getting-started.step.1.body",
        route: "/",
      },
      {
        target: "sidebar-nav",
        title: "tours.t.getting-started.step.2.title",
        body: "tours.t.getting-started.step.2.body",
        placement: "right",
      },
      {
        target: "topbar-search",
        title: "tours.t.getting-started.step.3.title",
        body: "tours.t.getting-started.step.3.body",
        placement: "bottom",
      },
      {
        target: "topbar-status-log",
        title: "tours.t.getting-started.step.4.title",
        body: "tours.t.getting-started.step.4.body",
        placement: "bottom",
      },
      {
        target: "topbar-new",
        title: "tours.t.getting-started.step.5.title",
        body: "tours.t.getting-started.step.5.body",
        placement: "bottom",
      },
      {
        target: "topbar-notifications",
        title: "tours.t.getting-started.step.6.title",
        body: "tours.t.getting-started.step.6.body",
        placement: "bottom",
      },
      {
        title: "tours.t.getting-started.step.7.title",
        body: "tours.t.getting-started.step.7.body",
        docHref: "/docs",
      },
    ],
  },
  {
    id: "time-tracking",
    name: "tours.t.time-tracking.name",
    summary: "tours.t.time-tracking.summary",
    workflow: "Work",
    duration: "2 min",
    steps: [
      {
        title: "tours.t.time-tracking.step.1.title",
        body: "tours.t.time-tracking.step.1.body",
        route: "/time",
        docHref: "/docs/clients-projects",
      },
      {
        target: "topbar-project-pin",
        title: "tours.t.time-tracking.step.2.title",
        body: "tours.t.time-tracking.step.2.body",
        placement: "bottom",
      },
      {
        target: "page-header",
        title: "tours.t.time-tracking.step.3.title",
        body: "tours.t.time-tracking.step.3.body",
        placement: "bottom",
      },
      {
        title: "tours.t.time-tracking.step.4.title",
        body: "tours.t.time-tracking.step.4.body",
      },
      {
        title: "tours.t.time-tracking.step.5.title",
        body: "tours.t.time-tracking.step.5.body",
        docHref: "/docs/clients-projects",
      },
    ],
  },
  {
    id: "clients-projects",
    name: "tours.t.clients-projects.name",
    summary: "tours.t.clients-projects.summary",
    workflow: "Work",
    duration: "2 min",
    steps: [
      {
        title: "tours.t.clients-projects.step.1.title",
        body: "tours.t.clients-projects.step.1.body",
        route: "/clients",
        docHref: "/docs/clients-projects",
      },
      {
        target: "page-header",
        title: "tours.t.clients-projects.step.2.title",
        body: "tours.t.clients-projects.step.2.body",
      },
      {
        title: "tours.t.clients-projects.step.3.title",
        body: "tours.t.clients-projects.step.3.body",
        docHref: "/docs/integrations",
      },
    ],
  },
  {
    id: "recruiting",
    name: "tours.t.recruiting.name",
    summary: "tours.t.recruiting.summary",
    workflow: "People",
    duration: "2 min",
    steps: [
      {
        title: "tours.t.recruiting.step.1.title",
        body: "tours.t.recruiting.step.1.body",
        route: "/recruiting",
      },
      {
        target: "page-header",
        title: "tours.t.recruiting.step.2.title",
        body: "tours.t.recruiting.step.2.body",
      },
      {
        title: "tours.t.recruiting.step.3.title",
        body: "tours.t.recruiting.step.3.body",
      },
    ],
  },
  {
    id: "labs-highlights",
    name: "tours.t.labs-highlights.name",
    summary: "tours.t.labs-highlights.summary",
    workflow: "Highlights",
    duration: "2 min",
    steps: [
      {
        title: "tours.t.labs-highlights.step.1.title",
        body: "tours.t.labs-highlights.step.1.body",
      },
      {
        title: "tours.t.labs-highlights.step.2.title",
        body: "tours.t.labs-highlights.step.2.body",
        route: "/kudos",
        docHref: "/docs/kudos",
      },
      {
        title: "tours.t.labs-highlights.step.3.title",
        body: "tours.t.labs-highlights.step.3.body",
        route: "/saturation",
        docHref: "/docs/saturation",
      },
    ],
  },
];

export const TOURS_BY_WORKFLOW: Record<TourWorkflow, Tour[]> = TOURS.reduce(
  (acc, t) => {
    (acc[t.workflow] ??= []).push(t);
    return acc;
  },
  {} as Record<TourWorkflow, Tour[]>,
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
