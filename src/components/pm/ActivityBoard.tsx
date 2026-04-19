import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { toast } from "sonner";
import { Plus, Calendar, User, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, StatusBadge } from "@/components/app/AppShell";
import { EmptyState } from "@/components/app/EmptyState";
import { IntegrationBadge } from "./IntegrationBadge";
import { ActivityDialog } from "./ActivityDialog";
import { employeeById, type Activity, type ActivityStatus } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const COLUMNS: { id: ActivityStatus; label: string; tone: string }[] = [
  { id: "todo", label: "To do", tone: "oklch(0.75 0.04 260)" },
  { id: "in_progress", label: "In progress", tone: "oklch(0.7 0.15 220)" },
  { id: "review", label: "Review", tone: "oklch(0.78 0.12 80)" },
  { id: "done", label: "Done", tone: "oklch(0.7 0.15 155)" },
  { id: "blocked", label: "Blocked", tone: "oklch(0.65 0.18 30)" },
];

export function ActivityBoard({
  projectId,
  activities,
  onChange,
}: {
  projectId: string;
  activities: Activity[];
  onChange: (next: Activity[]) => void;
}) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    open: boolean;
    initial?: Activity | null;
    defaultStatus?: ActivityStatus;
  }>({ open: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const byStatus = useMemo(() => {
    const grouped: Record<ActivityStatus, Activity[]> = {
      todo: [],
      in_progress: [],
      review: [],
      done: [],
      blocked: [],
    };
    for (const a of activities) grouped[a.status].push(a);
    for (const k of Object.keys(grouped) as ActivityStatus[])
      grouped[k].sort((a, b) => a.order - b.order);
    return grouped;
  }, [activities]);

  const onDragStart = (e: DragStartEvent) => setActiveId(String(e.active.id));
  const onDragEnd = (e: DragEndEvent) => {
    setActiveId(null);
    const activityId = String(e.active.id);
    const over = e.over?.id;
    if (!over) return;
    const destStatus = String(over) as ActivityStatus;
    const current = activities.find((a) => a.id === activityId);
    if (!current || current.status === destStatus) return;
    const nextOrder = Math.max(0, ...byStatus[destStatus].map((a) => a.order)) + 1;
    const updated: Activity = { ...current, status: destStatus, order: nextOrder };
    onChange(activities.map((a) => (a.id === activityId ? updated : a)));
    toast.success(`Moved to ${COLUMNS.find((c) => c.id === destStatus)?.label}`, {
      action: {
        label: "Undo",
        onClick: () => onChange(activities.map((a) => (a.id === activityId ? current : a))),
      },
    });
  };

  const upsert = (a: Activity) => {
    const exists = activities.some((x) => x.id === a.id);
    onChange(exists ? activities.map((x) => (x.id === a.id ? a : x)) : [...activities, a]);
  };
  const remove = (a: Activity) => {
    onChange(activities.filter((x) => x.id !== a.id));
    toast("Activity removed", {
      action: { label: "Undo", onClick: () => onChange([...activities, a]) },
    });
  };

  const activeActivity = activeId ? activities.find((a) => a.id === activeId) : null;

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              columnId={col.id}
              label={col.label}
              tone={col.tone}
              activities={byStatus[col.id]}
              onAdd={() => setDialog({ open: true, initial: null, defaultStatus: col.id })}
              onEdit={(a) => setDialog({ open: true, initial: a })}
              onRemove={remove}
            />
          ))}
        </div>
        <DragOverlay>
          {activeActivity ? <Card activity={activeActivity} dragging /> : null}
        </DragOverlay>
      </DndContext>
      <ActivityDialog
        open={dialog.open}
        onClose={() => setDialog({ open: false })}
        onSave={upsert}
        initial={dialog.initial ?? null}
        projectId={projectId}
        defaultStatus={dialog.defaultStatus}
      />
    </>
  );
}

function Column({
  columnId,
  label,
  tone,
  activities,
  onAdd,
  onEdit,
  onRemove,
}: {
  columnId: ActivityStatus;
  label: string;
  tone: string;
  activities: Activity[];
  onAdd: () => void;
  onEdit: (a: Activity) => void;
  onRemove: (a: Activity) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: columnId });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg border bg-muted/30 p-2 flex flex-col gap-2 min-h-[200px] transition",
        isOver && "bg-muted/60 ring-2 ring-primary/40",
      )}
    >
      <div className="flex items-center justify-between px-2 pt-1">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: tone }} />
          <div className="text-sm font-semibold">{label}</div>
          <div className="text-xs text-muted-foreground tabular-nums">{activities.length}</div>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onAdd}>
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="flex flex-col gap-2 flex-1">
        {activities.length === 0 ? (
          <div className="text-[11px] text-muted-foreground text-center py-6 border border-dashed rounded-md">
            Drop cards here
          </div>
        ) : (
          activities.map((a) => (
            <DraggableCard
              key={a.id}
              activity={a}
              onEdit={() => onEdit(a)}
              onRemove={() => onRemove(a)}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableCard({
  activity,
  onEdit,
  onRemove,
}: {
  activity: Activity;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: activity.id });
  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={cn("cursor-grab active:cursor-grabbing", isDragging && "opacity-30")}
    >
      <Card activity={activity} onEdit={onEdit} onRemove={onRemove} />
    </div>
  );
}

function Card({
  activity,
  onEdit,
  onRemove,
  dragging,
}: {
  activity: Activity;
  onEdit?: () => void;
  onRemove?: () => void;
  dragging?: boolean;
}) {
  const assignee = activity.assigneeId ? employeeById(activity.assigneeId) : null;
  return (
    <div
      className={cn(
        "rounded-md border bg-card p-3 shadow-sm hover:shadow-md transition",
        dragging && "shadow-lg rotate-1",
      )}
      onDoubleClick={onEdit}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="font-medium text-sm leading-tight flex-1">{activity.title}</div>
        {onRemove && (
          <button
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      {activity.description && (
        <div className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
          {activity.description}
        </div>
      )}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {assignee ? (
          <span className="inline-flex items-center gap-1 text-[10px]">
            <Avatar initials={assignee.initials} color={assignee.avatarColor} size={18} employeeId={assignee.id} />
            {assignee.name.split(" ")[0]}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <User className="h-3 w-3" />
            Unassigned
          </span>
        )}
        {activity.endDate && (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {activity.endDate.slice(5)}
          </span>
        )}
        {activity.ticketLink && (
          <IntegrationBadge
            provider={activity.ticketLink.provider}
            issueKey={activity.ticketLink.key}
          />
        )}
      </div>
      {activity.status === "blocked" && (
        <div className="mt-2">
          <StatusBadge status="blocked" />
        </div>
      )}
    </div>
  );
}
