import type { Meta, StoryObj } from "@storybook/react";
import { ScrollArea } from "./scroll-area";

const meta: Meta<typeof ScrollArea> = {
  title: "Primitives/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const ChangelogList: Story = {
  render: () => (
    <ScrollArea className="h-64 w-80 rounded-md border border-border bg-card p-3">
      <ol className="space-y-3 text-sm">
        {Array.from({ length: 30 }).map((_, i) => (
          <li key={i}>
            <div className="font-medium">Release 2026.04.{10 + i}</div>
            <div className="text-xs text-muted-foreground">
              Minor fixes, improved commessa filtering, new Kudos decorations.
            </div>
          </li>
        ))}
      </ol>
    </ScrollArea>
  ),
};
