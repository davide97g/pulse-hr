/**
 * Tailwind JS-config helper. Tailwind v4 CSS-first consumers should prefer
 * `@import "@pulse-hr/tokens/index.css";` — this helper only exists for
 * JS-config contexts (older Tailwind, Storybook addons, etc.).
 */
import { hex, font } from "./index";

export const tailwindColors = {
  labs: hex.labs,
  "labs-hover": hex.labsHover,
  ink: hex.ink,
  cream: hex.cream,
  "role-employee": hex.roleEmployee,
  "role-manager": hex.roleManager,
  "role-hr": hex.roleHr,
  "role-admin": hex.roleAdmin,
  "role-finance": hex.roleFinance,
  success: hex.success,
  warning: hex.warning,
  danger: hex.danger,
  info: hex.info,
} as const;

export const tailwindFontFamily = {
  display: [font.display],
  sans: [font.sans],
  mono: [font.mono],
} as const;
