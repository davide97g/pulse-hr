import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "employee" | "hr" | "admin" | "manager" | "finance";

export const THEMES: { id: Theme; label: string; role?: string; swatch: string; bg: string; mode: "light" | "dark" }[] = [
  { id: "light",    label: "Light",    swatch: "oklch(0.55 0.18 258)", bg: "oklch(0.99 0.002 250)", mode: "light" },
  { id: "dark",     label: "Dark",     swatch: "oklch(0.72 0.17 258)", bg: "oklch(0.14 0.006 280)", mode: "dark" },
  { id: "employee", label: "Employee", role: "Signature", swatch: "oklch(0.88 0.22 130)", bg: "oklch(0.14 0.006 280)", mode: "dark" },
  { id: "hr",       label: "HR",       role: "Coral",     swatch: "oklch(0.78 0.19 10)",  bg: "oklch(0.15 0.012 15)",  mode: "dark" },
  { id: "admin",    label: "Admin",    role: "Electric",  swatch: "oklch(0.82 0.17 220)", bg: "oklch(0.14 0.01 235)",  mode: "dark" },
  { id: "manager",  label: "Manager",  role: "Amber",     swatch: "oklch(0.84 0.17 75)",  bg: "oklch(0.15 0.012 60)",  mode: "dark" },
  { id: "finance",  label: "Finance",  role: "Violet",    swatch: "oklch(0.76 0.2 305)",  bg: "oklch(0.15 0.014 305)", mode: "dark" },
];

const STORAGE_KEY = "pulse.theme";
const DEFAULT_THEME: Theme = "light";

function readStored(): Theme {
  if (typeof window === "undefined") return DEFAULT_THEME;
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v && THEMES.some(t => t.id === v)) return v as Theme;
  } catch {}
  return DEFAULT_THEME;
}

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
  const mode = THEMES.find(t => t.id === theme)?.mode ?? "light";
  document.documentElement.classList.toggle("dark", mode === "dark");
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]:not([media])');
  const bg = THEMES.find(t => t.id === theme)?.bg;
  if (meta && bg) meta.content = bg;
}

const Ctx = createContext<{ theme: Theme; setTheme: (t: Theme) => void }>({
  theme: DEFAULT_THEME,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => readStored());

  useEffect(() => {
    applyTheme(theme);
    try { localStorage.setItem(STORAGE_KEY, theme); } catch {}
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme: setThemeState }), [theme]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  return useContext(Ctx);
}
