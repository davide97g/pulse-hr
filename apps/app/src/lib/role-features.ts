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

export type RoleFeatureOverrides = Partial<Record<Role, Partial<Record<SidebarFeatureId, boolean>>>>;

/**
 * Resolve the visible feature set for a role. Starts from the hardcoded
 * baseline, then applies any per-role overrides persisted at the workspace
 * level (admin grants extra modules to HR, etc.).
 */
export function featuresForRole(
  role: string,
  overrides?: RoleFeatureOverrides | null,
): Set<SidebarFeatureId> {
  const base =
    role === "admin" || !role
      ? new Set<SidebarFeatureId>(ALL_SIDEBAR_FEATURE_IDS)
      : new Set<SidebarFeatureId>(
          ALLOW[role as Exclude<Role, "admin">] ?? ALL_SIDEBAR_FEATURE_IDS,
        );
  const override = overrides?.[role as Role];
  if (override) {
    for (const id of ALL_SIDEBAR_FEATURE_IDS) {
      const v = override[id];
      if (v === true) base.add(id);
      else if (v === false) base.delete(id);
    }
  }
  return base;
}

export function isFeatureAllowedForRole(
  role: string,
  id: SidebarFeatureId,
  overrides?: RoleFeatureOverrides | null,
): boolean {
  return featuresForRole(role, overrides).has(id);
}
