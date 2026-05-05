import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Coins, Pencil, Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@pulse-hr/ui/primitives/card";
import { Button } from "@pulse-hr/ui/primitives/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@pulse-hr/ui/primitives/dialog";
import { PageHeader } from "@pulse-hr/ui/atoms/PageHeader";
import { NewBadge } from "@pulse-hr/ui/atoms/NewBadge";
import { CompanyProfileForm } from "@/components/app/CompanyProfileForm";
import { useCompanyProfileStore } from "@/components/app/CompanyProfileStore";
import { EmptyState } from "@pulse-hr/ui/atoms/EmptyState";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/voting-power")({
  head: () => ({ meta: [{ title: "Voting Power — Pulse HR" }] }),
  component: VotingPowerPage,
});

function VotingPowerPage() {
  const { profile, power } = useCompanyProfileStore();
  const [open, setOpen] = useState(false);
  const boosted = power.power > power.baseline;
  const multiplier = power.baseline > 0 ? (power.power / power.baseline).toFixed(2) : "1.00";
  const completed = profile?.fullyAnswered === true;
  const initialDraft = useMemo(
    () =>
      profile
        ? {
            companyName: profile.companyName,
            website: profile.website,
            size: profile.size,
            industry: profile.industry,
          }
        : undefined,
    [profile],
  );

  return (
    <div className="p-4 md:p-6 max-w-[1100px] mx-auto fade-in">
      <PageHeader
        title={
          <span className="inline-flex items-center gap-2">
            Voting Power
            <NewBadge />
          </span>
        }
        description="Earn voting power by completing short questionnaires. Higher power unlocks weight in upcoming Labs features."
      />

      <Card
        className={cn(
          "relative overflow-hidden p-6 md:p-8 mb-6 iridescent-border",
          "bg-gradient-to-br from-[color:var(--labs)]/[0.08] via-transparent to-transparent",
        )}
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground inline-flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-[color:var(--labs)]" />
              Your power
            </div>
            <div className="flex items-end gap-3">
              <div className="font-display text-6xl md:text-7xl leading-none tabular-nums">
                {power.power}
              </div>
              <div className="pb-2 space-y-1">
                <div className="text-xs text-muted-foreground">
                  baseline <span className="font-mono">{power.baseline}</span>
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-mono",
                    boosted
                      ? "bg-[color:var(--labs)]/15 text-[color:var(--labs)]"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  <TrendingUp className="h-3 w-3" />×{multiplier}
                </div>
              </div>
            </div>
            <Button
              className="mt-5 press-scale"
              variant={completed ? "outline" : "default"}
              onClick={() => setOpen(true)}
            >
              {completed ? (
                <>
                  <Pencil className="h-4 w-4 mr-1.5" />
                  Redo questionnaire
                </>
              ) : (
                <>
                  <Coins className="h-4 w-4 mr-1.5" />
                  Complete company profile
                </>
              )}
            </Button>
          </div>
          <div className="rounded-md border p-4 bg-background/60 max-w-sm text-xs text-muted-foreground leading-relaxed">
            <div className="font-medium text-foreground mb-1">How to earn</div>
            Complete the company profile questionnaire honestly to double your baseline. More
            questionnaires land soon — each grants additional power.
          </div>
        </div>
      </Card>

      <Card className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="font-semibold">History</div>
          <div className="text-[11px] text-muted-foreground">
            {power.history.length} {power.history.length === 1 ? "entry" : "entries"}
          </div>
        </div>
        {power.history.length === 0 ? (
          <EmptyState
            icon={<Coins className="h-6 w-6" />}
            title="No power events yet"
            description="Complete a questionnaire to start building your record."
          />
        ) : (
          <ol className="space-y-2 stagger-in">
            {power.history.map((h, i) => (
              <li
                key={`${h.at}-${i}`}
                className="flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 bg-background/60"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{h.reason}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {new Date(h.at).toLocaleString()}
                  </div>
                </div>
                <div
                  className={cn(
                    "font-mono text-sm tabular-nums px-2 py-0.5 rounded shrink-0",
                    h.delta >= 0
                      ? "bg-[color:var(--labs)]/15 text-[color:var(--labs)]"
                      : "bg-destructive/10 text-destructive",
                  )}
                >
                  {h.delta >= 0 ? "+" : ""}
                  {h.delta}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{completed ? "Update company profile" : "Tell us about your company"}</DialogTitle>
            <DialogDescription>
              {completed
                ? "You can change your answers anytime. Completing again will not grant extra voting power."
                : `Five quick questions. Skip anytime — baseline voting power stays at ${power.baseline}.`}
            </DialogDescription>
          </DialogHeader>
          <CompanyProfileForm
            initialDraft={initialDraft}
            submitLabel={completed ? "Save answers" : undefined}
            onSubmitted={() => setOpen(false)}
            onSkipped={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
