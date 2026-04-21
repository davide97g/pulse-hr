const STORAGE_KEY = "pulse.sidebarFeatures.v1";

export const ADMIN_SIDEBAR_VISIBILITY_PATH = "/admin/sidebar-visibility" as const;

export const ALL_SIDEBAR_FEATURE_IDS = [
  "dashboard",
  "announcements",
  "log",
  "people",
  "org",
  "recruiting",
  "onboarding",
  "clients",
  "time",
  "calendar",
  "leave",
  "documents",
  "offices",
  "payroll",
  "expenses",
  "reports",
  "growth",
  "forecast",
  "kudos",
  "focus",
  "saturation",
  "feedback",
  "marketplace",
  "developers",
  "docs",
  "settings",
] as const;

export type SidebarFeatureId = (typeof ALL_SIDEBAR_FEATURE_IDS)[number];

export const SIDEBAR_FEATURE_LABELS: Record<SidebarFeatureId, string> = {
  dashboard: "Dashboard",
  announcements: "Announcements",
  log: "Status Log",
  people: "Employees",
  org: "Org chart",
  recruiting: "Recruiting",
  onboarding: "Onboarding",
  clients: "Clients & Projects",
  time: "Time & attendance",
  calendar: "Calendar",
  leave: "Leave",
  documents: "Documents",
  offices: "Offices",
  payroll: "Payroll",
  expenses: "Expenses",
  reports: "Reports",
  growth: "Growth",
  forecast: "Commessa Forecast",
  kudos: "Kudos",
  focus: "Focus Mode",
  saturation: "Saturation",
  feedback: "Feedback",
  marketplace: "Marketplace",
  developers: "Developers",
  docs: "In-app docs",
  settings: "Settings",
};

/** Path prefixes for each module (used to block deep links, not only sidebar entries). */
const FEATURE_PATHS: Record<SidebarFeatureId, string[]> = {
  dashboard: ["/"],
  announcements: ["/announcements"],
  log: ["/log"],
  people: ["/people"],
  org: ["/org"],
  recruiting: ["/recruiting"],
  onboarding: ["/onboarding"],
  clients: ["/clients", "/projects"],
  time: ["/time"],
  calendar: ["/calendar"],
  leave: ["/leave"],
  documents: ["/documents"],
  offices: ["/offices"],
  payroll: ["/payroll"],
  expenses: ["/expenses"],
  reports: ["/reports"],
  growth: ["/growth"],
  forecast: ["/forecast"],
  kudos: ["/kudos"],
  focus: ["/focus"],
  saturation: ["/saturation"],
  feedback: ["/feedback"],
  marketplace: ["/marketplace"],
  developers: ["/developers"],
  docs: ["/docs"],
  settings: ["/settings"],
};

function pathMatchesPrefix(pathname: string, prefix: string): boolean {
  if (prefix === "/") return pathname === "/";
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function pathToSidebarFeatureId(pathname: string): SidebarFeatureId | null {
  for (const id of ALL_SIDEBAR_FEATURE_IDS) {
    for (const prefix of FEATURE_PATHS[id]) {
      if (pathMatchesPrefix(pathname, prefix)) return id;
    }
  }
  return null;
}

/** First sidebar module path that is still enabled (avoids redirect loops when "/" is off). */
export function firstEnabledAppPath(enabled: Record<SidebarFeatureId, boolean>): string {
  for (const id of ALL_SIDEBAR_FEATURE_IDS) {
    if (enabled[id] === false) continue;
    return FEATURE_PATHS[id][0];
  }
  return "/profile";
}

export function defaultSidebarFeaturesEnabled(): Record<SidebarFeatureId, boolean> {
  return Object.fromEntries(ALL_SIDEBAR_FEATURE_IDS.map((id) => [id, true])) as Record<
    SidebarFeatureId,
    boolean
  >;
}

/** Merge a partial feature map (API or localStorage) onto defaults. */
export function mergePartialFeaturesRecord(raw: unknown): Record<SidebarFeatureId, boolean> {
  const base = defaultSidebarFeaturesEnabled();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const o = raw as Record<string, unknown>;
  for (const id of ALL_SIDEBAR_FEATURE_IDS) {
    if (typeof o[id] === "boolean") base[id] = o[id] as boolean;
  }
  return base;
}

export function readSidebarFeaturesFromStorage(): Record<SidebarFeatureId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSidebarFeaturesEnabled();
    return mergePartialFeaturesRecord(JSON.parse(raw) as unknown);
  } catch {
    return defaultSidebarFeaturesEnabled();
  }
}

export function writeSidebarFeaturesToStorage(next: Record<SidebarFeatureId, boolean>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}
