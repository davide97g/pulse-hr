import type { Meta, StoryObj } from "@storybook/react";
import { ParticleField } from "./ParticleField";

const meta: Meta<typeof ParticleField> = {
  title: "Atoms/ParticleField",
  component: ParticleField,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["ambient", "waking", "error", "celebrate"],
    },
    density: { control: "select", options: ["sparse", "normal", "dense"] },
    size: { control: "select", options: ["sm", "md", "lg", "full"] },
  },
  args: { variant: "ambient", density: "normal", size: "md" },
};
export default meta;
type Story = StoryObj<typeof ParticleField>;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-64 w-full rounded-lg border border-border bg-card overflow-hidden">
      {children}
    </div>
  );
}

export const Ambient: Story = {
  render: (args) => (
    <Frame>
      <ParticleField {...args} variant="ambient" size="full" />
    </Frame>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-3">
      {(["ambient", "waking", "error", "celebrate"] as const).map((v) => (
        <div key={v} className="relative">
          <Frame>
            <ParticleField variant={v} size="full" />
          </Frame>
          <div className="absolute top-2 left-3 font-mono text-[11px] text-muted-foreground">
            {v}
          </div>
        </div>
      ))}
    </div>
  ),
};
