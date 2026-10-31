import {
  scenes,
  clamp,
  smooth,
  sceneState,
  sampleRibbon,
} from "./choreography.mjs";
const root = document.documentElement,
  study = document.querySelector(".study"),
  track = document.querySelector(".chapters"),
  panels = [...document.querySelectorAll(".chapter")],
  stage = document.querySelector(".ribbon-stage"),
  art = document.querySelector(".art"),
  path = document.querySelector(".filament path"),
  svg = path.ownerSVGElement;
const reduce = matchMedia("(prefers-reduced-motion: reduce)"),
  mobile = matchMedia("(max-width:767px)");
let full = !reduce.matches,
  phase = 0,
  target = 0,
  raf = 0,
  last = 0,
  renderer = null,
  loading = false,
  attempted = false,
  lastInput = 0,
  disposed = false;
const curve = new Float32Array(257 * 3),
  frames = [],
  drawCosts = [];
function rect(el) {
  const r = el.getBoundingClientRect();
  return { x: r.x, y: r.y, width: r.width, height: r.height };
}
let exclusionZones = [];
function measure() {
  exclusionZones = panels.map((panel) =>
    [
      ...panel.querySelectorAll(
        "h1,h2,.description,.scene-caption,.scene-note,.skip",
      ),
    ].map(rect),
  );
  window.__motionStudy.exclusionZones = exclusionZones;
}
function getPhase() {
  if (!mobile.matches) return clamp(scrollY / innerWidth, 0, 3);
  let best = 0,
    distance = Infinity;
  panels.forEach((panel, i) => {
    const r = panel.querySelector(".mobile-art-space").getBoundingClientRect(),
      d = Math.abs(r.top + r.height / 2 - innerHeight * 0.55);
    if (d < distance) {
      distance = d;
      best = i;
    }
  });
  return best;
}
function viewOptions(time) {
  if (!mobile.matches) return { aspect: innerWidth / innerHeight, time };
  const index = Math.round(target),
    box = panels[index]
      .querySelector(".mobile-art-space")
      .getBoundingClientRect();
  art.style.clipPath = `inset(${Math.max(0, box.top)}px 0 ${Math.max(0, innerHeight - box.bottom)}px 0)`;
  return {
    aspect: innerWidth / innerHeight,
    time,
    center: [0.5, (box.top + box.height / 2) / innerHeight],
    scale: Math.min(0.62, innerWidth / 700),
  };
}
function drawFilament(opts) {
  sampleRibbon(phase, { ...opts, out: curve });
  const w = innerWidth,
    h = innerHeight,
    aspect = w / h,
    state = sceneState(phase),
    xy = (i) => [
      (curve[i] / (8 * aspect) + 0.5) * w,
      (0.5 - curve[i + 1] / 8) * h,
    ];
  const first = xy(0),
    end = xy(curve.length - 3);
  const y0 = mobile.matches ? first[1] + 20 : state.route[0] * h,
    y1 = mobile.matches ? end[1] - 20 : state.route[1] * h;
  function flowingArc(a, b, c, d, move = false) {
    let result = "";
    for (let i = 0; i <= 64; i++) {
      const t = i / 64,
        v = 1 - t;
      const x =
        v * v * v * a[0] +
        3 * v * v * t * b[0] +
        3 * v * t * t * c[0] +
        t * t * t * d[0];
      const y =
        v * v * v * a[1] +
        3 * v * v * t * b[1] +
        3 * v * t * t * c[1] +
        t * t * t * d[1];
      const wave =
        Math.sin(t * Math.PI) ** 2 *
        (6 * Math.sin(t * Math.PI * 2 - opts.time * 0.65 + phase) +
          2 * Math.sin(t * Math.PI * 5 - opts.time * 1.13));
      result += `${i === 0 && move ? "M" : "L"}${x.toFixed(2)},${(y + wave).toFixed(2)}`;
    }
    return result;
  }
  let d = flowingArc(
    [-30, y0],
    [w * 0.18, y0 - 25],
    [first[0] - w * 0.13, first[1] + 25],
    first,
    true,
  );
  for (let i = 3; i < curve.length; i += 3) {
    const [x, y] = xy(i);
    d += `L${x.toFixed(2)},${y.toFixed(2)}`;
  }
  d += flowingArc(
    end,
    [end[0] + w * 0.08, end[1] + (y1 - end[1]) * 0.85],
    [w * 0.78, y1 + 25],
    [w + 30, y1],
  );
  path.setAttribute("d", d);
  svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
}
function paint(time) {
  const interval = time - last || 16.67;
  const dt = Math.min(40, interval);
  last = time;
  target = getPhase();
  phase += (target - phase) * (1 - Math.exp(-dt / 65));
  if (Math.abs(target - phase) < 0.0001) phase = target;
  if (!mobile.matches) {
    track.style.transform = `translate3d(${-phase * innerWidth}px,0,0)`;
    art.style.clipPath = "none";
  }
  panels.forEach((panel, i) => {
    const opacity =
      full && !mobile.matches ? 1 - smooth(0.06, 0.36, Math.abs(phase - i)) : 1;
    // Editorial copy travels a shorter distance while the sculpture crosses
    // the stage; this preserves the authored negative-space corridor.
    panel.style.transform =
      full && !mobile.matches
        ? `translateX(${(phase - i) * innerWidth * 0.85}px)`
        : "";
    panel.style.setProperty("--text-opacity", opacity);
    panel.classList.toggle("is-active", Math.round(phase) === i);
    panel.inert = full && !mobile.matches && opacity < 0.05;
  });
  const opts = viewOptions(full ? time * 0.001 : 0);
  if (full) {
    const start = performance.now();
    drawFilament(opts);
    renderer?.draw(phase, opts);
    if (renderer && drawCosts.length < 1800)
      drawCosts.push(performance.now() - start);
  }
  document.querySelector(".progress i").style.transform =
    `scaleX(${phase / 3})`;
  document.querySelector(".chapter-name").textContent =
    scenes[Math.round(phase)].name;
  document
    .querySelectorAll("[data-go]")
    .forEach((el, i) =>
      el.setAttribute("aria-current", String(Math.round(phase) === i)),
    );
  window.__motionStudy.phase = phase;
  window.__motionStudy.ready = Boolean(renderer);
  if (renderer && frames.length < 1800 && interval > 0) frames.push(interval);
  raf = 0;
  if (full && !document.hidden && !disposed) raf = requestAnimationFrame(paint);
}
function start() {
  if (!raf && !document.hidden && !disposed) raf = requestAnimationFrame(paint);
}
function setMotion(value, preserve = true) {
  const index = Math.round(phase);
  full = value;
  root.classList.toggle("is-still", !full);
  document
    .querySelector(".motion-switch")
    .setAttribute("aria-pressed", String(full));
  document.querySelector(".motion-copy").textContent = full
    ? "Motion on"
    : "Motion off";
  if (!full) {
    cancelAnimationFrame(raf);
    raf = 0;
    panels.forEach((p) => (p.inert = false));
    track.style.removeProperty("transform");
    if (preserve) panels[index].scrollIntoView({ behavior: "instant" });
  } else {
    if (preserve && !mobile.matches)
      scrollTo({ top: index * innerWidth, behavior: "instant" });
    phase = getPhase();
    start();
    queueRenderer();
  }
}
let idle;
function queueRenderer() {
  clearTimeout(idle);
  if (renderer || loading || attempted || !full) return;
  idle = setTimeout(async () => {
    if (performance.now() - lastInput < 300) {
      queueRenderer();
      return;
    }
    loading = true;
    attempted = true;
    try {
      const module = await import("./ribbon.js");
      renderer = await module.createRibbonRenderer(stage);
      window.__motionStudy.webgl = Boolean(renderer);
    } catch (e) {
      console.warn("Filament fallback:", e.message);
    }
    loading = false;
  }, 450);
}
function go(index) {
  index = clamp(index, 0, 3);
  if (mobile.matches || !full)
    panels[index].scrollIntoView({ behavior: full ? "smooth" : "instant" });
  else scrollTo({ top: index * innerWidth, behavior: "smooth" });
}
document.querySelector(".skip").addEventListener("click", (e) => {
  e.preventDefault();
  go(1);
});
document
  .querySelectorAll("[data-go]")
  .forEach((b) => b.addEventListener("click", () => go(Number(b.dataset.go))));
