type ClerkUserLike = {
  publicMetadata?: Record<string, unknown>;
};

/**
 * Pulse-staff admin check (real Clerk role only). `unsafeMetadata` is
 * user-writable, so it must never count as an admin signal — workspace
 * persona "admin" lives in `workspace-role.ts` and is a separate concept.
 *
 * Server-side checks remain authoritative; this only controls visibility.
 */
export function isAdminUser(user: ClerkUserLike | null | undefined): boolean {
  if (!user) return false;
  return (user.publicMetadata?.role as string | undefined) === "admin";
}
