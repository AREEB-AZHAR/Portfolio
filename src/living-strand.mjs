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

const kinds = [
  "identity",
  "circle",
  "structure",
  "circle",
  "connection",
  "connection",
  "rustbot",
  "tally",
  "gravipop",
  "degree-verification",
  "cryptotrader",
  "bunetto",
  "connection",
  "circle",
];
// Normalized viewport coordinates. Each drawing and its free-running cable use
// a different pocket of negative space; the chrome AA lives nearby, not on top
// of the heading. Keeping this data here means SVG and WebGL agree exactly.
const layouts = [
  { x: 0.81, y: 0.56, route: 0.68, objectX: 0.8, objectY: 0.54 },
  { x: 0.9, y: 0.32, route: 0.14, objectX: 0.89, objectY: 0.37 },
  { x: 0.9, y: 0.34, route: 0.18, objectX: 0.88, objectY: 0.38 },
  { x: 0.83, y: 0.56, route: 0.2, objectX: 0.81, objectY: 0.53 },
  { x: 0.9, y: 0.34, route: 0.18, objectX: 0.88, objectY: 0.38 },
  { x: 0.9, y: 0.34, route: 0.18, objectX: 0.87, objectY: 0.37 },
  { x: 0.82, y: 0.34, route: 0.2, objectX: 0.81, objectY: 0.39 },
  { x: 0.81, y: 0.46, route: 0.2, objectX: 0.82, objectY: 0.44 },
  { x: 0.84, y: 0.35, route: 0.2, objectX: 0.82, objectY: 0.39 },
  { x: 0.92, y: 0.36, route: 0.2, objectX: 0.89, objectY: 0.39 },
  { x: 0.81, y: 0.34, route: 0.2, objectX: 0.84, objectY: 0.39 },
  { x: 0.82, y: 0.46, route: 0.2, objectX: 0.83, objectY: 0.44 },
  { x: 0.84, y: 0.34, route: 0.16, objectX: 0.84, objectY: 0.38 },
  { x: 0.82, y: 0.39, route: 0.34, objectX: 0.8, objectY: 0.43 },
];
const mix = (a, b, t) => a + (b - a) * t;
const cache = new Map();
const smooth = (a, b, t) => {
  const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
};
function resample(control, segments) {
  const dense = [];
  for (let i = 0; i < control.length - 1; i++)
    for (let j = 0; j < 12; j++) {
      const t = j / 12,
        p0 = control[Math.max(0, i - 1)],
        p1 = control[i],
        p2 = control[i + 1],
        p3 = control[Math.min(control.length - 1, i + 2)];
      dense.push(
        p1.map(
          (_, axis) =>
            0.5 *
            (2 * p1[axis] +
              (-p0[axis] + p2[axis]) * t +
              (2 * p0[axis] - 5 * p1[axis] + 4 * p2[axis] - p3[axis]) * t * t +
              (-p0[axis] + 3 * p1[axis] - 3 * p2[axis] + p3[axis]) * t * t * t),
        ),
      );
    }
  dense.push(control.at(-1));
  const lengths = [0];
  for (let i = 1; i < dense.length; i++)
    lengths.push(
      lengths.at(-1) +
        Math.hypot(...dense[i].map((v, a) => v - dense[i - 1][a])),
    );
  const result = new Float32Array((segments + 1) * 3);
  let at = 1;
  for (let i = 0; i <= segments; i++) {
    const distance = (lengths.at(-1) * i) / segments;
    while (at < lengths.length - 1 && lengths[at] < distance) at++;
    const u =
      (distance - lengths[at - 1]) /
      Math.max(0.00001, lengths[at] - lengths[at - 1]);
    for (let axis = 0; axis < 3; axis++)
      result[i * 3 + axis] =
        dense[at - 1][axis] + (dense[at][axis] - dense[at - 1][axis]) * u;
  }
  return result;
}
function profiles(aspect, segments) {
  const key = `${aspect.toFixed(4)}:${segments}`;
  if (cache.has(key)) return cache.get(key);
  const scale = Math.min(1, aspect < 0.8 ? aspect * 0.6 : aspect * 1.3);
  const forms = kinds.map((kind, scene) => {
    const layout = sceneLayout(scene, aspect);
    const form = points(kind === "identity" ? "circle" : kind);
    const shape = form.map(([x, y], i) => [
      x * 1.55 * scale + (layout.x - 0.5) * 8 * aspect,
      y * (kind === "identity" ? 1 : -1) * 1.55 * scale + (0.5 - layout.y) * 8,
      0.17 * Math.sin((i / Math.max(1, form.length - 1)) * Math.PI * 4),
    ]);
    const entry = shape[0],
      exit = shape.at(-1),
      routeY = (0.5 - layout.route) * 8;
    return resample(
      [
        [-4.8 * aspect, 0, 0],
        [-4.12 * aspect, routeY, 0],
        [-2.5 * aspect, routeY, 0.06],
        [entry[0] - 1.7, routeY, 0],
        [entry[0] - 0.75, entry[1] - 0.25, entry[2]],
        ...shape,
        [exit[0] + 0.6, exit[1] + 0.22, exit[2]],
        [Math.min(3.55 * aspect, exit[0] + 1.25), routeY, -0.06],
        [3.65 * aspect, routeY, -0.06],
        [4.12 * aspect, routeY, 0],
        [4.8 * aspect, 0, 0],
      ],
      segments,
    );
  });
  if (cache.size > 8) cache.clear();
  cache.set(key, forms);
  return forms;
}
function sceneLayout(scene, aspect) {
  const layout = layouts[scene];
  if (aspect >= 0.8) return layout;
  // On phones the drawings narrow and sit in the right-side breathing room.
  return {
    ...layout,
    x: scene === 0 ? 0.8 : 0.78 + (scene % 3) * 0.025,
    y: scene === 0 ? 0.53 : 0.24 + (scene % 3) * 0.025,
    objectX: scene === 0 ? 0.8 : 0.79 + (scene % 3) * 0.02,
    objectY: scene === 0 ? 0.52 : 0.24 + (scene % 3) * 0.025,
    route: scene === 0 ? 0.58 : 0.16,
  };
}
export function getStrandLayout(phase, aspect = 1.44) {
  const a = Math.min(layouts.length - 1, Math.max(0, Math.floor(phase)));
  const b = Math.min(layouts.length - 1, a + 1);
  const u = smooth(0, 1, phase - a);
  const from = sceneLayout(a, aspect),
    to = sceneLayout(b, aspect);
  return Object.fromEntries(
    ["x", "y", "route", "objectX", "objectY"].map((key) => [
      key,
      mix(from[key], to[key], u),
    ]),
  );
}
export const storyArtPresence = (phase) => 1 - smooth(12.15, 12.98, phase);
// One open cable: fixed offscreen ends, a travelling release wave, then a
// gathering wave. The next drawing is made from the same moving string.
export function sampleLivingStrand(
  phase,
  { aspect = 1.44, time = 0, segments = 256, out } = {},
) {
  phase = Math.max(0, Math.min(kinds.length - 1, phase));
  const forms = profiles(aspect, segments),
    index = Math.min(kinds.length - 2, Math.floor(phase)),
    u = phase - index;
  const result = out || new Float32Array((segments + 1) * 3);
  const layout = getStrandLayout(phase, aspect);
  for (let i = 0; i <= segments; i++) {
    const s = i / segments,
      local = u + (s - 0.5) * 0.22 * Math.sin(u * Math.PI);
    const release = smooth(0.02, 0.49, local),
      gather = smooth(0.51, 0.98, local);
    const envelope = Math.sin(Math.PI * s) ** 2;
    const edge = smooth(0, 0.08, s) * smooth(0, 0.08, 1 - s);
    const t = time;
    const flow = [
      (s - 0.5) * 9.6 * aspect,
      (0.5 - layout.route) * 8 * edge +
        (0.48 * Math.sin(s * Math.PI * 4 + phase * 1.7 - t * 0.8) +
          0.18 * Math.sin(s * Math.PI * 9 - t * 1.27)) *
          envelope,
      (0.27 * Math.sin(s * Math.PI * 5 + phase * 1.8 - t * 0.64) +
        0.1 * Math.sin(s * Math.PI * 11 + t * 1.13)) *
        envelope,
    ];
    for (let axis = 0; axis < 3; axis++) {
      const a = forms[index][i * 3 + axis],
        b = forms[index + 1][i * 3 + axis];
      result[i * 3 + axis] =
        a * (1 - release) + flow[axis] * (release - gather) + b * gather;
    }
    result[i * 3 + 1] +=
      (0.19 * Math.sin(s * 16 + phase * 2.1 - t * 0.73) +
        0.075 * Math.sin(s * 34 - t * 1.31)) *
      envelope;
    result[i * 3 + 2] +=
      0.075 * Math.sin(s * 19 - phase * 1.3 + t * 0.91) * envelope;
  }
  return result;
}
export const STRAND_SCENES = kinds.length;
