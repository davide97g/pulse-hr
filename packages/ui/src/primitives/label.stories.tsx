import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="team">Team</Label>
      <Input id="team" placeholder="Design" />
    </div>
  ),
};
