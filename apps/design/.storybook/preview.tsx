import type { Preview } from "@storybook/react";
import { THEMES, type Theme } from "@pulse-hr/tokens";
import "../src/preview.css";

const preview: Preview = {
  parameters: {
    controls: { matchers: { color: /(background|color)$/i, date: /Date$/i } },
    layout: "padded",
    backgrounds: { disable: true },
    options: {
      storySort: {
        order: [
          "Introduction",
          ["Welcome", "Principles", "Voice & Tone", "Contributing"],
          "Foundations",
          ["Color", "Typography", "Spacing", "Radii", "Elevation", "Motion", "Themes"],
          "Primitives",
          "Atoms",
          "Patterns",
        ],
      },
    },
  },
  globalTypes: {
    theme: {
      name: "Theme",
      description: "Active Pulse theme",
      defaultValue: "employee" as Theme,
      toolbar: {
        icon: "paintbrush",
        items: THEMES.map((t) => ({ value: t, title: t.charAt(0).toUpperCase() + t.slice(1) })),
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, context) => {
      if (typeof document !== "undefined") {
        const t = context.globals.theme as Theme;
        document.documentElement.dataset.theme = t;
        document.documentElement.classList.toggle("dark", t !== "light");
      }
      return <Story />;
    },
  ],
};

export default preview;
