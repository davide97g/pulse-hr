import type { Meta, StoryObj } from "@storybook/react";
import { NewBadge } from "./NewBadge";

const meta: Meta<typeof NewBadge> = {
  title: "Atoms/NewBadge",
  component: NewBadge,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof NewBadge>;

export const Loud: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <span className="font-display text-lg">Labs feature</span>
      <NewBadge />
    </div>
  ),
};
