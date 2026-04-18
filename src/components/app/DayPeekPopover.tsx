import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import {
  Pencil, Trash2, Plus, CheckCircle2, Copy, CalendarDays,
} from "lucide-react";
import { Popover, PopoverContent, PopoverAnchor } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "./AppShell";
import { commesse, commessaById, type TimesheetEntry } from "@/lib/mock-data";
import type { DayInfo } from "@/lib/timesheet";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  anchor: HTMLElement | null;
  info: DayInfo | null;
  prevDayEntries: TimesheetEntry[];
  onClose: () => void;
  onAdd: (data: { commessaId: string; hours: number; description: string; billable: boolean; date: string }) => void;
  onEdit: (e: TimesheetEntry) => void;
  onDelete: (id: string) => void;
  onCopyFromPrev: () => void;
}

export function DayPeekPopover({
  open, anchor, info, prevDayEntries, onClose, onAdd, onEdit, onDelete, onCopyFromPrev,
}: Props) {
  const [commessaId, setCommessaId] = useState(commesse[0].id);
  const [hours, setHours] = useState("4");
  const [description, setDescription] = useState("");
  const [billable, setBillable] = useState(true);
  const firstRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open && info) {
      setCommessaId(commesse[0].id);
      setHours("4");
      setDescription("");
      setBillable(true);
      setTimeout(() => firstRef.current?.focus(), 120);
    }
  }, [open, info?.iso]);

  if (!info) return null;

  const valid = Number(hours) > 0 && Number(hours) <= 24 && description.trim().length > 0;
  const blocked = ["sick", "vacation", "personal", "parental", "holiday"].includes(info.status);

  const submit = () => {
    if (!valid) return;
    onAdd({
      commessaId,
      hours: Number(hours),
      description: description.trim(),
      billable,
      date: info.iso,
    });
    setDescription("");
    setHours("4");
    setTimeout(() => firstRef.current?.focus(), 60);
  };

  return (
    <Popover open={open} onOpenChange={o => !o && onClose()}>
      {anchor && (
        <PopoverAnchor virtualRef={{ current: anchor }} />
      )}
      <PopoverContent
        align="center"
        side="bottom"
        sideOffset={6}
        className="w-[360px] p-0 overflow-hidden"
        onOpenAutoFocus={e => e.preventDefault()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-muted grid place-items-center">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold">{format(info.date, "EEEE, MMM d")}</div>
            <div className="text-[11px] text-muted-foreground">
              {info.hours.toFixed(1)}h logged · {info.entries.length} entry{info.entries.length === 1 ? "" : "s"}
            </div>
          </div>
          <StatusBadge status={info.status} />
        </div>

        {/* Leave / holiday detail */}
        {info.leave && (
          <div className="px-4 py-2.5 border-b bg-info/5 text-xs">
            <span className="font-medium">{info.leave.type}</span>
            {info.leave.reason && <span className="text-muted-foreground"> · {info.leave.reason}</span>}
          </div>
        )}
        {info.holiday && (
          <div className="px-4 py-2.5 border-b bg-accent text-xs">
            <span className="font-medium">{info.holiday.name}</span>
            <span className="text-muted-foreground"> · {info.holiday.country}</span>
          </div>
        )}

        {/* Entries list */}
        {info.entries.length > 0 && (
          <div className="divide-y max-h-[180px] overflow-y-auto scrollbar-thin">
            {info.entries.map(e => {
              const c = commessaById(e.commessaId);
              return (
                <div key={e.id} className="group px-4 py-2.5 flex items-center gap-2 hover:bg-muted/40">
                  <span className="h-8 w-0.5 rounded-full shrink-0" style={{ backgroundColor: c?.color }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.description}</div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {c?.code} · {e.hours}h{!e.billable && " · internal"}
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(e)}
                      className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center"
                      title="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => onDelete(e.id)}
                      className="h-7 w-7 rounded-md hover:bg-destructive/10 text-destructive flex items-center justify-center"
                      title="Delete"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Quick add */}
        {!blocked && (
          <form
            onSubmit={ev => { ev.preventDefault(); submit(); }}
            className="p-3 border-t bg-muted/20 space-y-2"
          >
            <div className="grid grid-cols-[1fr_72px] gap-2">
              <Select value={commessaId} onValueChange={setCommessaId}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {commesse.filter(c => c.status === "active").map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span className="font-mono text-[10px]">{c.code}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number" step="0.25" min="0.25" max="24"
                value={hours} onChange={e => setHours(e.target.value)}
                className="h-8 text-xs text-right font-mono tabular-nums"
                aria-label="Hours"
              />
            </div>
            <Input
              ref={firstRef as never}
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="What did you work on?"
              className="h-8 text-xs"
            />
            <div className="flex items-center justify-between gap-2">
              <Label className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                <input
                  type="checkbox"
                  checked={billable}
                  onChange={e => setBillable(e.target.checked)}
                  className="h-3 w-3 rounded border-border"
                />
                Billable
              </Label>
              <div className="flex gap-1">
                {prevDayEntries.length > 0 && (
                  <Button
                    type="button" variant="outline" size="sm"
                    className="h-7 px-2 text-[11px] press-scale"
                    onClick={onCopyFromPrev}
                    title="Copy from previous workday"
                  >
                    <Copy className="h-3 w-3 mr-1" />Copy prev
                  </Button>
                )}
                <Button
                  type="submit"
                  size="sm"
                  disabled={!valid}
                  className={cn("h-7 px-2.5 text-[11px] press-scale", valid ? "bg-primary text-primary-foreground" : "")}
                >
                  {valid ? <CheckCircle2 className="h-3 w-3 mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                  Add
                </Button>
              </div>
            </div>
          </form>
        )}
        {blocked && (
          <div className="p-3 text-[11px] text-muted-foreground text-center">
            No entries allowed on {info.status} days.
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
