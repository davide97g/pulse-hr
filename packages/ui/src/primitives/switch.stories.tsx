import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";
import { Label } from "./label";

const meta: Meta<typeof Switch> = {
  title: "Primitives/Switch",
  component: Switch,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Switch id="s1" />
      <Label htmlFor="s1">Anonymous pulse</Label>
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="space-y-3 max-w-sm">
      {[
        { id: "email", label: "Email notifications", on: true },
        { id: "digest", label: "Weekly digest", on: true },
        { id: "slack", label: "Slack mentions", on: false },
      ].map((s) => (
        <div key={s.id} className="flex items-center justify-between">
          <Label htmlFor={s.id}>{s.label}</Label>
          <Switch id={s.id} defaultChecked={s.on} />
        </div>
      ))}
    </div>
  ),
};
