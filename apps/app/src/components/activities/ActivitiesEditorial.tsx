import { useMemo, useState, type CSSProperties } from "react";
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
import { type Activity, type ActivityStatus } from "@/lib/mock-data";

const ME_ID = "e1";

const MONTHS_IT_SHORT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

const HOURS_PER_DAY = 8;
const fmtDays = (h: number) => {
  const d = h / HOURS_PER_DAY;
  return d >= 100 || Number.isInteger(d) ? `${Math.round(d)}gg` : `${d.toFixed(1)}gg`;
};

const COLUMNS: Array<{
  id: ActivityStatus;
  label: string;
}> = [
  { id: "todo", label: "DA FARE" },
  { id: "in_progress", label: "IN CORSO" },
  { id: "review", label: "REVIEW" },
  { id: "blocked", label: "BLOCC." },
  { id: "done", label: "DONE" },
];

type Board = "mine" | "other";
type View = "kanban" | "list" | "timeline";

function fmtShort(iso?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")} ${MONTHS_IT_SHORT[d.getMonth()]}`;
}

function dueLabel(a: Activity): { text: string; spark: boolean } {
  if (!a.endDate) return { text: "—", spark: false };
  const due = new Date(a.endDate).getTime();
  const days = Math.round((due - Date.now()) / 86_400_000);
  if (a.status === "done") return { text: fmtShort(a.endDate), spark: false };
  if (days < 0) return { text: `${Math.abs(days)}g in ritardo`, spark: true };
  if (days === 0) return { text: "oggi", spark: true };
  if (days === 1) return { text: "domani", spark: false };
  return { text: fmtShort(a.endDate), spark: false };
}

