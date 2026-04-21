/**
 * Frontend-specific sidebar-feature helpers: path-to-id mapping (for
 * SidebarRouteGuard) and localStorage mirror. Shared constants + types now
 * live in `@pulse-hr/shared/sidebar-features` and are re-exported here so
 * existing callsites don't change.
 */
export {
  ADMIN_SIDEBAR_VISIBILITY_PATH,
  ALL_SIDEBAR_FEATURE_IDS,
  SIDEBAR_FEATURE_LABELS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
  type SidebarFeatureId,
} from "@pulse-hr/shared/sidebar-features";
import {
  ALL_SIDEBAR_FEATURE_IDS,
  defaultSidebarFeaturesEnabled,
  mergePartialFeaturesRecord,
  type SidebarFeatureId,
} from "@pulse-hr/shared/sidebar-features";

const STORAGE_KEY = "pulse.sidebarFeatures.v1";

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
