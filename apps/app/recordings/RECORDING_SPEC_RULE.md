# Regole per spec video (testreel) — Pulse HR

Usa questo documento quando crei o modifichi JSON di recording in `apps/app/recordings/specs/*.template.json`. Il formato è quello di **[testreel](https://testreel.dev)**; lo schema JSON è referenziato da ogni file tramite `"$schema": "../node_modules/testreel/recording-definition.schema.json"`.

## Tooling e file

| Cosa               | Dove                                                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- |
| Template in input  | `apps/app/recordings/specs/<nome>.template.json`                                                                           |
| Compilazione + run | `bun --cwd apps/app/recordings scripts/run.ts <nome>` oppure dalla root `bun run demo:record -- <nome>`                    |
| Output video       | `apps/app/recordings/output/<nome>/`                                                                                       |
| Credenziali        | `apps/app/test.credentials.json` (`email`, `password`) — sostituiti in compile come `{{TEST_EMAIL}}` / `{{TEST_PASSWORD}}` |
| Base URL app       | `{{BASE_URL}}` (default `http://localhost:5173`; override con env `BASE_URL`)                                              |

Il nome dello spec (`focus`, `kudos-copilot`, …) deve coincidere con il file `specs/<nome>.template.json`.

### Placeholder supportati da `scripts/run.ts`

- `{{BASE_URL}}` — URL dell’app in dev/preview.
- `{{TEST_EMAIL}}`, `{{TEST_PASSWORD}}` — da `test.credentials.json`.
- `"{{SETUP}}"` — se presente nel JSON, viene sostituito dal contenuto di `specs/_setup.partial.json` (blocco JSON di step riusabile).

Variabili ambiente utili: `FORMAT` (es. `mp4`), `HEADED=1`, `VERBOSE=1`, `AUDIO` (path relativo a `recordings/` per mux audio post-run).

---

## Struttura del JSON (livello root)

Campi tipici (vedi `focus.template.json` come riferimento “completo”):

- **`url`** — Pagina iniziale del browser (es. `{{BASE_URL}}/login`).
- **`steps`** — Array obbligatorio di azioni (minimo 1).
- **`viewport`** — `{ "width", "height" }` finestra browser (es. `1280×720`). Per sidebar desktop Pulse usa almeno breakpoint `lg` (~1024px) così la nav laterale è visibile, non solo il drawer mobile.
- **`outputSize`** — Risoluzione finale del video (es. `1920×1080`).
- **`colorScheme`** — `"light"` \| `"dark"`.
- **`chrome`** — `true` o `{ "url": true, "title": "…" }` per barra finestra stile desktop.
- **`background`** — Gradiente/solido, padding, `borderRadius` attorno alla finestra.
- **`cursor`** — `true` o oggetto opzioni cursore (testreel).
- **`localStorage`** — Oggetto chiave/valore iniettato prima del run (es. tema: `"pulse.theme": "employee"`).

Altri campi ammessi dallo schema: `waitForSelector`, `speed`, `outputFormat`, `setup`, ecc. Non aggiungere proprietà non previste dallo schema (`additionalProperties: false`).

---

## Azioni negli `steps`

Ogni step è un oggetto con `"action"` e campi specifici. Tutti gli step possono usare opzionalmente: `timeout` (ms, default spesso ~5000), `pauseAfter`, `speed`, `waitFor` (selettore Playwright o condizione).

| `action`                    | Uso                       | Note                                                                                                                                     |
| --------------------------- | ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `wait`                      | Pausa                     | `{ "action": "wait", "ms": 600 }`                                                                                                        |
| `navigate`                  | `goto` URL                | `{ "action": "navigate", "url": "{{BASE_URL}}/people" }` — utile anche con hash per scrollare a un `id` (es. `{{BASE_URL}}/#nav-focus`). |
| `zoom`                      | Ingrandimento compositing | Con `selector`: centra l’elemento. Con solo `scale: 1`: reset zoom. `duration` in ms.                                                    |
| `click`                     | Click                     | Preferisci `zoom` dedicato prima oppure `click` con `"zoom": 1.7` se supportato.                                                         |
| `type`                      | Digitazione               | `delay` tra tasti (ms). Opzione `clear`.                                                                                                 |
| `fill`                      | Valore istantaneo         | Utile per svuotare (`"text": ""`) prima di `type`.                                                                                       |
| `clear`                     | Svuota campo              |                                                                                                                                          |
| `select`                    | `<select>`                |                                                                                                                                          |
| `scroll`                    | Scroll finestra           | Delta `x` / `y` sulla **pagina** (non scrolla container interni tipo `aside nav` overflow).                                              |
| `hover`                     | Hover                     |                                                                                                                                          |
| `keyboard`                  | Tasto                     | Es. `"Enter"`, `"Escape"`, atajo palette `"Meta+k"`.                                                                                     |
| `screenshot`                | Fotogramma named          | `"name": "01-feature-idle"` → file PNG in output.                                                                                        |
| `waitForNetwork`            | Attesa response           | `urlPattern` substring.                                                                                                                  |
| `hideCursor` / `showCursor` | Cursore                   |                                                                                                                                          |

Ordine consigliato per interazioni leggibili nel video:

1. Breve `wait` dopo navigazioni pesanti.
2. `zoom` sul target (scala ~1.6–2, `duration` ~180–300 ms).
3. `click` / `type` / `fill`.
4. `zoom` con `scale: 1` per tornare wide (durata breve, es. 80–180 ms).

---

## Selettori Playwright (critico)

- Sintassi **Playwright** (`text=…`, `:has-text('…')`, `[role=dialog]`, ecc.).
- **Strict mode**: un selettore deve risolvere a **un solo** elemento visibile quando testreel chiama `waitFor({ state: 'visible' })` e `boundingBox()`. Evita `a[href='/…']` se la stessa `href` compare in sidebar, chip dashboard e drawer mobile.
- **Preferisci**:
  - `aside …` per la sola sidebar desktop;
  - `#id` stabile esposto dall’app per recording (es. `id="nav-focus"` sulla voce Focus in `AppShell`);
  - `data-testid` / `data-tour` se presenti nel codice.
- **Testreel non** esegue `scrollIntoView` come `locator.click()` di Playwright: usa coordinate da `boundingBox()`. Se il target è in un’area scrollabile (sidebar lunga), assicurati che sia in vista — es. `navigate` a `{{BASE_URL}}/#id` dopo aver aggiunto l’`id` sul elemento giusto **solo** dove serve (un solo `id` nel documento).
- Testi visibili: `button:has-text('Continue')` — attenzione se lo stesso testo compare in più bottoni; restringi il contesto (`main >> …`, `aside >> …`, selettore più specifico).
- Evita liste di selettori separate da virgola se producono più match (es. `, main` alla fine può allargare troppo).

---

## Convenzioni narrative (stile `focus.template.json`)

1. **Login + onboarding** — Allineati al flusso reale dell’app (ruolo Admin, goal, nome workspace, opzionale colleghi, “Create workspace”). I selettori `#ws-name`, `#col-0`… devono combaciare con i `id` del form welcome.
2. **Beat del video** — Dopo ogni transizione importante, `screenshot` con `name` prefissato numericamente: `01-…`, `02-…` per ordinare il montaggio e il debug.
3. **Tempi** — `wait` dopo submit lunghi (rete, animazioni): es. 1200–1600 ms post “Create workspace”.
4. **Pagine Labs / feature** — Dopo il setup, entra nella feature con navigazione o click sidebar **univoco**, poi interagisci (preset, CTA, ecc.).
5. **Zoom narrativo** — Evidenzia un dettaglio (testo, timer) con `zoom` + `screenshot` + `wait`, poi reset zoom.

---

## Checklist prima di considerare lo spec “pronto”

- [ ] `$schema` punta al path relativo corretto da `specs/`.
- [ ] Nessun selettore ambiguo su duplicati DOM (sidebar vs main vs sheet).
- [ ] `viewport` coerente con layout (sidebar visibile se serve).
- [ ] Ogni `screenshot` ha `name` univoco e significativo.
- [ ] Placeholder solo quelli supportati dal compile (`run.ts`) o letterali.
- [ ] Opzionale: blocco `"{{SETUP}}"` se condividi onboarding con `_setup.partial.json`.
- [ ] App in esecuzione su `BASE_URL` e `ffmpeg` installato se usi mux audio di default in `run.ts`.

---

## Eseguire il recording

```bash
# dalla root del monorepo, app dev su :5173
bun run dev

# in altro terminale
bun run demo:record -- <nome-spec>
```

In caso di timeout su uno step, aumenta `timeout` su quello step (ms) come in `focus.template.json` per `#nav-focus`.
