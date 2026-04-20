/**
 * Small helpers around Clerk's user object so UI copy can address the viewer
 * by name without every call site re-deriving the same fallbacks.
 */
import { useUser } from "@clerk/react";

function greetingFor(date: Date): string {
  const h = date.getHours();
  if (h < 5) return "Good evening";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

/** "Davide" (first name) → fallback to email local-part → "there". */
export function useFirstName(): string {
  const { user } = useUser();
  return (
    user?.firstName ||
    user?.username ||
    user?.primaryEmailAddress?.emailAddress?.split("@")[0] ||
    "there"
  );
}

/** "Davide Ghiotto" → falls back to first name. */
export function useFullName(): string {
  const { user } = useUser();
  return user?.fullName || user?.firstName || user?.username || "";
}

/** "Good morning, Davide" — time-of-day greeting. */
export function useGreeting(now: Date = new Date()): string {
  const name = useFirstName();
  return `${greetingFor(now)}, ${name}`;
}
