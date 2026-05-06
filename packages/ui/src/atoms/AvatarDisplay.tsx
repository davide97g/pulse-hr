import type { CSSProperties } from "react";
import { cn } from "../lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | number;

export interface AvatarDisplayProps {
  initials: string;
  /** Per-user accent colour. When set, used as the background. Otherwise the
   * editorial style applies (ink bg + paper initials, room-aware in dark). */
  color?: string;
  /** Size: named editorial size (xs/sm/md/lg) or a custom pixel value. */
  size?: AvatarSize;
  className?: string;
  style?: CSSProperties;
}

const NAMED_SIZE_PX: Record<Exclude<AvatarSize, number>, number> = {
  xs: 18,
  sm: 26,
  md: 32,
  lg: 44,
};

const NAMED_SIZE_CLASS: Record<Exclude<AvatarSize, number>, string> = {
  xs: "ph-avatar-xs",
  sm: "ph-avatar-sm",
  md: "",
  lg: "ph-avatar-lg",
};

function resolvePx(size: AvatarSize): number {
  return typeof size === "number" ? size : NAMED_SIZE_PX[size];
}

/**
 * Visual avatar atom — circle with monospace uppercase initials. Two render
 * modes:
 *
 *   - **editorial** (default): ink-on-paper inversion, room-aware via the
 *     `.ph-avatar` class. Use named sizes (xs/sm/md/lg) for canonical scale.
 *   - **tinted** (when `color` is set): legacy per-user accent for hover-card
 *     consumers. Falls back to inline px sizing.
 */
export function AvatarDisplay({
  initials,
  color,
  size = "md",
  className,
  style,
}: AvatarDisplayProps) {
  if (color !== undefined) {
    const px = resolvePx(size);
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-medium shrink-0 text-[color:var(--avatar-ink)]",
          className,
        )}
        style={{
          backgroundColor: color,
          width: px,
          height: px,
          fontSize: px * 0.4,
          ...style,
        }}
      >
        {initials}
      </div>
    );
  }

  const namedClass = typeof size === "number" ? "" : NAMED_SIZE_CLASS[size];
  const inlineSize: CSSProperties =
    typeof size === "number"
      ? { width: size, height: size, minWidth: size, fontSize: size * 0.36 }
      : {};

  return (
    <span className={cn("ph-avatar", namedClass, className)} style={{ ...inlineSize, ...style }}>
      {initials}
    </span>
  );
}
