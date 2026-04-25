import type { Dict } from "./en";

// Italian dictionary.
// Brand names (Pulse HR, Money, People, Work, Team Pulse, Commessa Forecast, Kudos,
// Focus Mode, Saturation), tech acronyms (API, SDK, REST, SSO, SOC 2, GDPR, HRIS,
// PWA, F24, HMRC PAYE, ISO, HIPAA, BAA, DPA, SIG-lite, CAIQ, CET, PT, BDR),
// product vendor names (Rippling, Deel, BambooHR, Slack, Google, QuickBooks, Okta,
// Stripe, GitHub, Personio, Factorial, Remote, Brex, Stripe Atlas, Figma, Linear),
// roles (CEO, COO, CFO, VP, HR, Staff Engineer) and ⌘K / ⌘J remain untranslated —
// they are accepted English or brand terms.

export const it: Dict = {
  meta: {
    tagline: "Software HR per chi odia il software HR.",
    description:
      "People ops open source per team moderni. Costruito in pubblico, dalle persone che lo usano. Money, People e Work come tre moduli componibili. Self-host sulla tua infra o hosted — niente chiamata commerciale per vedere il prodotto.",
    keywords:
      "HR open source, payroll open source, HRIS, HR self-hosted, HR modulare, API HR, webhook, commessa, keyboard-first, PWA, FSL, roadmap pubblica",
  },

  a11y: {
    skipToMain: "Vai al contenuto principale",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    pulseHomeLabel: "Home Pulse HR",
    primaryNav: "Principale",
    footer: "Piè di pagina",
    customerLogos: "Loghi clienti",
    customerTestimonials: "Testimonianze clienti",
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
      "Aperto. Trasparente. Costruito dalle persone che lo usano. Spedito da Milano, in pubblico.",
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
    body: "Il prodotto è un mock solo frontend — ogni schermata, ogni record vive nel tuo browser. Lo rilasciamo presto per capire cosa serve davvero alle persone, prima di costruire il backend. Accedi dentro l'app per lasciarci feedback che arriva diretto ai maintainer.",
    cta: "Apri la demo",
  },

  demoNotice: {
    eyebrow: "Stato attuale",
    title: {
      before: "Quello che vedi è una ",
      italic: "demo.",
      after: "",
    },
    body: "Pulse HR oggi è un mock solo frontend. Lo rilasciamo prima del backend perché chi usa software HR ogni giorno possa indicarci cosa costruire per primo. Cliccaci sopra, rompi tutto, poi raccontaci cosa manca — il feedback è l'unico pezzo collegato a un vero backend, ed è proprio quello che vogliamo sentire da te.",
    bullets: [
      {
        k: "Tutto mockato",
        v: "Ogni dipendente, commessa, busta paga e richiesta vive nel tuo browser. Niente viene inviato a un server.",
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
    eyebrow: "People ops open source per team moderni",
    titleBefore: "Software HR per chi",
    titleItalic: "odia",
    titleAfter: " il software HR",
    body: [
      "Costruito in pubblico. Plasmato dalle persone che lo usano. ",
      "Money",
      ", ",
      "People",
      " e ",
      "Work",
      " — tre moduli indipendenti che condividono un workspace, una tastiera, un'API. Sorgente su GitHub. Self-host sulla tua infra, o hosted — niente chiamata commerciale per vedere il prodotto, nessun export proprietario, nessun lock-in.",
    ],
    ctaPrimary: "Prova gratis — i tuoi dati, la tua infra",
    ctaGithub: "Leggi il sorgente",
    ctaTour: "Guarda l'app",
    chip1: "Money · People · Work — adotta ciò che serve",
    chip2: "Roadmap pubblica · changelog pubblico · prezzi pubblici",
    chip3: "Self-host su Docker / Helm / Terraform",
    newThisQuarter: "Novità di questo trimestre",
  },

  heroReel: {
    ariaLabel: "Showreel del prodotto Pulse HR",
    videoLabel: "Una giornata in Pulse — showreel animato",
    posterAlt: "Una giornata in Pulse — anteprima statica",
    caption: "Una giornata in Pulse · loop 12s",
  },

  marquee: {
    title: "Team su Pulse",
  },

  stats: {
    processed: "Commit pubblici su main",
    countries: "PR della community mergeate",
    teams: "Stelle su GitHub",
    commands: "Giorni spediti in pubblico",
  },

  whyPulse: {
    eyebrow: "Perché Pulse",
    title: {
      before: "Nessun altro vendor HR spedisce",
      italic: "apertamente",
      after: " ",
      end: ".",
    },
    subtitle: {
      before:
        "Rippling è chiuso. Deel è solo per contractor. BambooHR non ha un'API degna di questo nome. Pulse è l'unica piattaforma HR dove il sorgente, la roadmap, il changelog, gli errori e i prezzi sono tutti pubblici — ",
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
        p: "I tuoi dati, la tua infra, la tua uscita. Self-host su Docker, Helm o Terraform. Esporta tutto in un formato pulito, sempre, senza chiedere. Lasciare Pulse è facile — è il punto.",
        cta: "Self-host · export · niente lock-in",
      },
      {
        k: "Costruito da chi lo usa",
        p: "La roadmap è plasmata dalle pull request, non dai product manager. Money, People e Work sono tre moduli indipendenti — adotta uno, salta gli altri, sostituiscili quando vuoi. Ogni release esce perché serviva davvero a qualcuno.",
        cta: "Moduli · PR · feedback board",
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
        d: "Roadmap, changelog, prezzi, limiti, policy di sicurezza, schema della telemetria — tutto pubblico. Non nascondiamo cosa fa il prodotto dietro una chiamata commerciale. Non recitiamo la trasparenza; spediamo con la porta aperta.",
      },
      {
        k: "Tuo",
        d: "Self-host sulla tua macchina se vuoi. Esporta tutto in un formato pulito, quando vuoi, senza chiedere. Nessun formato binario proprietario, nessuna frizione contrattuale all'uscita. Il segnale più forte che stiamo facendo bene è che lasciare Pulse è facile.",
      },
      {
        k: "Costruito da chi lo usa",
        d: "La roadmap è plasmata dalle pull request, non dai product manager. I maintainer usano Pulse per il proprio lavoro ogni giorno. 'Richiesta di feature' e 'pull request' sono due strade per la stessa roadmap, entrambe di prima classe.",
      },
    ],
  },

  features: {
    eyebrow: "Tutto in un posto solo",
    title: "Nove prodotti che sembrano uno.",
    subtitle:
      "Ogni modulo è abbastanza profondo da sostituire uno strumento dedicato, ma tutti condividono un profilo, una ricerca, un audit log. Smetterai di cambiare tab — promesso.",
    items: [
      {
        icon: "Clock",
        title: "Presenze & rilevazione ore",
        body: "Timbra da ovunque. Traccia le ore sulle commesse (codici progetto, nel modo in cui finance li vede), non solo sull'orologio. Inserimento manuale, import, approvazioni, anomalie di straordinario — tutto in un'unica superficie.",
      },
      {
        icon: "Wallet",
        title: "Payroll senza panico",
        body: "Esegui il payroll multi-paese in pochi minuti. F24, Form 941, HMRC PAYE. Buste paga, adempimenti fiscali e scritture contabili inviati direttamente al tuo stack contabile.",
      },
      {
        icon: "Users",
        title: "People operations",
        body: "Un profilo per ogni collega. Organigramma, documenti, firme elettroniche, offboarding — niente fogli di calcolo, niente NDA persi.",
      },
      {
        icon: "Briefcase",
        title: "Recruiting & onboarding",
        body: "Pipeline kanban per i candidati, workflow di onboarding automatici nel momento in cui qualcuno firma.",
      },
      {
        icon: "BarChart3",
        title: "Report che tutti leggono",
        body: "Headcount, turnover, cost per hire, assenteismo — export in PDF/CSV o invio al BI con un click.",
      },
      {
        icon: "Plug",
        title: "Integrazioni & API",
        body: "Slack, Google, QuickBooks, Okta, Stripe. E dove non arriviamo noi, arrivano la nostra API e i webhook.",
      },
      {
        icon: "Gauge",
        title: "Saturazione & margini",
        body: "Utilizzo aziendale, bench settimanale, margine blended, progetti a rischio. Una lettura live se l'azienda è sovra- o sottovenduta.",
      },
      {
        icon: "Sparkles",
        title: "Command bar (⌘J)",
        body: "Scrivi quello che vuoi — 'registra 4h su NOV-07', 'approva la spesa di Aisha', 'prenota ferie venerdì prossimo'. Un parser di intent locale traduce frasi naturali in azioni eseguibili. Nessuna chiamata LLM, nessun dato che esce dal tuo tenant.",
      },
      {
        icon: "Trophy",
        title: "Crescita & riconoscimenti",
        body: "XP, kudos coin, classifiche, podi settimanali. Dati di engagement che HR e manager leggono davvero, non un gadget feel-good.",
      },
    ],
  },

  labs: {
    eyebrow: "Labs · già disponibile",
    title: "Cinque scommesse vinte.",
    subtitle:
      "Labs è dove rilasciamo le cose sperimentali. Ogni team su Pulse le riceve di default — niente liste d'attesa, niente upsell, niente paywall \"enterprise tier\".",
    badgeNew: "NEW",
    items: [
      {
        icon: "Heart",
        kind: "Team Pulse",
        tag: "Segnale",
        body: "Vibe check anonimi + heatmap settimanale. Vedi il sentiment prima che emerga in un 1:1.",
      },
      {
        icon: "TrendingUp",
        kind: "Commessa Forecast",
        tag: "Scenari",
        body: "Slider di scenario sopra il burn del progetto. 'E se aggiungo un designer?' risposto in millisecondi.",
      },
      {
        icon: "Gift",
        kind: "Kudos",
        tag: "Riconoscimento",
        body: "Coin peer-to-peer con una motivazione, coriandoli inclusi. Le classifiche si resettano settimanale, mensile e annuale.",
      },
      {
        icon: "Target",
        kind: "Focus Mode",
        tag: "Profondità",
        body: "Timer deep-work che declina automaticamente le riunioni, aggiorna lo stato e registra la sessione nel timesheet.",
      },
      {
        icon: "Gauge",
        kind: "Saturation",
        tag: "Carico",
        body: "Heatmap di utilizzo, scatter costo-vs-valore, tab margine. Chi sta spingendo, cosa rende in €/h.",
      },
    ],
  },

  roles: {
    eyebrow: "Ogni persona, una superficie",
    titleLine1: "La stessa app,",
    titleItalic: "cinque",
    titleAfter: "punti di vista.",
    subtitle:
      "I temi per ruolo non sono cosmetica. Ogni persona ha la sua palette, la sua vista di default e il suo set di shortcut. Gli engineer non vedono le bozze di payroll. I CFO non vedono gli standup di sprint.",
    items: [
      { k: "Employee", d: "Accento lime. Timbra, ferie, kudos, focus." },
      { k: "Manager", d: "Tono ambra. Approvazioni, carico team, autorità kudos." },
      { k: "HR", d: "Corallo. People ops, onboarding, anomalie." },
      { k: "Admin", d: "Ciano elettrico. Integrazioni, API, audit." },
      { k: "Finance", d: "Violetto. Payroll, margini, forecast." },
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
        body: "Usiamo Pulse ogni giorno per le nostre ore e le nostre ferie. Se una frizione dura più di una settimana, la fixiamo. La roadmap è la lista delle cose in cui noi — o chi lo tiene sulla propria infra — siamo inciampati davvero.",
      },
      {
        who: "Feedback board pubblica",
        role: "github.com/davide97g/pulse-hr/discussions",
        body: "Ogni richiesta di feature è pubblica. Ogni PR viene revisionata in pubblico. Il changelog si legge perché dietro ogni riga vedi il commit. È come l'HR software doveva essere costruito fin dall'inizio.",
      },
      {
        who: "Il bottone Export",
        role: "I tuoi dati, la tua infra",
        body: "Cliccalo. Ti porti tutto. Portalo altrove se vuoi. Il test onesto di una piattaforma aperta è se puoi andartene — non quello che dice la slide commerciale.",
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
        q: "Posso importare i dati dal mio attuale strumento HR?",
        a: "Sì. Forniamo importer one-click per BambooHR, Personio, Rippling, Deel e Factorial, oltre a un importer CSV generico con mapping delle colonne per tutto il resto. L'importer esegue prima un dry-run così puoi correggere le righe sbagliate prima di committare, e preserva gli ID dei dipendenti in modo che le integrazioni continuino a funzionare. La maggior parte dei team migra un dataset completo — dipendenti, storico payroll, saldi ferie, documenti — in meno di un'ora.",
      },
      {
        q: "Come è fatto il pricing di Pulse HR?",
        a: "Per dipendente attivo, al mese. Un unico piano trasparente con tutte le funzionalità incluse — niente 'parla col sales per il payroll', niente upsell per le feature Labs, niente add-on per l'accesso API o SSO. Gratis per i primi 5 dipendenti attivi, per sempre. I contractor hanno prezzi diversi, max $4 per contractor attivo al mese. Con fatturazione annuale 15% di sconto.",
      },
      {
        q: "Quali paesi supporta il payroll?",
        a: "Eseguiamo nativamente il payroll in US, UK, Italia, Spagna, Francia, Germania, Irlanda e Paesi Bassi — inclusi tutti gli adempimenti fiscali (F24, Form 941, HMRC PAYE, Modelo 111, URSSAF, Lohnsteuer) e la reportistica obbligatoria. Per ogni altro paese ci integriamo con Deel e Remote come rails per contractor, e con Employer of Record locali dove serve un'assunzione full.",
      },
      {
        q: "È SOC 2 / GDPR compliant?",
        a: "Risposta onesta: siamo GDPR-compliant by design — residenza dati in UE (Francoforte, Dublino, Milano), DPA firmato all'iscrizione, sub-processor documentati su pulsehr.it/security. SOC 2 Type II e ISO 27001 non sono ancora in mano oggi; sono sulla roadmap quando il parco clienti lo richiederà. Se hai bisogno di un'attestazione prima che l'abbiamo, la strada onesta è il self-host — rimani dentro il tuo perimetro di audit. Preferiamo dirtelo che fingere.",
      },
      {
        q: "C'è un'API?",
        a: "Sì — un'API REST completa, webhook su ogni evento (employee.created, leave.approved, payslip.finalised, ecc.) e SDK mantenuti per TypeScript, Python e Go. Le chiavi API sono scoped per ambiente con permessi granulari. Spec OpenAPI completa su pulsehr.it/docs/api. Il rate limit è 1.000 richieste/minuto sul tier standard.",
      },
      {
        q: "Pulse è davvero open source?",
        a: "Sì. Il sorgente completo è su GitHub all'indirizzo github.com/davide97g/pulse-hr sotto Functional Source License (FSL-1.1-MIT). Puoi leggere ogni riga, eseguirlo da solo, forkarlo e contribuire. Due anni dopo ogni release la licenza si converte automaticamente in MIT pura — completamente permissiva. La finestra FSL blocca la rivendita come SaaS closed-source concorrente in quei due anni, ma qualsiasi uso non concorrente (deployment interno, consulenza, fork, contributi) è libero dal primo giorno. Vedi LICENSE e NOTICE nel repo per i termini esatti.",
      },
      {
        q: "Possiamo fare self-hosting?",
        a: "Sì. L'intera piattaforma è un monorepo Bun che puoi clonare ed eseguire. I deployment self-hosted su Docker o Kubernetes sono supportati con un Helm chart di riferimento e moduli Terraform. I connettori di adempimento payroll restano gestiti da Pulse (altrimenti serve l'integrazione con le authority fiscali), ma tutto il resto gira sulla tua infrastruttura. Parti da github.com/davide97g/pulse-hr.",
      },
      {
        q: "Come funziona la command bar (⌘J)?",
        a: "La command bar esegue un parser di intent locale sui dati del tuo tenant — nessuna chiamata LLM, nessun round-trip di rete, nessun training cross-tenant. Scrivi frasi naturali come 'registra 4h su NOV-07 ieri' o 'approva la spesa di Aisha', e un'euristica deterministica le mappa in azioni eseguibili con i tuoi permessi. Funzionando nel browser, va anche offline come parte della PWA. Esporremo un server MCP per veri workflow agentic in una release futura; per ora l'etichetta onesta è: una command bar keyboard-first, non un AI copilot.",
      },
      {
        q: "Pulse funziona offline?",
        a: "L'intera superficie si installa come PWA su macOS, Windows, iOS e Android. Viste recenti, timesheet e bozze di kudos continuano a funzionare offline e sincronizzano appena torni online — niente schermate 'loading…' in aeroporto o nella sala riunioni in cantina. I run payroll e altre azioni distruttive richiedono una connessione attiva e vengono messe in coda se offline, così non paghi mai qualcuno due volte per sbaglio.",
      },
    ],
  },

  team: {
    titleBefore: "Le persone dietro",
    titleItalic: "Pulse",
    titleAfter: ".",
    subtitle:
      "Due sviluppatori frontend-fluent che costruiscono in pubblico, da Milano. L'agent-driven development è il motivo per cui siamo solo in due — non lo vendiamo, spediamo solo più di quanto il nostro headcount dovrebbe permettere. Il prodotto è il protagonista; noi firmiamo i commit.",
    items: [
      { n: "Davide Ghiotto", r: "Maintainer · Milano", bio: "Frontend-fluent, stanco del software HR. github.com/davide97g · linkedin.com/in/davide-ghiotto" },
      { n: "Niccolò Naso", r: "Maintainer · Milano", bio: "Co-maintainer frontend-fluent. github.com/LordNik10 · linkedin.com/in/niccolò-naso-888039178" },
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
      { k: "Agenzie & consulenze", d: "Fattura per codice progetto (commessa), traccia l'utilizzo, chiudi il bilancio senza fogli di calcolo." },
      { k: "Startup prodotto", d: "Onboarda da una mail di candidate-accepted con un click. Equity, offerte, laptop — on rails." },
      { k: "Scale-up (50-500)", d: "Payroll multi-entità, catene di approvazione che rispecchiano la tua org, report che il tuo CFO aprirà davvero." },
    ],
  },

  changelog: {
    eyebrow: "Rilasciato di recente",
    titleBefore: "Un changelog",
    titleItalic: "che vale leggere",
    titleAfter: ".",
    full: "Changelog completo",
    items: [
      { d: "19 apr", t: "Righe Gantt più alte + hover ricco", k: "Polish" },
      { d: "18 apr", t: "Pulizia colori in tutta l'app", k: "Design" },
      { d: "14 apr", t: "Hover card avatar + Employee Score", k: "People" },
      { d: "09 apr", t: "Tab Saturation + vista Insights", k: "Labs" },
      { d: "02 apr", t: "Commessa Forecast con scenari AI", k: "Labs" },
      { d: "28 mar", t: "Command bar ⌘J con azioni eseguibili", k: "Tastiera" },
    ],
  },

  keyboard: {
    eyebrow: "Keyboard-first",
    titleLine1: "Due tasti.",
    titleItalic: "Tutto",
    titleAfter: ".",
    body: {
      key1Before:
        " apre una palette fuzzy — salta a qualsiasi dipendente, progetto, documento o impostazione.",
      key2Before:
        " apre la command bar — scrivi quello che vuoi in linguaggio naturale, un parser locale lo traduce in un'azione eseguibile. Nessuna chiamata LLM, nessun training cross-tenant, funziona offline.",
    },
    chipDictate: "Detta ovunque",
    chipShortcuts: "40+ shortcut",
    chipOffline: "Funziona offline",
    panelTitle: "Command bar",
    commandExample: "registra 4h su NOV-2025-07 ieri, lavoro su feature",
    parsedLabel: "Parsed · intent=log-hours · confidence 0.94",
    parsedSentence: {
      log: "Registra ",
      to: " su ",
      on: " il ",
      tagged: ", tag ",
      end: ".",
    },
    tagFeature: "feature",
    actionConfirm: "Conferma",
    actionEdit: "Modifica dettagli",
    actionOpen: "Apri timesheet",
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
      { k: "dashboard", l: "Dashboard", body: "Approvazioni, alert, presenze e trend. L'unico pannello che il tuo team HR apre alle 9." },
      { k: "time", l: "Ore & commesse", body: "Registra ore su qualsiasi commessa. Burn di budget, redditività per cliente, export in CSV." },
      { k: "payroll", l: "Payroll", body: "Preview delle buste paga prima di lanciare, splitting dipendenti/contractor, F24 con un click." },
    ],
    bullets: [
      "Approvazioni in un click",
      "Navigazione keyboard-first (⌘K)",
      "Audit trail completo",
      "Export in CSV / PDF / API",
    ],
    mockDashboard: {
      pending: "In attesa",
      headcount: "Headcount",
      overtime: "Straordinari",
      rows: [
        { n: "Marcus R.", t: "Ferie · 5g", s: "pending" },
        { n: "Tom B.", t: "Malattia · 3g", s: "approved" },
        { n: "Noah W.", t: "Permesso · 1g", s: "pending" },
      ],
      statusPending: "in attesa",
      statusApproved: "approvato",
    },
    mockTime: {
      activeClock: "Timbratura attiva",
      project: "ACM-2025-01 · Rebuild piattaforma",
      stopCta: "Ferma & registra ore",
    },
    mockPayroll: {
      nextRun: "Prossimo run · Aprile 2025",
      employees: "12 dipendenti · programmato 30 apr",
      rows: ["F24 (Italia)", "Form 941 (US)", "HMRC PAYE (UK)"],
      pending: "in attesa",
      filed: "inviato",
    },
  },

  cta: {
    titleLine1: "Software HR per chi",
    titleItalic: "odia",
    titleAfter: " il software HR.",
    body: "Gratis per sempre in self-host. Gratis per i primi 5 dipendenti su Pulse hosted. Nessuna carta di credito. Nessuna chiamata commerciale per vedere il prodotto. Importa in un'ora, esporta con un click — sempre.",
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
    title: "Pulse HR — software HR per chi odia il software HR",
  },

  productPage: {
    title: "Tour del prodotto — panoramica piattaforma Pulse HR",
    description:
      "Tre moduli indipendenti — Money, People e Work — che condividono un workspace, una tastiera, un'API. Open source sotto FSL. Keyboard-first, a tema per ruolo, multi-paese.",
    eyebrow: "Tour del prodotto",
    titleLine1: "Nove prodotti,",
    titleItalic: "un workspace",
    titleAfter: ".",
    body:
      "Ogni modulo è abbastanza profondo da sostituire uno strumento dedicato — e condividono un profilo, una ricerca, un audit log, un'API. Adotta Money, People e Work in modo indipendente, o tutti e tre insieme.",
  },

  labsPage: {
    title: "Pulse Labs — forecast, kudos, focus e tool di pulse",
    description:
      "Cinque feature Labs già disponibili: sentiment di Team Pulse, Commessa Forecast con scenari, riconoscimenti Kudos, Focus Mode per il deep work e utilizzo Saturation. Incluse in ogni piano.",
    eyebrow: "Labs · già disponibile · incluso in ogni piano",
    titleLine1: "Le cinque feature Pulse",
    titleItalic: "che reinventano",
    titleAfter: " il software HR.",
    body:
      "Labs è dove spediamo prima le capacità sperimentali — forecast AI, heatmap di sentiment, riconoscimenti peer, automazione deep-work e insight live di utilizzo. Niente liste d'attesa, niente upsell, niente paywall enterprise-tier.",
  },

  changelogPage: {
    title: "Changelog Pulse HR — aggiornamenti prodotto e feature rilasciate",
    description:
      "Ogni aggiornamento significativo della piattaforma Pulse HR. Polish del Gantt, pulizia colori, Employee Score, tab Saturation, Commessa Forecast, Command bar — in ordine cronologico inverso.",
    eyebrow: "Changelog",
    titleBefore: "Cosa è stato",
    titleItalic: "spedito",
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
    titleLine1: "Una inbox vera.",
    titleItalic: "Persone",
    titleAfter: " vere.",
    body:
      "Niente chatbot funnel, nessun form \"book a call\" che finisce a un BDR a provvigione. Un'email per ogni scopo, e la maggior parte delle conversazioni sul prodotto avviene in pubblico su GitHub. Scegli la corsia giusta.",
    askPublic: "Chiedi in pubblico.",
    whereTitle: "Dove siamo.",
    whereBody: "HQ a Milano, team remote-first tra CET e PT.",
    hq: "Milano (HQ)",
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
        d: "Giornalisti, analisti, partner di integrazione. Includi un link calendario e saltiamo il ping-pong di email.",
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

  stub: {
    badge: "In arrivo",
    back: "Torna a Pulse HR",
    seeOverview: "Vedi la panoramica",
    pingUs: "Scrivici di",
    privacyTitle: "Informativa privacy",
    privacyDescription:
      "Come raccogliamo, trattiamo e proteggiamo i dati personali. GDPR-compliant by design con residenza dei dati in UE. Documento completo in via di finalizzazione dal legale.",
    termsTitle: "Termini di servizio",
    termsDescription:
      "Master subscription agreement, acceptable use policy e addendum sul trattamento dati. Il documento completo è in via di finalizzazione e sarà pubblicato a breve.",
  },

  heroNewTags: [
    "Command bar ⌘J",
    "Commessa Forecast",
    "Saturation",
    "Team Pulse",
    "Kudos",
    "Focus Mode",
    "Open source",
  ],
};
