// Native scrolling stays immediate. Only the presentation eases toward the
// latest position; refresh, keyboard focus and anchor jumps synchronize at once.
export function createHorizontalStory(host) {
  if (!host) return null;
  const track = host.querySelector(".horizontal-track");
  const panels = [...host.querySelectorAll(".horizontal-panel")];
  const desktop = matchMedia("(min-width:768px)");
  const sculpture = host.querySelector(".story-atmosphere .sculpture");
  let motion = false,
    enabled = false,
    width = innerWidth,
    current = 0;
  let anchorNavigating = false;
  let rendered = 0,
    frame = 0,
    lastTime = 0;
  const top = () => host.getBoundingClientRect().top + scrollY;
  const position = () =>
    Math.max(0, Math.min(panels.length - 1, (scrollY - top()) / innerWidth));
  panels.forEach((panel, index) => {
    panel.dataset.panelIndex = index;
  });

  function paint() {
    current = Math.round(rendered);
    track.style.transform = `translate3d(${-rendered * innerWidth}px,0,0)`;
    panels.forEach((panel, index) => {
      const local = Math.max(-1, Math.min(1, rendered - index));
      panel.classList.toggle("is-current", index === current);
      panel.style.setProperty("--scene-progress", local.toFixed(4));
      panel.style.setProperty(
        "--scene-visibility",
        (0.16 + 0.84 * (1 - Math.abs(local))).toFixed(4),
      );
    });
    if (sculpture) {
      sculpture.dataset.sceneProgress = rendered;
      sculpture.style.setProperty("--hero-presence", Math.max(0, 1 - rendered));
    }
  }
  function animate(time) {
    frame = 0;
    if (!enabled) return;
    const target = position();
    const delta = Math.min(32, Math.max(8, time - lastTime || 16.67));
    lastTime = time;
    rendered += (target - rendered) * (1 - Math.exp(-delta / 75));
    if (Math.abs(target - rendered) < 0.00015) rendered = target;
    paint();
    if (rendered !== target) frame = requestAnimationFrame(animate);
    else lastTime = 0;
  }
  function update(immediate = false) {
    if (!enabled) {
      const index = Math.max(
        0,
        panels.findIndex(
          (panel) => panel.getBoundingClientRect().bottom > innerHeight * 0.5,
        ),
      );
      const rect = panels[index].getBoundingClientRect();
      const progress = Math.max(
        0,
        Math.min(
          panels.length - 1,
          index +
            (innerHeight * 0.5 - rect.top) / Math.max(1, rect.height) -
            0.5,
        ),
      );
      if (sculpture) {
        sculpture.dataset.sceneProgress = progress;
        sculpture.style.setProperty(
          "--hero-presence",
          Math.max(0, 1 - progress),
        );
      }
      return null;
    }
    const target = position();
    if (immediate || Math.abs(target - rendered) > 2) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      rendered = target;
      paint();
    } else if (!frame) animate(performance.now());
    return panels[Math.round(target)].dataset.section;
  }
  function goTo(panel, smooth = false) {
    const index = panels.indexOf(panel);
    if (!enabled || index < 0) return;
    window.scrollTo({
      top: top() + index * innerWidth,
      behavior: smooth ? "smooth" : "instant",
    });
    if (!smooth) update(true);
  }
  function setEnabled(value, preserve = true) {
    motion = value;
    const next = motion && desktop.matches;
    if (next === enabled) {
      update();
      return;
    }
    let target = panels[current];
    if (!enabled) {
      target =
        panels.find((panel) => {
          const rect = panel.getBoundingClientRect();
          return (
            rect.top <= innerHeight * 0.5 && rect.bottom > innerHeight * 0.5
          );
        }) || target;
    }
    enabled = next;
    document.documentElement.classList.toggle("story-horizontal", enabled);
    if (!enabled) {
      cancelAnimationFrame(frame);
      frame = 0;
      track.style.removeProperty("transform");
      panels.forEach((panel) => panel.classList.remove("is-current"));
    }
    if (preserve) {
      if (enabled) goTo(target);
      else target.scrollIntoView({ behavior: "instant", block: "start" });
    }
    update(true);
  }
  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) return;
    const target = document.getElementById(anchor.hash.slice(1));
    const panel = target?.closest(".horizontal-panel");
    if (!panel && anchor.hash !== "#main") return;
    event.preventDefault();
    history.pushState(null, "", anchor.hash);
    if (enabled) goTo(panel || panels[0], motion);
    else
      target?.scrollIntoView({
        behavior: motion ? "smooth" : "instant",
        block: "start",
      });
    target?.setAttribute("tabindex", "-1");
    anchorNavigating = true;
    target?.focus({ preventScroll: true });
    anchorNavigating = false;
  });
  document.addEventListener("focusin", (event) => {
    const panel = event.target.closest(".horizontal-panel");
    if (!anchorNavigating && enabled && panel && panel !== panels[current])
      goTo(panel);
  });
  document.addEventListener("keydown", (event) => {
    if (
      !enabled ||
      document.querySelector("dialog[open]") ||
      event.target.closest("input,textarea,select,button") ||
      !["ArrowLeft", "ArrowRight"].includes(event.key)
    )
      return;
    event.preventDefault();
    goTo(
      panels[
        Math.max(
          0,
          Math.min(
            panels.length - 1,
            current + (event.key === "ArrowLeft" ? 1 : -1),
          ),
        )
      ],
    );
  });
  window.addEventListener(
    "resize",
    () => {
      if (enabled !== (motion && desktop.matches)) setEnabled(motion);
      else if (enabled && width !== innerWidth) {
        window.scrollTo({
          top: top() + rendered * innerWidth,
          behavior: "instant",
        });
        update(true);
      }
      width = innerWidth;
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
  window.addEventListener("pageshow", () => update(true));
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  return { update, setEnabled, followHash, isHorizontal: () => enabled };
}

// Supporting pages retain editorial reading, then join the same lateral finale.
export function createFooterFlow(host) {
  if (!host) return null;
  let value = 0,
    frame = 0,
    last = 0;
  const enabled = () =>
    document.documentElement.classList.contains("motion-full") &&
    innerWidth >= 768;
  const target = () =>
    Math.max(
      0,
      Math.min(
        1,
        (innerHeight * 0.2 - host.getBoundingClientRect().top) /
          (innerWidth * 0.7 + innerHeight * 0.2),
      ),
    );
  function paint() {
    host.style.setProperty("--footer-progress", value.toFixed(5));
  }
  function tick(time) {
    frame = 0;
    if (!enabled()) return;
    const destination = target();
    value +=
      (destination - value) *
      (1 - Math.exp(-Math.min(32, time - last || 16.67) / 75));
    last = time;
    if (Math.abs(destination - value) < 0.0001) value = destination;
    paint();
    if (value !== destination) frame = requestAnimationFrame(tick);
    else last = 0;
  }
  function update(immediate = false) {
    if (!enabled()) {
      cancelAnimationFrame(frame);
      frame = 0;
      host.style.removeProperty("--footer-progress");
      return;
    }
    if (immediate) {
      value = target();
      paint();
    } else if (!frame) tick(performance.now());
  }
  window.addEventListener("pageshow", () => update(true));
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  return { update };
}
