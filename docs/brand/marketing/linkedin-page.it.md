# LinkedIn Company Page — versione italiana (alternativa)

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
Software HR open source per chi odia il software HR. Sorgente su GitHub, prezzi pubblici, self-host quando vuoi, nessuna chiamata commerciale per vedere il prodotto. Da Milano, in pubblico, di due developer stanchi del loro HRIS.
```

**Count:** 217 / 220. ✓ (tight — non aggiungere altro).

---

## About italiana (2.000 char max)

Incolla, rispettando le righe vuote:

```
Pulse HR è il software HR open source per chi odia il software HR.

Costruito in pubblico da due sviluppatori frontend-fluent a Milano, per le società di servizi e i piccoli team tech che hanno già sofferto BambooHR, Personio, Factorial, Rippling o qualsiasi altra suite HR chiusa. L'intera piattaforma è su GitHub sotto FSL-1.1-MIT — leggi ogni riga, eseguila sulla tua infra, forkala se ti deludiamo. La licenza diventa MIT pura dopo due anni, automaticamente.

Tre moduli indipendenti che condividono un workspace, una tastiera, un'API:
• People — profili, organigramma, ferie, onboarding, documenti, firme elettroniche
• Work — timesheet sulle commesse (codici progetto), recruiting, focus mode, command bar ⌘J
• Money — payroll multi-paese, spese, margini, forecast di progetto

Adotta un modulo. Salta gli altri. Sostituiscili quando vuoi. Nessuna migrazione tutto-o-niente. Nessun tier a pagamento. Nessun "book a demo" per vedere il prodotto. Nessun formato proprietario di export.

Quattro impegni, non negoziabili:

1. Aperto — sorgente su GitHub, licenza equa, ogni contributor creditato nel changelog.

2. Trasparente — roadmap, changelog, prezzi e anche gli errori: tutti pubblici. Non serve una chiamata commerciale per capire se Pulse fa al caso tuo. Basta scrollare.

3. Tuo — self-host su Docker, Helm o Terraform. Esporta tutto in un formato pulito, quando vuoi, senza chiedere. Lasciare Pulse è la cosa più facile che fa.

4. Costruito da chi lo usa — la roadmap è plasmata dalle pull request, non dai product manager. Davide e Niccolò usano Pulse per il proprio lavoro ogni giorno. Se una frizione dura più di una settimana, viene fixata.

Spedito da Milano, in pubblico. Non è un progetto Bitrock — Bitrock è il nostro lavoro. Niente VC. Niente BDR. Niente "AI-powered" come etichetta. Solo due sviluppatori, un commit log pubblico e l'HR tool che vorremmo davvero usare.

Parti da: github.com/davide97g/pulse-hr

Se anche tu odi il tuo HRIS — raccontaci perché. Commenti, issue, PR: tutto benvenuto.
```

**Count:** ~1.960 / 2.000. ✓

---

## Specialties (rimangono invariate)

Le specialty sono globali (LinkedIn non le localizza). Usa la stessa
lista di [`linkedin-page.md`](./linkedin-page.md) §4.

---

## Note di traduzione

Termini mantenuti in inglese (coerenti con `../foundation.md` §10 e il
dizionario `apps/marketing/src/i18n/it.ts`):

- **Brand:** Pulse HR, Money, People, Work
- **Tecnici:** HR, HRIS, open source, FSL-1.1-MIT, MIT, self-host, API,
  REST, webhook, PR, BDR, SaaS, LLM, Docker, Helm, Terraform, changelog,
  roadmap, workspace, timesheet, onboarding, recruiting, payroll,
  commit, fork, issue, ⌘J
- **Italianizzati volutamente:** "chiamata commerciale" (per "sales call"
  — suona più diretto di "call di vendita"), "errori" (per "screw-ups"
  — "screw-up" in italiano perde la connotazione di ammissione onesta,
  "errori" la mantiene senza zuccherare).
- **Intraducibili volutamente:** "book a demo" (lo lasciamo in inglese
  apposta — è il comportamento della categoria che stiamo roastando).
- **Tono:** "odia" è forte in italiano, più forte di "hate" in inglese.
  Perfetto per il tono roast — non ammorbidire a "non sopporta" o
  "non digerisce."
