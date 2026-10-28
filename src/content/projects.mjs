const gh = (name) => `https://github.com/AREEB-AZHAR/${name}`;

export const projects = [
  {
    slug: "rustbot",
    title: "RustBot",
    category: "Rust / Full-stack",
    type: "Internship project",
    period: "2026",
    featured: true,
    line: "A conversation. Connected end to end.",
    summary:
      "A Rust chatbot connecting a local knowledge store, an HTTP backend, external APIs, and a responsive browser experience.",
    image: "projects/rustbot-og.png",
    alt: "RustBot brand artwork with a knowledge cabinet",
    imageKind: "Project artwork",
    repo: gh("RustBot"),
    stack: ["Rust", "HTTP / JSON", "JavaScript", "HTML & CSS"],
    role: "Backend, API integration & frontend",
    challenge:
      "A useful chatbot is more than a chat box. Knowledge retrieval, external data, and browser interactions need to meet at a clear, dependable interface.",
    built:
      "Built a Rust HTTP server that serves the frontend and JSON API, local knowledge matching and storage, and server-side integrations with Binance, CoinGecko, and Kraken.",
    decisions:
      "Keep external API integration behind the server. Separate the conversation interface from knowledge matching, and make the boundaries between local information and live data understandable.",
    outcome:
      "Completed during a nine-week internship. The project demonstrates a complete frontend-to-backend loop; its market-data features are informational, not a live trading service.",
    flow: [
      "Browser conversation",
      "Rust API & matching",
      "Knowledge / external data",
    ],
    sections: [
      {
        id: "internship",
        title: "Nine weeks. One connected product.",
        text: "The internship in Blockchain Technology and Rust Programming was delivered jointly by Hazara University, Mansehra, and Rockstable. The completion certificate was awarded in September 2026.",
        certificate: true,
      },
    ],
  },
  {
    slug: "tally",
    title: "Tally",
    category: "Mobile / Finance",
    type: "Personal project",
    period: "2026",
    featured: true,
    line: "Every transaction has a place.",
    summary:
      "A Flutter finance ledger that grew from a calculator project into transaction management, analytics, and synced data.",
    image: "projects/tally-ledger-512.png",
    alt: "Tally finance app icon",
    imageKind: "App icon",
    repo: gh("flutter_calculator_new"),
    stack: ["Flutter", "Dart", "SQLite", "Firebase"],
    role: "Mobile interface & application logic",
    challenge:
      "Personal finance means keeping accounts, transactions, categories, and summaries coherent without making everyday entry feel complicated.",
    built:
      "Transaction workflows, analytics, local SQLite persistence, authentication, and Firebase sync features documented in the project.",
    decisions:
      "Treat local storage as a first-class part of the mobile experience. Give entry and reporting distinct interface responsibilities, while connecting both to the same financial records.",
    outcome:
      "An evolving personal-finance application. The project records a progression from smaller calculator and balance-tracking experiments toward a broader ledger product.",
    flow: ["Record a transaction", "Store & sync", "Understand the balance"],
    sections: [
      {
        id: "earlier-versions",
        title: "An idea that kept growing.",
        text: "Earlier Balance Tracker and Balance Sheet experiments explored budgets, accounts, charts, and local persistence. They remain part of the project history rather than separate headline products.",
      },
    ],
  },
  {
    slug: "gravipop",
    title: "GraviPop",
    category: "Rust / Game development",
    type: "Personal project",
    period: "2026",
    featured: true,
    line: "A little gravity. A chain reaction.",
    summary:
      "A physics-driven cosmic merge puzzle built in Rust for desktop, Android, and web targets.",
    image: "projects/gravipop-gameplay.png",
    alt: "GraviPop gameplay with planets, score, and power-up controls",
    imageKind: "Gameplay screenshot",
    portrait: true,
    repo: gh("gravipop-mobile"),
    stack: ["Rust", "Miniquad", "Physics", "Android / Web"],
    role: "Game systems & cross-platform interaction",
    challenge:
      "A merge puzzle depends on how it feels. Input, rendering, collision behavior, and feedback have to cooperate across very different screen sizes.",
    built:
      "A Rust game with rendering, physics, input handling, cosmic game artwork, and controls for desktop and mobile targets.",
    decisions:
      "Keep the game loop separate from platform-specific input. Design the playfield and controls together so touch and pointer input share the same understandable rules.",
    outcome:
      "A playable cross-platform game project. The supplied gameplay capture shows the real desktop experience, including its scoring and power-up interface.",
    flow: ["Aim & release", "Physics & merge", "Score & progress"],
  },
  {
    slug: "degree-verification",
    title: "Degree Verification",
    category: "Blockchain / Trust systems",
    type: "Academic project",
    period: "2026",
    featured: true,
    line: "Credentials with something behind them.",
    summary:
      "A permissioned blockchain prototype for issuing and independently verifying academic credentials.",
    image: "projects/degree-verification.png",
    alt: "Degree verification web portal",
    imageKind: "Interface screenshot",
    repo: gh("Degree-blockchain"),
    stack: ["Hyperledger Fabric", "Express", "CouchDB", "Docker"],
    role: "Multi-portal system & integration",
    challenge:
      "Registrars, students, and external verifiers need different views of the same credential. Verification should not depend only on trusting a PDF.",
    built:
      "A Hyperledger Fabric network, an Express gateway, registrar issuance tools, student credential views, public verification, and a companion privacy sandbox.",
    decisions:
      "Separate the authority to issue from the ability to verify. Use document hashing and a permissioned ledger to connect a presented credential with its recorded state.",
    outcome:
      "An academic prototype exploring distributed trust, role separation, and document verification. Privacy demonstrations remain exploratory rather than production security guarantees.",
    flow: ["Registrar issues", "Ledger records", "Verifier checks"],
  },
  {
    slug: "cryptotrader",
    title: "CryptoTrader",
    category: "Web / Market data",
    type: "Personal project",
    period: "2026",
    featured: true,
    line: "Live information. Clearer decisions.",
    summary:
      "A responsive market dashboard combining live crypto data, watchlists, and a paper-trading portfolio.",
    image: "projects/crypto-dashboard.png",
    alt: "CryptoTrader market dashboard and paper portfolio",
    imageKind: "Interface screenshot",
    repo: gh("CryptoDashboard"),
    stack: ["React 19", "TanStack Query", "Zustand", "CoinGecko"],
    role: "Frontend architecture & data integration",
    challenge:
      "Market data is dense and constantly changing. Charts, loading states, rate limits, and persisted user actions all compete for attention.",
    built:
      "Market summaries, charts, watchlists, simulated orders, holdings, transaction history, responsive navigation, and local persistence.",
    decisions:
      "Separate server data caching from client portfolio state. Keep simulated trading clearly distinct from real transactions and handle third-party API failures at the interface.",
    outcome:
      "A market-data product and paper-trading simulator. Orders are simulated; the project does not execute real trades.",
    flow: ["Fetch market data", "Explore & watch", "Simulate a portfolio"],
    sections: [
      {
        id: "earlier-versions",
        title: "The dashboard underneath.",
        text: "CryptoDashboard is the repository name and earlier project identity. Its work is consolidated here as the CryptoTrader experience.",
      },
    ],
  },
  {
    slug: "bunetto",
    title: "Bunetto",
    category: "Ecommerce / Food ordering",
    type: "Web project",
    period: "2026",
    featured: true,
    line: "From the first look to the last click.",
    summary:
      "A responsive burger storefront connecting visual merchandising, product customisation, a cart, and WhatsApp order handoff.",
    image: "projects/bunetto-showcase.png",
    alt: "Bunetto storefront with Smoky Zing hero and Order Now button",
    imageKind: "Website screenshot",
    repo: gh("Bunetto"),
    stack: ["HTML", "Tailwind CSS", "JavaScript", "WhatsApp"],
    role: "Storefront design & frontend development",
    challenge:
      "A food storefront needs to feel expressive while keeping choices, quantities, and order details easy to understand on a phone.",
    built:
      "A hero carousel, categorized menu, product and deal options, a cart drawer, quantity controls, delivery or pickup selection, and formatted WhatsApp order handoff.",
    decisions:
      "Connect browsing and cart state without leaving the menu. Carry the customer’s choices into a readable message so the order handoff preserves context.",
    outcome:
      "A complete storefront interaction prototype. WhatsApp handles the order handoff; the site does not imply an integrated payment processor.",
    flow: ["Browse the menu", "Customise & add", "Hand off the order"],
    sections: [
      {
        id: "food-storefront",
        title: "Built around the menu.",
        text: "The food-ordering storefront work is retained here, including the visual menu, configurable orders, and cart interaction.",
      },
    ],
  },
];

