# Areeb Azhar — Software Engineering Portfolio

[![Live Portfolio](https://img.shields.io/badge/Live_Portfolio-Visit-d8ff3e?style=for-the-badge&labelColor=171916)](https://areeb-azhar.github.io/Portfolio/)
[![GitHub Pages](https://img.shields.io/badge/Deployed_with-GitHub_Pages-2665ff?style=for-the-badge&labelColor=171916)](https://pages.github.com/)

A responsive, interview-focused portfolio documenting three years of software engineering work across full-stack development, mobile applications, artificial intelligence, blockchain, game development, and ecommerce.

**Live site:** [areeb-azhar.github.io/Portfolio](https://areeb-azhar.github.io/Portfolio/)

## Highlights

- Six detailed featured case studies with verified project screenshots
- Ten-project archive covering coursework, personal builds, and freelance work
- Responsive animated canvas background
- Numbered flip-board section transitions
- Dynamic headline and supporting-text rotations
- Live reading progress, active-section HUD, and navigation tracking
- Filterable project gallery and accessible case-study dialogs
- Pointer-aware project lighting and layered 3D typography
- Keyboard navigation, semantic markup, and reduced-motion support
- Responsive layouts for desktop, tablet, and mobile

## Featured Work

| Project | Focus | Technologies |
| --- | --- | --- |
| On-Chain Credential Attestation | Permissioned blockchain degree verification | Hyperledger Fabric, Express, CouchDB, Docker |
| NeuroPlay Game Suite | Accessible games with adaptive difficulty | Unity, C#, Python, Pillow |
| CryptoTrader | Live market dashboard and paper trading | React, Vite, TanStack Query, Zustand |
| Amazing Giant Flowers | Custom freelance ecommerce storefront | Shopify, Liquid, JavaScript, CSS |
| Balance Sheet | Cross-platform personal finance application | Flutter, Dart, SQLite, Provider |
| DVD Library System | Layered desktop application architecture | Java, Swing, interfaces, DTOs |

## Technology

- **Core:** HTML5, CSS3, JavaScript
- **Build tooling:** Vite
- **Interaction:** Intersection Observer, Canvas API, responsive pointer events
- **Typography:** Manrope, Newsreader, DM Mono
- **Hosting:** GitHub Pages and GitHub Actions

The portfolio intentionally uses framework-free JavaScript for its interface and animation systems. This keeps the runtime small while demonstrating DOM architecture, animation lifecycle management, progressive enhancement, and accessibility handling directly.

## Run Locally

Requirements:

- Node.js 20 or newer
- npm

```bash
git clone https://github.com/AREEB-AZHAR/Portfolio.git
cd Portfolio
npm install
npm run dev
```

Vite will print the local development URL in the terminal.

### Production build

```bash
npm run build
npm run preview
```

The production output is generated in `dist/`.

## Project Structure

```text
Portfolio/
├── .github/workflows/     # GitHub Pages deployment
├── images/                # Existing portfolio imagery
├── public/projects/       # Verified project screenshots
├── index.html             # Content and semantic page structure
├── style.css              # Responsive layout and visual systems
├── main.js                # Interactions, animation, filters, and dialogs
├── vite.config.js         # Vite and GitHub Pages base path
└── package.json           # Scripts and dependencies
```

## Accessibility and Performance

- All primary navigation and project controls are keyboard accessible.
- Motion-heavy effects respect `prefers-reduced-motion`.
- Canvas density scales down on smaller displays and pauses in hidden tabs.
- Project screenshots use lazy loading.
- Dynamic copy reserves its layout space to reduce content shifting.
- Pointer effects are enabled only on devices with precise hover input.

## Deployment

Pushes to `main` trigger the workflow in `.github/workflows/deploy.yml`. The workflow installs dependencies, creates a Vite production build, uploads the resulting artifact, and deploys it to GitHub Pages.

## Contact

**Areeb Azhar** — BS Software Engineering student

- GitHub: [@AREEB-AZHAR](https://github.com/AREEB-AZHAR)
- Email: [areebazhar3@gmail.com](mailto:areebazhar3@gmail.com)

---

Designed and developed by Areeb Azhar.
