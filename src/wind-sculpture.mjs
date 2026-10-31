import * as THREE from "three";
import { getStrandLayout, storyArtPresence } from "./living-strand.mjs";
import { sampleWind } from "./wind-field.mjs";

function letterGeometry() {
  const a = new THREE.Shape();
  a.moveTo(-1.05, -1.25);
  a.lineTo(-0.2, 1.25);
  a.quadraticCurveTo(0, 1.58, 0.2, 1.25);
  a.lineTo(1.05, -1.25);
  a.lineTo(0.55, -1.25);
  a.lineTo(0.31, -0.48);
  a.lineTo(-0.31, -0.48);
  a.lineTo(-0.55, -1.25);
  a.closePath();
  const counter = new THREE.Path();
  counter.moveTo(-0.19, -0.02);
  counter.lineTo(0.19, -0.02);
  counter.lineTo(0, 0.67);
  counter.closePath();
  a.holes.push(counter);
  const geometry = new THREE.ExtrudeGeometry(a, {
    depth: 0.38,
    bevelEnabled: true,
    bevelThickness: 0.09,
    bevelSize: 0.065,
    bevelSegments: 8,
    curveSegments: 28,
  });
  geometry.center();
  geometry.getAttribute("position").setUsage(THREE.DynamicDrawUsage);
  geometry.getAttribute("normal").setUsage(THREE.DynamicDrawUsage);
  return geometry;
}

export function createWindSculpture() {
  const group = new THREE.Group();
  const material = new THREE.MeshPhysicalMaterial({
    color: 0x454842,
    metalness: 0.97,
    roughness: 0.23,
    clearcoat: 0.28,
    clearcoatRoughness: 0.11,
    envMapIntensity: 1.45,
    side: THREE.DoubleSide,
    transparent: true,
  });
  const letters = [0, 1].map((index) => {
    const geometry = letterGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(
      index ? 0.62 : -0.62,
      index ? -0.14 : 0.14,
      index ? -0.18 : 0.18,
    );
    group.add(mesh);
    return { mesh, base: geometry.getAttribute("position").array.slice() };
  });

  function update(phase, aspect, time, reduced = false) {
    const presence = storyArtPresence(phase);
    material.opacity = presence;
    group.visible = presence > 0.005;
    const layout = getStrandLayout(phase, aspect);
    const t = reduced ? 0 : time;
    const master = sampleWind(t, phase, 0.7);
    const scale = aspect < 0.8 ? 0.3 : Math.min(0.9, 0.52 + aspect * 0.16);
    group.scale.setScalar(scale);
    group.position.set(
      (layout.objectX - 0.5) * 8 * aspect + master.x * 0.12,
      (0.5 - layout.objectY) * 8 + master.y * 0.8,
      0.55 + master.z * 0.25,
    );
    group.rotation.set(
      -0.18 + 0.08 * Math.sin(phase * 0.9) + master.z * 0.13,
      -0.38 +
        0.55 * Math.sin(phase * 0.53) +
        0.18 * Math.sin(phase * 1.47) +
        master.twist,
      -0.13 + master.x * 0.16,
    );
    letters.forEach(({ mesh, base }, index) => {
      const wind = sampleWind(t, phase, index + 1.8);
      const attribute = mesh.geometry.getAttribute("position");
      const positions = attribute.array;
      for (let i = 0; i < positions.length; i += 3) {
        const height = Math.max(0, Math.min(1, (base[i + 1] + 1.45) / 2.9));
        const flex = height * height * (1.8 - 0.8 * height);
        const ripple = Math.sin(height * 7.8 - t * 1.46 + index * 1.9);
        positions[i] = base[i] + flex * (wind.x + ripple * 0.048);
        positions[i + 1] = base[i + 1] + flex * wind.y;
        positions[i + 2] =
          base[i + 2] +
          flex *
            (wind.z + 0.04 * Math.sin(height * 8.7 + t * 1.32 + index * 0.8));
      }
      attribute.needsUpdate = true;
      mesh.geometry.computeVertexNormals();
      mesh.position.x = (index ? 0.62 : -0.62) + wind.x * 0.11;
      mesh.rotation.y = (index ? 0.27 : -0.27) + wind.twist * 0.7;
      mesh.rotation.z = wind.x * 0.08;
    });
    return master;
  }

  update(0, 1.44, 0, true);
  return { group, update, letters };
}
