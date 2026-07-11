const menuButton = document.querySelector('.menu-button');
const mobileNav = document.querySelector('.mobile-nav');

// Responsive ambient background. Kept deliberately lightweight so the
// animation supports the content instead of becoming the content.
const ambientCanvas = document.querySelector('#ambient-canvas');
const ambientContext = ambientCanvas?.getContext('2d', { alpha: true });
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
let ambientNodes = [];
let ambientFrame = 0;
let ambientFrameHandle = 0;
let ambientWidth = 0;
let ambientHeight = 0;
let ambientDpr = 1;
let ambientRunning = false;
const pointer = { x: 0, y: 0, active: false };

function nodeCountForWidth(width) {
  if (reduceMotion.matches) return Math.max(10, Math.round(width / 95));
  if (width < 520) return 20;
  if (width < 900) return 32;
  return Math.min(58, Math.round(width / 28));
}

function makeAmbientNode() {
  const palette = ['255,92,53', '38,101,255', '216,255,62', '23,25,22'];
  return {
    x: Math.random() * ambientWidth,
    y: Math.random() * ambientHeight,
    vx: (Math.random() - .5) * .32,
    vy: (Math.random() - .5) * .32,
    radius: Math.random() * 1.8 + .7,
    color: palette[Math.floor(Math.random() * palette.length)],
    phase: Math.random() * Math.PI * 2,
  };
}

function resizeAmbientCanvas() {
  if (!ambientCanvas || !ambientContext) return;
  ambientWidth = window.innerWidth;
  ambientHeight = window.innerHeight;
  ambientDpr = Math.min(window.devicePixelRatio || 1, 1.75);
  ambientCanvas.width = Math.round(ambientWidth * ambientDpr);
  ambientCanvas.height = Math.round(ambientHeight * ambientDpr);
  ambientCanvas.style.width = `${ambientWidth}px`;
  ambientCanvas.style.height = `${ambientHeight}px`;
  ambientContext.setTransform(ambientDpr, 0, 0, ambientDpr, 0, 0);

  const count = nodeCountForWidth(ambientWidth);
  ambientNodes = Array.from({ length: count }, makeAmbientNode);
  drawAmbientFrame(true);
}

function drawAmbientFrame(still = false) {
  if (!ambientContext) return;
  ambientContext.clearRect(0, 0, ambientWidth, ambientHeight);
  const connectionDistance = ambientWidth < 600 ? 112 : 152;

  ambientNodes.forEach((node, index) => {
    if (!still && !reduceMotion.matches) {
      const drift = Math.sin(ambientFrame * .008 + node.phase) * .035;
      node.x += node.vx + drift;
      node.y += node.vy + Math.cos(ambientFrame * .007 + node.phase) * .025;

      if (pointer.active) {
        const dx = pointer.x - node.x;
        const dy = pointer.y - node.y;
        const distance = Math.hypot(dx, dy);
        if (distance < 190 && distance > 0) {
          node.x -= (dx / distance) * .18;
          node.y -= (dy / distance) * .18;
        }
      }

      if (node.x < -20) node.x = ambientWidth + 20;
      if (node.x > ambientWidth + 20) node.x = -20;
      if (node.y < -20) node.y = ambientHeight + 20;
      if (node.y > ambientHeight + 20) node.y = -20;
    }

    for (let otherIndex = index + 1; otherIndex < ambientNodes.length; otherIndex += 1) {
      const other = ambientNodes[otherIndex];
      const distance = Math.hypot(node.x - other.x, node.y - other.y);
      if (distance < connectionDistance) {
        const alpha = (1 - distance / connectionDistance) * .16;
        ambientContext.beginPath();
        ambientContext.moveTo(node.x, node.y);
        ambientContext.lineTo(other.x, other.y);
        ambientContext.strokeStyle = `rgba(23,25,22,${alpha})`;
        ambientContext.lineWidth = .7;
        ambientContext.stroke();
      }
    }

    ambientContext.beginPath();
    ambientContext.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
    ambientContext.fillStyle = `rgba(${node.color},${node.color === '23,25,22' ? .26 : .68})`;
    ambientContext.fill();
  });
}

function animateAmbient() {
  if (!ambientRunning) return;
  ambientFrame += 1;
  drawAmbientFrame();
  ambientFrameHandle = requestAnimationFrame(animateAmbient);
}

