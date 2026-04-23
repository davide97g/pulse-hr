import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth, useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api-client";
import {
  REASON_COMPANY_PROFILE,
  VOTING_POWER_BASELINE,
  type CompanyProfile,
  type CompanyProfileDraft,
  type CompanySize,
  type Industry,
  type VotingPower,
  type VotingPowerEntry,
  validateCompanyProfile,
} from "@/lib/company-profile";

/**
 * Client-side cache of the per-user profile + voting power + history.
 *
 * Source of truth is the Pulse HR API (`/user-profile/*`). On mount we pull
 * the current state; `submitProfile` POSTs the questionnaire answers and
 * applies the response. When the API is unavailable (offline preview, no
 * Clerk token, dev without an API URL) we fall back to a local-only store
 * seeded with the baseline so the UI still behaves.
 */

interface ApiPower {
  userId: string;
  power: number;
  baseline: number;
}

interface ApiEvent {
  id: string;
  delta: number;
  reason: string;
  sourceKey: string | null;
  at: string;
}

interface ApiProfile {
  userId: string;
  companyName: string | null;
  companyWebsite: string | null;
  companySize: string | null;
  companyIndustry: string | null;
  fullyAnswered: boolean;
  updatedAt: string;
}

interface ApiMeResponse {
  profile: ApiProfile | null;
  power: ApiPower;
  history: ApiEvent[];
}

interface CompanyProfileContextValue {
  currentUserId: string;
  profile: CompanyProfile | undefined;
  power: VotingPower;
  loading: boolean;
  submitProfile: (
    draft: CompanyProfileDraft,
  ) => Promise<{ ok: true } | { ok: false; errors: Record<string, string> }>;
  skipProfile: () => Promise<void>;
}

const CompanyProfileContext = createContext<CompanyProfileContextValue | null>(null);

function baselinePower(userId: string): VotingPower {
  return {
    userId,
    power: VOTING_POWER_BASELINE,
    baseline: VOTING_POWER_BASELINE,
    history: [],
  };
}

function toEntry(e: ApiEvent): VotingPowerEntry {
  return { delta: e.delta, reason: e.reason, at: e.at };
}

function toClientPower(power: ApiPower, history: ApiEvent[]): VotingPower {
  return {
    userId: power.userId,
    power: power.power,
    baseline: power.baseline,
    history: history.map(toEntry),
  };
}

function toClientProfile(p: ApiProfile): CompanyProfile | undefined {
  if (!p.fullyAnswered) {
    return {
      userId: p.userId,
      companyName: p.companyName ?? "",
      website: p.companyWebsite ?? "",
      size: (p.companySize ?? "1–10") as CompanySize,
      industry: (p.companyIndustry ?? "Other") as Industry,
      completedAt: p.updatedAt,
      fullyAnswered: false,
    };
  }
  return {
    userId: p.userId,
    companyName: p.companyName ?? "",
    website: p.companyWebsite ?? "",
    size: (p.companySize ?? "1–10") as CompanySize,
    industry: (p.companyIndustry ?? "Other") as Industry,
    completedAt: p.updatedAt,
    fullyAnswered: true,
  };
}

export function CompanyProfileProvider({ children }: { children: ReactNode }) {
  const { user, isSignedIn } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id ?? "anonymous";
  const [profile, setProfile] = useState<CompanyProfile | undefined>(undefined);
  const [power, setPower] = useState<VotingPower>(() => baselinePower(userId));
  const [loading, setLoading] = useState<boolean>(true);

  // Pull current state from the API on sign-in / user change.
  useEffect(() => {
    let cancelled = false;
    if (!isSignedIn) {
      setProfile(undefined);
      setPower(baselinePower(userId));
      setLoading(false);
      return;
    }
    setLoading(true);
    (async () => {
      try {
        const token = await getToken();
        const res = await apiFetch("/user-profile/me", {}, token);
        if (!res.ok) {
          if (!cancelled) {
            setPower(baselinePower(userId));
            setProfile(undefined);
          }
          return;
        }
        const data = (await res.json()) as ApiMeResponse;
        if (cancelled) return;
        setPower(toClientPower(data.power, data.history));
        setProfile(data.profile ? toClientProfile(data.profile) : undefined);
      } catch {
        if (!cancelled) {
          setPower(baselinePower(userId));
          setProfile(undefined);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, userId, getToken]);

  const submitProfile = useCallback<CompanyProfileContextValue["submitProfile"]>(
    async (draft) => {
      const localValidation = validateCompanyProfile(draft);
      if (!localValidation.ok) {
        return { ok: false, errors: localValidation.errors as Record<string, string> };
      }

      // Optimistic update so the chip/banner update immediately.
      const optimisticPower: VotingPower = {
        ...power,
        power: power.baseline * 2,
        history: [
          {
            delta: power.baseline,
            reason: REASON_COMPANY_PROFILE,
            at: new Date().toISOString(),
          },
          ...power.history,
        ],
      };
      const optimisticProfile: CompanyProfile = {
        userId,
        companyName: draft.companyName.trim(),
        website: draft.website.trim(),
        size: draft.size as CompanySize,
        industry: draft.industry as Industry,
        completedAt: new Date().toISOString(),
        fullyAnswered: true,
      };
      setProfile(optimisticProfile);
      setPower(optimisticPower);

      if (!isSignedIn) return { ok: true };

      try {
        const token = await getToken();
        const res = await apiFetch(
          "/user-profile/company-profile",
          {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              companyName: draft.companyName.trim(),
              companyWebsite: draft.website.trim(),
              companySize: draft.size,
              companyIndustry: draft.industry,
            }),
          },
          token,
        );
        if (res.ok) {
          const data = (await res.json()) as ApiMeResponse;
          if (data.profile) setProfile(toClientProfile(data.profile));
          setPower(toClientPower(data.power, data.history));
        }
        // Non-OK: keep optimistic state. Offline preview returns 503 which is
        // handled the same way — the server will catch up when the user is
        // back online (re-submits the form).
      } catch {
        /* keep optimistic state */
      }

      return { ok: true };
    },
    [getToken, isSignedIn, power, userId],
  );

  const skipProfile = useCallback(async () => {
    setProfile((prev) =>
      prev
        ? prev
        : {
            userId,
            companyName: "",
            website: "",
            size: "1–10" as CompanySize,
            industry: "Other" as Industry,
            completedAt: new Date().toISOString(),
            fullyAnswered: false,
          },
    );
    if (!isSignedIn) return;
    try {
      const token = await getToken();
      await apiFetch("/user-profile/skip", { method: "POST" }, token);
    } catch {
      /* ignore — optimistic state already reflects the skip */
    }
  }, [getToken, isSignedIn, userId]);

  const value = useMemo<CompanyProfileContextValue>(
    () => ({
      currentUserId: userId,
      profile,
      power,
      loading,
      submitProfile,
      skipProfile,
    }),
    [userId, profile, power, loading, submitProfile, skipProfile],
  );

  return <CompanyProfileContext.Provider value={value}>{children}</CompanyProfileContext.Provider>;
}

export function useCompanyProfileStore(): CompanyProfileContextValue {
  const ctx = useContext(CompanyProfileContext);
  if (!ctx) {
    throw new Error("useCompanyProfileStore must be used within <CompanyProfileProvider>");
  }
  return ctx;
}

export function useVotingPower(): VotingPower {
  return useCompanyProfileStore().power;
}

export function useCompanyProfile(): CompanyProfile | undefined {
  return useCompanyProfileStore().profile;
}
