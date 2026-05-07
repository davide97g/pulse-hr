import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@pulse-hr/ui/primitives/dropdown-menu";
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
import { activitiesTable, useActivities } from "@/lib/tables/activities";
import { useProjects } from "@/lib/tables/projects";
import { useEmployees, employeeById } from "@/lib/tables/employees";
import { ActivityDialog } from "@/components/pm/ActivityDialog";
import {
  type Activity,
  type ActivityStatus,
  type Project,
} from "@/lib/mock-data";

const MONTHS_IT_SHORT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

type ColumnTone = "muted" | "fg" | "info" | "warn" | "spark" | "danger";

const COLUMNS: Array<{
  id: ActivityStatus;
  label: string;
  tone: ColumnTone;
}> = [
  { id: "todo", label: "DA FARE", tone: "muted" },
  { id: "in_progress", label: "IN CORSO", tone: "info" },
  { id: "review", label: "REVIEW", tone: "warn" },
  { id: "blocked", label: "BLOCCATE", tone: "danger" },
  { id: "done", label: "COMPLETATE", tone: "spark" },
];

function toneVar(t: ColumnTone): string {
  switch (t) {
    case "info":
      return "var(--info, var(--fg))";
    case "warn":
      return "var(--warning, var(--fg))";
    case "spark":
      return "var(--spark)";
    case "danger":
      return "var(--destructive)";
    case "fg":
      return "var(--fg)";
    default:
      return "var(--muted-foreground)";
  }
}