function setAmbientAnimation() {
  const shouldRun = !document.hidden && !reduceMotion.matches;
  if (shouldRun && !ambientRunning) {
    ambientRunning = true;
    ambientFrameHandle = requestAnimationFrame(animateAmbient);
  } else if (!shouldRun) {
    ambientRunning = false;
    cancelAnimationFrame(ambientFrameHandle);
    drawAmbientFrame(true);
  }
}

if (ambientCanvas && ambientContext) {
  resizeAmbientCanvas();
  setAmbientAnimation();
  window.addEventListener('resize', resizeAmbientCanvas, { passive: true });
  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = event.pointerType === 'mouse';
  }, { passive: true });
  document.addEventListener('mouseleave', () => { pointer.active = false; });
  document.addEventListener('visibilitychange', setAmbientAnimation);
  reduceMotion.addEventListener('change', () => {
    resizeAmbientCanvas();
    setAmbientAnimation();
    initialiseSectionFlips();
    initialiseTextRotators();
  });
}

// Each major section enters like a numbered flip-board panel: it rises from
// below, hinges around its leading edge, and settles into the document plane.
const flipSections = [...document.querySelectorAll('.flip-section')];
let flipObserver;

function initialiseSectionFlips() {
  flipObserver?.disconnect();

  if (reduceMotion.matches) {
    flipSections.forEach((section) => section.classList.add('flip-ready', 'flip-visible'));
    return;
  }

  flipSections.forEach((section) => {
    section.classList.add('flip-ready');
    section.classList.remove('flip-visible');
  });

  flipObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('flip-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: .01,
    rootMargin: '0px 0px -18% 0px',
  });

  flipSections.forEach((section) => flipObserver.observe(section));
}

requestAnimationFrame(initialiseSectionFlips);

// Rotating copy uses a reserved block height, so the animation adds energy
// without causing layout shift. It pauses in background tabs and for users who
// prefer reduced motion.
const textRotators = [...document.querySelectorAll('[data-rotate]')];
let rotatorIntervals = [];
let rotatorTimeouts = new Set();

function clearTextRotatorTimers() {
  rotatorIntervals.forEach((timer) => clearInterval(timer));
  rotatorTimeouts.forEach((timer) => clearTimeout(timer));
  rotatorIntervals = [];
  rotatorTimeouts.clear();
}

function initialiseTextRotators() {
  clearTextRotatorTimers();
  textRotators.forEach((rotator) => rotator.classList.remove('is-changing', 'is-arriving'));
  if (reduceMotion.matches) return;

  textRotators.forEach((rotator, rotatorIndex) => {
    const words = rotator.dataset.rotate.split('|').map((word) => word.trim()).filter(Boolean);
    const text = rotator.querySelector('span');
    if (!text || words.length < 2) return;

    let wordIndex = Math.max(0, words.indexOf(text.textContent.trim()));
    const interval = setInterval(() => {
      if (document.hidden || rotator.classList.contains('is-changing')) return;
      rotator.classList.add('is-changing');

      const swapTimer = setTimeout(() => {
        rotatorTimeouts.delete(swapTimer);
        wordIndex = (wordIndex + 1) % words.length;
        text.textContent = words[wordIndex];
        rotator.classList.remove('is-changing');
        rotator.classList.add('is-arriving');

        const settleTimer = setTimeout(() => {
          rotatorTimeouts.delete(settleTimer);
          rotator.classList.remove('is-arriving');
        }, 540);
        rotatorTimeouts.add(settleTimer);
      }, 285);
      rotatorTimeouts.add(swapTimer);
    }, 3200 + (rotatorIndex * 480));

    rotatorIntervals.push(interval);
  });
}

initialiseTextRotators();

// A lightweight scroll UI keeps orientation clear: progress is continuous,
// while the HUD and navigation update only when the active section changes.
const readingProgress = document.querySelector('.reading-progress span');
const sectionHud = document.querySelector('.section-hud');
const sectionHudNumber = sectionHud?.querySelector('.section-hud-number');
const sectionHudLabel = sectionHud?.querySelector('.section-hud-copy strong');
const navigationLinks = [...document.querySelectorAll('.desktop-nav a')];
let activeSectionNumber = '';
let scrollUiFrame = 0;
let hudUpdateTimer = 0;

