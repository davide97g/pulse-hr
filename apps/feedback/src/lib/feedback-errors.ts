/**
 * Maps voting-power error codes from the API to user-friendly toast strings.
 *
 * The API throws `{ error: { code, message } }` with a 422 status; the shared
 * `request()` helper in `lib/comments/api.ts` and `lib/proposals/api.ts`
 * already attaches `code` to the thrown Error. Callers should catch the
 * thrown error and pass it here.
 */

export type ApiErrorCode = "insufficient_power" | "daily_cap_reached" | string;

export interface ApiErrorLike {
  code?: string;
  message?: string;
}

export function describeApiError(err: unknown, fallback: string): string {
  const code = (err as ApiErrorLike | null)?.code;
  if (code === "insufficient_power") {
    return "You're out of voting power. Refills weekly to 10.";
  }
  if (code === "daily_cap_reached") {
    return "Daily limit reached — try again tomorrow.";
  }
  return fallback;
}

export function isVotingPowerError(err: unknown): boolean {
  const code = (err as ApiErrorLike | null)?.code;
  return code === "insufficient_power" || code === "daily_cap_reached";
}