export function ActivitiesEditorial() {
  const navigate = useNavigate();
  const activities = useActivities();
  const projects = useProjects();
  const employees = useEmployees();

  const [board, setBoard] = useState<Board>("mine");
  const [view, setView] = useState<View>("kanban");
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

  const filtered = useMemo(() => {
    return activities.filter((a) =>
      board === "mine" ? a.assigneeId === ME_ID : a.assigneeId !== ME_ID,
    );
  }, [activities, board]);

  const counts = useMemo(
    () => ({
      mine: activities.filter((a) => a.assigneeId === ME_ID).length,
      other: activities.filter((a) => a.assigneeId !== ME_ID).length,
    }),
    [activities],
  );

  const stats = useMemo(() => {
    const now = Date.now();
    const overdue = filtered.filter((a) => {
      if (!a.endDate || a.status === "done") return false;
      return new Date(a.endDate).getTime() < now;
    }).length;
    const dueToday = filtered.filter((a) => {
      if (!a.endDate || a.status === "done") return false;
      const due = new Date(a.endDate);
      const today = new Date();
      return (
        due.getFullYear() === today.getFullYear() &&
        due.getMonth() === today.getMonth() &&
        due.getDate() === today.getDate()
      );
    }).length;
    const completed = filtered.filter((a) => a.status === "done").length;
    return { total: filtered.length, overdue, dueToday, completed };
  }, [filtered]);

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
    toast(`«${a.title}» rimossa`, {
      action: { label: "Annulla", onClick: () => activitiesTable.add(a) },
    });
  };

  const openCreate = (status: ActivityStatus = "todo") => {
    const projectId = sortedProjects[0]?.id;
    if (!projectId) {
      toast.error("Crea prima una project");
      return;
    }
    setDialog({ open: true, projectId, initial: null, defaultStatus: status });
  };

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

  const titleMap: Record<Board, [string, string]> = {
    mine: ["Mie", `Le tue ${counts.mine} attività in volo, ordinate per scadenza.`],
    other: ["Altre", `${counts.other} attività degli altri membri del team.`],
  };

  return (
    <div className="ph p-4 md:p-6 flex flex-col gap-5 min-h-[calc(100vh-3.5rem)]">
      {/* HEADER */}
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
            ATTIVITÀ · {stats.total} CARDS
            {stats.dueToday > 0 && <> · {stats.dueToday} OGGI</>}
            {stats.overdue > 0 && (
              <>
                {" · "}
                <span style={{ color: "var(--spark)" }}>{stats.overdue} IN RITARDO</span>
              </>
            )}
          </span>
          <h1
            style={{
              fontFamily: "Fraunces, ui-serif, serif",
              fontWeight: 400,
              margin: "8px 0 0",
              fontSize: "clamp(40px, 11vw, 92px)",
              letterSpacing: "-0.045em",
              lineHeight: 0.86,
            }}
          >
            <span style={{ fontStyle: "italic" }}>{titleMap[board][0]}</span>
            <span style={{ color: "var(--spark)" }}>.</span>
          </h1>
          <p
            style={{
              marginTop: 8,
              maxWidth: 520,
              color: "var(--fg-2)",
              fontFamily: "Fraunces, ui-serif, serif",
              fontStyle: "italic",
              fontSize: 17,
              lineHeight: 1.35,
            }}
          >
            {titleMap[board][1]}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="pill pill-dark pill-sm"
            onClick={() => openCreate("todo")}
          >
            + Nuova
          </button>
        </div>
      </div>

      {/* TABS + VIEW SWITCHER */}
      <div
        className="flex justify-between items-center gap-3 flex-wrap"
        style={{ paddingBottom: 10, borderBottom: "1px solid var(--line-strong)" }}
      >
        <div className="flex gap-1.5">
          {(["mine", "other"] as Board[]).map((b) => {
            const active = b === board;
            const label =
              b === "mine" ? `MIE · ${counts.mine}` : `ALTRE · ${counts.other}`;
            return (
              <button
                key={b}
                type="button"
                onClick={() => setBoard(b)}
                className="t-mono"
                style={{
                  padding: "6px 14px",
                  borderRadius: 999,
                  background: active ? "var(--ink)" : "transparent",
                  color: active ? "var(--paper)" : "var(--fg-2)",
                  border: `1px solid ${active ? "var(--ink)" : "var(--line-strong)"}`,
                  cursor: "pointer",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
        <div
          className="flex gap-0"
          style={{
            border: "1px solid var(--line-strong)",
            borderRadius: 999,
            padding: 3,
            background: "var(--bg-2)",
          }}
        >
          {(
            [
              ["kanban", "KANBAN"],
              ["list", "LISTA"],
              ["timeline", "TIMELINE"],
            ] as Array<[View, string]>
          ).map(([id, label]) => {
            const active = id === view;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                className="t-mono"
                style={{
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: active ? "var(--bg)" : "transparent",
                  color: active ? "var(--fg)" : "var(--muted-foreground)",
                  border: 0,
                  cursor: "pointer",
                  boxShadow: active ? "0 1px 2px rgba(0,0,0,.08)" : "none",
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {view === "kanban" && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={() => setActiveId(null)}
        >
          <div
            className="grid gap-3 flex-1 min-h-[480px] overflow-x-auto pb-1"
            style={{ gridTemplateColumns: "repeat(5, minmax(220px, 1fr))" }}
          >
            {COLUMNS.map((col) => {
              const list = filtered
                .filter((a) => a.status === col.id)
                .sort((a, b) => {
                  const ad = a.endDate ? new Date(a.endDate).getTime() : Infinity;
                  const bd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
                  return ad - bd;
                });
              return (
                <KanbanColumn
                  key={col.id}
                  id={col.id}
                  label={col.label}
                  count={list.length}
                  isAlert={col.id === "blocked"}
                  onAdd={() => openCreate(col.id)}
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
                      VUOTO
                    </div>
                  ) : (
                    list.map((a) => {
                      const project = projects.find((p) => p.id === a.projectId);
                      const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
                      return (
                        <DraggableCard
                          key={a.id}
                          activity={a}
                          projectCode={project?.code}
                          assigneeName={assignee?.name}
                          assigneeInitials={assignee?.initials}
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
                              COLUMNS.find((c) => c.id === status)?.label.toLowerCase() ??
                              status;
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
                </KanbanColumn>
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
                dragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      )}

      {view === "list" && (
        <ListView
          data={filtered}
          onOpen={(a) =>
            navigate({ to: "/activities/$activityId", params: { activityId: a.id } })
          }
          onEdit={(a) => setDialog({ open: true, projectId: a.projectId, initial: a })}
        />
      )}

      {view === "timeline" && <TimelineView data={filtered} />}

      {dialog.projectId && (
        <ActivityDialog
          open={dialog.open}
          onClose={() =>
            setDialog({ open: false, projectId: null, initial: null })
          }
          onSave={onSave}
          initial={dialog.initial}
          projectId={dialog.projectId}
          defaultStatus={dialog.defaultStatus}
        />
      )}

      <AlertDialog open={!!toRemove} onOpenChange={(v) => !v && setToRemove(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Elimina «{toRemove?.title}»?</AlertDialogTitle>
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

function KanbanColumn({
  id,
  label,
  count,
  isAlert,
  onAdd,
  addDisabled,
  children,
}: {
  id: ActivityStatus;
  label: string;
  count: number;
  isAlert: boolean;
  onAdd: () => void;
  addDisabled?: boolean;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <section
      ref={setNodeRef}
      className="flex flex-col gap-2.5 min-h-0 overflow-hidden"
      style={{
        border: `1px solid ${isAlert ? "var(--spark)" : "var(--line)"}`,
        borderRadius: 14,
        padding: "12px 12px",
        background: isOver
          ? "color-mix(in oklch, var(--fg) 4%, transparent)"
          : isAlert
            ? "color-mix(in oklch, var(--spark) 5%, transparent)"
            : "var(--bg-2)",
        transition: "background 120ms",
      }}
    >
      <div className="flex justify-between items-baseline">
        <span
          className="t-mono"
          style={{ color: isAlert ? "var(--spark)" : "var(--fg)" }}
        >
          {label}
        </span>
        <span
          className="t-num"
          style={{
            fontSize: 22,
            letterSpacing: "-0.02em",
            color: isAlert ? "var(--spark)" : "var(--fg)",
          }}
        >
          {count}
        </span>
      </div>
      <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-2 pr-1 pb-1">
        {children}
        <button
          type="button"
          onClick={onAdd}
          disabled={addDisabled}
          className="t-mono"
          style={{
            border: "1px dashed var(--line-strong)",
            borderRadius: 10,
            background: "transparent",
            color: "var(--muted-foreground)",
            padding: "10px 12px",
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

function DraggableCard(props: {
  activity: Activity;
  projectCode?: string;
  assigneeName?: string;
  assigneeInitials?: string;
  onOpen: () => void;
  onEdit: () => void;
  onMove: (s: ActivityStatus) => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: props.activity.id,
  });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ opacity: isDragging ? 0.3 : 1, cursor: "grab" }}
    >
      <CardSurface {...props} />
    </div>
  );
}

function CardSurface({
  activity,
  projectCode,
  assigneeName,
  assigneeInitials,
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
  dragging?: boolean;
  onOpen?: () => void;
  onEdit?: () => void;
  onMove?: (s: ActivityStatus) => void;
  onRemove?: () => void;
}) {
  const due = dueLabel(activity);
  const isHigh = false;
  return (
    <article
      onClick={onOpen}
      style={{
        background: "var(--bg)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        boxShadow: dragging
          ? "0 12px 32px -12px color-mix(in oklch, var(--fg) 30%, transparent)"
          : "0 1px 2px rgba(0,0,0,.04)",
        transform: dragging ? "rotate(1.5deg)" : "none",
      }}
    >
      <div className="flex justify-between items-baseline gap-2">
        <span
          className="t-mono"
          style={{ color: "var(--muted-foreground)", fontSize: 9 }}
        >
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
          fontFamily: "Fraunces, ui-serif, serif",
          fontStyle: "italic",
          fontSize: 16,
          lineHeight: 1.2,
          letterSpacing: "-0.01em",
        }}
      >
        {activity.title}
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        <span
          className="t-mono"
          style={{ color: "var(--muted-foreground)", fontSize: 9 }}
        >
          {fmtDays(activity.estimateHours)}
        </span>
      </div>
      <div
        className="flex justify-between items-center"
        style={{ paddingTop: 6, borderTop: "1px solid var(--line)" }}
      >
        {assigneeInitials ? (
          <span className="ph-avatar ph-avatar-xs">{assigneeInitials}</span>
        ) : (
          <span
            className="t-mono"
            style={{ color: "var(--muted-foreground)", fontSize: 9 }}
          >
            —
          </span>
        )}
        <span
          className="t-mono"
          style={{
            color: due.spark ? "var(--spark)" : "var(--muted-foreground)",
          }}
        >
          {due.text}
        </span>
        {isHigh && null}
        {assigneeName && null}
      </div>
    </article>
  );
}

function ListView({
  data,
  onOpen,
  onEdit,
}: {
  data: Activity[];
  onOpen: (a: Activity) => void;
  onEdit: (a: Activity) => void;
}) {
  const projects = useProjects();
  const byProj = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of data) {
      const key = projects.find((p) => p.id === a.projectId)?.name ?? "Senza project";
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return map;
  }, [data, projects]);

  return (
    <div className="flex-1 min-h-0 overflow-auto flex flex-col gap-4">
      <div
        className="grid gap-3 items-center"
        style={
          {
            gridTemplateColumns: "70px 1fr 110px 130px 90px 90px 80px",
            paddingBottom: 8,
            borderBottom: "1px solid var(--line-strong)",
          } as CSSProperties
        }
      >
        {["ID", "TITOLO", "STATO", "ASSEGN.", "STIMA", "SCADENZA", ""].map((h, i) => (
          <span
            key={i}
            className="t-mono"
            style={{
              color: "var(--muted-foreground)",
              textAlign: i >= 4 ? "right" : "left",
            }}
          >
            {h}
          </span>
        ))}
      </div>
      {[...byProj.entries()].map(([proj, list]) => (
        <section key={proj}>
          <div
            className="flex items-baseline gap-3"
            style={{
              padding: "0 4px 6px",
              borderBottom: "1px solid var(--line)",
              marginBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "Fraunces, ui-serif, serif",
                fontStyle: "italic",
                fontSize: 19,
                letterSpacing: "-0.02em",
              }}
            >
              {proj}
            </span>
            <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
              {list.length} ATTIVITÀ
            </span>
          </div>
          {list
            .sort((a, b) => {
              const ad = a.endDate ? new Date(a.endDate).getTime() : Infinity;
              const bd = b.endDate ? new Date(b.endDate).getTime() : Infinity;
              return ad - bd;
            })
            .map((a) => {
              const assignee = a.assigneeId ? employeeById(a.assigneeId) : null;
              const due = dueLabel(a);
              const colLabel =
                COLUMNS.find((c) => c.id === a.status)?.label ?? a.status;
              return (
                <div
                  key={a.id}
                  className="grid gap-3 items-center"
                  style={
                    {
                      gridTemplateColumns: "70px 1fr 110px 130px 90px 90px 80px",
                      padding: "10px 4px",
                      borderBottom: "1px solid var(--line)",
                    } as CSSProperties
                  }
                >
                  <span className="t-mono" style={{ color: "var(--muted-foreground)" }}>
                    {a.id.slice(0, 8).toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => onOpen(a)}
                    className="text-left flex items-center gap-2"
                    style={{
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background:
                          a.status === "done"
                            ? "var(--muted-foreground)"
                            : a.status === "blocked"
                              ? "var(--spark)"
                              : "var(--fg)",
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "Fraunces, ui-serif, serif",
                        fontStyle: "italic",
                        fontSize: 17,
                        letterSpacing: "-0.01em",
                        color:
                          a.status === "done" ? "var(--muted-foreground)" : "var(--fg)",
                        textDecoration: a.status === "done" ? "line-through" : "none",
                      }}
                    >
                      {a.title}
                    </span>
                  </button>
                  <span
                    className="t-mono"
                    style={{
                      color:
                        a.status === "blocked" ? "var(--spark)" : "var(--fg-2)",
                    }}
                  >
                    {colLabel}
                  </span>
                  <div className="flex items-center gap-2 min-w-0">
                    {assignee ? (
                      <>
                        <span className="ph-avatar ph-avatar-xs">{assignee.initials}</span>
                        <span
                          className="truncate"
                          style={{ fontSize: 12, fontFamily: "Inter, sans-serif" }}
                        >
                          {assignee.name.split(" ")[0]}
                        </span>
                      </>
                    ) : (
                      <span
                        className="t-mono"
                        style={{ color: "var(--muted-foreground)" }}
                      >
                        —
                      </span>
                    )}
                  </div>
                  <span className="t-num" style={{ fontSize: 13, textAlign: "right" }}>
                    {fmtDays(a.estimateHours)}
                  </span>
                  <span
                    className="t-mono"
                    style={{
                      color: due.spark ? "var(--spark)" : "var(--muted-foreground)",
                      textAlign: "right",
                    }}
                  >
                    {due.text}
                  </span>
                  <button
                    type="button"
                    onClick={() => onEdit(a)}
                    className="t-mono"
                    style={{
                      background: "transparent",
                      border: 0,
                      color: "var(--muted-foreground)",
                      cursor: "pointer",
                      padding: 0,
                      textAlign: "right",
                    }}
                  >
                    EDIT
                  </button>
                </div>
              );
            })}
        </section>
      ))}
    </div>
  );
}

function TimelineView({ data }: { data: Activity[] }) {
  // 14-day window starting today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return { d };
  });

  const byAsg = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const a of data) {
      const key = a.assigneeId ?? "__unassigned";
      const arr = map.get(key) ?? [];
      arr.push(a);
      map.set(key, arr);
    }
    return [...map.entries()];
  }, [data]);

  const dueIndex = (a: Activity): number | null => {
    if (!a.endDate) return null;
    const due = new Date(a.endDate);
    due.setHours(0, 0, 0, 0);
    const idx = Math.round((due.getTime() - today.getTime()) / 86_400_000);
    return idx;
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* axis */}
      <div
        className="grid gap-0 items-stretch"
        style={
          {
            gridTemplateColumns: "180px repeat(14, 1fr) 70px",
            paddingBottom: 6,
            borderBottom: "1px solid var(--line-strong)",
          } as CSSProperties
        }
      >
        <span
          className="t-mono"
          style={{ color: "var(--muted-foreground)", paddingLeft: 4 }}
        >
          ASSEGNATARIO
        </span>
        {days.map(({ d }, i) => {
          const wd = d.getDay();
          const isWeekend = wd === 0 || wd === 6;
          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                borderLeft: "1px solid var(--line)",
                padding: "0 2px",
                background: isWeekend
                  ? "color-mix(in oklch, var(--ink) 4%, transparent)"
                  : "transparent",
              }}
            >
              <div
                className="t-mono"
                style={{
                  color: i === 0 ? "var(--spark)" : "var(--muted-foreground)",
                  fontSize: 9,
                  fontWeight: i === 0 ? 700 : 500,
                }}
              >
                {i === 0 ? "OGGI" : ["D", "L", "M", "M", "G", "V", "S"][wd]}
              </div>
              <div
                className="t-num"
                style={{
                  fontSize: 13,
                  color: i === 0 ? "var(--spark)" : "var(--fg)",
                }}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
        <span
          className="t-mono"
          style={{
            color: "var(--muted-foreground)",
            textAlign: "right",
            paddingRight: 4,
          }}
        >
          STIMA
        </span>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {byAsg.length === 0 ? (
          <div
            className="t-mono p-12 text-center"
            style={{ color: "var(--muted-foreground)" }}
          >
            NESSUNA ATTIVITÀ
          </div>
        ) : (
          byAsg.map(([asgId, tasks]) => {
            const asg =
              asgId === "__unassigned" ? null : employeeById(asgId);
            const totHours = tasks.reduce((s, t) => s + t.estimateHours, 0);
            return (
              <div
                key={asgId}
                className="grid gap-0 items-center"
                style={
                  {
                    gridTemplateColumns: "180px repeat(14, 1fr) 70px",
                    borderBottom: "1px solid var(--line)",
                    minHeight: 56,
                    position: "relative",
                  } as CSSProperties
                }
              >
                <div
                  className="flex items-center gap-2"
                  style={{ paddingLeft: 4 }}
                >
                  {asg ? (
                    <>
                      <span className="ph-avatar ph-avatar-sm">{asg.initials}</span>
                      <div className="flex flex-col min-w-0">
                        <span
                          className="truncate"
                          style={{ fontSize: 13, fontWeight: 500 }}
                        >
                          {asg.name}
                        </span>
                        <span
                          className="t-mono"
                          style={{ color: "var(--muted-foreground)", fontSize: 9 }}
                        >
                          {tasks.length} attività
                        </span>
                      </div>
                    </>
                  ) : (
                    <span
                      className="t-mono"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      NON ASSEGNATE · {tasks.length}
                    </span>
                  )}
                </div>

                {days.map(({ d }, i) => {
                  const wd = d.getDay();
                  const isWeekend = wd === 0 || wd === 6;
                  return (
                    <div
                      key={i}
                      style={{
                        height: "100%",
                        borderLeft: "1px solid var(--line)",
                        background: isWeekend
                          ? "color-mix(in oklch, var(--ink) 4%, transparent)"
                          : "transparent",
                      }}
                    />
                  );
                })}

                <div
                  style={{
                    position: "absolute",
                    left: 180,
                    top: 8,
                    bottom: 8,
                    right: 70,
                  }}
                >
                  {tasks.map((t, ti) => {
                    const idx = dueIndex(t);
                    if (idx === null) return null;
                    const span = Math.min(5, Math.max(1, Math.round(t.estimateHours / HOURS_PER_DAY)));
                    const startIdx = Math.max(0, idx - span + 1);
                    const visible = Math.min(13 - startIdx + 1, span);
                    if (visible <= 0) return null;
                    if (idx < 0 || idx > 13) return null;
                    const widthPct = (visible / 14) * 100;
                    const leftPct = (startIdx / 14) * 100;
                    const isBlocked = t.status === "blocked";
                    const isDone = t.status === "done";
                    const top = (ti % 2) * 22;
                    return (
                      <div
                        key={t.id}
                        title={t.title}
                        style={{
                          position: "absolute",
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                          top,
                          height: 20,
                          background: isBlocked
                            ? "color-mix(in oklch, var(--spark) 24%, transparent)"
                            : isDone
                              ? "color-mix(in oklch, var(--fg) 8%, transparent)"
                              : "color-mix(in oklch, var(--fg) 18%, transparent)",
                          color: "var(--fg)",
                          border: isBlocked
                            ? "1px solid var(--spark)"
                            : "1px solid var(--line-strong)",
                          borderRadius: 4,
                          padding: "0 6px",
                          fontFamily: "Fraunces, ui-serif, serif",
                          fontStyle: "italic",
                          fontSize: 11,
                          lineHeight: "20px",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          cursor: "pointer",
                          textDecoration: isDone ? "line-through" : "none",
                        }}
                      >
                        {t.title}
                      </div>
                    );
                  })}
                </div>

                <span
                  className="t-num"
                  style={{ fontSize: 14, textAlign: "right", paddingRight: 4 }}
                >
                  {fmtDays(totHours)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
