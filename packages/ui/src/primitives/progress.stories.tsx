import type { Meta, StoryObj } from "@storybook/react";
import { Progress } from "./progress";

const meta: Meta<typeof Progress> = {
  title: "Primitives/Progress",
  component: Progress,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  args: { value: 62 },
};
export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: (args) => <Progress {...args} className="w-80" />,
};

export const Scale: Story = {
  render: () => (
    <div className="space-y-3 w-80">
      {[12, 42, 68, 94].map((v) => (
        <div key={v} className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>ACM-2026-{v}</span>
            <span className="font-mono tabular-nums">{v}%</span>
          </div>
          <Progress value={v} />
        </div>
      ))}
    </div>
  ),
};
