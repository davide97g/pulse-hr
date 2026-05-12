/**
 * Sidebar feature ids, labels, and tiny pure helpers used by both the frontend
 * (for route-to-feature mapping + toggling) and the backend (for validating
 * /api/workspace/sidebar-features payloads).
 *
 * Anything that touches browser storage or Node fs lives in its host app, not
 * here.
 */

export const ADMIN_MODULES_PATH = "/admin/modules" as const;

export const ALL_SIDEBAR_FEATURE_IDS = [
  "dashboard",
  "announcements",
  "log",
  "people",
  "org",
  "recruiting",
  "clients",
  "time",
  "leave",
  "documents",
  "offices",
  "reports",
  "growth",
  "kudos",
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
  clients: "Clients & Projects",
  time: "Time & attendance",
  leave: "Leave",
  documents: "Documents",
  offices: "Offices",
  reports: "Reports",
  growth: "Growth",
  kudos: "Kudos",
  saturation: "Saturation",
  feedback: "Feedback",
  marketplace: "Marketplace",
  developers: "Developers",
  docs: "In-app docs",
  settings: "Settings",
};

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
