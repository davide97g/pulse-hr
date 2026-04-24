import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="c1" />
      <Label htmlFor="c1">Notify me when timesheets unlock</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="c2" defaultChecked />
      <Label htmlFor="c2">Send weekly digest</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Checkbox id="c3" disabled />
        <Label htmlFor="c3">Locked option</Label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="c4" disabled defaultChecked />
        <Label htmlFor="c4">Locked & checked</Label>
      </div>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="space-y-2">
      {["Email", "In-app", "Slack"].map((c) => (
        <div key={c} className="flex items-center gap-2">
          <Checkbox id={c} defaultChecked={c === "In-app"} />
          <Label htmlFor={c}>{c}</Label>
        </div>
      ))}
    </div>
  ),
};
