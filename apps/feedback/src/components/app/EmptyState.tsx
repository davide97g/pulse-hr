import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ParticleField } from "./ParticleField";

export type EmptyStateTone = "neutral" | "welcome" | "filter";
export type EmptyStateIllustration = "sparkles" | "dots" | "grid" | "none";

type Props = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  compact?: boolean;
  /** Visual tone. Defaults to "neutral". "welcome" brightens + adds particles; "filter" mutes + hides particles. */
  tone?: EmptyStateTone;
  /** Background illustration behind icon/text. Defaults to "sparkles" for welcome/neutral tones. */
  illustration?: EmptyStateIllustration;
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  compact,
  tone = "neutral",
  illustration,
}: Props) {
  const resolvedIllustration: EmptyStateIllustration =
    illustration ?? (tone === "filter" ? "none" : tone === "welcome" ? "sparkles" : "dots");

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center text-center fade-in overflow-hidden",
        compact ? "py-10 px-6" : "py-16 px-6",
        tone === "welcome" &&
          "bg-gradient-to-b from-[color:var(--labs,#b4ff39)]/5 via-transparent to-transparent rounded-xl",
        className,
      )}
    >
      {resolvedIllustration !== "none" && (
        <IllustrationLayer kind={resolvedIllustration} tone={tone} />
      )}
      {icon && (
        <div className="relative mb-4 z-10">
          <div
            className={cn(
              "absolute inset-0 -m-3 rounded-full blur-xl",
              tone === "welcome" ? "bg-[color:var(--labs,#b4ff39)]/15" : "bg-primary/5",
            )}
            aria-hidden
          />
          <div
            className={cn(
              "relative h-14 w-14 rounded-2xl border bg-card shadow-card flex items-center justify-center pop-in",
              tone === "welcome" ? "text-[color:var(--labs,#b4ff39)]" : "text-muted-foreground",
            )}
          >
            {icon}
          </div>
        </div>
      )}
      <div className="relative z-10 text-sm font-semibold">{title}</div>
      {description && (
        <div className="relative z-10 text-xs text-muted-foreground mt-1 max-w-sm">
          {description}
        </div>
      )}
      {action && <div className="relative z-10 mt-4">{action}</div>}
    </div>
  );
}

function IllustrationLayer({ kind, tone }: { kind: EmptyStateIllustration; tone: EmptyStateTone }) {
  if (kind === "sparkles") {
    return (
      <div className="absolute inset-0 opacity-[0.45] pointer-events-none">
        <ParticleField
          variant={tone === "welcome" ? "celebrate" : "ambient"}
          density="sparse"
          size="full"
        />
      </div>
    );
  }
  if (kind === "dots") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, color-mix(in oklch, var(--foreground) 14%, transparent) 1px, transparent 0)",
          backgroundSize: "18px 18px",
          maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
        }}
      />
    );
  }
  if (kind === "grid") {
    return (
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.22] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklch, var(--foreground) 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black 35%, transparent 80%)",
        }}
      />
    );
  }
  return null;
}
