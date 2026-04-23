/**
 * AvatarDisplay — pure visual atom (circle + initials). No domain coupling.
 * The main app composes this with a hover-card wrapper for employee-profile
 * previews; consumers that just need the visual import this directly.
 */
export function AvatarDisplay({
  initials,
  color,
  size = 32,
}: {
  initials: string;
  color: string;
  size?: number;
}) {
  return (
    <div
      className="rounded-full flex items-center justify-center font-medium shrink-0 text-[color:var(--avatar-ink)]"
      style={{ backgroundColor: color, width: size, height: size, fontSize: size * 0.4 }}
    >
      {initials}
    </div>
  );
}
