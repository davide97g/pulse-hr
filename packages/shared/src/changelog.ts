import type { Tour } from "./tours.js";

/**
 * One release entry. The backend emits arrays of these from CHANGELOG.md;
 * the frontend `/api/changelog/latest` response returns a single one.
 */
export type Release = {
  version: string;
  /** ISO date "YYYY-MM-DD". */
  date: string;
  title: string;
  bodyMarkdown: string;
  tour: Tour | null;
};
