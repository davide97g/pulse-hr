import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUser } from "@clerk/react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Checkbox } from "@pulse-hr/ui/primitives/checkbox";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Button } from "@pulse-hr/ui/primitives/button";
import { PageHeader } from "@/components/app/AppShell";
import { useIsRealAdmin, type Role } from "@/lib/role-override";
import {
  defaultSidebarFeaturesEnabled,
  SIDEBAR_FEATURE_LABELS,
  type SidebarFeatureId,
} from "@/lib/sidebar-features";
import { buildSidebarNavGroups } from "@/lib/sidebar-nav-groups";
import { useSidebarFeatures } from "@/components/app/SidebarFeaturesContext";
import { featuresForRole } from "@/lib/role-features";
import { managerAsks } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/modules")({
  head: () => ({ meta: [{ title: "Modules — Pulse HR" }] }),
  component: AdminModules,
});

type Scope = "workspace" | Role;

const SCOPES: { id: Scope; label: string; hint: string }[] = [
  { id: "workspace", label: "Workspace", hint: "Global fallback" },
  { id: "employee", label: "Employee", hint: "View as employee" },
  { id: "hr", label: "HR", hint: "View as HR" },
  { id: "manager", label: "Manager", hint: "View as manager" },
  { id: "finance", label: "Finance", hint: "View as finance" },
];

function AdminModules() {
  const { isLoaded } = useUser();
  const admin = useIsRealAdmin();
  const {
    enabled,
    setEnabled,
    setAll,
    roleFeatures,
    setRoleFeature,
    setRoleFeatures,
  } = useSidebarFeatures();

  const [scope, setScope] = useState<Scope>("workspace");

  const hasOpenManagerAsks = useMemo(() => managerAsks.some((a) => a.status === "pending"), []);

  const groups = useMemo(
    () => buildSidebarNavGroups(hasOpenManagerAsks, true),
    [hasOpenManagerAsks],
  );

  const idsByGroup = useMemo(() => {
    const map = new Map<string, SidebarFeatureId[]>();
    for (const g of groups) {
      const ids = [
        ...new Set(g.items.map((i) => i.featureId).filter(Boolean) as SidebarFeatureId[]),
      ];
      if (ids.length) map.set(g.label, ids);
    }
    return map;
  }, [groups]);

  const roleBaseline = useMemo(() => {
    if (scope === "workspace") return null;
    // Baseline from role-switch defaults (no overrides applied) so checkboxes start
    // from the defaults the role-switch feature ships with.
    return featuresForRole(scope, null);
  }, [scope]);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/" replace />;
  }

  const enableAll = () => {
    if (scope === "workspace") {
      setAll(defaultSidebarFeaturesEnabled());
      toast.success("All modules are visible");
      return;
    }
    // Per-role: clear overrides so baseline defaults from role-switch apply.
    const next = { ...(roleFeatures ?? {}) };
    delete next[scope];
    setRoleFeatures(Object.keys(next).length === 0 ? null : next);
    toast.success(`${scope} reset to defaults`);
  };

  const isChecked = (id: SidebarFeatureId): boolean => {
    if (scope === "workspace") return enabled[id] !== false;
    const override = roleFeatures?.[scope]?.[id];
    if (override === true) return true;
    if (override === false) return false;
    return roleBaseline?.has(id) ?? true;
  };

  const onToggle = (id: SidebarFeatureId, value: boolean) => {
    if (scope === "workspace") {
      setEnabled(id, value);
      return;
    }
    // If toggling matches baseline, clear the override to stay tracking defaults.
    const baseline = roleBaseline?.has(id) ?? true;
    setRoleFeature(scope, id, value === baseline ? null : value);
  };

  const description =
    scope === "workspace"
      ? "Global toggles apply to everyone (admin always sees all modules). Disabled routes can't be reached via deep link."
      : "Per-role overrides start from the defaults used when switching into this role. Toggles here only apply when an account's effective role matches.";

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto fade-in">
      <PageHeader
        eyebrow="ADMIN · VISIBILITÀ MODULI"
        title={
          <>
            <span className="spark-mark">Moduli</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description={description}
        actions={
          <Button type="button" variant="outline" size="sm" onClick={enableAll}>
            {scope === "workspace" ? "Enable all" : "Reset to defaults"}
          </Button>
        }
      />

      <div
        role="tablist"
        aria-label="Visibility scope"
        className="mb-4 flex flex-wrap gap-1.5 rounded-md border bg-muted/40 p-1"
      >
        {SCOPES.map((s) => {
          const active = scope === s.id;
          return (
            <button
              key={s.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setScope(s.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-colors press-scale",
                active
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              title={s.hint}
            >
              {s.label}
            </button>
          );
        })}
      </div>

      <div className="space-y-6">
        {Array.from(idsByGroup.entries()).map(([groupLabel, ids]) => (
          <Card key={groupLabel} className="p-4 md:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {groupLabel}
            </div>
            <div className="space-y-3">
              {ids.map((id) => {
                const checked = isChecked(id);
                const override =
                  scope !== "workspace" ? roleFeatures?.[scope]?.[id] : undefined;
                const overridden = override !== undefined;
                return (
                  <div key={id} className="flex items-start gap-3">
                    <Checkbox
                      id={`sf-${scope}-${id}`}
                      checked={checked}
                      onCheckedChange={(v) => onToggle(id, v === true)}
                    />
                    <div className="grid gap-0.5 leading-none flex-1">
                      <Label
                        htmlFor={`sf-${scope}-${id}`}
                        className="text-sm font-medium cursor-pointer flex items-center gap-2"
                      >
                        {SIDEBAR_FEATURE_LABELS[id]}
                        {overridden && (
                          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border text-muted-foreground">
                            override
                          </span>
                        )}
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">{id}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        ))}

        <p className="text-xs text-muted-foreground">
          {scope === "workspace" ? (
            <>
              Changes are saved to Neon (table{" "}
              <span className="font-mono">workspace_sidebar_features</span>) and mirrored to local
              cache.
            </>
          ) : (
            <>
              Per-role overrides are persisted alongside workspace settings. Unchecked overrides
              fall back to the defaults from the role-switch feature (see{" "}
              <span className="font-mono">role-features.ts</span>).
            </>
          )}
        </p>
      </div>
    </div>
  );
}

