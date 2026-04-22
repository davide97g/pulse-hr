import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  parseISO,
  startOfDay,
  compareAsc,
} from "date-fns";
import { toast } from "sonner";
import {
  Plus,
  RefreshCw,
  Trash2,
  CalendarClock,
  MapPin,
  Link as LinkIcon,
  Users,
  Pencil,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PageHeader, Avatar } from "@/components/app/AppShell";
import { SidePanel } from "@/components/app/SidePanel";
import { EmptyState } from "@/components/app/EmptyState";
import { SkeletonRows } from "@/components/app/SkeletonList";
import { employeeById, commessaById, type GCalEvent } from "@/lib/mock-data";
import { gcalEventsTable, useGcalEvents } from "@/lib/tables/gcalEvents";
import { useIntegration, updateIntegration } from "@/lib/integrations-store";
import { mockWebhookEvent } from "@/lib/integrations";
import { cn } from "@/lib/utils";
import { useUrlParam } from "@/lib/useUrlParam";

export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — Pulse HR" }] }),
  validateSearch: (s: Record<string, unknown>) => s as Record<string, string>,
  component: CalendarPage,
});

function CalendarPage() {
  const gcal = useIntegration("google-calendar");
  const connected = gcal.status === "connected";
  const syncDirection = gcal.syncDirection ?? "import";
  const twoWay = syncDirection === "two-way";

  const allEvents = useGcalEvents();
  const events = connected ? allEvents : [];
  const [loading, setLoading] = useState(true);
  const [selId, setSelId] = useUrlParam("sel");
  const selected = selId ? (allEvents.find((e) => e.id === selId) ?? null) : null;
  const setSelected = (e: GCalEvent | null) => setSelId(e?.id ?? null);
  const [toDelete, setToDelete] = useState<GCalEvent | null>(null);
  const [composing, setComposing] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [tabRaw, setTabRaw] = useUrlParam("tab", "upcoming");
  const tab = (tabRaw === "month" ? "month" : "upcoming") as "upcoming" | "month";
  const setTab = (v: "upcoming" | "month") => setTabRaw(v);

  useEffect(() => {
    if (!connected && selId) setSelId(null);
  }, [connected, selId, setSelId]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 420);
    return () => clearTimeout(t);
  }, []);

  const sortedUpcoming = useMemo(
    () =>
      [...events]
        .filter((e) => parseISO(e.end).getTime() >= Date.now())
        .sort((a, b) => compareAsc(parseISO(a.start), parseISO(b.start))),
    [events],
  );

  const syncNow = () => {
    setSyncing(true);
    setTimeout(() => {
      const now = new Date();
      const fresh: GCalEvent[] = [
        {
          id: `gc-new-${Date.now()}`,
          title: "New sync — coffee with Marta",
          start: new Date(now.getTime() + 24 * 3600_000).toISOString(),
          end: new Date(now.getTime() + 24 * 3600_000 + 30 * 60_000).toISOString(),
          attendees: ["e1", "e3"],
          source: "google",
          status: "confirmed",
        },
      ];
      for (const ev of fresh) gcalEventsTable.add(ev);
      updateIntegration(
        mockWebhookEvent(gcal, "events.imported", `Imported ${fresh.length} event`),
      );
      toast.success(`Imported ${fresh.length} event from Google`);
      setSyncing(false);
    }, 700);
  };

  const remove = (e: GCalEvent) => {
    gcalEventsTable.remove(e.id);
    if (selId === e.id) setSelId(null);
    setToDelete(null);
    toast("Event deleted", {
      action: { label: "Undo", onClick: () => gcalEventsTable.add(e) },
    });
  };

  const create = (draft: Omit<GCalEvent, "id" | "source" | "status">) => {
    const ev: GCalEvent = {
      id: `gc-local-${Date.now()}`,
      source: "pulse",
      status: "confirmed",
      ...draft,
    };
    gcalEventsTable.add(ev);
    setComposing(false);
    toast.success(twoWay ? "Event created — synced to Google" : "Event created locally");
  };

  if (!connected) {
    return (
      <div className="p-4 md:p-6 space-y-5 max-w-5xl">
        <PageHeader
          title="Calendar"
          description="See your Google Calendar events alongside the rest of your day."
        />
        <Card className="p-10 text-center">
          <div className="mx-auto h-14 w-14 rounded-full bg-muted/40 flex items-center justify-center mb-4">
            <CalendarClock className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="text-lg font-semibold">Connect Google Calendar</div>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
            Link a Google account to pull meetings, 1:1s and focus blocks into Pulse. Turn on
            two-way sync later to push Pulse-created events back into Google.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/settings">Connect in Settings</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span>Calendar</span>
            <Badge
              variant="outline"
              className="bg-success/10 text-success border-success/30 text-[10px]"
            >
              <span className="pulse-dot mr-1.5" style={{ backgroundColor: "var(--success)" }} />
              Synced · {syncDirection === "two-way" ? "two-way" : "import only"}
            </Badge>
          </div>
        }
        description={`Connected as ${gcal.workspace}`}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={syncNow} disabled={syncing}>
              <RefreshCw className={cn("h-4 w-4 mr-2", syncing && "animate-spin")} />
              Sync now
            </Button>
            {twoWay && (
              <Button onClick={() => setComposing(true)}>
                <Plus className="h-4 w-4 mr-2" />
                New event
              </Button>
            )}
          </div>
        }
      />

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="month">Month</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          {loading ? (
            <SkeletonRows rows={6} />
          ) : sortedUpcoming.length === 0 ? (
            <EmptyState
              icon={<CalendarClock className="h-6 w-6" />}
              title="No upcoming events"
              description="Hit Sync now to pull the latest from Google."
            />
          ) : (
            <div className="space-y-2 stagger-in">
              {sortedUpcoming.map((e) => (
                <EventRow
                  key={e.id}
                  event={e}
                  twoWay={twoWay}
                  onSelect={() => setSelected(e)}
                  onDelete={() => setToDelete(e)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="month" className="mt-4">
          {loading ? (
            <SkeletonRows rows={6} />
          ) : (
            <MonthGrid events={events} onSelect={setSelected} />
          )}
        </TabsContent>
      </Tabs>

      <SidePanel open={!!selected} onClose={() => setSelected(null)} title={selected?.title ?? ""}>
        {selected && (
          <EventDetail event={selected} twoWay={twoWay} onDelete={() => setToDelete(selected)} />
        )}
      </SidePanel>

      {composing && (
        <ComposeDialog open={composing} onOpenChange={setComposing} onCreate={create} />
      )}

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete event?</AlertDialogTitle>
            <AlertDialogDescription>
              “{toDelete?.title}” will be removed.
              {twoWay && toDelete?.source === "pulse"
                ? " It will also be deleted from Google."
                : " Google's copy won't be affected."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove(toDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function sourceStyle(source: GCalEvent["source"]) {
  return source === "google"
    ? {
        bg: "color-mix(in oklch, oklch(0.68 0.18 25) 18%, transparent)",
        fg: "oklch(0.55 0.2 25)",
        label: "Google",
      }
    : {
        bg: "color-mix(in oklch, var(--primary) 18%, transparent)",
        fg: "var(--primary)",
        label: "Pulse",
      };
}

function statusDot(status: GCalEvent["status"]) {
  if (status === "tentative") return "bg-warning";
  if (status === "cancelled") return "bg-muted-foreground";
  return "bg-success";
}

function EventRow({
  event,
  twoWay,
  onSelect,
  onDelete,
}: {
  event: GCalEvent;
  twoWay: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const s = sourceStyle(event.source);
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const commessa = event.commessaId ? commessaById(event.commessaId) : undefined;
  const attendees = event.attendees.map(employeeById).filter(Boolean) as NonNullable<
    ReturnType<typeof employeeById>
  >[];
  return (
    <Card
      className="p-4 flex items-start gap-4 cursor-pointer hover:bg-muted/30 transition-colors press-scale"
      onClick={onSelect}
    >
      <div className="w-14 shrink-0 text-center">
        <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {format(start, "MMM")}
        </div>
        <div className="text-2xl font-semibold leading-tight">{format(start, "d")}</div>
        <div className="text-[11px] text-muted-foreground">{format(start, "EEE")}</div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("h-1.5 w-1.5 rounded-full", statusDot(event.status))} />
          <div className="font-medium truncate">{event.title}</div>
          <Badge
            variant="outline"
            className="text-[10px] border-0"
            style={{ backgroundColor: s.bg, color: s.fg }}
          >
            {s.label}
          </Badge>
          {event.status === "tentative" && (
            <Badge
              variant="outline"
              className="text-[10px] bg-warning/10 text-warning border-warning/30"
            >
              Tentative
            </Badge>
          )}
        </div>
        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
          <span>
            {format(start, "HH:mm")}–{format(end, "HH:mm")}
          </span>
          {event.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {event.location}
            </span>
          )}
          {commessa && (
            <span className="inline-flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              {commessa.code}
            </span>
          )}
        </div>
        {attendees.length > 0 && (
          <div className="mt-2 flex items-center -space-x-2">
            {attendees.slice(0, 5).map((e) => (
              <Avatar
                key={e.id}
                initials={e.initials}
                color={e.avatarColor}
                size={24}
                employeeId={e.id}
              />
            ))}
            {attendees.length > 5 && (
              <div className="h-6 w-6 rounded-full bg-muted text-[10px] flex items-center justify-center border border-background">
                +{attendees.length - 5}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0" onClick={(ev) => ev.stopPropagation()}>
        {twoWay && event.source === "pulse" && (
          <Button variant="ghost" size="icon" onClick={onSelect}>
            <Pencil className="h-4 w-4" />
          </Button>
        )}
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}

function EventDetail({
  event,
  twoWay,
  onDelete,
}: {
  event: GCalEvent;
  twoWay: boolean;
  onDelete: () => void;
}) {
  const s = sourceStyle(event.source);
  const start = parseISO(event.start);
  const end = parseISO(event.end);
  const commessa = event.commessaId ? commessaById(event.commessaId) : undefined;
  const attendees = event.attendees.map(employeeById).filter(Boolean) as NonNullable<
    ReturnType<typeof employeeById>
  >[];
  return (
    <div className="p-5 space-y-5">
      <div>
        <Badge
          variant="outline"
          className="text-[10px] border-0 mb-2"
          style={{ backgroundColor: s.bg, color: s.fg }}
        >
          {s.label}
        </Badge>
        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <CalendarClock className="h-3.5 w-3.5" />
          {format(start, "EEE d MMM · HH:mm")}–{format(end, "HH:mm")}
        </div>
      </div>
      {event.description && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Description
          </div>
          <p className="text-sm whitespace-pre-wrap">{event.description}</p>
        </div>
      )}
      {event.location && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Location
          </div>
          <div className="text-sm inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {event.location}
          </div>
        </div>
      )}
      {commessa && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1">
            Linked project
          </div>
          <div className="text-sm inline-flex items-center gap-1.5">
            <LinkIcon className="h-3.5 w-3.5" />
            {commessa.code} — {commessa.name}
          </div>
        </div>
      )}
      {attendees.length > 0 && (
        <div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2 inline-flex items-center gap-1">
            <Users className="h-3 w-3" /> Attendees
          </div>
          <ul className="space-y-2">
            {attendees.map((e) => (
              <li key={e.id} className="flex items-center gap-2 text-sm">
                <Avatar initials={e.initials} color={e.avatarColor} size={24} employeeId={e.id} />
                <span>{e.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="pt-2 border-t flex items-center justify-between gap-2">
        <div className="text-[11px] text-muted-foreground">
          {twoWay && event.source === "pulse"
            ? "Created in Pulse · synced to Google"
            : event.source === "google"
              ? "From Google Calendar"
              : "Local to Pulse"}
        </div>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 mr-1.5" />
          Delete
        </Button>
      </div>
    </div>
  );
}

function MonthGrid({
  events,
  onSelect,
}: {
  events: GCalEvent[];
  onSelect: (e: GCalEvent) => void;
}) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const eventsOn = (day: Date) =>
    events
      .filter((e) => isSameDay(parseISO(e.start), day))
      .sort((a, b) => compareAsc(parseISO(a.start), parseISO(b.start)));
  const MAX = 3;

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="text-sm font-semibold">{format(today, "MMMM yyyy")}</div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          {(["google", "pulse"] as const).map((src) => {
            const s = sourceStyle(src);
            return (
              <span key={src} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2.5 w-2.5 rounded"
                  style={{ backgroundColor: s.bg }}
                />
                {s.label}
              </span>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div
            key={`${d}-${i}`}
            className="text-center text-[10px] font-medium text-muted-foreground uppercase tracking-wider py-1.5"
          >
            {d}
          </div>
        ))}
        {days.map((day) => {
          const inMonth = isSameMonth(day, today);
          const isToday = startOfDay(day).getTime() === startOfDay(today).getTime();
          const entries = eventsOn(day);
          const visible = entries.slice(0, MAX);
          const overflow = entries.length - visible.length;
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "min-h-[88px] border rounded-md p-1 flex flex-col gap-0.5 transition-colors",
                inMonth ? "bg-background" : "bg-muted/20 text-muted-foreground/50",
                isToday && "ring-1 ring-primary/50",
              )}
            >
              <div
                className={cn(
                  "text-[11px] leading-none px-1 pt-0.5 pb-1",
                  isToday && "font-semibold text-primary",
                )}
              >
                {format(day, "d")}
              </div>
              <div className="flex flex-col gap-0.5 min-h-0">
                {visible.map((e) => {
                  const s = sourceStyle(e.source);
                  return (
                    <button
                      key={e.id}
                      onClick={() => onSelect(e)}
                      className="flex items-center gap-1 rounded px-1 py-0.5 text-[10px] font-medium truncate hover:brightness-110 press-scale text-left"
                      style={{ backgroundColor: s.bg, color: s.fg }}
                      title={`${e.title} — ${format(parseISO(e.start), "HH:mm")}`}
                    >
                      <span className="shrink-0 opacity-70">
                        {format(parseISO(e.start), "HH:mm")}
                      </span>
                      <span className="truncate">{e.title}</span>
                    </button>
                  );
                })}
                {overflow > 0 && (
                  <div className="text-[10px] text-muted-foreground px-1">+{overflow} more</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function ComposeDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (draft: Omit<GCalEvent, "id" | "source" | "status">) => void;
}) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("09:30");
  const [location, setLocation] = useState("");

  const canSubmit = title.trim().length > 0;

  const submit = () => {
    if (!canSubmit) return;
    onCreate({
      title: title.trim(),
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      attendees: [],
      location: location.trim() || undefined,
    });
    setTitle("");
    setLocation("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New event</DialogTitle>
          <DialogDescription>
            Creates a Pulse-origin event and syncs it to Google.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <label className="block">
            <span className="text-xs text-muted-foreground">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Design sync"
              autoFocus
            />
          </label>
          <div className="grid grid-cols-3 gap-2">
            <label className="block col-span-1">
              <span className="text-xs text-muted-foreground">Date</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block col-span-1">
              <span className="text-xs text-muted-foreground">Start</span>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block col-span-1">
              <span className="text-xs text-muted-foreground">End</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-xs text-muted-foreground">Location</span>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              placeholder="Meet link or room"
            />
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
