// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import rehypeMermaid from "rehype-mermaid";
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
  // Mermaid renders to inline SVG at build time so blog posts never ship a
  // client-side mermaid.js runtime. Strategy "img-svg" emits <img> w/ data URI
  // — survives strict CSP and works without JS.
  markdown: {
    rehypePlugins: [[rehypeMermaid, { strategy: "img-svg", dark: true }]],
  },
  integrations: [
    mdx(),
    sitemap({
      i18n: {
        defaultLocale: "en",
        locales: { en: "en-US", it: "it-IT" },
      },
      // Stub/placeholder pages are `noindex`; keep them out of the sitemap
      // too so crawlers never see a conflicting signal.
      filter: (page) => {
        // Routes that render with noIndex / robots-disallowed status — keep
        // them out of the sitemap so crawlers never see a conflicting signal.
        const NOINDEX_ROUTES = [
          "/privacy", "/terms", "/404", "/studio",
          "/it/privacy", "/it/terms", "/it/404",
        ];
        const path = new URL(page).pathname.replace(/\/$/, "") || "/";
        return !NOINDEX_ROUTES.includes(path);
      },
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
