import type { Meta, StoryObj } from "@storybook/react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import { Label } from "./label";
import { Input } from "./input";

const meta: Meta = {
  title: "Primitives/Popover",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const QuickEdit: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline">Edit rate</Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid gap-2">
          <Label htmlFor="r">Hourly rate (€)</Label>
          <Input id="r" defaultValue="92.00" />
          <Button size="sm" className="mt-1">
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  ),
};
