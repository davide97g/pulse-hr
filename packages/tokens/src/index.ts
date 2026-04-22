/**
 * @workflows-people/tokens — typed JS/TS exports of the shared design primitives.
 * Mirrors tokens.css. Use these in TS code where a CSS variable isn't convenient
 * (e.g. inline styles on Astro/React components, recharts palettes, OG-image
 * generation).
 */

export const color = {
  brand: "#b4ff39",
  brandHover: "#c6ff5a",
  ink: "#0b0b0d",
  cream: "#f2f2ee",

  role: {
    employee: "#b4ff39",
    manager: "#ffbf4a",
    hr: "#ff8a7a",
    admin: "#6fd8ff",
    finance: "#c48fff",
  },

  status: {
    success: "#b4ff39",
    warning: "#ffbf4a",
    danger: "#ff8a7a",
    info: "#6fd8ff",
  },
} as const;

export const font = {
  display: '"Fraunces Variable", "Fraunces", ui-serif, Georgia, "Times New Roman", serif',
  sans: '"Geist Variable", "Geist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
} as const;

export const radius = {
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  "2xl": 20,
  full: 9999,
} as const;

export const duration = {
  fast: 120,
  normal: 220,
  slow: 420,
} as const;

export const ease = {
  standard: "cubic-bezier(0.2, 0, 0, 1)",
  emphasized: "cubic-bezier(0.3, 0, 0, 1)",
} as const;

export const shadow = {
  1: "0 1px 2px rgba(0, 0, 0, 0.35)",
  2: "0 4px 12px rgba(0, 0, 0, 0.45)",
  3: "0 30px 80px -30px rgba(0, 0, 0, 0.8)",
} as const;

export const tokens = { color, font, radius, duration, ease, shadow } as const;
export type Tokens = typeof tokens;
