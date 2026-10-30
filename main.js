import { createHorizontalStory } from "./src/horizontal.js";

const root = document.documentElement;
const media = matchMedia("(prefers-reduced-motion: reduce)");
let sessionChoice;
try {
  sessionChoice = sessionStorage.getItem("portfolio-session-motion");
} catch {
  /* Optional storage. */
}
let reduced = sessionChoice !== "full";
const story = createHorizontalStory(
  document.querySelector(".horizontal-story"),
);
const motionToggle = document.querySelector(".motion-toggle");
const gate = document.querySelector("#animation-gate");
const instances = new Map();
const pending = new Set();
let modulePromise;
let lastInput = performance.now();
let idleTimer;

// GPU setup is optional and postponed while visitors are actively scrolling.
// The static artwork is always available; scrolling never awaits WebGL.
async function loadVisibleSculptures() {
  if (reduced || document.hidden || gate.open) return;
  if (performance.now() - lastInput < 350) {
    queueSculptures();
    return;
  }
  for (const host of document.querySelectorAll(".sculpture")) {
    const rect = host.getBoundingClientRect();
    if (
      rect.right < 0 ||
      rect.left > innerWidth ||
      rect.bottom < 0 ||
      rect.top > innerHeight ||
      !rect.width ||
      !rect.height ||
      instances.has(host) ||
      pending.has(host)
    )
      continue;
    pending.add(host);
    try {
      modulePromise ||= import("./src/sculpture.js");
      const module = await modulePromise;
      if (reduced || performance.now() - lastInput < 300) {
        pending.delete(host);
        queueSculptures();
        return;
      }
      const instance = await module.createSculpture(host);
      instances.set(host, instance);
      instance?.setReduced(reduced);
    } catch {
      instances.set(host, null);
    }
    pending.delete(host);
    queueSculptures();
    return;
  }
}
function queueSculptures() {
  clearTimeout(idleTimer);
  if (!reduced)
    idleTimer = setTimeout(() => {
      if ("requestIdleCallback" in window)
        requestIdleCallback(loadVisibleSculptures, { timeout: 1500 });
      else loadVisibleSculptures();
    }, 450);
}
function setMotion(value, preserve = true) {
  reduced = value !== "full";
  story?.setEnabled(!reduced, preserve);
  root.classList.toggle("motion-reduced", reduced);
  root.classList.toggle("motion-full", !reduced);
  motionToggle.setAttribute("aria-pressed", String(!reduced));
  motionToggle.setAttribute(
    "aria-label",
    reduced ? "Enable animations" : "Disable animations",
  );
  motionToggle.querySelector(".motion-label").textContent = reduced
    ? "Animations off"
    : "Animations on";
  instances.forEach((instance) => instance?.setReduced(reduced));
  if (reduced) clearTimeout(idleTimer);
  else queueSculptures();
  schedule();
}
function chooseMotion(value) {
  const firstChoice = !sessionChoice;
  sessionChoice = value;
  try {
    sessionStorage.setItem("portfolio-session-motion", value);
    localStorage.setItem("portfolio-motion", value);
  } catch {
    /* The choice still works without storage. */
  }
  if (gate.open) gate.close();
  document.body.classList.remove("choosing-motion");
  setMotion(value);
  if (firstChoice) story?.followHash();
  motionToggle.focus({ preventScroll: true });
}
motionToggle.addEventListener("click", () =>
  chooseMotion(reduced ? "full" : "reduced"),
);
gate
  .querySelectorAll("[data-motion]")
  .forEach((button) =>
    button.addEventListener("click", () => chooseMotion(button.dataset.motion)),
  );
gate.addEventListener("cancel", (event) => {
  event.preventDefault();
  chooseMotion("reduced");
});
if (media.matches)
  gate.querySelector('[data-motion="reduced"] small').textContent =
    "Recommended by your device’s reduced-motion setting.";
media.addEventListener("change", (event) => {
  if (event.matches) chooseMotion("reduced");
});

