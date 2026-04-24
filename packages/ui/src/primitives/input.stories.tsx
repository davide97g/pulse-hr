import type { Meta, StoryObj } from "@storybook/react";
import { Search } from "lucide-react";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {
  render: () => <Input placeholder="Search people…" className="max-w-sm" />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="email">Work email</Label>
      <Input id="email" type="email" placeholder="alma@pulsehr.it" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Input disabled value="Locked field" className="max-w-sm" readOnly />
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input placeholder="Search commesse…" className="pl-8" />
    </div>
  ),
};

export const Invalid: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-sm">
      <Label htmlFor="rate">Rate</Label>
      <Input
        id="rate"
        aria-invalid
        defaultValue="-5"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-xs text-destructive">Rate must be positive.</p>
    </div>
  ),
};
