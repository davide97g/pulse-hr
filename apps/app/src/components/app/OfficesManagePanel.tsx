import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Building2,
  DoorOpen,
  Armchair,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@pulse-hr/ui/primitives/tabs";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { Switch } from "@pulse-hr/ui/primitives/switch";
import { RoomAmenities, SeatFeatures, AMENITY_META } from "@/components/app/AmenityIcons";
import {
  offices,
  rooms,
  seats,
  officesStore,
  officeById,
  seatsByOffice,
  type Office,
  type Room,
  type Seat,
  type Amenity,
  type RoomKind,
} from "@/lib/offices";
import { cn } from "@/lib/utils";

const IS_ADMIN = true;

const KIND_OPTIONS: { value: RoomKind; label: string }[] = [
  { value: "meeting", label: "Meeting" },
  { value: "phone", label: "Phone" },
  { value: "focus", label: "Focus" },
  { value: "event", label: "Event" },
];
const ALL_AMENITIES: Amenity[] = [
  "tv",
  "whiteboard",
  "speakerphone",
  "monitor",
  "ac",
  "standing-desk",
  "videoconf",
  "projector",
];
const EMOJI_PALETTE = [
  "🏢",
  "🏬",
  "🏠",
  "🏯",
  "🏰",
  "🚀",
  "🌍",
  "🇮🇹",
  "🇩🇪",
  "🇺🇸",
  "🇵🇹",
  "🇫🇷",
  "🇬🇧",
  "🇯🇵",
];
const OFFICE_COLORS = [
  "oklch(0.65 0.18 340)",
  "oklch(0.6 0.16 220)",
  "oklch(0.7 0.15 30)",
  "oklch(0.65 0.15 155)",
  "oklch(0.78 0.18 85)",
  "oklch(0.72 0.17 295)",
];
const ROOM_COLORS = OFFICE_COLORS;

