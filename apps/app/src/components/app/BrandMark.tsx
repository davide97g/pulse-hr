import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  size?: "sm" | "md" | "lg";
  className?: string;
};

const BOX: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
};

const ICON: Record<NonNullable<Props["size"]>, string> = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

/**
 * Pulse HR brand lockup icon — lime square + black sparkle. Matches the
 * marketing site (`apps/marketing/src/components/Nav.astro`) and the
 * browser favicon (`apps/marketing/public/favicon.svg`).
 *
 * Use this instead of a role-themed `bg-primary` square so the product
 * identity stays consistent across every theme.
 */
export function BrandMark({ size = "md", className }: Props) {
  return (
    <span
      className={cn(
        "rounded-md bg-[#b4ff39] text-[#0b0b0d] flex items-center justify-center shrink-0",
        BOX[size],
        className,
      )}
      aria-hidden
    >
      <Sparkles className={ICON[size]} strokeWidth={2.5} />
    </span>
  );
}
