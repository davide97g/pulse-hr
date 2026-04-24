import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";

const meta: Meta = {
  title: "Primitives/Select",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Pick a commessa" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="acm-014">ACM-2026-014 · Redesign</SelectItem>
        <SelectItem value="acm-015">ACM-2026-015 · Migration</SelectItem>
        <SelectItem value="acm-016">ACM-2026-016 · Research</SelectItem>
      </SelectContent>
    </Select>
  ),
};

export const Grouped: Story = {
  render: () => (
    <Select>
      <SelectTrigger className="w-64">
        <SelectValue placeholder="Assignee" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Design</SelectLabel>
          <SelectItem value="alma">Alma Moretti</SelectItem>
          <SelectItem value="teo">Teo Nava</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Engineering</SelectLabel>
          <SelectItem value="mira">Mira Rossi</SelectItem>
          <SelectItem value="sana">Sana Said</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
};
