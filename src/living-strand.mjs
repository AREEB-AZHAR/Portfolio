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
  const scale = Math.min(1, aspect * 1.3),
    center = aspect * 0.45;
  const forms = kinds.map((kind) => {
    const form =
      kind === "identity"
        ? [
            [-1.5, 0],
            [-1.2, 1.1],
            [-0.5, -1],
            [-0.7, -0.2],
            [-1.35, -0.2],
            [-0.7, -0.2],
            [-0.5, -1],
            [0.15, -1],
            [0.85, 1.1],
            [1.55, -1],
            [1.35, -0.2],
            [0.65, -0.2],
            [1.35, -0.2],
            [1.55, -1],
          ]
        : points(kind);
    const shape = form.map(([x, y], i) => [
      x * 1.55 * scale + center,
      y * (kind === "identity" ? 1 : -1) * 1.55 * scale,
      0.17 * Math.sin((i / Math.max(1, form.length - 1)) * Math.PI * 4),
    ]);
    const entry = shape[0],
      exit = shape.at(-1);
    return resample(
      [
        [-4.8 * aspect, 0, 0],
        [-3.6 * aspect, 0.1, 0],
        [entry[0] - 0.55, entry[1], entry[2]],
        ...shape,
        [exit[0] + 0.5, exit[1], exit[2]],
        [3.6 * aspect, -0.1, 0],
        [4.8 * aspect, 0, 0],
      ],
      segments,
    );
  });
  if (cache.size > 8) cache.clear();
  cache.set(key, forms);
  return forms;
}
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
  for (let i = 0; i <= segments; i++) {
    const s = i / segments,
      local = u + (s - 0.5) * 0.22 * Math.sin(u * Math.PI);
    const release = smooth(0.02, 0.49, local),
      gather = smooth(0.51, 0.98, local);
    const envelope = Math.sin(Math.PI * s) ** 2;
    const flow = [
      (s - 0.5) * 9.6 * aspect,
      0.38 * Math.sin(s * Math.PI * 3 + phase * 4 - time * 0.6) * envelope,
      0.22 * Math.sin(s * Math.PI * 4 + phase * 2) * envelope,
    ];
    for (let axis = 0; axis < 3; axis++) {
      const a = forms[index][i * 3 + axis],
        b = forms[index + 1][i * 3 + axis];
      result[i * 3 + axis] =
        a * (1 - release) + flow[axis] * (release - gather) + b * gather;
    }
    result[i * 3 + 1] +=
      0.035 * Math.sin(s * 16 + phase * 3 - time * 0.7) * envelope;
    result[i * 3 + 2] +=
      0.025 * Math.sin(s * 13 - phase * 2 + time * 0.5) * envelope;
  }
  return result;
}
export const STRAND_SCENES = kinds.length;
