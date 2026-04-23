import type { Meta, StoryObj } from "@storybook/react";

const SEMANTIC_TOKENS = [
  { name: "background", fg: "foreground" },
  { name: "card", fg: "card-foreground" },
  { name: "popover", fg: "popover-foreground" },
  { name: "primary", fg: "primary-foreground" },
  { name: "secondary", fg: "secondary-foreground" },
  { name: "muted", fg: "muted-foreground" },
  { name: "accent", fg: "accent-foreground" },
  { name: "destructive", fg: "destructive-foreground" },
  { name: "success", fg: "success-foreground" },
  { name: "warning", fg: "warning-foreground" },
  { name: "info", fg: "info-foreground" },
  { name: "labs", fg: "labs-foreground" },
  { name: "sidebar", fg: "sidebar-foreground" },
];

const STRUCTURAL = ["border", "input", "ring"];

const CALENDAR = [
  "cal-vacation",
  "cal-sick",
  "cal-personal",
  "cal-parental",
  "cal-holiday",
];

function Swatch({ name, fg }: { name: string; fg?: string }) {
  return (
    <div className="rounded-md border overflow-hidden">
      <div
        className="h-20 flex items-end p-3"
        style={{
          backgroundColor: `var(--${name})`,
          color: fg ? `var(--${fg})` : undefined,
        }}
      >
        <div className="font-mono text-xs font-medium">--{name}</div>
      </div>
      <div className="bg-card px-3 py-2 text-[11px] text-muted-foreground font-mono">
        {fg ? `fg: --${fg}` : "—"}
      </div>
    </div>
  );
}

const meta: Meta = {
  title: "Foundations/Color/Swatches",
  parameters: { layout: "padded" },
};
export default meta;

type Story = StoryObj;

export const Intent: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {SEMANTIC_TOKENS.map((t) => (
        <Swatch key={t.name} name={t.name} fg={t.fg} />
      ))}
    </div>
  ),
};

export const Structural: Story = {
  render: () => (
    <div className="grid grid-cols-3 gap-3">
      {STRUCTURAL.map((n) => (
        <Swatch key={n} name={n} />
      ))}
    </div>
  ),
};

export const Calendar: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {CALENDAR.map((n) => (
        <Swatch key={n} name={n} />
      ))}
    </div>
  ),
};
