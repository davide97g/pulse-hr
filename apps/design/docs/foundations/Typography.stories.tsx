import type { Meta, StoryObj } from "@storybook/react";

const meta: Meta = {
  title: "Foundations/Typography/Specimens",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

const SCALE = [
  { cls: "text-xs", label: "text-xs · 12px" },
  { cls: "text-sm", label: "text-sm · 14px" },
  { cls: "text-base", label: "text-base · 16px" },
  { cls: "text-lg", label: "text-lg · 18px" },
  { cls: "text-xl", label: "text-xl · 20px" },
  { cls: "text-2xl", label: "text-2xl · 24px" },
  { cls: "text-3xl", label: "text-3xl · 30px" },
  { cls: "text-4xl", label: "text-4xl · 36px" },
  { cls: "text-5xl", label: "text-5xl · 48px" },
  { cls: "text-6xl", label: "text-6xl · 60px" },
];

const GEIST_WEIGHTS = [
  { w: 300, name: "Light" },
  { w: 400, name: "Regular" },
  { w: 500, name: "Medium" },
  { w: 600, name: "Semibold" },
  { w: 700, name: "Bold" },
];

const FRAUNCES_WEIGHTS = [
  { w: 400, name: "Regular" },
  { w: 600, name: "Semibold" },
  { w: 700, name: "Bold" },
  { w: 900, name: "Black" },
];

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-6 items-baseline py-3 border-b border-border/60">
      <div className="font-mono text-xs text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}

export const Families: Story = {
  render: () => (
    <div className="space-y-8">
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Fraunces — display
        </h3>
        <p className="font-display text-4xl leading-tight tracking-tight">
          The quiet hum of deliberate work.
        </p>
      </section>
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          Geist — body
        </h3>
        <p className="text-base leading-relaxed max-w-prose">
          Pulse runs on rhythm, not surprise. Geist carries the interface: the
          labels on buttons, the body of a paragraph, the numbers in a table
          column. Nothing flashy, nothing missing.
        </p>
      </section>
      <section>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          JetBrains Mono — code & data
        </h3>
        <p className="font-mono text-sm">
          commessa.id = "ACM-2026-014" · hours = 7.25 · rate = 92.00
        </p>
      </section>
    </div>
  ),
};

export const Scale: Story = {
  render: () => (
    <div>
      {SCALE.map((s) => (
        <Row key={s.cls} label={s.label}>
          <span className={s.cls}>Deliberate work, clearly shown.</span>
        </Row>
      ))}
    </div>
  ),
};

export const DisplayScale: Story = {
  render: () => (
    <div>
      {SCALE.slice(4).map((s) => (
        <Row key={s.cls} label={s.label}>
          <span className={`font-display ${s.cls} tracking-tight`}>
            Pulse HR
          </span>
        </Row>
      ))}
    </div>
  ),
};

export const GeistWeights: Story = {
  render: () => (
    <div>
      {GEIST_WEIGHTS.map((w) => (
        <Row key={w.w} label={`${w.w} · ${w.name}`}>
          <span className="text-lg" style={{ fontWeight: w.w }}>
            Clear copy, every weight.
          </span>
        </Row>
      ))}
    </div>
  ),
};

export const FrauncesWeights: Story = {
  render: () => (
    <div>
      {FRAUNCES_WEIGHTS.map((w) => (
        <Row key={w.w} label={`${w.w} · ${w.name}`}>
          <span
            className="font-display text-3xl tracking-tight"
            style={{ fontWeight: w.w }}
          >
            Headline energy
          </span>
        </Row>
      ))}
    </div>
  ),
};

export const NumbersInContext: Story = {
  render: () => (
    <div className="space-y-3 max-w-md">
      <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
        <span className="text-sm text-muted-foreground">Hours logged</span>
        <span className="font-mono text-xl font-medium tabular-nums">
          182.25h
        </span>
      </div>
      <div className="flex items-baseline justify-between border-b border-border/60 pb-2">
        <span className="text-sm text-muted-foreground">Forecast burn</span>
        <span className="font-mono text-xl font-medium tabular-nums">
          €41,820
        </span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Utilization</span>
        <span className="font-mono text-xl font-medium tabular-nums">
          78.4%
        </span>
      </div>
    </div>
  ),
};
