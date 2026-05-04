// Single source of truth for the build version. Vite's `define` block in
// vite.config.ts injects the package.json version at build time so we never
// read it at runtime from disk. Falls back to a placeholder in dev if the
// global isn't defined for some reason.
declare const __APP_VERSION__: string | undefined;

export const APP_VERSION: string =
  typeof __APP_VERSION__ === "string" && __APP_VERSION__.length > 0 ? __APP_VERSION__ : "dev";
