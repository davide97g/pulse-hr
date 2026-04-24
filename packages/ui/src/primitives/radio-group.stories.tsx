import type { Meta, StoryObj } from "@storybook/react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

const meta: Meta = {
  title: "Primitives/RadioGroup",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="monthly" className="space-y-2">
      {[
        { id: "weekly", label: "Weekly digest" },
        { id: "monthly", label: "Monthly digest" },
        { id: "off", label: "Off" },
      ].map((o) => (
        <div key={o.id} className="flex items-center gap-2">
          <RadioGroupItem value={o.id} id={o.id} />
          <Label htmlFor={o.id}>{o.label}</Label>
        </div>
      ))}
    </RadioGroup>
  ),
};
