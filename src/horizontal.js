// Native document scrolling drives the track. No wheel interception, pin spacer,
// smooth-scroll startup, or font-dependent measurement is needed.
export function createHorizontalStory(host) {
  if (!host) return null;
  const track = host.querySelector(".horizontal-track");
  const panels = [...host.querySelectorAll(".horizontal-panel")];
  const visual = host.querySelector(".approach-visual");
  const principles = panels.filter((panel) =>
    panel.matches(".principle-scene"),
  );
  let enabled = false;
  let width = innerWidth;
  let current = 0;
  const top = () => host.getBoundingClientRect().top + scrollY;
  const position = () =>
    Math.max(0, Math.min(panels.length - 1, (scrollY - top()) / innerWidth));
  panels.forEach((panel, index) => {
    panel.dataset.panelIndex = index;
  });

  function update() {
    if (!enabled) return null;
    const progress = position();
    current = Math.round(progress);
    const x = (progress - panels.length + 1) * innerWidth;
    track.style.transform = `translate3d(${x}px,0,0)`;
    panels.forEach((panel, index) => {
      panel.classList.toggle("is-current", index === current);
      panel.style.setProperty(
        "--scene-progress",
        Math.max(-1, Math.min(1, progress - index)),
      );
    });
    const hero = panels[0].querySelector(".sculpture");
    if (hero) hero.dataset.sceneProgress = Math.min(1, progress);
    if (visual && principles.includes(panels[current])) {
      if (visual.parentElement !== panels[current])
        panels[current].prepend(visual);
      visual.querySelector(".sculpture").dataset.sceneProgress = Math.max(
        0,
        Math.min(1, (progress - 2) / 2),
      );
    }
    return panels[current].dataset.section;
  }

  function goTo(panel, behavior = "instant") {
    const index = panels.indexOf(panel);
    if (enabled && index >= 0)
      window.scrollTo({ top: top() + index * innerWidth, behavior });
  }

  function setEnabled(value, preserve = true) {
    if (enabled === value) {
      update();
      return;
    }
    let target = panels[current];
    const footerOffset = scrollY - (top() + host.offsetHeight);
    const wasInside = enabled
      ? scrollY >= top() && scrollY < top() + panels.length * innerWidth
      : panels.some((panel) => {
          const rect = panel.getBoundingClientRect();
          if (rect.top <= innerHeight / 2 && rect.bottom > innerHeight / 2) {
            target = panel;
            return true;
          }
          return false;
        });
    enabled = value;
    document.documentElement.classList.toggle("motion-full", value);
    document.documentElement.classList.toggle("motion-reduced", !value);
    if (!value) {
      track.style.removeProperty("transform");
      panels.forEach((panel) => panel.classList.remove("is-current"));
      if (visual) principles[0].prepend(visual);
    }
    if (preserve && wasInside) {
      if (value) goTo(target);
      else target.scrollIntoView({ behavior: "instant", block: "start" });
    }
    if (preserve && footerOffset >= 0)
      window.scrollTo({
        top: top() + host.offsetHeight + footerOffset,
        behavior: "instant",
      });
    update();
  }

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!enabled || !anchor) return;
    const target = document.getElementById(anchor.hash.slice(1));
    const panel = target?.closest(".horizontal-panel");
    if (!panel) return;
    event.preventDefault();
    history.pushState(null, "", anchor.hash);
    goTo(panel);
    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });
  document.addEventListener("focusin", (event) => {
    const panel = event.target.closest(".horizontal-panel");
    if (enabled && panel && panel !== panels[current]) goTo(panel);
  });
  document.addEventListener("keydown", (event) => {
    if (
      !enabled ||
      document.querySelector("dialog[open]") ||
      event.target.closest("input,textarea,select,button") ||
      !["ArrowRight", "ArrowLeft"].includes(event.key)
    )
      return;
    if (scrollY > top() + (panels.length - 1) * innerWidth + 2) return;
    event.preventDefault();
    goTo(
      panels[
        Math.max(
          0,
          Math.min(
            panels.length - 1,
            current + (event.key === "ArrowRight" ? 1 : -1),
          ),
        )
      ],
    );
  });
  window.addEventListener(
    "resize",
    () => {
      if (enabled && innerWidth !== width) {
        const oldDistance = (panels.length - 1) * width;
        const offset = scrollY - top();
        const progress = Math.max(
          0,
          Math.min(panels.length - 1, offset / width),
        );
        width = innerWidth;
        window.scrollTo({
          top:
            top() +
            (offset > oldDistance
              ? offset - oldDistance + (panels.length - 1) * width
              : progress * width),
          behavior: "instant",
        });
      }
      width = innerWidth;
      update();
    },
    { passive: true },
  );
  function followHash() {
    if (!enabled || !location.hash) return;
    const panel = document
      .getElementById(location.hash.slice(1))
      ?.closest(".horizontal-panel");
    if (panel) goTo(panel);
  }
  window.addEventListener("hashchange", followHash);
  window.addEventListener("pageshow", () => {
    update();
    followHash();
  });
  return { update, setEnabled, followHash };
}
