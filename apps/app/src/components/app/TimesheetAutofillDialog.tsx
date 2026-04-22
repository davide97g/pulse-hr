import { useEffect, useMemo, useState } from "react";
import { addDays, subDays, format } from "date-fns";
import {
  Sparkles,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Wand2,
  Focus,
  CalendarRange,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NewBadge } from "./NewBadge";
import { useWorkspace } from "./WorkspaceContext";
import { commesse, commessaById, type TimesheetEntry } from "@/lib/mock-data";
import {
  generateWeekDraft,
  weekLabel,
  type AutofillDraft,
  type AutofillSource,
} from "@/lib/autofill";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onClose: () => void;
  entries: TimesheetEntry[];
  employeeId: string;
  onAccept: (rows: Omit<TimesheetEntry, "id" | "status" | "employeeId">[]) => void;
  initialAnchor?: Date;
}

export function TimesheetAutofillDialog({
  open,
  onClose,
  entries,
  employeeId,
  onAccept,
  initialAnchor,
}: Props) {
  const workspace = useWorkspace();
  const [anchor, setAnchor] = useState(() => initialAnchor ?? new Date());
  const [drafts, setDrafts] = useState<AutofillDraft[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const regenerate = (a: Date) => {
    const rows = generateWeekDraft(a, employeeId, {
      defaultCommessaId: workspace.activeCommessaId,
      existingEntries: entries,
    });
    setDrafts(rows);
    setSelected(new Set(rows.filter((r) => r.source !== "gap").map((r) => r.tempId)));
  };

  useEffect(() => {
    if (open) regenerate(anchor);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, anchor, employeeId]);

  const byDay = useMemo(() => {
    const m = new Map<string, AutofillDraft[]>();
    for (const d of drafts) {
      if (!m.has(d.date)) m.set(d.date, []);
      m.get(d.date)!.push(d);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [drafts]);

  const selectedRows = drafts.filter((d) => selected.has(d.tempId));
  const totalHours = selectedRows.reduce((a, d) => a + d.hours, 0);

  const updateDraft = (tempId: string, patch: Partial<AutofillDraft>) => {
    setDrafts((ds) => ds.map((d) => (d.tempId === tempId ? { ...d, ...patch } : d)));
  };
  const toggle = (tempId: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(tempId)) next.delete(tempId);
      else next.add(tempId);
      return next;
    });
  };
  const deselectGuesses = () => {
    setSelected((s) => {
      const next = new Set(s);
      drafts.forEach((d) => {
        if (d.source === "gap") next.delete(d.tempId);
      });
      return next;
    });
  };
  const selectAll = () => setSelected(new Set(drafts.map((d) => d.tempId)));

  const accept = () => {
    const rows = selectedRows.map((d) => ({
      commessaId: d.commessaId,
      date: d.date,
      hours: d.hours,
      description: d.description,
      billable: d.billable,
    }));
    onAccept(rows);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-[720px] p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-5 pb-3 border-b">
          <DialogTitle className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-md grid place-items-center bg-primary/15 text-primary">
              <Sparkles className="h-4 w-4" />
            </div>
            Draft my week
            <NewBadge />
          </DialogTitle>
          <DialogDescription>
            Generated from your calendar and focus sessions. Review each row, then accept the ones
            you want to log.
          </DialogDescription>
        </DialogHeader>

        {/* Week nav + summary */}
        <div className="px-6 py-3 border-b flex items-center gap-2 flex-wrap bg-muted/20">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAnchor(subDays(anchor, 7))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="font-mono text-sm">{weekLabel(anchor)}</div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setAnchor(addDays(anchor, 7))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 ml-1 press-scale"
            onClick={() => setAnchor(new Date())}
          >
            This week
          </Button>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground">{selectedRows.length}</span> selected ·
            <span className="font-mono tabular-nums">{totalHours.toFixed(1)}h</span>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[50vh] overflow-y-auto scrollbar-thin">
          {byDay.length === 0 ? (
            <div className="p-10 text-center">
              <Wand2 className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-sm font-medium">Nothing to draft</div>
              <div className="text-xs text-muted-foreground mt-1">
                Every workday in this week is either already logged, a weekend, or outside your
                calendar.
              </div>
            </div>
          ) : (
            byDay.map(([date, rows]) => {
              const total = rows.reduce((a, d) => a + (selected.has(d.tempId) ? d.hours : 0), 0);
              return (
                <div key={date} className="border-b last:border-0">
                  <div className="px-6 py-2 flex items-center gap-2 bg-muted/10 sticky top-0">
                    <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
                    <div className="text-sm font-semibold">
                      {format(new Date(date), "EEEE, MMM d")}
                    </div>
                    <div className="text-xs text-muted-foreground ml-2">{rows.length} rows</div>
                    <div className="ml-auto font-mono text-xs tabular-nums">
                      {total.toFixed(1)}h
                    </div>
                  </div>
                  <div className="divide-y">
                    {rows.map((d) => (
                      <DraftRow
                        key={d.tempId}
                        draft={d}
                        selected={selected.has(d.tempId)}
                        onToggle={() => toggle(d.tempId)}
                        onChange={(patch) => updateDraft(d.tempId, patch)}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t flex-row items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={deselectGuesses}>
              Deselect guesses
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={selectAll}>
              Select all
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={onClose}>
              <X className="h-4 w-4 mr-1.5" />
              Cancel
            </Button>
            <Button onClick={accept} disabled={selectedRows.length === 0} className="press-scale">
              <Check className="h-4 w-4 mr-1.5" />
              Accept {selectedRows.length} row{selectedRows.length === 1 ? "" : "s"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DraftRow({
  draft,
  selected,
  onToggle,
  onChange,
}: {
  draft: AutofillDraft;
  selected: boolean;
  onToggle: () => void;
  onChange: (patch: Partial<AutofillDraft>) => void;
}) {
  const c = commessaById(draft.commessaId);
  return (
    <div
      className={cn(
        "px-6 py-2.5 flex items-start gap-3 transition-colors",
        selected ? "bg-primary/[0.03]" : "opacity-70",
      )}
    >
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1.5 h-4 w-4 rounded border-border shrink-0"
        aria-label={`Include ${draft.description}`}
      />
      <span
        className="w-0.5 self-stretch rounded-full shrink-0 mt-0.5"
        style={{ backgroundColor: c?.color }}
      />
      <div className="flex-1 min-w-0 space-y-1.5">
        <Input
          value={draft.description}
          onChange={(e) => onChange({ description: e.target.value })}
          className="h-8 text-sm border-transparent hover:border-border focus-visible:border-input bg-transparent px-2 -mx-2"
        />
        <div className="flex items-center gap-2 flex-wrap">
          <SourceBadge source={draft.source} confidence={draft.confidence} />
          <Select value={draft.commessaId} onValueChange={(v) => onChange({ commessaId: v })}>
            <SelectTrigger className="h-7 w-[180px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {commesse.map((cm) => (
                <SelectItem key={cm.id} value={cm.id}>
                  <span className="inline-flex items-center gap-1.5 text-xs">
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ backgroundColor: cm.color }}
                    />
                    <span className="font-mono text-[10px]">{cm.code}</span>
                    <span className="text-muted-foreground">{cm.name}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            type="number"
            step="0.25"
            min="0.25"
            max="24"
            value={draft.hours}
            onChange={(e) => onChange({ hours: Number(e.target.value) })}
            className="h-7 w-[72px] text-xs text-right font-mono tabular-nums"
            aria-label="Hours"
          />
        </div>
      </div>
    </div>
  );
}

function SourceBadge({ source, confidence }: { source: AutofillSource; confidence: number }) {
  const cfg: Record<AutofillSource, { label: string; cls: string; icon: React.ReactNode }> = {
    calendar: {
      label: "Calendar",
      cls: "bg-info/10 text-info border-info/30",
      icon: <CalendarDays className="h-3 w-3" />,
    },
    focus: {
      label: "Focus",
      cls: "bg-success/10 text-success border-success/30",
      icon: <Focus className="h-3 w-3" />,
    },
    gap: {
      label: "AI guess",
      cls: "bg-warning/10 text-warning border-warning/30",
      icon: <Sparkles className="h-3 w-3" />,
    },
  };
  const m = cfg[source];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-medium",
        m.cls,
      )}
    >
      {m.icon}
      {m.label}
      <span className="text-muted-foreground">· {Math.round(confidence * 100)}%</span>
    </span>
  );
}
