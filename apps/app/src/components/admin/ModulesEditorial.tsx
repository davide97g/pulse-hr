import { useMemo, useState } from "react";
import { useUser } from "@clerk/react";
import { Navigate } from "@tanstack/react-router";
import { toast } from "sonner";
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
import { useWorkspaceStatus } from "@/lib/workspace";

type Scope = "workspace" | Role;

const SCOPES: { id: Scope; label: string }[] = [
  { id: "workspace", label: "Workspace" },
  { id: "employee", label: "Employee" },
  { id: "hr", label: "HR" },
  { id: "manager", label: "Manager" },
  { id: "finance", label: "Finance" },
];

export function ModulesEditorial() {
  const { isLoaded } = useUser();
  const admin = useIsRealAdmin();
  const ws = useWorkspaceStatus();
  const {
    enabled,
    setEnabled,
    setAll,
    roleFeatures,
    setRoleFeature,
    setRoleFeatures,
  } = useSidebarFeatures();

  const [scope, setScope] = useState<Scope>("workspace");

  const hasOpenManagerAsks = useMemo(
    () => managerAsks.some((a) => a.status === "pending"),
    [],
  );

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
    return featuresForRole(scope, null);
  }, [scope]);

  if (!isLoaded) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[50vh]">
        <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/30 border-t-foreground animate-spin" />
      </div>
    );
  }

  if (!admin) return <Navigate to="/" replace />;

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
    const baseline = roleBaseline?.has(id) ?? true;
    setRoleFeature(scope, id, value === baseline ? null : value);
  };

  const enableAll = () => {
    if (scope === "workspace") {
      setAll(defaultSidebarFeaturesEnabled());
      toast.success("Tutti i moduli sono visibili");
      return;
    }
    const next = { ...(roleFeatures ?? {}) };
    delete next[scope];
    setRoleFeatures(Object.keys(next).length === 0 ? null : next);
    toast.success(`${scope} riportato ai default`);
  };

  const totalFeatures = Array.from(idsByGroup.values()).reduce(
    (acc, ids) => acc + ids.length,
    0,
  );
  const visibleCount = Array.from(idsByGroup.values()).reduce(
    (acc, ids) => acc + ids.filter((id) => isChecked(id)).length,
    0,
  );
  const overrideCount =
    scope === "workspace"
      ? 0
      : Object.values(roleFeatures?.[scope] ?? {}).filter((v) => v !== undefined).length;

  const description =
    scope === "workspace"
      ? "I toggle globali si applicano a tutti (l'admin vede sempre tutti i moduli). Le route disabilitate non sono raggiungibili via deep link."
      : "Gli override per ruolo partono dai default usati quando si fa role-switch. Si applicano solo agli account il cui ruolo effettivo combacia.";

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-7 min-h-full">
      <div className="flex flex-col gap-3.5">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <div className="flex items-baseline gap-3.5 flex-wrap">
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              ADMIN · VISIBILITÀ MODULI · {ws.name.toUpperCase()}
            </span>
            <span className="tag-spark">
              <span
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  background: "var(--spark-ink)",
                }}
              />
              {visibleCount}/{totalFeatures} ATTIVI
            </span>
            {overrideCount > 0 && (
              <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                · {overrideCount} OVERRIDE
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <button type="button" className="pill pill-ghost pill-sm" onClick={enableAll}>
              {scope === "workspace" ? "↺ Riattiva tutti" : "↺ Reset default"}
            </button>
          </div>
        </div>

        <div className="grid items-end gap-6 grid-cols-1 lg:[grid-template-columns:1fr_auto]">
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: 0,
              fontSize: "clamp(56px, 8vw, 96px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
              color: "var(--fg)",
            }}
          >
            <span style={{ fontStyle: "italic" }}>Moduli</span>
            <span style={{ color: "var(--spark)" }}>.</span>
            <span
              className="t-mono"
              style={{
                marginLeft: 18,
                color: "var(--muted-foreground)",
                verticalAlign: "middle",
              }}
            >
              {scope === "workspace" ? "WORKSPACE · GLOBALE" : `RUOLO · ${scope.toUpperCase()}`}
            </span>
          </h1>
          <p
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 16,
              color: "var(--fg-2)",
              maxWidth: 420,
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        </div>

        <div
          className="flex flex-wrap"
          role="tablist"
          aria-label="Visibility scope"
          style={{
            borderTop: "1px solid var(--line-strong)",
            borderBottom: "1px solid var(--line)",
            marginTop: 6,
          }}
        >
          {SCOPES.map((s, i) => {
            const active = scope === s.id;
            return (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setScope(s.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: "12px 18px",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: active ? 600 : 400,
                  fontSize: 14,
                  color: active ? "var(--fg)" : "var(--muted-foreground)",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span className="t-mono-sm" style={{ opacity: 0.6 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.label}
                {active && (
                  <span
                    style={{
                      position: "absolute",
                      bottom: -1,
                      left: 0,
                      right: 0,
                      height: 2,
                      background: "var(--spark)",
                      boxShadow: "0 0 8px var(--spark)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className="grid gap-4.5 flex-1 min-h-0"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}
      >
        {Array.from(idsByGroup.entries()).map(([groupLabel, ids]) => {
          const groupOn = ids.filter((id) => isChecked(id)).length;
          return (
            <section
              key={groupLabel}
              style={{
                border: "1px solid var(--line)",
                borderRadius: 18,
                padding: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                background: "var(--bg-2)",
              }}
            >
              <div className="flex justify-between items-baseline mb-3">
                <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                  {groupLabel}
                </span>
                <span
                  className="t-mono-sm"
                  style={{
                    color:
                      groupOn === ids.length
                        ? "var(--spark)"
                        : groupOn === 0
                          ? "var(--muted-foreground)"
                          : "var(--fg-2)",
                  }}
                >
                  {groupOn} / {ids.length}
                </span>
              </div>
              {ids.map((id, j) => {
                const checked = isChecked(id);
                const override =
                  scope !== "workspace" ? roleFeatures?.[scope]?.[id] : undefined;
                const overridden = override !== undefined;
                return (
                  <ModuleRow
                    key={id}
                    id={id}
                    checked={checked}
                    overridden={overridden}
                    last={j === ids.length - 1}
                    onToggle={(v) => onToggle(id, v)}
                  />
                );
              })}
            </section>
          );
        })}
      </div>

      <p
        className="t-mono-sm"
        style={{
          color: "var(--muted-foreground)",
          paddingTop: 10,
          borderTop: "1px solid var(--line)",
        }}
      >
        {scope === "workspace" ? (
          <>
            MODIFICHE SALVATE SU NEON · TABELLA{" "}
            <span style={{ color: "var(--fg-2)" }}>workspace_sidebar_features</span> · MIRROR
            LOCALE
          </>
        ) : (
          <>
            OVERRIDE PER RUOLO PERSISTITI ACCANTO ALLE IMPOSTAZIONI WORKSPACE · FALLBACK SU{" "}
            <span style={{ color: "var(--fg-2)" }}>role-features.ts</span>
          </>
        )}
      </p>
    </div>
  );
}

function ModuleRow({
  id,
  checked,
  overridden,
  last,
  onToggle,
}: {
  id: SidebarFeatureId;
  checked: boolean;
  overridden: boolean;
  last: boolean;
  onToggle: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onToggle(!checked)}
      className="press-scale text-left"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 12,
        alignItems: "center",
        padding: "14px 0",
        borderBottom: last ? "none" : "1px solid var(--line)",
        background: "transparent",
        border: "none",
        borderTop: "none",
        borderLeft: "none",
        borderRight: "none",
        cursor: "pointer",
        color: "inherit",
      }}
    >
      <div className="flex flex-col gap-0.5 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 19,
              letterSpacing: "-0.01em",
              lineHeight: 1.1,
              color: checked ? "var(--fg)" : "var(--fg-2)",
            }}
          >
            {SIDEBAR_FEATURE_LABELS[id]}
          </span>
          {overridden && (
            <span
              className="t-mono-sm"
              style={{
                color: "var(--muted-foreground)",
                border: "1px solid var(--line-strong)",
                borderRadius: 999,
                padding: "1px 6px",
                letterSpacing: "0.04em",
              }}
            >
              OVERRIDE
            </span>
          )}
        </div>
        <span
          className="t-mono-sm"
          style={{ color: "var(--muted-foreground)" }}
        >
          {id}
        </span>
      </div>
      <Toggle on={checked} />
    </button>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        minWidth: 78,
        justifyContent: "flex-end",
      }}
    >
      <span
        className="t-mono-sm"
        style={{
          color: on ? "var(--spark)" : "var(--muted-foreground)",
          fontWeight: 600,
          letterSpacing: "0.06em",
        }}
      >
        {on ? "ON" : "OFF"}
      </span>
      <span
        style={{
          width: 32,
          height: 18,
          borderRadius: 999,
          background: on
            ? "var(--spark)"
            : "color-mix(in oklch, var(--fg) 12%, transparent)",
          border: `1px solid ${on ? "var(--spark)" : "var(--line-strong)"}`,
          position: "relative",
          transition: "background 160ms ease, border-color 160ms ease",
          boxShadow: on
            ? "0 0 10px color-mix(in oklch, var(--spark) 50%, transparent)"
            : "none",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 1,
            left: on ? 15 : 1,
            width: 14,
            height: 14,
            borderRadius: 999,
            background: on ? "var(--spark-ink)" : "var(--fg-2)",
            transition: "left 160ms ease, background 160ms ease",
          }}
        />
      </span>
    </span>
  );
}
