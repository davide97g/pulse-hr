import { createTable } from "@/lib/storage";

export interface CommentReply {
  id: string;
  whoInitials: string;
  whoName: string;
  whoRole: string;
  time: string;
  text: string;
  pinned?: boolean;
}

const seed: CommentReply[] = [
  {
    id: "1",
    whoInitials: "DG",
    whoName: "Davide Greco",
    whoRole: "VP PRODUCT",
    time: "06 MAG · 09:14",
    pinned: true,
    text:
      "Apriamo il thread sulla policy di lavoro da remoto. Tre giorni in ufficio è un punto di partenza, voglio capire dove siamo flessibili.",
  },
  {
    id: "2",
    whoInitials: "AV",
    whoName: "Anna Vialli",
    whoRole: "LEAD DESIGN",
    time: "06 MAG · 09:22",
    text:
      "Tre giorni mi sembrano tanti per il design team — molto del nostro lavoro è async. Possiamo pensare a una media mensile?",
  },
  {
    id: "3",
    whoInitials: "MR",
    whoName: "Marco Rinaldi",
    whoRole: "VP ENG",
    time: "06 MAG · 09:31",
    text:
      "Concordo con Anna sul concetto di media. Per eng siamo già a 2.4 gg in ufficio in media — tre come obbligo penalizzerebbe chi vive fuori Milano.",
  },
  {
    id: "4",
    whoInitials: "LF",
    whoName: "Lucia Ferri",
    whoRole: "VP OPS",
    time: "06 MAG · 09:40",
    text:
      "Per operations e finance il presidio fisico aiuta — ma una settimana al mese da remoto la prendiamo tutti. Posso scrivere una bozza?",
  },
  {
    id: "5",
    whoInitials: "DG",
    whoName: "Davide Greco",
    whoRole: "VP PRODUCT",
    time: "06 MAG · 09:48",
    text: "Lucia perfetta, scrivila per giovedì. Ne parliamo all-hands.",
  },
];

export const commentRepliesTable = createTable<CommentReply>("commentReplies", seed, "rpl");

export function useCommentReplies(): CommentReply[] {
  return commentRepliesTable.useAll();
}
