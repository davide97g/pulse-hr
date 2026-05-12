export type Locale = "en" | "it";

export const LOCALES: Locale[] = ["en", "it"];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  it: "Italiano",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  it: "IT",
};
