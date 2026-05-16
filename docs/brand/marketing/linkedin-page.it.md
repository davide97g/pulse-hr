# LinkedIn Company Page — versione italiana (alternativa)

> **Status (refocus di maggio 2026):** Tagline, About e Specialties qui sotto sono le **versioni correnti** — IC-first, employee-first, nessun riferimento a competitor. Incollale in LinkedIn al prossimo refresh della pagina (la pagina è già live). Vedi `./linkedin-page.md` per la versione inglese (primary).


Traduzione italiana della [`linkedin-page.md`](./linkedin-page.md) inglese.
L'inglese resta il **primary language** del profilo; l'italiano è la
**alternative language** (feature LinkedIn lanciata 2024) — i visitatori
con interfaccia LinkedIn in italiano vedranno questi campi, tutti gli
altri vedranno la versione inglese.

**Come attivarla:**

1. LinkedIn Page admin → **Edit Page** → **Overview** → **Page info**.
2. Trova la sezione **Add languages** (sotto Description).
3. Aggiungi **Italian** come alternative language.
4. Incolla `Tagline` e `About` qui sotto nei rispettivi campi italiani.
5. Save.

---

## Tagline italiana (220 char max)

Incolla:

```
Un workspace open source che rende il tuo lavoro impossibile da ignorare. Per IC nei team tech. Sorgente pubblico, prezzi pubblici, self-host quando vuoi, niente chiamate commerciali per vedere il prodotto.
```

**Count:** 209 / 220. ✓

---

## About italiana (2.000 char max)

Incolla, rispettando le righe vuote:

```
Pulse HR è un workspace open source per l'IC — la dev o la designer il cui lavoro migliore è sepolto in un thread Slack di marzo.

Tre righe di stato al giorno. Un kudos che non scrolla via. Un percorso di crescita con artefatti che puoi mostrare. Il lavoro che fai viene visto, riconosciuto, ricordato — senza compilare un form ogni trimestre.

L'intera piattaforma è su GitHub sotto FSL-1.1-MIT — leggi ogni riga, eseguila sulla tua infra, forkala se ti deludiamo. La licenza diventa MIT pura dopo due anni, automaticamente.

Superfici attive oggi (people-first):
• Status Log — tre righe, ⌘⏎, sostituisce la standup async
• Kudos — riconoscimento tra colleghi che sopravvive la settimana
• Growth — achievement, skill path, la prova che porti al prossimo 1:1
• Moments — compleanni, anniversari, le piccole cose che fanno team
• Workload check-in — un tap a settimana, il manager vede l'aggregato, non la risposta
• Diario delle assenze — personale, niente coda di approvazioni

Quattro impegni, non negoziabili:

1. Employee-first — costruito per l'IC. Riconoscimento, crescita, prova del lavoro. Il manager vede un recap manager-safe, mai la chat grezza.

2. Aperto — sorgente su GitHub, licenza equa, ogni contributor creditato nel changelog. Niente feature gate a pagamento. Niente tier enterprise con moduli extra.

3. Trasparente — roadmap, changelog, prezzi e anche gli errori: tutti pubblici. Non serve una chiamata commerciale per capire se Pulse fa al caso tuo. Basta scrollare.

4. Tuo — self-host con `docker compose up` in 90 secondi, oppure paghi noi per hostarlo. Esporta tutto in un formato pulito quando vuoi. Lasciare Pulse è la cosa più facile che fa.

Costruito a Milano, in pubblico, da due sviluppatori frontend-fluent. Non è un progetto Bitrock — Bitrock è il nostro lavoro. Niente VC. Niente BDR. Niente "AI-powered" come etichetta. Solo due sviluppatori, un commit log pubblico e il workspace che vorremmo davvero usare.

Parti da: github.com/davide97g/pulse-hr
```

**Count:** ~1.970 / 2.000. ✓

---

## Specialties (rimangono invariate)

Le specialty sono globali (LinkedIn non le localizza). Usa la stessa
lista di [`linkedin-page.md`](./linkedin-page.md) §4.

---

## Note di traduzione

Termini mantenuti in inglese (coerenti con `../foundation.md` §11 e il
dizionario `apps/marketing/src/i18n/it.ts`):

- **Brand:** Pulse HR
- **Tecnici:** HR, open source, FSL-1.1-MIT, MIT, self-host, API,
  REST, webhook, PR, BDR, SaaS, LLM, Docker, Helm, Terraform, changelog,
  roadmap, workspace, IC, kudos, Status Log, Growth, Moments,
  commit, fork, issue, ⌘J, ⌘⏎
- **Italianizzati volutamente:** "chiamata commerciale" (per "sales call"
  — suona più diretto di "call di vendita"), "errori" (per "screw-ups"
  — "screw-up" in italiano perde la connotazione di ammissione onesta,
  "errori" la mantiene senza zuccherare).
- **Intraducibili volutamente:** "book a demo" (lo lasciamo in inglese
  apposta — è il pattern della categoria su cui stiamo migliorando).
- **Tono:** opinionato ma pacato. Niente roast nell'identità del brand
  (campagne specifiche possono averlo in futuro, ma non qui).
- **Nessun nome di prodotto concorrente.** Né per confronto, né per
  attaccare, né di passaggio. Vale anche per la traduzione italiana.
