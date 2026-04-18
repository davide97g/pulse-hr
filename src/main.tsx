import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { registerSW } from "virtual:pwa-register";
import { toast } from "sonner";
import { getRouter } from "./router";
import "./styles.css";

registerSW({
  immediate: true,
  onNeedRefresh() {
    toast("New version available", {
      description: "Reload to get the latest updates.",
      duration: 10000,
      action: {
        label: "Reload",
        onClick: () => window.location.reload(),
      },
    });
  },
  onOfflineReady() {
    toast.success("Ready to work offline", {
      description: "Pulse HR has been cached for offline use.",
    });
  },
});

const router = getRouter();

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}

const el = document.getElementById("root");
if (!el) throw new Error("#root not found");

ReactDOM.createRoot(el).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