export function OfficesManagePanel() {
  const [tab, setTab] = useState<"offices" | "rooms" | "seats">("offices");

  if (!IS_ADMIN) {
    return (
      <div className="p-6 text-center text-sm text-muted-foreground">
        <ShieldCheck className="h-6 w-6 mx-auto mb-2 opacity-50" />
        Admin-only view.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="offices">
            <Building2 className="h-3.5 w-3.5 mr-1.5" />
            Offices ({offices.length})
          </TabsTrigger>
          <TabsTrigger value="rooms">
            <DoorOpen className="h-3.5 w-3.5 mr-1.5" />
            Rooms ({rooms.length})
          </TabsTrigger>
          <TabsTrigger value="seats">
            <Armchair className="h-3.5 w-3.5 mr-1.5" />
            Seats ({seats.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="offices" className="mt-4">
          <OfficesCrud />
        </TabsContent>
        <TabsContent value="rooms" className="mt-4">
          <RoomsCrud />
        </TabsContent>
        <TabsContent value="seats" className="mt-4">
          <SeatsCrud />
        </TabsContent>
      </Tabs>

      <Card className="p-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          All edits are mock — reset to the seeded catalog anytime.
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            officesStore.reset();
            toast("Catalog reset to seed values");
          }}
        >
          <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reset catalog
        </Button>
      </Card>
    </div>
  );
}

// ── Offices CRUD ─────────────────────────────────────────────────────
function OfficesCrud() {
  const [editing, setEditing] = useState<Office | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Office | null>(null);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2">
        <div className="text-sm font-semibold">Offices</div>
        <span className="text-[11px] text-muted-foreground">{offices.length} locations</span>
        <Button size="sm" className="ml-auto" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 mr-1.5" /> Add office
        </Button>
      </div>
      <ul className="divide-y stagger-in">
        {offices.map((o) => (
          <li key={o.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30">
            <span className="text-xl leading-none" style={{ color: o.color }}>
              {o.emoji}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{o.name}</div>
              <div className="text-[11px] text-muted-foreground truncate">
                {o.city}, {o.country} · {o.timezone} · {o.openingHours.open}–{o.openingHours.close}{" "}
                · {o.seatCapacity} seats
              </div>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setEditing(o)}
              title="Edit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
              onClick={() => setToDelete(o)}
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>

      <OfficeFormDialog entity={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the office, its rooms, seats, and related closures. Bookings still in
              memory remain attached but you won't be able to reach them from the overview.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  officesStore.removeOffice(toDelete.id);
                  toast.success(`${toDelete.name} removed`);
                }
                setToDelete(null);
              }}
            >
              Delete office
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function OfficeFormDialog({
  entity,
  onClose,
}: {
  entity: Office | "new" | null;
  onClose: () => void;
}) {
  const open = !!entity;
  const isNew = entity === "new";
  const source: Office | null = entity && entity !== "new" ? entity : null;

  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("Europe/Rome");
  const [emoji, setEmoji] = useState("🏢");
  const [color, setColor] = useState(OFFICE_COLORS[0]);
  const [address, setAddress] = useState("");
  const [seatCapacity, setSeatCapacity] = useState(20);
  const [open1, setOpen1] = useState("09:00");
  const [close1, setClose1] = useState("18:00");

  const syncKey = entity === "new" ? "new" : (source?.id ?? "");
  // biome-ignore lint/correctness/useExhaustiveDependencies: hydrate only on open change
  useEffect(() => {
    if (!open) return;
    if (source) {
      setName(source.name);
      setCity(source.city);
      setCountry(source.country);
      setTimezone(source.timezone);
      setEmoji(source.emoji);
      setColor(source.color);
      setAddress(source.address);
      setSeatCapacity(source.seatCapacity);
      setOpen1(source.openingHours.open);
      setClose1(source.openingHours.close);
    } else {
      setName("");
      setCity("");
      setCountry("");
      setTimezone("Europe/Rome");
      setEmoji("🏢");
      setColor(OFFICE_COLORS[0]);
      setAddress("");
      setSeatCapacity(20);
      setOpen1("09:00");
      setClose1("18:00");
    }
  }, [syncKey, open]);

  const canSubmit = !!name.trim() && !!city.trim() && !!timezone && seatCapacity > 0;

  const submit = () => {
    if (!canSubmit) return;
    const payload: Omit<Office, "id"> = {
      name: name.trim(),
      city: city.trim(),
      country: country.trim(),
      timezone: timezone.trim(),
      emoji,
      color,
      address: address.trim(),
      seatCapacity,
      openingHours: { open: open1, close: close1 },
    };
    if (source) {
      officesStore.updateOffice(source.id, payload);
      toast.success(`${payload.name} updated`);
    } else {
      officesStore.addOffice(payload);
      toast.success(`${payload.name} added`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            {isNew ? "New office" : "Edit office"}
          </DialogTitle>
          <DialogDescription>
            Define an office location, its timezone, and default opening hours.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Milan HQ" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">City</Label>
            <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Milan" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Country</Label>
            <Input
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Italy"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Timezone (IANA)</Label>
            <Input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              placeholder="Europe/Rome"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Seat capacity</Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={seatCapacity}
              onChange={(e) => setSeatCapacity(Number(e.target.value) || 0)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Open</Label>
            <Input value={open1} onChange={(e) => setOpen1(e.target.value)} placeholder="08:00" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Close</Label>
            <Input value={close1} onChange={(e) => setClose1(e.target.value)} placeholder="20:00" />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Via Tortona 37"
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Emoji</Label>
            <div className="flex flex-wrap gap-1">
              {EMOJI_PALETTE.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={cn(
                    "h-8 w-8 rounded-md border grid place-items-center text-base hover:bg-muted press-scale",
                    emoji === e && "border-primary bg-primary/10",
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Accent color</Label>
            <div className="flex flex-wrap gap-1.5">
              {OFFICE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 press-scale",
                    color === c
                      ? "border-foreground"
                      : "border-transparent hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {source ? "Save changes" : "Create office"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Rooms CRUD ───────────────────────────────────────────────────────
function RoomsCrud() {
  const [editing, setEditing] = useState<Room | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Room | null>(null);
  const [officeFilter, setOfficeFilter] = useState<string>("all");

  const filtered =
    officeFilter === "all" ? rooms : rooms.filter((r) => r.officeId === officeFilter);

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2 flex-wrap">
        <div className="text-sm font-semibold">Rooms</div>
        <Select value={officeFilter} onValueChange={setOfficeFilter}>
          <SelectTrigger className="h-8 w-[200px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All offices</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.emoji} {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground">{filtered.length} rooms</span>
        <Button size="sm" className="ml-auto" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 mr-1.5" /> Add room
        </Button>
      </div>
      <ul className="divide-y stagger-in">
        {filtered.map((r) => {
          const office = officeById(r.officeId);
          return (
            <li key={r.id} className="px-4 py-3 flex items-center gap-3 hover:bg-muted/30">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: r.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate flex items-center gap-2">
                  {r.name}
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {r.kind}
                  </span>
                  <RoomAmenities room={r} size="xs" />
                </div>
                <div className="text-[11px] text-muted-foreground truncate">
                  {office?.emoji} {office?.name ?? "—"} · capacity {r.capacity}
                </div>
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => setEditing(r)}
                title="Edit"
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => setToDelete(r)}
                title="Delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-4 py-6 text-center text-sm text-muted-foreground">
            No rooms match. Add one to get started.
          </li>
        )}
      </ul>

      <RoomFormDialog entity={editing} onClose={() => setEditing(null)} />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {toDelete?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Removes the room and its dedicated closures. Existing bookings targeting this room
              stay in memory but won't render.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  officesStore.removeRoom(toDelete.id);
                  toast.success(`${toDelete.name} removed`);
                }
                setToDelete(null);
              }}
            >
              Delete room
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function RoomFormDialog({ entity, onClose }: { entity: Room | "new" | null; onClose: () => void }) {
  const open = !!entity;
  const source: Room | null = entity && entity !== "new" ? entity : null;

  const [officeId, setOfficeId] = useState(offices[0]?.id ?? "");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<RoomKind>("meeting");
  const [capacity, setCapacity] = useState(6);
  const [color, setColor] = useState(ROOM_COLORS[0]);
  const [amenities, setAmenities] = useState<Amenity[]>([]);

  const syncKey = entity === "new" ? "new" : (source?.id ?? "");
  // biome-ignore lint/correctness/useExhaustiveDependencies: hydrate only on open change
  useEffect(() => {
    if (!open) return;
    if (source) {
      setOfficeId(source.officeId);
      setName(source.name);
      setKind(source.kind);
      setCapacity(source.capacity);
      setColor(source.color);
      setAmenities(source.amenities);
    } else {
      setOfficeId(offices[0]?.id ?? "");
      setName("");
      setKind("meeting");
      setCapacity(6);
      setColor(ROOM_COLORS[0]);
      setAmenities([]);
    }
  }, [syncKey, open]);

  const toggleAmenity = (a: Amenity) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const canSubmit = !!name.trim() && !!officeId && capacity > 0;

  const submit = () => {
    if (!canSubmit) return;
    const payload: Omit<Room, "id"> = {
      officeId,
      name: name.trim(),
      kind,
      capacity,
      color,
      amenities,
    };
    if (source) {
      officesStore.updateRoom(source.id, payload);
      toast.success(`${payload.name} updated`);
    } else {
      officesStore.addRoom(payload);
      toast.success(`${payload.name} added`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DoorOpen className="h-4 w-4 text-primary" />
            {source ? "Edit room" : "New room"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Office</Label>
            <Select value={officeId} onValueChange={setOfficeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.emoji} {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Atlas" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Kind</Label>
            <Select value={kind} onValueChange={(v) => setKind(v as RoomKind)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {KIND_OPTIONS.map((k) => (
                  <SelectItem key={k.value} value={k.value}>
                    {k.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Capacity</Label>
            <Input
              type="number"
              min={1}
              max={80}
              value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value) || 0)}
            />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Accent color</Label>
            <div className="flex flex-wrap gap-1.5">
              {ROOM_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 press-scale",
                    color === c
                      ? "border-foreground"
                      : "border-transparent hover:border-muted-foreground",
                  )}
                  style={{ backgroundColor: c }}
                  title={c}
                />
              ))}
            </div>
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Amenities</Label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_AMENITIES.map((a) => {
                const meta = AMENITY_META[a];
                const Icon = meta.icon;
                const on = amenities.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggleAmenity(a)}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border press-scale",
                      on ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {source ? "Save changes" : "Create room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Seats CRUD ───────────────────────────────────────────────────────
function SeatsCrud() {
  const [editing, setEditing] = useState<Seat | "new" | null>(null);
  const [toDelete, setToDelete] = useState<Seat | null>(null);
  const [officeFilter, setOfficeFilter] = useState<string>(offices[0]?.id ?? "all");

  const filtered = officeFilter === "all" ? seats : seatsByOffice(officeFilter);

  const grouped = filtered.reduce<Record<string, Seat[]>>((acc, s) => {
    if (!acc[s.zone]) acc[s.zone] = [];
    acc[s.zone].push(s);
    return acc;
  }, {});

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b flex items-center gap-2 flex-wrap">
        <div className="text-sm font-semibold">Seats</div>
        <Select value={officeFilter} onValueChange={setOfficeFilter}>
          <SelectTrigger className="h-8 w-[220px] text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All offices</SelectItem>
            {offices.map((o) => (
              <SelectItem key={o.id} value={o.id}>
                {o.emoji} {o.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground">{filtered.length} seats</span>
        <Button size="sm" className="ml-auto" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4 mr-1.5" /> Add seat
        </Button>
      </div>

      {Object.keys(grouped).length === 0 && (
        <div className="px-4 py-6 text-center text-sm text-muted-foreground">
          No seats yet. Add one.
        </div>
      )}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([zone, list]) => (
          <div key={zone} className="border-b last:border-b-0">
            <div className="px-4 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold bg-muted/30">
              Zone {zone} · {list.length}
            </div>
            <ul className="divide-y stagger-in">
              {list.map((s) => {
                const office = officeById(s.officeId);
                return (
                  <li key={s.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-muted/30">
                    <span className="font-mono text-sm tabular-nums w-16 shrink-0">{s.label}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] text-muted-foreground truncate flex items-center gap-2">
                        <span>
                          {office?.emoji} {office?.name}
                        </span>
                        <SeatFeatures seat={s} size="xs" />
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => setEditing(s)}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setToDelete(s)}
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}

      <SeatFormDialog
        entity={editing}
        onClose={() => setEditing(null)}
        defaultOfficeId={officeFilter === "all" ? offices[0]?.id : officeFilter}
      />

      <AlertDialog open={!!toDelete} onOpenChange={(o) => !o && setToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete seat {toDelete?.label}?</AlertDialogTitle>
            <AlertDialogDescription>Removes the seat from the floor plan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (toDelete) {
                  officesStore.removeSeat(toDelete.id);
                  toast.success(`Seat ${toDelete.label} removed`);
                }
                setToDelete(null);
              }}
            >
              Delete seat
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function SeatFormDialog({
  entity,
  onClose,
  defaultOfficeId,
}: {
  entity: Seat | "new" | null;
  onClose: () => void;
  defaultOfficeId?: string;
}) {
  const open = !!entity;
  const source: Seat | null = entity && entity !== "new" ? entity : null;

  const [officeId, setOfficeId] = useState(defaultOfficeId ?? offices[0]?.id ?? "");
  const [zone, setZone] = useState("A");
  const [label, setLabel] = useState("A-01");
  const [wifi, setWifi] = useState(true);
  const [monitor, setMonitor] = useState(false);
  const [standing, setStanding] = useState(false);

  const syncKey = entity === "new" ? "new" : (source?.id ?? "");
  // biome-ignore lint/correctness/useExhaustiveDependencies: hydrate only on open change
  useEffect(() => {
    if (!open) return;
    if (source) {
      setOfficeId(source.officeId);
      setZone(source.zone);
      setLabel(source.label);
      setWifi(source.wifi);
      setMonitor(source.monitor);
      setStanding(source.standing);
    } else {
      setOfficeId(defaultOfficeId ?? offices[0]?.id ?? "");
      const existingCount = seats.filter(
        (s) => s.officeId === (defaultOfficeId ?? offices[0]?.id) && s.zone === "A",
      ).length;
      setZone("A");
      setLabel(`A-${String(existingCount + 1).padStart(2, "0")}`);
      setWifi(true);
      setMonitor(false);
      setStanding(false);
    }
  }, [syncKey, open]);

  const canSubmit = !!officeId && !!zone.trim() && !!label.trim();

  const submit = () => {
    if (!canSubmit) return;
    const payload: Omit<Seat, "id"> = {
      officeId,
      zone: zone.trim().toUpperCase(),
      label: label.trim(),
      wifi,
      monitor,
      standing,
    };
    if (source) {
      officesStore.updateSeat(source.id, payload);
      toast.success(`Seat ${payload.label} updated`);
    } else {
      officesStore.addSeat(payload);
      toast.success(`Seat ${payload.label} added`);
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Armchair className="h-4 w-4 text-primary" />
            {source ? "Edit seat" : "New seat"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2 space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Office</Label>
            <Select value={officeId} onValueChange={setOfficeId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {offices.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.emoji} {o.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Zone</Label>
            <Input value={zone} onChange={(e) => setZone(e.target.value)} maxLength={10} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase tracking-wider">Label</Label>
            <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="A-01" />
          </div>
          <div className="col-span-2 space-y-2">
            <Label className="text-[11px] uppercase tracking-wider">Features</Label>
            <FeatureRow label="Wi-Fi" checked={wifi} onChange={setWifi} />
            <FeatureRow label="External monitor" checked={monitor} onChange={setMonitor} />
            <FeatureRow label="Standing desk" checked={standing} onChange={setStanding} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!canSubmit}>
            {source ? "Save changes" : "Create seat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeatureRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border px-3 py-2">
      <span className="text-sm">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
