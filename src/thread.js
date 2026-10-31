import { sampleLivingStrand, storyArtPresence } from "./living-strand.mjs";
export function createStoryThread(host) {
  if (!host) return null;
  const svg = host.querySelector(".story-thread"),
    paths = svg.querySelectorAll("path"),
    sculpture = host.querySelector(".story-atmosphere .sculpture");
  let frame = 0,
    last = 0;
  function draw(time = performance.now()) {
    const active = document.documentElement.classList.contains("motion-full");
    const width = svg.clientWidth || innerWidth,
      height = svg.clientHeight || innerHeight,
      aspect = width / height;
    const phase = active ? Number(sculpture.dataset.sceneProgress || 0) : 0;
    svg.style.opacity = active ? String(storyArtPresence(phase)) : "0";
    const curve = sampleLivingStrand(phase, {
      aspect,
      time: active ? time * 0.001 : 0,
    });
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    let d = "";
    for (let i = 0; i < curve.length; i += 3) {
      const x = (curve[i] / (aspect * 8) + 0.5) * width,
        y = (0.5 - curve[i + 1] / 8) * height;
      d += `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`;
    }
    paths.forEach((path) => path.setAttribute("d", d));
    const length = paths[0].getTotalLength();
    paths[1].style.strokeDasharray = `${length * 0.16} ${length * 0.84}`;
    paths[1].style.strokeDashoffset = active
      ? String((phase * 0.8 + time * 0.00009) * length)
      : "0";
    paths[1].style.opacity = active ? ".9" : "0";
    svg.dataset.phase = phase.toFixed(4);
  }
  function loop(time) {
    frame = 0;
    if (
      document.hidden ||
      !document.documentElement.classList.contains("motion-full")
    )
      return;
    if (time - last > 16) {
      draw(time);
      last = time;
    }
    frame = requestAnimationFrame(loop);
  }
  function refresh() {
    draw();
    cancelAnimationFrame(frame);
    frame = 0;
    if (document.documentElement.classList.contains("motion-full"))
      frame = requestAnimationFrame(loop);
  }
  window.addEventListener("resize", refresh, { passive: true });
  document.addEventListener("visibilitychange", refresh);
  window.addEventListener("pagehide", () => {
    cancelAnimationFrame(frame);
    frame = 0;
  });
  window.addEventListener("pageshow", refresh);
  document.fonts.ready.then(refresh);
  refresh();
  return { refresh, update: draw };
}
