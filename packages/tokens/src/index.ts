/**
 * @pulse-hr/tokens — typed JS/TS exports mirroring tokens.css.
 *
 * Two flavours:
 *   - `token` object: CSS variable strings (e.g. "var(--primary)") for inline
 *     styles, Recharts palettes, and any runtime code that reads a live
 *     theme-aware value.
 *   - `hex` / `font` / `radius` constants: raw values for contexts where CSS
 *     vars can't resolve (OG-image generation, Remotion renders, Storybook
 *     swatch grids).
 */

// ----- Live (CSS-var backed) tokens — resolve against the active theme -----
export const token = {
  // semantic surfaces
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",

  // intent
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  secondaryForeground: "var(--secondary-foreground)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  accentForeground: "var(--accent-foreground)",
  destructive: "var(--destructive)",
  destructiveForeground: "var(--destructive-foreground)",
  success: "var(--success)",
  successForeground: "var(--success-foreground)",
  warning: "var(--warning)",
  warningForeground: "var(--warning-foreground)",
  info: "var(--info)",
  infoForeground: "var(--info-foreground)",

  // structural
  border: "var(--border)",
  input: "var(--input)",
  ring: "var(--ring)",

  // sidebar
  sidebar: "var(--sidebar)",
  sidebarForeground: "var(--sidebar-foreground)",
  sidebarAccent: "var(--sidebar-accent)",
  sidebarAccentForeground: "var(--sidebar-accent-foreground)",
  sidebarBorder: "var(--sidebar-border)",

  // signature
  labs: "var(--labs)",
  labsForeground: "var(--labs-foreground)",

  // role identification (stable across themes)
  roleEmployee: "var(--role-employee)",
  roleManager: "var(--role-manager)",
  roleHr: "var(--role-hr)",
  roleAdmin: "var(--role-admin)",
  roleFinance: "var(--role-finance)",

  // calendar
  calVacation: "var(--cal-vacation)",
  calSick: "var(--cal-sick)",
  calPersonal: "var(--cal-personal)",
  calParental: "var(--cal-parental)",
  calHoliday: "var(--cal-holiday)",

  // elevation
  shadowCard: "var(--shadow-card)",
  shadowPanel: "var(--shadow-panel)",
  shadowPop: "var(--shadow-pop)",
} as const;

// ----- Themes -----
export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

// ----- Raw hex values for contexts that can't resolve CSS vars -----
export const hex = {
  // brand signature — lime is the only spark
  labs: "#b4ff39",
  labsHover: "#c6ff5a",
  ink: "#0b0b0d",
  cream: "#f2f2ee",
  spark: "#b4ff39",
  sparkInk: "#0a1400",
  paper: "#f5f4f2",
  // role accents (kept for role-identification chips, NOT theming)
  roleEmployee: "#b4ff39",
  roleManager: "#ffbf4a",
  roleHr: "#ff8a7a",
  roleAdmin: "#6fd8ff",
  roleFinance: "#c48fff",
  // status
  success: "#b4ff39",
  warning: "#ffbf4a",
  danger: "#ff8a7a",
  info: "#6fd8ff",
} as const;

// ----- Typography -----
export const font = {
  display: '"Fraunces", ui-serif, Georgia, "Times New Roman", serif',
  sans: '"Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

// ----- Radii (px) -----
export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 10,
  xl: 14,
  "2xl": 20,
  full: 9999,
} as const;

// ----- Motion -----
export const duration = {
  fast: 120,
  normal: 220,
  slow: 420,
} as const;

export const ease = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  emphasized: "cubic-bezier(0.22, 1.2, 0.36, 1)",
} as const;

// ----- Shadows (raw — mirrors dark palette from tokens.css) -----
export const shadow = {
  card: "0 1px 2px oklch(0 0 0 / 0.5), 0 2px 4px oklch(0 0 0 / 0.3)",
  panel: "-8px 0 32px -8px oklch(0 0 0 / 0.6)",
  pop: "0 8px 32px -8px oklch(0 0 0 / 0.7), 0 2px 6px oklch(0 0 0 / 0.4)",
} as const;

// ----- Legacy flat shape for back-compat — remove after marketing + reel migrate -----
export const color = {
  brand: hex.labs,
  brandHover: hex.labsHover,
  ink: hex.ink,
  cream: hex.cream,
  role: {
    employee: hex.roleEmployee,
    manager: hex.roleManager,
    hr: hex.roleHr,
    admin: hex.roleAdmin,
    finance: hex.roleFinance,
  },
  status: {
    success: hex.success,
    warning: hex.warning,
    danger: hex.danger,
    info: hex.info,
  },
} as const;

export const tokens = { token, hex, font, radius, duration, ease, shadow, THEMES } as const;
export type Tokens = typeof tokens;
