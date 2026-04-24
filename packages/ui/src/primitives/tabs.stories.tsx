import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta = {
  title: "Primitives/Tabs",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[520px]">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="time">Time</TabsTrigger>
        <TabsTrigger value="forecast">Forecast</TabsTrigger>
        <TabsTrigger value="team">Team</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="p-4 text-sm text-muted-foreground">
        High-level commessa health, utilization and alerts.
      </TabsContent>
      <TabsContent value="time" className="p-4 text-sm text-muted-foreground">
        Hours logged, approval state, week totals.
      </TabsContent>
      <TabsContent
        value="forecast"
        className="p-4 text-sm text-muted-foreground"
      >
        Burn projection with scenario sliders.
      </TabsContent>
      <TabsContent value="team" className="p-4 text-sm text-muted-foreground">
        Who's allocated and at what capacity.
      </TabsContent>
    </Tabs>
  ),
};
