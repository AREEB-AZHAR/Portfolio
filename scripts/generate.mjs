import { mkdir, writeFile } from "node:fs/promises";
import { projects, capabilities } from "../src/content/projects.mjs";
import { pageTransitions } from "../src/page-transitions.mjs";

const esc = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const featured = projects.filter((p) => p.featured);
const number = (n) => String(n + 1).padStart(2, "0");
const email = "areebazhar3@gmail.com";
const routes = [
  ["about/", "Approach"],
  ["projects/", "Projects"],
  ["capabilities/", "Capabilities"],
  ["contact/", "Contact"],
];
const logo = `<svg viewBox="0 0 64 36" aria-hidden="true"><path d="M3 31 18 4l15 27M10 20h16M30 31 45 4l16 27M37 20h17"/></svg>`;
const arrow = '<span aria-hidden="true">↗</span>';
const link = (href, text, cls = "line-link", external = false) =>
  `<a class="${cls}" href="${href}"${external ? ' target="_blank" rel="noreferrer"' : ""}>${text}${arrow}</a>`;
function motif(i = 0, slug = "") {
  const drawings = {
    rustbot:
      '<path d="M190 125h260v180H300l-65 55v-55h-45zM235 180h170M235 225h110M450 210h75v175H350v-45"/><circle cx="475" cy="335" r="8"/>',
    tally:
      '<rect x="220" y="95" width="230" height="310" rx="12"/><path d="M260 150h150M260 185h100M265 340v-70h25v70m35 0V230h25v110m35 0V200h25v140M220 365h230"/>',
    gravipop:
      '<circle cx="340" cy="250" r="112"/><ellipse cx="340" cy="250" rx="190" ry="58" transform="rotate(-28 340 250)"/><circle cx="240" cy="145" r="36"/><circle cx="475" cy="330" r="55"/><circle cx="510" cy="130" r="13"/>',
    "degree-verification":
      '<path d="m200 155 65-38 65 38v75l-65 38-65-38zm0 0 65 38 65-38m-65 38v75m105-5 65-38 65 38v75l-65 38-65-38zm0 0 65 38 65-38m-65 38v75m-120-65 55 30M285 300l30 24 55-62"/>',
    cryptotrader:
      '<path d="M185 105v275h340M220 300l50-40 40 20 65-100 42 30 80-95M250 330v-95m-15 20h30v50h-30zm110-45v-95m-15 20h30v50h-30zm110 50v-95m-15 20h30v50h-30z"/>',
    bunetto:
      '<path d="M200 200h300v195H200zm-20 0 35-95h270l35 95m-290 0 20-95m40 95 8-95m52 95v-95m60 95-8-95m62 95-20-95M235 245h85v100h-85zm125 150V245h100v150"/>',
  };
  const object =
    drawings[slug] ||
    `<rect x="205" y="105" width="270" height="270" rx="${i % 2 ? 74 : 12}" transform="rotate(-30 340 240)"/><rect x="235" y="135" width="210" height="210" rx="${i % 2 ? 105 : 8}" transform="rotate(30 340 240)"/><path d="M205 240h270M340 105v270"/><circle cx="340" cy="240" r="85"/>`;
  return `<svg class="wire-motif motif-${i % 4}" viewBox="0 0 700 500" fill="none" aria-hidden="true"><path class="trace" d="M0 385C100 385 118 100 248 175S420 475 512 230 595 110 700 70"/><g class="wire-object">${object}</g></svg>`;
}
const sculpture = (label = "Sculptural AA monogram") =>
  `<div class="sculpture" role="img" aria-label="${label}"><svg class="sculpture-fallback" viewBox="0 0 700 700" aria-hidden="true"><defs><linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e4e1d9"/><stop offset=".25" stop-color="#555650"/><stop offset=".6" stop-color="#181917"/><stop offset=".8" stop-color="#85867d"/><stop offset="1" stop-color="#232420"/></linearGradient></defs><g fill="none" stroke="url(#metal)" stroke-width="39" stroke-linejoin="bevel"><path d="M120 480 280 150 440 480M190 360h180"/><path d="m270 530 160-330 160 330M340 410h180"/></g></svg></div>`;

