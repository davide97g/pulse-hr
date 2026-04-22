/**
 * Tour data types. Shared so release tours embedded in CHANGELOG.md can be
 * parsed and validated on the backend (`changelog` route) and then typed
 * correctly on the frontend (`ChangelogGate`, `TourProvider`).
 *
 * No React / no localStorage here — host apps wire behavior on top.
 */

export type TourPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type TourStep = {
  /** `data-tour` selector on the element to spotlight. Omit for centered. */
  target?: string;
  title: string;
  body: string;
  /** Navigate here before attempting to spotlight. */
  route?: string;
  /** Link to a relevant `/docs/*` page. */
  docHref?: string;
  placement?: TourPlacement;
};

export type TourWorkflow = "Getting started" | "Work" | "People" | "Money" | "Labs" | "Admin";

export type Tour = {
  id: string;
  name: string;
  summary?: string;
  workflow: TourWorkflow;
  /** Short estimate like "2 min" — purely informational. */
  duration: string;
  steps: TourStep[];
};
