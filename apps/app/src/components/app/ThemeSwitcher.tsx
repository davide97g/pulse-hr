import { Check, Palette, Sun, Moon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { THEMES, useTheme, type Theme } from "./ThemeProvider";
import { cn } from "@/lib/utils";

export function ThemeSwitcher({ compact }: { compact?: boolean }) {
  const { theme, setTheme } = useTheme();
  const current = THEMES.find((t) => t.id === theme)!;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "inline-flex items-center gap-2 rounded-md border hover:bg-muted transition-colors press-scale",
            compact ? "h-9 w-9 justify-center" : "h-9 px-2.5",
          )}
          aria-label="Switch theme"
          title={`Theme: ${current.label}`}
        >
          <span
            className="h-4 w-4 rounded-full ring-2 ring-background shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${current.swatch} 0%, ${current.bg} 100%)`,
            }}
          />
          {!compact && <span className="text-sm font-medium">{current.label}</span>}
          {!compact && <Palette className="h-3.5 w-3.5 text-muted-foreground" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0">
        <div className="px-4 py-3 border-b">
          <div className="text-sm font-semibold">Theme</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            Baseline modes plus a palette per role.
          </div>
        </div>

        <div className="p-2">
          <SectionLabel>Baseline</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            <ThemeTile
              t={THEMES.find((t) => t.id === "light")!}
              active={theme === "light"}
              onSelect={setTheme}
              icon={<Sun className="h-3.5 w-3.5" />}
            />
            <ThemeTile
              t={THEMES.find((t) => t.id === "dark")!}
              active={theme === "dark"}
              onSelect={setTheme}
              icon={<Moon className="h-3.5 w-3.5" />}
            />
          </div>

          <SectionLabel className="mt-3">By role</SectionLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {(["employee", "hr", "admin", "manager", "finance"] as Theme[]).map((id) => {
              const t = THEMES.find((x) => x.id === id)!;
              return <ThemeTile key={id} t={t} active={theme === id} onSelect={setTheme} />;
            })}
          </div>
        </div>

        <div className="px-4 py-2.5 border-t text-[11px] text-muted-foreground">
          Your choice is saved on this device.
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "text-[10px] uppercase tracking-[0.18em] font-medium text-muted-foreground px-1.5 mb-1.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

function ThemeTile({
  t,
  active,
  onSelect,
  icon,
}: {
  t: (typeof THEMES)[number];
  active: boolean;
  onSelect: (id: Theme) => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={() => onSelect(t.id)}
      className={cn(
        "group relative flex items-start gap-2 p-2 rounded-md border text-left transition-all press-scale",
        active ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04]" : "hover:bg-muted/60",
      )}
    >
      <div
        className="h-10 w-10 rounded-md shrink-0 border overflow-hidden relative"
        style={{ background: t.bg }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(circle at 70% 30%, ${t.swatch} 0%, transparent 60%)`,
          }}
        />
        <div
          className="absolute bottom-1 left-1 h-2 w-2 rounded-full"
          style={{ background: t.swatch, boxShadow: `0 0 8px ${t.swatch}` }}
        />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-center gap-1 text-sm font-medium">
          {icon}
          {t.label}
          {active && <Check className="h-3 w-3 ml-auto text-primary" />}
        </div>
        {t.role && (
          <div className="text-[10px] text-muted-foreground mt-0.5">
            {t.role} · {t.mode}
          </div>
        )}
        {!t.role && (
          <div className="text-[10px] text-muted-foreground mt-0.5 capitalize">{t.mode} mode</div>
        )}
      </div>
    </button>
  );
}
