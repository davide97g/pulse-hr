export const LOCALES = ["en", "it"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABEL: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  it: "IT",
};

export const OG_LOCALE: Record<Locale, string> = {
  en: "en_US",
  it: "it_IT",
};

export const HTML_LANG: Record<Locale, string> = {
  en: "en",
  it: "it",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Map a path to its counterpart in the given locale.
 * en → "/pricing"   it → "/it/pricing"
 */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.replace(/^\/(it)(?=\/|$)/, "") || "/";
  if (locale === DEFAULT_LOCALE) return clean;
  if (clean === "/") return "/it";
  return `/it${clean}`;
}
