import type { Meta, StoryObj } from "@storybook/react";
import { Inbox, Sparkles, Search } from "lucide-react";
import { EmptyState } from "./EmptyState";
import { Button } from "../primitives/button";

const meta: Meta<typeof EmptyState> = {
  title: "Atoms/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "select", options: ["neutral", "welcome", "filter"] },
    illustration: {
      control: "select",
      options: ["sparkles", "dots", "grid", "none"],
    },
  },
  args: {
    icon: <Inbox className="h-6 w-6" />,
    title: "No items yet",
    description: "Ship something — it'll show up here.",
    tone: "neutral",
  },
};
export default meta;

type Story = StoryObj<typeof EmptyState>;

export const Neutral: Story = {};

export const Welcome: Story = {
  args: {
    tone: "welcome",
    icon: <Sparkles className="h-6 w-6" />,
    title: "Welcome to Pulse",
    description: "Start by adding your first team member.",
    action: <Button>Add member</Button>,
  },
};

export const FilteredAway: Story = {
  args: {
    tone: "filter",
    icon: <Search className="h-6 w-6" />,
    title: "Nothing matches",
    description: "Try loosening your filters.",
    illustration: "none",
  },
};
