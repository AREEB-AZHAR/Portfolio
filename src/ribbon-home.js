import {
  sampleRibbon,
  sceneState,
  smooth,
} from "./motion-study/choreography.mjs";
export function createRibbonStory(host, story) {
  if (!host) return null;
  const art = host.querySelector(".ribbon-atmosphere"),
    stage = host.querySelector(".ribbon-stage"),
    svg = host.querySelector(".ribbon-filament"),
    path = svg.querySelector("path"),
    panels = [...host.querySelectorAll(".ribbon-panel")];
  const curve = new Float32Array(771),
    frames = [],
    costs = [];
  let renderer = null,
    attempted = false,
    loading = false,
    raf = 0,
    last = 0,
    lastInput = performance.now(),
    idle = 0,
    mobilePhase = 0,
    phase = 0,
    disposed = false;
  const active = () =>
    document.documentElement.classList.contains("motion-full");
  const paused = () =>
    document.hidden || disposed || document.querySelector("dialog[open]");
  function options(time) {
    if (story.isHorizontal()) {
      art.style.clipPath = "none";
      return { aspect: innerWidth / innerHeight, time };
    }
    let closest = 0,
      dist = Infinity;
    panels.forEach((p, i) => {
      const b = p.querySelector(".ribbon-mobile-space").getBoundingClientRect(),
        d = Math.abs(b.top + b.height / 2 - innerHeight * 0.55);
      if (d < dist) {
        dist = d;
        closest = i;
      }
    });
    const b = panels[closest]
      .querySelector(".ribbon-mobile-space")
      .getBoundingClientRect();
    mobilePhase += (closest - mobilePhase) * 0.12;
    phase = mobilePhase;
    art.style.clipPath = `inset(${Math.max(0, b.top)}px 0 ${Math.max(0, innerHeight - b.bottom)}px 0)`;
    return {
      aspect: innerWidth / innerHeight,
      time,
      center: [0.5, (b.top + b.height / 2) / innerHeight],
      scale: Math.min(0.62, innerWidth / 700),
      visible: b.bottom > 0 && b.top < innerHeight,
    };
  }
  function filament(opts) {
    sampleRibbon(phase, { ...opts, out: curve });
    const w = innerWidth,
      h = innerHeight,
      s = sceneState(phase),
      xy = (i) => [
        (curve[i] / ((8 * w) / h) + 0.5) * w,
        (0.5 - curve[i + 1] / 8) * h,
      ],
      first = xy(0),
      end = xy(curve.length - 3);
    const y0 = story.isHorizontal() ? s.route[0] * h : first[1] + 20,
      y1 = story.isHorizontal() ? s.route[1] * h : end[1] - 20;
    function arc(a, b, c, d, move = false) {
      let out = "";
      for (let i = 0; i <= 64; i++) {
        const t = i / 64,
          v = 1 - t,
          x =
            v * v * v * a[0] +
            3 * v * v * t * b[0] +
            3 * v * t * t * c[0] +
            t * t * t * d[0],
          y =
            v * v * v * a[1] +
            3 * v * v * t * b[1] +
            3 * v * t * t * c[1] +
            t * t * t * d[1],
          wave =
            Math.sin(t * Math.PI) ** 2 *
            (6 * Math.sin(t * Math.PI * 2 - opts.time * 0.65 + phase) +
              2 * Math.sin(t * Math.PI * 5 - opts.time * 1.13));
        out += `${i === 0 && move ? "M" : "L"}${x.toFixed(2)},${(y + wave).toFixed(2)}`;
      }
      return out;
    }
    let d = arc(
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
    // On left-anchored scenes the filament first descends beside the artwork,
    // then crosses beneath the reading column instead of cutting diagonally
    // through its calls to action.
    const leftExit = 1 - smooth(0.4, 0.6, s.center[0]);
    d += arc(
      end,
      [end[0] + w * (0.08 - 0.105 * leftExit), end[1] + (y1 - end[1]) * 0.95],
      [w * (0.78 - 0.2 * leftExit), y1 + 25],
      [w + 30, y1],
    );
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    path.setAttribute("d", d);
  }
  function tick(time) {
    raf = 0;
    if (!active() || paused()) return;
    const dt = time - last;
    last = time;
    phase = story.getProgress();
    const opts = options(time / 1000);
    if (opts.visible !== false) {
      const start = performance.now();
      filament(opts);
      renderer?.draw(phase, opts);
      if (renderer && costs.length < 2400) {
        costs.push(performance.now() - start);
        if (dt > 0 && dt < 250) frames.push(dt);
      }
    }
    window.__ribbonStory.phase = phase;
    window.__ribbonStory.ready = Boolean(renderer);
    raf = requestAnimationFrame(tick);
  }
  function start() {
    if (!raf && active() && !paused()) {
      last = 0;
      raf = requestAnimationFrame(tick);
    }
  }
  function queue() {
    clearTimeout(idle);
    if (renderer || attempted || loading || !active() || paused()) return;
    idle = setTimeout(async () => {
      if (performance.now() - lastInput < 350) {
        queue();
        return;
      }
      attempted = true;
      loading = true;
      try {
        const module = await import("./motion-study/ribbon.js");
        renderer = await module.createRibbonRenderer(stage);
        if (!active()) stage.classList.remove("ready");
      } catch (e) {
        console.warn("Using filament fallback:", e.message);
      }
      loading = false;
    }, 450);
  }
  function refresh() {
    if (!active()) {
      cancelAnimationFrame(raf);
      raf = 0;
      clearTimeout(idle);
    } else {
      if (renderer) stage.classList.add("ready");
      start();
      queue();
    }
  }
  for (const event of ["scroll", "wheel", "touchmove"])
    addEventListener(
      event,
      () => {
        lastInput = performance.now();
        queue();
      },
      { passive: true },
    );
  addEventListener(
    "resize",
    () => {
      story.update(true);
      start();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      cancelAnimationFrame(raf);
      raf = 0;
    } else refresh();
  });
  document
    .querySelectorAll("dialog")
    .forEach((dialog) => dialog.addEventListener("close", refresh));
  addEventListener("pagehide", () => {
    disposed = true;
    cancelAnimationFrame(raf);
    raf = 0;
    clearTimeout(idle);
  });
  addEventListener("pageshow", () => {
    disposed = false;
    refresh();
  });
  window.__ribbonStory = { phase: 0, ready: false, curve, frames, costs };
  return { refresh, update: start };
}
