import type { Meta, StoryObj } from "@storybook/react";
import { Separator } from "./separator";

const meta: Meta<typeof Separator> = {
  title: "Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Separator>;

export const Horizontal: Story = {
  render: () => (
    <div className="max-w-sm">
      <p className="text-sm font-medium">Workspace</p>
      <p className="text-xs text-muted-foreground">
        Team, billing and integrations.
      </p>
      <Separator className="my-3" />
      <p className="text-sm font-medium">Account</p>
      <p className="text-xs text-muted-foreground">
        Profile, notifications, theme.
      </p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="flex items-center h-6 text-sm gap-3">
      <span>People</span>
      <Separator orientation="vertical" />
      <span>Work</span>
      <Separator orientation="vertical" />
      <span>Money</span>
    </div>
  ),
};
