import * as THREE from "three";
import { sampleLivingStrand } from "./living-strand.mjs";
export function createStrandGeometry(segments = 256, sides = 12) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array((segments + 1) * (sides + 1) * 3),
    normals = new Float32Array(positions.length),
    uv = new Float32Array((segments + 1) * (sides + 1) * 2),
    indices = [];
  for (let i = 0; i <= segments; i++)
    for (let j = 0; j <= sides; j++) {
      const vertex = i * (sides + 1) + j;
      uv[vertex * 2] = i / segments;
      uv[vertex * 2 + 1] = j / sides;
      if (i < segments && j < sides) {
        const a = vertex,
          b = a + sides + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage),
  );
  geometry.setAttribute(
    "normal",
    new THREE.BufferAttribute(normals, 3).setUsage(THREE.DynamicDrawUsage),
  );
  geometry.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  const centerline = new Float32Array((segments + 1) * 3);
  function update(phase, aspect = 1.44, time = 0) {
    sampleLivingStrand(phase, { aspect, time, segments, out: centerline });
    for (let i = 0; i <= segments; i++) {
      const before = Math.max(0, i - 1) * 3,
        after = Math.min(segments, i + 1) * 3;
      let tx = centerline[after] - centerline[before],
        ty = centerline[after + 1] - centerline[before + 1],
        tz = centerline[after + 2] - centerline[before + 2];
      const length = Math.hypot(tx, ty, tz) || 1;
      tx /= length;
      ty /= length;
      tz /= length;
      const flat = Math.hypot(tx, ty) || 1,
        nx = -ty / flat,
        ny = tx / flat;
      const bx = -tz * ny,
        by = tz * nx,
        bz = tx * ny - ty * nx;
      for (let j = 0; j <= sides; j++) {
        const angle = (j / sides) * Math.PI * 2,
          c = Math.cos(angle),
          s = Math.sin(angle),
          v = (i * (sides + 1) + j) * 3;
        const x = nx * c + bx * s,
          y = ny * c + by * s,
          z = bz * s;
        positions[v] = centerline[i * 3] + x * 0.035;
        positions[v + 1] = centerline[i * 3 + 1] + y * 0.035;
        positions[v + 2] = centerline[i * 3 + 2] + z * 0.035;
        normals[v] = x;
        normals[v + 1] = y;
        normals[v + 2] = z;
      }
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.normal.needsUpdate = true;
  }
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
  update(0);
  return { geometry, update, centerline };
}
