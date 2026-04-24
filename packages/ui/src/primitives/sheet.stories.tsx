import type { Meta, StoryObj } from "@storybook/react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

const meta: Meta = {
  title: "Primitives/Sheet",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

function Demo({ side }: { side: "right" | "left" | "top" | "bottom" }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="capitalize">
          From {side}
        </Button>
      </SheetTrigger>
      <SheetContent side={side}>
        <SheetHeader>
          <SheetTitle>Quick filters</SheetTitle>
          <SheetDescription>
            Narrow the list by commessa, team, or status.
          </SheetDescription>
        </SheetHeader>
        <div className="py-4 text-sm text-muted-foreground">
          Body content goes here.
        </div>
        <SheetFooter>
          <Button>Apply</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export const Sides: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      {(["right", "left", "top", "bottom"] as const).map((s) => (
        <Demo key={s} side={s} />
      ))}
    </div>
  ),
};
