// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://pulsehr.it",
  trailingSlash: "never",
  build: { inlineStylesheets: "auto" },
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", it: "it-IT" },
      },
      // Stub/placeholder pages are `noindex`; keep them out of the sitemap
      // too so crawlers never see a conflicting signal.
      filter: (page) => {
        const STUB_ROUTES = ["/privacy", "/terms", "/404", "/it/privacy", "/it/terms", "/it/404"];
        const path = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !STUB_ROUTES.includes(path);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