function shell({
  title,
  description,
  content,
  file = "index.html",
  page = "home",
}) {
  const depth = file.split("/").length - 1;
  const root = depth ? "../".repeat(depth) : "./";
  const nav = routes
    .map(
      ([path, name], i) =>
        `<a href="${root}${path}"${page === path.replace("/", "") ? ' aria-current="page"' : ""}><small>${number(i)}</small><span>${name}</span>${arrow}</a>`,
    )
    .join("");
  const footer = `<footer class="site-footer${page === "home" ? " horizontal-panel" : ""}" data-section="Let’s talk" role="contentinfo"><div class="footer-intro"><h2>Let’s build<br>what comes next.</h2>${link(`${root}contact/`, "Start a conversation")}</div><div class="footer-details"><div><p class="eyebrow">Direct contact</p><a class="footer-email" href="mailto:${email}">${email}</a><p>A role, a product, a useful conversation.</p></div><div><p class="eyebrow">Continue exploring</p><nav>${routes.map(([path, name]) => `<a href="${root}${path}">${name}</a>`).join("")}</nav></div><div><p class="eyebrow">Karachi / Local time</p><time class="local-time">PKT</time></div></div><a class="footer-wordmark" href="${root}" aria-label="Areeb Azhar home">AREEB AZHAR</a><div class="footer-bottom"><a href="https://github.com/AREEB-AZHAR" target="_blank" rel="noreferrer">GitHub ↗</a><span>© ${new Date().getFullYear()} Areeb Azhar</span><a href="#main">Back to top ↑</a></div></footer>`;
  content = content.replace("<!--STORY_FOOTER-->", footer);
  return `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><style>@view-transition{navigation:auto}</style><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#090909"><meta name="description" content="${esc(description)}"><meta property="og:title" content="${esc(title)} — Areeb Azhar"><meta property="og:description" content="${esc(description)}"><meta property="og:type" content="website"><title>${esc(title)} — Areeb Azhar</title><script>try{const full=sessionStorage.getItem('portfolio-session-motion')==='full';document.documentElement.classList.add(full?'motion-full':'motion-reduced');if(full&&${page === "home"}&&matchMedia('(min-width:768px)').matches)document.documentElement.classList.add('story-horizontal')}catch{document.documentElement.classList.add('motion-reduced')}</script><link rel="icon" href="/mark.svg" type="image/svg+xml"><link rel="stylesheet" href="/style.css"><script>(${pageTransitions.toString()})();</script></head>
<body data-page="${page}"><a class="skip-link" href="#main">Skip to content</a>
<header class="site-header"><a class="brand" href="${root}" aria-label="Areeb Azhar, home">${logo}<span>Software engineering<br>Creative development</span></a><div class="header-actions"><a class="header-contact" href="${root}contact/">Let’s talk <span>↗</span></a><div class="motion-control"><button class="motion-toggle" type="button" aria-pressed="false" aria-describedby="motion-help"><span class="motion-icon" aria-hidden="true">∿</span><span class="motion-label">Animations off</span><span class="motion-info" aria-hidden="true">ⓘ</span></button><span class="motion-help" id="motion-help" role="tooltip">Turn 3D visuals and horizontal storytelling on or off. Scroll normally in either mode.</span></div><button class="menu-toggle" type="button" aria-controls="site-menu" aria-expanded="false">Menu <span class="menu-lines" aria-hidden="true"></span></button></div></header>
<dialog id="animation-gate" class="animation-gate" aria-labelledby="animation-title" aria-describedby="animation-description"><p class="eyebrow">Areeb Azhar / Your experience</p><h2 id="animation-title">A little motion.<br>Or none at all.</h2><p id="animation-description">Choose how you explore. The same projects and stories are available in both modes. You can change this anytime using “Animations” in the header.</p><div class="animation-options"><button type="button" data-motion="full"><span>Enable animations ↗</span><small>Horizontal storytelling & metallic 3D visuals</small></button><button type="button" data-motion="reduced" autofocus><span>Continue without animation →</span><small>Quiet, natural scrolling. No animated effects.</small></button></div><p class="animation-note">Your choice stays active for this browsing session.</p></dialog>
<dialog id="site-menu" class="site-menu" aria-label="Main navigation"><div class="menu-top"><a class="brand" href="${root}" aria-label="Areeb Azhar, home">${logo}</a><button class="menu-close" type="button">Close <span aria-hidden="true">×</span></button></div><p class="eyebrow">A different way through.</p><nav>${nav}</nav><div class="menu-bottom"><a href="mailto:${email}">${email}</a><a href="https://github.com/AREEB-AZHAR" target="_blank" rel="noreferrer">GitHub ↗</a><span>Karachi, Pakistan</span></div></dialog>
<main id="main">${content.replaceAll("@ROOT@", root)}</main>
${page === "home" ? "" : `<section class="footer-reel" aria-label="Contact finale"><div class="footer-viewport">${footer}</div></section>`}
<aside class="progress-rail" aria-label="Reading progress"><span class="progress-label">${page === "home" ? "Introduction" : esc(title)}</span><span>Areeb Azhar</span><span class="progress-hint">Scroll to explore —</span><span class="progress-value">00 / 100</span><div class="progress-track"><i></i></div></aside>
<script type="module" src="/main.js"></script></body></html>`;
}

