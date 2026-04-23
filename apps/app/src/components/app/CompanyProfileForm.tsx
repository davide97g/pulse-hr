import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@pulse-hr/ui/primitives/button";
import { Input } from "@pulse-hr/ui/primitives/input";
import { Label } from "@pulse-hr/ui/primitives/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@pulse-hr/ui/primitives/select";
import { cn } from "@/lib/utils";
import {
  COMPANY_SIZES,
  EMPTY_DRAFT,
  INDUSTRIES,
  VOTING_POWER_BASELINE,
  type CompanyProfileDraft,
  type CompanySize,
  type Industry,
} from "@/lib/company-profile";
import { useCompanyProfileStore } from "./CompanyProfileStore";

/**
 * Shared four-field questionnaire. Used by signup step 4, the dashboard
 * banner dialog, and the /voting-power CTA dialog.
 *
 * `variant="signup"` omits the Skip button (signup has its own skip handling)
 * and lets the caller render its own submit button via `externalSubmit`.
 */
export function CompanyProfileForm({
  onSubmitted,
  onSkipped,
  submitLabel = "Complete & double my voting power",
  showSkip = true,
}: {
  onSubmitted?: () => void;
  onSkipped?: () => void;
  submitLabel?: string;
  showSkip?: boolean;
}) {
  const { submitProfile, skipProfile } = useCompanyProfileStore();
  const [draft, setDraft] = useState<CompanyProfileDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    try {
      const res = await submitProfile(draft);
      if (!res.ok) {
        setErrors(res.errors);
        return;
      }
      setErrors({});
      toast.success(`Voting power doubled to ${VOTING_POWER_BASELINE * 2}`, {
        description: "Thanks for sharing — your answers help us tune Pulse.",
        icon: <Coins className="h-4 w-4" />,
      });
      onSubmitted?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Company name" error={errors.companyName} htmlFor="cp-name">
        <Input
          id="cp-name"
          value={draft.companyName}
          onChange={(e) => setDraft((d) => ({ ...d, companyName: e.target.value }))}
          placeholder="Acme Inc."
          autoFocus
        />
      </Field>

      <Field label="Company website" error={errors.website} htmlFor="cp-website">
        <Input
          id="cp-website"
          type="url"
          value={draft.website}
          onChange={(e) => setDraft((d) => ({ ...d, website: e.target.value }))}
          placeholder="https://acme.co"
          inputMode="url"
        />
      </Field>

      <Field label="Company size" error={errors.size}>
        <Select
          value={draft.size}
          onValueChange={(v) => setDraft((d) => ({ ...d, size: v as CompanySize }))}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Pick a size" />
          </SelectTrigger>
          <SelectContent>
            {COMPANY_SIZES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <Field label="Industry" error={errors.industry}>
        <Select
          value={draft.industry}
          onValueChange={(v) => setDraft((d) => ({ ...d, industry: v as Industry }))}
        >
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Pick an industry" />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {INDUSTRIES.map((i) => (
              <SelectItem key={i} value={i}>
                {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      <div
        className={cn(
          "rounded-md border p-3 text-xs text-muted-foreground flex items-start gap-2",
          "border-[color:var(--labs)]/30 bg-[color:var(--labs)]/5",
        )}
      >
        <Coins className="h-4 w-4 text-[color:var(--labs)] mt-0.5 shrink-0" />
        <span>
          Completing this gives you <strong>{VOTING_POWER_BASELINE * 2} voting power</strong> —
          double the baseline. Voting power unlocks upcoming Labs features.
        </span>
      </div>

      <div className="flex gap-2 pt-1">
        {showSkip && (
          <Button
            type="button"
            variant="outline"
            className="press-scale"
            disabled={loading}
            onClick={() => {
              void skipProfile();
              onSkipped?.();
            }}
          >
            Skip for now
          </Button>
        )}
        <Button type="submit" disabled={loading} className="flex-1 h-11 press-scale">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Saving…
            </>
          ) : (
            submitLabel
          )}
        </Button>
      </div>
    </form>
  );
}

function Field({
  label,
  error,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error && <div className="text-[11px] text-destructive">{error}</div>}
    </div>
  );
}
