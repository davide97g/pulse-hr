import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  CheckCircle2, Circle, Plus, Trash2, GraduationCap, UserMinus, Pencil, KeyRound,
  FileText, Users as UsersIcon, Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { EmptyState } from "@/components/app/EmptyState";
import { Progress } from "@/components/ui/progress";
import {
  onboardingWorkflows as seed, type OnboardingWorkflow, type OnboardingTask,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({ meta: [{ title: "Onboarding — Pulse HR" }] }),
  component: Onboarding,
});

const categoryIcon: Record<OnboardingTask["category"], React.ReactNode> = {
  Paperwork: <FileText className="h-3 w-3" />,
  Access: <KeyRound className="h-3 w-3" />,
  People: <UsersIcon className="h-3 w-3" />,
  Training: <GraduationCap className="h-3 w-3" />,
};

function Onboarding() {
  const [workflows, setWorkflows] = useState<OnboardingWorkflow[]>(seed);
  const [activeId, setActiveId] = useState<string>(seed[0]?.id ?? "");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [newWorkflowOpen, setNewWorkflowOpen] = useState(false);
  const [toDelete, setToDelete] = useState<OnboardingWorkflow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { const t = setTimeout(() => setLoading(false), 420); return () => clearTimeout(t); }, []);

  const active = workflows.find(w => w.id === activeId);

  const updateWorkflow = (id: string, patch: Partial<OnboardingWorkflow>) =>
    setWorkflows(ws => ws.map(w => (w.id === id ? { ...w, ...patch } : w)));

  const toggleTask = (tid: string) => {
    if (!active) return;
    updateWorkflow(active.id, {
      tasks: active.tasks.map(t => (t.id === tid ? { ...t, done: !t.done } : t)),
    });
    const t = active.tasks.find(x => x.id === tid);
    if (t && !t.done) toast.success(`Completed: ${t.label}`);
  };

  const addTask = (data: Omit<OnboardingTask, "id" | "done">) => {
    if (!active) return;
    const t: OnboardingTask = { ...data, id: `t-${Date.now()}`, done: false };
    updateWorkflow(active.id, { tasks: [...active.tasks, t] });
    toast.success("Task added");
  };

  const removeTask = (tid: string) => {
    if (!active) return;
    updateWorkflow(active.id, { tasks: active.tasks.filter(t => t.id !== tid) });
    toast("Task removed");
  };

  const createWorkflow = (data: { name: string; role: string; startDate: string; type: OnboardingWorkflow["type"] }) => {
    const initials = data.name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
    const w: OnboardingWorkflow = {
      id: `ow-${Date.now()}`,
      name: data.name, role: data.role, startDate: data.startDate, type: data.type,
      initials, color: "oklch(0.6 0.18 258)",
      tasks: data.type === "onboarding"
        ? [
            { id: "t1", label: "Send offer letter",     done: false, owner: "HR",     category: "Paperwork" },
            { id: "t2", label: "Order laptop",          done: false, owner: "IT",     category: "Access" },
            { id: "t3", label: "Schedule welcome call", done: false, owner: "Manager", category: "People" },
          ]
        : [
            { id: "t1", label: "Exit interview",  done: false, owner: "HR", category: "People" },
            { id: "t2", label: "Revoke access",   done: false, owner: "IT", category: "Access" },
            { id: "t3", label: "Return equipment", done: false, owner: "Employee", category: "Access" },
          ],
    };
    setWorkflows(ws => [w, ...ws]);
    setActiveId(w.id);
    toast.success(`${w.type === "onboarding" ? "Onboarding" : "Offboarding"} started`, { description: `For ${w.name}` });
  };

  const removeWorkflow = (w: OnboardingWorkflow) => {
    setWorkflows(ws => ws.filter(x => x.id !== w.id));
    if (activeId === w.id) setActiveId(workflows.find(x => x.id !== w.id)?.id ?? "");
    toast("Workflow deleted", { action: { label: "Undo", onClick: () => setWorkflows(ws => [w, ...ws]) } });
  };

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto fade-in">
      <PageHeader
        title="Onboarding & offboarding"
        description="Active people workflows — track every step for new hires and leavers"
        actions={<Button size="sm" className="press-scale" onClick={() => setNewWorkflowOpen(true)}><Plus className="h-4 w-4 mr-1.5" />New workflow</Button>}
      />

      <Tabs defaultValue="active" className="mb-4">
        <TabsList>
          <TabsTrigger value="active"><Sparkles className="h-3.5 w-3.5 mr-1.5" />Active ({workflows.filter(w => w.type === "onboarding").length})</TabsTrigger>
          <TabsTrigger value="offboarding"><UserMinus className="h-3.5 w-3.5 mr-1.5" />Offboarding ({workflows.filter(w => w.type === "offboarding").length})</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-4">
          <WorkflowsView
            loading={loading}
            workflows={workflows.filter(w => w.type === "onboarding")}
            activeId={activeId} setActiveId={setActiveId}
            active={active?.type === "onboarding" ? active : undefined}
            toggleTask={toggleTask} removeTask={removeTask}
            onAddTask={() => setNewTaskOpen(true)}
            onNew={() => setNewWorkflowOpen(true)}
            onDelete={setToDelete}
          />
        </TabsContent>
        <TabsContent value="offboarding" className="mt-4">
          <WorkflowsView
            loading={loading}
            workflows={workflows.filter(w => w.type === "offboarding")}
            activeId={activeId} setActiveId={setActiveId}
            active={active?.type === "offboarding" ? active : undefined}
            toggleTask={toggleTask} removeTask={removeTask}
            onAddTask={() => setNewTaskOpen(true)}
            onNew={() => setNewWorkflowOpen(true)}
            onDelete={setToDelete}
          />
        </TabsContent>
      </Tabs>

      <SidePanel open={newTaskOpen} onClose={() => setNewTaskOpen(false)} title="Add task">
        <NewTaskForm onCancel={() => setNewTaskOpen(false)} onSave={d => { addTask(d); setNewTaskOpen(false); }} />
      </SidePanel>

      <SidePanel open={newWorkflowOpen} onClose={() => setNewWorkflowOpen(false)} title="New workflow">
        <NewWorkflowForm onCancel={() => setNewWorkflowOpen(false)} onSave={d => { createWorkflow(d); setNewWorkflowOpen(false); }} />
      </SidePanel>

      <AlertDialog open={!!toDelete} onOpenChange={o => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete workflow?</AlertDialogTitle>
            <AlertDialogDescription>{toDelete && `${toDelete.name}'s ${toDelete.type} workflow will be removed.`}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (toDelete) removeWorkflow(toDelete); setToDelete(null); }}
            >Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function WorkflowsView({
  loading, workflows, activeId, setActiveId, active, toggleTask, removeTask, onAddTask, onNew, onDelete,
}: {
  loading: boolean;
  workflows: OnboardingWorkflow[];
  activeId: string;
  setActiveId: (id: string) => void;
  active?: OnboardingWorkflow;
  toggleTask: (id: string) => void;
  removeTask: (id: string) => void;
  onAddTask: () => void;
  onNew: () => void;
  onDelete: (w: OnboardingWorkflow) => void;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="space-y-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 shimmer rounded-md" />)}</div>
        <Card className="p-6"><div className="h-5 w-[40%] shimmer rounded mb-4" /><div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 shimmer rounded" />)}</div></Card>
      </div>
    );
  }
  if (workflows.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="No workflows here"
        description="Start a workflow to kick off structured tasks for a teammate."
        action={<Button size="sm" onClick={onNew}><Plus className="h-4 w-4 mr-1.5" />New workflow</Button>}
      />
    );
  }
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
      <div className="space-y-2 stagger-in">
        {workflows.map(w => {
          const done = w.tasks.filter(t => t.done).length;
          const pct = Math.round((done / Math.max(1, w.tasks.length)) * 100);
          return (
            <button
              key={w.id}
              onClick={() => setActiveId(w.id)}
              className={cn(
                "w-full text-left p-3 rounded-md border transition-colors press-scale",
                activeId === w.id ? "border-primary bg-primary/5" : "hover:bg-muted/40"
              )}
            >
              <div className="flex items-center gap-2.5 mb-2">
                <Avatar initials={w.initials} color={w.color} size={28} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{w.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">{w.role}</div>
                </div>
              </div>
              <Progress value={pct} className="h-1.5" />
              <div className="text-[10px] text-muted-foreground mt-1 tabular-nums">{done}/{w.tasks.length} · {pct}%</div>
            </button>
          );
        })}
      </div>
      {active ? (
        <Card className="p-0 overflow-hidden overflow-x-auto scrollbar-thin [&_table]:min-w-[640px]">
          <div className="p-5 border-b flex items-center gap-4">
            <Avatar initials={active.initials} color={active.color} size={48} />
            <div className="flex-1">
              <div className="text-lg font-semibold">{active.name}</div>
              <div className="text-sm text-muted-foreground">{active.role} · Starts {active.startDate}</div>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" className="press-scale" onClick={onAddTask}><Plus className="h-3.5 w-3.5 mr-1.5" />Task</Button>
              <Button size="icon" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => onDelete(active)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          </div>
          <div className="p-5 stagger-in">
            {active.tasks.length === 0 ? (
              <EmptyState compact icon={<Circle className="h-6 w-6" />} title="No tasks yet" action={<Button size="sm" onClick={onAddTask}><Plus className="h-4 w-4 mr-1.5" />Add task</Button>} />
            ) : (
              <ul className="space-y-1">
                {active.tasks.map(t => (
                  <li key={t.id} className="group flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-muted/40 transition-colors">
                    <button onClick={() => toggleTask(t.id)} className="press-scale">
                      {t.done
                        ? <CheckCircle2 className="h-5 w-5 text-success" />
                        : <Circle className="h-5 w-5 text-muted-foreground/50" />}
                    </button>
                    <div className={cn("flex-1 text-sm", t.done && "line-through text-muted-foreground")}>{t.label}</div>
                    <span className="text-[10px] inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-muted-foreground">
                      {categoryIcon[t.category]}{t.category}
                    </span>
                    <div className="text-xs text-muted-foreground hidden md:block w-24 truncate">{t.owner}</div>
                    <button
                      onClick={() => removeTask(t.id)}
                      className="h-7 w-7 rounded-md flex items-center justify-center text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      ) : (
        <Card className="p-0"><EmptyState compact icon={<Pencil className="h-6 w-6" />} title="Select a workflow" /></Card>
      )}
    </div>
  );
}

function NewTaskForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: Omit<OnboardingTask, "id" | "done">) => void }) {
  const [label, setLabel] = useState("");
  const [owner, setOwner] = useState("Aisha Patel");
  const [category, setCategory] = useState<OnboardingTask["category"]>("Paperwork");
  const [due, setDue] = useState("");
  return (
    <>
      <div className="p-5 space-y-4">
        <div className="space-y-1.5"><Label>Task</Label><Input value={label} onChange={e => setLabel(e.target.value)} placeholder="Schedule intro call" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5"><Label>Owner</Label><Input value={owner} onChange={e => setOwner(e.target.value)} /></div>
          <div className="space-y-1.5"><Label>Due</Label><Input type="date" value={due} onChange={e => setDue(e.target.value)} /></div>
        </div>
        <div className="space-y-1.5"><Label>Category</Label>
          <Select value={category} onValueChange={v => setCategory(v as OnboardingTask["category"])}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["Paperwork","Access","People","Training"] as const).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!label.trim()} onClick={() => onSave({ label, owner, category, due })}>Add task</Button>
      </div>
    </>
  );
}

