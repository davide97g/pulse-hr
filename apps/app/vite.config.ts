import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import { VitePWA } from "vite-plugin-pwa";

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8")) as {
  version: string;
};

export default defineConfig(({ mode }) => {
  // Surface VITE_* env vars (e.g. VITE_API_BASE_URL) at build time when Bun
  // is launched from the workspace root and skips this package's .env.
  const env = loadEnv(mode, process.cwd(), "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) process.env[key] = value;
  }

  return {
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
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
        includeAssets: ["favicon-32.png", "apple-touch-icon.png", "icon.svg"],
        manifest: {
          name: "Pulse HR",
          short_name: "Pulse HR",
          description: "Modern HR, payroll and people platform — one surface for your whole team.",
          lang: "en",
          // Signature lime-on-near-black identity. theme_color drives the
          // Android status bar + title bar; background_color is the splash.
          theme_color: "#b4ff39",
          background_color: "#0b0b0d",
          display: "standalone",
          orientation: "any",
          start_url: "/",
          scope: "/",
          categories: ["business", "productivity"],
          icons: [
            { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
            { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
            {
              src: "/icon-maskable-512.png",
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable",
            },
            { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
          ],
          shortcuts: [
            { name: "Dashboard", url: "/", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
            {
              name: "Timesheet",
              url: "/time",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
            { name: "Kudos", url: "/kudos", icons: [{ src: "/icon-192.png", sizes: "192x192" }] },
            {
              name: "Focus Mode",
              url: "/focus",
              icons: [{ src: "/icon-192.png", sizes: "192x192" }],
            },
          ],
        },
        workbox: {
          globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
          navigateFallback: "/index.html",
          navigateFallbackDenylist: [/^\/api/],
          cleanupOutdatedCaches: true,
          // New SW activates immediately and takes control of every open client
          // — no "waiting" state, no need to close all tabs. Combined with the
          // controllerchange listener in main.tsx this gives users the latest
          // version on the very next refresh.
          skipWaiting: true,
          clientsClaim: true,
          // The HTML shell must always be revalidated against the network so
          // the deploy bumping `assets/<hash>.js` can never be served stale
          // from the SW cache.
          navigationPreload: true,
          runtimeCaching: [
            // index.html / navigations: always go to network, fall back to
            // cache only when offline. Prevents the "stuck on old version"
            // class of bug where the SW kept serving the previous HTML shell.
            {
              urlPattern: ({ request }) => request.mode === "navigate",
              handler: "NetworkFirst",
              options: {
                cacheName: "html-shell",
                networkTimeoutSeconds: 4,
                expiration: { maxEntries: 4 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
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
      chunkSizeWarningLimit: 800,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes("node_modules")) return;
            if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/"))
              return "react";
            if (id.includes("@tanstack/")) return "tanstack";
            if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-vendor"))
              return "recharts";
            if (id.includes("@radix-ui/")) return "radix";
            if (id.includes("@dnd-kit/")) return "dnd-kit";
            if (id.includes("react-hook-form") || id.includes("@hookform/") || id.includes("/zod/"))
              return "forms";
            if (id.includes("date-fns") || id.includes("react-day-picker")) return "date";
            if (id.includes("lucide-react")) return "icons";
            if (
              id.includes("embla-carousel") ||
              id.includes("vaul") ||
              id.includes("react-resizable-panels") ||
              id.includes("input-otp") ||
              id.includes("cmdk") ||
              id.includes("sonner")
            )
              return "ui-extras";
          },
        },
      },
    },
  };
});
