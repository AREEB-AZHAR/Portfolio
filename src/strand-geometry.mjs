import * as THREE from "three";

// All forms share vertex count, ordering and connectivity. The GPU interpolates
// positions AND normals on one opaque mesh: no object swaps or alpha crossfade.
export function createStrandGeometry() {
  const path = (points) =>
    new THREE.CatmullRomCurve3(
      points.map((p) => new THREE.Vector3(...p)),
      true,
      "centripetal",
    );
  const parametric = (fn) =>
    path(Array.from({ length: 96 }, (_, i) => fn((i / 96) * Math.PI * 2)));
  const curves = [
    path([
      [-2, -1, 0],
      [-1.2, 1.4, 0],
      [-0.35, -1, 0],
      [-0.65, -0.25, 0.2],
      [-1.65, -0.25, 0.2],
      [-0.65, -0.25, -0.2],
      [-0.35, -1, -0.2],
      [0.15, -1, 0],
      [1, 1.4, 0],
      [1.85, -1, 0],
      [1.55, -0.25, 0.2],
      [0.55, -0.25, 0.2],
      [1.55, -0.25, -0.2],
      [1.85, -1, -0.2],
      [2.15, -1.4, 0],
      [-2.2, -1.4, 0],
    ]),
    parametric((t) => [
      1.45 * Math.cos(t),
      1.45 * Math.sin(t),
      0.16 * Math.sin(t * 2),
    ]),
    parametric((t) => [
      1.3 * Math.sign(Math.cos(t)) * Math.abs(Math.cos(t)) ** 0.35,
      1.3 * Math.sign(Math.sin(t)) * Math.abs(Math.sin(t)) ** 0.35,
      0.2 * Math.sin(t * 2),
    ]),
    parametric((t) => [
      1.85 * Math.sin(t),
      0.85 * Math.sin(t * 2),
      0.55 * Math.cos(t),
    ]),
    parametric((t) => [
      (1.15 + 0.35 * Math.cos(t * 3)) * Math.cos(t),
      (1.15 + 0.35 * Math.cos(t * 3)) * Math.sin(t),
      0.5 * Math.sin(t * 3),
    ]),
    path([
      [-1.5, -0.8, 0],
      [-1.5, 0.9, 0],
      [1.5, 0.9, 0],
      [1.5, -0.8, 0],
      [-0.1, -0.8, 0],
      [-0.8, -1.4, 0.1],
      [-0.8, -0.8, 0],
    ]),
    parametric((t) => [
      0.95 * Math.sign(Math.cos(t)) * Math.abs(Math.cos(t)) ** 0.3,
      1.55 * Math.sign(Math.sin(t)) * Math.abs(Math.sin(t)) ** 0.3,
      0.18 * Math.cos(t * 3),
    ]),
    parametric((t) => [
      (1.15 + 0.45 * Math.cos(t * 2)) * Math.cos(t),
      (1.15 + 0.45 * Math.cos(t * 2)) * Math.sin(t) * 0.8,
      0.65 * Math.sin(t * 2),
    ]),
    path(
      Array.from({ length: 6 }, (_, i) => [
        1.55 * Math.cos((i * Math.PI) / 3),
        1.55 * Math.sin((i * Math.PI) / 3),
        i % 2 ? 0.25 : -0.25,
      ]),
    ),
    parametric((t) => [
      1.8 * Math.cos(t),
      0.8 * Math.sin(t) + 0.35 * Math.sin(t * 4),
      0.35 * Math.sin(t * 2),
    ]),
    path([
      [-1.5, -1.2, 0],
      [-1.5, 0.25, 0],
      [-1.1, 1.3, 0],
      [1.1, 1.3, 0],
      [1.5, 0.25, 0],
      [1.5, -1.2, 0],
      [0.2, -1.2, 0],
      [0.2, -0.1, 0.15],
      [-0.4, -0.1, 0.15],
      [-0.4, -1.2, 0],
    ]),
  ];
  const forms = curves.map(
    (curve) => new THREE.TubeGeometry(curve, 192, 0.125, 12, true),
  );
  const geometry = forms[0];
  geometry.morphAttributes.position = forms
    .slice(1)
    .map((form) => form.attributes.position);
  geometry.morphAttributes.normal = forms
    .slice(1)
    .map((form) => form.attributes.normal);
  geometry.morphTargetsRelative = false;
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 4);
  return { geometry, sequence: [0, 1, 2, 1, 3, 4, 5, 6, 7, 8, 9, 10, 3, 1] };
}
