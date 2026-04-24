import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof Avatar>;

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage
        src="https://i.pravatar.cc/80?img=12"
        alt="Alma Moretti"
      />
      <AvatarFallback>AM</AvatarFallback>
    </Avatar>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="flex -space-x-2">
      {["AM", "TN", "MR", "SS"].map((i, k) => (
        <Avatar key={i} className="ring-2 ring-background">
          <AvatarImage src={`https://i.pravatar.cc/80?img=${k + 10}`} />
          <AvatarFallback>{i}</AvatarFallback>
        </Avatar>
      ))}
    </div>
  ),
};
