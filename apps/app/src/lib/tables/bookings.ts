import { createTable } from "@/lib/storage";
import { isWorkspaceReady } from "@/lib/workspace";
import { bookingsSeed, __setBookings, type Booking } from "@/lib/offices";

export const bookingsTable = createTable<Booking>("bookings", bookingsSeed, "bk");

export function useBookingRows(): Booking[] {
  return bookingsTable.useAll();
}

export function useBooking(id: string): Booking | undefined {
  return bookingsTable.useById(id);
}

export function bookingById(id: string): Booking | undefined {
  return bookingsTable.getAll().find((b) => b.id === id);
}

bookingsTable.subscribe(() => {
  if (!isWorkspaceReady()) return;
  __setBookings(bookingsTable.getAll());
});
