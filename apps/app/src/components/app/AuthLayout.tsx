import { APP_VERSION } from "@/lib/version";
import { BrandMark } from "@pulse-hr/ui/atoms/BrandMark";
import { Star } from "lucide-react";
import type { ReactNode } from "react";

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
          <div className="flex items-center gap-2.5">
            <BrandMark size="sm" />
            <span
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: '"Fraunces", ui-serif, Georgia, serif' }}
            >
              Pulse <span className="text-[#b4ff39]">HR</span>
            </span>
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
        {/* Fine grid — base layer */}
        <div
          className="absolute inset-0 opacity-[0.18] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #b4ff3933 1px, transparent 1px), linear-gradient(to bottom, #b4ff3933 1px, transparent 1px)",
            backgroundSize: "32px 32px",
            maskImage: "radial-gradient(ellipse 75% 70% at 60% 40%, black 30%, transparent 100%)",
          }}
          aria-hidden
        />
        {/* Coarse grid — accent overlay */}
        <div
          className="absolute inset-0 opacity-[0.22] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #b4ff3955 1px, transparent 1px), linear-gradient(to bottom, #b4ff3955 1px, transparent 1px)",
            backgroundSize: "128px 128px",
            maskImage: "radial-gradient(ellipse 70% 70% at 65% 50%, black 20%, transparent 100%)",
          }}
          aria-hidden
        />
        {/* Top-right neon halo (existing, intensified) */}
        <div
          className="absolute -top-32 -right-32 h-[420px] w-[420px] rounded-full bg-[#b4ff39]/35 blur-[120px] pointer-events-none"
          aria-hidden
        />
        {/* Mid-left soft glow */}
        <div
          className="absolute top-1/3 -left-24 h-72 w-72 rounded-full bg-[#b4ff39]/15 blur-[110px] pointer-events-none"
          aria-hidden
        />
        {/* Bottom neon strip */}
        <div
          className="absolute -bottom-24 right-1/4 h-72 w-[520px] rounded-full bg-[#b4ff39]/20 blur-[140px] pointer-events-none"
          aria-hidden
        />
        {/* Roaming pinpoint dots — animated */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden>
          <span className="absolute top-[18%] left-[22%] h-1.5 w-1.5 rounded-full bg-[#b4ff39] shadow-[0_0_18px_4px_rgba(180,255,57,0.7)] auth-dot-a" />
          <span className="absolute top-[44%] right-[14%] h-1 w-1 rounded-full bg-[#b4ff39] shadow-[0_0_14px_3px_rgba(180,255,57,0.6)] auth-dot-b" />
          <span className="absolute bottom-[22%] left-[34%] h-1.5 w-1.5 rounded-full bg-[#b4ff39] shadow-[0_0_18px_4px_rgba(180,255,57,0.5)] auth-dot-c" />
          <span className="absolute top-[64%] left-[58%] h-1 w-1 rounded-full bg-[#b4ff39]/80 shadow-[0_0_12px_3px_rgba(180,255,57,0.55)] auth-dot-d" />
          <span className="absolute top-[8%] right-[40%] h-1 w-1 rounded-full bg-[#b4ff39]/70 shadow-[0_0_10px_2px_rgba(180,255,57,0.45)] auth-dot-e" />
        </div>
        {/* Subtle scanline gradient over the grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-60 mix-blend-overlay"
          style={{
            background:
              "radial-gradient(circle at 75% 25%, rgba(180,255,57,0.18) 0%, transparent 55%)",
          }}
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
        "We replaced four tools with Pulse. Month-end that used to take a week now closes in an
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
