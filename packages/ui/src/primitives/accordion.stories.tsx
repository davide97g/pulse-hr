import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

const meta: Meta<typeof Accordion> = {
  title: "Primitives/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof Accordion>;

const ITEMS = [
  {
    q: "How are commesse billed?",
    a: "Each commessa tracks a budget, a unit rate, and the hours logged against it. Billing rolls up at the end of the month.",
  },
  {
    q: "Can I edit a submitted timesheet?",
    a: "Only before approval. Once approved it's locked — ask a manager for a correction.",
  },
  {
    q: "Where do kudos show up?",
    a: "On the recipient's profile and in the monthly digest. Coins can be redeemed anytime.",
  },
];

export const Single: Story = {
  render: () => (
    <Accordion type="single" collapsible className="max-w-xl">
      {ITEMS.map((it, i) => (
        <AccordionItem key={i} value={`item-${i}`}>
          <AccordionTrigger>{it.q}</AccordionTrigger>
          <AccordionContent>{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="max-w-xl">
      {ITEMS.map((it, i) => (
        <AccordionItem key={i} value={`m-${i}`}>
          <AccordionTrigger>{it.q}</AccordionTrigger>
          <AccordionContent>{it.a}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  ),
};
