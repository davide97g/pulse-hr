import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Cake, PartyPopper, Gift, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar } from "./AppShell";
import { upcomingMoments, type Moment } from "@/lib/moments";
import { cn } from "@/lib/utils";

const KUDOS_DRAFT_KEY = "pulse.kudos.draft";

function suggestKudosMessage(m: Moment): string {
  if (m.kind === "birthday") {
    return `Happy birthday ${m.employee.name.split(" ")[0]}! 🎉 Thanks for being part of the team.`;
  }
  return `Huge thanks for ${m.years} year${m.years === 1 ? "" : "s"} of impact, ${m.employee.name.split(" ")[0]}. Here's to many more.`;
}

export function MomentsCard() {
  const nav = useNavigate();
  const moments = useMemo(() => upcomingMoments(new Date(), 10), []);

  if (moments.length === 0) {
    return null;
  }

  const draftKudos = (m: Moment) => {
    const payload = {
      toId: m.employee.id,
      message: suggestKudosMessage(m),
      tag: m.kind === "birthday" ? "kindness" : "impact",
      amount: m.kind === "anniversary" && m.years >= 5 ? 50 : 25,
    };
    try { localStorage.setItem(KUDOS_DRAFT_KEY, JSON.stringify(payload)); } catch {}
    toast.success(`Kudos drafted for ${m.employee.name}`, {
      description: "Opening Kudos to review and send.",
      icon: <Sparkles className="h-4 w-4" />,
    });
    nav({ to: "/kudos" });
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-5 py-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md grid place-items-center bg-warning/15 text-warning">
            <PartyPopper className="h-4 w-4" />
          </div>
          <div>
            <div className="font-semibold text-sm">Moments this week</div>
            <div className="text-[11px] text-muted-foreground">Birthdays + work anniversaries</div>
          </div>
        </div>
      </div>
      <ul className="divide-y stagger-in">
        {moments.slice(0, 6).map((m, i) => {
          const Icon = m.kind === "birthday" ? Cake : PartyPopper;
          const tone = m.kind === "birthday" ? "text-cal-vacation" : "text-cal-holiday";
          const isToday = m.daysAway === 0;
          return (
            <li
              key={`${m.kind}-${m.employee.id}-${i}`}
              className={cn(
                "px-5 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors",
                isToday && "bg-primary/[0.03]",
              )}
            >
              <Avatar initials={m.employee.initials} color={m.employee.avatarColor} size={32} employeeId={m.employee.id} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium flex items-center gap-1.5">
                  <Icon className={cn("h-3.5 w-3.5", tone)} />
                  {m.employee.name}
                  {isToday && (
                    <span className="text-[9px] uppercase tracking-wider font-semibold text-primary">Today</span>
                  )}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {m.kind === "birthday"
                    ? <>Birthday · {m.relative}</>
                    : <>{m.years}-year work anniversary · {m.relative}</>}
                </div>
              </div>
              <button
                onClick={() => draftKudos(m)}
                className="inline-flex items-center gap-1 h-7 px-2 rounded-md border text-[11px] hover:bg-muted press-scale"
                title={`Draft kudos for ${m.employee.name}`}
              >
                <Gift className="h-3 w-3 text-primary" /> Kudos
              </button>
            </li>
          );
        })}
      </ul>
      {moments.length > 6 && (
        <div className="px-5 py-2 border-t text-[11px] text-muted-foreground text-center">
          +{moments.length - 6} more in the next 10 days
        </div>
      )}
    </Card>
  );
}