function updateScrollUi() {
  scrollUiFrame = 0;
  const scrollRange = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, window.scrollY / scrollRange));
  if (readingProgress) readingProgress.style.transform = `scaleX(${progress})`;

  const activationLine = window.innerHeight * .44;
  let activeSection = flipSections[0];
  flipSections.forEach((section) => {
    if (section.getBoundingClientRect().top <= activationLine) activeSection = section;
  });

  const number = activeSection?.dataset.sectionNumber || '01';
  if (number === activeSectionNumber) return;
  activeSectionNumber = number;

  if (sectionHud && sectionHudNumber && sectionHudLabel) {
    sectionHud.classList.add('is-updating');
    clearTimeout(hudUpdateTimer);
    hudUpdateTimer = setTimeout(() => {
      sectionHudNumber.textContent = number;
      sectionHudLabel.textContent = activeSection.dataset.sectionLabel;
      sectionHud.classList.remove('is-updating');
    }, 110);
  }

  const navSection = activeSection.classList.contains('archive') ? 'work' : activeSection.id;
  navigationLinks.forEach((link) => {
    const isActive = link.getAttribute('href') === `#${navSection}`;
    link.classList.toggle('is-active', isActive);
    if (isActive) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
}

function scheduleScrollUiUpdate() {
  if (scrollUiFrame) return;
  scrollUiFrame = requestAnimationFrame(updateScrollUi);
}

window.addEventListener('scroll', scheduleScrollUiUpdate, { passive: true });
window.addEventListener('resize', scheduleScrollUiUpdate, { passive: true });
scheduleScrollUiUpdate();

// Pointer-positioned light adds material depth without moving card geometry.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.project').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const bounds = card.getBoundingClientRect();
      card.style.setProperty('--spot-x', `${event.clientX - bounds.left}px`);
      card.style.setProperty('--spot-y', `${event.clientY - bounds.top}px`);
    }, { passive: true });
  });
}

function closeMenu() {
  if (!menuButton || !mobileNav) return;
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menu';
  mobileNav.hidden = true;
  document.body.classList.remove('menu-open');
}

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.textContent = isOpen ? 'Menu' : 'Close';
  mobileNav.hidden = isOpen;
  document.body.classList.toggle('menu-open', !isOpen);
});

mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

const filters = [...document.querySelectorAll('.filter')];
const featuredProjects = [...document.querySelectorAll('.project[data-category]')];

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const target = filter.dataset.filter;

    filters.forEach((item) => {
      const active = item === filter;
      item.classList.toggle('active', active);
      item.setAttribute('aria-pressed', String(active));
    });

    featuredProjects.forEach((project) => {
      const categories = project.dataset.category.split(' ');
      project.hidden = target !== 'all' && !categories.includes(target);
    });
  });
});

