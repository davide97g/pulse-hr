import type { LensId, MicroCardConfig } from "./types";

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

export function cardsFor(lens: LensId, s: CardSignals): MicroCardConfig[] {
  if (lens === "sentiment") {
    return [
      {
        eyebrow: "01 · PULSE",
        title: "Survey",
        big: `${Math.round(s.pulseResponseRate * 100)}%`,
        caption: `tasso di risposta · ${s.pulseDeltaPp >= 0 ? "+" : ""}${s.pulseDeltaPp} vs scorso`,
        accent: true,
        status: "Chiude venerdì",
        link: "/feedback",
      },
      {
        eyebrow: "02 · 1-ON-1",
        title: "Incontri",
        big: String(s.oneOnOneOpen),
        caption: `da pianificare · ${s.oneOnOneLate} in ritardo`,
        link: "/people",
      },
      {
        eyebrow: "03 · KUDOS",
        title: "Grazie",
        big: String(s.kudosThisMonth),
        caption: `kudos questo mese · ${s.kudosDelta >= 0 ? "+" : ""}${s.kudosDelta} vs scorso`,
        spark: true,
        link: "/kudos",
      },
      {
        eyebrow: "04 · GROWTH",
        title: "Carriere",
        big: String(s.growthOpen),
        caption: "review trimestrale aperte",
        link: "/growth",
      },
      {
        eyebrow: "05 · MOMENTS",
        title: "Auguri",
        big: String(s.momentsToday),
        caption: "compleanni e anniversari oggi",
        link: "/moments",
      },
    ];
  }

  if (lens === "presence") {
    return [
      {
        eyebrow: "01 · LEAVE",
        title: "Oggi fuori",
        big: String(s.outToday),
        caption: `ferie + malattia · ${s.newLeaveRequests} nuove richieste`,
        accent: true,
        link: "/leave",
      },
      {
        eyebrow: "02 · WORKLOAD",
        title: "Carico medio",
        big: `${s.satMeanPct}%`,
        caption: "saturazione team · soglia salute",
        spark: true,
        link: "/saturation",
      },
      {
        eyebrow: "03 · MOMENTS",
        title: "Auguri",
        big: String(s.momentsToday),
        caption: "compleanni e anniversari oggi",
        link: "/moments",
      },
      {
        eyebrow: "04 · STATUS LOG",
        title: "Standup",
        big: String(s.oneOnOneOpen),
        caption: `chat aperte · ${s.oneOnOneLate} in ritardo`,
        link: "/log",
      },
    ];
  }

  // workload (default)
  return [
    {
      eyebrow: "01 · LEAVE",
      title: "Riposo",
      big: String(s.pendingLeavesCount),
      caption: `richieste aperte · ${s.pendingLeavesToApprove} da approvare`,
      accent: true,
      link: "/leave",
    },
    {
      eyebrow: "02 · KUDOS",
      title: "Grazie",
      big: String(s.kudosThisMonth),
      caption: `kudos questo mese · ${s.kudosDelta >= 0 ? "+" : ""}${s.kudosDelta} vs scorso`,
      spark: true,
      link: "/kudos",
    },
    {
      eyebrow: "03 · GROWTH",
      title: "Carriere",
      big: String(s.growthOpen),
      caption: "review trimestrale aperte",
      link: "/growth",
    },
    {
      eyebrow: "04 · MOMENTS",
      title: "Auguri",
      big: String(s.momentsToday),
      caption: "compleanni e anniversari oggi",
      link: "/moments",
    },
  ];
}
