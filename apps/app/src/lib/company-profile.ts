/**
 * Types, preset values, and validation for the company-profile onboarding
 * questionnaire + voting-power reward.
 *
 * Reactive state lives in `CompanyProfileStore.tsx`; this file is pure.
 */

export const COMPANY_SIZES = [
  "1–10",
  "11–50",
  "51–200",
  "201–500",
  "501–1,000",
  "1,001–5,000",
  "5,001+",
] as const;
export type CompanySize = (typeof COMPANY_SIZES)[number];

export const INDUSTRIES = [
  "Software",
  "SaaS",
  "Agency / Consulting",
  "Finance",
  "Healthcare",
  "Education",
  "E-commerce",
  "Manufacturing",
  "Retail",
  "Media & Entertainment",
  "Real Estate",
  "Travel & Hospitality",
  "Logistics",
  "Energy",
  "Legal",
  "Non-profit",
  "Government",
  "Other",
] as const;
export type Industry = (typeof INDUSTRIES)[number];

export interface CompanyProfile {
  userId: string;
  companyName: string;
  website: string;
  size: CompanySize;
  industry: Industry;
  completedAt: string;
  /** True when all fields passed validation; false when the user skipped. */
  fullyAnswered: boolean;
}

export interface CompanyProfileDraft {
  companyName: string;
  website: string;
  size: CompanySize | "";
  industry: Industry | "";
}

export const EMPTY_DRAFT: CompanyProfileDraft = {
  companyName: "",
  website: "",
  size: "",
  industry: "",
};

export type ValidationResult =
  | { ok: true }
  | { ok: false; errors: Partial<Record<keyof CompanyProfileDraft, string>> };

export function validateCompanyProfile(draft: CompanyProfileDraft): ValidationResult {
  const errors: Partial<Record<keyof CompanyProfileDraft, string>> = {};
  if (draft.companyName.trim().length < 2) {
    errors.companyName = "At least 2 characters.";
  }
  if (!isValidHttpUrl(draft.website)) {
    errors.website = "Enter a valid http(s) URL.";
  }
  if (!draft.size || !COMPANY_SIZES.includes(draft.size as CompanySize)) {
    errors.size = "Pick a size.";
  }
  if (!draft.industry || !INDUSTRIES.includes(draft.industry as Industry)) {
    errors.industry = "Pick an industry.";
  }
  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return { ok: true };
}

function isValidHttpUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export interface VotingPowerEntry {
  delta: number;
  reason: string;
  at: string;
}

export interface VotingPower {
  userId: string;
  power: number;
  baseline: number;
  history: VotingPowerEntry[];
}

export const VOTING_POWER_BASELINE = 100;

/** Reason string used for the questionnaire grant (search-friendly constant). */
export const REASON_COMPANY_PROFILE = "Completed company profile";
