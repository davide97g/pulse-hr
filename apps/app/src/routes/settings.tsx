import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  History,
  Languages,
  Plug,
  Plus,
  Pencil,
  Trash2,
  AlertTriangle,
  Info,
  TriangleAlert,
  Search,
  Database,
  RotateCcw,
  Bell,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { PageHeader } from "@/components/app/AppShell";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
import { Switch } from "@pulse-hr/ui/primitives/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@pulse-hr/ui/primitives/alert-dialog";
import { SkeletonRows } from "@pulse-hr/ui/atoms/SkeletonList";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { auditLogSeed, type AuditEntry } from "@/lib/mock-data";
import { rolesTable, useRoles, type RolePermission } from "@/lib/tables/roles";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api-client";
import { IntegrationConnectCard } from "@/components/pm/IntegrationConnectCard";
import { useIntegrations, updateIntegration } from "@/lib/integrations-store";
import { resetWorkspace, setWorkspaceName, useWorkspaceStatus } from "@/lib/workspace";
import {
  updateCompanySettings,
  updateLocale,
  updateSecurity,
  useCompanySettings,
} from "@/lib/company-settings";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: Settings,
});

function Settings() {
  const [loading, setLoading] = useState(true);
  const roles = useRoles();
  const [tab, setTab] = useUrlParam("tab", "company");
  const [editRolePermission, setEditRolePermission] = useState<RolePermission | "new" | null>(null);
  const [deleteRolePermission, setDeleteRolePermission] = useState<RolePermission | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const navigate = useNavigate();
  const workspace = useWorkspaceStatus();
  const persisted = useCompanySettings();
  const security = persisted.security;
  const [company, setCompany] = useState(() => ({
    name: workspace.name || "Acme",
    legal: persisted.legal || `${workspace.name || "Acme"} Holdings LLC`,
    country: persisted.country,
    currency: persisted.currency,
  }));
  const [dirty, setDirty] = useState(false);
  const [localeDraft, setLocaleDraft] = useState(() => persisted.locale);
  const localeDirty =
    localeDraft.language !== persisted.locale.language ||
    localeDraft.timezone !== persisted.locale.timezone ||
    localeDraft.dateFormat !== persisted.locale.dateFormat;
  const [auditQ, setAuditQ] = useState("");
  const [auditFilter, setAuditFilter] = useState<"all" | AuditEntry["severity"]>("all");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const filteredAudit = auditLogSeed.filter((a) => {
    if (auditFilter !== "all" && a.severity !== auditFilter) return false;
    if (auditQ && !`${a.who} ${a.what}`.toLowerCase().includes(auditQ.toLowerCase())) return false;
    return true;
  });

  const saveRolePermission = (data: Omit<RolePermission, "id" | "color">, id?: string) => {
    if (id) {
      rolesTable.update(id, data);
      toast.success("Role updated");
    } else {
      rolesTable.add({ ...data, id: `r-${Date.now()}`, color: "oklch(0.6 0.16 195)" });
      toast.success("Role created");
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader
        eyebrow="WORKSPACE · IMPOSTAZIONI"
        title={
          <>
            <span className="spark-mark">Settings</span>
            <span style={{ color: "var(--spark)", fontStyle: "normal" }}>.</span>
          </>
        }
        description="Configurazione azienda, ruoli, integrazioni."
      />

      <Tabs value={tab} onValueChange={setTab} orientation="horizontal">
        <TabsList>
          <TabsTrigger value="company">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Company
          </TabsTrigger>
          <TabsTrigger value="roles">
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="security">
            <ShieldCheck className="h-3.5 w-3.5 mr-1.5" />
            Security
          </TabsTrigger>
          <TabsTrigger value="audit">
            <History className="h-3.5 w-3.5 mr-1.5" />
            Audit log
          </TabsTrigger>
          <TabsTrigger value="locale">
            <Languages className="h-3.5 w-3.5 mr-1.5" />
            Localization
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Plug className="h-3.5 w-3.5 mr-1.5" />
            Integrations
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Database className="h-3.5 w-3.5 mr-1.5" />
            Workspace
          </TabsTrigger>
        </TabsList>

        <TabsContent value="company" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label>Company name</Label>
              <Input
                value={company.name}
                onChange={(e) => {
                  setCompany((c) => ({ ...c, name: e.target.value }));
                  setDirty(true);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Legal entity</Label>
              <Input
                value={company.legal}
                onChange={(e) => {
                  setCompany((c) => ({ ...c, legal: e.target.value }));
                  setDirty(true);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Country</Label>
              <Input
                value={company.country}
                onChange={(e) => {
                  setCompany((c) => ({ ...c, country: e.target.value }));
                  setDirty(true);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Default currency</Label>
              <Select
                value={company.currency}
                onValueChange={(v) => {
                  setCompany((c) => ({ ...c, currency: v }));
                  setDirty(true);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["USD", "EUR", "GBP", "JPY", "CHF"].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between pt-2">
              {dirty && (
                <span className="text-xs text-warning inline-flex items-center gap-1.5">
                  <TriangleAlert className="h-3.5 w-3.5" />
                  Unsaved changes
                </span>
              )}
              <Button
                className="ml-auto press-scale"
                disabled={!dirty}
                onClick={() => {
                  setWorkspaceName(company.name);
                  updateCompanySettings({
                    legal: company.legal,
                    country: company.country,
                    currency: company.currency,
                  });
                  toast.success("Company settings saved");
                  setDirty(false);
                }}
              >
                Save changes
              </Button>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Roles & permissions</div>
              <Button
                size="sm"
                className="press-scale"
                onClick={() => setEditRolePermission("new")}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                New role
              </Button>
            </div>
            {loading ? (
              <SkeletonRows rows={4} avatar={false} />
            ) : (
              <div className="divide-y stagger-in">
                {roles.map((r) => (
                  <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 group">
                    <div className="h-8 w-1 rounded-full" style={{ backgroundColor: r.color }} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{r.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{r.desc}</div>
                    </div>
                    <div className="text-sm text-muted-foreground tabular-nums">
                      {r.count} users
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="press-scale"
                      onClick={() => setEditRolePermission(r)}
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => setDeleteRolePermission(r)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            {[
              {
                k: "twofa",
                l: "Require 2FA for all users",
                d: "Users will be prompted to enroll on next sign-in.",
              },
              {
                k: "sso",
                l: "Single sign-on (SSO)",
                d: "Okta, Google Workspace, Microsoft Entra.",
              },
              {
                k: "sessionTimeout",
                l: "Session timeout after 8h inactivity",
                d: "Force re-authentication after inactivity.",
              },
              {
                k: "ipAllowlist",
                l: "IP allowlist",
                d: "Restrict admin actions to approved IP ranges.",
              },
            ].map((s) => (
              <div
                key={s.k}
                className="flex items-center justify-between py-2 border-b last:border-0 gap-4"
              >
                <div className="flex-1">
                  <div className="text-sm font-medium">{s.l}</div>
                  <div className="text-xs text-muted-foreground">{s.d}</div>
                </div>
                <Switch
                  checked={security[s.k as keyof typeof security]}
                  onCheckedChange={(v) => {
                    updateSecurity({ [s.k]: v } as Partial<typeof security>);
                    toast.success(`${s.l} ${v ? "enabled" : "disabled"}`);
                  }}
                />
              </div>
            ))}
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b flex items-center justify-between gap-3">
              <div className="font-semibold text-sm">Activity log</div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={auditQ}
                    onChange={(e) => setAuditQ(e.target.value)}
                    placeholder="Search…"
                    className="h-8 w-[200px] pl-8"
                  />
                </div>
                <Select
                  value={auditFilter}
                  onValueChange={(v) => setAuditFilter(v as "all" | AuditEntry["severity"])}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All severities</SelectItem>
                    <SelectItem value="info">Info</SelectItem>
                    <SelectItem value="warn">Warn</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {filteredAudit.length === 0 ? (
              <EmptyState
                compact
                icon={<History className="h-6 w-6" />}
                title="No activity matches"
              />
            ) : (
              <div className="divide-y stagger-in">
                {filteredAudit.map((l) => (
                  <div key={l.id} className="px-5 py-3 text-sm flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex items-center justify-center h-6 w-6 rounded-full shrink-0",
                        l.severity === "critical"
                          ? "bg-destructive/10 text-destructive"
                          : l.severity === "warn"
                            ? "bg-warning/10 text-warning"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {l.severity === "critical" ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : l.severity === "warn" ? (
                        <TriangleAlert className="h-3.5 w-3.5" />
                      ) : (
                        <Info className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="font-medium">{l.who}</span>
                      <span className="text-muted-foreground"> {l.what}</span>
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">{l.when}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="locale" className="mt-4">
          <Card className="p-6 space-y-4 max-w-2xl">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select
                value={localeDraft.language}
                onValueChange={(v) => setLocaleDraft((d) => ({ ...d, language: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ["en-US", "English (US)"],
                    ["en-GB", "English (UK)"],
                    ["it-IT", "Italiano"],
                    ["fr-FR", "Français"],
                    ["es-ES", "Español"],
                    ["de-DE", "Deutsch"],
                  ].map(([v, l]) => (
                    <SelectItem key={v} value={v}>
                      {l}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Timezone</Label>
              <Input
                value={localeDraft.timezone}
                onChange={(e) =>
                  setLocaleDraft((d) => ({ ...d, timezone: e.target.value }))
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label>Date format</Label>
              <Select
                value={localeDraft.dateFormat}
                onValueChange={(v) => setLocaleDraft((d) => ({ ...d, dateFormat: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY", "DD MMM YYYY"].map((f) => (
                    <SelectItem key={f} value={f}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              className="press-scale"
              disabled={!localeDirty}
              onClick={() => {
                updateLocale(localeDraft);
                toast.success("Locale saved");
              }}
            >
              Save
            </Button>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-4 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">Work-item integrations</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Connect Jira and Linear to pull issues into projects and link them to activities.
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/marketplace">Open Marketplace</a>
            </Button>
          </div>
          <IntegrationsSection />
        </TabsContent>

        <TabsContent value="notifications" className="mt-4">
          <NotificationPreferencesSection />
        </TabsContent>

        <TabsContent value="workspace" className="mt-4">
          <Card className="p-6 space-y-5 max-w-2xl">
            <div>
              <div className="text-sm font-semibold">Demo workspace</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                All Pulse data lives locally in your browser. Edits persist across reloads.
                {workspace.ready
                  ? " Resetting wipes everything for this account and re-runs the welcome flow."
                  : " No workspace is provisioned yet."}
              </p>
            </div>
            <div className="border-t pt-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="text-sm font-medium inline-flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-destructive" />
                  Reset workspace
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Removes every locally-stored entity, counter, and edit. Cannot be undone.
                </div>
              </div>
              <Button
                variant="outline"
                className="border-destructive/40 text-destructive hover:bg-destructive/10 press-scale"
                disabled={!workspace.ready}
                onClick={() => setConfirmReset(true)}
              >
                Reset
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog
        open={editRolePermission !== null}
        onOpenChange={(o) => !o && setEditRolePermission(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editRolePermission === "new"
                ? "New role"
                : `Edit ${typeof editRolePermission === "object" && editRolePermission ? editRolePermission.name : ""}`}
            </DialogTitle>
            <DialogDescription>
              Scoped permissions will apply to assigned users immediately.
            </DialogDescription>
          </DialogHeader>
          {editRolePermission !== null && (
            <RolePermissionForm
              role={editRolePermission === "new" ? null : editRolePermission}
              onCancel={() => setEditRolePermission(null)}
              onSave={(d) => {
                saveRolePermission(
                  d,
                  editRolePermission === "new" ? undefined : editRolePermission.id,
                );
                setEditRolePermission(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={confirmReset} onOpenChange={setConfirmReset}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset this workspace?</AlertDialogTitle>
            <AlertDialogDescription>
              Every employee, project, request, comment, and counter you've touched will be cleared.
              You'll be returned to the welcome flow to seed a fresh demo. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                resetWorkspace();
                setConfirmReset(false);
                toast.success("Workspace reset");
                navigate({ to: "/welcome", replace: true });
              }}
            >
              Reset workspace
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteRolePermission}
        onOpenChange={(o) => !o && setDeleteRolePermission(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete role?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteRolePermission &&
                `${deleteRolePermission.name} has ${deleteRolePermission.count} users. They will lose these permissions.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteRolePermission) {
                  const snap = deleteRolePermission;
                  rolesTable.remove(snap.id);
                  toast("Role deleted", {
                    action: { label: "Undo", onClick: () => rolesTable.add(snap) },
                  });
                }
                setDeleteRolePermission(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function RolePermissionForm({
  role,
  onCancel,
  onSave,
}: {
  role: RolePermission | null;
  onCancel: () => void;
  onSave: (d: Omit<RolePermission, "id" | "color">) => void;
}) {
  const [name, setName] = useState(role?.name ?? "");
  const [desc, setDesc] = useState(role?.desc ?? "");
  const [count, setCount] = useState(role?.count ?? 0);
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label>Name</Label>
          <Input autoFocus value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Description</Label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Seat count</Label>
          <Input type="number" value={count} onChange={(e) => setCount(Number(e.target.value))} />
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button disabled={!name.trim()} onClick={() => onSave({ name, desc, count })}>
          {role ? "Save changes" : "Create role"}
        </Button>
      </DialogFooter>
    </>
  );
}

function IntegrationsSection() {
  const connections = useIntegrations();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {connections.map((c) => (
        <IntegrationConnectCard
          key={c.provider}
          provider={c.provider}
          connection={c}
          onChange={updateIntegration}
        />
      ))}
    </div>
  );
}

function NotificationPreferencesSection() {
  const { getToken, isSignedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState({ releaseEmail: true, mentionEmail: true });

  useEffect(() => {
    if (!isSignedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const res = await apiFetch("/notifications/preferences", {}, token);
        if (!res.ok) throw new Error(String(res.status));
        const body = (await res.json()) as { releaseEmail: boolean; mentionEmail: boolean };
        if (cancelled) return;
        setPrefs({ releaseEmail: body.releaseEmail, mentionEmail: body.mentionEmail });
      } catch {
        /* keep defaults */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, getToken]);

  async function persist(next: { releaseEmail: boolean; mentionEmail: boolean }) {
    setSaving(true);
    try {
      const token = await getToken();
      const res = await apiFetch(
        "/notifications/preferences",
        {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(next),
        },
        token,
      );
      if (!res.ok) throw new Error(String(res.status));
      toast.success("Notification preferences saved");
    } catch {
      toast.error("Couldn't save notification preferences");
    } finally {
      setSaving(false);
    }
  }

  const toggle = (key: "releaseEmail" | "mentionEmail") => {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    void persist(next);
  };

  return (
    <Card className="p-6 space-y-5 max-w-2xl">
      <div>
        <div className="text-sm font-semibold">Email notifications</div>
        <p className="text-xs text-muted-foreground mt-0.5">
          In-app notifications always land in the bell. Use these switches to control which
          categories also email you. Free tier is capped at 100 sends per day across the whole
          workspace.
        </p>
      </div>
      <div className="border-t pt-4 space-y-4">
        <PrefRow
          label="Release announcements"
          description="Recap email whenever Pulse HR ships a new version."
          checked={prefs.releaseEmail}
          disabled={loading || saving}
          onCheckedChange={() => toggle("releaseEmail")}
        />
        <PrefRow
          label="@mentions in replies"
          description="Someone tags you in a comment thread."
          checked={prefs.mentionEmail}
          disabled={loading || saving}
          onCheckedChange={() => toggle("mentionEmail")}
        />
      </div>
    </Card>
  );
}

function PrefRow({
  label,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted-foreground mt-0.5">{description}</div>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  );
}