const menu = document.querySelector("#site-menu");
const menuToggle = document.querySelector(".menu-toggle");
let menuScroll = 0;
function restoreMenu() {
  if (menu.open) return;
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  window.scrollTo({ top: menuScroll, behavior: "instant" });
  menuToggle.focus({ preventScroll: true });
}
function closeMenu() {
  if (!menu.open) return;
  menu.close();
  restoreMenu();
}
menuToggle.addEventListener("click", () => {
  menuScroll = scrollY;
  menu.showModal();
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
});
document.querySelector(".menu-close").addEventListener("click", closeMenu);
menu.addEventListener("click", (event) => {
  if (event.target.closest("nav a")) closeMenu();
});
menu.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeMenu();
});
menu.addEventListener("close", restoreMenu);

const rail = document.querySelector(".progress-rail");
const sections = [...document.querySelectorAll("[data-section]")];
let frame = 0;
function scrollUI() {
  frame = 0;
  const activeStory = story?.update();
  const range = root.scrollHeight - innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  rail.querySelector(".progress-track i").style.transform =
    `scaleX(${progress})`;
  rail.querySelector(".progress-value").textContent =
    `${String(Math.round(progress * 100)).padStart(2, "0")} / 100`;
  const active = sections
    .filter((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.top <= innerHeight * 0.5 &&
        rect.bottom > 0 &&
        rect.left > -innerWidth * 0.5 &&
        rect.left < innerWidth * 0.5
      );
    })
    .at(-1);
  rail.querySelector(".progress-label").textContent =
    activeStory || active?.dataset.section || document.title.split(" — ")[0];
  rail.querySelector(".progress-hint").textContent =
    !reduced && story
      ? "Scroll down · Story moves right →"
      : "Scroll to explore —";
  const hero = document.querySelector(".hero-story");
  if (hero) {
    const heroProgress = Number(
      hero.querySelector(".sculpture").dataset.sceneProgress || 0,
    );
    document.querySelector(".hero-phase").textContent =
      `0${Math.min(4, Math.floor(heroProgress * 4) + 1)} / 04`;
  }
  queueSculptures();
}
function schedule() {
  if (!frame) frame = requestAnimationFrame(scrollUI);
}
window.addEventListener(
  "scroll",
  () => {
    lastInput = performance.now();
    schedule();
  },
  { passive: true },
);
window.addEventListener(
  "wheel",
  () => {
    lastInput = performance.now();
  },
  { passive: true },
);
window.addEventListener(
  "touchmove",
  () => {
    lastInput = performance.now();
  },
  { passive: true },
);
window.addEventListener("resize", schedule, { passive: true });
setMotion(reduced ? "reduced" : "full", false);
if (!sessionChoice) {
  document.body.classList.add("choosing-motion");
  gate.showModal();
}
const reveals = new IntersectionObserver(
  (entries) =>
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("is-revealed");
    }),
  { threshold: 0.1 },
);
document.querySelectorAll(".reveal").forEach((el) => reveals.observe(el));

function updateTime() {
  document.querySelectorAll(".local-time").forEach((el) => {
    el.textContent = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Karachi",
      hour12: false,
    }).format(new Date());
  });
}
updateTime();
setInterval(updateTime, 60000);
document
  .querySelector("#project-search")
  ?.addEventListener("input", (event) => {
    const search = event.target.value.trim().toLowerCase();
    let count = 0;
    document.querySelectorAll(".archive-row").forEach((row) => {
      row.hidden = !row.dataset.search.includes(search);
      if (!row.hidden) count++;
    });
    document.querySelector(".archive-count").textContent =
      `${count} project${count === 1 ? "" : "s"}`;
    document.querySelector(".archive-empty").hidden = count > 0;
  });
document.querySelector(".contact-form")?.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  if (!data.get("name").trim() || !data.get("message").trim()) {
    form.querySelector(".form-status").textContent =
      "Please add your name and a little context before composing your email.";
    return;
  }
  const subject = encodeURIComponent(
    `Portfolio enquiry from ${data.get("name").trim()}`,
  );
  const body = encodeURIComponent(
    `${data.get("message").trim()}\n\nFrom: ${data.get("name").trim()}\nReply to: ${data.get("email").trim()}`,
  );
  window.location.href = `mailto:areebazhar3@gmail.com?subject=${subject}&body=${body}`;
  form.querySelector(".form-status").textContent =
    "Your email application will open with a draft. You can review it before sending.";
});
window.addEventListener("pagehide", () =>
  instances.forEach((instance) => instance?.pause()),
);
window.addEventListener("pageshow", () => {
  instances.forEach((instance) => instance?.resume());
  schedule();
});
