import type { Meta, StoryObj } from "@storybook/react";
import { BrandMark } from "./BrandMark";

const meta: Meta<typeof BrandMark> = {
  title: "Atoms/BrandMark",
  component: BrandMark,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: { size: "md" },
};
export default meta;
type Story = StoryObj<typeof BrandMark>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <BrandMark size="sm" />
      <BrandMark size="md" />
      <BrandMark size="lg" />
    </div>
  ),
};
