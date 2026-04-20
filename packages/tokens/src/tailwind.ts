/**
 * Optional helper: if we ever move back to a JS-based Tailwind config,
 * `colors` and `fontFamily` here can be spread into `theme.extend`.
 * Tailwind v4 (CSS-first) consumers should import tokens.css directly.
 */
import { color, font } from "./index";

export const tailwindColors = {
  brand: color.brand,
  "brand-hover": color.brandHover,
  ink: color.ink,
  cream: color.cream,
  employee: color.role.employee,
  manager: color.role.manager,
  hr: color.role.hr,
  admin: color.role.admin,
  finance: color.role.finance,
  success: color.status.success,
  warning: color.status.warning,
  danger: color.status.danger,
  info: color.status.info,
} as const;

export const tailwindFontFamily = {
  display: [font.display],
  sans: [font.sans],
  mono: [font.mono],
} as const;