function image(p, large = false) {
  const dimensions = {
    "rustbot-og.png": [1734, 907],
    "tally-ledger-512.png": [512, 512],
    "gravipop-gameplay.png": [454, 848],
    "degree-verification.png": [1920, 878],
    "crypto-dashboard.png": [1920, 1080],
    "bunetto-showcase.png": [1920, 1080],
    "connect-dots.png": [1600, 1400],
    "java-library-architecture.png": [1800, 1080],
    "amazing-giant-flowers.jpg": [1000, 3740],
  };
  const [width, height] = dimensions[p.image?.split("/").at(-1)] || [
    1600, 1000,
  ];
  return p.image
    ? `<figure class="project-figure ${p.portrait ? "portrait" : ""} ${p.imageKind === "App icon" ? "icon-art" : ""} ${large ? "large-figure" : ""}"><div class="figure-surface"><img src="/${p.image}" alt="${esc(p.alt)}" loading="lazy" decoding="async" width="${width}" height="${height}"></div><figcaption><span>${esc(p.imageKind)}</span>${large ? `<a href="@ROOT@${p.image}" target="_blank" rel="noreferrer">View full-size ↗</a>` : `<span>${esc(p.title)} / ${esc(p.period || p.type)}</span>`}</figcaption></figure>`
    : `<figure class="project-figure diagram-figure">${motif(projects.indexOf(p))}<figcaption><span>Conceptual system sketch</span><span>${esc(p.category)}</span></figcaption></figure>`;
}

function showcase(p, i) {
  return `<article class="project-scene section" data-section="${esc(p.title)}" data-project="${p.slug}"><div class="scene-kicker"><span>${number(i)} / Selected work</span><span>${esc(p.category)}</span></div><div class="project-stage">${motif(i, p.slug)}<h3 class="project-title reveal" data-project-title="${p.slug}"><a href="@ROOT@projects/${p.slug}/">${esc(p.title)}<span>.</span></a></h3><p class="project-tools">${esc(p.stack.slice(0, 4).join(" / "))}</p></div><div class="project-bottom"><p>${esc(p.line)}</p>${link(`@ROOT@projects/${p.slug}/`, "Explore project")}</div></article>`;
}

const principles = [
  [
    "Understand the system.",
    "Step back before moving forward.",
    "Start with the problem, its dependencies, and the people it needs to serve. A clear model makes the next decision easier.",
  ],
  [
    "Clarify the interaction.",
    "The details are part of the work.",
    "Layout, feedback, state, and timing shape how a product is understood. The interface should make the system easier to use.",
  ],
  [
    "Deliver the whole loop.",
    "Bring the parts back together.",
    "Connect the interface, the data, and the logic. Then check that the complete experience holds together.",
  ],
];

const certificate = `<section class="certificate-section section" id="certificate"><div class="section-label"><span>04 / Professional development</span><span>September 2026</span></div><div class="certificate-layout"><a class="certificate-preview" href="@ROOT@certificates/rust-internship-areeb-azhar.pdf" target="_blank" rel="noreferrer"><img src="/certificates/rust-internship-preview.png" width="1400" height="1082" alt="Areeb Azhar’s internship completion certificate from Hazara University and Rockstable" loading="lazy"></a><div><p class="eyebrow">9 weeks / Hybrid</p><h2>Blockchain technology.<br>Rust programming.</h2><p>A joint internship delivered by Hazara University, Mansehra, and Rockstable. Awarded in September 2026.</p><p>My internship project connected a Rust chatbot’s backend, API integrations, and responsive frontend.</p>${link("@ROOT@certificates/rust-internship-areeb-azhar.pdf", "View completion certificate", "line-link", true)}${link("@ROOT@projects/rustbot/", "Explore RustBot")}</div></div></section>`;

