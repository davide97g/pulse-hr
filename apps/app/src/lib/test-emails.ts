// Test-account bypass for Clerk email verification flows.
//
// Test users configured in Clerk's dashboard accept the fixed code "424242"
// regardless of what was actually sent. We detect those accounts client-side
// so login/signup can finalize without surfacing the device-verification UI.

const KNOWN_TEST_EMAILS = new Set([
  "johndoe@acme.com",
  "newuser@test.com",
]);

export const CLERK_TEST_CODE = "424242";

export function isTestEmail(raw: string | null | undefined): boolean {
  if (!raw) return false;
  const email = raw.trim().toLowerCase();
  if (!email) return false;
  if (KNOWN_TEST_EMAILS.has(email)) return true;
  // Clerk's universal test-mode convention: <local>+clerk_test@<domain>
  return /\+clerk_test@/.test(email);
}
