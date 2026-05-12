import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { DICTS } from "./dict";
import { DEFAULT_LOCALE, LOCALES, type Locale } from "./types";

const STORAGE_KEY = "pulse.locale";

function readPersisted(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw && (LOCALES as readonly string[]).includes(raw)) return raw as Locale;
  } catch {
    // ignore
  }
  return DEFAULT_LOCALE;
}

function writePersisted(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, locale);
  } catch {
    // ignore
  }
}

export type Translator = (key: string, vars?: Record<string, string | number>) => string;

export interface I18nValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translator;
}

const I18nContext = createContext<I18nValue | null>(null);

function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

export interface I18nProviderProps {
  /** Override default locale (defaults to persisted choice or "en"). */
  initialLocale?: Locale;
  children: ReactNode;
}

export function I18nProvider({ initialLocale, children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(
    () => initialLocale ?? readPersisted(),
  );

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      if (!(LOCALES as readonly string[]).includes(e.newValue)) return;
      setLocaleState(e.newValue as Locale);
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next);
    writePersisted(next);
  }, []);

  const value = useMemo<I18nValue>(() => {
    const dict = DICTS[locale];
    const fallback = DICTS[DEFAULT_LOCALE];
    const t: Translator = (key, vars) => {
      const raw = dict[key] ?? fallback[key] ?? key;
      return interpolate(raw, vars);
    };
    return { locale, setLocale, t };
  }, [locale, setLocale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Fallback to English if no provider — keeps server-rendered fragments alive.
    const t: Translator = (key, vars) => interpolate(DICTS[DEFAULT_LOCALE][key] ?? key, vars);
    return { locale: DEFAULT_LOCALE, setLocale: () => {}, t };
  }
  return ctx;
}

export function useT(): Translator {
  return useI18n().t;
}

export function useLocale(): [Locale, (next: Locale) => void] {
  const { locale, setLocale } = useI18n();
  return [locale, setLocale];
}
