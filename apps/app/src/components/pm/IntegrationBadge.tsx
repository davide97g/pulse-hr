import type { IntegrationProvider } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const glyph: Record<IntegrationProvider, string> = { jira: "J", linear: "L" };
const accent: Record<IntegrationProvider, string> = {
  jira: "oklch(0.6 0.18 258)",
  linear: "oklch(0.65 0.18 290)",
};

export function IntegrationBadge({
  provider,
  issueKey,
  onClick,
  className,
}: {
  provider: IntegrationProvider;
  issueKey: string;
  onClick?: () => void;
  className?: string;
}) {
  const Tag = onClick ? "button" : "span";
  return (
    <Tag
      onClick={onClick}
      type={onClick ? "button" : undefined}
      className={cn(
        "inline-flex items-center gap-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded-md border bg-background",
        onClick && "hover:brightness-110 press-scale",
        className,
      )}
      style={{ borderColor: `color-mix(in oklch, ${accent[provider]} 45%, transparent)` }}
    >
      <span
        className="h-3.5 w-3.5 rounded-[3px] flex items-center justify-center text-[9px] font-bold text-white"
        style={{ backgroundColor: accent[provider] }}
      >
        {glyph[provider]}
      </span>
      {issueKey}
    </Tag>
  );
}
