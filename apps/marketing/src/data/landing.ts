import { en } from "../i18n/en";
import { it } from "../i18n/it";
import type { Locale } from "../i18n/locales";

// Brand-level, locale-independent site metadata.
export const SITE = {
  name: "Pulse HR",
  url: "https://pulsehr.it",
  // Hero tagline card — generated from docs/brand/logo-explorations/og/og-hero.svg.
  // PNG format (not SVG) because some social crawlers reject SVG og:images.
  ogImage: "/og/og-hero.png",
  twitter: "@pulsehr",
};

export const MARQUEE_LOGOS = [
  "ACME",
  "NOVA RETAIL",
  "BLANCO STUDIO",
  "ZENITH ENERGY",
  "LONGO GROUP",
  "FABRIQ",
  "POLLUX",
  "ORBITAL",
];

// Role accent colors are locale-independent.
const ROLE_COLORS: Record<string, { accent: string; bg: string }> = {
  Employee: { accent: "#b4ff39", bg: "#111113" },
  Manager: { accent: "#ffbf4a", bg: "#17130c" },
  HR: { accent: "#ff8a7a", bg: "#1a1110" },
  Admin: { accent: "#6fd8ff", bg: "#0d151a" },
  Finance: { accent: "#c48fff", bg: "#141019" },
};

export function getLanding(locale: Locale) {
  const dict = locale === "it" ? it : en;

  return {
    site: {
      ...SITE,
      description: dict.meta.description,
      tagline: dict.meta.tagline,
      keywords: dict.meta.keywords,
    },
    FEATURES: dict.features.items,
    CONCEPTS: dict.concepts.items,
    LABS: dict.labs.items,
    ROLES: dict.roles.items.map((r, i) => {
      // Match by English key since role names are close to brand/persona labels.
      const englishKey = en.roles.items[i].k;
      const color = ROLE_COLORS[englishKey] ?? ROLE_COLORS.Employee;
      return { ...r, accent: color.accent, bg: color.bg };
    }),
    TESTIMONIALS: dict.testimonials.items,
    FAQ: dict.faq.items,
    TEAM: dict.team.items,
    // Honest numbers only. See foundation.md §9 (no fake social proof).
    // These should be wired to the repo stats as soon as we have an endpoint.
    STATS: [
      { v: "OSS", l: dict.stats.processed },
      { v: "FSL-1.1-MIT", l: dict.stats.countries },
      { v: "GitHub", l: dict.stats.teams },
      { v: "Public", l: dict.stats.commands },
    ],
    USE_CASES: dict.useCases.items,
    CHANGELOG: dict.changelog.items,
    MARQUEE_LOGOS,
    HERO_NEW_TAGS: dict.heroNewTags,
  };
}

// Back-compat English exports so files not yet migrated keep building.
// Prefer `getLanding(locale)` in new/updated code.
const englishBundle = getLanding("en");
export const FEATURES = englishBundle.FEATURES;
export const CONCEPTS = englishBundle.CONCEPTS;
export const LABS = englishBundle.LABS;
export const ROLES = englishBundle.ROLES;
export const TESTIMONIALS = englishBundle.TESTIMONIALS;
export const FAQ = englishBundle.FAQ;
export const TEAM = englishBundle.TEAM;
export const STATS = englishBundle.STATS;
export const USE_CASES = englishBundle.USE_CASES;
export const CHANGELOG = englishBundle.CHANGELOG;
export const HERO_NEW_TAGS = englishBundle.HERO_NEW_TAGS;
