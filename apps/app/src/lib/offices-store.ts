/**
 * Mutator surface for offices/rooms/seats/closures. Preserves the public
 * `officesStore` API consumed by `OfficesManagePanel` and
 * `OfficesStoreProvider` while delegating persistence to the
 * localStorage-backed tables in `./tables/{offices,rooms,seats,closures}`.
 *
 * Re-exported by `./offices.ts` so legacy `import { officesStore } from
 * "@/lib/offices"` keeps working.
 */
import { subscribeToAnyTable, getAnyTableVersion } from "@/lib/storage";
import {
  officesSeed,
  roomsSeed,
  seatsSeed,
  closuresSeed,
  type Office,
  type Room,
  type Seat,
  type Closure,
} from "@/lib/offices";
import { officesTable } from "@/lib/tables/offices";
import { roomsTable } from "@/lib/tables/rooms";
import { seatsTable } from "@/lib/tables/seats";
import { closuresTable } from "@/lib/tables/closures";

export const officesStore = {
  subscribe: subscribeToAnyTable,
  getVersion: getAnyTableVersion,

  // ── Offices ─────────────────────────────────────────────────────
  addOffice(o: Omit<Office, "id">): Office {
    return officesTable.add(o);
  },
  updateOffice(id: string, patch: Partial<Omit<Office, "id">>) {
    officesTable.update(id, patch);
  },
  removeOffice(id: string) {
    officesTable.remove(id);
    for (const r of roomsTable.getAll()) {
      if (r.officeId === id) roomsTable.remove(r.id);
    }
    for (const s of seatsTable.getAll()) {
      if (s.officeId === id) seatsTable.remove(s.id);
    }
    for (const c of closuresTable.getAll()) {
      if (c.scopeKind === "office" && c.scopeId === id) closuresTable.remove(c.id);
    }
  },

  // ── Rooms ───────────────────────────────────────────────────────
  addRoom(r: Omit<Room, "id">): Room {
    return roomsTable.add(r);
  },
  updateRoom(id: string, patch: Partial<Omit<Room, "id">>) {
    roomsTable.update(id, patch);
  },
  removeRoom(id: string) {
    roomsTable.remove(id);
    for (const c of closuresTable.getAll()) {
      if (c.scopeKind === "room" && c.scopeId === id) closuresTable.remove(c.id);
    }
  },

  // ── Seats ───────────────────────────────────────────────────────
  addSeat(s: Omit<Seat, "id">): Seat {
    return seatsTable.add(s);
  },
  updateSeat(id: string, patch: Partial<Omit<Seat, "id">>) {
    seatsTable.update(id, patch);
  },
  removeSeat(id: string) {
    seatsTable.remove(id);
  },

  // ── Closures ────────────────────────────────────────────────────
  addClosure(c: Omit<Closure, "id">): Closure {
    return closuresTable.add(c);
  },
  removeClosure(id: string) {
    closuresTable.remove(id);
  },

  reset() {
    officesTable.replace(officesSeed.map((o) => ({ ...o })));
    roomsTable.replace(roomsSeed.map((r) => ({ ...r })));
    seatsTable.replace(seatsSeed.map((s) => ({ ...s })));
    closuresTable.replace(closuresSeed.map((c) => ({ ...c })));
  },
};