const brief = (slug, title, category, type, summary, stack, extra = {}) => ({
  slug,
  title,
  category,
  type,
  summary,
  stack,
  line: summary,
  role: "Project design & implementation",
  challenge: summary,
  built: extra.built || summary,
  decisions:
    extra.decisions ||
    `The project explores ${stack.join(", ")} through a focused ${type.toLowerCase()} build. Its scope is kept explicit so the implementation can be assessed in context.`,
  outcome:
    extra.outcome ||
    "A learning project or prototype retained as part of the wider body of work. No production usage or performance results are claimed.",
  flow: extra.flow || [
    "Define the problem",
    "Build the system",
    "Explore the result",
  ],
  ...extra,
});

projects.push(
  brief(
    "chainshield",
    "ChainShield",
    "Blockchain / Analytics",
    "Personal project",
    "A blockchain transaction-monitoring concept for identifying suspicious and potentially fraudulent activity.",
    ["Blockchain", "Transaction analysis"],
    {
      repo: gh("ChainShield"),
      outcome:
        "An exploratory detection project. It is not presented as a guarantee that fraud can be identified or prevented.",
    },
  ),
  brief(
    "crypto-trading-bot",
    "Trading Bot Foundation",
    "Rust / Systems",
    "Local prototype",
    "Rust groundwork for backtesting and paper-trading workflows, with live trading explicitly fail-closed.",
    ["Rust", "Backtesting", "Paper trading"],
    {
      flow: ["Historical data", "Strategy evaluation", "Paper execution"],
      outcome:
        "Foundation-stage work. Live execution remains disabled; this is not a deployed trading service.",
    },
  ),
  brief(
    "unity-minigame-suite",
    "Unity Minigame Suite",
    "Games / Adaptive learning",
    "Degree project",
    "A Unity learning hub with player progress, short mini-games, and difficulty that responds to performance.",
    ["Unity", "C#", "Python / Pillow"],
    {
      repo: gh("fyp-project-2026-05-24_04-55-34"),
      image: "projects/connect-dots.png",
      alt: "Connect-the-dots asset system supporting the Unity project",
      imageKind: "Supporting asset artwork",
      built:
        "A home hub, game carousel, player progress, adaptive difficulty management, and card-matching, colour-path, and connect-the-dots mini-games.",
      sections: [
        {
          id: "tooling",
          title: "A reusable visual language.",
          text: "A regenerable Unity sprite pack provides markers, interaction states, hints, and templates. Python and Pillow support the asset-generation workflow.",
        },
      ],
    },
  ),
  brief(
    "reverse-engineering",
    "Re-engineering Coursework",
    "Software engineering",
    "Coursework",
    "A repository of software re-engineering work and supporting coursework.",
    ["Software analysis", "Documentation"],
    { repo: gh("RE-Engineering") },
  ),
  brief(
    "pakistan-studies-quiz",
    "Pakistan Studies Quiz",
    "Web / Learning",
    "Coursework",
    "A compact interactive quiz project created for coursework.",
    ["Web interfaces", "Quiz interaction"],
    { repo: gh("QuizPakistanStudies") },
  ),
  brief(
    "amazing-giant-flowers",
    "Amazing Giant Flowers",
    "Ecommerce / Shopify",
    "Freelance project",
    "A storefront for handcrafted giant floral installations, with mobile merchandising and quote-oriented shopping.",
    ["Shopify", "Liquid", "JavaScript"],
    {
      repo: gh("online-web-store-design"),
      live: "https://areeb-azhar.github.io/online-web-store-design/",
      image: "projects/amazing-giant-flowers.jpg",
      alt: "Amazing Giant Flowers storefront design",
      imageKind: "Website screenshot",
      built:
        "Custom storefront layouts, floral product presentation, responsive styling, and quote-conversion experiences.",
    },
  ),
  brief(
    "web-experiments",
    "Web Experiments",
    "Web / Interaction",
    "Personal experiments",
    "Six small personal sites exploring expressive layouts, imagery, and micro-interactions.",
    ["HTML", "CSS", "JavaScript"],
    {
      sections: [
        ["apology", "Apology", "Apology"],
        ["love-letter", "Love Letter", "love-letter-to-you"],
        [
          "a-little-something",
          "A Little Something",
          "a-little-something-just-for-you",
        ],
        ["flowers-messages", "Flowers & Messages", "flowers-messages"],
        ["flower-garden", "Flower Garden", "Flower-garden"],
        ["form", "Form", "Form"],
      ].map(([id, title, repo]) => ({
        id,
        title,
        text: "A focused personal web experiment, preserved with its own source repository.",
        repo: gh(repo),
      })),
    },
  ),
  brief(
    "portfolio-system",
    "Portfolio System",
    "Web / Creative development",
    "Personal project",
    "This project catalogue brings software work, technical explanations, and a cinematic visual identity into one place.",
    ["Vite", "JavaScript", "Three.js", "GSAP"],
    {
      repo: gh("Portfolio"),
      sections: [
        {
          id: "resume",
          title: "Career materials.",
          text: "The companion Resume repository is retained alongside the portfolio.",
          repo: gh("Resume"),
        },
      ],
      outcome:
        "A static multi-page site with a shared content manifest, accessible navigation, responsive motion, and direct project URLs.",
    },
  ),
  brief(
    "privacy-zkp-sandbox",
    "Privacy & ZKP Sandbox",
    "Cryptography / Learning",
    "Academic prototype",
    "Interactive demonstrations of commitments, nullifiers, Merkle proofs, and repeated-round PIN verification.",
    ["Web Crypto", "Merkle trees", "JavaScript"],
    {
      outcome:
        "Educational simulations of privacy concepts. They are not audited cryptographic protocols or production privacy infrastructure.",
    },
  ),
  brief(
    "market-probability-indicator",
    "Market Probability Indicator",
    "Data / Charting",
    "Personal project",
    "A charting indicator exploring volume-adaptive bias, ATR targets, fair-value gaps, liquidity zones, and signal tracking.",
    ["Pine Script v6", "Technical indicators"],
    {
      outcome:
        "An indicator experiment, not a claim of predictive accuracy or financial returns.",
    },
  ),
  brief(
    "ai-game-agents",
    "AI Game Agents",
    "AI / Algorithms",
    "Coursework",
    "Classic board-game agents exploring minimax and alpha-beta pruning through playable interfaces.",
    ["Python", "Pygame", "Search algorithms"],
    {
      built:
        "Chess, Connect Four, checkers, and tic-tac-toe experiments with decision-search logic.",
      flow: ["Read the board", "Search possible moves", "Choose an action"],
    },
  ),
  brief(
    "systems-modelling",
    "Systems Modelling Toolkit",
    "Software design / Tooling",
    "Coursework",
    "Scripts and artefacts for use-case diagrams, Gantt plans, interface prototypes, and architecture models.",
    ["Python", "Data visualisation", "UML"],
  ),
  brief(
    "dvd-library",
    "DVD Library System",
    "Java / Architecture",
    "Coursework",
    "A layered desktop library application separating the Swing interface from domain and service responsibilities.",
    ["Java", "Swing", "DTOs", "UML"],
    {
      image: "projects/java-library-architecture.png",
      alt: "Java DVD library architecture diagram",
      imageKind: "Architecture diagram",
      built:
        "Film, DVD, member, and loan entities; a service interface; a coordinating facade; DTO read models; domain exceptions; and a Swing presentation layer.",
      decisions:
        "Use explicit service contracts so the interface does not depend on the domain’s internal implementation. Model failures as domain exceptions and expose read models through DTOs.",
    },
  ),
);

