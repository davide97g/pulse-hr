import type { StorybookConfig } from "@storybook/react-vite";
import path from "node:path";

const config: StorybookConfig = {
  stories: [
    "../docs/**/*.mdx",
    "../../../packages/ui/src/**/*.stories.@(ts|tsx|mdx)",
  ],
  addons: [
    "@storybook/addon-essentials",
    "@storybook/addon-a11y",
    "@storybook/addon-interactions",
    "@storybook/addon-themes",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    autodocs: "tag",
  },
  viteFinal: async (config) => {
    // Ensure the monorepo workspace alias resolves primitives/atoms
    config.resolve = config.resolve ?? {};
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@pulse-hr/ui": path.resolve(__dirname, "../../../packages/ui/src"),
      "@pulse-hr/tokens": path.resolve(__dirname, "../../../packages/tokens/src"),
    };
    return config;
  },
};

export default config;
