import assert from "node:assert/strict";
import { getStrandLayout, sampleLivingStrand } from "../src/living-strand.mjs";
import { createStrandGeometry } from "../src/strand-geometry.mjs";
import { createWindSculpture } from "../src/wind-sculpture.mjs";
const { geometry, update } = createStrandGeometry();
for (const aspect of [0.46, 1.44, 2.4])
  for (let phase = 0; phase <= 13; phase += 0.05) {
    const curve = sampleLivingStrand(phase, { aspect, time: 0 });
    assert(curve.every(Number.isFinite));
    assert(
      Math.abs(curve[0] + 4.8 * aspect) < 0.0001,
      "Left end remains offscreen, not floating",
    );
    assert(
      Math.abs(curve.at(-3) - 4.8 * aspect) < 0.0001,
      "Right end remains offscreen",
    );
    const next = sampleLivingStrand(phase + 0.001, { aspect, time: 0 });
    assert(
      Math.max(...curve.map((v, i) => Math.abs(v - next[i]))) < 0.12,
      "Small scroll input cannot pop the wire",
    );
    update(phase, aspect, 0);
    assert(geometry.attributes.position.array.every(Number.isFinite));
    assert(geometry.attributes.normal.array.every(Number.isFinite));
  }
const before = sampleLivingStrand(2.1),
  after = sampleLivingStrand(2.2);
assert(
  before.some((v, i) => Math.abs(v - after[i]) > 0.1),
  "The line actually changes within a section",
);
update(2.1);
const vertices = geometry.attributes.position.array.slice();
update(2.2);
assert(
  vertices.some(
    (v, i) => Math.abs(v - geometry.attributes.position.array[i]) > 0.1,
  ),
  "Actual mesh vertices must deform, not just its transform",
);
assert.deepEqual(
  sampleLivingStrand(2.1),
  before,
  "Reverse scrolling reconstructs the same wire pose",
);
const layouts = Array.from({ length: 14 }, (_, i) => getStrandLayout(i));
assert(
  new Set(layouts.map(({ x, y }) => `${x}:${y}`)).size >= 10,
  "Formations need section-specific positions",
);
assert(
  Math.min(...layouts.map(({ x }) => x)) > 0.7,
  "Large drawings stay in the right-hand negative-space pocket",
);
const free = sampleLivingStrand(2.5, { time: 1.5 });
const middleY = Array.from({ length: 100 }, (_, i) => free[(80 + i) * 3 + 1]);
assert(
  Math.max(...middleY) - Math.min(...middleY) > 0.3,
  "Unformed cable must have a visible travelling wave",
);
const windSculpture = createWindSculpture();
assert.equal(windSculpture.group.children.length, 2);
const initialLetter = windSculpture.letters[0].mesh.geometry
  .getAttribute("position")
  .array.slice();
windSculpture.update(2.3, 1.44, 2.4);
const bentLetter =
  windSculpture.letters[0].mesh.geometry.getAttribute("position").array;
assert(
  initialLetter.some((v, i) => Math.abs(v - bentLetter[i]) > 0.01),
  "The chrome AA must bend at its vertices, not merely float by transform",
);
const pose = bentLetter.slice();
windSculpture.update(2.3, 1.44, 2.41);
assert(
  Math.max(...pose.map((v, i) => Math.abs(v - bentLetter[i]))) < 0.02,
  "Wind should be smooth rather than random frame-to-frame jitter",
);
console.log(
  "Living-wire checks passed: fixed ends, changing vertex shapes, section-specific placement, wavy cable, smooth deforming chrome AA, reversible scroll, and finite geometry across three aspect ratios.",
);
