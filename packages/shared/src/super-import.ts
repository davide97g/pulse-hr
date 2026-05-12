/**
 * Shared types and limits for the Super Import feature. Imported by both
 * apps/app (client) and apps/api (server) to keep the wire format and the
 * per-run caps lock-stepped.
 */

export const RUNS_PER_DAY = 5;
export const MAX_TEXT_BYTES = 100 * 1024;
export const MAX_FILES = 10;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;
export const MAX_VOICE_SECONDS = 120;

export type ConflictDecision = "skip" | "update" | "create_anyway";

export type SuperImportEntityType =
  | "employee"
  | "commessa"
  | "candidate"
  | "client"
  | "activity"
  | "allocation"
  | "leave"
  | "timesheet";

export type Source =
  | { id: string; kind: "file"; name: string; mime: string; size: number }
  | { id: string; kind: "url"; url: string }
  | { id: string; kind: "voice"; durationSec: number }
  | { id: string; kind: "text"; body: string };

export type ParsedEntity = {
  id: string;
  entityType: SuperImportEntityType;
  data: Record<string, unknown>;
  confidence: number;
  conflict?: {
    matchedId: string;
    matchedLabel: string;
    matchedFields: string[];
  };
};

export type KnownEntityDigest = Array<{
  type: SuperImportEntityType;
  id: string;
  displayLabel: string;
}>;

export type ParseRequestEnvelope = {
  urls: string[];
  textBody: string;
  contextNote: string;
  knownEntityDigest: KnownEntityDigest;
  voiceDurationSec?: number;
};

export type ParseResponse = {
  entities: ParsedEntity[];
  quotaAfter: { runsLeft: number; runsTotal: number; resetAt: string };
};

export type QuotaResponse = {
  runsLeft: number;
  runsTotal: number;
  resetAt: string;
};

export type ImportSummary = {
  inserted: number;
  updated: number;
  skipped: number;
  byEntity: Partial<Record<SuperImportEntityType, number>>;
};
