import type { Meta, StoryObj } from "@storybook/react";
import { PageHeader } from "./PageHeader";
import { NewBadge } from "./NewBadge";
import { Button } from "../primitives/button";

const meta: Meta<typeof PageHeader> = {
  title: "Atoms/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Voting Power",
    description: "Complete questionnaires to boost your weight in Labs features.",
  },
};

export const WithNewBadge: Story = {
  args: {
    title: (
      <span className="inline-flex items-center gap-2">
        Voting Power
        <NewBadge />
      </span>
    ),
    description: "Complete questionnaires to boost your weight in Labs features.",
  },
};

export const WithActions: Story = {
  args: {
    title: "Feedback",
    description:
      "Every pin and proposal lands here. Upvote what matters, reply to what you recognize.",
    actions: (
      <>
        <Button variant="outline" size="sm">Export</Button>
        <Button size="sm">Propose</Button>
      </>
    ),
  },
};
