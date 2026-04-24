import type { Meta, StoryObj } from "@storybook/react";
import { toast } from "sonner";
import { Toaster } from "./sonner";
import { Button } from "./button";

const meta: Meta = {
  title: "Primitives/Sonner",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Button onClick={() => toast("Timesheet saved")}>Default</Button>
      <Button onClick={() => toast.success("Approved")}>Success</Button>
      <Button onClick={() => toast.error("Over budget")}>Error</Button>
      <Button
        onClick={() =>
          toast("Kudos deleted", {
            action: { label: "Undo", onClick: () => toast.success("Restored") },
          })
        }
      >
        With undo
      </Button>
      <Toaster />
    </div>
  ),
};
