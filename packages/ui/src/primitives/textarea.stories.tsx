import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "./textarea";
import { Label } from "./label";

const meta: Meta<typeof Textarea> = {
  title: "Primitives/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  render: () => (
    <Textarea
      placeholder="Leave a note for the team…"
      className="max-w-md"
    />
  ),
};

export const WithLabel: Story = {
  render: () => (
    <div className="grid gap-1.5 max-w-md">
      <Label htmlFor="notes">Review notes</Label>
      <Textarea id="notes" placeholder="What went well this sprint?" />
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Textarea
      disabled
      value="This field is locked until the review is submitted."
      readOnly
      className="max-w-md"
    />
  ),
};
