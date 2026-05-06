import { Sun, Moon } from "lucide-react";
import { useTheme } from "@pulse-hr/ui/theme";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;
  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} theme`}
      title={`Theme: ${theme}`}
      className={cn(
        "inline-flex items-center gap-2 rounded-md border hover:bg-muted transition-colors press-scale",
        compact ? "h-9 w-9 justify-center" : "h-9 px-2.5",
      )}
    >
      <Icon className="h-4 w-4" />
      {!compact && <span className="text-sm font-medium capitalize">{theme}</span>}
    </button>
  );
}