function NewWorkflowForm({ onCancel, onSave }: { onCancel: () => void; onSave: (d: { name: string; role: string; startDate: string; type: OnboardingWorkflow["type"] }) => void }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [type, setType] = useState<OnboardingWorkflow["type"]>("onboarding");
  return (
    <>
      <div className="p-5 space-y-4">
        <div className="space-y-1.5"><Label>Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(["onboarding","offboarding"] as const).map(t => (
              <button key={t} type="button" onClick={() => setType(t)} className={cn("text-xs py-2.5 rounded-md border capitalize press-scale", type === t ? "border-primary bg-primary/5 text-primary font-medium" : "hover:bg-muted")}>{t}</button>
            ))}
          </div>
        </div>
        <div className="space-y-1.5"><Label>Employee name</Label><Input value={name} onChange={e => setName(e.target.value)} placeholder="Emma Wilson" /></div>
        <div className="space-y-1.5"><Label>Role</Label><Input value={role} onChange={e => setRole(e.target.value)} placeholder="Senior Engineer" /></div>
        <div className="space-y-1.5"><Label>{type === "onboarding" ? "Start date" : "Last day"}</Label><Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} /></div>
        <div className="rounded-md bg-info/5 border border-info/20 p-3 text-xs">
          A default task template for <strong>{type}</strong> will be pre-filled. You can edit tasks afterwards.
        </div>
      </div>
      <div className="px-5 py-3 border-t flex justify-end gap-2 sticky bottom-0 bg-card">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button disabled={!name.trim() || !role.trim()} onClick={() => onSave({ name, role, startDate, type })}>Create workflow</Button>
      </div>
    </>
  );
}