const homeSections = `<section class="hero-story" data-section="Introduction"><div class="hero-stage"><div class="hero-coordinate"><span>Engineering, with intention.</span><span>Karachi, PK / Available for opportunities</span></div><h1 class="hero-type"><span>FROM IDEA.</span><span>TO SYSTEM.</span><span>TO EXPERIENCE.</span></h1>${sculpture()}<div class="hero-foot"><div><p class="eyebrow">Areeb Azhar</p><p>Software engineering student.<br>Building the interface and what’s behind it.</p></div><div class="hero-shortcuts">${link("@ROOT@projects/", "Explore the work")}<a href="#introduction" class="quiet-link">Skip to introduction →</a></div><span class="hero-phase">01 / 04</span></div></div></section>
<section class="introduction section" id="introduction" data-section="Beyond the interface"><p class="eyebrow">Beyond the interface</p><h2 class="display reveal">Logic underneath.<br><span class="muted">Purpose in every</span><br>interaction.</h2><div class="intro-bottom"><p class="eyebrow">Areeb Azhar / BS Software Engineering</p><p class="lede">I build across web, mobile, Rust, blockchain, and games. Different technologies. The same intention: make the whole product work, and make it make sense.</p>${link("@ROOT@about/", "A way of working")}</div></section>
<section class="approach-story" data-section="A way of working">${principles.map(([title, short, text], i) => `<article class="principle-scene section" data-section="A way of working / ${number(i)}">${i === 0 ? '<div class="approach-visual"><div class="sculpture" data-variant="principles" role="img" aria-label="Metallic forms illustrating structure, interaction, and connection"></div></div>' : ""}<div class="scene-kicker"><span>${number(i)} / A way of working</span><span>${short}</span></div><div class="principle-stage">${motif(i)}<h2 class="reveal">${title}</h2></div><p class="principle-copy">${text}</p></article>`).join("")}</section>
<section class="work-intro section" id="work" data-section="Selected projects"><p class="eyebrow">From intention to implementation</p><h2 class="display reveal">Ideas,<br>put into practice.</h2><div class="split-intro"><span>06 selected projects / 2026</span><p>Different problems. Different tools.<br>A few of the things that took shape.</p></div></section>${featured.map(showcase).join("")}
<section class="capability-bridge section" data-section="Capabilities"><p class="eyebrow">Clarity through structure</p>${motif(2)}<h2 class="display reveal">Many tools.<br>One connected<br>experience.</h2><div class="bridge-bottom"><p>From a data model to an interface.<br>From an algorithm to the product around it.</p>${link("@ROOT@capabilities/", "Explore capabilities")}${link("@ROOT@projects/#archive", "The complete archive")}</div></section>`;

const home = `<section class="horizontal-story" style="--panel-count:${8 + featured.length}" aria-label="Portfolio story"><div class="horizontal-viewport"><div class="horizontal-track">${homeSections.replace(/class="(hero-story|introduction section|principle-scene section|work-intro section|project-scene section|capability-bridge section)"/g, 'class="$1 horizontal-panel"')}<!--STORY_FOOTER--></div></div></section>`;

const subhero = (label, title, desc, extra = "") =>
  `<section class="subhero section" data-section="${label}"><p class="eyebrow">${label}</p>${sculpture()}<h1 class="display">${title}</h1><div class="subhero-bottom"><p>${desc}</p>${extra || link("#story", "Follow the story")}</div></section>`;
const about =
  subhero(
    "About / A way of working",
    "SYSTEMS WITH<br>A HUMAN SIDE.",
    "Curious across the stack. Serious about the craft.",
  ) +
  `<section class="about-intro section" id="story"><div class="section-label"><span>A little context</span><span>Areeb Azhar / Karachi</span></div><h2 class="reveal">I like understanding<br>how the parts connect.</h2><div class="editorial-grid"><p>Over four years of my BS Software Engineering degree, I’ve built coursework, personal products, freelance ecommerce work, and an adaptive Unity degree project.</p><p>That range taught me to learn unfamiliar tools and connect technical decisions to the people using the software. I’m interested in teams where I can contribute, learn quickly, and own a problem from model to interface.</p></div><a class="profile-reference" href="https://github.com/AREEB-AZHAR" target="_blank" rel="noreferrer"><img src="/profile-avatar.png" alt="Areeb Azhar’s GitHub profile avatar" width="64" height="64" loading="lazy"><span>Areeb Azhar<small>Four years of study & building / GitHub ↗</small></span></a></section>${principles.map(([title, short, text], i) => `<section class="approach-detail section"><div class="section-label"><span>${number(i)} / ${short}</span></div><div class="editorial-grid"><h2>${title}</h2><div><p class="lede">${text}</p><p>Working prototypes, readable code, and clear explanations are how I put this into practice.</p></div></div></section>`).join("")}${certificate}`;

