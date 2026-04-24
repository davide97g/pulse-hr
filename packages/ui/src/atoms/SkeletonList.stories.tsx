import type { Meta, StoryObj } from "@storybook/react";
import { SkeletonRows, SkeletonCards } from "./SkeletonList";

const meta: Meta = {
  title: "Atoms/SkeletonList",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Rows: Story = {
  render: () => (
    <div className="rounded-md border border-border bg-card p-3 max-w-xl">
      <SkeletonRows rows={6} />
    </div>
  ),
};

export const RowsNoAvatar: Story = {
  render: () => (
    <div className="rounded-md border border-border bg-card p-3 max-w-xl">
      <SkeletonRows rows={4} avatar={false} />
    </div>
  ),
};

export const Cards: Story = {
  render: () => <SkeletonCards cards={4} />,
};
