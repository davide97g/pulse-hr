import { Avatar } from "@/components/app/AppShell";
import { cn } from "@/lib/utils";

interface BirthdayHaloProps {
  initials: string;
  color: string;
  size?: number;
  active: boolean;
  /** Tooltip text when active. */
  title?: string;
  showCake?: boolean;
}

/**
 * Wraps Avatar with an iridescent rotating ring + cake badge when `active`.
 * When inactive, renders the Avatar untouched (no layout shift).
 */
export function BirthdayHalo({
  initials,
  color,
  size = 40,
  active,
  title = "Birthday today — send kudos!",
  showCake = true,
}: BirthdayHaloProps) {
  if (!active) return <Avatar initials={initials} color={color} size={size} />;
  const ringPad = Math.max(2, Math.round(size / 18));
  return (
    <div
      className="relative shrink-0"
      style={{ width: size + ringPad * 2, height: size + ringPad * 2 }}
      title={title}
    >
      <div className="absolute inset-0 rounded-full birthday-halo" aria-hidden />
      <div className="absolute rounded-full bg-card" style={{ inset: ringPad }} />
      <div className="absolute" style={{ inset: ringPad }}>
        <Avatar initials={initials} color={color} size={size} />
      </div>
      {showCake && (
        <span
          className={cn(
            "absolute text-[10px] leading-none rounded-full bg-card border shadow-sm grid place-items-center",
          )}
          style={{
            right: -ringPad,
            bottom: -ringPad,
            width: Math.max(16, size * 0.36),
            height: Math.max(16, size * 0.36),
            fontSize: Math.max(10, size * 0.3),
          }}
          aria-label="Birthday today"
        >
          🎂
        </span>
      )}
    </div>
  );
}
