/** Logical workspace id for shared Neon rows (override per env / tenant). */
export function pulseWorkspaceKey(): string {
  const v = import.meta.env.VITE_WORKSPACE_KEY;
  const s = typeof v === "string" ? v.trim() : "";
  return s.length > 0 ? s : "default";
}
