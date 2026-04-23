import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useUser } from "@clerk/react";
import { useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Checkbox } from "@pulse-hr/ui/primitives/checkbox";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Button } from "@pulse-hr/ui/primitives/button";
import { PageHeader } from "@/components/app/AppShell";
import { useIsEffectiveAdmin } from "@/lib/role-override";
import {
  defaultSidebarFeaturesEnabled,
  SIDEBAR_FEATURE_LABELS,
  type SidebarFeatureId,
} from "@/lib/sidebar-features";
import { buildSidebarNavGroups } from "@/lib/sidebar-nav-groups";
import { useSidebarFeatures } from "@/components/app/SidebarFeaturesContext";
import { managerAsks } from "@/lib/mock-data";

export const Route = createFileRoute("/admin/sidebar-visibility")({
  head: () => ({ meta: [{ title: "Sidebar visibility — Pulse HR" }] }),
  component: AdminSidebarVisibility,
});

function AdminSidebarVisibility() {
  const { isLoaded } = useUser();
  const admin = useIsEffectiveAdmin();
  const { enabled, setEnabled, setAll } = useSidebarFeatures();

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
    setAll(defaultSidebarFeaturesEnabled());
    toast.success("All modules are visible");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto fade-in">
      <PageHeader
        title="Sidebar visibility"
        description="Choose which sections appear in the sidebar for workspace members (admin accounts always see everything). Disabled routes can't be reached via deep link."
        actions={
          <Button type="button" variant="outline" size="sm" onClick={enableAll}>
            Enable all
          </Button>
        }
      />

      <div className="space-y-6">
        {Array.from(idsByGroup.entries()).map(([groupLabel, ids]) => (
          <Card key={groupLabel} className="p-4 md:p-5">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {groupLabel}
            </div>
            <div className="space-y-3">
              {ids.map((id) => (
                <div key={id} className="flex items-start gap-3">
                  <Checkbox
                    id={`sf-${id}`}
                    checked={enabled[id]}
                    onCheckedChange={(v) => setEnabled(id, v === true)}
                  />
                  <div className="grid gap-0.5 leading-none">
                    <Label htmlFor={`sf-${id}`} className="text-sm font-medium cursor-pointer">
                      {SIDEBAR_FEATURE_LABELS[id]}
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">{id}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        <p className="text-xs text-muted-foreground">
          Changes are saved to Neon (table{" "}
          <span className="font-mono">workspace_sidebar_features</span>) and mirrored to local
          cache. On Vercel, the project needs <span className="font-mono">DATABASE_URL</span> and{" "}
          <span className="font-mono">CLERK_SECRET_KEY</span> set in environment variables (not only
          the publishable key). Diagnostics: <span className="font-mono">GET /api/health</span>.
        </p>
      </div>
    </div>
  );
}
