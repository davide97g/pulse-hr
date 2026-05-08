import { createContext, useCallback, useContext, useMemo } from "react";
import { type Booking, findConflict } from "@/lib/offices";
import { bookingsTable, useBookingRows } from "@/lib/tables/bookings";

interface Ctx {
  bookings: Booking[];
  addBooking: (b: Omit<Booking, "id">) => { booking: Booking; conflict: Booking | null };
  cancelBooking: (id: string) => void;
  restoreBooking: (b: Booking) => void;
  findConflictFor: (
    resourceId: string,
    date: string,
    start: string,
    end: string,
    ignoreId?: string,
  ) => Booking | null;
}

const BookingsCtx = createContext<Ctx | null>(null);

export function BookingsProvider({ children }: { children: React.ReactNode }) {
  const bookings = useBookingRows();

  const addBooking: Ctx["addBooking"] = useCallback(
    (b) => {
      const current = bookingsTable.getAll();
      const conflict = findConflict(
        b.resourceId,
        b.date,
        b.startTime,
        b.endTime,
        undefined,
        current,
      );
      const booking = bookingsTable.add(b);
      return { booking, conflict };
    },
    [],
  );

  const cancelBooking = useCallback((id: string) => {
    bookingsTable.remove(id);
  }, []);

  const restoreBooking = useCallback((b: Booking) => {
    bookingsTable.add(b);
  }, []);

  const findConflictFor: Ctx["findConflictFor"] = useCallback(
    (resourceId, date, start, end, ignoreId) =>
      findConflict(resourceId, date, start, end, ignoreId, bookingsTable.getAll()),
    [],
  );

  const value = useMemo<Ctx>(
    () => ({ bookings, addBooking, cancelBooking, restoreBooking, findConflictFor }),
    [bookings, addBooking, cancelBooking, restoreBooking, findConflictFor],
  );

  return <BookingsCtx.Provider value={value}>{children}</BookingsCtx.Provider>;
}

export function useBookings(): Ctx {
  const ctx = useContext(BookingsCtx);
  if (!ctx) throw new Error("useBookings must be inside <BookingsProvider>");
  return ctx;
}
