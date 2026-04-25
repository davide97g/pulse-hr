import type { ReactNode } from "react";
import { Star } from "lucide-react";
import { BrandMark } from "@pulse-hr/ui/atoms/BrandMark";
import { APP_VERSION } from "@/lib/version";

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  side,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  side?: ReactNode;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] bg-background">
      <div className="flex flex-col">
        <div className="px-8 lg:px-14 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrandMark size="sm" />
            <span className="font-display text-xl">Pulse HR</span>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center px-8 lg:px-14 pb-14">
          <div className="w-full max-w-[420px] fade-in">
            <h1 className="font-display text-5xl leading-[1.02] tracking-tight mb-2">{title}</h1>
            <p className="text-muted-foreground mb-8">{subtitle}</p>
            {children}
            {footer && <div className="mt-6 text-sm text-muted-foreground">{footer}</div>}
          </div>
        </div>
        <div
          className="px-8 lg:px-14 pb-6 text-[10px] font-mono tabular-nums text-muted-foreground/60 select-none"
          title={`Pulse HR build v${APP_VERSION}`}
        >
          v{APP_VERSION}
        </div>
      </div>
      <div className="hidden lg:block relative bg-[#0b0b0d] text-[#f2f2ee] overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #ffffff22 1px, transparent 1px), linear-gradient(to bottom, #ffffff22 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 60% 60% at 50% 40%, black 40%, transparent 100%)",
          }}
          aria-hidden
        />
        <div
          className="absolute -top-20 -right-20 h-80 w-80 rounded-full bg-[#b4ff39]/20 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div className="relative h-full flex flex-col p-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 w-fit">
            <span className="h-1.5 w-1.5 rounded-full bg-[#b4ff39]" />
            Trusted by 4,800+ teams
          </div>
          <div className="mt-auto">{side ?? <DefaultSide />}</div>
        </div>
      </div>
    </div>
  );
}

function DefaultSide() {
  return (
    <div>
      <div className="flex gap-0.5 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className="h-4 w-4 fill-[#b4ff39] text-[#b4ff39]" />
        ))}
      </div>
      <blockquote className="font-display text-3xl leading-snug max-w-lg">
        "We replaced four tools with Pulse. Payroll that used to take a week now closes in an
        afternoon — and the team <em className="italic">enjoys</em> onboarding."
      </blockquote>
      <div className="mt-8 flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-white/10 grid place-items-center text-sm font-medium">
          AP
        </div>
        <div>
          <div className="text-sm font-medium">Aisha Patel</div>
          <div className="text-xs text-white/50">Head of People, Nova Retail</div>
        </div>
      </div>
      <div className="mt-14 grid grid-cols-3 gap-5 max-w-sm">
        {[
          { v: "$1.2B", l: "Processed" },
          { v: "47", l: "Countries" },
          { v: "99.99%", l: "Uptime" },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-display text-2xl text-[#b4ff39]">{s.v}</div>
            <div className="text-[11px] text-white/50 mt-0.5">{s.l}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