export const capabilities = [
  [
    "Web & product",
    "Interfaces that make the next step clear.",
    "React, JavaScript, HTML, CSS, responsive layout, state management, REST APIs.",
    ["bunetto", "cryptotrader"],
  ],
  [
    "Mobile & games",
    "Interaction beyond a browser window.",
    "Flutter, Dart, Unity, C#, Rust game systems, adaptive gameplay, cross-platform input.",
    ["tally", "gravipop", "unity-minigame-suite"],
  ],
  [
    "Backend & data",
    "The structure behind the experience.",
    "Rust, Node.js, Express, SQLite, SQL, CouchDB, authentication flows, API integration.",
    ["rustbot", "degree-verification"],
  ],
  [
    "AI & algorithms",
    "Explore the rules. Understand the trade-offs.",
    "Python, minimax, alpha-beta pruning, search algorithms, fuzzy logic, data visualisation.",
    ["ai-game-agents"],
  ],
  [
    "Blockchain & trust",
    "Make claims independently checkable.",
    "Hyperledger Fabric, chaincode, hashing, Merkle trees, privacy simulations, Docker.",
    ["degree-verification", "privacy-zkp-sandbox"],
  ],
  [
    "Ecommerce & tooling",
    "Connect the product and the work around it.",
    "Shopify Liquid, storefront interaction, Git, documentation, architecture diagrams.",
    ["amazing-giant-flowers", "bunetto", "systems-modelling"],
  ],
];
