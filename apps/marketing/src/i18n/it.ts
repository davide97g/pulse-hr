import type { Dict } from "./en";

// Italian dictionary.
// Brand names (Pulse HR, Money, People, Work, Team Pulse, Kudos,
// Focus Mode, Saturation), tech acronyms (API, SDK, REST, SSO, SOC 2, GDPR, HRIS,
// PWA, F24, HMRC PAYE, ISO, HIPAA, BAA, DPA, SIG-lite, CAIQ, CET, PT, BDR),
// product vendor names (Rippling, Deel, BambooHR, Slack, Google, QuickBooks, Okta,
// Stripe, GitHub, Personio, Factorial, Remote, Brex, Stripe Atlas, Figma, Linear),
// roles (CEO, COO, CFO, VP, HR, Staff Engineer) and ⌘K / ⌘J remain untranslated —
// they are accepted English or brand terms.

export const it: Dict = {
  meta: {
    tagline: "Software per le persone, non per i numeri.",
    description:
      "Lo strumento HR che guarda a come stai, non a quante ore hai tracciato. Status log async, crescita, kudos, benessere — niente timesheet, niente code di approvazione, niente buste paga. Open source, self-host, costruito da chi lo usa.",
    keywords:
      "engagement dipendenti, standup async, kudos, riconoscimento, benessere, open source, self-hosted, status log, crescita, soddisfazione, HR people-first",
  },

  a11y: {
    skipToMain: "Vai al contenuto principale",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    pulseHomeLabel: "Home Pulse HR",
    primaryNav: "Principale",
    footer: "Piè di pagina",
    customerLogos: "Workspace di esempio",
    customerTestimonials: "Note dai maintainer",
    keyStats: "Statistiche principali",
    languageSwitcher: "Cambia lingua",
  },

  nav: {
    product: "Prodotto",
    labs: "Labs",
    docs: "Docs",
    vs: "vs",
    pricing: "Prezzi",
    changelog: "Changelog",
    signIn: "Accedi",
    startFree: "Inizia gratis",
    viewGithub: "Vedi il sorgente su GitHub",
    github: "GitHub",
  },

  footer: {
    tagline:
      "Aperto. Trasparente. Costruito in pubblico, dalle persone che lo usano.",
    colProduct: "Prodotto",
    colOpenSource: "Open source",
    colResources: "Risorse",
    productTour: "Tour del prodotto",
    modules: "Moduli",
    keyboard: "Tastiera",
    vsAlternatives: "vs. alternative",
    pricing: "Prezzi",
    changelog: "Changelog",
    roadmap: "Roadmap",
    labs: "Labs",
    whyOpenSource: "Perché open source",
    ecosystem: "Ecosistema",
    github: "GitHub",
    license: "Licenza",
    contribute: "Contribuisci",
    selfHost: "Self-host",
    docs: "Docs",
    apiReference: "Riferimento API",
    blog: "Blog",
    security: "Sicurezza",
    contact: "Contatti",
    rights: "Tutti i diritti riservati",
    privacy: "Privacy",
    terms: "Termini",
    status: "Status",
  },

  lang: {
    switchTo: "Passa a",
  },

  demoStrip: {
    label: "Avviso demo pubblica",
    tag: "Demo pubblica",
    headline: "Pulse è in modalità demo.",
    body: "Il prodotto è un mock solo frontend — ogni schermata, ogni record vive nel tuo browser. Lo rilasciamo in anticipo per capire cosa serve davvero alle persone, prima di costruire il backend. Accedi nell'app per lasciarci feedback che arriva diretto ai maintainer.",
    cta: "Apri la demo",
  },

  demoNotice: {
    eyebrow: "Stato attuale",
    title: {
      before: "Quello che vedi è una ",
      italic: "demo.",
      after: "",
    },
    body: "Pulse HR oggi è un mock solo frontend. Lo rilasciamo prima del backend così chi usa software HR ogni giorno possa dirci cosa costruire per primo. Provalo, rompi tutto, poi raccontaci cosa manca — il feedback è l'unico pezzo collegato a un vero backend, ed è proprio quello che vogliamo sentire da te.",
    bullets: [
      {
        k: "Tutto mockato",
        v: "Ogni dipendente, commessa, documento e richiesta vive nel tuo browser. Niente viene inviato a un server.",
      },
      {
        k: "Apri in un click",
        v: "Nessuna registrazione per esplorare — crea il workspace, scegli un ruolo, cliccaci sopra quanto vuoi.",
      },
      {
        k: "Feedback con account",
        v: "Lasciare un commento, votare una feature Labs o postare sul board richiede un account gratuito così possiamo risponderti.",
      },
    ],
    ctaPrimary: "Prova la demo — senza registrarti",
    ctaSecondary: "Accedi per dare feedback",
  },

  hero: {
    badge: "Open source · FSL-1.1-MIT · beta pubblica · costruito in pubblico",
    eyebrow: "Open source · per le persone del tuo team",
    titleBefore: "Software per le",
    titleItalic: "persone",
    titleAfter: ", non per i numeri.",
    body: [
      "Lo strumento HR che guarda a come stai, non a quante ore hai tracciato. ",
      "Status log async",
      ", ",
      "crescita",
      " e ",
      "riconoscimento",
      " — costruiti attorno ai momenti che contano per un team. Niente timesheet, niente code di approvazione, niente buste paga. Open source su GitHub, self-host o hosted — niente chiamata commerciale per vedere il prodotto.",
    ],
    ctaPrimary: "Prova gratis — i tuoi dati, la tua infra",
    ctaGithub: "Leggi il sorgente",
    ctaTour: "Guarda l'app",
    chip1: "Niente timesheet · Niente code di approvazione",
    chip2: "Standup async · Pulse continuo",
    chip3: "Self-host o hosted — scegli tu",
    newThisQuarter: "Novità di questo trimestre",
  },

  heroReel: {
    ariaLabel: "Showreel del prodotto Pulse HR",
    videoLabel: "Una giornata in Pulse — showreel animato",
    posterAlt: "Una giornata in Pulse — anteprima statica",
    caption: "Una giornata in Pulse · loop 20s",
  },

  marquee: {
    title: "Workspace di esempio — non clienti reali",
  },

  stats: {
    processed: "Commit pubblici su main",
    countries: "PR della community integrate",
    teams: "Stelle su GitHub",
    commands: "Giorni di sviluppo in pubblico",
  },

  whyPulse: {
    eyebrow: "Perché Pulse",
    title: {
      before: "Gli altri tool HR ti",
      italic: "contano",
      after: ". Noi ti ",
      end: "vediamo.",
    },
    subtitle: {
      before:
        "Lattice lega tutto agli OKR. 15Five gira attorno ai moduli 1:1. Officevibe è solo una macchina da survey. Pulse è l'unico tool people-first dove il sorgente, la roadmap, il changelog e i prezzi sono tutti pubblici — ",
      link: "vedi il confronto onesto",
      after: ".",
    },
    source: "Sorgente",
    values: [
      {
        k: "Aperto",
        p: "Il sorgente completo è su GitHub sotto FSL-1.1-MIT, che diventa MIT tra due anni. Leggi ogni riga, eseguilo sul tuo hardware, forkalo se ti deludiamo. Nessuna feature nascosta dietro una chiamata commerciale.",
        cta: "LICENSE · self-host · contribuisci",
      },
      {
        k: "Trasparente",
        p: "Roadmap pubblica. Changelog pubblico. Prezzi pubblici. Commit pubblici. Pubblichiamo cosa spediamo, cosa rompiamo e perché scegliamo quello che scegliamo. Performance in pubblico, errori inclusi.",
        cta: "Roadmap · changelog · commit",
      },
      {
        k: "Tuo",
        p: "I tuoi dati, la tua infra, libero di andartene. Self-host su Docker, Helm o Terraform. Esporta tutto in un formato pulito, sempre, senza chiedere. Lasciare Pulse è facile — è proprio quello che vogliamo.",
        cta: "Self-host · export · niente lock-in",
      },
      {
        k: "Costruito da chi lo usa",
        p: "La roadmap è plasmata dalle pull request, non dai product manager. Pulse copre la metà 'persone' dell'HR — status, crescita, kudos, benessere — e sta deliberatamente fuori dall'altra metà. I maintainer lo usano su se stessi ogni giorno; ogni release esce perché serviva davvero a qualcuno.",
        cta: "Superfici · PR · feedback board",
      },
    ],
  },

  concepts: {
    eyebrow: "Cosa crediamo",
    titleBefore: "Quattro impegni.",
    titleItalic: "Non",
    titleAfter: "negoziabili.",
    items: [
      {
        k: "Aperto",
        d: "L'intera piattaforma è su GitHub sotto Functional Source License (FSL-1.1-MIT, che diventa MIT dopo due anni). Leggi il codice, eseguilo da solo, forkalo se ti deludiamo. I tuoi dati HR e il software che li gestisce non devono essere una scatola nera.",
      },
      {
        k: "Trasparente",
        d: "Roadmap, changelog, prezzi, limiti, policy di sicurezza, schema della telemetria — tutto pubblico. Non nascondiamo cosa fa il prodotto dietro una chiamata commerciale. Non recitiamo la trasparenza; rilasciamo con la porta aperta.",
      },
      {
        k: "Tuo",
        d: "Self-host sulla tua macchina se vuoi. Esporta tutto in un formato pulito, quando vuoi, senza chiedere. Nessun formato binario proprietario, nessuna frizione contrattuale all'uscita. Il segnale più forte che stiamo facendo bene è che lasciare Pulse è facile.",
      },
      {
        k: "Costruito da chi lo usa",
        d: "La roadmap è plasmata dalle pull request, non dai product manager. I maintainer usano Pulse per il proprio lavoro ogni giorno. 'Richiesta di feature' e 'pull request' sono due strade per la stessa roadmap, entrambe a pieno titolo.",
      },
    ],
  },

  features: {
    eyebrow: "Cosa c'è dentro",
    title: "Otto superfici. Una sensazione: essere visti.",
    subtitle:
      "Pulse è ristretto di proposito. Ogni superficie parla di come sta una persona — cosa fa, cosa celebra, dove è sotto pressione. Paghe, timesheet e allocazione dei progetti vivono negli strumenti costruiti per loro. Lì non competiamo.",
    items: [
      {
        icon: "MessageSquare",
        title: "Status Log",
        body: "Standup asincrono per iscritto. Tre righe a testa, feed pubblico del team, recap manager-safe del sentiment — la chat completa resta col dipendente. Niente meeting, niente AI, niente thread di chat.",
      },
      {
        icon: "Trophy",
        title: "Crescita",
        body: "Obiettivi, sfide, percorsi di skill e kudos in un'unica vista. Segnale continuo, non review annuali. Lo score nasce da cosa fanno le persone, non da un manager che riempie un form.",
      },
      {
        icon: "Gift",
        title: "Kudos",
        body: "Riconoscimento peer-to-peer con motivazione. Coin tra colleghi, coriandoli all'invio, classifiche che si resettano settimana, mese e anno. Vive dentro Growth.",
      },
      {
        icon: "Sparkles",
        title: "Moments",
        body: "Compleanni, anniversari e ticker dei kudos in un feed continuo. La memoria del team, su schermo.",
      },
      {
        icon: "Gauge",
        title: "Check-in del carico",
        body: "Un tocco ogni venerdì — leggero / bilanciato / pesante / sovraccarico. Sparkline a 8 settimane. Il tuo manager vede il trend, non le risposte singole. Ore e allocazione vivono nello strumento dedicato.",
      },
      {
        icon: "Calendar",
        title: "Diario di riposo",
        body: "Registro personale dei giorni che hai preso. Nessuna approvazione, nessuno stato in attesa — lo segni, è segnato. Il saldo è solo tuo, per il tuo registro.",
      },
      {
        icon: "Heart",
        title: "Pulse",
        body: "Heatmap settimanale anonima del vibe. Si mostra solo se rispondono almeno tre persone. Dentro Status Log, così resta parte del discorso, non un sondaggio temuto.",
      },
      {
        icon: "BarChart3",
        title: "People Insights",
        body: "Engagement, sentiment, volume di kudos, trend di crescita, vibe del Pulse nel tempo. Report su come stanno le persone — non sul cost per hire o sul margine.",
      },
    ],
  },

  labs: {
    eyebrow: "Labs · già disponibile",
    title: "Quattro scommesse vinte.",
    subtitle:
      "Labs è dove rilasciamo le cose sperimentali. Ogni team su Pulse le riceve di default — niente liste d'attesa, niente upsell, niente paywall \"enterprise tier\".",
    badgeNew: "NEW",
    items: [
      {
        icon: "MessageSquare",
        kind: "Status Log",
        tag: "Standup",
        body: "Standup asincrono per iscritto. Tre righe a testa, feed pubblico del team, recap manager-safe con dimensioni di sentiment. Niente call, niente AI, niente chat.",
      },
      {
        icon: "Gift",
        kind: "Kudos",
        tag: "Riconoscimento",
        body: "Coin peer-to-peer con una motivazione, coriandoli inclusi. Classifiche settimanali, mensili e annuali. Vive dentro Growth.",
      },
      {
        icon: "Gauge",
        kind: "Check-in del carico",
        tag: "Carico",
        body: "Un tocco a settimana — leggero / bilanciato / pesante / sovraccarico. Una sparkline a 8 settimane di come sta il team. Niente allocazioni, niente percentuali, niente ore.",
      },
      {
        icon: "Sparkles",
        kind: "Moments",
        tag: "Rituale",
        body: "Compleanni, anniversari di lavoro e ticker dei kudos in un unico feed continuo. La memoria del team, su schermo.",
      },
    ],
  },

  roles: {
    eyebrow: "Ogni persona, una superficie",
    titleLine1: "La stessa app,",
    titleItalic: "cinque",
    titleAfter: "punti di vista.",
    subtitle:
      "Ogni persona ha i propri gruppi nella sidebar, la propria vista di default e il proprio set di shortcut. Tema chiaro o scuro oggi; le palette per ruolo sono in roadmap. I CFO non vedono gli standup di sprint.",
    items: [
      { k: "Employee", d: "Posta lo status, manda kudos, fai il check-in del carico, segna i giorni off." },
      { k: "Manager", d: "Leggi il recap del sentiment, nota il sovraccarico, celebra le vittorie. Mai la chat raw." },
      { k: "HR", d: "Segnale di engagement, conversazioni di crescita, trend di benessere. Niente fogli di calcolo." },
      { k: "Admin", d: "Moduli, setup delle persona, audit log — e il \"View as\"." },
      { k: "Finance", d: "Risposta onesta: non è per te. Tieniti il tuo gestionale paghe." },
    ],
  },

  // Social proof, versione onesta. Non fabbrichiamo testimonial (vedi foundation.md §9).
  // Queste sono dichiarazioni di direzione dai maintainer su quello che sentiamo
  // da issue, PR e primi self-host. Da sostituire con citazioni utente reali appena arrivano.
  testimonials: {
    ratingLabel: "Costruito in pubblico",
    items: [
      {
        who: "Davide Ghiotto",
        role: "Maintainer · github.com/davide97g",
        body: "Usiamo Pulse ogni giorno per le nostre ore e le nostre ferie. Se una frizione dura più di una settimana, la risolviamo. La roadmap è la lista delle cose in cui noi — o chi lo gira sulla propria infra — siamo davvero inciampati.",
      },
      {
        who: "Feedback board pubblica",
        role: "github.com/davide97g/pulse-hr/discussions",
        body: "Ogni richiesta di feature è pubblica. Ogni PR viene revisionata in pubblico. Il changelog si legge perché dietro ogni riga vedi il commit. È così che l'HR software andava costruito fin dall'inizio.",
      },
      {
        who: "Il bottone Export",
        role: "I tuoi dati, la tua infra",
        body: "Cliccalo. Ti porti tutto. Portalo altrove se vuoi. Il test onesto di una piattaforma aperta è se puoi andartene — non quello che dice la presentazione commerciale.",
      },
    ],
  },

  faq: {
    eyebrow: "Le domande che ci fanno spesso",
    titleBefore: "Domande,",
    titleItalic: "risposte",
    titleAfter: ".",
    items: [
      {
        q: "Pulse sostituisce il mio HRIS?",
        a: "No, ed è proprio il senso. Pulse è la metà 'persone' dell'HR — status, crescita, kudos, benessere. Paghe, rilevazione ore, recruiting, allocazione progetti e firma documenti vivono negli strumenti costruiti per loro. Pulse gira a fianco al tuo HRIS, non al suo posto. Molti team usano Pulse insieme a BambooHR, Personio, Rippling o Factorial; l'ambito ristretto è quello che lo rende davvero usabile.",
      },
      {
        q: "Come è fatto il pricing di Pulse HR?",
        a: "Per dipendente attivo, al mese. Un unico piano trasparente con tutte le funzionalità incluse — nessun blocco 'parla col sales', niente upsell per le feature Labs, niente add-on per l'accesso API o SSO. Gratis per i primi 5 dipendenti attivi, per sempre. Con fatturazione annuale 15% di sconto.",
      },
      {
        q: "È SOC 2 / GDPR compliant?",
        a: "Risposta onesta: siamo GDPR-compliant by design — residenza dati in UE (Francoforte, Dublino), DPA firmato all'iscrizione, sub-processor documentati su pulsehr.it/security. SOC 2 Type II e ISO 27001 non li abbiamo ancora oggi; sono sulla roadmap quando il parco clienti lo richiederà. Se hai bisogno di un'attestazione prima che l'abbiamo, la strada onesta è il self-host — rimani dentro il tuo perimetro di audit. Preferiamo dirtelo che fingere.",
      },
      {
        q: "C'è un'API?",
        a: "Sì — un'API REST completa, webhook su ogni evento (employee.created, leave.approved, ecc.) e SDK mantenuti per TypeScript, Python e Go. Le chiavi API hanno scope per ambiente con permessi granulari. Spec OpenAPI completa su pulsehr.it/docs/api. Il rate limit è 1.000 richieste/minuto sul tier standard.",
      },
      {
        q: "Pulse è davvero open source?",
        a: "Sì. Il sorgente completo è su GitHub all'indirizzo github.com/davide97g/pulse-hr sotto Functional Source License (FSL-1.1-MIT). Puoi leggere ogni riga, eseguirlo da solo, forkarlo e contribuire. Due anni dopo ogni release la licenza si converte automaticamente in MIT pura — completamente permissiva. La finestra FSL blocca la rivendita come SaaS closed-source concorrente in quei due anni, ma qualsiasi uso non concorrente (deployment interno, consulenza, fork, contributi) è libero dal primo giorno. Vedi LICENSE e NOTICE nel repo per i termini esatti.",
      },
      {
        q: "Possiamo fare self-hosting?",
        a: "Sì. L'intera piattaforma è un monorepo Bun che puoi clonare ed eseguire. I deployment self-hosted su Docker o Kubernetes sono supportati con un Helm chart di riferimento e moduli Terraform. Tutto gira sulla tua infrastruttura. Parti da github.com/davide97g/pulse-hr.",
      },
      {
        q: "Come funziona la command bar (⌘J)?",
        a: "La command bar esegue un parser di intent locale sui dati del tuo tenant — nessuna chiamata LLM, nessun round-trip di rete, nessun training cross-tenant. Scrivi frasi naturali come 'manda kudos a Marta per la demo' o 'segna un giorno off venerdì scorso', e un'euristica deterministica le mappa in azioni eseguibili con i tuoi permessi. Funzionando nel browser, va anche offline come parte della PWA. Esporremo un server MCP per workflow di agenti esterni in una release futura; per ora l'etichetta onesta è: una command bar keyboard-first, senza AI nel loop.",
      },
      {
        q: "Pulse funziona offline?",
        a: "L'intera superficie si installa come PWA su macOS, Windows, iOS e Android. Viste recenti, bozze di status log e bozze di kudos continuano a funzionare offline e sincronizzano appena torni online — niente schermate 'loading…' in aeroporto o in una sala riunioni senza segnale. Le azioni distruttive richiedono una connessione attiva e vengono messe in coda se offline, così niente parte due volte per sbaglio.",
      },
    ],
  },

  team: {
    titleBefore: "Le persone dietro",
    titleItalic: "Pulse",
    titleAfter: ".",
    subtitle:
      "Due sviluppatori frontend-fluent che costruiscono in pubblico. L'agent-driven development è il motivo per cui siamo solo in due — non lo vendiamo, rilasciamo solo più di quanto due persone dovrebbero permettersi. Il prodotto è il protagonista; noi firmiamo i commit.",
    items: [
      { n: "Davide Ghiotto", r: "Maintainer", bio: "Frontend-fluent, stanco del software HR. github.com/davide97g · linkedin.com/in/davide-ghiotto" },
      { n: "Niccolò Naso", r: "Maintainer", bio: "Co-maintainer frontend-fluent. github.com/LordNik10 · linkedin.com/in/niccolò-naso-888039178" },
      { n: "Tu?", r: "Aperti ai contributor", bio: "La roadmap è plasmata dalle pull request. Se il codebase fixa una frizione che vivi ogni settimana, manda una PR — ogni contributor viene creditato nel changelog." },
    ],
  },

  useCases: {
    title: {
      before: "Costruito per come",
      italic: "il tuo",
      after: "team lavora davvero.",
    },
    items: [
      { k: "Team stanchi delle review annuali", d: "Segnale continuo — kudos, status, sentiment — invece di una calibrazione da 90 minuti una volta l'anno." },
      { k: "Team distribuiti stufi dei meeting", d: "Standup async per iscritto, check-in del carico in un tocco. Smetti di programmare meeting per parlare di tempo." },
      { k: "Founder che vogliono sapere che le persone stanno bene", d: "Vibe del Pulse, segnale di sovraccarico, volume di kudos. Leggilo in 30 secondi, agisci prima che qualcuno se ne vada." },
    ],
  },

  changelog: {
    eyebrow: "Rilasciato di recente",
    titleBefore: "Un changelog",
    titleItalic: "che vale la pena leggere",
    titleAfter: ".",
    full: "Changelog completo",
    items: [
      { d: "09 mag", t: "Tema scuro forzato su auth + schermate feedback", k: "Polish" },
      { d: "06 mag", t: "Sidebar collassata, tema e \"View as\" persistono al refresh", k: "Workspace" },
      { d: "30 apr", t: "Flow di Welcome semplificato — nome + dimensione, niente scelta ruolo", k: "Onboarding" },
      { d: "24 apr", t: "\"View as\" in topbar — anteprima dell'app come un'altra persona", k: "Workspace" },
      { d: "19 apr", t: "Sidebar riorganizzata: Dashboard / People / Time / Work / Other", k: "Navigazione" },
    ],
  },

  keyboard: {
    eyebrow: "Keyboard-first",
    titleLine1: "Due tasti.",
    titleItalic: "Tutto",
    titleAfter: ".",
    body: {
      key1Before:
        " apre una palette fuzzy — salta a qualsiasi collega, pagina o impostazione.",
      key2Before:
        " apre la command bar — scrivi quello che vuoi in linguaggio naturale, un parser locale lo traduce in un'azione eseguibile. Nessuna chiamata LLM, nessun training cross-tenant, funziona offline.",
    },
    chipDictate: "Detta ovunque",
    chipShortcuts: "40+ shortcut",
    chipOffline: "Funziona offline",
    panelTitle: "Command bar",
    commandExample: "manda kudos a Marta per la demo, grazie",
    parsedLabel: "Parsed · intent=send-kudos · confidence 0.96",
    parsedSentence: {
      log: "Manda ",
      to: " a ",
      on: " per ",
      tagged: ", nota ",
      end: ".",
    },
    tagFeature: "demo",
    actionConfirm: "Conferma",
    actionEdit: "Modifica dettagli",
    actionOpen: "Apri Kudos",
    footerLocal: "parser locale · nessuna chiamata di rete",
    footerOffline: "funziona offline",
  },

  productPreview: {
    title: {
      before: "Vedilo",
      italic: "in movimento",
      after: ".",
    },
    openApp: "Apri l'app completa",
    tabs: [
      { k: "dashboard", l: "Dashboard", body: "Streak dello status, kudos della settimana, growth score, vibe del Pulse, prossimi Moments. L'unico pannello che il tuo team apre alle 9." },
      { k: "log", l: "Status Log", body: "Tre righe a testa, feed pubblico, recap manager-safe del sentiment. La chat raw resta col dipendente." },
    ],
    bullets: [
      "Check-in del carico in un tocco",
      "Navigazione keyboard-first (⌘K)",
      "Recap manager-safe del sentiment",
      "Self-host o hosted — scegli tu",
    ],
    mockDashboard: {
      pending: "Off registrati",
      headcount: "Kudos · sett.",
      overtime: "Growth score",
      rows: [
        { n: "Marta E.", t: "Kudos · Ace della demo", s: "approved" },
        { n: "Tom B.", t: "Status · 3 di fila", s: "approved" },
        { n: "Noah W.", t: "Permesso · 1g off", s: "approved" },
      ],
      statusPending: "fresco",
      statusApproved: "registrato",
    },
    mockTime: {
      activeClock: "Questa settimana",
      project: "Carico · bilanciato ⛅",
      stopCta: "Apri Status Log",
    },
  },

  cta: {
    titleLine1: "Software per le",
    titleItalic: "persone",
    titleAfter: ", non per i numeri.",
    body: "Gratis per sempre in self-host. Gratis per i primi 5 dipendenti su Pulse hosted. Nessuna carta di credito. Nessuna chiamata commerciale per vedere il prodotto. Esporta tutto con un click — sempre.",
    primary: "Prova gratis",
    secondary: "Leggi il sorgente",
  },

  page404: {
    eyebrow: "Errore 404",
    titleBefore: "Pagina non",
    titleItalic: "trovata",
    titleAfter: ".",
    body:
      "Hai seguito un link che non esiste più, o hai digitato l'URL a mano. Di solito la panoramica ha ciò che cercavi.",
    back: "Torna a Pulse HR",
    report: "Dicci cosa è rotto",
    title: "404 — pagina non trovata — Pulse HR",
    description:
      "La pagina richiesta non esiste. Torna alla panoramica di Pulse HR o cerca dal menu.",
  },

  indexPage: {
    title: "Pulse HR — software per le persone, non per i numeri",
  },

  productPage: {
    title: "Tour del prodotto — panoramica people-first Pulse HR",
    description:
      "Status Log, Crescita, Kudos, Moments, Pulse, check-in del carico, diario di riposo, People Insights — otto superfici, tutte su come sta il tuo team. Open source sotto FSL. Keyboard-first, self-hostabile.",
    eyebrow: "Tour del prodotto",
    titleLine1: "Otto superfici,",
    titleItalic: "una sensazione",
    titleAfter: ": essere visti.",
    body:
      "Ogni superficie parla di una persona, non di un processo. Status, kudos, crescita, riposo, carico — letti in secondi, agiti in secondi. Ore e paghe vivono negli strumenti costruiti per loro. Lì non competiamo.",
  },

  labsPage: {
    title: "Pulse Labs — status log, kudos, check-in del carico, moments",
    description:
      "Quattro feature Labs già disponibili: Status Log (standup asincrono + recap), riconoscimenti Kudos, check-in settimanale del carico e Moments. Incluse in ogni piano.",
    eyebrow: "Labs · già disponibile · incluso in ogni piano",
    titleLine1: "Le quattro feature Pulse",
    titleItalic: "che reinventano",
    titleAfter: " come un team resta in sintonia.",
    body:
      "Labs è dove rilasciamo per prime le capacità sperimentali — standup asincrono con recap manager-safe, riconoscimenti peer, check-in del carico in un tocco e un feed della memoria del team. Niente liste d'attesa, niente upsell, niente paywall enterprise-tier.",
  },

  changelogPage: {
    title: "Changelog Pulse HR — aggiornamenti prodotto e feature rilasciate",
    description:
      "Ogni aggiornamento significativo della piattaforma Pulse HR. Polish del Gantt, pulizia colori, Employee Score, tab Saturation, Command bar — in ordine cronologico inverso.",
    eyebrow: "Changelog",
    titleBefore: "Cosa abbiamo",
    titleItalic: "rilasciato",
    titleAfter: ".",
    body:
      'Solo aggiornamenti significativi — niente riempitivi tipo "versione 2.38.4 bug fix". Nuove voci arrivano ogni una o due settimane, ognuna con una nota veloce sul perché conta.',
    breadcrumb: "Changelog",
  },

  contactPage: {
    title: "Contatti — email, GitHub Discussions, segnalazioni sicurezza",
    description:
      "Un'email per ogni scopo. GitHub Discussions per tutto ciò che vuoi chiedere in pubblico. Segnalazioni di sicurezza su security@. Niente chatbot funnel, nessun form \"book a demo\" che finisce a un BDR.",
    eyebrow: "Contatti",
    titleLine1: "Un'inbox vera.",
    titleItalic: "Persone",
    titleAfter: " vere.",
    body:
      "Niente chatbot funnel, nessun form \"book a call\" che finisce a un BDR a provvigione. Un'email per ogni scopo, e la maggior parte delle conversazioni sul prodotto avviene in pubblico su GitHub. Scegli la corsia giusta.",
    askPublic: "Chiedi in pubblico.",
    whereTitle: "Dove siamo.",
    whereBody: "Team remote-first tra CET e PT.",
    hq: "Remote-first",
    berlin: "Berlino",
    sf: "San Francisco",
    slaNote:
      "Rispondiamo entro la stessa giornata lavorativa (orario ufficio CET) per vendite e richieste generali. Segnalazioni di sicurezza: entro 24h. Issue GitHub: triagate ogni giorno, senza SLA. Per qualsiasi cosa urgente e privata che non rientra nelle categorie sopra, hello@pulsehr.it funziona sempre.",
    breadcrumb: "Contatti",
    channels: [
      {
        k: "Generali & vendite",
        email: "hello@pulsehr.it",
        d: "Il catch-all. Domande sul prodotto, aiuto per la prova, come fatturiamo, se siamo adatti al tuo caso. Risponde un umano, di solito in giornata.",
      },
      {
        k: "Procurement / RFP",
        email: "sales@pulsehr.it",
        d: "DPA, questionari vendor, security review, ordini d'acquisto. Precompiliamo quelli comuni (SIG-lite, CAIQ) e li rimandiamo indietro in 24h.",
      },
      {
        k: "Segnalazioni di sicurezza",
        email: "security@pulsehr.it",
        d: "Responsible disclosure. Chiave PGP su /.well-known/security.txt. Policy completa su /security.",
      },
      {
        k: "Stampa & partnership",
        email: "press@pulsehr.it",
        d: "Giornalisti, analisti, partner di integrazione. Includi un link al calendario e saltiamo il ping-pong di email.",
      },
    ],
    other: [
      {
        k: "GitHub issues",
        d: "Bug report, richieste di feature, qualsiasi cosa che la community debba vedere. Label: bug / feature / docs / question.",
        label: "github.com/davide97g/pulse-hr/issues",
      },
      {
        k: "GitHub Discussions",
        d: "Domande aperte, idee, show-and-tell. Se non è un bug concreto, vive qui.",
        label: "github.com/davide97g/pulse-hr/discussions",
      },
    ],
  },

  pricingPage: {
    title: "Prezzi — gratis fino a 5, €6/dipendente dopo, self-host €0",
    description:
      "Un piano trasparente per dipendente attivo, al mese. Gratis per i primi 5, per sempre, con tutte le funzionalità incluse. Self-host gratis sotto FSL.",
  },

  vsPage: {
    title: "Pulse HR vs Lattice, 15Five, Officevibe — confronto onesto",
    description:
      "Confronto onesto di Pulse HR con i big dell'engagement — Lattice, 15Five, Officevibe e Culture Amp. Open source, ambito, async-first, sentiment manager-safe, prezzi — più dove ognuno di loro è genuinamente più forte.",
  },

  blogPage: {
    title: "Blog — HR open source, ops commessa, workflow agent-native",
    description:
      "Calendario editoriale a 6 mesi. Deep dive ingegneristici sullo stack HR open source, operazioni finanziarie commessa-first per società di servizi, workflow agent-native per dati HR.",
  },

  securityPage: {
    title: "Sicurezza — come Pulse HR protegge i tuoi dati",
    description:
      "SOC 2 Type II in corso, GDPR-by-design, residenza dati UE, cifratura a riposo e in transito, audit log completo, programma di responsible disclosure. Dettaglio tecnico, non una brochure.",
  },

  openSourcePage: {
    title: "Open source — Pulse HR è su GitHub sotto FSL-1.1-MIT",
    description:
      "Il sorgente completo di Pulse HR è pubblico su GitHub sotto Functional Source License (diventa MIT dopo 2 anni). Leggilo, eseguilo, forkalo, contribuisci. Self-host su Docker o Kubernetes.",
  },

  ecosystemPage: {
    title: "Ecosistema — Slack, Google Calendar, SSO, webhook, API REST",
    description:
      "Leggero by design. Notifiche Slack, sync OOO con Google Calendar, SSO via Okta/Google, più un'API REST pubblica con webhook e SDK mantenuti per TypeScript / Python / Go. Ore, paghe e progetti hanno già la loro casa — Pulse si aggancia dove aggiunge segnale.",
  },

  keyboardPage: {
    title: "Keyboard-first — ⌘K, ⌘J command bar, voce, PWA offline",
    description:
      "⌘K apre un fuzzy finder, ⌘J apre una command bar con parser di intent locale. Dettatura vocale, 40+ shortcut, funziona offline come PWA. Nessuna chiamata LLM, nessun training cross-tenant — ogni tasto resta sul tuo dispositivo.",
  },

  modulesPage: {
    title: "Cosa c'è dentro — otto superfici su come sta il tuo team",
    description:
      "Pulse è ristretto di proposito. Otto superfici — Status Log, Crescita, Kudos, Moments, check-in del carico, diario di riposo, Pulse, People Insights — tutte su una persona, non su un processo. Ore e paghe vivono negli strumenti costruiti per loro.",
  },

  roadmapPage: {
    title: "Roadmap — cosa stiamo rilasciando ora, dopo e più avanti su Pulse HR",
    description:
      "Una roadmap pubblica e onesta. Tre corsie — Ora (in lavorazione questo trimestre), Prossima (definita per il trimestre successivo), Più avanti (sul radar). Le cose già rilasciate sono nel changelog.",
  },

  stub: {
    badge: "In arrivo",
    back: "Torna a Pulse HR",
    seeOverview: "Vedi la panoramica",
    pingUs: "Scrivici di",
    privacyTitle: "Informativa privacy",
    privacyDescription:
      "Come raccogliamo, trattiamo e proteggiamo i dati personali. GDPR-compliant by design con residenza dei dati in UE. Documento completo in via di finalizzazione a cura del legale.",
    termsTitle: "Termini di servizio",
    termsDescription:
      "Master subscription agreement, acceptable use policy e addendum sul trattamento dati. Il documento completo è in via di finalizzazione e sarà pubblicato a breve.",
  },

  heroNewTags: [
    "Status Log",
    "Check-in carico",
    "Kudos",
    "Moments",
    "Open source",
  ],
};
