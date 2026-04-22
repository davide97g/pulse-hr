import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { bookings as seedBookings, type Booking, findConflict } from "@/lib/offices";

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
  const [bookings, setBookings] = useState<Booking[]>(seedBookings);

  const addBooking: Ctx["addBooking"] = useCallback(
    (b) => {
      const conflict = findConflict(
        b.resourceId,
        b.date,
        b.startTime,
        b.endTime,
        undefined,
        bookings,
      );
      const booking: Booking = {
        ...b,
        id: `bk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      };
      setBookings((bs) => [booking, ...bs]);
      return { booking, conflict };
    },
    [bookings],
  );

  const cancelBooking = useCallback((id: string) => {
    setBookings((bs) => bs.filter((b) => b.id !== id));
  }, []);

  const restoreBooking = useCallback((b: Booking) => {
    setBookings((bs) => [b, ...bs]);
  }, []);

  const findConflictFor: Ctx["findConflictFor"] = useCallback(
    (resourceId, date, start, end, ignoreId) =>
      findConflict(resourceId, date, start, end, ignoreId, bookings),
    [bookings],
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
