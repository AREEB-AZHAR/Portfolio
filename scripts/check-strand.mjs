import assert from "node:assert/strict";
import { createStrandGeometry } from "../src/strand-geometry.mjs";
const { geometry, sequence } = createStrandGeometry();
for (const kind of ["position", "normal"]) {
  const base = geometry.attributes[kind];
  for (const target of geometry.morphAttributes[kind]) {
    assert.equal(
      target.count,
      base.count,
      "All forms preserve vertex correspondence",
    );
    assert(
      target.array.every(Number.isFinite),
      "Morph data must remain finite",
    );
  }
}
assert.equal(sequence.length, 14);
assert.equal(geometry.morphAttributes.position.length, 10);
assert(geometry.index.count > 0);
assert.equal(geometry.morphTargetsRelative, false);
console.log(
  `Strand geometry passed: one indexed topology, ${geometry.attributes.position.count} vertices, 11 forms, 14 scenes, matching position/normal morph buffers.`,
);
geometry.dispose();
