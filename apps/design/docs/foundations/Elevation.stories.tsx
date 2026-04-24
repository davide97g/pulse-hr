import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Elevation/Specimens",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const RADII = [
  { name: "sm", token: "--radius-sm" },
  { name: "md", token: "--radius-md" },
  { name: "lg", token: "--radius-lg" },
  { name: "xl", token: "--radius-xl" },
];

const SHADOWS = [
  {
    name: "card",
    token: "--shadow-card",
    role: "Resting",
    hint: "Cards, tiles, panels.",
  },
  {
    name: "panel",
    token: "--shadow-panel",
    role: "Lateral",
    hint: "Drawers, side panels.",
  },
  {
    name: "pop",
    token: "--shadow-pop",
    role: "Floating",
    hint: "Popovers, menus, toasts.",
  },
];

export const Radii: Story = {
  render: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {RADII.map((r) => (
        <div key={r.name} className="flex flex-col gap-2">
          <div
            className="h-24 border border-border bg-card"
            style={{ borderRadius: `var(${r.token})` }}
          />
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">{r.name}</span>
            <span className="font-mono text-[11px] text-muted-foreground">
              {r.token}
            </span>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6">
      {SHADOWS.map((s) => (
        <div key={s.name} className="flex flex-col gap-3">
          <div
            className="h-32 rounded-lg bg-card border border-border/40"
            style={{ boxShadow: `var(${s.token})` }}
          />
          <div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-medium">{s.role}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {s.token}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{s.hint}</p>
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Composition: Story = {
  render: () => (
    <div className="relative min-h-[320px] bg-muted/30 rounded-lg p-8">
      <div
        className="bg-card rounded-lg p-5 max-w-sm"
        style={{ boxShadow: "var(--shadow-card)" }}
      >
        <h4 className="font-medium mb-1">Resting card</h4>
        <p className="text-sm text-muted-foreground">
          Sits on the page canvas. Whisper of lift.
        </p>
      </div>
      <div
        className="absolute top-16 right-8 bg-popover text-popover-foreground rounded-md p-3 border border-border text-sm"
        style={{ boxShadow: "var(--shadow-pop)" }}
      >
        Floating popover
      </div>
    </div>
  ),
};
