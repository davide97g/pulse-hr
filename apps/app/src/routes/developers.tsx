import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Copy, Plus, Webhook as WebhookIcon, Key, Code2, Trash2, Eye, EyeOff, MoreHorizontal, Play, Pause,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows } from "@/components/app/SkeletonList";
import {
  apiKeysSeed, webhooksSeed, customFieldsSeed,
  type ApiKey, type Webhook, type CustomField,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/developers")({
  head: () => ({ meta: [{ title: "Developers — Pulse HR" }] }),
  component: Developers,
});

function Developers() {
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>(apiKeysSeed);
  const [hooks, setHooks] = useState<Webhook[]>(webhooksSeed);
  const [fields, setFields] = useState<CustomField[]>(customFieldsSeed);
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [newKeyOpen, setNewKeyOpen] = useState(false);
  const [newHookOpen, setNewHookOpen] = useState(false);
  const [newFieldOpen, setNewFieldOpen] = useState(false);
  const [deleteKey, setDeleteKey] = useState<ApiKey | null>(null);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 420); return () => clearTimeout(t); }, []);

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader
        title="Developers"
        description="API keys, webhooks and custom workflows"
        actions={<Button size="sm" variant="outline" className="press-scale" onClick={() => toast("API docs", { description: "Opening developer reference" })}><Code2 className="h-4 w-4 mr-1.5" />API docs</Button>}
      />

      <Tabs defaultValue="keys">
        <TabsList>
          <TabsTrigger value="keys"><Key className="h-3.5 w-3.5 mr-1.5" />API keys</TabsTrigger>
          <TabsTrigger value="webhooks"><WebhookIcon className="h-3.5 w-3.5 mr-1.5" />Webhooks</TabsTrigger>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="fields">Custom fields</TabsTrigger>
        </TabsList>

        <TabsContent value="keys" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Active keys</div>
              <Button size="sm" className="press-scale" onClick={() => setNewKeyOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />New key
              </Button>
            </div>
            {loading ? (
              <SkeletonRows rows={2} avatar={false} />
            ) : keys.length === 0 ? (
              <EmptyState
                compact
                icon={<Key className="h-6 w-6" />}
                title="No API keys"
                description="Generate one to call the Pulse HR API."
                action={<Button size="sm" onClick={() => setNewKeyOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Generate key</Button>}
              />
            ) : (
              <div className="divide-y stagger-in">
                {keys.map(k => (
                  <div key={k.id} className="px-5 py-3.5 flex items-center gap-4 group">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium">{k.name}</div>
                        <span className={cn("text-[10px] uppercase px-1.5 py-0.5 rounded border font-medium", k.env === "prod" ? "text-destructive border-destructive/30 bg-destructive/5" : "text-muted-foreground")}>
                          {k.env}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="text-xs text-muted-foreground font-mono">
                          {showKey[k.id] ? k.key : k.key.replace(/(.{8}).+(.{4})$/, "$1••••••••••$2")}
                        </code>
                        <button onClick={() => setShowKey(s => ({ ...s, [k.id]: !s[k.id] }))} className="text-muted-foreground hover:text-foreground">
                          {showKey[k.id] ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                      </div>
                      <div className="text-[11px] text-muted-foreground mt-0.5">Created {k.createdAt} · Last used {k.lastUsed}</div>
                    </div>
                    <StatusBadge status={k.status === "active" ? "active" : "rejected"} />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { navigator.clipboard?.writeText(k.key); toast.success("API key copied"); }}>
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => setDeleteKey(k)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="mt-4">
          <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
            <div className="px-5 py-4 border-b flex items-center justify-between">
              <div className="font-semibold text-sm">Webhook endpoints</div>
              <Button size="sm" className="press-scale" onClick={() => setNewHookOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />Add endpoint
              </Button>
            </div>
            {loading ? (
              <SkeletonRows rows={3} avatar={false} />
            ) : hooks.length === 0 ? (
              <EmptyState compact icon={<WebhookIcon className="h-6 w-6" />} title="No webhooks"
                action={<Button size="sm" onClick={() => setNewHookOpen(true)}><Plus className="h-4 w-4 mr-1.5" />Add endpoint</Button>}
              />
            ) : (
              <div className="divide-y stagger-in">
                {hooks.map(w => (
                  <div key={w.id} className="px-5 py-3.5">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <code className="text-sm font-mono truncate flex-1">{w.url}</code>
                      <StatusBadge status={w.status === "active" ? "active" : w.status === "pending" ? "pending" : "draft"} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"><MoreHorizontal className="h-4 w-4" /></button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.success("Test ping sent — HTTP 200")}><Play className="h-4 w-4 mr-2" />Send test event</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setHooks(hs => hs.map(x => x.id === w.id ? { ...x, status: x.status === "active" ? "paused" : "active" } : x))}>
                            {w.status === "active" ? <><Pause className="h-4 w-4 mr-2" />Pause</> : <><Play className="h-4 w-4 mr-2" />Resume</>}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => { setHooks(hs => hs.filter(x => x.id !== w.id)); toast("Webhook removed"); }}>
                            <Trash2 className="h-4 w-4 mr-2" />Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                      {w.events.map(e => (
                        <span key={e} className="text-[11px] px-2 py-0.5 rounded bg-muted font-mono">{e}</span>
                      ))}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-2 tabular-nums">{w.deliveries.toLocaleString()} deliveries</div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="mt-4">
          <WorkflowBuilder />
        </TabsContent>

        <TabsContent value="fields" className="mt-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="font-semibold text-sm">Custom employee fields</div>
              <Button size="sm" variant="outline" className="press-scale" onClick={() => setNewFieldOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />Add field
              </Button>
            </div>
            {fields.length === 0 ? (
              <EmptyState compact icon={<Plus className="h-6 w-6" />} title="No custom fields" />
            ) : (
              <div className="space-y-2 stagger-in">
                {fields.map(f => (
                  <div key={f.id} className="flex items-center justify-between p-3 rounded-md border hover:bg-muted/40 transition-colors">
                    <div>
                      <div className="text-sm font-medium">{f.name} {f.required && <span className="text-destructive">*</span>}</div>
                      <div className="text-xs text-muted-foreground">{f.type}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => toast(`Editing ${f.name}`)}>Edit</Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setFields(fs => fs.filter(x => x.id !== f.id)); toast("Field removed"); }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={newKeyOpen} onOpenChange={setNewKeyOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Generate API key</DialogTitle><DialogDescription>Copy and store it securely — it won't be shown again.</DialogDescription></DialogHeader>
          <NewKeyForm
            onCancel={() => setNewKeyOpen(false)}
            onSave={d => {
              const rand = Math.random().toString(36).slice(2, 14);
              const k: ApiKey = {
                id: `k-${Date.now()}`, name: d.name, env: d.env,
                key: `${d.env === "prod" ? "pk_live_" : "pk_test_"}${rand}`,
                createdAt: new Date().toISOString().slice(0, 10),
                lastUsed: "never", status: "active",
              };
              setKeys(ks => [k, ...ks]);
              toast.success("API key generated");
              setNewKeyOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newHookOpen} onOpenChange={setNewHookOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add webhook endpoint</DialogTitle></DialogHeader>
          <NewHookForm
            onCancel={() => setNewHookOpen(false)}
            onSave={d => {
              const w: Webhook = { id: `w-${Date.now()}`, url: d.url, events: d.events, status: "pending", deliveries: 0 };
              setHooks(hs => [w, ...hs]);
              toast.success("Webhook created", { description: "We'll send a verification ping." });
              setNewHookOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={newFieldOpen} onOpenChange={setNewFieldOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add custom field</DialogTitle></DialogHeader>
          <NewFieldForm
            onCancel={() => setNewFieldOpen(false)}
            onSave={d => {
              const f: CustomField = { ...d, id: `cf-${Date.now()}` };
              setFields(fs => [...fs, f]);
              toast.success("Field added");
              setNewFieldOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteKey} onOpenChange={o => !o && setDeleteKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Revoke API key?</AlertDialogTitle>
            <AlertDialogDescription>{deleteKey && `"${deleteKey.name}" will be revoked immediately. Services using this key will stop working.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteKey) {
                  setKeys(ks => ks.filter(x => x.id !== deleteKey.id));
                  toast("Key revoked");
                }
                setDeleteKey(null);
              }}
            >Revoke</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function NewKeyForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: { name: string; env: "prod" | "test" }) => void }) {
  const [name, setName] = useState("");
  const [env, setEnv] = useState<"prod" | "test">("test");
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="CI pipeline" autoFocus /></div>
        <div className="space-y-1.5"><Label>Environment</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["test","prod"] as const).map(e => (
              <button key={e} type="button" onClick={() => setEnv(e)} className={cn("text-xs py-2.5 rounded-md border press-scale uppercase", env === e ? (e === "prod" ? "border-destructive bg-destructive/5 text-destructive" : "border-primary bg-primary/5 text-primary") : "hover:bg-muted")}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onSave({ name, env })}>Generate</Button>
      </DialogFooter>
    </>
  );
}

const EVENT_OPTIONS = [
  "employee.created","employee.updated","employee.deleted",
  "timesheet.submitted","timesheet.approved",
  "leave.requested","leave.approved","leave.rejected",
  "expense.submitted","expense.approved",
  "payroll.completed",
];

function NewHookForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: { url: string; events: string[] }) => void }) {
  const [url, setUrl] = useState("");
  const [events, setEvents] = useState<string[]>(["employee.created"]);
  const toggle = (e: string) => setEvents(es => (es.includes(e) ? es.filter(x => x !== e) : [...es, e]));
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Endpoint URL</Label><Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/hooks/hr" autoFocus /></div>
        <div className="space-y-1.5"><Label>Events ({events.length})</Label>
          <div className="flex gap-1.5 flex-wrap">
            {EVENT_OPTIONS.map(e => (
              <button key={e} type="button" onClick={() => toggle(e)} className={cn("text-[11px] px-2 py-1 rounded font-mono press-scale transition-colors", events.includes(e) ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/60")}>
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!url.trim() || events.length === 0} onClick={() => onSave({ url: url.trim(), events })}>Create endpoint</Button>
      </DialogFooter>
    </>
  );
}

function NewFieldForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: { name: string; type: CustomField["type"]; required: boolean }) => void }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<CustomField["type"]>("Text");
  const [required, setRequired] = useState(false);
  return (
    <>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Field name</Label><Input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Favorite pizza" /></div>
        <div className="space-y-1.5"><Label>Type</Label>
          <div className="grid grid-cols-4 gap-2">
            {(["Text","Select","Number","Date"] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)} className={cn("text-xs py-2 rounded-md border press-scale", type === t ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted")}>{t}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} /> Required</label>
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!name.trim()} onClick={() => onSave({ name, type, required })}>Add field</Button>
      </DialogFooter>
    </>
  );
}

function WorkflowBuilder() {
  const [steps, setSteps] = useState<string[]>([
    "When employee is created",
    "Then send Slack message to #hr",
    "Then create Google Calendar event",
  ]);
  const [newStep, setNewStep] = useState("");

  return (
    <Card className="p-5">
      <div className="font-semibold text-sm mb-4">Visual workflow builder</div>
      <div className="space-y-2 stagger-in">
        {steps.map((s, i) => (
          <div key={i} className="group flex items-center gap-3 p-3 rounded-md border bg-muted/30">
            <div className="h-7 w-7 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-xs font-medium">{i + 1}</div>
            <div className="text-sm flex-1">{s}</div>
            <button
              onClick={() => setSteps(ss => ss.filter((_, j) => j !== i))}
              className="h-7 w-7 rounded-md text-destructive hover:bg-destructive/10 flex items-center justify-center opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-3">
        <Input
          value={newStep}
          onChange={e => setNewStep(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && newStep.trim()) { setSteps(ss => [...ss, newStep.trim()]); setNewStep(""); } }}
          placeholder="Then do… (press Enter)"
          className="h-9"
        />
        <Button size="sm" onClick={() => { if (newStep.trim()) { setSteps(ss => [...ss, newStep.trim()]); setNewStep(""); } }}>
          <Plus className="h-4 w-4 mr-1" />Add step
        </Button>
      </div>
      <Button className="w-full mt-3 press-scale" variant="outline" onClick={() => toast.success("Workflow saved", { description: `${steps.length} steps — active` })}>
        Save workflow
      </Button>
    </Card>
  );
}
