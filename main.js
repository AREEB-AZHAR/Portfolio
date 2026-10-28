import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

gsap.registerPlugin(ScrollTrigger);
const root = document.documentElement;
const media = matchMedia("(prefers-reduced-motion: reduce)");
let preference;
try {
  preference = localStorage.getItem("portfolio-motion");
} catch {
  /* Storage is optional. */
}
let reduced = preference ? preference === "reduced" : media.matches;
let lenis;
let motionContext;
let sculpture;
let sculpturePromise;

const menu = document.querySelector("#site-menu");
const menuToggle = document.querySelector(".menu-toggle");
let menuScroll = 0;
function closeMenu() {
  if (!menu.open) return;
  menu.close();
  restoreMenu();
}
function restoreMenu() {
  if (menu.open) return;
  menuToggle.setAttribute("aria-expanded", "false");
  document.body.classList.remove("menu-open");
  lenis?.start();
  window.scrollTo({ top: menuScroll, behavior: "instant" });
  menuToggle.focus({ preventScroll: true });
}
menuToggle.addEventListener("click", () => {
  menuScroll = window.scrollY;
  menu.showModal();
  menuToggle.setAttribute("aria-expanded", "true");
  document.body.classList.add("menu-open");
  lenis?.stop();
  if (!reduced)
    gsap.fromTo(
      menu.querySelectorAll("nav a"),
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.07, clearProps: "all" },
    );
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

const motionToggle = document.querySelector(".motion-toggle");
async function initialiseMotion() {
  root.classList.toggle("motion-reduced", reduced);
  root.classList.toggle("motion-full", !reduced);
  motionToggle.setAttribute("aria-pressed", String(reduced));
  motionToggle.setAttribute(
    "aria-label",
    reduced ? "Enable full motion" : "Reduce motion",
  );
  motionToggle.querySelector(".motion-label").textContent = reduced
    ? "Motion off"
    : "Motion on";
  motionContext?.revert();
  lenis?.destroy();
  lenis = null;
  if (!reduced && matchMedia("(min-width:768px) and (pointer:fine)").matches) {
    lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      syncTouch: false,
      anchors: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
  }
  if (!reduced) {
    motionContext = gsap.matchMedia();
    motionContext.add(
      { desktop: "(min-width:768px)", mobile: "(max-width:767px)" },
      (context) => {
        const mobile = context.conditions.mobile;
        gsap.utils.toArray(".reveal").forEach((el) => {
          gsap.fromTo(
            el,
            { y: mobile ? 22 : 50, opacity: 0.25 },
            {
              y: 0,
              opacity: 1,
              duration: 1.05,
              ease: "power3.out",
              scrollTrigger: { trigger: el, start: "top 94%", once: true },
            },
          );
        });
        const hero = document.querySelector(".hero-story");
        if (hero) {
          gsap.to(".hero-type > span:nth-child(1)", {
            xPercent: -18,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
            },
          });
          gsap.to(".hero-type > span:nth-child(2)", {
            xPercent: 16,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
            },
          });
          gsap.to(".hero-type > span:nth-child(3)", {
            xPercent: -10,
            ease: "none",
            scrollTrigger: {
              trigger: hero,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.7,
            },
          });
        }
        gsap.utils.toArray(".wire-object").forEach((el, i) => {
          gsap.to(el, {
            rotation: i % 2 ? -35 : 35,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section, article"),
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });
        gsap.utils
          .toArray(".project-scene .project-image-link")
          .forEach((el) => {
            gsap.fromTo(
              el,
              { y: mobile ? 0 : 60 },
              {
                y: mobile ? 0 : -30,
                ease: "none",
                scrollTrigger: {
                  trigger: el.closest(".project-scene"),
                  start: "top bottom",
                  end: "bottom top",
                  scrub: 0.8,
                },
              },
            );
          });
      },
    );
  }
  const target = document.querySelector(".sculpture");
  if (reduced) sculpture?.setReduced(true);
  else if (target && !sculpture) {
    sculpturePromise ||= import("./src/sculpture.js")
      .then((module) => {
        const instances = [...document.querySelectorAll(".sculpture")]
          .map((host) => module.createSculpture(host))
          .filter(Boolean);
        return {
          setReduced: (value) =>
            instances.forEach((instance) => instance.setReduced(value)),
          pause: () => instances.forEach((instance) => instance.pause()),
          resume: () => instances.forEach((instance) => instance.resume()),
        };
      })
      .catch(() => null);
    sculpture = await sculpturePromise;
    sculpture?.setReduced(reduced);
  } else sculpture?.setReduced(false);
  ScrollTrigger.refresh();
}
motionToggle.addEventListener("click", () => {
  reduced = !reduced;
  preference = reduced ? "reduced" : "full";
  try {
    localStorage.setItem("portfolio-motion", preference);
  } catch {
    /* The choice still works for this visit. */
  }
  initialiseMotion();
});
media.addEventListener("change", (event) => {
  if (!preference) {
    reduced = event.matches;
    initialiseMotion();
  }
});
matchMedia("(min-width:768px) and (pointer:fine)").addEventListener(
  "change",
  initialiseMotion,
);
gsap.ticker.add((time) => lenis?.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
document.querySelector(".hero-type")?.classList.add("hero-enter");
initialiseMotion();

const rail = document.querySelector(".progress-rail");
const railLabel = rail.querySelector(".progress-label");
const sections = [...document.querySelectorAll("[data-section]")];
let frame = 0;
function scrollUI() {
  frame = 0;
  const range = document.documentElement.scrollHeight - innerHeight;
  const progress = range > 0 ? Math.min(1, Math.max(0, scrollY / range)) : 0;
  rail.querySelector(".progress-track i").style.transform =
    `scaleX(${progress})`;
  rail.querySelector(".progress-value").textContent =
    `${String(Math.round(progress * 100)).padStart(2, "0")} / 100`;
  const active = sections
    .filter((el) => el.getBoundingClientRect().top <= innerHeight * 0.5)
    .at(-1);
  if (active) railLabel.textContent = active.dataset.section;
  const hero = document.querySelector(".hero-story");
  if (hero) {
    const range = Math.max(1, hero.offsetHeight - innerHeight);
    const phase = Math.min(
      4,
      Math.floor((Math.max(0, -hero.getBoundingClientRect().top) / range) * 4) +
        1,
    );
    document.querySelector(".hero-phase").textContent = `0${phase} / 04`;
    const beat = document.querySelector(".hero-coordinate > span");
    beat.textContent = [
      "Model the problem.",
      "Connect the parts.",
      "Refine the experience.",
      "Deliver the whole.",
    ][phase - 1];
  }
}
const schedule = () => {
  if (!frame) frame = requestAnimationFrame(scrollUI);
};
window.addEventListener("scroll", schedule, { passive: true });
window.addEventListener("resize", schedule, { passive: true });
scrollUI();
document.fonts.ready.then(() => ScrollTrigger.refresh());
window.addEventListener("load", () => ScrollTrigger.refresh());

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
window.addEventListener("pagehide", () => sculpture?.pause());
window.addEventListener("pageshow", () => {
  sculpture?.resume();
  ScrollTrigger.refresh();
});
