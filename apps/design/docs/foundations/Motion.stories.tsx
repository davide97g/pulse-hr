import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

const meta: Meta = {
  title: "Foundations/Motion/Demos",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj;

function Tile({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="font-mono text-xs text-muted-foreground">{label}</div>
      <div
        className={`border border-border rounded-md bg-card p-6 min-h-32 flex items-center justify-center ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

function Replay({ children }: { children: (k: number) => React.ReactNode }) {
  const [k, setK] = useState(0);
  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {children(k)}
      <button
        onClick={() => setK((n) => n + 1)}
        className="text-xs text-muted-foreground hover:text-foreground underline decoration-dotted"
      >
        Replay
      </button>
    </div>
  );
}

export const Entrance: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Tile label=".fade-in">
        <Replay>
          {(k) => (
            <div
              key={k}
              className="fade-in bg-primary/10 border border-primary/30 rounded px-4 py-2 text-sm"
            >
              Fading in.
            </div>
          )}
        </Replay>
      </Tile>
      <Tile label=".pop-in">
        <Replay>
          {(k) => (
            <div
              key={k}
              className="pop-in bg-primary text-primary-foreground rounded-full px-4 py-1.5 text-sm font-medium"
            >
              Popped
            </div>
          )}
        </Replay>
      </Tile>
      <Tile label=".stagger-in > *">
        <Replay>
          {(k) => (
            <ul key={k} className="stagger-in w-full space-y-2">
              {["Alma", "Teo", "Nico", "Mira", "Sana"].map((n) => (
                <li
                  key={n}
                  className="bg-muted/60 rounded px-3 py-1.5 text-sm"
                >
                  {n}
                </li>
              ))}
            </ul>
          )}
        </Replay>
      </Tile>
      <Tile label=".panel-enter">
        <Replay>
          {(k) => (
            <div
              key={k}
              className="panel-enter bg-card border border-border rounded-md shadow-lg px-4 py-3 text-sm w-full"
              style={{ boxShadow: "var(--shadow-panel)" }}
            >
              Side panel slides in →
            </div>
          )}
        </Replay>
      </Tile>
    </div>
  ),
};

export const Feedback: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Tile label=".press-scale">
        <button className="press-scale bg-primary text-primary-foreground rounded-md px-4 py-2 text-sm font-medium">
          Press me
        </button>
      </Tile>
      <Tile label=".pulse-dot">
        <div className="flex items-center gap-2">
          <span className="pulse-dot relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
          <span className="text-sm">3 new updates</span>
        </div>
      </Tile>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Tile label=".shimmer">
        <div className="w-full space-y-2">
          <div className="shimmer h-3 w-3/4 rounded bg-muted" />
          <div className="shimmer h-3 w-1/2 rounded bg-muted" />
          <div className="shimmer h-3 w-5/6 rounded bg-muted" />
        </div>
      </Tile>
      <Tile label=".typing-dot">
        <div className="flex gap-1">
          <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground" />
          <span
            className="typing-dot h-2 w-2 rounded-full bg-muted-foreground"
            style={{ animationDelay: "0.15s" }}
          />
          <span
            className="typing-dot h-2 w-2 rounded-full bg-muted-foreground"
            style={{ animationDelay: "0.3s" }}
          />
        </div>
      </Tile>
    </div>
  ),
};

export const Signature: Story = {
  render: () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Tile label=".iridescent-border">
        <div className="iridescent-border rounded-md p-4 bg-card text-sm w-full text-center">
          Labs surface
        </div>
      </Tile>
      <Tile label=".new-badge">
        <span className="new-badge text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5">
          New
        </span>
      </Tile>
      <Tile label=".new-badge-quiet">
        <span className="new-badge-quiet text-[10px] font-semibold uppercase tracking-wider rounded-full px-2 py-0.5">
          New
        </span>
      </Tile>
      <Tile label=".confetti-piece">
        <Replay>
          {(k) => (
            <div key={k} className="relative h-20 w-full overflow-hidden">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-piece absolute top-0"
                  style={{
                    left: `${(i / 14) * 100}%`,
                    background: `hsl(${(i * 32) % 360} 80% 60%)`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
              <div className="absolute inset-0 flex items-center justify-center text-sm">
                🎉
              </div>
            </div>
          )}
        </Replay>
      </Tile>
    </div>
  ),
};
