# Areeb Azhar — Software Engineering Portfolio

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Visit-d8ff3e?style=for-the-badge&labelColor=171916)](https://areeb-azhar.github.io/Portfolio/)
[![GitHub Pages](https://img.shields.io/badge/Deployed_with-GitHub_Pages-2665ff?style=for-the-badge&labelColor=171916)](https://pages.github.com/)

An interview-focused portfolio highlighting recent software projects alongside a browsable archive of coursework, freelance builds, experiments, and personal work from my BS Software Engineering degree.

**Live site:** [areeb-azhar.github.io/Portfolio](https://areeb-azhar.github.io/Portfolio/)

## Featured work

| Project | Focus | Technologies |
| --- | --- | --- |
| [RustBot](https://github.com/AREEB-AZHAR/RustBot) | Rust chatbot connecting backend, APIs, and a browser frontend; completed during a nine-week internship | Rust, HTTP/JSON APIs, HTML, CSS, JavaScript |
| [Tally](https://github.com/AREEB-AZHAR/flutter_calculator_new) | Flutter personal-finance ledger with analytics and synced data | Flutter, Dart, SQLite, Firebase |
| [GraviPop](https://github.com/AREEB-AZHAR/gravipop-mobile) | Physics-driven cross-platform merge puzzle | Rust, Miniquad, Android, Web |
| [Degree Verification](https://github.com/AREEB-AZHAR/Degree-blockchain) | Credential issuance and public verification | Hyperledger Fabric, Express, CouchDB, Docker |
| [CryptoTrader](https://github.com/AREEB-AZHAR/CryptoDashboard) | Live-market dashboard and paper-trading experience | React, Vite, TanStack Query, Zustand |
| [Bunetto Ecommerce](https://github.com/AREEB-AZHAR/Bunetto) | Burger storefront, cart, product customisation, and WhatsApp order handoff | HTML, Tailwind CSS, JavaScript |

The project archive also includes ChainShield, a Rust trading-bot foundation (backtest and paper modes; live mode remains fail-closed), coursework, freelance storefront work, personal microsites, and supporting assets. Smaller experiments are grouped so the strongest interview projects stay prominent. Repository details are taken from the project READMEs where available.

## Internship

The portfolio includes the actual [internship completion certificate](public/certificates/rust-internship-areeb-azhar.pdf) for a **nine-week hybrid internship in Blockchain Technology and Rust Programming**, jointly delivered by Hazara University, Mansehra, and Rockstable, awarded in September 2026. The card also describes the Rust chatbot project connecting its backend, API integrations, and frontend.

## Experience and interactions

- Responsive animated canvas background, with reduced-motion support
- Numbered flip-board section entrances and dynamic copy
- Filterable featured projects, repository links, and case-study dialogs
- Project archive with direct repository links
- Mobile navigation on an opaque, separately layered panel with scroll lock and keyboard dismissal
- Reading progress, active-section HUD, and pointer-aware project lighting
- Semantic structure, keyboard focus states, and responsive layouts

## Technology

- **Site:** HTML5, CSS3, framework-free JavaScript, Vite
- **Interactions:** Intersection Observer, Canvas API, native dialog, responsive pointer events
- **Typography:** Manrope, Newsreader, DM Mono
- **Hosting:** GitHub Pages and GitHub Actions

## Run locally

Requirements: Node.js 24.x and npm.

```bash
git clone https://github.com/AREEB-AZHAR/Portfolio.git
cd Portfolio
npm ci
npm run dev
```

### Production build

```bash
npm run build
npm run preview
```

Vite generates production assets in `dist/`.

## Project structure

```text
Portfolio/
├── .github/workflows/     # GitHub Pages deployment
├── images/                # Portfolio imagery
├── public/projects/       # Project artwork and screenshots
├── index.html             # Content and semantic page structure
├── style.css              # Responsive layout and visual systems
├── main.js                # Interactions, animation, filters, and dialogs
├── vite.config.js         # Vite and GitHub Pages base path
└── package.json           # Scripts and dependencies
```

## Accessibility and performance

- Navigation and project controls work with a keyboard.
- Motion effects respect `prefers-reduced-motion`; the canvas pauses in hidden tabs.
- Mobile navigation locks document scrolling while open and closes on link selection or Escape.
- Project imagery uses lazy loading and the canvas adapts its density to viewport size.

## Deployment

Vercel uses `vercel.json` to install locked dependencies with `npm ci`, build with `npm run build`, and serve `dist/` at the domain root. Import this repository into Vercel with the repository root as the project root directory. Node.js 24.x is specified in `package.json`.

Pushes to `main` also trigger `.github/workflows/deploy.yml`, which runs `npm run build:pages` to build with the `/Portfolio/` base path and deploy the artifact to GitHub Pages. For local Pages previews, run `npm run build:pages` followed by `npm run preview -- --base=/Portfolio/`.

## Contact

**Areeb Azhar** — BS Software Engineering student, Karachi, Pakistan

- GitHub: [@AREEB-AZHAR](https://github.com/AREEB-AZHAR)
- Email: [areebazhar3@gmail.com](mailto:areebazhar3@gmail.com)

---

Designed and developed by Areeb Azhar.
