import { defineConfig } from "vite";
import path from "node:path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(() => {
  return {
    plugins: [
      tsConfigPaths(),
      tailwindcss(),
      tanstackRouter({
        target: "react",
        routesDirectory: "./src/routes",
        generatedRouteTree: "./src/routeTree.gen.ts",
        autoCodeSplitting: true,
      }),
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: [
          "favicon-32.png",
          "apple-touch-icon.png",
          "icon.svg",
        ],
        manifest: {
          name: "Pulse HR",
          short_name: "Pulse HR",
          description: "Modern HR, payroll and people platform — one surface for your whole team.",
          lang: "en",
          theme_color: "#0b0b0d",
          background_color: "#fafaf7",
          display: "standalone",
          orientation: "any",
          start_url: "/",
          scope: "/",
          categories: ["business", "productivity"],
          icons: [
            { src: "/icon-192.png",           sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png",           sizes: "512x512", type: "image/png", purpose: "any" },
            { src: "/icon-maskable-512.png",  sizes: "512x512", type: "image/png", purpose: "maskable" },
            { src: "/icon.svg",               sizes: "any",     type: "image/svg+xml", purpose: "any" },
          ],
          shortcuts: [
            { name: "Dashboard",  url: "/",       icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
            { name: "Timesheet",  url: "/time",   icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
            { name: "Kudos",      url: "/kudos",  icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
            { name: "Focus Mode", url: "/focus",  icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
          runtimeCaching: [
            {
              urlPattern: ({ url }) =>
                url.origin === "https://fonts.googleapis.com" ||
                url.origin === "https://fonts.gstatic.com",
              handler: "CacheFirst",
              options: {
                cacheName: "google-fonts",
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
        devOptions: { enabled: false },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-query"],
    },
    server: {
      host: true,
      port: Number(process.env.PORT ?? 5173),
      strictPort: false,
    },
    build: {
      outDir: "dist",
      sourcemap: false,
    },
  };
});
