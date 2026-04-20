type ClerkUserLike = {
  publicMetadata?: Record<string, unknown>;
  unsafeMetadata?: Record<string, unknown>;
};

/**
 * Client-side admin check. Canonical answer still comes from the server —
 * this only controls which controls are visible in the UI.
 */
export function isAdminUser(user: ClerkUserLike | null | undefined): boolean {
  if (!user) return false;
  const role =
    (user.publicMetadata?.role as string | undefined) ??
    (user.unsafeMetadata?.role as string | undefined);
  return role === "admin";
}
