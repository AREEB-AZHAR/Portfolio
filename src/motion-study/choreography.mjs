export const scenes = [
  {
    name: "FROM IDEA",
    pose: "signature",
    center: [0.75, 0.5],
    scale: 1.18,
    yaw: -0.32,
    tilt: -0.12,
    route: [0.76, 0.32],
    travel: [0.64, 0.76],
  },
  {
    name: "BEYOND THE INTERFACE",
    pose: "loop",
    center: [0.25, 0.61],
    scale: 1.24,
    yaw: 0.3,
    tilt: 0.15,
    route: [0.5, 0.87],
    travel: [0.51, 0.77],
  },
  {
    name: "UNDERSTAND THE SYSTEM",
    pose: "frame",
    center: [0.73, 0.36],
    scale: 1.2,
    yaw: -0.37,
    tilt: -0.18,
    route: [0.3, 0.61],
    travel: [0.52, 0.2],
  },
  {
    name: "CLARIFY THE INTERACTION",
    pose: "folds",
    center: [0.27, 0.49],
    scale: 1.25,
    yaw: 0.22,
    tilt: 0.14,
    route: [0.25, 0.85],
    travel: [0.27, 0.49],
  },
  {
    name: "DELIVER THE WHOLE LOOP",
    pose: "weave",
    center: [0.5, 0.72],
    scale: 1.05,
    yaw: 0.18,
    tilt: 0.1,
    route: [0.73, 0.78],
    travel: [0.42, 0.75],
  },
  {
    name: "SELECTED WORK",
    pose: "arc",
    center: [0.25, 0.43],
    scale: 1.12,
    yaw: -0.25,
    tilt: 0.16,
    route: [0.38, 0.86],
    travel: [0.5, 0.75],
  },
  {
    name: "RUSTBOT",
    pose: "dialogue",
    center: [0.75, 0.51],
    scale: 1.12,
    yaw: 0.25,
    tilt: -0.08,
    route: [0.82, 0.76],
    travel: [0.5, 0.75],
  },
  {
    name: "TALLY",
    pose: "steps",
    center: [0.25, 0.5],
    scale: 1.13,
    yaw: -0.25,
    tilt: 0.16,
    route: [0.37, 0.86],
    travel: [0.5, 0.32],
  },
  {
    name: "GRAVIPOP",
    pose: "orbit",
    center: [0.72, 0.35],
    scale: 1.05,
    yaw: 0.2,
    tilt: 0.3,
    route: [0.32, 0.55],
    travel: [0.75, 0.45],
  },
  {
    name: "DEGREE VERIFICATION",
    pose: "links",
    center: [0.75, 0.54],
    scale: 1.03,
    yaw: -0.22,
    tilt: 0.08,
    route: [0.82, 0.78],
    travel: [0.5, 0.78],
  },
  {
    name: "CRYPTOTRADER",
    pose: "helix",
    center: [0.25, 0.5],
    scale: 1.08,
    yaw: 0.25,
    tilt: 0.08,
    route: [0.34, 0.86],
    travel: [0.5, 0.3],
  },
  {
    name: "BUNETTO",
    pose: "canopy",
    center: [0.73, 0.34],
    scale: 1.12,
    yaw: -0.2,
    tilt: 0.3,
    route: [0.32, 0.55],
    travel: [0.5, 0.25],
  },
  {
    name: "CAPABILITIES",
    pose: "lattice",
    center: [0.25, 0.5],
    scale: 1.1,
    yaw: 0.2,
    tilt: -0.15,
    route: [0.36, 0.9],
    travel: [0.5, 0.3],
  },
  {
    name: "LET’S TALK",
    pose: "exit",
    center: [0.76, 0.27],
    scale: 0.6,
    yaw: -0.15,
    tilt: 0.2,
    route: [0.12, 0.16],
    travel: [0.76, 0.27],
  },
];
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const smooth = (a, b, t) => {
  const x = clamp((t - a) / (b - a));
  return x * x * x * (x * (x * 6 - 15) + 10);
};
export const mix = (a, b, t) => a + (b - a) * t;
const cache = new Map();
function catmull(points, count) {
  const dense = [];
  for (let i = 0; i < points.length - 1; i++)
    for (let j = 0; j < 24; j++) {
      const t = j / 24,
        p0 = points[Math.max(0, i - 1)],
        p1 = points[i],
        p2 = points[i + 1],
        p3 = points[Math.min(points.length - 1, i + 2)];
      dense.push(
        p1.map(
          (_, a) =>
            0.5 *
            (2 * p1[a] +
              (-p0[a] + p2[a]) * t +
              (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t * t +
              (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t * t * t),
        ),
      );
    }
  dense.push(points.at(-1));
  const lengths = [0];
  for (let i = 1; i < dense.length; i++)
    lengths.push(
      lengths.at(-1) +
        Math.hypot(...dense[i].map((x, a) => x - dense[i - 1][a])),
    );
  const out = new Float32Array((count + 1) * 3);
  let at = 1;
  for (let i = 0; i <= count; i++) {
    const d = (lengths.at(-1) * i) / count;
    while (at < lengths.length - 1 && lengths[at] < d) at++;
    const u =
      (d - lengths[at - 1]) / Math.max(0.00001, lengths[at] - lengths[at - 1]);
    for (let a = 0; a < 3; a++)
      out[i * 3 + a] = mix(dense[at - 1][a], dense[at][a], u);
  }
  return out;
}
function poses(count) {
  if (cache.has(count)) return cache.get(count);
  const signature = [
    [-1.8, -1, 0],
    [-1.45, -0.1, 0],
    [-0.9, 1.2, 0],
    [-0.35, -0.1, 0.05],
    [0.02, -1, 0.1],
    [-0.38, -0.05, 0.2],
    [-1.42, -0.05, 0.2],
    [-0.2, -0.45, -0.65],
    [0.35, -0.05, -0.3],
    [0.9, 1.2, -0.1],
    [1.45, -0.05, 0],
    [1.8, -1, 0.1],
    [1.45, -0.05, 0.2],
    [0.42, -0.05, 0.2],
  ];
  const loop = [],
    folds = [],
    bridge = [];
  for (let i = 0; i <= 80; i++) {
    const u = i / 80,
      t = -Math.PI * 0.7 + u * Math.PI * 1.85;
    loop.push([1.6 * Math.cos(t), 1.15 * Math.sin(t), 0.45 * Math.sin(t * 2)]);
    const f = -Math.PI * 0.6 + u * Math.PI * 3.6;
    folds.push([
      (1.7 - u * 0.75) * Math.cos(f),
      (1.2 - u * 0.55) * Math.sin(f),
      0.5 * Math.sin(f * 0.75) + u * 0.25,
    ]);
    bridge.push([
      (u - 0.5) * 3.7,
      Math.sin(u * Math.PI * 2) * 0.65,
      Math.sin(u * Math.PI) * 0.65,
    ]);
  }
  const frame = [
    [-1.4, -0.75, -0.25],
    [-1.5, 0.65, 0],
    [-1.25, 1.1, 0.15],
    [1.1, 1.1, 0.2],
    [1.5, 0.75, 0.05],
    [1.5, -0.75, -0.2],
    [1.15, -1.05, -0.25],
    [-0.9, -1.05, 0],
    [-1.2, -0.75, 0.2],
    [-1.2, 0.65, 0.4],
    [0.8, 0.65, 0.5],
    [1.02, 0.35, 0.4],
    [1.02, -0.55, 0.15],
  ];
  const weave = [],
    arc = [],
    dialogue = [],
    steps = [],
    orbit = [],
    links = [],
    helix = [],
    canopy = [],
    lattice = [],
    exit = [];
  for (let i = 0; i <= 100; i++) {
    const u = i / 100,
      t = u * Math.PI * 2;
    weave.push([
      1.65 * Math.sin(t),
      0.85 * Math.sin(t * 2),
      0.55 * Math.cos(t),
    ]);
    const a = -Math.PI * 0.15 + u * Math.PI * 1.4;
    arc.push([1.7 * Math.cos(a), 1.1 * Math.sin(a), 0.35 * Math.sin(a * 2)]);
    dialogue.push([
      1.65 * Math.sin(t),
      0.9 * Math.sin(t * 2),
      0.65 * Math.cos(t),
    ]);
    orbit.push([
      1.65 * Math.cos(t * 1.7),
      1.05 * Math.sin(t * 1.7),
      0.65 * Math.sin(t * 0.85),
    ]);
    helix.push([
      1.25 * Math.cos(t * 1.7),
      (u - 0.5) * 2.6,
      0.7 * Math.sin(t * 1.7),
    ]);
    canopy.push([
      (u - 0.5) * 3.4,
      Math.sin(u * Math.PI) * 1.6 - 0.6,
      0.6 * Math.sin(u * Math.PI * 3),
    ]);
    lattice.push([
      (u - 0.5) * 3.1,
      0.95 * Math.sin(u * Math.PI * 5),
      0.6 * Math.sin(u * Math.PI * 2.5),
    ]);
    exit.push([(u - 0.5) * 4, 0.23 * Math.sin(t), 0.1 * Math.sin(t)]);
  }
  steps.push(
    [-1.5, -1, 0],
    [-1.5, 0.1, 0],
    [-0.6, 0.1, 0.1],
    [-0.6, 1, 0.2],
    [0.2, 1, 0.3],
    [0.2, -0.8, 0.4],
    [1.2, -0.8, 0.2],
    [1.2, 0.5, 0],
    [1.7, 0.5, 0],
  );
  links.push(
    [-1.6, 0, 0],
    [-0.8, 1, 0.2],
    [0.25, 0, 0.4],
    [-0.8, -1, 0.2],
    [-1.6, 0, 0],
    [-0.5, 0.35, -0.5],
    [0.7, 1, 0.1],
    [1.65, 0, 0.3],
    [0.7, -1, 0.1],
    [-0.25, 0, -0.2],
    [0.7, 1, 0.1],
  );
  const data = [
    signature,
    loop,
    frame,
    folds,
    weave,
    arc,
    dialogue,
    steps,
    orbit,
    links,
    helix,
    canopy,
    lattice,
    exit,
    bridge,
  ].map((p) => catmull(p, count));
  cache.set(count, data);
  return data;
}
export function sceneState(phase) {
  phase = clamp(phase, 0, scenes.length - 1);
  const index = Math.min(scenes.length - 2, Math.floor(phase)),
    u = phase - index,
    t = smooth(0, 1, u),
    a = scenes[index],
    b = scenes[index + 1];
  const arch = Math.sin(u * Math.PI) ** 2;
  return {
    index,
    u,
    t,
    center: [
      mix(a.center[0], b.center[0], t),
      mix(a.center[1], b.center[1], t) +
        arch * (a.travel[1] - (a.center[1] + b.center[1]) / 2) * 0.85,
    ],
    scale: mix(a.scale, b.scale, t) * (1 - 0.12 * arch),
    yaw: mix(a.yaw, b.yaw, t),
    tilt: mix(a.tilt, b.tilt, t),
    route: [
      mix(a.route[0], b.route[0], smooth(0.34, 0.66, u)),
      mix(a.route[1], b.route[1], smooth(0.34, 0.66, u)),
    ],
  };
}
// Fixed topology; only this centerline and the bevel frame change over time.
export function sampleRibbon(
  phase,
  { count = 256, time = 0, aspect = 1.6, center, scale, out } = {},
) {
  const state = sceneState(phase),
    p = poses(count),
    result = out || new Float32Array((count + 1) * 3);
  const c = center || state.center,
    k = scale ?? state.scale * Math.min(1, aspect / 1.6);
  const gust =
    0.55 * Math.sin(time * 0.43) +
    0.3 * Math.sin(time * 0.79 + 1.2) +
    0.15 * Math.sin(time * 1.31 + 0.8);
  const cy = Math.cos(state.yaw + gust * 0.035),
    sy = Math.sin(state.yaw + gust * 0.035),
    cx = Math.cos(state.tilt),
    sx = Math.sin(state.tilt);
  for (let i = 0; i <= count; i++) {
    const s = i / count,
      local = clamp(state.u + (s - 0.5) * 0.12 * Math.sin(state.u * Math.PI));
    const wa = 1 - smooth(0, 0.68, local),
      wb = smooth(0.32, 1, local),
      wm = 1 - wa - wb;
    let x =
      p[state.index][i * 3] * wa +
      p[state.index + 1][i * 3] * wb +
      p.at(-1)[i * 3] * wm;
    let y =
      p[state.index][i * 3 + 1] * wa +
      p[state.index + 1][i * 3 + 1] * wb +
      p.at(-1)[i * 3 + 1] * wm;
    let z =
      p[state.index][i * 3 + 2] * wa +
      p[state.index + 1][i * 3 + 2] * wb +
      p.at(-1)[i * 3 + 2] * wm;
    y +=
      0.035 * Math.sin(s * 11 - time * 0.68) +
      gust * 0.045 * Math.sin(s * Math.PI);
    z += 0.055 * Math.sin(s * 9 - time * 0.53);
    const rx = x * cy + z * sy,
      rz = z * cy - x * sy,
      ry = y * cx - rz * sx;
    result[i * 3] = rx * k + (c[0] - 0.5) * 8 * aspect;
    result[i * 3 + 1] = ry * k + (0.5 - c[1]) * 8;
    result[i * 3 + 2] = (y * sx + rz * cx) * k;
  }
  return result;
}