const archive = projects.filter((p) => !p.featured);
const projectIndex =
  subhero(
    "Projects / A body of work",
    "IDEAS,<br>MADE REAL.",
    "The systems behind the interface. The details that make it feel right.",
    link("#selected", "Explore the work"),
  ) +
  `<section class="project-index section" id="selected"><div class="section-label"><span>The work, in view</span><span>01 — 06</span></div>${featured.map((p, i) => `<a class="project-index-row" href="@ROOT@projects/${p.slug}/"><span class="index-number">${number(i)}</span><div><p class="eyebrow">${esc(p.category)}</p><h2 data-project-title="${p.slug}">${esc(p.title)}<span>.</span></h2><p>${esc(p.line)}</p></div><span class="index-arrow" aria-hidden="true">↗</span></a>`).join("")}</section><section class="archive section" id="archive"><p class="eyebrow">The archive / Room to explore</p><h2 class="display">Small beginnings.<br>Useful detours.</h2><div class="archive-controls"><label for="project-search">Find a project <input id="project-search" type="search" placeholder="Search name, technology, or category"></label><span class="archive-count" aria-live="polite">${archive.length} projects</span></div><div class="archive-list">${archive.map((p, i) => `<article class="archive-row" data-search="${esc([p.title, p.category, p.type, ...p.stack].join(" ").toLowerCase())}"><span>${number(i + 6)}</span><div><p class="eyebrow">${esc(p.type)}</p><h3><a href="@ROOT@projects/${p.slug}/">${esc(p.title)} ↗</a></h3><p>${esc(p.summary)}</p></div><span>${esc(p.stack.slice(0, 2).join(" / "))}</span>${p.repo ? link(p.repo, "Source", "source-link", true) : '<span class="source-link">Local project</span>'}</article>`).join("")}</div><p class="archive-empty" hidden>No projects match. Try another name or technology.</p><div class="legacy-links"><p class="eyebrow">Earlier versions & supporting work</p>${link("@ROOT@projects/cryptotrader/#earlier-versions", "CryptoDashboard")}${link("@ROOT@projects/tally/#earlier-versions", "Balance Tracker / Balance Sheet")}${link("@ROOT@projects/unity-minigame-suite/#tooling", "Unity asset tooling")}${link("@ROOT@projects/bunetto/#food-storefront", "Food ordering storefront")}</div></section>`;

const skills =
  subhero(
    "Capabilities / Points of connection",
    "BUILT ACROSS<br>THE STACK.",
    "Tools learned through working projects, coursework, and experimentation.",
  ) +
  `<section class="capabilities-list section" id="story">${capabilities.map(([title, desc, stack, related], i) => `<article class="capability-row"><span class="index-number">${number(i)}</span><div><h2>${title}</h2><p class="capability-desc">${desc}</p></div><div><p>${stack}</p><div class="related-links">${related.map((slug) => link(`@ROOT@projects/${slug}/`, projects.find((p) => p.slug === slug).title)).join("")}</div></div></article>`).join("")}</section>`;
const contact = `<section class="contact-hero section" data-section="Contact"><p class="eyebrow">A conversation starts here</p><h1 class="display">WHAT COULD<br>WE BUILD?</h1><div class="subhero-bottom"><p>A software engineering opportunity.<br>A product idea. A problem worth solving.</p><div><p class="eyebrow">Or write directly</p><a class="contact-email" href="mailto:${email}">${email}</a></div></div></section><section class="composer-section section"><div><p class="eyebrow">Put it into words</p><h2>The first<br>few words.</h2><p>This opens a draft in your email application.</p></div><form class="contact-form"><label><span>01 / What should I call you?</span><input name="name" required autocomplete="name" placeholder="Your name" maxlength="100"></label><label><span>02 / Where can I reach you?</span><input name="email" type="email" required autocomplete="email" placeholder="you@example.com" maxlength="254"></label><label><span>03 / What’s on your mind?</span><textarea name="message" required rows="4" placeholder="A little context is enough." maxlength="5000"></textarea></label><button class="line-link" type="submit">Compose email ${arrow}</button><p class="form-status" role="status"></p></form></section>`;

