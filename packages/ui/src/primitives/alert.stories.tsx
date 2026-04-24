import type { Meta, StoryObj } from "@storybook/react";
import { Info, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";

const meta: Meta<typeof Alert> = {
  title: "Primitives/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    variant: { control: "select", options: ["default", "destructive"] },
  },
};
export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  render: () => (
    <Alert className="max-w-xl">
      <Info className="h-4 w-4" />
      <AlertTitle>Heads up</AlertTitle>
      <AlertDescription>
        Timesheets for last week are due by Friday EOD.
      </AlertDescription>
    </Alert>
  ),
};

export const Destructive: Story = {
  render: () => (
    <Alert variant="destructive" className="max-w-xl">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Submission failed</AlertTitle>
      <AlertDescription>
        Total hours exceed the commessa budget. Trim 2.5h or split to another.
      </AlertDescription>
    </Alert>
  ),
};

export const Stack: Story = {
  render: () => (
    <div className="space-y-3 max-w-xl">
      <Alert>
        <CheckCircle2 className="h-4 w-4" />
        <AlertTitle>Approved</AlertTitle>
        <AlertDescription>
          Leave request for May 4–6 has been approved.
        </AlertDescription>
      </Alert>
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Forecast drift</AlertTitle>
        <AlertDescription>
          ACM-2026-014 is trending 12% over budget at current burn.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
