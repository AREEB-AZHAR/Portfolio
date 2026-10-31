import assert from "node:assert/strict";
import { sampleRibbon, sceneState } from "../src/motion-study/choreography.mjs";
for (const aspect of [0.43, 0.85, 1.6, 2.1])
  for (let phase = 0; phase <= 3; phase += 0.01) {
    const a = sampleRibbon(phase, { aspect, time: 0 }),
      b = sampleRibbon(phase + 0.001, { aspect, time: 0 });
    assert(a.every(Number.isFinite));
    assert.equal(a.length, 771);
    assert(
      Math.max(...a.map((x, i) => Math.abs(x - b[i]))) < 0.08,
      "No positional pop at small scroll increments",
    );
  }
const a = sampleRibbon(1.5, { time: 1 }),
  b = sampleRibbon(1.5, { time: 2 });
assert(a.some((x, i) => Math.abs(x - b[i]) > 0.005));
assert.deepEqual(
  sampleRibbon(1.5, { time: 1 }),
  a,
  "Scroll is reversible without accumulated geometry changes",
);
assert(
  sceneState(0).center[0] > 0.7 &&
    sceneState(1).center[0] < 0.3 &&
    sceneState(2).center[0] > 0.7 &&
    sceneState(3).center[0] < 0.3,
);
console.log(
  "Ribbon study: fixed sampling topology, finite geometry, continuous/reversible motion, organic deformation and alternating compositions passed.",
);
