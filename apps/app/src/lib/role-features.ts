import { ALL_SIDEBAR_FEATURE_IDS, type SidebarFeatureId } from "@/lib/sidebar-features";
import type { Role } from "@/lib/role-override";

/**
 * Per-role sidebar module allowlist. Admin sees everything; other roles see a
 * tailored subset so non-admins aren't overwhelmed with modules they wouldn't
 * touch. Admins viewing as another role (via the role-override context) get
 * the same filtered view until they switch back.
 */
const ALLOW: Record<Exclude<Role, "admin">, SidebarFeatureId[]> = {
  hr: [
    "dashboard",
    "announcements",
    "people",
    "org",
    "recruiting",
    "onboarding",
    "leave",
    "documents",
    "growth",
    "kudos",
    "focus",
    "feedback",
    "saturation",
    "docs",
    "settings",
  ],
  manager: [
    "dashboard",
    "announcements",
    "people",
    "org",
    "time",
    "calendar",
    "leave",
    "clients",
    "forecast",
    "saturation",
    "kudos",
    "focus",
    "feedback",
    "docs",
  ],
  finance: [
    "dashboard",
    "announcements",
    "clients",
    "time",
    "payroll",
    "expenses",
    "reports",
    "forecast",
    "feedback",
    "docs",
    "settings",
  ],
  employee: [
    "dashboard",
    "announcements",
    "people",
    "org",
    "time",
    "calendar",
    "leave",
    "documents",
    "expenses",
    "kudos",
    "focus",
    "feedback",
    "docs",
  ],
};

export function featuresForRole(role: string): Set<SidebarFeatureId> {
  if (role === "admin" || !role) {
    return new Set(ALL_SIDEBAR_FEATURE_IDS);
  }
  const list = ALLOW[role as Exclude<Role, "admin">];
  if (!list) return new Set(ALL_SIDEBAR_FEATURE_IDS);
  return new Set(list);
}

export function isFeatureAllowedForRole(role: string, id: SidebarFeatureId): boolean {
  return featuresForRole(role).has(id);
}