function fmtShortDate(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]}`;
}

function dueLabel(a: Activity): { text: string; spark: boolean } {
  if (!a.endDate) return { text: "senza scadenza", spark: false };
  const due = new Date(a.endDate).getTime();
  const days = Math.round((due - Date.now()) / 86_400_000);
  if (a.status === "done") return { text: fmtShortDate(a.endDate), spark: false };
  if (days < 0) return { text: `${Math.abs(days)}g in ritardo`, spark: true };
  if (days === 0) return { text: "oggi", spark: true };
  if (days === 1) return { text: "domani", spark: false };
  if (days < 7) return { text: `tra ${days}g`, spark: false };
  return { text: fmtShortDate(a.endDate), spark: false };
}

export function ActivitiesEditorial() {
  const navigate = useNavigate();
  const activities = useActivities();
  const projects = useProjects();
  const employees = useEmployees();

  const [dialog, setDialog] = useState<{
    open: boolean;
    projectId: string | null;
    initial: Activity | null;
    defaultStatus?: ActivityStatus;
  }>({ open: false, projectId: null, initial: null });
  const [toRemove, setToRemove] = useState<Activity | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const grouped = useMemo(() => {
    const map = new Map<ActivityStatus, Activity[]>();
    for (const c of COLUMNS) map.set(c.id, []);
    for (const a of activities) {
      const list = map.get(a.status);
      if (list) list.push(a);
    }
    for (const list of map.values()) {
      list.sort((a, b) => {
        const ad = a.endDate ? new Date(a.endDate).getTime() : Infinity;
        const bd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
        return ad - bd;
      });
    }
    return map;
  }, [activities]);

  const stats = useMemo(() => {
    return {
      total: activities.length,
      open: activities.filter((a) => a.status === "in_progress").length,
      review: activities.filter((a) => a.status === "review").length,
      blocked: activities.filter((a) => a.status === "blocked").length,
      done: activities.filter((a) => a.status === "done").length,
    };
  }, [activities]);

  const sortedProjects = useMemo(
    () => [...projects].sort((a, b) => a.name.localeCompare(b.name)),
    [projects],
  );

  const onSave = (next: Activity) => {
    const exists = activitiesTable.getAll().some((a) => a.id === next.id);
    if (exists) {
      activitiesTable.update(next.id, next);
      toast.success("Attività aggiornata");
    } else {
      activitiesTable.add(next);
      toast.success("Attività creata");
    }
  };

  const onRemove = (a: Activity) => {
    activitiesTable.remove(a.id);
    toast(`“${a.title}” rimossa`, {
      action: { label: "Annulla", onClick: () => activitiesTable.add(a) },
    });
  };

  const openCreate = (projectId: string, status: ActivityStatus = "todo") =>
    setDialog({ open: true, projectId, initial: null, defaultStatus: status });

  const handleDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const handleDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const id = String(e.active.id);
    const overId = e.over?.id;
    if (!overId) return;
    const dest = String(overId) as ActivityStatus;
    const current = activities.find((a) => a.id === id);
    if (!current || current.status === dest) return;
    const prev = current.status;
    activitiesTable.update(id, { status: dest });
    const destLabel = COLUMNS.find((c) => c.id === dest)?.label.toLowerCase() ?? dest;
    toast.success(`Spostata in ${destLabel}`, {
      action: {
        label: "Annulla",
        onClick: () => activitiesTable.update(id, { status: prev }),
      },
    });
  };

  const activeActivity = activeId ? activities.find((a) => a.id === activeId) : null;
  const activeProject = activeActivity
    ? projects.find((p) => p.id === activeActivity.projectId)
    : null;
  const activeAssignee = activeActivity?.assigneeId
    ? employeeById(activeActivity.assigneeId) ??
      employees.find((e) => e.id === activeActivity.assigneeId) ??
      null
    : null;

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-6 min-h-[calc(100vh-3.5rem)]">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ATTIVITÀ · {stats.total} TOTALI · {stats.open} IN CORSO · {stats.review} IN REVIEW
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "10px 0 0",
              fontSize: "clamp(72px, 9vw, 124px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>Attività</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 14,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 19,
              lineHeight: 1.35,
            }}
          >
            Cosa il team sta portando avanti, su tutti i projects.
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button type="button" className="pill pill-dark pill-sm">
                + Attività
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto w-64">
              <DropdownMenuLabel>Scegli project</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {sortedProjects.length === 0 ? (
                <DropdownMenuItem disabled>Nessun project</DropdownMenuItem>
              ) : (
                sortedProjects.map((p) => (
                  <DropdownMenuItem key={p.id} onClick={() => openCreate(p.id, "todo")}>
                    <span className="flex items-center justify-between w-full gap-3">
                      <span className="truncate">{p.name}</span>
                      <span
                        className="t-mono shrink-0"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        {p.code}
                      </span>
                    </span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActiveId(null)}
      >
        <div
          className="grid gap-3.5 flex-1 min-h-[480px] overflow-x-auto pb-1"
          style={{ gridTemplateColumns: "repeat(5, minmax(240px, 1fr))" }}
        >
          {COLUMNS.map((col) => {
            const list = grouped.get(col.id) ?? [];
            return (
              <Column
                key={col.id}
                id={col.id}
                label={col.label}
                tone={col.tone}
                count={list.length}
                onAdd={() => {
                  if (sortedProjects[0]) openCreate(sortedProjects[0].id, col.id);
                }}
                addDisabled={sortedProjects.length === 0}
              >
                {list.length === 0 ? (
                  <div
                    className="t-mono text-center py-3"
                    style={{
                      color: "var(--muted-foreground)",
                      border: "1px dashed var(--line)",
                      borderRadius: 12,
                    }}
                  >
                    TRASCINA QUI
                  </div>
                ) : (
                  list.map((a) => {
                    const project = projects.find((p) => p.id === a.projectId);
                    const assignee = a.assigneeId
                      ? employeeById(a.assigneeId) ??
                        employees.find((e) => e.id === a.assigneeId) ??
                        null
                      : null;
                    return (
                      <DraggableCard
                        key={a.id}
                        activity={a}
                        projectCode={project?.code}
                        assigneeName={assignee?.name}
                        assigneeInitials={assignee?.initials}
                        spark={col.tone === "spark"}
                        onOpen={() =>
                          navigate({
                            to: "/activities/$activityId",
                            params: { activityId: a.id },
                          })
                        }
                        onEdit={() =>
                          setDialog({
                            open: true,
                            projectId: a.projectId,
                            initial: a,
                          })
                        }
                        onMove={(status) => {
                          if (status === a.status) return;
                          const prev = a.status;
                          activitiesTable.update(a.id, { status });
                          const destLabel =
                            COLUMNS.find((c) => c.id === status)?.label.toLowerCase() ?? status;
                          toast.success(`Spostata in ${destLabel}`, {
                            action: {
                              label: "Annulla",
                              onClick: () =>
                                activitiesTable.update(a.id, { status: prev }),
                            },
                          });
                        }}
                        onRemove={() => setToRemove(a)}
                      />
                    );
                  })
                )}
              </Column>
            );
          })}
        </div>

        <DragOverlay>
          {activeActivity ? (
            <CardSurface
              activity={activeActivity}
              projectCode={activeProject?.code}
              assigneeName={activeAssignee?.name}
              assigneeInitials={activeAssignee?.initials}
              spark={activeActivity.status === "done"}
              dragging
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {dialog.projectId && (
        <ActivityDialog
          open={dialog.open}
          onClose={() => setDialog({ open: false, projectId: null, initial: null })}
          onSave={onSave}
          initial={dialog.initial}
          projectId={dialog.projectId}
          defaultStatus={dialog.defaultStatus}
        />
      )}

      <AlertDialog
        open={!!toRemove}
        onOpenChange={(v) => !v && setToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina “{toRemove?.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              Verrà rimossa anche da dipendenze e timeline del project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toRemove) onRemove(toRemove);
                setToRemove(null);
              }}
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function Column({
  id,
  label,
  tone,
  count,
  onAdd,
  addDisabled,
  children,
}: {
  id: ActivityStatus;
  label: string;
  tone: ColumnTone;
  count: number;
  onAdd: () => void;
  addDisabled?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const c = toneVar(tone);
  return (
    <section
      ref={setNodeRef}
      className="flex flex-col gap-2.5 min-h-0 overflow-hidden"
      style={{
        background: isOver
          ? "color-mix(in oklch, var(--fg) 4%, transparent)"
          : "transparent",
        borderRadius: 12,
        transition: "background 120ms",
      }}
    >
      <div style={{ borderTop: `2px solid ${c}`, paddingTop: 12, paddingBottom: 4 }}>
        <div className="flex justify-between items-center">
          <span className="t-mono" style={{ color: c }}>
            {label}
          </span>
          <span
            className="t-num"
            style={{ fontSize: 14, color: "var(--muted-foreground)" }}
          >
            {count}
          </span>
        </div>
        <div
          className="t-num mt-1.5"
          style={{
            fontSize: 36,
            letterSpacing: "-0.03em",
            color: tone === "spark" ? "var(--spark)" : "var(--fg)",
          }}
        >
          {String(count).padStart(2, "0")}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 pr-1 pb-1">
        {children}
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled}
          className="t-mono"
          style={{
            border: "1px dashed var(--line)",
            borderRadius: 12,
            background: "transparent",
            color: "var(--muted-foreground)",
            padding: "8px 12px",
            cursor: addDisabled ? "not-allowed" : "pointer",
            textAlign: "center",
          }}
        >
          + AGGIUNGI
        </button>
      </div>
    </section>
  );
}

function DraggableCard({
  activity,
  projectCode,
  assigneeName,
  assigneeInitials,
  spark,
  onOpen,
  onEdit,
  onMove,
  onRemove,
}: {
  activity: Activity;
  projectCode?: string;
  assigneeName?: string;
  assigneeInitials?: string;
  spark: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onMove: (s: ActivityStatus) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: activity.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.3 : 1, cursor: "grab" }}
    >
      <CardSurface
        activity={activity}
        projectCode={projectCode}
        assigneeName={assigneeName}
        assigneeInitials={assigneeInitials}
        spark={spark}
        onOpen={onOpen}
        onEdit={onEdit}
        onMove={onMove}
        onRemove={onRemove}
      />
    </div>
  );
}

function CardSurface({
  activity,
  projectCode,
  assigneeName,
  assigneeInitials,
  spark,
  dragging,
  onOpen,
  onEdit,
  onMove,
  onRemove,
}: {
  activity: Activity;
  projectCode?: string;
  assigneeName?: string;
  assigneeInitials?: string;
  spark: boolean;
  dragging?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onMove?: (s: ActivityStatus) => void;
  onRemove?: () => void;
}) {
  const due = dueLabel(activity);
  return (
    <article
      onClick={onOpen}
      style={{
        border: `1px solid ${spark ? "var(--spark)" : "var(--line)"}`,
        borderRadius: 12,
        padding: "12px 14px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        background: spark
          ? "color-mix(in oklch, var(--spark) 5%, transparent)"
          : "var(--bg)",
        boxShadow: dragging
          ? "0 12px 32px -12px color-mix(in oklch, var(--fg) 30%, transparent)"
          : "none",
        transform: dragging ? "rotate(1.5deg)" : "none",
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
          {projectCode ?? "—"}
        </span>
        {(onEdit || onMove || onRemove) && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
                className="t-mono"
                style={{
                  background: "transparent",
                  border: 0,
                  color: "var(--muted-foreground)",
                  cursor: "pointer",
                  padding: "0 4px",
                  lineHeight: 1,
                }}
                aria-label="Menu attività"
              >
                ···
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {onEdit && <DropdownMenuItem onClick={onEdit}>Modifica</DropdownMenuItem>}
              {onMove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Sposta in</DropdownMenuLabel>
                  {COLUMNS.filter((s) => s.id !== activity.status).map((s) => (
                    <DropdownMenuItem key={s.id} onClick={() => onMove(s.id)}>
                      {s.label}
                    </DropdownMenuItem>
                  ))}
                </>
              )}
              {onRemove && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={onRemove}>
                    Elimina
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          letterSpacing: "-0.005em",
          lineHeight: 1.3,
        }}
      >
        {activity.title}
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {assigneeInitials ? (
            <>
              <span className="ph-avatar ph-avatar-xs">{assigneeInitials}</span>
              <span
                className="t-mono truncate"
                style={{ color: "var(--muted-foreground)" }}
              >
                {assigneeName?.split(" ")[0] ?? ""}
              </span>
            </>
          ) : (
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              NON ASSEGNATA
            </span>
          )}
        </div>
        <span
          className="t-mono"
          style={{
            color: due.spark ? "var(--destructive)" : "var(--muted-foreground)",
          }}
        >
          {due.text}
        </span>
      </div>
    </article>
  );
}

export type { Project };
