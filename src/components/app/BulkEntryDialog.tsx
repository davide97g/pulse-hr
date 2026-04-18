import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import {
  CopyPlus, Wand2, CalendarRange, Sparkles, Check, ChevronRight, AlertTriangle,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { commesse, commessaById, type TimesheetEntry } from "@/lib/mock-data";
import {
  prevWeekEntries, missingWorkdaysInRange, datesBetween,
} from "@/lib/timesheet";
import { cn } from "@/lib/utils";

type Mode = "copy-week" | "fill-missing" | "apply-range";

interface Template {
  commessaId: string;
  hours: number;
  description: string;
  billable: boolean;
}

interface Props {
  open: boolean;
  mode: Mode;
  onModeChange: (m: Mode) => void;
  onClose: () => void;
  employeeId: string;
  entries: TimesheetEntry[];
  month: Date;
  selectedRange: Date[];
  onSubmitBatch: (rows: Omit<TimesheetEntry, "id" | "status" | "employeeId">[]) => void;
}

export function BulkEntryDialog({
  open, mode, onModeChange, onClose, employeeId, entries, month, selectedRange, onSubmitBatch,
}: Props) {
  const [template, setTemplate] = useState<Template>({
    commessaId: commesse[0].id,
    hours: 8,
    description: "",
    billable: true,
  });
  const [rangeFrom, setRangeFrom] = useState<string>(format(month, "yyyy-MM-01"));
  const [rangeTo, setRangeTo] = useState<string>(format(new Date(month.getFullYear(), month.getMonth() + 1, 0), "yyyy-MM-dd"));

  useEffect(() => {
    if (!open) return;
    if (mode === "apply-range" && selectedRange.length > 0) {
      setRangeFrom(format(selectedRange[0], "yyyy-MM-dd"));
      setRangeTo(format(selectedRange[selectedRange.length - 1], "yyyy-MM-dd"));
    }
  }, [open, mode, selectedRange]);

  // ── copy-week preview ────────────────────────────────────────────────
  const copyWeek = useMemo(
    () => prevWeekEntries(month, employeeId, entries),
    [month, employeeId, entries],
  );

  // ── fill-missing preview ─────────────────────────────────────────────
  const missingDays = useMemo(() => {
    try {
      const from = parseISO(rangeFrom);
      const to = parseISO(rangeTo);
      return missingWorkdaysInRange(from, to, employeeId, entries, month);
    } catch { return []; }
  }, [rangeFrom, rangeTo, employeeId, entries, month]);

  // ── apply-range preview ──────────────────────────────────────────────
  const applyDays = useMemo(() => {
    if (mode !== "apply-range" || selectedRange.length === 0) return [];
    const from = selectedRange[0];
    const to = selectedRange[selectedRange.length - 1];
    return datesBetween(from, to);
  }, [mode, selectedRange]);

  const templateValid = template.hours > 0 && template.hours <= 24 && template.description.trim().length > 0;

  const submit = () => {
    if (mode === "copy-week") {
      const shift = 7;
      const rows = copyWeek.rows.map(r => {
        const d = parseISO(r.date);
        d.setDate(d.getDate() + shift);
        return {
          commessaId: r.commessaId,
          date: format(d, "yyyy-MM-dd"),
          hours: r.hours,
          description: r.description,
          billable: r.billable,
        };
      });
      onSubmitBatch(rows);
    } else if (mode === "fill-missing") {
      if (!templateValid) return;
      const rows = missingDays.map(d => ({
        commessaId: template.commessaId,
        date: format(d, "yyyy-MM-dd"),
        hours: template.hours,
        description: template.description.trim(),
        billable: template.billable,
      }));
      onSubmitBatch(rows);
    } else if (mode === "apply-range") {
      if (!templateValid || applyDays.length === 0) return;
      const rows = applyDays.map(d => ({
        commessaId: template.commessaId,
        date: format(d, "yyyy-MM-dd"),
        hours: template.hours,
        description: template.description.trim(),
        billable: template.billable,
      }));
      onSubmitBatch(rows);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-4 w-4 text-primary" />
            Bulk entry
          </DialogTitle>
          <DialogDescription>
            Fill many days at once — every action adds drafts you can undo.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={mode} onValueChange={v => onModeChange(v as Mode)}>
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="copy-week"><CopyPlus className="h-3.5 w-3.5 mr-1.5" />Copy week</TabsTrigger>
            <TabsTrigger value="fill-missing"><Sparkles className="h-3.5 w-3.5 mr-1.5" />Fill missing</TabsTrigger>
            <TabsTrigger value="apply-range"><CalendarRange className="h-3.5 w-3.5 mr-1.5" />Apply to range</TabsTrigger>
          </TabsList>

          {/* ── Copy last week ───────────────────────────────────────── */}
          <TabsContent value="copy-week" className="mt-4 space-y-3">
            <div className="text-xs text-muted-foreground">
              Duplicates every entry from <span className="font-mono">{copyWeek.from} → {copyWeek.to}</span>
              {" "}into the current week (same weekday, same hours).
            </div>
            {copyWeek.rows.length === 0 ? (
              <EmptyPreview label="No entries found in the previous week." />
            ) : (
              <PreviewTable
                count={copyWeek.rows.length}
                rows={copyWeek.rows.map(r => ({
                  date: format(new Date(parseISO(r.date).getTime() + 7 * 86400000), "yyyy-MM-dd"),
                  commessaId: r.commessaId,
                  hours: r.hours,
                  description: r.description,
                }))}
              />
            )}
          </TabsContent>

          {/* ── Fill missing ─────────────────────────────────────────── */}
          <TabsContent value="fill-missing" className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>From</Label>
                <Input type="date" value={rangeFrom} onChange={e => setRangeFrom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>To</Label>
                <Input type="date" value={rangeTo} onChange={e => setRangeTo(e.target.value)} />
              </div>
            </div>
            <TemplateForm template={template} onChange={setTemplate} />
            <div className="rounded-md border p-3 bg-muted/30 flex items-center gap-2 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-warning" />
              {missingDays.length === 0
                ? <span>No missing workdays in this range.</span>
                : <span>Will add <span className="font-semibold text-foreground">{missingDays.length}</span> draft{missingDays.length === 1 ? "" : "s"} on the missing workdays below.</span>}
            </div>
            {missingDays.length > 0 && (
              <DayChips dates={missingDays.slice(0, 20)} more={missingDays.length - 20} />
            )}
          </TabsContent>

          {/* ── Apply to range ──────────────────────────────────────── */}
          <TabsContent value="apply-range" className="mt-4 space-y-3">
            <div className="rounded-md border p-3 bg-primary/5 text-xs">
              {applyDays.length === 0
                ? <span className="text-muted-foreground">Shift-click two days on the calendar to pick a range.</span>
                : <>Applying to <span className="font-semibold">{applyDays.length}</span> day{applyDays.length === 1 ? "" : "s"}: <span className="font-mono">{format(applyDays[0], "MMM d")} → {format(applyDays[applyDays.length - 1], "MMM d")}</span></>}
            </div>
            <TemplateForm template={template} onChange={setTemplate} />
            {applyDays.length > 0 && (
              <DayChips dates={applyDays.slice(0, 20)} more={applyDays.length - 20} />
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={submit}
            disabled={
              (mode === "copy-week" && copyWeek.rows.length === 0) ||
              (mode === "fill-missing" && (!templateValid || missingDays.length === 0)) ||
              (mode === "apply-range" && (!templateValid || applyDays.length === 0))
            }
            className="press-scale"
          >
            <Check className="h-4 w-4 mr-1.5" />
            {mode === "copy-week" && `Create ${copyWeek.rows.length} entries`}
            {mode === "fill-missing" && `Fill ${missingDays.length} day${missingDays.length === 1 ? "" : "s"}`}
            {mode === "apply-range" && `Apply to ${applyDays.length} day${applyDays.length === 1 ? "" : "s"}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplateForm({ template, onChange }: { template: Template; onChange: (t: Template) => void }) {
  return (
    <div className="rounded-md border p-3 space-y-2.5 bg-muted/20">
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">Template applied to each day</div>
      <div className="grid grid-cols-[1fr_90px] gap-2">
        <Select value={template.commessaId} onValueChange={v => onChange({ ...template, commessaId: v })}>
          <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
          <SelectContent>
            {commesse.map(c => (
              <SelectItem key={c.id} value={c.id}>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="font-mono text-xs">{c.code}</span>
                  <span className="text-muted-foreground">{c.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="number" step="0.25" min="0.25" max="24"
          value={template.hours}
          onChange={e => onChange({ ...template, hours: Number(e.target.value) })}
          className="text-right font-mono tabular-nums"
          aria-label="Hours"
        />
      </div>
      <Textarea
        rows={2} placeholder="Description for all entries"
        value={template.description}
        onChange={e => onChange({ ...template, description: e.target.value })}
      />
      <div className="flex items-center justify-between">
        <Label className="text-xs">Billable</Label>
        <Switch checked={template.billable} onCheckedChange={v => onChange({ ...template, billable: v })} />
      </div>
    </div>
  );
}

function DayChips({ dates, more }: { dates: Date[]; more: number }) {
  return (
    <div className="flex gap-1 flex-wrap">
      {dates.map(d => (
        <span key={d.toISOString()} className="text-[10px] font-mono px-1.5 py-0.5 rounded border bg-muted/30">
          {format(d, "MMM d")}
        </span>
      ))}
      {more > 0 && <span className="text-[10px] text-muted-foreground px-1.5 py-0.5">+{more} more</span>}
    </div>
  );
}

function PreviewTable({ rows, count }: { rows: { date: string; commessaId: string; hours: number; description: string }[]; count: number }) {
  return (
    <div className="max-h-48 overflow-y-auto scrollbar-thin border rounded-md">
      <table className="w-full text-xs">
        <thead className="bg-muted/40 text-[10px] uppercase tracking-wider text-muted-foreground sticky top-0">
          <tr>
            <th className="text-left px-3 py-1.5">Date</th>
            <th className="text-left px-3 py-1.5">Commessa</th>
            <th className="text-right px-3 py-1.5">Hours</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const c = commessaById(r.commessaId);
            return (
              <tr key={i} className="border-t">
                <td className="px-3 py-1.5 font-mono tabular-nums">{r.date}</td>
                <td className="px-3 py-1.5">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: c?.color }} />
                    <span className="font-mono text-[10px]">{c?.code}</span>
                  </span>
                </td>
                <td className="px-3 py-1.5 text-right font-mono tabular-nums">{r.hours}h</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="px-3 py-1.5 border-t bg-muted/20 text-[10px] text-muted-foreground">
        {count} entr{count === 1 ? "y" : "ies"} total
      </div>
    </div>
  );
}

function EmptyPreview({ label }: { label: string }) {
  return (
    <div className="rounded-md border border-dashed p-6 text-center text-xs text-muted-foreground">
      <ChevronRight className="h-4 w-4 mx-auto mb-1 opacity-50" />
      {label}
    </div>
  );
}