document
  .querySelector(".motion-switch")
  .addEventListener("click", () => setMotion(!full));
addEventListener(
  "scroll",
  () => {
    lastInput = performance.now();
    queueRenderer();
    if (!full) start();
  },
  { passive: true },
);
addEventListener("wheel", () => (lastInput = performance.now()), {
  passive: true,
});
addEventListener(
  "resize",
  () => {
    measure();
    phase = getPhase();
    start();
  },
  { passive: true },
);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    cancelAnimationFrame(raf);
    raf = 0;
  } else start();
});
addEventListener("keydown", (e) => {
  if (
    !e.target.closest("button,a") &&
    ["ArrowLeft", "ArrowRight"].includes(e.key) &&
    !mobile.matches
  ) {
    e.preventDefault();
    go(Math.round(phase) + (e.key === "ArrowLeft" ? 1 : -1));
  }
});
reduce.addEventListener("change", () => setMotion(!reduce.matches));
addEventListener("pagehide", () => {
  disposed = true;
  cancelAnimationFrame(raf);
  clearTimeout(idle);
});
addEventListener("pageshow", () => {
  disposed = false;
  start();
});
window.__motionStudy = {
  phase: 0,
  ready: false,
  frames,
  drawCosts,
  exclusionZones,
  measure,
};
document.fonts.ready.then(measure);
setMotion(full, false);
measure();
