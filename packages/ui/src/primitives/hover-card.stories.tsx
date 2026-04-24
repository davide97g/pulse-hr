import type { Meta, StoryObj } from "@storybook/react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Avatar, AvatarFallback } from "./avatar";

const meta: Meta = {
  title: "Primitives/HoverCard",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const ProfilePeek: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <a className="text-sm underline underline-offset-4 cursor-pointer">
          @alma
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="flex gap-3">
          <Avatar>
            <AvatarFallback>AM</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium">Alma Moretti</p>
            <p className="text-xs text-muted-foreground">
              Staff designer · Design team
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Joined 2024 · Rome
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};
