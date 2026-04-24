import type { Meta, StoryObj } from "@storybook/react";
import { BirthdayHalo } from "./BirthdayHalo";

const meta: Meta<typeof BirthdayHalo> = {
  title: "Atoms/BirthdayHalo",
  component: BirthdayHalo,
  tags: ["autodocs"],
  args: { initials: "AM", color: "#b4ff39", size: 48, active: true },
};
export default meta;
type Story = StoryObj<typeof BirthdayHalo>;

export const Active: Story = {};

export const Inactive: Story = { args: { active: false } };

export const Gallery: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      <BirthdayHalo initials="AM" color="#b4ff39" size={48} active={false} />
      <BirthdayHalo initials="TN" color="#39e1ff" size={48} active />
      <BirthdayHalo initials="MR" color="#c06bff" size={64} active />
      <BirthdayHalo
        initials="SS"
        color="#ff6b9a"
        size={48}
        active
        showCake={false}
      />
    </div>
  ),
};
