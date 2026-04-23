import type { Meta, StoryObj } from "@storybook/react";
import { Plus, ArrowRight, Download } from "lucide-react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
  },
  args: {
    children: "Continue",
    variant: "default",
    size: "default",
  },
};
export default meta;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="default">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon" aria-label="Add">
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <Button>
        <Plus className="h-4 w-4 mr-1.5" />
        New item
      </Button>
      <Button variant="outline">
        <Download className="h-4 w-4 mr-1.5" />
        Export
      </Button>
      <Button variant="default">
        Continue
        <ArrowRight className="h-4 w-4 ml-1.5" />
      </Button>
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, children: "Can't click me" },
};

export const PressScale: Story = {
  name: "With press-scale motion",
  render: () => (
    <Button className="press-scale">
      Click and hold — I shrink to 0.97.
    </Button>
  ),
};