function detail(p, i) {
  const next = projects[(i + 1) % projects.length];
  const source = p.repo
    ? link(p.repo, "View repository", "line-link", true)
    : '<span class="eyebrow">Local project / Source not published</span>';
  return `<section class="case-hero section" data-section="${esc(p.title)}"><div class="section-label"><span>Projects / ${number(i)}</span><span>${esc(p.category)}</span>${link("@ROOT@projects/", "Back to projects", "quiet-link")}</div>${motif(i)}<h1 data-project-title="${p.slug}">${esc(p.title)}<span>.</span></h1><div class="case-hero-bottom"><a class="quiet-link" href="#story">Read the story ↓</a><p>${esc(p.line)}</p></div></section><section class="case-context section"><p class="eyebrow">Project context</p><dl><div><dt>Project</dt><dd>${esc(p.type)}</dd></div><div><dt>Role</dt><dd>${esc(p.role)}</dd></div><div><dt>Tools</dt><dd>${p.stack.map(esc).join(" / ")}</dd></div>${p.period ? `<div><dt>Period</dt><dd>${esc(p.period)}</dd></div>` : ""}</dl><div class="case-links">${source}${p.live ? link(p.live, "Visit project", "line-link", true) : ""}</div></section><section class="story-section section" id="story"><div class="section-label"><span>01 / The starting point</span></div><div class="editorial-grid"><h2>${esc(p.line)}</h2><div><p class="lede">${esc(p.challenge)}</p><p>${esc(p.summary)}</p></div></div></section><section class="case-gallery section">${image(p, true)}</section><section class="story-section section"><div class="section-label"><span>02 / The product in practice</span></div><div class="editorial-grid"><h2>The parts,<br>working together.</h2><p class="lede">${esc(p.built)}</p></div><ol class="flow-diagram" aria-label="Project workflow">${p.flow.map((step, n) => `<li><span>${number(n)}</span><p>${esc(step)}</p><b aria-hidden="true">→</b></li>`).join("")}</ol></section><section class="story-section section"><div class="section-label"><span>03 / A closer reading</span></div><div class="editorial-grid"><h2>Decisions beneath<br>the surface.</h2><p class="lede">${esc(p.decisions)}</p></div></section>${(p.sections || []).map((s) => `<section class="story-section section" id="${s.id}"><div class="editorial-grid"><h2>${esc(s.title)}</h2><div><p class="lede">${esc(s.text)}</p>${s.repo ? link(s.repo, "Explore source", "line-link", true) : ""}${s.certificate ? link("@ROOT@certificates/rust-internship-areeb-azhar.pdf", "View internship certificate", "line-link", true) : ""}</div></div></section>`).join("")}<section class="story-section case-outcome section"><div class="section-label"><span>04 / Where it stands</span></div><div class="editorial-grid"><h2>What took shape.</h2><p class="lede">${esc(p.outcome)}</p></div></section><section class="next-project section"><div class="section-label"><span>Next project</span>${link("@ROOT@projects/", "All projects", "quiet-link")}</div><a href="@ROOT@projects/${next.slug}/"><h2>${esc(next.title)} ${arrow}</h2><p>${esc(next.line)}</p></a></section>`;
}

const pages = [
  [
    "index.html",
    "Software engineering & creative development",
    "Areeb Azhar builds software across Rust, web, mobile, blockchain, and games.",
    home,
    "home",
  ],
  [
    "about/index.html",
    "About & approach",
    "Areeb Azhar’s engineering approach, education, and Rust internship certification.",
    about,
    "about",
  ],
  [
    "projects/index.html",
    "Projects",
    "Explore software projects, technical case studies, coursework, and experiments by Areeb Azhar.",
    projectIndex,
    "projects",
  ],
  [
    "capabilities/index.html",
    "Capabilities",
    "Project-based capabilities across frontend, backend, mobile, games, blockchain, and tooling.",
    skills,
    "capabilities",
  ],
  [
    "contact/index.html",
    "Contact",
    "Contact Areeb Azhar about software engineering opportunities and product ideas.",
    contact,
    "contact",
  ],
  ...projects.map((p, i) => [
    `projects/${p.slug}/index.html`,
    p.title,
    p.summary,
    detail(p, i),
    "project",
  ]),
];
for (const [file, title, description, content, page] of pages) {
  await mkdir(
    new URL(
      `../${file.substring(0, file.lastIndexOf("/") + 1)}`,
      import.meta.url,
    ),
    { recursive: true },
  );
  await writeFile(
    new URL(`../${file}`, import.meta.url),
    shell({ title, description, content, file, page }),
  );
}
console.log(
  `Generated ${pages.length} static pages from ${projects.length} canonical projects.`,
);
