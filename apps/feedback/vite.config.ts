import { defineConfig, loadEnv } from "vite";
import path from "node:path";
import { readFileSync } from "node:fs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const pkg = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf8")) as {
  version: string;
};

export default defineConfig(({ mode }) => {
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
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
      dedupe: ["react", "react-dom", "@tanstack/react-router"],
    },
    server: {
      host: true,
      port: Number(process.env.PORT ?? 5174),
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
            if (id.includes("@radix-ui/")) return "radix";
            if (id.includes("@dnd-kit/")) return "dnd-kit";
            if (id.includes("react-hook-form") || id.includes("@hookform/") || id.includes("/zod/"))
              return "forms";
            if (id.includes("date-fns")) return "date";
            if (id.includes("lucide-react")) return "icons";
            if (id.includes("sonner")) return "ui-extras";
          },
        },
      },
    },
  };
});
