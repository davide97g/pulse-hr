import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { seatsSeed, __setSeats, type Seat } from "@/lib/offices";

export const seatsTable = createTable<Seat>("seats", seatsSeed, "st");

export function useSeats(): Seat[] {
  return seatsTable.useAll();
}

export function useSeat(id: string): Seat | undefined {
  return seatsTable.useById(id);
}

seatsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setSeats(seatsTable.getAll());
});
