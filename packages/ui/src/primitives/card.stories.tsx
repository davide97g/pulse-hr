import type { Meta, StoryObj } from "@storybook/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { Button } from "./button";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Commessa Forecast</CardTitle>
        <CardDescription>
          Projected burn vs. budget for active engagements.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">
          Card body. Typography inherits from the theme tokens. Content grid
          rendered inside a 16 px-padded container.
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        <Button size="sm">Open report</Button>
      </CardFooter>
    </Card>
  ),
};

export const WithLabsAccent: Story = {
  name: "With iridescent labs border",
  render: () => (
    <Card className="max-w-md iridescent-border bg-gradient-to-br from-[color:var(--labs)]/[0.08] via-transparent to-transparent">
      <CardHeader>
        <CardTitle>Voting Power</CardTitle>
        <CardDescription>
          Labs-tier features get the iridescent border + labs tint.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="font-display text-6xl leading-none tabular-nums">200</div>
        <div className="text-xs text-muted-foreground mt-1">
          baseline <span className="font-mono">100</span>
        </div>
      </CardContent>
    </Card>
  ),
};