const caseStudies = {
  degree: {
    number: '01',
    type: 'Distributed systems · Academic',
    title: 'On-Chain Credential Attestation',
    summary: 'A multi-portal prototype that makes academic credentials independently verifiable while preserving a controlled, auditable issuance process.',
    challenge: 'Paper and PDF credentials are easy to alter, while central verification can be slow. The system needed distinct workflows for registrars, students, and external verifiers.',
    built: 'A Hyperledger Fabric network, Node/Express gateway, registrar issuance tools, student credential views, public document verification, QR-enabled PDFs, and a companion privacy sandbox.',
    focus: 'Permissioned ledger design, document hashing, role separation, chaincode integration, Merkle proof concepts, and deployment architecture for an AWS-hosted prototype.',
    stack: 'Hyperledger Fabric, Node.js, Express, CouchDB, Docker, JavaScript, HTML/CSS, cryptographic hashing',
  },
  unity: {
    number: '02',
    type: 'Adaptive learning · Degree project',
    title: 'NeuroPlay Game Suite',
    summary: 'A Unity learning hub with multiple short games, persistent progress, and difficulty that responds to how a player performs.',
    challenge: 'A one-size-fits-all challenge curve can frustrate or disengage learners. The experience needed predictable feedback, calm visuals, and difficulty changes that stayed understandable.',
    built: 'A home hub, game carousel, profile and progress systems, adaptive difficulty manager, and three mini-games: card matching, colour paths, and connect-the-dots.',
    focus: 'Modular C# managers, scene flow, player progress data, accessible interaction states, reusable UI assets, and game-specific result reporting.',
    stack: 'Unity, C#, adaptive logic, 2D UI, Python/Pillow asset tooling',
  },
  crypto: {
    number: '03',
    type: 'Market data · Personal',
    title: 'CryptoTrader',
    summary: 'A polished market dashboard that combines live crypto data with a risk-free paper-trading and portfolio experience.',
    challenge: 'Market interfaces need to keep high-volume information readable while handling loading states, API limits, navigation, and persisted user actions.',
    built: 'Live market summaries, detailed charts, watchlists, simulated buy/sell orders, holdings, transaction history, mobile navigation, and a timed mock authentication session.',
    focus: 'Query caching, client-side state modelling, persisted stores, responsive information density, chart integration, and error handling around third-party APIs.',
    stack: 'React 19, Vite, TanStack Query, Zustand, TradingView Lightweight Charts, Framer Motion, CoinGecko API',
  },
  finance: {
    number: '05',
    type: 'Personal finance · Mobile',
    title: 'Balance Sheet',
    summary: 'A feature-rich Flutter expense tracker designed around everyday account, budget, goal, and transaction workflows.',
    challenge: 'Personal finance data has many related states: accounts, categories, budgets, goals, balances, and recurring user preferences. The app needed to keep them coherent across screens.',
    built: 'Authentication flows, a dashboard, transaction management, category breakdowns, account wallets, savings goals, budgets, profile settings, themes, and currency controls.',
    focus: 'Cross-platform UI, local persistence, provider-based state, SQLite modelling, charts, form validation, and reusable screen structure.',
    stack: 'Flutter, Dart, Provider, SQLite, sqflite, fl_chart, shared preferences',
  },
  java: {
    number: '06',
    type: 'Software architecture · Coursework',
    title: 'DVD Library System',
    summary: 'A Java desktop library application structured to keep the interface independent from domain implementation details.',
    challenge: 'The brief required borrowing rules, inventory, members, loans, and failures without allowing the presentation layer to become tightly coupled to the domain model.',
    built: 'Film, DVD, member, and loan entities; an ILibraryService contract; a coordinating LibraryCore facade; DTO-based read models; domain-specific exceptions; and a Swing GUI.',
    focus: 'Layered architecture, dependency inversion, facade boundaries, encapsulation, guard clauses, domain exceptions, and documented UML/design artefacts.',
    stack: 'Java, Swing, interfaces, DTOs, layered architecture, UML',
  },
};

const dialog = document.querySelector('#case-dialog');
const dialogClose = dialog?.querySelector('.dialog-close');
let dialogTrigger = null;

function fillCaseStudy(key) {
  const data = caseStudies[key];
  if (!data || !dialog) return;

  const fields = {
    '#dialog-number': data.number,
    '#dialog-type': data.type,
    '#dialog-title': data.title,
    '#dialog-summary': data.summary,
    '#dialog-challenge': data.challenge,
    '#dialog-built': data.built,
    '#dialog-focus': data.focus,
    '#dialog-stack': data.stack,
  };

  Object.entries(fields).forEach(([selector, value]) => {
    const element = dialog.querySelector(selector);
    if (element) element.textContent = value;
  });
}

document.querySelectorAll('[data-project]').forEach((button) => {
  button.addEventListener('click', () => {
    fillCaseStudy(button.dataset.project);
    dialogTrigger = button;
    dialog?.showModal();
  });
});

function closeDialog() {
  dialog?.close();
}

dialogClose?.addEventListener('click', closeDialog);
dialog?.addEventListener('close', () => dialogTrigger?.focus());
dialog?.addEventListener('click', (event) => {
  if (event.target === dialog) closeDialog();
});

const copyEmail = document.querySelector('.copy-email');
copyEmail?.addEventListener('click', async () => {
  const email = copyEmail.dataset.email;
  try {
    await navigator.clipboard.writeText(email);
    copyEmail.textContent = 'Email copied ✓';
    setTimeout(() => { copyEmail.textContent = 'Copy email'; }, 1800);
  } catch {
    window.location.href = `mailto:${email}`;
  }
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px' });

document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

document.querySelector('#year').textContent = new Date().getFullYear();

function updateLocalTime() {
  const target = document.querySelector('#local-time');
  if (!target) return;
  target.textContent = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Karachi',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date()) + ' PKT';
}

updateLocalTime();
setInterval(updateLocalTime, 60_000);
