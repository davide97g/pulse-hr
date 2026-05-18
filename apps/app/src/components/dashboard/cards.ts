import type { LensId, MicroCardConfig } from "./types";
import type { Translator } from "@pulse-hr/shared/i18n";

export interface CardSignals {
  pendingLeavesCount: number;
  pendingLeavesToApprove: number;
  recruitingCandidates: number;
  recruitingOffers: number;
  pulseResponseRate: number;
  pulseDeltaPp: number;
  oneOnOneOpen: number;
  oneOnOneLate: number;
  kudosThisMonth: number;
  kudosDelta: number;
  growthOpen: number;
  momentsToday: number;
  timesheetsToClose: number;
  weekNumber: number;
  outToday: number;
  newLeaveRequests: number;
  meetingsToday: number;
  meetingConflicts: number;
  satMeanPct: number;
  projectsAtRisk: number;
  officesOpen: number;
  officesTotal: number;
  busiestOfficeName: string;
  busiestOfficePct: number;
}

const signed = (n: number) => `${n >= 0 ? "+" : ""}${n}`;

export function cardsFor(
  lens: LensId,
  s: CardSignals,
  t: Translator,
): MicroCardConfig[] {
  if (lens === "sentiment") {
    return [
      {
        eyebrow: `01 · ${t("dashcard.pulse.eyebrow")}`,
        title: t("dashcard.pulse.title"),
        big: `${Math.round(s.pulseResponseRate * 100)}%`,
        caption: t("dashcard.pulse.caption", { delta: signed(s.pulseDeltaPp) }),
        accent: true,
        status: t("dashcard.pulse.status"),
        link: "/feedback",
      },
      {
        eyebrow: `02 · ${t("dashcard.oneonone.eyebrow")}`,
        title: t("dashcard.oneonone.title"),
        big: String(s.oneOnOneOpen),
        caption: t("dashcard.oneonone.caption", { late: s.oneOnOneLate }),
        link: "/people",
      },
      {
        eyebrow: `03 · ${t("dashcard.kudos.eyebrow")}`,
        title: t("dashcard.kudos.title"),
        big: String(s.kudosThisMonth),
        caption: t("dashcard.kudos.caption", { delta: signed(s.kudosDelta) }),
        spark: true,
        link: "/kudos",
      },
      {
        eyebrow: `04 · ${t("dashcard.growth.eyebrow")}`,
        title: t("dashcard.growth.title"),
        big: String(s.growthOpen),
        caption: t("dashcard.growth.caption"),
        link: "/growth",
      },
      {
        eyebrow: `05 · ${t("dashcard.moments.eyebrow")}`,
        title: t("dashcard.moments.title"),
        big: String(s.momentsToday),
        caption: t("dashcard.moments.caption"),
        link: "/moments",
      },
    ];
  }

  if (lens === "presence") {
    return [
      {
        eyebrow: `01 · ${t("dashcard.outToday.eyebrow")}`,
        title: t("dashcard.outToday.title"),
        big: String(s.outToday),
        caption: t("dashcard.outToday.caption", { n: s.newLeaveRequests }),
        accent: true,
        link: "/leave",
      },
      {
        eyebrow: `02 · ${t("dashcard.workload.eyebrow")}`,
        title: t("dashcard.workload.title"),
        big: `${s.satMeanPct}%`,
        caption: t("dashcard.workload.caption"),
        spark: true,
        link: "/saturation",
      },
      {
        eyebrow: `03 · ${t("dashcard.moments.eyebrow")}`,
        title: t("dashcard.moments.title"),
        big: String(s.momentsToday),
        caption: t("dashcard.moments.caption"),
        link: "/moments",
      },
      {
        eyebrow: `04 · ${t("dashcard.standup.eyebrow")}`,
        title: t("dashcard.standup.title"),
        big: String(s.oneOnOneOpen),
        caption: t("dashcard.standup.caption", { late: s.oneOnOneLate }),
        link: "/log",
      },
    ];
  }

  // workload (default)
  return [
    {
      eyebrow: `01 · ${t("dashcard.leave.eyebrow")}`,
      title: t("dashcard.leave.title"),
      big: String(s.pendingLeavesCount),
      caption: t("dashcard.leave.caption", { n: s.pendingLeavesToApprove }),
      accent: true,
      link: "/leave",
    },
    {
      eyebrow: `02 · ${t("dashcard.kudos.eyebrow")}`,
      title: t("dashcard.kudos.title"),
      big: String(s.kudosThisMonth),
      caption: t("dashcard.kudos.caption", { delta: signed(s.kudosDelta) }),
      spark: true,
      link: "/kudos",
    },
    {
      eyebrow: `03 · ${t("dashcard.growth.eyebrow")}`,
      title: t("dashcard.growth.title"),
      big: String(s.growthOpen),
      caption: t("dashcard.growth.caption"),
      link: "/growth",
    },
    {
      eyebrow: `04 · ${t("dashcard.moments.eyebrow")}`,
      title: t("dashcard.moments.title"),
      big: String(s.momentsToday),
      caption: t("dashcard.moments.caption"),
      link: "/moments",
    },
  ];
}
