// One actual path, not isolated SVGs with nearby endpoints. Every shape is
// traced without lifting the pen, and the connector continues to the next one.
export function createStoryThread(host) {
  if (!host) return null;
  const svg = host.querySelector(".story-thread");
  const path = svg.querySelector("path");
  const panels = [...host.querySelectorAll(".horizontal-panel")];
  function points(kind) {
    if (kind === "rustbot")
      return [
        [-0.8, 0],
        [-0.8, -0.6],
        [0.8, -0.6],
        [0.8, 0.5],
        [-0.2, 0.5],
        [-0.6, 0.9],
        [-0.6, 0.5],
        [-0.8, 0.5],
        [-0.8, 0],
        [0.8, 0],
      ];
    if (kind === "tally")
      return [
        [-0.65, 0],
        [-0.65, -0.9],
        [0.65, -0.9],
        [0.65, 0.9],
        [-0.65, 0.9],
        [-0.65, 0],
        [-0.4, 0],
        [-0.4, 0.55],
        [-0.1, 0.55],
        [-0.1, -0.1],
        [0.2, -0.1],
        [0.2, 0.55],
        [0.5, 0.55],
        [0.5, -0.45],
        [0.65, -0.45],
        [0.8, 0],
      ];
    if (kind === "bunetto")
      return [
        [-0.9, 0],
        [-0.7, -0.65],
        [0.7, -0.65],
        [0.9, 0],
        [-0.9, 0],
        [-0.9, 0.8],
        [-0.15, 0.8],
        [-0.15, 0.2],
        [0.4, 0.2],
        [0.4, 0.8],
        [0.9, 0.8],
        [0.9, 0],
      ];
    if (kind === "degree-verification")
      return [
        [-0.9, 0],
        [-0.45, -0.8],
        [0.45, -0.8],
        [0.9, 0],
        [0.45, 0.8],
        [-0.45, 0.8],
        [-0.9, 0],
        [-0.45, 0.15],
        [-0.1, 0.5],
        [0.6, -0.4],
        [0.9, 0],
      ];
    if (kind === "cryptotrader")
      return [
        [-0.9, 0],
        [-0.6, 0.5],
        [-0.3, -0.1],
        [0, 0.1],
        [0.3, -0.7],
        [0.6, -0.4],
        [0.9, -0.85],
        [0.9, 0.7],
        [-0.9, 0.7],
        [-0.9, 0],
        [0.9, 0],
      ];
    if (kind === "structure")
      return [
        [-0.8, 0],
        [-0.8, -0.8],
        [0.8, -0.8],
        [0.8, 0.8],
        [-0.8, 0.8],
        [-0.8, 0],
        [0.8, 0],
      ];
    const data = [];
    for (let n = 0; n <= 64; n++) {
      const t = (n / 64) * Math.PI * 2;
      if (kind === "connection")
        data.push([Math.sin(t) * 0.95, Math.sin(t * 2) * 0.5]);
      else if (kind === "gravipop")
        data.push([
          Math.cos(t) * 0.95,
          Math.sin(t) * 0.55 + Math.sin(t * 3) * 0.2,
        ]);
      else data.push([Math.cos(t) * 0.75, Math.sin(t) * 0.75]);
    }
    return data;
  }
  function refresh() {
    const horizontal =
      document.documentElement.classList.contains("story-horizontal");
    const width = innerWidth;
    const height = horizontal ? innerHeight : host.scrollHeight;
    svg.setAttribute(
      "viewBox",
      `0 0 ${horizontal ? width * panels.length : width} ${height}`,
    );
    let d = "",
      previous;
    panels.forEach((panel, index) => {
      const rect = panel.getBoundingClientRect();
      const bounds = host.getBoundingClientRect();
      const center = {
        x: horizontal ? (index + 0.62) * width : width * 0.58,
        y: horizontal
          ? innerHeight * 0.48
          : rect.top - bounds.top + rect.height * 0.48,
      };
      const size = Math.min(
        width * (horizontal ? 0.3 : 0.32),
        (horizontal ? innerHeight : rect.height) * 0.28,
      );
      const kind =
        panel.dataset.project ||
        [
          "identity",
          "circle",
          "structure",
          "circle",
          "connection",
          "connection",
        ][index] ||
        "circle";
      const shape = points(kind).map(([x, y]) => ({
        x: center.x + x * size,
        y: center.y + y * size,
      }));
      const start = shape[0];
      if (!previous)
        d = `M${horizontal ? 0 : width * 0.3},${horizontal ? center.y : 0}`;
      const from = previous || {
        x: horizontal ? 0 : width * 0.3,
        y: horizontal ? center.y : 0,
      };
      d += horizontal
        ? ` C${from.x + width * 0.22},${from.y} ${start.x - width * 0.16},${start.y} ${start.x},${start.y}`
        : ` C${from.x},${from.y + 80} ${start.x},${start.y - 80} ${start.x},${start.y}`;
      for (const p of shape.slice(1)) d += ` L${p.x},${p.y}`;
      previous = shape.at(-1);
    });
    path.setAttribute("d", d);
    svg.dataset.axis = horizontal ? "horizontal" : "vertical";
  }
  const observer = new ResizeObserver(refresh);
  observer.observe(host);
  window.addEventListener("resize", refresh, { passive: true });
  document.fonts.ready.then(refresh);
  refresh();
  return { refresh };
}
