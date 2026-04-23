import type { AstroGlobal } from "astro";
import { en, type Dict } from "./en";
import { it } from "./it";
import { DEFAULT_LOCALE, isLocale, localizePath, type Locale } from "./locales";

export { LOCALES, LOCALE_LABEL, LOCALE_SHORT, OG_LOCALE, HTML_LANG, DEFAULT_LOCALE, localizePath } from "./locales";
export type { Locale } from "./locales";

const DICTS: Record<Locale, Dict> = { en, it };

export function getLocale(astro: Pick<AstroGlobal, "currentLocale" | "url">): Locale {
  const fromAstro = astro.currentLocale;
  if (isLocale(fromAstro)) return fromAstro;
  // Fallback: inspect URL (Astro sometimes returns undefined when the integration
  // isn't wired to the route yet — e.g. static 404).
  const seg = astro.url?.pathname?.split("/").filter(Boolean)[0];
  if (isLocale(seg)) return seg;
  return DEFAULT_LOCALE;
}

export function useI18n(astro: Pick<AstroGlobal, "currentLocale" | "url">) {
  const locale = getLocale(astro);
  const dict = DICTS[locale];
  return {
    locale,
    t: dict,
    /** Localize a path for the current locale (e.g. "/pricing" → "/it/pricing" for it). */
    href: (path: string) => localizePath(path, locale),
  };
}
