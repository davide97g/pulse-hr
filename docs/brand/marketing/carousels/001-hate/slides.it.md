# Carousel 001 — copy italiana per slide (alternativa)

Traduzione italiana delle slide di [`slides.md`](./slides.md).

**Per oggi (17:00 ship):** il PDF resta **inglese**. Il carosello è
content visivo, tradurlo visivamente = doppia produzione. La feature
multi-language di LinkedIn aggancia lo stesso documento a entrambe le
lingue di caption — va bene così.

**Per la settimana 2 (eventuale companion italiano):** se decidi di
produrre un carosello italiano dedicato per un post Italian-only
lunedì, rendilo da [`carousel.html`](./carousel.html) con questo copy.
Renderer: duplica il file come `carousel.it.html`, sostituisci i testi
slide-per-slide con quelli qui sotto, ri-esporta in PDF come sopra.

**Regola tipografica:** una parola in italic per slide, come nella
versione inglese. Punto lime alla fine della headline. Mai due parole
italic — funziona in inglese, funziona in italiano.

---

## Slide 1 — HOOK

| Campo       | Contenuto                                                |
| ----------- | -------------------------------------------------------- |
| Eyebrow     | —                                                        |
| Headline    | `Software HR per chi *odia* il software HR.`             |
| Body        | —                                                        |
| Footer      | `pulsehr.it`                                             |

## Slide 2 — DIAGNOSI

| Campo    | Contenuto                                                                                                                                                                         |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `DIAGNOSI · 2026`                                                                                                                                                                 |
| Headline | `Il tuo HRIS è *lento*.`                                                                                                                                                          |
| Body     | Il tuo manager vede solo il suo team. La timbratura vive in un'app, il progetto in un'altra. Le stesse otto ore vengono loggate due volte. Nessuno si fida di nessuno dei due numeri. Paghi per tutto questo. Odi tutto questo. |
| Footer   | `— ogni società di servizi, ogni venerdì pomeriggio`                                                                                                                              |

## Slide 3 — BOOK A DEMO

| Campo    | Contenuto                                                                                                 |
| -------- | --------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `COMPORTAMENTO OSSERVATO`                                                                                 |
| Headline | `Per vedere cosa fanno, devi *prenotare una demo*.`                                                       |
| Body     | Apparentemente "posso vedere il prodotto prima di pagarlo" è una feature premium. Eravamo così in disaccordo che abbiamo reso il non-fare-quello un valore di brand. |
| Footer   | `$ grep -r "book a demo" pulsehr.it   →   0 risultati`                                                    |

## Slide 4 — PIVOT

| Campo    | Contenuto                                                                                             |
| -------- | ----------------------------------------------------------------------------------------------------- |
| Eyebrow  | `OPPURE —`                                                                                            |
| Headline | `Potresti semplicemente *leggere* il sorgente.`                                                       |
| Body     | `$ git clone github.com/davide97g/pulse-hr`<br>`$ cd pulse-hr && bun install && bun run dev`<br>` → localhost:5173. fatto.` |
| Footer   | `≈ 58 secondi · su un MacBook del 2020 · numero onesto`                                               |

## Slide 5 — 01 · APERTO

| Campo    | Contenuto                                                                                                                 |
| -------- | ------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `01 · APERTO`                                                                                                             |
| Headline | `Tutto il prodotto. *Su* GitHub.`                                                                                         |
| Body     | FSL-1.1-MIT oggi. Diventa MIT pura dopo due anni. Automatico, non negoziabile. Leggi ogni riga. Eseguila sul tuo box. Forkala se ti deludiamo. |
| Footer   | `github.com/davide97g/pulse-hr/blob/main/LICENSE`                                                                         |

## Slide 6 — 02 · TRASPARENTE

| Campo    | Contenuto                                                                                                                    |
| -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `02 · TRASPARENTE`                                                                                                           |
| Headline | `Nessuna *chiamata* commerciale.`                                                                                            |
| Body     | Roadmap pubblica. Changelog pubblico. Prezzi pubblici. Errori pubblici. Se per capire se Pulse fa al caso tuo ti servisse "parlare con qualcuno" — è colpa nostra. Preferiamo scriverlo. |
| Footer   | `pulsehr.it/roadmap · /changelog · /pricing`                                                                                 |

## Slide 7 — 03 · TUO

| Campo    | Contenuto                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `03 · TUO`                                                                                                             |
| Headline | `I tuoi dati. La tua infra. La tua *uscita*.`                                                                          |
| Body     | Self-host su Docker / Helm / Terraform. Esporta tutto in un formato pulito, quando vuoi, senza chiedere. Lasciare Pulse è la cosa più facile che fa. È voluto. |
| Footer   | `docs/self-hosting.md`                                                                                                 |

## Slide 8 — 04 · COSTRUITO DAGLI HATERS

| Campo    | Contenuto                                                                                                                                     |
| -------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Eyebrow  | `04 · COSTRUITO DA CHI LO USA`                                                                                                                |
| Headline | `Costruito dagli *haters*.`                                                                                                                   |
| Body     | Due sviluppatori a Milano. Niente BDR. Niente "customer success team". Niente product manager. Solo commit, una roadmap pubblica, e pull request da persone che — a quanto pare — odiano anche loro il loro software HR. |
| Footer   | `Davide Ghiotto · Niccolò Naso · Milano · 2026`                                                                                               |

## Slide 9 — CTA

| Campo    | Contenuto                                                                                                                |
| -------- | ------------------------------------------------------------------------------------------------------------------------ |
| Eyebrow  | `→ TOCCA A TE`                                                                                                           |
| Headline | `Vieni a *odiarlo* con noi. Costruttivamente.`                                                                           |
| Body     | `★ Stella.`  ·  `🍴 Forkalo.`  ·  `🔨 Rompilo.`<br>`github.com/davide97g/pulse-hr`<br><br>Stiamo costruendo quello che vorremmo usare dopo. Se hai lo stesso problema, ti ascoltiamo. |
| Footer   | `Pulse HR · pulsehr.it`                                                                                                  |

---

## Note di traduzione

Scelte fatte e perché:

- **"haters"** resta inglese nella slide 8. L'italianizzazione
  (`odiatori`) suona accademica e perde il tono roast. "Haters" è ormai
  vocabolario italiano colloquiale, specialmente nel mondo tech.
- **"book a demo"** resta inglese nella slide 3. Di proposito. È il
  comportamento della categoria che stiamo roastando — mantenere l'ancora
  inglese rinforza il bersaglio.
- **"fatto"** per "done" nella slide 4 invece di "finito" — più colloquiale,
  più coerente col mood del terminal.
- **"È voluto."** nella slide 7 — inciso breve, fermo, tipico della voice
  italiana tecnica. Meglio di "È fatto apposta" che suona più spiegato.
- **"Eyebrow" tutti in MAIUSCOLO + monospace + letter-spacing 0.25em**
  come la versione inglese (da `../../aesthetic.md` §2.5).
- **Dimensione tipografica.** L'italiano è in media 8-12% più lungo
  dell'inglese. Se la slide 2 "body" non sta nel layout, accorcia
  togliendo la frase "Nessuno si fida di nessuno dei due numeri."
  (non è critica per il punto).
