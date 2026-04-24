import type { Meta, StoryObj } from "@storybook/react";
import { ChevronsUpDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";
import { Button } from "./button";

const meta: Meta = {
  title: "Primitives/Collapsible",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Collapsible className="w-80 rounded-md border border-border bg-card p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Advanced filters</span>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Toggle">
            <ChevronsUpDown className="h-4 w-4" />
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent className="mt-2 space-y-1 text-sm text-muted-foreground">
        <div>Commessa: all</div>
        <div>Status: open</div>
        <div>Assignee: anyone</div>
      </CollapsibleContent>
    </Collapsible>
  ),
};
