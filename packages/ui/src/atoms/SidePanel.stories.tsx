import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SidePanel } from "./SidePanel";
import { Button } from "../primitives/button";

const meta: Meta<typeof SidePanel> = {
  title: "Atoms/SidePanel",
  component: SidePanel,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
};
export default meta;
type Story = StoryObj<typeof SidePanel>;

export const Basic: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-6">
        <Button onClick={() => setOpen(true)}>Open panel</Button>
        <SidePanel
          open={open}
          onClose={() => setOpen(false)}
          title="Employee detail"
        >
          <div className="space-y-3 text-sm">
            <p>
              Side panels slide in from the right and own the detail view
              without leaving the list context.
            </p>
            <p className="text-muted-foreground">
              Width caps at min(width, 100vw) — safe on mobile.
            </p>
          </div>
        </SidePanel>
      </div>
    );
  },
};

export const Wide: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    return (
      <div className="p-6">
        <Button onClick={() => setOpen(true)}>Open wide panel</Button>
        <SidePanel
          open={open}
          onClose={() => setOpen(false)}
          title="Wide panel · 640px"
          width={640}
        >
          <p className="text-sm text-muted-foreground">
            Use wider panels for forms with two-column layouts.
          </p>
        </SidePanel>
      </div>
    );
  },
};
