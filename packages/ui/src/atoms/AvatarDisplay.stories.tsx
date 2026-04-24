import type { Meta, StoryObj } from "@storybook/react";
import { AvatarDisplay } from "./AvatarDisplay";

const meta: Meta<typeof AvatarDisplay> = {
  title: "Atoms/AvatarDisplay",
  component: AvatarDisplay,
  tags: ["autodocs"],
  args: { initials: "AM", color: "#b4ff39", size: 40 },
};
export default meta;
type Story = StoryObj<typeof AvatarDisplay>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      {[24, 32, 40, 56, 80].map((s) => (
        <AvatarDisplay key={s} initials="AM" color="#b4ff39" size={s} />
      ))}
    </div>
  ),
};

export const Roster: Story = {
  render: () => {
    const people = [
      { i: "AM", c: "#b4ff39" },
      { i: "TN", c: "#39e1ff" },
      { i: "MR", c: "#c06bff" },
      { i: "SS", c: "#ff6b9a" },
      { i: "KT", c: "#ffbf4a" },
    ];
    return (
      <div className="flex -space-x-2">
        {people.map((p) => (
          <div key={p.i} className="ring-2 ring-background rounded-full">
            <AvatarDisplay initials={p.i} color={p.c} size={36} />
          </div>
        ))}
      </div>
    );
  },
};
