import assert from "node:assert/strict";
import { sampleLivingStrand } from "../src/living-strand.mjs";
import { createStrandGeometry } from "../src/strand-geometry.mjs";
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
console.log(
  "Living-wire checks passed: fixed offscreen ends, real vertex deformation, continuous small scroll steps, reversible poses, finite positions/normals across three aspect ratios.",
);
