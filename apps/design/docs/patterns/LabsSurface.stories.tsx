import type { Meta, StoryObj } from "@storybook/react";
import { Sparkles, ArrowRight, Zap } from "lucide-react";
import { Button } from "@pulse-hr/ui/primitives/button";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";

const meta: Meta = {
  title: "Patterns/Labs surface",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Banner: Story = {
  render: () => (
    <div className="iridescent-border rounded-lg bg-card p-6 max-w-2xl">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 rounded-md bg-labs/15 text-labs flex items-center justify-center">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium">Feature proposal voting</h3>
            <NewBadge />
          </div>
          <p className="text-sm text-muted-foreground">
            Each teammate gets a fixed voting budget that refreshes monthly.
            Spend it on the proposals you want shipped.
          </p>
          <Button variant="link" className="px-0 mt-2">
            Try it
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

export const TileGrid: Story = {
  render: () => {
    const tiles = [
      { icon: Sparkles, title: "Kudos", hint: "Peer coins, leaderboard." },
      { icon: Zap, title: "Pulse", hint: "Anonymous vibe check." },
      { icon: Sparkles, title: "Focus", hint: "Deep-work timer." },
    ];
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-3xl">
        {tiles.map((t) => (
          <div
            key={t.title}
            className="iridescent-border rounded-lg bg-card p-4 relative"
          >
            <span className="absolute top-3 right-3">
              <NewBadge />
            </span>
            <div className="h-9 w-9 rounded-md bg-labs/15 text-labs flex items-center justify-center mb-3">
              <t.icon className="h-4 w-4" />
            </div>
            <div className="font-medium">{t.title}</div>
            <p className="text-xs text-muted-foreground mt-0.5">{t.hint}</p>
          </div>
        ))}
      </div>
    );
  },
};

export const InlineUnread: Story = {
  render: () => (
    <div className="flex items-center gap-2 text-sm">
      <span className="pulse-dot relative inline-flex h-2 w-2 rounded-full bg-labs" />
      <span>3 new proposals worth your vote</span>
    </div>
  ),
};
