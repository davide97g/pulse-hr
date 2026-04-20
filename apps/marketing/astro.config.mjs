// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://pulsehr.com",
  trailingSlash: "never",
  build: { inlineStylesheets: "auto" },
  integrations: [
    sitemap({
      changefreq: "weekly",
      priority: 0.8,
      lastmod: new Date(),
      // Stub/placeholder pages are `noindex`; keep them out of the sitemap
      // too so crawlers never see a conflicting signal.
      filter: (page) => {
        const STUB_ROUTES = [
          "/pricing",
          "/docs",
          "/docs/api",
          "/security",
          "/contact",
          "/roadmap",
          "/privacy",
          "/terms",
          "/404",
        ];
        const path = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !STUB_ROUTES.includes(path);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
